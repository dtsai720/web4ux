package htmlparser

import (
	"html"
	"strings"

	"github.com/web4ux/src/sliceutils"
)

func parseContentForProjectSummaries(htmlContent string) string {
	slice := strings.Split(htmlContent, "\n")
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

func parseContentForWinfittsDetails(data string) [][]string {
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

// func winfittsToCanonical(slice []string) (*WinfittsRawData, error) {
// 	var result WinfittsRawData
// 	var title strings.Builder
// 	contexts := make([]string, 0, len(slice))
// 	slice = append(slice, "<div class=\"data2-pack \">")
// 	for _, line := range slice {
// 		if strings.Contains(line, "<div class=\"data-pack\">") {
// 			matches := spanRegex.FindAllStringSubmatch(title.String(), -1)
// 			if len(matches) != 2 || len(matches[1]) != 2 {
// 				return nil, errs.ErrRegexMismatch
// 			}
// 			result.Participant = matches[1][1]

// 			matches = deviceRegex.FindAllStringSubmatch(title.String(), -1)
// 			if len(matches) != 2 || len(matches[1]) != 2 {
// 				return nil, errs.ErrRegexMismatch
// 			}
// 			result.DeviceName = matches[1][1]
// 			title.Reset()
// 		}

// 		if strings.Contains(line, "<div class=\"data2-pack \">") || strings.Contains(line, "<div class=\"data2-pack red-light\">") {
// 			var item WinfittsSummary
// 			if err := item.Load(contexts); err != nil {
// 				return nil, err
// 			}

// 			contexts = contexts[:0]
// 			result.Items = append(result.Items, item)
// 		}

// 		title.WriteString(line)
// 		contexts = append(contexts, line)
// 	}

// 	return &result, nil
// }
