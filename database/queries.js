import { query } from './db.js';

// User queries
export async function findUserByGoogleId(googleId) {
    const res = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return res.rows[0];
}

export async function findUserById(id) {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
}

export async function findUserByEmail(email) {
    const res = await query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
}

export async function findUserByApiKey(apiKey) {
    const res = await query('SELECT * FROM users WHERE api_key = $1', [apiKey]);
    return res.rows[0];
}

export async function createUser(user) {
    const { id, google_id, email, name, picture, role } = user;
    const res = await query(
        'INSERT INTO users (id, google_id, email, name, picture, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id, google_id, email, name, picture, role]
    );
    return res.rows[0];
}

export async function updateUserRole(userId, role) {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
}

export async function updateUserApiKey(userId, apiKey) {
    await query('UPDATE users SET api_key = $1 WHERE id = $2', [apiKey, userId]);
}

export async function incrementDailyRequests(userId, platform) {
    await query(
        'UPDATE users SET daily_requests = daily_requests + 1 WHERE id = $1',
        [userId]
    );
    
    await query(
        `INSERT INTO daily_stats (user_id, platform, requests) 
         VALUES ($1, $2, 1) 
         ON CONFLICT (user_id, platform, date) 
         DO UPDATE SET requests = daily_stats.requests + 1`,
        [userId, platform]
    );
}

export async function resetDailyRequests() {
    await query('UPDATE users SET daily_requests = 0 WHERE last_reset < CURRENT_DATE');
    await query('UPDATE users SET last_reset = CURRENT_DATE');
}

export async function banUser(userId, reason, expiresAt) {
    await query(
        'UPDATE users SET banned_until = $1, ban_reason = $2 WHERE id = $3',
        [expiresAt, reason, userId]
    );
}

export async function unbanUser(userId) {
    await query(
        'UPDATE users SET banned_until = NULL, ban_reason = NULL WHERE id = $1',
        [userId]
    );
}

export async function isUserBanned(userId) {
    const res = await query(
        'SELECT banned_until FROM users WHERE id = $1 AND banned_until > NOW()',
        [userId]
    );
    return res.rows[0] !== undefined;
}

export async function getPlatformSettings() {
    const res = await query('SELECT * FROM platform_settings');
    return res.rows;
}

export async function updatePlatformStatus(platform, available, maintenance, error, errorMessage) {
    await query(
        `UPDATE platform_settings 
         SET available = $1, maintenance = $2, error = $3, error_message = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE platform = $5`,
        [available, maintenance, error, errorMessage, platform]
    );
}

export async function getTodayStats() {
    const res = await query(`
        SELECT 
            platform,
            SUM(requests) as total_requests
        FROM daily_stats
        WHERE date = CURRENT_DATE
        GROUP BY platform
        ORDER BY total_requests DESC
    `);
    return res.rows;
}

export async function getWeeklyStats() {
    const res = await query(`
        SELECT 
            platform,
            date,
            SUM(requests) as requests
        FROM daily_stats
        WHERE date >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY platform, date
        ORDER BY date DESC, platform
    `);
    return res.rows;
}

export async function getTopUsers(limit = 10) {
    const res = await query(`
        SELECT 
            u.email,
            u.role,
            COALESCE(SUM(ds.requests), 0) as requests
        FROM users u
        LEFT JOIN daily_stats ds ON u.id = ds.user_id AND ds.date = CURRENT_DATE
        GROUP BY u.id
        ORDER BY requests DESC
        LIMIT $1
    `, [limit]);
    return res.rows;
}

export async function getAllUsers() {
    const res = await query(`
        SELECT 
            u.id,
            u.email,
            u.name,
            u.role,
            u.api_key,
            u.daily_requests,
            u.banned_until,
            COALESCE(SUM(ds.requests), 0) as today_requests
        FROM users u
        LEFT JOIN daily_stats ds ON u.id = ds.user_id AND ds.date = CURRENT_DATE
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `);
    return res.rows;
}

export async function getSetting(key) {
    const res = await query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows[0]?.value;
}

export async function updateSetting(key, value) {
    await query(
        'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
        [value, key]
    );
}