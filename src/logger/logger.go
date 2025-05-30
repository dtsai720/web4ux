package logger

import "go.uber.org/zap"

func New(l *zap.Logger) ILogger {
	return &logger{l}
}

var _ ILogger = (*logger)(nil)

type logger struct{ *zap.Logger }

// Fatalln implements ILogger.
func (l *logger) Fatalln(args ...any) {
	l.Sugar().Fatal(args...)
	// Note: Sugar().Fatal calls os.Exit(1) after logging, so the program will terminate.
	// If you want to avoid this behavior, consider using Error or Info instead.
	// This is a subtle difference from the original logger.Logger.Fatalln method.
}

// Error implements ILogger.
// Subtle: this method shadows the method (*Logger).Error of logger.Logger.
func (l *logger) Error(args ...any) {
	l.Sugar().Error(args...)
}

// Info implements ILogger.
// Subtle: this method shadows the method (*Logger).Info of logger.Logger.
func (l *logger) Info(args ...any) {
	l.Sugar().Info(args...)
}

func (l *logger) Panicf(template string, args ...any) {
	l.Sugar().Panicf(template, args...)
}

func (l *logger) With(fields ...zap.Field) ILogger {
	return &logger{l.Logger.With(fields...)}
}

func (l *logger) Errorf(template string, args ...any) {
	l.Sugar().Errorf(template, args...)
}

func (l *logger) Infof(template string, args ...any) {
	l.Sugar().Infof(template, args...)
}
