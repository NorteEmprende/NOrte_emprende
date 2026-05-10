// ===========================================
// Postulación Modal
// ===========================================

import { openModal } from '../ui/modal.js';
import { POSTULACION_URLS } from '../config/constants.js';

export function setupPostulacionModal() {
    const btn = document.getElementById('btn-postulacion');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const contentHtml = `
            <div class="postulacion-modal-container">
                <h2 class="postulacion-modal-title">Selecciona tu método de postulación</h2>
                <p class="postulacion-modal-text">
                    Si tienes una cuenta de Gmail activa, te recomendamos usar el formulario oficial. 
                    Si no tienes cuenta Gmail, puedes usar la alternativa.
                </p>
                <div class="postulacion-buttons">
                    <a href="${POSTULACION_URLS.gmail}" 
                       target="_blank" 
                       class="btn btn-primary btn-full-width">
                       <i class="fa-brands fa-google"></i> Tengo cuenta Gmail
                    </a>
                    
                    <a href="${POSTULACION_URLS.noGmail}" 
                       target="_blank" 
                       class="btn-outline-secondary btn-full-width">
                       No tengo cuenta Gmail
                    </a>
                </div>
            </div>
        `;

        openModal(contentHtml);
    });
}
