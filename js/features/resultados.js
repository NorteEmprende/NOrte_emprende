// ===========================================
// Consulta de Resultados
// ===========================================

import { CSV_URLS } from '../config/constants.js';
import { parseRobustCSV } from '../utils/csv.js';
import { escapeHtml } from '../utils/text.js';

// Función auxiliar reutilizable para buscar la cédula en un CSV
async function buscarCedulaEnCSV(csvUrl, cedula, cedulaIndex) {
    try {
        const response = await fetch(csvUrl + '&_=' + Date.now());
        const text = await response.text();
        const rows = parseRobustCSV(text);
        const dataRows = rows.length > 1 ? rows.slice(1) : [];

        const cleanInputCedula = cedula.replace(/\s+/g, '');

        for (let i = 0; i < dataRows.length; i++) {
            const cols = dataRows[i];
            if (!cols || cols.length <= cedulaIndex) continue;

            const cedulaCSV = (cols[cedulaIndex] || '').toString();
            const cleanCellCedula = cedulaCSV.replace(/\s+/g, '');

            if (cleanCellCedula === cleanInputCedula) {
                return true;
            }
        }
    } catch (error) {
        console.error('Error al consultar CSV:', error);
    }
    return false;
}

// 1. PRIMERO consultar la nueva tabla de 305 beneficiarios finales
async function consultarBeneficiariosFinales(cedula) {
    return await buscarCedulaEnCSV(CSV_URLS.beneficiariosFinales, cedula, 1);
}

// 3. SI NO ESTÁ EN BENEFICIARIOS FINALES: consultar la tabla de visitas presenciales
async function consultarTerceraFase(cedula) {
    return await buscarCedulaEnCSV(CSV_URLS.terceraFase, cedula, 1);
}

