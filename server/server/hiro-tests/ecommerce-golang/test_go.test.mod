
	package application

	import (
		"context"
		"database/sql"
		"encoding/json"
		"io/ioutil"
		"log"
		"net/http"
		"net/http/httptest"
		"testing"
		"time"

		"github.com/go-chi/chi/v5"
		"github.com/go-chi/chi/v5/middleware"
		"github.com/hanif-adedotun/ecommerce-golang/db"
		"github.com/hanif-adedotun/ecommerce-golang/handler"
		"github.com/hanif-adedotun/ecommerce-golang/model"
	)

	func TestStartServer(t *testing.T) {
		// Arrange
		ctx := context.Background()
		app := New()
		srv := &http.Server{
			Addr:    ":8081",
			Handler: app.router,
		}
	
db, err := sql.Open("pgx", "host=localhost user=postgres password=password port=5432 database=ecommerce")
		if err != nil {
			log.Fatal(err)
		}
		app.db = db
		// Act
		go func() {
			err := srv.ListenAndServe()
			if err != nil && err != http.ErrServerClosed {
				log.Println(err)
			}
		}()
		// Assert
		time.Sleep(100 * time.Millisecond)
		resp, err := http.Get("http://localhost:8081/")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status code %d, got %d", http.StatusOK, resp.StatusCode)
		}
		// Close the server and database connection
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatal(err)
		}
		if err := app.db.Close(); err != nil {
			log.Println("Failed to close Postgres", err)
		}
	}

	func TestNew(t *testing.T) {
		// Arrange
		// no db connection to test this
		// Act
		app := New()
		// Assert
		if app.router == nil {
			t.Errorf("expected router to not be nil")
		}
		if app.db == nil {
			t.Errorf("expected db to not be nil")
		}
	}

	func TestLoadRoutes(t *testing.T) {
		// Arrange
		app := &App{
			router: chi.NewRouter(),
		}
		// Act
		app.loadRoutes()
		// Assert
		if app.router == nil {
			t.Errorf("expected router to not be nil")
		}
	}
