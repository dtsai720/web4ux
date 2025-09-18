package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/models"
	mock_repository "github.com/web4ux/mocks/repository"
	"github.com/web4ux/repository"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/logger"
	"go.uber.org/mock/gomock"
)

func TestDeleteOrRestoreWinfittsInformation(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	testCases := []struct {
		Title    string
		Error    error
		HasError bool
	}{
		{
			Title: "Happy Path",
		},
		{
			Title:    "Unexpected Error",
			Error:    errs.ErrUnknown,
			HasError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Title, func(t *testing.T) {
			t.Parallel()

			q := mock_repository.NewMockIDatabase(ctrl)
			q.EXPECT().SoftDeleteWinfittsInformation(ctx, gomock.Any()).Return(tc.Error)

			db := new(repository.Repository)
			db.SetQueries(q)

			log := logger.NewTestLogger()
			err := db.SoftDeleteWinfittsInformation(ctx, log, sqlc.SoftDeleteWinfittsInformationParams{})
			assert.Equal(t, tc.HasError, err != nil)
		})
	}
}

const descDirection = "desc"

func setupListProjectMocks(q *mock_repository.MockIDatabase, ctx context.Context, tc struct {
	Title         string
	Name          string
	Creator       string
	OrderBy       string
	Direction     string
	Offset        int64
	Limit         int64
	MockProjects  common.Item[[]sqlc.Project]
	MockTotal     common.Item[int64]
	HasError      bool
	ExpectedTotal int64
	ExpectedCount int
}) {
	switch tc.OrderBy {
	case "name":
		if tc.Direction == descDirection {
			q.EXPECT().ListProjectsByNameDesc(ctx, gomock.Any()).Return(tc.MockProjects.Result, tc.MockProjects.Error)
		} else {
			q.EXPECT().ListProjectsByNameAsc(ctx, gomock.Any()).Return(tc.MockProjects.Result, tc.MockProjects.Error)
		}
	case "creator":
		if tc.Direction == descDirection {
			q.EXPECT().ListProjectsByCreatorDesc(ctx, gomock.Any()).Return(tc.MockProjects.Result, tc.MockProjects.Error)
		} else {
			q.EXPECT().ListProjectsByCreatorAsc(ctx, gomock.Any()).Return(tc.MockProjects.Result, tc.MockProjects.Error)
		}
	default:
		if tc.Direction == descDirection {
			q.EXPECT().ListProjectsByTimeDesc(ctx, gomock.Any()).Return(tc.MockProjects.Result, tc.MockProjects.Error)
		} else {
			q.EXPECT().ListProjectsByTimeAsc(ctx, gomock.Any()).Return(tc.MockProjects.Result, tc.MockProjects.Error)
		}
	}
}

func TestListProjects(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	testCases := []struct {
		Title         string
		Name          string
		Creator       string
		OrderBy       string
		Direction     string
		Offset        int64
		Limit         int64
		MockProjects  common.Item[[]sqlc.Project]
		MockTotal     common.Item[int64]
		HasError      bool
		ExpectedTotal int64
		ExpectedCount int
	}{
		{
			Title:     "Happy Path - List all projects",
			Name:      "",
			Creator:   "",
			OrderBy:   "name",
			Direction: "asc",
			Offset:    0,
			Limit:     10,
			MockProjects: common.Item[[]sqlc.Project]{
				Result: []sqlc.Project{
					{
						ID:        "proj-1",
						Name:      "Project 1",
						Creator:   "User 1",
						UpdatedAt: "2025-01-01T12:00:00Z",
					},
					{
						ID:        "proj-2",
						Name:      "Project 2",
						Creator:   "User 2",
						UpdatedAt: "2025-01-02T12:00:00Z",
					},
				},
			},
			MockTotal:     common.Item[int64]{Result: 2},
			ExpectedTotal: 2,
			ExpectedCount: 2,
		},
		{
			Title:         "Happy Path - Empty results",
			Name:          "NonExistent",
			Creator:       "",
			OrderBy:       "name",
			Direction:     "asc",
			Offset:        0,
			Limit:         10,
			MockProjects:  common.Item[[]sqlc.Project]{Result: []sqlc.Project{}},
			MockTotal:     common.Item[int64]{Result: 0},
			ExpectedTotal: 0,
			ExpectedCount: 0,
		},
		{
			Title:        "Database Error",
			Name:         "",
			Creator:      "",
			OrderBy:      "name",
			Direction:    "asc",
			Offset:       0,
			Limit:        10,
			MockProjects: common.Item[[]sqlc.Project]{Error: errs.ErrUnknown},
			MockTotal:    common.Item[int64]{Error: errs.ErrUnknown},
			HasError:     true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Title, func(t *testing.T) {
			t.Parallel()

			q := mock_repository.NewMockIDatabase(ctrl)

			setupListProjectMocks(q, ctx, tc)
			if !tc.HasError {
				q.EXPECT().CountProjects(ctx, gomock.Any()).Return(tc.MockTotal.Result, tc.MockTotal.Error)
			}

			db := new(repository.Repository)
			db.SetQueries(q)

			log := logger.NewTestLogger()
			result, err := db.ListProjects(ctx, log, models.ListProjectRequest{
				Name:    tc.Name,
				Creator: tc.Creator,
				OrderBy: tc.OrderBy,
				IsASC:   tc.Direction != "desc",
				Offset:  tc.Offset,
				Limit:   tc.Limit,
			})

			assert.Equal(t, tc.HasError, err != nil)
			if !tc.HasError {
				assert.Equal(t, tc.ExpectedTotal, result.Total)
				assert.Len(t, result.Data, tc.ExpectedCount)
			}
		})
	}
}

