package fetcher

import (
	"context"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

type IService interface {
	Login(ctx context.Context, log logger.ILogger, email, password string) error
	ListAllProjects(ctx context.Context, log logger.ILogger) ([]htmlparser.ProjectSummary, error)
	FetchDataAndSave(ctx context.Context, log logger.ILogger, in htmlparser.ProjectSummary) error
	GetProcessorRegistry() *ProjectProcessorRegistry
}

type IProjectProcessor interface {
	CanProcess(project htmlparser.ProjectSummary) bool
	Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error
	Name() string
}

type ProgressObserver interface {
	OnProgress(event ProgressEvent)
}

type ProjectTypeDetector interface {
	IsWinfittsProject(project htmlparser.ProjectSummary) bool
}

// ProjectProcessor defines the strategy interface for processing different project types
type ProjectProcessor interface {
	CanProcess(project htmlparser.ProjectSummary) bool
	Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error
	Name() string
}
