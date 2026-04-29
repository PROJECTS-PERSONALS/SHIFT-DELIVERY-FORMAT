// ENTREGA DE TURNO INTERACCIONES/ANIMACIONES
'use strict';

/* ── DATOS DE PERSONAL ── */
var ANALISTAS = [
	{ nombre: 'Juan Diego Mazo Lezcano',       cedula: '1020110871' },
	{ nombre: 'Juan José Santana Garzón',      cedula: '1122142959' },
	{ nombre: 'Juan Pablo Gaviria Correa',     cedula: '1152464110' },
	{ nombre: 'Julian García Araque',          cedula: '1000401771' },
	{ nombre: 'Kevin Daniel Mosquera Cordoba', cedula: '1076819340' },
	{ nombre: 'William David Jarava Solano',   cedula: '1104410026' },
	{ nombre: 'Yin Carlos Martinez Perez',     cedula: '72203802'   }
];

/* IDs reservados para tareas fijas */
var ID_TAREA_TURNO   = 'tarea-turno-automatica';   /* Tarea de inicio de turno (primera) */
var ID_TAREA_MAESTRA = 'tarea-entrega-maestra';    /* Tarea R-000000 Entrega de turno (última) */

/* ══════════════════════════════════════════════════════════════
   HARD RESET AL CARGAR
   Se ejecuta en window.onload para cubrir también el bfcache
   (navegación hacia atrás sin recarga real).
   ══════════════════════════════════════════════════════════════ */
window.addEventListener('load', function () {
	_hardReset();
});

/* También en pageshow para cubrir bfcache en Safari/Firefox */
window.addEventListener('pageshow', function (e) {
	if (e.persisted) { _hardReset(); }
});

/**
 * Limpieza total del estado de la aplicación.
 * Borra localStorage/sessionStorage, resetea selects e inputs,
 * vacía listas y reinicia contadores.
 */
function _hardReset() {
	/* 1. Limpiar cualquier dato persistido en storage */
	try { localStorage.clear();   } catch (e) { /* file:// puede no tener acceso */ }
	try { sessionStorage.clear(); } catch (e) { /* ídem */ }

	/* 2. Turno */
	var turnoSelect = document.getElementById('turnoSelect');
	var turnoPill   = document.getElementById('turnoPill');
	if (turnoSelect) { turnoSelect.selectedIndex = 0; }
	if (turnoPill)   { turnoPill.textContent = 'Selecciona un Turno'; }

	/* 3. Analistas */
	['entranteNombre', 'salienteNombre'].forEach(function (id) {
		var el = document.getElementById(id);
		if (el) el.selectedIndex = 0;
	});
	['estranteDNI', 'salienteDNI'].forEach(function (id) {
		var el = document.getElementById(id);
		if (el) el.value = '';
	});

	/* 4. Ciudad y fecha */
	var ciudad = document.getElementById('ciudadInput');
	if (ciudad) ciudad.value = 'Medellín';
	initFecha();

	/* 5. Vaciar listas */
	var lt = document.getElementById('listaTareas');
	var lp = document.getElementById('listaPendientes');
	if (lt) lt.innerHTML = '';
	if (lp) lp.innerHTML = '';

	/* 6. Resetear contadores */
	_idTarea     = 0;
	_idPendiente = 0;

	/* 7. Mensajes vacíos */
	mostrarMsgVacio('listaTareas',    'tarea');
	mostrarMsgVacio('listaPendientes', 'pendiente');

	/* 8. Panel de obligatorias al estado inicial (sin turno = aviso) */
	if (typeof _renderObligatorias === 'function') {
		_renderObligatorias(); /* sin turno = aviso */
	}
}

/* INICIALIZACIÓN */
document.addEventListener('DOMContentLoaded', function () {
	initLogo();
	initFecha();
	initFooter();
	initBotones();
	initTurnoPill();
	initSelectAnalistas();
	initActividades();
	mostrarMsgVacio('listaTareas',    'tarea');
	mostrarMsgVacio('listaPendientes', 'pendiente');
});

/* LOGO */
function initLogo() { /* logo is static */ }

/* TURNO PILL */
function initTurnoPill() {
	var pill   = document.getElementById('turnoPill');
	var select = document.getElementById('turnoSelect');
	if (!select || !pill) return;

	/* Opción inicial vacía sin valor real */
	var opcionDefault = document.createElement('option');
	opcionDefault.value       = '';
	opcionDefault.textContent = 'Selecciona un Turno';
	opcionDefault.disabled    = true;
	opcionDefault.selected    = true;
	select.insertBefore(opcionDefault, select.firstChild);

	pill.textContent = 'Selecciona un Turno';

	select.addEventListener('change', function () {
		pill.textContent = select.value;
		_insertarOActualizarTareaTurno(select.value);
		_sincronizarHorasTareaMaestra(select.value);  /* ── sincronizar horas R-000000 ── */
		_insertarOActualizarTareaMaestra();           /* garantizar tarea R-000000 al final */
		_renderObligatorias(select.value);            /* actualizar panel de obligatorias */
	});
}

/* FECHA POR DEFECTO */
function initFecha() {
	var el = document.getElementById('fechaInput');
	if (!el) return;
	var hoy = new Date();
	el.value = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
}

/* CONTADORES */
var _idTarea     = 0;
var _idPendiente = 0;
function nextIdTarea()     { return ++_idTarea; }
function nextIdPendiente() { return ++_idPendiente; }

/* ── TAREA AUTOMÁTICA DE INICIO DE TURNO (primera) ── */
/**
 * Inserta (o actualiza si ya existe) la fila de tarea de turno obligatoria.
 * Esta fila no tiene zona de imágenes y no puede eliminarse.
 * @param {string} turno  Valor del turno seleccionado (ej. "6:00 am - 2:00 pm")
 */
function _insertarOActualizarTareaTurno(turno) {
	var contenedor = document.getElementById('listaTareas');

	/* Si ya existe, solo actualizar los campos de hora */
	var filaExistente = document.getElementById(ID_TAREA_TURNO);
	if (filaExistente) {
		var inputs = filaExistente.querySelectorAll('input[type="time"]');
		var partes = _parsearHorasTurno(turno);
		if (inputs[0]) inputs[0].value = partes.inicio;
		if (inputs[1]) inputs[1].value = partes.fin;
		return;
	}

	/* Primera vez: quitar mensaje vacío e insertar al INICIO */
	quitarMsgVacio(contenedor);

	var partes = _parsearHorasTurno(turno);
	var desc   = 'Se brinda atención telefónica y en sitio de los incidentes y requerimientos que se fueron presentando durante el turno.';

	var fila = document.createElement('div');
	fila.className = 'tarea-fila';
	fila.id        = ID_TAREA_TURNO;
	fila.setAttribute('role', 'listitem');
	fila.setAttribute('data-turno-auto', 'true');

	fila.innerHTML =
		'<div class="tarea-grid">' +
			/* Col 1 — Hora */
			'<div class="t-cell">' +
				'<div class="hora-grupo">' +
					'<span class="hora-label"> Inicio </span>' +
					'<input type="time" value="' + partes.inicio + '" aria-label="Hora de inicio de la tarea" readonly>' +
				'</div>' +
				'<div class="hora-grupo">' +
					'<span class="hora-label"> Fin </span>' +
					'<input type="time" value="' + partes.fin + '" aria-label="Hora de fin de la tarea" readonly>' +
				'</div>' +
			'</div>' +
			/* Col 2 — Ticket */
			'<div class="t-cell">' +
				'<input type="text" class="input-ticket" value="R-000001" maxlength="30" autocomplete="off" aria-label="Número de ticket o caso" readonly>' +
			'</div>' +
			/* Col 3 — Descripción */
			'<div class="t-cell">' +
				'<textarea rows="3" aria-label="Descripción de la tarea" readonly>' + desc + '</textarea>' +
			'</div>' +
			/* Col 4 — Sin botón eliminar */
			'<div class="t-cell">' +
				'<span style="font-size:10px; color:var(--gris-400); font-style:italic; text-align:center;"> Tarea&nbsp;de&nbsp;turno </span>' +
			'</div>' +
		'</div>';
	/* Sin zona de imágenes para esta tarea */

	/* Insertar siempre como PRIMER elemento */
	contenedor.insertBefore(fila, contenedor.firstChild);
}

