import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOGS_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}\n`;
    
    // Console output
    if (level === 'ERROR') {
        console.error(logLine);
    } else {
        console.log(logLine);
    }
    
    // File output
    fs.appendFile(LOG_FILE, logLine, (err) => {
        if (err) console.error('Failed to write log:', err);
    });
}

export function logError(message, error = null) {
    let errorMsg = message;
    if (error) {
        errorMsg += ` - ${error.message || error}`;
        if (error.stack) {
            errorMsg += `\n${error.stack}`;
        }
    }
    log(errorMsg, 'ERROR');
}

export function logRequest(req, userId = null) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const method = req.method;
    const url = req.url;
    const user = userId ? `user:${userId}` : 'anonymous';
    
    log(`${user} | ${method} ${url} | IP: ${ip}`, 'REQUEST');
}

export function logApiCall(userId, apiKey, endpoint, platform, success) {
    const status = success ? 'SUCCESS' : 'FAILED';
    log(`API | user:${userId} | key:${apiKey?.slice(-8)} | ${endpoint} | ${platform} | ${status}`, 'API');
}