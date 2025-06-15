-- name: UpsertProject :one
INSERT INTO projects (id, name, creator, updated_at)
VALUES (@id, @name, @creator, @updated_at)
ON CONFLICT(id) DO UPDATE SET
    name = EXCLUDED.name,
    creator = EXCLUDED.creator,
    updated_at = EXCLUDED.updated_at
RETURNING *;

-- name: ListProjectsOrderByUpdatedAtDesc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsOrderByUpdatedAtAsc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY updated_at ASC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsOrderByNameDesc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY name DESC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsOrderByNameAsc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY name ASC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsOrderByCreatorDesc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY creator DESC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsOrderByCreatorAsc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY creator ASC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: CountProjects :one
SELECT COUNT(1) FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator);

-- name: GetProjectDetail :many
SELECT projects.name AS project_name,
	devices.name AS device_name,
	participants.name AS participant_name,
	winfitts_informatiON.error_times,
	winfitts_informatiON.is_failed,
	winfitts_informatiON.trail_number,
	winfitts_details.mark,
	winfitts_details.timestamp
FROM projects
INNER JOIN devices ON projects.id = devices.project_id
INNER JOIN participants ON projects.id  = participants.project_id
INNER JOIN winfitts ON
	projects.id = winfitts.project_id
	AND devices.id = winfitts.device_id
	AND participants.id = winfitts.participant_id
INNER JOIN winfitts_informatiON ON winfitts.id = winfitts_informatiON.winfitts_id
INNER JOIN winfitts_details ON winfitts_informatiON.id = winfitts_details.informatiON_id
WHERE projects.id = @project_id
ORDER BY device_name,  participant_name, trail_number ASC
