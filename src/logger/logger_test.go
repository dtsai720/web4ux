package logger_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"go.uber.org/zap/zaptest/observer"
)

func TestNew(t *testing.T) {
	zapLogger, _ := zap.NewDevelopment()

	log := logger.New(zapLogger)

	assert.NotNil(t, log)
	assert.Implements(t, (*logger.ILogger)(nil), log)
}

func TestNewTestLogger(t *testing.T) {
	log := logger.NewTestLogger()

	assert.NotNil(t, log)
	assert.Implements(t, (*logger.ILogger)(nil), log)
}

func TestNewTestLoggerSafe(t *testing.T) {
	log, err := logger.NewTestLoggerSafe()

	assert.NoError(t, err)
	assert.NotNil(t, log)
	assert.Implements(t, (*logger.ILogger)(nil), log)
}

func TestLogger_Info(t *testing.T) {
	core, logs := observer.New(zapcore.InfoLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	log.Info("test message", "extra", "data")

	entries := logs.All()
	require.Len(t, entries, 1)
	assert.Equal(t, zapcore.InfoLevel, entries[0].Level)
	assert.Contains(t, entries[0].Message, "test message")
}

func TestLogger_Infof(t *testing.T) {
	core, logs := observer.New(zapcore.InfoLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	log.Infof("test message with %s and %d", "string", 42)

	entries := logs.All()
	require.Len(t, entries, 1)
	assert.Equal(t, zapcore.InfoLevel, entries[0].Level)
	assert.Equal(t, "test message with string and 42", entries[0].Message)
}

func TestLogger_Error(t *testing.T) {
	core, logs := observer.New(zapcore.ErrorLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	log.Error("error message", "context", "value")

	entries := logs.All()
	require.Len(t, entries, 1)
	assert.Equal(t, zapcore.ErrorLevel, entries[0].Level)
	assert.Contains(t, entries[0].Message, "error message")
}

func TestLogger_Errorf(t *testing.T) {
	core, logs := observer.New(zapcore.ErrorLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	log.Errorf("error occurred: %s with code %d", "database connection failed", 500)

	entries := logs.All()
	require.Len(t, entries, 1)
	assert.Equal(t, zapcore.ErrorLevel, entries[0].Level)
	assert.Equal(t, "error occurred: database connection failed with code 500", entries[0].Message)
}

func TestLogger_With(t *testing.T) {
	core, logs := observer.New(zapcore.InfoLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	contextLogger := log.With(
		zap.String("component", "test"),
		zap.Int("request_id", 123),
	)

	assert.NotNil(t, contextLogger)
	assert.Implements(t, (*logger.ILogger)(nil), contextLogger)

	contextLogger.Info("test message")

	entries := logs.All()
	require.Len(t, entries, 1)
	assert.Equal(t, zapcore.InfoLevel, entries[0].Level)
	assert.Equal(t, "test message", entries[0].Message)

	// Check that context fields are present
	foundComponent := false
	foundRequestID := false
	for _, field := range entries[0].Context {
		if field.Key == "component" && field.String == "test" {
			foundComponent = true
		}
		if field.Key == "request_id" && field.Integer == 123 {
			foundRequestID = true
		}
	}
	assert.True(t, foundComponent, "component field should be present")
	assert.True(t, foundRequestID, "request_id field should be present")
}

func TestLogger_Panicf(t *testing.T) {
	core, logs := observer.New(zapcore.PanicLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	assert.Panics(t, func() {
		log.Panicf("panic occurred: %s", "critical error")
	})

	entries := logs.All()
	require.Len(t, entries, 1)
	assert.Equal(t, zapcore.PanicLevel, entries[0].Level)
	assert.Equal(t, "panic occurred: critical error", entries[0].Message)
}

func TestLogger_LogLevels(t *testing.T) {
	tests := []struct {
		name     string
		logLevel zapcore.Level
		logFunc  func(logger.ILogger)
		shouldLog bool
	}{
		{
			name:     "info level allows info logs",
			logLevel: zapcore.InfoLevel,
			logFunc:  func(l logger.ILogger) { l.Info("test") },
			shouldLog: true,
		},
		{
			name:     "info level allows error logs",
			logLevel: zapcore.InfoLevel,
			logFunc:  func(l logger.ILogger) { l.Error("test") },
			shouldLog: true,
		},
		{
			name:     "error level blocks info logs",
			logLevel: zapcore.ErrorLevel,
			logFunc:  func(l logger.ILogger) { l.Info("test") },
			shouldLog: false,
		},
		{
			name:     "error level allows error logs",
			logLevel: zapcore.ErrorLevel,
			logFunc:  func(l logger.ILogger) { l.Error("test") },
			shouldLog: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			core, logs := observer.New(tt.logLevel)
			zapLogger := zap.New(core)
			log := logger.New(zapLogger)

			tt.logFunc(log)

			entries := logs.All()
			if tt.shouldLog {
				assert.Len(t, entries, 1)
			} else {
				assert.Len(t, entries, 0)
			}
		})
	}
}

func TestLogger_MultipleLogCalls(t *testing.T) {
	core, logs := observer.New(zapcore.InfoLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	log.Info("first message")
	log.Error("second message")
	log.Infof("third message with %s", "parameter")
	log.Errorf("fourth message with %d", 42)

	entries := logs.All()
	require.Len(t, entries, 4)

	assert.Equal(t, "first message", entries[0].Message)
	assert.Equal(t, zapcore.InfoLevel, entries[0].Level)

	assert.Equal(t, "second message", entries[1].Message)
	assert.Equal(t, zapcore.ErrorLevel, entries[1].Level)

	assert.Equal(t, "third message with parameter", entries[2].Message)
	assert.Equal(t, zapcore.InfoLevel, entries[2].Level)

	assert.Equal(t, "fourth message with 42", entries[3].Message)
	assert.Equal(t, zapcore.ErrorLevel, entries[3].Level)
}

func TestLogger_WithChaining(t *testing.T) {
	core, logs := observer.New(zapcore.InfoLevel)
	zapLogger := zap.New(core)
	log := logger.New(zapLogger)

	// Test chaining With calls
	contextLogger := log.With(zap.String("component", "auth")).
		With(zap.Int("user_id", 123))

	contextLogger.Info("user logged in")

	entries := logs.All()
	require.Len(t, entries, 1)

	// Verify both context fields are present
	foundComponent := false
	foundUserID := false
	for _, field := range entries[0].Context {
		if field.Key == "component" && field.String == "auth" {
			foundComponent = true
		}
		if field.Key == "user_id" && field.Integer == 123 {
			foundUserID = true
		}
	}
	assert.True(t, foundComponent)
	assert.True(t, foundUserID)
}
