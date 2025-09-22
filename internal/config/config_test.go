package config_test

import (
	"os"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/internal/config"
)

func TestNewStandardConfig(t *testing.T) {
	cfg := config.NewStandardConfig()

	assert.NotNil(t, cfg)
	assert.Implements(t, (*config.AppConfig)(nil), cfg)

	// Test default values
	assert.Equal(t, "info", cfg.GetLogLevel())
	assert.Equal(t, "./local.db", cfg.GetDatabasePath())
	assert.Equal(t, 8080, cfg.GetServerPort())
	assert.Equal(t, 3, cfg.GetMaxRetries())
	assert.Equal(t, time.Second, cfg.GetRetryDelay())
	assert.Equal(t, 30*time.Second, cfg.GetRequestTimeout())
}

func TestStandardConfig_EnvironmentMethods(t *testing.T) {
	tests := []struct {
		name          string
		envValue      string
		isDevelopment bool
		isProduction  bool
	}{
		{
			name:          "development environment",
			envValue:      "development",
			isDevelopment: true,
			isProduction:  false,
		},
		{
			name:          "production environment",
			envValue:      "production",
			isDevelopment: false,
			isProduction:  true,
		},
		{
			name:          "test environment",
			envValue:      "test",
			isDevelopment: false,
			isProduction:  false,
		},
		{
			name:          "case insensitive development",
			envValue:      "DEVELOPMENT",
			isDevelopment: true,
			isProduction:  false,
		},
		{
			name:          "case insensitive production",
			envValue:      "PRODUCTION",
			isDevelopment: false,
			isProduction:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Set environment variable
			t.Setenv("APP_ENV", tt.envValue)

			cfg := config.NewStandardConfig()

			assert.Equal(t, tt.isDevelopment, cfg.IsDevelopment())
			assert.Equal(t, tt.isProduction, cfg.IsProduction())
		})
	}
}

func TestStandardConfig_CoreMethods(t *testing.T) {
	cfg := config.NewStandardConfig()

	// Test all core getter methods
	assert.NotEmpty(t, cfg.GetDatabasePath())
	assert.NotEmpty(t, cfg.GetLogLevel())
	assert.Greater(t, cfg.GetServerPort(), 0)
	assert.GreaterOrEqual(t, cfg.GetMaxRetries(), 0)
	assert.Greater(t, cfg.GetRetryDelay(), time.Duration(0))
	assert.Greater(t, cfg.GetRequestTimeout(), time.Duration(0))
}

func TestStandardConfig_DatabaseMethods(t *testing.T) {
	cfg := config.NewStandardConfig()

	// Test database configuration methods
	assert.Greater(t, cfg.GetConnectionPoolSize(), 0)
	assert.Greater(t, cfg.GetQueryTimeout(), time.Duration(0))
	assert.NotEmpty(t, cfg.GetMigrationPath())
}

func TestStandardConfig_NetworkMethods(t *testing.T) {
	cfg := config.NewStandardConfig()

	// Test network configuration methods
	assert.NotEmpty(t, cfg.GetUserAgent())
	// Proxy URL can be empty (default)
	_ = cfg.GetProxyURL()
}

func TestStandardConfig_LoggingMethods(t *testing.T) {
	cfg := config.NewStandardConfig()

	// Test logging configuration methods
	assert.NotEmpty(t, cfg.GetLogFormat())
	// Log file can be empty (default)
	_ = cfg.GetLogFile()
	assert.Greater(t, cfg.GetMaxLogSize(), int64(0))
	assert.Greater(t, cfg.GetMaxLogAge(), 0)
}

func TestStandardConfig_SecurityMethods(t *testing.T) {
	cfg := config.NewStandardConfig()

	// Test security configuration methods
	// Encryption key can be empty (default)
	_ = cfg.GetEncryptionKey()
	// JWT secret can be empty (default)
	_ = cfg.GetJWTSecret()
	assert.GreaterOrEqual(t, cfg.GetPasswordMinLength(), 4)
	assert.Greater(t, cfg.GetSessionTimeout(), time.Duration(0))
	// HTTPS required defaults to false
	_ = cfg.IsHTTPSRequired()
}

func TestStandardConfig_PerformanceMethods(t *testing.T) {
	cfg := config.NewStandardConfig()

	// Test performance configuration methods
	assert.Greater(t, cfg.GetWorkerPoolSize(), 0)
	assert.Greater(t, cfg.GetBatchSize(), 0)
	assert.Greater(t, cfg.GetCacheSize(), 0)
	assert.Greater(t, cfg.GetCacheTTL(), time.Duration(0))
}

