package parser

import "time"

type ProjectListResult struct {
	Name    string
	Creator string
	Time    time.Time
	Link    string
}

type Position struct {
	X int
	Y int
}

type WinfittsDetail struct {
	Mark      string
	Position  Position
	CreatedAt time.Time
}

type WinfittsItem struct {
	TrailNumber int
	IsFailed    bool
	Width       int
	Distance    int
	Angle       int
	ErrorTimes  int
	Details     []WinfittsDetail
}

type WinfittsResult struct {
	Participant string
	DeviceName  string
	Items       []WinfittsItem
}
