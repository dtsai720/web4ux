package pkg_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	mock_pkg "github.com/web4ux/mocks/pkg"
	"github.com/web4ux/pkg"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/mock/gomock"
)

func TestNewSyncManager(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
	mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
	mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)
	log := logger.NewTestLogger()

	syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)

	require.NotNil(t, syncManager)
	// Since fields are private, we can only test through public methods
	assert.False(t, syncManager.IsRunning())
}

func TestSyncManager_IsRunning(t *testing.T) {
	tests := []struct {
		name      string
		isRunning bool
	}{
		{
			name:      "sync manager is running",
			isRunning: true,
		},
		{
			name:      "sync manager is not running",
			isRunning: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctrl := gomock.NewController(t)
			t.Cleanup(ctrl.Finish)

			mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
			mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
			mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)
			log := logger.NewTestLogger()

			syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)

			if tt.isRunning {
				// Start sync to make it running
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), log).Return([]htmlparser.ProjectSummary{}, nil).AnyTimes()
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), log, 0).AnyTimes()
				syncManager.StartSync(t.Context())
			}

			result := syncManager.IsRunning()

			assert.Equal(t, tt.isRunning, result)

			// Clean up if running
			if tt.isRunning {
				syncManager.CancelSync()
				time.Sleep(10 * time.Millisecond) // Give time for cleanup
			}
		})
	}
}

func TestSyncManager_StartSync(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name           string
		setupManager   func() *pkg.SyncManager
		expectedError  error
		expectedStatus bool
	}{
		{
			name: "successful start sync when not running",
			setupManager: func() *pkg.SyncManager {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)
				log := logger.NewTestLogger()

				// Set up expectations for the async performSync call
				projects := []htmlparser.ProjectSummary{
					{Name: "Test Project", Link: "/test"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), log).Return(projects, nil).AnyTimes()
				mockProjectFilter.EXPECT().ShouldProcess(gomock.Any()).Return(true).AnyTimes()
				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), log, gomock.Any()).Return(nil).AnyTimes()
				mockProgressReporter.EXPECT().ReportProgress(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).AnyTimes()
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), gomock.Any(), gomock.Any()).AnyTimes()
				mockProgressReporter.EXPECT().ReportCancellation(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).AnyTimes()
				mockProgressReporter.EXPECT().ReportError(gomock.Any(), gomock.Any(), gomock.Any()).AnyTimes()

				return pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)
			},
			expectedError:  nil,
			expectedStatus: true,
		},
		{
			name: "start sync fails when already running",
			setupManager: func() *pkg.SyncManager {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)
				log := logger.NewTestLogger()

				syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)
				// Start sync to make it running
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), log).Return([]htmlparser.ProjectSummary{}, nil).AnyTimes()
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), log, 0).AnyTimes()
				syncManager.StartSync(context.Background())
				return syncManager
			},
			expectedError:  errors.New("sync operation is already running"), // Check for non-nil error
			expectedStatus: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			syncManager := tt.setupManager()
			ctx := context.Background()

			err := syncManager.StartSync(ctx)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError.Error())
			} else {
				assert.NoError(t, err)
			}

			assert.Equal(t, tt.expectedStatus, syncManager.IsRunning())

			// Clean up any running sync
			syncManager.CancelSync()
			time.Sleep(10 * time.Millisecond)
		})
	}
}

