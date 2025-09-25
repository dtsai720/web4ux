package pkg

import (
	"context"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

// ISyncManager defines the interface for sync management operations
type ISyncManager interface {
	IsRunning() bool
	StartSync(ctx context.Context) error
	CancelSync() error
}

// IProgressReporter defines the interface for progress reporting
type IProgressReporter interface {
	ReportProgress(ctx context.Context, log logger.ILogger, projectName string, currentIndex, progress, totalProjects int)
	ReportCompletion(ctx context.Context, log logger.ILogger, totalProjects int)
	ReportCancellation(ctx context.Context, log logger.ILogger, projectName string, currentIndex, totalProjects int)
	ReportError(ctx context.Context, log logger.ILogger, errorMessage string)
}

// IProjectFilter defines the interface for project filtering
type IProjectFilter interface {
	ShouldProcess(project htmlparser.ProjectSummary) bool
}

type ProjectFilter interface {
	ShouldProcess(project htmlparser.ProjectSummary) bool
}
