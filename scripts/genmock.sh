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
    "github.com/web4ux/repository:ProjectSorterByName"
    "github.com/web4ux/repository:ProjectSorterByCreator"
    "github.com/web4ux/repository:ProjectSorterByTime"
    "github.com/web4ux/repository:ProjectSorter"
    "github.com/web4ux/pkg:ISyncManager"
    "github.com/web4ux/pkg:IProgressReporter"
    "github.com/web4ux/pkg:IProjectFilter"
    "github.com/web4ux/internal/service/fetcher:IProjectProcessor"
    "github.com/web4ux/internal/service/fetcher:ProgressObserver"
    "github.com/web4ux/internal/service/fetcher:ProjectTypeDetector"
)

# Create mocks directory if it doesn't exist
MOCK_DIR="mocks"
mkdir -p "$MOCK_DIR"

echo "Generating mocks from SOURCE array..."

# Special handling for repository package - generate all interfaces together
echo "Generating repository mocks..."
mkdir -p "$MOCK_DIR/repository"

# Generate all repository interfaces from interface.go
REPO_INTERFACES_MAIN="ListProject Command Queries IDatabase CommandRepository QueryRepository IRepository"
echo "Generating main repository interfaces: $REPO_INTERFACES_MAIN"
if go run go.uber.org/mock/mockgen -source=repository/interface.go -destination=mocks/repository/mock.go -package=mock_repository $REPO_INTERFACES_MAIN; then
    echo "✅ Main repository mocks generated successfully"
else
    echo "❌ Failed to generate main repository mocks"
    exit 1
fi

# Generate other package mocks
for entry in "${SOURCE[@]}"; do
    # Split package and interface
    IFS=':' read -r PACKAGE INTERFACE <<< "$entry"

    # Skip repository interfaces as they are handled above
    if [[ "$PACKAGE" == "github.com/web4ux/repository" ]]; then
        continue
    fi

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
