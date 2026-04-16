import { getSetting } from '../database/queries.js';

export async function rateLimitMiddleware(req, res, next) {
    const user = req.user;
    
    let limit = 10; // default
    if (user.role === 'admin') {
        limit = parseInt(await getSetting('admin_limit')) || 10000;
    } else if (user.role === 'developer') {
        limit = parseInt(await getSetting('dev_limit')) || 500;
    } else {
        limit = parseInt(await getSetting('free_limit')) || 10;
    }
    
    if (user.daily_requests >= limit) {
        return res.status(429).json({ 
            error: 'Daily rate limit exceeded',
            limit: limit,
            used: user.daily_requests,
            remaining: 0
        });
    }
    
    next();
}