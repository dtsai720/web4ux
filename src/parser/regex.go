package parser

import "regexp"

const timeLayout string = "1/2/2006 3:04:05 PM Z07:00"

var (
	projectRegex   = regexp.MustCompile(`<div\s*class="name">([^<]+)<\/div>`)
	projectIDRegex = regexp.MustCompile(`<input\s*type="hidden"\s*name="ProjectId"\s*value="([^"]+)">`)

	creatorRegex = regexp.MustCompile(`<span\s*class="user-department"\s*title="EMRIC"><\/span>([^<]+)<\/div>`)

	timeRegex = regexp.MustCompile(`<span\s*class="timestamp">([^<]+)</span>`)

	linkRegex     = regexp.MustCompile(`<a\s*href="([^"]+)"\s*class="button-8 icon-resultbar">`)
	dataLinkRegex = regexp.MustCompile(`<a\s*href="([^"]+)"\s*class="button-5\s*icon-rawdata ">`)

	spanRegex   = regexp.MustCompile(`<span>(\w+)<\/span>`)
	deviceRegex = regexp.MustCompile(`<span\s*class="word-break">([^<]+)<\/span>`)

	winfittsDetailRegex = regexp.MustCompile(`<div\s*class="data3"><span>([^<]+)</span><span>\(([^<]+)\)</span><span\s*class="et">([^<]+)</span></div>`)
)
