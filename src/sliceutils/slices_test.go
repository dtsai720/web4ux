package sliceutils_test

import (
	"strconv"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/web4ux/src/sliceutils"
)

type mapFilterTestCase struct {
	name     string
	input    []string
	fn       func(string) (int, bool)
	expected []int
}

var mapFilterTestCases = []mapFilterTestCase{ //nolint:gochecknoglobals
	{
		name:  "filter and convert valid numbers",
		input: []string{"1", "2", "abc", "3", "def", "4"},
		fn: func(s string) (int, bool) {
			if num, err := strconv.Atoi(s); err == nil {
				return num, true
			}

			return 0, false
		},
		expected: []int{1, 2, 3, 4},
	},
	{
		name:  "filter and convert empty input",
		input: []string{},
		fn: func(s string) (int, bool) {
			if num, err := strconv.Atoi(s); err == nil {
				return num, true
			}

			return 0, false
		},
		expected: []int{},
	},
	{
		name:  "no valid conversions",
		input: []string{"abc", "def", "xyz"},
		fn: func(s string) (int, bool) {
			if num, err := strconv.Atoi(s); err == nil {
				return num, true
			}

			return 0, false
		},
		expected: []int{},
	},
	{
		name:  "all valid conversions",
		input: []string{"10", "20", "30"},
		fn: func(s string) (int, bool) {
			if num, err := strconv.Atoi(s); err == nil {
				return num * 2, true
			}

			return 0, false
		},
		expected: []int{20, 40, 60},
	},
}

func TestMapFilter(t *testing.T) {
	t.Parallel()

	for _, tt := range mapFilterTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := sliceutils.MapFilter(tt.input, tt.fn)
			assert.Equal(t, tt.expected, result)
		})
	}
}

type mapTestCase struct {
	name     string
	input    []int
	fn       func(int) string
	expected []string
}

var mapTestCases = []mapTestCase{ //nolint:gochecknoglobals
	{
		name:     "convert numbers to strings",
		input:    []int{1, 2, 3, 4, 5},
		fn:       strconv.Itoa,
		expected: []string{"1", "2", "3", "4", "5"},
	},
	{
		name:     "empty input",
		input:    []int{},
		fn:       strconv.Itoa,
		expected: []string{},
	},
	{
		name:     "multiply and convert",
		input:    []int{1, 2, 3},
		fn:       func(i int) string { return strconv.Itoa(i * 2) },
		expected: []string{"2", "4", "6"},
	},
	{
		name:     "single element",
		input:    []int{42},
		fn:       func(i int) string { return "num:" + strconv.Itoa(i) },
		expected: []string{"num:42"},
	},
}

func TestMap(t *testing.T) {
	t.Parallel()

	for _, tt := range mapTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := sliceutils.Map(tt.input, tt.fn)
			assert.Equal(t, tt.expected, result)
		})
	}
}

type filterTestCase struct {
	name     string
	input    []int
	fn       func(int) bool
	expected []int
}

var filterTestCases = []filterTestCase{ //nolint:gochecknoglobals
	{
		name:     "filter even numbers",
		input:    []int{1, 2, 3, 4, 5, 6},
		fn:       func(i int) bool { return i%2 == 0 },
		expected: []int{2, 4, 6},
	},
	{
		name:     "filter greater than 3",
		input:    []int{1, 2, 3, 4, 5},
		fn:       func(i int) bool { return i > 3 },
		expected: []int{4, 5},
	},
	{
		name:     "empty input",
		input:    []int{},
		fn:       func(i int) bool { return true },
		expected: []int{},
	},
	{
		name:     "no matches",
		input:    []int{1, 3, 5, 7},
		fn:       func(i int) bool { return i%2 == 0 },
		expected: []int{},
	},
	{
		name:     "all matches",
		input:    []int{2, 4, 6, 8},
		fn:       func(i int) bool { return i%2 == 0 },
		expected: []int{2, 4, 6, 8},
	},
}

func TestFilter(t *testing.T) {
	t.Parallel()

	for _, tt := range filterTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := sliceutils.Filter(tt.input, tt.fn)
			assert.Equal(t, tt.expected, result)
		})
	}
}

type reduceTestCase struct {
	name     string
	input    []int
	fn       func(int, int) int
	initial  int
	expected int
}

var reduceTestCases = []reduceTestCase{ //nolint:gochecknoglobals
	{
		name:     "sum all numbers",
		input:    []int{1, 2, 3, 4, 5},
		fn:       func(acc, val int) int { return acc + val },
		initial:  0,
		expected: 15,
	},
	{
		name:     "multiply all numbers",
		input:    []int{2, 3, 4},
		fn:       func(acc, val int) int { return acc * val },
		initial:  1,
		expected: 24,
	},
	{
		name:     "empty input",
		input:    []int{},
		fn:       func(acc, val int) int { return acc + val },
		initial:  10,
		expected: 10,
	},
	{
		name:     "single element",
		input:    []int{5},
		fn:       func(acc, val int) int { return acc + val },
		initial:  10,
		expected: 15,
	},
	{
		name:  "find maximum",
		input: []int{3, 1, 7, 2, 5},
		fn: func(acc, val int) int {
			if val > acc {
				return val
			}

			return acc
		},
		initial:  0,
		expected: 7,
	},
}

func TestReduce(t *testing.T) {
	t.Parallel()

	for _, tt := range reduceTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := sliceutils.Reduce(tt.input, tt.fn, tt.initial)
			assert.Equal(t, tt.expected, result)
		})
	}
}

