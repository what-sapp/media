import { isUserBanned } from '../database/queries.js';

export async function banCheck(req, res, next) {
    const user = req.user;
    
    if (!user) {
        return next();
    }
    
    const banned = await isUserBanned(user.id);
    
    if (banned) {
        return res.status(403).json({ 
            error: 'Your account is temporarily banned',
            banned_until: user.banned_until,
            reason: user.ban_reason
        });
    }
    
    next();
}