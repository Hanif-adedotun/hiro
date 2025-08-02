package handler

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/hanif-adedotun/ecommerce-golang/db"
	"github.com/hanif-adedotun/ecommerce-golang/model"
)

func TestOrderCreate(t *testing.T) {
	// Arrange
	s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		o := &Order{Repo: &db.PostgreRepo{}}
		o.Create(w, r)
	}))
	defer s.Close()

	body := `{"customer_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "lineitems": []}`
	req, err := http.NewRequest("POST", s.URL, strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Act
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	// Assert
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("expected status code %d but got %d", http.StatusCreated, resp.StatusCode)
	}
}

func TestOrderCreateError(t *testing.T) {
	// Arrange
	s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		o := &Order{Repo: &db.PostgreRepo{}}
		o.Create(w, r)
	}))
	defer s.Close()

	body := `{"customer_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"}`
	req, err := http.NewRequest("POST", s.URL, strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Act
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	// Assert
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected status code %d but got %d", http.StatusBadRequest, resp.StatusCode)
	}
}

func TestOrderCreateRepoError(t *testing.T) {
	// Arrange
	s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		o := &Order{Repo: &db.PostgreRepo{}}
		o.Create(w, r)
	}))
	defer s.Close()

	body := `{"customer_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "lineitems": []}`
	req, err := http.NewRequest("POST", s.URL, strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Act
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	// Assert
	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("expected status code %d but got %d", http.StatusInternalServerError, resp.StatusCode)
	}
}