// ===========================================
// CSV Parsing Utilities
// ===========================================

// Robust CSV parser to handle quoted strings, internal commas, and multi-line values
export function parseRobustCSV(csvText) {
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
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array[j]]] = [array[array[j]], array[i]];
    }
    return array;
}

// Keep the single line parser as legacy if needed, but we'll use robust one
export function parseCSVLine(line) {
    return parseRobustCSV(line)[0] || [];
}
