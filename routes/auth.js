import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import { findUserByGoogleId, createUser, findUserById } from '../database/queries.js';  // ← ADD findUserById

const router = express.Router();

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await findUserByGoogleId(profile.id);
        
        if (!user) {
            const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
            const role = adminEmails.includes(profile.emails[0].value) ? 'admin' : 'user';
            
            user = await createUser({
                id: uuidv4(),
                google_id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos[0]?.value,
                role: role
            });
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);  // ← Store just the ID
});

passport.deserializeUser(async (id, done) => {  // ← 'id' not 'user'
    try {
        const user = await findUserById(id);  // ← Use findUserById
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

router.get('/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    res.json(req.user);
});

export default router;