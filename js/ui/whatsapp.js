// ===========================================
// WhatsApp Floating Button
// ===========================================

export function setupWhatsAppButton() {
    const toggleBtn = document.getElementById('whatsapp-toggle');
    const optionsContainer = document.getElementById('whatsapp-options');
    const mainIcon = document.getElementById('wa-main-icon');
    const closeIcon = document.getElementById('wa-close-icon');

    if (!toggleBtn || !optionsContainer) return;

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing immediately
        const isActive = toggleBtn.classList.contains('active');

        if (isActive) {
            closeWhatsAppMenu();
        } else {
            openWhatsAppMenu();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = toggleBtn.contains(e.target) || optionsContainer.contains(e.target);
        if (!isClickInside && toggleBtn.classList.contains('active')) {
            closeWhatsAppMenu();
        }
    });

    function openWhatsAppMenu() {
        toggleBtn.classList.add('active');
        optionsContainer.classList.add('show');
        mainIcon.style.display = 'none';
        closeIcon.style.display = 'block';
    }

    function closeWhatsAppMenu() {
        toggleBtn.classList.remove('active');
        optionsContainer.classList.remove('show');
        mainIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
}
