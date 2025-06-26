package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
)

// UpsertExtractWinfittsDetails implements IRepository.
func (r *Repository) UpsertExtractWinfittsDetails(ctx context.Context, project models.ProjectSummary, rows []models.WinfittsRawData) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	q := r.queries.WithTx(tx)

	if _, err := q.UpsertProject(ctx, sqlc.UpsertProjectParams{
		ID:        project.ID,
		Name:      project.Name,
		Creator:   project.Creator,
		UpdatedAt: project.Time.UTC().Format(time.RFC3339),
	}); err != nil {
		return tx.Rollback()
	}

	for _, row := range rows {
		if err := r.upsertRowDetails(ctx, q, project.ID, row); err != nil {
			return tx.Rollback()
		}
	}

	if err := tx.Commit(); err != nil {
		return tx.Rollback()
	}

	return nil
}

func (r *Repository) upsertRowDetails(ctx context.Context, q *sqlc.Queries, projectID string, row models.WinfittsRawData) error {
	device, err := q.UpsertDevices(ctx, sqlc.UpsertDevicesParams{
		ID:        uuid.NewString(),
		ProjectID: projectID,
		Name:      row.DeviceName,
	})
	if err != nil {
		return err
	}

	participant, err := q.UpsertParticipants(ctx, sqlc.UpsertParticipantsParams{
		ID:        uuid.NewString(),
		Name:      row.Participant,
		ProjectID: projectID,
		Serial:    row.ParticipantSerial,
	})
	if err != nil {
		return err
	}

	winfitts, err := q.UpsertWinfitts(ctx, sqlc.UpsertWinfittsParams{
		ID:            uuid.NewString(),
		ProjectID:     projectID,
		DeviceID:      device.ID,
		ParticipantID: participant.ID,
	})
	if err != nil {
		return err
	}

	for _, item := range row.Items {
		if err := r.upsertItemDetails(ctx, q, winfitts.ID, item); err != nil {
			return err
		}
	}

	return nil
}

func (r *Repository) upsertItemDetails(ctx context.Context, q *sqlc.Queries, winfittsID string, item models.WinfittsSummary) error {
	information, err := q.UpsertWinfittsInformation(ctx, sqlc.UpsertWinfittsInformationParams{
		ID:          uuid.NewString(),
		WinfittsID:  winfittsID,
		TrailNumber: int64(item.TrailNumber),
		Width:       int64(item.Width),
		Distance:    int64(item.Distance),
		Angle:       int64(item.Angle),
		IsFailed:    item.IsFailed,
		ErrorTimes:  int64(item.ErrorTimes),
		Deleted:     false,
	})
	if err != nil {
		return err
	}

	for _, detail := range item.Details {
		_, err := q.UpsertWinfittsDetail(ctx, sqlc.UpsertWinfittsDetailParams{
			ID:            uuid.NewString(),
			InformationID: information.ID,
			Mark:          detail.Mark,
			X:             int64(detail.Position.X),
			Y:             int64(detail.Position.Y),
			Timestamp:     int64(detail.Timestamp),
		})
		if err != nil {
			return err
		}
	}

	return nil
}
