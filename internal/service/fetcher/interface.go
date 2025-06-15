package fetcher

import (
	"context"

	"github.com/web4ux/models"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

type IService interface {
	Login(ctx context.Context, log logger.ILogger, email, password string) error
	ListAllProjects(ctx context.Context, log logger.ILogger) ([]htmlparser.ProjectSummary, error)
	FetchDataAndSave(ctx context.Context, log logger.ILogger, in htmlparser.ProjectSummary) error
	ListProjects(ctx context.Context, name, creator, orderBy, direction string, offset, limit int64) (models.ProjectSummaries, error)
}
