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

func TestSyncManager_ProcessProjectIntegration(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name                   string
		setupMocks            func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter)
		expectedProgressCalls int
		expectedErrorCalls    int
	}{
		{
			name: "successful project processing",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				// Setup project list
				projects := []htmlparser.ProjectSummary{
					{Name: "Test Project", Link: "/test"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(projects, nil)
				mockProjectFilter.EXPECT().ShouldProcess(gomock.Any()).Return(true)

				// Setup successful project processing
				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil)
				mockProgressReporter.EXPECT().ReportProgress(gomock.Any(), gomock.Any(), "Test Project", 0, 0, 1)
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), gomock.Any(), 1)

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectedProgressCalls: 1,
			expectedErrorCalls:    0,
		},
		{
			name: "project processing fails",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				// Setup project list
				projects := []htmlparser.ProjectSummary{
					{Name: "Failing Project", Link: "/fail"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(projects, nil)
				mockProjectFilter.EXPECT().ShouldProcess(gomock.Any()).Return(true)

				// Setup failing project processing
				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), gomock.Any()).Return(errors.New("processing failed"))
				mockProgressReporter.EXPECT().ReportError(gomock.Any(), gomock.Any(), gomock.Any())

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectedProgressCalls: 0,
			expectedErrorCalls:    1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFetcher, mockProgressReporter, mockProjectFilter := tt.setupMocks()
			log := logger.NewTestLogger()

			syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)

			ctx := context.Background()
			err := syncManager.StartSync(ctx)
			assert.NoError(t, err)

			// Give some time for async processing
			time.Sleep(50 * time.Millisecond)

			// The expectations in setupMocks will verify the calls were made correctly
		})
	}
}

func TestSyncManager_FetchProjectListBehavior(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name             string
		setupMocks       func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter)
		expectErrorCall  bool
		expectProcessing bool
	}{
		{
			name: "successful fetch project list",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				projects := []htmlparser.ProjectSummary{
					{Name: "Project 1", Link: "/project/1"},
					{Name: "Project 2", Link: "/project/2"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(projects, nil)
				mockProjectFilter.EXPECT().ShouldProcess(gomock.Any()).Return(true).Times(2)
				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).Times(2)
				mockProgressReporter.EXPECT().ReportProgress(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any()).Times(2)
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), gomock.Any(), 2)

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectErrorCall:  false,
			expectProcessing: true,
		},
		{
			name: "fetch project list fails",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				// Simulate fetch failure
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(nil, errors.New("network error"))
				mockProgressReporter.EXPECT().ReportError(gomock.Any(), gomock.Any(), gomock.Any())

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectErrorCall:  true,
			expectProcessing: false,
		},
		{
			name: "empty project list",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				// Return empty project list
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return([]htmlparser.ProjectSummary{}, nil)
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), gomock.Any(), 0)

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectErrorCall:  false,
			expectProcessing: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFetcher, mockProgressReporter, mockProjectFilter := tt.setupMocks()
			log := logger.NewTestLogger()

			syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)

			ctx := context.Background()
			err := syncManager.StartSync(ctx)
			assert.NoError(t, err)

			// Give time for async processing
			time.Sleep(100 * time.Millisecond)

			// The expectations in setupMocks will verify the behavior
		})
	}
}

