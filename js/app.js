
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

    // 8. Load Rutas NextGen
    const rutasContainer = document.getElementById('rutas-container');
    if (rutasContainer) renderRutasNextGen();

    // 9. WhatsApp Button Logic
    setupWhatsAppButton();
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

// Robust CSV parser to handle quoted strings, internal commas, and multi-line values
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
                i++; // Skip the double quote
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
            if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
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

// Helper to shuffle array (Fisher-Yates) for randomness
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array[j]]] = [array[array[j]], array[i]];
    }
    return array;
}

// Keep the single line parser as legacy if needed, but we'll use robust one
function parseCSVLine(line) {
    return parseRobustCSV(line)[0] || [];
}

function driveToDirectImageUrl(url) {
    const originalUrl = (url || '').trim();
    if (!originalUrl) return 'img/LOGO NEXT GEN .png'; // Fallback immediately if empty

    // 1. Check if it's already a direct Google User Content URL
    if (originalUrl.includes('lh3.googleusercontent.com') || originalUrl.includes('drive.google.com/thumbnail')) {
        // Assume it's already good, just return it
        return originalUrl;
    }

    // 2. Extract ID from various Drive formats
    // Supported: /file/d/<ID>, /open?id=<ID>, /uc?id=<ID>, id=<ID>
    const idMatch = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        originalUrl.match(/id=([a-zA-Z0-9_-]+)/);

    if (idMatch && idMatch[1]) {
        const fileId = idMatch[1];
        // 3. Construct the official robust direct link
        const finalUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1200`;

        console.log(`[DriveImage] Original: ${originalUrl} -> Converted: ${finalUrl}`);
        return finalUrl;
    }

    console.warn(`[DriveImage] Could not convert: ${originalUrl}`);
    return 'img/LOGO NEXT GEN .png'; // Fallback if conversion fails
}

function extractDriveId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

/* --- Comunidad Emprendedora (Debugging & Refinement) --- */

/* --- Comunidad Emprendedora (Refactored) --- */

let globalComunidadData = []; // Store data for filtering

async function fetchComunidadData() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTR1m8c_M-L39OfXRC4qqGkMuT2liOaogntkZntOeHOiQ7hXTrUFKJrIjOG4amjpCJ7LmTPKzF5GcD9/pub?gid=1269159520&single=true&output=csv';

    try {
        const response = await fetch(csvUrl + "&_=" + Date.now());
        const text = await response.text();
        const allRows = parseRobustCSV(text);
        const dataRows = allRows.slice(1);

        let validEntries = [];
        dataRows.forEach((cols) => {
            // Relaxed validation: Just check if we have enough columns for the mandatory fields (up to index 9)
            // If the row is shorter, we can pad it or just check undefined.

            // Mandatory: Name (1), Business (5), Muni (9)
            const nombre = cols[1]?.trim();
            const negocio = cols[5]?.trim();
            const muni = cols[9]?.trim();

            if (!nombre || !negocio || !muni) return;

            const data = {
                emprendedorNombre: nombre,
                emprendedorBio: cols[2] || '',
                emprendedorVideo: cols[3] || '',
                emprendedorFoto: driveToDirectImageUrl(cols[4]),
                negocioNombre: negocio,
                negocioDesc: cols[6] || '',
                negocioTipo: cols[7] || 'Otro', // Default
                negocioDireccion: cols[8] || '',
                municipio: normalizeText(muni),
                negocioImg: driveToDirectImageUrl(cols[10]),
                negocioVideo: cols[11] || '',
                tiktok: cols[12] || '',
                instagram: cols[13] || '',
                facebook: cols[14] || ''
            };
            validEntries.push(data);
        });
        return validEntries;

    } catch (err) {
        console.error('Error fetching data:', err);
        return [];
    }
}

// 1. Home Logic (Preview)
async function loadComunidadFromCSV() {
    // This function now just handles the Home Page preview
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

// 2. Full Page Logic (Comunidad Page)
async function loadComunidadPage() {
    const container = document.getElementById('comunidad-full-grid');
    if (!container) return;

    const data = await fetchComunidadData();
    globalComunidadData = data; // Save for filters

    // Populate Filters
    populateFilters(data);

    // Initial Render (All)
    renderComunidadGrid(data);

    // Setup Listeners
    setupFilterListeners();
}

function renderComunidadGrid(dataList) {
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

function populateFilters(data) {
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

function setupFilterListeners() {
    const muniSelect = document.getElementById('filter-municipio');
    const sectorSelect = document.getElementById('filter-sector');

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

function resetFilters() {
    document.getElementById('filter-municipio').value = 'Todos';
    document.getElementById('filter-sector').value = 'Todos';
    renderComunidadGrid(globalComunidadData);
}

function createCommunityCard(data) {
    const div = document.createElement('div');
    div.className = 'emprendimiento-card';

    // Protagonist Image (Col 10-Business Img)
    const imgSrc = data.negocioImg || 'img/LOGO NEXT GEN .png';
    const safeNombre = escapeHtml(data.negocioNombre);
    const safeMuni = escapeHtml(data.municipio);
    const safeTipo = escapeHtml(data.negocioTipo);

    div.innerHTML = `
        <div class="video-thumbnail">
            <span class="card-tag">${safeMuni}</span>
            <img src="${imgSrc}" alt="${safeNombre}" loading="lazy" 
                 onerror="this.onerror=null; this.src='img/LOGO NEXT GEN .png'; this.style.objectFit='contain'; this.style.backgroundColor='#f4f4f4';">
        </div>
        <div class="card-info">
            <div class="card-text-group">
                <h3>${safeNombre}</h3>
                <p class="category">${safeTipo}</p>
            </div>
            <button class="btn-card-outline">Ver Perfil Completo</button>
        </div>
    `;

    div.addEventListener('click', () => {
        openCommunityModal(data);
    });

    return div;
}

function openCommunityModal(data) {
    const safeENombre = escapeHtml(data.emprendedorNombre);
    const safeNNombre = escapeHtml(data.negocioNombre);
    const safeMuni = escapeHtml(data.municipio);
    const safeTipo = escapeHtml(data.negocioTipo);
    const safeNDesc = escapeHtml(data.negocioDesc);
    const safeEBio = escapeHtml(data.emprendedorBio);
    const safeDir = escapeHtml(data.negocioDireccion);

    const eDriveId = extractDriveId(data.emprendedorVideo);
    const nDriveId = extractDriveId(data.negocioVideo);
    const eFoto = data.emprendedorFoto || 'img/LOGO NEXT GEN .png';

    // Socials Logic
    const socialLinks = [
        { icon: 'fa-instagram', color: '#E1306C', url: data.instagram },
        { icon: 'fa-facebook', color: '#1877F2', url: data.facebook },
        { icon: 'fa-tiktok', color: '#000000', url: data.tiktok }
    ];

    let socialsHtml = socialLinks
        .filter(s => s.url && s.url.length > 5)
        .map(s => `<a href="${s.url}" target="_blank" style="color:${s.color}; font-size:1.6rem; transition: transform 0.3s ease;"><i class="fa-brands ${s.icon}"></i></a>`)
        .join('');

    const contentHtml = `
        <div class="community-modal-container">
            <!-- Modal Internal Header (Tabs) -->
            <div class="community-modal-nav">
                <button class="community-modal-tab-btn active" onclick="switchCommunityView('entrepreneur')">
                    <i class="fa-solid fa-user-tie"></i> Emprendedor
                </button>
                <button class="community-modal-tab-btn" onclick="switchCommunityView('business')">
                    <i class="fa-solid fa-rocket"></i> Emprendimiento
                </button>
            </div>

            <!-- Scrollable Body Content -->
            <div class="community-modal-scrollable">
                
                <!-- View 1: Entrepreneur (Default) -->
                <div id="view-entrepreneur" class="community-modal-view active">
                    <div class="modal-profile-header">
                        <img src="${eFoto}" class="modal-profile-img" alt="${safeENombre}"
                             onerror="this.onerror=null; this.src='img/LOGO NEXT GEN .png'; this.style.backgroundColor='#fff';">
                        <div class="modal-profile-info">
                            <span class="subtitle"><i class="fa-solid fa-location-dot"></i> ${safeMuni}</span>
                            <h4>${safeENombre}</h4>
                            <p class="role-badge">Perfil Institucional NextGen</p>
                        </div>
                    </div>
                    
                    <h5 class="modal-section-title">Trayectoria Profesional</h5>
                    <p class="modal-text-content">${safeEBio}</p>

                    ${eDriveId ? `
                        <h5 class="modal-section-title">Video de Presentación</h5>
                        <div class="modal-video-container">
                            <iframe src="https://drive.google.com/file/d/${eDriveId}/preview" allowfullscreen></iframe>
                        </div>
                    ` : data.emprendedorVideo ? `
                        <h5 class="modal-section-title">Video de Presentación</h5>
                        <div class="text-center mt-3">
                            <a href="${data.emprendedorVideo}" target="_blank" class="btn btn-secondary">
                                <i class="fa-solid fa-play"></i> Ver video externo
                            </a>
                        </div>
                    ` : ''}
                </div>

                <!-- View 2: Business -->
                <div id="view-business" class="community-modal-view">
                    <div class="business-header">
                        <h2>${safeNNombre}</h2>
                        <span class="business-tag">${safeTipo}</span>
                    </div>
                    
                    <div class="business-grid">
                        <div class="business-main">
                            <h5 class="modal-section-title">Propuesta de Valor</h5>
                            <p class="modal-text-content">${safeNDesc}</p>
                            
                            ${nDriveId ? `
                                <h5 class="modal-section-title">Galería y Actividades</h5>
                                <div class="modal-video-container">
                                    <iframe src="https://drive.google.com/file/d/${nDriveId}/preview" allowfullscreen></iframe>
                                </div>
                            ` : data.negocioVideo ? `
                                <div class="text-center mt-3">
                                    <a href="${data.negocioVideo}" target="_blank" class="btn btn-secondary">
                                        <i class="fa-solid fa-play"></i> Ver video del negocio
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="business-sidebar">
                            <div class="info-card">
                                <h5 class="modal-section-title no-border">Información</h5>
                                <div class="sidebar-item">
                                    <i class="fa-solid fa-map-location-dot"></i>
                                    <div>
                                        <p class="label">Ubicación</p>
                                        <p class="value">${safeDir}</p>
                                        <p class="value-muni">${safeMuni}, Norte de Santander</p>
                                    </div>
                                </div>
                                
                                <h5 class="modal-section-title no-border">Redes Sociales</h5>
                                <div class="social-icons-row">
                                    ${socialsHtml || '<span class="no-socials">No registradas</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="community-modal-footer">
                <button class="btn btn-secondary close-vitrina-modal">
                    Volver a la Galería
                </button>
            </div>
        </div>
    `;

    openModal(contentHtml);

    // Setup close button properly since it's injected
    const clBtn = document.querySelector('.close-vitrina-modal');
    if (clBtn) clBtn.onclick = closeModal;
}

// Global helper for view switching within social modal
window.switchCommunityView = function (viewName) {
    const tabs = document.querySelectorAll('.community-modal-tab-btn');
    const views = document.querySelectorAll('.community-modal-view');

    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));

    if (viewName === 'entrepreneur') {
        tabs[0].classList.add('active');
        document.getElementById('view-entrepreneur').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('view-business').classList.add('active');
    }
}

