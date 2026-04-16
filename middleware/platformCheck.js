import { getPlatformSettings } from '../database/queries.js';
import { detectPlatform } from '../utils/platformDetector.js';

export async function platformCheck(req, res, next) {
    const { url } = req.body;
    
    if (!url) {
        return next();
    }
    
    const platform = detectPlatform(url);
    if (!platform) {
        return res.status(400).json({ error: 'Unsupported platform' });
    }
    
    const platforms = await getPlatformSettings();
    const platformConfig = platforms.find(p => p.platform === platform);
    
    if (!platformConfig) {
        return res.status(400).json({ error: 'Platform not configured' });
    }
    
    if (!platformConfig.available) {
        return res.status(503).json({ error: 'This platform is currently disabled' });
    }
    
    if (platformConfig.maintenance) {
        return res.status(503).json({ error: 'This platform is under maintenance' });
    }
    
    if (platformConfig.error) {
        return res.status(503).json({ error: platformConfig.error_message || 'This platform has an error' });
    }
    
    req.platform = platform;
    next();
}