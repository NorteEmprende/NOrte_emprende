// ===========================================
// Dynamic Counter
// ===========================================

import { CSV_URLS } from '../config/constants.js';

export async function updateCounter() {
    const counterEl = document.getElementById('postulaciones-count');
    if (!counterEl) return;

    try {
        const response = await fetch(CSV_URLS.counter);
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

export function animateValue(obj, start, end, duration) {
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
