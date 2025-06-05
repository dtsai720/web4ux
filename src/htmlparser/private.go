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
