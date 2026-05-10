// ===========================================
// Comunidad Full Page
// ===========================================

import { fetchComunidadData } from './comunidad-data.js';
import { createCommunityCard } from './comunidad-card.js';
import { populateFilters, setupFilterListeners, setGlobalComunidadData } from './comunidad-filters.js';

export async function loadComunidadPage() {
    const container = document.getElementById('comunidad-full-grid');
    if (!container) return;

    const data = await fetchComunidadData();
    setGlobalComunidadData(data); // Save for filters

    // Populate Filters
    populateFilters(data);

    // Initial Render (All)
    renderComunidadGrid(data);

    // Setup Listeners
    setupFilterListeners();
}

export function renderComunidadGrid(dataList) {
    const container = document.getElementById('comunidad-full-grid');
    const noResults = document.getElementById('no-results-message');

    container.innerHTML = '';

    if (dataList.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';

    dataList.forEach(item => {
        container.appendChild(createCommunityCard(item));
    });
}
