package htmlparser

import "regexp"

const timeLayout string = "1/2/2006 3:04:05 PM Z07:00"

var (
	projectNameRegex      *regexp.Regexp = regexp.MustCompile(`<div\s*class="name">([^<]+)<\/div>`)
	projectIDRegex        *regexp.Regexp = regexp.MustCompile(`<input\s*type="hidden"\s*name="ProjectId"\s*value="([^"]+)">`)
	projectCreatorRegex   *regexp.Regexp = regexp.MustCompile(`<div\s*class="user">\s*(?:<span\s*class="user-department"\s*title="EMRIC"><\/span>)?([^<]+)<\/div>`)
	projectUpdatedAtRegex *regexp.Regexp = regexp.MustCompile(`<span\s*class="timestamp">([^<]+)</span>`)
	testResultLinksRegex  *regexp.Regexp = regexp.MustCompile(`<a\s*href="([^"]+)"\s*class="button-8 icon-resultbar">`)
	rawDataLinkRegex      *regexp.Regexp = regexp.MustCompile(`<a\s*href="([^"]+)"\s*class="button-5\s*icon-rawdata ">`)
)