/* --- Vitrina NextGen --- */

async function loadVitrina() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5wG7maDoWY1HJrLAF9bJBFKs8B1loTiOn1SYuzS9_gr50-JwMAoArtKAP8wLIBYSVqHT_FIbNlyaC/pub?gid=372344697&single=true&output=csv';
    const container = document.getElementById('vitrina-grid');

    if (!container) return;

    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        // 1. RAW PARSE
        const allRows = parseRobustCSV(text);
        const dataRows = allRows.slice(1); // Skip header

        container.innerHTML = '';

        // 2. ROBUST FILTER & MAPPING
        // We clean and normalize data BEFORE anything else
        const validNoticias = dataRows.map(cols => {
            // Must have min 6 columns and basic required fields (Title, Municipio, Description, Date)
            if (cols.length < 6) return null;
            // Validate: Title (1), Municipio (2), Date (5)
            if (!cols[1] || cols[1].trim() === '' ||
                !cols[2] || cols[2].trim() === '' ||
                !cols[5] || cols[5].trim() === '') {
                return null;
            }

            return {
                titulo: cols[1].trim(),
                municipio: normalizeText(cols[2]),
                descripcion: cols[3] || '',
                imgUrl: driveToDirectImageUrl(cols[4]),
                fecha: cols[5].trim()
            };
        }).filter(item => item !== null);

        if (validNoticias.length === 0) {
            container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No hay noticias disponibles en este momento.</p>';
            return;
        }

        // 3. DETERMINISTIC SELECTION (First 3 valid items)
        const selected = validNoticias.slice(0, Math.min(3, validNoticias.length));

        // 4. RENDER
        selected.forEach(data => {
            container.appendChild(createVitrinaCard(data));
        });

    } catch (err) {
        console.error('Error Vitrina:', err);
        container.innerHTML = '<p class="text-center error" style="grid-column: 1/-1;">Error cargando la vitrina.</p>';
    }
}

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

