package sliceutils

func MapFilter[T any, R any](slice []T, fn func(T) (R, bool)) []R {
	result := make([]R, 0, len(slice))
	for _, v := range slice {
		if r, ok := fn(v); ok {
			result = append(result, r)
		}
	}

	return result
}

func Map[T any, R any](slice []T, fn func(T) R) []R {
	result := make([]R, len(slice))
	for i, v := range slice {
		result[i] = fn(v)
	}

	return result
}

func Filter[T any](slice []T, fn func(T) bool) []T {
	result := make([]T, 0, len(slice))
	for _, v := range slice {
		if fn(v) {
			result = append(result, v)
		}
	}

	return result
}

func Reduce[T any, R any](slice []T, fn func(R, T) R, initial R) R {
	result := initial
	for _, v := range slice {
		result = fn(result, v)
	}

	return result
}

func Find[T any](slice []T, fn func(T) bool) (T, bool) {
	for _, v := range slice {
		if fn(v) {
			return v, true
		}
	}
	var zero T

	return zero, false
}
