// ===========================================
// Media Full Page (media.html)
// ===========================================

import { fetchMediaData } from './media-data.js';
import { createMediaCard } from './media-card.js';

let allVideos = [];

/**
 * Load the full media page with all videos, filters, and search.
 */
export async function loadMediaPage() {
    const container = document.getElementById('media-full-grid');
    if (!container) return;

    try {
        allVideos = await fetchMediaData();

        if (allVideos.length === 0) {
            container.innerHTML = `
                <div class="media-empty-state">
                    <i class="fa-solid fa-video-slash"></i>
                    <p>Aún no hay videos disponibles.</p>
                </div>
            `;
            return;
        }

        // Setup filters
        setupFilters();

        // Render all videos
        renderVideos(allVideos);

    } catch (err) {
        console.error('[NextGen Media] Error loading media page:', err);
        container.innerHTML = '<p class="text-center error">Error cargando los videos.</p>';
    }
}

/**
 * Setup filter buttons and search input.
 */
function setupFilters() {
    const filtersContainer = document.getElementById('media-filters');
    if (!filtersContainer) return;

    // Filter buttons
    const filterBtns = filtersContainer.querySelectorAll('.media-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });

    // Search input
    const searchInput = document.getElementById('media-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyFilters();
        });
    }
}

/**
 * Apply active filter and search term, then re-render.
 */
function applyFilters() {
    const activeFilter = document.querySelector('.media-filter-btn.active');
    const filterValue = activeFilter?.dataset.filter || 'all';
    const searchInput = document.getElementById('media-search');
    const searchTerm = (searchInput?.value || '').toLowerCase().trim();

    let filtered = [...allVideos];

    // Filter by format
    if (filterValue === 'vertical') {
        filtered = filtered.filter(v => v.formato === 'vertical');
    } else if (filterValue === 'horizontal') {
        filtered = filtered.filter(v => v.formato === 'horizontal');
    }

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(v =>
            v.titulo.toLowerCase().includes(searchTerm) ||
            v.descripcion.toLowerCase().includes(searchTerm)
        );
    }

    renderVideos(filtered);
}

/**
 * Render the video grid with the given array of videos.
 */
function renderVideos(videos) {
    const container = document.getElementById('media-full-grid');
    if (!container) return;

    container.innerHTML = '';

    if (videos.length === 0) {
        container.innerHTML = `
            <div class="media-empty-state">
                <i class="fa-solid fa-search"></i>
                <p>No se encontraron videos con esos filtros.</p>
            </div>
        `;
        return;
    }

    videos.forEach((video, index) => {
        container.appendChild(createMediaCard(video, index, videos));
    });
}
