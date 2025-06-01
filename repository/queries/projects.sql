-- name: UpsertProject :one
INSERT INTO projects (id, name, creator, updated_at)
VALUES (@id, @name, @creator, @updated_at)
ON CONFLICT(id) DO UPDATE SET
    name = EXCLUDED.name,
    creator = EXCLUDED.creator,
    updated_at = EXCLUDED.updated_at
RETURNING *;

-- name: ListProjects :many
SELECT * FROM projects
WHERE (COALESCE(@id, '') = '' OR id = @id)
AND (COALESCE(@name, '') = '' OR name = @name)
AND (COALESCE(@creator, '') = '' OR creator = @creator);

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
