package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestConnectDB(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Test ConnectDB function
	_, err := ConnectDB()
	if err != nil {
		t.Errorf("ConnectDB() error = %v", err)
	}
}

func TestConnectDBNoEnvVariables(t *testing.T) {
	// Save current environment variables
	oldEnv := os.Environ()
	// Unset required environment variables
	os.Unsetenv("DB_USER")
	os.Unsetenv("DB_PASS")
	os.Unsetenv("INSTANCE_HOST")
	os.Unsetenv("DB_PORT")
	os.Unsetenv("DB_NAME")

	// Test ConnectDB function without required environment variables
	defer func() {
		// Restore old environment variables
		for _, env := range oldEnv {
			params := strings.SplitN(env, "=", 2)
			if len(params) == 2 {
				os.Setenv(params[0], params[1])
			}
		}
	}()
	_, err := ConnectDB()
	if err == nil {
		t.Errorf("ConnectDB() should return error when required environment variables are not set")
	}
}
