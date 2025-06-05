package repository

import (
	"context"
	"database/sql"
	_ "embed"
	"time"

	"github.com/google/uuid"
	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var createTableQuery string

var _ IRepository = (*Repository)(nil)

type Repository struct {
	db      *sql.DB
	queries IDatabase
}

// UpsertExtractWinfittsDetails implements IRepository.
func (r *Repository) UpsertExtractWinfittsDetails(ctx context.Context, id string, rows []models.WinfittsRawData) error {
	for _, row := range rows {
		if err := r.UpsertExtractWinfittsDetail(ctx, id, &row); err != nil {
			return err
		}
	}

	return nil
}

// UpsertWinfitts implements IRepository.
//
//nolint:funlen
func (r *Repository) UpsertExtractWinfittsDetail(ctx context.Context, id string, in *models.WinfittsRawData) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	q := r.queries.WithTx(tx)
	device, err := r.queries.UpsertDevices(ctx, sqlc.UpsertDevicesParams{
		ID:        uuid.NewString(),
		ProjectID: id,
		Name:      in.DeviceName,
	})
	if err != nil {
		return tx.Rollback()
	}

	participant, err := r.queries.UpsertParticipants(ctx, sqlc.UpsertParticipantsParams{
		ID:        uuid.NewString(),
		Name:      in.Participant,
		ProjectID: id,
	})
	if err != nil {
		return tx.Rollback()
	}

	winfitts, err := r.queries.UpsertWinfitts(ctx, sqlc.UpsertWinfittsParams{
		ID:            uuid.NewString(),
		ProjectID:     id,
		DeviceID:      device.ID,
		ParticipantID: participant.ID,
	})
	if err != nil {
		return tx.Rollback()
	}

	for _, item := range in.Items {
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

	if err := tx.Commit(); err != nil {
		return tx.Rollback()
	}

	return nil
}

// UpsertProject implements IRepository.
func (r *Repository) UpsertProject(ctx context.Context, arg *models.ProjectSummary) (sqlc.Project, error) {
	return r.queries.UpsertProject(ctx, sqlc.UpsertProjectParams{
		ID:        arg.ID,
		Name:      arg.Name,
		Creator:   arg.Creator,
		UpdatedAt: arg.Time.UTC().Format(time.RFC3339),
	})
}

func New(db *sql.DB) (*Repository, error) {
	if _, err := db.Exec(createTableQuery); err != nil {
		return nil, err
	}

	return &Repository{db: db, queries: sqlc.New(db)}, nil
}
