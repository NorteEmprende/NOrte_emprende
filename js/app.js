
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // 1. Navbar Toggle
    setupMobileMenu();

    // 2. Smooth Scroll
    setupSmoothScroll();

    // 3. Dynamic Counter
    updateCounter();

    // 4. Load Dynamic Content (CSV)
    loadFromCSV();

    // 5. Setup Modal Close Listeners
    setupModalListeners();

    // 6. Init Map
    initMap();

    // 7. Load Vitrina
    loadVitrina();
}

/* =========================================
   UI Interactivity
   ========================================= */

function setupMobileMenu() {
    const burger = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');

    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
            burger.classList.toggle('toggle');
        });
    }
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Close mobile menu if open
                document.querySelector('.nav-links').classList.remove('active');

                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Header offset
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupModalListeners() {
    const modal = document.getElementById("media-modal");
    const closeBtn = document.querySelector(".close-modal");

    if (modal) {
        // Click on X
        closeBtn.onclick = () => closeModal();

        // Click outside
        window.onclick = (event) => {
            if (event.target == modal) {
                closeModal();
            }
        };
    }
}

function closeModal() {
    const modal = document.getElementById("media-modal");
    const modalBody = document.getElementById("modal-body");
    modal.style.display = "none";
    modalBody.innerHTML = ""; // Stop video
}

function openModal(content) {
    const modal = document.getElementById("media-modal");
    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = content;
    modal.style.display = "flex";
}

/* =========================================
   Map Initialization
   ========================================= */
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Centered roughly on Norte de Santander
    const map = L.map('map').setView([8.0, -73.0], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const municipios = [
        { name: "Ábrego", lat: 8.081, lng: -73.216 },
        { name: "Arboledas", lat: 7.643, lng: -72.784 },
        { name: "Bochalema", lat: 7.610, lng: -72.645 },
        { name: "Cáchira", lat: 7.740, lng: -73.048 },
        { name: "Chitagá", lat: 7.135, lng: -72.663 },
        { name: "Convención", lat: 8.435, lng: -73.214 },
        { name: "Cúcuta", lat: 7.8939, lng: -72.5078 },
        { name: "El Carmen", lat: 8.509, lng: -73.447 },
        { name: "El Zulia", lat: 7.930, lng: -72.600 },
        { name: "La Playa de Belén", lat: 8.232, lng: -73.238 },
        { name: "Los Patios", lat: 7.8464, lng: -72.5036 },
        { name: "Ocaña", lat: 8.2373, lng: -73.3560 },
        { name: "Pamplona", lat: 7.3756, lng: -72.6473 },
        { name: "Puerto Santander", lat: 8.356, lng: -72.436 },
        { name: "San Calixto", lat: 8.4, lng: -73.15 },
        { name: "Sardinata", lat: 8.083, lng: -72.8 },
        { name: "Salazar de las Palmas", lat: 7.776, lng: -72.813 },
        { name: "Teorama", lat: 8.435, lng: -73.284 },
        { name: "Tibú", lat: 8.6397, lng: -72.7358 },
        { name: "Toledo", lat: 7.307, lng: -72.482 },
        { name: "Villa del Rosario", lat: 7.8336, lng: -72.4739 }
    ];

    municipios.forEach(mun => {
        L.marker([mun.lat, mun.lng])
            .addTo(map)
            .bindPopup(`<b>${mun.name}</b><br>Municipio Beneficiado`);
    });
}

/* =========================================
   Data Loading & Rendering (Refactored)
   ========================================= */

// Regex based CSV parser to handle quoted strings containing commas
function parseCSVLine(line) {
    const matches = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            matches.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            current = '';
        } else {
            current += char;
        }
    }
    matches.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return matches;
}

