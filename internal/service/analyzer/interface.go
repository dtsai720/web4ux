package analyzer

import (
	"context"

	"github.com/web4ux/models"
	"github.com/web4ux/src/logger"
)

type IService interface {
	ListSummaries(ctx context.Context, log logger.ILogger, req models.ListSummariesRequest) (models.ProjectSummaries, error)
	GetProjectDetailByID(ctx context.Context, log logger.ILogger, projectID string) ([]models.ProjectDetail, error)
	DeleteOrRestore(ctx context.Context, log logger.ILogger, informationID string, deleted bool) error
}
