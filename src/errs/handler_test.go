package errs_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/logger"
)

func TestErrorType_String(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		errType  errs.ErrorType
		expected string
	}{
		{
			name:     "ValidationError",
			errType:  errs.ValidationError,
			expected: "ValidationError",
		},
		{
			name:     "DatabaseError",
			errType:  errs.DatabaseError,
			expected: "DatabaseError",
		},
		{
			name:     "NetworkError",
			errType:  errs.NetworkError,
			expected: "NetworkError",
		},
		{
			name:     "ProcessingError",
			errType:  errs.ProcessingError,
			expected: "ProcessingError",
		},
		{
			name:     "AuthenticationError",
			errType:  errs.AuthenticationError,
			expected: "AuthenticationError",
		},
		{
			name:     "UnknownError",
			errType:  errs.UnknownError,
			expected: "UnknownError",
		},
		{
			name:     "Invalid ErrorType returns UnknownError",
			errType:  errs.ErrorType(999),
			expected: "UnknownError",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.errType.String()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNewAppError(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		errType  errs.ErrorType
		message  string
		cause    error
		expected struct {
			errType errs.ErrorType
			message string
			cause   error
		}
	}{
		{
			name:    "creates app error with all fields",
			errType: errs.ValidationError,
			message: "test message",
			cause:   errors.New("underlying error"),
			expected: struct {
				errType errs.ErrorType
				message string
				cause   error
			}{
				errType: errs.ValidationError,
				message: "test message",
				cause:   errors.New("underlying error"),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			appErr := errs.NewAppError(tt.errType, tt.message, tt.cause)

			assert.Equal(t, tt.expected.errType, appErr.Type)
			assert.Equal(t, tt.expected.message, appErr.Message)
			assert.Equal(t, tt.expected.cause.Error(), appErr.Cause.Error())
			assert.NotNil(t, appErr.Context)
			assert.Empty(t, appErr.Context)
		})
	}
}

func TestAppError_Error(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		appErr   *errs.AppError
		expected string
	}{
		{
			name: "error with cause",
			appErr: &errs.AppError{
				Type:    errs.ValidationError,
				Message: "test message",
				Cause:   errors.New("underlying error"),
			},
			expected: "ValidationError: test message (caused by: underlying error)",
		},
		{
			name: "error without cause",
			appErr: &errs.AppError{
				Type:    errs.DatabaseError,
				Message: "db connection failed",
				Cause:   nil,
			},
			expected: "DatabaseError: db connection failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.appErr.Error()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestAppError_WithContext(t *testing.T) {
	t.Parallel()

	appErr := errs.NewAppError(errs.ValidationError, "test", nil)

	result := appErr.WithContext("key1", "value1")

	assert.Equal(t, appErr, result) // Should return same instance
	assert.Equal(t, "value1", appErr.Context["key1"])

	// Test chaining
	appErr.WithContext("key2", 42).WithContext("key3", true)

	assert.Equal(t, "value1", appErr.Context["key1"])
	assert.Equal(t, 42, appErr.Context["key2"])
	assert.True(t, appErr.Context["key3"].(bool))
}

func TestAppError_Unwrap(t *testing.T) {
	t.Parallel()

	cause := errors.New("underlying error")
	appErr := errs.NewAppError(errs.ValidationError, "test", cause)

	result := appErr.Unwrap()
	assert.Equal(t, cause, result)

	// Test with nil cause
	appErrNil := errs.NewAppError(errs.ValidationError, "test", nil)
	resultNil := appErrNil.Unwrap()
	assert.Nil(t, resultNil)
}

func TestAppError_Is(t *testing.T) {
	t.Parallel()

	appErr1 := errs.NewAppError(errs.ValidationError, "test1", nil)
	appErr2 := errs.NewAppError(errs.ValidationError, "test2", nil)
	appErr3 := errs.NewAppError(errs.DatabaseError, "test3", nil)
	genericErr := errors.New("generic error")

	// Same type should match
	assert.True(t, appErr1.Is(appErr2))

	// Different type should not match
	assert.False(t, appErr1.Is(appErr3))

	// Non-AppError should not match
	assert.False(t, appErr1.Is(genericErr))
}

func TestNewStandardErrorHandler(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	classifier := errs.NewDefaultErrorClassifier()
	reporter := errs.NewLoggingErrorReporter(log)

	handler := errs.NewStandardErrorHandler(log, classifier, reporter)

	assert.NotNil(t, handler)
	assert.Implements(t, (*errs.ErrorService)(nil), handler)
}

func TestNewBasicErrorHandler(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()

	handler := errs.NewBasicErrorHandler(log)

	assert.NotNil(t, handler)
	assert.Implements(t, (*errs.ErrorService)(nil), handler)
}

func TestStandardErrorHandler_Handle(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	handler := errs.NewBasicErrorHandler(log)
	ctx := context.Background()

	tests := []struct {
		name string
		err  error
	}{
		{
			name: "nil error",
			err:  nil,
		},
		{
			name: "app error",
			err:  errs.NewAppError(errs.ValidationError, "validation failed", nil),
		},
		{
			name: "generic error",
			err:  errors.New("generic error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Should not panic
			handler.Handle(ctx, tt.err)
		})
	}
}

func TestStandardErrorHandler_WrapperMethods(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	handler := errs.NewBasicErrorHandler(log)
	cause := errors.New("underlying error")

	tests := []struct {
		name     string
		wrapFn   func() *errs.AppError
		expected errs.ErrorType
	}{
		{
			name:     "WrapValidationError",
			wrapFn:   func() *errs.AppError { return handler.WrapValidationError("validation failed", cause) },
			expected: errs.ValidationError,
		},
		{
			name:     "WrapDatabaseError",
			wrapFn:   func() *errs.AppError { return handler.WrapDatabaseError("database failed", cause) },
			expected: errs.DatabaseError,
		},
		{
			name:     "WrapNetworkError",
			wrapFn:   func() *errs.AppError { return handler.WrapNetworkError("network failed", cause) },
			expected: errs.NetworkError,
		},
		{
			name:     "WrapProcessingError",
			wrapFn:   func() *errs.AppError { return handler.WrapProcessingError("processing failed", cause) },
			expected: errs.ProcessingError,
		},
		{
			name:     "WrapAuthenticationError",
			wrapFn:   func() *errs.AppError { return handler.WrapAuthenticationError("auth failed", cause) },
			expected: errs.AuthenticationError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.wrapFn()
			assert.Equal(t, tt.expected, result.Type)
			assert.Equal(t, cause, result.Cause)
		})
	}
}

func TestStandardErrorHandler_WrapError(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	handler := errs.NewBasicErrorHandler(log)
	cause := errors.New("underlying error")

	result := handler.WrapError(errs.NetworkError, "network issue", cause)

	assert.Equal(t, errs.NetworkError, result.Type)
	assert.Equal(t, "network issue", result.Message)
	assert.Equal(t, cause, result.Cause)
}

func TestStandardErrorHandler_WrapWithContext(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	handler := errs.NewBasicErrorHandler(log)
	cause := errors.New("underlying error")
	context := map[string]any{
		"user_id": 123,
		"action":  "create",
	}

	result := handler.WrapWithContext(errs.ValidationError, "validation failed", cause, context)

	assert.Equal(t, errs.ValidationError, result.Type)
	assert.Equal(t, "validation failed", result.Message)
	assert.Equal(t, cause, result.Cause)
	assert.Equal(t, 123, result.Context["user_id"])
	assert.Equal(t, "create", result.Context["action"])
}

func TestStandardErrorHandler_Execute(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	handler := errs.NewBasicErrorHandler(log)
	ctx := context.Background()

	tests := []struct {
		name     string
		fn       func(ctx context.Context) error
		hasError bool
	}{
		{
			name: "successful execution",
			fn: func(ctx context.Context) error {
				return nil
			},
			hasError: false,
		},
		{
			name: "execution with error",
			fn: func(ctx context.Context) error {
				return errors.New("execution failed")
			},
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := handler.Execute(ctx, tt.fn)
			assert.Equal(t, tt.hasError, err != nil)
		})
	}
}

