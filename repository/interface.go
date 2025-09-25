package repository

import (
	"context"
	"database/sql"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/logger"
)

// ListProject interface is kept for backward compatibility
// New code should use more specific interfaces from segregated_interfaces.go
type ListProject interface {
	ProjectLister
}

type Command interface {
	UpsertProject(ctx context.Context, arg sqlc.UpsertProjectParams) (sqlc.Project, error)
	UpsertDevices(ctx context.Context, arg sqlc.UpsertDevicesParams) (sqlc.Device, error)
	UpsertParticipants(ctx context.Context, arg sqlc.UpsertParticipantsParams) (sqlc.Participant, error)
	UpsertWinfitts(ctx context.Context, arg sqlc.UpsertWinfittsParams) (sqlc.Winfitt, error)
	UpsertWinfittsDetail(ctx context.Context, arg sqlc.UpsertWinfittsDetailParams) (sqlc.WinfittsDetail, error)
	UpsertWinfittsInformation(ctx context.Context, arg sqlc.UpsertWinfittsInformationParams) (sqlc.WinfittsInformation, error)
	SoftDeleteWinfittsInformation(ctx context.Context, arg sqlc.SoftDeleteWinfittsInformationParams) error
}

type Queries interface {
	ListProject
	FindProject(ctx context.Context, id string) (sqlc.Project, error)
	FindProjectDetails(ctx context.Context, projectID string) ([]sqlc.FindProjectDetailsRow, error)
}

type IDatabase interface {
	Command
	Queries
	WithTx(tx *sql.Tx) *sqlc.Queries
}

type CommandRepository interface {
	UpsertExtractWinfittsDetails(ctx context.Context, log logger.ILogger, in models.ProjectSummary, rows []models.WinfittsRawData) error
	SoftDeleteWinfittsInformation(ctx context.Context, log logger.ILogger, arg sqlc.SoftDeleteWinfittsInformationParams) error
}

type QueryRepository interface {
	FindProject(ctx context.Context, log logger.ILogger, id string) (models.Project, error)
	ListProjects(ctx context.Context, log logger.ILogger, req models.ListProjectRequest) (models.ProjectSummaries, error)
	FindProjectDetails(ctx context.Context, log logger.ILogger, projectID string) ([]models.ProjectDetail, error)
}

type IRepository interface {
	CommandRepository
	QueryRepository
}

type ProjectCounter interface {
	CountProjects(ctx context.Context, arg sqlc.CountProjectsParams) (int64, error)
}

type ProjectSorterByName interface {
	ListProjectsByNameAsc(ctx context.Context, arg sqlc.ListProjectsByNameAscParams) ([]sqlc.Project, error)
	ListProjectsByNameDesc(ctx context.Context, arg sqlc.ListProjectsByNameDescParams) ([]sqlc.Project, error)
}

type ProjectSorterByCreator interface {
	ListProjectsByCreatorAsc(ctx context.Context, arg sqlc.ListProjectsByCreatorAscParams) ([]sqlc.Project, error)
	ListProjectsByCreatorDesc(ctx context.Context, arg sqlc.ListProjectsByCreatorDescParams) ([]sqlc.Project, error)
}

type ProjectSorterByTime interface {
	ListProjectsByTimeAsc(ctx context.Context, arg sqlc.ListProjectsByTimeAscParams) ([]sqlc.Project, error)
	ListProjectsByTimeDesc(ctx context.Context, arg sqlc.ListProjectsByTimeDescParams) ([]sqlc.Project, error)
}

type ProjectSorter interface {
	ProjectSorterByName
	ProjectSorterByCreator
	ProjectSorterByTime
}

type ProjectLister interface {
	ProjectCounter
	ProjectSorter
}

type QueryStrategy interface {
	Execute(ctx context.Context, req models.ListProjectRequest) ([]sqlc.Project, error)
}
