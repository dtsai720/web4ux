package pkg

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/sliceutils"
)

// SyncProgress represents the sync progress data
type SyncProgress struct {
	CurrentProject string `json:"currentProject"`
	CurrentIndex   int    `json:"currentIndex"`
	Progress       int    `json:"progress"`
	TotalProjects  int    `json:"totalProjects"`
	IsCompleted    bool   `json:"isCompleted"`
	IsCancelled    bool   `json:"isCancelled"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (a *App) LoginAndSync(email, password string) (*LoginResponse, error) {
	fmt.Println("LoginAndSync:  ", email, password)
	if a.isSyncing {
		return &LoginResponse{
			Success: false,
			Message: "Sync already in progress",
		}, errors.New("sync in progress")
	}

	if err := a.service.Login(a.ctx, a.log, email, password); err != nil {
		return &LoginResponse{
			Success: false,
			Message: "invalid email or password",
		}, errors.New("failed to login")
	}

	return &LoginResponse{Success: true, Message: "Login successful"}, nil
}

// StartSync starts the synchronization process
func (a *App) StartSync() error {
	if a.isSyncing {
		return errors.New("sync already in progress")
	}

	a.isSyncing = true

	// 創建一個可取消的 context
	ctx, cancel := context.WithCancel(a.ctx)
	a.cancelFunc = cancel
	go a.performSync(ctx)

	return nil
}

// performSync performs the actual sync operation
func (a *App) performSync(ctx context.Context) {
	defer func() {
		a.isSyncing = false
		a.cancelFunc = nil
	}()

	projectList, err := a.service.ListAllProjects(a.ctx, a.log)
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
		select {
		case <-ctx.Done():
			// 發送取消事件
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
			if err := a.service.FetchDataAndSave(a.ctx, a.log, project); err != nil {
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

	// 同步完成
	a.emitSyncProgress(SyncProgress{
		CurrentProject: "All projects completed",
		Progress:       100,
		CurrentIndex:   len(projectList),
		TotalProjects:  len(projectList),
		IsCompleted:    true,
		IsCancelled:    false,
	})
}

// emitSyncProgress emits sync progress to frontend
func (a *App) emitSyncProgress(progress SyncProgress) {
	// 使用 Wails 的事件系統發送進度更新
	runtime.EventsEmit(a.ctx, "sync:progress", progress)
	fmt.Printf("Sync Progress: %+v\n", progress)
}

// CancelSync cancels the ongoing sync operation
func (a *App) CancelSync() error {
	if !a.isSyncing || a.cancelFunc == nil {
		return errors.New("no sync operation in progress")
	}

	a.cancelFunc()
	return nil
}

// GetSyncStatus returns current sync status
func (a *App) GetSyncStatus() map[string]interface{} {
	return map[string]interface{}{
		"isSyncing": a.isSyncing,
	}
}
