// ===========================================
// Vitrina Preview (Home Page)
// ===========================================

import { fetchVitrinaData } from './vitrina-data.js';
import { createVitrinaCard } from './vitrina-card.js';

export async function loadVitrina() {
    const container = document.getElementById('vitrina-grid');

    if (!container) return;

    try {
        const validNoticias = await fetchVitrinaData({ requireDate: true });

        container.innerHTML = '';

        if (validNoticias.length === 0) {
            container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No hay noticias disponibles en este momento.</p>';
            return;
        }

        // Deterministic selection (First 3 valid items)
        const selected = validNoticias.slice(0, Math.min(3, validNoticias.length));

        // Render
        selected.forEach(data => {
            container.appendChild(createVitrinaCard(data));
        });

    } catch (err) {
        console.error('Error Vitrina:', err);
        container.innerHTML = '<p class="text-center error" style="grid-column: 1/-1;">Error cargando la vitrina.</p>';
    }
}
