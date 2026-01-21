
// Admin Logic

// State
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkSession();
});

/* =========================================
   Auth
   ========================================= */

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = session.user;
        showDashboard();
    } else {
        showAuth();
    }
}

function showAuth() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
}

function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    loadEmprendimientos();
    loadVitrina();
}

function switchAuthMode(mode) {
    document.querySelectorAll('.auth-view').forEach(el => el.classList.remove('active'));
    if (mode === 'login') {
        document.getElementById('login-form').classList.add('active');
    } else {
        document.getElementById('register-form').classList.add('active');
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: pass
        });
        if (error) throw error;

        currentUser = data.user;
        showDashboard();
        Swal.fire('Bienvenido', 'Sesión iniciada correctamente', 'success');
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
}

async function handleRegister() {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const master = document.getElementById('master-password').value;

    if (master !== 'Mzpt2030**') {
        Swal.fire('Acceso Denegado', 'Contraseña Maestra incorrecta.', 'error');
        return;
    }

    try {
        // 1. SignUp in Auth
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: pass
        });
        if (error) throw error;

        // 2. Insert into public 'admins' table for RLS
        const userId = data.user?.id;
        if (userId) {
            const { error: adminError } = await supabaseClient
                .from('admins')
                .insert([{
                    id: userId,
                    email: email,
                    nombre: email.split('@')[0], // Fallback name
                    password_hash: 'managed_by_supabase', // Placeholder
                    activo: true
                }]);

            if (adminError) {
                console.error("Error creating admin record:", adminError);
                Swal.fire('Error BDD', `Falló el registro en tabla admins: ${adminError.message}`, 'error');
                return;
            }
        } else {
            throw new Error("No se obtuvo ID de usuario al registrarse.");
        }

        Swal.fire('Éxito', 'Cuenta creada. Revisa tu email para confirmar (si está activado) o inicia sesión.', 'success');
        switchAuthMode('login');
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    showAuth();
}

/* =========================================
   Dashboard UI
   ========================================= */

function switchTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.panel-section').forEach(el => el.classList.remove('active'));

    if (tab === 'emprendimientos') {
        document.querySelector('.admin-tab:nth-child(1)').classList.add('active');
        document.getElementById('tab-emprendimientos').classList.add('active');
        loadEmprendimientos();
    } else {
        document.querySelector('.admin-tab:nth-child(2)').classList.add('active');
        document.getElementById('tab-vitrina').classList.add('active');
        loadVitrina();
    }
}

/* =========================================
   Emprendimientos CRUD
   ========================================= */

async function loadEmprendimientos() {
    const tbody = document.getElementById('emp-list');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    const { data, error } = await supabaseClient
        .from('emprendimientos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5">Error cargando datos</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.municipio}</td>
            <td>${item.video_archivo ? 'Si' : 'No'}</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${item.publicado ? 'checked' : ''} onchange="togglePublicado('emprendimientos', ${item.id}, this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <i class="fa-solid fa-trash delete-btn" onclick="deleteEmprendimiento(${item.id}, '${item.video_archivo || ''}')"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function createEmprendimiento() {
    const nombre = document.getElementById('emp-nombre').value;
    const municipio = document.getElementById('emp-municipio').value;
    const fileInput = document.getElementById('emp-video');
    const file = fileInput.files[0];

    if (!nombre || !municipio || !file) {
        Swal.fire('Atención', 'Todos los campos son obligatorios', 'warning');
        return;
    }

    try {
        Swal.fire({ title: 'Subiendo video...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        // 1. Upload Video
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('videos-emprendimientos')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Insert Record
        const { error: insertError } = await supabaseClient
            .from('emprendimientos')
            .insert([{
                nombre: nombre,
                municipio: municipio,
                video_archivo: uploadData.path,
                publicado: true // Default true? Or false? Let's say true.
            }]);

        if (insertError) throw insertError;

        Swal.fire('Guardado', 'Emprendimiento creado exitosamente', 'success');

        // Reset and Reload
        document.getElementById('emp-nombre').value = '';
        document.getElementById('emp-municipio').value = '';
        fileInput.value = '';
        loadEmprendimientos();

    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
}

async function deleteEmprendimiento(id, videoPath) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar'
    });

    if (result.isConfirmed) {
        try {
            // Delete file if exists
            if (videoPath) {
                await supabaseClient.storage.from('videos-emprendimientos').remove([videoPath]);
            }
            // Delete row
            const { error } = await supabaseClient.from('emprendimientos').delete().eq('id', id);
            if (error) throw error;

            Swal.fire('Borrado', 'Registro eliminado.', 'success');
            loadEmprendimientos();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    }
}

/* =========================================
   Vitrina CRUD
   ========================================= */

async function loadVitrina() {
    const tbody = document.getElementById('vit-list');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    const { data, error } = await supabaseClient
        .from('vitrina_nextgen')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        tbody.innerHTML = '<tr><td colspan="4">Error</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    data.forEach(item => {
        // Thumbnail logic
        let thumb = '';
        if (item.foto_archivo) {
            const { data: urlData } = supabaseClient.storage.from('vitrina-fotos').getPublicUrl(item.foto_archivo);
            thumb = `<img src="${urlData.publicUrl}" style="height: 50px; width: 50px; object-fit: cover; border-radius: 4px;">`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${thumb}</td>
            <td>${item.descripcion}</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" ${item.publicado ? 'checked' : ''} onchange="togglePublicado('vitrina_nextgen', ${item.id}, this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <i class="fa-solid fa-trash delete-btn" onclick="deleteVitrina(${item.id}, '${item.foto_archivo || ''}')"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function createVitrina() {
    const desc = document.getElementById('vit-desc').value;
    const fileInput = document.getElementById('vit-foto');
    const file = fileInput.files[0];

    if (!file) {
        Swal.fire('Atención', 'Debes seleccionar una imagen', 'warning');
        return;
    }

    try {
        Swal.fire({ title: 'Subiendo foto...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        // 1. Upload Photo
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('vitrina-fotos')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Insert Record
        const { error: insertError } = await supabaseClient
            .from('vitrina_nextgen')
            .insert([{
                descripcion: desc,
                foto_archivo: uploadData.path,
                publicado: true
            }]);

        if (insertError) throw insertError;

        Swal.fire('Guardado', 'Foto agregada exitosamente', 'success');

        document.getElementById('vit-desc').value = '';
        fileInput.value = '';
        loadVitrina();

    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
}

async function deleteVitrina(id, fotoPath) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminará la foto.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar'
    });

    if (result.isConfirmed) {
        try {
            if (fotoPath) {
                await supabaseClient.storage.from('vitrina-fotos').remove([fotoPath]);
            }
            const { error } = await supabaseClient.from('vitrina_nextgen').delete().eq('id', id);
            if (error) throw error;

            loadVitrina();
            Swal.fire('Borrado', 'Registro eliminado.', 'success');
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    }
}

/* =========================================
   Shared
   ========================================= */

async function togglePublicado(table, id, status) {
    try {
        const { error } = await supabaseClient
            .from(table)
            .update({ publicado: status })
            .eq('id', id);

        if (error) throw error;
        // Optional: Toast notification
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
}