func TestStandardErrorHandler_ExecuteWithResult(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	handler := errs.NewBasicErrorHandler(log)
	ctx := context.Background()

	tests := []struct {
		name           string
		fn             func(ctx context.Context) (any, error)
		expectedResult any
		hasError       bool
	}{
		{
			name: "successful execution with result",
			fn: func(ctx context.Context) (any, error) {
				return "success", nil
			},
			expectedResult: "success",
			hasError:       false,
		},
		{
			name: "execution with error",
			fn: func(ctx context.Context) (any, error) {
				return nil, errors.New("execution failed")
			},
			expectedResult: nil,
			hasError:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := handler.ExecuteWithResult(ctx, tt.fn)
			assert.Equal(t, tt.expectedResult, result)
			assert.Equal(t, tt.hasError, err != nil)
		})
	}
}

func TestStandardErrorHandler_ExecuteWithRecovery(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	handler := errs.NewBasicErrorHandler(log)
	ctx := context.Background()

	tests := []struct {
		name     string
		fn       func(ctx context.Context) error
		hasError bool
		isPanic  bool
	}{
		{
			name: "successful execution",
			fn: func(ctx context.Context) error {
				return nil
			},
			hasError: false,
			isPanic:  false,
		},
		{
			name: "execution with error",
			fn: func(ctx context.Context) error {
				return errors.New("execution failed")
			},
			hasError: true,
			isPanic:  false,
		},
		{
			name: "execution with panic",
			fn: func(ctx context.Context) error {
				panic("something went wrong")
			},
			hasError: true,
			isPanic:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			err := handler.ExecuteWithRecovery(ctx, tt.fn)
			assert.Equal(t, tt.hasError, err != nil)

			if tt.isPanic && err != nil {
				appErr, ok := err.(*errs.AppError)
				require.True(t, ok)
				assert.Equal(t, errs.UnknownError, appErr.Type)
				assert.Contains(t, appErr.Message, "panic occurred")
			}
		})
	}
}

