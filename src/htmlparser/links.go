package htmlparser

import (
	"context"
	"strings"

	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/sliceutils"
)

func ExtractRawDataLinks(ctx context.Context, log logger.ILogger, htmlContent string) []string {
	return sliceutils.MapFilter(rawDataLinkRegex.FindAllStringSubmatch(htmlContent, -1), func(item []string) (string, bool) {
		if len(item) < 2 {
			return "", false
		}

		return strings.TrimSpace(item[1]), true
	})
}
