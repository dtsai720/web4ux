package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/logger"
)

// rollbackWithError handles transaction rollback and returns combined error
func rollbackWithError(tx *sql.Tx, originalErr error) error {
	if rollbackErr := tx.Rollback(); rollbackErr != nil {
		return fmt.Errorf("transaction failed: %w; rollback failed: %v", originalErr, rollbackErr)
	}
	return originalErr
}

// UpsertExtractWinfittsDetails implements CommandRepository.
//
//nolint:cyclop
func (r *Repository) UpsertExtractWinfittsDetails(ctx context.Context, log logger.ILogger, project models.ProjectSummary, rows []models.WinfittsRawData) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		log.Error("failed to begin transaction", err)
		return err
	}
	q := r.queries.WithTx(tx)

	if _, err := q.UpsertProject(ctx, mapToUpsertProjectParams(project)); err != nil {
		log.Error("failed to upsert project", err, "project_id", project.ID)
		return rollbackWithError(tx, err)
	}

	for _, row := range rows {
		device, err := q.UpsertDevices(ctx, mapToUpsertDevicesParams(project, row))
		if err != nil {
			log.Error("failed to upsert device", err, "device_name", row.DeviceName, "project_id", project.ID)
			return rollbackWithError(tx, err)
		}

		participant, err := q.UpsertParticipants(ctx, mapToUpsertParticipantsParams(project, row))
		if err != nil {
			log.Error("failed to upsert participant", err, "participant_name", row.Participant, "project_id", project.ID)
			return rollbackWithError(tx, err)
		}

		winfitts, err := q.UpsertWinfitts(ctx, mapToUpsertWinfittsParams(project.ID, device.ID, participant.ID))
		if err != nil {
			log.Error("failed to upsert winfitts", err, "project_id", project.ID, "device_id", device.ID, "participant_id", participant.ID)
			return rollbackWithError(tx, err)
		}

		for _, item := range row.Items {
			information, err := q.UpsertWinfittsInformation(ctx, mapToUpsertWinfittsInformationParams(winfitts, item))
			if err != nil {
				log.Error("failed to upsert winfitts information", err, "trail_number", item.TrailNumber, "project_id", project.ID)
				return rollbackWithError(tx, err)
			}

			for _, detail := range item.Details {
				_, err := q.UpsertWinfittsDetail(ctx, mapToUpsertWinfittsDetail(information.ID, detail))
				if err != nil {
					log.Error("failed to upsert winfitts detail", err, "information_id", information.ID, "timestamp", detail.Timestamp)
					return rollbackWithError(tx, err)
				}
			}
		}
	}

	if err := tx.Commit(); err != nil {
		log.Error("failed to commit transaction", err, "project_id", project.ID)
		return rollbackWithError(tx, err)
	}

	return nil
}

// SoftDeleteWinfittsInformation implements CommandRepository.
func (r *Repository) SoftDeleteWinfittsInformation(ctx context.Context, log logger.ILogger, arg sqlc.SoftDeleteWinfittsInformationParams) error {
	if err := r.queries.SoftDeleteWinfittsInformation(ctx, arg); err != nil {
		log.Error("failed to soft delete winfitts information", err, "information_id", arg.InformationID)
		return err
	}
	return nil
}
