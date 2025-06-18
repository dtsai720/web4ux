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
	DeleteWinfittsInformation(ctx context.Context, arg sqlc.DeleteWinfittsInformationParams) error
}

type Queries interface {
	ListProject
	GetProject(ctx context.Context, id string) (sqlc.Project, error)
	GetProjectDetailByID(ctx context.Context, projectID string) ([]sqlc.GetProjectDetailByIDRow, error)
}

type IDatabase interface {
	Command
	Queries
	WithTx(tx *sql.Tx) *sqlc.Queries
}

type CommandRepository interface {
	UpsertExtractWinfittsDetails(ctx context.Context, in models.ProjectSummary, rows []models.WinfittsRawData) error
	DeleteOrRestoreWinfittsInformation(ctx context.Context, arg sqlc.DeleteWinfittsInformationParams) error
}

type QueryRepository interface {
	GetProject(ctx context.Context, id string) (models.Project, error)
	ListProjects(ctx context.Context, name, creator, orderBy, direction string, offset, limit int64) (models.ProjectSummaries, error)
	GetProjectDetailByID(ctx context.Context, projectID string) ([]models.ProjectDetail, error)
}

type IRepository interface {
	CommandRepository
	QueryRepository
}
