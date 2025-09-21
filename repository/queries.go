package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/sliceutils"
)

func (r *Repository) listProjects(ctx context.Context, req models.ListProjectRequest) ([]sqlc.Project, error) {
	strategyFactory := NewQueryStrategyFactory(r.queries)
	strategy := strategyFactory.CreateStrategy(req.OrderBy, req.IsASC)
	return strategy.Execute(ctx, req)
}

// ListProjects implements QueryRepository.
func (r *Repository) ListProjects(ctx context.Context, log logger.ILogger, req models.ListProjectRequest) (models.ProjectSummaries, error) {
	var result models.ProjectSummaries

	projects, err := r.listProjects(ctx, req)
	if err != nil {
		log.Error("failed to list projects", err)
		return result, err
	}

	nameFilter := req.Name + "%"
	creatorFilter := req.Creator + "%"
	count, err := r.queries.CountProjects(ctx, sqlc.CountProjectsParams{
		Name:    nameFilter,
		Creator: creatorFilter,
	})
	if err != nil {
		log.Error("failed to count projects", err)
		return result, err
	}

	result.Total = count
	result.Data = sliceutils.Map(projects, func(in sqlc.Project) models.Project {
		updatedAt, err := common.ParseTimeRFC3339(in.UpdatedAt)
		if err != nil {
			log.Error("failed to parse project updated_at", err, "project_id", in.ID, "updated_at", in.UpdatedAt)
			// Use zero time as fallback
			updatedAt = time.Time{}
		}

		return models.Project{
			ID:        in.ID,
			Name:      in.Name,
			Creator:   in.Creator,
			UpdatedAt: updatedAt,
		}
	})

	return result, nil
}

// FindProject implements QueryRepository.
func (r *Repository) FindProject(ctx context.Context, log logger.ILogger, id string) (models.Project, error) {
	output, err := r.queries.FindProject(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Info("project not found", "project_id", id)
			return models.Project{}, nil
		}

		log.Error("failed to find project", err, "project_id", id)
		return models.Project{}, err
	}

	updatedAt, err := common.ParseTimeRFC3339(output.UpdatedAt)
	if err != nil {
		log.Error("failed to parse project updated_at", err, "project_id", output.ID, "updated_at", output.UpdatedAt)
		// Use zero time as fallback
		updatedAt = time.Time{}
	}

	return models.Project{
		ID:        output.ID,
		Name:      output.Name,
		Creator:   output.Creator,
		UpdatedAt: updatedAt,
	}, nil
}

// FindProjectDetails implements QueryRepository.
func (r *Repository) FindProjectDetails(ctx context.Context, log logger.ILogger, projectID string) ([]models.ProjectDetail, error) {
	result, err := r.queries.FindProjectDetails(ctx, projectID)
	if err != nil {
		log.Error("failed to find project details", err, "project_id", projectID)
		return nil, err
	}

	return sliceutils.Map(result, func(in sqlc.FindProjectDetailsRow) models.ProjectDetail {
		return models.ProjectDetail{
			ProjectID:         in.ProjectID,
			ProjectName:       in.ProjectName,
			ProjectCreator:    in.ProjectCreator,
			ProjectUpdatedAt:  in.ProjectUpdatedAt,
			DeviceName:        in.DeviceName,
			DeviceOrder:       in.DeviceOrder,
			ParticipantName:   in.ParticipantName,
			ParticipantSerial: in.ParticipantSerial,
			InformationID:     in.InformationID,
			Deleted:           in.Deleted,
			ErrorTimes:        in.ErrorTimes,
			IsFailed:          in.IsFailed,
			TrailNumber:       in.TrailNumber,
			Mark:              in.Mark,
			Timestamp:         in.Timestamp,
			Width:             in.Width,
			Distance:          in.Distance,
			X:                 in.X,
			Y:                 in.Y,
		}
	}), nil
}
