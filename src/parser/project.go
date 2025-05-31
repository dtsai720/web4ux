package parser

import (
	"errors"
	"strings"
	"time"
)

func ProjectList(data string) ([]ProjectListResult, error) {
	text := prepareProjectText(data)
	names := projectRegex.FindAllStringSubmatch(text, -1)
	creators := creatorRegex.FindAllStringSubmatch(text, -1)
	datetime := timeRegex.FindAllStringSubmatch(text, -1)
	links := linkRegex.FindAllStringSubmatch(text, -1)
	projectIDs := projectIDRegex.FindAllStringSubmatch(text, -1)

	if len(names) != len(creators) || len(names) != len(links) || len(names) != len(datetime) || len(names) != len(projectIDs) {
		return nil, errors.New("mismatched lengths in project data, expected equal number of groups for names, creators, links, and datetime")
	}

	output := make([]ProjectListResult, len(names))
	for idx := range names {
		if len(names[idx]) < 2 || len(creators[idx]) < 2 || len(links[idx]) < 2 || len(datetime[idx]) < 2 {
			return nil, errors.New("unexpected format in project data, missing expected groups")
		}
		output[idx].ID = strings.TrimSpace(projectIDs[idx][1])
		output[idx].Name = strings.TrimSpace(names[idx][1])
		output[idx].Creator = strings.TrimSpace(creators[idx][1])
		output[idx].Link = strings.TrimSpace(links[idx][1])
		parsedTime, err := time.Parse(timeLayout, strings.TrimSpace(datetime[idx][1]))
		if err != nil {
			return nil, err
		}
		output[idx].Time = parsedTime.UTC()
	}

	return output, nil
}
