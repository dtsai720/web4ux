package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/web4ux/src/logger"
)

type TransactionManager struct {
	db *sql.DB
}

func NewTransactionManager(db *sql.DB) *TransactionManager {
	return &TransactionManager{db: db}
}

type TransactionFunc func(ctx context.Context, tx *sql.Tx) error

func (tm *TransactionManager) ExecuteInTransaction(ctx context.Context, log logger.ILogger, fn TransactionFunc) error {
	tx, err := tm.db.BeginTx(ctx, nil)
	if err != nil {
		log.Error("failed to begin transaction", err)
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer func() {
		if r := recover(); r != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				log.Error("failed to rollback after panic", rollbackErr)
			}
			panic(r)
		}
	}()

	if err := fn(ctx, tx); err != nil {
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			log.Error("failed to rollback transaction", rollbackErr)
			return fmt.Errorf("transaction failed: %w; rollback failed: %v", err, rollbackErr)
		}
		return fmt.Errorf("transaction failed: %w", err)
	}

	if err := tx.Commit(); err != nil {
		log.Error("failed to commit transaction", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

type BatchProcessor[T any] struct {
	batchSize int
	processor func(ctx context.Context, tx *sql.Tx, items []T) error
}

func NewBatchProcessor[T any](batchSize int, processor func(ctx context.Context, tx *sql.Tx, items []T) error) *BatchProcessor[T] {
	return &BatchProcessor[T]{
		batchSize: batchSize,
		processor: processor,
	}
}

func (bp *BatchProcessor[T]) ProcessInBatches(ctx context.Context, tx *sql.Tx, items []T) error {
	for i := 0; i < len(items); i += bp.batchSize {
		end := min(i+bp.batchSize, len(items))

		batch := items[i:end]
		if err := bp.processor(ctx, tx, batch); err != nil {
			return fmt.Errorf("failed to process batch %d-%d: %w", i, end-1, err)
		}
	}
	return nil
}
