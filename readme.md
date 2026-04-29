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
3. **Imprimir**: Botón 🔍 **Imprimir** → valida obligatorios.
4. **Limpiar**: Botón 🧹 **Limpiar** (reinicia todo).

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
│   ├── index.html      # App principal
│   ├── script.js       # Lógica (1500+ líneas)
│   ├── styles.css      # Estilos completos + print
│   ├── Logo_Reference.png     # Logo 24H (SVG en código)
│   └── Activitys_Referennce.jpeg # Referencia actividades
├── files (2)/          # Copia de trabajo (VSCode tabs)
├── entrega de turno (mj).html  # Variante entrega
├── entrega de turno (or).html  # Variante entrega
├── Formato entrega de turno.docx
├── files.zip           # Backup
└── info.md             # Notas adicionales
```