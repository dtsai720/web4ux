package analyzer

import (
	"context"

	"github.com/web4ux/models"
	"github.com/web4ux/src/logger"
)

// IService defines the core business operations for project analysis.
// All methods require a context for cancellation and a logger for tracing.
// This service handles project summary retrieval, detailed project information,
// and soft delete/restore operations for project data.
type IService interface {
	// ListSummaries retrieves project summaries based on the given criteria.
	// It applies filtering, sorting, and pagination according to the request parameters.
	// Returns a paginated list of project summaries or an error if the operation fails.
	ListSummaries(ctx context.Context, log logger.ILogger, req models.ListSummariesRequest) (models.ProjectSummaries, error)

	// GetProjectDetailByID retrieves detailed information for a specific project.
	// The projectID must be a valid project identifier.
	// Returns a slice of project details including device, participant, and test data,
	// or an error if the project is not found or access fails.
	GetProjectDetailByID(ctx context.Context, log logger.ILogger, projectID string) ([]models.ProjectDetail, error)

	// DeleteOrRestore performs soft delete or restore operations on project information.
	// The informationID identifies the specific information record to modify.
	// When deleted is true, the record is soft-deleted; when false, it's restored.
	// Returns an error if the operation fails or the record is not found.
	DeleteOrRestore(ctx context.Context, log logger.ILogger, informationID string, deleted bool) error
}
