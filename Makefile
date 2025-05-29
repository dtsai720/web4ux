.PHONY: lint
lint:
	@echo "Running linters..."
	@golangci-lint run ./...
	@echo "Linters completed successfully."

.PHONY: test
test:
	@echo "Running tests..."
	@go test -race -v ./...
	@echo "Tests completed successfully."

.PHONY: build
build:
	@echo "Building the project..."
	@go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest
	@echo "Build completed successfully."
