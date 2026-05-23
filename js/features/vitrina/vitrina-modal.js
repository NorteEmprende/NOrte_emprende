// ===========================================
// Vitrina Modal
// ===========================================

import { FALLBACK_IMAGE } from '../../config/constants.js';
import { escapeHtml } from '../../utils/text.js';
import { openModal, closeModal } from '../../ui/modal.js';

export function openVitrinaModal(data) {
    const safeTitulo = escapeHtml(data.titulo);
    const safeMuni = escapeHtml(data.municipio);
    const safeFecha = escapeHtml(data.fecha);
    const safeDesc = escapeHtml(data.descripcion);

    const imagenes = data.imagenes && data.imagenes.length > 0
        ? data.imagenes
        : [data.imgUrl || FALLBACK_IMAGE];

    const mainImgSrc = imagenes[0];
    const hasMultipleImages = imagenes.length > 1;

    // Build thumbnail gallery HTML
    let thumbnailsHtml = '';
    if (hasMultipleImages) {
        const thumbItems = imagenes.map((src, i) => `
            <div class="vitrina-modal-thumb${i === 0 ? ' active' : ''}" data-thumb-index="${i}">
                <img src="${src}" alt="${safeTitulo} - Foto ${i + 1}"
                     onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
            </div>
        `).join('');

        thumbnailsHtml = `
            <div class="vitrina-modal-thumbnails">
                ${thumbItems}
            </div>
        `;
    }

    const contentHtml = `
        <div class="vitrina-modal-container">
            <div class="vitrina-modal-header">
                <div class="vitrina-modal-featured-img">
                    <img id="vitrina-modal-main-img" src="${mainImgSrc}" alt="${safeTitulo}"
                         onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
                </div>
                ${thumbnailsHtml}
                <div class="vitrina-modal-meta">
                    <span class="m-tag"><i class="fa-solid fa-location-dot"></i> ${safeMuni}</span>
                    <span class="d-tag"><i class="fa-regular fa-calendar"></i> ${safeFecha}</span>
                </div>
                <h2 class="vitrina-modal-title">${safeTitulo}</h2>
            </div>
            <div class="vitrina-modal-body">
                <p class="vitrina-modal-description">${safeDesc}</p>
            </div>
            <div class="vitrina-modal-footer">
                <button class="btn btn-secondary close-vitrina-modal">Cerrar / Volver</button>
            </div>
        </div>
    `;

    openModal(contentHtml);

    // Setup internal close button
    const closeBtn = document.querySelector('.close-vitrina-modal');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal();
    }

    // Setup thumbnail click behavior
    if (hasMultipleImages) {
        const mainImg = document.getElementById('vitrina-modal-main-img');
        const thumbs = document.querySelectorAll('.vitrina-modal-thumb');

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.dataset.thumbIndex, 10);
                const newSrc = imagenes[idx];

                // Update active state
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');

                // Animate main image swap
                if (mainImg) {
                    mainImg.style.opacity = '0';
                    setTimeout(() => {
                        mainImg.src = newSrc;
                        mainImg.style.opacity = '1';
                    }, 200);
                }
            });
        });
    }
}
