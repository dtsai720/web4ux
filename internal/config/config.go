package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// StandardConfig implements the AppConfig interface
type StandardConfig struct {
	// Core settings
	environment    string
	databasePath   string
	logLevel       string
	serverPort     int
	maxRetries     int
	retryDelay     time.Duration
	requestTimeout time.Duration

	// Database settings
	connectionPoolSize int
	queryTimeout       time.Duration
	migrationPath      string

	// Network settings
	userAgent string
	proxyURL  string

	// Logging settings
	logFormat  string
	logFile    string
	maxLogSize int64
	maxLogAge  int

	// Security settings
	encryptionKey     string
	jwtSecret         string
	passwordMinLength int
	sessionTimeout    time.Duration
	httpsRequired     bool

	// Performance settings
	workerPoolSize int
	batchSize      int
	cacheSize      int
	cacheTTL       time.Duration
}

// NewStandardConfig creates a new standard configuration with defaults
func NewStandardConfig() *StandardConfig {
	return &StandardConfig{
		// Core defaults
		environment:    getEnvString("APP_ENV", "development"),
		databasePath:   getEnvString("DATABASE_PATH", "./local.db"),
		logLevel:       getEnvString("LOG_LEVEL", "info"),
		serverPort:     getEnvInt("SERVER_PORT", 8080),
		maxRetries:     getEnvInt("MAX_RETRIES", 3),
		retryDelay:     getEnvDuration("RETRY_DELAY", 1*time.Second),
		requestTimeout: getEnvDuration("REQUEST_TIMEOUT", 30*time.Second),

		// Database defaults
		connectionPoolSize: getEnvInt("DB_POOL_SIZE", 10),
		queryTimeout:       getEnvDuration("DB_QUERY_TIMEOUT", 10*time.Second),
		migrationPath:      getEnvString("MIGRATION_PATH", "./migrations"),

		// Network defaults
		userAgent: getEnvString("USER_AGENT", "Web4UX/1.0"),
		proxyURL:  getEnvString("PROXY_URL", ""),

		// Logging defaults
		logFormat:  getEnvString("LOG_FORMAT", "json"),
		logFile:    getEnvString("LOG_FILE", ""),
		maxLogSize: getEnvInt64("MAX_LOG_SIZE", 100*1024*1024), // 100MB
		maxLogAge:  getEnvInt("MAX_LOG_AGE", 7),                // 7 days

		// Security defaults
		encryptionKey:     getEnvString("ENCRYPTION_KEY", ""),
		jwtSecret:         getEnvString("JWT_SECRET", ""),
		passwordMinLength: getEnvInt("PASSWORD_MIN_LENGTH", 8),
		sessionTimeout:    getEnvDuration("SESSION_TIMEOUT", 24*time.Hour),
		httpsRequired:     getEnvBool("HTTPS_REQUIRED", false),

		// Performance defaults
		workerPoolSize: getEnvInt("WORKER_POOL_SIZE", 4),
		batchSize:      getEnvInt("BATCH_SIZE", 100),
		cacheSize:      getEnvInt("CACHE_SIZE", 1000),
		cacheTTL:       getEnvDuration("CACHE_TTL", 1*time.Hour),
	}
}

// Ensure StandardConfig implements AppConfig
var _ AppConfig = (*StandardConfig)(nil)

// Core configuration methods
func (c *StandardConfig) GetDatabasePath() string          { return c.databasePath }
func (c *StandardConfig) GetLogLevel() string              { return c.logLevel }
func (c *StandardConfig) GetServerPort() int               { return c.serverPort }
func (c *StandardConfig) GetMaxRetries() int               { return c.maxRetries }
func (c *StandardConfig) GetRetryDelay() time.Duration     { return c.retryDelay }
func (c *StandardConfig) GetRequestTimeout() time.Duration { return c.requestTimeout }

func (c *StandardConfig) IsDevelopment() bool {
	return strings.ToLower(c.environment) == "development"
}

func (c *StandardConfig) IsProduction() bool {
	return strings.ToLower(c.environment) == "production"
}

// Database configuration methods
func (c *StandardConfig) GetConnectionPoolSize() int     { return c.connectionPoolSize }
func (c *StandardConfig) GetQueryTimeout() time.Duration { return c.queryTimeout }
func (c *StandardConfig) GetMigrationPath() string       { return c.migrationPath }

// Network configuration methods
func (c *StandardConfig) GetUserAgent() string { return c.userAgent }
func (c *StandardConfig) GetProxyURL() string  { return c.proxyURL }

// Logging configuration methods
func (c *StandardConfig) GetLogFormat() string { return c.logFormat }
func (c *StandardConfig) GetLogFile() string   { return c.logFile }
func (c *StandardConfig) GetMaxLogSize() int64 { return c.maxLogSize }
func (c *StandardConfig) GetMaxLogAge() int    { return c.maxLogAge }

// Security configuration methods
func (c *StandardConfig) GetEncryptionKey() string         { return c.encryptionKey }
func (c *StandardConfig) GetJWTSecret() string             { return c.jwtSecret }
func (c *StandardConfig) GetPasswordMinLength() int        { return c.passwordMinLength }
func (c *StandardConfig) GetSessionTimeout() time.Duration { return c.sessionTimeout }
func (c *StandardConfig) IsHTTPSRequired() bool            { return c.httpsRequired }

// Performance configuration methods
func (c *StandardConfig) GetWorkerPoolSize() int     { return c.workerPoolSize }
func (c *StandardConfig) GetBatchSize() int          { return c.batchSize }
func (c *StandardConfig) GetCacheSize() int          { return c.cacheSize }
func (c *StandardConfig) GetCacheTTL() time.Duration { return c.cacheTTL }

// Helper functions for environment variable parsing
func getEnvString(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}

// Validation methods
func (c *StandardConfig) Validate() error {
	if c.databasePath == "" {
		return fmt.Errorf("database path is required")
	}

	if c.serverPort <= 0 || c.serverPort > 65535 {
		return fmt.Errorf("server port must be between 1 and 65535")
	}

	if c.maxRetries < 0 {
		return fmt.Errorf("max retries cannot be negative")
	}

	if c.retryDelay < 0 {
		return fmt.Errorf("retry delay cannot be negative")
	}

	if c.requestTimeout <= 0 {
		return fmt.Errorf("request timeout must be positive")
	}

	validLogLevels := map[string]bool{
		"debug": true,
		"info":  true,
		"warn":  true,
		"error": true,
	}
	if !validLogLevels[strings.ToLower(c.logLevel)] {
		return fmt.Errorf("invalid log level: %s", c.logLevel)
	}

	if c.passwordMinLength < 4 {
		return fmt.Errorf("password minimum length must be at least 4")
	}

	return nil
}

// Factory function that creates config based on environment
func NewConfig() AppConfig {
	config := NewStandardConfig()

	// Validate configuration
	if err := config.Validate(); err != nil {
		panic(fmt.Sprintf("Configuration validation failed: %v", err))
	}

	return config
}
