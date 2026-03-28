-- Test users (fixed UUIDs for predictability)
INSERT INTO users (id, username, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'alice', 'alice@example.com'),
    ('00000000-0000-0000-0000-000000000002', 'bob',   'bob@example.com');

-- Test todos
INSERT INTO todos (id, user_id, text, completed, priority, due_date) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Buy groceries',         false, 'medium', NOW() + INTERVAL '2 days'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Finish project report', false, 'high',   NOW() + INTERVAL '1 day'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Call the dentist',      false, 'low',    NULL),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Read a book',           true,  'low',    NULL);

-- Test reminders
INSERT INTO reminders (id, user_id, text, remind_at, dismissed) VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Team standup', NOW() + INTERVAL '1 hour', false),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Pay rent',     NOW() + INTERVAL '3 days', false),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Water plants', NOW() - INTERVAL '1 hour', true);

-- Test shopping items
INSERT INTO shopping_items (id, user_id, item, quantity) VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Milk',   '2 liters'),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Eggs',   '12'),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Bread',  '1 loaf'),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Coffee', NULL);
