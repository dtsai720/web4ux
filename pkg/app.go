package pkg

import (
	"context"

	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
)

func WithService(service fetcher.IService) common.OptionalFn[App] {
	return func(s *App) { s.service = service }
}

func WithLogger(log logger.ILogger) common.OptionalFn[App] {
	return func(s *App) { s.log = log }
}

//nolint:containedctx
type App struct {
	ctx     context.Context
	log     logger.ILogger
	service fetcher.IService
}

// NewApp creates a new App application struct.
func New(options ...common.OptionalFn[App]) *App {
	return common.WithOptions(new(App), options...)
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods.
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}
