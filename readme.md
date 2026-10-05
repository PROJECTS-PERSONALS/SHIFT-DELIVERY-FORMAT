# Entrega de Turno 24H

Sistema digital de registro y entrega de turnos para el equipo de Mesa de Ayuda del Hospital General de Medellín. Permite documentar las actividades ejecutadas durante un turno, adjuntar evidencias fotográficas y de video, enviar el informe por correo electrónico y generar un PDF listo para imprimir, todo sin conexión a internet ni servidor externo.

---

## Estructura del proyecto

```
Project/
├── index.html          # Aplicación principal (326 líneas)
├── script.js           # Lógica completa (2 283 líneas)
├── styles.css          # Estilos + print + responsive (2 417 líneas)
└── img/                # Firmas de los analistas
    ├── firma_juan_camilo_henao.png
    ├── firma_juan_diego_mazo.png
    ├── firma_juan_jose_santana.png
    ├── firma_juan_pablo_gaviria.png
    ├── firma_kevin_mosquera.png
    ├── firma_william_jarava.png
    └── firma_yin_martinez.png
```

---

## Tecnologías

| Capa | Detalle |
|------|---------|
| **HTML5** | Semántica, accesibilidad ARIA, viewport con `viewport-fit=cover` |
| **CSS3** | Variables, grid, flexbox, `@media print`, safe-area insets |
| **JavaScript (ES5 estricto)** | Vanilla JS sin frameworks, IIFE para encapsulamiento |
| **Bootstrap 5.3.3** | Layout de 3 columnas, utilidades responsive |
| **IndexedDB** | Almacenamiento persistente de imágenes y videos (sin límite práctico) |
| **localStorage** | Persistencia de texto, fechas y selecciones |
| **mailto:** | Integración con Outlook sin servidor externo |

---

## Uso rápido

