package repository

import (
	"context"
	"time"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/sliceutils"
)

func (r *Repository) listProjects(ctx context.Context, name string, creator string, orderBy string, direction string, offset, limit int64) ([]sqlc.Project, error) {
	switch orderBy {
	case "name":
		if direction == "desc" {
			return r.queries.ListProjectsOrderByNameDesc(ctx, sqlc.ListProjectsOrderByNameDescParams{
				Name:    name,
				Creator: creator,
				Offset:  offset,
				Limit:   limit,
			})
		}
		return r.queries.ListProjectsOrderByNameAsc(ctx, sqlc.ListProjectsOrderByNameAscParams{
			Name:    name,
			Creator: creator,
			Offset:  offset,
			Limit:   limit,
		})
	case "creator":
		if direction == "desc" {
			return r.queries.ListProjectsOrderByCreatorDesc(ctx, sqlc.ListProjectsOrderByCreatorDescParams{
				Name:    name,
				Creator: creator,
				Offset:  offset,
				Limit:   limit,
			})
		}
		return r.queries.ListProjectsOrderByCreatorAsc(ctx, sqlc.ListProjectsOrderByCreatorAscParams{
			Name:    name,
			Creator: creator,
			Offset:  offset,
			Limit:   limit,
		})
	}

	if direction == "desc" {
		return r.queries.ListProjectsOrderByUpdatedAtDesc(ctx, sqlc.ListProjectsOrderByUpdatedAtDescParams{
			Name:    name,
			Creator: creator,
			Offset:  offset,
			Limit:   limit,
		})
	}

	return r.queries.ListProjectsOrderByUpdatedAtAsc(ctx, sqlc.ListProjectsOrderByUpdatedAtAscParams{
		Name:    name,
		Creator: creator,
		Offset:  offset,
		Limit:   limit,
	})
}

// ListProjects implements IRepository.
func (r *Repository) ListProjects(ctx context.Context, name string, creator string, orderBy string, direction string, offset, limit int64) (models.ProjectSummaries, error) {
	var result models.ProjectSummaries
	name += "%"
	creator += "%"
	output, err := r.listProjects(ctx, name, creator, orderBy, direction, offset, limit)
	if err != nil {
		return result, err
	}

	count, err := r.queries.CountProjects(ctx, sqlc.CountProjectsParams{
		Name:    name,
		Creator: creator,
	})
	if err != nil {
		return result, nil
	}

	result.Total = count
	result.Data = sliceutils.Map(output, func(in sqlc.Project) models.Project {
		return models.Project{
			ID:        in.ID,
			Name:      in.Name,
			Creator:   in.Creator,
			UpdatedAt: common.Must(time.Parse(time.RFC3339, in.UpdatedAt)),
		}
	})

	return result, nil
}
