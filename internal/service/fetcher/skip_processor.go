package fetcher

import (
	"context"
	"strings"

	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

// SkipProcessor handles projects that should be skipped (non-winfitts projects)
type SkipProcessor struct{}

// NewSkipProcessor creates a new skip processor
func NewSkipProcessor() *SkipProcessor {
	return &SkipProcessor{}
}

// Name returns the processor name
func (s *SkipProcessor) Name() string {
	return "SkipProcessor"
}

// CanProcess determines if this processor should handle the project
// This processor handles any project that's not a winfitts project
func (s *SkipProcessor) CanProcess(project htmlparser.ProjectSummary) bool {
	return !strings.Contains(strings.ToLower(project.Link), "winfitts")
}

// Process handles skipping of non-winfitts projects
func (s *SkipProcessor) Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	log.Info("Skipping non-winfitts project",
		zap.String("link", project.Link),
		zap.String("project_type", "non-winfitts"))

	// Return the specific error to indicate this project type is not supported
	// This allows the caller to distinguish between a skip and an actual error
	return errs.ErrNotWinfittsProject
}
