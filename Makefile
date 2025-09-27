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

.PHONY: test-frontend
test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm run test:run
	@echo "Frontend tests completed successfully."

.PHONY: lint-frontend
lint-frontend:
	@echo "Running frontend linting..."
	@cd frontend && npm run lint
	@echo "Frontend linting completed successfully."

.PHONY: test-all
test-all: test test-frontend
	@echo "All tests completed successfully."

.PHONY: test-coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -race -coverprofile=coverage.out ./... -coverpkg=./... | grep -v "coverage: [statement blocks]"
	@cat coverage.out | grep -v "/mocks/" | grep -v "/sqlc/" > coverage_filtered.out
	@go tool cover -html=coverage_filtered.out -o coverage.html
	@echo "Coverage report generated: coverage.html (mocks and sqlc excluded)"

.PHONY: test-frontend-watch
test-frontend-watch:
	@echo "Running frontend tests in watch mode..."
	@cd frontend && npm run test

.PHONY: test-frontend-coverage
test-frontend-coverage:
	@echo "Running frontend tests with coverage..."
	@cd frontend && npm run test:coverage
	@echo "Frontend coverage report generated in frontend/coverage/"

.PHONY: deps
deps:
	@echo "Installing dependencies..."
	@go mod download
	@cd frontend && npm install
	@echo "Dependencies installed successfully."

.PHONY: mockgen
mockgen:
	@echo "Generating mocks..."
	@./scripts/genmock.sh
	@echo "Mocks generated successfully."

.PHONY: update-coverage-badges
update-coverage-badges:
	@echo "Updating coverage badges in README.md..."
	@node scripts/update-coverage-badges.js
	@echo "Coverage badges updated successfully."
