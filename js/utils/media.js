// ===========================================
// Media URL Utilities
// ===========================================

import { FALLBACK_IMAGE } from '../config/constants.js';

export function driveToDirectImageUrl(url) {
    const originalUrl = (url || '').trim();
    if (!originalUrl) return FALLBACK_IMAGE; // Fallback immediately if empty

    // 1. Check if it's already a direct Google User Content URL
    if (originalUrl.includes('lh3.googleusercontent.com') || originalUrl.includes('drive.google.com/thumbnail')) {
        // Assume it's already good, just return it
        return originalUrl;
    }

    // 2. Extract ID from various Drive formats
    // Supported: /file/d/<ID>, /open?id=<ID>, /uc?id=<ID>, id=<ID>
    const idMatch = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        originalUrl.match(/id=([a-zA-Z0-9_-]+)/);

    if (idMatch && idMatch[1]) {
        const fileId = idMatch[1];
        // 3. Construct the official robust direct link
        const finalUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1200`;

        console.log(`[DriveImage] Original: ${originalUrl} -> Converted: ${finalUrl}`);
        return finalUrl;
    }

    console.warn(`[DriveImage] Could not convert: ${originalUrl}`);
    return FALLBACK_IMAGE; // Fallback if conversion fails
}

export function extractDriveId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

export function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|watch\?v=|\/embed\/|\/shorts\/)([^&?\/#]+)/);
    return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(videoId) {
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}`;
}