/* ── TAREA MAESTRA R-000000 "Entrega de turno" (última) ── */
/**
 * Inserta (o reposiciona si ya existe) la tarea maestra R-000000.
 * Siempre debe ser la ÚLTIMA tarea de la lista.
 * Sin zona de imágenes. No puede eliminarse.
 */
function _insertarOActualizarTareaMaestra() {
	var contenedor = document.getElementById('listaTareas');

	/* Si ya existe, reposicionar al final */
	var filaExistente = document.getElementById(ID_TAREA_MAESTRA);
	if (filaExistente) {
		contenedor.appendChild(filaExistente); /* mover al final */
		return;
	}

	/* Primera vez: crear e insertar al final */
	var turno  = (document.getElementById('turnoSelect') || {}).value || '';
	var partes = _parsearHorasTurno(turno);
	var desc   = 'Consolidación y envío de los informes de entrega de turno, incluyendo el detalle de los recorridos ejecutados en los turnos de 6:00 a.m., 2:00 p.m. y 10:00 p.m., con periodicidad diaria.';

	var fila = document.createElement('div');
	fila.className = 'tarea-fila tarea-fila--maestra';
	fila.id        = ID_TAREA_MAESTRA;
	fila.setAttribute('role', 'listitem');
	fila.setAttribute('data-turno-auto', 'true');
	fila.setAttribute('data-maestra', 'true');

	fila.innerHTML =
		'<div class="tarea-grid">' +
			/* Col 1 — Hora */
			'<div class="t-cell">' +
				'<div class="hora-grupo">' +
					'<span class="hora-label"> Inicio </span>' +
					'<input type="time" value="' + partes.inicio + '" aria-label="Hora de inicio de la tarea" readonly>' +
				'</div>' +
				'<div class="hora-grupo">' +
					'<span class="hora-label"> Fin </span>' +
					'<input type="time" value="' + partes.fin + '" aria-label="Hora de fin de la tarea" readonly>' +
				'</div>' +
			'</div>' +
			/* Col 2 — Ticket */
			'<div class="t-cell">' +
				'<input type="text" class="input-ticket" value="R-000000" maxlength="30" autocomplete="off" aria-label="Número de ticket o caso" readonly>' +
			'</div>' +
			/* Col 3 — Descripción */
			'<div class="t-cell">' +
				'<textarea rows="3" aria-label="Descripción de la tarea" readonly>' + desc + '</textarea>' +
			'</div>' +
			/* Col 4 — Sin botón eliminar */
			'<div class="t-cell">' +
				'<span style="font-size:10px; color:var(--gris-400); font-style:italic; text-align:center;"> Entrega&nbsp;de&nbsp;turno </span>' +
			'</div>' +
		'</div>';
	/* Sin zona de imágenes */

	contenedor.appendChild(fila);
}

/**
 * Reposiciona la tarea maestra al final de la lista.
 * Se llama cada vez que se agrega una nueva tarea manual.
 */
function _asegurarTareaMaestraAlFinal() {
	var maestra    = document.getElementById(ID_TAREA_MAESTRA);
	var contenedor = document.getElementById('listaTareas');
	if (maestra && contenedor) {
		contenedor.appendChild(maestra); /* si ya está al final, no hay reflow */
	}
}

/**
 * Sincroniza los campos Hora Inicio y Hora Fin de la tarea maestra R-000000
 * cada vez que el usuario cambia el turno principal.
 * @param {string} turno  Valor del select de turno
 */
function _sincronizarHorasTareaMaestra(turno) {
	var maestra = document.getElementById(ID_TAREA_MAESTRA);
	if (!maestra) return; /* aún no existe, se creará en _insertarOActualizarTareaMaestra */
	var inputs = maestra.querySelectorAll('input[type="time"]');
	var partes  = _parsearHorasTurno(turno);
	if (inputs[0]) inputs[0].value = partes.inicio;
	if (inputs[1]) inputs[1].value = partes.fin;
}

/**
 * Convierte un string de turno a horas HH:MM para inputs tipo time.
 * @param {string} turno
 * @returns {{ inicio: string, fin: string }}
 */
function _parsearHorasTurno(turno) {
	var map = {
		'6:00 am - 2:00 pm':  { inicio: '06:00', fin: '14:00' },
		'2:00 pm - 10:00 pm': { inicio: '14:00', fin: '22:00' },
		'10:00 pm - 6:00 am': { inicio: '22:00', fin: '06:00' }
	};
	return map[turno] || { inicio: '', fin: '' };
}

