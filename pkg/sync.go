package pkg

import (
	"errors"
)

var (
	errSyncInProgress            = errors.New("sync in progress")
	errFailedToLogin             = errors.New("failed to login")
	errSyncAlreadyInProgress     = errors.New("sync already in progress")
	errNoSyncOperationInProgress = errors.New("no sync operation in progress")
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
	if a.syncManager.IsRunning() {
		return &LoginResponse{
			Success: false,
			Message: "Sync already in progress",
		}, errSyncInProgress
	}

	if err := a.fetcher.Login(a.ctx, a.log, email, password); err != nil {
		return &LoginResponse{
			Success: false,
			Message: "invalid email or password",
		}, errFailedToLogin
	}

	return &LoginResponse{Success: true, Message: "Login successful"}, nil
}

func (a *App) StartSync() error {
	return a.syncManager.StartSync(a.ctx)
}

func (a *App) CancelSync() error {
	return a.syncManager.CancelSync()
}

func (a *App) GetSyncStatus() map[string]any {
	return map[string]any{
		"isSyncing": a.syncManager.IsRunning(),
	}
}
