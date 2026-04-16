import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');

export function cleanupOldFiles(maxAgeHours = 24) {
    if (!fs.existsSync(DOWNLOADS_DIR)) {
        return;
    }
    
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    
    fs.readdir(DOWNLOADS_DIR, (err, files) => {
        if (err) {
            console.error('Failed to read downloads directory:', err);
            return;
        }
        
        files.forEach(file => {
            const filePath = path.join(DOWNLOADS_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Failed to stat file:', filePath, err);
                    return;
                }
                
                if (now - stats.mtimeMs > maxAgeMs) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error('Failed to delete file:', filePath, err);
                        } else {
                            console.log('Deleted old file:', file);
                        }
                    });
                }
            });
        });
    });
}

export function startCleanupInterval(intervalHours = 1, maxAgeHours = 24) {
    // Run on startup
    cleanupOldFiles(maxAgeHours);
    
    // Run every interval
    setInterval(() => {
        cleanupOldFiles(maxAgeHours);
    }, intervalHours * 60 * 60 * 1000);
}