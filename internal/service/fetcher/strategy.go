package fetcher

import (
	"github.com/web4ux/src/htmlparser"
)

// ProjectProcessorRegistry manages multiple project processors
type ProjectProcessorRegistry struct {
	processors []ProjectProcessor
}

// NewProjectProcessorRegistry creates a new registry with default processors
func NewProjectProcessorRegistry() *ProjectProcessorRegistry {
	return &ProjectProcessorRegistry{
		processors: make([]ProjectProcessor, 0),
	}
}

// Register adds a processor to the registry
func (r *ProjectProcessorRegistry) Register(processor ProjectProcessor) {
	r.processors = append(r.processors, processor)
}

// FindProcessor returns the first processor that can handle the project
func (r *ProjectProcessorRegistry) FindProcessor(project htmlparser.ProjectSummary) ProjectProcessor {
	for _, processor := range r.processors {
		if processor.CanProcess(project) {
			return processor
		}
	}
	return nil
}

// GetProcessors returns all registered processors
func (r *ProjectProcessorRegistry) GetProcessors() []ProjectProcessor {
	return r.processors
}