// Normalize text for consistency (Simple Trim to preserve composite casing)
function normalizeText(text) {
    if (!text) return '';
    return text.trim();
}
// Global helper for view switching within comunidad modal
window.switchCommunityView = function (viewName) {
    const tabs = document.querySelectorAll('.community-modal-tab-btn');
    const views = document.querySelectorAll('.community-modal-view');

    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));

    if (viewName === 'entrepreneur') {
        tabs[0].classList.add('active');
        document.getElementById('view-entrepreneur').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('view-business').classList.add('active');
    }
}

/* =========================================
   Rutas NextGen
   ========================================= */
const rutasData = {
    ruta1: [
        { fecha: 'Viernes 6 de febrero', municipio: 'Teorama' },
        { fecha: 'Viernes 6 de febrero', municipio: 'San Calixto' },
        { fecha: 'Sabado 7 de febrero', municipio: 'Cáchira' },
        { fecha: 'Lunes 9 de febrero', municipio: 'El Carmen' },
        { fecha: 'Lunes 9 de febrero', municipio: 'Convención' },
        { fecha: 'Martes 10 de febrero', municipio: 'Abrego' },
        { fecha: 'Martes 10 de febrero', municipio: 'La Playa' },
        { fecha: 'Miercoles 11 de febrero', municipio: 'Ocaña' }
    ],
    ruta2: [
        { fecha: 'Viernes 6 de febrero', municipio: 'Puerto Santander' },
        { fecha: 'Viernes 6 de febrero', municipio: 'Villa del Rosario' },
        { fecha: 'Lunes 9 de febrero', municipio: 'Tibú' },
        { fecha: 'Martes 10 de febrero', municipio: 'Los Patios' },
        { fecha: 'Martes 10 de febrero', municipio: 'Cúcuta' },
    ],
    ruta3: [
        { fecha: 'Lunes 9 de febrero', municipio: 'Sardinata' },
        { fecha: 'Lunes 9 de febrero', municipio: 'El Zulia' },
        { fecha: 'Martes 10 de febrero', municipio: 'Salazar' },
        { fecha: 'Martes 10 de febrero', municipio: 'Arboledas' },
        { fecha: 'Miercoles 11 de febrero', municipio: 'Bochalema' },
        { fecha: 'Miercoles 11 de febrero', municipio: 'Pamplona' },
        { fecha: 'Jueves 12 de febrero', municipio: 'Chitagá' },
        { fecha: 'Jueves 12 de febrero', municipio: 'Toledo' }
    ]
};

