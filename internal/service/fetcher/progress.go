package fetcher

import (
	"context"

	"github.com/web4ux/src/htmlparser"
	"github.com/web4ux/src/logger"
)

type ProgressEvent struct {
	Type        string
	Message     string
	Current     int
	Total       int
	ProjectName string
	Error       error
}

type ProgressObserver interface {
	OnProgress(event ProgressEvent)
}

type ProgressNotifier struct {
	observers []ProgressObserver
}

func NewProgressNotifier() *ProgressNotifier {
	return &ProgressNotifier{
		observers: make([]ProgressObserver, 0),
	}
}

func (pn *ProgressNotifier) AddObserver(observer ProgressObserver) {
	pn.observers = append(pn.observers, observer)
}

func (pn *ProgressNotifier) RemoveObserver(observer ProgressObserver) {
	for i, obs := range pn.observers {
		if obs == observer {
			pn.observers = append(pn.observers[:i], pn.observers[i+1:]...)
			break
		}
	}
}

func (pn *ProgressNotifier) NotifyProgress(event ProgressEvent) {
	for _, observer := range pn.observers {
		observer.OnProgress(event)
	}
}

func (pn *ProgressNotifier) NotifyStart(projectName string, total int) {
	pn.NotifyProgress(ProgressEvent{
		Type:        "start",
		Message:     "Starting project processing",
		Current:     0,
		Total:       total,
		ProjectName: projectName,
	})
}

func (pn *ProgressNotifier) NotifyUpdate(projectName string, current, total int, message string) {
	pn.NotifyProgress(ProgressEvent{
		Type:        "update",
		Message:     message,
		Current:     current,
		Total:       total,
		ProjectName: projectName,
	})
}

func (pn *ProgressNotifier) NotifyComplete(projectName string, total int) {
	pn.NotifyProgress(ProgressEvent{
		Type:        "complete",
		Message:     "Project processing completed",
		Current:     total,
		Total:       total,
		ProjectName: projectName,
	})
}

func (pn *ProgressNotifier) NotifyError(projectName string, err error) {
	pn.NotifyProgress(ProgressEvent{
		Type:        "error",
		Message:     "Project processing failed",
		ProjectName: projectName,
		Error:       err,
	})
}

type LoggingProgressObserver struct {
	log logger.ILogger
}

func NewLoggingProgressObserver(log logger.ILogger) *LoggingProgressObserver {
	return &LoggingProgressObserver{log: log}
}

func (lpo *LoggingProgressObserver) OnProgress(event ProgressEvent) {
	switch event.Type {
	case "start":
		lpo.log.Info("Starting project processing", "project", event.ProjectName, "total", event.Total)
	case "update":
		lpo.log.Info("Processing progress",
			"project", event.ProjectName,
			"current", event.Current,
			"total", event.Total,
			"message", event.Message)
	case "complete":
		lpo.log.Info("Project processing completed", "project", event.ProjectName, "total", event.Total)
	case "error":
		lpo.log.Error("Project processing failed", event.Error, "project", event.ProjectName)
	}
}

type ObservableProcessor struct {
	processor ProjectProcessor
	notifier  *ProgressNotifier
}

func NewObservableProcessor(processor ProjectProcessor, notifier *ProgressNotifier) *ObservableProcessor {
	return &ObservableProcessor{
		processor: processor,
		notifier:  notifier,
	}
}

func (op *ObservableProcessor) CanProcess(project htmlparser.ProjectSummary) bool {
	return op.processor.CanProcess(project)
}

func (op *ObservableProcessor) Process(ctx context.Context, log logger.ILogger, project htmlparser.ProjectSummary) error {
	op.notifier.NotifyStart(project.Name, 1)

	err := op.processor.Process(ctx, log, project)
	if err != nil {
		op.notifier.NotifyError(project.Name, err)
		return err
	}

	op.notifier.NotifyComplete(project.Name, 1)
	return nil
}

func (op *ObservableProcessor) Name() string {
	return "Observable_" + op.processor.Name()
}
