package pkg

import (
	"fmt"
	"time"

	"github.com/web4ux/models"
)

func (a *App) ListProjects(name, creator, orderBy, direction string, offset int) models.ProjectSummaries {
	fmt.Println(name, creator, orderBy, direction, offset)

	return models.ProjectSummaries{
		Total: 3,
		Data: []models.Project{
			{
				ID:        "222",
				Creator:   "333",
				Name:      "222",
				UpdatedAt: time.Now().UTC(),
			},
		},
	}
}
