package analyzer

import (
	"context"

	"github.com/web4ux/models"
	"github.com/web4ux/src/logger"
)

// GetProjectDetailByID implements IService.
func (s *Service) GetProjectDetailByID(ctx context.Context, log logger.ILogger, projectID string) ([]models.ProjectDetail, error) {
	return s.db.FindProjectDetails(ctx, log, projectID)
}
