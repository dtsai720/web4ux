package container

import (
	"database/sql"

	"github.com/web4ux/internal/service/analyzer"
	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/pkg"
	"github.com/web4ux/repository"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
	"go.uber.org/zap"
)

type Config struct {
	DatabasePath string
}

type Container struct {
	config     Config
	db         *sql.DB
	repository repository.IRepository
	logger     logger.ILogger
	fetcher    fetcher.IService
	analyzer   analyzer.IService
	app        *pkg.App
}

func New(config Config) *Container {
	return &Container{
		config: config,
	}
}

func (c *Container) GetDatabase() (*sql.DB, error) {
	if c.db == nil {
		db, err := sql.Open("sqlite", c.config.DatabasePath)
		if err != nil {
			return nil, err
		}

		if err := db.Ping(); err != nil {
			db.Close()
			return nil, err
		}

		c.db = db
	}
	return c.db, nil
}

func (c *Container) GetRepository() (repository.IRepository, error) {
	if c.repository == nil {
		db, err := c.GetDatabase()
		if err != nil {
			return nil, err
		}

		repo, err := repository.New(db)
		if err != nil {
			return nil, err
		}

		c.repository = repo
	}
	return c.repository, nil
}

func (c *Container) GetLogger() (logger.ILogger, error) {
	if c.logger == nil {
		log, err := zap.NewDevelopment()
		if err != nil {
			return nil, err
		}

		c.logger = logger.New(log)
	}
	return c.logger, nil
}

func (c *Container) GetFetcher() (fetcher.IService, error) {
	if c.fetcher == nil {
		repo, err := c.GetRepository()
		if err != nil {
			return nil, err
		}

		c.fetcher = fetcher.New(
			fetcher.WithClient(request.New()),
			fetcher.WithDatabase(repo),
		)
	}
	return c.fetcher, nil
}

func (c *Container) GetAnalyzer() (analyzer.IService, error) {
	if c.analyzer == nil {
		repo, err := c.GetRepository()
		if err != nil {
			return nil, err
		}

		c.analyzer = analyzer.New(
			analyzer.WithClient(request.New()),
			analyzer.WithDatabase(repo),
		)
	}
	return c.analyzer, nil
}

func (c *Container) GetApp() (*pkg.App, error) {
	if c.app == nil {
		fetcherService, err := c.GetFetcher()
		if err != nil {
			return nil, err
		}

		analyzerService, err := c.GetAnalyzer()
		if err != nil {
			return nil, err
		}

		logging, err := c.GetLogger()
		if err != nil {
			return nil, err
		}

		c.app = pkg.New(
			pkg.WithFetcherService(fetcherService),
			pkg.WithAnalyzerService(analyzerService),
			pkg.WithLogger(logging),
		)
	}
	return c.app, nil
}

func (c *Container) Close() error {
	if c.db != nil {
		return c.db.Close()
	}
	return nil
}
