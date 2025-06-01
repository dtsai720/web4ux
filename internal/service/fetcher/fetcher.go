package fetcher

import (
	"context"
	"net/http"
	"net/url"
	"strconv"

	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
	"go.uber.org/zap"
)

func (s *Service) fetchProjectList(ctx context.Context, log logger.ILogger, offset int) ([]byte, error) {
	form := make(url.Values)
	form.Set("PageNumber", strconv.Itoa(offset))
	form.Set("Status", "Published")
	form.Set("OrderBy", "ModifyByDesc")
	form.Set("ProjectListType", "Grid")

	body, err := s.client.Send(ctx, log, &request.SendParam{
		Path:   HOST + "/Project/_Projects",
		Method: http.MethodPost,
		Body:   []byte(form.Encode()),
		Header: defaultHeaders,
	})
	if err != nil {
		log.With(zap.Error(err)).Error("An error occurred while sending list project request")

		return nil, err
	}

	return body, nil
}

func (s *Service) fetchRawData(ctx context.Context, log logger.ILogger, path, taskID string) ([]byte, error) {
	form := make(url.Values)
	form.Set("TaskId", taskID)

	body, err := s.client.Send(ctx, log, &request.SendParam{
		Path:   HOST + path,
		Method: http.MethodPost,
		Body:   []byte(form.Encode()),
		Header: defaultHeaders,
	})
	if err != nil {
		log.Error("An error while getting raw data", "error", err)

		return nil, err
	}

	return body, nil
}
