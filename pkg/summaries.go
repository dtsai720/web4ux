package pkg

import (
	"github.com/web4ux/models"
	"go.uber.org/zap"
)

func (a *App) ListSummaries(req models.ListSummariesRequest) models.ProjectSummaries {
	output, err := a.analyzer.ListSummaries(a.ctx, a.log, req)
	if err != nil {
		a.log.With(zap.String("error", err.Error())).Error("An error occurred while listing projects")

		return output
	}

	return output
}
