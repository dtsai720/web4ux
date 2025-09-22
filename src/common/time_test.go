package common_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/src/common"
)

func TestParseTimeRFC3339(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		timeStr      string
		expectedTime time.Time
		expectedError bool
	}{
		{
			name:          "valid RFC3339 timestamp",
			timeStr:       "2023-12-25T15:30:45Z",
			expectedTime:  time.Date(2023, 12, 25, 15, 30, 45, 0, time.UTC),
			expectedError: false,
		},
		{
			name:          "valid RFC3339 timestamp with timezone",
			timeStr:       "2023-12-25T15:30:45+08:00",
			expectedTime:  time.Date(2023, 12, 25, 15, 30, 45, 0, time.FixedZone("", 8*3600)),
			expectedError: false,
		},
		{
			name:          "valid RFC3339 timestamp with milliseconds",
			timeStr:       "2023-12-25T15:30:45.123Z",
			expectedTime:  time.Date(2023, 12, 25, 15, 30, 45, 123000000, time.UTC),
			expectedError: false,
		},
		{
			name:          "valid RFC3339 timestamp with microseconds",
			timeStr:       "2023-12-25T15:30:45.123456Z",
			expectedTime:  time.Date(2023, 12, 25, 15, 30, 45, 123456000, time.UTC),
			expectedError: false,
		},
		{
			name:          "valid RFC3339 timestamp with nanoseconds",
			timeStr:       "2023-12-25T15:30:45.123456789Z",
			expectedTime:  time.Date(2023, 12, 25, 15, 30, 45, 123456789, time.UTC),
			expectedError: false,
		},
		{
			name:          "invalid timestamp format",
			timeStr:       "2023-12-25 15:30:45",
			expectedTime:  time.Time{},
			expectedError: true,
		},
		{
			name:          "empty string",
			timeStr:       "",
			expectedTime:  time.Time{},
			expectedError: true,
		},
		{
			name:          "invalid date values",
			timeStr:       "2023-13-32T25:61:61Z",
			expectedTime:  time.Time{},
			expectedError: true,
		},
		{
			name:          "malformed timezone",
			timeStr:       "2023-12-25T15:30:45+25:00",
			expectedTime:  time.Time{},
			expectedError: true,
		},
		{
			name:          "missing timezone",
			timeStr:       "2023-12-25T15:30:45",
			expectedTime:  time.Time{},
			expectedError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result, err := common.ParseTimeRFC3339(tt.timeStr)

			if tt.expectedError {
				assert.Error(t, err)
				assert.True(t, result.IsZero())
			} else {
				assert.NoError(t, err)
				assert.True(t, tt.expectedTime.Equal(result))
			}
		})
	}
}

func TestParseTimeRFC3339OrZero(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		timeStr      string
		expectedTime time.Time
	}{
		{
			name:         "valid RFC3339 timestamp returns parsed time",
			timeStr:      "2023-12-25T15:30:45Z",
			expectedTime: time.Date(2023, 12, 25, 15, 30, 45, 0, time.UTC),
		},
		{
			name:         "valid RFC3339 timestamp with timezone",
			timeStr:      "2023-12-25T15:30:45+08:00",
			expectedTime: time.Date(2023, 12, 25, 15, 30, 45, 0, time.FixedZone("", 8*3600)),
		},
		{
			name:         "valid RFC3339 timestamp with milliseconds",
			timeStr:      "2023-12-25T15:30:45.123Z",
			expectedTime: time.Date(2023, 12, 25, 15, 30, 45, 123000000, time.UTC),
		},
		{
			name:         "invalid timestamp format returns zero time",
			timeStr:      "2023-12-25 15:30:45",
			expectedTime: time.Time{},
		},
		{
			name:         "empty string returns zero time",
			timeStr:      "",
			expectedTime: time.Time{},
		},
		{
			name:         "invalid date values return zero time",
			timeStr:      "2023-13-32T25:61:61Z",
			expectedTime: time.Time{},
		},
		{
			name:         "malformed timezone returns zero time",
			timeStr:      "2023-12-25T15:30:45+25:00",
			expectedTime: time.Time{},
		},
		{
			name:         "missing timezone returns zero time",
			timeStr:      "2023-12-25T15:30:45",
			expectedTime: time.Time{},
		},
		{
			name:         "random string returns zero time",
			timeStr:      "not a timestamp",
			expectedTime: time.Time{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := common.ParseTimeRFC3339OrZero(tt.timeStr)

			if tt.expectedTime.IsZero() {
				assert.True(t, result.IsZero())
			} else {
				assert.True(t, tt.expectedTime.Equal(result))
			}
		})
	}
}

