-- name: CreateUser :one
INSERT INTO
    users (uid, email, password)
VALUES
    (?, ?, ?) RETURNING uid;

-- name: ListUsers :many
SELECT
    *
FROM
    users
WHERE
    uid = ?;
