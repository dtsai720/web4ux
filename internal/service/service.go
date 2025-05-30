package service

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

func New(options ...common.OptionalFn[Service]) *Service {
	return common.WithOptions(new(Service), options...)
}

var _ IService = (*Service)(nil)

type Service struct {
	client request.IClient
	db     repository.IRepository
}
