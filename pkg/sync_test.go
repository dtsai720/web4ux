package pkg_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/web4ux/pkg"
)

func TestSyncProgress_Struct(t *testing.T) {
	progress := pkg.SyncProgress{
		CurrentProject: "test-project",
		CurrentIndex:   5,
		Progress:       50,
		TotalProjects:  10,
		IsCompleted:    false,
		IsCancelled:    false,
	}

	assert.Equal(t, "test-project", progress.CurrentProject)
	assert.Equal(t, 5, progress.CurrentIndex)
	assert.Equal(t, 50, progress.Progress)
	assert.Equal(t, 10, progress.TotalProjects)
	assert.False(t, progress.IsCompleted)
	assert.False(t, progress.IsCancelled)
}

func TestLoginResponse_Struct(t *testing.T) {
	response := pkg.LoginResponse{
		Success: true,
		Message: "Login successful",
	}

	assert.True(t, response.Success)
	assert.Equal(t, "Login successful", response.Message)
}
