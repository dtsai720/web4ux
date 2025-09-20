package fetcher

import (
	"context"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

// SkipProcessor handles projects that should be skipped (non-winfitts projects)
type SkipProcessor struct {
	detector ProjectTypeDetector
}

// NewSkipProcessor creates a new skip processor
func NewSkipProcessor() *SkipProcessor {
	return &SkipProcessor{
		detector: NewDefaultProjectTypeDetector(),
	}
}

// NewSkipProcessorWithDetector creates a new skip processor with custom detector
func NewSkipProcessorWithDetector(detector ProjectTypeDetector) *SkipProcessor {
	return &SkipProcessor{
		detector: detector,
	}
}

// Name returns the processor name
func (s *SkipProcessor) Name() string {
	return "SkipProcessor"
}

// CanProcess determines if this processor should handle the project
// This processor handles any project that's not a winfitts project
func (s *SkipProcessor) CanProcess(project htmlparser.ProjectSummary) bool {
	return !s.detector.IsWinfittsProject(project)
}

// Process handles skipping of non-winfitts projects
func (s *SkipProcessor) Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	log.Info("Skipping non-winfitts project",
		zap.String("link", project.Link),
		zap.String("project_type", "non-winfitts"))

	// Return nil to indicate successful "processing" (which is skipping)
	// The fact that this processor was chosen indicates it's meant to be skipped
	return nil
}
