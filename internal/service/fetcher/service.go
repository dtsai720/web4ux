package fetcher

import (
	"context"

	"github.com/web4ux/repository"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
)

func WithClient(client request.IClient) common.OptionalFn[Service] {
	return func(s *Service) { s.client = client }
}

func WithDatabase(db repository.IRepository) common.OptionalFn[Service] {
	return func(s *Service) { s.db = db }
}

func New(options ...common.OptionalFn[Service]) *Service {
	return common.WithOptions(new(Service), options...)
}

var _ IService = (*Service)(nil)

type Service struct {
	client request.IClient
	db     repository.IRepository
}

func (s *Service) FetchDataAndSave(ctx context.Context, log logger.ILogger) error {
	offset := 1
	for {
		finished, err := s.fetchOne(ctx, log, offset)
		if err != nil {
			return err
		}
		if finished {
			break
		}

		offset += 1
	}

	log.Info("update data finish...")

	return nil
}
