package pkg_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/pkg"
)

func TestNewProgressReporter(t *testing.T) {
	reporter := pkg.NewProgressReporter()

	assert.NotNil(t, reporter)
}

func TestProgressReporter_ImplementsInterface(t *testing.T) {
	// Test that ProgressReporter implements IProgressReporter interface
	var _ pkg.IProgressReporter = (*pkg.ProgressReporter)(nil)

	// Test constructor returns correct type
	reporter := pkg.NewProgressReporter()

	assert.NotNil(t, reporter)
	assert.IsType(t, &pkg.ProgressReporter{}, reporter)
}

func TestSyncProgress_Structure(t *testing.T) {
	// Test SyncProgress struct can be created and has expected fields
	progress := pkg.SyncProgress{
		CurrentProject: "Test Project",
		CurrentIndex:   5,
		Progress:       50,
		TotalProjects:  10,
		IsCompleted:    false,
		IsCancelled:    false,
	}

	assert.Equal(t, "Test Project", progress.CurrentProject)
	assert.Equal(t, 5, progress.CurrentIndex)
	assert.Equal(t, 50, progress.Progress)
	assert.Equal(t, 10, progress.TotalProjects)
	assert.False(t, progress.IsCompleted)
	assert.False(t, progress.IsCancelled)
}

func TestSyncProgress_CompletionState(t *testing.T) {
	// Test SyncProgress for completion scenarios
	completedProgress := pkg.SyncProgress{
		CurrentProject: "All projects completed",
		Progress:       100,
		TotalProjects:  5,
		IsCompleted:    true,
		IsCancelled:    false,
	}

	assert.Equal(t, "All projects completed", completedProgress.CurrentProject)
	assert.Equal(t, 100, completedProgress.Progress)
	assert.True(t, completedProgress.IsCompleted)
	assert.False(t, completedProgress.IsCancelled)
}

func TestSyncProgress_CancellationState(t *testing.T) {
	// Test SyncProgress for cancellation scenarios
	cancelledProgress := pkg.SyncProgress{
		CurrentProject: "Project 3",
		Progress:       30,
		TotalProjects:  10,
		IsCompleted:    false,
		IsCancelled:    true,
	}

	assert.Equal(t, "Project 3", cancelledProgress.CurrentProject)
	assert.Equal(t, 30, cancelledProgress.Progress)
	assert.False(t, cancelledProgress.IsCompleted)
	assert.True(t, cancelledProgress.IsCancelled)
}

// NOTE: The actual method tests for ReportProgress, ReportCompletion,
// ReportCancellation, and ReportError are not included here because they
// rely on Wails runtime.EventsEmit which requires a specific Wails context
// and will cause log.Fatal in test environments.
//
// These methods can be tested in integration tests with a proper Wails
// application context, or by creating a testable version that accepts
// an event emitter as a dependency.
