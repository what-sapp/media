export function maskApiKey(apiKey) {
    if (!apiKey) return null;
    if (apiKey.length <= 8) return '***';
    return apiKey.slice(0, 8) + '***' + apiKey.slice(-4);
}

export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getTimeRemaining(expiresAt) {
    const total = new Date(expiresAt) - new Date();
    const hours = Math.floor(total / 3600000);
    const minutes = Math.floor((total % 3600000) / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    
    return { hours, minutes, seconds, total };
}