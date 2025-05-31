-- name: CreateUser :one
INSERT INTO
    users (id, email, password)
VALUES
    (@id, @email, @password) RETURNING id;

-- name: ListUsers :many
SELECT *
FROM users
WHERE id = @id;
