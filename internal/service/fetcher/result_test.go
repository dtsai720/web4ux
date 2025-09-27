package fetcher_test

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/internal/service/fetcher"
)

var (
	errTestResult       = errors.New("test error")
	errNetworkResult    = errors.New("network connection failed")
	errProcessingResult = errors.New("processing failed")
)

func TestProcessStatus_Constants(t *testing.T) {
	t.Parallel()

	// Test that the constants have expected values
	assert.Equal(t, 0, int(fetcher.ProcessStatusSuccess))
	assert.Equal(t, 1, int(fetcher.ProcessStatusSkipped))
	assert.Equal(t, 2, int(fetcher.ProcessStatusError))

	// Test that constants are different from each other
	assert.NotEqual(t, fetcher.ProcessStatusSuccess, fetcher.ProcessStatusSkipped)
	assert.NotEqual(t, fetcher.ProcessStatusSuccess, fetcher.ProcessStatusError)
	assert.NotEqual(t, fetcher.ProcessStatusSkipped, fetcher.ProcessStatusError)
}

func TestNewSuccessResult(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		expected struct {
			status fetcher.ProcessStatus
			hasError bool
			reason string
		}
	}{
		{
			name: "creates success result with expected fields",
			expected: struct {
				status fetcher.ProcessStatus
				hasError bool
				reason string
			}{
				status: fetcher.ProcessStatusSuccess,
				hasError: false,
				reason: "",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := fetcher.NewSuccessResult()

			assert.NotNil(t, result)
			assert.Equal(t, tt.expected.status, result.Status)
			assert.Equal(t, tt.expected.hasError, result.Error != nil)
			assert.Equal(t, tt.expected.reason, result.Reason)
		})
	}
}

func TestNewSkippedResult(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		reason         string
		expectedReason string
	}{
		{
			name:           "skipped with reason",
			reason:         "project already up to date",
			expectedReason: "project already up to date",
		},
		{
			name:           "skipped with empty reason",
			reason:         "",
			expectedReason: "",
		},
		{
			name:           "skipped with detailed reason",
			reason:         "project does not match filter criteria",
			expectedReason: "project does not match filter criteria",
		},
		{
			name:           "skipped with special characters",
			reason:         "project type: non-winfitts (contains special chars: !@#$%)",
			expectedReason: "project type: non-winfitts (contains special chars: !@#$%)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := fetcher.NewSkippedResult(tt.reason)

			assert.NotNil(t, result)
			assert.Equal(t, fetcher.ProcessStatusSkipped, result.Status)
			assert.NoError(t, result.Error)
			assert.Equal(t, tt.expectedReason, result.Reason)
		})
	}
}

func TestNewErrorResult(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		err      error
		expected struct {
			status fetcher.ProcessStatus
			hasError bool
			reason string
		}
	}{
		{
			name: "error result with standard error",
			err:  errTestResult,
			expected: struct {
				status fetcher.ProcessStatus
				hasError bool
				reason string
			}{
				status: fetcher.ProcessStatusError,
				hasError: true,
				reason: "",
			},
		},
		{
			name: "error result with nil error",
			err:  nil,
			expected: struct {
				status fetcher.ProcessStatus
				hasError bool
				reason string
			}{
				status: fetcher.ProcessStatusError,
				hasError: false,
				reason: "",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := fetcher.NewErrorResult(tt.err)

			assert.NotNil(t, result)
			assert.Equal(t, tt.expected.status, result.Status)
			assert.Equal(t, tt.expected.hasError, result.Error != nil)
			if tt.err != nil {
				assert.Equal(t, tt.err, result.Error)
			}
			assert.Equal(t, tt.expected.reason, result.Reason)
		})
	}
}

func TestProcessResult_IsSuccess(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		result   *fetcher.ProcessResult
		expected bool
	}{
		{
			name:     "success result should return true",
			result:   fetcher.NewSuccessResult(),
			expected: true,
		},
		{
			name:     "skipped result should return false",
			result:   fetcher.NewSkippedResult("test reason"),
			expected: false,
		},
		{
			name:     "error result should return false",
			result:   fetcher.NewErrorResult(errTestResult),
			expected: false,
		},
		{
			name: "manually created success result should return true",
			result: &fetcher.ProcessResult{
				Status: fetcher.ProcessStatusSuccess,
				Error:  nil,
				Reason: "",
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			isSuccess := tt.result.IsSuccess()
			assert.Equal(t, tt.expected, isSuccess)
		})
	}
}

func TestProcessResult_IsSkipped(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		result   *fetcher.ProcessResult
		expected bool
	}{
		{
			name:     "success result should return false",
			result:   fetcher.NewSuccessResult(),
			expected: false,
		},
		{
			name:     "skipped result should return true",
			result:   fetcher.NewSkippedResult("test reason"),
			expected: true,
		},
		{
			name:     "error result should return false",
			result:   fetcher.NewErrorResult(errTestResult),
			expected: false,
		},
		{
			name: "manually created skipped result should return true",
			result: &fetcher.ProcessResult{
				Status: fetcher.ProcessStatusSkipped,
				Error:  nil,
				Reason: "manual skip",
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			isSkipped := tt.result.IsSkipped()
			assert.Equal(t, tt.expected, isSkipped)
		})
	}
}

