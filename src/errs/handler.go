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

type ErrorHandler struct {
	log logger.ILogger
}

func NewErrorHandler(log logger.ILogger) *ErrorHandler {
	return &ErrorHandler{log: log}
}

func (eh *ErrorHandler) Handle(ctx context.Context, err error) {
	if err == nil {
		return
	}

	if appErr, ok := err.(*AppError); ok {
		eh.handleAppError(ctx, appErr)
	} else {
		eh.handleGenericError(ctx, err)
	}
}

func (eh *ErrorHandler) handleAppError(ctx context.Context, appErr *AppError) {
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

func (eh *ErrorHandler) handleGenericError(ctx context.Context, err error) {
	eh.log.With(zap.Error(err)).Error("Generic error occurred")
}

func (eh *ErrorHandler) WrapValidationError(message string, cause error) *AppError {
	return NewAppError(ValidationError, message, cause)
}

func (eh *ErrorHandler) WrapDatabaseError(message string, cause error) *AppError {
	return NewAppError(DatabaseError, message, cause)
}

func (eh *ErrorHandler) WrapNetworkError(message string, cause error) *AppError {
	return NewAppError(NetworkError, message, cause)
}

func (eh *ErrorHandler) WrapProcessingError(message string, cause error) *AppError {
	return NewAppError(ProcessingError, message, cause)
}

func (eh *ErrorHandler) WrapAuthenticationError(message string, cause error) *AppError {
	return NewAppError(AuthenticationError, message, cause)
}

type ErrorHandlerDecorator[T any] struct {
	handler ErrorHandler
}

func NewErrorHandlerDecorator[T any](log logger.ILogger) *ErrorHandlerDecorator[T] {
	return &ErrorHandlerDecorator[T]{
		handler: *NewErrorHandler(log),
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
