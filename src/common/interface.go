package common

import "net/http"

// Doer defines the interface for executing HTTP requests.
// This interface abstracts the HTTP client implementation, allowing for easy testing
// and substitution of different HTTP clients (e.g., standard http.Client, custom clients
// with retry logic, or mock clients for testing).
type Doer interface {
	// Do executes the given HTTP request and returns the response.
	// The request should be fully configured with URL, headers, body, etc.
	// Returns an error if the request fails due to network issues, timeouts,
	// or other client-side problems. HTTP error status codes (4xx, 5xx) are
	// not considered errors by this interface - they return a valid response.
	Do(req *http.Request) (*http.Response, error)
}