/* TAREAS REALIZADAS */
function agregarTarea() {
	var id         = nextIdTarea();
	var contenedor = document.getElementById('listaTareas');
	quitarMsgVacio(contenedor);

	var fila = document.createElement('div');
	fila.className = 'tarea-fila';
	fila.id        = 'tarea-' + id;
	fila.setAttribute('role', 'listitem');

	fila.innerHTML =
		'<div class="tarea-grid">' +
			/* Hora inicio / fin */
			'<div class="t-cell">' +
				'<div class="hora-grupo">' +
					'<span class="hora-label"> Inicio </span>' +
					'<input type="time" aria-label="Hora de inicio de la tarea">' +
				'</div>' +
				'<div class="hora-grupo">' +
					'<span class="hora-label"> Fin </span>' +
					'<input type="time" aria-label="Hora de fin de la tarea">' +
				'</div>' +
			'</div>' +
			/* Col 2 — Ticket */
			'<div class="t-cell">' + '<input type="text" class="input-ticket"' + ' placeholder="Ej: I-160000 / R-160000"' + ' maxlength="30" autocomplete="off"' + ' aria-label="Número de ticket o caso">' + '</div>' +
			/* Col 3 — Descripción */
			'<div class="t-cell">' + '<textarea placeholder="Descripción detallada de la tarea realizada…"' + ' rows="3" aria-label="Descripción de la tarea (obligatoria)" class="campo-requerido" oninput="marcarCampo(this)"></textarea>' + '</div>' +
			/* Col 4 — Eliminar */
			'<div class="t-cell">' + '<button class="btn-eliminar" type="button"' + ' onclick="eliminarFila(\'tarea-' + id + '\',\'listaTareas\',\'tarea\')"' + ' title="Eliminar esta tarea" aria-label="Eliminar tarea">' + svgEliminar() + ' Eliminar' + '</button>' + '</div>' +
		'</div>' +
		/*  Zona de imágenes */
		'<div class="tarea-fotos-row" id="fotosRow-' + id + '">' +
			/* Indicador: solo visible cuando no hay imágenes */
			'<span class="fotos-indicador" id="fotosIndicador-' + id + '">' + svgFotoIcono() + '<span> Sin imágenes adjuntas </span>' + '</span>' +
			/* Bloque de carga — solo desde PC */
			'<div class="url-imagen-wrap" id="urlWrap-' + id + '">' +
				'<label class="btn-cargar-pc" title="Seleccionar imagen desde tu equipo (obligatorio)">' + svgFotoIcono() + ' Agregar imagen(es) <span class="asterisco-obligatorio" aria-hidden="true">*</span>' + '<input type="file" accept="image/*" multiple hidden' + ' onchange="cargarImagenArchivo(this,' + id + ')">'  + '</label>' +
				/* Controles de dimensiones */
				'<div class="url-dimensiones" id="dims-' + id + '" hidden>' +
					'<label class="dims-label"> Anchura </label>' + 
					'<input type="number" class="dims-input" id="dimW-' + id + '"' + ' min="40" max="800" step="1"' + ' aria-label="Anchura del thumbnail en píxeles"' + ' onchange="redimensionar(' + id + ')">' +
					'<svg class="dims-lock-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"' + ' title="Relación de aspecto bloqueada">' +
						'<rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>' +
						'<path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
					'</svg>' +
					'<label class="dims-label"> Altura </label>' +
					'<input type="number" class="dims-input" id="dimH-' + id + '"' + ' min="30" max="600" step="1"' + ' aria-label="Altura del thumbnail en píxeles"' + ' onchange="redimensionarDesdeAltura(' + id + ')">' +
			 	'</div>' +
				/* Error: solo aparece cuando la imagen realmente falla */
				'<div class="url-error" id="urlError-' + id + '" hidden>' + svgAlerta() +
					'<span> No se pudo cargar la imagen. Verifica la URL o el archivo. </span>' +
				'</div>' +
			'</div>' + /* /url-imagen-wrap */
			/* Grid de thumbnails */
			'<div class="previews-grid" id="previews-' + id + '"></div>' +
		'</div>';

	contenedor.appendChild(fila);

	/* Garantizar que la tarea maestra siempre quede al final */
	_asegurarTareaMaestraAlFinal();
}

/* CARGAR IMAGEN */
/**
 * Carga una o varias imágenes seleccionadas desde el equipo del usuario.
 * Usa FileReader para leer el archivo como Data URL y crear el thumbnail.
 * No muestra el error si el archivo carga correctamente.
 * @param {HTMLInputElement} input   El <input type="file"> que disparó el evento
 * @param {number}           id      ID de la fila de tarea
 */
function cargarImagenArchivo(input, id) {
	var errorEl   = document.getElementById('urlError-' + id);
	var indicador = document.getElementById('fotosIndicador-' + id);
	var previews  = document.getElementById('previews-' + id);
	var dimsEl    = document.getElementById('dims-' + id);
	var dimWEl    = document.getElementById('dimW-' + id);
	var dimHEl    = document.getElementById('dimH-' + id);

	var archivos = Array.prototype.slice.call(input.files);
	if (!archivos.length) return;

	archivos.forEach(function (archivo) {
		if (!archivo.type.startsWith('image/')) {
			mostrarError(errorEl);
			return;
		}

		var reader = new FileReader();
		reader.onload = function (e) {
			var dataUrl = e.target.result;

			var img = new Image();
			img.onload = function () {
				ocultarError(errorEl);

				var ratioNatural = img.naturalWidth / img.naturalHeight;
				var anchoInicial = 600;
				var altoInicial  = Math.round(anchoInicial / ratioNatural);

				var wrap = document.createElement('div');
				wrap.className     = 'preview-thumb';
				wrap.dataset.ratio = ratioNatural;
				wrap.style.width   = anchoInicial + 'px';
				wrap.style.height  = altoInicial  + 'px';

				var imgEl = document.createElement('img');
				imgEl.src = dataUrl;
				imgEl.alt = archivo.name;

				var btnDel = document.createElement('button');
				btnDel.className = 'btn-del-foto';
				btnDel.innerHTML = '&#10005;';
				btnDel.title     = 'Eliminar imagen';
				btnDel.type      = 'button';
				btnDel.setAttribute('aria-label', 'Eliminar imagen adjunta');

				btnDel.addEventListener('click', function () {
					wrap.style.transition = 'opacity .2s, transform .2s';
					wrap.style.opacity    = '0';
					wrap.style.transform  = 'scale(.85)';
					setTimeout(function () {
						wrap.remove();
						if (previews.children.length === 0) {
							indicador.style.display = '';
							dimsEl.hidden = true;
						}
					}, 200);
				});

				wrap.appendChild(imgEl);
				wrap.appendChild(btnDel);
				previews.appendChild(wrap);

				indicador.style.display = 'none';
				dimsEl.hidden = false;
				dimWEl.value  = anchoInicial;
				dimHEl.value  = altoInicial;
			};

			img.onerror = function () { mostrarError(errorEl); };
			img.src = dataUrl;
		};

		reader.onerror = function () { mostrarError(errorEl); };
		reader.readAsDataURL(archivo);
	});
	/* Resetear el input para permitir re-seleccionar el mismo archivo */
	input.value = '';
}

/* REDIMENSIONAR THUMBNAILS */
/**
 * Ajusta el ancho de todos los thumbnails de una fila.
 * El alto se recalcula automáticamente usando el ratio natural
 * de cada imagen (aspect-ratio bloqueado, sin distorsión).
 * @param {number} id  ID de la fila de tarea
 */
function redimensionar(id) {
	var dimWEl     = document.getElementById('dimW-' + id);
	var dimHEl     = document.getElementById('dimH-' + id);
	var previews   = document.getElementById('previews-' + id);
	var nuevoAncho = parseInt(dimWEl.value, 10);

	if (isNaN(nuevoAncho) || nuevoAncho < 40) return;

	var thumbs    = previews.querySelectorAll('.preview-thumb');
	var nuevoAlto = nuevoAncho; /* fallback si no hay ratio */

	thumbs.forEach(function (wrap) {
		var ratio = parseFloat(wrap.dataset.ratio) || 1;
		nuevoAlto = Math.round(nuevoAncho / ratio);
		wrap.style.width  = nuevoAncho + 'px';
		wrap.style.height = nuevoAlto  + 'px';
	});

	dimHEl.value = nuevoAlto;
}

/**
 * Ajusta el alto → recalcula el ancho (ratio bloqueado).
 * Actualiza todos los thumbnails de la fila.
 * @param {number} id  ID de la fila de tarea
 */
