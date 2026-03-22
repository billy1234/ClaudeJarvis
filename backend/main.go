package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"jarvis/mcp-server/models"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Server struct {
	db *sql.DB
}

func main() {
	if _, err := godotenv.Read(); err != nil {
		log.Printf(".env read error: %v", err)
	} else {
		godotenv.Load()
	}

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	mcpPort := os.Getenv("MCP_PORT")
	if mcpPort == "" {
		mcpPort = "8080"
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Successfully connected to PostgreSQL")

	s := &Server{db: db}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/health", s.healthHandler)

	r.Route("/api", func(r chi.Router) {
		// Todos
		r.Get("/todos", s.listTodos)
		r.Post("/todos", s.createTodo)
		r.Patch("/todos/{id}/complete", s.completeTodo)
		r.Delete("/todos/{id}", s.deleteTodo)

		// Reminders
		r.Get("/reminders", s.listReminders)
		r.Post("/reminders", s.createReminder)
		r.Patch("/reminders/{id}/dismiss", s.dismissReminder)
		r.Delete("/reminders/{id}", s.deleteReminder)

		// Shopping
		r.Get("/shopping", s.listShopping)
		r.Post("/shopping", s.createShoppingItem)
		r.Delete("/shopping/{id}", s.deleteShoppingItem)
	})

	addr := fmt.Sprintf(":%s", mcpPort)
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// --- helpers ---

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// --- health ---

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	dbStatus := "connected"
	if err := s.db.Ping(); err != nil {
		dbStatus = "disconnected"
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "healthy", "database": dbStatus})
}

// --- todos ---

func (s *Server) listTodos(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(),
		`SELECT id, user_id, text, completed, priority, due_date, created_at, completed_at
		 FROM todos ORDER BY completed ASC, created_at DESC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to query todos")
		return
	}
	defer rows.Close()

	todos := []models.Todo{}
	for rows.Next() {
		var t models.Todo
		var id string
		err := rows.Scan(&id, &t.UserID, &t.Text, &t.Completed, &t.Priority,
			&t.DueDate, &t.CreatedAt, &t.CompletedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan todo")
			return
		}
		t.ID = id
		todos = append(todos, t)
	}
	writeJSON(w, http.StatusOK, todos)
}

func (s *Server) createTodo(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Text     string  `json:"text"`
		Priority string  `json:"priority"`
		DueDate  *string `json:"due_date,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Text == "" {
		writeError(w, http.StatusBadRequest, "text is required")
		return
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}

	var dueDate *time.Time
	if req.DueDate != nil {
		t, err := time.Parse(time.RFC3339, *req.DueDate)
		if err != nil {
			writeError(w, http.StatusBadRequest, "due_date must be RFC3339")
			return
		}
		dueDate = &t
	}

	var t models.Todo
	var id string
	err := s.db.QueryRowContext(r.Context(),
		`INSERT INTO todos (text, priority, due_date)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, text, completed, priority, due_date, created_at, completed_at`,
		req.Text, req.Priority, dueDate,
	).Scan(&id, &t.UserID, &t.Text, &t.Completed, &t.Priority, &t.DueDate, &t.CreatedAt, &t.CompletedAt)
	if err != nil {
		log.Printf("createTodo error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create todo")
		return
	}
	t.ID = id
	writeJSON(w, http.StatusCreated, t)
}

func (s *Server) completeTodo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var t models.Todo
	var tID string
	err := s.db.QueryRowContext(r.Context(),
		`UPDATE todos
		 SET completed = NOT completed,
		     completed_at = CASE WHEN NOT completed THEN NOW() ELSE NULL END
		 WHERE id = $1
		 RETURNING id, user_id, text, completed, priority, due_date, created_at, completed_at`,
		id,
	).Scan(&tID, &t.UserID, &t.Text, &t.Completed, &t.Priority, &t.DueDate, &t.CreatedAt, &t.CompletedAt)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "todo not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update todo")
		return
	}
	t.ID = tID
	writeJSON(w, http.StatusOK, t)
}

