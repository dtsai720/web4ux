package common

type OptionalFn[T any] func(*T)

func WithOptions[T any](in *T, opts ...OptionalFn[T]) *T {
	for _, opt := range opts {
		opt(in)
	}

	return in
}

// Must panics if error is not nil, returning the value otherwise.
// Deprecated: Use safer error handling patterns instead of Must.
// Consider using Result[T] or explicit error checking.
func Must[T any](in T, err error) T {
	if err != nil {
		panic(err)
	}

	return in
}

// Result represents a value that may contain an error
type Result[T any] struct {
	Value T
	Error error
}

// NewResult creates a new Result from a value and error
func NewResult[T any](value T, err error) Result[T] {
	return Result[T]{Value: value, Error: err}
}

// IsOk returns true if the result contains no error
func (r Result[T]) IsOk() bool {
	return r.Error == nil
}

// Unwrap returns the value if no error, otherwise returns zero value and the error
func (r Result[T]) Unwrap() (T, error) {
	return r.Value, r.Error
}

// UnwrapOr returns the value if no error, otherwise returns the provided default
func (r Result[T]) UnwrapOr(defaultValue T) T {
	if r.Error != nil {
		return defaultValue
	}
	return r.Value
}

func Ternary[T any](condition bool, trueValue T, falseValue T) T {
	if condition {
		return trueValue
	}

	return falseValue
}

type Item[T any] struct {
	Result T
	Error  error
	Count  int
}
