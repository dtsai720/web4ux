package repository_test

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	mock_repository "github.com/web4ux/mocks/repository"
	"github.com/web4ux/models"
	"github.com/web4ux/repository"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestNewProjectQueryParams(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		request  models.ListProjectRequest
		expected repository.ProjectQueryParams
	}{
		{
			name: "creates params with appended wildcards",
			request: models.ListProjectRequest{
				Name:    "test",
				Creator: "user",
				Offset:  10,
				Limit:   20,
			},
			expected: repository.ProjectQueryParams{
				Name:    "test%",
				Creator: "user%",
				Offset:  10,
				Limit:   20,
			},
		},
		{
			name: "handles empty strings",
			request: models.ListProjectRequest{
				Name:    "",
				Creator: "",
				Offset:  0,
				Limit:   50,
			},
			expected: repository.ProjectQueryParams{
				Name:    "%",
				Creator: "%",
				Offset:  0,
				Limit:   50,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := repository.NewProjectQueryParams(tt.request)

			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestNameQueryStrategy_Execute(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := context.Background()

	tests := []struct {
		name      string
		ascending bool
		request   models.ListProjectRequest
		response  types.MockItem[[]sqlc.Project]
		hasError  bool
	}{
		{
			name:      "successful ascending query",
			ascending: true,
			request: models.ListProjectRequest{
				Name:    "test",
				Creator: "user",
				Offset:  0,
				Limit:   10,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: nil,
				Item: []sqlc.Project{
					{ID: "1", Name: "Test Project", Creator: "user"},
				},
			},
			hasError: false,
		},
		{
			name:      "successful descending query",
			ascending: false,
			request: models.ListProjectRequest{
				Name:    "project",
				Creator: "admin",
				Offset:  5,
				Limit:   15,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: nil,
				Item: []sqlc.Project{
					{ID: "2", Name: "Another Project", Creator: "admin"},
				},
			},
			hasError: false,
		},
		{
			name:      "database error on ascending query",
			ascending: true,
			request: models.ListProjectRequest{
				Name:    "error",
				Creator: "test",
				Offset:  0,
				Limit:   10,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: assert.AnError,
				Item:  nil,
			},
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockSorter := mock_repository.NewMockProjectSorterByName(ctrl)

			if tt.ascending {
				mockSorter.EXPECT().ListProjectsByNameAsc(ctx, sqlc.ListProjectsByNameAscParams{
					Name:    tt.request.Name + "%",
					Creator: tt.request.Creator + "%",
					Offset:  tt.request.Offset,
					Limit:   tt.request.Limit,
				}).Return(tt.response.Item, tt.response.Error).Times(tt.response.Count)
			} else {
				mockSorter.EXPECT().ListProjectsByNameDesc(ctx, sqlc.ListProjectsByNameDescParams{
					Name:    tt.request.Name + "%",
					Creator: tt.request.Creator + "%",
					Offset:  tt.request.Offset,
					Limit:   tt.request.Limit,
				}).Return(tt.response.Item, tt.response.Error).Times(tt.response.Count)
			}

			strategy := repository.NewNameQueryStrategy(mockSorter, tt.ascending)
			result, err := strategy.Execute(ctx, tt.request)

			assert.Equal(t, tt.hasError, err != nil)
			if !tt.hasError {
				assert.Equal(t, tt.response.Item, result)
			}
		})
	}
}

func TestCreatorQueryStrategy_Execute(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := context.Background()

	tests := []struct {
		name      string
		ascending bool
		request   models.ListProjectRequest
		response  types.MockItem[[]sqlc.Project]
		hasError  bool
	}{
		{
			name:      "successful ascending query",
			ascending: true,
			request: models.ListProjectRequest{
				Name:    "test",
				Creator: "user",
				Offset:  0,
				Limit:   10,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: nil,
				Item: []sqlc.Project{
					{ID: "1", Name: "Test Project", Creator: "user"},
				},
			},
			hasError: false,
		},
		{
			name:      "successful descending query",
			ascending: false,
			request: models.ListProjectRequest{
				Name:    "project",
				Creator: "admin",
				Offset:  5,
				Limit:   15,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: nil,
				Item: []sqlc.Project{
					{ID: "2", Name: "Another Project", Creator: "admin"},
				},
			},
			hasError: false,
		},
		{
			name:      "database error on descending query",
			ascending: false,
			request: models.ListProjectRequest{
				Name:    "error",
				Creator: "test",
				Offset:  0,
				Limit:   10,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: assert.AnError,
				Item:  nil,
			},
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockSorter := mock_repository.NewMockProjectSorterByCreator(ctrl)

			if tt.ascending {
				mockSorter.EXPECT().ListProjectsByCreatorAsc(ctx, sqlc.ListProjectsByCreatorAscParams{
					Name:    tt.request.Name + "%",
					Creator: tt.request.Creator + "%",
					Offset:  tt.request.Offset,
					Limit:   tt.request.Limit,
				}).Return(tt.response.Item, tt.response.Error).Times(tt.response.Count)
			} else {
				mockSorter.EXPECT().ListProjectsByCreatorDesc(ctx, sqlc.ListProjectsByCreatorDescParams{
					Name:    tt.request.Name + "%",
					Creator: tt.request.Creator + "%",
					Offset:  tt.request.Offset,
					Limit:   tt.request.Limit,
				}).Return(tt.response.Item, tt.response.Error).Times(tt.response.Count)
			}

			strategy := repository.NewCreatorQueryStrategy(mockSorter, tt.ascending)
			result, err := strategy.Execute(ctx, tt.request)

			assert.Equal(t, tt.hasError, err != nil)
			if !tt.hasError {
				assert.Equal(t, tt.response.Item, result)
			}
		})
	}
}

func TestTimeQueryStrategy_Execute(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := context.Background()

	tests := []struct {
		name      string
		ascending bool
		request   models.ListProjectRequest
		response  types.MockItem[[]sqlc.Project]
		hasError  bool
	}{
		{
			name:      "successful ascending query",
			ascending: true,
			request: models.ListProjectRequest{
				Name:    "test",
				Creator: "user",
				Offset:  0,
				Limit:   10,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: nil,
				Item: []sqlc.Project{
					{ID: "1", Name: "Test Project", Creator: "user"},
				},
			},
			hasError: false,
		},
		{
			name:      "successful descending query",
			ascending: false,
			request: models.ListProjectRequest{
				Name:    "project",
				Creator: "admin",
				Offset:  5,
				Limit:   15,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: nil,
				Item: []sqlc.Project{
					{ID: "2", Name: "Another Project", Creator: "admin"},
				},
			},
			hasError: false,
		},
		{
			name:      "database error on ascending query",
			ascending: true,
			request: models.ListProjectRequest{
				Name:    "error",
				Creator: "test",
				Offset:  0,
				Limit:   10,
			},
			response: types.MockItem[[]sqlc.Project]{
				Count: 1,
				Error: assert.AnError,
				Item:  nil,
			},
			hasError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockSorter := mock_repository.NewMockProjectSorterByTime(ctrl)

			if tt.ascending {
				mockSorter.EXPECT().ListProjectsByTimeAsc(ctx, sqlc.ListProjectsByTimeAscParams{
					Name:    tt.request.Name + "%",
					Creator: tt.request.Creator + "%",
					Offset:  tt.request.Offset,
					Limit:   tt.request.Limit,
				}).Return(tt.response.Item, tt.response.Error).Times(tt.response.Count)
			} else {
				mockSorter.EXPECT().ListProjectsByTimeDesc(ctx, sqlc.ListProjectsByTimeDescParams{
					Name:    tt.request.Name + "%",
					Creator: tt.request.Creator + "%",
					Offset:  tt.request.Offset,
					Limit:   tt.request.Limit,
				}).Return(tt.response.Item, tt.response.Error).Times(tt.response.Count)
			}

			strategy := repository.NewTimeQueryStrategy(mockSorter, tt.ascending)
			result, err := strategy.Execute(ctx, tt.request)

			assert.Equal(t, tt.hasError, err != nil)
			if !tt.hasError {
				assert.Equal(t, tt.response.Item, result)
			}
		})
	}
}