export function setupConsultaResultados() {
    const btn = document.getElementById('btn-consultar-resultado');
    const input = document.getElementById('cedula-input');

    if (!btn || !input) return;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const cedula = input.value.trim();
        if (!cedula) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor, ingresa tu número de cédula.'
            });
            return;
        }

        // Disable button and show loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando...';
        btn.disabled = true;

        try {
            // 1. Validar Beneficiarios Finales
            const esBeneficiarioFinal = await consultarBeneficiariosFinales(cedula);

            if (esBeneficiarioFinal) {
                // 2. SI LA CÉDULA ESTÁ EN LA TABLA DE BENEFICIARIOS FINALES
                Swal.fire({
                    icon: 'success',
                    title: '🎉 ¡Felicitaciones! 🎉',
                    html: `
                        <div style="text-align: justify; font-size: 1.05rem; line-height: 1.6;">
                            <p>Haces parte de los <strong>305 jóvenes beneficiarios</strong> que ingresan a ser fortalecidos con el programa <strong>NextGen Emprende NDS</strong>.</p>
                            <p>Has superado exitosamente la fase de visita presencial a tu emprendimiento, demostrando tu compromiso, talento y dedicación.</p>
                            <p>Muy pronto, nuestro equipo se estará comunicando contigo para brindarte todos los detalles sobre el desarrollo del proyecto, así como las etapas y fases que harán parte de esta gran experiencia.</p>
                            <p>Gracias por creer en tu emprendimiento y aportar al crecimiento de nuestro territorio.</p>
                            <p><strong>¡Seguimos construyendo un Norte, territorio de paz!</strong></p>
                        </div>
                    `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#3085d6',
                    width: 600
                });
                return;
            }

            // 3 y 4. SI NO ESTÁ EN BENEFICIARIOS FINALES: validar Visitas Presenciales
            const llegoATerceraFase = await consultarTerceraFase(cedula);

            if (llegoATerceraFase) {
                Swal.fire({
                    icon: 'info',
                    title: 'Resultado de la convocatoria',
                    html: `
                        <div style="text-align: justify; font-size: 1.05rem; line-height: 1.6;">
                            <p>Agradecemos profundamente tu participación en la convocatoria <strong>NEXTGEN EMPRENDE NDS</strong>.</p>
                            <p>Nos complace informarte que tu emprendimiento superó satisfactoriamente la <strong>fase de visita presencial</strong>, evidenciando compromiso, dedicación y avance en su proceso.</p>
                            <p>Sin embargo, después de la valoración final realizada por el comité técnico del programa, en esta ocasión <strong>no fuiste seleccionado(a) para continuar a la siguiente fase como beneficiario(a) del proceso de fortalecimiento</strong>.</p>
                            <p>Reconocemos el esfuerzo y el trabajo que has realizado, y te animamos a seguir fortaleciendo tu emprendimiento.</p>
                            <p>Esperamos que continúes atento(a) a futuras convocatorias y oportunidades.</p>
                        </div>
                    `,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#6c757d',
                    width: 600
                });
                return;
            }

            // 5. SI TAMPOCO ESTÁ EN VISITAS: consultar tabla anterior
            const response = await fetch(CSV_URLS.resultados + '&_=' + Date.now());
            const text = await response.text();

            // Re-using the same robust parser from the project
            const rows = parseRobustCSV(text);

            // Assuming first row is header, skip it if length > 1
            const dataRows = rows.length > 1 ? rows.slice(1) : [];

            let encontrado = false;
            let filaEncontrada = null;

            // Clean the input string by removing spaces
            const cleanInputCedula = cedula.replace(/\s+/g, '');

            // Search for the cedula
            for (let i = 0; i < dataRows.length; i++) {
                const cols = dataRows[i];
                if (!cols || cols.length === 0) continue;

                // Read only the 'CEDULA' column which is at index 0
                const cedulaCSV = (cols[0] || '').toString();
                const cleanCellCedula = cedulaCSV.replace(/\s+/g, '');

                if (cleanCellCedula === cleanInputCedula) {
                    encontrado = true;
                    filaEncontrada = cols;
                    break;
                }
            }

            // 6. SI LA CÉDULA APARECE EN ESA TABLA ANTERIOR
            if (encontrado && filaEncontrada) {
                const requisitosMinimos = (filaEncontrada[3] || '').toString().trim().toUpperCase();
                const evaluacion = (filaEncontrada[4] || '').toString().trim();

                if (requisitosMinimos === 'CUMPLE') {
                    Swal.fire({
                        icon: 'info',
                        title: 'Resultado de la convocatoria',
                        html: `
                            <div style="text-align: justify; font-size: 1.05rem; line-height: 1.6;">
                                <p>Agradecemos profundamente tu participación en la convocatoria <strong>NEXTGEN EMPRENDE NDS</strong>.</p>
                                <p>Tu emprendimiento avanzó satisfactoriamente en una fase anterior del proceso de selección.</p>
                                <p>Sin embargo, tras la valoración realizada por el comité técnico del programa, en esta ocasión <strong>no continuó a la fase de visita presencial</strong>.</p>
                                <p>Valoramos tu esfuerzo, compromiso y dedicación durante la convocatoria.</p>
                                <p>Te invitamos a seguir fortaleciendo tu iniciativa y a estar atento(a) a futuras oportunidades.</p>
                            </div>
                        `,
                        confirmButtonText: 'Cerrar',
                        confirmButtonColor: '#6c757d',
                        width: 600
                    });
                } else if (requisitosMinimos === 'NO CUMPLE') {
                    if (evaluacion === '') {
                        Swal.fire({
                            icon: 'info',
                            title: 'Resultado de la convocatoria',
                            html: `
                                <div style="text-align: justify; font-size: 1.05rem; line-height: 1.6;">
                                    <p>Agradecemos profundamente tu participación en la convocatoria <strong>NEXTGEN EMPRENDE NDS</strong>.</p>
                                    <p>Después del proceso de evaluación realizado por el comité técnico del programa, tu emprendimiento <strong>no fue seleccionado en esta etapa de la convocatoria</strong>.</p>
                                    <p>En esta ocasión no se registró un comentario específico dentro del sistema de evaluación.</p>
                                    <p>Te invitamos a continuar fortaleciendo tu iniciativa y a estar atento a futuras convocatorias y programas de apoyo al emprendimiento.</p>
                                </div>
                            `,
                            confirmButtonText: 'Cerrar',
                            confirmButtonColor: '#6c757d',
                            width: 600
                        });
                    } else {
                        Swal.fire({
                            icon: 'info',
                            title: 'Resultado de la convocatoria',
                            html: `
                                <div style="text-align: justify; font-size: 1.05rem; line-height: 1.6;">
                                    <p>Agradecemos profundamente tu participación en la convocatoria <strong>NEXTGEN EMPRENDE NDS</strong>.</p>
                                    <p>Después del proceso de evaluación realizado por el comité técnico del programa, tu emprendimiento <strong>no fue seleccionado en esta etapa</strong>.</p>
                                    <p>Observación del comité evaluador:</p>
                                    <p><em>${escapeHtml(evaluacion)}</em></p>
                                    <p>Te invitamos a continuar fortaleciendo tu iniciativa y a estar atento a futuras convocatorias y programas de apoyo al emprendimiento.</p>
                                </div>
                            `,
                            confirmButtonText: 'Cerrar',
                            confirmButtonColor: '#6c757d',
                            width: 600
                        });
                    }
                } else {
                    // Fallback just in case standard text changes subtly or not matched
                    Swal.fire({
                        icon: 'info',
                        title: 'Resultado no determinado',
                        text: 'Se encontró tu número de documento, pero no hay un veredicto definitivo registrado. Por favor, comunícate con nosotros para más información.'
                    });
                }
            } else {
                // 7. SI NO APARECE EN NINGUNA DE LAS TRES TABLAS
                Swal.fire({
                    icon: 'warning',
                    title: 'Registro no encontrado',
                    html: `
                        <div style="text-align: justify; font-size: 1.05rem; line-height: 1.6;">
                            <p>No encontramos tu número de cédula en las bases de datos del proceso de selección.</p>
                            <p>Por favor, verifica que el número ingresado sea correcto e inténtalo nuevamente.</p>
                            <p>Si consideras que se trata de un error, puedes comunicarte con el equipo del programa para recibir orientación.</p>
                        </div>
                    `,
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#6c757d',
                    width: 600
                });
            }

        } catch (error) {
            console.error('Error al consultar resultados:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Hubo un problema al consultar los resultados. Por favor, inténtalo de nuevo más tarde.'
            });
        } finally {
            // Restore button state
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}
