-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    picture TEXT,
    role TEXT DEFAULT 'user',
    api_key TEXT UNIQUE,
    daily_requests INTEGER DEFAULT 0,
    last_reset DATE DEFAULT CURRENT_DATE,
    banned_until TIMESTAMP,
    ban_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily stats per platform
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    platform TEXT,
    date DATE DEFAULT CURRENT_DATE,
    requests INTEGER DEFAULT 0,
    UNIQUE(user_id, platform, date)
);

-- API logs
CREATE TABLE IF NOT EXISTS api_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    api_key TEXT,
    endpoint TEXT,
    platform TEXT,
    success BOOLEAN,
    ip TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform settings
CREATE TABLE IF NOT EXISTS platform_settings (
    platform TEXT PRIMARY KEY,
    available BOOLEAN DEFAULT true,
    maintenance BOOLEAN DEFAULT false,
    error BOOLEAN DEFAULT false,
    error_message TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Global settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default platforms
INSERT INTO platform_settings (platform, available) VALUES 
    ('youtube', true),
    ('instagram', true),
    ('tiktok', true),
    ('twitter', true),
    ('facebook', true)
ON CONFLICT (platform) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
    ('free_limit', '10'),
    ('dev_limit', '500'),
    ('admin_limit', '10000')
ON CONFLICT (key) DO NOTHING;