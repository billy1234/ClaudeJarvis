CREATE TABLE reminders (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID,
    text         TEXT        NOT NULL,
    remind_at    TIMESTAMPTZ NOT NULL,
    dismissed    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dismissed_at TIMESTAMPTZ
);

CREATE INDEX idx_reminders_user_id ON reminders (user_id);
CREATE INDEX idx_reminders_remind_at ON reminders (remind_at);
CREATE INDEX idx_reminders_dismissed ON reminders (dismissed);
