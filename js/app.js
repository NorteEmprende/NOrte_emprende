// ===========================================
// App Entry Point
// Used by: index.html, comunidad.html
// ===========================================

// UI
import { setupMobileMenu, setupSmoothScroll } from './ui/navigation.js';
import { setupModalListeners } from './ui/modal.js';
import { setupWhatsAppButton } from './ui/whatsapp.js';

// Features
import { updateCounter } from './features/counter.js';
import { initMap } from './features/map.js';
import { renderRutasNextGen } from './features/rutas.js';
import { setupPostulacionModal } from './features/postulacion.js';
import { setupConsultaResultados } from './features/resultados.js';

// Comunidad
import { loadComunidadFromCSV } from './features/comunidad/comunidad-preview.js';
import { loadComunidadPage } from './features/comunidad/comunidad-page.js';

// Vitrina
import { loadVitrina } from './features/vitrina/vitrina-preview.js';

// Media
import { loadMediaPreview } from './features/media/media-preview.js';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // 1. Navbar Toggle
    setupMobileMenu();

    // 2. Smooth Scroll
    setupSmoothScroll();

    // 3. Dynamic Counter
    const counterEl = document.getElementById('postulaciones-count');
    if (counterEl) updateCounter();

    // 4. Load Dynamic Content
    const communityGrid = document.getElementById('emprendimientos-grid');
    if (communityGrid) loadComunidadFromCSV();

    const fullCommunityGrid = document.getElementById('comunidad-full-grid');
    if (fullCommunityGrid) loadComunidadPage();

    // 5. Setup Modal Close Listeners
    setupModalListeners();

    // 6. Init Map
    const mapEl = document.getElementById('map');
    if (mapEl) initMap();

    // 7. Load Vitrina (Main Page Version)
    const vitrinaGrid = document.getElementById('vitrina-grid');
    if (vitrinaGrid) loadVitrina();

    // 7b. Load NextGen Media Preview
    const mediaGrid = document.getElementById('nextgen-media-grid');
    if (mediaGrid) loadMediaPreview();

    // 8. Load Rutas NextGen
    const rutasContainer = document.getElementById('rutas-container');
    if (rutasContainer) renderRutasNextGen();

    // 9. WhatsApp Button Logic
    setupWhatsAppButton();

    // 10. Postulation Modal
    setupPostulacionModal();

    // 11. Consulta Resultados
    setupConsultaResultados();
}
