package db

import (
	"database/sql"
	"errors"
	"os"
	"testing"
)

func TestConnectDB(t *testing.T) {
	// Mock environment variables
	os.Setenv("DB_USER", "testuser")
	os.Setenv("DB_PASS", "testpass")
	os.Setenv("INSTANCE_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_NAME", "testdb")

	// Call the function to test
	_, err := ConnectDB()
	if err != nil {
		t.Errorf("ConnectDB() error = %v", err)
	}
}

func TestConnectDBInvalidEnv(t *testing.T) {
	// Mock environment variables
	os.Setenv("DB_USER", "")

	// Call the function to test
	_, err := ConnectDB()
	if err == nil {
		t.Errorf("ConnectDB() expected error, got nil")
	}
}

func TestConnectDBInvalidDBURI(t *testing.T) {
	// Mock environment variables
	os.Setenv("DB_USER", "testuser")
	os.Setenv("DB_PASS", "testpass")
	os.Setenv("INSTANCE_HOST", "localhost")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_NAME", "invalid db name //")

	// Call the function to test
	_, err := ConnectDB()
	if err == nil {
		t.Errorf("ConnectDB() expected error, got nil")
	}
}