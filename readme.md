# Entrega de Turno 24H

## Descripción

**Sistema digital de registro de entrega de turnos** para operaciones 24/7. Permite a los analistas de soporte registrar:

- **Tareas realizadas** durante el turno (con tickets, descripciones e imágenes).
- **Tareas pendientes** (con motivos).
- **Actividades obligatorias/opcionales** por turno.
- **Firmas digitales** de empleados entrante/saliente.

**Optimizado para impresión** (A4): oculta controles, mantiene layout profesional.

**Turnos soportados**:
- 6:00 am - 2:00 pm
- 2:00 pm - 10:00 pm
- 10:00 pm - 6:00 am (con obligaciones nocturnas extras: B-E)

---

## Funcionalidades

### 1. Sistema de Selección de Turno
- **3 opciones de turno**: 
  - 6:00 am - 2:00 pm
  - 2:00 pm - 10:00 pm
  - 10:00 pm - 6:00 am (turno nocturno con obligaciones adicionales)
- Selector visual con "pill" interactivo
- Al seleccionar turno → genera automáticamente tareas R-000001 y R-000000

### 2. Tareas Automáticas
- **R-000001**: Tarea de inicio de turno (primer registro)
  - Se genera automáticamente al seleccionar turno
  - Horario de inicio/fin según turno seleccionado
  - Descripción fija de "atención telefónica y en sitio"
  - No puede eliminarse
- **R-000000**: Entrega de turno (último registro)
  - Se genera y reposiciona al final automáticamente
  - Consolidación de informes diarios
  - No puede eliminarse
  - Siempre queda al final de la lista

### 3. Gestión de Tareas Realizadas
- **Agregar tarea**: Botón "+ Agregar Tarea" o desde sidebars de actividades
- **Campos por tarea**:
  - Hora inicio (time input)
  - Hora fin (time input)
  - Ticket/Caso (texto, obligatorio)
  - Descripción (textarea, obligatorio)
- **Zona de imágenes**: Subtarea adjuntar evidencias fotográficas
- **Eliminar tarea**: Botón con animación de salida
- **Validación**: Todos los campos requeridos antes de imprimir

