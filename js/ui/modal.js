// ===========================================
// Modal System
// ===========================================

import { extractDriveId } from '../utils/media.js';

export function setupModalListeners() {
    const modal = document.getElementById("media-modal");
    const closeBtn = document.querySelector(".close-modal");

    if (modal) {
        // Click on X
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal());
        }

        // Click outside
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                closeModal();
            }
        });
    }
}

export function closeModal() {
    const modal = document.getElementById("media-modal");
    const modalBody = document.getElementById("modal-body");
    if (modal) {
        modal.style.display = "none";
    }
    if (modalBody) {
        modalBody.innerHTML = ""; // Stop video
    }
}

export function openModal(content) {
    const modal = document.getElementById("media-modal");
    const modalBody = document.getElementById("modal-body");

    // Ensure modal exists
    if (!modal || !modalBody) {
        console.error("Modal container not found!");
        return;
    }

    modalBody.innerHTML = content;
    modal.style.display = "flex";
}

export function openMediaModal(urlOrId, description, date) {
    const modal = document.getElementById("media-modal");
    if (!modal) return;

    const driveId = extractDriveId(urlOrId);
    let contentHtml = '';

    // 1. Is it a Drive File? -> Iframe Preview
    if (driveId) {
        const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        contentHtml = `<iframe src="${embedUrl}" width="100%" height="500px" style="border:none; background:#000;"></iframe>`;
    }
    // 2. Is it a direct Image URL? -> Img Tag
    else if (urlOrId.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i) || urlOrId.startsWith('http')) {
        contentHtml = `<img src="${urlOrId}" style="max-width:100%; max-height:70vh; border-radius:4px; object-fit:contain;">`;
    }
    else {
        contentHtml = `<p>Contenido no visualizable.</p>`;
    }

    const bodyHtml = `
        <div style="text-align:center; width:100%;">
            ${contentHtml}
            <div style="text-align:left; max-width:800px; margin:15px auto 0; padding:10px; background:#fff; border-radius:8px;">
                <p style="color:#666; font-size:0.85rem; margin-bottom:5px;"><i class="fa-regular fa-calendar"></i> ${date || ''}</p>
                <h3 style="color:var(--primary-color); line-height:1.4;">${description || ''}</h3>
            </div>
        </div>
    `;

    openModal(bodyHtml);
}
