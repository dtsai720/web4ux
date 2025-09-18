package analyzer

import (
	"context"

	"github.com/web4ux/repository/sqlc"
	"github.com/web4ux/src/logger"
)

// DeleteOrRestore implements IService.
func (s *Service) DeleteOrRestore(ctx context.Context, log logger.ILogger, informationID string, deleted bool) error {
	return s.db.SoftDeleteWinfittsInformation(ctx, log, sqlc.SoftDeleteWinfittsInformationParams{
		Deleted:       deleted,
		InformationID: informationID,
	})
}
