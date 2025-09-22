package errs_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/logger"
)

func TestNewLoggingErrorReporter(t *testing.T) {
	log := logger.NewTestLogger()

	reporter := errs.NewLoggingErrorReporter(log)

	assert.NotNil(t, reporter)
	assert.Implements(t, (*errs.ErrorReporter)(nil), reporter)
}

func TestLoggingErrorReporter_ReportError(t *testing.T) {
	log := logger.NewTestLogger()
	reporter := errs.NewLoggingErrorReporter(log)
	ctx := context.Background()

	tests := []struct {
		name string
		err  *errs.AppError
	}{
		{
			name: "nil error",
			err:  nil,
		},
		{
			name: "validation error",
			err:  errs.NewAppError(errs.ValidationError, "validation failed", nil),
		},
		{
			name: "database error with cause",
			err:  errs.NewAppError(errs.DatabaseError, "db connection failed", errors.New("connection timeout")),
		},
		{
			name: "network error with context",
			err: errs.NewAppError(errs.NetworkError, "network failed", nil).
				WithContext("url", "http://example.com").
				WithContext("timeout", 30),
		},
		{
			name: "processing error",
			err:  errs.NewAppError(errs.ProcessingError, "processing failed", nil),
		},
		{
			name: "authentication error",
			err:  errs.NewAppError(errs.AuthenticationError, "auth failed", nil),
		},
		{
			name: "unknown error type",
			err:  errs.NewAppError(errs.ErrorType(999), "unknown error", nil),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := reporter.ReportError(ctx, tt.err)
			assert.NoError(t, err)
		})
	}
}

func TestLoggingErrorReporter_ReportMetrics(t *testing.T) {
	log := logger.NewTestLogger()
	reporter := errs.NewLoggingErrorReporter(log)
	ctx := context.Background()

	tests := []struct {
		name      string
		errorType errs.ErrorType
		count     int
	}{
		{
			name:      "validation error metrics",
			errorType: errs.ValidationError,
			count:     5,
		},
		{
			name:      "database error metrics",
			errorType: errs.DatabaseError,
			count:     2,
		},
		{
			name:      "zero count metrics",
			errorType: errs.NetworkError,
			count:     0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := reporter.ReportMetrics(ctx, tt.errorType, tt.count)
			assert.NoError(t, err)
		})
	}
}

func TestNewCompositeErrorReporter(t *testing.T) {
	log := logger.NewTestLogger()
	reporter1 := errs.NewLoggingErrorReporter(log)
	reporter2 := errs.NewMockErrorReporter()

	composite := errs.NewCompositeErrorReporter(reporter1, reporter2)

	assert.NotNil(t, composite)
	assert.Implements(t, (*errs.ErrorReporter)(nil), composite)
}

func TestCompositeErrorReporter_ReportError(t *testing.T) {
	log := logger.NewTestLogger()
	loggingReporter := errs.NewLoggingErrorReporter(log)
	mockReporter1 := errs.NewMockErrorReporter()
	mockReporter2 := errs.NewMockErrorReporter()

	composite := errs.NewCompositeErrorReporter(loggingReporter, mockReporter1, mockReporter2)

	ctx := context.Background()
	appErr := errs.NewAppError(errs.ValidationError, "test error", nil)

	err := composite.ReportError(ctx, appErr)

	assert.NoError(t, err)
	assert.Equal(t, 1, mockReporter1.GetErrorCount())
	assert.Equal(t, 1, mockReporter2.GetErrorCount())
	assert.Equal(t, appErr, mockReporter1.GetLastError())
	assert.Equal(t, appErr, mockReporter2.GetLastError())
}

func TestCompositeErrorReporter_ReportMetrics(t *testing.T) {
	log := logger.NewTestLogger()
	loggingReporter := errs.NewLoggingErrorReporter(log)
	mockReporter1 := errs.NewMockErrorReporter()
	mockReporter2 := errs.NewMockErrorReporter()

	composite := errs.NewCompositeErrorReporter(loggingReporter, mockReporter1, mockReporter2)

	ctx := context.Background()
	errorType := errs.DatabaseError
	count := 5

	err := composite.ReportMetrics(ctx, errorType, count)

	assert.NoError(t, err)
	assert.Equal(t, 1, len(mockReporter1.ReportedMetrics))
	assert.Equal(t, 1, len(mockReporter2.ReportedMetrics))
	assert.Equal(t, errorType, mockReporter1.ReportedMetrics[0].ErrorType)
	assert.Equal(t, count, mockReporter1.ReportedMetrics[0].Count)
}

