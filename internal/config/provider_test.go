package config_test

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/internal/config"
)

func TestNewFileConfigProvider(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		filename string
	}{
		{
			name:     "creates valid file config provider",
			filename: "test.json",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			provider := config.NewFileConfigProvider(tt.filename)

			assert.NotNil(t, provider)
			assert.Implements(t, (*config.ConfigProvider)(nil), provider)
		})
	}
}

func TestFileConfigProvider_LoadNonExistentFile(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		filename string
		hasError bool
	}{
		{
			name:     "nonexistent file should not error",
			filename: "nonexistent.json",
			hasError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			provider := config.NewFileConfigProvider(tt.filename)
			err := provider.Load()

			assert.Equal(t, tt.hasError, err != nil)
		})
	}
}

func TestFileConfigProvider_LoadValidFile(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		testData  map[string]interface{}
		hasError  bool
		validate  func(*testing.T, config.ConfigProvider)
	}{
		{
			name: "valid config file with various types",
			testData: map[string]interface{}{
				"string_key":   "test_value",
				"int_key":      42,
				"bool_key":     true,
				"duration_key": "5s",
			},
			hasError: false,
			validate: func(t *testing.T, provider config.ConfigProvider) {
				assert.Equal(t, "test_value", provider.GetString("string_key"))
				assert.Equal(t, 42, provider.GetInt("int_key"))
				assert.True(t, provider.GetBool("bool_key"))
				assert.Equal(t, 5*time.Second, provider.GetDuration("duration_key"))
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			tmpDir := t.TempDir()
			configFile := filepath.Join(tmpDir, "config.json")

			data, err := json.Marshal(tt.testData)
			require.NoError(t, err)

			err = os.WriteFile(configFile, data, 0644)
			require.NoError(t, err)

			provider := config.NewFileConfigProvider(configFile)
			err = provider.Load()

			assert.Equal(t, tt.hasError, err != nil)
			if !tt.hasError {
				tt.validate(t, provider)
			}
		})
	}
}

func TestFileConfigProvider_LoadInvalidJSON(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		invalidJSON string
		hasError    bool
		errorMsg    string
	}{
		{
			name:        "invalid JSON syntax",
			invalidJSON: `{"invalid": json}`,
			hasError:    true,
			errorMsg:    "failed to parse config file",
		},
		{
			name:        "incomplete JSON object",
			invalidJSON: `{"key": "value"`,
			hasError:    true,
			errorMsg:    "failed to parse config file",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			tmpDir := t.TempDir()
			configFile := filepath.Join(tmpDir, "invalid.json")

			err := os.WriteFile(configFile, []byte(tt.invalidJSON), 0644)
			require.NoError(t, err)

			provider := config.NewFileConfigProvider(configFile)
			err = provider.Load()

			assert.Equal(t, tt.hasError, err != nil)
			if tt.hasError {
				assert.Contains(t, err.Error(), tt.errorMsg)
			}
		})
	}
}

func TestFileConfigProvider_LoadUnreadableFile(t *testing.T) {
	// Create a file and make it unreadable
	tmpDir := t.TempDir()
	configFile := filepath.Join(tmpDir, "unreadable.json")

	err := os.WriteFile(configFile, []byte(`{}`), 0644)
	require.NoError(t, err)

	// Make file unreadable
	err = os.Chmod(configFile, 0000)
	require.NoError(t, err)
	defer os.Chmod(configFile, 0644) // Restore permissions for cleanup

	provider := config.NewFileConfigProvider(configFile)

	err = provider.Load()
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to read config file")
}

