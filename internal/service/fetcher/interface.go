package fetcher

import (
	"context"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

// IService defines the main operations for fetching and processing project data.
// This service handles authentication, project discovery, data extraction,
// and coordinating different project processors through a registry pattern.
type IService interface {
	// Login authenticates with the remote service using email and password credentials.
	// Returns an error if authentication fails due to invalid credentials or network issues.
	Login(ctx context.Context, log logger.ILogger, email, password string) error

	// ListAllProjects retrieves all available projects from the remote service.
	// Requires successful authentication before calling.
	// Returns a slice of project summaries or an error if fetching fails.
	ListAllProjects(ctx context.Context, log logger.ILogger) ([]htmlparser.ProjectSummary, error)

	// FetchDataAndSave processes and saves data for a specific project.
	// Uses the appropriate processor based on project type detection.
	// Returns an error if processing or saving fails.
	FetchDataAndSave(ctx context.Context, log logger.ILogger, in htmlparser.ProjectSummary) error

	// GetProcessorRegistry returns the registry containing all available project processors.
	// Used for managing and accessing different project type processors.
	GetProcessorRegistry() *ProjectProcessorRegistry
}

// IProjectProcessor defines the interface for processing specific project types.
// Implementations handle the extraction and transformation of project data
// based on the project's specific format and requirements.
type IProjectProcessor interface {
	// CanProcess determines if this processor can handle the given project type.
	// Returns true if the processor supports this project, false otherwise.
	CanProcess(project htmlparser.ProjectSummary) bool

	// Process extracts and processes data from the specified project.
	// Should only be called after CanProcess returns true.
	// Returns an error if processing fails.
	Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error

	// Name returns the human-readable name of this processor.
	// Used for logging and identification purposes.
	Name() string
}

// ProgressObserver defines the interface for receiving progress notifications
// during long-running fetch and processing operations.
type ProgressObserver interface {
	// OnProgress receives progress events during operation execution.
	// Events contain information about current status, completion percentage,
	// and any relevant operation metadata.
	OnProgress(event ProgressEvent)
}

// ProjectTypeDetector provides methods for identifying specific project types.
// Used by processors and the service to determine appropriate handling strategies.
type ProjectTypeDetector interface {
	// IsWinfittsProject determines if the given project is a Winfitts-type project.
	// Returns true if the project matches Winfitts format characteristics.
	IsWinfittsProject(project htmlparser.ProjectSummary) bool
}

// ProjectProcessor defines the strategy interface for processing different project types.
// This interface uses the Strategy pattern to allow different processing algorithms
// based on project characteristics and data formats.
type ProjectProcessor interface {
	// CanProcess determines if this processor can handle the given project type.
	// Returns true if the processor supports this project, false otherwise.
	CanProcess(project htmlparser.ProjectSummary) bool

	// Process extracts and processes data from the specified project.
	// Should only be called after CanProcess returns true.
	// Returns an error if processing fails.
	Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error

	// Name returns the human-readable name of this processor.
	// Used for logging and identification purposes.
	Name() string
}
