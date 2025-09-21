package config

import "time"

// IConfig defines the interface for application configuration
// This interface follows SOLID principles:
// - Single Responsibility: Focus on configuration management only
// - Interface Segregation: Minimal, focused interface
// - Dependency Inversion: Abstracts configuration implementation
type IConfig interface {
	// GetDatabasePath returns the path to the database file
	GetDatabasePath() string

	// GetLogLevel returns the logging level (debug, info, warn, error)
	GetLogLevel() string

	// GetServerPort returns the server port for API
	GetServerPort() int

	// GetMaxRetries returns the maximum number of retry attempts
	GetMaxRetries() int

	// GetRetryDelay returns the delay between retry attempts
	GetRetryDelay() time.Duration

	// GetRequestTimeout returns the HTTP request timeout
	GetRequestTimeout() time.Duration

	// IsDevelopment returns true if running in development mode
	IsDevelopment() bool

	// IsProduction returns true if running in production mode
	IsProduction() bool
}

// DatabaseConfig defines database-specific configuration
type DatabaseConfig interface {
	GetDatabasePath() string
	GetConnectionPoolSize() int
	GetQueryTimeout() time.Duration
	GetMigrationPath() string
}

// NetworkConfig defines network-specific configuration
type NetworkConfig interface {
	GetRequestTimeout() time.Duration
	GetMaxRetries() int
	GetRetryDelay() time.Duration
	GetUserAgent() string
	GetProxyURL() string
}

// LoggingConfig defines logging-specific configuration
type LoggingConfig interface {
	GetLogLevel() string
	GetLogFormat() string
	GetLogFile() string
	GetMaxLogSize() int64
	GetMaxLogAge() int
}

// SecurityConfig defines security-specific configuration
type SecurityConfig interface {
	GetEncryptionKey() string
	GetJWTSecret() string
	GetPasswordMinLength() int
	GetSessionTimeout() time.Duration
	IsHTTPSRequired() bool
}

// PerformanceConfig defines performance-specific configuration
type PerformanceConfig interface {
	GetWorkerPoolSize() int
	GetBatchSize() int
	GetCacheSize() int
	GetCacheTTL() time.Duration
}

// AppConfig combines all configuration interfaces
// Follows Interface Segregation Principle by composing smaller interfaces
type AppConfig interface {
	IConfig
	DatabaseConfig
	NetworkConfig
	LoggingConfig
	SecurityConfig
	PerformanceConfig
}

// ConfigProvider defines the interface for configuration providers
// Allows different configuration sources (files, env vars, remote config)
type ConfigProvider interface {
	// Load loads configuration from the source
	Load() error

	// Get retrieves a configuration value by key
	Get(key string) interface{}

	// GetString retrieves a string configuration value
	GetString(key string) string

	// GetInt retrieves an integer configuration value
	GetInt(key string) int

	// GetBool retrieves a boolean configuration value
	GetBool(key string) bool

	// GetDuration retrieves a duration configuration value
	GetDuration(key string) time.Duration

	// Set sets a configuration value
	Set(key string, value interface{})

	// IsSet returns true if the key is set
	IsSet(key string) bool

	// Reload reloads configuration from the source
	Reload() error
}

// ConfigWatcher defines the interface for configuration change watching
type ConfigWatcher interface {
	// Watch starts watching for configuration changes
	Watch() error

	// Stop stops watching for changes
	Stop() error

	// OnChange registers a callback for configuration changes
	OnChange(callback func(key string, value interface{})) error
}

// ConfigValidator defines the interface for configuration validation
type ConfigValidator interface {
	// Validate validates the entire configuration
	Validate() error

	// ValidateKey validates a specific configuration key
	ValidateKey(key string, value interface{}) error

	// GetValidationRules returns validation rules for all keys
	GetValidationRules() map[string]ValidationRule
}

// ValidationRule defines a configuration validation rule
type ValidationRule struct {
	Required    bool
	Type        string
	MinValue    interface{}
	MaxValue    interface{}
	AllowedVals []interface{}
	Pattern     string
	Custom      func(interface{}) error
}

// ConfigManager manages configuration lifecycle
type ConfigManager interface {
	ConfigProvider
	ConfigWatcher
	ConfigValidator

	// Initialize initializes the configuration manager
	Initialize() error

	// Shutdown gracefully shuts down the configuration manager
	Shutdown() error

	// GetConfig returns the current configuration
	GetConfig() AppConfig
}
