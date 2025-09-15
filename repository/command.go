package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/web4ux/models"
)

// rollbackWithError handles transaction rollback and returns combined error
func rollbackWithError(tx *sql.Tx, originalErr error) error {
	if rollbackErr := tx.Rollback(); rollbackErr != nil {
		return fmt.Errorf("transaction failed: %w; rollback failed: %v", originalErr, rollbackErr)
	}
	return originalErr
}

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
		return rollbackWithError(tx, err)
	}

	for _, row := range rows {
		device, err := q.UpsertDevices(ctx, mapToUpsertDevicesParams(project, row))
		if err != nil {
			return rollbackWithError(tx, err)
		}

		participant, err := q.UpsertParticipants(ctx, mapToUpsertParticipantsParams(project, row))
		if err != nil {
			return rollbackWithError(tx, err)
		}

		winfitts, err := q.UpsertWinfitts(ctx, mapToUpsertWinfittsParams(project.ID, device.ID, participant.ID))
		if err != nil {
			return rollbackWithError(tx, err)
		}

		for _, item := range row.Items {
			information, err := q.UpsertWinfittsInformation(ctx, mapToUpsertWinfittsInformationParams(winfitts, item))
			if err != nil {
				return rollbackWithError(tx, err)
			}

			for _, detail := range item.Details {
				_, err := q.UpsertWinfittsDetail(ctx, mapToUpsertWinfittsDetail(information.ID, detail))
				if err != nil {
					return rollbackWithError(tx, err)
				}
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return rollbackWithError(tx, err)
	}

	return nil
}
