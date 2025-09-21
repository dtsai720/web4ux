package repository

import (
	"context"

	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
)

const (
	SortDirectionAsc  = "asc"
	SortDirectionDesc = "desc"
	SortFieldName     = "name"
	SortFieldCreator  = "creator"
	SortFieldTime     = "time"
)

type QueryStrategy interface {
	Execute(ctx context.Context, req models.ListProjectRequest) ([]sqlc.Project, error)
}

type ProjectQueryParams struct {
	Name    string
	Creator string
	Offset  int64
	Limit   int64
}

func NewProjectQueryParams(req models.ListProjectRequest) ProjectQueryParams {
	return ProjectQueryParams{
		Name:    req.Name + "%",
		Creator: req.Creator + "%",
		Offset:  req.Offset,
		Limit:   req.Limit,
	}
}

type NameQueryStrategy struct {
	sorter    ProjectSorterByName
	ascending bool
}

func NewNameQueryStrategy(sorter ProjectSorterByName, ascending bool) *NameQueryStrategy {
	return &NameQueryStrategy{
		sorter:    sorter,
		ascending: ascending,
	}
}

func (s *NameQueryStrategy) Execute(ctx context.Context, req models.ListProjectRequest) ([]sqlc.Project, error) {
	params := NewProjectQueryParams(req)

	if s.ascending {
		return s.sorter.ListProjectsByNameAsc(ctx, sqlc.ListProjectsByNameAscParams{
			Name:    params.Name,
			Creator: params.Creator,
			Offset:  params.Offset,
			Limit:   params.Limit,
		})
	}

	return s.sorter.ListProjectsByNameDesc(ctx, sqlc.ListProjectsByNameDescParams{
		Name:    params.Name,
		Creator: params.Creator,
		Offset:  params.Offset,
		Limit:   params.Limit,
	})
}

type CreatorQueryStrategy struct {
	sorter    ProjectSorterByCreator
	ascending bool
}

func NewCreatorQueryStrategy(sorter ProjectSorterByCreator, ascending bool) *CreatorQueryStrategy {
	return &CreatorQueryStrategy{
		sorter:    sorter,
		ascending: ascending,
	}
}

func (s *CreatorQueryStrategy) Execute(ctx context.Context, req models.ListProjectRequest) ([]sqlc.Project, error) {
	params := NewProjectQueryParams(req)

	if s.ascending {
		return s.sorter.ListProjectsByCreatorAsc(ctx, sqlc.ListProjectsByCreatorAscParams{
			Name:    params.Name,
			Creator: params.Creator,
			Offset:  params.Offset,
			Limit:   params.Limit,
		})
	}

	return s.sorter.ListProjectsByCreatorDesc(ctx, sqlc.ListProjectsByCreatorDescParams{
		Name:    params.Name,
		Creator: params.Creator,
		Offset:  params.Offset,
		Limit:   params.Limit,
	})
}

type TimeQueryStrategy struct {
	sorter    ProjectSorterByTime
	ascending bool
}

func NewTimeQueryStrategy(sorter ProjectSorterByTime, ascending bool) *TimeQueryStrategy {
	return &TimeQueryStrategy{
		sorter:    sorter,
		ascending: ascending,
	}
}

func (s *TimeQueryStrategy) Execute(ctx context.Context, req models.ListProjectRequest) ([]sqlc.Project, error) {
	params := NewProjectQueryParams(req)

	if s.ascending {
		return s.sorter.ListProjectsByTimeAsc(ctx, sqlc.ListProjectsByTimeAscParams{
			Name:    params.Name,
			Creator: params.Creator,
			Offset:  params.Offset,
			Limit:   params.Limit,
		})
	}

	return s.sorter.ListProjectsByTimeDesc(ctx, sqlc.ListProjectsByTimeDescParams{
		Name:    params.Name,
		Creator: params.Creator,
		Offset:  params.Offset,
		Limit:   params.Limit,
	})
}

type QueryStrategyFactory struct {
	sorter ProjectSorter
}

func NewQueryStrategyFactory(sorter ProjectSorter) *QueryStrategyFactory {
	return &QueryStrategyFactory{sorter: sorter}
}

func (f *QueryStrategyFactory) CreateStrategy(orderBy string, isAsc bool) QueryStrategy {
	switch orderBy {
	case SortFieldName:
		return NewNameQueryStrategy(f.sorter, isAsc)
	case SortFieldCreator:
		return NewCreatorQueryStrategy(f.sorter, isAsc)
	case SortFieldTime:
		return NewTimeQueryStrategy(f.sorter, isAsc)
	default:
		return NewTimeQueryStrategy(f.sorter, false)
	}
}
