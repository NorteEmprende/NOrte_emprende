// ===========================================
// Vitrina History (Noticias Page)
// ===========================================

import { fetchVitrinaData } from './vitrina-data.js';
import { createVitrinaCard } from './vitrina-card.js';

let allNoticias = []; // Global store for filtering

export async function initNoticias() {
    const container = document.getElementById('noticias-history-grid');
    const filterSelect = document.getElementById('municipio-filter');

    if (!container) return;

    try {
        allNoticias = await fetchVitrinaData({ requireDate: false });

        // 1. Populate Filter
        populateMunicipioFilter(allNoticias, filterSelect);

        // 2. Initial Render
        renderNoticias(allNoticias, container);

        // 3. Setup Filter Listener
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const selected = e.target.value;
                const filtered = selected === 'all'
                    ? allNoticias
                    : allNoticias.filter(n => n.municipio === selected);
                renderNoticias(filtered, container);
            });
        }

    } catch (err) {
        console.error('Error Historical Vitrina:', err);
        container.innerHTML = '<p class="text-center error">Error cargando el histórico de noticias.</p>';
    }
}

function populateMunicipioFilter(data, select) {
    if (!select) return;

    const municipios = [...new Set(data.map(n => n.municipio))].sort();

    municipios.forEach(mun => {
        if (!mun) return;
        const option = document.createElement('option');
        option.value = mun;
        option.textContent = mun;
        select.appendChild(option);
    });
}

function renderNoticias(data, container) {
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No hay noticias que coincidan con el filtro.</p>';
        return;
    }

    data.forEach(item => {
        container.appendChild(createVitrinaCard(item));
    });
}
