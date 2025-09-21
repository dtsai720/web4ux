package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/logger"
)

// UpsertExtractWinfittsDetails implements CommandRepository.
func (r *Repository) UpsertExtractWinfittsDetails(ctx context.Context, log logger.ILogger, project models.ProjectSummary, rows []models.WinfittsRawData) error {
	processor := &WinfittsDataProcessor{
		project: project,
		rows:    rows,
		log:     log,
	}

	txManager := NewTransactionManager(r.db)
	return txManager.ExecuteInTransaction(ctx, log, processor.Process)
}

type WinfittsDataProcessor struct {
	project models.ProjectSummary
	rows    []models.WinfittsRawData
	log     logger.ILogger
}

func (p *WinfittsDataProcessor) Process(ctx context.Context, tx *sql.Tx) error {
	queries := p.createQueries(tx)

	if err := p.upsertProject(ctx, queries); err != nil {
		return err
	}

	return p.processWinfittsRows(ctx, queries)
}

func (p *WinfittsDataProcessor) createQueries(tx *sql.Tx) *sqlc.Queries {
	return sqlc.New(nil).WithTx(tx)
}

func (p *WinfittsDataProcessor) upsertProject(ctx context.Context, q *sqlc.Queries) error {
	if _, err := q.UpsertProject(ctx, mapToUpsertProjectParams(p.project)); err != nil {
		p.log.Error("failed to upsert project", err, "project_id", p.project.ID)
		return fmt.Errorf("failed to upsert project %s: %w", p.project.ID, err)
	}
	return nil
}

func (p *WinfittsDataProcessor) processWinfittsRows(ctx context.Context, q *sqlc.Queries) error {
	for _, row := range p.rows {
		if err := p.processWinfittsRow(ctx, q, row); err != nil {
			return err
		}
	}
	return nil
}

func (p *WinfittsDataProcessor) processWinfittsRow(ctx context.Context, q *sqlc.Queries, row models.WinfittsRawData) error {
	device, err := p.upsertDevice(ctx, q, row)
	if err != nil {
		return err
	}

	participant, err := p.upsertParticipant(ctx, q, row)
	if err != nil {
		return err
	}

	winfitts, err := p.upsertWinfitts(ctx, q, device.ID, participant.ID)
	if err != nil {
		return err
	}

	return p.processItems(ctx, q, winfitts, row.Items)
}

func (p *WinfittsDataProcessor) upsertDevice(ctx context.Context, q *sqlc.Queries, row models.WinfittsRawData) (sqlc.Device, error) {
	device, err := q.UpsertDevices(ctx, mapToUpsertDevicesParams(p.project, row))
	if err != nil {
		p.log.Error("failed to upsert device", err, "device_name", row.DeviceName, "project_id", p.project.ID)
		return sqlc.Device{}, fmt.Errorf("failed to upsert device %s: %w", row.DeviceName, err)
	}
	return device, nil
}

func (p *WinfittsDataProcessor) upsertParticipant(ctx context.Context, q *sqlc.Queries, row models.WinfittsRawData) (sqlc.Participant, error) {
	participant, err := q.UpsertParticipants(ctx, mapToUpsertParticipantsParams(p.project, row))
	if err != nil {
		p.log.Error("failed to upsert participant", err, "participant_name", row.Participant, "project_id", p.project.ID)
		return sqlc.Participant{}, fmt.Errorf("failed to upsert participant %s: %w", row.Participant, err)
	}
	return participant, nil
}

func (p *WinfittsDataProcessor) upsertWinfitts(ctx context.Context, q *sqlc.Queries, deviceID, participantID string) (sqlc.Winfitt, error) {
	winfitts, err := q.UpsertWinfitts(ctx, mapToUpsertWinfittsParams(p.project.ID, deviceID, participantID))
	if err != nil {
		p.log.Error("failed to upsert winfitts", err, "project_id", p.project.ID, "device_id", deviceID, "participant_id", participantID)
		return sqlc.Winfitt{}, fmt.Errorf("failed to upsert winfitts: %w", err)
	}
	return winfitts, nil
}

func (p *WinfittsDataProcessor) processItems(ctx context.Context, q *sqlc.Queries, winfitts sqlc.Winfitt, items []models.WinfittsSummary) error {
	for _, item := range items {
		if err := p.processItem(ctx, q, winfitts, item); err != nil {
			return err
		}
	}
	return nil
}

func (p *WinfittsDataProcessor) processItem(ctx context.Context, q *sqlc.Queries, winfitts sqlc.Winfitt, item models.WinfittsSummary) error {
	information, err := q.UpsertWinfittsInformation(ctx, mapToUpsertWinfittsInformationParams(winfitts, item))
	if err != nil {
		p.log.Error("failed to upsert winfitts information", err, "trail_number", item.TrailNumber, "project_id", p.project.ID)
		return fmt.Errorf("failed to upsert winfitts information for trail %d: %w", item.TrailNumber, err)
	}

	return p.processDetails(ctx, q, information.ID, item.Details)
}

func (p *WinfittsDataProcessor) processDetails(ctx context.Context, q *sqlc.Queries, informationID string, details []models.WinfittsDetail) error {
	for _, detail := range details {
		if _, err := q.UpsertWinfittsDetail(ctx, mapToUpsertWinfittsDetail(informationID, detail)); err != nil {
			p.log.Error("failed to upsert winfitts detail", err, "information_id", informationID, "timestamp", detail.Timestamp)
			return fmt.Errorf("failed to upsert winfitts detail for timestamp %d: %w", detail.Timestamp, err)
		}
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
