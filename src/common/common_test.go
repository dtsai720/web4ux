package common_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/web4ux/src/common"
)

var (
	errTest          = errors.New("test error")
	errInvalidNumber = errors.New("invalid number")
)

type TestStruct struct {
	Value1 string
	Value2 int
	Value3 bool
}

type withOptionsTestCase struct {
	name     string
	input    *TestStruct
	options  []common.OptionalFn[TestStruct]
	expected *TestStruct
}

var withOptionsTestCases = []withOptionsTestCase{ //nolint:gochecknoglobals
	{
		name:     "no options",
		input:    &TestStruct{Value1: "initial", Value2: 0, Value3: false},
		options:  []common.OptionalFn[TestStruct]{},
		expected: &TestStruct{Value1: "initial", Value2: 0, Value3: false},
	},
	{
		name:  "single option",
		input: &TestStruct{Value1: "initial", Value2: 0, Value3: false},
		options: []common.OptionalFn[TestStruct]{
			func(s *TestStruct) { s.Value1 = "modified" },
		},
		expected: &TestStruct{Value1: "modified", Value2: 0, Value3: false},
	},
	{
		name:  "multiple options",
		input: &TestStruct{Value1: "initial", Value2: 0, Value3: false},
		options: []common.OptionalFn[TestStruct]{
			func(s *TestStruct) { s.Value1 = "modified" },
			func(s *TestStruct) { s.Value2 = 42 },
			func(s *TestStruct) { s.Value3 = true },
		},
		expected: &TestStruct{Value1: "modified", Value2: 42, Value3: true},
	},
	{
		name:  "overlapping options",
		input: &TestStruct{Value1: "initial", Value2: 0, Value3: false},
		options: []common.OptionalFn[TestStruct]{
			func(s *TestStruct) { s.Value1 = "first" },
			func(s *TestStruct) { s.Value1 = "second" },
			func(s *TestStruct) { s.Value2 = 100 },
		},
		expected: &TestStruct{Value1: "second", Value2: 100, Value3: false},
	},
	{
		name:  "empty struct with options",
		input: &TestStruct{},
		options: []common.OptionalFn[TestStruct]{
			func(s *TestStruct) { s.Value1 = "set" },
			func(s *TestStruct) { s.Value2 = 999 },
		},
		expected: &TestStruct{Value1: "set", Value2: 999, Value3: false},
	},
}

func TestWithOptions(t *testing.T) {
	t.Parallel()

	for _, tt := range withOptionsTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := common.WithOptions(tt.input, tt.options...)
			assert.Equal(t, tt.expected, result)
			// Verify that the same instance is returned
			assert.Same(t, tt.input, result)
		})
	}
}

type mustTestCase struct {
	name          string
	value         string
	err           error
	expectedValue string
	shouldPanic   bool
}

var mustTestCases = []mustTestCase{ //nolint:gochecknoglobals
	{
		name:          "no error",
		value:         "success",
		err:           nil,
		expectedValue: "success",
		shouldPanic:   false,
	},
	{
		name:        "with error should panic",
		value:       "failure",
		err:         errTest,
		shouldPanic: true,
	},
}

func TestMust(t *testing.T) {
	t.Parallel()

	for _, tt := range mustTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if tt.shouldPanic {
				assert.Panics(t, func() {
					common.Must(tt.value, tt.err)
				})
			} else {
				result := common.Must(tt.value, tt.err)
				assert.Equal(t, tt.expectedValue, result)
			}
		})
	}
}

func TestMust_WithDifferentTypes(t *testing.T) {
	t.Parallel()
	t.Run("Must with int", func(t *testing.T) {
		t.Parallel()
		result := common.Must(42, nil)
		assert.Equal(t, 42, result)
	})

	t.Run("Must with bool", func(t *testing.T) {
		t.Parallel()
		result := common.Must(true, nil)
		assert.True(t, result)
	})

	t.Run("Must with struct", func(t *testing.T) {
		t.Parallel()
		type TestStruct struct {
			Name string
		}
		input := TestStruct{Name: "test"}
		result := common.Must(input, nil)
		assert.Equal(t, input, result)
	})

	t.Run("Must with pointer", func(t *testing.T) {
		t.Parallel()
		input := &struct{ Value int }{Value: 100}
		result := common.Must(input, nil)
		assert.Equal(t, input, result)
		assert.Same(t, input, result)
	})
}

type ternaryTestCase struct {
	name       string
	condition  bool
	trueValue  any
	falseValue any
	expected   any
}

var ternaryTestCases = []ternaryTestCase{ //nolint:gochecknoglobals
	{
		name:       "condition true with strings",
		condition:  true,
		trueValue:  "yes",
		falseValue: "no",
		expected:   "yes",
	},
	{
		name:       "condition false with strings",
		condition:  false,
		trueValue:  "yes",
		falseValue: "no",
		expected:   "no",
	},
	{
		name:       "condition true with ints",
		condition:  true,
		trueValue:  100,
		falseValue: 200,
		expected:   100,
	},
	{
		name:       "condition false with ints",
		condition:  false,
		trueValue:  100,
		falseValue: 200,
		expected:   200,
	},
	{
		name:       "condition true with bools",
		condition:  true,
		trueValue:  true,
		falseValue: false,
		expected:   true,
	},
	{
		name:       "condition false with bools",
		condition:  false,
		trueValue:  true,
		falseValue: false,
		expected:   false,
	},
}

