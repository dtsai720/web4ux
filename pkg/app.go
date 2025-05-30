package pkg

import (
	"context"
	"fmt"

	"github.com/web4ux/internal/service"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
)

func WithService(service service.IService) common.OptionalFn[App] {
	return func(s *App) { s.service = service }
}

func WithLogger(log logger.ILogger) common.OptionalFn[App] {
	return func(s *App) { s.log = log }
}

//nolint:containedctx
type App struct {
	ctx     context.Context
	log     logger.ILogger
	service service.IService
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

// Greet returns a greeting for the given name.
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time! ....", name)
}

func (a *App) Login(username, password string) {
	_ = a.service.Login(a.ctx, a.log, username, password)
}
