package fetcher

import (
	"context"

	"github.com/web4ux/src/logger"
)

type IService interface {
	Login(ctx context.Context, log logger.ILogger, email, password string) error
	FetchDataAndSave(ctx context.Context, log logger.ILogger) error
}
