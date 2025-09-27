package request_test

import (
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	mock_src_common "github.com/web4ux/mocks/src_common"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
	"go.uber.org/mock/gomock"
)

var (
	errNetwork         = errors.New("network error")
	errContextDeadline = errors.New("context deadline exceeded")
)

type SendTestCase struct {
	Title         string
	Response      *http.Response
	ResponseError error
	HasError      bool
}

var SendTestCases = []SendTestCase{ //nolint:gochecknoglobals
	{
		Title: "successful GET request",
		Response: &http.Response{
			StatusCode: http.StatusOK,
			Body:       io.NopCloser(strings.NewReader(`{"success": true}`)),
		},
		ResponseError: nil,
		HasError:      false,
	},
	{
		Title: "successful POST request with body",
		Response: &http.Response{
			StatusCode: http.StatusCreated,
			Body:       io.NopCloser(strings.NewReader(`{"id": 123, "created": true}`)),
		},
		ResponseError: nil,
		HasError:      false,
	},
	{
		Title: "HTTP client error",
		Response: &http.Response{
			StatusCode: http.StatusInternalServerError,
			Body:       io.NopCloser(strings.NewReader(`{"error": "internal server error"}`)),
		},
		ResponseError: errNetwork,
		HasError:      true,
	},
	{
		Title: "empty response body",
		Response: &http.Response{
			StatusCode: http.StatusNoContent,
			Body:       io.NopCloser(strings.NewReader("")),
		},
		ResponseError: nil,
		HasError:      false,
	},
	{
		Title:         "client connection timeout",
		Response:      nil,
		ResponseError: errContextDeadline,
		HasError:      true,
	},
}

func TestSend(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	log := logger.NewTestLogger()

	for _, tc := range SendTestCases {
		t.Run(tc.Title, func(t *testing.T) {
			t.Parallel()
			doer := mock_src_common.NewMockDoer(ctrl)
			doer.EXPECT().Do(gomock.Any()).Return(tc.Response, tc.ResponseError)
			client := new(request.Request)
			client.SetClient(doer)

			_, err := client.Send(ctx, log, &request.SendParam{})
			assert.Equal(t, tc.HasError, err != nil)
		})
	}
}

func TestSend_DetailedScenarios(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		sendParam     *request.SendParam
		response      *http.Response
		responseError error
		expectError   bool
		expectedBody  string
	}{
		{
			name: "GET request with headers and query params",
			sendParam: &request.SendParam{
				Path:   "https://example.com/api/data",
				Method: "GET",
				Header: map[string]string{
					"Authorization": "Bearer token123",
					"Content-Type":  "application/json",
				},
				Query: map[string]string{
					"limit":  "10",
					"offset": "0",
				},
			},
			response: &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"data": "success"}`)),
			},
			responseError: nil,
			expectError:   false,
			expectedBody:  `{"data": "success"}`,
		},
		{
			name: "POST request with JSON body",
			sendParam: &request.SendParam{
				Path:   "https://example.com/api/create",
				Method: "POST",
				Body:   []byte(`{"name": "test", "value": 123}`),
				Header: map[string]string{
					"Content-Type": "application/json",
				},
			},
			response: &http.Response{
				StatusCode: http.StatusCreated,
				Body:       io.NopCloser(strings.NewReader(`{"id": 456, "created": true}`)),
			},
			responseError: nil,
			expectError:   false,
			expectedBody:  `{"id": 456, "created": true}`,
		},
		{
			name: "HTTP 404 error response",
			sendParam: &request.SendParam{
				Path:   "https://example.com/api/notfound",
				Method: "GET",
			},
			response: &http.Response{
				StatusCode: http.StatusNotFound,
				Status:     "404 Not Found",
				Body:       io.NopCloser(strings.NewReader(`{"error": "resource not found"}`)),
			},
			responseError: nil,
			expectError:   true,
		},
		{
			name: "HTTP 500 error response",
			sendParam: &request.SendParam{
				Path:   "https://example.com/api/error",
				Method: "GET",
			},
			response: &http.Response{
				StatusCode: http.StatusInternalServerError,
				Status:     "500 Internal Server Error",
				Body:       io.NopCloser(strings.NewReader(`{"error": "internal server error"}`)),
			},
			responseError: nil,
			expectError:   true,
		},
		{
			name: "network error during request",
			sendParam: &request.SendParam{
				Path:   "https://unreachable.com/api",
				Method: "GET",
			},
			response:      nil,
			responseError: errors.New("network unreachable"),
			expectError:   true,
		},
		{
			name: "error reading response body",
			sendParam: &request.SendParam{
				Path:   "https://example.com/api/data",
				Method: "GET",
			},
			response: &http.Response{
				StatusCode: http.StatusOK,
				Body:       &errorReader{},
			},
			responseError: nil,
			expectError:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctrl := gomock.NewController(t)
			t.Cleanup(ctrl.Finish)

			ctx := t.Context()
			log := logger.NewTestLogger()

			doer := mock_src_common.NewMockDoer(ctrl)
			doer.EXPECT().Do(gomock.Any()).Return(tt.response, tt.responseError)

			client := new(request.Request)
			client.SetClient(doer)

			body, err := client.Send(ctx, log, tt.sendParam)
			assert.Equal(t, tt.expectError, err != nil)
			assert.Equal(t, tt.expectedBody, string(body))
		})
	}
}

func TestNew(t *testing.T) {
	t.Parallel()

	client := request.New()

	assert.NotNil(t, client)
	assert.IsType(t, &request.Request{}, client)
}

func TestRequest_SetClient(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	client := new(request.Request)
	mockDoer := mock_src_common.NewMockDoer(ctrl)

	client.SetClient(mockDoer)

	// Verify the client was set by trying to use it
	ctx := t.Context()
	log := logger.NewTestLogger()

	mockDoer.EXPECT().Do(gomock.Any()).Return(&http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader("test")),
	}, nil)

	_, err := client.Send(ctx, log, &request.SendParam{
		Path:   "https://example.com",
		Method: "GET",
	})

	assert.NoError(t, err)
}

func TestSend_InvalidRequestCreation(t *testing.T) {
	t.Parallel()
	ctrl := gomock.NewController(t)
	t.Cleanup(ctrl.Finish)

	ctx := t.Context()
	log := logger.NewTestLogger()
	client := new(request.Request)
	mockDoer := mock_src_common.NewMockDoer(ctrl)
	client.SetClient(mockDoer)

	// Test with invalid method that contains space characters
	_, err := client.Send(ctx, log, &request.SendParam{
		Path:   "https://example.com",
		Method: "INVALID METHOD", // Invalid HTTP method with space
	})

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid method")
}

// errorReader is a helper type that always returns an error when reading
type errorReader struct{}

func (e *errorReader) Read(p []byte) (n int, err error) {
	return 0, errors.New("read error")
}

func (e *errorReader) Close() error {
	return nil
}