1. Abrir `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox).
2. Seleccionar el **Turno** → se generan automáticamente las tareas R-000001 y R-000000.
3. Agregar **Tareas realizadas** y **Pendientes** con sus tickets, descripciones e imágenes.
4. Completar los **Responsables** (analista entrante y saliente).
5. Usar **Enviar** para preparar el correo o **Imprimir** para generar el PDF.

---

## Funcionalidades

### 1. Selección de Turno

Selector visual con "pill" interactivo. Al cambiar el turno se actualizan automáticamente los horarios de R-000001 y R-000000, y se filtra el catálogo de actividades obligatorias.

| Turno | Obligatorias extras |
|-------|---------------------|
| 6:00 am – 2:00 pm | Solo A |
| 2:00 pm – 10:00 pm | Solo A |
| 10:00 pm – 6:00 am | A + B + C + D + E |

---

### 2. Tareas Automáticas

Ambas se crean al seleccionar turno, no se pueden eliminar y se sincronizan con el horario activo.

| Ticket | Rol | Posición |
|--------|-----|----------|
| **R-000001** | Inicio de turno — atención telefónica y en sitio | Siempre primera |
| **R-000000** | Entrega de turno — consolidación de informes | Siempre última |

---

### 3. Tareas Realizadas

**Campos por tarea:**
- Hora inicio / Hora fin (`input[type="time"]`)
- Ticket / Caso — texto libre, **obligatorio**
- URL del ticket (campo desplegable con ícono de cadena 🔗, opcional)
- Descripción detallada — textarea con auto-resize, **obligatorio**
- Zona de imágenes y videos — **mínimo una evidencia obligatoria**

**Ticket con hipervínculo:**  
Cada campo de ticket tiene un botón de enlace. Al ingresar la URL del ticket, al imprimir el número se convierte en un `<a href>` azul subrayado clicable en el PDF. El patrón de URL del HGM es:
```
https://hgmdesk.hgm.gov.co/pages/UI.php?operation=details&class=UserRequest&id=XXXXXX
```

---

### 4. Gestión de Imágenes y Videos

#### Formas de adjuntar
| Método | Descripción |
|--------|-------------|
| **Galería / Archivo** | Selector múltiple `image/*, video/*` |
| **Cámara** (solo móvil) | Captura directa con `capture="environment"` |
| **Drag & Drop** | Arrastrar desde el explorador sobre la zona de fotos |

#### Características
- Formatos: cualquier imagen (`image/*`) y video (`video/*`)
- Thumbnails con relación de aspecto bloqueada (sin distorsión)
- Dimensiones configurables por ancho o alto (se recalcula el opuesto)
- Campo de **descripción breve** por cada elemento (auto-resize)
- Botón ✕ para eliminar con animación
- Videos con controles nativos (`<video controls>`)

---

### 5. Tareas Pendientes

Sección independiente con identificación visual en ámbar.

**Campos por pendiente:**
- Ticket / Caso con hipervínculo (igual que tareas realizadas)
- Descripción del pendiente — **obligatorio**
- Motivo por el que queda pendiente / quién debe atenderlo
- Zona de imágenes y videos (mismas funciones que tareas, incluyendo cámara y drag & drop)

---

### 6. Catálogo de Actividades

#### Sidebar izquierdo — Obligatorias (filtradas por turno)

| ID | Turno | Actividad |
|----|-------|-----------|
| **A** | Todos | Entregas de turno — consolidación de informes diarios |
| **B** | Nocturno | Monitoreo Netux — Hospitalización Piso 7 |
| **C** | Nocturno | Temperatura Data Center Piso 4 (cada 30–40 min) |
| **D** | Nocturno | Verificación Digiturno Urgencias |
| **E** | Nocturno | Monitores / Avaya / Álear / Netux |

#### Sidebar derecho — Opcionales (todos los turnos)

| ID | Actividad |
|----|-----------|
| **A** | Apoyo SAP (cuentas, módulos, incidentes N1) |
| **B** | Mensajería interna (Banco de Sangre, Laboratorio) |
| **C** | Impresión (tóner, atascos, componentes) |
| **D** | Infraestructura (servidores, escalamiento) |
| **E** | OCS Inventory (instalación/actualización agente) |
| **F** | Desinstalación software no autorizado |
| **G** | Instalación SAP / OCS / Antivirus Check Point |
| **H** | Formateos, backups y restauraciones |
| **I** | Reinicio de equipos |
| **J** | Nomenclatura de equipos en Directorio Activo |

**Clic en el nombre** → previsualiza la descripción completa  
**Botón `+`** → agrega la actividad como tarea con descripción pre-rellenada

---

### 7. Responsables (Firmas)

Selectores de analista entrante y saliente. Al seleccionar un nombre, el campo de cédula se completa automáticamente.

| Analista | Cédula |
|----------|--------|
| Juan Camilo Henao Jiménez | 1001137159 |
| Juan Diego Mazo Lezcano | 1020110871 |
| Juan José Santana Garzón | 1022142959 |
| Juan Pablo Gaviria Correa | 1152464110 |
| Kevin Daniel Mosquera Cordoba | 1076819340 |
| William David Jarava Solano | 1104410026 |
| Yin Carlos Martinez Perez | 72203802 |

---

### 8. Impresión / PDF

**Botón Imprimir** en la barra de acciones fija. Antes de imprimir el sistema valida:

| # | Validación |
|---|-----------|
| 1 | Turno principal seleccionado |
| 2 | Tarea R-000001 presente |
| 3 | Tarea R-000000 presente |
| 4 | Obligatorias B–E completas (turno nocturno) |
| 5 | Empleado entrante seleccionado |
| 6 | Empleado saliente seleccionado |
| 7 | Ticket en cada tarea realizada |
| 8 | Descripción en cada tarea realizada |
| 9 | Al menos una imagen por tarea realizada |
| 10 | Descripción en cada pendiente |
| 11 | Ticket en cada pendiente |
| 12 | Al menos una imagen por pendiente |

**Al imprimir:**
- Los `textarea` se reemplazan por `div` limpios con `white-space: pre-wrap` para que el texto nunca se corte.
- Los tickets con URL se convierten en `<a href>` clicables en el PDF.
- Los sidebars, botones y zonas de carga desaparecen.
- El PDF respeta el ancho y alto exacto que el usuario configuró en los thumbnails.
- Tamaño A4, márgenes 10 mm × 12 mm, colores forzados con `print-color-adjust: exact`.

---

### 9. Envío de Correo (Outlook)

**Botón Enviar** en la barra de acciones. Abre un modal con:

| Campo | Valor pre-rellenado |
|-------|---------------------|
| Para | `coordinadormesadeayuda@hgm.gov.co` (editable) |
| CC | Coordinadores (editable) |
| Asunto | `Se Hace La Respectiva Entrega De Turno Del Día DD/MM/AAAA` |
| Mensaje | Plantilla oficial con turno y nombre del analista saliente |
| Firma | Imagen de `img/firma_[analista].png` según el analista saliente |

Al confirmar se abre Outlook con todos los campos pre-rellenados mediante `mailto:`. No requiere servidor ni configuración adicional.

**Para agregar o actualizar una firma:** reemplazar el archivo `img/firma_[nombre].png` con la imagen correspondiente (PNG, fondo blanco, ~700 px de ancho).

---

### 10. Persistencia Total (localStorage + IndexedDB)

Los datos sobreviven recargas, cierres de pestaña y reinicios del navegador.

| Dato | Almacén |
|------|---------|
| Ciudad, fecha, turno, analistas | `localStorage` |
| Texto de tareas, pendientes y captions | `localStorage` |
| URLs de tickets | `localStorage` |
| Imágenes y videos (data-URLs) | `IndexedDB` |

**Auto-guardado:** 600 ms de debounce tras cada cambio. No requiere acción del usuario.  
**Restauración:** automática al cargar la página.  
**Limpiar:** el botón "Limpiar" borra `localStorage` e `IndexedDB` y reinicia el formulario.

---

### 11. Temporizadores de Sesión

#### Fase 1 — Turno activo (8 horas)
- Inicia al cargar la página o al pulsar "Limpiar".
- Muestra cuenta regresiva HH:MM:SS en la barra de acciones y en el footer.
- Al expirar: alerta y transición a Fase 2.

#### Fase 2 — Limpieza (30 minutos)
- Cuenta regresiva con indicador en rojo intermitente.
- Al expirar: borra todos los datos (`localStorage` + `IndexedDB`) y recarga la página.
- Los timestamps persisten entre recargas: si el navegador se cierra durante Fase 1, al reabrir continúa desde donde quedó; si Fase 2 ya expiró, limpia de inmediato.

---

### 12. Diseño Responsive

| Viewport | Layout |
|----------|--------|
| ≥ 992 px (desktop) | 3 columnas: obligatorias — documento — opcionales |
| 576–991 px (tablet) | Documento centrado, sidebars colapsados |
| < 576 px (móvil) | Columna única apilada, botones de mínimo 44–48 px táctiles |

**Móvil:** aparece el botón **Cámara** junto a Galería/Archivo para captura directa. En desktop y tablet este botón está oculto.  
**iPhone con notch / Dynamic Island:** safe-area insets aplicados en la barra de acciones (`env(safe-area-inset-bottom)`).  
**PWA:** metas `apple-mobile-web-app-capable` y `theme-color` para instalación en pantalla de inicio.

---

## Notas de mantenimiento

### Agregar un analista
1. En `script.js`, agregar el objeto al array `ANALISTAS`:
   ```js
   { nombre: 'Nombre Completo', cedula: '123456789' }
   ```
2. Agregar la imagen de firma en `img/firma_nombre_apellido.png`.
3. En `script.js`, agregar la entrada al objeto `FIRMAS_ANALISTAS`:
   ```js
   'Nombre Completo': 'img/firma_nombre_apellido.png'
   ```

### Agregar una actividad al catálogo
En `script.js`, agregar un objeto al array `ACTIVIDADES`:
```js
{
    id: 'OPC-K',
    letra: 'K',
    tipo: 'opcional',          // 'obligatoria' | 'opcional'
    turnos: null,              // null = todos | ['10:00 pm - 6:00 am'] = solo nocturno
    nombre: 'Nombre corto',
    descripcion: 'Descripción detallada que aparecerá al agregar la actividad.'
}
```

### Modificar los destinatarios del correo
En `index.html`, cambiar los atributos `value` de los campos `#emailPara` y `#emailCC`.

### Cambiar la duración de los temporizadores
En `script.js`, dentro del IIFE del módulo de temporizadores:
```js
var DUR_8H  = 8 * 60 * 60 * 1000;   // Fase 1: 8 horas
var DUR_30M = 30 * 60 * 1000;        // Fase 2: 30 minutos
```

---

## Bugs corregidos (historial)

| # | Descripción |
|---|-------------|
| 1 | `cedulaEntrante2` no declarada con `var` (ReferenceError en strict mode) |
| 2 | `limpiarFormulario()` no llamaba `_limpiarLocalStorage()` — datos volvían al recargar |
| 3 | `_hardReset()` en cada `load`/`pageshow` destruía el estado guardado |
| 4 | Typo `tapeaMaestraExiste` → `tareaMaestraExiste` |
| 5 | `aria-label` incorrecto: "Descripción de la video" → "Descripción del video" |
| 6 | `redimensionarDesdeAlturaPend` no sincronizaba el ancho del caption |
| 7 | `_crearThumb` (legacy) no llamaba `guardarEstadoDebounced` al eliminar |
| 8 | `eliminarFila()` no reposicionaba la tarea maestra ni guardaba estado |
| 9 | `.campo-ok` y `.campo-vacio` sin definición CSS |
| 10 | `.tarea-fila--maestra` sin definición CSS |
| 11 | Bootstrap 5.3.8 inexistente → corregido a 5.3.3 con hashes SRI válidos |
| 12 | Imágenes nunca se guardaban en localStorage (límite ~5 MB) → migrado a IndexedDB |
| 13 | `limpiarProyecto()` usaba `localStorage.clear()` borrando timestamps del timer |
| 14 | `IDB` usada en `_hardReset()` antes de su declaración (ReferenceError potencial) |
| 15 | Tres `DOMContentLoaded` simultáneos → consolidados en `initBotones()` |
| 16 | `window.location.href = mailto` navega fuera de la app en móvil |
| 17 | `validarParaImprimir()` no validaba descripción de pendientes |
| 18 | `_restaurarEstado()` no creaba tarea maestra R-000000 antes de restaurar tareas manuales |
| 19 | Listeners duplicados en `fechaInput` y `ciudadInput` por llamadas múltiples a `initFecha()` |
| 20 | `_crearThumb` dead code (~45 líneas) eliminada |
