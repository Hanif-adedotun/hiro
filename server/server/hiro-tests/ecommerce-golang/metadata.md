To run these tests:
1. Ensure you have Go installed
2. Run `go test -v` in the terminal
3. The tests will cover the core functionality, edge cases, and error handling of the Order handler

## Required Packages
- testing
- context
- bytes
- encoding/json
- errors
- time
- github.com/google/uuid
- github.com/hanif-adedotun/ecommerce-golang/model
# TestAppStart
## Description: Test the Start function of the App struct.

This test function creates a new App instance and starts the server. It then simulates a request to the server and checks if the Start function returns an error.

## Parameters:
* t: The testing context.

## Returns:
* None


## Required Packages
- net/http
- database/sql
- context
- log
- fmt
- time
- testing
### Testing Load Routes and Order Routes

This test suite covers the core functionality of loading routes and order routes in the application.

## Required Packages
- net/http
- net/http/httptest
- testing
- github.com/go-chi/chi/v5
- github.com/go-chi/chi/v5/middleware
- github.com/hanif-adedotun/ecommerce-golang/db
- github.com/hanif-adedotun/ecommerce-golang/handler
```go
// go test -v db_test.go db.go
```

## Required Packages
- database/sql
- fmt
- log
- os
- testing
- github.com/joho/godotenv
- strings
### Test Case for `PostgreRepo.Insert` Function

This test function checks the `Insert` function of the `PostgreRepo` struct. It sets up a mock database connection and defines an order model. The test then calls the `Insert` function with the order model and checks if the returned ID is correct and if there are any errors. Finally, it checks if all expectations were met.

## Required Packages
- database/sql
- encoding/json
- fmt
- testing
- github.com/DATA-DOG/go-sql-mock
- github.com/hanif-adedotun/ecommerce-golang/model
#### Unit Tests for `app.go` File
The following unit tests are written for the `app.go` file. These tests cover the core functionality of the application, including starting the server, creating a new application instance, and loading routes.
#### Test Functions
1. `TestStartServer`: Verifies that the server can be started successfully and responds with a 200 status code.
2. `TestNew`: Checks that a new application instance is created correctly with a non-nil router and database connection.
3. `TestLoadRoutes`: Ensures that the routes are loaded successfully into the application instance.
#### Test Scenarios
* Start the server and verify its status code
* Create a new application instance and check its properties
* Load routes into the application instance

## Required Packages
- database/sql
- github.com/go-chi/chi/v5
- github.com/go-chi/chi/v5/middleware
- github.com/hanif-adedotun/ecommerce-golang/db
- github.com/hanif-adedotun/ecommerce-golang/handler
- github.com/hanif-adedotun/ecommerce-golang/model
- net/http
- net/http/httptest
- testing
### TestConnectDB
This test case checks if the ConnectDB function can successfully connect to the database.

#### Test Steps:
1. Set environment variables for database connection.
2. Call the ConnectDB function.
3. Check if the function returns an error.


## Required Packages
- github.com/jackc/pgx/v5
- github.com/joho/godotenv
