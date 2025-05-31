-- name: UpsertProject :one
INSERT INTO projects (id, name, creator, updated_at)
VALUES (@id, @name, @creator, @updated_at)
ON CONFLICT(id) DO UPDATE SET
    name = EXCLUDED.name,
    creator = EXCLUDED.creator,
    updated_at = EXCLUDED.updated_at
RETURNING id;

-- name: ListProjects :many
SELECT * FROM projects
WHERE (COALESCE(@id, '') = '' OR id = @id)
AND (COALESCE(@name, '') = '' OR name = @name)
AND (COALESCE(@creator, '') = '' OR creator = @creator);
