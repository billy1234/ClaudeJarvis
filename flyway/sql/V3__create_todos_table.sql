CREATE TABLE todos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID,
    text        TEXT        NOT NULL,
    completed   BOOLEAN     NOT NULL DEFAULT FALSE,
    priority    VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date    TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_todos_user_id ON todos (user_id);
CREATE INDEX idx_todos_completed ON todos (completed);
