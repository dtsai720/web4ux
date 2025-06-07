package fetcher

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/web4ux/repository"
	"github.com/web4ux/src/common"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
	"go.uber.org/zap"
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

// FetchDataAndSave implements IService.
func (s *Service) FetchDataAndSave(ctx context.Context, log logger.ILogger, in htmlparser.ProjectSummary) error {
	if !strings.Contains(strings.ToLower(in.Link), "winfitts") {
		return nil
	}

	log.With(zap.String("id", in.ID), zap.String("name", in.Name)).Info("Start update project")
	detailFn := WrapFSingleParam(5*time.Second, s.extractWinfittsDetails)
	linkFn := WrapFSingleParam(15*time.Second, s.extractRawDataLinks)

	links, err := linkFn(ctx, log, &in)
	if err != nil {
		return err
	}

	for _, link := range links {
		if !strings.Contains(strings.ToLower(link), "winfitts") {
			continue
		}

		fmt.Println("link: ", link)
		array := strings.Split(link, "/")
		taskId := array[len(array)-1]
		rows, err := detailFn(ctx, log, taskId)
		if err != nil {
			return err
		}

		if err := s.db.UpsertExtractWinfittsDetails(ctx, in, rows); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) ListAllProjects(ctx context.Context, log logger.ILogger) ([]htmlparser.ProjectSummary, error) {
	offset := 1
	output := make([]htmlparser.ProjectSummary, 0, 100)
	summaries := make([]htmlparser.ProjectSummary, 1)
	var err error
	handleFn := WrapFSingleParam(5*time.Second, s.extractProjectSummaries)
	for len(summaries) != 0 {
		summaries, err = handleFn(ctx, log, offset)
		if err != nil {
			return nil, err
		}

		output = append(output, summaries...)
		offset += 1
	}

	return output, nil
}
