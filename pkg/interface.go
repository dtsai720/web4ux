package pkg

import (
	"context"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

// ISyncManager defines the interface for managing synchronization operations
// between the local database and remote data sources.
// It provides thread-safe operations for starting, stopping, and monitoring sync status.
type ISyncManager interface {
	// IsRunning returns true if a synchronization operation is currently in progress.
	// This method is thread-safe and can be called concurrently.
	IsRunning() bool

	// StartSync begins a new synchronization operation with the remote data source.
	// Only one sync operation can run at a time. Returns an error if a sync is already running
	// or if the operation fails to start.
	StartSync(ctx context.Context) error

	// CancelSync requests cancellation of the currently running synchronization operation.
	// Returns an error if no sync is running or if cancellation fails.
	// The actual cancellation may take some time to complete.
	CancelSync() error
}

// IProgressReporter defines the interface for reporting progress during long-running operations.
// Implementations should handle progress updates, completion notifications, and error reporting
// in a thread-safe manner suitable for concurrent operations.
type IProgressReporter interface {
	// ReportProgress reports progress during an ongoing operation.
	// projectName identifies the current item being processed.
	// currentIndex is the zero-based index of the current item.
	// progress indicates completion percentage (0-100).
	// totalProjects is the total number of items to process.
	ReportProgress(ctx context.Context, log logger.ILogger, projectName string, currentIndex, progress, totalProjects int)

	// ReportCompletion notifies that an operation has completed successfully.
	// totalProjects indicates the total number of items that were processed.
	ReportCompletion(ctx context.Context, log logger.ILogger, totalProjects int)

	// ReportCancellation notifies that an operation was cancelled before completion.
	// projectName identifies the item being processed when cancellation occurred.
	// currentIndex and totalProjects provide context about the cancellation point.
	ReportCancellation(ctx context.Context, log logger.ILogger, projectName string, currentIndex, totalProjects int)

	// ReportError notifies that an error occurred during the operation.
	// errorMessage contains details about the error for user notification.
	ReportError(ctx context.Context, log logger.ILogger, errorMessage string)
}

// IProjectFilter defines the interface for filtering projects during processing operations.
// Implementations determine which projects should be processed based on various criteria
// such as project type, status, or other business rules.
type IProjectFilter interface {
	// ShouldProcess determines whether the given project should be processed.
	// Returns true if the project meets the filtering criteria, false otherwise.
	// This method should be stateless and thread-safe.
	ShouldProcess(project htmlparser.ProjectSummary) bool
}

// ProjectFilter defines the interface for filtering projects during processing operations.
// This interface is kept for backward compatibility with existing code.
// New code should use IProjectFilter instead.
type ProjectFilter interface {
	// ShouldProcess determines whether the given project should be processed.
	// Returns true if the project meets the filtering criteria, false otherwise.
	// This method should be stateless and thread-safe.
	ShouldProcess(project htmlparser.ProjectSummary) bool
}
