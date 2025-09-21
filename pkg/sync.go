package pkg

import (
	"github.com/web4ux/src/errs"
)

var (
	errSyncInProgress            = errs.NewAppError(errs.ValidationError, "sync operation is already in progress", nil)
	errSyncAlreadyInProgress     = errs.NewAppError(errs.ValidationError, "sync operation is already running", nil)
	errNoSyncOperationInProgress = errs.NewAppError(errs.ValidationError, "no sync operation is currently in progress", nil)
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
		wrappedErr := errs.NewAppError(errs.AuthenticationError, "failed to authenticate user credentials", err)
		wrappedErr.Context = map[string]any{
			"operation": "LoginAndSync",
			"component": "App",
			"email":     email,
		}
		return &LoginResponse{
			Success: false,
			Message: "invalid email or password",
		}, wrappedErr
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
