package service

import (
	"context"

	"github.com/web4ux/src/logger"
)

type IService interface {
	Login(ctx context.Context, log logger.ILogger, email, password string) error
	ListProject(ctx context.Context, log logger.ILogger, offset int) ([]byte, error)
}
