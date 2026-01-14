document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- Counter Animation ---
    const counterElement = document.getElementById('postulaciones-count');
    const targetCount = 1350; // Example target
    const duration = 2000; // ms
    let startTime = null;

    function animateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Easing function for smooth effect
        const easeOutQuad = t => t * (2 - t);

        const currentCount = Math.floor(easeOutQuad(percentage) * targetCount);
        counterElement.textContent = currentCount;

        if (progress < duration) {
            window.requestAnimationFrame(animateCounter);
        }
    }

    // Start animation when section is in view (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.requestAnimationFrame(animateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(document.getElementById('counter-section'));


    // --- Formulario Reemplazado por Google Form ---
    // La lógica de validación manual y API de municipios ha sido removida
    // ya que ahora se utiliza un iframe de Google Forms.


    // --- Leaflet Map ---
    // Coordinates for Norte de Santander (Approx center)
    const mapCenter = [8.300, -73.000];
    const map = L.map('map').setView(mapCenter, 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Specific municipalities mentioned in project
    const municipalities = [
        { name: "Cúcuta", coords: [7.8939, -72.5078] },
        { name: "Ocaña", coords: [8.2328, -73.3531] },
        { name: "Pamplona", coords: [7.3756, -72.6450] },
        { name: "Tibú", coords: [8.6397, -72.7358] },
        { name: "Villa del Rosario", coords: [7.8333, -72.4744] },
        { name: "Los Patios", coords: [7.8286, -72.5033] },
        { name: "Chinácota", coords: [7.6000, -72.6000] },
        { name: "Sardinata", coords: [8.0833, -72.8000] },
        { name: "El Zulia", coords: [7.9333, -72.6000] }
    ];

    municipalities.forEach(muni => {
        L.marker(muni.coords).addTo(map)
            .bindPopup(`<b>${muni.name}</b><br>Municipio Beneficiado`);
    });

});
