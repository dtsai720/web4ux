package htmlparser_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

func TestExtractWinfittsDetails(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name            string
		htmlContent     string
		expectedCount   int
		expectError     bool
		errorSubstring  string
	}{
		{
			name:        "empty content",
			htmlContent: "",
			expectedCount: 0,
			expectError: false,
		},
		{
			name: "no data1-pack divs",
			htmlContent: `<div>some content</div>
<p>other content</p>`,
			expectedCount: 0,
			expectError: false,
		},
		{
			name: "single data1-pack - processed but skipped due to index logic",
			htmlContent: `<div class="data1-pack">
<div class="data1">
<span>20</span>
<span>FF079</span>
<span class="word-break">A</span>
<span class="word-break">Elan BlackHawk </span>
</div>
<div class="data2-pack ">
<span>01</span>
<span>No</span>
</div>
</div>`,
			expectedCount: 0,
			expectError: false,
		},
		{
			name: "multiple data1-pack divs - second one processed",
			htmlContent: `<div class="data1-pack">
<div class="data1">first pack - will be skipped</div>
</div>
<div class="data1-pack">
<div class="data-pack">
<span>insufficient-spans</span>
</div>
</div>`,
			expectedCount: 0,
			expectError: true,
			errorSubstring: "regex mismatch",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()

			result, err := htmlparser.ExtractWinfittsDetails(ctx, log, tt.htmlContent)

			if tt.expectError {
				require.Error(t, err, "should return an error")
				if tt.errorSubstring != "" {
					assert.Contains(t, err.Error(), tt.errorSubstring, "error should contain expected substring")
				}
				assert.Nil(t, result, "result should be nil when error occurs")
			} else {
				require.NoError(t, err, "should not return an error")
				assert.Len(t, result, tt.expectedCount, "should return expected number of items")
			}
		})
	}
}

func TestExtractWinfittsDetails_EdgeCases(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name            string
		htmlContent     string
		expectedCount   int
		expectError     bool
	}{
		{
			name: "only whitespace",
			htmlContent: `

			`,
			expectedCount: 0,
			expectError: false,
		},
		{
			name: "partial data1-pack match should not be processed",
			htmlContent: `<div class="data1-pack-partial">
<div class="data1">
<span>20</span>
<span>FF079</span>
</div>
</div>`,
			expectedCount: 0,
			expectError: false,
		},
		{
			name: "html escaped content - single pack skipped",
			htmlContent: `&lt;div class=&quot;data1-pack&quot;&gt;
&lt;div class=&quot;data1&quot;&gt;
&lt;span&gt;20&lt;/span&gt;
&lt;span&gt;FF079&lt;/span&gt;
&lt;/div&gt;
&lt;/div&gt;`,
			expectedCount: 0,
			expectError: false,
		},
		{
			name: "multiple data1-pack with valid structure in second",
			htmlContent: `<div>some initial content</div>
<div class="data1-pack">
<p>first pack - skipped</p>
</div>
<div class="data1-pack">
<div class="data-pack">
<span>participant001</span>
<span>John Doe</span>
<span class="word-break">device1</span>
<span class="word-break">Mouse</span>
</div>
<div class="data2-pack ">
<span>Trail 1</span>
</div>
</div>`,
			expectedCount: 0,
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()

			result, err := htmlparser.ExtractWinfittsDetails(ctx, log, tt.htmlContent)

			if tt.expectError {
				require.Error(t, err, "should return an error")
				assert.Nil(t, result, "result should be nil when error occurs")
			} else {
				require.NoError(t, err, "should not return an error")
				assert.Len(t, result, tt.expectedCount, "should return expected number of items")

				// Additional validation for successful cases with data
				if tt.expectedCount > 0 {
					for i, item := range result {
						assert.NotEmpty(t, item.ParticipantSerial, "participant serial should not be empty for item %d", i)
						assert.NotEmpty(t, item.Participant, "participant name should not be empty for item %d", i)
						assert.NotEmpty(t, item.DeviceOrder, "device order should not be empty for item %d", i)
						assert.NotEmpty(t, item.DeviceName, "device name should not be empty for item %d", i)
						assert.NotNil(t, item.Items, "items should not be nil for item %d", i)
					}
				}
			}
		})
	}
}

func TestExtractWinfittsDetails_ContextAndLogger(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		ctx         context.Context
		log         logger.ILogger
		htmlContent string
		expectPanic bool
	}{
		{
			name: "valid context and logger",
			ctx:  context.Background(),
			log:  logger.NewTestLogger(),
			htmlContent: `<div class="data1-pack">
<div class="data1">
<span>20</span>
<span>FF079</span>
</div>
</div>`,
			expectPanic: false,
		},
		{
			name: "nil logger - should not panic",
			ctx:  context.Background(),
			log:  nil,
			htmlContent: `<div class="data1-pack">
<div class="data1">
<span>20</span>
<span>FF079</span>
</div>
</div>`,
			expectPanic: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if tt.expectPanic {
				assert.Panics(t, func() {
					htmlparser.ExtractWinfittsDetails(tt.ctx, tt.log, tt.htmlContent)
				})
			} else {
				require.NotPanics(t, func() {
					result, err := htmlparser.ExtractWinfittsDetails(tt.ctx, tt.log, tt.htmlContent)
					// Basic validation that function executed (result can be nil for empty slice)
					_ = result
					// Error is acceptable as this is just testing that it doesn't panic
					_ = err
				})
			}
		})
	}
}
