// ===========================================
// Media Card Component
// ===========================================

import { FALLBACK_IMAGE } from '../../config/constants.js';
import { escapeHtml } from '../../utils/text.js';
import { openMediaVideoModal } from './media-modal.js';

/**
 * Create a media video card element.
 * Reusable in both index.html (carousel) and media.html (grid).
 */
export function createMediaCard(video, index, videos) {
    const card = document.createElement('div');
    card.className = 'media-video-card';

    const safeTitulo = escapeHtml(video.titulo);
    const safeFecha = escapeHtml(video.fecha);
    const safeDesc = escapeHtml(truncateText(video.descripcion, 60));

    card.innerHTML = `
        <div class="media-video-thumbnail-wrap">
            <img class="media-video-thumbnail"
                 src="${video.thumbnailUrl}"
                 alt="${safeTitulo}"
                 loading="lazy"
                 onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.classList.add('fallback-img');">
            <div class="media-play-overlay">
                <i class="fa-solid fa-play"></i>
            </div>
        </div>
        <div class="media-card-info">
            <span class="media-card-date"><i class="fa-regular fa-calendar"></i> ${safeFecha}</span>
            <h3 class="media-card-title">${safeTitulo}</h3>
            <p class="media-card-desc">${safeDesc}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        openMediaVideoModal(videos, index);
    });

    return card;
}

/**
 * Truncate text to approximate character limit with ellipsis.
 */
function truncateText(text, maxLen) {
    if (!text || text.length <= maxLen) return text || '';
    return text.substring(0, maxLen).trimEnd() + '…';
}