func TestStandardConfig_Validate(t *testing.T) {
	tests := []struct {
		name      string
		setupFunc func() *config.StandardConfig
		hasError  bool
		errorMsg  string
	}{
		{
			name: "valid configuration",
			setupFunc: func() *config.StandardConfig {
				return config.NewStandardConfig()
			},
			hasError: false,
		},
		{
			name: "invalid server port - negative",
			setupFunc: func() *config.StandardConfig {
				t.Setenv("SERVER_PORT", "-1")
				cfg := config.NewStandardConfig()
				return cfg
			},
			hasError: true,
			errorMsg: "server port must be between 1 and 65535",
		},
		{
			name: "invalid server port - too high",
			setupFunc: func() *config.StandardConfig {
				t.Setenv("SERVER_PORT", "70000")
				cfg := config.NewStandardConfig()
				return cfg
			},
			hasError: true,
			errorMsg: "server port must be between 1 and 65535",
		},
		{
			name: "negative max retries",
			setupFunc: func() *config.StandardConfig {
				t.Setenv("SERVER_PORT", "8080") // Valid port
				t.Setenv("MAX_RETRIES", "-1")
				cfg := config.NewStandardConfig()
				return cfg
			},
			hasError: true,
			errorMsg: "max retries cannot be negative",
		},
		{
			name: "negative retry delay",
			setupFunc: func() *config.StandardConfig {
				t.Setenv("SERVER_PORT", "8080") // Valid port
				t.Setenv("MAX_RETRIES", "3")    // Valid retries
				t.Setenv("RETRY_DELAY", "-1s")
				cfg := config.NewStandardConfig()
				return cfg
			},
			hasError: true,
			errorMsg: "retry delay cannot be negative",
		},
		{
			name: "zero request timeout",
			setupFunc: func() *config.StandardConfig {
				t.Setenv("SERVER_PORT", "8080")    // Valid port
				t.Setenv("MAX_RETRIES", "3")       // Valid retries
				t.Setenv("RETRY_DELAY", "1s")      // Valid delay
				t.Setenv("REQUEST_TIMEOUT", "0s")
				cfg := config.NewStandardConfig()
				return cfg
			},
			hasError: true,
			errorMsg: "request timeout must be positive",
		},
		{
			name: "invalid log level",
			setupFunc: func() *config.StandardConfig {
				t.Setenv("SERVER_PORT", "8080")      // Valid port
				t.Setenv("MAX_RETRIES", "3")         // Valid retries
				t.Setenv("RETRY_DELAY", "1s")        // Valid delay
				t.Setenv("REQUEST_TIMEOUT", "30s")   // Valid timeout
				t.Setenv("LOG_LEVEL", "invalid")
				cfg := config.NewStandardConfig()
				return cfg
			},
			hasError: true,
			errorMsg: "invalid log level: invalid",
		},
		{
			name: "password min length too short",
			setupFunc: func() *config.StandardConfig {
				t.Setenv("SERVER_PORT", "8080")      // Valid port
				t.Setenv("MAX_RETRIES", "3")         // Valid retries
				t.Setenv("RETRY_DELAY", "1s")        // Valid delay
				t.Setenv("REQUEST_TIMEOUT", "30s")   // Valid timeout
				t.Setenv("LOG_LEVEL", "info")        // Valid log level
				t.Setenv("PASSWORD_MIN_LENGTH", "3")
				cfg := config.NewStandardConfig()
				return cfg
			},
			hasError: true,
			errorMsg: "password minimum length must be at least 4",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cfg := tt.setupFunc()
			if cfg == nil {
				t.Fatal("setupFunc returned nil config")
			}
			err := cfg.Validate()

			assert.Equal(t, tt.hasError, err != nil)
			if tt.hasError && err != nil {
				assert.Contains(t, err.Error(), tt.errorMsg)
			}
		})
	}
}

func TestValidLogLevels(t *testing.T) {
	validLevels := []string{"debug", "info", "warn", "error", "DEBUG", "INFO", "WARN", "ERROR"}

	for _, level := range validLevels {
		t.Run("valid_log_level_"+strings.ToLower(level), func(t *testing.T) {
			t.Setenv("LOG_LEVEL", level)

			cfg := config.NewStandardConfig()
			err := cfg.Validate()

			assert.NoError(t, err)
		})
	}
}

