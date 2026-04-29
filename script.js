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
	var id = nextIdPendiente();
	var contenedor = document.getElementById('listaPendientes');
	quitarMsgVacio(contenedor);

	var fila = document.createElement('div');
	fila.className = 'pendiente-fila';
	fila.id = 'pendiente-' + id;
	fila.setAttribute('role', 'listitem');

	fila.innerHTML =
		'<div class="pendiente-grid">' +
			'<div class="t-cell">' +
				'<input type="text" class="input-ticket"' + ' placeholder="Ej: I-160000 / R-160000"' + ' maxlength="30" autocomplete="off"' + ' aria-label="Número de ticket del pendiente">' +
			'</div>' +
			'<div class="t-cell">' +
				'<textarea placeholder="Descripción del pendiente…"' + ' rows="3" aria-label="Descripción del pendiente"></textarea>' +
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
				'<label class="btn-cargar-pc" title="Seleccionar imagen desde tu equipo">' + svgFotoIcono() + ' Agregar imagen(es)' + 
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
		wrap.className = 'preview-thumb';
		wrap.dataset.ratio = ratio;
		wrap.style.width = w + 'px';
		wrap.style.height = h + 'px';
		var imgEl = document.createElement('img');
		imgEl.src = dataUrl || url;
		imgEl.alt = 'Imagen adjunta';
		var btnDel = document.createElement('button');
		btnDel.className = 'btn-del-foto';
		btnDel.innerHTML = '&#10005;';
		btnDel.title = 'Eliminar imagen';
		btnDel.type = 'button';
		btnDel.setAttribute('aria-label', 'Eliminar imagen');
		btnDel.addEventListener('click', function () {
			wrap.style.transition = 'opacity .2s, transform .2s';
			wrap.style.opacity = '0';
			wrap.style.transform = 'scale(.85)';
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
		dimWEl.value = w;
		dimHEl.value = h;
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
	var dimWEl = document.getElementById('pdimW-' + id);
	var dimHEl = document.getElementById('pdimH-' + id);
	var previews = document.getElementById('ppreviews-' + id);
	var nuevoAncho = parseInt(dimWEl.value, 10);
	if (isNaN(nuevoAncho) || nuevoAncho < 40) return;
	var nuevoAlto = nuevoAncho;
	previews.querySelectorAll('.preview-thumb').forEach(function (wrap) {
		var ratio = parseFloat(wrap.dataset.ratio) || 1;
		nuevoAlto = Math.round(nuevoAncho / ratio);
		wrap.style.width = nuevoAncho + 'px';
		wrap.style.height = nuevoAlto + 'px';
	});
	dimHEl.value = nuevoAlto;
}

function redimensionarDesdeAlturaPend(id) {
	var dimWEl = document.getElementById('pdimW-' + id);
	var dimHEl = document.getElementById('pdimH-' + id);
	var previews = document.getElementById('ppreviews-' + id);
	var nuevoAlto = parseInt(dimHEl.value, 10);
	if (isNaN(nuevoAlto) || nuevoAlto < 30) return;
	var nuevoAncho = nuevoAlto;
	previews.querySelectorAll('.preview-thumb').forEach(function (wrap) {
		var ratio = parseFloat(wrap.dataset.ratio) || 1;
		nuevoAncho = Math.round(nuevoAlto * ratio);
		wrap.style.width = nuevoAncho + 'px';
		wrap.style.height = nuevoAlto + 'px';
	});
	dimWEl.value = nuevoAncho;
}

/* ELIMINAR FILA */
function eliminarFila(filaId, contenedorId, tipo) {
	var fila = document.getElementById(filaId);
	if (!fila) return;

	fila.style.transition = 'opacity .2s ease, transform .2s ease';
	fila.style.overflow = 'hidden';
	fila.style.opacity = '0';
	fila.style.transform = 'translateX(8px)';

	setTimeout(function () {
		fila.remove();
		var cont = document.getElementById(contenedorId);
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
	var pill = document.getElementById('turnoPill');
	if (select) { select.selectedIndex = 0; }
	if (pill && select) { pill.textContent = select.options[0].value; }

	['salienteNombre', 'salienteDNI', 'entranteNombre', 'estranteDNI'].forEach(function (id) {
		var el = document.getElementById(id);
		if (el) el.value = '';
	});

	document.getElementById('listaTareas').innerHTML = '';
	document.getElementById('listaPendientes').innerHTML = '';
	_idTarea = 0;
	_idPendiente = 0;

	mostrarMsgVacio('listaTareas', 'tarea');
	mostrarMsgVacio('listaPendientes', 'pendiente');
}

/* IMPRIMIR */
function imprimirDocumento() { window.print(); }

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

/* MENSAJES VACÍOS */
function mostrarMsgVacio(contenedorId, tipo) {
	var cont = document.getElementById(contenedorId);
	if (!cont || cont.querySelector('.msg-vacio')) return;
	var textos = {
		tarea: 'No hay tareas registradas. Use \u201c+ Agregar Tarea\u201d para comenzar.',
		pendiente: 'No hay pendientes. Use \u201c+ Agregar Pendiente\u201d si existe alguno.'
	};
	var p = document.createElement('p');
	p.className = 'msg-vacio';
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