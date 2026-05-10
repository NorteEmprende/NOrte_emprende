// ===========================================
// Text Utilities
// ===========================================

// Utility to prevent XSS
export function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Normalize text for consistency (Simple Trim to preserve composite casing)
export function normalizeText(text) {
    if (!text) return '';
    return text.trim();
}
