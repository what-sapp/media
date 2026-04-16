import express from 'express';
import { detectPlatform } from '../utils/platformDetector.js';
import { incrementDailyRequests, isUserBanned, getSetting } from '../database/queries.js';
import * as scraper from '../scraper/scraper.js';

const router = express.Router();

// Download endpoint for normal users (web)
router.post('/', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.user) {
            return res.status(401).json({ error: 'Please login first' });
        }
        
        // Check if banned
        const banned = await isUserBanned(req.user.id);
        if (banned) {
            return res.status(403).json({ error: 'You are banned', banned: true });
        }
        
        const { url, quality = 'highest' } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        // Check daily limit
        const limit = req.user.role === 'admin' ? 10000 : 
                     (req.user.role === 'developer' ? 500 : 10);
        
        if (req.user.daily_requests >= limit) {
            return res.status(429).json({ error: 'Daily limit exceeded' });
        }
        
        const platform = detectPlatform(url);
        if (!platform) {
            return res.status(400).json({ error: 'Unsupported platform' });
        }
        
        // Call scraper
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
                return res.status(400).json({ error: 'Platform not implemented' });
        }
        
        // Increment counter
        await incrementDailyRequests(req.user.id, platform);
        
        res.json({
            success: true,
            title: result.title,
            thumbnail: result.thumbnail,
            video_url: result.video?.url,
            audio_url: result.audio?.url,
            video_size: result.video?.size,
            audio_size: result.audio?.size
        });
        
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;