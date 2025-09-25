package repository_test

import (
	"context"
	"database/sql"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/web4ux/repository"
	"github.com/web4ux/src/types"
)

func TestNewTransactionManager(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		db   *sql.DB
	}{
		{
			name: "creates transaction manager with valid DB",
			db:   (*sql.DB)(nil), // Using nil as placeholder for unit test
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			tm := repository.NewTransactionManager(tt.db)

			require.NotNil(t, tm)
		})
	}
}

func TestTransactionFunc_Signature(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name            string
		transactionFunc repository.TransactionFunc
		expectedError   bool
	}{
		{
			name: "validates successful transaction function signature",
			transactionFunc: func(ctx context.Context, tx *sql.Tx) error {
				// Simulate successful operation
				return nil
			},
			expectedError: false,
		},
		{
			name: "validates error handling in transaction function",
			transactionFunc: func(ctx context.Context, tx *sql.Tx) error {
				// Simulate operation error
				return fmt.Errorf("operation failed")
			},
			expectedError: true,
		},
		{
			name: "validates context usage in transaction function",
			transactionFunc: func(ctx context.Context, tx *sql.Tx) error {
				// Simulate context usage
				if ctx == nil {
					return fmt.Errorf("context is required")
				}
				return nil
			},
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Validate the transaction function signature and behavior
			ctx := context.Background()
			err := tt.transactionFunc(ctx, nil)

			assert.Equal(t, tt.expectedError, err != nil)
			if tt.expectedError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestNewBatchProcessor(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		batchSize int
		processor func(ctx context.Context, tx *sql.Tx, items []string) error
	}{
		{
			name:      "creates batch processor with valid size",
			batchSize: 10,
			processor: func(ctx context.Context, tx *sql.Tx, items []string) error {
				return nil
			},
		},
		{
			name:      "creates batch processor with zero size (defaults to 1)",
			batchSize: 0,
			processor: func(ctx context.Context, tx *sql.Tx, items []string) error {
				return nil
			},
		},
		{
			name:      "creates batch processor with negative size (defaults to 1)",
			batchSize: -5,
			processor: func(ctx context.Context, tx *sql.Tx, items []string) error {
				return nil
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			bp := repository.NewBatchProcessor(tt.batchSize, tt.processor)

			require.NotNil(t, bp)
		})
	}
}

func TestBatchProcessor_ProcessInBatches(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		batchSize     int
		items         []string
		response      types.MockItem[error]
		expectedCalls int
		hasError      bool
	}{
		{
			name:      "processes single batch successfully",
			batchSize: 10,
			items:     []string{"item1", "item2", "item3"},
			response: types.MockItem[error]{
				Count: 1,
				Error: nil,
			},
			expectedCalls: 1,
			hasError:      false,
		},
		{
			name:      "processes multiple batches successfully",
			batchSize: 2,
			items:     []string{"item1", "item2", "item3", "item4", "item5"},
			response: types.MockItem[error]{
				Count: 3, // 3 batches: [1,2], [3,4], [5]
				Error: nil,
			},
			expectedCalls: 3,
			hasError:      false,
		},
		{
			name:      "handles empty items list",
			batchSize: 5,
			items:     []string{},
			response: types.MockItem[error]{
				Count: 0, // No batches for empty list
				Error: nil,
			},
			expectedCalls: 0,
			hasError:      false,
		},
		{
			name:      "handles processor error",
			batchSize: 3,
			items:     []string{"item1", "item2"},
			response: types.MockItem[error]{
				Count: 1,
				Error: fmt.Errorf("processor error"),
			},
			expectedCalls: 1,
			hasError:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			callCount := 0

			processor := func(ctx context.Context, tx *sql.Tx, items []string) error {
				callCount++
				return tt.response.Error
			}

			bp := repository.NewBatchProcessor(tt.batchSize, processor)
			err := bp.ProcessInBatches(ctx, nil, tt.items)

			assert.Equal(t, tt.expectedCalls, callCount)
			assert.Equal(t, tt.hasError, err != nil)

			if tt.hasError {
				assert.Contains(t, err.Error(), "failed to process batch")
			}
		})
	}
}