func TestProcessResult_IsError(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		result   *fetcher.ProcessResult
		expected bool
	}{
		{
			name:     "success result should return false",
			result:   fetcher.NewSuccessResult(),
			expected: false,
		},
		{
			name:     "skipped result should return false",
			result:   fetcher.NewSkippedResult("test reason"),
			expected: false,
		},
		{
			name:     "error result should return true",
			result:   fetcher.NewErrorResult(errTestResult),
			expected: true,
		},
		{
			name: "manually created error result should return true",
			result: &fetcher.ProcessResult{
				Status: fetcher.ProcessStatusError,
				Error:  errNetworkResult,
				Reason: "",
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			isError := tt.result.IsError()
			assert.Equal(t, tt.expected, isError)
		})
	}
}

func TestProcessResult_StatusCombinations(t *testing.T) {
	t.Parallel()

	t.Run("success result properties", func(t *testing.T) {
		t.Parallel()
		result := fetcher.NewSuccessResult()

		assert.True(t, result.IsSuccess())
		assert.False(t, result.IsSkipped())
		assert.False(t, result.IsError())
	})

	t.Run("skipped result properties", func(t *testing.T) {
		t.Parallel()
		result := fetcher.NewSkippedResult("test reason")

		assert.False(t, result.IsSuccess())
		assert.True(t, result.IsSkipped())
		assert.False(t, result.IsError())
	})

	t.Run("error result properties", func(t *testing.T) {
		t.Parallel()
		result := fetcher.NewErrorResult(errTestResult)

		assert.False(t, result.IsSuccess())
		assert.False(t, result.IsSkipped())
		assert.True(t, result.IsError())
	})
}

func TestProcessResult_StructureValidation(t *testing.T) {
	t.Parallel()

	t.Run("success result structure", func(t *testing.T) {
		t.Parallel()
		result := fetcher.NewSuccessResult()

		assert.Equal(t, fetcher.ProcessStatusSuccess, result.Status)
		assert.Nil(t, result.Error)
		assert.Equal(t, "", result.Reason)
	})

	t.Run("skipped result structure", func(t *testing.T) {
		t.Parallel()
		reason := "project already processed"
		result := fetcher.NewSkippedResult(reason)

		assert.Equal(t, fetcher.ProcessStatusSkipped, result.Status)
		assert.Nil(t, result.Error)
		assert.Equal(t, reason, result.Reason)
	})

	t.Run("error result structure", func(t *testing.T) {
		t.Parallel()
		err := errProcessingResult
		result := fetcher.NewErrorResult(err)

		assert.Equal(t, fetcher.ProcessStatusError, result.Status)
		assert.Equal(t, err, result.Error)
		assert.Equal(t, "", result.Reason)
	})
}

func TestProcessResult_RealWorldScenarios(t *testing.T) {
	t.Parallel()

	t.Run("successful project processing", func(t *testing.T) {
		t.Parallel()
		// Simulate successful project processing
		result := fetcher.NewSuccessResult()

		// Verify the result indicates success
		assert.True(t, result.IsSuccess())
		assert.NoError(t, result.Error)

		// Simulate handling the result
		if result.IsSuccess() {
			// Success path
			assert.True(t, true, "Should enter success path")
		} else {
			t.Error("Should not enter error/skip path for success result")
		}
	})

	t.Run("skipped non-winfitts project", func(t *testing.T) {
		t.Parallel()
		// Simulate skipping a non-winfitts project
		reason := "project type is not winfitts"
		result := fetcher.NewSkippedResult(reason)

		// Verify the result indicates skip with reason
		assert.True(t, result.IsSkipped())
		assert.Equal(t, reason, result.Reason)
		assert.NoError(t, result.Error)

		// Simulate handling the result
		if result.IsSkipped() {
			// Skip path
			assert.Contains(t, result.Reason, "winfitts")
		} else {
			t.Error("Should enter skip path for skipped result")
		}
	})

	t.Run("failed project processing", func(t *testing.T) {
		t.Parallel()
		// Simulate failed project processing
		processingError := errors.New("failed to parse project data")
		result := fetcher.NewErrorResult(processingError)

		// Verify the result indicates error
		assert.True(t, result.IsError())
		assert.Error(t, result.Error)
		assert.Equal(t, processingError, result.Error)

		// Simulate handling the result
		if result.IsError() {
			// Error path
			assert.Contains(t, result.Error.Error(), "failed to parse")
		} else {
			t.Error("Should enter error path for error result")
		}
	})

	t.Run("batch processing results", func(t *testing.T) {
		t.Parallel()
		// Simulate processing multiple projects with different outcomes
		results := []*fetcher.ProcessResult{
			fetcher.NewSuccessResult(),
			fetcher.NewSkippedResult("already up to date"),
			fetcher.NewErrorResult(errors.New("network timeout")),
			fetcher.NewSuccessResult(),
			fetcher.NewSkippedResult("filtered out"),
		}

		// Count different result types
		successCount := 0
		skipCount := 0
		errorCount := 0

		for _, result := range results {
			switch {
			case result.IsSuccess():
				successCount++
			case result.IsSkipped():
				skipCount++
			case result.IsError():
				errorCount++
			}
		}

		assert.Equal(t, 2, successCount, "Should have 2 successful results")
		assert.Equal(t, 2, skipCount, "Should have 2 skipped results")
		assert.Equal(t, 1, errorCount, "Should have 1 error result")
	})

	t.Run("result-based decision making", func(t *testing.T) {
		t.Parallel()
		// Simulate making decisions based on result type
		results := []*fetcher.ProcessResult{
			fetcher.NewSuccessResult(),
			fetcher.NewSkippedResult("not applicable"),
			fetcher.NewErrorResult(errNetworkResult),
		}

		actions := []string{}

		for i, result := range results {
			switch {
			case result.IsSuccess():
				actions = append(actions, "logged success")
			case result.IsSkipped():
				actions = append(actions, "logged skip: "+result.Reason)
			case result.IsError():
				actions = append(actions, "logged error: "+result.Error.Error())
			default:
				t.Errorf("Unexpected result type for result %d", i)
			}
		}

		expectedActions := []string{
			"logged success",
			"logged skip: not applicable",
			"logged error: network connection failed",
		}

		assert.Equal(t, expectedActions, actions)
	})
}

