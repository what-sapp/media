// API calls for frontend

const API_BASE = window.location.origin;

// Fetch media info
export async function fetchMediaInfo(url) {
    const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });
    
    return await res.json();
}

// Download video
export function downloadVideo(downloadUrl) {
    window.open(downloadUrl, '_blank');
}

// Download audio
export function downloadAudio(downloadUrl) {
    window.open(downloadUrl, '_blank');
}

// Get platforms list
export async function getPlatforms() {
    const res = await fetch('/api/platforms');
    return await res.json();
}

// Get user stats
export async function getUserStats() {
    const res = await fetch('/user/me');
    const data = await res.json();
    return data.success ? data.user : null;
}

// Become developer
export async function becomeDeveloper() {
    const res = await fetch('/user/become-developer', { method: 'POST' });
    return await res.json();
}

// Regenerate API key
export async function regenerateApiKey() {
    const res = await fetch('/user/regenerate-key', { method: 'POST' });
    return await res.json();
}

// Admin APIs
export async function getAdminStats() {
    const res = await fetch('/admin/stats');
    return await res.json();
}

export async function getAllUsers() {
    const res = await fetch('/admin/users');
    return await res.json();
}

export async function makeDeveloper(userId) {
    const res = await fetch('/admin/users/make-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    return await res.json();
}

export async function banUser(userId, reason, durationHours = 24) {
    const res = await fetch('/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason, durationHours })
    });
    return await res.json();
}

export async function unbanUser(userId) {
    const res = await fetch('/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    return await res.json();
}

export async function updatePlatform(platform, available, maintenance, error, errorMessage) {
    const res = await fetch('/admin/platforms/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, available, maintenance, error, error_message: errorMessage })
    });
    return await res.json();
}