// ===========================================
// Vitrina Card Component
// ===========================================

import { FALLBACK_IMAGE } from '../../config/constants.js';
import { escapeHtml } from '../../utils/text.js';
import { openVitrinaModal } from './vitrina-modal.js';

export function createVitrinaCard(data) {
    const div = document.createElement('div');
    div.className = 'vitrina-card';

    const imgSrc = data.imgUrl || FALLBACK_IMAGE;
    const safeTitulo = escapeHtml(data.titulo);
    const safeMuni = escapeHtml(data.municipio);
    const safeFecha = escapeHtml(data.fecha);

    div.innerHTML = `
        <div class="vitrina-card-img">
            <img src="${imgSrc}" alt="${safeTitulo}" loading="lazy"
                 onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
            <div class="vitrina-card-tag">${safeMuni}</div>
        </div>
        <div class="vitrina-card-content">
            <span class="vitrina-card-date"><i class="fa-regular fa-calendar"></i> ${safeFecha}</span>
            <h3 class="vitrina-card-title">${safeTitulo}</h3>
            <div class="vitrina-card-footer">
                <span>Leer más <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </div>
    `;

    div.addEventListener('click', () => {
        openVitrinaModal(data);
    });

    return div;
}