function redimensionarDesdeAltura(id) {
	var dimWEl    = document.getElementById('dimW-' + id);
	var dimHEl    = document.getElementById('dimH-' + id);
	var previews  = document.getElementById('previews-' + id);
	var nuevoAlto = parseInt(dimHEl.value, 10);

	if (isNaN(nuevoAlto) || nuevoAlto < 30) return;

	var thumbs     = previews.querySelectorAll('.preview-thumb');
	var nuevoAncho = nuevoAlto; /* fallback */

	thumbs.forEach(function (wrap) {
		var ratio = parseFloat(wrap.dataset.ratio) || 1;
		nuevoAncho = Math.round(nuevoAlto * ratio);
		wrap.style.width  = nuevoAncho + 'px';
		wrap.style.height = nuevoAlto  + 'px';
	});

	dimWEl.value = nuevoAncho;
}


/* ══════════════════════════════════════════════════════════════
   MÓDULO: ACTIVIDADES DEL TURNO
   Fuente de datos: README.MD — no modificar sin actualizar allí.
   ══════════════════════════════════════════════════════════════ */

/**
 * Catálogo completo de actividades.
 * tipo:    'obligatoria' | 'opcional'
 * turnos:  null = todos los turnos | array de valores de turno = solo esos
 *
 * Regla README (sección 6):
 *   - Obligatoria A  → todos los turnos (al imprimir/generar el informe)
 *   - Obligatorias B-E → solo turno nocturno '10:00 pm - 6:00 am'
 *   - Opcionales A-J   → todos los turnos
 */
var ACTIVIDADES = [
	/* ── OBLIGATORIAS ─────────────────────────────────────── */
	{
		id:     'OBL-A',
		letra:  'A',
		tipo:   'obligatoria',
		turnos: null, /* todos los turnos */
		nombre: 'Entregas de turno',
		descripcion: 'Consolidación y envío de los informes de entrega de turno, incluyendo el detalle de los recorridos ejecutados en los turnos de 6:00 a.m., 2:00 p.m. y 10:00 p.m., con periodicidad diaria.'
	},
	{
		id:     'OBL-B',
		letra:  'B',
		tipo:   'obligatoria',
		turnos: ['10:00 pm - 6:00 am'],
		nombre: 'Monitoreo Netux — Hospitalización Piso 7, Torre Sur',
		descripcion: 'Verificación del estado operativo de los dispositivos de llamado de enfermería mediante las herramientas de soporte del proveedor Netux, incluyendo reemplazo de baterías cuando aplique.'
	},
	{
		id:     'OBL-C',
		letra:  'C',
		tipo:   'obligatoria',
		turnos: ['10:00 pm - 6:00 am'],
		nombre: 'Recorridos de verificación de temperatura — Data Center Piso 4, Torre Sur',
		descripcion: 'Monitoreo y regulación de la temperatura del Data Center en intervalos de 30 a 40 minutos, garantizando condiciones óptimas de operación. Registro de evidencias en la plataforma Netux y envío de soporte fotográfico a los canales institucionales (grupos de WhatsApp definidos).'
	},
	{
		id:     'OBL-D',
		letra:  'D',
		tipo:   'obligatoria',
		turnos: ['10:00 pm - 6:00 am'],
		nombre: 'Recorridos de verificación de Digiturno (Urgencias Adulto y Urgencias Pediátricas/Ginecológicas)',
		descripcion: 'Reinicio de sistemas de digiturno en casos de fallas operativas (ausencia de visualización de pacientes, fallas en llamados o mal funcionamiento de la interfaz táctil).'
	},
	{
		id:     'OBL-E',
		letra:  'E',
		tipo:   'obligatoria',
		turnos: ['10:00 pm - 6:00 am'],
		nombre: 'Recorridos de verificación de monitores de signos vitales, sistemas de llamado de enfermería, plataformas Avaya, Álear y televisores Netux',
		descripcion: 'Reinicio y validación operativa de servidores, sistemas Avaya, monitores, dispositivos de llamado de enfermería y soluciones de los proveedores Netux y Álear. Verificación del estado de monitores de signos vitales y escalamiento a Ingeniería Biomédica en caso de incidentes.'
	},

	/* ── OPCIONALES ────────────────────────────────────────── */
	{
		id:     'OPC-A',
		letra:  'A',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Apoyo Personal de SAP',
		descripcion: 'Gestión de cuentas SAP: desbloqueo de usuarios, asignación de entornos, desbloqueo de módulos de signos vitales, atención de incidentes de nivel 1 (N1) y escalamiento según corresponda.'
	},
	{
		id:     'OPC-B',
		letra:  'B',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Apoyo Personal Mensajería',
		descripcion: 'Coordinación de solicitudes de transporte interno de medicamentos e insumos hospitalarios, requeridos por áreas como Banco de Sangre y Laboratorio Clínico.'
	},
	{
		id:     'OPC-C',
		letra:  'C',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Apoyo Personal de impresión',
		descripcion: 'Atención en sitio para mantenimiento de impresoras: reemplazo de tóner, solución de atascos de papel y ajustes de componentes.'
	},
	{
		id:     'OPC-D',
		letra:  'D',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Apoyo Personal de Infraestructura',
		descripcion: 'Validación en sitio ante fallos de servidores o servicios tecnológicos, incluyendo diagnóstico inicial y escalamiento.'
	},
	{
		id:     'OPC-E',
		letra:  'E',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Actualización de equipos en el servidor OCS Inventory',
		descripcion: 'Instalación y actualización del agente OCS Inventory en su versión más reciente en los equipos institucionales.'
	},
	{
		id:     'OPC-F',
		letra:  'F',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Desinstalación o deshabilitación de software no autorizado o sin licenciamiento',
		descripcion: 'Desinstalación o deshabilitación de aplicaciones no autorizadas (ej. AnyDesk, WinRAR, 7-Zip, TeamViewer, Kaspersky, entre otros), conforme a políticas de seguridad.'
	},
	{
		id:     'OPC-G',
		letra:  'G',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Instalación y actualización de aplicativos institucionales (SAP, OCS, antivirus)',
		descripcion: 'Actualización de versiones de SAP (de 7.70 a 8.00), mantenimiento del agente OCS Inventory e instalación del antivirus corporativo Check Point.'
	},
	{
		id:     'OPC-H',
		letra:  'H',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Formateos, Backups y restauraciones programadas',
		descripcion: 'Ejecución de procesos de formateo, respaldo y restauración de información según programación establecida.'
	},
	{
		id:     'OPC-I',
		letra:  'I',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Reinicio de equipos',
		descripcion: 'Reinicio de equipos intervenidos durante soporte en sitio, con el fin de garantizar estabilidad operativa (especialmente en equipos con alta disponibilidad continua).'
	},
	{
		id:     'OPC-J',
		letra:  'J',
		tipo:   'opcional',
		turnos: null,
		nombre: 'Revisión y estandarización de nombres de equipos',
		descripcion: 'Validación y corrección de nomenclatura de equipos en el Directorio Activo, asegurando consistencia con los registros de inventario y activos tecnológicos.'
	}
];

/* ── INICIALIZACIÓN DEL MÓDULO ─────────────────────────────── */
function initActividades() {
	_renderOpcionales();   /* render de opcionales — siempre visibles en sidebar */
	_renderObligatorias(); /* obligatorias: render inicial con aviso */
}

