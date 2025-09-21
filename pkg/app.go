package pkg

import (
	"context"

	"github.com/web4ux/internal/service/analyzer"
	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
)

func WithFetcherService(service fetcher.IService) common.OptionalFn[App] {
	return func(s *App) { s.fetcher = service }
}

func WithAnalyzerService(service analyzer.IService) common.OptionalFn[App] {
	return func(s *App) { s.analyzer = service }
}

func WithLogger(log logger.ILogger) common.OptionalFn[App] {
	return func(s *App) { s.log = log }
}

func WithSyncManager(syncManager ISyncManager) common.OptionalFn[App] {
	return func(s *App) { s.syncManager = syncManager }
}

//nolint:containedctx
type App struct {
	ctx         context.Context
	log         logger.ILogger
	fetcher     fetcher.IService
	analyzer    analyzer.IService
	syncManager ISyncManager
}

// NewApp creates a new App application struct.
func New(options ...common.OptionalFn[App]) *App {
	return common.WithOptions(new(App), options...)
}

func (a *App) GetContext() context.Context {
	return a.ctx
}

func (a *App) GetLogger() logger.ILogger {
	return a.log
}

func (a *App) GetFetcher() fetcher.IService {
	return a.fetcher
}

func (a *App) GetAnalyzer() analyzer.IService {
	return a.analyzer
}

func (a *App) GetSyncManager() ISyncManager {
	return a.syncManager
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods.
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize sync manager with progress reporter and project filter
	progressReporter := NewProgressReporter()

	// Create processor-based filter using the fetcher's processor registry
	processorRegistry := a.fetcher.GetProcessorRegistry()
	projectFilter := NewProcessorBasedFilter(processorRegistry)

	a.syncManager = NewSyncManager(a.fetcher, a.log, progressReporter, projectFilter)
}
