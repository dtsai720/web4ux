package parser

import (
	"strings"

	"github.com/web4ux/src/sliceutils"
)

func RawDataLink(text string) []string {
	return sliceutils.MapFilter(dataLinkRegex.FindAllStringSubmatch(text, -1), func(item []string) (string, bool) {
		if len(item) < 2 {
			return "", false
		}

		return strings.TrimSpace(item[1]), true
	})
}
