package fetcher_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/internal/service/fetcher"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestDefaultRetryConfig(t *testing.T) {
	t.Parallel()

	config := fetcher.DefaultRetryConfig()

	assert.Equal(t, 3, config.MaxAttempts)
	assert.Equal(t, time.Second, config.BaseDelay)
	assert.Equal(t, 30*time.Second, config.MaxDelay)
}

func TestNewRetryProcessor(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name   string
		config fetcher.RetryConfig
	}{
		{
			name:   "create retry processor",
			config: fetcher.DefaultRetryConfig(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			processor := fetcher.NewRetryProcessor(mockProcessor, tt.config)

			require.NotNil(t, processor)
		})
	}
}

func TestRetryProcessor_CanProcess(t *testing.T) {
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

			retryProcessor := fetcher.NewRetryProcessor(mockProcessor, fetcher.DefaultRetryConfig())
			result := retryProcessor.CanProcess(tt.project)

			assert.Equal(t, tt.response.Item, result)
		})
	}
}

func TestRetryProcessor_Process(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name          string
		responses     []types.MockItem[any]
		project       htmlparser.ProjectSummary
		config        fetcher.RetryConfig
		expectedError bool
	}{
		{
			name: "success on first attempt",
			responses: []types.MockItem[any]{
				{Count: 1, Error: nil},
			},
			project:       htmlparser.ProjectSummary{ID: "1", Name: "test"},
			config:        fetcher.RetryConfig{MaxAttempts: 3, BaseDelay: time.Millisecond, MaxDelay: time.Second},
			expectedError: false,
		},
		{
			name: "success on second attempt",
			responses: []types.MockItem[any]{
				{Count: 1, Error: errors.New("first attempt failed")},
				{Count: 1, Error: nil},
			},
			project:       htmlparser.ProjectSummary{ID: "2", Name: "test2"},
			config:        fetcher.RetryConfig{MaxAttempts: 3, BaseDelay: time.Millisecond, MaxDelay: time.Second},
			expectedError: false,
		},
		{
			name: "failure after max attempts",
			responses: []types.MockItem[any]{
				{Count: 1, Error: errors.New("attempt 1 failed")},
				{Count: 1, Error: errors.New("attempt 2 failed")},
				{Count: 1, Error: errors.New("attempt 3 failed")},
			},
			project:       htmlparser.ProjectSummary{ID: "3", Name: "test3"},
			config:        fetcher.RetryConfig{MaxAttempts: 3, BaseDelay: time.Millisecond, MaxDelay: time.Second},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().Name().Return("TestProcessor").AnyTimes()

			for _, response := range tt.responses {
				mockProcessor.EXPECT().
					Process(ctx, log, tt.project).
					Return(response.Error).
					Times(response.Count)
			}

			retryProcessor := fetcher.NewRetryProcessor(mockProcessor, tt.config)
			err := retryProcessor.Process(ctx, log, tt.project)

			assert.Equal(t, tt.expectedError, err != nil)
		})
	}
}

func TestRetryProcessor_Name(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name         string
		processorName string
		expectedName string
	}{
		{
			name:         "basic processor name",
			processorName: "TestProcessor",
			expectedName: "Retry_TestProcessor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().Name().Return(tt.processorName).Times(1)

			retryProcessor := fetcher.NewRetryProcessor(mockProcessor, fetcher.DefaultRetryConfig())
			result := retryProcessor.Name()

			assert.Equal(t, tt.expectedName, result)
		})
	}
}

func TestNewValidationProcessor(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "create validation processor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			processor := fetcher.NewValidationProcessor(mockProcessor)

			require.NotNil(t, processor)
		})
	}
}

func TestValidationProcessor_CanProcess(t *testing.T) {
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
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().
				CanProcess(tt.project).
				Return(tt.response.Item).
				Times(tt.response.Count)

			validationProcessor := fetcher.NewValidationProcessor(mockProcessor)
			result := validationProcessor.CanProcess(tt.project)

			assert.Equal(t, tt.response.Item, result)
		})
	}
}

