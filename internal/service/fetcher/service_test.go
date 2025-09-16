package fetcher_test

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/internal/service/fetcher"
	mock_repository "github.com/web4ux/mocks/repository"
	mock_src_request "github.com/web4ux/mocks/src_request"
	"github.com/web4ux/models"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/mock/gomock"
)

var (
	errNetworkError   = errors.New("network error")
	errNetworkTimeout = errors.New("network timeout")
	errDatabaseError  = errors.New("database error")
)

func TestLogin(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	log := logger.NewTestLogger()

	tests := []struct {
		name        string
		email       string
		password    string
		actual      common.Item[[]byte]
		expectError bool
	}{
		{
			name:        "successful login",
			email:       "test@example.com",
			password:    "password123",
			actual:      common.Item[[]byte]{Result: []byte("login successful"), Count: 1},
			expectError: false,
		},
		{
			name:        "login with network error",
			email:       "test@example.com",
			password:    "password123",
			actual:      common.Item[[]byte]{Error: errNetworkError, Count: 1},
			expectError: true,
		},
		{
			name:        "login with empty credentials",
			email:       "",
			password:    "",
			actual:      common.Item[[]byte]{Result: []byte("login failed"), Count: 1},
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockDB := mock_repository.NewMockIRepository(ctrl)
			mockClient := mock_src_request.NewMockIClient(ctrl)
			mockClient.EXPECT().Send(gomock.Any(), gomock.Any(), gomock.Any()).
				Return(tt.actual.Result, tt.actual.Error).Times(tt.actual.Count)

			service := fetcher.New(
				fetcher.WithDatabase(mockDB),
				fetcher.WithClient(mockClient),
			)

			err := service.Login(ctx, log, tt.email, tt.password)
			assert.Equal(t, tt.expectError, err != nil)
		})
	}
}

func TestListAllProjects(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	log := logger.NewTestLogger()

	tests := []struct {
		name        string
		actual      common.Item[[]byte]
		expectError bool
	}{
		{
			name:        "successful list projects",
			actual:      common.Item[[]byte]{Result: []byte(`<html>mock project list</html>`), Count: 1},
			expectError: false,
		},
		{
			name:        "network error",
			actual:      common.Item[[]byte]{Error: errNetworkTimeout, Count: 1},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockDB := mock_repository.NewMockIRepository(ctrl)
			mockClient := mock_src_request.NewMockIClient(ctrl)
			mockClient.EXPECT().Send(gomock.Any(), gomock.Any(), gomock.Any()).
				Return(tt.actual.Result, tt.actual.Error).Times(tt.actual.Count)

			service := fetcher.New(
				fetcher.WithDatabase(mockDB),
				fetcher.WithClient(mockClient),
			)

			result, err := service.ListAllProjects(ctx, log)
			assert.Equal(t, tt.expectError, err != nil)

			if tt.expectError {
				assert.Nil(t, result)
			} else {
				assert.NotNil(t, result)
			}
		})
	}
}

type fetchDataTestCase struct {
	name         string
	input        htmlparser.ProjectSummary
	dbResult     common.Item[models.Project]
	clientResult common.Item[[]byte]
	dbUpsert     common.Item[any]
	expectError  bool
}

func getBasicTestCases() []fetchDataTestCase {
	return []fetchDataTestCase{
		{
			name: "skip non-winfitts project",
			input: htmlparser.ProjectSummary{
				ID:   "project-123",
				Name: "Test Project",
				Link: "/project/regular",
			},
			expectError: false,
		},
		{
			name: "database get project error",
			input: htmlparser.ProjectSummary{
				ID:   "project-123",
				Name: "Test Winfitts Project",
				Link: "/project/winfitts/123",
			},
			dbResult:    common.Item[models.Project]{Error: errDatabaseError, Count: 1},
			expectError: true,
		},
		{
			name: "project already up to date",
			input: htmlparser.ProjectSummary{
				ID:   "project-456",
				Name: "Test Winfitts Project",
				Link: "/project/winfitts/456",
				Time: time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC),
			},
			dbResult: common.Item[models.Project]{
				Result: models.Project{UpdatedAt: time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)},
				Count:  1,
			},
			expectError: false,
		},
	}
}