type findTestCase struct {
	name          string
	input         []string
	fn            func(string) bool
	expectedValue string
	expectedFound bool
}

var findTestCases = []findTestCase{ //nolint:gochecknoglobals
	{
		name:          "find existing element",
		input:         []string{"apple", "banana", "cherry"},
		fn:            func(s string) bool { return s == "banana" },
		expectedValue: "banana",
		expectedFound: true,
	},
	{
		name:          "find non-existing element",
		input:         []string{"apple", "banana", "cherry"},
		fn:            func(s string) bool { return s == "orange" },
		expectedValue: "",
		expectedFound: false,
	},
	{
		name:          "find first match",
		input:         []string{"test1", "test2", "test3"},
		fn:            func(s string) bool { return strings.HasPrefix(s, "test") },
		expectedValue: "test1",
		expectedFound: true,
	},
	{
		name:          "empty input",
		input:         []string{},
		fn:            func(s string) bool { return true },
		expectedValue: "",
		expectedFound: false,
	},
	{
		name:          "find by length",
		input:         []string{"a", "bb", "ccc", "dddd"},
		fn:            func(s string) bool { return len(s) == 3 },
		expectedValue: "ccc",
		expectedFound: true,
	},
}

func TestFind(t *testing.T) {
	t.Parallel()

	for _, tt := range findTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			value, found := sliceutils.Find(tt.input, tt.fn)
			assert.Equal(t, tt.expectedValue, value)
			assert.Equal(t, tt.expectedFound, found)
		})
	}
}

type sameLenTestCase struct {
	name     string
	slice    []int
	options  [][]int
	expected bool
}

var sameLenTestCases = []sameLenTestCase{ //nolint:gochecknoglobals
	{
		name:     "same length - single comparison",
		slice:    []int{1, 2, 3},
		options:  [][]int{{4, 5, 6}},
		expected: true,
	},
	{
		name:     "different length - single comparison",
		slice:    []int{1, 2, 3},
		options:  [][]int{{4, 5}},
		expected: false,
	},
	{
		name:     "same length - multiple comparisons",
		slice:    []int{1, 2, 3},
		options:  [][]int{{4, 5, 6}, {7, 8, 9}, {10, 11, 12}},
		expected: true,
	},
	{
		name:     "different length - multiple comparisons",
		slice:    []int{1, 2, 3},
		options:  [][]int{{4, 5, 6}, {7, 8}, {10, 11, 12}},
		expected: false,
	},
	{
		name:     "empty slices",
		slice:    []int{},
		options:  [][]int{{}, {}},
		expected: true,
	},
	{
		name:     "no options",
		slice:    []int{1, 2, 3},
		options:  [][]int{},
		expected: true,
	},
	{
		name:     "single element slices",
		slice:    []int{1},
		options:  [][]int{{2}, {3}, {4}},
		expected: true,
	},
	{
		name:     "mixed lengths",
		slice:    []int{1, 2},
		options:  [][]int{{3, 4}, {5}, {6, 7}},
		expected: false,
	},
}

func TestSameLen(t *testing.T) {
	t.Parallel()

	for _, tt := range sameLenTestCases {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := sliceutils.SameLen(tt.slice, tt.options...)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// Test with different types to ensure generics work correctly.
func TestGenericsWithDifferentTypes(t *testing.T) {
	t.Parallel()
	t.Run("MapFilter with structs", func(t *testing.T) {
		t.Parallel()
		type Person struct {
			Name string
			Age  int
		}

		people := []Person{
			{Name: "Alice", Age: 25},
			{Name: "Bob", Age: 17},
			{Name: "Charlie", Age: 30},
			{Name: "Diana", Age: 16},
		}

		adults := sliceutils.MapFilter(people, func(p Person) (string, bool) {
			if p.Age >= 18 {
				return p.Name, true
			}

			return "", false
		})

		expected := []string{"Alice", "Charlie"}
		assert.Equal(t, expected, adults)
	})

	t.Run("Map with structs", func(t *testing.T) {
		t.Parallel()
		type Point struct {
			X, Y int
		}

		points := []Point{{1, 2}, {3, 4}, {5, 6}}
		distances := sliceutils.Map(points, func(p Point) float64 {
			return float64(p.X*p.X + p.Y*p.Y)
		})

		expected := []float64{5, 25, 61}
		assert.Equal(t, expected, distances)
	})

	t.Run("Reduce with strings", func(t *testing.T) {
		t.Parallel()
		words := []string{"Hello", " ", "World", "!"}
		sentence := sliceutils.Reduce(words, func(acc, word string) string {
			return acc + word
		}, "")

		assert.Equal(t, "Hello World!", sentence)
	})
}

// Benchmark tests to ensure performance.
func BenchmarkMap(b *testing.B) {
	input := make([]int, 1000)
	for i := range input {
		input[i] = i
	}

	b.ResetTimer()
	for b.Loop() {
		sliceutils.Map(input, func(x int) int { return x * 2 })
	}
}

func BenchmarkFilter(b *testing.B) {
	input := make([]int, 1000)
	for i := range input {
		input[i] = i
	}

	b.ResetTimer()
	for b.Loop() {
		sliceutils.Filter(input, func(x int) bool { return x%2 == 0 })
	}
}

func BenchmarkMapFilter(b *testing.B) {
	input := make([]string, 1000)
	for i := range input {
		input[i] = strconv.Itoa(i)
	}

	b.ResetTimer()
	for b.Loop() {
		sliceutils.MapFilter(input, func(s string) (int, bool) {
			if num, err := strconv.Atoi(s); err == nil {
				return num, true
			}

			return 0, false
		})
	}
}
