// scraper/m-download/tiktok.js
import axios from 'axios';

export async function downloadTikTok(url) {
    try {
        const { data } = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!data.data) {
            throw new Error('No data received from API');
        }

        return {
            success: true,
            title: data.data.title || 'Untitled',
            thumbnail: data.data.cover || '',
            video: {
                url: data.data.play || null,
                size: null,
                quality: 'HD'
            },
            audio: {
                url: data.data.music || null,
                size: null,
                quality: '320kbps'
            },
            author: data.data.author?.nickname || '',
            stats: {
                plays: data.data.play_count || 0,
                likes: data.data.digg_count || 0,
                comments: data.data.comment_count || 0,
                shares: data.data.share_count || 0
            }
        };
    } catch (error) {
        throw new Error(`TikTok download failed: ${error.message}`);
    }
}