# Entrega de Turno Nuevo

## Funciones Nuevas
1. Nombre + Cédula Automático. 
    1.1 Juan Diego Mazo Lezcano = 1020110871
    1.2 Juan José Santana Garzón = 1122142959
    1.3 Juan Pablo Gaviria Correa = 1152464110
    1.4 Julian García Araque = 1000401771
    1.5 Kevin Daniel Mosquera Cordoba = 1076819340
    1.6 William David Jarava Solano = 1104410026
    1.7 Yin Carlos Martinez Perez = 72203802

Volver el comando <div class="campo-firma">/<label for="entranteNombre"> en un select donde las opciones de nombre sean los escritos en las opciones 1.1, 1.2, 1.3, 1.4, 1.5, y 1.6 y la cédula se ponga por defecto en <div class="campo-firma">/<label for="estranteDNI"> según el número que est después del igual (=) y que la opción por defecto sea el mensaje de "Selecciona un Analista"

2. Agregar en tareas realizadas lo siguiente: (Condición que se cumple a la hora de escoger el horario de turno principal según el comando <div class="turno-pill" id="turnoPill">/<select id="turnoSelect" class="turno-select" aria-label="Seleccionar turno">)
    - Según la hora de turno en turno poner dicha hora de forma predeterminada, es decir, el horario principal escogido se refleja en esta tarea por defecto.
    - En ticket/caso poner R-000001 de forma predeterminada
    - En descipción se pone: Se brinda atención telefónica y en sitio de los incidentes y requerimientos que se fueron presentando durante el turno. 
    - Esta tarea no es necesaria con imágen.

Esta tarea no puede ser cambiada y siempre debe ponerse a la hora de escoger un turno.

3. Campos de Tickets, Imagenes, Nombre Entrante/Saliente deben ser obligatorios.

Al crear una tarea realizada/pendiente se debe poner los siguientes comandos de forma obligatoria y que sin estos no son llenados no se pueda imprimir el documento
    - Campo de ticket/caso: Comando <div class="col-ticket"> Ticket / Caso </div> en el index.html
    - Campo de agregar imagen(es): Comando function cargarImagenArchivo(input, id) y function _crearThumb(url, dataUrl, previews, indicador, dimsEl, dimWEl, dimHEl, errorEl) en el script.js
    - Campo Empleado Entrante/Saliente: Comando <div class="campo-firma">/<label for="entranteNombre"> y <div class="campo-firma">/<label for="estranteDNI"> pero después del cambio de la tarea 1.

4. En turno principal que por defecto aparezca "Selecciona un Turno" y no unas de las opciones. De la siguiente manera:
	<div class="turno-pill" id="turnoPill"> Selecciona un Turno </div>
    <select id="turnoSelect" class="turno-select" aria-label="Seleccionar turno">
        <option value="6:00 am - 2:00 pm"> 6:00 am - 2:00 pm </option>
		<option value="2:00 pm - 10:00 pm"> 2:00 pm - 10:00 pm </option>
        <option value="10:00 pm - 6:00 am"> 10:00 pm - 6:00 am </option>
    </select>

5. Opciones de actividades divididas en obligatorias y opcionales.

