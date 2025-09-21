package config

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"sync"
	"time"
)

// FileConfigProvider provides configuration from files
type FileConfigProvider struct {
	mu       sync.RWMutex
	filePath string
	data     map[string]interface{}
	watchers []func(string, interface{})
}

// NewFileConfigProvider creates a new file-based config provider
func NewFileConfigProvider(filePath string) *FileConfigProvider {
	return &FileConfigProvider{
		filePath: filePath,
		data:     make(map[string]interface{}),
		watchers: make([]func(string, interface{}), 0),
	}
}

// Ensure FileConfigProvider implements ConfigProvider
var _ ConfigProvider = (*FileConfigProvider)(nil)

// Load loads configuration from the file
func (f *FileConfigProvider) Load() error {
	f.mu.Lock()
	defer f.mu.Unlock()

	if _, err := os.Stat(f.filePath); os.IsNotExist(err) {
		// File doesn't exist, use defaults
		return nil
	}

	data, err := os.ReadFile(f.filePath)
	if err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	var config map[string]interface{}
	if err := json.Unmarshal(data, &config); err != nil {
		return fmt.Errorf("failed to parse config file: %w", err)
	}

	f.data = config
	return nil
}

// Get retrieves a configuration value by key
func (f *FileConfigProvider) Get(key string) interface{} {
	f.mu.RLock()
	defer f.mu.RUnlock()
	return f.data[key]
}

// GetString retrieves a string configuration value
func (f *FileConfigProvider) GetString(key string) string {
	value := f.Get(key)
	if str, ok := value.(string); ok {
		return str
	}
	return ""
}

// GetInt retrieves an integer configuration value
func (f *FileConfigProvider) GetInt(key string) int {
	value := f.Get(key)
	switch v := value.(type) {
	case int:
		return v
	case float64:
		return int(v)
	case string:
		if intVal, err := strconv.Atoi(v); err == nil {
			return intVal
		}
	}
	return 0
}

// GetBool retrieves a boolean configuration value
func (f *FileConfigProvider) GetBool(key string) bool {
	value := f.Get(key)
	if boolVal, ok := value.(bool); ok {
		return boolVal
	}
	return false
}

// GetDuration retrieves a duration configuration value
func (f *FileConfigProvider) GetDuration(key string) time.Duration {
	value := f.Get(key)
	if str, ok := value.(string); ok {
		if duration, err := time.ParseDuration(str); err == nil {
			return duration
		}
	}
	return 0
}

// Set sets a configuration value
func (f *FileConfigProvider) Set(key string, value interface{}) {
	f.mu.Lock()
	defer f.mu.Unlock()

	oldValue := f.data[key]
	f.data[key] = value

	// Notify watchers
	for _, watcher := range f.watchers {
		go watcher(key, value)
	}

	// Update the value if it changed
	if fmt.Sprintf("%v", oldValue) != fmt.Sprintf("%v", value) {
		f.notifyChange(key, value)
	}
}

// IsSet returns true if the key is set
func (f *FileConfigProvider) IsSet(key string) bool {
	f.mu.RLock()
	defer f.mu.RUnlock()
	_, exists := f.data[key]
	return exists
}

// Reload reloads configuration from the source
func (f *FileConfigProvider) Reload() error {
	return f.Load()
}

func (f *FileConfigProvider) notifyChange(key string, value interface{}) {
	for _, watcher := range f.watchers {
		go watcher(key, value)
	}
}

// EnvConfigProvider provides configuration from environment variables
type EnvConfigProvider struct {
	prefix   string
	watchers []func(string, interface{})
}

// NewEnvConfigProvider creates a new environment-based config provider
func NewEnvConfigProvider(prefix string) *EnvConfigProvider {
	return &EnvConfigProvider{
		prefix:   prefix,
		watchers: make([]func(string, interface{}), 0),
	}
}

// Ensure EnvConfigProvider implements ConfigProvider
var _ ConfigProvider = (*EnvConfigProvider)(nil)

// Load loads configuration from environment variables
func (e *EnvConfigProvider) Load() error {
	// Environment variables are always available, no loading needed
	return nil
}

// Get retrieves a configuration value by key from environment
func (e *EnvConfigProvider) Get(key string) interface{} {
	envKey := e.prefix + key
	return os.Getenv(envKey)
}