func TestNewMockErrorReporter(t *testing.T) {
	reporter := errs.NewMockErrorReporter()

	assert.NotNil(t, reporter)
	assert.Implements(t, (*errs.ErrorReporter)(nil), reporter)
	assert.Empty(t, reporter.ReportedErrors)
	assert.Empty(t, reporter.ReportedMetrics)
}

func TestMockErrorReporter_ReportError(t *testing.T) {
	reporter := errs.NewMockErrorReporter()
	ctx := context.Background()

	err1 := errs.NewAppError(errs.ValidationError, "error 1", nil)
	err2 := errs.NewAppError(errs.DatabaseError, "error 2", nil)

	reportErr1 := reporter.ReportError(ctx, err1)
	reportErr2 := reporter.ReportError(ctx, err2)

	assert.NoError(t, reportErr1)
	assert.NoError(t, reportErr2)
	assert.Equal(t, 2, reporter.GetErrorCount())
	assert.Equal(t, err2, reporter.GetLastError()) // Last reported error
	assert.Equal(t, err1, reporter.ReportedErrors[0])
	assert.Equal(t, err2, reporter.ReportedErrors[1])
}

func TestMockErrorReporter_ReportMetrics(t *testing.T) {
	reporter := errs.NewMockErrorReporter()
	ctx := context.Background()

	err1 := reporter.ReportMetrics(ctx, errs.ValidationError, 5)
	err2 := reporter.ReportMetrics(ctx, errs.DatabaseError, 3)

	assert.NoError(t, err1)
	assert.NoError(t, err2)
	assert.Equal(t, 2, len(reporter.ReportedMetrics))

	assert.Equal(t, errs.ValidationError, reporter.ReportedMetrics[0].ErrorType)
	assert.Equal(t, 5, reporter.ReportedMetrics[0].Count)

	assert.Equal(t, errs.DatabaseError, reporter.ReportedMetrics[1].ErrorType)
	assert.Equal(t, 3, reporter.ReportedMetrics[1].Count)
}

func TestMockErrorReporter_Reset(t *testing.T) {
	reporter := errs.NewMockErrorReporter()
	ctx := context.Background()

	// Add some data
	appErr := errs.NewAppError(errs.ValidationError, "test error", nil)
	_ = reporter.ReportError(ctx, appErr)
	_ = reporter.ReportMetrics(ctx, errs.DatabaseError, 5)

	assert.Equal(t, 1, reporter.GetErrorCount())
	assert.Equal(t, 1, len(reporter.ReportedMetrics))

	// Reset
	reporter.Reset()

	assert.Equal(t, 0, reporter.GetErrorCount())
	assert.Equal(t, 0, len(reporter.ReportedMetrics))
	assert.Nil(t, reporter.GetLastError())
}

func TestMockErrorReporter_GetLastError(t *testing.T) {
	reporter := errs.NewMockErrorReporter()
	ctx := context.Background()

	// No errors reported yet
	lastError := reporter.GetLastError()
	assert.Nil(t, lastError)

	// Report one error
	err1 := errs.NewAppError(errs.ValidationError, "error 1", nil)
	_ = reporter.ReportError(ctx, err1)

	lastError = reporter.GetLastError()
	assert.Equal(t, err1, lastError)

	// Report another error
	err2 := errs.NewAppError(errs.DatabaseError, "error 2", nil)
	_ = reporter.ReportError(ctx, err2)

	lastError = reporter.GetLastError()
	assert.Equal(t, err2, lastError) // Should be the most recent
}

func TestMockErrorReporter_GetErrorCount(t *testing.T) {
	reporter := errs.NewMockErrorReporter()
	ctx := context.Background()

	assert.Equal(t, 0, reporter.GetErrorCount())

	err1 := errs.NewAppError(errs.ValidationError, "error 1", nil)
	_ = reporter.ReportError(ctx, err1)
	assert.Equal(t, 1, reporter.GetErrorCount())

	err2 := errs.NewAppError(errs.DatabaseError, "error 2", nil)
	_ = reporter.ReportError(ctx, err2)
	assert.Equal(t, 2, reporter.GetErrorCount())
}
