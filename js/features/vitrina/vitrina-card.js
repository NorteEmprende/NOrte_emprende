// ===========================================
// Vitrina Card Component
// ===========================================

import { FALLBACK_IMAGE } from '../../config/constants.js';
import { escapeHtml } from '../../utils/text.js';
import { openVitrinaModal } from './vitrina-modal.js';

// Track active carousel intervals for cleanup
const activeCarousels = new WeakMap();

export function createVitrinaCard(data) {
    const div = document.createElement('div');
    div.className = 'vitrina-card';

    const safeTitulo = escapeHtml(data.titulo);
    const safeMuni = escapeHtml(data.municipio);
    const safeFecha = escapeHtml(data.fecha);

    const imagenes = data.imagenes && data.imagenes.length > 0
        ? data.imagenes
        : [data.imgUrl || FALLBACK_IMAGE];

    const hasMultipleImages = imagenes.length > 1;

    // Build image area HTML
    let imgAreaHtml = '';

    if (hasMultipleImages) {
        // Carousel with multiple images
        const slidesHtml = imagenes.map((src, i) => `
            <div class="vitrina-carousel-slide${i === 0 ? ' active' : ''}">
                <img src="${src}" alt="${safeTitulo}" loading="lazy"
                     onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
            </div>
        `).join('');

        const dotsHtml = imagenes.map((_, i) => `
            <span class="vitrina-carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>
        `).join('');

        imgAreaHtml = `
            <div class="vitrina-card-img vitrina-carousel" data-carousel>
                <div class="vitrina-carousel-track">
                    ${slidesHtml}
                </div>
                <div class="vitrina-carousel-dots">
                    ${dotsHtml}
                </div>
                <div class="vitrina-carousel-counter">
                    <i class="fa-regular fa-images"></i> 1/${imagenes.length}
                </div>
                <div class="vitrina-card-tag">${safeMuni}</div>
            </div>
        `;
    } else {
        // Single image (original behavior)
        const imgSrc = imagenes[0];
        imgAreaHtml = `
            <div class="vitrina-card-img">
                <img src="${imgSrc}" alt="${safeTitulo}" loading="lazy"
                     onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
                <div class="vitrina-card-tag">${safeMuni}</div>
            </div>
        `;
    }

    div.innerHTML = `
        ${imgAreaHtml}
        <div class="vitrina-card-content">
            <span class="vitrina-card-date"><i class="fa-regular fa-calendar"></i> ${safeFecha}</span>
            <h3 class="vitrina-card-title">${safeTitulo}</h3>
            <div class="vitrina-card-footer">
                <span>Leer más <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </div>
    `;

    // Initialize carousel if multiple images
    if (hasMultipleImages) {
        initCardCarousel(div, imagenes.length);
    }

    div.addEventListener('click', () => {
        openVitrinaModal(data);
    });

    return div;
}

/**
 * Initializes the auto-rotating carousel on a card element.
 * Uses IntersectionObserver to pause when offscreen.
 */
function initCardCarousel(cardEl, totalSlides) {
    let currentIndex = 0;
    const carousel = cardEl.querySelector('[data-carousel]');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.vitrina-carousel-slide');
    const dots = carousel.querySelectorAll('.vitrina-carousel-dot');
    const counter = carousel.querySelector('.vitrina-carousel-counter');

    function goToSlide(index) {
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        currentIndex = index;

        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');

        if (counter) {
            counter.innerHTML = `<i class="fa-regular fa-images"></i> ${currentIndex + 1}/${totalSlides}`;
        }
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % totalSlides);
    }

    // Dot click navigation (stop propagation to avoid opening modal)
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(dot.dataset.index, 10);
            goToSlide(idx);
            // Reset auto-play timer on manual interaction
            stopAutoPlay();
            startAutoPlay();
        });
    });

    let intervalId = null;

    function startAutoPlay() {
        if (intervalId) return;
        intervalId = setInterval(nextSlide, 3500);
    }

    function stopAutoPlay() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Use IntersectionObserver to only run carousel when visible
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAutoPlay();
                } else {
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(cardEl);
        activeCarousels.set(cardEl, { stop: stopAutoPlay, observer });
    } else {
        // Fallback: always auto-play
        startAutoPlay();
        activeCarousels.set(cardEl, { stop: stopAutoPlay });
    }
}
