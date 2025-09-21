package fetcher

import (
	"context"
	"fmt"
	"time"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
	"go.uber.org/zap"
)

type RetryConfig struct {
	MaxAttempts int
	BaseDelay   time.Duration
	MaxDelay    time.Duration
}

func DefaultRetryConfig() RetryConfig {
	return RetryConfig{
		MaxAttempts: 3,
		BaseDelay:   time.Second,
		MaxDelay:    30 * time.Second,
	}
}

type RetryProcessor struct {
	processor ProjectProcessor
	config    RetryConfig
}

func NewRetryProcessor(processor ProjectProcessor, config RetryConfig) *RetryProcessor {
	return &RetryProcessor{
		processor: processor,
		config:    config,
	}
}

func (rp *RetryProcessor) CanProcess(project htmlparser.ProjectSummary) bool {
	return rp.processor.CanProcess(project)
}

func (rp *RetryProcessor) Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	var lastErr error

	for attempt := 1; attempt <= rp.config.MaxAttempts; attempt++ {
		log.Info("Processing attempt",
			zap.String("processor", rp.processor.Name()),
			zap.String("project", project.Name),
			zap.Int("attempt", attempt),
			zap.Int("max_attempts", rp.config.MaxAttempts))

		err := rp.processor.Process(ctx, log, project)
		if err == nil {
			if attempt > 1 {
				log.Info("Processing succeeded after retry",
					zap.String("project", project.Name),
					zap.Int("attempt", attempt))
			}
			return nil
		}

		lastErr = err
		log.Info("Processing attempt failed",
			zap.String("project", project.Name),
			zap.Int("attempt", attempt),
			zap.Error(err))

		if attempt < rp.config.MaxAttempts {
			delay := rp.calculateDelay(attempt)
			log.Info("Retrying after delay",
				zap.String("project", project.Name),
				zap.Duration("delay", delay))

			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(delay):
			}
		}
	}

	return fmt.Errorf("processing failed after %d attempts: %w", rp.config.MaxAttempts, lastErr)
}

func (rp *RetryProcessor) calculateDelay(attempt int) time.Duration {
	delay := time.Duration(attempt) * rp.config.BaseDelay
	if delay > rp.config.MaxDelay {
		delay = rp.config.MaxDelay
	}
	return delay
}

func (rp *RetryProcessor) Name() string {
	return "Retry_" + rp.processor.Name()
}

type ValidationProcessor struct {
	processor ProjectProcessor
}

func NewValidationProcessor(processor ProjectProcessor) *ValidationProcessor {
	return &ValidationProcessor{processor: processor}
}

func (vp *ValidationProcessor) CanProcess(project htmlparser.ProjectSummary) bool {
	return vp.processor.CanProcess(project)
}

func (vp *ValidationProcessor) Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	if err := vp.validateProject(project); err != nil {
		log.Error("Project validation failed", zap.Error(err), zap.String("project", project.Name))
		return fmt.Errorf("project validation failed: %w", err)
	}

	log.Info("Project validation passed", zap.String("project", project.Name))
	return vp.processor.Process(ctx, log, project)
}

func (vp *ValidationProcessor) validateProject(project htmlparser.ProjectSummary) error {
	if project.ID == "" {
		return fmt.Errorf("project ID is required")
	}
	if project.Name == "" {
		return fmt.Errorf("project name is required")
	}
	if project.Link == "" {
		return fmt.Errorf("project link is required")
	}
	if project.Time.IsZero() {
		return fmt.Errorf("project time is required")
	}
	return nil
}

func (vp *ValidationProcessor) Name() string {
	return "Validation_" + vp.processor.Name()
}

type TimingProcessor struct {
	processor ProjectProcessor
}

func NewTimingProcessor(processor ProjectProcessor) *TimingProcessor {
	return &TimingProcessor{processor: processor}
}

func (tp *TimingProcessor) CanProcess(project htmlparser.ProjectSummary) bool {
	return tp.processor.CanProcess(project)
}

func (tp *TimingProcessor) Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	start := time.Now()

	log.Info("Starting project processing",
		zap.String("processor", tp.processor.Name()),
		zap.String("project", project.Name))

	err := tp.processor.Process(ctx, log, project)

	duration := time.Since(start)
	if err != nil {
		log.Error("Project processing failed",
			zap.String("processor", tp.processor.Name()),
			zap.String("project", project.Name),
			zap.Duration("duration", duration),
			zap.Error(err))
	} else {
		log.Info("Project processing completed",
			zap.String("processor", tp.processor.Name()),
			zap.String("project", project.Name),
			zap.Duration("duration", duration))
	}

	return err
}

func (tp *TimingProcessor) Name() string {
	return "Timing_" + tp.processor.Name()
}

type ProcessorDecorator struct {
	processor ProjectProcessor
}

func NewProcessorDecorator(processor ProjectProcessor) *ProcessorDecorator {
	return &ProcessorDecorator{processor: processor}
}

func (pd *ProcessorDecorator) WithRetry(config RetryConfig) *ProcessorDecorator {
	pd.processor = NewRetryProcessor(pd.processor, config)
	return pd
}

func (pd *ProcessorDecorator) WithValidation() *ProcessorDecorator {
	pd.processor = NewValidationProcessor(pd.processor)
	return pd
}

func (pd *ProcessorDecorator) WithTiming() *ProcessorDecorator {
	pd.processor = NewTimingProcessor(pd.processor)
	return pd
}

func (pd *ProcessorDecorator) WithProgress(notifier *ProgressNotifier) *ProcessorDecorator {
	pd.processor = NewObservableProcessor(pd.processor, notifier)
	return pd
}

func (pd *ProcessorDecorator) Build() ProjectProcessor {
	return pd.processor
}
