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
		device, err := q.UpsertDevices(ctx, sqlc.UpsertDevicesParams{
			ID:        uuid.NewString(),
			ProjectID: project.ID,
			Name:      row.DeviceName,
		})
		if err != nil {
			return tx.Rollback()
		}

		participant, err := q.UpsertParticipants(ctx, sqlc.UpsertParticipantsParams{
			ID:        uuid.NewString(),
			Name:      row.Participant,
			ProjectID: project.ID,
			Serial:    row.ParticipantSerial,
		})
		if err != nil {
			return tx.Rollback()
		}

		winfitts, err := q.UpsertWinfitts(ctx, sqlc.UpsertWinfittsParams{
			ID:            uuid.NewString(),
			ProjectID:     project.ID,
			DeviceID:      device.ID,
			ParticipantID: participant.ID,
		})
		if err != nil {
			return tx.Rollback()
		}

		for _, item := range row.Items {
			trail := CalculateTrails(item.Details)
			information, err := q.UpsertWinfittsInformation(ctx, sqlc.UpsertWinfittsInformationParams{
				ID:          uuid.NewString(),
				WinfittsID:  winfitts.ID,
				TrailNumber: int64(item.TrailNumber),
				Width:       int64(item.Width),
				Distance:    int64(item.Distance),
				Angle:       int64(item.Angle),
				IsFailed:    item.IsFailed,
				ErrorTimes:  int64(item.ErrorTimes),
				Deleted:     false,
				IsAvailable: trail.IsAvailable,
			})
			if err != nil {
				return tx.Rollback()
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
					return tx.Rollback()
				}
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return tx.Rollback()
	}

	return nil
}
