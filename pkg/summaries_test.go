package pkg_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	mock_internal_service_analyzer "github.com/web4ux/mocks/internal_service_analyzer"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	"github.com/web4ux/models"
	"github.com/web4ux/pkg"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestApp_ListSummaries(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	// Create sample time for testing
	sampleTime := time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name         string
		request      models.ListSummariesRequest
		mockResponse types.MockItem[models.ProjectSummaries]
	}{
		{
			name: "successful list summaries with results",
			request: models.ListSummariesRequest{
				Name:      "test project",
				Creator:   "test creator",
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
						{
							ID:        "project-1",
							Name:      "Test Project 1",
							Creator:   "Creator 1",
							UpdatedAt: sampleTime,
						},
						{
							ID:        "project-2",
							Name:      "Test Project 2",
							Creator:   "Creator 2",
							UpdatedAt: sampleTime,
						},
					},
				},
			},
		},
		{
			name: "empty results",
			request: models.ListSummariesRequest{
				Name:      "",
				Creator:   "",
				OrderBy:   "name",
				Direction: "desc",
				Offset:    0,
				Limit:     20,
			},
			mockResponse: types.MockItem[models.ProjectSummaries]{
				Count: 1,
				Error: nil,
				Item: models.ProjectSummaries{
					Total: 0,
					Data:  []models.Project{},
				},
			},
		},
		{
			name: "database error",
			request: models.ListSummariesRequest{
				Name:      "error project",
				Creator:   "error creator",
				OrderBy:   "created_at",
				Direction: "asc",
				Offset:    10,
				Limit:     5,
			},
			mockResponse: types.MockItem[models.ProjectSummaries]{
				Count: 1,
				Error: errors.New("database connection failed"),
				Item:  models.ProjectSummaries{},
			},
		},
		{
			name: "pagination test",
			request: models.ListSummariesRequest{
				Name:      "",
				Creator:   "",
				OrderBy:   "name",
				Direction: "asc",
				Offset:    50,
				Limit:     25,
			},
			mockResponse: types.MockItem[models.ProjectSummaries]{
				Count: 1,
				Error: nil,
				Item: models.ProjectSummaries{
					Total: 100,
					Data: []models.Project{
						{
							ID:        "project-51",
							Name:      "Project 51",
							Creator:   "Creator A",
							UpdatedAt: sampleTime,
						},
					},
				},
			},
		},
		{
			name: "search by name filter",
			request: models.ListSummariesRequest{
				Name:      "specific project",
				Creator:   "",
				OrderBy:   "name",
				Direction: "asc",
				Offset:    0,
				Limit:     10,
			},
			mockResponse: types.MockItem[models.ProjectSummaries]{
				Count: 1,
				Error: nil,
				Item: models.ProjectSummaries{
					Total: 1,
					Data: []models.Project{
						{
							ID:        "project-specific",
							Name:      "Specific Project",
							Creator:   "Creator X",
							UpdatedAt: sampleTime,
						},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockAnalyzer := mock_internal_service_analyzer.NewMockIService(ctrl)
			mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
			log := logger.NewTestLogger()
			ctx := context.Background()

			// Mock fetcher for Startup method
			mockFetcher.EXPECT().GetProcessorRegistry().Return(nil).AnyTimes()

			app := pkg.New(
				pkg.WithAnalyzerService(mockAnalyzer),
				pkg.WithFetcherService(mockFetcher),
				pkg.WithLogger(log),
			)
			app.Startup(ctx)

			mockAnalyzer.EXPECT().ListSummaries(
				ctx, log, tt.request,
			).Return(tt.mockResponse.Item, tt.mockResponse.Error).Times(tt.mockResponse.Count)

			result := app.ListSummaries(tt.request)

			assert.Equal(t, tt.mockResponse.Item, result)
		})
	}
}
