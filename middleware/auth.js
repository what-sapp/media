export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Please login first' });
}

export function ensureNotBanned(req, res, next) {
    if (req.user && req.user.banned_until && new Date(req.user.banned_until) > new Date()) {
        return res.status(403).json({ 
            error: 'You are banned', 
            banned_until: req.user.banned_until,
            reason: req.user.ban_reason
        });
    }
    next();
}