package repository

import (
	"database/sql"
	_ "embed"

	"github.com/web4ux/repository/sqlc"
	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var createTableQuery string

var _ IRepository = (*Repository)(nil)

type Repository struct {
	db      *sql.DB
	queries IDatabase
}

func New(db *sql.DB) (*Repository, error) {
	if _, err := db.Exec(createTableQuery); err != nil {
		return nil, err
	}

	return &Repository{db: db, queries: sqlc.New(db)}, nil
}
