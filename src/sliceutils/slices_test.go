package sliceutils_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/src/sliceutils"
)

func TestMapFilter(t *testing.T) {
	t.Parallel()
	t.Run("should map and filter elements correctly", func(t *testing.T) {
		t.Parallel()
		slice := []int{1, 2, 3, 4, 5}
		expected := []int{4, 16} // Only even numbers, squared

		result := sliceutils.MapFilter(slice, func(v int) (int, bool) {
			if v%2 == 0 {
				return v * v, true
			}

			return 0, false
		})

		assert.Equal(t, expected, result)
	})

	t.Run("should return empty slice if no elements match filter", func(t *testing.T) {
		t.Parallel()
		slice := []int{1, 3, 5}
		expected := []int{}

		result := sliceutils.MapFilter(slice, func(v int) (int, bool) {
			if v%2 == 0 {
				return v * v, true
			}

			return 0, false
		})

		assert.Equal(t, expected, result)
	})

	t.Run("should handle empty slice", func(t *testing.T) {
		t.Parallel()
		slice := []int{}
		expected := []int{}

		result := sliceutils.MapFilter(slice, func(v int) (int, bool) {
			return v * v, true
		})

		assert.Equal(t, expected, result)
	})
}

func TestMap(t *testing.T) {
	t.Parallel()
	t.Run("should map elements correctly", func(t *testing.T) {
		t.Parallel()
		slice := []int{1, 2, 3}
		expected := []int{2, 4, 6}

		result := sliceutils.Map(slice, func(v int) int {
			return v * 2
		})

		assert.Equal(t, expected, result)
	})

	t.Run("should handle empty slice", func(t *testing.T) {
		t.Parallel()
		slice := []int{}
		expected := []int{}

		result := sliceutils.Map(slice, func(v int) int {
			return v * 2
		})

		assert.Equal(t, expected, result)
	})
}

func TestFilter(t *testing.T) {
	t.Parallel()
	t.Run("should filter elements correctly", func(t *testing.T) {
		t.Parallel()
		slice := []int{1, 2, 3, 4, 5}
		expected := []int{2, 4}

		result := sliceutils.Filter(slice, func(v int) bool {
			return v%2 == 0
		})

		assert.Equal(t, expected, result)
	})

	t.Run("should return empty slice if no elements match filter", func(t *testing.T) {
		t.Parallel()
		slice := []int{1, 3, 5}
		expected := []int{}

		result := sliceutils.Filter(slice, func(v int) bool {
			return v%2 == 0
		})

		assert.Equal(t, expected, result)
	})

	t.Run("should handle empty slice", func(t *testing.T) {
		t.Parallel()
		slice := []int{}
		expected := []int{}

		result := sliceutils.Filter(slice, func(v int) bool {
			return v%2 == 0
		})

		assert.Equal(t, expected, result)
	})
}

func TestReduce(t *testing.T) {
	t.Parallel()
	t.Run("should reduce elements correctly", func(t *testing.T) {
		t.Parallel()
		slice := []int{1, 2, 3, 4, 5}
		expected := 15 // Sum of elements

		result := sliceutils.Reduce(slice, func(acc, v int) int {
			return acc + v
		}, 0)

		assert.Equal(t, expected, result)
	})

	t.Run("should handle empty slice", func(t *testing.T) {
		t.Parallel()
		slice := []int{}
		expected := 10 // Initial value

		result := sliceutils.Reduce(slice, func(acc, v int) int {
			return acc + v
		}, 10)

		assert.Equal(t, expected, result)
	})
}

func TestFind(t *testing.T) {
	t.Parallel()
	t.Run("should return the element and true if the element is found", func(t *testing.T) {
		t.Parallel()
		slice := []string{"a", "b", "c"}
		element := "b"

		found, ok := sliceutils.Find(slice, func(v string) bool {
			return v == element
		})

		assert.True(t, ok)
		assert.Equal(t, element, found)
	})

	t.Run("should return an empty string and false if the element is not found", func(t *testing.T) {
		t.Parallel()
		slice := []string{"a", "b", "c"}
		element := "d"

		found, ok := sliceutils.Find(slice, func(v string) bool {
			return v == element
		})

		assert.False(t, ok)
		assert.Empty(t, found)
	})

	t.Run("should handle empty slice", func(t *testing.T) {
		t.Parallel()
		slice := []string{}
		element := "a"

		found, ok := sliceutils.Find(slice, func(v string) bool {
			return v == element
		})

		assert.False(t, ok)
		assert.Empty(t, found)
	})
}

func TestSameLen(t *testing.T) {
	t.Parallel()
	t.Run("should return true if all slices have the same length", func(t *testing.T) {
		t.Parallel()
		slice1 := []int{1, 2, 3}
		slice2 := []int{4, 5, 6}
		slice3 := []int{7, 8, 9}

		assert.True(t, sliceutils.SameLen(slice1, slice2, slice3))
	})

	t.Run("should return false if any slice has a different length", func(t *testing.T) {
		t.Parallel()
		slice1 := []int{1, 2, 3}
		slice2 := []int{4, 5}
		slice3 := []int{7, 8, 9}

		assert.False(t, sliceutils.SameLen(slice1, slice2, slice3))
	})

	t.Run("should handle empty slices", func(t *testing.T) {
		t.Parallel()
		slice1 := []int{}
		slice2 := []int{}

		assert.True(t, sliceutils.SameLen(slice1, slice2))
	})

	t.Run("should handle no additional options", func(t *testing.T) {
		t.Parallel()
		slice1 := []int{1, 2, 3}

		assert.True(t, sliceutils.SameLen(slice1))
	})
}
