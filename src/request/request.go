package request

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"net/http/cookiejar"

	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

var _ IClient = (*Request)(nil)

type Request struct {
	client *http.Client
}

// Send implements IClient.
func (r *Request) Send(ctx context.Context, log logger.ILogger, in *SendParam) ([]byte, error) {
	request, err := http.NewRequestWithContext(ctx, in.Method, in.Path, bytes.NewBuffer(in.Body))
	if err != nil {
		log.Error("An error occurred while creating request", "error", err)

		return nil, err
	}

	for key, value := range in.Header {
		request.Header.Set(key, value)
	}

	query := request.URL.Query()
	for key, value := range in.Query {
		query.Set(key, value)
	}
	request.URL.RawQuery = query.Encode()

	response, err := r.client.Do(request)
	if err != nil {
		log.Error("An error occurred while sending request", "error", err)

		return nil, err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		log.Error("An error occurred while reading response body", "error", err)

		return nil, err
	}

	return body, nil
}

func New() *Request {
	jar, err := cookiejar.New(nil)
	if err != nil {
		zap.L().Sugar().Fatalw("An error occurred while creating cookie jar", "error", err)
	}

	return &Request{client: &http.Client{Jar: jar}}
}
