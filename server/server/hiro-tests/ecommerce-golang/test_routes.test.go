package application

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func TestLoadRoutes(t *testing.T) {
	app := &App{}
	app.loadRoutes()
	if app.router == nil {
		t.Errorf("loadRoutes() router is nil")
	}
}

func TestLoadOrderRoute(t *testing.T) {
	app := &App{db: &sql.DB{}}
	router := chi.NewRouter()
	app.loadOrderRoute(router)
	if router == nil {
		t.Errorf("loadOrderRoute() router is nil")
	}
}