func getAdvancedTestCases() []fetchDataTestCase {
	return []fetchDataTestCase{
		{
			name: "extract raw data links error",
			input: htmlparser.ProjectSummary{
				ID:   "project-789",
				Name: "Test Winfitts Project",
				Link: "/project/winfitts/789",
				Time: time.Date(2023, 1, 2, 12, 0, 0, 0, time.UTC),
			},
			dbResult: common.Item[models.Project]{
				Result: models.Project{UpdatedAt: time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)},
				Count:  1,
			},
			clientResult: common.Item[[]byte]{Error: errNetworkError, Count: 1},
			expectError:  true,
		},
		{
			name: "no winfitts links found - successful completion",
			input: htmlparser.ProjectSummary{
				ID:   "project-101",
				Name: "Test Winfitts Project",
				Link: "/project/winfitts/101",
				Time: time.Date(2023, 1, 2, 12, 0, 0, 0, time.UTC),
			},
			dbResult: common.Item[models.Project]{
				Result: models.Project{UpdatedAt: time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)},
				Count:  1,
			},
			clientResult: common.Item[[]byte]{
				Result: []byte(`<a href="/task/regular/task1" class="button-5 icon-rawdata ">Task 1</a>`),
				Count:  1,
			},
			expectError: false,
		},
		{
			name: "successful processing with one winfitts link",
			input: htmlparser.ProjectSummary{
				ID:   "project-105",
				Name: "Test Winfitts Project",
				Link: "/project/winfitts/105",
				Time: time.Date(2023, 1, 2, 12, 0, 0, 0, time.UTC),
			},
			dbResult: common.Item[models.Project]{
				Result: models.Project{UpdatedAt: time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)},
				Count:  1,
			},
			clientResult: common.Item[[]byte]{
				Result: []byte(`<a href="/task/winfitts/task1" class="button-5 icon-rawdata ">Task 1</a>`),
				Count:  2,
			},
			dbUpsert:    common.Item[any]{Count: 1},
			expectError: false,
		},
	}
}

func getFetchDataTestCases() []fetchDataTestCase {
	var cases []fetchDataTestCase
	cases = append(cases, getBasicTestCases()...)
	cases = append(cases, getAdvancedTestCases()...)

	return cases
}

func setupFetchDataMocks(t *testing.T, tt fetchDataTestCase) (*mock_repository.MockIRepository, *mock_src_request.MockIClient) {
	t.Helper()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	mockDB := mock_repository.NewMockIRepository(ctrl)
	mockClient := mock_src_request.NewMockIClient(ctrl)

	// Set up database mock
	log := logger.NewTestLogger()
	mockDB.EXPECT().FindProject(ctx, log, tt.input.ID).
		Return(tt.dbResult.Result, tt.dbResult.Error).Times(tt.dbResult.Count)

	// Set up client mock
	if tt.clientResult.Count == 2 {
		mockClient.EXPECT().Send(gomock.Any(), gomock.Any(), gomock.Any()).
			Return(tt.clientResult.Result, tt.clientResult.Error)
		mockClient.EXPECT().Send(gomock.Any(), gomock.Any(), gomock.Any()).
			Return([]byte(`<html>mock winfitts data</html>`), nil)
	} else {
		mockClient.EXPECT().Send(gomock.Any(), gomock.Any(), gomock.Any()).
			Return(tt.clientResult.Result, tt.clientResult.Error).Times(tt.clientResult.Count)
	}

	// Set up database upsert mock
	mockDB.EXPECT().UpsertExtractWinfittsDetails(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).
		Return(tt.dbUpsert.Error).Times(tt.dbUpsert.Count)

	return mockDB, mockClient
}

func TestFetchDataAndSave(t *testing.T) {
	t.Parallel()

	tests := getFetchDataTestCases()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockDB, mockClient := setupFetchDataMocks(t, tt)

			service := fetcher.New(
				fetcher.WithDatabase(mockDB),
				fetcher.WithClient(mockClient),
			)

			err := service.FetchDataAndSave(t.Context(), logger.NewTestLogger(), tt.input)
			assert.Equal(t, tt.expectError, err != nil)
		})
	}
}