function renderRutasNextGen() {
    const container = document.getElementById('rutas-container');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(rutasData).forEach((key, index) => {
        const rutaName = ``;
        const items = rutasData[key];
        const card = document.createElement('div');
        card.className = 'ruta-card';

        let listHtml = '';
        if (items.length > 0) {
            listHtml = `<ul class="ruta-list">
                ${items.map(item => `
                    <li>
                        <span class="r-date"><i class="fa-regular fa-calendar"></i> ${item.fecha}</span>
                        <span class="r-muni"><i class="fa-solid fa-location-dot"></i> ${item.municipio}</span>
                    </li>
                `).join('')}
            </ul>`;
        } else {
            listHtml = `<div class="ruta-empty">
                <i class="fa-solid fa-road"></i>
                <p>Próximamente disponible</p>
            </div>`;
        }

        card.innerHTML = `
            <div class="ruta-header">
                <h3>${rutaName}</h3>
            </div>
            <div class="ruta-body">
                ${listHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

/* =========================================
   WhatsApp Button Logic
   ========================================= */
function setupWhatsAppButton() {
    const toggleBtn = document.getElementById('whatsapp-toggle');
    const optionsContainer = document.getElementById('whatsapp-options');
    const mainIcon = document.getElementById('wa-main-icon');
    const closeIcon = document.getElementById('wa-close-icon');

    if (!toggleBtn || !optionsContainer) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing immediately
        const isActive = toggleBtn.classList.contains('active');

        if (isActive) {
            closeWhatsAppMenu();
        } else {
            openWhatsAppMenu();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = toggleBtn.contains(e.target) || optionsContainer.contains(e.target);
        if (!isClickInside && toggleBtn.classList.contains('active')) {
            closeWhatsAppMenu();
        }
    });

    function openWhatsAppMenu() {
        toggleBtn.classList.add('active');
        optionsContainer.classList.add('show');
        mainIcon.style.display = 'none';
        closeIcon.style.display = 'block';
    }

    function closeWhatsAppMenu() {
        toggleBtn.classList.remove('active');
        optionsContainer.classList.remove('show');
        mainIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
}
