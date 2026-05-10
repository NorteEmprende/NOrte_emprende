// ===========================================
// Navigation UI
// ===========================================

export function setupMobileMenu() {
    const burger = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');

    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
            burger.classList.toggle('toggle');
        });
    }
}

export function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
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
