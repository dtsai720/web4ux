package parser

import "regexp"

const timeLayout string = "1/2/2006 3:04:05 PM Z07:00"

var (
	projectRegex = regexp.MustCompile(`<div class="name">([^<]+)<\/div>`)

	creatorRegex = regexp.MustCompile(`<span class="user-department" title="EMRIC"><\/span>([^<]+)<\/div>`)

	timeRegex = regexp.MustCompile(`<span class="timestamp">([^<]+)</span>`)

	linkRegex = regexp.MustCompile(`<a href="([^"]+)"class="button-8 icon-resultbar">`)

	dataLinkRegex = regexp.MustCompile(`<a href="([^"]+)"\n\s+class="button-5 icon-rawdata ">`)

	spanRegex   = regexp.MustCompile(`<span>(\w+)<\/span>`)
	deviceRegex = regexp.MustCompile(`<span class="word-break">([^<]+)<\/span>`)

	winfittsDetailRegex = regexp.MustCompile(`<div class="data3"><span>([^<]+)</span><span>\(([^<]+)\)</span><span class="et">([^<]+)</span></div>`)
)
