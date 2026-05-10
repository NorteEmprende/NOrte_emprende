// ===========================================
// Media Video Modal
// ===========================================

import { escapeHtml } from '../../utils/text.js';
import { getYouTubeEmbedUrl } from '../../utils/media.js';
import { openModal, closeModal } from '../../ui/modal.js';

let currentVideos = [];
let currentIndex = 0;
let currentViewMode = null; // 'normal' | 'rotated'

/**
 * Open modal with a video from the list, supporting navigation.
 */
export function openMediaVideoModal(videos, index) {
    currentVideos = videos;
    currentIndex = index;
    currentViewMode = null;
    renderModalContent();
}

/**
 * Render or re-render the modal content for the current video.
 */
function renderModalContent() {
    const video = currentVideos[currentIndex];
    if (!video) return;

    const isMobilePortrait = window.matchMedia('(max-width: 768px)').matches
        && window.matchMedia('(orientation: portrait)').matches;

    // Check if horizontal video on mobile portrait — show choice screen
    if (video.formato === 'horizontal' && isMobilePortrait && currentViewMode === null) {
        renderOrientationChoice(video);
        return;
    }

    renderVideoPlayer(video);
}

/**
 * Render the orientation choice screen for horizontal videos on mobile portrait.
 */
function renderOrientationChoice(video) {
    const safeTitulo = escapeHtml(video.titulo);

    const html = `
        <div class="media-modal-container">
            <div class="media-orientation-choice">
                <div class="media-orientation-icon">
                    <i class="fa-solid fa-mobile-screen-button"></i>
                    <i class="fa-solid fa-arrows-rotate"></i>
                </div>
                <h3>${safeTitulo}</h3>
                <p>Este video está grabado en formato horizontal. Para verlo mejor, puedes girar tu teléfono.</p>
                <div class="media-orientation-buttons">
                    <button class="btn btn-primary media-btn-normal" id="media-view-normal">
                        <i class="fa-solid fa-expand"></i> Ver completo
                    </button>
                    <button class="btn btn-secondary media-btn-rotated" id="media-view-rotated">
                        <i class="fa-solid fa-rotate"></i> Ver girado
                    </button>
                </div>
            </div>
            ${buildNavButtons()}
        </div>
    `;

    openModal(html);
    setupNavListeners();

    document.getElementById('media-view-normal')?.addEventListener('click', () => {
        currentViewMode = 'normal';
        renderModalContent();
    });
    document.getElementById('media-view-rotated')?.addEventListener('click', () => {
        currentViewMode = 'rotated';
        renderModalContent();
    });
}

/**
 * Render the actual video player inside the modal.
 */
function renderVideoPlayer(video) {
    const safeTitulo = escapeHtml(video.titulo);
    const safeFecha = escapeHtml(video.fecha);
    const safeDesc = escapeHtml(video.descripcion);
    const embedUrl = getYouTubeEmbedUrl(video.videoId);
    const formatLabel = video.formato === 'horizontal' ? '' : '';

    const isRotated = currentViewMode === 'rotated';
    const isVertical = video.formato === 'vertical';

    // Determine iframe wrapper classes
    let iframeWrapClass = 'media-iframe-wrap';
    if (isVertical) {
        iframeWrapClass += ' media-iframe-vertical';
    } else if (isRotated) {
        iframeWrapClass += ' media-iframe-rotated';
    } else {
        iframeWrapClass += ' media-iframe-horizontal';
    }

    // Description: show first 150 chars, expandable
    const descShort = safeDesc.length > 150 ? safeDesc.substring(0, 150) + '…' : safeDesc;
    const hasMore = safeDesc.length > 150;

    const html = `
        <div class="media-modal-container ${isVertical ? 'media-modal-vertical' : 'media-modal-horizontal'}">
            <div class="${iframeWrapClass}">
                <iframe
                    src="${embedUrl}"
                    title="${safeTitulo}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy">
                </iframe>
                ${isRotated ? `<button class="btn media-btn-switch-normal" id="media-switch-normal"><i class="fa-solid fa-expand"></i> Ver completo</button>` : ''}
            </div>
            <div class="media-modal-info ${isVertical ? 'media-info-overlay' : ''}">
                <div class="media-modal-meta">
                    <span class="media-modal-format"><i class="fa-solid ${video.formato === 'horizontal' ? 'fa-display' : 'fa-mobile-screen'}"></i> ${formatLabel}</span>
                    <span class="media-modal-date"><i class="fa-regular fa-calendar"></i> ${safeFecha}</span>
                </div>
                <h3 class="media-modal-title">${safeTitulo}</h3>
                <div class="media-modal-desc-wrap">
                    <p class="media-modal-desc" id="media-modal-desc">${descShort}</p>
                    ${hasMore ? `<button class="media-desc-toggle" id="media-desc-toggle">Ver más</button>` : ''}
                </div>
            </div>
            ${buildNavButtons()}
        </div>
    `;

    openModal(html);
    setupNavListeners();
    setupDescToggle(safeDesc, descShort);

    // Switch from rotated back to normal
    document.getElementById('media-switch-normal')?.addEventListener('click', () => {
        currentViewMode = 'normal';
        renderModalContent();
    });

    // Listen for orientation changes to auto-switch layout
    setupOrientationListener();
}

/**
 * Build prev/next navigation buttons HTML.
 */
function buildNavButtons() {
    if (currentVideos.length <= 1) return '';
    return `
        <div class="media-modal-nav">
            <button class="media-nav-btn media-nav-prev" id="media-nav-prev" title="Anterior">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="media-nav-counter">${currentIndex + 1} / ${currentVideos.length}</span>
            <button class="media-nav-btn media-nav-next" id="media-nav-next" title="Siguiente">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    `;
}

/**
 * Attach event listeners for prev/next navigation (circular).
 */
function setupNavListeners() {
    document.getElementById('media-nav-prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + currentVideos.length) % currentVideos.length;
        currentViewMode = null;
        renderModalContent();
    });
    document.getElementById('media-nav-next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % currentVideos.length;
        currentViewMode = null;
        renderModalContent();
    });
}

/**
 * Setup "Ver más" / "Ver menos" toggle for description.
 */
function setupDescToggle(fullDesc, shortDesc) {
    const toggle = document.getElementById('media-desc-toggle');
    const descEl = document.getElementById('media-modal-desc');
    if (!toggle || !descEl) return;

    let expanded = false;
    toggle.addEventListener('click', () => {
        expanded = !expanded;
        descEl.textContent = expanded ? fullDesc : shortDesc;
        toggle.textContent = expanded ? 'Ver menos' : 'Ver más';
        if (expanded) {
            descEl.classList.add('media-desc-expanded');
        } else {
            descEl.classList.remove('media-desc-expanded');
        }
    });
}

/**
 * Listen for orientation/resize changes to auto-adapt layout.
 */
let orientationHandler = null;
function setupOrientationListener() {
    // Remove previous listener if exists
    if (orientationHandler) {
        window.removeEventListener('resize', orientationHandler);
        window.removeEventListener('orientationchange', orientationHandler);
    }

    orientationHandler = () => {
        const video = currentVideos[currentIndex];
        if (!video) return;

        const isNowLandscape = window.matchMedia('(orientation: landscape)').matches;

        // If user rotated to landscape and we had rotated mode, switch to normal
        if (video.formato === 'horizontal' && isNowLandscape && currentViewMode === 'rotated') {
            currentViewMode = 'normal';
            renderModalContent();
        }
    };

    window.addEventListener('resize', orientationHandler);
    window.addEventListener('orientationchange', orientationHandler);
}
