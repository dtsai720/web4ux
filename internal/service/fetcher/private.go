package fetcher

import (
	"context"
	"time"

	"github.com/web4ux/src/logger"
)

type HandleSingleParam[T any, R any] func(ctx context.Context, log logger.ILogger, in T) (R, error)

func WrapFSingleParam[T any, R any](duration time.Duration, f HandleSingleParam[T, R]) HandleSingleParam[T, R] {
	var zero R

	return func(ctx context.Context, log logger.ILogger, in T) (R, error) {
		target := time.Now().Add(duration)
		output, err := f(ctx, log, in)
		if err != nil {
			return zero, err
		}

		<-time.After(time.Until(target))

		return output, nil
	}
}
