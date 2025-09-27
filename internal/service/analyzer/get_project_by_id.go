package analyzer

import (
	"context"
	"strings"

	"github.com/web4ux/models"
	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/logger"
)

// GetProjectDetailByID implements IService.
func (s *Service) GetProjectDetailByID(ctx context.Context, log logger.ILogger, projectID string) ([]models.ProjectDetail, error) {
	const op = "analyzer.Service.GetProjectDetailByID"

	// Validate input parameters
	if strings.TrimSpace(projectID) == "" {
		return nil, errs.NewValidationError(op, "projectID cannot be empty")
	}

	// Attempt to find project details
	details, err := s.db.FindProjectDetails(ctx, log, projectID)
	if err != nil {
		// Wrap database errors with operation context
		return nil, errs.NewDatabaseError(op, err)
	}

	// Check if project exists (no details found)
	if len(details) == 0 {
		return nil, errs.NewNotFoundError(op, "project")
	}

	return details, nil
}
