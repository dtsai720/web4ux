package htmlparser

import (
	"context"
	"strings"
	"time"

	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/sliceutils"
)

func ExtractProjectSummaries(ctx context.Context, log logger.ILogger, htmlContent string) ([]ProjectSummary, error) {
	content := parseContentForProjectSummaries(htmlContent)
	names := projectNameRegex.FindAllStringSubmatch(content, -1)
	creators := projectCreatorRegex.FindAllStringSubmatch(content, -1)
	updatedAt := projectUpdatedAtRegex.FindAllStringSubmatch(content, -1)
	resultLinks := testResultLinksRegex.FindAllStringSubmatch(content, -1)
	projectIDs := projectIDRegex.FindAllStringSubmatch(content, -1)

	if !sliceutils.SameLen(names, creators, updatedAt, resultLinks, projectIDs) {
		return nil, errs.ErrInvalidProjectSummary
	}

	output := make([]ProjectSummary, len(names))
	for idx := range names {
		if len(names[idx]) < 2 ||
			len(creators[idx]) < 2 ||
			len(projectIDs[idx]) < 2 ||
			len(resultLinks[idx]) < 2 ||
			len(updatedAt[idx]) < 2 {
			return nil, errs.ErrRegexMismatch
		}
		output[idx].ID = strings.TrimSpace(projectIDs[idx][1])
		output[idx].Name = strings.TrimSpace(names[idx][1])
		output[idx].Creator = strings.TrimSpace(creators[idx][1])
		output[idx].Link = strings.TrimSpace(resultLinks[idx][1])
		parsedTime, err := time.Parse(timeLayout, strings.TrimSpace(updatedAt[idx][1]))
		if err != nil {
			return nil, err
		}
		output[idx].Time = parsedTime.UTC()
	}

	return output, nil
}
