package errs

import (
	"context"
	"time"

	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

// LoggingErrorReporter implements ErrorReporter using logger
type LoggingErrorReporter struct {
	log logger.ILogger
}

// NewLoggingErrorReporter creates a new logging-based error reporter
func NewLoggingErrorReporter(log logger.ILogger) *LoggingErrorReporter {
	return &LoggingErrorReporter{log: log}
}

// Ensure LoggingErrorReporter implements ErrorReporter
var _ ErrorReporter = (*LoggingErrorReporter)(nil)

// ReportError sends error information to configured destinations
func (r *LoggingErrorReporter) ReportError(ctx context.Context, err *AppError) error {
	if err == nil {
		return nil
	}

	fields := []zap.Field{
		zap.String("error_type", err.Type.String()),
		zap.String("message", err.Message),
		zap.Time("timestamp", time.Now()),
	}

	// Add context fields
	for key, value := range err.Context {
		fields = append(fields, zap.Any(key, value))
	}

	// Add cause if present
	if err.Cause != nil {
		fields = append(fields, zap.Error(err.Cause))
	}

	// Log based on error severity
	switch err.Type {
	case ValidationError:
		r.log.With(fields...).Error("Validation error reported")
	case DatabaseError:
		r.log.With(fields...).Error("Database error reported")
	case NetworkError:
		r.log.With(fields...).Error("Network error reported")
	case ProcessingError:
		r.log.With(fields...).Error("Processing error reported")
	case AuthenticationError:
		r.log.With(fields...).Error("Authentication error reported")
	default:
		r.log.With(fields...).Error("Unknown error reported")
	}

	return nil
}

// ReportMetrics sends error metrics to monitoring systems
func (r *LoggingErrorReporter) ReportMetrics(ctx context.Context, errorType ErrorType, count int) error {
	r.log.With(
		zap.String("error_type", errorType.String()),
		zap.Int("count", count),
		zap.Time("timestamp", time.Now()),
	).Info("Error metrics reported")

	return nil
}

// CompositeErrorReporter allows multiple reporters to be used together
type CompositeErrorReporter struct {
	reporters []ErrorReporter
}

// NewCompositeErrorReporter creates a composite error reporter
func NewCompositeErrorReporter(reporters ...ErrorReporter) *CompositeErrorReporter {
	return &CompositeErrorReporter{
		reporters: reporters,
	}
}

// Ensure CompositeErrorReporter implements ErrorReporter
var _ ErrorReporter = (*CompositeErrorReporter)(nil)

// ReportError reports to all configured reporters
func (c *CompositeErrorReporter) ReportError(ctx context.Context, err *AppError) error {
	for _, reporter := range c.reporters {
		if reportErr := reporter.ReportError(ctx, err); reportErr != nil {
			// Log the reporting error but continue with other reporters
			// This prevents cascading failures
			_ = reportErr // Explicitly ignore the error
		}
	}
	return nil
}

// ReportMetrics reports metrics to all configured reporters
func (c *CompositeErrorReporter) ReportMetrics(ctx context.Context, errorType ErrorType, count int) error {
	for _, reporter := range c.reporters {
		if reportErr := reporter.ReportMetrics(ctx, errorType, count); reportErr != nil {
			// Log the reporting error but continue with other reporters
			_ = reportErr // Explicitly ignore the error
		}
	}
	return nil
}

// MockErrorReporter for testing purposes
type MockErrorReporter struct {
	ReportedErrors  []*AppError
	ReportedMetrics []MetricsReport
}

type MetricsReport struct {
	ErrorType ErrorType
	Count     int
	Timestamp time.Time
}

// NewMockErrorReporter creates a new mock error reporter
func NewMockErrorReporter() *MockErrorReporter {
	return &MockErrorReporter{
		ReportedErrors:  make([]*AppError, 0),
		ReportedMetrics: make([]MetricsReport, 0),
	}
}

// Ensure MockErrorReporter implements ErrorReporter
var _ ErrorReporter = (*MockErrorReporter)(nil)

// ReportError stores the error for verification in tests
func (m *MockErrorReporter) ReportError(ctx context.Context, err *AppError) error {
	m.ReportedErrors = append(m.ReportedErrors, err)
	return nil
}

// ReportMetrics stores the metrics for verification in tests
func (m *MockErrorReporter) ReportMetrics(ctx context.Context, errorType ErrorType, count int) error {
	m.ReportedMetrics = append(m.ReportedMetrics, MetricsReport{
		ErrorType: errorType,
		Count:     count,
		Timestamp: time.Now(),
	})
	return nil
}

// Reset clears all stored data
func (m *MockErrorReporter) Reset() {
	m.ReportedErrors = make([]*AppError, 0)
	m.ReportedMetrics = make([]MetricsReport, 0)
}

// GetLastError returns the most recently reported error
func (m *MockErrorReporter) GetLastError() *AppError {
	if len(m.ReportedErrors) == 0 {
		return nil
	}
	return m.ReportedErrors[len(m.ReportedErrors)-1]
}

// GetErrorCount returns the total number of reported errors
func (m *MockErrorReporter) GetErrorCount() int {
	return len(m.ReportedErrors)
}