func (s *Server) deleteTodo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	res, err := s.db.ExecContext(r.Context(), `DELETE FROM todos WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete todo")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		writeError(w, http.StatusNotFound, "todo not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- reminders ---

func (s *Server) listReminders(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(),
		`SELECT id, user_id, text, remind_at, dismissed, created_at, dismissed_at
		 FROM reminders
		 WHERE dismissed = FALSE
		 ORDER BY remind_at ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to query reminders")
		return
	}
	defer rows.Close()

	reminders := []models.Reminder{}
	for rows.Next() {
		var rem models.Reminder
		var id string
		err := rows.Scan(&id, &rem.UserID, &rem.Text, &rem.RemindAt, &rem.Dismissed,
			&rem.CreatedAt, &rem.DismissedAt)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan reminder")
			return
		}
		rem.ID = id
		reminders = append(reminders, rem)
	}
	writeJSON(w, http.StatusOK, reminders)
}

func (s *Server) createReminder(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Text     string `json:"text"`
		RemindAt string `json:"remind_at"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Text == "" || req.RemindAt == "" {
		writeError(w, http.StatusBadRequest, "text and remind_at are required")
		return
	}
	remindAt, err := time.Parse(time.RFC3339, req.RemindAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, "remind_at must be RFC3339")
		return
	}

	var rem models.Reminder
	var id string
	err = s.db.QueryRowContext(r.Context(),
		`INSERT INTO reminders (text, remind_at)
		 VALUES ($1, $2)
		 RETURNING id, user_id, text, remind_at, dismissed, created_at, dismissed_at`,
		req.Text, remindAt,
	).Scan(&id, &rem.UserID, &rem.Text, &rem.RemindAt, &rem.Dismissed, &rem.CreatedAt, &rem.DismissedAt)
	if err != nil {
		log.Printf("createReminder error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create reminder")
		return
	}
	rem.ID = id
	writeJSON(w, http.StatusCreated, rem)
}

func (s *Server) dismissReminder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var rem models.Reminder
	var rID string
	err := s.db.QueryRowContext(r.Context(),
		`UPDATE reminders
		 SET dismissed = TRUE, dismissed_at = NOW()
		 WHERE id = $1 AND dismissed = FALSE
		 RETURNING id, user_id, text, remind_at, dismissed, created_at, dismissed_at`,
		id,
	).Scan(&rID, &rem.UserID, &rem.Text, &rem.RemindAt, &rem.Dismissed, &rem.CreatedAt, &rem.DismissedAt)
	if err == sql.ErrNoRows {
		writeError(w, http.StatusNotFound, "reminder not found or already dismissed")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to dismiss reminder")
		return
	}
	rem.ID = rID
	writeJSON(w, http.StatusOK, rem)
}

func (s *Server) deleteReminder(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	res, err := s.db.ExecContext(r.Context(), `DELETE FROM reminders WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete reminder")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		writeError(w, http.StatusNotFound, "reminder not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- shopping ---

func (s *Server) listShopping(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(),
		`SELECT id, user_id, item, quantity, created_at
		 FROM shopping_items ORDER BY created_at DESC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to query shopping items")
		return
	}
	defer rows.Close()

	items := []models.ShoppingItem{}
	for rows.Next() {
		var it models.ShoppingItem
		var id string
		if err := rows.Scan(&id, &it.UserID, &it.Item, &it.Quantity, &it.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan shopping item")
			return
		}
		it.ID = id
		items = append(items, it)
	}
	writeJSON(w, http.StatusOK, items)
}

func (s *Server) createShoppingItem(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Item     string  `json:"item"`
		Quantity *string `json:"quantity,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Item == "" {
		writeError(w, http.StatusBadRequest, "item is required")
		return
	}

	var it models.ShoppingItem
	var id string
	err := s.db.QueryRowContext(r.Context(),
		`INSERT INTO shopping_items (item, quantity)
		 VALUES ($1, $2)
		 RETURNING id, user_id, item, quantity, created_at`,
		req.Item, req.Quantity,
	).Scan(&id, &it.UserID, &it.Item, &it.Quantity, &it.CreatedAt)
	if err != nil {
		log.Printf("createShoppingItem error: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create shopping item")
		return
	}
	it.ID = id
	writeJSON(w, http.StatusCreated, it)
}

func (s *Server) deleteShoppingItem(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	res, err := s.db.ExecContext(r.Context(), `DELETE FROM shopping_items WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete shopping item")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		writeError(w, http.StatusNotFound, "shopping item not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
