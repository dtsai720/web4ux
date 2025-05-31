package service

import (
	"context"
	"net/http"
	"strings"

	"github.com/web4ux/repository"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/parser"
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

func (s *Service) AutoUpdate(ctx context.Context, log logger.ILogger) error {
	offset := 1
	output, err := s.ListProject(ctx, log, offset)
	if err != nil {
		return err
	}

	projects, err := parser.ProjectList(string(output))
	if err != nil {
		return err
	}

	for _, project := range projects {
		if !strings.Contains(strings.ToLower(project.Link), "winfitts") {
			continue
		}

		html, err := s.client.Send(ctx, log, &request.SendParam{
			Path:   HOST + project.Link,
			Method: http.MethodGet,
		})
		if err != nil {
			return err
		}

		id, err := s.db.UpsertProject(ctx, project)
		if err != nil {
			return err
		}

		results := parser.RawDataLink(string(html))
		for _, nextLink := range results {
			if !strings.Contains(strings.ToLower(nextLink), "winfitts") {
				continue
			}

			array := strings.Split(nextLink, "/")
			taskId := array[len(array)-1]
			response, err := s.Winfitts(ctx, log, taskId)
			if err != nil {
				return err
			}

			rows, err := parser.Winfitts(string(response))
			if err != nil {
				return err
			}

			for _, row := range rows {
				if row == nil {
					continue
				}

				if err := s.db.UpsertWinfitts(ctx, id, *row); err != nil {
					return err
				}
			}
		}
	}

	return nil
}
