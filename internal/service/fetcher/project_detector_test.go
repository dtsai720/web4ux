package fetcher_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/src/htmlparser"
)

func TestDefaultProjectTypeDetector_NewDefaultProjectTypeDetector(t *testing.T) {
	t.Parallel()

	detector := fetcher.NewDefaultProjectTypeDetector()
	require.NotNil(t, detector, "detector should be created")
}

func TestDefaultProjectTypeDetector_IsWinfittsProject(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		project  htmlparser.ProjectSummary
		expected bool
	}{
		{
			name: "project with winfitts in link",
			project: htmlparser.ProjectSummary{
				Link: "/projects/winfitts/123",
			},
			expected: true,
		},
		{
			name: "project with WINFITTS in uppercase",
			project: htmlparser.ProjectSummary{
				Link: "/projects/WINFITTS/456",
			},
			expected: true,
		},
		{
			name: "project with Winfitts mixed case",
			project: htmlparser.ProjectSummary{
				Link: "/projects/Winfitts/789",
			},
			expected: true,
		},
		{
			name: "project without winfitts in link",
			project: htmlparser.ProjectSummary{
				Link: "/projects/other/123",
			},
			expected: false,
		},
		{
			name: "empty link",
			project: htmlparser.ProjectSummary{
				Link: "",
			},
			expected: false,
		},
		{
			name: "link with partial match",
			project: htmlparser.ProjectSummary{
				Link: "/projects/win/123",
			},
			expected: false,
		},
	}

	detector := fetcher.NewDefaultProjectTypeDetector()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := detector.IsWinfittsProject(tt.project)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestConfigurableProjectTypeDetector_NewConfigurableProjectTypeDetector(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name             string
		keywords         []string
		expectedKeywords []string
	}{
		{
			name:             "with custom keywords",
			keywords:         []string{"winfitts", "fitts", "pointing"},
			expectedKeywords: []string{"winfitts", "fitts", "pointing"},
		},
		{
			name:             "with empty keywords defaults to winfitts",
			keywords:         []string{},
			expectedKeywords: []string{"winfitts"},
		},
		{
			name:             "with nil keywords defaults to winfitts",
			keywords:         nil,
			expectedKeywords: []string{"winfitts"},
		},
		{
			name:             "with single keyword",
			keywords:         []string{"pointing"},
			expectedKeywords: []string{"pointing"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			detector := fetcher.NewConfigurableProjectTypeDetector(tt.keywords)
			require.NotNil(t, detector, "detector should be created")

			// Test with a project that contains the first expected keyword
			if len(tt.expectedKeywords) > 0 {
				project := htmlparser.ProjectSummary{
					Link: "/projects/" + tt.expectedKeywords[0] + "/123",
				}
				assert.True(t, detector.IsWinfittsProject(project),
					"should match first keyword: %s", tt.expectedKeywords[0])
			}
		})
	}
}

func TestConfigurableProjectTypeDetector_IsWinfittsProject(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		keywords []string
		project  htmlparser.ProjectSummary
		expected bool
	}{
		{
			name:     "matches first keyword",
			keywords: []string{"winfitts", "fitts", "pointing"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/winfitts/123",
			},
			expected: true,
		},
		{
			name:     "matches second keyword",
			keywords: []string{"winfitts", "fitts", "pointing"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/fitts/456",
			},
			expected: true,
		},
		{
			name:     "matches third keyword",
			keywords: []string{"winfitts", "fitts", "pointing"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/pointing/789",
			},
			expected: true,
		},
		{
			name:     "case insensitive matching",
			keywords: []string{"winfitts"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/WINFITTS/123",
			},
			expected: true,
		},
		{
			name:     "keyword case insensitive matching",
			keywords: []string{"WINFITTS"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/winfitts/123",
			},
			expected: true,
		},
		{
			name:     "no match",
			keywords: []string{"winfitts", "fitts"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/other/123",
			},
			expected: false,
		},
		{
			name:     "partial match should work",
			keywords: []string{"win"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/winfitts/123",
			},
			expected: true,
		},
		{
			name:     "empty link",
			keywords: []string{"winfitts"},
			project: htmlparser.ProjectSummary{
				Link: "",
			},
			expected: false,
		},
		{
			name:     "keyword in middle of path",
			keywords: []string{"test"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/my-test-project/123",
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			detector := fetcher.NewConfigurableProjectTypeDetector(tt.keywords)
			result := detector.IsWinfittsProject(tt.project)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestConfigurableProjectTypeDetector_EdgeCases(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		keywords []string
		project  htmlparser.ProjectSummary
		expected bool
	}{
		{
			name:     "empty keyword in list",
			keywords: []string{"", "winfitts"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/winfitts/123",
			},
			expected: true,
		},
		{
			name:     "special characters in keywords",
			keywords: []string{"win-fitts", "test_project"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/win-fitts/123",
			},
			expected: true,
		},
		{
			name:     "unicode characters in keywords",
			keywords: []string{"測試", "プロジェクト"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/測試/123",
			},
			expected: true,
		},
		{
			name:     "very long keyword",
			keywords: []string{"very-long-project-name-that-contains-many-words-and-hyphens"},
			project: htmlparser.ProjectSummary{
				Link: "/projects/very-long-project-name-that-contains-many-words-and-hyphens/123",
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			detector := fetcher.NewConfigurableProjectTypeDetector(tt.keywords)
			result := detector.IsWinfittsProject(tt.project)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestProjectTypeDetector_Comparison(t *testing.T) {
	t.Parallel()

	// Test that both detectors work the same for basic winfitts detection
	project := htmlparser.ProjectSummary{
		Link: "/projects/winfitts/123",
	}

	defaultDetector := fetcher.NewDefaultProjectTypeDetector()
	configurableDetector := fetcher.NewConfigurableProjectTypeDetector([]string{"winfitts"})

	defaultResult := defaultDetector.IsWinfittsProject(project)
	configurableResult := configurableDetector.IsWinfittsProject(project)

	assert.True(t, defaultResult, "default detector should detect winfitts project")
	assert.True(t, configurableResult, "configurable detector should detect winfitts project")
	assert.Equal(t, defaultResult, configurableResult, "both detectors should return same result")
}
