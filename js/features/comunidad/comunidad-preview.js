// ===========================================
// Comunidad Preview (Home Page)
// ===========================================

import { fetchComunidadData } from './comunidad-data.js';
import { createCommunityCard } from './comunidad-card.js';

// Home Logic (Preview) - Shows max 3 items on index.html
export async function loadComunidadFromCSV() {
    const container = document.getElementById('emprendimientos-grid');
    if (!container) return; // Not on home page or wrong section

    const data = await fetchComunidadData();

    if (data.length === 0) {
        container.innerHTML = '<p class="text-center">No hay emprendimientos disponibles.</p>';
        return;
    }

    // Logic: Show max 3 items, in order (no shuffle)
    const previewData = data.slice(0, 3);

    container.innerHTML = '';
    previewData.forEach(item => {
        container.appendChild(createCommunityCard(item));
    });

    // Ensure the "Ver Todos" button exists
    // (It might be added manually in HTML, but this ensures robustness)
    // We expect it to be hardcoded in HTML as per plan, so no action needed here.
}
