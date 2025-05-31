CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    creator TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    project_id TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_device_name_project_id ON devices (name, project_id);
CREATE INDEX IF NOT EXISTS idx_devices_project_id ON devices (project_id);

CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    project_id TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_participants_name_project_id ON participants (name, project_id);

CREATE TABLE IF NOT EXISTS winfitts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_winfitts_project_device_participant ON winfitts (project_id, device_id, participant_id);

CREATE TABLE IF NOT EXISTS winfitts_information (
    id TEXT PRIMARY KEY,
    winfitts_id TEXT NOT NULL,
    trail_number INTEGER NOT NULL,
    width INTEGER NOT NULL,
    distance INTEGER NOT NULL,
    angle INTEGER NOT NULL,
    is_failed BOOLEAN NOT NULL,
    error_times INTEGER NOT NULL,
    deleted BOOLEAN NOT NULL,
    FOREIGN KEY (winfitts_id) REFERENCES winfitts(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_winfitts_information_winfitts_trail ON winfitts_information (winfitts_id, trail_number);

CREATE TABLE IF NOT EXISTS winfitts_details (
    id TEXT PRIMARY KEY,
    information_id TEXT NOT NULL,
    mark TEXT NOT NULL,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (information_id) REFERENCES winfitts_information(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_winfitts_details_winfitts_created_at ON winfitts_details (information_id, created_at);
