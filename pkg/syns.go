package pkg

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// SyncProgress represents the sync progress data
type SyncProgress struct {
	CurrentProject string `json:"currentProject"`
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
	// 簡單的登入驗證
	if email == "" || password == "" {
		return &LoginResponse{
			Success: false,
			Message: "Email and password are required",
		}, errors.New("invalid credentials")
	}

	// if email != "admin@example.com" || password != "password123" {
	// 	return &LoginResponse{
	// 		Success: false,
	// 		Message: "Invalid email or password",
	// 	}, errors.New("invalid credentials")
	// }

	// 如果已經在同步中，不允許再次開始
	if a.isSyncing {
		return &LoginResponse{
			Success: false,
			Message: "Sync already in progress",
		}, errors.New("sync in progress")
	}

	return &LoginResponse{
		Success: true,
		Message: "Login successful",
	}, nil
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

	projects := []string{"Project 1", "Project 2", "Project 3", "Project 4", "Project 5"}
	totalProjects := len(projects)

	for i, project := range projects {
		select {
		case <-ctx.Done():
			// 發送取消事件
			a.emitSyncProgress(SyncProgress{
				CurrentProject: project,
				Progress:       (i * 100) / totalProjects,
				TotalProjects:  totalProjects,
				IsCompleted:    false,
				IsCancelled:    true,
			})
			return
		default:
			// 發送當前進度
			progress := (i * 100) / totalProjects
			a.emitSyncProgress(SyncProgress{
				CurrentProject: project,
				Progress:       progress,
				TotalProjects:  totalProjects,
				IsCompleted:    false,
				IsCancelled:    false,
			})

			// 模擬 30 秒的同步時間，每秒更新一次進度
			for second := 0; second < 30; second++ {
				select {
				case <-ctx.Done():
					a.emitSyncProgress(SyncProgress{
						CurrentProject: project,
						Progress:       progress,
						TotalProjects:  totalProjects,
						IsCompleted:    false,
						IsCancelled:    true,
					})
					return
				case <-time.After(1 * time.Second):
					// 每秒更新一次，顯示更細緻的進度
					subProgress := progress + (second * 20 / 30) // 每個項目佔20%，30秒內線性增長
					a.emitSyncProgress(SyncProgress{
						CurrentProject: fmt.Sprintf("%s (%d/30s)", project, second+1),
						Progress:       subProgress,
						TotalProjects:  totalProjects,
						IsCompleted:    false,
						IsCancelled:    false,
					})
				}
			}
		}
	}

	// 同步完成
	a.emitSyncProgress(SyncProgress{
		CurrentProject: "All projects completed",
		Progress:       100,
		TotalProjects:  totalProjects,
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
