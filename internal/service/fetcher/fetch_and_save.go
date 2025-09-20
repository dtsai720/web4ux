package fetcher

import (
	"context"
	"fmt"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

// FetchDataAndSave implements IService using Strategy Pattern.
func (s *Service) FetchDataAndSave(ctx context.Context, logger logger.ILogger, in htmlparser.ProjectSummary) error {
	log := logger.With(zap.String("project_id", in.ID), zap.String("project_name", in.Name))

	// Find appropriate processor using Strategy Pattern
	processor := s.processorRegistry.FindProcessor(in)
	if processor == nil {
		log.Info("No processor found for project", zap.String("link", in.Link))
		return fmt.Errorf("no processor available for project: %s", in.Link)
	}

	log.Info("Using processor",
		zap.String("processor_name", processor.Name()),
		zap.String("project_link", in.Link))

	// Process the project - both successful processing and skipping return nil
	return processor.Process(ctx, log, in)
}

// All processing logic has been moved to Strategy Pattern implementations.
