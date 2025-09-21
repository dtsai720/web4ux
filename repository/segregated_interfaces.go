package repository

import (
	"context"

	"github.com/web4ux/repository/sqlc"
)

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