func TestSyncManager_FilterProcessableProjectsBehavior(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name                 string
		setupMocks          func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter)
		expectedProcessCalls int
		expectedReportCalls  int
	}{
		{
			name: "filter keeps all processable projects",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				projects := []htmlparser.ProjectSummary{
					{Name: "Project 1", Link: "/project/1"},
					{Name: "Project 2", Link: "/project/2"},
					{Name: "Project 3", Link: "/project/3"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(projects, nil)

				// All projects should be processed
				mockProjectFilter.EXPECT().ShouldProcess(projects[0]).Return(true)
				mockProjectFilter.EXPECT().ShouldProcess(projects[1]).Return(true)
				mockProjectFilter.EXPECT().ShouldProcess(projects[2]).Return(true)

				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), gomock.Any()).Return(nil).Times(3)
				mockProgressReporter.EXPECT().ReportProgress(gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), gomock.Any(), 3).Times(3)
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), gomock.Any(), 3)

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectedProcessCalls: 3,
			expectedReportCalls:  3,
		},
		{
			name: "filter keeps some processable projects",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				projects := []htmlparser.ProjectSummary{
					{Name: "Project 1", Link: "/project/1"},
					{Name: "Project 2", Link: "/project/2"},
					{Name: "Project 3", Link: "/project/3"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(projects, nil)

				// Only first and third projects should be processed
				mockProjectFilter.EXPECT().ShouldProcess(projects[0]).Return(true)
				mockProjectFilter.EXPECT().ShouldProcess(projects[1]).Return(false)
				mockProjectFilter.EXPECT().ShouldProcess(projects[2]).Return(true)

				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), projects[0]).Return(nil)
				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), projects[2]).Return(nil)
				mockProgressReporter.EXPECT().ReportProgress(gomock.Any(), gomock.Any(), "Project 1", 0, 0, 2)
				mockProgressReporter.EXPECT().ReportProgress(gomock.Any(), gomock.Any(), "Project 3", 1, 50, 2)
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), gomock.Any(), 2)

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectedProcessCalls: 2,
			expectedReportCalls:  2,
		},
		{
			name: "filter rejects all projects",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				projects := []htmlparser.ProjectSummary{
					{Name: "Project 1", Link: "/project/1"},
					{Name: "Project 2", Link: "/project/2"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(projects, nil)

				// No projects should be processed
				mockProjectFilter.EXPECT().ShouldProcess(gomock.Any()).Return(false).Times(2)
				mockProgressReporter.EXPECT().ReportCompletion(gomock.Any(), gomock.Any(), 0)

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectedProcessCalls: 0,
			expectedReportCalls:  0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFetcher, mockProgressReporter, mockProjectFilter := tt.setupMocks()
			log := logger.NewTestLogger()

			syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)

			ctx := context.Background()
			err := syncManager.StartSync(ctx)
			assert.NoError(t, err)

			// Give time for async processing
			time.Sleep(100 * time.Millisecond)

			// The expectations in setupMocks will verify the behavior
		})
	}
}

func TestSyncManager_ProjectProcessingAndFiltering(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name          string
		setupMocks    func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter)
		expectedCalls map[string]int
	}{
		{
			name: "mixed scenarios - some succeed, some fail, some filtered",
			setupMocks: func() (*mock_internal_service_fetcher.MockIService, *mock_pkg.MockIProgressReporter, *mock_pkg.MockIProjectFilter) {
				mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
				mockProgressReporter := mock_pkg.NewMockIProgressReporter(ctrl)
				mockProjectFilter := mock_pkg.NewMockIProjectFilter(ctrl)

				projects := []htmlparser.ProjectSummary{
					{Name: "Success Project", Link: "/success"},
					{Name: "Filtered Project", Link: "/filtered"},
					{Name: "Failing Project", Link: "/fail"},
				}
				mockFetcher.EXPECT().ListAllProjects(gomock.Any(), gomock.Any()).Return(projects, nil)

				// Setup filtering behavior
				mockProjectFilter.EXPECT().ShouldProcess(projects[0]).Return(true)
				mockProjectFilter.EXPECT().ShouldProcess(projects[1]).Return(false) // This one gets filtered out
				mockProjectFilter.EXPECT().ShouldProcess(projects[2]).Return(true)

				// Setup processing behavior
				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), projects[0]).Return(nil) // Success
				mockFetcher.EXPECT().FetchDataAndSave(gomock.Any(), gomock.Any(), projects[2]).Return(errors.New("processing failed")) // Failure

				// Expected calls
				mockProgressReporter.EXPECT().ReportProgress(gomock.Any(), gomock.Any(), "Success Project", 0, 0, 2)
				mockProgressReporter.EXPECT().ReportError(gomock.Any(), gomock.Any(), gomock.Any()) // For failing project

				return mockFetcher, mockProgressReporter, mockProjectFilter
			},
			expectedCalls: map[string]int{
				"progress": 1,
				"error":    1,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFetcher, mockProgressReporter, mockProjectFilter := tt.setupMocks()
			log := logger.NewTestLogger()

			syncManager := pkg.NewSyncManager(mockFetcher, log, mockProgressReporter, mockProjectFilter)

			ctx := context.Background()
			err := syncManager.StartSync(ctx)
			assert.NoError(t, err)

			// Give time for async processing
			time.Sleep(100 * time.Millisecond)

			// The expectations in setupMocks will verify the behavior
		})
	}
}
