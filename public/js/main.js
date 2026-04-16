// Main frontend JavaScript

// API Base URL
const API_BASE = window.location.origin;

// Helper: Show error message
export function showError(message) {
    const errorDiv = document.getElementById('errorMsg');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Helper: Show success message
export function showSuccess(message) {
    const successDiv = document.getElementById('successMsg');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

// Helper: Format bytes
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper: Copy to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard!');
    } catch (err) {
        showError('Failed to copy');
    }
}

// Helper: Get time remaining
export function getTimeRemaining(expiresAt) {
    const total = new Date(expiresAt) - new Date();
    const hours = Math.floor(total / 3600000);
    const minutes = Math.floor((total % 3600000) / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    return { hours, minutes, seconds, total };
}

// Check authentication
export async function checkAuth() {
    try {
        const res = await fetch('/user/me');
        const data = await res.json();
        return data.success ? data.user : null;
    } catch (error) {
        return null;
    }
}

// Redirect if not logged in
export async function requireAuth() {
    const user = await checkAuth();
    if (!user) {
        window.location.href = '/login';
    }
    return user;
}

// Logout
export function logout() {
    window.location.href = '/auth/logout';
}