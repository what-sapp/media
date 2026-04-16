import { findUserByApiKey } from '../database/queries.js';

export async function apiKeyAuth(req, res, next) {
    const apiKey = req.headers.authorization?.replace('Bearer ', '');
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }
    
    const user = await findUserByApiKey(apiKey);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    
    if (user.role !== 'developer' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Invalid API key. Upgrade to developer first.' });
    }
    
    req.user = user;
    next();
}