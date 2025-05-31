package repository

import (
	"context"
	"database/sql"
	_ "embed"
	"time"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
)

//go:embed schema.sql
var createTableQuery string

var _ IRepository = (*Repository)(nil)

type Repository struct {
	db      *sql.DB
	queries IDatabase
}

// UpsertWinfitts implements IRepository.
func (r *Repository) UpsertWinfitts(ctx context.Context, projectID string, in models.WinfittsResult) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	q := r.queries.WithTx(tx)

	device, err := q.UpsertDevices(ctx, sqlc.UpsertDevicesParams{
		ID:        uuid.NewString(),
		ProjectID: projectID,
		Name:      in.DeviceName,
	})
	if err != nil {
		return tx.Rollback()
	}
	participant, err := q.UpsertParticipants(ctx, sqlc.UpsertParticipantsParams{
		ID:        uuid.NewString(),
		Name:      in.Participant,
		ProjectID: projectID,
	})
	if err != nil {
		return tx.Rollback()
	}

	winfitts, err := q.UpsertWinfitts(ctx, sqlc.UpsertWinfittsParams{
		ID:            uuid.NewString(),
		ProjectID:     projectID,
		DeviceID:      device,
		ParticipantID: participant,
	})
	if err != nil {
		return tx.Rollback()
	}
	for _, item := range in.Items {
		information, err := q.UpsertWinfittsInformation(ctx, sqlc.UpsertWinfittsInformationParams{
			ID:          uuid.NewString(),
			WinfittsID:  winfitts,
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
				InformationID: information,
				Mark:          detail.Mark,
				X:             int64(detail.Position.X),
				Y:             int64(detail.Position.Y),
				CreatedAt:     detail.CreatedAt.UTC().Format(time.RFC3339),
			})
			if err != nil {
				return tx.Rollback()
			}
		}
	}

	return tx.Commit()
}

// UpsertProject implements IRepository.
func (r *Repository) UpsertProject(ctx context.Context, arg models.ProjectListResult) (string, error) {
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
