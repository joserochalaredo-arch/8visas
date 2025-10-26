# 📋 Formulario DS-160 - Visa Americana (Next.js)

Aplicación web moderna construida con Next.js para recopilación de información necesaria para completar el formulario DS-160 de visa americana.

## 🚀 **INICIO RÁPIDO**

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Ver en el navegador
http://localhost:3004 (o el puerto que esté disponible)
```

## 🎯 Características

### ✨ Funcionalidades Principales

- **Formulario Completo**: Todos los campos necesarios para el DS-160
- **Diseño Responsive**: Adaptable a móviles, tablets y desktop
- **Validaciones en Tiempo Real**: Verifica datos mientras el usuario escribe
- **Campos Condicionales**: Muestra/oculta campos según las respuestas
- **Auto-guardado**: Guarda el progreso automáticamente cada 3 segundos
- **Guardar Borrador**: Permite guardar y recuperar borradores manualmente
- **Exportación**: Exporta los datos a archivo de texto o PDF
- **Prevención de Pérdida de Datos**: Alerta antes de salir sin guardar

### 📝 Secciones del Formulario

1. **Información de la Cita**
   - Ciudad de preferencia (GDL, MTY, MEX, Otro)

2. **Datos Personales**
   - Nombre completo (según pasaporte)
   - Fecha y lugar de nacimiento
   - Nacionalidad adicional

3. **Información del Pasaporte**
   - Número de pasaporte
   - Fechas de expedición y vencimiento
   - Validación de vigencia mínima (6 meses)
   - Ciudad de expedición

4. **Domicilio de Casa**
   - Dirección completa con colonia y código postal
   - Teléfono de casa (opcional)
   - Número de celular

5. **Información de Contacto**
   - Correo electrónico principal
   - Números telefónicos anteriores (últimos 5 años)
   - Correos electrónicos adicionales

6. **Redes Sociales**
   - Todas las plataformas actuales
   - Plataformas utilizadas en los últimos 5 años

## 🚀 Cómo Usar

### Instalación

1. Descargue o clone los archivos:
   ```bash
   git clone [repositorio]
   ```

2. Abra el archivo `index.html` en su navegador web

### No Requiere Instalación de Dependencias

Este es un proyecto standalone que funciona con:
- HTML5
- CSS3
- JavaScript Vanilla (sin frameworks)

### Uso del Formulario

1. **Llenar el Formulario**: Complete todos los campos marcados con asterisco (*)
2. **Guardar Borrador**: Haga clic en "Guardar Borrador" para guardar su progreso
3. **Cargar Borrador**: Al recargar la página, se le preguntará si desea cargar el borrador guardado
4. **Exportar**: Use "Exportar a PDF" para descargar los datos
5. **Enviar**: Una vez completo, haga clic en "Enviar Formulario"

## 🎨 Diseño

### Paleta de Colores

- **Azul Principal**: #1e3a8a (Encabezados y botones principales)
- **Naranja Secundario**: #f97316 (Avisos importantes)
- **Verde Éxito**: #16a34a (Validaciones correctas)
- **Rojo Alerta**: #dc2626 (Campos requeridos y errores)

### Diseño Responsive

- **Desktop**: Ancho máximo 900px, diseño completo
- **Tablet**: Formulario adaptado a pantallas medianas
- **Mobile**: Una columna, botones apilados

## ⚙️ Validaciones

### Automáticas

- ✅ Formato de correo electrónico
- ✅ Formato de número telefónico
- ✅ Fecha de vencimiento del pasaporte (mínimo 6 meses)
- ✅ Fechas de expedición/vencimiento coherentes
- ✅ Campos requeridos

### Campos Condicionales

Los siguientes campos aparecen solo cuando son necesarios:
- Especificar otra ciudad (si selecciona "OTRO")
- Especificar nacionalidad adicional (si responde "SÍ")
- Lista de números anteriores (si responde "SÍ")
- Plataformas de redes sociales adicionales (si responde "SÍ")

## 💾 Almacenamiento

### LocalStorage

Los datos se guardan en el navegador usando:
- `ds160_borrador`: Borrador manual del usuario
- `ds160_fecha_guardado`: Fecha del último guardado manual
- `ds160_autoguardado`: Auto-guardado automático
- `ds160_autoguardado_fecha`: Fecha del último auto-guardado

**Nota**: Los datos solo se almacenan localmente en el navegador del usuario y no se envían a ningún servidor hasta que el usuario haga clic en "Enviar Formulario".

## 🔒 Privacidad y Seguridad

- ✅ Los datos se almacenan solo en el navegador local
- ✅ No se envía información a servidores externos sin confirmación
- ✅ El usuario tiene control total sobre sus datos
- ✅ Puede limpiar los datos en cualquier momento

## 📱 Compatibilidad

### Navegadores Soportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Dispositivos

- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablets (iPad, Android)
- ✅ Smartphones (iOS, Android)

## 🛠️ Estructura de Archivos

```
VISAFORM/
│
├── index.html          # Estructura HTML del formulario
├── styles.css          # Estilos y diseño responsive
├── script.js           # Validaciones y funcionalidades
└── README.md          # Este archivo
```

## 📄 Exportación de Datos

### Formato de Texto

Al hacer clic en "Exportar a PDF", se genera un archivo `.txt` con todos los datos del formulario organizados por secciones.

### Imprimir a PDF

Para obtener un PDF con formato:
1. Use `Ctrl+P` (Windows) o `Cmd+P` (Mac)
2. Seleccione "Guardar como PDF"
3. Ajuste la configuración de impresión según prefiera

## 🆘 Soporte

Para reportar problemas o sugerencias, contacte al desarrollador.

## 📝 Notas Importantes

⚠️ **IMPORTANTE**: 
- Este formulario recopila información para completar el DS-160 oficial
- Verifique que todos los datos sean exactamente como aparecen en documentos oficiales
- El pasaporte debe tener vigencia mínima de 6 meses
- Los datos de redes sociales son obligatorios según requisitos del DS-160

## 🔄 Versión

**Versión 1.0** - Octubre 2025

---

Desarrollado para facilitar el proceso de recopilación de información para el formulario DS-160 de visa americana.
