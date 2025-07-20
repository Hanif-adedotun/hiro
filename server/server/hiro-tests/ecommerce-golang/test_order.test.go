package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/DATA-DOG/go-sql-mock"
	"github.com/hanif-adedotun/ecommerce-golang/model"
)

func TestPostgreRepo_Insert(t *testing.T) {
	// Setup DB mock
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Setup PostgreRepo
	repo := &PostgreRepo{Client: db}

	// Setup order model
	order := model.Order{
		OrderID:       "order-123",
		CustomerID:   "customer-123",
		CreatedAt:     "2022-01-01T12:00:00Z",
		ShippedAt:     "2022-01-02T12:00:00Z",
		DeliveredAt:  "2022-01-03T12:00:00Z",
		LineItems:     []model.LineItem{{Sku: "sku-123", Quantity: 2}},
	}

	// Setup expectations
	mock.ExpectExec("INSERT INTO orders ").WithArgs(order.OrderID, order.CustomerID, order.CreatedAt, order.DeliveredAt, order.ShippedAt).WillReturnResult(sqlmock.NewResult(1, 1))

	// Call Insert function
	id, err := repo.Insert(context.Background(), order)

	// Assert results
	if err != nil {
		t.Errorf("error = %v", err)
	}
	if id != 1 {
		t.Errorf("id = %v, want %v", id, 1)
	}

	// Check if expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
