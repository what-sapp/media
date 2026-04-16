import express from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';
import { banCheck } from '../middleware/banCheck.js';
import { platformCheck } from '../middleware/platformCheck.js';
import { trackRequest } from '../middleware/trackRequest.js';
import { detectPlatform } from '../utils/platformDetector.js';
import * as scraper from '../scraper/scraper.js';

const router = express.Router();

// Get platform list
router.get('/platforms', async (req, res) => {
    const { getPlatformSettings } = await import('../database/queries.js');
    const platforms = await getPlatformSettings();
    res.json({ success: true, platforms });
});

// Download endpoint for devs
router.post('/download', 
    apiKeyAuth,
    rateLimitMiddleware,
    banCheck,
    platformCheck,
    async (req, res) => {
        try {
            const { url, quality = 'highest' } = req.body;
            
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }
            
            const platform = detectPlatform(url);
            if (!platform) {
                return res.status(400).json({ error: 'Unsupported platform' });
            }
            
            // Call scraper (you'll implement these)
            let result;
            switch(platform) {
                case 'youtube':
                    result = await scraper.downloadYouTube(url, quality);
                    break;
                case 'instagram':
                    result = await scraper.downloadInstagram(url);
                    break;
                case 'tiktok':
                    result = await scraper.downloadTikTok(url);
                    break;
                default:
                    return res.status(400).json({ error: 'Platform scraper not implemented yet' });
            }
            
            // Track request
            await trackRequest(req.user.id, platform);
            
            res.json({
                success: true,
                title: result.title,
                thumbnail: result.thumbnail,
                video: result.video,
                audio: result.audio
            });
            
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Get user stats (for devs)
router.get('/me', apiKeyAuth, async (req, res) => {
    const user = req.user;
    const limit = user.role === 'admin' ? 10000 : (user.role === 'developer' ? 500 : 10);
    
    res.json({
        success: true,
        user: {
            email: user.email,
            name: user.name,
            role: user.role,
            api_key: user.api_key,
            daily_requests: user.daily_requests,
            daily_limit: limit,
            remaining: limit - user.daily_requests
        }
    });
});

// Become developer (get API key)
router.post('/become-developer', async (req, res) => {
    // This will be implemented - requires user to be logged in via session
    res.json({ error: 'Use session auth for this endpoint' });
});

export default router;