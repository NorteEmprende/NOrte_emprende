
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
   Data Loading (Google Sheets CSV)
   ========================================= */

async function loadFromCSV() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkc4vazCHrgzXe9gkhMqZPKEQFor5493mm9iwZ8AqUO3wLMl4WbmJvv6leMBrmRlwX9bOF0-mzsZOF/pub?gid=0&single=true&output=csv';
    const container = document.getElementById('emprendimientos-grid');
    const vitrinaContainer = document.getElementById('vitrina-grid');

    // Hide Vitrina section as we will merge everything into Comunidad
    // or we can duplicate. Let's merge for cleanliness or clear it.
    if (vitrinaContainer) vitrinaContainer.innerHTML = '<p class="text-center">Ver en Comunidad</p>';

    try {
        const response = await fetch(csvUrl);
        const text = await response.text();

        // Parse CSV (Simple parsing assuming no commas in description, or handling basic quoting if needed)
        // Header: Fecha,Descripcion,url
        const rows = text.split('\n').slice(1); // Skip header

        container.innerHTML = '';

        if (rows.length === 0) {
            container.innerHTML = '<p class="text-center" style="grid-column:1/-1">No hay contenido aún.</p>';
            return;
        }

        rows.forEach(row => {
            if (!row.trim()) return;
            const cols = row.split(','); // Be careful if desc has commas. For now simple split.
            // Adjust if description has commas (users often do). 
            // Better regex for CSV:
            // But let's assume simple structure first or use a regex splitter.

            // Fallback split logic handling simple cases
            // Assuming order: Fecha, Descripcion, Url
            // If description has commas, this breaks. 
            // Let's try to match the URL pattern at the end and take the rest as description.

            // Last column is URL (starts with http). First is Date. Middle is Desc.
            const urlMatch = row.match(/https?:\/\/[^\s,]+/);
            let url = urlMatch ? urlMatch[0] : '';

            // Clean URL (remove \r)
            url = url.replace(/\r$/, '');

            const parts = row.split(',');
            const fecha = parts[0];

            // Description is everything between first comma and the URL index?
            // Simpler: Split by comma, first is date, last is URL (if no extra commas after url).
            // Let's rely on the user provided Sample: "Fecha,Descripcion,url"
            // "10-01-2026,estamos contentos,https://..."

            let description = parts.slice(1, parts.length - 1).join(',');
            if (!url) {
                // formatting fallback
                url = parts[parts.length - 1].replace(/\r$/, '');
            }

            if (url) {
                const card = createDriveCard(fecha, description, url);
                container.appendChild(card);
            }
        });

    } catch (err) {
        console.error('Error loading CSV:', err);
        container.innerHTML = '<p class="text-center error">Error cargando información.</p>';
    }
}

function createDriveCard(fecha, descripcion, driveUrl) {
    const fileId = extractDriveId(driveUrl);
    const div = document.createElement('div');
    div.className = 'emprendimiento-card';

    // Thumbnail: Valid trick for Drive images is lh3 or simple export=view
    // But for videos it's harder.
    // We will use a generic "View" placeholder or try to fetch a thumb.
    // Use high-res thumbnail logic if possible, or just a placeholder icon.

    div.innerHTML = `
        <div class="video-thumbnail" onclick="openDriveModal('${fileId}')">
            <div class="play-icon"><i class="fa-solid fa-eye"></i></div>
            <p style="position:absolute; bottom:10px; color:white; width:100%; text-align:center; font-size:0.8rem;">Click para ver</p>
        </div>
        <div class="card-info">
            <small style="color:#999;">${escapeHtml(fecha)}</small>
            <h3 style="font-size:1rem; margin-top:5px;">${escapeHtml(descripcion)}</h3>
        </div>
    `;
    return div;
}

function extractDriveId(url) {
    // Matches /d/ID/ or id=ID
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
}

function openDriveModal(fileId) {
    if (!fileId) return;
    // Use preview endpoint which handles both images and videos reasonably well in an iframe
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    const content = `
        <iframe src="${embedUrl}" width="100%" height="500px" style="border:none;"></iframe>
    `;
    openModal(content);
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
