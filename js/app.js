
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
    // NEW CSV URL (Public 13-col)
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQM7r71LCUyKGJCORV6_7ezdd7fbuKRMySpH9R9S9nOREM775GJYKM7Ml9_ufiVK17d1Ww9tEWN8Y_T/pub?gid=0&single=true&output=csv';
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
            // We expect 13 columns, but let's be safe with at least 9 (Video matches index 8)
            if (cols.length < 9) return;

            // Map Columns by Index
            const data = {
                municipio: cols[0],
                direccion: cols[1],
                telefono: cols[2],
                correo: cols[3],
                nombre: cols[4],
                fecha: cols[5],
                tipo: cols[6],
                productos: cols[7],
                videoUrl: cols[8], // Drive Link
                instagram: cols[9],
                facebook: cols[10],
                tiktok: cols[11],
                whatsapp: cols[12]
            };

            // Only render if video/image URL exists (as per general rule? or always?)
            // User: "Si el link no es video válido → fallback visual (imagen genérica)"
            // So we render always.

            container.appendChild(createCommunityCard(data));
        });

    } catch (err) {
        console.error('Error Comunidad:', err);
        container.innerHTML = '<p class="text-center error">Error cargando información.</p>';
    }
}

function createCommunityCard(data) {
    const div = document.createElement('div');
    div.className = 'emprendimiento-card';
    div.style.cursor = 'pointer';

    // Thumbnail Logic (Drive Video -> Image)
    const thumbUrl = getThumbnailUrl(data.videoUrl);
    // Fallback image if no thumb
    const imgSrc = thumbUrl || 'img/LOGO NEXT GEN .png';
    const imgStyle = thumbUrl ? 'object-fit:cover;' : 'object-fit:contain; padding:20px;';

    const safeNombre = escapeHtml(data.nombre || 'Emprendimiento');
    const safeMuni = escapeHtml(data.municipio || '');
    const safeTipo = escapeHtml(data.tipo || '');

    div.innerHTML = `
        <div class="video-thumbnail" style="background:#f4f4f4; position:relative; height:200px; overflow:hidden;">
            <img src="${imgSrc}" alt="${safeNombre}" loading="lazy" style="width:100%; height:100%; ${imgStyle}">
            ${thumbUrl ? '<div style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.6); color:white; padding:5px 10px; border-radius:20px; font-size:0.8rem;"><i class="fa-solid fa-play"></i></div>' : ''}
        </div>
        <div class="card-info" style="padding:15px; text-align:left;">
            <span style="font-size:0.75rem; color:var(--primary-color); font-weight:600; text-transform:uppercase; letter-spacing:1px;">${safeMuni}</span>
            <h3 style="font-size:1.1rem; margin:5px 0; font-weight:700; line-height:1.3;">${safeNombre}</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">${safeTipo}</p>
            <button class="btn btn-sm" style="width:100%; padding:8px; font-size:0.9rem; border:1px solid #ddd; background:transparent; color:#333; transition:0.3s; border-radius:4px;">Ver Detalle</button>
        </div>
    `;

    // Hover effect for button via JS or relying on CSS if present. 
    // Adding simple inline hover for the button:
    const btn = div.querySelector('button');
    div.addEventListener('mouseenter', () => { btn.style.background = 'var(--primary-color)'; btn.style.color = 'white'; btn.style.border = '1px solid var(--primary-color)'; });
    div.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = '#333'; btn.style.border = '1px solid #ddd'; });

    div.addEventListener('click', () => {
        openCommunityModal(data);
    });

    return div;
}

