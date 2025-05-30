package repository

import (
	"context"

	"github.com/web4ux/repository/sqlc"
)

type IRepository interface {
	CreateUser(ctx context.Context, arg sqlc.CreateUserParams) (string, error)
	ListUsers(ctx context.Context, uid string) ([]sqlc.User, error)
}
