import pkg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
}

export async function getClient() {
    return await pool.connect();
}

export async function initializeDatabase() {
    const createUsersTable = `
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
    `;

    const createDailyStatsTable = `
        CREATE TABLE IF NOT EXISTS daily_stats (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            platform TEXT,
            date DATE DEFAULT CURRENT_DATE,
            requests INTEGER DEFAULT 0,
            UNIQUE(user_id, platform, date)
        );
    `;

    const createApiLogsTable = `
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
    `;

    const createPlatformSettingsTable = `
        CREATE TABLE IF NOT EXISTS platform_settings (
            platform TEXT PRIMARY KEY,
            available BOOLEAN DEFAULT true,
            maintenance BOOLEAN DEFAULT false,
            error BOOLEAN DEFAULT false,
            error_message TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createSettingsTable = `
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await query(createUsersTable);
    await query(createDailyStatsTable);
    await query(createApiLogsTable);
    await query(createPlatformSettingsTable);
    await query(createSettingsTable);

    // Insert default platforms
    await query(`
        INSERT INTO platform_settings (platform, available) 
        VALUES ('youtube', true), ('instagram', true), ('tiktok', true), ('twitter', true), ('facebook', true)
        ON CONFLICT (platform) DO NOTHING;
    `);

    // Insert default settings
    await query(`
        INSERT INTO settings (key, value) 
        VALUES ('free_limit', '10'), ('dev_limit', '500'), ('admin_limit', '10000')
        ON CONFLICT (key) DO NOTHING;
    `);

    console.log('Database initialized');
}

export default pool;