func TestFileConfigProvider_GetMethods(t *testing.T) {
	provider := config.NewFileConfigProvider("test.json")

	// Test with empty data
	assert.Equal(t, "", provider.GetString("nonexistent"))
	assert.Equal(t, 0, provider.GetInt("nonexistent"))
	assert.False(t, provider.GetBool("nonexistent"))
	assert.Equal(t, time.Duration(0), provider.GetDuration("nonexistent"))
	assert.Nil(t, provider.Get("nonexistent"))

	// Set test data
	provider.Set("string_key", "test_value")
	provider.Set("int_key", 42)
	provider.Set("float_key", 3.14)
	provider.Set("bool_key", true)
	provider.Set("duration_key", "10s")
	provider.Set("string_int", "123")

	// Test Get method
	assert.Equal(t, "test_value", provider.Get("string_key"))
	assert.Equal(t, 42, provider.Get("int_key"))

	// Test GetString method
	assert.Equal(t, "test_value", provider.GetString("string_key"))
	assert.Equal(t, "", provider.GetString("int_key")) // Non-string should return empty

	// Test GetInt method
	assert.Equal(t, 42, provider.GetInt("int_key"))
	assert.Equal(t, 3, provider.GetInt("float_key"))    // Float should convert to int
	assert.Equal(t, 123, provider.GetInt("string_int")) // String number should convert
	assert.Equal(t, 0, provider.GetInt("string_key"))   // Non-numeric string should return 0

	// Test GetBool method
	assert.True(t, provider.GetBool("bool_key"))
	assert.False(t, provider.GetBool("string_key")) // Non-bool should return false

	// Test GetDuration method
	assert.Equal(t, 10*time.Second, provider.GetDuration("duration_key"))
	assert.Equal(t, time.Duration(0), provider.GetDuration("string_key")) // Invalid duration should return 0
}

func TestFileConfigProvider_SetAndIsSet(t *testing.T) {
	provider := config.NewFileConfigProvider("test.json")

	// Test IsSet with empty data
	assert.False(t, provider.IsSet("test_key"))

	// Set a value
	provider.Set("test_key", "test_value")

	// Test IsSet after setting
	assert.True(t, provider.IsSet("test_key"))
	assert.Equal(t, "test_value", provider.GetString("test_key"))
}

func TestFileConfigProvider_Reload(t *testing.T) {
	// Create temporary file
	tmpDir := t.TempDir()
	configFile := filepath.Join(tmpDir, "config.json")

	testData := map[string]interface{}{
		"key1": "value1",
	}

	data, err := json.Marshal(testData)
	require.NoError(t, err)

	err = os.WriteFile(configFile, data, 0644)
	require.NoError(t, err)

	provider := config.NewFileConfigProvider(configFile)

	// Load initial data
	err = provider.Load()
	require.NoError(t, err)
	assert.Equal(t, "value1", provider.GetString("key1"))

	// Modify file
	testData["key1"] = "value2"
	testData["key2"] = "value3"

	data, err = json.Marshal(testData)
	require.NoError(t, err)

	err = os.WriteFile(configFile, data, 0644)
	require.NoError(t, err)

	// Reload
	err = provider.Reload()
	assert.NoError(t, err)

	// Verify updated values
	assert.Equal(t, "value2", provider.GetString("key1"))
	assert.Equal(t, "value3", provider.GetString("key2"))
}

func TestNewEnvConfigProvider(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		prefix string
	}{
		{
			name:   "creates valid env config provider",
			prefix: "TEST_",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			provider := config.NewEnvConfigProvider(tt.prefix)

			assert.NotNil(t, provider)
			assert.Implements(t, (*config.ConfigProvider)(nil), provider)
		})
	}
}

func TestEnvConfigProvider_Load(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		prefix   string
		hasError bool
	}{
		{
			name:     "env provider load should always succeed",
			prefix:   "TEST_",
			hasError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			provider := config.NewEnvConfigProvider(tt.prefix)
			err := provider.Load()

			assert.Equal(t, tt.hasError, err != nil)
		})
	}
}

func TestEnvConfigProvider_GetMethods(t *testing.T) {
	prefix := "TEST_CONFIG_"
	provider := config.NewEnvConfigProvider(prefix)

	// Set environment variables
	t.Setenv(prefix+"STRING", "test_value")
	t.Setenv(prefix+"INT", "42")
	t.Setenv(prefix+"BOOL", "true")
	t.Setenv(prefix+"DURATION", "30s")
	t.Setenv(prefix+"INT_INVALID", "not_a_number")
	t.Setenv(prefix+"BOOL_INVALID", "not_a_bool")
	t.Setenv(prefix+"DURATION_INVALID", "not_a_duration")

	// Test Get method
	assert.Equal(t, "test_value", provider.Get("STRING"))
	assert.Equal(t, "", provider.Get("NONEXISTENT"))

	// Test GetString method
	assert.Equal(t, "test_value", provider.GetString("STRING"))
	assert.Equal(t, "", provider.GetString("NONEXISTENT"))

	// Test GetInt method
	assert.Equal(t, 42, provider.GetInt("INT"))
	assert.Equal(t, 0, provider.GetInt("INT_INVALID"))
	assert.Equal(t, 0, provider.GetInt("NONEXISTENT"))

	// Test GetBool method
	assert.True(t, provider.GetBool("BOOL"))
	assert.False(t, provider.GetBool("BOOL_INVALID"))
	assert.False(t, provider.GetBool("NONEXISTENT"))

	// Test GetDuration method
	assert.Equal(t, 30*time.Second, provider.GetDuration("DURATION"))
	assert.Equal(t, time.Duration(0), provider.GetDuration("DURATION_INVALID"))
	assert.Equal(t, time.Duration(0), provider.GetDuration("NONEXISTENT"))
}