func TestGetEnvHelperFunctions(t *testing.T) {
	tests := []struct {
		name        string
		envKey      string
		envValue    string
		expectValue interface{}
		testFunc    func(*testing.T, *config.StandardConfig, interface{})
	}{
		{
			name:        "getEnvString with valid value",
			envKey:      "DATABASE_PATH",
			envValue:    "custom.db",
			expectValue: "custom.db",
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.GetDatabasePath())
			},
		},
		{
			name:        "getEnvInt with valid value",
			envKey:      "SERVER_PORT",
			envValue:    "9090",
			expectValue: 9090,
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.GetServerPort())
			},
		},
		{
			name:        "getEnvInt with invalid value uses default",
			envKey:      "SERVER_PORT",
			envValue:    "invalid",
			expectValue: 8080,
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.GetServerPort())
			},
		},
		{
			name:        "getEnvBool with valid value",
			envKey:      "HTTPS_REQUIRED",
			envValue:    "true",
			expectValue: true,
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.IsHTTPSRequired())
			},
		},
		{
			name:        "getEnvBool with invalid value uses default",
			envKey:      "HTTPS_REQUIRED",
			envValue:    "invalid",
			expectValue: false,
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.IsHTTPSRequired())
			},
		},
		{
			name:        "getEnvDuration with valid value",
			envKey:      "REQUEST_TIMEOUT",
			envValue:    "45s",
			expectValue: 45 * time.Second,
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.GetRequestTimeout())
			},
		},
		{
			name:        "getEnvDuration with invalid value uses default",
			envKey:      "REQUEST_TIMEOUT",
			envValue:    "invalid",
			expectValue: 30 * time.Second,
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.GetRequestTimeout())
			},
		},
		{
			name:        "getEnvInt64 with valid value",
			envKey:      "MAX_LOG_SIZE",
			envValue:    "200000000",
			expectValue: int64(200000000),
			testFunc: func(t *testing.T, cfg *config.StandardConfig, expected interface{}) {
				assert.Equal(t, expected, cfg.GetMaxLogSize())
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv(tt.envKey, tt.envValue)
			cfg := config.NewStandardConfig()
			tt.testFunc(t, cfg, tt.expectValue)
		})
	}
}

func TestNewConfig_WithValidation(t *testing.T) {
	t.Run("valid config creation", func(t *testing.T) {
		cfg := config.NewConfig()
		assert.NotNil(t, cfg)
		assert.Implements(t, (*config.AppConfig)(nil), cfg)
	})

	t.Run("invalid config panics", func(t *testing.T) {
		// Set invalid environment variables that would actually fail validation
		t.Setenv("SERVER_PORT", "-1")

		assert.Panics(t, func() {
			config.NewConfig()
		})
	})
}

func TestStandardConfig_InterfaceCompliance(t *testing.T) {
	cfg := config.NewStandardConfig()

	// Test that StandardConfig implements all required interfaces
	assert.Implements(t, (*config.IConfig)(nil), cfg)
	assert.Implements(t, (*config.DatabaseConfig)(nil), cfg)
	assert.Implements(t, (*config.NetworkConfig)(nil), cfg)
	assert.Implements(t, (*config.LoggingConfig)(nil), cfg)
	assert.Implements(t, (*config.SecurityConfig)(nil), cfg)
	assert.Implements(t, (*config.PerformanceConfig)(nil), cfg)
	assert.Implements(t, (*config.AppConfig)(nil), cfg)
}

func TestStandardConfig_AllEnvironmentVariables(t *testing.T) {
	// Set all environment variables and test they are read correctly
	envVars := map[string]string{
		"APP_ENV":              "production",
		"DATABASE_PATH":        "/custom/path/db.sqlite",
		"LOG_LEVEL":           "debug",
		"SERVER_PORT":         "3000",
		"MAX_RETRIES":         "5",
		"RETRY_DELAY":         "2s",
		"REQUEST_TIMEOUT":     "60s",
		"DB_POOL_SIZE":        "20",
		"DB_QUERY_TIMEOUT":    "5s",
		"MIGRATION_PATH":      "/custom/migrations",
		"USER_AGENT":          "CustomAgent/2.0",
		"PROXY_URL":           "http://proxy.example.com:8080",
		"LOG_FORMAT":          "text",
		"LOG_FILE":            "/var/log/app.log",
		"MAX_LOG_SIZE":        "50000000",
		"MAX_LOG_AGE":         "14",
		"ENCRYPTION_KEY":      "secret-key-123",
		"JWT_SECRET":          "jwt-secret-456",
		"PASSWORD_MIN_LENGTH": "12",
		"SESSION_TIMEOUT":     "48h",
		"HTTPS_REQUIRED":      "true",
		"WORKER_POOL_SIZE":    "8",
		"BATCH_SIZE":          "500",
		"CACHE_SIZE":          "5000",
		"CACHE_TTL":           "2h",
	}

	// Set all environment variables
	for key, value := range envVars {
		t.Setenv(key, value)
	}

	cfg := config.NewStandardConfig()

	// Verify all values are correctly set
	assert.True(t, cfg.IsProduction())
	assert.False(t, cfg.IsDevelopment())
	assert.Equal(t, "/custom/path/db.sqlite", cfg.GetDatabasePath())
	assert.Equal(t, "debug", cfg.GetLogLevel())
	assert.Equal(t, 3000, cfg.GetServerPort())
	assert.Equal(t, 5, cfg.GetMaxRetries())
	assert.Equal(t, 2*time.Second, cfg.GetRetryDelay())
	assert.Equal(t, 60*time.Second, cfg.GetRequestTimeout())
	assert.Equal(t, 20, cfg.GetConnectionPoolSize())
	assert.Equal(t, 5*time.Second, cfg.GetQueryTimeout())
	assert.Equal(t, "/custom/migrations", cfg.GetMigrationPath())
	assert.Equal(t, "CustomAgent/2.0", cfg.GetUserAgent())
	assert.Equal(t, "http://proxy.example.com:8080", cfg.GetProxyURL())
	assert.Equal(t, "text", cfg.GetLogFormat())
	assert.Equal(t, "/var/log/app.log", cfg.GetLogFile())
	assert.Equal(t, int64(50000000), cfg.GetMaxLogSize())
	assert.Equal(t, 14, cfg.GetMaxLogAge())
	assert.Equal(t, "secret-key-123", cfg.GetEncryptionKey())
	assert.Equal(t, "jwt-secret-456", cfg.GetJWTSecret())
	assert.Equal(t, 12, cfg.GetPasswordMinLength())
	assert.Equal(t, 48*time.Hour, cfg.GetSessionTimeout())
	assert.True(t, cfg.IsHTTPSRequired())
	assert.Equal(t, 8, cfg.GetWorkerPoolSize())
	assert.Equal(t, 500, cfg.GetBatchSize())
	assert.Equal(t, 5000, cfg.GetCacheSize())
	assert.Equal(t, 2*time.Hour, cfg.GetCacheTTL())

	// Validate the configuration
	err := cfg.Validate()
	assert.NoError(t, err)
}

