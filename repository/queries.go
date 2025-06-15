package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/sliceutils"
)

const defaultDirection = "desc"

func (r *Repository) listProjects(ctx context.Context, name string, creator string, orderBy string, direction string, offset, limit int64) ([]sqlc.Project, error) {
	switch orderBy {
	case "name":
		if direction == defaultDirection {
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
		if direction == defaultDirection {
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

	if direction == defaultDirection {
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
		return result, err
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

// GetProject implements IRepository.
func (r *Repository) GetProject(ctx context.Context, id string) (models.Project, error) {
	output, err := r.queries.GetProject(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.Project{}, nil
		}

		return models.Project{}, err
	}

	return models.Project{
		ID:        output.ID,
		Name:      output.Name,
		Creator:   output.Creator,
		UpdatedAt: common.Must(time.Parse(time.RFC3339, output.UpdatedAt)),
	}, nil
}

// GetProjectDetailByID implements IRepository.
func (r *Repository) GetProjectDetailByID(ctx context.Context, projectID string) ([]models.ProjectDetail, error) {
	result, err := r.queries.GetProjectDetailByID(ctx, projectID)
	if err != nil {
		return nil, err
	}

	return sliceutils.Map(result, func(in sqlc.GetProjectDetailByIDRow) models.ProjectDetail {
		return models.ProjectDetail{
			ProjectName:       in.ProjectName,
			ProjectCreator:    in.ProjectCreator,
			ProjectUpdatedAt:  in.ProjectUpdatedAt,
			DeviceName:        in.DeviceName,
			ParticipantName:   in.ParticipantName,
			ParticipantSerial: in.ParticipantSerial,
			InformationID:     in.InformationID,
			Deleted:           in.Deleted,
			ErrorTimes:        in.ErrorTimes,
			IsFailed:          in.IsFailed,
			TrailNumber:       in.TrailNumber,
			Mark:              in.Mark,
			Timestamp:         in.Timestamp,
		}
	}), nil
}
