package request

import (
	"context"

	"github.com/web4ux/src/logger"
)

type SendParam struct {
	Path   string
	Method string
	Body   []byte
	Header map[string]string
	Query  map[string]string
}

type IClient interface {
	Send(ctx context.Context, log logger.ILogger, in *SendParam) ([]byte, error)
}
