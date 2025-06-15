package common

type OptionalFn[T any] func(*T)

func WithOptions[T any](in *T, opts ...OptionalFn[T]) *T {
	for _, opt := range opts {
		opt(in)
	}

	return in
}

func Must[T any](in T, err error) T {
	if err != nil {
		panic(err)
	}

	return in
}

func Ternary[T any](condition bool, trueValue T, falseValue T) T {
	if condition {
		return trueValue
	}

	return falseValue
}
