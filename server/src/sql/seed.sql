INSERT INTO users (name, email, password_hash) VALUES (
  'Ananya',
  'ananya@example.com',
  '$2b$10$Qm3l.t5U7vU.0I0.5nR2b7uz5oG0yZJ9s8tYpRWaQGg9v7t.Lc3R6'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO habits (user_id, name, frequency_type, archived)
SELECT id, 'Drink Water', 'daily', false FROM users WHERE email = 'ananya@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO habits (user_id, name, frequency_type, archived)
SELECT id, 'Read', 'daily', false FROM users WHERE email = 'ananya@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO habits (user_id, name, frequency_type, archived)
SELECT id, 'Workout', 'weekly', false FROM users WHERE email = 'ananya@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO habits (user_id, name, frequency_type, archived)
SELECT id, 'No Sugar', 'daily', false FROM users WHERE email = 'ananya@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO habit_schedules (habit_id, day_of_week)
SELECT h.id, s.day_of_week
FROM habits h
JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS s(day_of_week) ON h.name = 'Drink Water' OR h.name = 'Read' OR h.name = 'No Sugar'
WHERE h.user_id = (SELECT id FROM users WHERE email = 'ananya@example.com')
ON CONFLICT (habit_id, day_of_week) DO NOTHING;

INSERT INTO habit_schedules (habit_id, day_of_week)
SELECT h.id, s.day_of_week
FROM habits h
JOIN (VALUES (1),(2),(3),(4),(5)) AS s(day_of_week) ON h.name = 'Workout'
WHERE h.user_id = (SELECT id FROM users WHERE email = 'ananya@example.com')
ON CONFLICT (habit_id, day_of_week) DO NOTHING;

INSERT INTO habit_logs (habit_id, log_date, completed)
SELECT h.id, '2026-09-11', true
FROM habits h
WHERE h.user_id = (SELECT id FROM users WHERE email = 'ananya@example.com') AND h.name = 'Drink Water'
ON CONFLICT (habit_id, log_date) DO NOTHING;

INSERT INTO habit_logs (habit_id, log_date, completed)
SELECT h.id, '2026-09-12', true
FROM habits h
WHERE h.user_id = (SELECT id FROM users WHERE email = 'ananya@example.com') AND h.name = 'Drink Water'
ON CONFLICT (habit_id, log_date) DO NOTHING;

INSERT INTO habit_logs (habit_id, log_date, completed)
SELECT h.id, '2026-09-13', true
FROM habits h
WHERE h.user_id = (SELECT id FROM users WHERE email = 'ananya@example.com') AND h.name = 'Drink Water'
ON CONFLICT (habit_id, log_date) DO NOTHING;

INSERT INTO habit_logs (habit_id, log_date, completed)
SELECT h.id, '2026-09-14', true
FROM habits h
WHERE h.user_id = (SELECT id FROM users WHERE email = 'ananya@example.com') AND h.name = 'Drink Water'
ON CONFLICT (habit_id, log_date) DO NOTHING;
