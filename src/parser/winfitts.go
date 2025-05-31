package parser

import _ "embed"

func Winfitts(data string) ([]*WinfittsResult, error) {
	contents := prepareWinfittsData(data)
	var output []*WinfittsResult
	for i := 1; i < len(contents); i++ {
		result, err := winfittsToCanonical(contents[i])
		if err != nil {
			return nil, err
		}

		output = append(output, result)
	}

	return output, nil
}
