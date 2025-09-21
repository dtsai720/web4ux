package models

import (
	"fmt"
	"math"
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

func NewPosition(x, y int) Position {
	return Position{X: x, Y: y}
}

func (p Position) IsZero() bool {
	return p.X == 0 && p.Y == 0
}

func (p Position) Distance(other Position) float64 {
	dx := float64(p.X - other.X)
	dy := float64(p.Y - other.Y)
	return math.Sqrt(dx*dx + dy*dy)
}

func (p Position) String() string {
	return fmt.Sprintf("(%d,%d)", p.X, p.Y)
}

type WinfittsDetail struct {
	Mark      string
	Position  Position
	Timestamp int
}

func NewWinfittsDetail(mark string, position Position, timestamp int) *WinfittsDetail {
	return &WinfittsDetail{
		Mark:      mark,
		Position:  position,
		Timestamp: timestamp,
	}
}

func (w *WinfittsDetail) IsValid() bool {
	return w.Mark != "" && w.Timestamp > 0
}

func (w *WinfittsDetail) TimestampDuration() time.Duration {
	return time.Duration(w.Timestamp) * time.Millisecond
}

func (w *WinfittsDetail) String() string {
	return fmt.Sprintf("Mark: %s, Position: %s, Timestamp: %d", w.Mark, w.Position.String(), w.Timestamp)
}

func (w *WinfittsDetail) Load(slice []string) error {
	if len(slice) < 4 {
		return errs.ErrInsufficientCoordinateNumbers
	}

	w.Mark = slice[1]

	if err := w.loadPosition(slice[2]); err != nil {
		return err
	}

	return w.loadTimestamp(slice[3])
}

func (w *WinfittsDetail) loadPosition(coordinateStr string) error {
	numbers := sliceutils.MapFilter(strings.Split(coordinateStr, ","), func(in string) (int, bool) {
		num, err := strconv.Atoi(in)
		if err != nil {
			return -1, false
		}
		return num, true
	})

	if len(numbers) < 2 {
		return errs.ErrInsufficientCoordinateNumbers
	}

	w.Position = NewPosition(numbers[0], numbers[1])
	return nil
}

func (w *WinfittsDetail) loadTimestamp(timestampStr string) error {
	timestamp, err := strconv.Atoi(timestampStr)
	if err != nil {
		return fmt.Errorf("invalid timestamp: %w", err)
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

func NewWinfittsSummary(trailNumber int) *WinfittsSummary {
	return &WinfittsSummary{
		TrailNumber: trailNumber,
		Details:     make([]WinfittsDetail, 0),
	}
}

func (w *WinfittsSummary) IsSuccessful() bool {
	return !w.IsFailed
}

func (w *WinfittsSummary) HasErrors() bool {
	return w.ErrorTimes > 0
}

func (w *WinfittsSummary) DetailCount() int {
	return len(w.Details)
}

func (w *WinfittsSummary) AddDetail(detail WinfittsDetail) {
	w.Details = append(w.Details, detail)
}

func (w *WinfittsSummary) GetValidDetails() []WinfittsDetail {
	validDetails := make([]WinfittsDetail, 0)
	for _, detail := range w.Details {
		if detail.IsValid() {
			validDetails = append(validDetails, detail)
		}
	}
	return validDetails
}

func (w *WinfittsSummary) CalculateAveragePosition() Position {
	if len(w.Details) == 0 {
		return Position{}
	}

	var totalX, totalY int
	for _, detail := range w.Details {
		totalX += detail.Position.X
		totalY += detail.Position.Y
	}

	return NewPosition(totalX/len(w.Details), totalY/len(w.Details))
}

func (w *WinfittsSummary) String() string {
	status := "Success"
	if w.IsFailed {
		status = "Failed"
	}
	return fmt.Sprintf("Trail %d: %s (Errors: %d, Details: %d)", w.TrailNumber, status, w.ErrorTimes, len(w.Details))
}

func (w *WinfittsSummary) Load(slice []string) error {
	var builder strings.Builder
	var err error
	for _, context := range slice {
		if !strings.Contains(context, "<div class=\"data3-pack data-pack\">") {
			builder.WriteString(context)

			continue
		}

		matches := SpanRegex.FindAllStringSubmatch(builder.String(), -1)
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

	details := WinfittsDetailRegex.FindAllStringSubmatch(builder.String(), -1)
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
	DeviceOrder       string
	DeviceName        string
	Items             []WinfittsSummary
}

func NewWinfittsRawData(participantSerial, participant, deviceOrder, deviceName string) *WinfittsRawData {
	return &WinfittsRawData{
		ParticipantSerial: participantSerial,
		Participant:       participant,
		DeviceOrder:       deviceOrder,
		DeviceName:        deviceName,
		Items:             make([]WinfittsSummary, 0),
	}
}

func (w *WinfittsRawData) IsValid() error {
	if w.ParticipantSerial == "" {
		return fmt.Errorf("participant serial is required")
	}
	if w.Participant == "" {
		return fmt.Errorf("participant name is required")
	}
	if w.DeviceName == "" {
		return fmt.Errorf("device name is required")
	}
	return nil
}

func (w *WinfittsRawData) AddItem(item WinfittsSummary) {
	w.Items = append(w.Items, item)
}

func (w *WinfittsRawData) ItemCount() int {
	return len(w.Items)
}

func (w *WinfittsRawData) GetSuccessfulItems() []WinfittsSummary {
	successful := make([]WinfittsSummary, 0)
	for _, item := range w.Items {
		if item.IsSuccessful() {
			successful = append(successful, item)
		}
	}
	return successful
}

func (w *WinfittsRawData) GetFailedItems() []WinfittsSummary {
	failed := make([]WinfittsSummary, 0)
	for _, item := range w.Items {
		if item.IsFailed {
			failed = append(failed, item)
		}
	}
	return failed
}

func (w *WinfittsRawData) CalculateSuccessRate() float64 {
	if len(w.Items) == 0 {
		return 0.0
	}
	successful := len(w.GetSuccessfulItems())
	return float64(successful) / float64(len(w.Items))
}

func (w *WinfittsRawData) String() string {
	return fmt.Sprintf("Participant: %s (%s), Device: %s (%s), Items: %d",
		w.Participant, w.ParticipantSerial, w.DeviceName, w.DeviceOrder, len(w.Items))
}

//nolint:cyclop
func (w *WinfittsRawData) Load(slice []string) error {
	var builder strings.Builder
	contexts := make([]string, 0, len(slice))
	slice = append(slice, "<div class=\"data2-pack \">")
	for _, line := range slice {
		if strings.Contains(line, "<div class=\"data-pack\">") {
			matches := SpanRegex.FindAllStringSubmatch(builder.String(), -1)
			if len(matches) != 2 || len(matches[0]) != 2 || len(matches[1]) != 2 {
				return errs.ErrRegexMismatch
			}
			w.ParticipantSerial = matches[0][1]
			w.Participant = matches[1][1]

			matches = DeviceRegex.FindAllStringSubmatch(builder.String(), -1)
			if len(matches) != 2 || len(matches[1]) != 2 {
				return errs.ErrRegexMismatch
			}

			w.DeviceOrder = matches[0][1]
			w.DeviceName = matches[1][1]
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

type ProjectDetail struct {
	ProjectID         string `json:"projectId"`
	ProjectName       string `json:"projectName"`
	ProjectCreator    string `json:"projectCreator"`
	ProjectUpdatedAt  string `json:"projectUpdatedAt"`
	DeviceName        string `json:"deviceName"`
	DeviceOrder       string `json:"deviceOrder"`
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

func (p *ProjectDetail) IsActive() bool {
	return !p.Deleted
}

func (p *ProjectDetail) IsSuccessful() bool {
	return !p.IsFailed
}

func (p *ProjectDetail) GetPosition() Position {
	return NewPosition(int(p.X), int(p.Y))
}

func (p *ProjectDetail) HasErrors() bool {
	return p.ErrorTimes > 0
}

func (p *ProjectDetail) GetTimestampDuration() time.Duration {
	return time.Duration(p.Timestamp) * time.Millisecond
}

func (p *ProjectDetail) GetUniqueKey() string {
	return fmt.Sprintf("%s-%s-%s-%d", p.ProjectID, p.DeviceOrder, p.ParticipantSerial, p.TrailNumber)
}
