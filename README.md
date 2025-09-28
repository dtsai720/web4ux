# Web4UX - UX Testing Data Analysis Tool

[![Backend CI](https://github.com/dtsai720/web4ux/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/dtsai720/web4ux/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/dtsai720/web4ux/actions/workflows/frontend-ci.yml/badge.svg?branch=main)](https://github.com/dtsai720/web4ux/actions/workflows/frontend-ci.yml)

[![Go Coverage](https://img.shields.io/badge/Go%20Coverage-89.2%25-brightgreen)](./coverage.html)
[![Frontend Coverage](https://img.shields.io/badge/Frontend%20Coverage-35.14%25-red)](./frontend/coverage/)

## About

Web4UX is a desktop application for analyzing UX testing data from Winfit tests. Built with Wails v2, it combines a Go backend with a React frontend to provide comprehensive data analysis and visualization capabilities.

### Technology Stack

- **Backend**: [![Go](https://img.shields.io/badge/Go-1.25.1-00ADD8?logo=go&logoColor=white)](https://golang.org/) with [![Wails](https://img.shields.io/badge/Wails-v2.10.2-FF6B6B?logo=wails&logoColor=white)](https://wails.io/)
- **Frontend**: [![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/) with [![Vite](https://img.shields.io/badge/Vite-3.0.7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
- **Database**: [![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/) with [![SQLC](https://img.shields.io/badge/SQLC-latest-4A154B)](https://sqlc.dev/)
- **Testing**: [![Go Test](https://img.shields.io/badge/Go%20Test-builtin-00ADD8?logo=go&logoColor=white)](https://golang.org/pkg/testing/) + [![Vitest](https://img.shields.io/badge/Vitest-3.2.4-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
- **Styling**: [![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.6-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/) + [![React Bootstrap](https://img.shields.io/badge/React%20Bootstrap-2.10.10-61DAFB?logo=react&logoColor=black)](https://react-bootstrap.github.io/)

### Key Features

- **Data Synchronization**: Fetch and sync UX testing data from remote sources
- **Project Management**: Organize and manage multiple UX testing projects
- **Data Analysis**: Comprehensive analysis of user interaction patterns
- **Outlier Detection**: Identify unusual patterns in user behavior
- **Data Visualization**: Interactive charts and tables for data exploration
- **Export Capabilities**: Export analysis results in various formats

## Development

### Prerequisites

- [![Go](https://img.shields.io/badge/Go-1.25.1+-00ADD8?logo=go&logoColor=white)](https://golang.org/dl/)
- [![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/) and [![npm](https://img.shields.io/badge/npm-latest-CB3837?logo=npm&logoColor=white)](https://www.npmjs.com/)
- [![Wails CLI](https://img.shields.io/badge/Wails%20CLI-v2-FF6B6B?logo=wails&logoColor=white)](https://wails.io/docs/gettingstarted/installation) (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)
- [![golangci-lint](https://img.shields.io/badge/golangci--lint-v2.1.6+-4B8BBE)](https://golangci-lint.run/) (`go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@v2.1.6`)
- [![SQLC](https://img.shields.io/badge/SQLC-latest-4A154B)](https://sqlc.dev/) (`go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`)

### Quick Start

```bash
# Install dependencies
make deps

# Run in development mode
wails dev
```

### Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on <http://localhost:34115>. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

### Production Build

```bash
# Build redistributable package
wails build

# Build with make
make build
```

## Project Structure

```text
web4ux/
├── internal/             # Internal Go packages
│   ├── config/           # Configuration management
│   ├── container/        # Dependency injection
│   └── service/          # Business logic services
│       ├── analyzer/     # Data analysis services
│       └── fetcher/      # Data fetching services
├── pkg/                  # Public Go packages (Wails API)
├── repository/           # Data access layer
│   ├── queries/          # SQL queries
│   └── sqlc/             # Generated SQLC code
├── src/                  # Go utilities
│   ├── common/           # Common utilities
│   ├── htmlparser/       # HTML parsing utilities
│   └── request/          # HTTP request utilities
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── utils/        # Frontend utilities
│   └── coverage/         # Test coverage reports
├── mocks/                # Generated mocks
└── scripts/              # Build and utility scripts
```

## Database

The application uses SQLite with SQLC for type-safe database operations:

- **Schema**: `repository/schema.sql`
- **Queries**: `repository/queries/`
- **Generated Code**: `repository/sqlc/`

To regenerate database code after schema changes:

```bash
cd repository && sqlc generate
```

## Testing

### Running Tests

```bash
# Backend tests with coverage
make test-coverage

# Frontend tests with coverage
make test-frontend-coverage

# Watch mode for frontend tests
make test-frontend-watch
```

## Architecture

The application follows a clean architecture pattern:

- **Presentation Layer**: React frontend + Wails API (pkg/)
- **Business Logic**: Service layer (internal/service/)
- **Data Access**: Repository pattern with SQLC
- **Infrastructure**: Configuration, logging, HTTP clients

### Key Design Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Dependency Injection**: Configurable dependencies
- **Strategy Pattern**: Pluggable data processing
- **Observer Pattern**: Progress reporting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
