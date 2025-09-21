package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/web4ux/internal/container"
	"go.uber.org/zap"
	_ "modernc.org/sqlite"
)

//go:embed all:frontend/dist
var assets embed.FS

const dbPath string = "local.db?_foreign_keys=on&_journal_mode=WAL&_synchronous=NORMAL"

func main() {
	appContainer := container.New(container.Config{
		DatabasePath: dbPath,
	})
	defer func() {
		if err := appContainer.Close(); err != nil {
			zap.L().Sugar().Error("An error occurred while closing container", "error", err)
		}
	}()

	app, err := appContainer.GetApp()
	if err != nil {
		zap.L().Sugar().Panicln("An error occurred while creating app", "error", err)
	}

	logger, err := appContainer.GetLogger()
	if err != nil {
		zap.L().Sugar().Panicln("An error occurred while creating logger", "error", err)
	}

	// Create application with options
	if err := wails.Run(&options.App{
		Title:            "web4ux",
		Width:            1024,
		Height:           768,
		AssetServer:      &assetserver.Options{Assets: assets},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		Bind:             []any{app},
	}); err != nil {
		logger.Fatalln("An error occurred while starting app: ", err)
	}
}