/* Muestra u oculta el panel de actividades opcionales.
 * En el nuevo diseño de sidebars, las opcionales son siempre visibles
 * (el parámetro visible se ignora — el sidebar está siempre en el DOM).
 * Se conserva la firma para no romper las llamadas existentes.
 */
function _actualizarVisibilidadOpcionales(visible) {
    /* sidebar--opc es siempre visible en pantalla (se oculta solo en @media print) */
    var panel = document.getElementById('panelOpcionales');
    if (!panel) return;
    panel.style.display = ''; /* siempre visible en pantalla */
}

/* ── RENDER TABLA OPCIONALES ───────────────────────────────── */
function _renderOpcionales() {
	var tbody = document.getElementById('bodyOpcionales');
	if (!tbody) return;
	tbody.innerHTML = '';

	ACTIVIDADES
		.filter(function (a) { return a.tipo === 'opcional'; })
		.forEach(function (act) {
			tbody.appendChild(_crearFilaActividad(act, null));
		});
}

/* ── RENDER TABLA OBLIGATORIAS (filtra por turno) ──────────── */
function _renderObligatorias(turno) {
	var tbody   = document.getElementById('bodyObligatorias');
	var aviso   = document.getElementById('actAvisoTurno');
	var tabla   = document.getElementById('tablaObligatorias');
	var badge   = document.getElementById('actTurnoBadge');
	if (!tbody) return;

	tbody.innerHTML = '';

	/* Sin turno seleccionado: mostrar aviso, ocultar tabla */
	if (!turno) {
		if (aviso)  aviso.style.display  = 'flex';
		if (tabla)  tabla.style.display  = 'none';
		if (badge)  badge.textContent    = '— sin turno —';
		/* Opcionales siguen visibles siempre en sidebar */
		return;
	}

	if (aviso) aviso.style.display = 'none';
	if (tabla) tabla.style.display = '';
	if (badge) badge.textContent   = turno;

	var visibles = ACTIVIDADES.filter(function (a) {
		if (a.tipo !== 'obligatoria') return false;
		/* turnos: null → aplica a todos */
		if (!a.turnos) return true;
		return a.turnos.indexOf(turno) !== -1;
	});

	visibles.forEach(function (act) {
		tbody.appendChild(_crearFilaActividad(act, turno));
	});
}

/* ── CREAR FILA DE ACTIVIDAD ────────────────────────────────── */
/**
 * @param {Object}      act    Objeto de actividad del catálogo ACTIVIDADES
 * @param {string|null} turno  Turno activo (para rellenar horas en obligatorias)
 * @returns {HTMLElement}
 */
function _crearFilaActividad(act, turno) {
	var tr = document.createElement('tr');
	tr.className = 'act-fila';
	tr.dataset.actId = act.id;

	/* Tooltip con la descripción al pasar el cursor */
	tr.title = act.descripcion;

	tr.innerHTML =
		'<td class="act-col-letra">' +
			'<span class="act-letra-badge act-letra-badge--' + act.tipo + '">' + act.letra + '</span>' +
		'</td>' +
		'<td class="act-col-nombre">' +
			'<span class="act-nombre">' + act.nombre + '</span>' +
			'<span class="act-desc-preview">' + act.descripcion.substring(0, 90) + (act.descripcion.length > 90 ? '…' : '') + '</span>' +
		'</td>' +
		'<td class="act-col-accion">' +
			'<button class="btn-act-agregar" type="button" ' +
			        'data-act-id="' + act.id + '" ' +
			        'title="Agregar como tarea realizada" ' +
			        'aria-label="Agregar actividad ' + act.nombre + '">' +
				'<svg viewBox="0 0 20 20" fill="none" style="width:13px;height:13px">' +
					'<circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.5"/>' +
					'<line x1="10" y1="6.5" x2="10" y2="13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
					'<line x1="6.5" y1="10" x2="13.5" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
				'</svg>' +
				' Agregar' +
			'</button>' +
		'</td>';

	/* Listener en el botón */
	var btn = tr.querySelector('.btn-act-agregar');
	btn.addEventListener('click', function () {
		_agregarActividadComoTarea(act, turno || document.getElementById('turnoSelect').value);
	});

	/* Listener en el nombre: clic para previsualizar descripción */
	var nombre = tr.querySelector('.act-nombre');
	nombre.addEventListener('click', function () {
		_mostrarDescripcionActividad(act);
	});

	return tr;
}

/* ── AGREGAR ACTIVIDAD COMO TAREA REALIZADA ─────────────────── */
/**
 * Llama a agregarTarea() y luego rellena el ticket y la descripción.
 * Para obligatorias: también rellena los campos de hora con el turno.
 *
 * @param {Object} act    Actividad del catálogo
 * @param {string} turno  Turno activo al momento del clic
 */
function _agregarActividadComoTarea(act, turno) {
	/* 1. Crear la fila de tarea usando la función existente */
	agregarTarea();

	/* 2. Obtener la última fila insertada (no maestra) */
	var contenedor = document.getElementById('listaTareas');
	var filas      = contenedor.querySelectorAll('.tarea-fila:not([data-turno-auto])');
	var ultimaFila = filas[filas.length - 1];
	if (!ultimaFila) return;

	/* 3. Rellenar descripción en el textarea.campo-requerido */
	var textarea = ultimaFila.querySelector('textarea.campo-requerido');
	if (textarea) {
		textarea.value = act.descripcion;
		marcarCampo(textarea); /* actualizar estado visual campo-ok */
	}

	/* 4. El usuario llena manualmente el Ticket/Caso — no se autocompleta */

	/* 5. Para actividades obligatorias: rellenar hora con el turno */
	if (act.tipo === 'obligatoria' && turno) {
		var partes  = _parsearHorasTurno(turno);
		var times   = ultimaFila.querySelectorAll('input[type="time"]');
		if (times[0]) times[0].value = partes.inicio;
		if (times[1]) times[1].value = partes.fin;
	}

	/* 5b. Marcar la fila con el ID de actividad para la validación de obligatorias */
	ultimaFila.setAttribute('data-act-id', act.id);

	/* 6. Scroll suave a la fila recién creada */
	ultimaFila.scrollIntoView({ behavior: 'smooth', block: 'center' });

	/* 7. Feedback visual: pulso en la fila */
	ultimaFila.classList.add('act-fila-nueva');
	setTimeout(function () { ultimaFila.classList.remove('act-fila-nueva'); }, 1200);

	/* 8. Feedback en el botón de la actividad */
	var btn = document.querySelector('[data-act-id="' + act.id + '"] .btn-act-agregar, .btn-act-agregar[data-act-id="' + act.id + '"]');
	_flashBoton(btn);
}

/* ── PREVISUALIZAR DESCRIPCIÓN ──────────────────────────────── */
/**
 * Muestra un tooltip/modal ligero con la descripción completa de la actividad.
 * Usa un elemento <aside> flotante para no modificar el layout.
 */