func TestQueryStrategyFactory_CreateStrategy(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockSorter := mock_repository.NewMockProjectSorter(ctrl)
	factory := repository.NewQueryStrategyFactory(mockSorter)

	tests := []struct {
		name         string
		orderBy      string
		isAsc        bool
		expectedType string
	}{
		{
			name:         "creates name strategy ascending",
			orderBy:      repository.SortFieldName,
			isAsc:        true,
			expectedType: "*repository.NameQueryStrategy",
		},
		{
			name:         "creates name strategy descending",
			orderBy:      repository.SortFieldName,
			isAsc:        false,
			expectedType: "*repository.NameQueryStrategy",
		},
		{
			name:         "creates creator strategy ascending",
			orderBy:      repository.SortFieldCreator,
			isAsc:        true,
			expectedType: "*repository.CreatorQueryStrategy",
		},
		{
			name:         "creates creator strategy descending",
			orderBy:      repository.SortFieldCreator,
			isAsc:        false,
			expectedType: "*repository.CreatorQueryStrategy",
		},
		{
			name:         "creates time strategy ascending",
			orderBy:      repository.SortFieldTime,
			isAsc:        true,
			expectedType: "*repository.TimeQueryStrategy",
		},
		{
			name:         "creates time strategy descending",
			orderBy:      repository.SortFieldTime,
			isAsc:        false,
			expectedType: "*repository.TimeQueryStrategy",
		},
		{
			name:         "creates default time strategy for unknown field",
			orderBy:      "unknown",
			isAsc:        true,
			expectedType: "*repository.TimeQueryStrategy",
		},
		{
			name:         "creates default time strategy descending for unknown field",
			orderBy:      "invalid",
			isAsc:        false,
			expectedType: "*repository.TimeQueryStrategy",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			strategy := factory.CreateStrategy(tt.orderBy, tt.isAsc)

			require.NotNil(t, strategy)
			assert.Contains(t, fmt.Sprintf("%T", strategy), tt.expectedType)
		})
	}
}

