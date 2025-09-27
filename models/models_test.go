package models_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/models"
)

func TestWinfittsDetail_Load(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		input   []string
		want    models.WinfittsDetail
		wantErr bool
	}{
		{
			name:  "valid input",
			input: []string{"", "test-mark", "100,200", "1500"},
			want: models.WinfittsDetail{
				Mark:      "test-mark",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: 1500,
			},
			wantErr: false,
		},
		{
			name:  "valid position with extra invalid data",
			input: []string{"", "test-mark", "150,250,invalid", "1500"},
			want: models.WinfittsDetail{
				Mark:      "test-mark",
				Position:  models.Position{X: 150, Y: 250}, // First two valid numbers
				Timestamp: 1500,
			},
			wantErr: false,
		},
		{
			name:    "insufficient valid coordinates",
			input:   []string{"", "test-mark", "abc,def", "1500"},
			want:    models.WinfittsDetail{},
			wantErr: true, // Should return error for insufficient coordinates
		},
		{
			name:    "invalid timestamp",
			input:   []string{"", "test-mark", "100,200", "abc"},
			want:    models.WinfittsDetail{},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			w := &models.WinfittsDetail{}
			err := w.Load(tt.input)

			assert.Equal(t, tt.wantErr, err != nil, "Error expectation should match")
			if !tt.wantErr {
				assert.Equal(t, tt.want.Mark, w.Mark, "Mark should match")
				assert.Equal(t, tt.want.Position, w.Position, "Position should match")
				assert.Equal(t, tt.want.Timestamp, w.Timestamp, "Timestamp should match")
			}
		})
	}
}

func TestWinfittsSummary_Load(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		input   []string
		wantErr bool
	}{
		{
			name: "valid HTML input",
			input: []string{
				`<span>1</span><span>No</span><span>5</span><span>100</span><span>200</span><span>45</span>`,
				`<div class="data3-pack data-pack">`,
				`<div class="data3"><span>mark1</span><span>(100,200)</span><span class="et">1500</span></div>`,
			},
			wantErr: false,
		},
		{
			name: "invalid trail number",
			input: []string{
				`<span>abc</span><span>No</span><span>5</span><span>100</span><span>200</span><span>45</span>`,
				`<div class="data3-pack data-pack">`,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			w := &models.WinfittsSummary{}
			err := w.Load(tt.input)

			assert.Equal(t, tt.wantErr, err != nil, "Error expectation should match")
		})
	}
}

func TestWinfittsRawData_Load(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		input   []string
		wantErr bool
	}{
		{
			name: "insufficient spans",
			input: []string{
				`<div class="data-pack">`,
				`<span>only-one-span</span>`,
				`<span class="word-break">device1</span><span class="word-break">device2</span>`,
				`<div class="data2-pack ">`,
			},
			wantErr: true,
		},
		{
			name: "invalid regex match",
			input: []string{
				`<div class="data-pack">`,
				`<span>only-one-span</span>`,
				`<div class="data2-pack ">`,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			w := &models.WinfittsRawData{}
			err := w.Load(tt.input)

			assert.Equal(t, tt.wantErr, err != nil, "Error expectation should match")
		})
	}
}

func TestProjectSummary_Struct(t *testing.T) {
	t.Parallel()
	now := time.Now()
	ps := models.ProjectSummary{
		ID:      "test-id",
		Name:    "test-name",
		Creator: "test-creator",
		Time:    now,
		Link:    "test-link",
	}

	assert.Equal(t, "test-id", ps.ID, "ID should match")
	assert.Equal(t, "test-name", ps.Name, "Name should match")
	assert.Equal(t, "test-creator", ps.Creator, "Creator should match")
	assert.Equal(t, now, ps.Time, "Time should match")
	assert.Equal(t, "test-link", ps.Link, "Link should match")
}

