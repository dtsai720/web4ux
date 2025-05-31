package repository

import (
	"context"
	"database/sql"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
)

type IDatabase interface {
	UpsertProject(ctx context.Context, arg sqlc.UpsertProjectParams) (string, error)
	UpsertDevices(ctx context.Context, arg sqlc.UpsertDevicesParams) (string, error)
	UpsertParticipants(ctx context.Context, arg sqlc.UpsertParticipantsParams) (string, error)
	UpsertWinfitts(ctx context.Context, arg sqlc.UpsertWinfittsParams) (string, error)
	UpsertWinfittsDetail(ctx context.Context, arg sqlc.UpsertWinfittsDetailParams) (string, error)
	UpsertWinfittsInformation(ctx context.Context, arg sqlc.UpsertWinfittsInformationParams) (string, error)
	ListProjects(ctx context.Context, arg sqlc.ListProjectsParams) ([]sqlc.Project, error)
	CreateUser(ctx context.Context, arg sqlc.CreateUserParams) (string, error)
	ListUsers(ctx context.Context, uid string) ([]sqlc.User, error)
	WithTx(tx *sql.Tx) *sqlc.Queries
}

type IRepository interface {
	UpsertProject(ctx context.Context, arg models.ProjectListResult) (string, error)
	UpsertWinfitts(ctx context.Context, projectID string, in models.WinfittsResult) error
}
