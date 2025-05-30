package repository

import (
	"context"
	"database/sql"
	_ "embed"

	_ "github.com/mattn/go-sqlite3"
	"github.com/web4ux/repository/sqlc"
)

//go:embed schema.sql
var createTableQuery string

var _ IRepository = (*Repository)(nil)

type Repository struct {
	db      sqlc.DBTX
	queries IRepository
}

// CreateUser implements IRepository.
func (r *Repository) CreateUser(ctx context.Context, arg sqlc.CreateUserParams) (string, error) {
	return r.queries.CreateUser(ctx, arg)
}

// ListUsers implements IRepository.
func (r *Repository) ListUsers(ctx context.Context, uid string) ([]sqlc.User, error) {
	return r.queries.ListUsers(ctx, uid)
}

func New(db *sql.DB) (IRepository, error) {
	if _, err := db.Exec(createTableQuery); err != nil {
		return nil, err
	}

	return &Repository{db: db, queries: sqlc.New(db)}, nil
}
