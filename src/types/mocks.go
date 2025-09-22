package types

type MockItem[T any] struct {
	Count int
	Error error
	Item  T
}
