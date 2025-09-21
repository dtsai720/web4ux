package errs

import (
	"context"
	"fmt"

	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

type ErrorType int

const (
	ValidationError ErrorType = iota
	DatabaseError
	NetworkError
	ProcessingError
	AuthenticationError
	UnknownError
)

func (et ErrorType) String() string {
	switch et {
	case ValidationError:
		return "ValidationError"
	case DatabaseError:
		return "DatabaseError"
	case NetworkError:
		return "NetworkError"
	case ProcessingError:
		return "ProcessingError"
	case AuthenticationError:
		return "AuthenticationError"
	default:
		return "UnknownError"
	}
}

type AppError struct {
	Type       ErrorType
	Message    string
	Cause      error
	Context    map[string]any
	StackTrace string
}

func NewAppError(errorType ErrorType, message string, cause error) *AppError {
	return &AppError{
		Type:    errorType,
		Message: message,
		Cause:   cause,
		Context: make(map[string]any),
	}
}

func (ae *AppError) Error() string {
	if ae.Cause != nil {
		return fmt.Sprintf("%s: %s (caused by: %v)", ae.Type.String(), ae.Message, ae.Cause)
	}
	return fmt.Sprintf("%s: %s", ae.Type.String(), ae.Message)
}

func (ae *AppError) WithContext(key string, value any) *AppError {
	ae.Context[key] = value
	return ae
}

func (ae *AppError) Unwrap() error {
	return ae.Cause
}

func (ae *AppError) Is(target error) bool {
	if targetErr, ok := target.(*AppError); ok {
		return ae.Type == targetErr.Type
	}
	return false
}

// StandardErrorHandler implements the ErrorService interface
type StandardErrorHandler struct {
	log        logger.ILogger
	classifier ErrorClassifier
	reporter   ErrorReporter
}

// NewStandardErrorHandler creates a new error handler with all components
func NewStandardErrorHandler(log logger.ILogger, classifier ErrorClassifier, reporter ErrorReporter) *StandardErrorHandler {
	return &StandardErrorHandler{
		log:        log,
		classifier: classifier,
		reporter:   reporter,
	}
}

// NewBasicErrorHandler creates a basic error handler with default components
func NewBasicErrorHandler(log logger.ILogger) *StandardErrorHandler {
	return &StandardErrorHandler{
		log:        log,
		classifier: NewDefaultErrorClassifier(),
		reporter:   NewLoggingErrorReporter(log),
	}
}

// Ensure StandardErrorHandler implements ErrorService
var _ ErrorService = (*StandardErrorHandler)(nil)

func (eh *StandardErrorHandler) Handle(ctx context.Context, err error) {
	if err == nil {
		return
	}

	if appErr, ok := err.(*AppError); ok {
		eh.handleAppError(ctx, appErr)
	} else {
		eh.handleGenericError(ctx, err)
	}
}

func (eh *StandardErrorHandler) handleAppError(_ context.Context, appErr *AppError) {
	fields := []zap.Field{
		zap.String("error_type", appErr.Type.String()),
		zap.String("message", appErr.Message),
	}

	for key, value := range appErr.Context {
		fields = append(fields, zap.Any(key, value))
	}

	if appErr.Cause != nil {
		fields = append(fields, zap.Error(appErr.Cause))
	}

	switch appErr.Type {
	case ValidationError:
		eh.log.With(fields...).Error("Validation error occurred")
	case DatabaseError:
		eh.log.With(fields...).Error("Database error occurred")
	case NetworkError:
		eh.log.With(fields...).Error("Network error occurred")
	case ProcessingError:
		eh.log.With(fields...).Error("Processing error occurred")
	case AuthenticationError:
		eh.log.With(fields...).Error("Authentication error occurred")
	default:
		eh.log.With(fields...).Error("Unknown error occurred")
	}
}

func (eh *StandardErrorHandler) handleGenericError(_ context.Context, err error) {
	eh.log.With(zap.Error(err)).Error("Generic error occurred")
}

func (eh *StandardErrorHandler) WrapValidationError(message string, cause error) *AppError {
	return NewAppError(ValidationError, message, cause)
}

func (eh *StandardErrorHandler) WrapDatabaseError(message string, cause error) *AppError {
	return NewAppError(DatabaseError, message, cause)
}

func (eh *StandardErrorHandler) WrapNetworkError(message string, cause error) *AppError {
	return NewAppError(NetworkError, message, cause)
}

func (eh *StandardErrorHandler) WrapProcessingError(message string, cause error) *AppError {
	return NewAppError(ProcessingError, message, cause)
}

func (eh *StandardErrorHandler) WrapAuthenticationError(message string, cause error) *AppError {
	return NewAppError(AuthenticationError, message, cause)
}

// WrapError creates a typed application error with context
func (eh *StandardErrorHandler) WrapError(errorType ErrorType, message string, cause error) *AppError {
	return NewAppError(errorType, message, cause)
}

// WrapWithContext creates an error with additional context information
func (eh *StandardErrorHandler) WrapWithContext(errorType ErrorType, message string, cause error, context map[string]any) *AppError {
	appErr := NewAppError(errorType, message, cause)
	for key, value := range context {
		_ = appErr.WithContext(key, value)
	}
	return appErr
}

// Execute runs a function and handles any errors
func (eh *StandardErrorHandler) Execute(ctx context.Context, fn func(ctx context.Context) error) error {
	err := fn(ctx)
	if err != nil {
		eh.Handle(ctx, err)
	}
	return err
}

// ExecuteWithResult runs a function that returns a result and handles errors
func (eh *StandardErrorHandler) ExecuteWithResult(ctx context.Context, fn func(ctx context.Context) (any, error)) (any, error) {
	result, err := fn(ctx)
	if err != nil {
		eh.Handle(ctx, err)
	}
	return result, err
}

// ExecuteWithRecovery runs a function with panic recovery
func (eh *StandardErrorHandler) ExecuteWithRecovery(ctx context.Context, fn func(ctx context.Context) error) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = NewAppError(UnknownError, "panic occurred during execution", fmt.Errorf("%v", r))
			eh.Handle(ctx, err)
		}
	}()

	return eh.Execute(ctx, fn)
}

type ErrorHandlerDecorator[T any] struct {
	handler ErrorService
}

func NewErrorHandlerDecorator[T any](log logger.ILogger) *ErrorHandlerDecorator[T] {
	return &ErrorHandlerDecorator[T]{
		handler: NewBasicErrorHandler(log),
	}
}

func (ehd *ErrorHandlerDecorator[T]) Execute(ctx context.Context, fn func(ctx context.Context) (T, error)) (T, error) {
	result, err := fn(ctx)
	if err != nil {
		ehd.handler.Handle(ctx, err)
	}
	return result, err
}

func (ehd *ErrorHandlerDecorator[T]) ExecuteWithRecovery(ctx context.Context, fn func(ctx context.Context) (T, error)) (result T, err error) {
	defer func() {
		if r := recover(); r != nil {
			var zero T
			result = zero
			err = NewAppError(UnknownError, "panic occurred during execution", fmt.Errorf("%v", r))
			ehd.handler.Handle(ctx, err)
		}
	}()

	return ehd.Execute(ctx, fn)
}
