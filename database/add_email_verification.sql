ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;

UPDATE users
SET email_verified = TRUE
WHERE email_verified IS NULL;

ALTER TABLE users
ALTER COLUMN email_verified SET DEFAULT FALSE;

ALTER TABLE users
ALTER COLUMN email_verified SET NOT NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token_hash
ON users(email_verification_token_hash);