package fetcher

import (
	"github.com/web4ux/repository"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/request"
)

func WithClient(client request.IClient) common.OptionalFn[Service] {
	return func(s *Service) { s.client = client }
}

func WithDatabase(db repository.IRepository) common.OptionalFn[Service] {
	return func(s *Service) { s.db = db }
}

func WithProcessorRegistry(registry *ProjectProcessorRegistry) common.OptionalFn[Service] {
	return func(s *Service) { s.processorRegistry = registry }
}

func New(options ...common.OptionalFn[Service]) *Service {
	service := common.WithOptions(new(Service), options...)

	// Initialize default processor registry if not provided
	if service.processorRegistry == nil {
		service.processorRegistry = service.createDefaultProcessorRegistry()
	}

	return service
}

func (s *Service) createDefaultProcessorRegistry() *ProjectProcessorRegistry {
	registry := NewProjectProcessorRegistry()

	// Register default processors
	winfittsProcessor := NewWinfittsProcessor(
		WithWinfittsDatabase(s.db),
		WithRawDataLinksExtractor(s.extractRawDataLinks),
		WithWinfittsDetailsExtractor(s.extractWinfittsDetails),
	)
	skipProcessor := NewSkipProcessor()

	registry.Register(winfittsProcessor)
	registry.Register(skipProcessor)

	return registry
}

var _ IService = (*Service)(nil)

type Service struct {
	client            request.IClient
	db                repository.IRepository
	processorRegistry *ProjectProcessorRegistry
}

func (s *Service) GetProcessorRegistry() *ProjectProcessorRegistry {
	return s.processorRegistry
}
