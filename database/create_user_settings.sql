CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(120) DEFAULT '',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  theme VARCHAR(10) NOT NULL DEFAULT 'system',
  start_page VARCHAR(20) NOT NULL DEFAULT 'home',
  default_expense_category VARCHAR(30) NOT NULL DEFAULT 'food',
  warning_threshold INTEGER NOT NULL DEFAULT 80,
  reset_day INTEGER NOT NULL DEFAULT 1,
  alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT user_settings_currency_check CHECK (currency IN ('USD', 'EUR', 'CHF')),
  CONSTRAINT user_settings_theme_check CHECK (theme IN ('light', 'dark', 'system')),
  CONSTRAINT user_settings_start_page_check CHECK (
    start_page IN ('home', 'transaction', 'analytics', 'budget')
  ),
  CONSTRAINT user_settings_default_expense_category_check CHECK (
    default_expense_category IN ('food', 'transport', 'entertainment', 'shopping', 'other')
  ),
  CONSTRAINT user_settings_warning_threshold_check CHECK (
    warning_threshold >= 1 AND warning_threshold <= 100
  ),
  CONSTRAINT user_settings_reset_day_check CHECK (reset_day >= 1 AND reset_day <= 28)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);