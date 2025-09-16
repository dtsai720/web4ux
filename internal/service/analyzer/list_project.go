package analyzer

import (
	"context"

	"github.com/web4ux/models"
	"github.com/web4ux/src/logger"
)

// ListProjects implements IService.
func (s *Service) ListSummaries(ctx context.Context, log logger.ILogger, name string, creator string, orderBy string, direction string, offset, limit int64) (models.ProjectSummaries, error) {
	isASC := direction == "asc"
	req := models.ListProjectRequest{
		Name:    name,
		Creator: creator,
		OrderBy: orderBy,
		IsASC:   isASC,
		Offset:  offset,
		Limit:   limit,
	}
	return s.db.ListProjects(ctx, log, req)
}
