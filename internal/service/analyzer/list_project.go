package analyzer

import (
	"context"

	"github.com/web4ux/models"
	"github.com/web4ux/src/logger"
)

// ListProjects implements IService.
func (s *Service) ListSummaries(ctx context.Context, log logger.ILogger, req models.ListSummariesRequest) (models.ProjectSummaries, error) {
	isASC := req.Direction == "asc"
	dbReq := models.ListProjectRequest{
		Name:    req.Name,
		Creator: req.Creator,
		OrderBy: req.OrderBy,
		IsASC:   isASC,
		Offset:  req.Offset,
		Limit:   req.Limit,
	}
	return s.db.ListProjects(ctx, log, dbReq)
}
