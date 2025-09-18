package htmlparser

import (
	"context"

	"github.com/web4ux/src/logger"
)

func ExtractWinfittsDetails(ctx context.Context, log logger.ILogger, htmlContent string) ([]WinfittsRawData, error) {
	contents := parseContentForWinfittsDetails(htmlContent)
	var output []WinfittsRawData
	for i := 1; i < len(contents); i++ {
		var winfitts WinfittsRawData
		if err := winfitts.Load(contents[i]); err != nil {
			return nil, err
		}

		output = append(output, winfitts)
	}

	return output, nil
}
