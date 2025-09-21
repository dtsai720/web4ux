package common

import "time"

// ParseTimeRFC3339 safely parses an RFC3339 formatted time string
func ParseTimeRFC3339(timeStr string) (time.Time, error) {
	return time.Parse(time.RFC3339, timeStr)
}

// ParseTimeRFC3339OrZero parses an RFC3339 formatted time string, returning zero time on error
func ParseTimeRFC3339OrZero(timeStr string) time.Time {
	result := NewResult(time.Parse(time.RFC3339, timeStr))
	return result.UnwrapOr(time.Time{})
}

// ParseTimeRFC3339OrDefault parses an RFC3339 formatted time string, returning default time on error
func ParseTimeRFC3339OrDefault(timeStr string, defaultTime time.Time) time.Time {
	result := NewResult(time.Parse(time.RFC3339, timeStr))
	return result.UnwrapOr(defaultTime)
}
