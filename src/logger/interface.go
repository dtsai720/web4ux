package logger

import "go.uber.org/zap"

type ILogger interface {
	Panicf(template string, args ...any)
	Fatalln(args ...any)
	With(fields ...zap.Field) ILogger
	Errorf(template string, args ...any)
	Error(args ...any)
	Infof(template string, args ...any)
	Info(args ...any)
}
