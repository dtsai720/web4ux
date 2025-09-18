package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/web4ux/models"
	"github.com/web4ux/repository/sqlc"
)

func mapToUpsertProjectParams(project models.ProjectSummary) sqlc.UpsertProjectParams {
	return sqlc.UpsertProjectParams{
		ID:        project.ID,
		Name:      project.Name,
		Creator:   project.Creator,
		UpdatedAt: project.Time.UTC().Format(time.RFC3339),
	}
}

func mapToUpsertDevicesParams(project models.ProjectSummary, row models.WinfittsRawData) sqlc.UpsertDevicesParams {
	return sqlc.UpsertDevicesParams{
		ID:        uuid.NewString(),
		Order:     row.DeviceOrder,
		ProjectID: project.ID,
		Name:      row.DeviceName,
	}
}

func mapToUpsertParticipantsParams(project models.ProjectSummary, row models.WinfittsRawData) sqlc.UpsertParticipantsParams {
	return sqlc.UpsertParticipantsParams{
		ID:        uuid.NewString(),
		Name:      row.Participant,
		ProjectID: project.ID,
		Serial:    row.ParticipantSerial,
	}
}

func mapToUpsertWinfittsParams(projectID, deviceID, participantID string) sqlc.UpsertWinfittsParams {
	return sqlc.UpsertWinfittsParams{
		ID:            uuid.NewString(),
		ProjectID:     projectID,
		DeviceID:      deviceID,
		ParticipantID: participantID,
	}
}

func mapToUpsertWinfittsInformationParams(winfitts sqlc.Winfitt, item models.WinfittsSummary) sqlc.UpsertWinfittsInformationParams {
	return sqlc.UpsertWinfittsInformationParams{
		ID:          uuid.NewString(),
		WinfittsID:  winfitts.ID,
		TrailNumber: int64(item.TrailNumber),
		Width:       int64(item.Width),
		Distance:    int64(item.Distance),
		Angle:       int64(item.Angle),
		IsFailed:    item.IsFailed,
		ErrorTimes:  int64(item.ErrorTimes),
		Deleted:     false,
	}
}

func mapToUpsertWinfittsDetail(informationID string, detail models.WinfittsDetail) sqlc.UpsertWinfittsDetailParams {
	return sqlc.UpsertWinfittsDetailParams{
		ID:            uuid.NewString(),
		InformationID: informationID,
		Mark:          detail.Mark,
		X:             int64(detail.Position.X),
		Y:             int64(detail.Position.Y),
		Timestamp:     int64(detail.Timestamp),
	}
}
