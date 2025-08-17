package models

import "regexp"

var (
	SpanRegex           *regexp.Regexp = regexp.MustCompile(`<span>(-?\w+)<\/span>`)
	DeviceRegex         *regexp.Regexp = regexp.MustCompile(`<span\s*class="word-break">([^<]+)<\/span>`)
	WinfittsDetailRegex *regexp.Regexp = regexp.MustCompile(`<div\s*class="data3"><span>([^<]+)</span><span>\(([^<]+)\)</span><span\s*class="et">([^<]+)</span></div>`)
)
