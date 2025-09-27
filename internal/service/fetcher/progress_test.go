package fetcher_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/internal/service/fetcher"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestNewProgressNotifier(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
	}{
		{
			name: "create progress notifier",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()

			require.NotNil(t, notifier)
		})
	}
}

func TestProgressNotifier_AddObserver(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "add observer",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()
			mockObserver := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)

			notifier.AddObserver(mockObserver)

			// Test that observer was added by triggering a notification
			mockObserver.EXPECT().OnProgress(gomock.Any()).Times(1)
			notifier.NotifyProgress(fetcher.ProgressEvent{Type: "test"})
		})
	}
}

func TestProgressNotifier_RemoveObserver(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "remove observer",
		},
		{
			name: "remove non-existent observer",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()
			mockObserver1 := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)
			mockObserver2 := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)

			if tt.name == "remove observer" {
				// Add and then remove observer
				notifier.AddObserver(mockObserver1)
				notifier.RemoveObserver(mockObserver1)

				// Observer should not be called after removal
				notifier.NotifyProgress(fetcher.ProgressEvent{Type: "test"})
			} else {
				// Try to remove observer that was never added
				notifier.AddObserver(mockObserver1)
				notifier.RemoveObserver(mockObserver2) // Different observer

				// Original observer should still be called
				mockObserver1.EXPECT().OnProgress(gomock.Any()).Times(1)
				notifier.NotifyProgress(fetcher.ProgressEvent{Type: "test"})
			}
		})
	}
}

func TestProgressNotifier_NotifyProgress(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name            string
		event           fetcher.ProgressEvent
		observerCount   int
		expectedCalls   int
	}{
		{
			name: "notify single observer",
			event: fetcher.ProgressEvent{
				Type:        "test",
				Message:     "test message",
				Current:     1,
				Total:       5,
				ProjectName: "test project",
			},
			observerCount: 1,
			expectedCalls: 1,
		},
		{
			name: "notify multiple observers",
			event: fetcher.ProgressEvent{
				Type:        "update",
				Message:     "processing",
				Current:     3,
				Total:       10,
				ProjectName: "multi-observer test",
			},
			observerCount: 3,
			expectedCalls: 3,
		},
		{
			name: "notify with no observers",
			event: fetcher.ProgressEvent{
				Type:        "complete",
				Message:     "done",
				Current:     5,
				Total:       5,
				ProjectName: "no observers",
			},
			observerCount: 0,
			expectedCalls: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()

			// Add observers
			for i := 0; i < tt.observerCount; i++ {
				mockObserver := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)
				mockObserver.EXPECT().OnProgress(tt.event).Times(1)
				notifier.AddObserver(mockObserver)
			}

			notifier.NotifyProgress(tt.event)
		})
	}
}

func TestProgressNotifier_NotifyStart(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name        string
		projectName string
		total       int
	}{
		{
			name:        "notify start",
			projectName: "test project",
			total:       10,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()
			mockObserver := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)

			expectedEvent := fetcher.ProgressEvent{
				Type:        "start",
				Message:     "Starting project processing",
				Current:     0,
				Total:       tt.total,
				ProjectName: tt.projectName,
			}

			mockObserver.EXPECT().OnProgress(expectedEvent).Times(1)
			notifier.AddObserver(mockObserver)

			notifier.NotifyStart(tt.projectName, tt.total)
		})
	}
}

func TestProgressNotifier_NotifyUpdate(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name        string
		projectName string
		current     int
		total       int
		message     string
	}{
		{
			name:        "notify update",
			projectName: "test project",
			current:     5,
			total:       10,
			message:     "processing item 5",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()
			mockObserver := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)

			expectedEvent := fetcher.ProgressEvent{
				Type:        "update",
				Message:     tt.message,
				Current:     tt.current,
				Total:       tt.total,
				ProjectName: tt.projectName,
			}

			mockObserver.EXPECT().OnProgress(expectedEvent).Times(1)
			notifier.AddObserver(mockObserver)

			notifier.NotifyUpdate(tt.projectName, tt.current, tt.total, tt.message)
		})
	}
}

func TestProgressNotifier_NotifyComplete(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name        string
		projectName string
		total       int
	}{
		{
			name:        "notify complete",
			projectName: "completed project",
			total:       15,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()
			mockObserver := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)

			expectedEvent := fetcher.ProgressEvent{
				Type:        "complete",
				Message:     "Project processing completed",
				Current:     tt.total,
				Total:       tt.total,
				ProjectName: tt.projectName,
			}

			mockObserver.EXPECT().OnProgress(expectedEvent).Times(1)
			notifier.AddObserver(mockObserver)

			notifier.NotifyComplete(tt.projectName, tt.total)
		})
	}
}

func TestProgressNotifier_NotifyError(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name        string
		projectName string
		err         error
	}{
		{
			name:        "notify error",
			projectName: "failed project",
			err:         errors.New("processing failed"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			notifier := fetcher.NewProgressNotifier()
			mockObserver := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)

			expectedEvent := fetcher.ProgressEvent{
				Type:        "error",
				Message:     "Project processing failed",
				ProjectName: tt.projectName,
				Error:       tt.err,
			}

			mockObserver.EXPECT().OnProgress(expectedEvent).Times(1)
			notifier.AddObserver(mockObserver)

			notifier.NotifyError(tt.projectName, tt.err)
		})
	}
}

