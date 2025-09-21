package pkg_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/pkg"
	"github.com/web4ux/src/htmlparser"
)

func TestNewProcessorBasedFilter(t *testing.T) {
	registry := fetcher.NewProjectProcessorRegistry()
	filter := pkg.NewProcessorBasedFilter(registry)

	assert.NotNil(t, filter)
	// Cannot test private field directly
	assert.NotNil(t, filter)
}

func TestProcessorBasedFilter_ShouldProcess(t *testing.T) {
	tests := []struct {
		name           string
		project        htmlparser.ProjectSummary
		setupRegistry  func() *fetcher.ProjectProcessorRegistry
		expectedResult bool
	}{
		{
			name: "should process when processor exists and can process",
			project: htmlparser.ProjectSummary{
				Name: "Test Winfitts Project",
				Link: "/project/winfitts/123",
			},
			setupRegistry: func() *fetcher.ProjectProcessorRegistry {
				registry := fetcher.NewProjectProcessorRegistry()
				// Register a test processor that can handle winfitts projects
				winfittsProcessor := fetcher.NewWinfittsProcessor()
				registry.Register(winfittsProcessor)
				return registry
			},
			expectedResult: true,
		},
		{
			name: "should not process when no processor found",
			project: htmlparser.ProjectSummary{
				Name: "Unknown Project Type",
				Link: "/project/unknown/456",
			},
			setupRegistry: func() *fetcher.ProjectProcessorRegistry {
				registry := fetcher.NewProjectProcessorRegistry()
				// Empty registry - no processors registered
				return registry
			},
			expectedResult: false,
		},
		{
			name: "should not process non-winfitts project",
			project: htmlparser.ProjectSummary{
				Name: "Regular Project",
				Link: "/project/regular/789",
			},
			setupRegistry: func() *fetcher.ProjectProcessorRegistry {
				registry := fetcher.NewProjectProcessorRegistry()
				winfittsProcessor := fetcher.NewWinfittsProcessor()
				registry.Register(winfittsProcessor)
				return registry
			},
			expectedResult: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			registry := tt.setupRegistry()
			filter := pkg.NewProcessorBasedFilter(registry)

			result := filter.ShouldProcess(tt.project)

			assert.Equal(t, tt.expectedResult, result)
		})
	}
}

func TestNewCompositeProjectFilter(t *testing.T) {
	filter1 := pkg.NewNamePatternFilter("test")
	filter2 := pkg.NewLinkPatternFilter("pattern")

	composite := pkg.NewCompositeProjectFilter(filter1, filter2)

	assert.NotNil(t, composite)
	// Cannot test private fields directly
	assert.NotNil(t, composite)
}

func TestCompositeProjectFilter_ShouldProcess(t *testing.T) {
	tests := []struct {
		name           string
		project        htmlparser.ProjectSummary
		filters        []pkg.ProjectFilter
		expectedResult bool
	}{
		{
			name: "all filters pass",
			project: htmlparser.ProjectSummary{
				Name: "Valid Project",
				Link: "/valid/link",
			},
			filters: []pkg.ProjectFilter{
				pkg.NewNamePatternFilter("test"),
				pkg.NewLinkPatternFilter("pattern"),
			},
			expectedResult: true,
		},
		{
			name: "first filter fails",
			project: htmlparser.ProjectSummary{
				Name: "",
				Link: "/valid/link",
			},
			filters: []pkg.ProjectFilter{
				pkg.NewNamePatternFilter("test"),
				pkg.NewLinkPatternFilter("pattern"),
			},
			expectedResult: false,
		},
		{
			name: "second filter fails",
			project: htmlparser.ProjectSummary{
				Name: "Valid Project",
				Link: "",
			},
			filters: []pkg.ProjectFilter{
				pkg.NewNamePatternFilter("test"),
				pkg.NewLinkPatternFilter("pattern"),
			},
			expectedResult: false,
		},
		{
			name: "no filters - should pass",
			project: htmlparser.ProjectSummary{
				Name: "Any Project",
				Link: "/any/link",
			},
			filters:        []pkg.ProjectFilter{},
			expectedResult: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			composite := pkg.NewCompositeProjectFilter(tt.filters...)

			result := composite.ShouldProcess(tt.project)

			assert.Equal(t, tt.expectedResult, result)
		})
	}
}

func TestNewNamePatternFilter(t *testing.T) {
	pattern := "test-pattern"
	filter := pkg.NewNamePatternFilter(pattern)

	assert.NotNil(t, filter)
	// Cannot test private field directly
	assert.NotNil(t, filter)
}

func TestNamePatternFilter_ShouldProcess(t *testing.T) {
	tests := []struct {
		name           string
		pattern        string
		project        htmlparser.ProjectSummary
		expectedResult bool
	}{
		{
			name:    "valid project name",
			pattern: "test",
			project: htmlparser.ProjectSummary{
				Name: "Test Project",
			},
			expectedResult: true,
		},
		{
			name:    "empty project name",
			pattern: "test",
			project: htmlparser.ProjectSummary{
				Name: "",
			},
			expectedResult: false,
		},
		{
			name:    "project name with single character",
			pattern: "any",
			project: htmlparser.ProjectSummary{
				Name: "A",
			},
			expectedResult: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := pkg.NewNamePatternFilter(tt.pattern)

			result := filter.ShouldProcess(tt.project)

			assert.Equal(t, tt.expectedResult, result)
		})
	}
}

func TestNewLinkPatternFilter(t *testing.T) {
	pattern := "link-pattern"
	filter := pkg.NewLinkPatternFilter(pattern)

	assert.NotNil(t, filter)
	// Cannot test private field directly
	assert.NotNil(t, filter)
}

func TestLinkPatternFilter_ShouldProcess(t *testing.T) {
	tests := []struct {
		name           string
		pattern        string
		project        htmlparser.ProjectSummary
		expectedResult bool
	}{
		{
			name:    "valid project link",
			pattern: "winfitts",
			project: htmlparser.ProjectSummary{
				Link: "/project/winfitts/123",
			},
			expectedResult: true,
		},
		{
			name:    "empty project link",
			pattern: "winfitts",
			project: htmlparser.ProjectSummary{
				Link: "",
			},
			expectedResult: false,
		},
		{
			name:    "project link with single character",
			pattern: "any",
			project: htmlparser.ProjectSummary{
				Link: "/",
			},
			expectedResult: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			filter := pkg.NewLinkPatternFilter(tt.pattern)

			result := filter.ShouldProcess(tt.project)

			assert.Equal(t, tt.expectedResult, result)
		})
	}
}

func TestProjectFilter_Interface(t *testing.T) {
	// Test that all our filter types implement the ProjectFilter interface
	var _ pkg.ProjectFilter = (*pkg.ProcessorBasedFilter)(nil)
	var _ pkg.ProjectFilter = (*pkg.CompositeProjectFilter)(nil)
	var _ pkg.ProjectFilter = (*pkg.NamePatternFilter)(nil)
	var _ pkg.ProjectFilter = (*pkg.LinkPatternFilter)(nil)

	// Test that IProjectFilter interface matches ProjectFilter
	var _ pkg.IProjectFilter = (*pkg.ProcessorBasedFilter)(nil)
	var _ pkg.IProjectFilter = (*pkg.CompositeProjectFilter)(nil)
	var _ pkg.IProjectFilter = (*pkg.NamePatternFilter)(nil)
	var _ pkg.IProjectFilter = (*pkg.LinkPatternFilter)(nil)
}
