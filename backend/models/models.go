package models

import "time"

type Todo struct {
	ID          string     `json:"id"`
	UserID      *string    `json:"user_id,omitempty"`
	Text        string     `json:"text"`
	Completed   bool       `json:"completed"`
	Priority    string     `json:"priority"` // low, medium, high
	DueDate     *time.Time `json:"due_date,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type Reminder struct {
	ID          string     `json:"id"`
	UserID      *string    `json:"user_id,omitempty"`
	Text        string     `json:"text"`
	RemindAt    time.Time  `json:"remind_at"`
	Dismissed   bool       `json:"dismissed"`
	CreatedAt   time.Time  `json:"created_at"`
	DismissedAt *time.Time `json:"dismissed_at,omitempty"`
}

type ShoppingItem struct {
	ID        string    `json:"id"`
	UserID    *string   `json:"user_id,omitempty"`
	Item      string    `json:"item"`
	Quantity  *string   `json:"quantity,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