func TestNewPosition(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		x    int
		y    int
		want models.Position
	}{
		{
			name: "positive coordinates",
			x:    100,
			y:    200,
			want: models.Position{X: 100, Y: 200},
		},
		{
			name: "negative coordinates",
			x:    -50,
			y:    -75,
			want: models.Position{X: -50, Y: -75},
		},
		{
			name: "zero coordinates",
			x:    0,
			y:    0,
			want: models.Position{X: 0, Y: 0},
		},
		{
			name: "mixed coordinates",
			x:    -10,
			y:    25,
			want: models.Position{X: -10, Y: 25},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := models.NewPosition(tt.x, tt.y)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestPosition_IsZero(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		pos  models.Position
		want bool
	}{
		{
			name: "zero position",
			pos:  models.Position{X: 0, Y: 0},
			want: true,
		},
		{
			name: "non-zero x coordinate",
			pos:  models.Position{X: 1, Y: 0},
			want: false,
		},
		{
			name: "non-zero y coordinate",
			pos:  models.Position{X: 0, Y: 1},
			want: false,
		},
		{
			name: "both coordinates non-zero",
			pos:  models.Position{X: 100, Y: 200},
			want: false,
		},
		{
			name: "negative coordinates",
			pos:  models.Position{X: -1, Y: -1},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.pos.IsZero()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestPosition_Distance(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name  string
		pos   models.Position
		other models.Position
		want  float64
	}{
		{
			name:  "same position",
			pos:   models.Position{X: 0, Y: 0},
			other: models.Position{X: 0, Y: 0},
			want:  0.0,
		},
		{
			name:  "horizontal distance",
			pos:   models.Position{X: 0, Y: 0},
			other: models.Position{X: 3, Y: 0},
			want:  3.0,
		},
		{
			name:  "vertical distance",
			pos:   models.Position{X: 0, Y: 0},
			other: models.Position{X: 0, Y: 4},
			want:  4.0,
		},
		{
			name:  "diagonal distance 3-4-5 triangle",
			pos:   models.Position{X: 0, Y: 0},
			other: models.Position{X: 3, Y: 4},
			want:  5.0,
		},
		{
			name:  "negative coordinates",
			pos:   models.Position{X: -1, Y: -1},
			other: models.Position{X: -4, Y: -5},
			want:  5.0,
		},
		{
			name:  "mixed positive and negative",
			pos:   models.Position{X: 1, Y: 1},
			other: models.Position{X: -2, Y: -3},
			want:  5.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.pos.Distance(tt.other)
			assert.InDelta(t, tt.want, got, 0.0001)
		})
	}
}

func TestPosition_String(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		pos  models.Position
		want string
	}{
		{
			name: "zero position",
			pos:  models.Position{X: 0, Y: 0},
			want: "(0,0)",
		},
		{
			name: "positive coordinates",
			pos:  models.Position{X: 100, Y: 200},
			want: "(100,200)",
		},
		{
			name: "negative coordinates",
			pos:  models.Position{X: -50, Y: -75},
			want: "(-50,-75)",
		},
		{
			name: "mixed coordinates",
			pos:  models.Position{X: -10, Y: 25},
			want: "(-10,25)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.pos.String()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewWinfittsDetail(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name      string
		mark      string
		position  models.Position
		timestamp int
		want      *models.WinfittsDetail
	}{
		{
			name:      "valid detail",
			mark:      "test-mark",
			position:  models.Position{X: 100, Y: 200},
			timestamp: 1500,
			want: &models.WinfittsDetail{
				Mark:      "test-mark",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: 1500,
			},
		},
		{
			name:      "empty mark",
			mark:      "",
			position:  models.Position{X: 0, Y: 0},
			timestamp: 0,
			want: &models.WinfittsDetail{
				Mark:      "",
				Position:  models.Position{X: 0, Y: 0},
				Timestamp: 0,
			},
		},
		{
			name:      "negative coordinates",
			mark:      "negative",
			position:  models.Position{X: -50, Y: -75},
			timestamp: 2000,
			want: &models.WinfittsDetail{
				Mark:      "negative",
				Position:  models.Position{X: -50, Y: -75},
				Timestamp: 2000,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := models.NewWinfittsDetail(tt.mark, tt.position, tt.timestamp)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsDetail_IsValid(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		detail models.WinfittsDetail
		want   bool
	}{
		{
			name: "valid detail",
			detail: models.WinfittsDetail{
				Mark:      "test-mark",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: 1500,
			},
			want: true,
		},
		{
			name: "empty mark",
			detail: models.WinfittsDetail{
				Mark:      "",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: 1500,
			},
			want: false,
		},
		{
			name: "zero timestamp",
			detail: models.WinfittsDetail{
				Mark:      "test-mark",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: 0,
			},
			want: false,
		},
		{
			name: "negative timestamp",
			detail: models.WinfittsDetail{
				Mark:      "test-mark",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: -100,
			},
			want: false,
		},
		{
			name: "both empty mark and zero timestamp",
			detail: models.WinfittsDetail{
				Mark:      "",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: 0,
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.detail.IsValid()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsDetail_TimestampDuration(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name      string
		timestamp int
		want      time.Duration
	}{
		{
			name:      "zero timestamp",
			timestamp: 0,
			want:      0 * time.Millisecond,
		},
		{
			name:      "positive timestamp",
			timestamp: 1500,
			want:      1500 * time.Millisecond,
		},
		{
			name:      "large timestamp",
			timestamp: 60000,
			want:      60000 * time.Millisecond,
		},
		{
			name:      "small timestamp",
			timestamp: 1,
			want:      1 * time.Millisecond,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			detail := models.WinfittsDetail{
				Mark:      "test",
				Position:  models.Position{X: 0, Y: 0},
				Timestamp: tt.timestamp,
			}
			got := detail.TimestampDuration()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsDetail_String(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		detail models.WinfittsDetail
		want   string
	}{
		{
			name: "valid detail",
			detail: models.WinfittsDetail{
				Mark:      "test-mark",
				Position:  models.Position{X: 100, Y: 200},
				Timestamp: 1500,
			},
			want: "Mark: test-mark, Position: (100,200), Timestamp: 1500",
		},
		{
			name: "empty mark",
			detail: models.WinfittsDetail{
				Mark:      "",
				Position:  models.Position{X: 0, Y: 0},
				Timestamp: 0,
			},
			want: "Mark: , Position: (0,0), Timestamp: 0",
		},
		{
			name: "negative coordinates",
			detail: models.WinfittsDetail{
				Mark:      "negative-test",
				Position:  models.Position{X: -50, Y: -75},
				Timestamp: 2500,
			},
			want: "Mark: negative-test, Position: (-50,-75), Timestamp: 2500",
		},
		{
			name: "long mark",
			detail: models.WinfittsDetail{
				Mark:      "very-long-test-mark-name",
				Position:  models.Position{X: 999, Y: 888},
				Timestamp: 12345,
			},
			want: "Mark: very-long-test-mark-name, Position: (999,888), Timestamp: 12345",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.detail.String()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewWinfittsSummary(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name        string
		trailNumber int
		want        *models.WinfittsSummary
	}{
		{
			name:        "positive trail number",
			trailNumber: 1,
			want: &models.WinfittsSummary{
				TrailNumber: 1,
				Details:     []models.WinfittsDetail{},
			},
		},
		{
			name:        "zero trail number",
			trailNumber: 0,
			want: &models.WinfittsSummary{
				TrailNumber: 0,
				Details:     []models.WinfittsDetail{},
			},
		},
		{
			name:        "negative trail number",
			trailNumber: -1,
			want: &models.WinfittsSummary{
				TrailNumber: -1,
				Details:     []models.WinfittsDetail{},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := models.NewWinfittsSummary(tt.trailNumber)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsSummary_IsSuccessful(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		summary models.WinfittsSummary
		want    bool
	}{
		{
			name: "successful test",
			summary: models.WinfittsSummary{
				IsFailed: false,
			},
			want: true,
		},
		{
			name: "failed test",
			summary: models.WinfittsSummary{
				IsFailed: true,
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.summary.IsSuccessful()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsSummary_HasErrors(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		summary models.WinfittsSummary
		want    bool
	}{
		{
			name: "no errors",
			summary: models.WinfittsSummary{
				ErrorTimes: 0,
			},
			want: false,
		},
		{
			name: "has errors",
			summary: models.WinfittsSummary{
				ErrorTimes: 3,
			},
			want: true,
		},
		{
			name: "negative error times",
			summary: models.WinfittsSummary{
				ErrorTimes: -1,
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.summary.HasErrors()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsSummary_DetailCount(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		summary models.WinfittsSummary
		want    int
	}{
		{
			name: "empty details",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{},
			},
			want: 0,
		},
		{
			name: "single detail",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Mark: "test", Timestamp: 100},
				},
			},
			want: 1,
		},
		{
			name: "multiple details",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Mark: "test1", Timestamp: 100},
					{Mark: "test2", Timestamp: 200},
					{Mark: "test3", Timestamp: 300},
				},
			},
			want: 3,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.summary.DetailCount()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsSummary_AddDetail(t *testing.T) {
	t.Parallel()
	summary := models.NewWinfittsSummary(1)
	detail := models.WinfittsDetail{
		Mark:      "test-mark",
		Position:  models.Position{X: 100, Y: 200},
		Timestamp: 1500,
	}

	assert.Equal(t, 0, summary.DetailCount())
	summary.AddDetail(detail)
	assert.Equal(t, 1, summary.DetailCount())
	assert.Equal(t, detail, summary.Details[0])
}

func TestWinfittsSummary_GetValidDetails(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		summary models.WinfittsSummary
		want    []models.WinfittsDetail
	}{
		{
			name: "all valid details",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Mark: "test1", Position: models.Position{}, Timestamp: 100},
					{Mark: "test2", Position: models.Position{}, Timestamp: 200},
				},
			},
			want: []models.WinfittsDetail{
				{Mark: "test1", Position: models.Position{}, Timestamp: 100},
				{Mark: "test2", Position: models.Position{}, Timestamp: 200},
			},
		},
		{
			name: "mixed valid and invalid details",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Mark: "test1", Position: models.Position{}, Timestamp: 100},
					{Mark: "", Position: models.Position{}, Timestamp: 0},
					{Mark: "test3", Position: models.Position{}, Timestamp: 300},
				},
			},
			want: []models.WinfittsDetail{
				{Mark: "test1", Position: models.Position{}, Timestamp: 100},
				{Mark: "test3", Position: models.Position{}, Timestamp: 300},
			},
		},
		{
			name: "no valid details",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Mark: "", Position: models.Position{}, Timestamp: 0},
					{Mark: "test", Position: models.Position{}, Timestamp: 0},
				},
			},
			want: []models.WinfittsDetail{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.summary.GetValidDetails()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsSummary_CalculateAveragePosition(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		summary models.WinfittsSummary
		want    models.Position
	}{
		{
			name: "empty details",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{},
			},
			want: models.Position{},
		},
		{
			name: "single detail",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Position: models.Position{X: 100, Y: 200}},
				},
			},
			want: models.Position{X: 100, Y: 200},
		},
		{
			name: "multiple details",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Position: models.Position{X: 100, Y: 200}},
					{Position: models.Position{X: 200, Y: 400}},
				},
			},
			want: models.Position{X: 150, Y: 300},
		},
		{
			name: "details with negative coordinates",
			summary: models.WinfittsSummary{
				Details: []models.WinfittsDetail{
					{Position: models.Position{X: -100, Y: -200}},
					{Position: models.Position{X: 100, Y: 200}},
				},
			},
			want: models.Position{X: 0, Y: 0},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.summary.CalculateAveragePosition()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsSummary_String(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		summary models.WinfittsSummary
		want    string
	}{
		{
			name: "successful trail",
			summary: models.WinfittsSummary{
				TrailNumber: 1,
				IsFailed:    false,
				ErrorTimes:  0,
				Details:     []models.WinfittsDetail{{}, {}},
			},
			want: "Trail 1: Success (Errors: 0, Details: 2)",
		},
		{
			name: "failed trail",
			summary: models.WinfittsSummary{
				TrailNumber: 5,
				IsFailed:    true,
				ErrorTimes:  3,
				Details:     []models.WinfittsDetail{{}},
			},
			want: "Trail 5: Failed (Errors: 3, Details: 1)",
		},
		{
			name: "trail with no details",
			summary: models.WinfittsSummary{
				TrailNumber: 0,
				IsFailed:    false,
				ErrorTimes:  0,
				Details:     []models.WinfittsDetail{},
			},
			want: "Trail 0: Success (Errors: 0, Details: 0)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.summary.String()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestNewWinfittsRawData(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name              string
		participantSerial string
		participant       string
		deviceOrder       string
		deviceName        string
		want              *models.WinfittsRawData
	}{
		{
			name:              "valid data",
			participantSerial: "P001",
			participant:       "John Doe",
			deviceOrder:       "1",
			deviceName:        "Device A",
			want: &models.WinfittsRawData{
				ParticipantSerial: "P001",
				Participant:       "John Doe",
				DeviceOrder:       "1",
				DeviceName:        "Device A",
				Items:             []models.WinfittsSummary{},
			},
		},
		{
			name:              "empty values",
			participantSerial: "",
			participant:       "",
			deviceOrder:       "",
			deviceName:        "",
			want: &models.WinfittsRawData{
				ParticipantSerial: "",
				Participant:       "",
				DeviceOrder:       "",
				DeviceName:        "",
				Items:             []models.WinfittsSummary{},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := models.NewWinfittsRawData(tt.participantSerial, tt.participant, tt.deviceOrder, tt.deviceName)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsRawData_IsValid(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		rawData models.WinfittsRawData
		wantErr bool
		wantMsg string
	}{
		{
			name: "valid data",
			rawData: models.WinfittsRawData{
				ParticipantSerial: "P001",
				Participant:       "John Doe",
				DeviceName:        "Device A",
			},
			wantErr: false,
		},
		{
			name: "missing participant serial",
			rawData: models.WinfittsRawData{
				ParticipantSerial: "",
				Participant:       "John Doe",
				DeviceName:        "Device A",
			},
			wantErr: true,
			wantMsg: "participant serial is required",
		},
		{
			name: "missing participant name",
			rawData: models.WinfittsRawData{
				ParticipantSerial: "P001",
				Participant:       "",
				DeviceName:        "Device A",
			},
			wantErr: true,
			wantMsg: "participant name is required",
		},
		{
			name: "missing device name",
			rawData: models.WinfittsRawData{
				ParticipantSerial: "P001",
				Participant:       "John Doe",
				DeviceName:        "",
			},
			wantErr: true,
			wantMsg: "device name is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.rawData.IsValid()
			if tt.wantErr {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.wantMsg)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestWinfittsRawData_AddItem(t *testing.T) {
	t.Parallel()
	rawData := models.NewWinfittsRawData("P001", "John", "1", "Device A")
	summary := models.WinfittsSummary{
		TrailNumber: 1,
		IsFailed:    false,
	}

	assert.Equal(t, 0, rawData.ItemCount())
	rawData.AddItem(summary)
	assert.Equal(t, 1, rawData.ItemCount())
	assert.Equal(t, summary, rawData.Items[0])
}

func TestWinfittsRawData_ItemCount(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		rawData models.WinfittsRawData
		want    int
	}{
		{
			name: "empty items",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{},
			},
			want: 0,
		},
		{
			name: "single item",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1},
				},
			},
			want: 1,
		},
		{
			name: "multiple items",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1},
					{TrailNumber: 2},
					{TrailNumber: 3},
				},
			},
			want: 3,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.rawData.ItemCount()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsRawData_GetSuccessfulItems(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		rawData models.WinfittsRawData
		want    []models.WinfittsSummary
	}{
		{
			name: "all successful",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1, IsFailed: false},
					{TrailNumber: 2, IsFailed: false},
				},
			},
			want: []models.WinfittsSummary{
				{TrailNumber: 1, IsFailed: false},
				{TrailNumber: 2, IsFailed: false},
			},
		},
		{
			name: "mixed successful and failed",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1, IsFailed: false},
					{TrailNumber: 2, IsFailed: true},
					{TrailNumber: 3, IsFailed: false},
				},
			},
			want: []models.WinfittsSummary{
				{TrailNumber: 1, IsFailed: false},
				{TrailNumber: 3, IsFailed: false},
			},
		},
		{
			name: "all failed",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1, IsFailed: true},
					{TrailNumber: 2, IsFailed: true},
				},
			},
			want: []models.WinfittsSummary{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.rawData.GetSuccessfulItems()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsRawData_GetFailedItems(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		rawData models.WinfittsRawData
		want    []models.WinfittsSummary
	}{
		{
			name: "all failed",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1, IsFailed: true},
					{TrailNumber: 2, IsFailed: true},
				},
			},
			want: []models.WinfittsSummary{
				{TrailNumber: 1, IsFailed: true},
				{TrailNumber: 2, IsFailed: true},
			},
		},
		{
			name: "mixed successful and failed",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1, IsFailed: false},
					{TrailNumber: 2, IsFailed: true},
					{TrailNumber: 3, IsFailed: false},
				},
			},
			want: []models.WinfittsSummary{
				{TrailNumber: 2, IsFailed: true},
			},
		},
		{
			name: "all successful",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{TrailNumber: 1, IsFailed: false},
					{TrailNumber: 2, IsFailed: false},
				},
			},
			want: []models.WinfittsSummary{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.rawData.GetFailedItems()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestWinfittsRawData_CalculateSuccessRate(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		rawData models.WinfittsRawData
		want    float64
	}{
		{
			name: "empty items",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{},
			},
			want: 0.0,
		},
		{
			name: "all successful",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{IsFailed: false},
					{IsFailed: false},
				},
			},
			want: 1.0,
		},
		{
			name: "all failed",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{IsFailed: true},
					{IsFailed: true},
				},
			},
			want: 0.0,
		},
		{
			name: "half successful",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{IsFailed: false},
					{IsFailed: true},
				},
			},
			want: 0.5,
		},
		{
			name: "one third successful",
			rawData: models.WinfittsRawData{
				Items: []models.WinfittsSummary{
					{IsFailed: false},
					{IsFailed: true},
					{IsFailed: true},
				},
			},
			want: 0.3333333333333333,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.rawData.CalculateSuccessRate()
			assert.InDelta(t, tt.want, got, 0.0001)
		})
	}
}

