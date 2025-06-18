package analyzer

import (
	"context"

	"github.com/web4ux/models"
)

type IService interface {
	ListSummaries(ctx context.Context, name, creator, orderBy, direction string, offset, limit int64) (models.ProjectSummaries, error)
	GetProjectDetailByID(ctx context.Context, projectID string) ([]models.ProjectDetail, error)
	DeleteOrRestore(ctx context.Context, informationID string, deleted bool) error
}
