package fetcher

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/web4ux/src/errs"
	"github.com/web4ux/src/logger"
	"github.com/web4ux/src/request"
)

func (s *Service) Login(ctx context.Context, log logger.ILogger, email, password string) error {
	const op = "fetcher.Service.Login"

	// Validate input parameters
	if strings.TrimSpace(email) == "" {
		return errs.NewValidationError(op, "email cannot be empty")
	}
	if strings.TrimSpace(password) == "" {
		return errs.NewValidationError(op, "password cannot be empty")
	}

	// Prepare login form data
	form := make(url.Values)
	form.Set("Email", email)
	form.Set("Password", password)

	// Attempt login request
	_, err := s.client.Send(ctx, log, &request.SendParam{
		Path:   HOST + "/Home/Login",
		Method: http.MethodPost,
		Body:   []byte(form.Encode()),
		Header: defaultHeaders,
	})
	if err != nil {
		log.Errorf("Login request failed for email %s: %v", email, err)

		// Classify the error based on the underlying cause
		if isNetworkError(err) {
			return errs.NewNetworkError(op, err)
		}
		if isAuthenticationError(err) {
			return errs.NewServiceError(op, err, errs.ErrCodeAuthentication)
		}

		// Default to network error for unknown request failures
		return errs.NewNetworkError(op, err)
	}

	log.Infof("Login successful for email: %s", email)
	return nil
}

// isNetworkError checks if the error is related to network connectivity.
func isNetworkError(err error) bool {
	// This is a simplified check - in a real implementation, you might
	// check for specific error types like net.Error, dns.Error, etc.
	return strings.Contains(err.Error(), "network") ||
		strings.Contains(err.Error(), "timeout") ||
		strings.Contains(err.Error(), "connection")
}

// isAuthenticationError checks if the error indicates authentication failure.
func isAuthenticationError(err error) bool {
	// This is a simplified check - in a real implementation, you might
	// check HTTP status codes or specific error messages from the API
	return strings.Contains(err.Error(), "401") ||
		strings.Contains(err.Error(), "unauthorized") ||
		strings.Contains(err.Error(), "invalid credentials")
}
