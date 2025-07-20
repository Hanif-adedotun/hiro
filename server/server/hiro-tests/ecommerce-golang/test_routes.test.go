package application

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/hanif-adedotun/ecommerce-golang/db"
	"github.com/hanif-adedotun/ecommerce-golang/handler"
)

func TestLoadRoutes(t *testing.T) {
	app := &App{db: nil}
	app.loadRoutes()

	// Test root route
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	w := httptest.NewRecorder()
	app.router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status code %d, got %d", http.StatusOK, w.Code)
	}
}

func TestLoadOrderRoute(t *testing.T) {
	app := &App{db: nil}
	router := chi.NewRouter()

	app.loadOrderRoute(router)

	// Test order routes
	tests := []struct {
		route  string
		method string
		status int
	}{{
		route:  "/orders",
		method: "POST",
		status: http.StatusCreated,
	}, {
		route:  "/orders",
		method: "GET",
		status: http.StatusOK,
	}, {
		route:  "/orders/1",
		method: "GET",
		status: http.StatusOK,
	}, {
		route:  "/orders/1",
		method: "PUT",
		status: http.StatusOK,
	}, {
		route:  "/orders/1",
		method: "DELETE",
		status: http.StatusNoContent,
	}}

	for _, test := range tests {
		req, err := http.NewRequest(test.method, test.route, nil)
		if err != nil {
			t.Fatal(err)
		}

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != test.status {
			t.Errorf("expected status code %d, got %d", test.status, w.Code)
		}
	}
}