import express from 'express';
import { getPlatformSettings } from '../database/queries.js';

const router = express.Router();

// Get all platforms with status
router.get('/', async (req, res) => {
    const platforms = await getPlatformSettings();
    
    const result = {};
    platforms.forEach(p => {
        result[p.platform] = {
            available: p.available,
            maintenance: p.maintenance,
            error: p.error,
            error_message: p.error_message
        };
    });
    
    res.json(result);
});

// Check specific platform
router.get('/:platform', async (req, res) => {
    const { platform } = req.params;
    const platforms = await getPlatformSettings();
    const found = platforms.find(p => p.platform === platform);
    
    if (!found) {
        return res.status(404).json({ error: 'Platform not found' });
    }
    
    res.json({
        platform: found.platform,
        available: found.available,
        maintenance: found.maintenance,
        error: found.error,
        error_message: found.error_message
    });
});

export default router;