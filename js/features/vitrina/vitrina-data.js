// ===========================================
// Vitrina Data Loading
// ===========================================

import { CSV_URLS } from '../../config/constants.js';
import { parseRobustCSV } from '../../utils/csv.js';
import { driveToDirectImageUrl } from '../../utils/media.js';
import { normalizeText } from '../../utils/text.js';

export async function fetchVitrinaData({ requireDate = true } = {}) {
    const response = await fetch(CSV_URLS.vitrina);
    const text = await response.text();
    const allRows = parseRobustCSV(text);
    const dataRows = allRows.slice(1);

    const validNoticias = dataRows.map(cols => {
        if (cols.length < 6) return null;

        if (!cols[1] || cols[1].trim() === '' ||
            !cols[2] || cols[2].trim() === '') {
            return null;
        }

        if (requireDate && (!cols[5] || cols[5].trim() === '')) {
            return null;
        }

        return {
            titulo: cols[1].trim(),
            municipio: normalizeText(cols[2]),
            descripcion: cols[3] || '',
            imgUrl: driveToDirectImageUrl(cols[4]),
            fecha: requireDate ? cols[5].trim() : (cols[5] || '')
        };
    }).filter(item => item !== null);

    return validNoticias;
}
