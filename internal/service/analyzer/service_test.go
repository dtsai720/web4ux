package analyzer_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/internal/service/analyzer"
	mock_repository "github.com/web4ux/mocks/repository"
	mock_src_request "github.com/web4ux/mocks/src_request"
	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
	"go.uber.org/mock/gomock"
)

var (
	errDatabaseConnectionFailed = errors.New("database connection failed")
	errProjectNotFound          = errors.New("project not found")
	errDatabaseUpdateFailed     = errors.New("database update failed")
)

type listSummariesArgs struct {
	name      string
	creator   string
	orderBy   string
	direction string
	offset    int64
	limit     int64
}

type listSummariesTestCase struct {
	name        string
	args        listSummariesArgs
	dbResult    common.Item[models.ProjectSummaries]
	expectError bool
}

func getListSummariesTestCases() []listSummariesTestCase {
	return []listSummariesTestCase{
		{
			name: "successful list summaries",
			args: listSummariesArgs{
				name:      "test project",
				creator:   "test user",
				orderBy:   "name",
				direction: "asc",
				offset:    0,
				limit:     10,
			},
			dbResult: common.Item[models.ProjectSummaries]{
				Result: models.ProjectSummaries{
					Total: 2,
					Data: []models.Project{
						{ID: "1", Name: "Test Project 1"},
						{ID: "2", Name: "Test Project 2"},
					},
				},
				Count: 1,
			},
			expectError: false,
		},
		{
			name: "database error",
			args: listSummariesArgs{
				name:      "",
				creator:   "",
				orderBy:   "name",
				direction: "asc",
				offset:    0,
				limit:     10,
			},
			dbResult: common.Item[models.ProjectSummaries]{
				Error: errDatabaseConnectionFailed,
				Count: 1,
			},
			expectError: true,
		},
	}
}

func TestListSummaries(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	tests := getListSummariesTestCases()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockDB := mock_repository.NewMockIRepository(ctrl)
			mockClient := mock_src_request.NewMockIClient(ctrl)
			log := logger.NewTestLogger()
			mockDB.EXPECT().ListProjects(ctx, log, gomock.Any()).
				Return(tt.dbResult.Result, tt.dbResult.Error).Times(tt.dbResult.Count)

			service := analyzer.New(
				analyzer.WithDatabase(mockDB),
				analyzer.WithClient(mockClient),
			)

			result, err := service.ListSummaries(ctx, log, tt.args.name, tt.args.creator, tt.args.orderBy, tt.args.direction, tt.args.offset, tt.args.limit)
			assert.Equal(t, tt.expectError, err != nil)

			if !tt.expectError {
				assert.Equal(t, tt.dbResult.Result, result)
			}
		})
	}
}

func TestGetProjectDetailByID(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()

	tests := []struct {
		name        string
		projectID   string
		dbResult    common.Item[[]models.ProjectDetail]
		expectError bool
	}{
		{
			name:      "successful get project detail",
			projectID: "project-123",
			dbResult: common.Item[[]models.ProjectDetail]{
				Result: []models.ProjectDetail{
					{ProjectID: "project-123", ProjectName: "Test Project"},
					{ProjectID: "project-123", ProjectName: "Test Project"},
				},
				Count: 1,
			},
			expectError: false,
		},
		{
			name:      "project not found",
			projectID: "non-existent",
			dbResult: common.Item[[]models.ProjectDetail]{
				Error: errProjectNotFound,
				Count: 1,
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockDB := mock_repository.NewMockIRepository(ctrl)
			mockClient := mock_src_request.NewMockIClient(ctrl)
			log := logger.NewTestLogger()
			mockDB.EXPECT().FindProjectDetails(ctx, log, tt.projectID).
				Return(tt.dbResult.Result, tt.dbResult.Error).Times(tt.dbResult.Count)

			service := analyzer.New(
				analyzer.WithDatabase(mockDB),
				analyzer.WithClient(mockClient),
			)

			result, err := service.GetProjectDetailByID(ctx, log, tt.projectID)
			assert.Equal(t, tt.expectError, err != nil)

			if !tt.expectError {
				assert.Equal(t, tt.dbResult.Result, result)
			}
		})
	}
}

func TestDeleteOrRestore(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()

	tests := []struct {
		name          string
		informationID string
		deleted       bool
		dbResult      common.Item[any]
		expectError   bool
	}{
		{
			name:          "successful delete",
			informationID: "info-123",
			deleted:       true,
			dbResult:      common.Item[any]{Count: 1},
			expectError:   false,
		},
		{
			name:          "successful restore",
			informationID: "info-456",
			deleted:       false,
			dbResult:      common.Item[any]{Count: 1},
			expectError:   false,
		},
		{
			name:          "database error",
			informationID: "info-error",
			deleted:       true,
			dbResult: common.Item[any]{
				Error: errDatabaseUpdateFailed,
				Count: 1,
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			mockDB := mock_repository.NewMockIRepository(ctrl)
			mockClient := mock_src_request.NewMockIClient(ctrl)
			log := logger.NewTestLogger()
			mockDB.EXPECT().SoftDeleteWinfittsInformation(ctx, log, sqlc.SoftDeleteWinfittsInformationParams{
				Deleted:       tt.deleted,
				InformationID: tt.informationID,
			}).Return(tt.dbResult.Error).Times(tt.dbResult.Count)

			service := analyzer.New(
				analyzer.WithDatabase(mockDB),
				analyzer.WithClient(mockClient),
			)

			err := service.DeleteOrRestore(ctx, log, tt.informationID, tt.deleted)
			assert.Equal(t, tt.expectError, err != nil)
		})
	}
}
