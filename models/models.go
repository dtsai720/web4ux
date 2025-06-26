package models

import (
	"strconv"
	"strings"
	"time"

	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/sliceutils"
)

type ProjectSummary struct {
	ID      string
	Name    string
	Creator string
	Time    time.Time
	Link    string
}

type ProjectSummaries struct {
	Total int64     `json:"total,omitempty"`
	Data  []Project `json:"data,omitempty"`
}

type ListProjectRequest struct {
	Name    string
	Creator string
	OrderBy string
	IsASC   bool
	Offset  int64
	Limit   int64
}

type Project struct {
	ID        string    `json:"id,omitempty"`
	Name      string    `json:"name,omitempty"`
	Creator   string    `json:"creator,omitempty"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Position struct {
	X int
	Y int
}

type WinfittsDetail struct {
	Mark      string
	Position  Position
	Timestamp int
}

func (w *WinfittsDetail) Load(slice []string) error {
	w.Mark = slice[1]
	numbers := sliceutils.MapFilter(strings.Split(slice[2], ","), func(in string) (int, bool) {
		num, err := strconv.Atoi(in)
		if err != nil {
			return -1, false
		}

		return num, true
	})
	w.Position.X = numbers[0]
	w.Position.Y = numbers[1]
	timestamp, err := strconv.Atoi(slice[3])
	if err != nil {
		return err
	}
	w.Timestamp = timestamp

	return nil
}

type WinfittsSummary struct {
	TrailNumber int
	IsFailed    bool
	Width       int
	Distance    int
	Angle       int
	ErrorTimes  int
	Details     []WinfittsDetail
}

func (w *WinfittsSummary) Load(slice []string) error {
	var builder strings.Builder
	var err error
	for _, context := range slice {
		if !strings.Contains(context, "<div class=\"data3-pack data-pack\">") {
			builder.WriteString(context)

			continue
		}

		matches := spanRegex.FindAllStringSubmatch(builder.String(), -1)
		w.TrailNumber, err = strconv.Atoi(matches[0][1])
		if err != nil {
			return err
		}
		w.IsFailed = matches[1][1] == "Yes"

		w.ErrorTimes, err = strconv.Atoi(matches[2][1])
		if err != nil {
			return err
		}
		w.Width, err = strconv.Atoi(matches[3][1])
		if err != nil {
			return err
		}
		w.Distance, err = strconv.Atoi(matches[4][1])
		if err != nil {
			return err
		}
		w.Angle, err = strconv.Atoi(matches[5][1])
		if err != nil {
			return err
		}

		builder.WriteString(context)
	}

	details := winfittsDetailRegex.FindAllStringSubmatch(builder.String(), -1)
	for _, content := range details {
		var detail WinfittsDetail
		if err := detail.Load(content); err != nil {
			return err
		}

		w.Details = append(w.Details, detail)
	}

	return nil
}

type WinfittsRawData struct {
	ParticipantSerial string
	Participant       string
	DeviceName        string
	Items             []WinfittsSummary
}

func (w *WinfittsRawData) Load(slice []string) error {
	var builder strings.Builder
	contexts := make([]string, 0, len(slice))
	slice = append(slice, "<div class=\"data2-pack \">")
	for _, line := range slice {
		if strings.Contains(line, "<div class=\"data-pack\">") {
			if err := w.parseParticipantAndDevice(builder.String()); err != nil {
				return err
			}
			builder.Reset()
		}

		if strings.Contains(line, "<div class=\"data2-pack \">") || strings.Contains(line, "<div class=\"data2-pack red-light\">") {
			var item WinfittsSummary
			if err := item.Load(contexts); err != nil {
				return err
			}

			contexts = contexts[:0]
			w.Items = append(w.Items, item)
		}

		builder.WriteString(line)
		contexts = append(contexts, line)
	}
	w.Items = w.Items[1:]

	return nil
}

func (w *WinfittsRawData) parseParticipantAndDevice(data string) error {
	matches := spanRegex.FindAllStringSubmatch(data, -1)
	if len(matches) != 2 || len(matches[0]) != 2 || len(matches[1]) != 2 {
		return errs.ErrRegexMismatch
	}
	w.ParticipantSerial = matches[0][1]
	w.Participant = matches[1][1]

	matches = deviceRegex.FindAllStringSubmatch(data, -1)
	if len(matches) != 2 || len(matches[1]) != 2 {
		return errs.ErrRegexMismatch
	}
	w.DeviceName = matches[1][1]

	return nil
}

type ProjectDetail struct {
	ProjectID         string `json:"projectId"`
	ProjectName       string `json:"projectName"`
	ProjectCreator    string `json:"projectCreator"`
	ProjectUpdatedAt  string `json:"projectUpdatedAt"`
	DeviceName        string `json:"deviceName"`
	ParticipantName   string `json:"participantName"`
	ParticipantSerial string `json:"participantSerial"`
	InformationID     string `json:"informationId"`
	Deleted           bool   `json:"deleted"`
	ErrorTimes        int64  `json:"errorTimes"`
	IsFailed          bool   `json:"isFailed"`
	TrailNumber       int64  `json:"trailNumber"`
	Mark              string `json:"mark"`
	Timestamp         int64  `json:"timestamp"`
	Width             int64  `json:"width"`
	Distance          int64  `json:"distance"`
	X                 int64  `json:"x"`
	Y                 int64  `json:"y"`
}
