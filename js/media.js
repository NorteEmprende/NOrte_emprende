// ===========================================
// Media Entry Point
// Used by: media.html
// ===========================================

// UI
import { setupMobileMenu, setupSmoothScroll } from './ui/navigation.js';
import { setupModalListeners } from './ui/modal.js';

// Media Page
import { loadMediaPage } from './features/media/media-page.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Toggle
    setupMobileMenu();

    // 2. Smooth Scroll
    setupSmoothScroll();

    // 3. Setup Modal Close Listeners
    setupModalListeners();

    // 4. Load Media Page
    loadMediaPage();
});
