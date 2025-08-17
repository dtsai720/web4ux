package models_test

import (
	"regexp"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/models"
)

func TestSpanRegex(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name     string
		input    string
		expected [][]string
	}{
		{
			name:  "single span",
			input: "<span>test123</span>",
			expected: [][]string{
				{"<span>test123</span>", "test123"},
			},
		},
		{
			name:  "multiple spans",
			input: "<span>first</span><span>second</span>",
			expected: [][]string{
				{"<span>first</span>", "first"},
				{"<span>second</span>", "second"},
			},
		},
		{
			name:  "span with negative number",
			input: "<span>-100</span>",
			expected: [][]string{
				{"<span>-100</span>", "-100"},
			},
		},
		{
			name:     "no spans",
			input:    "<div>no spans here</div>",
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			matches := models.SpanRegex.FindAllStringSubmatch(tt.input, -1)
			assert.Equal(t, tt.expected, matches, "Regex matches should equal expected")
		})
	}
}

func TestDeviceRegex(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name     string
		input    string
		expected [][]string
	}{
		{
			name:  "device span",
			input: `<span class="word-break">Device Name</span>`,
			expected: [][]string{
				{`<span class="word-break">Device Name</span>`, "Device Name"},
			},
		},
		{
			name:  "device span with spaces in class",
			input: `<span  class="word-break">Another Device</span>`,
			expected: [][]string{
				{`<span  class="word-break">Another Device</span>`, "Another Device"},
			},
		},
		{
			name:     "no device span",
			input:    `<span class="other">Not a device</span>`,
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			matches := models.DeviceRegex.FindAllStringSubmatch(tt.input, -1)
			assert.Equal(t, tt.expected, matches, "Regex matches should equal expected")
		})
	}
}

func TestWinfittsDetailRegex(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name     string
		input    string
		expected [][]string
	}{
		{
			name:  "valid winfit detail",
			input: `<div class="data3"><span>mark1</span><span>(100,200)</span><span class="et">1500</span></div>`,
			expected: [][]string{
				{`<div class="data3"><span>mark1</span><span>(100,200)</span><span class="et">1500</span></div>`, "mark1", "100,200", "1500"},
			},
		},
		{
			name:  "winfit detail with spaces",
			input: `<div  class="data3"><span>mark2</span><span>(300,400)</span><span  class="et">2000</span></div>`,
			expected: [][]string{
				{`<div  class="data3"><span>mark2</span><span>(300,400)</span><span  class="et">2000</span></div>`, "mark2", "300,400", "2000"},
			},
		},
		{
			name:     "invalid structure",
			input:    `<div class="data3"><span>incomplete</span></div>`,
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			matches := models.WinfittsDetailRegex.FindAllStringSubmatch(tt.input, -1)
			assert.Equal(t, tt.expected, matches, "Regex matches should equal expected")
		})
	}
}

func TestRegexCompilation(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		pattern string
		regex   *regexp.Regexp
	}{
		{
			name:    "spanRegex compiles correctly",
			pattern: `<span>(-?\w+)<\/span>`,
			regex:   models.SpanRegex,
		},
		{
			name:    "deviceRegex compiles correctly",
			pattern: `<span\s*class="word-break">([^<]+)<\/span>`,
			regex:   models.DeviceRegex,
		},
		{
			name:    "winfittsDetailRegex compiles correctly",
			pattern: `<div\s*class="data3"><span>([^<]+)</span><span>\(([^<]+)\)</span><span\s*class="et">([^<]+)</span></div>`,
			regex:   models.WinfittsDetailRegex,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.NotNil(t, tt.regex, "Regex should not be nil")

			// Test that the regex pattern is as expected
			expectedRegex := regexp.MustCompile(tt.pattern)
			assert.Equal(t, expectedRegex.String(), tt.regex.String(), "Regex pattern should match")
		})
	}
}
