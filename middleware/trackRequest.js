import { query } from '../database/db.js';

export async function trackRequest(userId, platform, success = true) {
    try {
        // Update daily stats
        await query(
            `INSERT INTO daily_stats (user_id, platform, requests) 
             VALUES ($1, $2, 1) 
             ON CONFLICT (user_id, platform, date) 
             DO UPDATE SET requests = daily_stats.requests + 1`,
            [userId, platform]
        );
        
        // Update user daily count
        await query(
            'UPDATE users SET daily_requests = daily_requests + 1 WHERE id = $1',
            [userId]
        );
    } catch (error) {
        console.error('Failed to track request:', error);
    }
}