function _mostrarDescripcionActividad(act) {
	/* Eliminar cualquier preview abierto */
	var existing = document.getElementById('actDescPopup');
	if (existing) { existing.remove(); return; }

	var popup = document.createElement('aside');
	popup.id        = 'actDescPopup';
	popup.className = 'act-desc-popup';
	popup.setAttribute('role', 'tooltip');
	popup.setAttribute('aria-live', 'polite');

	popup.innerHTML =
		'<div class="act-desc-popup-header">' +
			'<strong>' + act.id + ' — ' + act.nombre + '</strong>' +
			'<button class="act-desc-popup-close" type="button" aria-label="Cerrar">&#10005;</button>' +
		'</div>' +
		'<p class="act-desc-popup-body">' + act.descripcion + '</p>' +
		'<div class="act-desc-popup-footer">' +
			'<button class="btn-act-usar" type="button" data-act-id="' + act.id + '">' +
				'<svg viewBox="0 0 20 20" fill="none" style="width:12px;height:12px">' +
					'<path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
				'</svg>' +
				' Usar esta descripción' +
			'</button>' +
		'</div>';

	document.body.appendChild(popup);

	/* Botón cerrar */
	popup.querySelector('.act-desc-popup-close').addEventListener('click', function () {
		popup.remove();
	});

	/* Botón "Usar": agrega la actividad y cierra el popup */
	popup.querySelector('.btn-act-usar').addEventListener('click', function () {
		var turno = document.getElementById('turnoSelect').value;
		_agregarActividadComoTarea(act, turno);
		popup.remove();
	});

	/* Cerrar al hacer clic fuera del popup */
	setTimeout(function () {
		document.addEventListener('click', function _cerrar(e) {
			if (!popup.contains(e.target)) {
				popup.remove();
				document.removeEventListener('click', _cerrar);
			}
		});
	}, 50);
}

/* ── FLASH BOTÓN (feedback visual) ─────────────────────────── */
function _flashBoton(btn) {
	if (!btn) return;
	btn.classList.add('btn-act-agregado');
	setTimeout(function () { btn.classList.remove('btn-act-agregado'); }, 1000);
}

/* ── HELPERS DE CAMPO REQUERIDO ─────────────────────────────── */
function marcarCampo(el) {
	if (!el) return;
	if (el.value.trim()) {
		el.classList.remove('campo-vacio');
		el.classList.add('campo-ok');
	} else {
		el.classList.remove('campo-ok');
	}
}

/* HELPERS DE ERROR */
function mostrarError(el) {
	if (el) {
		el.hidden = false;
		setTimeout(function () { ocultarError(el); }, 4000);
	}
}
function ocultarError(el) {
	if (el) el.hidden = true;
}

/* TAREAS PENDIENTES */
function agregarPendiente() {
	var id         = nextIdPendiente();
	var contenedor = document.getElementById('listaPendientes');
	quitarMsgVacio(contenedor);

	var fila = document.createElement('div');
	fila.className = 'pendiente-fila';
	fila.id        = 'pendiente-' + id;
	fila.setAttribute('role', 'listitem');

	fila.innerHTML =
		'<div class="pendiente-grid">' +
			'<div class="t-cell">' +
				'<input type="text" class="input-ticket"' + ' placeholder="Ej: I-160000 / R-160000"' + ' maxlength="30" autocomplete="off"' + ' aria-label="Número de ticket del pendiente">' +
			'</div>' +
			'<div class="t-cell">' +
				'<textarea placeholder="Descripción del pendiente…"' + ' rows="3" aria-label="Descripción del pendiente (obligatoria)" class="campo-requerido" oninput="marcarCampo(this)"></textarea>' +
			'</div>' +
			'<div class="t-cell">' +
				'<textarea placeholder="¿Por qué queda pendiente? ¿Quién debe atenderlo?"' + ' rows="3" aria-label="Motivo del pendiente"></textarea>' +
			'</div>' +
			'<div class="t-cell">' +
				'<button class="btn-eliminar" type="button"' + ' onclick="eliminarFila(\'pendiente-' + id + '\',\'listaPendientes\',\'pendiente\')"' + ' title="Eliminar este pendiente" aria-label="Eliminar pendiente">' + svgEliminar() + ' Eliminar' + '</button>' +
			'</div>' +
		'</div>' +
		/* Zona de imágenes pendiente */
		'<div class="tarea-fotos-row pend-fotos-row" id="pfotosRow-' + id + '">' +
			'<span class="fotos-indicador" id="pfotosIndicador-' + id + '">' + svgFotoIcono() + '<span> Sin imágenes adjuntas </span>' + '</span>' +
			'<div class="url-imagen-wrap" id="purlWrap-' + id + '">' +
				/* Botón cargar */
				'<label class="btn-cargar-pc" title="Seleccionar imagen desde tu equipo (obligatorio)">' + svgFotoIcono() + ' Agregar imagen(es) <span class="asterisco-obligatorio" aria-hidden="true">*</span>' + 
					'<input type="file" accept="image/*" multiple hidden' + ' onchange="cargarImagenArchivoPend(this,' + id + ')">' +
				'</label>' +	
				'<div class="url-dimensiones" id="pdims-' + id + '" hidden>' +
					'<label class="dims-label"> Anchura </label>' +
					'<input type="number" class="dims-input" id="pdimW-' + id + '"' + ' min="40" max="800" step="1"' + ' aria-label="Anchura del thumbnail"' + ' onchange="redimensionarPend(' + id + ')">' +
					'<svg class="dims-lock-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
						'<rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>' +
						'<path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
					'</svg>' +
					'<label class="dims-label"> Altura </label>' +
					'<input type="number" class="dims-input" id="pdimH-' + id + '"' + ' min="30" max="600" step="1"' + ' aria-label="Altura del thumbnail"' + ' onchange="redimensionarDesdeAlturaPend(' + id + ')">' +
				'</div>' +
				'<div class="url-error" id="purlError-' + id + '" hidden>' + svgAlerta() +
					'<span> No se pudo cargar la imagen. Verifica la URL o el archivo. </span>' +
				'</div>' +
			'</div>' +
			'<div class="previews-grid" id="ppreviews-' + id + '"></div>' +
		'</div>';
	contenedor.appendChild(fila);
}

/* Helpers reutilizables para zona de imágenes de pendientes */
function _crearThumb(url, dataUrl, previews, indicador, dimsEl, dimWEl, dimHEl, errorEl) {
	var img = new Image();
	img.onload = function () {
		ocultarError(errorEl);
		var ratio = img.naturalWidth / img.naturalHeight;
		var w = 600, h = Math.round(600 / ratio);
		var wrap = document.createElement('div');
		wrap.className     = 'preview-thumb';
		wrap.dataset.ratio = ratio;
		wrap.style.width   = w + 'px';
		wrap.style.height  = h + 'px';
		var imgEl = document.createElement('img');
		imgEl.src = dataUrl || url;
		imgEl.alt = 'Imagen adjunta';
		var btnDel = document.createElement('button');
		btnDel.className = 'btn-del-foto';
		btnDel.innerHTML = '&#10005;';
		btnDel.title     = 'Eliminar imagen';
		btnDel.type      = 'button';
		btnDel.setAttribute('aria-label', 'Eliminar imagen');
		btnDel.addEventListener('click', function () {
			wrap.style.transition = 'opacity .2s, transform .2s';
			wrap.style.opacity    = '0';
			wrap.style.transform  = 'scale(.85)';
			setTimeout(function () {
				wrap.remove();
				if (previews.children.length === 0) {
					indicador.style.display = '';
					dimsEl.hidden = true;
				}
			}, 200);
		});
		wrap.appendChild(imgEl);
		wrap.appendChild(btnDel);
		previews.appendChild(wrap);
		indicador.style.display = 'none';
		dimsEl.hidden = false;
		dimWEl.value  = w;
		dimHEl.value  = h;
	};
	img.onerror = function () { mostrarError(errorEl); };
	img.src = dataUrl || url;
}