func TestParseTimeRFC3339OrDefault(t *testing.T) {
	t.Parallel()

	defaultTime := time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name         string
		timeStr      string
		defaultTime  time.Time
		expectedTime time.Time
	}{
		{
			name:         "valid RFC3339 timestamp returns parsed time",
			timeStr:      "2023-12-25T15:30:45Z",
			defaultTime:  defaultTime,
			expectedTime: time.Date(2023, 12, 25, 15, 30, 45, 0, time.UTC),
		},
		{
			name:         "valid RFC3339 timestamp with timezone",
			timeStr:      "2023-12-25T15:30:45+08:00",
			defaultTime:  defaultTime,
			expectedTime: time.Date(2023, 12, 25, 15, 30, 45, 0, time.FixedZone("", 8*3600)),
		},
		{
			name:         "valid RFC3339 timestamp with milliseconds",
			timeStr:      "2023-12-25T15:30:45.999Z",
			defaultTime:  defaultTime,
			expectedTime: time.Date(2023, 12, 25, 15, 30, 45, 999000000, time.UTC),
		},
		{
			name:         "invalid timestamp format returns default time",
			timeStr:      "2023-12-25 15:30:45",
			defaultTime:  defaultTime,
			expectedTime: defaultTime,
		},
		{
			name:         "empty string returns default time",
			timeStr:      "",
			defaultTime:  defaultTime,
			expectedTime: defaultTime,
		},
		{
			name:         "invalid date values return default time",
			timeStr:      "2023-13-32T25:61:61Z",
			defaultTime:  defaultTime,
			expectedTime: defaultTime,
		},
		{
			name:         "malformed timezone returns default time",
			timeStr:      "2023-12-25T15:30:45+25:00",
			defaultTime:  defaultTime,
			expectedTime: defaultTime,
		},
		{
			name:         "missing timezone returns default time",
			timeStr:      "2023-12-25T15:30:45",
			defaultTime:  defaultTime,
			expectedTime: defaultTime,
		},
		{
			name:         "random string returns default time",
			timeStr:      "not a timestamp",
			defaultTime:  defaultTime,
			expectedTime: defaultTime,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := common.ParseTimeRFC3339OrDefault(tt.timeStr, tt.defaultTime)

			assert.True(t, tt.expectedTime.Equal(result))
		})
	}
}

func TestParseTimeRFC3339OrDefault_DifferentDefaults(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		timeStr     string
		defaultTime time.Time
		checkFunc   func(t *testing.T, result time.Time, expected time.Time)
	}{
		{
			name:        "zero default time",
			timeStr:     "invalid",
			defaultTime: time.Time{},
			checkFunc: func(t *testing.T, result time.Time, expected time.Time) {
				assert.True(t, result.IsZero())
			},
		},
		{
			name:        "current time as default",
			timeStr:     "invalid",
			defaultTime: time.Now(),
			checkFunc: func(t *testing.T, result time.Time, expected time.Time) {
				// Allow small time difference due to execution time
				assert.WithinDuration(t, expected, result, time.Millisecond)
			},
		},
		{
			name:        "future time as default",
			timeStr:     "invalid",
			defaultTime: time.Date(2030, 12, 31, 23, 59, 59, 0, time.UTC),
			checkFunc: func(t *testing.T, result time.Time, expected time.Time) {
				assert.True(t, expected.Equal(result))
			},
		},
		{
			name:        "past time as default",
			timeStr:     "invalid",
			defaultTime: time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC),
			checkFunc: func(t *testing.T, result time.Time, expected time.Time) {
				assert.True(t, expected.Equal(result))
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := common.ParseTimeRFC3339OrDefault(tt.timeStr, tt.defaultTime)
			tt.checkFunc(t, result, tt.defaultTime)
		})
	}
}

