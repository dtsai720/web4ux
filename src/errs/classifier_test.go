package errs_test

import (
	"errors"
	"net"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/src/errs"
)

func TestNewDefaultErrorClassifier(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()
	assert.NotNil(t, classifier)
	assert.Implements(t, (*errs.ErrorClassifier)(nil), classifier)
}

func TestDefaultErrorClassifier_Classify(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	tests := []struct {
		name         string
		err          error
		expectedType errs.ErrorType
	}{
		{
			name:         "nil error returns UnknownError",
			err:          nil,
			expectedType: errs.UnknownError,
		},
		{
			name:         "app error returns its type",
			err:          errs.NewAppError(errs.ValidationError, "test", nil),
			expectedType: errs.ValidationError,
		},
		{
			name:         "validation error detected",
			err:          errors.New("invalid format"),
			expectedType: errs.ValidationError,
		},
		{
			name:         "database error detected",
			err:          errors.New("SQL connection failed"),
			expectedType: errs.DatabaseError,
		},
		{
			name:         "network error detected",
			err:          errors.New("network timeout"),
			expectedType: errs.NetworkError,
		},
		{
			name:         "authentication error detected",
			err:          errors.New("unauthorized access"),
			expectedType: errs.AuthenticationError,
		},
		{
			name:         "unknown error defaults to ProcessingError",
			err:          errors.New("some random error"),
			expectedType: errs.ProcessingError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := classifier.Classify(tt.err)
			assert.Equal(t, tt.expectedType, result)
		})
	}
}

func TestDefaultErrorClassifier_IsRetryable(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{
			name:     "nil error is not retryable",
			err:      nil,
			expected: false,
		},
		{
			name:     "network timeout is retryable",
			err:      errors.New("network timeout"),
			expected: true,
		},
		{
			name:     "database connection error is retryable",
			err:      errors.New("database connection failed"),
			expected: true,
		},
		{
			name:     "processing rate limit is retryable",
			err:      errors.New("rate limit exceeded"),
			expected: true,
		},
		{
			name:     "validation error is not retryable",
			err:      errors.New("invalid format"),
			expected: false,
		},
		{
			name:     "authentication error is not retryable",
			err:      errors.New("unauthorized"),
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := classifier.IsRetryable(tt.err)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestDefaultErrorClassifier_IsCritical(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{
			name:     "nil error is not critical",
			err:      nil,
			expected: false,
		},
		{
			name:     "database corruption is critical",
			err:      errors.New("database corruption detected"),
			expected: true,
		},
		{
			name:     "authentication error is critical",
			err:      errors.New("authentication failed"),
			expected: true,
		},
		{
			name:     "unknown error is critical",
			err:      errs.NewAppError(errs.UnknownError, "unknown", nil),
			expected: true,
		},
		{
			name:     "validation error is not critical",
			err:      errors.New("invalid format"),
			expected: false,
		},
		{
			name:     "network error is not critical",
			err:      errors.New("network timeout"),
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := classifier.IsCritical(tt.err)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestDefaultErrorClassifier_ValidationErrorDetection(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	validationErrors := []string{
		"validation failed",
		"invalid input",
		"required field missing",
		"missing parameter",
		"wrong format",
		"regex mismatch",
		"insufficient data",
		"malformed request",
	}

	for _, errMsg := range validationErrors {
		t.Run(errMsg, func(t *testing.T) {
			err := errors.New(errMsg)
			result := classifier.Classify(err)
			assert.Equal(t, errs.ValidationError, result)
		})
	}
}

func TestDefaultErrorClassifier_DatabaseErrorDetection(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	databaseErrors := []string{
		"SQL syntax error",
		"database connection failed",
		"database connection timeout",
		"constraint violation",
		"duplicate entry",
		"foreign key constraint",
		"table not found",
		"column does not exist",
		"sqlite error",
		"postgres connection failed",
	}

	for _, errMsg := range databaseErrors {
		t.Run(errMsg, func(t *testing.T) {
			err := errors.New(errMsg)
			result := classifier.Classify(err)
			assert.Equal(t, errs.DatabaseError, result)
		})
	}
}

func TestDefaultErrorClassifier_NetworkErrorDetection(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	// Test with actual network error types
	timeoutErr := &net.OpError{
		Op:  "dial",
		Err: &timeoutError{},
	}

	urlErr := &url.Error{
		Op:  "Get",
		URL: "http://example.com",
		Err: errors.New("connection refused"),
	}

	tests := []struct {
		name string
		err  error
	}{
		{"timeout error", timeoutErr},
		{"url error", urlErr},
		{"network string error", errors.New("network unreachable")},
		{"connection error", errors.New("connection refused")},
		{"timeout string error", errors.New("request timeout")},
		{"dns error", errors.New("dns lookup failed")},
		{"tls error", errors.New("tls handshake failed")},
		{"http error", errors.New("http request failed")},
		{"tcp error", errors.New("tcp connection failed")},
		{"socket error", errors.New("socket error")},
		{"dial error", errors.New("dial tcp failed")},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := classifier.Classify(tt.err)
			assert.Equal(t, errs.NetworkError, result)
		})
	}
}

func TestDefaultErrorClassifier_AuthenticationErrorDetection(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	authErrors := []string{
		"authentication failed",
		"authorization denied",
		"login failed",
		"invalid password",
		"token expired",
		"unauthorized access",
		"forbidden operation",
		"invalid credentials",
	}

	for _, errMsg := range authErrors {
		t.Run(errMsg, func(t *testing.T) {
			err := errors.New(errMsg)
			result := classifier.Classify(err)
			assert.Equal(t, errs.AuthenticationError, result)
		})
	}
}

func TestDefaultErrorClassifier_RetryableNetworkErrors(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	timeoutErr := &net.OpError{
		Op:  "dial",
		Err: &timeoutError{},
	}

	retryableErrors := []error{
		timeoutErr,
		errors.New("timeout occurred"),
		errors.New("temporary failure"),
		errors.New("connection refused"),
		errors.New("service unavailable"),
		errors.New("too many requests"),
	}

	for _, err := range retryableErrors {
		t.Run(err.Error(), func(t *testing.T) {
			result := classifier.IsRetryable(err)
			assert.True(t, result)
		})
	}
}

func TestDefaultErrorClassifier_RetryableDatabaseErrors(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	retryableErrors := []string{
		"database connection failed",
		"database connection timeout",
		"database locked",
		"database busy",
		"deadlock detected",
		"temporary database error",
	}

	for _, errMsg := range retryableErrors {
		t.Run(errMsg, func(t *testing.T) {
			err := errors.New(errMsg)
			result := classifier.IsRetryable(err)
			assert.True(t, result)
		})
	}
}

func TestDefaultErrorClassifier_CriticalDatabaseErrors(t *testing.T) {
	classifier := errs.NewDefaultErrorClassifier()

	criticalErrors := []string{
		"database corruption detected",
		"fatal database error",
		"database panic",
		"critical system failure",
		"disk full error",
		"out of memory",
	}

	for _, errMsg := range criticalErrors {
		t.Run(errMsg, func(t *testing.T) {
			err := errors.New(errMsg)
			result := classifier.IsCritical(err)
			assert.True(t, result)
		})
	}
}

// Helper type for testing timeout errors
type timeoutError struct{}

func (e *timeoutError) Error() string   { return "timeout" }
func (e *timeoutError) Timeout() bool   { return true }
func (e *timeoutError) Temporary() bool { return true }
