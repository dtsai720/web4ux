package pkg

import (
	"context"
	"errors"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/sliceutils"
)

type SyncProgress struct {
	CurrentProject string `json:"currentProject"`
	CurrentIndex   int    `json:"currentIndex"`
	Progress       int    `json:"progress"`
	TotalProjects  int    `json:"totalProjects"`
	IsCompleted    bool   `json:"isCompleted"`
	IsCancelled    bool   `json:"isCancelled"`
}

type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (a *App) LoginAndSync(email, password string) (*LoginResponse, error) {
	if a.isSyncing {
		return &LoginResponse{
			Success: false,
			Message: "Sync already in progress",
		}, errors.New("sync in progress")
	}

	if err := a.fetcher.Login(a.ctx, a.log, email, password); err != nil {
		return &LoginResponse{
			Success: false,
			Message: "invalid email or password",
		}, errors.New("failed to login")
	}

	return &LoginResponse{Success: true, Message: "Login successful"}, nil
}

func (a *App) StartSync() error {
	if a.isSyncing {
		return errors.New("sync already in progress")
	}

	a.isSyncing = true

	// Create a cancellable context
	ctx, cancel := context.WithCancel(a.ctx)
	a.cancelFunc = cancel
	go a.performSync(ctx)

	return nil
}

//nolint:funlen
func (a *App) performSync(ctx context.Context) {
	defer func() {
		a.isSyncing = false
		a.cancelFunc = nil
	}()

	projectList, err := a.fetcher.ListAllProjects(a.ctx, a.log)
	if err != nil {
		a.emitSyncProgress(SyncProgress{
			CurrentProject: err.Error(),
			Progress:       100,
			TotalProjects:  0,
			IsCompleted:    false,
			IsCancelled:    true,
		})

		return
	}

	projectList = sliceutils.Filter(projectList, func(in htmlparser.ProjectSummary) bool {
		return strings.Contains(strings.ToLower(in.Link), "winfitts")
	})

	for i, project := range projectList {
		a.log.Infof("project: %+v", project)
		select {
		case <-ctx.Done():
			// Send cancellation event
			a.emitSyncProgress(SyncProgress{
				CurrentProject: project.Name,
				CurrentIndex:   i,
				Progress:       (i * 100) / len(projectList),
				TotalProjects:  len(projectList),
				IsCompleted:    false,
				IsCancelled:    true,
			})

			return
		default:
			if err := a.fetcher.FetchDataAndSave(a.ctx, a.log, project); err != nil {
				a.log.Errorf("An error occurred while fetching ans saving data: %s", err)

				a.emitSyncProgress(SyncProgress{
					CurrentProject: project.Name,
					CurrentIndex:   i,
					Progress:       100,
					TotalProjects:  0,
					IsCompleted:    false,
					IsCancelled:    true,
				})

				return
			} else {
				progress := (i * 100) / len(projectList)
				a.emitSyncProgress(SyncProgress{
					CurrentProject: project.Name,
					CurrentIndex:   i,
					Progress:       progress,
					TotalProjects:  len(projectList),
					IsCompleted:    false,
					IsCancelled:    false,
				})
			}
		}
	}

	// Sync completed
	a.emitSyncProgress(SyncProgress{
		CurrentProject: "All projects completed",
		Progress:       100,
		CurrentIndex:   len(projectList),
		TotalProjects:  len(projectList),
		IsCompleted:    true,
		IsCancelled:    false,
	})
}

func (a *App) emitSyncProgress(progress SyncProgress) {
	// Send progress updates using Wails event system
	runtime.EventsEmit(a.ctx, "sync:progress", progress)
	a.log.Infof("Sync Progress: %+v\n", progress)
}

func (a *App) CancelSync() error {
	if !a.isSyncing || a.cancelFunc == nil {
		return errors.New("no sync operation in progress")
	}

	a.cancelFunc()

	return nil
}

func (a *App) GetSyncStatus() map[string]any {
	return map[string]any{
		"isSyncing": a.isSyncing,
	}
}
