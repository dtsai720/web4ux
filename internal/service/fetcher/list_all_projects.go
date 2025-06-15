package fetcher

import (
	"context"
	"time"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

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