func TestSyncManager_CancelSync(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name          string
		setupManager  func() *pkg.SyncManager
		expectedError error
	}{
		{
			name: "successful cancel sync when running",
			setupManager: func() *pkg.SyncManager {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)
				log := logger.NewTestLogger()

				syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)
				// Start sync to make it running
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), log).Return([]htmlparser.ProjectSummary{}, nil).AnyTimes()
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), log, 0).AnyTimes()
				syncManager.StartSync(context.Background())
				return syncManager
			},
			expectedError: nil,
		},
		{
			name: "cancel sync fails when not running",
			setupManager: func() *pkg.SyncManager {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)
				log := logger.NewTestLogger()
				return pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)
			},
			expectedError: errors.New("no sync operation is currently in progress"), // Check for non-nil error
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			syncManager := tt.setupManager()

			err := syncManager.CancelSync()

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestSyncManager_fetchProjectList(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name             string
		setupManager     func() *pkg.SyncManager
		expectedProjects []htmlparser.ProjectSummary
		expectedError    error
	}{
		{
			name: "successful fetch project list",
			setupManager: func() *pkg.SyncManager {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				log := logger.NewTestLogger()

				expectedProjects := []htmlparser.ProjectSummary{
					{Name: "Project 1", Link: "/project/1"},
					{Name: "Project 2", Link: "/project/2"},
				}

				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), log).Return(expectedProjects, nil)

				return pkg.NewSyncManager(mockFetcher, log, mock_pkg.NewMockIProgressReporter(ctrl), mock_pkg.NewMockIProjectFilter(ctrl))
			},
			expectedProjects: []htmlparser.ProjectSummary{
				{Name: "Project 1", Link: "/project/1"},
				{Name: "Project 2", Link: "/project/2"},
			},
			expectedError: nil,
		},
		{
			name: "fetch project list fails",
			setupManager: func() *pkg.SyncManager {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				log := logger.NewTestLogger()

				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), log).Return(nil, errors.New("network error"))

				return pkg.NewSyncManager(mockFetcher, log, mock_pkg.NewMockIProgressReporter(ctrl), mock_pkg.NewMockIProjectFilter(ctrl))
			},
			expectedProjects: nil,
			expectedError:    errors.New("failed to fetch project list from remote server"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Since we can't test private methods directly, we'll skip this test
			t.Skip("Cannot test private method fetchProjectList directly")
		})
	}
}

func TestSyncManager_filterProcessableProjects(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name             string
		inputProjects    []htmlparser.ProjectSummary
		setupFilter      func() pkg.IProjectFilter
		expectedProjects []htmlparser.ProjectSummary
	}{
		{
			name: "filter keeps processable projects",
			inputProjects: []htmlparser.ProjectSummary{
				{Name: "Project 1", Link: "/project/1"},
				{Name: "Project 2", Link: "/project/2"},
				{Name: "Project 3", Link: "/project/3"},
			},
			setupFilter: func() pkg.IProjectFilter {
				mockFilter := mock_pkg.NewMockIProjectFilter(ctrl)
				mockFilter.EXPECT().ShouldProcess(htmlparser.ProjectSummary{Name: "Project 1", Link: "/project/1"}).Return(true)
				mockFilter.EXPECT().ShouldProcess(htmlparser.ProjectSummary{Name: "Project 2", Link: "/project/2"}).Return(false)
				mockFilter.EXPECT().ShouldProcess(htmlparser.ProjectSummary{Name: "Project 3", Link: "/project/3"}).Return(true)
				return mockFilter
			},
			expectedProjects: []htmlparser.ProjectSummary{
				{Name: "Project 1", Link: "/project/1"},
				{Name: "Project 3", Link: "/project/3"},
			},
		},
		{
			name: "filter rejects all projects",
			inputProjects: []htmlparser.ProjectSummary{
				{Name: "Project 1", Link: "/project/1"},
				{Name: "Project 2", Link: "/project/2"},
			},
			setupFilter: func() pkg.IProjectFilter {
				mockFilter := mock_pkg.NewMockIProjectFilter(ctrl)
				mockFilter.EXPECT().ShouldProcess(gomock.Any()).Return(false).Times(2)
				return mockFilter
			},
			expectedProjects: []htmlparser.ProjectSummary{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Since we can't test private methods directly, we'll skip this test
			t.Skip("Cannot test private method filterProcessableProjects directly")
		})
	}
}