func TestTimeParsingBoundaryConditions(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		testCases   []struct {
			timeStr     string
			shouldParse bool
			expected    time.Time
		}
	}{
		{
			name: "leap year february 29",
			testCases: []struct {
				timeStr     string
				shouldParse bool
				expected    time.Time
			}{
				{
					timeStr:     "2024-02-29T12:00:00Z",
					shouldParse: true,
					expected:    time.Date(2024, 2, 29, 12, 0, 0, 0, time.UTC),
				},
				{
					timeStr:     "2023-02-29T12:00:00Z",
					shouldParse: false,
					expected:    time.Time{},
				},
			},
		},
		{
			name: "timezone boundaries",
			testCases: []struct {
				timeStr     string
				shouldParse bool
				expected    time.Time
			}{
				{
					timeStr:     "2023-12-25T15:30:45+12:00",
					shouldParse: true,
					expected:    time.Date(2023, 12, 25, 15, 30, 45, 0, time.FixedZone("", 12*3600)),
				},
				{
					timeStr:     "2023-12-25T15:30:45-11:00",
					shouldParse: true,
					expected:    time.Date(2023, 12, 25, 15, 30, 45, 0, time.FixedZone("", -11*3600)),
				},
				{
					timeStr:     "2023-12-25T15:30:45+00:00",
					shouldParse: true,
					expected:    time.Date(2023, 12, 25, 15, 30, 45, 0, time.UTC),
				},
				{
					timeStr:     "2023-12-25T15:30:45+25:61",
					shouldParse: false,
					expected:    time.Time{},
				},
				{
					timeStr:     "2023-12-25T15:30:45-XX:XX",
					shouldParse: false,
					expected:    time.Time{},
				},
			},
		},
		{
			name: "precision boundaries",
			testCases: []struct {
				timeStr     string
				shouldParse bool
				expected    time.Time
			}{
				{
					timeStr:     "2023-12-25T15:30:45Z",
					shouldParse: true,
					expected:    time.Date(2023, 12, 25, 15, 30, 45, 0, time.UTC),
				},
				{
					timeStr:     "2023-12-25T15:30:45.1Z",
					shouldParse: true,
					expected:    time.Date(2023, 12, 25, 15, 30, 45, 100000000, time.UTC),
				},
				{
					timeStr:     "2023-12-25T15:30:45.12Z",
					shouldParse: true,
					expected:    time.Date(2023, 12, 25, 15, 30, 45, 120000000, time.UTC),
				},
				{
					timeStr:     "2023-12-25T15:30:45.123Z",
					shouldParse: true,
					expected:    time.Date(2023, 12, 25, 15, 30, 45, 123000000, time.UTC),
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			for _, testCase := range tt.testCases {
				result := common.ParseTimeRFC3339OrZero(testCase.timeStr)
				if testCase.shouldParse {
					assert.True(t, testCase.expected.Equal(result), "Failed for: %s", testCase.timeStr)
				} else {
					assert.True(t, result.IsZero(), "Should not parse: %s", testCase.timeStr)
				}
			}
		})
	}
}

