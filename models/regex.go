package models

import "regexp"

var (
	spanRegex           *regexp.Regexp = regexp.MustCompile(`<span>(-?\w+)<\/span>`)
	deviceRegex         *regexp.Regexp = regexp.MustCompile(`<span\s*class="word-break">([^<]+)<\/span>`)
	winfittsDetailRegex *regexp.Regexp = regexp.MustCompile(`<div\s*class="data3"><span>([^<]+)</span><span>\(([^<]+)\)</span><span\s*class="et">([^<]+)</span></div>`)
)
