package pkg

import "github.com/web4ux/models"

func (a *App) GetProjectDetailByID(projectID string) []models.ProjectDetail {
	output, err := a.analyzer.GetProjectDetailByID(a.ctx, projectID)
	if err != nil {
		a.log.Errorf("An error occurred while getting project by id: %s", err)

		return nil
	}

	return output
}
