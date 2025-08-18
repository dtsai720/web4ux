#!/bin/bash

# Local CI Test Script
# Mimics GitHub Actions CI steps locally

set -e

echo "=== Web4UX CI Pipeline (Local Test) ==="

echo ""
echo "🔧 Go Backend - Tests & Linting"
echo "================================"

# Create fake frontend dist for go:embed (same as CI)
echo "📁 Creating fake frontend/dist directory..."
mkdir -p frontend/dist
echo '{}' > frontend/dist/index.html

# Test Go dependencies
echo "📦 Installing Go dependencies..."
go mod download

# Test Go linting
echo "🔍 Running Go linting..."
make lint

# Test Go tests
echo "🧪 Running Go tests with race detection..."
make test

echo ""
echo "⚛️  React Frontend - Tests & Linting"
echo "==================================="

# Test frontend dependencies
echo "📦 Installing React dependencies..."
cd frontend && npm ci && cd ..

# Test frontend linting
echo "🔍 Running ESLint (TypeScript/React)..."
make lint-frontend

# Test frontend tests
echo "🧪 Running Vitest unit tests..."
make test-frontend

echo ""
echo "✅ All CI checks completed successfully!"
echo "   This matches the GitHub Actions pipeline behavior."
