document.addEventListener('DOMContentLoaded', () => {
    initNoticias();
});

let allNoticias = []; // Global store for filtering

async function initNoticias() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5wG7maDoWY1HJrLAF9bJBFKs8B1loTiOn1SYuzS9_gr50-JwMAoArtKAP8wLIBYSVqHT_FIbNlyaC/pub?gid=372344697&single=true&output=csv';
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
                imgUrl: driveToDirectImageUrl((cols[4] || '').trim()),
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
// -----------------------------------------------------------------------------
// Utilities (Copied from app.js to ensure standalone functionality)
// -----------------------------------------------------------------------------

function parseRobustCSV(csvText) {
    const result = [];
    let row = [];
    let cell = '';
    let inQuote = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (inQuote && nextChar === '"') {
                cell += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            row.push(cell.trim());
            cell = '';
        } else if ((char === '\r' || char === '\n') && !inQuote) {
            if (cell !== '' || row.length > 0) {
                row.push(cell.trim());
                result.push(row);
                cell = '';
                row = [];
            }
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            cell += char;
        }
    }
    if (cell !== '' || row.length > 0) {
        row.push(cell.trim());
        result.push(row);
    }
    return result;
}

function driveToDirectImageUrl(url) {
    const originalUrl = (url || '').trim();
    if (!originalUrl) return 'img/LOGO NEXT GEN .png';

    if (originalUrl.includes('lh3.googleusercontent.com') || originalUrl.includes('drive.google.com/thumbnail')) {
        return originalUrl;
    }

    const idMatch = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        originalUrl.match(/id=([a-zA-Z0-9_-]+)/);

    if (idMatch && idMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w1200`;
    }
    return 'img/LOGO NEXT GEN .png';
}

function normalizeText(text) {
    if (!text) return '';
    return text.trim();
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function extractDriveId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

// -----------------------------------------------------------------------------
// UI Rendering Logic (Vitrina Cards & Modals)
// -----------------------------------------------------------------------------

function createVitrinaCard(data) {
    const div = document.createElement('div');
    div.className = 'vitrina-card';

    const imgSrc = data.imgUrl || 'img/LOGO NEXT GEN .png';
    const safeTitulo = escapeHtml(data.titulo);
    const safeMuni = escapeHtml(data.municipio);
    const safeFecha = escapeHtml(data.fecha);

    div.innerHTML = `
        <div class="vitrina-card-img">
            <img src="${imgSrc}" alt="${safeTitulo}" loading="lazy"
                 onerror="this.onerror=null; this.src='img/LOGO NEXT GEN .png'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
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

function openVitrinaModal(data) {
    const safeTitulo = escapeHtml(data.titulo);
    const safeMuni = escapeHtml(data.municipio);
    const safeFecha = escapeHtml(data.fecha);
    const safeDesc = escapeHtml(data.descripcion);
    const imgSrc = data.imgUrl || 'img/LOGO NEXT GEN .png';

    const contentHtml = `
        <div class="vitrina-modal-container">
            <div class="vitrina-modal-header">
                <div class="vitrina-modal-featured-img">
                    <img src="${imgSrc}" alt="${safeTitulo}"
                         onerror="this.onerror=null; this.src='img/LOGO NEXT GEN .png'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
                </div>
                <div class="vitrina-modal-meta">
                    <span class="m-tag"><i class="fa-solid fa-location-dot"></i> ${safeMuni}</span>
                    <span class="d-tag"><i class="fa-regular fa-calendar"></i> ${safeFecha}</span>
                </div>
                <h2 class="vitrina-modal-title">${safeTitulo}</h2>
            </div>
            <div class="vitrina-modal-body">
                <p class="vitrina-modal-description">${safeDesc}</p>
            </div>
            <div class="vitrina-modal-footer">
                <button class="btn btn-secondary close-vitrina-modal">Cerrar / Volver</button>
            </div>
        </div>
    `;

    openModal(contentHtml);

    // Setup internal close button
    const closeBtn = document.querySelector('.close-vitrina-modal');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal();
    }
}

// Modal System (Simplified for Noticias Page)
function openModal(content) {
    const modal = document.getElementById("media-modal");
    const modalBody = document.getElementById("modal-body");

    // Ensure modal exists in Noticias.html
    if (!modal || !modalBody) {
        console.error("Modal container not found!");
        return;
    }

    modalBody.innerHTML = content;
    modal.style.display = "flex";

    // Setup generic close listeners if not already existing
    const closeBtn = modal.querySelector(".close-modal");
    if (closeBtn) closeBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };
}

function closeModal() {
    const modal = document.getElementById("media-modal");
    if (modal) {
        modal.style.display = "none";
        const modalBody = document.getElementById("modal-body");
        if (modalBody) modalBody.innerHTML = "";
    }
}
