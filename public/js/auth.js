// Authentication handling

// Store token
export function setToken(token) {
    localStorage.setItem('token', token);
}

// Get token
export function getToken() {
    return localStorage.getItem('token');
}

// Remove token
export function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Login with Google
export function loginWithGoogle() {
    window.location.href = '/auth/google';
}

// Login with API key (for developers)
export async function loginWithApiKey(apiKey) {
    try {
        const res = await fetch('/api/v1/me', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            localStorage.setItem('apiKey', apiKey);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/developer';
            return true;
        } else {
            throw new Error(data.error || 'Invalid API key');
        }
    } catch (error) {
        alert(error.message);
        return false;
    }
}

// Check if logged in via session
export async function isLoggedIn() {
    try {
        const res = await fetch('/user/me');
        return res.ok;
    } catch {
        return false;
    }
}

// Get current user from session
export async function getCurrentUser() {
    try {
        const res = await fetch('/user/me');
        const data = await res.json();
        return data.success ? data.user : null;
    } catch {
        return null;
    }
}