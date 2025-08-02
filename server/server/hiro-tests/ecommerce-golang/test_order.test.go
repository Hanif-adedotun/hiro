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
	o := &Order{Repo: &db.PostgreRepo{}}
	w := httptest.NewRecorder()
	r := httptest.NewRequest("POST", "/", nil)
	body := struct {
		CustomerID uuid.UUID `json:"customer_id"`
		LineItems []model.LineItem `json:"lineitems"`
	}{}
	body.CustomerID = uuid.New()
	body.LineItems = []model.LineItem{{}}
	jsonBody, _ := json.Marshal(body)
	r.Body = nil
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Content-Length", fmt.Sprintf("%d", len(jsonBody)))
	r.Body = ioutil.NopCloser(bytes.NewBuffer(jsonBody))

	// Act
	o.Create(w, r)

	// Assert
	if w.Code != http.StatusCreated {
		t.Errorf("Expected status code %d but got %d", http.StatusCreated, w.Code)
	}
}
