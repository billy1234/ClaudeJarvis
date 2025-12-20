package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

type Server struct {
	db *sql.DB
}

type HealthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}

func main() {
	// Get configuration from environment
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	mcpPort := os.Getenv("MCP_PORT")

	if mcpPort == "" {
		mcpPort = "8080"
	}

	// Connect to PostgreSQL
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Successfully connected to PostgreSQL")

	server := &Server{db: db}

	// Setup routes
	http.HandleFunc("/health", server.healthHandler)
	http.HandleFunc("/api/mcp", server.mcpHandler)

	// Start server
	addr := fmt.Sprintf(":%s", mcpPort)
	log.Printf("MCP Server starting on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	dbStatus := "connected"
	if err := s.db.Ping(); err != nil {
		dbStatus = "disconnected"
	}

	response := HealthResponse{
		Status:   "healthy",
		Database: dbStatus,
	}

	json.NewEncoder(w).Encode(response)
}

func (s *Server) mcpHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := map[string]string{
		"message": "MCP Server is running",
		"version": "1.0.0",
	}

	json.NewEncoder(w).Encode(response)
}
