package service

import (
	"context"
	"net/http"
	"net/url"
	"strconv"

	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
)

func (s *Service) ListProject(ctx context.Context, log logger.ILogger, offset int) ([]byte, error) {
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
		log.Error("An error occurred while sending list project request", "error", err)

		return nil, err
	}

	return body, nil
}
