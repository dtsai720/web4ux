package repository

import (
	"context"
	"database/sql"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
)

type ListProject interface {
	CountProjects(ctx context.Context, arg sqlc.CountProjectsParams) (int64, error)
	ListProjectsOrderByCreatorAsc(ctx context.Context, arg sqlc.ListProjectsOrderByCreatorAscParams) ([]sqlc.Project, error)
	ListProjectsOrderByCreatorDesc(ctx context.Context, arg sqlc.ListProjectsOrderByCreatorDescParams) ([]sqlc.Project, error)
	ListProjectsOrderByNameAsc(ctx context.Context, arg sqlc.ListProjectsOrderByNameAscParams) ([]sqlc.Project, error)
	ListProjectsOrderByNameDesc(ctx context.Context, arg sqlc.ListProjectsOrderByNameDescParams) ([]sqlc.Project, error)
	ListProjectsOrderByUpdatedAtAsc(ctx context.Context, arg sqlc.ListProjectsOrderByUpdatedAtAscParams) ([]sqlc.Project, error)
	ListProjectsOrderByUpdatedAtDesc(ctx context.Context, arg sqlc.ListProjectsOrderByUpdatedAtDescParams) ([]sqlc.Project, error)
}

type Command interface {
	UpsertProject(ctx context.Context, arg sqlc.UpsertProjectParams) (sqlc.Project, error)
	UpsertDevices(ctx context.Context, arg sqlc.UpsertDevicesParams) (sqlc.Device, error)
	UpsertParticipants(ctx context.Context, arg sqlc.UpsertParticipantsParams) (sqlc.Participant, error)
	UpsertWinfitts(ctx context.Context, arg sqlc.UpsertWinfittsParams) (sqlc.Winfitt, error)
	UpsertWinfittsDetail(ctx context.Context, arg sqlc.UpsertWinfittsDetailParams) (sqlc.WinfittsDetail, error)
	UpsertWinfittsInformation(ctx context.Context, arg sqlc.UpsertWinfittsInformationParams) (sqlc.WinfittsInformation, error)
	CreateUser(ctx context.Context, arg sqlc.CreateUserParams) (string, error)
}

type Queries interface {
	ListProject
	ListUsers(ctx context.Context, uid string) ([]sqlc.User, error)
}

type IDatabase interface {
	Command
	Queries
	WithTx(tx *sql.Tx) *sqlc.Queries
}

type CommandRepository interface {
	UpsertExtractWinfittsDetails(ctx context.Context, in models.ProjectSummary, rows []models.WinfittsRawData) error
}

type QueryRepository interface {
	ListProjects(ctx context.Context, name, creator, orderBy, direction string, offset, limit int64) (models.ProjectSummaries, error)
}

type IRepository interface {
	CommandRepository
	QueryRepository
}
