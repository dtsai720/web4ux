package analyzer

import (
	"context"

	"github.com/web4ux/models"
)

// ListProjects implements IService.
func (s *Service) ListSummaries(ctx context.Context, name string, creator string, orderBy string, direction string, offset, limit int64) (models.ProjectSummaries, error) {
	return s.db.ListProjects(ctx, name, creator, orderBy, direction, offset, limit)
}