function cargarImagenArchivoPend(input, id) {
	var errorEl = document.getElementById('purlError-' + id);
	Array.prototype.slice.call(input.files).forEach(function (archivo) {
		if (!archivo.type.startsWith('image/')) { mostrarError(errorEl); return; }
		var reader = new FileReader();
		reader.onload = function (e) {
			_crearThumb(null, e.target.result,
				document.getElementById('ppreviews-' + id),
				document.getElementById('pfotosIndicador-' + id),
				document.getElementById('pdims-' + id),
				document.getElementById('pdimW-' + id),
				document.getElementById('pdimH-' + id),
				errorEl);
		};
		reader.onerror = function () { mostrarError(errorEl); };
		reader.readAsDataURL(archivo);
	});
	input.value = '';
}

function redimensionarPend(id) {
	var dimWEl     = document.getElementById('pdimW-' + id);
	var dimHEl     = document.getElementById('pdimH-' + id);
	var previews   = document.getElementById('ppreviews-' + id);
	var nuevoAncho = parseInt(dimWEl.value, 10);
	if (isNaN(nuevoAncho) || nuevoAncho < 40) return;
	var nuevoAlto = nuevoAncho;
	previews.querySelectorAll('.preview-thumb').forEach(function (wrap) {
		var ratio = parseFloat(wrap.dataset.ratio) || 1;
		nuevoAlto = Math.round(nuevoAncho / ratio);
		wrap.style.width  = nuevoAncho + 'px';
		wrap.style.height = nuevoAlto  + 'px';
	});
	dimHEl.value = nuevoAlto;
}

function redimensionarDesdeAlturaPend(id) {
	var dimWEl    = document.getElementById('pdimW-' + id);
	var dimHEl    = document.getElementById('pdimH-' + id);
	var previews  = document.getElementById('ppreviews-' + id);
	var nuevoAlto = parseInt(dimHEl.value, 10);
	if (isNaN(nuevoAlto) || nuevoAlto < 30) return;
	var nuevoAncho = nuevoAlto;
	previews.querySelectorAll('.preview-thumb').forEach(function (wrap) {
		var ratio = parseFloat(wrap.dataset.ratio) || 1;
		nuevoAncho = Math.round(nuevoAlto * ratio);
		wrap.style.width  = nuevoAncho + 'px';
		wrap.style.height = nuevoAlto  + 'px';
	});
	dimWEl.value = nuevoAncho;
}

/* ELIMINAR FILA */
function eliminarFila(filaId, contenedorId, tipo) {
	var fila = document.getElementById(filaId);
	if (!fila) return;

	fila.style.transition = 'opacity .2s ease, transform .2s ease';
	fila.style.overflow   = 'hidden';
	fila.style.opacity    = '0';
	fila.style.transform  = 'translateX(8px)';

	setTimeout(function () {
		fila.remove();
		var cont  = document.getElementById(contenedorId);
		var filas = cont.querySelectorAll('.tarea-fila, .pendiente-fila');
		if (filas.length === 0) mostrarMsgVacio(contenedorId, tipo);
	}, 220);
}

/* LIMPIAR FORMULARIO */
function limpiarFormulario() {
	if (!confirm('¿Desea limpiar todo el formulario?\nEsta acción no se puede deshacer.')) return;

	document.getElementById('ciudadInput').value = 'Medellín';
	initFecha();

	var select = document.getElementById('turnoSelect');
	var pill   = document.getElementById('turnoPill');
	if (select) { select.selectedIndex = 0; }
	if (pill)   { pill.textContent = 'Selecciona un Turno'; }

	/* Resetear selects de analistas */
	['entranteNombre', 'salienteNombre'].forEach(function (selId) {
		var sel = document.getElementById(selId);
		if (sel) sel.selectedIndex = 0;
	});
	['estranteDNI', 'salienteDNI'].forEach(function (inpId) {
		var el = document.getElementById(inpId);
		if (el) el.value = '';
	});

	document.getElementById('listaTareas').innerHTML     = '';
	document.getElementById('listaPendientes').innerHTML = '';
	_idTarea     = 0;
	_idPendiente = 0;

	mostrarMsgVacio('listaTareas',    'tarea');
	mostrarMsgVacio('listaPendientes', 'pendiente');

	/* Panel de obligatorias: reset sin turno */
	_renderObligatorias();
}

/* ── VALIDACIÓN DE IMPRESIÓN ── */
/**
 * Verifica todos los campos obligatorios antes de imprimir.
 * Bloquea si la tarea maestra R-000000 no está presente.
 * @returns {boolean}  true = todo OK, false = hay errores
 */
