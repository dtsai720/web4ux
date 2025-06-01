package fetcher

import (
	"context"
	"strings"

	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

func (s *Service) fetchOne(ctx context.Context, log logger.ILogger, offset int) (bool, error) {
	summaries, err := s.extractProjectSummaries(ctx, log, offset)
	if err != nil {
		return false, err
	}

	if len(summaries) == 0 {
		return true, nil
	}

	for _, summary := range summaries {
		if !strings.Contains(strings.ToLower(summary.Link), "winfitts") {
			continue
		}

		log.With(zap.String("id", summary.ID), zap.String("name", summary.Name)).Info("Start update project")
		project, err := s.db.UpsertProject(ctx, &summary)
		if err != nil {
			return false, err
		}

		links, err := s.extractRawDataLinks(ctx, log, &summary)
		if err != nil {
			return false, err
		}

		for _, link := range links {
			if !strings.Contains(strings.ToLower(link), "winfitts") {
				continue
			}

			array := strings.Split(link, "/")
			taskId := array[len(array)-1]
			rows, err := s.extractWinfittsDetails(ctx, log, taskId)
			if err != nil {
				return false, err
			}

			if err := s.db.UpsertExtractWinfittsDetails(ctx, project.ID, rows); err != nil {
				return false, err
			}
		}
	}

	return false, nil
}
