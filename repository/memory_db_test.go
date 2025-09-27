package repository_test

import (
	"context"
	"database/sql"
	_ "embed"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/models"
	"github.com/web4ux/repository"
	"github.com/web4ux/src/logger"
	_ "modernc.org/sqlite" // SQLite driver
)

//go:embed schema.sql
var schemaSQL string

func setupInMemoryDB(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite", ":memory:")
	require.NoError(t, err, "failed to open in-memory database")

	// Create the necessary tables using embedded schema
	_, err = db.Exec(schemaSQL)
	require.NoError(t, err, "failed to create schema")

	return db
}

func TestRepository_UpsertExtractWinfittsDetails_WithMemoryDB(t *testing.T) {
	// Note: This test requires the sqlite3 driver to be available
	// Skip if not available to avoid breaking the build
	if testing.Short() {
		t.Skip("Skipping memory DB test in short mode")
	}

	t.Parallel()

	db := setupInMemoryDB(t)
	defer db.Close()

	tests := []struct {
		name        string
		project     models.ProjectSummary
		rows        []models.WinfittsRawData
		expectError bool
	}{
		{
			name: "successful insertion with memory database",
			project: models.ProjectSummary{
				ID:      "memory-test-project",
				Name:    "Memory Test Project",
				Creator: "Memory Tester",
				Time:    time.Now(),
			},
			rows: []models.WinfittsRawData{
				{
					DeviceName:        "Memory-Device",
					Participant:       "Memory-Participant",
					ParticipantSerial: "1",
					DeviceOrder:       "1",
					Items: []models.WinfittsSummary{
						{
							TrailNumber: 1,
							ErrorTimes:  0,
							IsFailed:    false,
							Width:       100,
							Distance:    200,
							Angle:       90,
							Details: []models.WinfittsDetail{
								{
									Mark:      "memory-start",
									Timestamp: 1000,
									Position:  models.NewPosition(50, 75),
								},
								{
									Mark:      "memory-end",
									Timestamp: 2000,
									Position:  models.NewPosition(150, 275),
								},
							},
						},
					},
				},
			},
			expectError: false,
		},
		{
			name: "insertion with multiple items and details",
			project: models.ProjectSummary{
				ID:      "memory-complex-project",
				Name:    "Memory Complex Project",
				Creator: "Complex Tester",
				Time:    time.Now(),
			},
			rows: []models.WinfittsRawData{
				{
					DeviceName:        "Complex-Device-1",
					Participant:       "Complex-Participant-1",
					ParticipantSerial: "1",
					DeviceOrder:       "1",
					Items: []models.WinfittsSummary{
						{
							TrailNumber: 1,
							ErrorTimes:  2,
							IsFailed:    true,
							Width:       150,
							Distance:    300,
							Angle:       45,
							Details: []models.WinfittsDetail{
								{Mark: "start", Timestamp: 1000, Position: models.NewPosition(0, 0)},
								{Mark: "middle", Timestamp: 1500, Position: models.NewPosition(75, 150)},
								{Mark: "end", Timestamp: 2000, Position: models.NewPosition(150, 300)},
							},
						},
						{
							TrailNumber: 2,
							ErrorTimes:  0,
							IsFailed:    false,
							Width:       200,
							Distance:    400,
							Angle:       90,
							Details: []models.WinfittsDetail{
								{Mark: "point1", Timestamp: 3000, Position: models.NewPosition(100, 200)},
								{Mark: "point2", Timestamp: 4000, Position: models.NewPosition(200, 400)},
							},
						},
					},
				},
				{
					DeviceName:        "Complex-Device-2",
					Participant:       "Complex-Participant-2",
					ParticipantSerial: "2",
					DeviceOrder:       "2",
					Items: []models.WinfittsSummary{
						{
							TrailNumber: 1,
							ErrorTimes:  1,
							IsFailed:    true,
							Width:       120,
							Distance:    240,
							Angle:       60,
							Details: []models.WinfittsDetail{
								{Mark: "test1", Timestamp: 5000, Position: models.NewPosition(60, 120)},
								{Mark: "test2", Timestamp: 6000, Position: models.NewPosition(120, 240)},
							},
						},
					},
				},
			},
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Cannot use t.Parallel() here because we're using a shared database

			ctx := context.Background()
			log := logger.NewTestLogger()

			// Create repository with the in-memory database
			repo, err := repository.New(db)
			require.NoError(t, err, "repository should be created without error")
			require.NotNil(t, repo, "repository should be created")

			// This should now work with real database operations
			err = repo.UpsertExtractWinfittsDetails(ctx, log, tt.project, tt.rows)

			if tt.expectError {
				require.Error(t, err, "should return error")
			} else {
				require.NoError(t, err, "should complete successfully")

				// Verify that the data was actually inserted
				var count int
				err = db.QueryRow("SELECT COUNT(*) FROM projects WHERE id = ?", tt.project.ID).Scan(&count)
				require.NoError(t, err, "should be able to count projects")
				assert.Equal(t, 1, count, "project should be inserted")

				// Verify devices were inserted
				err = db.QueryRow("SELECT COUNT(*) FROM devices WHERE project_id = ?", tt.project.ID).Scan(&count)
				require.NoError(t, err, "should be able to count devices")
				assert.Equal(t, len(tt.rows), count, "devices should be inserted")

				// Verify participants were inserted
				err = db.QueryRow("SELECT COUNT(*) FROM participants WHERE project_id = ?", tt.project.ID).Scan(&count)
				require.NoError(t, err, "should be able to count participants")
				assert.Equal(t, len(tt.rows), count, "participants should be inserted")

				// Verify winfitts records were inserted
				err = db.QueryRow("SELECT COUNT(*) FROM winfitts WHERE project_id = ?", tt.project.ID).Scan(&count)
				require.NoError(t, err, "should be able to count winfitts")
				assert.Equal(t, len(tt.rows), count, "winfitts records should be inserted")

				// Count total items across all rows
				totalItems := 0
				for _, row := range tt.rows {
					totalItems += len(row.Items)
				}

				// Verify winfitts_information records were inserted
				err = db.QueryRow(`
					SELECT COUNT(*) FROM winfitts_information wi
					JOIN winfitts w ON wi.winfitts_id = w.id
					WHERE w.project_id = ?
				`, tt.project.ID).Scan(&count)
				require.NoError(t, err, "should be able to count winfitts information")
				assert.Equal(t, totalItems, count, "winfitts information records should be inserted")

				// Count total details across all items
				totalDetails := 0
				for _, row := range tt.rows {
					for _, item := range row.Items {
						totalDetails += len(item.Details)
					}
				}

				// Verify winfitts_details records were inserted
				err = db.QueryRow(`
					SELECT COUNT(*) FROM winfitts_details wd
					JOIN winfitts_information wi ON wd.information_id = wi.id
					JOIN winfitts w ON wi.winfitts_id = w.id
					WHERE w.project_id = ?
				`, tt.project.ID).Scan(&count)
				require.NoError(t, err, "should be able to count winfitts details")
				assert.Equal(t, totalDetails, count, "winfitts details records should be inserted")
			}
		})
	}
}

