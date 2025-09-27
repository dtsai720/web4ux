package errs

import (
	"errors"
	"fmt"
)

// ErrorCode represents different categories of errors in the application.
type ErrorCode int

const (
	// ErrCodeUnknown represents an unclassified error.
	ErrCodeUnknown ErrorCode = iota
	// ErrCodeValidation represents validation-related errors.
	ErrCodeValidation
	// ErrCodeNotFound represents resource not found errors.
	ErrCodeNotFound
	// ErrCodeDatabase represents database operation errors.
	ErrCodeDatabase
	// ErrCodeNetwork represents network-related errors.
	ErrCodeNetwork
	// ErrCodeAuthentication represents authentication failures.
	ErrCodeAuthentication
	// ErrCodeAuthorization represents authorization failures.
	ErrCodeAuthorization
	// ErrCodeParsing represents data parsing errors.
	ErrCodeParsing
	// ErrCodeBusinessLogic represents business rule violations.
	ErrCodeBusinessLogic
)

// ServiceError provides structured error information with operation context.
// It implements the error interface and provides additional metadata for debugging
// and error categorization.
type ServiceError struct {
	Op   string    // Operation that failed (e.g., "Service.GetProject")
	Err  error     // Underlying error
	Code ErrorCode // Error category
}

// Error returns the string representation of the error.
func (e ServiceError) Error() string {
	if e.Op == "" {
		return e.Err.Error()
	}
	return fmt.Sprintf("%s: %v", e.Op, e.Err)
}

// Unwrap returns the underlying error for error wrapping support.
func (e ServiceError) Unwrap() error {
	return e.Err
}

// Is supports error comparison using errors.Is.
func (e ServiceError) Is(target error) bool {
	if se, ok := target.(ServiceError); ok {
		return e.Code == se.Code
	}
	return errors.Is(e.Err, target)
}

// NewServiceError creates a new ServiceError with the given parameters.
func NewServiceError(op string, err error, code ErrorCode) ServiceError {
	return ServiceError{
		Op:   op,
		Err:  err,
		Code: code,
	}
}

// NewValidationError creates a validation error with the given operation and message.
func NewValidationError(op, message string) ServiceError {
	return NewServiceError(op, errors.New(message), ErrCodeValidation)
}

// NewNotFoundError creates a not found error with the given operation and resource.
func NewNotFoundError(op, resource string) ServiceError {
	return NewServiceError(op, fmt.Errorf("%s not found", resource), ErrCodeNotFound)
}

// NewDatabaseError creates a database error with the given operation and underlying error.
func NewDatabaseError(op string, err error) ServiceError {
	return NewServiceError(op, err, ErrCodeDatabase)
}

// NewNetworkError creates a network error with the given operation and underlying error.
func NewNetworkError(op string, err error) ServiceError {
	return NewServiceError(op, err, ErrCodeNetwork)
}

// NewParsingError creates a parsing error with the given operation and underlying error.
func NewParsingError(op string, err error) ServiceError {
	return NewServiceError(op, err, ErrCodeParsing)
}

// NewBusinessLogicError creates a business logic error with the given operation and message.
func NewBusinessLogicError(op, message string) ServiceError {
	return NewServiceError(op, errors.New(message), ErrCodeBusinessLogic)
}

// Predefined domain-specific errors for backward compatibility.
var (
	ErrRegexMismatch                 error = errors.New("regex mismatch")
	ErrInvalidProjectSummary         error = errors.New("invalid project summary")
	ErrInsufficientCoordinateNumbers error = errors.New("insufficient valid numbers for position coordinates")
	ErrUnknown                       error = errors.New("unknown")
	ErrNotWinfittsProject            error = errors.New("project is not a winfitts project")
	ErrProjectUpToDate               error = errors.New("project is already up to date")
)
