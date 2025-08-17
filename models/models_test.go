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

func TestPosition_Struct(t *testing.T) {
	t.Parallel()
	pos := models.Position{X: 100, Y: 200}

	assert.Equal(t, 100, pos.X, "X coordinate should match")
	assert.Equal(t, 200, pos.Y, "Y coordinate should match")
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