function openCommunityModal(data) {
    const driveId = extractDriveId(data.videoUrl);
    let mediaHtml = '';

    if (driveId) {
        mediaHtml = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px; margin-bottom:20px;">
            <iframe src="https://drive.google.com/file/d/${driveId}/preview" 
            style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>`;
    } else {
        mediaHtml = `<div style="padding:40px; text-align:center; background:#f9f9f9; border-radius:8px; margin-bottom:20px; color:#999;">
            <i class="fa-regular fa-image" style="font-size:3rem; margin-bottom:10px;"></i>
            <p>Vista previa no disponible</p>
        </div>`;
    }

    // Socials
    let socialsHtml = '';
    const socialLinks = [
        { key: 'instagram', icon: 'fa-instagram', color: '#E1306C', url: data.instagram },
        { key: 'facebook', icon: 'fa-facebook', color: '#1877F2', url: data.facebook },
        { key: 'tiktok', icon: 'fa-tiktok', color: '#000000', url: data.tiktok },
        { key: 'whatsapp', icon: 'fa-whatsapp', color: '#25D366', url: data.whatsapp ? `https://wa.me/${data.whatsapp.replace(/\D/g, '')}` : '' }
    ];

    socialLinks.forEach(item => {
        if (item.url && item.url.length > 3) {
            socialsHtml += `<a href="${item.url}" target="_blank" style="color:${item.color}; font-size:1.8rem; margin:0 10px; text-decoration:none;">
                <i class="fa-brands ${item.icon}"></i>
            </a>`;
        }
    });

    const contentHtml = `
        <div style="text-align:left; max-width:900px; margin:0 auto;">
            <!-- Header -->
            <div style="margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:15px;">
                <span style="background:var(--primary-color); color:white; padding:4px 10px; border-radius:4px; font-size:0.8rem; text-transform:uppercase;">${escapeHtml(data.municipio)}</span>
                <h2 style="margin:10px 0 5px; font-size:1.8rem; color:var(--secondary-color);">${escapeHtml(data.nombre)}</h2>
                <p style="color:#666; font-style:italic; font-size:1rem;">${escapeHtml(data.tipo)}</p>
            </div>

            <div class="modal-grid" style="display:grid; grid-template-columns: 1.5fr 1fr; gap:30px;">
                <!-- Left: Media & Desc -->
                <div>
                    ${mediaHtml}
                    
                    <h4 style="color:var(--secondary-color); margin-bottom:10px; border-left:3px solid var(--primary-color); padding-left:10px;">Sobre Nosotros</h4>
                    <p style="white-space:pre-wrap; line-height:1.6; color:#444; font-size:0.95rem;">${escapeHtml(data.productos)}</p>
                    
                    <div style="margin-top:20px; font-size:0.9rem; color:#777;">
                        <i class="fa-solid fa-calendar"></i> Activo desde: ${escapeHtml(data.fecha)}
                    </div>
                </div>

                <!-- Right: Contact -->
                <div style="background:#f8f9fa; padding:20px; border-radius:8px; height:fit-content; border:1px solid #eee;">
                    <h4 style="color:var(--secondary-color); margin-bottom:15px; text-transform:uppercase; font-size:0.9rem; letter-spacing:1px; font-weight:700;">Contacto</h4>
                    
                    <div style="display:flex; flex-direction:column; gap:12px; font-size:0.9rem;">
                        ${data.direccion ? `<div><i class="fa-solid fa-location-dot" style="width:20px; color:var(--primary-color);"></i> ${escapeHtml(data.direccion)}</div>` : ''}
                        ${data.telefono ? `<div><i class="fa-solid fa-phone" style="width:20px; color:var(--primary-color);"></i> <a href="tel:${data.telefono}" style="color:#333;">${escapeHtml(data.telefono)}</a></div>` : ''}
                        ${data.correo ? `<div><i class="fa-solid fa-envelope" style="width:20px; color:var(--primary-color);"></i> <a href="mailto:${data.correo}" style="color:#333; word-break:break-all;">${escapeHtml(data.correo)}</a></div>` : ''}
                    </div>

                    <!-- Socials -->
                    <div style="margin-top:25px; pt-3; border-top:1px solid #ddd; text-align:center;">
                        <p style="margin-bottom:15px; font-size:0.85rem; color:#888;">Síguenos en redes</p>
                        <div style="display:flex; justify-content:center; flex-wrap:wrap;">
                            ${socialsHtml || '<span style="font-size:0.8rem; color:#aaa;">No disponibles</span>'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Responsive Fix (Inline) -->
            <style>
                @media (max-width: 768px) {
                    .modal-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
                }
            </style>
        </div>
    `;

    openModal(contentHtml);
}

/* --- Vitrina NextGen --- */

async function loadVitrina() {
    // CORRECT URL: direct pub csv export
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR47D7VTJJ_9R2D9XJ9g7o5LOmSn8btq2pyAaHBEZpwxp9Nt4aonVSNY__b5EUAifASAsahzYoMLFtD/pub?gid=0&single=true&output=csv';
    const container = document.getElementById('vitrina-grid');

    if (!container) return;

    try {
        const response = await fetch(csvUrl);
        const text = await response.text();
        const lines = text.split('\n').filter(l => l.trim() !== '');

        // Skip header? 
        // Sheet: [Fecha] [Mensaje] [Adjunto]
        // Usually export includes headers. Let's try skipping first row.
        const rows = lines.slice(1);

        container.innerHTML = '';

        let hasContent = false;

        rows.forEach(row => {
            const cols = parseCSVLine(row);
            // Expected: [Fecha, Mensaje, URL] (Col A, B, C)
            if (cols.length < 3) return;

            const fecha = cols[0].replace(/^"|"$/g, '').trim();
            const descripcion = cols[1].replace(/^"|"$/g, '').trim();
            const imgUrl = cols[2].replace(/^"|"$/g, '').trim(); // Col C

            // Only render if we have a URL
            if (imgUrl) {
                container.appendChild(createVitrinaCard(imgUrl, descripcion, fecha));
                hasContent = true;
            }
        });

        if (!hasContent) {
            // Leave empty as requested? Or basic message?
            // User asked to remove "Próximamente" message.
        }

    } catch (err) {
        console.error('Error Vitrina:', err);
    }
}

function createVitrinaCard(imgUrl, descripcion, fecha) {
    const div = document.createElement('div');
    div.className = 'emprendimiento-card';
    div.style.cursor = 'pointer';

    // Thumbnail logic
    const thumbUrl = getThumbnailUrl(imgUrl);

    // STRICT RULE: No Logo Fallback
    let imgHtml = '';
    if (thumbUrl) {
        imgHtml = `<img src="${thumbUrl}" alt="Vitrina" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">`;
    } else {
        imgHtml = `<div style="width:100%; height:100%; background:#eee;"></div>`;
    }

    const safeDesc = escapeHtml(descripcion);
    const safeFecha = escapeHtml(fecha);

    div.innerHTML = `
        <div class="video-thumbnail" style="background:#f4f4f4; position:relative; overflow:hidden;">
             ${imgHtml}
        </div>
        <div class="card-info">
            <small style="color:#999;">${safeFecha}</small>
            <h3 style="font-size:1rem; margin-top:5px;">${safeDesc.substring(0, 80)}${safeDesc.length > 80 ? '...' : ''}</h3>
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