func TestTimeParsingRealWorldExamples(t *testing.T) {
	t.Parallel()

	t.Run("common timestamp formats", func(t *testing.T) {
		t.Parallel()
		// Test real-world timestamp formats
		realWorldTimestamps := []struct {
			name     string
			timeStr  string
			shouldParse bool
		}{
			{
				name:        "ISO 8601 UTC",
				timeStr:     "2023-12-25T15:30:45Z",
				shouldParse: true,
			},
			{
				name:        "ISO 8601 with timezone",
				timeStr:     "2023-12-25T15:30:45+08:00",
				shouldParse: true,
			},
			{
				name:        "JavaScript Date.toISOString()",
				timeStr:     "2023-12-25T15:30:45.123Z",
				shouldParse: true,
			},
			{
				name:        "Database timestamp",
				timeStr:     "2023-12-25T15:30:45.123456Z",
				shouldParse: true,
			},
			{
				name:        "MySQL datetime (invalid for RFC3339)",
				timeStr:     "2023-12-25 15:30:45",
				shouldParse: false,
			},
			{
				name:        "Unix timestamp string (invalid for RFC3339)",
				timeStr:     "1703516245",
				shouldParse: false,
			},
		}

		for _, test := range realWorldTimestamps {
			t.Run(test.name, func(t *testing.T) {
				t.Parallel()
				result := common.ParseTimeRFC3339OrZero(test.timeStr)
				if test.shouldParse {
					assert.False(t, result.IsZero(), "Should parse: %s", test.timeStr)
				} else {
					assert.True(t, result.IsZero(), "Should not parse: %s", test.timeStr)
				}
			})
		}
	})

	t.Run("API response timestamp parsing", func(t *testing.T) {
		t.Parallel()
		// Simulate parsing timestamps from API responses
		apiTimestamps := map[string]string{
			"created_at": "2023-12-25T15:30:45Z",
			"updated_at": "2023-12-25T16:45:30.123Z",
			"deleted_at": "", // Empty timestamp
		}

		defaultTime := time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)

		createdAt := common.ParseTimeRFC3339OrDefault(apiTimestamps["created_at"], defaultTime)
		assert.False(t, createdAt.IsZero())
		assert.NotEqual(t, defaultTime, createdAt)

		updatedAt := common.ParseTimeRFC3339OrDefault(apiTimestamps["updated_at"], defaultTime)
		assert.False(t, updatedAt.IsZero())
		assert.NotEqual(t, defaultTime, updatedAt)

		deletedAt := common.ParseTimeRFC3339OrDefault(apiTimestamps["deleted_at"], defaultTime)
		assert.Equal(t, defaultTime, deletedAt) // Should return default for empty string
	})

	t.Run("configuration with fallback times", func(t *testing.T) {
		t.Parallel()
		// Simulate configuration parsing with fallback
		config := map[string]string{
			"start_time":   "2023-01-01T00:00:00Z",
			"end_time":     "invalid timestamp",
			"backup_time":  "",
		}

		now := time.Now()

		startTime := common.ParseTimeRFC3339OrZero(config["start_time"])
		assert.False(t, startTime.IsZero())

		endTime := common.ParseTimeRFC3339OrDefault(config["end_time"], now)
		assert.WithinDuration(t, now, endTime, time.Millisecond)

		backupTime := common.ParseTimeRFC3339OrZero(config["backup_time"])
		assert.True(t, backupTime.IsZero())
	})
}

func TestTimeParsingPerformance(t *testing.T) {
	t.Parallel()

	t.Run("parsing performance with valid timestamps", func(t *testing.T) {
		t.Parallel()
		validTimestamp := "2023-12-25T15:30:45.123456Z"

		// Test that parsing doesn't take too long
		start := time.Now()
		for range 1000 {
			_ = common.ParseTimeRFC3339OrZero(validTimestamp)
		}
		duration := time.Since(start)

		// Should be able to parse 1000 timestamps in reasonable time
		assert.Less(t, duration, time.Second, "Parsing 1000 timestamps should take less than 1 second")
	})

	t.Run("parsing performance with invalid timestamps", func(t *testing.T) {
		t.Parallel()
		invalidTimestamp := "not a valid timestamp at all"

		// Test that invalid parsing doesn't take too long
		start := time.Now()
		for range 1000 {
			_ = common.ParseTimeRFC3339OrZero(invalidTimestamp)
		}
		duration := time.Since(start)

		// Should be able to handle 1000 invalid timestamps in reasonable time
		assert.Less(t, duration, time.Second, "Handling 1000 invalid timestamps should take less than 1 second")
	})
}
