package pkg_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	mock_internal_service_analyzer "github.com/web4ux/mocks/internal_service_analyzer"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	"github.com/web4ux/pkg"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestRequest_Struct(t *testing.T) {
	request := pkg.Request{
		Device:      "Device1",
		Participant: "Participant1",
		Trail:       5,
	}

	assert.Equal(t, "Device1", request.Device)
	assert.Equal(t, "Participant1", request.Participant)
	assert.Equal(t, 5, request.Trail)
}

func TestApp_DeleteOrRestore(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name           string
		projectID      string
		informationID  string
		deleted        bool
		mockResponse   types.MockItem[string]
		expectedResult string
	}{
		{
			name:           "successful delete operation",
			projectID:      "project-123",
			informationID:  "info-456",
			deleted:        true,
			mockResponse:   types.MockItem[string]{Count: 1, Error: nil, Item: ""},
			expectedResult: "",
		},
		{
			name:           "successful restore operation",
			projectID:      "project-123",
			informationID:  "info-789",
			deleted:        false,
			mockResponse:   types.MockItem[string]{Count: 1, Error: nil, Item: ""},
			expectedResult: "",
		},
		{
			name:           "delete operation with database error",
			projectID:      "project-123",
			informationID:  "info-error",
			deleted:        true,
			mockResponse:   types.MockItem[string]{Count: 1, Error: errors.New("database connection failed"), Item: ""},
			expectedResult: "",
		},
		{
			name:           "restore operation with permission error",
			projectID:      "project-123",
			informationID:  "info-permission",
			deleted:        false,
			mockResponse:   types.MockItem[string]{Count: 1, Error: errors.New("permission denied"), Item: ""},
			expectedResult: "",
		},
		{
			name:           "empty information ID",
			projectID:      "project-123",
			informationID:  "",
			deleted:        true,
			mockResponse:   types.MockItem[string]{Count: 1, Error: nil, Item: ""},
			expectedResult: "",
		},
	}

	ctx := context.Background()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockAnalyzer := mock_internal_service_analyzer.NewMockIService(ctrl)
			mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
			log := logger.NewTestLogger()

			mockAnalyzer.EXPECT().DeleteOrRestore(ctx, log, tt.informationID, tt.deleted).
				Return(tt.mockResponse.Error).Times(tt.mockResponse.Count)

			// Mock fetcher for Startup method
			mockFetcher.EXPECT().GetProcessorRegistry().Return(nil).AnyTimes()

			app := pkg.New(
				pkg.WithAnalyzerService(mockAnalyzer),
				pkg.WithFetcherService(mockFetcher),
				pkg.WithLogger(log),
			)
			app.Startup(ctx)

			result := app.DeleteOrRestore(tt.projectID, tt.informationID, tt.deleted)
			assert.Equal(t, tt.expectedResult, result)
		})
	}
}
