package fetcher

import (
	"context"
	"net/http"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
)

func (s *Service) extractWinfittsDetails(ctx context.Context, log logger.ILogger, taskID string) ([]htmlparser.WinfittsRawData, error) {
	htmlContent, err := s.fetchRawData(ctx, log, "/Project/_WinfittsRawDatas", taskID)
	if err != nil {
		return nil, err
	}

	return htmlparser.ExtractWinfittsDetails(ctx, log, string(htmlContent))
}

func (s *Service) extractRawDataLinks(ctx context.Context, log logger.ILogger, summary *htmlparser.ProjectSummary) ([]string, error) {
	htmlContent, err := s.client.Send(ctx, log, &request.SendParam{
		Path:   HOST + summary.Link,
		Method: http.MethodGet,
	})
	if err != nil {
		return nil, err
	}

	return htmlparser.ExtractRawDataLinks(ctx, log, string(htmlContent)), nil
}

func (s *Service) extractProjectSummaries(ctx context.Context, log logger.ILogger, offset int) ([]htmlparser.ProjectSummary, error) {
	htmlContent, err := s.fetchProjectList(ctx, log, offset)
	if err != nil {
		return nil, err
	}

	return htmlparser.ExtractProjectSummaries(ctx, log, string(htmlContent))
}
