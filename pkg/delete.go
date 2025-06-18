package pkg

import "go.uber.org/zap"

type Request struct {
	Device      string
	Participant string
	Trail       int
}

// TODO:
func (a *App) DeleteOrRestore(projectID string, informationID string, deleted bool) string {
	if err := a.analyzer.DeleteOrRestore(a.ctx, informationID, deleted); err != nil {
		a.log.With(zap.Error(err)).Error("An error occurred while delete or restore")
	}

	return ""
}
