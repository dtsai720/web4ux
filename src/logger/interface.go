package logger

import "go.uber.org/zap"

// ILogger defines the logging interface for the application.
// It provides structured logging capabilities with different severity levels
// and support for contextual fields through zap.Field.
// All logging operations are thread-safe and suitable for concurrent use.
type ILogger interface {
	// Panicf logs a message at panic level with formatting, then panics.
	// This should only be used for unrecoverable errors that require immediate program termination.
	// The template string supports fmt.Printf-style formatting with the provided args.
	Panicf(template string, args ...any)

	// Fatalln logs the provided arguments at fatal level, then calls os.Exit(1).
	// This should only be used for errors that prevent the application from continuing.
	// Arguments are formatted using fmt.Sprintln semantics.
	Fatalln(args ...any)

	// With creates a new logger instance with additional structured fields.
	// The returned logger includes all fields from the parent logger plus the new fields.
	// This is useful for adding context like request IDs, user IDs, etc.
	With(fields ...zap.Field) ILogger

	// Errorf logs a message at error level with formatting.
	// Use this for errors that should be logged but don't require program termination.
	// The template string supports fmt.Printf-style formatting with the provided args.
	Errorf(template string, args ...any)

	// Error logs the provided arguments at error level.
	// Arguments are formatted using fmt.Sprint semantics.
	// Use this for simple error messages without formatting.
	Error(args ...any)

	// Infof logs a message at info level with formatting.
	// Use this for general informational messages about application flow.
	// The template string supports fmt.Printf-style formatting with the provided args.
	Infof(template string, args ...any)

	// Info logs the provided arguments at info level.
	// Arguments are formatted using fmt.Sprint semantics.
	// Use this for simple informational messages without formatting.
	Info(args ...any)
}
