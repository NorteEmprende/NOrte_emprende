document.addEventListener('DOMContentLoaded', () => {
    initNoticias();
});

let allNoticias = []; // Global store for filtering

async function initNoticias() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSoXg_RmaJauLIOX_6OyFrncfQZhbPBOXqT4eiaQeThlN4H2Sjx4OgNZbykUC0VyIRiguVL4FMFcXo_/pub?gid=0&single=true&output=csv';
    const container = document.getElementById('noticias-history-grid');
    const filterSelect = document.getElementById('municipio-filter');

    if (!container) return;

    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        const rows = parseRobustCSV(text);

        const dataRows = rows.slice(1); // Skip header

        // 1. ROBUST FILTER & MAPPING
        allNoticias = dataRows.map(cols => {
            // Must have min 6 columns and basic required fields (Title, Municipio)
            if (cols.length < 6) return null;
            if (!cols[1] || cols[1].trim() === '' || !cols[2] || cols[2].trim() === '') return null;

            return {
                titulo: cols[1].trim(),
                municipio: normalizeText(cols[2]),
                descripcion: cols[3] || '',
                imgUrl: convertDriveLink(cols[4]),
                fecha: cols[5] || ''
            };
        }).filter(item => item !== null);

        // 1. Populate Filter
        populateMunicipioFilter(allNoticias, filterSelect);

        // 2. Initial Render
        renderNoticias(allNoticias, container);

        // 3. Setup Filter Listener
        filterSelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            const filtered = selected === 'all'
                ? allNoticias
                : allNoticias.filter(n => n.municipio === selected);
            renderNoticias(filtered, container);
        });

    } catch (err) {
        console.error('Error Historical Vitrina:', err);
        container.innerHTML = '<p class="text-center error">Error cargando el histórico de noticias.</p>';
    }
}

function populateMunicipioFilter(data, select) {
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
