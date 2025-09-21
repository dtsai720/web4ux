#!/bin/bash

# Script to generate mock files using mockgen
# Usage: ./scripts/genmock.sh

set -e

SOURCE=(
    "github.com/web4ux/internal/service/analyzer:IService"
    "github.com/web4ux/internal/service/fetcher:IService"
    "github.com/web4ux/src/common:Doer"
    "github.com/web4ux/src/request:IClient"
    "github.com/web4ux/repository:ListProject"
    "github.com/web4ux/repository:Command"
    "github.com/web4ux/repository:Queries"
    "github.com/web4ux/repository:IDatabase"
    "github.com/web4ux/repository:CommandRepository"
    "github.com/web4ux/repository:QueryRepository"
    "github.com/web4ux/repository:IRepository"
    "github.com/web4ux/pkg:ISyncManager"
    "github.com/web4ux/pkg:IProgressReporter"
    "github.com/web4ux/pkg:IProjectFilter"
)

# Create mocks directory if it doesn't exist
MOCK_DIR="mocks"
mkdir -p "$MOCK_DIR"

echo "Generating mocks from SOURCE array..."

for entry in "${SOURCE[@]}"; do
    # Split package and interface
    IFS=':' read -r PACKAGE INTERFACE <<< "$entry"

    # Extract local path by removing github.com/web4ux/ prefix
    LOCAL_PATH=${PACKAGE#github.com/web4ux/}

    # Replace / with _ for folder name
    FOLDER_NAME=${LOCAL_PATH//\//_}

    # Create subfolder in mocks
    OUTPUT_DIR="$MOCK_DIR/$FOLDER_NAME"
    mkdir -p "$OUTPUT_DIR"

    # Output file path
    OUTPUT_FILE="$OUTPUT_DIR/mock.go"

    echo "Generating mock for interface '$INTERFACE' from package '$PACKAGE'..."
    echo "Output file: $OUTPUT_FILE"

    # Generate mock using mockgen with -source flag for local files
    if go run go.uber.org/mock/mockgen -source="$LOCAL_PATH"/interface.go -destination="$OUTPUT_FILE" -package="mock_$FOLDER_NAME" "$INTERFACE"; then
        echo "✅ Mock generated successfully: $OUTPUT_FILE"
    else
        echo "❌ Failed to generate mock for $PACKAGE:$INTERFACE"
        exit 1
    fi

    echo ""
done

echo "🎉 All mocks generated successfully!"