- Actividades Obligatorias (Se habilitan únicamente para el turno de 10:00 p.m. a 6:00 a.m., con excepción de la actividad a).
    Actividades:
    a. Entregas de turno. (Condición especial: Se ejecuta al momento de generar/imprimir el informe correspondiente).
    b. Monitoreo Netux - Hospitalización Piso 7, Torre Sur.
    c. Recorridos de verificación de temperatura - Data Center Piso 4, Torre Sur. 
    d. Recorridos de verificación de Digiturno (Urgencias Adulto y Urgencias Pediátricas/Ginecológicas).
    e. Recorridos de verificación de monitores de signos vitales, sistemas de llamado de enfermería, plataformas Avaya, Álear y televisores Netux.

    Descripción:
    a. Consolidación y envío de los informes de entrega de turno, incluyendo el detalle de los recorridos ejecutados en los turnos de 6:00 a.m., 2:00 p.m. y 10:00 p.m., con periodicidad diaria.
    b. Verificación del estado operativo de los dispositivos de llamado de enfermería mediante las herramientas de soporte del proveedor Netux, incluyendo reemplazo de baterías cuando aplique.
    c. Monitoreo y regulación de la temperatura del Data Center en intervalos de 30 a 40 minutos, garantizando condiciones óptimas de operación. Registro de evidencias en la plataforma Netux y envío de soporte fotográfico a los canales institucionales (grupos de WhatsApp definidos).
    d. Reinicio de sistemas de digiturno en casos de fallas operativas (ausencia de visualización de pacientes, fallas en llamados o mal funcionamiento de la interfaz táctil).
    e. Reinicio y validación operativa de servidores, sistemas Avaya, monitores, dispositivos de llamado de enfermería y soluciones de los proveedores Netux y Álear. Verificación del estado de monitores de signos vitales y escalamiento a Ingeniería Biomédica en caso de incidentes.


- Actividades Opcionales: (Se habilitan para todos los turnos)
    Actividades: 
    a. Apoyo Personal de SAP.
    b. Apoyo Personal Mensajería.
    c. Apoyo Personal de impresión.
    d. Apoyo Personal de Infraestructura.
    e. Actualización de equipos en el servidor OCS Inventory.
    f. Desinstalación o deshabilitación de software no autorizado o sin licenciamiento.
    g. Instalación y actualización de aplicativos institucionales (SAP, OCS, antivirus).
    h. Formateos, Backups y restauraciones programadas.
    i. Reinicio de equipos.
    j. Revisión y estandarización de nombres de equipos.

    Descripción:
    a. Gestión de cuentas SAP: desbloqueo de usuarios, asignación de entornos, desbloqueo de módulos de signos vitales, atención de incidentes de nivel 1 (N1) y escalamiento según corresponda.
    b. Coordinación de solicitudes de transporte interno de medicamentos e insumos hospitalarios, requeridos por áreas como Banco de Sangre y Laboratorio Clínico.
    c. Atención en sitio para mantenimiento de impresoras: reemplazo de tóner, solución de atascos de papel y ajustes de componentes.
    d. Validación en sitio ante fallos de servidores o servicios tecnológicos, incluyendo diagnóstico inicial y escalamiento.
    e. Instalación y actualización del agente OCS Inventory en su versión más reciente en los equipos institucionales.
    f. Desinstalación o deshabilitación de aplicaciones no autorizadas (ej. AnyDesk, WinRAR, 7-Zip, TeamViewer, Kaspersky, entre otros), conforme a políticas de seguridad.
    g. Actualización de versiones de SAP (de 7.70 a 8.00), mantenimiento del agente OCS Inventory e instalación del antivirus corporativo Check Point.
    h. Ejecución de procesos de formateo, respaldo y restauración de información según programación establecida.
    i. Reinicio de equipos intervenidos durante soporte en sitio, con el fin de garantizar estabilidad operativa (especialmente en equipos con alta disponibilidad continua).
    j. Validación y corrección de nomenclatura de equipos en el Directorio Activo, asegurando consistencia con los registros de inventario y activos tecnológicos.

6. Tareas según turno.
- Turno 6:00 a.m. a 2:00 p.m.: Ejecución de la Actividad Obligatoria A (Entregas de turno) y la totalidad de las actividades opcionales.
- Turno 2:00 p.m. a 10:00 p.m.: Ejecución de la Actividad Obligatoria A (Entregas de turno) y la totalidad de las actividades opcionales. 
- Turno 10:00 p.m. a 6:00 a.m.: Ejecución de todas las actividades obligatorias y las actividades opcionales.

# Falta

7. Poner delimitador de tiempo de 8hrs + 30 minutos adccionales según el turno para imprimir la entrega y sino borrar automaticamente (Final)

## Funciones Futuras

1. Poner en tarea según turno De 5:00 p.m a 10:00 p.m se habilita la actividad obligatoria c.

2. Poner el nombre a la imagén si se requiere.

3. Poner el link al caso a la hora de imprimir pdf.
