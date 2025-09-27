package pkg

import (
	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/src/htmlparser"
)

type ProcessorBasedFilter struct {
	processorRegistry *fetcher.ProjectProcessorRegistry
}

func NewProcessorBasedFilter(processorRegistry *fetcher.ProjectProcessorRegistry) *ProcessorBasedFilter {
	return &ProcessorBasedFilter{
		processorRegistry: processorRegistry,
	}
}

func (f *ProcessorBasedFilter) ShouldProcess(project htmlparser.ProjectSummary) bool {
	processor := f.processorRegistry.FindProcessor(project)
	return processor != nil && processor.CanProcess(project)
}

type CompositeProjectFilter struct {
	filters []ProjectFilter
}

func NewCompositeProjectFilter(filters ...ProjectFilter) *CompositeProjectFilter {
	return &CompositeProjectFilter{
		filters: filters,
	}
}

func (f *CompositeProjectFilter) ShouldProcess(project htmlparser.ProjectSummary) bool {
	for _, filter := range f.filters {
		if !filter.ShouldProcess(project) {
			return false
		}
	}
	return true
}

type NamePatternFilter struct {
	pattern string
}

func NewNamePatternFilter(pattern string) *NamePatternFilter {
	return &NamePatternFilter{
		pattern: pattern,
	}
}

func (f *NamePatternFilter) ShouldProcess(project htmlparser.ProjectSummary) bool {
	return project.Name != "" && len(project.Name) > 0
}

type LinkPatternFilter struct {
	pattern string
}

func NewLinkPatternFilter(pattern string) *LinkPatternFilter {
	return &LinkPatternFilter{
		pattern: pattern,
	}
}

func (f *LinkPatternFilter) ShouldProcess(project htmlparser.ProjectSummary) bool {
	return project.Link != "" && len(project.Link) > 0
}
