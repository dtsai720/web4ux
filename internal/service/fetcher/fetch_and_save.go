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
func (s *Service) FetchDataAndSave(ctx context.Context, logger logger.ILogger, in htmlparser.ProjectSummary) error {
	log := logger.With(zap.String("project_id", in.ID), zap.String("project_name", in.Name))

	if !strings.Contains(strings.ToLower(in.Link), "winfitts") {
		log.Info("Skipping non-winfitts project", zap.String("link", in.Link))
		return nil
	}

	log.Info("Processing winfitts project", zap.String("link", in.Link))

	project, err := s.db.GetProject(ctx, in.ID)
	if err != nil {
		log.Error("Failed to get existing project from database", zap.Error(err))
		return err
	}

	if project.UpdatedAt.Equal(in.Time) {
		log.Info("Project is up-to-date, skipping update",
			zap.Time("last_updated", project.UpdatedAt),
			zap.Time("source_time", in.Time))
		return nil
	}

	log.Info("Project needs update",
		zap.Time("current_version", project.UpdatedAt),
		zap.Time("new_version", in.Time))
	detailFn := WrapFSingleParam(5*time.Second, s.extractWinfittsDetails)
	linkFn := WrapFSingleParam(15*time.Second, s.extractRawDataLinks)

	log.Info("Extracting raw data links from project")
	links, err := linkFn(ctx, log, &in)
	if err != nil {
		log.Error("Failed to extract raw data links", zap.Error(err))
		return err
	}

	log.Info("Found raw data links", zap.Int("total_links", len(links)))

	processedCount := 0
	for i, link := range links {
		linkLogger := log.With(zap.Int("link_index", i+1), zap.String("link", link))

		if !strings.Contains(strings.ToLower(link), "winfitts") {
			linkLogger.Info("Skipping non-winfitts link")
			continue
		}

		linkLogger.Info("Processing winfitts link")
		array := strings.Split(link, "/")
		taskId := array[len(array)-1]

		linkLogger.Info("Extracting winfitts details", zap.String("task_id", taskId))
		rows, err := detailFn(ctx, linkLogger, taskId)
		if err != nil {
			linkLogger.Error("Failed to extract winfitts details",
				zap.String("task_id", taskId),
				zap.Error(err))
			return err
		}

		linkLogger.Info("Saving winfitts data to database",
			zap.String("task_id", taskId),
			zap.Int("rows_count", len(rows)))
		if err := s.db.UpsertExtractWinfittsDetails(ctx, in, rows); err != nil {
			linkLogger.Error("Failed to save winfitts details to database",
				zap.String("task_id", taskId),
				zap.Error(err))
			return err
		}

		processedCount++
		linkLogger.Info("Successfully processed winfitts link", zap.String("task_id", taskId))
	}

	log.Info("Project update completed",
		zap.Int("processed_links", processedCount),
		zap.Int("total_links", len(links)))

	return nil
}
