package application

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httptest"
	"github.com/hanif-adedotun/ecommerce-golang/db"
	"github.com/hanif-adedotun/ecommerce-golang/handler"
)

func TestApp_Start(t *testing.T) {
	// Arrange
	srv, err := http.ListenAndServe(":8080", nil)
	if err != nil {
		t.Errorf("http.ListenAndServe() error = %v", err)
	}
	defer srv.Close()
	ctx := context.Background()
	app := &App{}
	// Mocking db connection
	dbConn, err := sql.Open("pgx", "host=localhost port=5432 user=myuser password=mypass dbname=mydb sslmode=disable")
	if err != nil {
		t.Errorf("sql.Open() error = %v", err)
	}
	app.db = dbConn
	// Act
	err = app.Start(ctx)
	// Assert
	if err != nil {
		t.Errorf("app.Start() error = %v", err)
	}
}

func TestApp_loadRoutes(t *testing.T) {
	// Arrange
	ctx := context.Background()
	app := &App{}
	// Mocking db connection
	dbConn, err := sql.Open("pgx", "host=localhost port=5432 user=myuser password=mypass dbname=mydb sslmode=disable")
	if err != nil {
		t.Errorf("sql.Open() error = %v", err)
	}
	app.db = dbConn
	// Act
	app.loadRoutes()
	// Assert
	if app.router == nil {
		t.Errorf("app.loadRoutes() app.router is nil")
	}
}

func TestApp_loadOrderRoute(t *testing.T) {
	// Arrange
	ctx := context.Background()
	app := &App{}
	// Mocking db connection
	dbConn, err := sql.Open("pgx", "host=localhost port=5432 user=myuser password=mypass dbname=mydb sslmode=disable")
	if err != nil {
		t.Errorf("sql.Open() error = %v", err)
	}
	app.db = dbConn
	r := chi.NewRouter()
	// Act
	app.loadOrderRoute(r)
	// Assert
	if app.router == nil {
		t.Errorf("app.loadOrderRoute() app.router is nil")
	}
}