func TestWinfittsDataProcessor_ProcessFlow_WithMemoryDB(t *testing.T) {
	// Skip if in short mode to avoid dependencies
	if testing.Short() {
		t.Skip("Skipping memory DB test in short mode")
	}

	t.Parallel()

	db := setupInMemoryDB(t)
	defer db.Close()

	ctx := context.Background()
	log := logger.NewTestLogger()
	repo, err := repository.New(db)
	require.NoError(t, err, "repository should be created without error")

	// Test the complete flow from start to finish
	project := models.ProjectSummary{
		ID:      "flow-test-project",
		Name:    "Flow Test Project",
		Creator: "Flow Tester",
		Time:    time.Now(),
	}

	rows := []models.WinfittsRawData{
		{
			DeviceName:        "Flow-Device",
			Participant:       "Flow-Participant",
			ParticipantSerial: "1",
			DeviceOrder:       "1",
			Items: []models.WinfittsSummary{
				{
					TrailNumber: 1,
					ErrorTimes:  1,
					IsFailed:    false,
					Width:       110,
					Distance:    220,
					Angle:       75,
					Details: []models.WinfittsDetail{
						{
							Mark:      "flow-mark-1",
							Timestamp: 1100,
							Position:  models.NewPosition(55, 110),
						},
						{
							Mark:      "flow-mark-2",
							Timestamp: 2200,
							Position:  models.NewPosition(110, 220),
						},
					},
				},
			},
		},
	}

	// Execute the full processing flow
	err = repo.UpsertExtractWinfittsDetails(ctx, log, project, rows)
	require.NoError(t, err, "should process the complete flow successfully")

	// Verify the complete data chain was created correctly

	// 1. Check project
	var projectName string
	err = db.QueryRow("SELECT name FROM projects WHERE id = ?", project.ID).Scan(&projectName)
	require.NoError(t, err, "should find the project")
	assert.Equal(t, project.Name, projectName, "project name should match")

	// 2. Check device
	var deviceName string
	err = db.QueryRow("SELECT name FROM devices WHERE project_id = ?", project.ID).Scan(&deviceName)
	require.NoError(t, err, "should find the device")
	assert.Equal(t, rows[0].DeviceName, deviceName, "device name should match")

	// 3. Check participant
	var participantName string
	err = db.QueryRow("SELECT name FROM participants WHERE project_id = ?", project.ID).Scan(&participantName)
	require.NoError(t, err, "should find the participant")
	assert.Equal(t, rows[0].Participant, participantName, "participant name should match")

	// 4. Check winfitts information
	var trailNumber int
	var width, distance, angle, errorTimes int
	var isFailed bool
	err = db.QueryRow(`
		SELECT wi.trail_number, wi.width, wi.distance, wi.angle, wi.error_times, wi.is_failed
		FROM winfitts_information wi
		JOIN winfitts w ON wi.winfitts_id = w.id
		WHERE w.project_id = ?
	`, project.ID).Scan(&trailNumber, &width, &distance, &angle, &errorTimes, &isFailed)
	require.NoError(t, err, "should find the winfitts information")

	item := rows[0].Items[0]
	assert.Equal(t, item.TrailNumber, trailNumber, "trail number should match")
	assert.Equal(t, item.Width, width, "width should match")
	assert.Equal(t, item.Distance, distance, "distance should match")
	assert.Equal(t, item.Angle, angle, "angle should match")
	assert.Equal(t, item.ErrorTimes, errorTimes, "error times should match")
	assert.Equal(t, item.IsFailed, isFailed, "is failed should match")

	// 5. Check winfitts details
	var detailCount int
	err = db.QueryRow(`
		SELECT COUNT(*)
		FROM winfitts_details wd
		JOIN winfitts_information wi ON wd.information_id = wi.id
		JOIN winfitts w ON wi.winfitts_id = w.id
		WHERE w.project_id = ?
	`, project.ID).Scan(&detailCount)
	require.NoError(t, err, "should be able to count details")
	assert.Equal(t, len(item.Details), detailCount, "detail count should match")

	// Verify specific detail data
	var mark string
	var x, y, timestamp int
	err = db.QueryRow(`
		SELECT wd.mark, wd.x, wd.y, wd.timestamp
		FROM winfitts_details wd
		JOIN winfitts_information wi ON wd.information_id = wi.id
		JOIN winfitts w ON wi.winfitts_id = w.id
		WHERE w.project_id = ?
		ORDER BY wd.timestamp
		LIMIT 1
	`, project.ID).Scan(&mark, &x, &y, &timestamp)
	require.NoError(t, err, "should find the first detail")

	firstDetail := item.Details[0]
	assert.Equal(t, firstDetail.Mark, mark, "detail mark should match")
	assert.Equal(t, firstDetail.Position.X, x, "detail X position should match")
	assert.Equal(t, firstDetail.Position.Y, y, "detail Y position should match")
	assert.Equal(t, firstDetail.Timestamp, timestamp, "detail timestamp should match")
}
