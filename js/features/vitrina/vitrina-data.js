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

    // Helper to parse DD/MM/YYYY or DD-MM-YYYY
    const parseDateString = (dateStr) => {
        if (!dateStr) return 0;
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            // Handle 2-digit years if present
            const fullYear = year < 100 ? 2000 + year : year;
            return new Date(fullYear, month, day).getTime();
        }
        const parsed = Date.parse(dateStr);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Sort from most recent to oldest
    validNoticias.sort((a, b) => {
        return parseDateString(b.fecha) - parseDateString(a.fecha);
    });

    return validNoticias;
}