func TestEnvConfigProvider_SetAndIsSet(t *testing.T) {
	prefix := "TEST_SET_"
	provider := config.NewEnvConfigProvider(prefix)

	// Test IsSet with nonexistent variable
	assert.False(t, provider.IsSet("NONEXISTENT"))

	// Set a value
	provider.Set("TEST_KEY", "test_value")

	// Test IsSet after setting
	assert.True(t, provider.IsSet("TEST_KEY"))
	assert.Equal(t, "test_value", provider.GetString("TEST_KEY"))

	// Clean up happens automatically with t.Setenv
}

func TestEnvConfigProvider_Reload(t *testing.T) {
	provider := config.NewEnvConfigProvider("TEST_")

	err := provider.Reload()
	assert.NoError(t, err) // Should always succeed for env provider
}

func TestNewCompositeConfigProvider(t *testing.T) {
	fileProvider := config.NewFileConfigProvider("test.json")
	envProvider := config.NewEnvConfigProvider("TEST_")

	composite := config.NewCompositeConfigProvider(fileProvider, envProvider)

	assert.NotNil(t, composite)
	assert.Implements(t, (*config.ConfigProvider)(nil), composite)
}

func TestCompositeConfigProvider_Load(t *testing.T) {
	// Create a valid file provider
	tmpDir := t.TempDir()
	configFile := filepath.Join(tmpDir, "config.json")
	testData := map[string]interface{}{"key": "value"}
	data, err := json.Marshal(testData)
	require.NoError(t, err)
	err = os.WriteFile(configFile, data, 0644)
	require.NoError(t, err)

	fileProvider := config.NewFileConfigProvider(configFile)
	envProvider := config.NewEnvConfigProvider("TEST_")

	composite := config.NewCompositeConfigProvider(fileProvider, envProvider)

	err = composite.Load()
	assert.NoError(t, err)
}

func TestCompositeConfigProvider_LoadWithError(t *testing.T) {
	// Create an invalid file provider
	tmpDir := t.TempDir()
	configFile := filepath.Join(tmpDir, "invalid.json")
	err := os.WriteFile(configFile, []byte(`{invalid json}`), 0644)
	require.NoError(t, err)

	fileProvider := config.NewFileConfigProvider(configFile)
	envProvider := config.NewEnvConfigProvider("TEST_")

	composite := config.NewCompositeConfigProvider(fileProvider, envProvider)

	err = composite.Load()
	assert.Error(t, err)
}

func TestCompositeConfigProvider_PriorityOrder(t *testing.T) {
	// Create file provider with test data
	tmpDir := t.TempDir()
	configFile := filepath.Join(tmpDir, "config.json")
	testData := map[string]interface{}{
		"file_only": "file_value",
		"shared":    "file_shared_value",
	}
	data, err := json.Marshal(testData)
	require.NoError(t, err)
	err = os.WriteFile(configFile, data, 0644)
	require.NoError(t, err)

	// Set environment variables
	prefix := "TEST_COMPOSITE_"
	t.Setenv(prefix+"ENV_ONLY", "env_value")
	t.Setenv(prefix+"SHARED", "env_shared_value")

	fileProvider := config.NewFileConfigProvider(configFile)
	envProvider := config.NewEnvConfigProvider(prefix)

	// File provider first - should have priority
	composite := config.NewCompositeConfigProvider(fileProvider, envProvider)

	err = composite.Load()
	require.NoError(t, err)

	// Test priority: first provider wins for shared keys
	assert.Equal(t, "file_shared_value", composite.GetString("shared"))
	assert.Equal(t, "file_value", composite.GetString("file_only"))
	assert.Equal(t, "env_value", composite.GetString("ENV_ONLY"))

	// Test IsSet method
	assert.True(t, composite.IsSet("shared"))
	assert.True(t, composite.IsSet("file_only"))
	assert.True(t, composite.IsSet("ENV_ONLY"))
	assert.False(t, composite.IsSet("nonexistent"))
}

