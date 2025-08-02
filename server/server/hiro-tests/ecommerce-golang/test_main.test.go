package main

import (
	"context"
	"os"
	"os/signal"
	"testing"

	"github.com/hanif-adedotun/ecommerce-golang/application"
)

func TestMainFunction(t *testing.T) {
	// Arrange
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()
	app := application.New()

	// Act
	err := app.Start(ctx)

	// Assert
	if err != nil {
		t.Errorf("Failed to start app: %v", err)
	}
}