### 4. Gestión de Imágenes
- **Carga múltiple**: Seleccionar varias imágenes a la vez
- **Formatos soportados**: Cualquier imagen (image/*)
- **Thumbnails**:
  - Visualización con relationship de aspecto bloqueado
  - Dimensiones configurables (ancho x alto)
  - Relación de aspecto protegida (no se distorsiona)
- **Pie de foto**: Campo de descripción por cada imagen
- **Eliminar imagen**: Botón X individual con animación
- **Previsualización**: Grid centrado, responsive

### 5. Tareas Pendientes
- **Módulo separado**: Sección "Tareas Pendientes"
- **Campos por pendiente**:
  - Ticket/Caso (obligatorio)
  - Descripción del pendiente (obligatorio)
  - Motivo por el que queda pendiente (¿quién debe atenderlo?)
- **Zona de imágenes**: Igual que tareas realizadas
- **Identificación visual**: Borde ámbar, badge "Pendiente"

### 6. Catálogo de Actividades

#### Sidebar izquierdo (Obligatorias):
| ID | Turno | Actividad |
|----|-------|-----------|
| **A** | Todos | Entregas de turno (informes diarios). |
| **B** | Nocturno | Monitoreo Netux Hospitalización P7. |
| **C** | Nocturno | Data Center P4 (temp. cada 30min). |
| **D** | Nocturno | Digiturno Urgencias (reinicio). |
| **E** | Nocturno | Monitores/Avaya/Álear/Netux. |

#### Sidebar derecho (Opcionales):
| ID | Actividad |
|----|-----------|
| **A** | Apoyo SAP (N1). |
| **B** | Mensajería interna. |
| **C** | Impresión (tóner/atascos). |
| **D** | Infraestructura. |
| **E** | OCS Inventory. |
| **F** | Desinstal. software no autorizado. |
| **G** | SAP/OCS/Antivirus. |
| **H** | Formateos/backups. |
| **I** | Reinicio equipos. |
| **J** | Nomenclatura DA. |

**Click en actividad** → agrega como tarea con descripción pre-rellenada

### 7. Firmas Digitales (Responsables)
- **Empleado Entrante**: Selector + DNI automático
- **Empleado Saliente**: Selector + DNI automático
- **Lista hardcodeada de analistas**:
  1. Juan Diego Mazo Lezcano (1020110871)
  2. Juan José Santana Garzón (1122142959)
  3. Juan Pablo Gaviria Correa (1152464110)
  4. Julian García Araque (1000401771)
  5. Kevin Daniel Mosquera Cordoba (1076819340)
  6. William David Jarava Solano (1104410026)
  7. Yin Carlos Martinez Perez (72203802)

### 8. Sistema de Impresión
- **Botón Imprimir**: en action-bar fija
- **Validación previa** (bloquea si falta):
  - Turno seleccionado
  - R-000000 presente
  - R-000001 presente
  - Obligatorias nocturnas (B-E) para turno 10pm-6am
  - Empleados entrante y saliente
  - Tickets en todas las tareas
  - Descripciones en todas las tareas
  - Al menos UNA imagen por tarea
- **Layout print**:
  - Oculta sidebars, botones, uploads
  - Mantiene grid exacto de columnas
  - Colores de fondo forzados
  - Tamaño A4

### 9. Temporizadores de Sesión
#### Fase 1: 8 horas
- Inicia al cargar/limpiar el formulario
- Display: HH:MM:SS
- Alertas de 30 minutos para cleanup

#### Fase 2: 30 minutos (cleanup)
- Se activa automáticamente tras 8h
- Alerta visual y sonora
- Al expirar → **limpieza total automática**
  - Borra localStorage completo
  - Recarga la página

### 10. Auto-guardado (localStorage)
- **Guardado automático**: 600ms debounce tras cambios
- **Persiste**:
  - Ciudad y fecha
  - Turno seleccionado
  - Empleados entrante/saliente
  - Todas las tareas y pendientes
  - Imágenes (data URLs)
  - Descripciones de fotos
- **Restauración**: Al cargar la página
- **Limpiar**: Borra todo permanentemente

### 11. Diseño Responsive
| Dispositivo | Layout |
|------------|--------|
| **Desktop (≥992px)** | 3 columnas (obligatorias \| documento \| opcionales) |
| **Tablet (576-991px)** | 2 columnas, sidebars compactos |
| **Móvil (<576px)** | 1 columna apilada |

### 12. Utilidades Adicionales
- **Fecha dinámica**: Se inicializa con fecha actual
- **Ciudad por defecto**: Medellín
- **Barra de acciones fija**: Always visible (bottom)
- **Animaciones**: Entrada/salida suaves
- **Tooltip en actividades**: Descripción completa al hover

## Características

- **Responsive** (desktop/tablet/móvil).
- **Sidebars dinámicos**: Actividades Obligatorias/Opcionales (colapsan en móvil/print).
- **Tareas automáticas**: R-000001 (inicio turno), R-000000 (entrega turno).
- **Subida de imágenes** con thumbnails redimensionables (aspect-ratio bloqueado).
- **Validación de impresión** (campos obligatorios, actividades nocturnas).
- **Catálogo de actividades** hardcodeado (ver abajo).
- **Print-ready** con `@media print` (colores forzados, layout A4).
- **Zero dependencies** externas (solo Bootstrap CDN + Google Fonts).

## Tecnologías

| Frontend | Herramientas |
|----------|--------------|
| **HTML5** + **CSS3** (variables, grid, flexbox) | Vanilla **JavaScript** (FileReader, DOM) |
| **Bootstrap 5.3** (layout/utilities) | Google Fonts (Playfair Display, Source Sans 3) |


## Uso

1. **Abrir**: `files/index.html` en cualquier navegador.
2. **Llenar**:
   - Selecciona **Turno** → genera tareas auto (R-000001, R-000000).
   - Agrega **Tareas** (+ botón) o clic en sidebars (actividades).
   - Adjunta **imágenes** (múltiples, redimensiona).
   - **Pendientes** (+ botón).
   - **Responsables** (select analistas → auto-DNI).
3. **Imprimir**: Botón **Imprimir** → valida obligatorios.
4. **Limpiar**: Botón **Limpiar** (reinicia todo).

**Demo**: `open files/index.html` (macOS/Linux) o arrastra a Chrome.

## Catálogo de Actividades

**Fuente**: `script.js` → `ACTIVIDADES[]` (extraído para referencia).

### Obligatorias (Sidebar Izq.)
| ID | Turno | Actividad |
|----|-------|-----------|
| **A** | Todos | Entregas de turno (informes diarios). |
| **B** | Nocturno | Monitoreo Netux Hospitalización P7. |
| **C** | Nocturno | Data Center P4 (temp. cada 30min). |
| **D** | Nocturno | Digiturno Urgencias (reinicio). |
| **E** | Nocturno | Monitores/Avaya/Álear/Netux. |

### Opcionales (Sidebar Der.)
| ID | Actividad |
|----|-----------|
| **A** | Apoyo SAP (N1). |
| **B** | Mensajería interna. |
| **C** | Impresión (tóner/atascos). |
| **D** | Infraestructura. |
| **E** | OCS Inventory. |
| **F** | Desinstal. software no autorizado. |
| **G** | SAP/OCS/Antivirus. |
| **H** | Formateos/backups. |
| **I** | Reinicio equipos. |
| **J** | Nomenclatura DA. |

**Click** en sidebar → agrega como tarea con descripción pre-rellenada.

## Notas de Impresión

- **Valida**: Turno, R-000000/1, obligaciones nocturnas, tickets/imágenes, analistas.
- **Oculta**: Sidebars, botones, uploads.
- **Mantiene**: Layout grid exacto, thumbnails usuario.
- **A4 ready**: `@page { size: A4; }`.

## Referencias Visuales

- `Logo_Reference.png`: Logo 24H (usado como SVG inline).
- `Activitys_Referennce.jpeg`: Mockup actividades.

## Analistas Hardcodeados

```
1. Juan Diego Mazo Lezcano     
2. Juan José Santana Garzón    
3. Juan Pablo Gaviria Correa   
4. Julian García Araque        
5. Kevin Daniel Mosquera       
6. William David Jarava        
7. Yin Carlos Martinez Perez   
```

## Estructura del proyecto

```
Entrega de turno/
├── files/
│   ├── index.html                # App principal
│   ├── script.js                 # Lógica (1500+ líneas)
│   ├── styles.css                # Estilos completos + print
│   ├── Logo_Reference.png        # Logo 24H (SVG en código)
│   └── Activitys_Referennce.jpeg # Referencia actividades
```