func TestProcessResult_EdgeCases(t *testing.T) {
	t.Parallel()

	t.Run("zero value ProcessResult", func(t *testing.T) {
		t.Parallel()
		var result fetcher.ProcessResult

		// Zero value should be success status (0)
		assert.Equal(t, fetcher.ProcessStatusSuccess, result.Status)
		assert.True(t, result.IsSuccess())
		assert.False(t, result.IsSkipped())
		assert.False(t, result.IsError())
		assert.NoError(t, result.Error)
		assert.Empty(t, result.Reason)
	})

	t.Run("pointer to ProcessResult", func(t *testing.T) {
		t.Parallel()
		result := &fetcher.ProcessResult{
			Status: fetcher.ProcessStatusSkipped,
			Reason: "test reason",
		}

		assert.True(t, result.IsSkipped())
		assert.Equal(t, "test reason", result.Reason)
	})

	t.Run("modifying result after creation", func(t *testing.T) {
		t.Parallel()
		result := fetcher.NewSuccessResult()

		// Initially success
		assert.True(t, result.IsSuccess())

		// Modify to error
		result.Status = fetcher.ProcessStatusError
		result.Error = errTestResult

		// Now it should be error
		assert.True(t, result.IsError())
		assert.False(t, result.IsSuccess())
		assert.Equal(t, errTestResult, result.Error)
	})

	t.Run("skipped result with very long reason", func(t *testing.T) {
		t.Parallel()
		longReason := "This is a very long reason that explains in great detail why this particular project was skipped during processing. " +
			"The reason includes multiple sentences with detailed explanations of the filtering criteria, the project characteristics, " +
			"and the specific conditions that led to the skip decision. This helps with debugging and understanding the processing flow."

		result := fetcher.NewSkippedResult(longReason)

		assert.True(t, result.IsSkipped())
		assert.Equal(t, longReason, result.Reason)
		assert.Greater(t, len(result.Reason), 100, "Reason should be longer than 100 characters")
	})
}

func TestProcessResult_Consistency(t *testing.T) {
	t.Parallel()

	t.Run("multiple calls return same result", func(t *testing.T) {
		t.Parallel()
		result := fetcher.NewSuccessResult()

		// Multiple calls should return consistent results
		for range 10 {
			assert.True(t, result.IsSuccess(), "IsSuccess should consistently return true")
			assert.False(t, result.IsSkipped(), "IsSkipped should consistently return false")
			assert.False(t, result.IsError(), "IsError should consistently return false")
		}
	})

	t.Run("constructor functions create expected states", func(t *testing.T) {
		t.Parallel()
		// Test that constructor functions create exactly the expected state

		success := fetcher.NewSuccessResult()
		assert.Equal(t, fetcher.ProcessStatusSuccess, success.Status)
		assert.Nil(t, success.Error)
		assert.Equal(t, "", success.Reason)

		skipped := fetcher.NewSkippedResult("test")
		assert.Equal(t, fetcher.ProcessStatusSkipped, skipped.Status)
		assert.Nil(t, skipped.Error)
		assert.Equal(t, "test", skipped.Reason)

		errorResult := fetcher.NewErrorResult(errTestResult)
		assert.Equal(t, fetcher.ProcessStatusError, errorResult.Status)
		assert.Equal(t, errTestResult, errorResult.Error)
		assert.Equal(t, "", errorResult.Reason)
	})
}
