package errs

import "errors"

var (
	ErrRegexMismatch         error = errors.New("regex mismatch")
	ErrInvalidProjectSummary error = errors.New("invalid project summary")
)
