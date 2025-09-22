package pkg

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/web4ux/src/logger"
)

type ProgressReporter struct{}

func NewProgressReporter() *ProgressReporter {
	return &ProgressReporter{}
}

func (pr *ProgressReporter) ReportProgress(ctx context.Context, log logger.ILogger, projectName string, currentIndex, progress, totalProjects int) {
	syncProgress := SyncProgress{
		CurrentProject: projectName,
		CurrentIndex:   currentIndex,
		Progress:       progress,
		TotalProjects:  totalProjects,
		IsCompleted:    false,
		IsCancelled:    false,
	}
	pr.emitProgress(ctx, log, syncProgress)
}

func (pr *ProgressReporter) ReportCompletion(ctx context.Context, log logger.ILogger, totalProjects int) {
	syncProgress := SyncProgress{
		CurrentProject: "All projects completed",
		Progress:       100,
		CurrentIndex:   totalProjects,
		TotalProjects:  totalProjects,
		IsCompleted:    true,
		IsCancelled:    false,
	}
	pr.emitProgress(ctx, log, syncProgress)
}

func (pr *ProgressReporter) ReportCancellation(ctx context.Context, log logger.ILogger, projectName string, currentIndex, totalProjects int) {
	progress := (currentIndex * 100) / totalProjects
	syncProgress := SyncProgress{
		CurrentProject: projectName,
		CurrentIndex:   currentIndex,
		Progress:       progress,
		TotalProjects:  totalProjects,
		IsCompleted:    false,
		IsCancelled:    true,
	}
	pr.emitProgress(ctx, log, syncProgress)
}

func (pr *ProgressReporter) ReportError(ctx context.Context, log logger.ILogger, errorMessage string) {
	syncProgress := SyncProgress{
		CurrentProject: errorMessage,
		Progress:       100,
		TotalProjects:  0,
		IsCompleted:    false,
		IsCancelled:    true,
	}
	pr.emitProgress(ctx, log, syncProgress)
}

func (pr *ProgressReporter) emitProgress(ctx context.Context, log logger.ILogger, progress SyncProgress) {
	runtime.EventsEmit(ctx, "sync:progress", progress)
	log.Infof("Sync Progress: %+v\n", progress)
}
