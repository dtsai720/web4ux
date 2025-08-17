package errs

import "errors"

var (
	ErrRegexMismatch                 error = errors.New("regex mismatch")
	ErrInvalidProjectSummary         error = errors.New("invalid project summary")
	ErrInsufficientCoordinateNumbers error = errors.New("insufficient valid numbers for position coordinates")
	ErrUnknown                       error = errors.New("unknown")
)