function getThumbnailUrl(url) {
    if (!url) return null;

    // Check for Drive URL
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=w800`;
    }

    // Return original if it looks like an image URL
    if (url.match(/^http/)) {
        return url;
    }

    return null;
}

function extractDriveId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

/* --- Comunidad Emprendedora --- */

async function loadFromCSV() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkc4vazCHrgzXe9gkhMqZPKEQFor5493mm9iwZ8AqUO3wLMl4WbmJvv6leMBrmRlwX9bOF0-mzsZOF/pub?gid=0&single=true&output=csv';
    const container = document.getElementById('emprendimientos-grid');

    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        const lines = text.split('\n').filter(l => l.trim() !== '');

        // Skip header
        const rows = lines.slice(1);

        container.innerHTML = '';

        if (rows.length === 0) {
            container.innerHTML = '<p class="text-center" style="grid-column:1/-1">No hay contenido aún.</p>';
            return;
        }

        rows.forEach(row => {
            const cols = parseCSVLine(row);
            if (cols.length < 3) return; // Need at least date, desc, url

            // Expected Cols: [Fecha, Descripcion, URL]
            // Note: Description may be split if we used simple splitting in old code, 
            // but parseCSVLine handles quotes correctly. 
            // If the sheet doesn't use quotes for commas, parseCSVLine behaves like split(',') basically.

            const fecha = cols[0];
            const url = cols[cols.length - 1];
            // Description is everything in between
            let descripcion = cols.slice(1, cols.length - 1).join(', ');

            if (url) {
                container.appendChild(createCommunityCard(fecha, descripcion, url));
            }
        });

    } catch (err) {
        console.error('Error Comunidad:', err);
        container.innerHTML = '<p class="text-center error">Error cargando información.</p>';
    }
}

function createCommunityCard(fecha, descripcion, url) {
    const div = document.createElement('div');
    div.className = 'emprendimiento-card';
    div.style.cursor = 'pointer';

    const thumbUrl = getThumbnailUrl(url);

    // Fallback image (Logo) only if no thumb
    const imgSrc = thumbUrl || 'img/LOGO NEXT GEN .png';
    const imgStyle = thumbUrl ? 'object-fit:cover;' : 'object-fit:contain; padding:20px;';

    const safeDesc = escapeHtml(descripcion);
    const safeFecha = escapeHtml(fecha);
    const safeUrl = url;

    div.innerHTML = `
        <div class="video-thumbnail" style="background:#f4f4f4;">
            <img src="${imgSrc}" alt="Emprendimiento" loading="lazy" style="width:100%; height:100%; ${imgStyle}">
        </div>
        <div class="card-info">
            <small style="color:#999;">${safeFecha}</small>
            <h3 style="font-size:1rem; margin-top:5px;">${safeDesc}</h3>
        </div>
    `;

    // Add Click listener
    div.addEventListener('click', () => {
        openMediaModal(safeUrl, safeDesc, safeFecha);
    });

    return div;
}

/* --- Vitrina NextGen --- */

async function loadVitrina() {
    // UPDATED URL (GViz)
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR47D7VTJJ_9R2D9XJ9g7o5LOmSn8btq2pyAaHBEZpwxp9Nt4aonVSNY__b5EUAifASAsahzYoMLFtD/gviz/tq?tqx=out:csv&gid=0';
    const container = document.getElementById('vitrina-grid');

    if (!container) return;

    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        const lines = text.split('\n').filter(l => l.trim() !== '');

        const rows = lines.slice(1); // Skip header

        container.innerHTML = '';

        let hasContent = false;

        rows.forEach(row => {
            const cols = parseCSVLine(row);
            // Expected: [Imagen_URL, Descripcion, Fecha, Activo]
            if (cols.length < 2) return;

            const imgUrl = cols[0].replace(/^"|"$/g, '');
            const actifCol = cols[cols.length - 1] || '';
            const activo = actifCol.toLowerCase().replace(/^"|"$/g, '');
            const fechaCol = cols[cols.length - 2] || '';
            const fecha = fechaCol.replace(/^"|"$/g, '');

            const descParts = cols.slice(1, cols.length - 2);
            const descripcion = descParts.join(', ').replace(/^"|"$/g, '');

            // Check Active
            if (activo === 'si' || activo === 'true' || activo === '1' || activo === 'yes') {
                if (imgUrl.trim()) {
                    container.appendChild(createVitrinaCard(imgUrl.trim(), descripcion, fecha));
                    hasContent = true;
                }
            }
        });

        if (!hasContent) {
            container.innerHTML = '<p class="text-center" style="grid-column:1/-1">Próximamente más contenido.</p>';
        }

    } catch (err) {
        console.error('Error Vitrina:', err);
        container.innerHTML = '<p class="text-center">Próximamente más contenido.</p>';
    }
}

function createVitrinaCard(imgUrl, descripcion, fecha) {
    const div = document.createElement('div');
    div.className = 'emprendimiento-card';
    div.style.cursor = 'pointer';

    // Thumbnail logic
    const thumbUrl = getThumbnailUrl(imgUrl);
    const imgSrc = thumbUrl || 'img/LOGO NEXT GEN .png';
    const imgStyle = thumbUrl ? 'object-fit:cover;' : 'object-fit:contain; padding:20px;';

    const safeDesc = escapeHtml(descripcion);
    const safeFecha = escapeHtml(fecha);

    div.innerHTML = `
        <div class="video-thumbnail" style="background:#f4f4f4;">
             <img src="${imgSrc}" alt="Vitrina" loading="lazy" style="width:100%; height:100%; ${imgStyle}">
        </div>
        <div class="card-info">
            <small style="color:#999;">${safeFecha}</small>
            <h3 style="font-size:1rem; margin-top:5px;">${safeDesc.substring(0, 60)}${safeDesc.length > 60 ? '...' : ''}</h3>
        </div>
    `;

    div.addEventListener('click', () => {
        openMediaModal(imgUrl, safeDesc, safeFecha);
    });

    return div;
}

/* --- Shared Modal Logic --- */

function openMediaModal(urlOrId, description, date) {
    const modal = document.getElementById("media-modal");
    if (!modal) return;

    const driveId = extractDriveId(urlOrId);
    let contentHtml = '';

    // 1. Is it a Drive File? -> Iframe Preview
    if (driveId) {
        const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        contentHtml = `<iframe src="${embedUrl}" width="100%" height="500px" style="border:none; background:#000;"></iframe>`;
    }
    // 2. Is it a direct Image URL? -> Img Tag
    else if (urlOrId.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i) || urlOrId.startsWith('http')) {
        contentHtml = `<img src="${urlOrId}" style="max-width:100%; max-height:70vh; border-radius:4px; object-fit:contain;">`;
    }
    else {
        contentHtml = `<p>Contenido no visualizable.</p>`;
    }

    const bodyHtml = `
        <div style="text-align:center; width:100%;">
            ${contentHtml}
            <div style="text-align:left; max-width:800px; margin:15px auto 0; padding:10px; background:#fff; border-radius:8px;">
                <p style="color:#666; font-size:0.85rem; margin-bottom:5px;"><i class="fa-regular fa-calendar"></i> ${date || ''}</p>
                <h3 style="color:var(--primary-color); line-height:1.4;">${description || ''}</h3>
            </div>
        </div>
    `;

    openModal(bodyHtml);
}

/* =========================================
   Supabase (Counter Only)
   ========================================= */

async function updateCounter() {
    const counterEl = document.getElementById('postulaciones-count');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkc4vazCHrgzXe9gkhMqZPKEQFor5493mm9iwZ8AqUO3wLMl4WbmJvv6leMBrmRlwX9bOF0-mzsZOF/pub?gid=0&single=true&output=csv';

    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        const rows = text.split('\n').slice(1).filter(row => row.trim() !== ''); // Skip header and empty rows
        const count = rows.length;

        // Animate counter
        animateValue(counterEl, 0, count, 2000);

    } catch (err) {
        console.error('Error fetching count from CSV:', err);
        counterEl.innerText = "-";
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Utility to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