func TestNewErrorHandlerDecorator(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()

	decorator := errs.NewErrorHandlerDecorator[string](log)

	assert.NotNil(t, decorator)
}

func TestErrorHandlerDecorator_Execute(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	decorator := errs.NewErrorHandlerDecorator[string](log)
	ctx := context.Background()

	tests := []struct {
		name           string
		fn             func(ctx context.Context) (string, error)
		expectedResult string
		hasError       bool
	}{
		{
			name: "successful execution",
			fn: func(ctx context.Context) (string, error) {
				return "success", nil
			},
			expectedResult: "success",
			hasError:       false,
		},
		{
			name: "execution with error",
			fn: func(ctx context.Context) (string, error) {
				return "", errors.New("execution failed")
			},
			expectedResult: "",
			hasError:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := decorator.Execute(ctx, tt.fn)
			assert.Equal(t, tt.expectedResult, result)
			assert.Equal(t, tt.hasError, err != nil)
		})
	}
}

func TestErrorHandlerDecorator_ExecuteWithRecovery(t *testing.T) {
	t.Parallel()

	log := logger.NewTestLogger()
	decorator := errs.NewErrorHandlerDecorator[int](log)
	ctx := context.Background()

	tests := []struct {
		name           string
		fn             func(ctx context.Context) (int, error)
		expectedResult int
		hasError       bool
		isPanic        bool
	}{
		{
			name: "successful execution",
			fn: func(ctx context.Context) (int, error) {
				return 42, nil
			},
			expectedResult: 42,
			hasError:       false,
			isPanic:        false,
		},
		{
			name: "execution with error",
			fn: func(ctx context.Context) (int, error) {
				return 0, errors.New("execution failed")
			},
			expectedResult: 0,
			hasError:       true,
			isPanic:        false,
		},
		{
			name: "execution with panic",
			fn: func(ctx context.Context) (int, error) {
				panic("something went wrong")
			},
			expectedResult: 0,
			hasError:       true,
			isPanic:        true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result, err := decorator.ExecuteWithRecovery(ctx, tt.fn)
			assert.Equal(t, tt.expectedResult, result)
			assert.Equal(t, tt.hasError, err != nil)

			if tt.isPanic && err != nil {
				appErr, ok := err.(*errs.AppError)
				require.True(t, ok)
				assert.Equal(t, errs.UnknownError, appErr.Type)
				assert.Contains(t, appErr.Message, "panic occurred")
			}
		})
	}
}
