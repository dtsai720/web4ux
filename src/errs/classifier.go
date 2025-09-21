package errs

import (
	"errors"
	"net"
	"net/url"
	"strings"
)

// DefaultErrorClassifier provides default error classification logic
type DefaultErrorClassifier struct{}

// NewDefaultErrorClassifier creates a new default error classifier
func NewDefaultErrorClassifier() *DefaultErrorClassifier {
	return &DefaultErrorClassifier{}
}

// Ensure DefaultErrorClassifier implements ErrorClassifier
var _ ErrorClassifier = (*DefaultErrorClassifier)(nil)

// Classify determines the error type from a generic error
func (c *DefaultErrorClassifier) Classify(err error) ErrorType {
	if err == nil {
		return UnknownError
	}

	// Check for application errors first
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Type
	}

	// Check for known error types
	switch {
	case c.isValidationError(err):
		return ValidationError
	case c.isDatabaseError(err):
		return DatabaseError
	case c.isNetworkError(err):
		return NetworkError
	case c.isAuthenticationError(err):
		return AuthenticationError
	default:
		return ProcessingError
	}
}

// IsRetryable determines if an error indicates a retryable condition
func (c *DefaultErrorClassifier) IsRetryable(err error) bool {
	if err == nil {
		return false
	}

	// Check if it's a known retryable error
	switch c.Classify(err) {
	case NetworkError:
		return c.isRetryableNetworkError(err)
	case DatabaseError:
		return c.isRetryableDatabaseError(err)
	case ProcessingError:
		return c.isRetryableProcessingError(err)
	default:
		return false
	}
}

// IsCritical determines if an error is critical and requires immediate attention
func (c *DefaultErrorClassifier) IsCritical(err error) bool {
	if err == nil {
		return false
	}

	switch c.Classify(err) {
	case DatabaseError:
		return c.isCriticalDatabaseError(err)
	case AuthenticationError:
		return true // Auth errors are always critical
	case UnknownError:
		return true // Unknown errors are treated as critical
	default:
		return false
	}
}

// Private helper methods for classification
func (c *DefaultErrorClassifier) isValidationError(err error) bool {
	errorStr := strings.ToLower(err.Error())
	validationKeywords := []string{
		"validation", "invalid", "required", "missing", "format",
		"regex mismatch", "insufficient", "malformed",
	}

	for _, keyword := range validationKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}

func (c *DefaultErrorClassifier) isDatabaseError(err error) bool {
	errorStr := strings.ToLower(err.Error())
	dbKeywords := []string{
		"sql", "database", "connection", "constraint", "duplicate",
		"foreign key", "table", "column", "sqlite", "postgres",
	}

	for _, keyword := range dbKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}

func (c *DefaultErrorClassifier) isNetworkError(err error) bool {
	// Check for network-specific error types
	var netErr net.Error
	if errors.As(err, &netErr) {
		return true
	}

	var urlErr *url.Error
	if errors.As(err, &urlErr) {
		return true
	}

	errorStr := strings.ToLower(err.Error())
	networkKeywords := []string{
		"network", "connection", "timeout", "dns", "tls", "ssl",
		"http", "tcp", "udp", "socket", "dial", "refused",
	}

	for _, keyword := range networkKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}

func (c *DefaultErrorClassifier) isAuthenticationError(err error) bool {
	errorStr := strings.ToLower(err.Error())
	authKeywords := []string{
		"authentication", "authorization", "login", "password",
		"token", "unauthorized", "forbidden", "credential",
	}

	for _, keyword := range authKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}

func (c *DefaultErrorClassifier) isRetryableNetworkError(err error) bool {
	var netErr net.Error
	if errors.As(err, &netErr) {
		return netErr.Timeout()
	}

	errorStr := strings.ToLower(err.Error())
	retryableKeywords := []string{
		"timeout", "temporary", "connection refused",
		"service unavailable", "too many requests",
	}

	for _, keyword := range retryableKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}

func (c *DefaultErrorClassifier) isRetryableDatabaseError(err error) bool {
	errorStr := strings.ToLower(err.Error())
	retryableKeywords := []string{
		"connection", "timeout", "locked", "busy",
		"deadlock", "temporary",
	}

	for _, keyword := range retryableKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}

func (c *DefaultErrorClassifier) isRetryableProcessingError(err error) bool {
	errorStr := strings.ToLower(err.Error())
	retryableKeywords := []string{
		"temporary", "retry", "rate limit", "throttle",
	}

	for _, keyword := range retryableKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}

func (c *DefaultErrorClassifier) isCriticalDatabaseError(err error) bool {
	errorStr := strings.ToLower(err.Error())
	criticalKeywords := []string{
		"corruption", "fatal", "panic", "critical",
		"disk full", "out of memory",
	}

	for _, keyword := range criticalKeywords {
		if strings.Contains(errorStr, keyword) {
			return true
		}
	}

	return false
}
