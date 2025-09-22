package container_test

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/internal/config"
	"github.com/web4ux/internal/container"
	"github.com/web4ux/internal/service/analyzer"
	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/pkg"
	"github.com/web4ux/repository"
	"github.com/web4ux/src/logger"

	_ "modernc.org/sqlite"
)

func TestNew_LegacyConfig(t *testing.T) {
	legacyConfig := container.Config{
		DatabasePath: ":memory:",
	}

	c := container.New(legacyConfig)

	assert.NotNil(t, c)
	assert.Equal(t, legacyConfig, c.GetLegacyConfig())
	assert.NotNil(t, c.GetConfig()) // Should have created new app config
}

func TestNewWithConfig(t *testing.T) {
	appConfig := config.NewStandardConfig()

	c := container.NewWithConfig(appConfig)

	assert.NotNil(t, c)
	assert.Equal(t, appConfig, c.GetConfig())
}

func TestContainer_GetDatabase(t *testing.T) {
	tests := []struct {
		name         string
		setupFunc    func() *container.Container
		hasError     bool
		validateFunc func(*testing.T, *sql.DB)
	}{
		{
			name: "successful database creation with app config",
			setupFunc: func() *container.Container {
				appConfig := config.NewStandardConfig()
				return container.NewWithConfig(appConfig)
			},
			hasError: false,
			validateFunc: func(t *testing.T, db *sql.DB) {
				assert.NotNil(t, db)
				// Test that the database is actually connected
				err := db.Ping()
				assert.NoError(t, err)
			},
		},
		{
			name: "successful database creation with legacy config",
			setupFunc: func() *container.Container {
				legacyConfig := container.Config{
					DatabasePath: ":memory:",
				}
				return container.New(legacyConfig)
			},
			hasError: false,
			validateFunc: func(t *testing.T, db *sql.DB) {
				assert.NotNil(t, db)
				err := db.Ping()
				assert.NoError(t, err)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := tt.setupFunc()

			db, err := c.GetDatabase()

			assert.Equal(t, tt.hasError, err != nil)

			tt.validateFunc(t, db)

			// Test singleton behavior
			if !tt.hasError {
				db2, err2 := c.GetDatabase()
				assert.NoError(t, err2)
				assert.Same(t, db, db2) // Should return same instance
			}

			// Cleanup
			if db != nil {
				db.Close()
			}
		})
	}
}

func TestContainer_GetRepository(t *testing.T) {
	tests := []struct {
		name         string
		setupFunc    func() *container.Container
		hasError     bool
		validateFunc func(*testing.T, repository.IRepository, error)
	}{
		{
			name: "successful repository creation",
			setupFunc: func() *container.Container {
				appConfig := config.NewStandardConfig()
				return container.NewWithConfig(appConfig)
			},
			hasError: false,
			validateFunc: func(t *testing.T, repo repository.IRepository, err error) {
				assert.NoError(t, err)
				assert.NotNil(t, repo)
				assert.Implements(t, (*repository.IRepository)(nil), repo)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := tt.setupFunc()

			repo, err := c.GetRepository()

			assert.Equal(t, tt.hasError, err != nil)

			tt.validateFunc(t, repo, err)

			// Test singleton behavior
			if !tt.hasError {
				repo2, err2 := c.GetRepository()
				assert.NoError(t, err2)
				assert.Same(t, repo, repo2) // Should return same instance
			}

			// Cleanup
			c.Close()
		})
	}
}

func TestContainer_GetLogger(t *testing.T) {
	c := container.NewWithConfig(config.NewStandardConfig())

	logger1, err := c.GetLogger()

	assert.NoError(t, err)
	assert.NotNil(t, logger1)
	assert.Implements(t, (*logger.ILogger)(nil), logger1)

	// Test singleton behavior
	logger2, err2 := c.GetLogger()
	assert.NoError(t, err2)
	assert.Same(t, logger1, logger2) // Should return same instance
}

func TestContainer_GetFetcher(t *testing.T) {
	tests := []struct {
		name         string
		setupFunc    func() *container.Container
		hasError     bool
		validateFunc func(*testing.T, fetcher.IService, error)
	}{
		{
			name: "successful fetcher creation",
			setupFunc: func() *container.Container {
				appConfig := config.NewStandardConfig()
				return container.NewWithConfig(appConfig)
			},
			hasError: false,
			validateFunc: func(t *testing.T, svc fetcher.IService, err error) {
				assert.NoError(t, err)
				assert.NotNil(t, svc)
				assert.Implements(t, (*fetcher.IService)(nil), svc)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := tt.setupFunc()

			fetcherSvc, err := c.GetFetcher()

			assert.Equal(t, tt.hasError, err != nil)

			tt.validateFunc(t, fetcherSvc, err)

			// Test singleton behavior
			if !tt.hasError {
				fetcherSvc2, err2 := c.GetFetcher()
				assert.NoError(t, err2)
				assert.Same(t, fetcherSvc, fetcherSvc2) // Should return same instance
			}

			// Cleanup
			c.Close()
		})
	}
}

