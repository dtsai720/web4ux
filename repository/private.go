package repository

import (
	"sort"
	"strings"

	"github.com/web4ux/models"
)

type TrailResult struct {
	IsAvailable bool
	ErrorTime   int
	HasError    bool
}

func CalculateTrails(details []models.WinfittsDetail) *TrailResult {
	sort.Slice(details, func(i, j int) bool {
		return details[i].Timestamp < details[j].Timestamp
	})

	elseCount := 0
	startCount := 0
	targetCount := 0
	for _, item := range details {
		if startCount != 0 && strings.EqualFold(item.Mark, "else") {
			elseCount++
		}
		if strings.EqualFold(item.Mark, "start") {
			startCount++
		}
		if strings.EqualFold(item.Mark, "target") {
			targetCount++
		}
	}

	output := new(TrailResult)
	output.IsAvailable = strings.EqualFold(details[len(details)-1].Mark, "target") && startCount == 1 && targetCount == 1
	output.ErrorTime = elseCount
	output.HasError = elseCount != 0

	return output
}
