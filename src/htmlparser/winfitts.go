package htmlparser

func ExtractWinfittsDetails(htmlContent string) ([]WinfittsRawData, error) {
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
