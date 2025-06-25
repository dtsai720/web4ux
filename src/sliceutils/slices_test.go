package sliceutils_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/src/sliceutils"
)

func TestFind(t *testing.T) {
	t.Run("should return the element and true if the element is found", func(t *testing.T) {
		slice := []string{"a", "b", "c"}
		element := "b"

		found, ok := sliceutils.Find(slice, func(v string) bool {
			return v == element
		})

		assert.True(t, ok)
		assert.Equal(t, element, found)
	})

	t.Run("should return an empty string and false if the element is not found", func(t *testing.T) {
		slice := []string{"a", "b", "c"}
		element := "d"

		found, ok := sliceutils.Find(slice, func(v string) bool {
			return v == element
		})

		assert.False(t, ok)
		assert.Equal(t, "", found)
	})
}
