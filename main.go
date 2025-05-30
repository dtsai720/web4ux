package main

import (
	"context"
	"database/sql"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/web4ux/internal/service"
	"github.com/web4ux/pkg"
	"github.com/web4ux/repository"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
	"go.uber.org/zap"
)

//go:embed all:frontend/dist
var assets embed.FS

const dbPath string = "local.db?_foreign_keys=on&_journal_mode=WAL&_synchronous=NORMAL"

func main() {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		zap.L().Sugar().Panicln("An error occurred while opening database connection", "error", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		zap.L().Sugar().Panicln("An error occurred while pinging database", "error", err)
	}

	repository, err := repository.New(db)
	if err != nil {
		zap.L().Sugar().Panicln("An error occurred while creating database connection", "error", err)
	}

	log, err := zap.NewDevelopment()
	if err != nil {
		zap.L().Sugar().Panicln("An error occurred while creating logger", "error", err)
	}
	defer func() {
		if err := log.Sync(); err != nil {
			zap.L().Sugar().Error("An error occurred while syncing logger", "error", err)
		}
	}()

	ctx := context.Background()
	logging := logger.New(log)
	service := service.New(
		service.WithClient(request.New()),
		service.WithDatabase(repository),
	)

	go func(ctx context.Context, log logger.ILogger) {
		_ = service.Login(ctx, log, "sandy.tu@emric.com.tw", "emric1238")
		response, _ := service.ListProject(ctx, log, 1)
		log.Info("ListProject response", zap.Any("response", string(response)))
	}(ctx, logging)

	// Create an instance of the app structure
	app := pkg.New(
		pkg.WithService(service),
		pkg.WithLogger(logging),
	)

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
		logging.Fatalln("An error occurred while starting app: ", err)
	}
}