func TestSortConstants(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		constant string
		expected string
	}{
		{"SortDirectionAsc", repository.SortDirectionAsc, "asc"},
		{"SortDirectionDesc", repository.SortDirectionDesc, "desc"},
		{"SortFieldName", repository.SortFieldName, "name"},
		{"SortFieldCreator", repository.SortFieldCreator, "creator"},
		{"SortFieldTime", repository.SortFieldTime, "time"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.expected, tt.constant)
		})
	}
}

func TestQueryStrategyFactory_Constructor(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockSorter := mock_repository.NewMockProjectSorter(ctrl)
	factory := repository.NewQueryStrategyFactory(mockSorter)

	require.NotNil(t, factory)
}

func TestNameQueryStrategy_Constructor(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockSorter := mock_repository.NewMockProjectSorterByName(ctrl)

	tests := []struct {
		name      string
		ascending bool
	}{
		{"creates ascending strategy", true},
		{"creates descending strategy", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			strategy := repository.NewNameQueryStrategy(mockSorter, tt.ascending)

			require.NotNil(t, strategy)
		})
	}
}

func TestCreatorQueryStrategy_Constructor(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockSorter := mock_repository.NewMockProjectSorterByCreator(ctrl)

	tests := []struct {
		name      string
		ascending bool
	}{
		{"creates ascending strategy", true},
		{"creates descending strategy", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			strategy := repository.NewCreatorQueryStrategy(mockSorter, tt.ascending)

			require.NotNil(t, strategy)
		})
	}
}

func TestTimeQueryStrategy_Constructor(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockSorter := mock_repository.NewMockProjectSorterByTime(ctrl)

	tests := []struct {
		name      string
		ascending bool
	}{
		{"creates ascending strategy", true},
		{"creates descending strategy", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			strategy := repository.NewTimeQueryStrategy(mockSorter, tt.ascending)

			require.NotNil(t, strategy)
		})
	}
}
