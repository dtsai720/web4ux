package fetcher_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/internal/service/fetcher"
	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

func TestProjectProcessorRegistry(t *testing.T) {
	t.Parallel()

	t.Run("Registry manages processors correctly", func(t *testing.T) {
		t.Parallel()

		registry := fetcher.NewProjectProcessorRegistry()

		// Test empty registry
		assert.Len(t, registry.GetProcessors(), 0)

		// Add processors
		skipProcessor := fetcher.NewSkipProcessor()
		registry.Register(skipProcessor)

		assert.Len(t, registry.GetProcessors(), 1)
		assert.Equal(t, "SkipProcessor", registry.GetProcessors()[0].Name())
	})

	t.Run("FindProcessor returns correct processor", func(t *testing.T) {
		t.Parallel()

		registry := fetcher.NewProjectProcessorRegistry()
		skipProcessor := fetcher.NewSkipProcessor()
		registry.Register(skipProcessor)

		// Test non-winfitts project
		regularProject := htmlparser.ProjectSummary{
			ID:   "test-1",
			Name: "Regular Project",
			Link: "/project/regular",
		}

		processor := registry.FindProcessor(regularProject)
		assert.NotNil(t, processor)
		assert.Equal(t, "SkipProcessor", processor.Name())

		// Test winfitts project (should return nil since no winfitts processor registered)
		winfittsProject := htmlparser.ProjectSummary{
			ID:   "test-2",
			Name: "Winfitts Project",
			Link: "/project/winfitts/123",
		}

		processor = registry.FindProcessor(winfittsProject)
		assert.Nil(t, processor)
	})
}

func TestSkipProcessor(t *testing.T) {
	t.Parallel()

	processor := fetcher.NewSkipProcessor()

	t.Run("CanProcess identifies non-winfitts projects", func(t *testing.T) {
		t.Parallel()

		regularProject := htmlparser.ProjectSummary{
			Link: "/project/regular",
		}
		assert.True(t, processor.CanProcess(regularProject))

		winfittsProject := htmlparser.ProjectSummary{
			Link: "/project/winfitts/123",
		}
		assert.False(t, processor.CanProcess(winfittsProject))
	})

	t.Run("Process handles non-winfitts projects successfully", func(t *testing.T) {
		t.Parallel()

		ctx := context.Background()
		log := logger.NewTestLogger()

		project := htmlparser.ProjectSummary{
			ID:   "test-1",
			Name: "Regular Project",
			Link: "/project/regular",
		}

		err := processor.Process(ctx, log, project)
		assert.NoError(t, err, "SkipProcessor should successfully handle (skip) non-winfitts projects")
	})

	t.Run("Name returns correct processor name", func(t *testing.T) {
		t.Parallel()

		assert.Equal(t, "SkipProcessor", processor.Name())
	})
}
