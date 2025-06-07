package repository

import (
	"context"
	"database/sql"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
)

type IDatabase interface {
	UpsertProject(ctx context.Context, arg sqlc.UpsertProjectParams) (sqlc.Project, error)
	UpsertDevices(ctx context.Context, arg sqlc.UpsertDevicesParams) (sqlc.Device, error)
	UpsertParticipants(ctx context.Context, arg sqlc.UpsertParticipantsParams) (sqlc.Participant, error)
	UpsertWinfitts(ctx context.Context, arg sqlc.UpsertWinfittsParams) (sqlc.Winfitt, error)
	UpsertWinfittsDetail(ctx context.Context, arg sqlc.UpsertWinfittsDetailParams) (sqlc.WinfittsDetail, error)
	UpsertWinfittsInformation(ctx context.Context, arg sqlc.UpsertWinfittsInformationParams) (sqlc.WinfittsInformation, error)
	ListProjects(ctx context.Context, arg sqlc.ListProjectsParams) ([]sqlc.Project, error)
	CreateUser(ctx context.Context, arg sqlc.CreateUserParams) (string, error)
	ListUsers(ctx context.Context, uid string) ([]sqlc.User, error)
	WithTx(tx *sql.Tx) *sqlc.Queries
}

type IRepository interface {
	UpsertProject(ctx context.Context, arg *models.ProjectSummary) (sqlc.Project, error)
	// UpsertExtractWinfittsDetail(ctx context.Context, id string, in *models.WinfittsRawData) error
	UpsertExtractWinfittsDetails(ctx context.Context, in models.ProjectSummary, rows []models.WinfittsRawData) error
}
