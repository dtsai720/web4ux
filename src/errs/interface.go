package errs

import "context"

// IErrorHandler defines the interface for handling application errors
// This interface follows SOLID principles:
// - Single Responsibility: Focus on error handling only
// - Interface Segregation: Minimal, focused interface
// - Dependency Inversion: Abstracts error handling implementation
type IErrorHandler interface {
	// Handle processes and logs an error with appropriate context
	Handle(ctx context.Context, err error)

	// WrapError creates a typed application error with context
	WrapError(errorType ErrorType, message string, cause error) *AppError

	// WrapWithContext creates an error with additional context information
	WrapWithContext(errorType ErrorType, message string, cause error, context map[string]any) *AppError
}

// ErrorWrapper defines the interface for creating typed errors
// Segregated from ErrorHandler to follow ISP
type ErrorWrapper interface {
	// Specific error type wrappers
	WrapValidationError(message string, cause error) *AppError
	WrapDatabaseError(message string, cause error) *AppError
	WrapNetworkError(message string, cause error) *AppError
	WrapProcessingError(message string, cause error) *AppError
	WrapAuthenticationError(message string, cause error) *AppError
}

// ErrorExecutor defines the interface for executing functions with error handling
// Segregated to allow different execution strategies
type ErrorExecutor interface {
	// Execute runs a function and handles any errors
	Execute(ctx context.Context, fn func(ctx context.Context) error) error

	// ExecuteWithResult runs a function that returns a result and handles errors
	ExecuteWithResult(ctx context.Context, fn func(ctx context.Context) (any, error)) (any, error)

	// ExecuteWithRecovery runs a function with panic recovery
	ExecuteWithRecovery(ctx context.Context, fn func(ctx context.Context) error) error
}

// ErrorService combines all error handling interfaces
// Follows Interface Segregation Principle by composing smaller interfaces
type ErrorService interface {
	IErrorHandler
	ErrorWrapper
	ErrorExecutor
}

// ErrorClassifier defines the interface for error classification
// Allows different classification strategies following Strategy pattern
type ErrorClassifier interface {
	// Classify determines the error type from a generic error
	Classify(err error) ErrorType

	// IsRetryable determines if an error indicates a retryable condition
	IsRetryable(err error) bool

	// IsCritical determines if an error is critical and requires immediate attention
	IsCritical(err error) bool
}

// ErrorReporter defines the interface for error reporting
// Allows different reporting strategies (logging, metrics, external services)
type ErrorReporter interface {
	// ReportError sends error information to configured destinations
	ReportError(ctx context.Context, err *AppError) error

	// ReportMetrics sends error metrics to monitoring systems
	ReportMetrics(ctx context.Context, errorType ErrorType, count int) error
}

// ErrorRecoveryStrategy defines the interface for error recovery
// Follows Strategy pattern for different recovery approaches
type ErrorRecoveryStrategy interface {
	// CanRecover determines if this strategy can handle the error
	CanRecover(err error) bool

	// Recover attempts to recover from the error
	Recover(ctx context.Context, err error) error

	// Name returns the strategy name for logging
	Name() string
}

// ErrorMiddleware defines the interface for error handling middleware
// Allows chaining of error handlers following Chain of Responsibility pattern
type ErrorMiddleware interface {
	// Process processes the error and optionally passes it to the next handler
	Process(ctx context.Context, err error, next IErrorHandler) error
}
