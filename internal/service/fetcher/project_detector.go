package fetcher

import (
	"strings"

	"github.com/web4ux/src/htmlparser"
)

// ProjectTypeDetector defines the interface for detecting project types
type ProjectTypeDetector interface {
	IsWinfittsProject(project htmlparser.ProjectSummary) bool
}

// DefaultProjectTypeDetector provides the default implementation
type DefaultProjectTypeDetector struct{}

// NewDefaultProjectTypeDetector creates a new default detector
func NewDefaultProjectTypeDetector() *DefaultProjectTypeDetector {
	return &DefaultProjectTypeDetector{}
}

// IsWinfittsProject checks if the project is a Winfitts project
func (d *DefaultProjectTypeDetector) IsWinfittsProject(project htmlparser.ProjectSummary) bool {
	return strings.Contains(strings.ToLower(project.Link), "winfitts")
}

// ConfigurableProjectTypeDetector allows for configurable detection rules
type ConfigurableProjectTypeDetector struct {
	winfittsKeywords []string
}

// NewConfigurableProjectTypeDetector creates a new configurable detector
func NewConfigurableProjectTypeDetector(winfittsKeywords []string) *ConfigurableProjectTypeDetector {
	if len(winfittsKeywords) == 0 {
		winfittsKeywords = []string{"winfitts"}
	}
	return &ConfigurableProjectTypeDetector{
		winfittsKeywords: winfittsKeywords,
	}
}

// IsWinfittsProject checks if the project matches any of the configured keywords
func (d *ConfigurableProjectTypeDetector) IsWinfittsProject(project htmlparser.ProjectSummary) bool {
	lowerLink := strings.ToLower(project.Link)
	for _, keyword := range d.winfittsKeywords {
		if strings.Contains(lowerLink, strings.ToLower(keyword)) {
			return true
		}
	}
	return false
}
