package application

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"testing"
	"time"

	"github.com/hanif-adedotun/ecommerce-golang/db"
)

func TestAppStart(t *testing.T) {
	// Arrange
	ctx, cancel := context.WithCancel(context.Background())
	defercancel := func() { cancel() }
	defer defercancel

	// Create a new App instance
	app := New()

	// Act
	go func() {
		// Simulate a request to the server
		http.Get("http://localhost:8080")
	}()

	// Assert
	if err := app.Start(ctx); err != nil {
		t.Errorf("App.Start() returned error: %v", err)
	}
}
