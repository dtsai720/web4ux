package fetcher

// ProcessResult represents the result of processing a project
type ProcessResult struct {
	Status ProcessStatus
	Error  error
	Reason string
}

// ProcessStatus indicates the outcome of project processing
type ProcessStatus int

const (
	// ProcessStatusSuccess indicates the project was processed successfully
	ProcessStatusSuccess ProcessStatus = iota
	// ProcessStatusSkipped indicates the project was intentionally skipped
	ProcessStatusSkipped
	// ProcessStatusError indicates an error occurred during processing
	ProcessStatusError
)

// NewSuccessResult creates a successful process result
func NewSuccessResult() *ProcessResult {
	return &ProcessResult{
		Status: ProcessStatusSuccess,
	}
}

// NewSkippedResult creates a skipped process result with reason
func NewSkippedResult(reason string) *ProcessResult {
	return &ProcessResult{
		Status: ProcessStatusSkipped,
		Reason: reason,
	}
}

// NewErrorResult creates an error process result
func NewErrorResult(err error) *ProcessResult {
	return &ProcessResult{
		Status: ProcessStatusError,
		Error:  err,
	}
}

// IsSuccess returns true if the processing was successful
func (r *ProcessResult) IsSuccess() bool {
	return r.Status == ProcessStatusSuccess
}

// IsSkipped returns true if the processing was skipped
func (r *ProcessResult) IsSkipped() bool {
	return r.Status == ProcessStatusSkipped
}

// IsError returns true if an error occurred
func (r *ProcessResult) IsError() bool {
	return r.Status == ProcessStatusError
}