// GetString retrieves a string configuration value from environment
func (e *EnvConfigProvider) GetString(key string) string {
	envKey := e.prefix + key
	return os.Getenv(envKey)
}

// GetInt retrieves an integer configuration value from environment
func (e *EnvConfigProvider) GetInt(key string) int {
	value := e.GetString(key)
	if intVal, err := strconv.Atoi(value); err == nil {
		return intVal
	}
	return 0
}

// GetBool retrieves a boolean configuration value from environment
func (e *EnvConfigProvider) GetBool(key string) bool {
	value := e.GetString(key)
	if boolVal, err := strconv.ParseBool(value); err == nil {
		return boolVal
	}
	return false
}

// GetDuration retrieves a duration configuration value from environment
func (e *EnvConfigProvider) GetDuration(key string) time.Duration {
	value := e.GetString(key)
	if duration, err := time.ParseDuration(value); err == nil {
		return duration
	}
	return 0
}

// Set sets an environment variable (not recommended for production)
func (e *EnvConfigProvider) Set(key string, value interface{}) {
	envKey := e.prefix + key
	os.Setenv(envKey, fmt.Sprintf("%v", value))

	// Notify watchers
	for _, watcher := range e.watchers {
		go watcher(key, value)
	}
}

// IsSet returns true if the environment variable is set
func (e *EnvConfigProvider) IsSet(key string) bool {
	envKey := e.prefix + key
	_, exists := os.LookupEnv(envKey)
	return exists
}

// Reload reloads configuration (no-op for environment provider)
func (e *EnvConfigProvider) Reload() error {
	return nil
}

// CompositeConfigProvider combines multiple config providers
type CompositeConfigProvider struct {
	providers []ConfigProvider
	watchers  []func(string, interface{})
}

// NewCompositeConfigProvider creates a composite config provider
func NewCompositeConfigProvider(providers ...ConfigProvider) *CompositeConfigProvider {
	return &CompositeConfigProvider{
		providers: providers,
		watchers:  make([]func(string, interface{}), 0),
	}
}

// Ensure CompositeConfigProvider implements ConfigProvider
var _ ConfigProvider = (*CompositeConfigProvider)(nil)

// Load loads configuration from all providers
func (c *CompositeConfigProvider) Load() error {
	for _, provider := range c.providers {
		if err := provider.Load(); err != nil {
			return err
		}
	}
	return nil
}

// Get retrieves a value from the first provider that has it
func (c *CompositeConfigProvider) Get(key string) interface{} {
	for _, provider := range c.providers {
		if provider.IsSet(key) {
			return provider.Get(key)
		}
	}
	return nil
}

// GetString retrieves a string value from the first provider that has it
func (c *CompositeConfigProvider) GetString(key string) string {
	for _, provider := range c.providers {
		if provider.IsSet(key) {
			return provider.GetString(key)
		}
	}
	return ""
}

// GetInt retrieves an int value from the first provider that has it
func (c *CompositeConfigProvider) GetInt(key string) int {
	for _, provider := range c.providers {
		if provider.IsSet(key) {
			return provider.GetInt(key)
		}
	}
	return 0
}

// GetBool retrieves a bool value from the first provider that has it
func (c *CompositeConfigProvider) GetBool(key string) bool {
	for _, provider := range c.providers {
		if provider.IsSet(key) {
			return provider.GetBool(key)
		}
	}
	return false
}

// GetDuration retrieves a duration value from the first provider that has it
func (c *CompositeConfigProvider) GetDuration(key string) time.Duration {
	for _, provider := range c.providers {
		if provider.IsSet(key) {
			return provider.GetDuration(key)
		}
	}
	return 0
}

// Set sets a value in the first provider
func (c *CompositeConfigProvider) Set(key string, value interface{}) {
	if len(c.providers) > 0 {
		c.providers[0].Set(key, value)
	}

	// Notify watchers
	for _, watcher := range c.watchers {
		go watcher(key, value)
	}
}

// IsSet returns true if any provider has the key
func (c *CompositeConfigProvider) IsSet(key string) bool {
	for _, provider := range c.providers {
		if provider.IsSet(key) {
			return true
		}
	}
	return false
}

// Reload reloads configuration from all providers
func (c *CompositeConfigProvider) Reload() error {
	for _, provider := range c.providers {
		if err := provider.Reload(); err != nil {
			return err
		}
	}
	return nil
}
