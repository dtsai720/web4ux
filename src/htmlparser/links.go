package htmlparser

import (
	"strings"

	"github.com/web4ux/src/sliceutils"
)

func ExtractRawDataLinks(htmlContent string) []string {
	return sliceutils.MapFilter(rawDataLinkRegex.FindAllStringSubmatch(htmlContent, -1), func(item []string) (string, bool) {
		if len(item) < 2 {
			return "", false
		}

		return strings.TrimSpace(item[1]), true
	})
}
