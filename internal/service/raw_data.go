package service

import (
	"context"
	"net/http"
	"net/url"

	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
)

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

func (s *Service) Typing(ctx context.Context, log logger.ILogger, taskID string) ([]byte, error) {
	return s.fetchRawData(ctx, log, "/Project/_TypingRawDatas", taskID)
}

func (s *Service) Winfitts(ctx context.Context, log logger.ILogger, taskID string) ([]byte, error) {
	return s.fetchRawData(ctx, log, "/Project/_WinfittsRawDatas", taskID)
}

func (s *Service) DragAndDrop(ctx context.Context, log logger.ILogger, taskID string) ([]byte, error) {
	return s.fetchRawData(ctx, log, "/Project/_DragRawDatas", taskID)
}
