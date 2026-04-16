import express from 'express';
import { updateUserApiKey, findUserByEmail, getSetting } from '../database/queries.js';

const router = express.Router();

// Get current user info (requires session)
router.get('/me', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    const limit = req.user.role === 'admin' ? 10000 : 
                  (req.user.role === 'developer' ? 500 : 10);
    
    res.json({
        success: true,
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            picture: req.user.picture,
            role: req.user.role,
            api_key: req.user.api_key,
            daily_requests: req.user.daily_requests,
            daily_limit: limit,
            remaining: limit - req.user.daily_requests
        }
    });
});

// Become developer (get API key)
router.post('/become-developer', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    if (req.user.role === 'developer' || req.user.role === 'admin') {
        return res.status(400).json({ error: 'Already a developer' });
    }
    
    const apiKey = `phantom_dev_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    await updateUserApiKey(req.user.id, apiKey);
    
    // Update role
    const { updateUserRole } = await import('../database/queries.js');
    await updateUserRole(req.user.id, 'developer');
    
    res.json({
        success: true,
        api_key: apiKey,
        message: 'You are now a developer!'
    });
});

// Regenerate API key (for developers/admins)
router.post('/regenerate-key', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    if (req.user.role !== 'developer' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only developers can regenerate keys' });
    }
    
    const newKey = `phantom_${req.user.role}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    await updateUserApiKey(req.user.id, newKey);
    
    res.json({
        success: true,
        api_key: newKey,
        message: 'API key regenerated successfully'
    });
});

export default router;