package pkg

import (
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) LoginAndSync(username, password string) string {
	// _ = a.service.Login(a.ctx, a.log, username, password)
	// go a.service.FetchDataAndSave(a.ctx, a.log)

	projects := []string{"Project A", "Project B", "Project C"}
	for _, p := range projects {
		runtime.EventsEmit(a.ctx, "sync:progress", p)
		time.Sleep(1 * time.Second) // 模擬同步過程
	}

	return "start syncing"
}