func TestStandardConfig_ConfigWithoutEnvironment(t *testing.T) {
	// Clear all relevant environment variables
	envKeys := []string{
		"APP_ENV", "DATABASE_PATH", "LOG_LEVEL", "SERVER_PORT", "MAX_RETRIES",
		"RETRY_DELAY", "REQUEST_TIMEOUT", "DB_POOL_SIZE", "DB_QUERY_TIMEOUT",
		"MIGRATION_PATH", "USER_AGENT", "PROXY_URL", "LOG_FORMAT", "LOG_FILE",
		"MAX_LOG_SIZE", "MAX_LOG_AGE", "ENCRYPTION_KEY", "JWT_SECRET",
		"PASSWORD_MIN_LENGTH", "SESSION_TIMEOUT", "HTTPS_REQUIRED",
		"WORKER_POOL_SIZE", "BATCH_SIZE", "CACHE_SIZE", "CACHE_TTL",
	}

	for _, key := range envKeys {
		os.Unsetenv(key)
	}

	cfg := config.NewStandardConfig()

	// Verify all default values
	assert.True(t, cfg.IsDevelopment())
	assert.False(t, cfg.IsProduction())
	assert.Equal(t, "./local.db", cfg.GetDatabasePath())
	assert.Equal(t, "info", cfg.GetLogLevel())
	assert.Equal(t, 8080, cfg.GetServerPort())
	assert.Equal(t, 3, cfg.GetMaxRetries())
	assert.Equal(t, time.Second, cfg.GetRetryDelay())
	assert.Equal(t, 30*time.Second, cfg.GetRequestTimeout())
	assert.Equal(t, 10, cfg.GetConnectionPoolSize())
	assert.Equal(t, 10*time.Second, cfg.GetQueryTimeout())
	assert.Equal(t, "./migrations", cfg.GetMigrationPath())
	assert.Equal(t, "Web4UX/1.0", cfg.GetUserAgent())
	assert.Equal(t, "", cfg.GetProxyURL())
	assert.Equal(t, "json", cfg.GetLogFormat())
	assert.Equal(t, "", cfg.GetLogFile())
	assert.Equal(t, int64(100*1024*1024), cfg.GetMaxLogSize()) // 100MB
	assert.Equal(t, 7, cfg.GetMaxLogAge())
	assert.Equal(t, "", cfg.GetEncryptionKey())
	assert.Equal(t, "", cfg.GetJWTSecret())
	assert.Equal(t, 8, cfg.GetPasswordMinLength())
	assert.Equal(t, 24*time.Hour, cfg.GetSessionTimeout())
	assert.False(t, cfg.IsHTTPSRequired())
	assert.Equal(t, 4, cfg.GetWorkerPoolSize())
	assert.Equal(t, 100, cfg.GetBatchSize())
	assert.Equal(t, 1000, cfg.GetCacheSize())
	assert.Equal(t, time.Hour, cfg.GetCacheTTL())

	// Validate the configuration
	err := cfg.Validate()
	assert.NoError(t, err)
}
