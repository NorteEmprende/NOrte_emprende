// ===========================================
// Comunidad Filters
// ===========================================

import { renderComunidadGrid } from './comunidad-page.js';

let globalComunidadData = [];

export function setGlobalComunidadData(data) {
    globalComunidadData = data;
}

export function getGlobalComunidadData() {
    return globalComunidadData;
}

export function populateFilters(data) {
    const muniSelect = document.getElementById('filter-municipio');
    const sectorSelect = document.getElementById('filter-sector');

    if (!muniSelect || !sectorSelect) return;

    // Get unique Municipios
    const municipios = [...new Set(data.map(item => item.municipio))].sort();
    municipios.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        muniSelect.appendChild(opt);
    });

    // Get unique Sectors
    const sectors = [...new Set(data.map(item => item.negocioTipo))].sort();
    sectors.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        sectorSelect.appendChild(opt);
    });
}

export function setupFilterListeners() {
    const muniSelect = document.getElementById('filter-municipio');
    const sectorSelect = document.getElementById('filter-sector');

    if (!muniSelect || !sectorSelect) return;

    const filterFn = () => {
        const mVal = muniSelect.value;
        const sVal = sectorSelect.value;

        const filtered = globalComunidadData.filter(item => {
            const matchMuni = (mVal === 'Todos') || (item.municipio === mVal);
            const matchSector = (sVal === 'Todos') || (item.negocioTipo === sVal);
            return matchMuni && matchSector;
        });

        renderComunidadGrid(filtered);
    };

    muniSelect.addEventListener('change', filterFn);
    sectorSelect.addEventListener('change', filterFn);
}

export function resetFilters() {
    const muniSelect = document.getElementById('filter-municipio');
    const sectorSelect = document.getElementById('filter-sector');
    if (muniSelect) muniSelect.value = 'Todos';
    if (sectorSelect) sectorSelect.value = 'Todos';
    renderComunidadGrid(globalComunidadData);
}

// Expose resetFilters globally for onclick="resetFilters()" in comunidad.html
window.resetFilters = resetFilters;
