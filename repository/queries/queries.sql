-- name: UpsertDevices :one
INSERT INTO devices (id, "order", name, project_id)
VALUES (@id, @order, @name, @project_id)
ON CONFLICT(name, project_id) DO UPDATE
    SET name = EXCLUDED.name
RETURNING *;

-- name: UpsertParticipants :one
INSERT INTO participants (id, name, project_id, serial)
VALUES (@id, @name, @project_id, @serial)
ON CONFLICT(name, project_id) DO UPDATE
    SET name = EXCLUDED.name
RETURNING *;

-- name: UpsertWinfitts :one
INSERT INTO winfitts (id, project_id, device_id, participant_id)
VALUES (@id, @project_id, @device_id, @participant_id)
ON CONFLICT(project_id, device_id, participant_id) DO UPDATE
    SET device_id = EXCLUDED.device_id
RETURNING *;

-- name: UpsertWinfittsInformation :one
INSERT INTO winfitts_information (id, winfitts_id, trail_number, width, distance, angle, is_failed, error_times, deleted)
VALUES (@id, @winfitts_id, @trail_number, @width, @distance, @angle, @is_failed, @error_times, @deleted)
ON CONFLICT(winfitts_id, trail_number) DO UPDATE
    SET is_failed = EXCLUDED.is_failed,
    error_times = EXCLUDED.error_times,
    deleted = EXCLUDED.deleted
RETURNING *;

-- name: UpsertWinfittsDetail :one
INSERT INTO winfitts_details (id, information_id, mark, x, y, timestamp)
VALUES (@id, @information_id, @mark, @x, @y, @timestamp)
ON CONFLICT(information_id, timestamp) DO UPDATE
    SET timestamp = EXCLUDED.timestamp
RETURNING *;

-- name: DeleteWinfittsInformation :exec
UPDATE winfitts_information SET deleted = @deleted WHERE id = @information_id;
