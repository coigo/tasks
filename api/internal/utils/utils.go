package utils

func EnsureList[T any](l []T) []T {
	if l == nil {
		return []T{}
	}
	return l
}