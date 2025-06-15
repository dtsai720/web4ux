package pkg

import (
	"github.com/web4ux/models"
	"go.uber.org/zap"
)

func (a *App) ListSummaries(name, creator, orderBy, direction string, offset, limit int64) models.ProjectSummaries {
	output, err := a.analyzer.ListSummaries(a.ctx, name, creator, orderBy, direction, offset, limit)
	if err != nil {
		a.log.With(zap.String("error", err.Error())).Error("An error occurred while listing projects")

		return output
	}

	return output
}
