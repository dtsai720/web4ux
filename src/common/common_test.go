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

// Result[T] type tests
func TestNewResult(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		value         string
		err           error
		expectedValue string
		expectedError bool
	}{
		{
			name:          "successful result with string value",
			value:         "test value",
			err:           nil,
			expectedValue: "test value",
			expectedError: false,
		},
		{
			name:          "error result with string value",
			value:         "error value",
			err:           errTest,
			expectedValue: "error value",
			expectedError: true,
		},
		{
			name:          "successful result with empty string",
			value:         "",
			err:           nil,
			expectedValue: "",
			expectedError: false,
		},
		{
			name:          "error result with empty string",
			value:         "",
			err:           errTest,
			expectedValue: "",
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := common.NewResult(tt.value, tt.err)

			assert.Equal(t, tt.expectedValue, result.Value)
			assert.Equal(t, tt.expectedError, result.Error != nil)
			if tt.expectedError {
				assert.Equal(t, errTest.Error(), result.Error.Error())
			}
		})
	}
}

func TestNewResult_DifferentTypes(t *testing.T) {
	t.Parallel()

	t.Run("integer result", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(42, nil)
		assert.Equal(t, 42, result.Value)
		assert.NoError(t, result.Error)
	})

	t.Run("boolean result", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(true, nil)
		assert.Equal(t, true, result.Value)
		assert.NoError(t, result.Error)
	})

	t.Run("slice result", func(t *testing.T) {
		t.Parallel()
		slice := []string{"a", "b", "c"}
		result := common.NewResult(slice, nil)
		assert.Equal(t, slice, result.Value)
		assert.NoError(t, result.Error)
	})

	t.Run("struct result", func(t *testing.T) {
		t.Parallel()
		type TestStruct struct {
			Name string
			ID   int
		}
		testStruct := TestStruct{Name: "test", ID: 123}
		result := common.NewResult(testStruct, nil)
		assert.Equal(t, testStruct, result.Value)
		assert.NoError(t, result.Error)
	})

	t.Run("pointer result", func(t *testing.T) {
		t.Parallel()
		type TestStruct struct {
			Name string
		}
		testStruct := &TestStruct{Name: "test"}
		result := common.NewResult(testStruct, nil)
		assert.Same(t, testStruct, result.Value)
		assert.NoError(t, result.Error)
	})
}

func TestResult_IsOk(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		result   common.Result[string]
		expected bool
	}{
		{
			name:     "result with no error should be ok",
			result:   common.NewResult("success", nil),
			expected: true,
		},
		{
			name:     "result with error should not be ok",
			result:   common.NewResult("failed", errTest),
			expected: false,
		},
		{
			name:     "result with empty value but no error should be ok",
			result:   common.NewResult("", nil),
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			isOk := tt.result.IsOk()
			assert.Equal(t, tt.expected, isOk)
		})
	}
}

func TestResult_IsOk_DifferentTypes(t *testing.T) {
	t.Parallel()

	t.Run("integer result is ok", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(42, nil)
		assert.True(t, result.IsOk())
	})

	t.Run("integer result with error is not ok", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(0, errTest)
		assert.False(t, result.IsOk())
	})

	t.Run("boolean result is ok", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(false, nil) // Even false value should be ok if no error
		assert.True(t, result.IsOk())
	})

	t.Run("slice result is ok", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult([]int{}, nil) // Even empty slice should be ok if no error
		assert.True(t, result.IsOk())
	})
}

func TestResult_Unwrap(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		result        common.Result[string]
		expectedValue string
		expectedError bool
	}{
		{
			name:          "successful result unwrap",
			result:        common.NewResult("success value", nil),
			expectedValue: "success value",
			expectedError: false,
		},
		{
			name:          "error result unwrap",
			result:        common.NewResult("error value", errTest),
			expectedValue: "error value",
			expectedError: true,
		},
		{
			name:          "empty value successful result",
			result:        common.NewResult("", nil),
			expectedValue: "",
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			value, err := tt.result.Unwrap()

			assert.Equal(t, tt.expectedValue, value)
			assert.Equal(t, tt.expectedError, err != nil)
			if tt.expectedError {
				assert.Equal(t, errTest.Error(), err.Error())
			}
		})
	}
}

