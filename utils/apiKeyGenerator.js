import crypto from 'crypto';

export function generateApiKey(role = 'dev') {
    const prefix = role === 'admin' ? 'phantom_admin' : 'phantom_dev';
    const timestamp = Date.now();
    const random = crypto.randomBytes(12).toString('hex');
    
    return `${prefix}_${timestamp}_${random}`;
}

export function maskApiKey(apiKey) {
    if (!apiKey) return null;
    if (apiKey.length <= 12) return '***';
    return apiKey.slice(0, 10) + '...' + apiKey.slice(-6);
}

export function validateApiKeyFormat(apiKey) {
    const patterns = [
        /^phantom_admin_\d+_[a-f0-9]+$/,
        /^phantom_dev_\d+_[a-f0-9]+$/
    ];
    
    return patterns.some(pattern => pattern.test(apiKey));
}