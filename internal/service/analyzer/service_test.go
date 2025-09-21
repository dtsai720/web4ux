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
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

var (
	errDatabaseConnectionFailed = errors.New("database connection failed")
	errProjectNotFound          = errors.New("project not found")
	errDatabaseUpdateFailed     = errors.New("database update failed")
)

type listSummariesTestCase struct {
	name         string
	request      models.ListSummariesRequest
	mockResponse types.MockItem[models.ProjectSummaries]
	expectError  bool
}

func getListSummariesTestCases() []listSummariesTestCase {
	return []listSummariesTestCase{
		{
			name: "successful list summaries",
			request: models.ListSummariesRequest{
				Name:      "test project",
				Creator:   "test user",
				OrderBy:   "name",
				Direction: "asc",
				Offset:    0,
				Limit:     10,
			},
			mockResponse: types.MockItem[models.ProjectSummaries]{
				Count: 1,
				Error: nil,
				Item: models.ProjectSummaries{
					Total: 2,
					Data: []models.Project{
						{ID: "1", Name: "Test Project 1"},
						{ID: "2", Name: "Test Project 2"},
					},
				},
			},
			expectError: false,
		},
		{
			name: "database error",
			request: models.ListSummariesRequest{
				Name:      "",
				Creator:   "",
				OrderBy:   "name",
				Direction: "asc",
				Offset:    0,
				Limit:     10,
			},
			mockResponse: types.MockItem[models.ProjectSummaries]{
				Count: 1,
				Error: errDatabaseConnectionFailed,
				Item:  models.ProjectSummaries{},
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
				Return(tt.mockResponse.Item, tt.mockResponse.Error).Times(tt.mockResponse.Count)

			service := analyzer.New(
				analyzer.WithDatabase(mockDB),
				analyzer.WithClient(mockClient),
			)

			result, err := service.ListSummaries(ctx, log, tt.request)
			assert.Equal(t, tt.expectError, err != nil)

			if !tt.expectError {
				assert.Equal(t, tt.mockResponse.Item, result)
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
		name         string
		projectID    string
		mockResponse types.MockItem[[]models.ProjectDetail]
		expectError  bool
	}{
		{
			name:      "successful get project detail",
			projectID: "project-123",
			mockResponse: types.MockItem[[]models.ProjectDetail]{
				Count: 1,
				Error: nil,
				Item: []models.ProjectDetail{
					{ProjectID: "project-123", ProjectName: "Test Project"},
					{ProjectID: "project-123", ProjectName: "Test Project"},
				},
			},
			expectError: false,
		},
		{
			name:      "project not found",
			projectID: "non-existent",
			mockResponse: types.MockItem[[]models.ProjectDetail]{
				Count: 1,
				Error: errProjectNotFound,
				Item:  nil,
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
				Return(tt.mockResponse.Item, tt.mockResponse.Error).Times(tt.mockResponse.Count)

			service := analyzer.New(
				analyzer.WithDatabase(mockDB),
				analyzer.WithClient(mockClient),
			)

			result, err := service.GetProjectDetailByID(ctx, log, tt.projectID)
			assert.Equal(t, tt.expectError, err != nil)

			if !tt.expectError {
				assert.Equal(t, tt.mockResponse.Item, result)
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
		mockResponse  types.MockItem[any]
		expectError   bool
	}{
		{
			name:          "successful delete",
			informationID: "info-123",
			deleted:       true,
			mockResponse:  types.MockItem[any]{Count: 1, Error: nil, Item: nil},
			expectError:   false,
		},
		{
			name:          "successful restore",
			informationID: "info-456",
			deleted:       false,
			mockResponse:  types.MockItem[any]{Count: 1, Error: nil, Item: nil},
			expectError:   false,
		},
		{
			name:          "database error",
			informationID: "info-error",
			deleted:       true,
			mockResponse: types.MockItem[any]{
				Count: 1,
				Error: errDatabaseUpdateFailed,
				Item:  nil,
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
			}).Return(tt.mockResponse.Error).Times(tt.mockResponse.Count)

			service := analyzer.New(
				analyzer.WithDatabase(mockDB),
				analyzer.WithClient(mockClient),
			)

			err := service.DeleteOrRestore(ctx, log, tt.informationID, tt.deleted)
			assert.Equal(t, tt.expectError, err != nil)
		})
	}
}