func TestCompositeConfigProvider_SetAndGetMethods(t *testing.T) {
	fileProvider := config.NewFileConfigProvider("test.json")
	envProvider := config.NewEnvConfigProvider("TEST_")

	composite := config.NewCompositeConfigProvider(fileProvider, envProvider)

	// Test Get methods with empty data
	assert.Nil(t, composite.Get("nonexistent"))
	assert.Equal(t, "", composite.GetString("nonexistent"))
	assert.Equal(t, 0, composite.GetInt("nonexistent"))
	assert.False(t, composite.GetBool("nonexistent"))
	assert.Equal(t, time.Duration(0), composite.GetDuration("nonexistent"))

	// Set a value (should go to first provider)
	composite.Set("test_key", "test_value")

	// Verify it's retrievable
	assert.Equal(t, "test_value", composite.GetString("test_key"))
	assert.True(t, composite.IsSet("test_key"))
}

func TestCompositeConfigProvider_Reload(t *testing.T) {
	// Create file provider
	tmpDir := t.TempDir()
	configFile := filepath.Join(tmpDir, "config.json")
	testData := map[string]interface{}{"key": "value"}
	data, err := json.Marshal(testData)
	require.NoError(t, err)
	err = os.WriteFile(configFile, data, 0644)
	require.NoError(t, err)

	fileProvider := config.NewFileConfigProvider(configFile)
	envProvider := config.NewEnvConfigProvider("TEST_")

	composite := config.NewCompositeConfigProvider(fileProvider, envProvider)

	err = composite.Load()
	require.NoError(t, err)

	err = composite.Reload()
	assert.NoError(t, err)
}

func TestCompositeConfigProvider_EmptyProviders(t *testing.T) {
	composite := config.NewCompositeConfigProvider()

	err := composite.Load()
	assert.NoError(t, err)

	err = composite.Reload()
	assert.NoError(t, err)

	// All methods should return default values
	assert.Nil(t, composite.Get("key"))
	assert.Equal(t, "", composite.GetString("key"))
	assert.Equal(t, 0, composite.GetInt("key"))
	assert.False(t, composite.GetBool("key"))
	assert.Equal(t, time.Duration(0), composite.GetDuration("key"))
	assert.False(t, composite.IsSet("key"))

	// Set should not panic but won't do anything
	composite.Set("key", "value")
	assert.False(t, composite.IsSet("key"))
}

func TestCompositeConfigProvider_TypeConversions(t *testing.T) {
	provider := config.NewFileConfigProvider("test.json")
	composite := config.NewCompositeConfigProvider(provider)

	// Set various types
	composite.Set("string", "test")
	composite.Set("int", 42)
	composite.Set("float", 3.14)
	composite.Set("bool", true)
	composite.Set("duration", "5s")
	composite.Set("string_int", "123")
	composite.Set("string_bool", "false")

	// Test type conversions
	assert.Equal(t, "test", composite.GetString("string"))
	assert.Equal(t, 42, composite.GetInt("int"))
	assert.Equal(t, 3, composite.GetInt("float"))
	assert.Equal(t, 123, composite.GetInt("string_int"))
	assert.True(t, composite.GetBool("bool"))
	assert.False(t, composite.GetBool("string_bool"))
	assert.Equal(t, 5*time.Second, composite.GetDuration("duration"))
}

func TestFileConfigProvider_ConcurrentAccess(t *testing.T) {
	provider := config.NewFileConfigProvider("test.json")

	// Test concurrent reads and writes
	done := make(chan bool, 2)

	// Writer goroutine
	go func() {
		for i := range 100 {
			provider.Set("key", i)
		}
		done <- true
	}()

	// Reader goroutine
	go func() {
		for range 100 {
			_ = provider.GetInt("key")
			_ = provider.IsSet("key")
		}
		done <- true
	}()

	// Wait for both goroutines
	<-done
	<-done

	// Should not panic or race
	assert.True(t, provider.IsSet("key"))
}
