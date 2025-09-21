package pkg

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/web4ux/src/logger"
)

type ProgressReporter struct {
	ctx context.Context
	log logger.ILogger
}

func NewProgressReporter(ctx context.Context, log logger.ILogger) *ProgressReporter {
	return &ProgressReporter{
		ctx: ctx,
		log: log,
	}
}

func (pr *ProgressReporter) ReportProgress(projectName string, currentIndex, progress, totalProjects int) {
	syncProgress := SyncProgress{
		CurrentProject: projectName,
		CurrentIndex:   currentIndex,
		Progress:       progress,
		TotalProjects:  totalProjects,
		IsCompleted:    false,
		IsCancelled:    false,
	}
	pr.emitProgress(syncProgress)
}

func (pr *ProgressReporter) ReportCompletion(totalProjects int) {
	syncProgress := SyncProgress{
		CurrentProject: "All projects completed",
		Progress:       100,
		CurrentIndex:   totalProjects,
		TotalProjects:  totalProjects,
		IsCompleted:    true,
		IsCancelled:    false,
	}
	pr.emitProgress(syncProgress)
}

func (pr *ProgressReporter) ReportCancellation(projectName string, currentIndex, totalProjects int) {
	progress := (currentIndex * 100) / totalProjects
	syncProgress := SyncProgress{
		CurrentProject: projectName,
		CurrentIndex:   currentIndex,
		Progress:       progress,
		TotalProjects:  totalProjects,
		IsCompleted:    false,
		IsCancelled:    true,
	}
	pr.emitProgress(syncProgress)
}

func (pr *ProgressReporter) ReportError(errorMessage string) {
	syncProgress := SyncProgress{
		CurrentProject: errorMessage,
		Progress:       100,
		TotalProjects:  0,
		IsCompleted:    false,
		IsCancelled:    true,
	}
	pr.emitProgress(syncProgress)
}

func (pr *ProgressReporter) emitProgress(progress SyncProgress) {
	runtime.EventsEmit(pr.ctx, "sync:progress", progress)
	pr.log.Infof("Sync Progress: %+v\n", progress)
}
