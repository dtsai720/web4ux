package analyzer

import (
	"context"

	"github.com/web4ux/models"
)

// GetProjectDetailByID implements IService.
func (s *Service) GetProjectDetailByID(ctx context.Context, projectID string) ([]models.ProjectDetail, error) {
	return s.db.GetProjectDetailByID(ctx, projectID)
}
