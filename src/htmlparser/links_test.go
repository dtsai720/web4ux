package htmlparser_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

func TestExtractRawDataLinks(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		htmlContent  string
		expectedLinks []string
	}{
		{
			name:         "empty content",
			htmlContent:  "",
			expectedLinks: []string{},
		},
		{
			name:         "no raw data links",
			htmlContent:  `<html><body><p>No links here</p></body></html>`,
			expectedLinks: []string{},
		},
		{
			name: "single raw data link",
			htmlContent: `
				<div>
					<a href="/data/rawdata/12345" class="button-5 icon-rawdata ">Download</a>
				</div>
			`,
			expectedLinks: []string{"/data/rawdata/12345"},
		},
		{
			name: "multiple raw data links",
			htmlContent: `
				<div>
					<a href="/data/rawdata/12345" class="button-5 icon-rawdata ">Download 1</a>
					<a href="/data/rawdata/67890" class="button-5 icon-rawdata ">Download 2</a>
					<a href="/data/rawdata/abcdef" class="button-5 icon-rawdata ">Download 3</a>
				</div>
			`,
			expectedLinks: []string{
				"/data/rawdata/12345",
				"/data/rawdata/67890",
				"/data/rawdata/abcdef",
			},
		},
		{
			name: "mixed links with only raw data extracted",
			htmlContent: `
				<div>
					<a href="/other/link" class="button-1">Other Link</a>
					<a href="/data/rawdata/test123" class="button-5 icon-rawdata ">Raw Data</a>
					<a href="/another/link" class="button-8 icon-resultbar">Result</a>
					<a href="/data/rawdata/test456" class="button-5 icon-rawdata ">Another Raw Data</a>
				</div>
			`,
			expectedLinks: []string{
				"/data/rawdata/test123",
				"/data/rawdata/test456",
			},
		},
		{
			name: "raw data link with extra whitespace",
			htmlContent: `
				<a href="  /data/rawdata/whitespace  " class="button-5 icon-rawdata ">Download</a>
			`,
			expectedLinks: []string{"/data/rawdata/whitespace"},
		},
		{
			name: "raw data link with different href formats",
			htmlContent: `
				<a href="https://example.com/data/raw/123" class="button-5 icon-rawdata ">External</a>
				<a href="/relative/path/456" class="button-5 icon-rawdata ">Relative</a>
				<a href="file.xml" class="button-5 icon-rawdata ">File</a>
			`,
			expectedLinks: []string{
				"https://example.com/data/raw/123",
				"/relative/path/456",
				"file.xml",
			},
		},
		{
			name: "malformed html with partial matches",
			htmlContent: `
				<a href="/valid/link" class="button-5 icon-rawdata ">Valid</a>
				<a class="button-5 icon-rawdata ">No href</a>
				<a href="/another/valid" class="button-5 icon-rawdata ">Another Valid</a>
			`,
			expectedLinks: []string{
				"/valid/link",
				"/another/valid",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()

			links := htmlparser.ExtractRawDataLinks(ctx, log, tt.htmlContent)

			assert.Equal(t, tt.expectedLinks, links, "extracted links should match expected")
		})
	}
}

func TestExtractRawDataLinks_EdgeCases(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		htmlContent  string
		expectedLinks []string
	}{
		{
			name: "empty href attribute",
			htmlContent: `<a href="" class="button-5 icon-rawdata ">Empty</a>`,
			expectedLinks: []string{}, // Empty href doesn't match regex ([^"]+) requires at least one character
		},
		{
			name: "href with quotes in value",
			htmlContent: `<a href="/path/with\"quotes" class="button-5 icon-rawdata ">Quotes</a>`,
			expectedLinks: []string{},  // Should not match due to malformed href
		},
		{
			name: "class attribute variations",
			htmlContent: `
				<a href="/test1" class="button-5 icon-rawdata ">Exact match</a>
				<a href="/test2" class="button-5  icon-rawdata ">Extra spaces</a>
				<a href="/test3" class=" button-5 icon-rawdata ">Leading space</a>
				<a href="/test4" class="button-5 icon-rawdata">No trailing space</a>
			`,
			expectedLinks: []string{"/test1", "/test2"},  // Regex allows extra spaces within class
		},
		{
			name: "very long href",
			htmlContent: func() string {
				longPath := "/very/long/path/" + string(make([]byte, 1000))
				for i := range longPath[16:] {
					if longPath[16+i] == 0 {
						longPath = longPath[:16+i] + "a" + longPath[16+i+1:]
					}
				}
				return `<a href="` + longPath + `" class="button-5 icon-rawdata ">Long</a>`
			}(),
			expectedLinks: func() []string {
				longPath := "/very/long/path/" + string(make([]byte, 1000))
				for i := range longPath[16:] {
					if longPath[16+i] == 0 {
						longPath = longPath[:16+i] + "a" + longPath[16+i+1:]
					}
				}
				return []string{longPath}
			}(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			log := logger.NewTestLogger()

			links := htmlparser.ExtractRawDataLinks(ctx, log, tt.htmlContent)

			assert.Equal(t, tt.expectedLinks, links, "extracted links should match expected")
		})
	}
}

func TestExtractRawDataLinks_ContextAndLogger(t *testing.T) {
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
			htmlContent: `<a href="/test" class="button-5 icon-rawdata ">Test</a>`,
			expectPanic: false,
		},
		{
			name: "nil logger - should not panic",
			ctx:  context.Background(),
			log:  nil,
			htmlContent: `<a href="/test" class="button-5 icon-rawdata ">Test</a>`,
			expectPanic: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if tt.expectPanic {
				assert.Panics(t, func() {
					htmlparser.ExtractRawDataLinks(tt.ctx, tt.log, tt.htmlContent)
				})
			} else {
				require.NotPanics(t, func() {
					links := htmlparser.ExtractRawDataLinks(tt.ctx, tt.log, tt.htmlContent)
					// Basic validation that function executed
					require.NotNil(t, links)
				})
			}
		})
	}
}
