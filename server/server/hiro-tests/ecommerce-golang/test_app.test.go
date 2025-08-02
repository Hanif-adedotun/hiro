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
	app := New()
	
	// Act
	go func() {
		app.Start(ctx)
	}()
	
	// Assert
	time.Sleep(100 * time.Millisecond)
	if app.db == nil {
		t.Errorf("App database is nil")
	}
	cancel()
}

func TestAppStart_ServerShutdown(t *testing.T) {
	// Arrange
	ctx, cancel := context.WithCancel(context.Background())
	app := New()
	
	// Act
	go func() {
		app.Start(ctx)
	}()
	
	// Assert
	time.Sleep(100 * time.Millisecond)
	cancel()
	if app.db != nil {
		t.Errorf("App database is not closed")
	}
}
