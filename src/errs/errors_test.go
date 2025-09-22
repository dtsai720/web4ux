package errs_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/src/errs"
)

func TestErrorConstants(t *testing.T) {
	tests := []struct {
		name          string
		err           error
		expectedError string
	}{
		{
			name:          "ErrRegexMismatch",
			err:           errs.ErrRegexMismatch,
			expectedError: "regex mismatch",
		},
		{
			name:          "ErrInvalidProjectSummary",
			err:           errs.ErrInvalidProjectSummary,
			expectedError: "invalid project summary",
		},
		{
			name:          "ErrInsufficientCoordinateNumbers",
			err:           errs.ErrInsufficientCoordinateNumbers,
			expectedError: "insufficient valid numbers for position coordinates",
		},
		{
			name:          "ErrUnknown",
			err:           errs.ErrUnknown,
			expectedError: "unknown",
		},
		{
			name:          "ErrNotWinfittsProject",
			err:           errs.ErrNotWinfittsProject,
			expectedError: "project is not a winfitts project",
		},
		{
			name:          "ErrProjectUpToDate",
			err:           errs.ErrProjectUpToDate,
			expectedError: "project is already up to date",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.NotNil(t, tt.err)
			assert.Equal(t, tt.expectedError, tt.err.Error())
		})
	}
}
