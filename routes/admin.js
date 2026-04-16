import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { 
    getAllUsers, 
    updateUserRole, 
    banUser, 
    unbanUser,
    getTodayStats,
    getWeeklyStats,
    getTopUsers,
    updatePlatformStatus,
    getPlatformSettings,
    updateSetting,
    getSetting
} from '../database/queries.js';

const router = express.Router();

// Apply admin auth to all routes
router.use(adminAuth);

// Dashboard stats
router.get('/stats', async (req, res) => {
    const users = await getAllUsers();
    const todayStats = await getTodayStats();
    const weeklyStats = await getWeeklyStats();
    const topUsers = await getTopUsers(10);
    
    const totalUsers = users.length;
    const developers = users.filter(u => u.role === 'developer').length;
    const totalDownloads = todayStats.reduce((sum, s) => sum + parseInt(s.total_requests), 0);
    
    res.json({
        success: true,
        stats: {
            total_users: totalUsers,
            total_developers: developers,
            total_downloads_today: totalDownloads,
            platform_stats_today: todayStats,
            weekly_stats: weeklyStats,
            top_users: topUsers
        }
    });
});

// Get all users
router.get('/users', async (req, res) => {
    const users = await getAllUsers();
    res.json({ success: true, users });
});

// Make user a developer
router.post('/users/make-dev', async (req, res) => {
    const { userId } = req.body;
    const apiKey = `phantom_dev_${Date.now()}_${Math.random().toString(36)}`;
    
    await updateUserRole(userId, 'developer');
    await updateUserApiKey(userId, apiKey);
    
    res.json({ success: true, api_key: apiKey });
});

// Demote developer to user
router.post('/users/demote', async (req, res) => {
    const { userId } = req.body;
    await updateUserRole(userId, 'user');
    await updateUserApiKey(userId, null);
    res.json({ success: true });
});

// Ban user
router.post('/users/ban', async (req, res) => {
    const { userId, reason, durationHours = 24 } = req.body;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);
    
    await banUser(userId, reason, expiresAt);
    res.json({ success: true });
});

// Unban user
router.post('/users/unban', async (req, res) => {
    const { userId } = req.body;
    await unbanUser(userId);
    res.json({ success: true });
});

// Get platform settings
router.get('/platforms', async (req, res) => {
    const platforms = await getPlatformSettings();
    res.json({ success: true, platforms });
});

// Update platform status
router.post('/platforms/update', async (req, res) => {
    const { platform, available, maintenance, error, error_message } = req.body;
    await updatePlatformStatus(platform, available, maintenance, error, error_message);
    res.json({ success: true });
});

// Get settings
router.get('/settings', async (req, res) => {
    const freeLimit = await getSetting('free_limit');
    const devLimit = await getSetting('dev_limit');
    const adminLimit = await getSetting('admin_limit');
    
    res.json({
        success: true,
        settings: {
            free_limit: freeLimit || '10',
            dev_limit: devLimit || '500',
            admin_limit: adminLimit || '10000'
        }
    });
});

// Update settings
router.post('/settings/update', async (req, res) => {
    const { free_limit, dev_limit, admin_limit } = req.body;
    
    if (free_limit) await updateSetting('free_limit', free_limit);
    if (dev_limit) await updateSetting('dev_limit', dev_limit);
    if (admin_limit) await updateSetting('admin_limit', admin_limit);
    
    res.json({ success: true });
});

export default router;