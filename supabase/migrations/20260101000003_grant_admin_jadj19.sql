-- Grant admin privileges to the requested account
-- This migration is idempotent: it only flips the flag for the matching email.
UPDATE users
SET is_admin = true
WHERE email = 'jadj19@gmail.com';