func TestWinfittsRawData_String(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		rawData models.WinfittsRawData
		want    string
	}{
		{
			name: "with data",
			rawData: models.WinfittsRawData{
				Participant:       "John Doe",
				ParticipantSerial: "P001",
				DeviceName:        "Device A",
				DeviceOrder:       "1",
				Items:             []models.WinfittsSummary{{}, {}},
			},
			want: "Participant: John Doe (P001), Device: Device A (1), Items: 2",
		},
		{
			name: "empty participant",
			rawData: models.WinfittsRawData{
				Participant:       "",
				ParticipantSerial: "",
				DeviceName:        "Device A",
				DeviceOrder:       "1",
				Items:             []models.WinfittsSummary{},
			},
			want: "Participant:  (), Device: Device A (1), Items: 0",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.rawData.String()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestListProjectRequest_Struct(t *testing.T) {
	t.Parallel()
	req := models.ListProjectRequest{
		Name:    "test-name",
		Creator: "test-creator",
		OrderBy: "name",
		IsASC:   true,
		Offset:  10,
		Limit:   20,
	}

	assert.Equal(t, "test-name", req.Name, "Name should match")
	assert.Equal(t, "test-creator", req.Creator, "Creator should match")
	assert.Equal(t, "name", req.OrderBy, "OrderBy should match")
	assert.True(t, req.IsASC, "IsASC should be true")
	assert.Equal(t, int64(10), req.Offset, "Offset should match")
	assert.Equal(t, int64(20), req.Limit, "Limit should match")
}

func TestProjectDetail_IsActive(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		detail models.ProjectDetail
		want   bool
	}{
		{
			name: "active detail",
			detail: models.ProjectDetail{
				Deleted: false,
			},
			want: true,
		},
		{
			name: "deleted detail",
			detail: models.ProjectDetail{
				Deleted: true,
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.detail.IsActive()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestProjectDetail_IsSuccessful(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		detail models.ProjectDetail
		want   bool
	}{
		{
			name: "successful detail",
			detail: models.ProjectDetail{
				IsFailed: false,
			},
			want: true,
		},
		{
			name: "failed detail",
			detail: models.ProjectDetail{
				IsFailed: true,
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.detail.IsSuccessful()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestProjectDetail_GetPosition(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		detail models.ProjectDetail
		want   models.Position
	}{
		{
			name: "positive coordinates",
			detail: models.ProjectDetail{
				X: 100,
				Y: 200,
			},
			want: models.Position{X: 100, Y: 200},
		},
		{
			name: "zero coordinates",
			detail: models.ProjectDetail{
				X: 0,
				Y: 0,
			},
			want: models.Position{X: 0, Y: 0},
		},
		{
			name: "negative coordinates",
			detail: models.ProjectDetail{
				X: -50,
				Y: -75,
			},
			want: models.Position{X: -50, Y: -75},
		},
		{
			name: "large coordinates",
			detail: models.ProjectDetail{
				X: 9999,
				Y: 8888,
			},
			want: models.Position{X: 9999, Y: 8888},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.detail.GetPosition()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestProjectDetail_HasErrors(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		detail models.ProjectDetail
		want   bool
	}{
		{
			name: "no errors",
			detail: models.ProjectDetail{
				ErrorTimes: 0,
			},
			want: false,
		},
		{
			name: "has errors",
			detail: models.ProjectDetail{
				ErrorTimes: 3,
			},
			want: true,
		},
		{
			name: "large error count",
			detail: models.ProjectDetail{
				ErrorTimes: 999,
			},
			want: true,
		},
		{
			name: "negative error count",
			detail: models.ProjectDetail{
				ErrorTimes: -1,
			},
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.detail.HasErrors()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestProjectDetail_GetTimestampDuration(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name      string
		timestamp int64
		want      time.Duration
	}{
		{
			name:      "zero timestamp",
			timestamp: 0,
			want:      0 * time.Millisecond,
		},
		{
			name:      "positive timestamp",
			timestamp: 1500,
			want:      1500 * time.Millisecond,
		},
		{
			name:      "large timestamp",
			timestamp: 60000,
			want:      60000 * time.Millisecond,
		},
		{
			name:      "small timestamp",
			timestamp: 1,
			want:      1 * time.Millisecond,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			detail := models.ProjectDetail{
				Timestamp: tt.timestamp,
			}
			got := detail.GetTimestampDuration()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestProjectDetail_GetUniqueKey(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name   string
		detail models.ProjectDetail
		want   string
	}{
		{
			name: "standard key",
			detail: models.ProjectDetail{
				ProjectID:         "proj-123",
				DeviceOrder:       "1",
				ParticipantSerial: "P001",
				TrailNumber:       5,
			},
			want: "proj-123-1-P001-5",
		},
		{
			name: "empty values",
			detail: models.ProjectDetail{
				ProjectID:         "",
				DeviceOrder:       "",
				ParticipantSerial: "",
				TrailNumber:       0,
			},
			want: "---0",
		},
		{
			name: "special characters",
			detail: models.ProjectDetail{
				ProjectID:         "proj-abc-123",
				DeviceOrder:       "dev-1",
				ParticipantSerial: "P_001",
				TrailNumber:       10,
			},
			want: "proj-abc-123-dev-1-P_001-10",
		},
		{
			name: "negative trail number",
			detail: models.ProjectDetail{
				ProjectID:         "proj",
				DeviceOrder:       "1",
				ParticipantSerial: "P001",
				TrailNumber:       -1,
			},
			want: "proj-1-P001--1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.detail.GetUniqueKey()
			assert.Equal(t, tt.want, got)
		})
	}
}