func TestFindProject(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	testTime, _ := time.Parse(time.RFC3339, "2025-01-01T12:00:00Z")

	testCases := []struct {
		Title        string
		ProjectID    string
		MockProject  common.Item[sqlc.Project]
		HasError     bool
		ExpectedName string
	}{
		{
			Title:     "Happy Path - Get existing project",
			ProjectID: "proj-1",
			MockProject: common.Item[sqlc.Project]{
				Result: sqlc.Project{
					ID:        "proj-1",
					Name:      "Test Project",
					Creator:   "Test User",
					UpdatedAt: "2025-01-01T12:00:00Z",
				},
			},
			ExpectedName: "Test Project",
		},
		{
			Title:     "Project not found",
			ProjectID: "non-existent",
			MockProject: common.Item[sqlc.Project]{
				Error: errs.ErrUnknown,
			},
			HasError: true,
		},
		{
			Title:     "Database Error",
			ProjectID: "error-case",
			MockProject: common.Item[sqlc.Project]{
				Error: errs.ErrUnknown,
			},
			HasError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Title, func(t *testing.T) {
			t.Parallel()

			q := mock_repository.NewMockIDatabase(ctrl)
			q.EXPECT().FindProject(ctx, tc.ProjectID).Return(tc.MockProject.Result, tc.MockProject.Error)

			db := new(repository.Repository)
			db.SetQueries(q)

			log := logger.NewTestLogger()
			result, err := db.FindProject(ctx, log, tc.ProjectID)

			assert.Equal(t, tc.HasError, err != nil)
			if !tc.HasError {
				assert.Equal(t, tc.MockProject.Result.ID, result.ID)
				assert.Equal(t, tc.ExpectedName, result.Name)
				assert.Equal(t, tc.MockProject.Result.Creator, result.Creator)
				assert.Equal(t, testTime, result.UpdatedAt)
			}
		})
	}
}

func TestFindProjectDetails(t *testing.T) {
	t.Parallel()

	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()

	testCases := []struct {
		Title             string
		ProjectID         string
		MockDetailRows    common.Item[[]sqlc.FindProjectDetailsRow]
		HasError          bool
		ExpectedCount     int
		ExpectedProjectID string
	}{
		{
			Title:     "Happy Path - Get project details",
			ProjectID: "proj-1",
			MockDetailRows: common.Item[[]sqlc.FindProjectDetailsRow]{
				Result: []sqlc.FindProjectDetailsRow{
					{
						ProjectID:         "proj-1",
						ProjectName:       "Test Project",
						ProjectCreator:    "Test User",
						ProjectUpdatedAt:  "2025-01-01T12:00:00Z",
						DeviceName:        "Device 1",
						ParticipantName:   "Participant 1",
						ParticipantSerial: "P001",
						InformationID:     "info-1",
						Deleted:           false,
						ErrorTimes:        3,
						IsFailed:          false,
						TrailNumber:       1,
						Mark:              "mark1",
						Timestamp:         1500,
						Width:             100,
						Distance:          200,
						X:                 150,
						Y:                 250,
					},
				},
			},
			ExpectedCount:     1,
			ExpectedProjectID: "proj-1",
		},
		{
			Title:          "Happy Path - Empty results",
			ProjectID:      "empty-proj",
			MockDetailRows: common.Item[[]sqlc.FindProjectDetailsRow]{Result: []sqlc.FindProjectDetailsRow{}},
			ExpectedCount:  0,
		},
		{
			Title:     "Database Error",
			ProjectID: "error-case",
			MockDetailRows: common.Item[[]sqlc.FindProjectDetailsRow]{
				Error: errs.ErrUnknown,
			},
			HasError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Title, func(t *testing.T) {
			t.Parallel()

			q := mock_repository.NewMockIDatabase(ctrl)
			q.EXPECT().FindProjectDetails(ctx, tc.ProjectID).Return(tc.MockDetailRows.Result, tc.MockDetailRows.Error)

			db := new(repository.Repository)
			db.SetQueries(q)

			log := logger.NewTestLogger()
			result, err := db.FindProjectDetails(ctx, log, tc.ProjectID)

			assert.Equal(t, tc.HasError, err != nil)
			if !tc.HasError {
				assert.Len(t, result, tc.ExpectedCount)
				if tc.ExpectedCount > 0 {
					assert.Equal(t, tc.ExpectedProjectID, result[0].ProjectID)
					assert.Equal(t, "Test Project", result[0].ProjectName)
					assert.Equal(t, "Test User", result[0].ProjectCreator)
				}
			}
		})
	}
}
