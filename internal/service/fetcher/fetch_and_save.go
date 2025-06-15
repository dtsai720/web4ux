package fetcher

import (
	"context"
	"strings"
	"time"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

// FetchDataAndSave implements IService.
func (s *Service) FetchDataAndSave(ctx context.Context, log logger.ILogger, in htmlparser.ProjectSummary) error {
	if !strings.Contains(strings.ToLower(in.Link), "winfitts") {
		return nil
	}

	project, err := s.db.GetProject(ctx, in.ID)
	if err != nil {
		return err
	}
	if project.UpdatedAt.Equal(in.Time) {
		log.With(zap.String("id", in.ID)).Infof("db: %s, current: %s", project.UpdatedAt, in.Time)

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

		log.Infof("link: %s", link)
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
