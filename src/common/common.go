package common

type OptionalFn[T any] func(*T)

func WithOptions[T any](in *T, opts ...OptionalFn[T]) *T {
	for _, opt := range opts {
		opt(in)
	}

	return in
}
