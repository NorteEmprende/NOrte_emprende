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
    const imgSrc = data.imgUrl || FALLBACK_IMAGE;

    const contentHtml = `
        <div class="vitrina-modal-container">
            <div class="vitrina-modal-header">
                <div class="vitrina-modal-featured-img">
                    <img src="${imgSrc}" alt="${safeTitulo}"
                         onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
                </div>
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
}