func TestResult_Unwrap_DifferentTypes(t *testing.T) {
	t.Parallel()

	t.Run("integer unwrap", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(42, nil)
		value, err := result.Unwrap()
		assert.Equal(t, 42, value)
		assert.NoError(t, err)
	})

	t.Run("integer unwrap with error", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(0, errTest)
		value, err := result.Unwrap()
		assert.Equal(t, 0, value)
		assert.Error(t, err)
		assert.Equal(t, errTest.Error(), err.Error())
	})

	t.Run("boolean unwrap", func(t *testing.T) {
		t.Parallel()
		result := common.NewResult(true, nil)
		value, err := result.Unwrap()
		assert.Equal(t, true, value)
		assert.NoError(t, err)
	})

	t.Run("slice unwrap", func(t *testing.T) {
		t.Parallel()
		slice := []int{1, 2, 3}
		result := common.NewResult(slice, nil)
		value, err := result.Unwrap()
		assert.Equal(t, slice, value)
		assert.NoError(t, err)
	})

	t.Run("struct unwrap", func(t *testing.T) {
		t.Parallel()
		type TestStruct struct {
			Name string
		}
		testStruct := TestStruct{Name: "test"}
		result := common.NewResult(testStruct, nil)
		value, err := result.Unwrap()
		assert.Equal(t, testStruct, value)
		assert.NoError(t, err)
	})
}

func TestResult_UnwrapOr(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		result       common.Result[string]
		defaultValue string
		expected     string
	}{
		{
			name:         "successful result should return actual value",
			result:       common.NewResult("actual value", nil),
			defaultValue: "default value",
			expected:     "actual value",
		},
		{
			name:         "error result should return default value",
			result:       common.NewResult("error value", errTest),
			defaultValue: "default value",
			expected:     "default value",
		},
		{
			name:         "empty value successful result should return empty value",
			result:       common.NewResult("", nil),
			defaultValue: "default value",
			expected:     "",
		},
		{
			name:         "error result with empty default should return empty default",
			result:       common.NewResult("error value", errTest),
			defaultValue: "",
			expected:     "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			actual := tt.result.UnwrapOr(tt.defaultValue)
			assert.Equal(t, tt.expected, actual)
		})
	}
}

func TestResult_UnwrapOr_DifferentTypes(t *testing.T) {
	t.Parallel()

	t.Run("integer unwrap or default", func(t *testing.T) {
		t.Parallel()
		// Successful case
		successResult := common.NewResult(42, nil)
		value := successResult.UnwrapOr(100)
		assert.Equal(t, 42, value)

		// Error case
		errorResult := common.NewResult(0, errTest)
		value = errorResult.UnwrapOr(100)
		assert.Equal(t, 100, value)
	})

	t.Run("boolean unwrap or default", func(t *testing.T) {
		t.Parallel()
		// Successful case with false value (should still return false, not default)
		successResult := common.NewResult(false, nil)
		value := successResult.UnwrapOr(true)
		assert.Equal(t, false, value)

		// Error case
		errorResult := common.NewResult(false, errTest)
		value = errorResult.UnwrapOr(true)
		assert.Equal(t, true, value)
	})

	t.Run("slice unwrap or default", func(t *testing.T) {
		t.Parallel()
		// Successful case
		actualSlice := []int{1, 2, 3}
		defaultSlice := []int{4, 5, 6}
		successResult := common.NewResult(actualSlice, nil)
		value := successResult.UnwrapOr(defaultSlice)
		assert.Equal(t, actualSlice, value)

		// Error case
		errorResult := common.NewResult([]int{}, errTest)
		value = errorResult.UnwrapOr(defaultSlice)
		assert.Equal(t, defaultSlice, value)
	})

	t.Run("struct unwrap or default", func(t *testing.T) {
		t.Parallel()
		type TestStruct struct {
			Name string
			ID   int
		}
		actualStruct := TestStruct{Name: "actual", ID: 1}
		defaultStruct := TestStruct{Name: "default", ID: 2}

		// Successful case
		successResult := common.NewResult(actualStruct, nil)
		value := successResult.UnwrapOr(defaultStruct)
		assert.Equal(t, actualStruct, value)

		// Error case
		errorResult := common.NewResult(TestStruct{}, errTest)
		value = errorResult.UnwrapOr(defaultStruct)
		assert.Equal(t, defaultStruct, value)
	})

	t.Run("pointer unwrap or default", func(t *testing.T) {
		t.Parallel()
		type TestStruct struct {
			Name string
		}
		actualPtr := &TestStruct{Name: "actual"}
		defaultPtr := &TestStruct{Name: "default"}

		// Successful case
		successResult := common.NewResult(actualPtr, nil)
		value := successResult.UnwrapOr(defaultPtr)
		assert.Same(t, actualPtr, value)

		// Error case
		errorResult := common.NewResult((*TestStruct)(nil), errTest)
		value = errorResult.UnwrapOr(defaultPtr)
		assert.Same(t, defaultPtr, value)
	})
}

