package service

const (
	HOST        string = "https://edgux.com"
	ContentType string = "application/x-www-form-urlencoded"
)

//nolint:gochecknoglobals
var defaultHeaders = map[string]string{
	"Content-Type": ContentType,
}
