package fetcher

import (
	"context"
	"strings"
	"time"

	"github.com/web4ux/models"
	"github.com/web4ux/repository"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

// WinfittsProcessor handles processing of Winfitts projects
type WinfittsProcessor struct {
	db                     repository.IRepository
	extractRawDataLinks    func(context.Context, logger.ILogger, *htmlparser.ProjectSummary) ([]string, error)
	extractWinfittsDetails func(context.Context, logger.ILogger, string) ([]models.WinfittsRawData, error)
}

// NewWinfittsProcessor creates a new Winfitts processor
func NewWinfittsProcessor(
	db repository.IRepository,
	extractRawDataLinks func(context.Context, logger.ILogger, *htmlparser.ProjectSummary) ([]string, error),
	extractWinfittsDetails func(context.Context, logger.ILogger, string) ([]models.WinfittsRawData, error),
) *WinfittsProcessor {
	return &WinfittsProcessor{
		db:                     db,
		extractRawDataLinks:    extractRawDataLinks,
		extractWinfittsDetails: extractWinfittsDetails,
	}
}

// Name returns the processor name
func (w *WinfittsProcessor) Name() string {
	return "WinfittsProcessor"
}

// CanProcess determines if this processor can handle the project
func (w *WinfittsProcessor) CanProcess(project htmlparser.ProjectSummary) bool {
	return strings.Contains(strings.ToLower(project.Link), "winfitts")
}

// Process handles the complete processing workflow for Winfitts projects
func (w *WinfittsProcessor) Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	log.Info("Processing winfitts project", zap.String("link", project.Link))

	skipUpdate, err := w.shouldSkipUpdate(ctx, log, project)
	if err != nil {
		return err
	}
	if skipUpdate {
		return nil
	}

	return w.processWinfittsProject(ctx, log, project)
}

func (w *WinfittsProcessor) shouldSkipUpdate(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) (bool, error) {
	existingProject, err := w.db.FindProject(ctx, log, project.ID)
	if err != nil {
		log.Error("Failed to get existing project from database", zap.Error(err))
		return false, err
	}

	if existingProject.UpdatedAt.Equal(project.Time) {
		log.Info("Project is up-to-date, skipping update",
			zap.Time("last_updated", existingProject.UpdatedAt),
			zap.Time("source_time", project.Time))
		return true, nil
	}

	log.Info("Project needs update",
		zap.Time("current_version", existingProject.UpdatedAt),
		zap.Time("new_version", project.Time))
	return false, nil
}

func (w *WinfittsProcessor) processWinfittsProject(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	links, err := w.extractProjectLinks(ctx, log, project)
	if err != nil {
		return err
	}

	return w.processWinfittsLinks(ctx, log, project, links)
}

func (w *WinfittsProcessor) extractProjectLinks(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) ([]string, error) {
	linkFn := WrapWithDelay(15*time.Second, w.extractRawDataLinks)

	log.Info("Extracting raw data links from project")
	links, err := linkFn(ctx, log, &project)
	if err != nil {
		log.Error("Failed to extract raw data links", zap.Error(err))
		return nil, err
	}

	log.Info("Found raw data links", zap.Int("total_links", len(links)))
	return links, nil
}

func (w *WinfittsProcessor) processWinfittsLinks(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary, links []string) error {
	detailFn := WrapWithDelay(5*time.Second, w.extractWinfittsDetails)
	processedCount := 0

	for i, link := range links {
		linkLogger := log.With(zap.Int("link_index", i+1), zap.String("link", link))

		if err := w.processWinfittsLink(ctx, linkLogger, project, link, detailFn); err != nil {
			return err
		}

		processedCount++
	}

	log.Info("Project update completed",
		zap.Int("processed_links", processedCount),
		zap.Int("total_links", len(links)))

	return nil
}

func (w *WinfittsProcessor) processWinfittsLink(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary, link string, detailFn func(context.Context, logger.ILogger, string) ([]models.WinfittsRawData, error)) error {
	if !strings.Contains(strings.ToLower(link), "winfitts") {
		log.Info("Skipping non-winfitts link")
		return nil
	}

	log.Info("Processing winfitts link")
	taskID := w.extractTaskID(link)

	rows, err := w.extractWinfittsData(ctx, log, taskID, detailFn)
	if err != nil {
		return err
	}

	return w.saveWinfittsData(ctx, log, project, taskID, rows)
}

func (w *WinfittsProcessor) extractTaskID(link string) string {
	array := strings.Split(link, "/")
	return array[len(array)-1]
}

func (w *WinfittsProcessor) extractWinfittsData(ctx context.Context, log logger.ILogger, taskID string, detailFn func(context.Context, logger.ILogger, string) ([]models.WinfittsRawData, error)) ([]models.WinfittsRawData, error) {
	log.Info("Extracting winfitts details", zap.String("task_id", taskID))
	rows, err := detailFn(ctx, log, taskID)
	if err != nil {
		log.Error("Failed to extract winfitts details",
			zap.String("task_id", taskID),
			zap.Error(err))
		return nil, err
	}
	return rows, nil
}

func (w *WinfittsProcessor) saveWinfittsData(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary, taskID string, rows []models.WinfittsRawData) error {
	log.Info("Saving winfitts data to database",
		zap.String("task_id", taskID),
		zap.Int("rows_count", len(rows)))

	if err := w.db.UpsertExtractWinfittsDetails(ctx, log, project, rows); err != nil {
		log.Error("Failed to save winfitts details to database",
			zap.String("task_id", taskID),
			zap.Error(err))
		return err
	}

	log.Info("Successfully processed winfitts link", zap.String("task_id", taskID))
	return nil
}
