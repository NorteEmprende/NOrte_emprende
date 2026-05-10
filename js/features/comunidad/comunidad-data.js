// ===========================================
// Comunidad Data Fetching
// ===========================================

import { CSV_URLS } from '../../config/constants.js';
import { parseRobustCSV } from '../../utils/csv.js';
import { driveToDirectImageUrl } from '../../utils/media.js';
import { normalizeText } from '../../utils/text.js';

export async function fetchComunidadData() {
    try {
        const response = await fetch(CSV_URLS.comunidad + "&_=" + Date.now());
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
