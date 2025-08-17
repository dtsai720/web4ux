package repository

import (
	"context"

	"github.com/web4ux/models"
)

// UpsertExtractWinfittsDetails implements IRepository.
//
//nolint:cyclop
func (r *Repository) UpsertExtractWinfittsDetails(ctx context.Context, project models.ProjectSummary, rows []models.WinfittsRawData) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	q := r.queries.WithTx(tx)

	if _, err := q.UpsertProject(ctx, mapToUpsertProjectParams(project)); err != nil {
		return tx.Rollback()
	}

	for _, row := range rows {
		device, err := q.UpsertDevices(ctx, mapToUpsertDevicesParams(project, row.DeviceName))
		if err != nil {
			return tx.Rollback()
		}

		participant, err := q.UpsertParticipants(ctx, mapToUpsertParticipantsParams(project, row))
		if err != nil {
			return tx.Rollback()
		}

		winfitts, err := q.UpsertWinfitts(ctx, mapToUpsertWinfittsParams(project.ID, device.ID, participant.ID))
		if err != nil {
			return tx.Rollback()
		}

		for _, item := range row.Items {
			information, err := q.UpsertWinfittsInformation(ctx, mapToUpsertWinfittsInformationParams(winfitts, item))
			if err != nil {
				return tx.Rollback()
			}

			for _, detail := range item.Details {
				_, err := q.UpsertWinfittsDetail(ctx, mapToUpsertWinfittsDetail(information.ID, detail))
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