func TestTernary(t *testing.T) {
	t.Parallel()

	for _, tt := range ternaryTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			switch v := tt.trueValue.(type) {
			case string:
				if falseVal, ok := tt.falseValue.(string); ok {
					result := common.Ternary(tt.condition, v, falseVal)
					assert.Equal(t, tt.expected, result)
				}
			case int:
				if falseVal, ok := tt.falseValue.(int); ok {
					result := common.Ternary(tt.condition, v, falseVal)
					assert.Equal(t, tt.expected, result)
				}
			case bool:
				if falseVal, ok := tt.falseValue.(bool); ok {
					result := common.Ternary(tt.condition, v, falseVal)
					assert.Equal(t, tt.expected, result)
				}
			}
		})
	}
}

func TestTernary_WithComplexTypes(t *testing.T) {
	t.Parallel()
	type ComplexStruct struct {
		ID   int
		Name string
	}

	t.Run("ternary with structs", func(t *testing.T) {
		t.Parallel()
		trueStruct := ComplexStruct{ID: 1, Name: "first"}
		falseStruct := ComplexStruct{ID: 2, Name: "second"}

		result := common.Ternary(true, trueStruct, falseStruct)
		assert.Equal(t, trueStruct, result)

		result = common.Ternary(false, trueStruct, falseStruct)
		assert.Equal(t, falseStruct, result)
	})

	t.Run("ternary with slices", func(t *testing.T) {
		t.Parallel()
		trueSlice := []int{1, 2, 3}
		falseSlice := []int{4, 5, 6}

		result := common.Ternary(true, trueSlice, falseSlice)
		assert.Equal(t, trueSlice, result)

		result = common.Ternary(false, trueSlice, falseSlice)
		assert.Equal(t, falseSlice, result)
	})

	t.Run("ternary with pointers", func(t *testing.T) {
		t.Parallel()
		truePtr := &ComplexStruct{ID: 1, Name: "first"}
		falsePtr := &ComplexStruct{ID: 2, Name: "second"}

		result := common.Ternary(true, truePtr, falsePtr)
		assert.Same(t, truePtr, result)

		result = common.Ternary(false, truePtr, falsePtr)
		assert.Same(t, falsePtr, result)
	})
}

// Example usage tests to demonstrate practical scenarios.
func TestWithOptions_RealWorldExample(t *testing.T) {
	t.Parallel()
	type Config struct {
		Host     string
		Port     int
		SSL      bool
		Timeout  int
		Username string
		Password string
	}

	// Simulate creating a configuration with optional parameters
	defaultConfig := &Config{
		Host:    "localhost",
		Port:    8080,
		SSL:     false,
		Timeout: 30,
	}

	// Option functions that could be used in real applications
	WithHost := func(host string) common.OptionalFn[Config] {
		return func(c *Config) { c.Host = host }
	}

	WithSSL := func(enabled bool) common.OptionalFn[Config] {
		return func(c *Config) { c.SSL = enabled }
	}

	WithAuth := func(username, password string) common.OptionalFn[Config] {
		return func(c *Config) {
			c.Username = username
			c.Password = password
		}
	}

	result := common.WithOptions(defaultConfig,
		WithHost("example.com"),
		WithSSL(true),
		WithAuth("admin", "secret"),
	)

	expected := &Config{
		Host:     "example.com",
		Port:     8080,
		SSL:      true,
		Timeout:  30,
		Username: "admin",
		Password: "secret",
	}

	assert.Equal(t, expected, result)
}

func TestMust_RealWorldExample(t *testing.T) {
	t.Parallel()
	// Simulate a function that might return an error
	parseNumber := func(s string) (int, error) {
		if s == "42" {
			return 42, nil
		}

		return 0, errInvalidNumber
	}

	// Test successful case
	result := common.Must(parseNumber("42"))
	assert.Equal(t, 42, result)

	// Test panic case
	assert.Panics(t, func() {
		common.Must(parseNumber("invalid"))
	})
}

func TestTernary_RealWorldExample(t *testing.T) {
	t.Parallel()
	// Simulate choosing different message based on condition
	isSuccess := true
	message := common.Ternary(isSuccess, "Operation completed successfully", "Operation failed")
	assert.Equal(t, "Operation completed successfully", message)

	isSuccess = false
	message = common.Ternary(isSuccess, "Operation completed successfully", "Operation failed")
	assert.Equal(t, "Operation failed", message)

	// Simulate choosing different configurations
	isDevelopment := true
	dbHost := common.Ternary(isDevelopment, "localhost", "prod-db.example.com")
	assert.Equal(t, "localhost", dbHost)

	isDevelopment = false
	dbHost = common.Ternary(isDevelopment, "localhost", "prod-db.example.com")
	assert.Equal(t, "prod-db.example.com", dbHost)
}
