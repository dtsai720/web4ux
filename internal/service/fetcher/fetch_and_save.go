package fetcher

import (
	"context"

	"github.com/web4ux/src/errs"
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
		return errs.ErrNotWinfittsProject
	}

	log.Info("Using processor",
		zap.String("processor_name", processor.Name()),
		zap.String("project_link", in.Link))

	err := processor.Process(ctx, log, in)
	if err == errs.ErrNotWinfittsProject {
		// This is expected for non-winfitts projects, not an actual error
		return nil
	}

	return err
}

// All processing logic has been moved to Strategy Pattern implementations.
