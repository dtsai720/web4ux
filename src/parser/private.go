package parser

import (
	"fmt"
	"html"
	"strconv"
	"strings"
	"time"

	"github.com/web4ux/src/sliceutils"
)

func prepareProjectText(data string) string {
	slice := strings.Split(data, "\n")
	contexts := make([]string, 0, len(slice))
	start := false
	for _, line := range slice {
		start = start || strings.Contains(line, "class=\"item \"")
		if !start {
			continue
		}
		if strings.Contains(line, "project-list") {
			continue
		}
		if strings.Contains(line, "pagination-row") {
			break
		}
		contexts = append(contexts, strings.TrimSpace(line))
	}

	return html.UnescapeString(strings.Join(contexts, ""))
}

func prepareWinfittsData(data string) [][]string {
	slices := sliceutils.Map(strings.Split(html.UnescapeString(data), "\n"), func(in string) string {
		output := strings.TrimSpace(in)

		return output
	})

	slices = append(slices, "<div class=\"data1-pack\">")
	var partitions [][]string
	var currentPartition []string
	for _, line := range slices {
		if strings.Contains(line, "<div class=\"data1-pack\">") {
			if len(currentPartition) > 0 {
				partitions = append(partitions, currentPartition)
			}
			currentPartition = []string{line}
		} else {
			currentPartition = append(currentPartition, line)
		}
	}

	return partitions
}

func winfittsToCanonical(slice []string) (*WinfittsResult, error) {
	var result WinfittsResult
	var title strings.Builder
	var err error
	contexts := make([]string, 0, len(slice))
	slice = append(slice, "<div class=\"data2-pack \">")
	for _, line := range slice {
		if strings.Contains(line, "<div class=\"data-pack\">") {
			matches := spanRegex.FindAllStringSubmatch(title.String(), -1)
			if len(matches) != 2 || len(matches[1]) != 2 {
				return nil, fmt.Errorf("invalid title format: %s", title.String())
			}
			result.Participant = matches[1][1]

			matches = deviceRegex.FindAllStringSubmatch(title.String(), -1)
			if len(matches) != 2 || len(matches[1]) != 2 {
				return nil, fmt.Errorf("invalid device format: %s", title.String())
			}
			result.DeviceName = matches[1][1]
			title.Reset()
		}

		if strings.Contains(line, "<div class=\"data2-pack \">") || strings.Contains(line, "<div class=\"data2-pack red-light\">") {
			var builder strings.Builder
			var item WinfittsItem
			for _, context := range contexts {
				if strings.Contains(context, "<div class=\"data3-pack data-pack\">") {
					matches := spanRegex.FindAllStringSubmatch(builder.String(), -1)
					item.TrailNumber, err = strconv.Atoi(matches[0][1])
					if err != nil {
						return nil, err
					}

					item.IsFailed = matches[1][1] == "Yes"
					item.ErrorTimes, err = strconv.Atoi(matches[2][1])
					if err != nil {
						return nil, err
					}
					item.Width, err = strconv.Atoi(matches[3][1])
					if err != nil {
						return nil, err
					}
					item.Distance, err = strconv.Atoi(matches[4][1])
					if err != nil {
						return nil, err
					}
					item.Angle, err = strconv.Atoi(matches[5][1])
					if err != nil {
						return nil, err
					}
				}

				builder.WriteString(context)
			}

			matches := winfittsDetailRegex.FindAllStringSubmatch(builder.String(), -1)
			for _, match := range matches {
				var detail WinfittsDetail

				detail.Mark = match[1]
				numbers := sliceutils.MapFilter(strings.Split(match[2], ","), func(in string) (int, bool) {
					num, err := strconv.Atoi(in)
					if err != nil {
						return -1, false
					}

					return num, true
				})
				detail.Position.X = numbers[0]
				detail.Position.Y = numbers[1]
				timestamp, err := strconv.Atoi(match[3])
				if err != nil {
					return nil, err
				}
				seconds := int64(timestamp / 1000)
				nanoseconds := int64((timestamp % 1000) * 1_000_000)
				detail.CreatedAt = time.Unix(seconds, nanoseconds).UTC()
				item.Details = append(item.Details, detail)
			}

			contexts = contexts[:0]
			result.Items = append(result.Items, item)
		}

		title.WriteString(line)
		contexts = append(contexts, line)
	}

	return &result, nil
}
