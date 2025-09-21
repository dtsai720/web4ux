package pkg_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	mock_internal_service_analyzer "github.com/web4ux/mocks/internal_service_analyzer"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	"github.com/web4ux/models"
	"github.com/web4ux/pkg"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestApp_GetProjectDetailByID(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name         string
		projectID    string
		mockResponse types.MockItem[[]models.ProjectDetail]
	}{
		{
			name:      "successful get project details",
			projectID: "project-123",
			mockResponse: types.MockItem[[]models.ProjectDetail]{
				Count: 1,
				Error: nil,
				Item: []models.ProjectDetail{
					{
						ProjectID:         "project-123",
						ProjectName:       "Test Project",
						ProjectCreator:    "Test Creator",
						ProjectUpdatedAt:  "2023-01-01",
						DeviceName:        "Test Device",
						DeviceOrder:       "1",
						ParticipantName:   "Test Participant",
						ParticipantSerial: "P001",
					},
					{
						ProjectID:         "project-123",
						ProjectName:       "Test Project",
						ProjectCreator:    "Test Creator",
						ProjectUpdatedAt:  "2023-01-01",
						DeviceName:        "Test Device 2",
						DeviceOrder:       "2",
						ParticipantName:   "Test Participant 2",
						ParticipantSerial: "P002",
					},
				},
			},
		},
		{
			name:      "project not found",
			projectID: "non-existent",
			mockResponse: types.MockItem[[]models.ProjectDetail]{
				Count: 1,
				Error: errors.New("project not found"),
				Item:  nil,
			},
		},
		{
			name:      "database connection error",
			projectID: "project-456",
			mockResponse: types.MockItem[[]models.ProjectDetail]{
				Count: 1,
				Error: errors.New("database connection failed"),
				Item:  nil,
			},
		},
		{
			name:      "empty project ID",
			projectID: "",
			mockResponse: types.MockItem[[]models.ProjectDetail]{
				Count: 1,
				Error: nil,
				Item:  []models.ProjectDetail{},
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

			mockAnalyzer.EXPECT().GetProjectDetailByID(ctx, log, tt.projectID).
				Return(tt.mockResponse.Item, tt.mockResponse.Error).Times(tt.mockResponse.Count)

			result := app.GetProjectDetailByID(tt.projectID)

			if tt.mockResponse.Error != nil {
				assert.Nil(t, result)
			} else {
				assert.Equal(t, tt.mockResponse.Item, result)
			}
		})
	}
}
