package pkg_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/internal/service/fetcher"
	mock_internal_service_analyzer "github.com/web4ux/mocks/internal_service_analyzer"
	mock_internal_service_fetcher "github.com/web4ux/mocks/internal_service_fetcher"
	"github.com/web4ux/pkg"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/types"
	"go.uber.org/mock/gomock"
)

func TestNew(t *testing.T) {
	tests := []struct {
		name     string
		options  []common.OptionalFn[pkg.App]
		validate func(*testing.T, *pkg.App)
	}{
		{
			name:    "creates app with no options",
			options: []common.OptionalFn[pkg.App]{},
			validate: func(t *testing.T, app *pkg.App) {
				assert.Nil(t, app.GetFetcher())
				assert.Nil(t, app.GetAnalyzer())
				assert.Nil(t, app.GetLogger())
				assert.Nil(t, app.GetContext())
				assert.Nil(t, app.GetSyncManager())
			},
		},
		{
			name: "creates app with fetcher service option",
			options: []common.OptionalFn[pkg.App]{
				pkg.WithFetcherService(&mock_internal_service_fetcher.MockIService{}),
			},
			validate: func(t *testing.T, app *pkg.App) {
				assert.NotNil(t, app.GetFetcher())
				assert.IsType(t, &mock_internal_service_fetcher.MockIService{}, app.GetFetcher())
			},
		},
		{
			name: "creates app with analyzer service option",
			options: []common.OptionalFn[pkg.App]{
				pkg.WithAnalyzerService(&mock_internal_service_analyzer.MockIService{}),
			},
			validate: func(t *testing.T, app *pkg.App) {
				assert.NotNil(t, app.GetAnalyzer())
				assert.IsType(t, &mock_internal_service_analyzer.MockIService{}, app.GetAnalyzer())
			},
		},
		{
			name: "creates app with logger option",
			options: []common.OptionalFn[pkg.App]{
				pkg.WithLogger(logger.NewTestLogger()),
			},
			validate: func(t *testing.T, app *pkg.App) {
				assert.NotNil(t, app.GetLogger())
			},
		},
		{
			name: "creates app with all options",
			options: []common.OptionalFn[pkg.App]{
				pkg.WithFetcherService(&mock_internal_service_fetcher.MockIService{}),
				pkg.WithAnalyzerService(&mock_internal_service_analyzer.MockIService{}),
				pkg.WithLogger(logger.NewTestLogger()),
			},
			validate: func(t *testing.T, app *pkg.App) {
				assert.NotNil(t, app.GetFetcher())
				assert.NotNil(t, app.GetAnalyzer())
				assert.NotNil(t, app.GetLogger())
				assert.IsType(t, &mock_internal_service_fetcher.MockIService{}, app.GetFetcher())
				assert.IsType(t, &mock_internal_service_analyzer.MockIService{}, app.GetAnalyzer())
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := pkg.New(tt.options...)
			require.NotNil(t, got)
			tt.validate(t, got)
		})
	}
}

func TestWithFetcherService(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockService := mock_internal_service_fetcher.NewMockIService(ctrl)
	app := &pkg.App{}

	option := pkg.WithFetcherService(mockService)
	option(app)

	assert.Equal(t, mockService, app.GetFetcher())
}

func TestWithAnalyzerService(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	mockService := mock_internal_service_analyzer.NewMockIService(ctrl)
	app := &pkg.App{}

	option := pkg.WithAnalyzerService(mockService)
	option(app)

	assert.Equal(t, mockService, app.GetAnalyzer())
}

func TestWithLogger(t *testing.T) {
	log := logger.NewTestLogger()
	app := &pkg.App{}

	option := pkg.WithLogger(log)
	option(app)

	assert.Equal(t, log, app.GetLogger())
}

func TestApp_Startup(t *testing.T) {
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	tests := []struct {
		name                string
		fetcherRegistryMock types.MockItem[*fetcher.ProjectProcessorRegistry]
		expectedContext     bool
		expectedSyncManager bool
	}{
		{
			name: "startup initializes context and sync manager",
			fetcherRegistryMock: types.MockItem[*fetcher.ProjectProcessorRegistry]{
				Count: 1,
				Error: nil,
				Item:  fetcher.NewProjectProcessorRegistry(),
			},
			expectedContext:     true,
			expectedSyncManager: true,
		},
		{
			name: "startup initializes context even when sync manager creation fails",
			fetcherRegistryMock: types.MockItem[*fetcher.ProjectProcessorRegistry]{
				Count: 1,
				Error: nil,
				Item:  nil,
			},
			expectedContext:     true,
			expectedSyncManager: true, // Startup still creates sync manager even with nil registry
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockFetcher := mock_internal_service_fetcher.NewMockIService(ctrl)
			log := logger.NewTestLogger()

			mockFetcher.EXPECT().GetProcessorRegistry().
				Return(tt.fetcherRegistryMock.Item).
				Times(tt.fetcherRegistryMock.Count)

			app := pkg.New(
				pkg.WithFetcherService(mockFetcher),
				pkg.WithLogger(log),
			)

			ctx := context.Background()
			app.Startup(ctx)

			if tt.expectedContext {
				assert.Equal(t, ctx, app.GetContext())
			}
			if tt.expectedSyncManager {
				assert.NotNil(t, app.GetSyncManager())
			}
		})
	}
}
