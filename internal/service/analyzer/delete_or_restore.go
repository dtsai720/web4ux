package analyzer

import (
	"context"

	"github.com/web4ux/repository/sqlc"
)

// DeleteOrRestore implements IService.
func (s *Service) DeleteOrRestore(ctx context.Context, informationID string, deleted bool) error {
	return s.db.DeleteOrRestoreWinfittsInformation(ctx, sqlc.DeleteWinfittsInformationParams{
		Deleted:       deleted,
		InformationID: informationID,
	})
}
