// Formulario DS-160 - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.getElementById('visaForm');
    
    // === MANEJO DE CAMPOS CONDICIONALES ===
    
    // Mostrar/ocultar campo "Otra ciudad"
    const radioCiudad = document.querySelectorAll('input[name="ciudadCita"]');
    const otraCiudadInput = document.getElementById('otraCiudad');
    
    radioCiudad.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'OTRO') {
                otraCiudadInput.classList.remove('hidden-input');
                otraCiudadInput.style.display = 'block';
                otraCiudadInput.required = true;
            } else {
                otraCiudadInput.classList.add('hidden-input');
                otraCiudadInput.style.display = 'none';
                otraCiudadInput.required = false;
                otraCiudadInput.value = '';
            }
        });
    });
    
    // Mostrar/ocultar especificación de otra nacionalidad
    const radioNacionalidad = document.querySelectorAll('input[name="otraNacionalidad"]');
    const especificarNacionalidad = document.getElementById('especificarNacionalidad');
    
    radioNacionalidad.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'SI') {
                especificarNacionalidad.classList.remove('hidden-input');
                especificarNacionalidad.style.display = 'block';
                especificarNacionalidad.required = true;
            } else {
                especificarNacionalidad.classList.add('hidden-input');
                especificarNacionalidad.style.display = 'none';
                especificarNacionalidad.required = false;
                especificarNacionalidad.value = '';
            }
        });
    });
    
    // Mostrar/ocultar lista de números anteriores
    const radioOtrosNumeros = document.querySelectorAll('input[name="otrosNumeros"]');
    const listaNumeros = document.getElementById('listaNumeros');
    
    radioOtrosNumeros.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'SI') {
                listaNumeros.classList.remove('hidden-input');
                listaNumeros.style.display = 'block';
                listaNumeros.required = true;
            } else {
                listaNumeros.classList.add('hidden-input');
                listaNumeros.style.display = 'none';
                listaNumeros.required = false;
                listaNumeros.value = '';
            }
        });
    });
    
    // Mostrar/ocultar plataformas adicionales
    const radioPlataformas = document.querySelectorAll('input[name="plataformasAdicionales"]');
    const listaPlataformas = document.getElementById('listaPlataformas');
    
    radioPlataformas.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'SI') {
                listaPlataformas.classList.remove('hidden-input');
                listaPlataformas.style.display = 'block';
            } else {
                listaPlataformas.classList.add('hidden-input');
                listaPlataformas.style.display = 'none';
                listaPlataformas.value = '';
            }
        });
    });
    
    // === VALIDACIONES ===
    
    // Validación de fecha de vencimiento del pasaporte (mínimo 6 meses)
    const fechaVencimiento = document.getElementById('fechaVencimiento');
    
    fechaVencimiento.addEventListener('change', function() {
        const fechaSeleccionada = new Date(this.value);
        const fechaActual = new Date();
        const seisMesesDespues = new Date();
        seisMesesDespues.setMonth(seisMesesDespues.getMonth() + 6);
        
        if (fechaSeleccionada < seisMesesDespues) {
            alert('⚠️ ADVERTENCIA: El pasaporte debe tener una vigencia mínima de 6 meses. Por favor, verifique la fecha de vencimiento.');
            this.setCustomValidity('El pasaporte debe tener al menos 6 meses de vigencia');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Validación de fecha de expedición (no puede ser mayor a fecha de vencimiento)
    const fechaExpedicion = document.getElementById('fechaExpedicion');
    
    function validarFechasPasaporte() {
        const expedicion = new Date(fechaExpedicion.value);
        const vencimiento = new Date(fechaVencimiento.value);
        
        if (expedicion && vencimiento && expedicion >= vencimiento) {
            fechaExpedicion.setCustomValidity('La fecha de expedición debe ser anterior a la fecha de vencimiento');
            alert('⚠️ La fecha de expedición no puede ser igual o posterior a la fecha de vencimiento.');
        } else {
            fechaExpedicion.setCustomValidity('');
        }
    }
    
    fechaExpedicion.addEventListener('change', validarFechasPasaporte);
    fechaVencimiento.addEventListener('change', validarFechasPasaporte);
    
    // Validación de formato de email
    const correoElectronico = document.getElementById('correoElectronico');
    
    correoElectronico.addEventListener('blur', function() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailPattern.test(this.value)) {
            this.setCustomValidity('Por favor, ingrese un correo electrónico válido');
            alert('⚠️ El formato del correo electrónico no es válido.');
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Validación de formato de teléfono
    const celular = document.getElementById('celular');
    
    celular.addEventListener('blur', function() {
        // Formato aceptado: +52 o números con al menos 10 dígitos
        const phonePattern = /^[\+]?[0-9\s\-]{10,}$/;
        if (this.value && !phonePattern.test(this.value)) {
            alert('⚠️ Por favor, ingrese un número de teléfono válido (incluya código de país si es internacional, ej: +52)');
        }
    });
    
    // Auto-formateo de nombre completo (convertir a mayúsculas)
    const nombreCompleto = document.getElementById('nombreCompleto');
    
    nombreCompleto.addEventListener('blur', function() {
        this.value = this.value.toUpperCase();
    });
    
    // === FUNCIONALIDADES DE BOTONES ===
    
    // Botón Limpiar
    const btnLimpiar = document.getElementById('btnLimpiar');
    btnLimpiar.addEventListener('click', function() {
        if (confirm('¿Está seguro de que desea limpiar todo el formulario? Esta acción no se puede deshacer.')) {
            form.reset();
            // Ocultar todos los campos condicionales
            document.querySelectorAll('.hidden-input').forEach(input => {
                input.style.display = 'none';
                input.required = false;
            });
            alert('✅ Formulario limpiado correctamente.');
        }
    });
    
    // Botón Guardar Borrador
    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.addEventListener('click', function() {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Guardar en localStorage
        localStorage.setItem('ds160_borrador', JSON.stringify(data));
        localStorage.setItem('ds160_fecha_guardado', new Date().toISOString());
        
        alert('✅ Borrador guardado exitosamente en su navegador.');
    });
    
    // Cargar borrador si existe
    window.addEventListener('load', function() {
        const borrador = localStorage.getItem('ds160_borrador');
        if (borrador) {
            const fechaGuardado = localStorage.getItem('ds160_fecha_guardado');
            const fecha = new Date(fechaGuardado);
            const confirmacion = confirm(
                `Se encontró un borrador guardado el ${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString()}.\n\n¿Desea cargar este borrador?`
            );
            
            if (confirmacion) {
                const data = JSON.parse(borrador);
                
                // Llenar el formulario con los datos guardados
                for (let [key, value] of Object.entries(data)) {
                    const input = form.elements[key];
                    if (input) {
                        if (input.type === 'radio') {
                            const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                            if (radio) {
                                radio.checked = true;
                                radio.dispatchEvent(new Event('change'));
                            }
                        } else {
                            input.value = value;
                        }
                    }
                }
                
                alert('✅ Borrador cargado exitosamente.');
            }
        }
    });
    
    // Botón Exportar a PDF
    const btnExportar = document.getElementById('btnExportar');
    btnExportar.addEventListener('click', function() {
        // Recopilar todos los datos del formulario
        const formData = new FormData(form);
        let contenido = '='.repeat(80) + '\n';
        contenido += 'FORMULARIO DS-160 - INFORMACIÓN PARA VISA AMERICANA\n';
        contenido += '='.repeat(80) + '\n\n';
        
        const secciones = {
            'INFORMACIÓN DE LA CITA': ['ciudadCita', 'otraCiudad'],
            'DATOS PERSONALES': ['nombreCompleto', 'fechaNacimiento', 'ciudadNacimiento', 'estadoNacimiento', 'paisNacimiento', 'otraNacionalidad', 'especificarNacionalidad'],
            'INFORMACIÓN DEL PASAPORTE': ['numeroPasaporte', 'fechaExpedicion', 'fechaVencimiento', 'ciudadExpedicion'],
            'DOMICILIO': ['domicilio', 'telefonoCasa', 'celular'],
            'CONTACTO': ['correoElectronico', 'otrosNumeros', 'listaNumeros', 'correosAdicionales'],
            'REDES SOCIALES': ['redesSociales', 'plataformasAdicionales', 'listaPlataformas']
        };
        
        for (let [seccion, campos] of Object.entries(secciones)) {
            contenido += `\n${seccion}\n`;
            contenido += '-'.repeat(80) + '\n';
            
            campos.forEach(campo => {
                const input = form.elements[campo];
                if (input && input.value) {
                    const label = document.querySelector(`label[for="${campo}"]`)?.textContent || campo;
                    contenido += `${label}: ${input.value}\n`;
                }
            });
        }
        
        contenido += '\n' + '='.repeat(80) + '\n';
        contenido += `Fecha de generación: ${new Date().toLocaleString('es-MX')}\n`;
        contenido += '='.repeat(80);
        
        // Crear blob y descargar
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DS160_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('✅ Formulario exportado exitosamente como archivo de texto.\n\nNota: Para una versión PDF profesional, puede imprimir esta página usando Ctrl+P (Cmd+P en Mac) y seleccionar "Guardar como PDF".');
    });
    
    // === ENVÍO DEL FORMULARIO ===
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar que todos los campos requeridos estén completos
        if (!form.checkValidity()) {
            alert('⚠️ Por favor, complete todos los campos requeridos (marcados con *)');
            form.reportValidity();
            return;
        }
        
        // Mostrar confirmación
        const confirmacion = confirm(
            '¿Está seguro de que toda la información es correcta y desea enviar el formulario?\n\n' +
            'Por favor, revise cuidadosamente todos los datos antes de confirmar.'
        );
        
        if (confirmacion) {
            // Aquí iría la lógica para enviar el formulario al servidor
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Datos del formulario:', data);
            
            // Simular envío exitoso
            alert('✅ ¡Formulario enviado exitosamente!\n\nLos datos han sido recibidos correctamente. Recibirá una confirmación por correo electrónico.');
            
            // Limpiar borrador del localStorage
            localStorage.removeItem('ds160_borrador');
            localStorage.removeItem('ds160_fecha_guardado');
            
            // Opcional: Redireccionar o limpiar formulario
            // window.location.href = 'confirmacion.html';
            // form.reset();
        }
    });
    
    // === AUTO-GUARDADO AUTOMÁTICO ===
    let autoGuardadoTimer;
    
    form.addEventListener('input', function() {
        clearTimeout(autoGuardadoTimer);
        
        autoGuardadoTimer = setTimeout(() => {
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            localStorage.setItem('ds160_autoguardado', JSON.stringify(data));
            localStorage.setItem('ds160_autoguardado_fecha', new Date().toISOString());
            
            // Mostrar indicador de guardado (opcional)
            console.log('Auto-guardado realizado');
        }, 3000); // Guardar después de 3 segundos de inactividad
    });
    
    // === PREVENIR PÉRDIDA DE DATOS ===
    window.addEventListener('beforeunload', function(e) {
        const formData = new FormData(form);
        let hasData = false;
        
        for (let [key, value] of formData.entries()) {
            if (value && value.trim() !== '') {
                hasData = true;
                break;
            }
        }
        
        if (hasData) {
            e.preventDefault();
            e.returnValue = '¿Está seguro de que desea salir? Los cambios no guardados se perderán.';
            return e.returnValue;
        }
    });
    
});
