// ===========================================
// Comunidad Modal
// ===========================================

import { FALLBACK_IMAGE } from '../../config/constants.js';
import { escapeHtml } from '../../utils/text.js';
import { extractDriveId, extractYouTubeId } from '../../utils/media.js';
import { openModal, closeModal } from '../../ui/modal.js';

export function openCommunityModal(data) {
    const safeENombre = escapeHtml(data.emprendedorNombre);
    const safeNNombre = escapeHtml(data.negocioNombre);
    const safeMuni = escapeHtml(data.municipio);
    const safeTipo = escapeHtml(data.negocioTipo);
    const safeNDesc = escapeHtml(data.negocioDesc);
    const safeEBio = escapeHtml(data.emprendedorBio);
    const safeDir = escapeHtml(data.negocioDireccion);

    const eDriveId = extractDriveId(data.emprendedorVideo);
    const nDriveId = extractDriveId(data.negocioVideo);

    // Extract YouTube IDs
    const eYouTubeId = extractYouTubeId(data.emprendedorVideo);
    const nYouTubeId = extractYouTubeId(data.negocioVideo);

    const eFoto = data.emprendedorFoto || FALLBACK_IMAGE;

    // Socials Logic
    const socialLinks = [
        { icon: 'fa-instagram', color: '#E1306C', url: data.instagram },
        { icon: 'fa-facebook', color: '#1877F2', url: data.facebook },
        { icon: 'fa-tiktok', color: '#000000', url: data.tiktok }
    ];

    let socialsHtml = socialLinks
        .filter(s => s.url && s.url.length > 5)
        .map(s => `<a href="${s.url}" target="_blank" style="color:${s.color}; font-size:1.6rem; transition: transform 0.3s ease;"><i class="fa-brands ${s.icon}"></i></a>`)
        .join('');

    const contentHtml = `
        <div class="community-modal-container">
            <!-- Modal Internal Header (Tabs) -->
            <div class="community-modal-nav">
                <button class="community-modal-tab-btn active" onclick="switchCommunityView('entrepreneur')">
                    <i class="fa-solid fa-user-tie"></i> Emprendedor
                </button>
                <button class="community-modal-tab-btn" onclick="switchCommunityView('business')">
                    <i class="fa-solid fa-rocket"></i> Emprendimiento
                </button>
            </div>

            <!-- Scrollable Body Content -->
            <div class="community-modal-scrollable">
                
                <!-- View 1: Entrepreneur (Default) -->
                <div id="view-entrepreneur" class="community-modal-view active">
                    <div class="modal-profile-header">
                        <img src="${eFoto}" class="modal-profile-img" alt="${safeENombre}"
                             onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'; this.style.backgroundColor='#fff';">
                        <div class="modal-profile-info">
                            <span class="subtitle"><i class="fa-solid fa-location-dot"></i> ${safeMuni}</span>
                            <h4>${safeENombre}</h4>
                            <p class="role-badge">Perfil Institucional NextGen</p>
                        </div>
                    </div>
                    
                    <h5 class="modal-section-title">Trayectoria Profesional</h5>
                    <p class="modal-text-content">${safeEBio}</p>

                    ${eYouTubeId ? `
                        <h5 class="modal-section-title">Video de Presentación</h5>
                        <div class="modal-video-container">
                            <iframe src="https://www.youtube.com/embed/${eYouTubeId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    ` : eDriveId ? `
                        <h5 class="modal-section-title">Video de Presentación</h5>
                        <div class="modal-video-container">
                            <iframe src="https://drive.google.com/file/d/${eDriveId}/preview" allowfullscreen></iframe>
                        </div>
                    ` : ''}
                </div>

                <!-- View 2: Business -->
                <div id="view-business" class="community-modal-view">
                    <div class="business-header">
                        <h2>${safeNNombre}</h2>
                        <span class="business-tag">${safeTipo}</span>
                    </div>
                    
                    <div class="business-grid">
                        <div class="business-main">
                            <h5 class="modal-section-title">Propuesta de Valor</h5>
                            <p class="modal-text-content">${safeNDesc}</p>
                            
                            ${nYouTubeId ? `
                                <h5 class="modal-section-title">Galería y Actividades</h5>
                                <div class="modal-video-container">
                                    <iframe src="https://www.youtube.com/embed/${nYouTubeId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>
                            ` : nDriveId ? `
                                <h5 class="modal-section-title">Galería y Actividades</h5>
                                <div class="modal-video-container">
                                    <iframe src="https://drive.google.com/file/d/${nDriveId}/preview" allowfullscreen></iframe>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="business-sidebar">
                            <div class="info-card">
                                <h5 class="modal-section-title no-border">Información</h5>
                                <div class="sidebar-item">
                                    <i class="fa-solid fa-map-location-dot"></i>
                                    <div>
                                        <p class="label">Ubicación</p>
                                        <p class="value">${safeDir}</p>
                                        <p class="value-muni">${safeMuni}, Norte de Santander</p>
                                    </div>
                                </div>
                                
                                <h5 class="modal-section-title no-border">Redes Sociales</h5>
                                <div class="social-icons-row">
                                    ${socialsHtml || '<span class="no-socials">No registradas</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="community-modal-footer">
                <button class="btn btn-secondary close-vitrina-modal">
                    Volver a la Galería
                </button>
            </div>
        </div>
    `;

    openModal(contentHtml);

    // Setup close button properly since it's injected
    const clBtn = document.querySelector('.close-vitrina-modal');
    if (clBtn) clBtn.onclick = closeModal;
}

// Global helper for view switching within community modal
function switchCommunityView(viewName) {
    const tabs = document.querySelectorAll('.community-modal-tab-btn');
    const views = document.querySelectorAll('.community-modal-view');

    tabs.forEach(t => t.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));

    if (viewName === 'entrepreneur') {
        tabs[0].classList.add('active');
        document.getElementById('view-entrepreneur').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('view-business').classList.add('active');
    }
}

// Expose globally for onclick in generated HTML
window.switchCommunityView = switchCommunityView;
