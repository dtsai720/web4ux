-- name: FindProject :one
SELECT * FROM projects WHERE id = @id;

-- name: CountProjects :one
SELECT COUNT(1) FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator);

-- name: ListProjectsByTimeDesc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsByTimeAsc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY updated_at ASC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsByNameDesc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY name DESC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsByNameAsc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY name ASC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsByCreatorDesc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY creator DESC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: ListProjectsByCreatorAsc :many
SELECT * FROM projects
WHERE (COALESCE(@name, '') = '' OR name LIKE @name)
AND (COALESCE(@creator, '') = '' OR creator LIKE @creator)
ORDER BY creator ASC, updated_at DESC
LIMIT @limit OFFSET @offset;

-- name: FindProjectDetails :many
SELECT projects.name AS project_name,
	projects.id AS project_id,
	projects.creator AS project_creator,
	projects.updated_at AS project_updated_at,
	devices.name AS device_name,
	devices."order" AS device_order,
	participants.name AS participant_name,
	participants.serial AS participant_serial,
	winfitts_information.id AS information_id,
	winfitts_information.deleted,
	winfitts_information.error_times,
	winfitts_information.is_failed,
	winfitts_information.trail_number,
	winfitts_information.width,
	winfitts_information.distance,
	winfitts_details.mark,
	winfitts_details.timestamp,
	winfitts_details.x,
	winfitts_details.y
FROM projects
INNER JOIN devices ON projects.id = devices.project_id
INNER JOIN participants ON projects.id  = participants.project_id
INNER JOIN winfitts ON
	projects.id = winfitts.project_id
	AND devices.id = winfitts.device_id
	AND participants.id = winfitts.participant_id
INNER JOIN winfitts_information ON winfitts.id = winfitts_information.winfitts_id
INNER JOIN winfitts_details ON winfitts_information.id = winfitts_details.information_id
WHERE projects.id = @project_id
ORDER BY device_name, participant_name, trail_number ASC