func TestContainer_GetAnalyzer(t *testing.T) {
	tests := []struct {
		name         string
		setupFunc    func() *container.Container
		hasError     bool
		validateFunc func(*testing.T, analyzer.IService, error)
	}{
		{
			name: "successful analyzer creation",
			setupFunc: func() *container.Container {
				appConfig := config.NewStandardConfig()
				return container.NewWithConfig(appConfig)
			},
			hasError: false,
			validateFunc: func(t *testing.T, svc analyzer.IService, err error) {
				assert.NoError(t, err)
				assert.NotNil(t, svc)
				assert.Implements(t, (*analyzer.IService)(nil), svc)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := tt.setupFunc()

			analyzerSvc, err := c.GetAnalyzer()

			assert.Equal(t, tt.hasError, err != nil)

			tt.validateFunc(t, analyzerSvc, err)

			// Test singleton behavior
			if !tt.hasError {
				analyzerSvc2, err2 := c.GetAnalyzer()
				assert.NoError(t, err2)
				assert.Same(t, analyzerSvc, analyzerSvc2) // Should return same instance
			}

			// Cleanup
			c.Close()
		})
	}
}

func TestContainer_GetApp(t *testing.T) {
	tests := []struct {
		name         string
		setupFunc    func() *container.Container
		hasError     bool
		validateFunc func(*testing.T, *pkg.App, error)
	}{
		{
			name: "successful app creation",
			setupFunc: func() *container.Container {
				appConfig := config.NewStandardConfig()
				return container.NewWithConfig(appConfig)
			},
			hasError: false,
			validateFunc: func(t *testing.T, app *pkg.App, err error) {
				assert.NoError(t, err)
				assert.NotNil(t, app)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := tt.setupFunc()

			app, err := c.GetApp()

			assert.Equal(t, tt.hasError, err != nil)

			tt.validateFunc(t, app, err)

			// Test singleton behavior
			if !tt.hasError {
				app2, err2 := c.GetApp()
				assert.NoError(t, err2)
				assert.Same(t, app, app2) // Should return same instance
			}

			// Cleanup
			c.Close()
		})
	}
}

func TestContainer_Close(t *testing.T) {
	tests := []struct {
		name         string
		setupFunc    func() (*container.Container, bool) // returns container and whether DB should be opened
		hasError     bool
		validateFunc func(*testing.T, error)
	}{
		{
			name: "close container without database",
			setupFunc: func() (*container.Container, bool) {
				appConfig := config.NewStandardConfig()
				return container.NewWithConfig(appConfig), false
			},
			hasError: false,
			validateFunc: func(t *testing.T, err error) {
				assert.NoError(t, err)
			},
		},
		{
			name: "close container with database",
			setupFunc: func() (*container.Container, bool) {
				appConfig := config.NewStandardConfig()
				return container.NewWithConfig(appConfig), true
			},
			hasError: false,
			validateFunc: func(t *testing.T, err error) {
				assert.NoError(t, err)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, shouldOpenDB := tt.setupFunc()

			if shouldOpenDB {
				// Open database to test closing
				db, err := c.GetDatabase()
				require.NoError(t, err)
				require.NotNil(t, db)
			}

			err := c.Close()

			assert.Equal(t, tt.hasError, err != nil)

			tt.validateFunc(t, err)
		})
	}
}

func TestContainer_ConfigMethods(t *testing.T) {
	t.Run("GetConfig with app config", func(t *testing.T) {
		appConfig := config.NewStandardConfig()
		c := container.NewWithConfig(appConfig)

		retrievedConfig := c.GetConfig()
		assert.Equal(t, appConfig, retrievedConfig)
	})

	t.Run("GetLegacyConfig", func(t *testing.T) {
		legacyConfig := container.Config{
			DatabasePath: "/test/path",
		}
		c := container.New(legacyConfig)

		retrievedConfig := c.GetLegacyConfig()
		assert.Equal(t, legacyConfig, retrievedConfig)
	})
}

func TestContainer_DependencyInjection(t *testing.T) {
	// Test that all components are properly wired together
	c := container.NewWithConfig(config.NewStandardConfig())

	// Get all services
	repo, err := c.GetRepository()
	require.NoError(t, err)

	logger, err := c.GetLogger()
	require.NoError(t, err)

	fetcherSvc, err := c.GetFetcher()
	require.NoError(t, err)

	analyzerSvc, err := c.GetAnalyzer()
	require.NoError(t, err)

	app, err := c.GetApp()
	require.NoError(t, err)

	// Verify all services are created
	assert.NotNil(t, repo)
	assert.NotNil(t, logger)
	assert.NotNil(t, fetcherSvc)
	assert.NotNil(t, analyzerSvc)
	assert.NotNil(t, app)

	// Cleanup
	c.Close()
}

func TestContainer_LoggerIndependence(t *testing.T) {
	// Test that logger doesn't depend on database and always works
	c := container.NewWithConfig(config.NewStandardConfig())

	// Logger should work independently
	logger, loggerErr := c.GetLogger()
	assert.NoError(t, loggerErr)
	assert.NotNil(t, logger)
}

func TestContainer_MultipleInstanceCreation(t *testing.T) {
	// Test creating multiple container instances
	appConfig1 := config.NewStandardConfig()
	appConfig2 := config.NewStandardConfig()

	c1 := container.NewWithConfig(appConfig1)
	c2 := container.NewWithConfig(appConfig2)

	// Each container should have its own instances
	db1, err1 := c1.GetDatabase()
	require.NoError(t, err1)

	db2, err2 := c2.GetDatabase()
	require.NoError(t, err2)

	// Databases should be different instances
	assert.NotSame(t, db1, db2)

	// Cleanup
	c1.Close()
	c2.Close()
}