func TestResult_RealWorldExample(t *testing.T) {
	t.Parallel()

	// Simulate a function that returns a Result-like pattern
	parseJSON := func(jsonStr string) common.Result[map[string]interface{}] {
		if jsonStr == `{"key": "value"}` {
			return common.NewResult(map[string]interface{}{"key": "value"}, nil)
		}
		return common.NewResult(map[string]interface{}{}, errors.New("invalid JSON"))
	}

	t.Run("successful JSON parsing", func(t *testing.T) {
		t.Parallel()
		result := parseJSON(`{"key": "value"}`)

		assert.True(t, result.IsOk())

		value, err := result.Unwrap()
		assert.NoError(t, err)
		assert.Equal(t, "value", value["key"])
	})

	t.Run("failed JSON parsing with default", func(t *testing.T) {
		t.Parallel()
		result := parseJSON("invalid json")

		assert.False(t, result.IsOk())

		defaultValue := map[string]interface{}{"default": "empty"}
		value := result.UnwrapOr(defaultValue)
		assert.Equal(t, defaultValue, value)
	})
}

func TestItem_Struct(t *testing.T) {
	t.Parallel()

	t.Run("item with string type", func(t *testing.T) {
		t.Parallel()
		item := common.Item[string]{
			Result: "test result",
			Error:  errTest,
			Count:  5,
		}

		assert.Equal(t, "test result", item.Result)
		assert.Error(t, item.Error)
		assert.Equal(t, errTest.Error(), item.Error.Error())
		assert.Equal(t, 5, item.Count)
	})

	t.Run("item with integer type", func(t *testing.T) {
		t.Parallel()
		item := common.Item[int]{
			Result: 42,
			Error:  nil,
			Count:  10,
		}

		assert.Equal(t, 42, item.Result)
		assert.NoError(t, item.Error)
		assert.Equal(t, 10, item.Count)
	})

	t.Run("item with zero values", func(t *testing.T) {
		t.Parallel()
		item := common.Item[bool]{}

		assert.Equal(t, false, item.Result)
		assert.NoError(t, item.Error)
		assert.Equal(t, 0, item.Count)
	})

	t.Run("item with complex types", func(t *testing.T) {
		t.Parallel()
		type ComplexType struct {
			ID   int
			Name string
		}

		complexData := ComplexType{ID: 1, Name: "test"}
		item := common.Item[ComplexType]{
			Result: complexData,
			Error:  nil,
			Count:  3,
		}

		assert.Equal(t, complexData, item.Result)
		assert.NoError(t, item.Error)
		assert.Equal(t, 3, item.Count)
	})
}