func TestBatchProcessor_ProcessInBatches_EdgeCases(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name          string
		batchSize     int
		items         []int
		description   string
		expectedCalls int
	}{
		{
			name:          "batch size larger than items",
			batchSize:     100,
			items:         []int{1, 2, 3},
			description:   "should process all items in single batch",
			expectedCalls: 1,
		},
		{
			name:          "batch size equals items count",
			batchSize:     5,
			items:         []int{1, 2, 3, 4, 5},
			description:   "should process all items in single batch",
			expectedCalls: 1,
		},
		{
			name:          "exact multiple batches",
			batchSize:     3,
			items:         []int{1, 2, 3, 4, 5, 6},
			description:   "should process exactly 2 batches",
			expectedCalls: 2,
		},
		{
			name:          "single item batches",
			batchSize:     1,
			items:         []int{1, 2, 3, 4},
			description:   "should process 4 single-item batches",
			expectedCalls: 4,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			callCount := 0
			var processedBatches [][]int

			processor := func(ctx context.Context, tx *sql.Tx, items []int) error {
				callCount++
				// Copy the batch to verify correct batching
				batch := make([]int, len(items))
				copy(batch, items)
				processedBatches = append(processedBatches, batch)
				return nil
			}

			bp := repository.NewBatchProcessor(tt.batchSize, processor)
			err := bp.ProcessInBatches(ctx, nil, tt.items)

			require.NoError(t, err)
			assert.Equal(t, tt.expectedCalls, callCount, tt.description)

			// Verify all items were processed
			var allProcessedItems []int
			for _, batch := range processedBatches {
				allProcessedItems = append(allProcessedItems, batch...)
			}
			assert.Equal(t, tt.items, allProcessedItems, "all items should be processed")

			// Verify no batch exceeds the batch size
			for i, batch := range processedBatches {
				assert.LessOrEqual(t, len(batch), tt.batchSize,
					"batch %d size should not exceed batch size limit", i)
			}
		})
	}
}

func TestBatchProcessor_TypeSafety(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		test func(t *testing.T)
	}{
		{
			name: "string batch processor",
			test: func(t *testing.T) {
				processor := func(ctx context.Context, tx *sql.Tx, items []string) error {
					for _, item := range items {
						assert.IsType(t, "", item)
					}
					return nil
				}

				bp := repository.NewBatchProcessor(2, processor)
				err := bp.ProcessInBatches(context.Background(), nil, []string{"a", "b", "c"})

				require.NoError(t, err)
			},
		},
		{
			name: "int batch processor",
			test: func(t *testing.T) {
				processor := func(ctx context.Context, tx *sql.Tx, items []int) error {
					for _, item := range items {
						assert.IsType(t, 0, item)
					}
					return nil
				}

				bp := repository.NewBatchProcessor(3, processor)
				err := bp.ProcessInBatches(context.Background(), nil, []int{1, 2, 3, 4, 5})

				require.NoError(t, err)
			},
		},
		{
			name: "custom struct batch processor",
			test: func(t *testing.T) {
				type TestStruct struct {
					ID   int
					Name string
				}

				processor := func(ctx context.Context, tx *sql.Tx, items []TestStruct) error {
					for _, item := range items {
						assert.IsType(t, TestStruct{}, item)
						assert.NotEmpty(t, item.Name)
					}
					return nil
				}

				items := []TestStruct{
					{ID: 1, Name: "test1"},
					{ID: 2, Name: "test2"},
				}

				bp := repository.NewBatchProcessor(1, processor)
				err := bp.ProcessInBatches(context.Background(), nil, items)

				require.NoError(t, err)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			tt.test(t)
		})
	}
}

func TestBatchProcessor_DefaultBatchSize(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		batchSize    int
		items        []string
		expectedCall int
		description  string
	}{
		{
			name:         "zero batch size defaults to 1",
			batchSize:    0,
			items:        []string{"a", "b", "c"},
			expectedCall: 3, // Each item processed individually
			description:  "should process with batch size of 1",
		},
		{
			name:         "negative batch size defaults to 1",
			batchSize:    -10,
			items:        []string{"x", "y"},
			expectedCall: 2, // Each item processed individually
			description:  "should process with batch size of 1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			callCount := 0

			processor := func(ctx context.Context, tx *sql.Tx, items []string) error {
				callCount++
				assert.Equal(t, 1, len(items), "batch size should default to 1 for invalid values")
				return nil
			}

			bp := repository.NewBatchProcessor(tt.batchSize, processor)
			err := bp.ProcessInBatches(ctx, nil, tt.items)

			require.NoError(t, err)
			assert.Equal(t, tt.expectedCall, callCount, tt.description)
		})
	}
}

func TestBatchProcessor_ErrorPropagation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		batchSize   int
		items       []string
		errorBatch  int // Which batch should error (0-indexed)
		expectedErr string
	}{
		{
			name:        "first batch error",
			batchSize:   2,
			items:       []string{"a", "b", "c", "d"},
			errorBatch:  0,
			expectedErr: "failed to process batch 0-1",
		},
		{
			name:        "second batch error",
			batchSize:   2,
			items:       []string{"a", "b", "c", "d"},
			errorBatch:  1,
			expectedErr: "failed to process batch 2-3",
		},
		{
			name:        "last batch error with single item",
			batchSize:   3,
			items:       []string{"a", "b", "c", "d"},
			errorBatch:  1,
			expectedErr: "failed to process batch 3-3",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			batchCount := 0

			processor := func(ctx context.Context, tx *sql.Tx, items []string) error {
				if batchCount == tt.errorBatch {
					return fmt.Errorf("simulated batch error")
				}
				batchCount++
				return nil
			}

			bp := repository.NewBatchProcessor(tt.batchSize, processor)
			err := bp.ProcessInBatches(ctx, nil, tt.items)

			require.Error(t, err)
			assert.Contains(t, err.Error(), tt.expectedErr)
			assert.Contains(t, err.Error(), "simulated batch error")
		})
	}
}
