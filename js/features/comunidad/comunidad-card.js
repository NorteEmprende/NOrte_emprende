// ===========================================
// Comunidad Card
// ===========================================

import { FALLBACK_IMAGE } from '../../config/constants.js';
import { escapeHtml } from '../../utils/text.js';
import { openCommunityModal } from './comunidad-modal.js';

export function createCommunityCard(data) {
    const div = document.createElement('div');
    div.className = 'emprendimiento-card';

    // Protagonist Image (Col 10-Business Img)
    const imgSrc = data.negocioImg || FALLBACK_IMAGE;
    const safeNombre = escapeHtml(data.negocioNombre);
    const safeMuni = escapeHtml(data.municipio);
    const safeTipo = escapeHtml(data.negocioTipo);

    div.innerHTML = `
        <div class="video-thumbnail">
            <span class="card-tag">${safeMuni}</span>
            <img src="${imgSrc}" alt="${safeNombre}" loading="lazy" 
                 onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
        </div>
        <div class="card-info">
            <div class="card-text-group">
                <h3>${safeNombre}</h3>
                <p class="category">${safeTipo}</p>
            </div>
            <button class="btn-card-outline">Ver Perfil Completo</button>
        </div>
    `;

    div.addEventListener('click', () => {
        openCommunityModal(data);
    });

    return div;
}
