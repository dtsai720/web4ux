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
