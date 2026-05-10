// ===========================================
// Media Preview (Home Page Carousel)
// ===========================================

import { fetchMediaData } from './media-data.js';
import { createMediaCard } from './media-card.js';

const MAX_PREVIEW_VIDEOS = 6;

/**
 * Load the media preview carousel on index.html.
 * Shows only the most recent videos in a horizontal scroll.
 */
export async function loadMediaPreview() {
    const container = document.getElementById('nextgen-media-grid');
    if (!container) return;

    try {
        const videos = await fetchMediaData();

        container.innerHTML = '';

        if (videos.length === 0) {
            container.innerHTML = '<p class="text-center" style="width: 100%; padding: 20px;">Aún no hay videos disponibles.</p>';
            return;
        }

        // Show only the most recent videos
        const recent = videos.slice(0, MAX_PREVIEW_VIDEOS);

        recent.forEach((video, index) => {
            container.appendChild(createMediaCard(video, index, recent));
        });

    } catch (err) {
        console.error('[NextGen Media] Error loading preview:', err);
        container.innerHTML = '<p class="text-center error" style="width: 100%;">Error cargando los videos.</p>';
    }
}