func TestNewLoggingProgressObserver(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
	}{
		{
			name: "create logging progress observer",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			log := logger.NewTestLogger()
			observer := fetcher.NewLoggingProgressObserver(log)

			require.NotNil(t, observer)
		})
	}
}

func TestLoggingProgressObserver_OnProgress(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		event fetcher.ProgressEvent
	}{
		{
			name: "log start event",
			event: fetcher.ProgressEvent{
				Type:        "start",
				Message:     "Starting project processing",
				Current:     0,
				Total:       10,
				ProjectName: "test project",
			},
		},
		{
			name: "log update event",
			event: fetcher.ProgressEvent{
				Type:        "update",
				Message:     "processing item",
				Current:     5,
				Total:       10,
				ProjectName: "test project",
			},
		},
		{
			name: "log complete event",
			event: fetcher.ProgressEvent{
				Type:        "complete",
				Message:     "Project processing completed",
				Current:     10,
				Total:       10,
				ProjectName: "test project",
			},
		},
		{
			name: "log error event",
			event: fetcher.ProgressEvent{
				Type:        "error",
				Message:     "Project processing failed",
				ProjectName: "test project",
				Error:       errors.New("processing error"),
			},
		},
		{
			name: "log unknown event type",
			event: fetcher.ProgressEvent{
				Type:        "unknown",
				Message:     "unknown event",
				ProjectName: "test project",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			log := logger.NewTestLogger()
			observer := fetcher.NewLoggingProgressObserver(log)

			// This should not panic and should handle all event types
			observer.OnProgress(tt.event)
		})
	}
}

func TestNewObservableProcessor(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "create observable processor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			notifier := fetcher.NewProgressNotifier()

			processor := fetcher.NewObservableProcessor(mockProcessor, notifier)

			require.NotNil(t, processor)
		})
	}
}

func TestObservableProcessor_CanProcess(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name     string
		response types.MockItem[bool]
		project  htmlparser.ProjectSummary
	}{
		{
			name: "can process - true",
			response: types.MockItem[bool]{
				Count: 1,
				Error: nil,
				Item:  true,
			},
			project: htmlparser.ProjectSummary{ID: "1", Name: "test"},
		},
		{
			name: "can process - false",
			response: types.MockItem[bool]{
				Count: 1,
				Error: nil,
				Item:  false,
			},
			project: htmlparser.ProjectSummary{ID: "2", Name: "test2"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().
				CanProcess(tt.project).
				Return(tt.response.Item).
				Times(tt.response.Count)

			notifier := fetcher.NewProgressNotifier()
			observableProcessor := fetcher.NewObservableProcessor(mockProcessor, notifier)

			result := observableProcessor.CanProcess(tt.project)

			assert.Equal(t, tt.response.Item, result)
		})
	}
}

func TestObservableProcessor_Process(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name          string
		project       htmlparser.ProjectSummary
		processError  error
		expectedError bool
	}{
		{
			name: "successful processing",
			project: htmlparser.ProjectSummary{
				ID:   "1",
				Name: "test project",
			},
			processError:  nil,
			expectedError: false,
		},
		{
			name: "failed processing",
			project: htmlparser.ProjectSummary{
				ID:   "2",
				Name: "failed project",
			},
			processError:  errors.New("processing failed"),
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockObserver := mock_internal_service_fetcher.NewMockProgressObserver(ctrl)

			// Setup expectations for progress notifications
			startEvent := fetcher.ProgressEvent{
				Type:        "start",
				Message:     "Starting project processing",
				Current:     0,
				Total:       1,
				ProjectName: tt.project.Name,
			}
			mockObserver.EXPECT().OnProgress(startEvent).Times(1)

			if tt.expectedError {
				errorEvent := fetcher.ProgressEvent{
					Type:        "error",
					Message:     "Project processing failed",
					ProjectName: tt.project.Name,
					Error:       tt.processError,
				}
				mockObserver.EXPECT().OnProgress(errorEvent).Times(1)
			} else {
				completeEvent := fetcher.ProgressEvent{
					Type:        "complete",
					Message:     "Project processing completed",
					Current:     1,
					Total:       1,
					ProjectName: tt.project.Name,
				}
				mockObserver.EXPECT().OnProgress(completeEvent).Times(1)
			}

			mockProcessor.EXPECT().
				Process(ctx, log, tt.project).
				Return(tt.processError).
				Times(1)

			notifier := fetcher.NewProgressNotifier()
			notifier.AddObserver(mockObserver)

			observableProcessor := fetcher.NewObservableProcessor(mockProcessor, notifier)
			err := observableProcessor.Process(ctx, log, tt.project)

			assert.Equal(t, tt.expectedError, err != nil)
			if tt.expectedError {
				assert.Equal(t, tt.processError, err)
			}
		})
	}
}

func TestObservableProcessor_Name(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name             string
		processorName    string
		expectedName     string
	}{
		{
			name:          "basic processor name",
			processorName: "TestProcessor",
			expectedName:  "Observable_TestProcessor",
		},
		{
			name:          "processor with underscore",
			processorName: "Test_Processor",
			expectedName:  "Observable_Test_Processor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().Name().Return(tt.processorName).Times(1)

			notifier := fetcher.NewProgressNotifier()
			observableProcessor := fetcher.NewObservableProcessor(mockProcessor, notifier)

			result := observableProcessor.Name()

			assert.Equal(t, tt.expectedName, result)
		})
	}
}
