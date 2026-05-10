// ===========================================
// Leaflet Map
// ===========================================

import { MUNICIPIOS_MAP } from '../config/constants.js';

export function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.warn('[Map] Leaflet not loaded, skipping map init.');
        return;
    }

    // Centered roughly on Norte de Santander
    const map = L.map('map').setView([8.0, -73.0], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    MUNICIPIOS_MAP.forEach(mun => {
        L.marker([mun.lat, mun.lng])
            .addTo(map)
            .bindPopup(`<b>${mun.name}</b><br>Municipio Beneficiado`);
    });
}
