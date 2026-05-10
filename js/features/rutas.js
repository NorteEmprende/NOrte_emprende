// ===========================================
// Rutas NextGen
// ===========================================

import { rutasData } from '../config/constants.js';

export function renderRutasNextGen() {
    const container = document.getElementById('rutas-container');
    if (!container) return;
    container.innerHTML = '';

    Object.keys(rutasData).forEach((dateKey) => {
        const items = rutasData[dateKey];
        const card = document.createElement('div');
        card.className = 'ruta-card';

        let listHtml = '';
        if (items.length > 0) {
            listHtml = `<ul class="ruta-list">
                ${items.map(item => `
                    <li>
                        <div class="ruta-item-content">
                            <span class="r-muni"><i class="fa-solid fa-location-dot"></i> ${item.municipio}</span>
                            ${item.hora ? `<span class="r-time"><i class="fa-regular fa-clock"></i> ${item.hora}</span>` : ''}
                            ${item.lugar ? `<span class="r-place"><i class="fa-solid fa-map-pin"></i> ${item.lugar}</span>` : ''}
                        </div>
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
                <h3>${dateKey}</h3>
            </div>
            <div class="ruta-body">
                ${listHtml}
            </div>
        `;
        container.appendChild(card);
    });
}
