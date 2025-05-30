package service

import (
	"context"
	"net/http"
	"net/url"

	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
)

func (s *Service) Login(ctx context.Context, log logger.ILogger, email, password string) error {
	form := make(url.Values)
	form.Set("Email", email)
	form.Set("Password", password)

	if _, err := s.client.Send(ctx, log, &request.SendParam{
		Path:   HOST + "/Home/Login",
		Method: http.MethodPost,
		Body:   []byte(form.Encode()),
		Header: defaultHeaders,
	}); err != nil {
		log.Error("An error occurred while sending login request", "error", err)

		return err
	}

	return nil
}
