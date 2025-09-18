package request

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"

	"github.com/web4ux/src/common"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

var _ IClient = (*Request)(nil)

type Request struct {
	client common.Doer
}

func (r *Request) SetClient(client common.Doer) {
	r.client = client
}

// Send implements IClient.
func (r *Request) Send(ctx context.Context, log logger.ILogger, in *SendParam) ([]byte, error) {
	request, err := http.NewRequestWithContext(ctx, in.Method, in.Path, bytes.NewBuffer(in.Body))
	if err != nil {
		log.With(zap.Error(err)).Error("An error occurred while creating request")

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
		log.With(zap.Error(err)).Error("An error occurred while sending request")

		return nil, err
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		log.With(zap.Error(err)).Error("An error occurred while reading response body")

		return nil, err
	}

	// Check HTTP status code
	if response.StatusCode >= 400 {
		log.With(zap.Int("status_code", response.StatusCode), zap.String("status", response.Status), zap.String("response_body", string(body))).Error("HTTP request returned error status")
		return nil, fmt.Errorf("HTTP request failed with status %d: %s", response.StatusCode, response.Status)
	}

	return body, nil
}

func New() *Request {
	jar, err := cookiejar.New(nil)
	if err != nil {
		zap.L().Sugar().With(zap.Error(err)).Fatal("An error occurred while creating cookie jar")
	}

	return &Request{client: &http.Client{Jar: jar}}
}
