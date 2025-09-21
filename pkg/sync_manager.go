package pkg

import (
	"context"

	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/sliceutils"
)

type SyncManager struct {
	fetcher          fetcher.IService
	log              logger.ILogger
	progressReporter IProgressReporter
	projectFilter    IProjectFilter
	isRunning        bool
	cancelFunc       context.CancelFunc
}

func NewSyncManager(fetcher fetcher.IService, log logger.ILogger, progressReporter IProgressReporter, projectFilter IProjectFilter) *SyncManager {
	return &SyncManager{
		fetcher:          fetcher,
		log:              log,
		progressReporter: progressReporter,
		projectFilter:    projectFilter,
		isRunning:        false,
	}
}

func (sm *SyncManager) IsRunning() bool {
	return sm.isRunning
}

func (sm *SyncManager) StartSync(ctx context.Context) error {
	if sm.isRunning {
		return errSyncAlreadyInProgress
	}

	sm.isRunning = true
	syncCtx, cancel := context.WithCancel(ctx)
	sm.cancelFunc = cancel

	go sm.performSync(syncCtx)
	return nil
}

func (sm *SyncManager) CancelSync() error {
	if !sm.isRunning || sm.cancelFunc == nil {
		return errNoSyncOperationInProgress
	}

	sm.cancelFunc()
	return nil
}

func (sm *SyncManager) performSync(ctx context.Context) {
	defer func() {
		sm.isRunning = false
		sm.cancelFunc = nil
	}()

	projectList, err := sm.fetchProjectList(ctx)
	if err != nil {
		sm.progressReporter.ReportError(ctx, sm.log, err.Error())
		return
	}

	filteredProjects := sm.filterProcessableProjects(projectList)
	sm.processSyncProjects(ctx, filteredProjects)
}

func (sm *SyncManager) fetchProjectList(ctx context.Context) ([]htmlparser.ProjectSummary, error) {
	projectList, err := sm.fetcher.ListAllProjects(ctx, sm.log)
	if err != nil {
		sm.log.Errorf("Failed to fetch project list: %v", err)
		wrappedErr := errs.NewAppError(errs.NetworkError, "failed to fetch project list from remote server", err)
		wrappedErr.Context = map[string]any{
			"operation": "fetchProjectList",
			"component": "SyncManager",
		}
		return nil, wrappedErr
	}
	return projectList, nil
}

func (sm *SyncManager) filterProcessableProjects(projectList []htmlparser.ProjectSummary) []htmlparser.ProjectSummary {
	return sliceutils.Filter(projectList, func(project htmlparser.ProjectSummary) bool {
		return sm.projectFilter.ShouldProcess(project)
	})
}

func (sm *SyncManager) processSyncProjects(ctx context.Context, projects []htmlparser.ProjectSummary) {
	totalProjects := len(projects)

	for i, project := range projects {
		sm.log.Infof("Processing project: %+v", project)

		select {
		case <-ctx.Done():
			sm.progressReporter.ReportCancellation(ctx, sm.log, project.Name, i, totalProjects)
			return
		default:
			if err := sm.processProject(ctx, project, i, totalProjects); err != nil {
				sm.progressReporter.ReportError(ctx, sm.log, err.Error())
				return
			}
		}
	}

	sm.progressReporter.ReportCompletion(ctx, sm.log, totalProjects)
}

func (sm *SyncManager) processProject(ctx context.Context, project htmlparser.ProjectSummary, currentIndex, totalProjects int) error {
	if err := sm.fetcher.FetchDataAndSave(ctx, sm.log, project); err != nil {
		sm.log.Errorf("Failed to process project %s: %v", project.Name, err)
		wrappedErr := errs.NewAppError(errs.ProcessingError, "failed to fetch and save project data", err)
		wrappedErr.Context = map[string]any{
			"operation":     "processProject",
			"component":     "SyncManager",
			"projectName":   project.Name,
			"projectLink":   project.Link,
			"currentIndex":  currentIndex,
			"totalProjects": totalProjects,
		}
		return wrappedErr
	}

	progress := (currentIndex * 100) / totalProjects
	sm.progressReporter.ReportProgress(ctx, sm.log, project.Name, currentIndex, progress, totalProjects)
	return nil
}
