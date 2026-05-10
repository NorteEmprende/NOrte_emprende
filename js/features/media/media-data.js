// ===========================================
// Media Data Loading
// ===========================================

import { CSV_URLS, FALLBACK_IMAGE } from '../../config/constants.js';
import { parseRobustCSV } from '../../utils/csv.js';
import { extractYouTubeId, driveToDirectImageUrl } from '../../utils/media.js';

/**
 * Fetch and parse media videos from the public Google Sheets CSV.
 * Returns array of video objects sorted from most recent to oldest.
 */
export async function fetchMediaData() {
    try {
        const response = await fetch(CSV_URLS.media + '&_=' + Date.now());
        const text = await response.text();
        const allRows = parseRobustCSV(text);

        if (allRows.length < 2) return []; // Header only or empty

        const dataRows = allRows.slice(1); // Skip header row

        const videos = [];

        dataRows.forEach(cols => {
            // Column mapping by index:
            // 0: Marca temporal
            // 1: Fecha de la noticia
            // 2: Título de la noticia
            // 3: Cuerpo de la noticia
            // 4: Link del video en youtube
            // 5: Miniatura del video
            // 6: Formato del video

            const titulo = (cols[2] || '').trim();
            const descripcion = (cols[3] || '').trim();
            const videoUrl = (cols[4] || '').trim();
            const formatoRaw = (cols[6] || '').trim();

            // Validate mandatory fields
            if (!titulo || !descripcion || !videoUrl) return;

            // Extract YouTube ID — skip if invalid
            const videoId = extractYouTubeId(videoUrl);
            if (!videoId) return;

            // Parse format
            const formato = parseFormato(formatoRaw);
            if (!formato) return; // Must have a valid format

            // Resolve thumbnail
            const thumbnailUrl = resolveThumbnail(cols[5], videoId);

            videos.push({
                timestamp: (cols[0] || '').trim(),
                fecha: (cols[1] || '').trim(),
                titulo,
                descripcion,
                videoUrl,
                videoId,
                thumbnailUrl,
                formato
            });
        });

        // Sort by date (most recent first)
        return sortByDate(videos);

    } catch (err) {
        console.error('[NextGen Media] Error fetching media data:', err);
        return [];
    }
}

/**
 * Parse the format column value into a normalized string.
 */
function parseFormato(raw) {
    if (!raw) return 'vertical'; // Defensive fallback
    const lower = raw.toLowerCase();
    if (lower.includes('horizontal') || lower.includes('16:9')) return 'horizontal';
    if (lower.includes('vertical') || lower.includes('9:16')) return 'vertical';
    return 'vertical'; // Fallback
}

/**
 * Resolve the best thumbnail URL for a video.
 */
function resolveThumbnail(rawThumbnail, videoId) {
    const thumb = (rawThumbnail || '').trim();

    if (thumb) {
        // If it looks like a Google Drive link, convert it
        if (thumb.includes('drive.google.com') || thumb.includes('docs.google.com')) {
            const converted = driveToDirectImageUrl(thumb);
            if (converted && converted !== FALLBACK_IMAGE) {
                return converted;
            }
        }
        // If it's already a direct URL (not Drive), use as-is
        if (thumb.startsWith('http')) {
            return thumb;
        }
    }

    // Fallback: YouTube auto-generated thumbnail
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    return FALLBACK_IMAGE;
}

/**
 * Sort videos from most recent to oldest.
 * Primary: "Fecha de la noticia"
 * Fallback: "Marca temporal"
 */
function sortByDate(videos) {
    return videos.sort((a, b) => {
        const dateA = parseDate(a.fecha) || parseDate(a.timestamp);
        const dateB = parseDate(b.fecha) || parseDate(b.timestamp);

        if (dateA && dateB) return dateB - dateA;
        if (dateA) return -1;
        if (dateB) return 1;
        return 0; // Preserve CSV order
    });
}

/**
 * Try to parse a date string in common formats.
 */
function parseDate(str) {
    if (!str) return null;

    // Try native Date parse first
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;

    // Try DD/MM/YYYY format
    const parts = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (parts) {
        const year = parts[3].length === 2 ? 2000 + parseInt(parts[3]) : parseInt(parts[3]);
        const month = parseInt(parts[2]) - 1;
        const day = parseInt(parts[1]);
        const parsed = new Date(year, month, day);
        if (!isNaN(parsed.getTime())) return parsed;
    }

    return null;
}
