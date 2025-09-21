package errs

import "errors"

var (
	ErrRegexMismatch                 error = errors.New("regex mismatch")
	ErrInvalidProjectSummary         error = errors.New("invalid project summary")
	ErrInsufficientCoordinateNumbers error = errors.New("insufficient valid numbers for position coordinates")
	ErrUnknown                       error = errors.New("unknown")
	ErrNotWinfittsProject            error = errors.New("project is not a winfitts project")
	ErrProjectUpToDate               error = errors.New("project is already up to date")
)