func TestValidationProcessor_Process(t *testing.T) {
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
			name: "valid project success",
			project: htmlparser.ProjectSummary{
				ID:   "1",
				Name: "test",
				Link: "http://example.com",
				Time: time.Now(),
			},
			processError:  nil,
			expectedError: false,
		},
		{
			name: "invalid project - missing ID",
			project: htmlparser.ProjectSummary{
				Name: "test",
				Link: "http://example.com",
				Time: time.Now(),
			},
			processError:  nil,
			expectedError: true,
		},
		{
			name: "invalid project - missing Name",
			project: htmlparser.ProjectSummary{
				ID:   "1",
				Link: "http://example.com",
				Time: time.Now(),
			},
			processError:  nil,
			expectedError: true,
		},
		{
			name: "invalid project - missing Link",
			project: htmlparser.ProjectSummary{
				ID:   "1",
				Name: "test",
				Time: time.Now(),
			},
			processError:  nil,
			expectedError: true,
		},
		{
			name: "invalid project - zero Time",
			project: htmlparser.ProjectSummary{
				ID:   "1",
				Name: "test",
				Link: "http://example.com",
				Time: time.Time{},
			},
			processError:  nil,
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			if !tt.expectedError {
				mockProcessor.EXPECT().
					Process(ctx, log, tt.project).
					Return(tt.processError).
					Times(1)
			}

			validationProcessor := fetcher.NewValidationProcessor(mockProcessor)
			err := validationProcessor.Process(ctx, log, tt.project)

			assert.Equal(t, tt.expectedError, err != nil)
		})
	}
}

func TestValidationProcessor_Name(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name         string
		processorName string
		expectedName string
	}{
		{
			name:         "basic processor name",
			processorName: "TestProcessor",
			expectedName: "Validation_TestProcessor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().Name().Return(tt.processorName).Times(1)

			validationProcessor := fetcher.NewValidationProcessor(mockProcessor)
			result := validationProcessor.Name()

			assert.Equal(t, tt.expectedName, result)
		})
	}
}

func TestNewTimingProcessor(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "create timing processor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			processor := fetcher.NewTimingProcessor(mockProcessor)

			require.NotNil(t, processor)
		})
	}
}

func TestTimingProcessor_CanProcess(t *testing.T) {
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
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().
				CanProcess(tt.project).
				Return(tt.response.Item).
				Times(tt.response.Count)

			timingProcessor := fetcher.NewTimingProcessor(mockProcessor)
			result := timingProcessor.CanProcess(tt.project)

			assert.Equal(t, tt.response.Item, result)
		})
	}
}

func TestTimingProcessor_Process(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name          string
		processError  error
		expectedError bool
	}{
		{
			name:          "process success",
			processError:  nil,
			expectedError: false,
		},
		{
			name:          "process failure",
			processError:  errors.New("processing failed"),
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()
			project := htmlparser.ProjectSummary{ID: "1", Name: "test"}

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().Name().Return("TestProcessor").AnyTimes()
			mockProcessor.EXPECT().
				Process(ctx, log, project).
				Return(tt.processError).
				Times(1)

			timingProcessor := fetcher.NewTimingProcessor(mockProcessor)
			err := timingProcessor.Process(ctx, log, project)

			assert.Equal(t, tt.expectedError, err != nil)
		})
	}
}

func TestTimingProcessor_Name(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name         string
		processorName string
		expectedName string
	}{
		{
			name:         "basic processor name",
			processorName: "TestProcessor",
			expectedName: "Timing_TestProcessor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			mockProcessor.EXPECT().Name().Return(tt.processorName).Times(1)

			timingProcessor := fetcher.NewTimingProcessor(mockProcessor)
			result := timingProcessor.Name()

			assert.Equal(t, tt.expectedName, result)
		})
	}
}

func TestNewProcessorDecorator(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "create processor decorator",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			decorator := fetcher.NewProcessorDecorator(mockProcessor)

			require.NotNil(t, decorator)
		})
	}
}

func TestProcessorDecorator_WithRetry(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name   string
		config fetcher.RetryConfig
	}{
		{
			name:   "with retry configuration",
			config: fetcher.DefaultRetryConfig(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			decorator := fetcher.NewProcessorDecorator(mockProcessor)

			result := decorator.WithRetry(tt.config)

			require.NotNil(t, result)
			assert.Equal(t, decorator, result)
		})
	}
}

func TestProcessorDecorator_WithValidation(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "with validation",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			decorator := fetcher.NewProcessorDecorator(mockProcessor)

			result := decorator.WithValidation()

			require.NotNil(t, result)
			assert.Equal(t, decorator, result)
		})
	}
}

func TestProcessorDecorator_WithTiming(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "with timing",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			decorator := fetcher.NewProcessorDecorator(mockProcessor)

			result := decorator.WithTiming()

			require.NotNil(t, result)
			assert.Equal(t, decorator, result)
		})
	}
}

func TestProcessorDecorator_Build(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "build processor",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			decorator := fetcher.NewProcessorDecorator(mockProcessor)

			result := decorator.Build()

			require.NotNil(t, result)
		})
	}
}

func TestProcessorDecorator_ChainedDecorators(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name string
	}{
		{
			name: "chain multiple decorators",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockProcessor := mock_internal_service_fetcher.NewMockProjectProcessor(ctrl)
			decorator := fetcher.NewProcessorDecorator(mockProcessor)

			result := decorator.
				WithRetry(fetcher.DefaultRetryConfig()).
				WithValidation().
				WithTiming().
				Build()

			require.NotNil(t, result)
		})
	}
}
