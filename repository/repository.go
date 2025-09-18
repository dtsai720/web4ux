package repository

import (
	"database/sql"
	_ "embed"
	"fmt"

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

func (r *Repository) SetQueries(queries IDatabase) {
	r.queries = queries
}

func New(db *sql.DB) (*Repository, error) {
	if _, err := db.Exec(createTableQuery); err != nil {
		return nil, fmt.Errorf("failed to create database tables: %w", err)
	}

	return &Repository{db: db, queries: sqlc.New(db)}, nil
}