function validarParaImprimir() {
	var errores = [];
	var turnoActual = (document.getElementById('turnoSelect') || {}).value || '';

	/* 1. Turno principal seleccionado */
	if (!turnoActual) {
		errores.push('• Selecciona un Turno principal antes de imprimir.');
	}

	/* 2. Tarea Maestra R-000000 obligatoria — se genera al seleccionar turno */
	var tареaMaestraExiste = document.getElementById(ID_TAREA_MAESTRA);
	if (!tареaMaestraExiste) {
		errores.push('• La tarea "Entrega de turno" (R-000000) es obligatoria y debe generarse seleccionando un turno.');
	}

	/* 3. Tarea de inicio de turno R-000001 obligatoria */
	var tareaInicioExiste = document.getElementById(ID_TAREA_TURNO);
	if (!tareaInicioExiste) {
		errores.push('• La tarea de inicio de turno (R-000001) es obligatoria. Selecciona un turno para generarla.');
	}

	/* 4. Actividades obligatorias B-E requeridas para turno nocturno */
	if (turnoActual === '10:00 pm - 6:00 am') {
		var obligsNocturnas = ['OBL-B', 'OBL-C', 'OBL-D', 'OBL-E'];
		var tareasTitulos   = {
			'OBL-B': 'Monitoreo Netux',
			'OBL-C': 'Verificación temperatura Data Center',
			'OBL-D': 'Verificación Digiturno',
			'OBL-E': 'Verificación monitores / Avaya / Álear'
		};
		obligsNocturnas.forEach(function (actId) {
			var encontrada = document.querySelector(
				'#listaTareas .tarea-fila[data-act-id="' + actId + '"]'
			);
			if (!encontrada) {
				errores.push('• Actividad obligatoria nocturna pendiente: ' + tareasTitulos[actId] + ' (' + actId + ').');
			}
		});
	}

	/* 5. Empleado Entrante */
	var entranteNombre = document.getElementById('entranteNombre');
	if (!entranteNombre || !entranteNombre.value) {
		errores.push('• Selecciona el Empleado Entrante en la sección de Responsables.');
		if (entranteNombre) entranteNombre.classList.add('campo-error');
	} else {
		entranteNombre.classList.remove('campo-error');
	}

	/* 6. Empleado Saliente */
	var salienteNombre = document.getElementById('salienteNombre');
	if (!salienteNombre || !salienteNombre.value) {
		errores.push('• Selecciona el Empleado Saliente en la sección de Responsables.');
		if (salienteNombre) salienteNombre.classList.add('campo-error');
	} else {
		salienteNombre.classList.remove('campo-error');
	}

	/* 7. Tickets obligatorios en tareas realizadas (excluye las tareas fijas) */
	var filasTareas = document.querySelectorAll('#listaTareas .tarea-fila:not([data-turno-auto])');
	filasTareas.forEach(function (fila, idx) {
		var ticket = fila.querySelector('.input-ticket');
		if (!ticket || !ticket.value.trim()) {
			errores.push('• Tarea ' + (idx + 1) + ': el campo Ticket / Caso es obligatorio.');
			if (ticket) ticket.classList.add('campo-error');
		} else if (ticket) {
			ticket.classList.remove('campo-error');
		}
	});

	/* 8. Descripción obligatoria en tareas realizadas */
	filasTareas.forEach(function (fila, idx) {
		var desc = fila.querySelector('textarea.campo-requerido');
		if (!desc || !desc.value.trim()) {
			errores.push('• Tarea ' + (idx + 1) + ': el campo Descripción es obligatorio.');
			if (desc) desc.classList.add('campo-error');
		} else if (desc) {
			desc.classList.remove('campo-error');
		}
	});

	/* 9. Imágenes obligatorias en tareas realizadas */
	filasTareas.forEach(function (fila, idx) {
		var previews = fila.querySelector('.previews-grid');
		var fotosRow = fila.querySelector('.tarea-fotos-row');
		if (previews && previews.children.length === 0) {
			errores.push('• Tarea ' + (idx + 1) + ': debes adjuntar al menos una imagen.');
			if (fotosRow) fotosRow.classList.add('campo-error');
		} else if (fotosRow) {
			fotosRow.classList.remove('campo-error');
		}
	});

	/* 10. Tickets obligatorios en pendientes */
	var filasPend = document.querySelectorAll('#listaPendientes .pendiente-fila');
	filasPend.forEach(function (fila, idx) {
		var ticket = fila.querySelector('.input-ticket');
		if (!ticket || !ticket.value.trim()) {
			errores.push('• Pendiente ' + (idx + 1) + ': el campo Ticket / Caso es obligatorio.');
			if (ticket) ticket.classList.add('campo-error');
		} else if (ticket) {
			ticket.classList.remove('campo-error');
		}
	});

	/* 11. Imágenes obligatorias en pendientes */
	filasPend.forEach(function (fila, idx) {
		var previews = fila.querySelector('.previews-grid');
		var fotosRow = fila.querySelector('.tarea-fotos-row');
		if (previews && previews.children.length === 0) {
			errores.push('• Pendiente ' + (idx + 1) + ': debes adjuntar al menos una imagen.');
			if (fotosRow) fotosRow.classList.add('campo-error');
		} else if (fotosRow) {
			fotosRow.classList.remove('campo-error');
		}
	});

	if (errores.length > 0) {
		alert('No se puede imprimir. Completa los siguientes campos obligatorios:\n\n' + errores.join('\n'));
		return false;
	}
	return true;
}

/* IMPRIMIR */
function imprimirDocumento() {
	if (!validarParaImprimir()) return;
	window.print();
}

/* FOOTER DINÁMICO */
function initFooter() {
	var el = document.getElementById('footerFecha');
	if (!el) return;
	var ahora = new Date();
	el.textContent = 'Generado el ' + ahora.toLocaleDateString('es-CO', {
		year: 'numeric', month: 'long', day: 'numeric',
		hour: '2-digit', minute: '2-digit'
	});
}

/*  BOTONES  */
function initBotones() {
	document.getElementById('btnAgregarTarea')
		.addEventListener('click', agregarTarea);
	document.getElementById('btnAgregarPendiente')
		.addEventListener('click', agregarPendiente);
	document.getElementById('btnPrint')
		.addEventListener('click', imprimirDocumento);
	document.getElementById('btnClear')
		.addEventListener('click', limpiarFormulario);
}

/* ── SELECT DINÁMICO DE ANALISTAS ── */
/**
 * Inicializa los <select> de Empleado Entrante y Saliente.
 * Al seleccionar un nombre, rellena automáticamente la cédula correspondiente.
 */
function initSelectAnalistas() {
	_bindAnalista('entranteNombre', 'estranteDNI');
	_bindAnalista('salienteNombre', 'salienteDNI');
}

/**
 * Conecta un <select> de nombre con su <input> de cédula.
 * @param {string} selectId  ID del <select> de nombre
 * @param {string} cedulaId  ID del <input> de cédula
 */
function _bindAnalista(selectId, cedulaId) {
	var sel    = document.getElementById(selectId);
	var cedula = document.getElementById(cedulaId);
	if (!sel || !cedula) return;

	sel.addEventListener('change', function () {
		var analista = ANALISTAS.find(function (a) { return a.nombre === sel.value; });
		cedula.value = analista ? analista.cedula : '';
		sel.classList.remove('campo-error');
	});
}

/* MENSAJES VACÍOS */
function mostrarMsgVacio(contenedorId, tipo) {
	var cont = document.getElementById(contenedorId);
	if (!cont || cont.querySelector('.msg-vacio')) return;
	var textos = {
		tarea:     'No hay tareas registradas. Use \u201c+ Agregar Tarea\u201d para comenzar.',
		pendiente: 'No hay pendientes. Use \u201c+ Agregar Pendiente\u201d si existe alguno.'
	};
	var p = document.createElement('p');
	p.className   = 'msg-vacio';
	p.textContent = textos[tipo] || '';
	cont.appendChild(p);
}

function quitarMsgVacio(contenedor) {
	var mv = contenedor.querySelector('.msg-vacio');
	if (mv) mv.remove();
}

/* SVGs */
function svgEliminar() {
	return '<svg viewBox="0 0 20 20" fill="none" style="width:12px;height:12px;flex-shrink:0">' +
				'<polyline points="3,5 4.5,5 17,5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
				'<path d="M17 5l-1 12H4L3 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
				'<path d="M8 9v5M12 9v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
				'<path d="M8 5V3h4v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
			'</svg>';
}

function svgFotoIcono() {
	return '<svg viewBox="0 0 20 20" fill="none" style="width:12px;height:12px;flex-shrink:0;color:#2563c4">' +
				'<rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" stroke-width="1.4"/>' +
				'<circle cx="10" cy="10.5" r="2.5" stroke="currentColor" stroke-width="1.4"/>' +
				'<path d="M7 4l1.2-2h3.6L13 4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
			'</svg>';
}

/* Ícono de alerta para el mensaje de error */
function svgAlerta() {
	return '<svg viewBox="0 0 20 20" fill="none" style="width:13px;height:13px;flex-shrink:0">' +
				'<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>' +
				'<line x1="10" y1="6.5" x2="10" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
				'<circle cx="10" cy="13.5" r="1" fill="currentColor"/>' +
			'</svg>';
}