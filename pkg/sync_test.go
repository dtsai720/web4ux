package pkg_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	mock_pkg "github.com/web4ux/mocks/pkg"
	"github.com/web4ux/pkg"
	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestSyncProgress_Struct(t *testing.T) {
	progress := pkg.SyncProgress{
		CurrentProject: "test-project",
		CurrentIndex:   5,
		Progress:       50,
		TotalProjects:  10,
		IsCompleted:    false,
		IsCancelled:    false,
	}

	assert.Equal(t, "test-project", progress.CurrentProject)
	assert.Equal(t, 5, progress.CurrentIndex)
	assert.Equal(t, 50, progress.Progress)
	assert.Equal(t, 10, progress.TotalProjects)
	assert.False(t, progress.IsCompleted)
	assert.False(t, progress.IsCancelled)
}

func TestLoginResponse_Struct(t *testing.T) {
	response := pkg.LoginResponse{
		Success: true,
		Message: "Login successful",
	}

	assert.True(t, response.Success)
	assert.Equal(t, "Login successful", response.Message)
}

func TestApp_LoginAndSync(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name           string
		email          string
		password       string
		syncRunning    types.MockItem[bool]
		loginMock      types.MockItem[any]
		expectedResult *pkg.LoginResponse
		hasError       bool
	}{
		{
			name:     "successful login when sync not running",
			email:    "test@example.com",
			password: "password123",
			syncRunning: types.MockItem[bool]{
				Count: 1,
				Item:  false,
			},
			loginMock: types.MockItem[any]{
				Count: 1,
				Error: nil,
			},
			expectedResult: &pkg.LoginResponse{
				Success: true,
				Message: "Login successful",
			},
			hasError: false,
		},
		{
			name:     "fails when sync already running",
			email:    "test@example.com",
			password: "password123",
			syncRunning: types.MockItem[bool]{
				Count: 1,
				Item:  true,
			},
			loginMock: types.MockItem[any]{
				Count: 0,
			},
			expectedResult: &pkg.LoginResponse{
				Success: false,
				Message: "Sync already in progress",
			},
			hasError: true,
		},
		{
			name:     "fails when login credentials are invalid",
			email:    "test@example.com",
			password: "wrongpassword",
			syncRunning: types.MockItem[bool]{
				Count: 1,
				Item:  false,
			},
			loginMock: types.MockItem[any]{
				Count: 1,
				Error: errs.NewAppError(errs.AuthenticationError, "invalid credentials", nil),
			},
			expectedResult: &pkg.LoginResponse{
				Success: false,
				Message: "invalid email or password",
			},
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
			mockSyncManager := mock_pkg.NewMockISyncManager(ctrl)
			log := logger.NewTestLogger()

			mockSyncManager.EXPECT().IsRunning().
				Return(tt.syncRunning.Item).
				Times(tt.syncRunning.Count)

			if tt.loginMock.Count > 0 {
				mockFetcher.EXPECT().Login(gomock.Any(), log, tt.email, tt.password).
					Return(tt.loginMock.Error).
					Times(tt.loginMock.Count)
			}

			app := pkg.New(
				pkg.WithFetcherService(mockFetcher),
				pkg.WithLogger(log),
				pkg.WithSyncManager(mockSyncManager),
			)

			result, err := app.LoginAndSync(tt.email, tt.password)

			assert.Equal(t, tt.hasError, err != nil)
			assert.Equal(t, tt.expectedResult, result)
		})
	}
}

func TestApp_StartSync(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name         string
		startSyncErr error
		hasError     bool
	}{
		{
			name:         "successful start sync",
			startSyncErr: nil,
			hasError:     false,
		},
		{
			name:         "fails when sync manager returns error",
			startSyncErr: errs.NewAppError(errs.ValidationError, "sync already running", nil),
			hasError:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSyncManager := mock_pkg.NewMockISyncManager(ctrl)
			log := logger.NewTestLogger()

			mockSyncManager.EXPECT().StartSync(gomock.Any()).
				Return(tt.startSyncErr).
				Times(1)

			app := pkg.New(
				pkg.WithLogger(log),
				pkg.WithSyncManager(mockSyncManager),
			)

			err := app.StartSync()

			assert.Equal(t, tt.hasError, err != nil)
			if tt.hasError {
				assert.Equal(t, tt.startSyncErr, err)
			}
		})
	}
}

func TestApp_CancelSync(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name          string
		cancelSyncErr error
		hasError      bool
	}{
		{
			name:          "successful cancel sync",
			cancelSyncErr: nil,
			hasError:      false,
		},
		{
			name:          "fails when no sync operation in progress",
			cancelSyncErr: errs.NewAppError(errs.ValidationError, "no sync operation in progress", nil),
			hasError:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSyncManager := mock_pkg.NewMockISyncManager(ctrl)
			log := logger.NewTestLogger()

			mockSyncManager.EXPECT().CancelSync().
				Return(tt.cancelSyncErr).
				Times(1)

			app := pkg.New(
				pkg.WithLogger(log),
				pkg.WithSyncManager(mockSyncManager),
			)

			err := app.CancelSync()

			assert.Equal(t, tt.hasError, err != nil)
			if tt.hasError {
				assert.Equal(t, tt.cancelSyncErr, err)
			}
		})
	}
}

func TestApp_GetSyncStatus(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name        string
		isRunning   bool
		expectedMap map[string]any
	}{
		{
			name:      "sync is running",
			isRunning: true,
			expectedMap: map[string]any{
				"isSyncing": true,
			},
		},
		{
			name:      "sync is not running",
			isRunning: false,
			expectedMap: map[string]any{
				"isSyncing": false,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSyncManager := mock_pkg.NewMockISyncManager(ctrl)
			log := logger.NewTestLogger()

			mockSyncManager.EXPECT().IsRunning().
				Return(tt.isRunning).
				Times(1)

			app := pkg.New(
				pkg.WithLogger(log),
				pkg.WithSyncManager(mockSyncManager),
			)

			result := app.GetSyncStatus()

			assert.Equal(t, tt.expectedMap, result)
		})
	}
}
