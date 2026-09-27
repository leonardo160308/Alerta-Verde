/* Alerta Verde — Controlador de la página "Mapa de reportes" (Fase 4).
   Mapa real con Mapbox GL JS: las coordenadas lat/lng de AV.reports se
   proyectan sobre un mapa interactivo de verdad (calles, zoom, pan).
   Cada marcador sigue siendo un <button> real superpuesto al mapa (no
   un mapboxgl.Marker de fábrica), así que el mapa se mantiene
   utilizable con teclado; además existe una lista equivalente
   totalmente accesible como alternativa al mapa. Si Mapbox no está
   disponible (sin conexión, script bloqueado, etc.) se usa una
   proyección porcentual de respaldo para que la página no se rompa. */
window.AV = window.AV || {};

(function () {
  var elMarkers, elCards, elEmpty, elCount, elMapaMapbox;
  var elFiltroEstado, elFiltroCategoria, elFiltroBusqueda, elFiltroReset;
  var elDetalle, elDetalleHeading, elDetalleInfo, elDetalleTimeline, elDetalleCerrar;
  var lastFocusedTrigger = null;

  var mapboxMap = null;
  var mapReady = false;
  var encuadreInicialHecho = false;

  var ESTADO_META = {
    "enviado": { label: "Enviado", icon: "➤", clase: "enviado" },
    "verificado": { label: "Verificado", icon: "✓", clase: "verificado" },
    "en-atencion": { label: "En Atención", icon: "◐", clase: "en-atencion" },
    "resuelto": { label: "Resuelto", icon: "✔", clase: "resuelto" }
  };

  function $(id) { return document.getElementById(id); }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function badgeHTML(estado) {
    var meta = ESTADO_META[estado] || { label: estado, icon: "•", clase: "" };
    return '<span class="badge badge--' + meta.clase + '"><span aria-hidden="true">' + meta.icon + "</span> " + meta.label + "</span>";
  }

  /* --- Inicialización del mapa real (Mapbox GL JS) -------------------- */

  function initMapaBase() {
    elMapaMapbox = $("mapa-mapbox");
    if (!elMapaMapbox) { mapboxMap = null; return; }
    if (typeof mapboxgl === "undefined") {
      mapboxMap = null;
      console.warn("Alerta Verde: no se cargó la librería de Mapbox (mapbox-gl.js) — revisa la pestaña Red del navegador. Se usa la proyección de respaldo mientras tanto.");
      return;
    }
    try {
      mapboxgl.accessToken = AV.config.MAPBOX_TOKEN;
      mapboxMap = new mapboxgl.Map({
        container: "mapa-mapbox",
        style: AV.config.MAPBOX_STYLE,
        center: AV.config.MAPA_CENTER,
        zoom: AV.config.MAPA_ZOOM,
        cooperativeGestures: false
      });

      mapboxMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      mapboxMap.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: true
      }), "top-right");

      mapboxMap.on("load", function () {
        mapReady = true;
        ajustarEncuadreInicial();
        render();
      });
      mapboxMap.on("move", reposicionarMarcadoresEnPantalla);
      mapboxMap.on("resize", reposicionarMarcadoresEnPantalla);
      mapboxMap.on("error", function (e) {
        /* Un error de estilo/red no debe tumbar el resto de la página;
           el mapa seguirá mostrando lo último que haya cargado y los
           marcadores caen de vuelta a la proyección porcentual. El
           motivo (token restringido a otro dominio, bloqueador de
           contenido, etc.) queda en consola para diagnosticarlo. */
        console.warn("Alerta Verde: error del mapa de Mapbox —", (e && e.error) || e);
      });
    } catch (e) {
      mapboxMap = null;
      mapReady = false;
      console.warn("Alerta Verde: no se pudo inicializar Mapbox —", e);
    }
  }

  function ajustarEncuadreInicial() {
    if (encuadreInicialHecho || !mapboxMap) return;
    var todos = AV.reports.getAll();
    if (!todos.length) return;
    var bounds = new mapboxgl.LngLatBounds();
    todos.forEach(function (r) { bounds.extend([r.lng, r.lat]); });
    mapboxMap.fitBounds(bounds, { padding: 48, maxZoom: 13, duration: 0 });
    encuadreInicialHecho = true;
  }

  /* Traduce lat/lng a un punto en píxeles dentro de #mapa-mapbox
     (misma caja que #mapa-markers, así que el resultado sirve
     directamente como left/top del botón-marcador). */
  function proyectarConMapbox(r) {
    var punto = mapboxMap.project([r.lng, r.lat]);
    return { x: punto.x, y: punto.y, unidad: "px" };
  }

  /* Respaldo sin Mapbox: proyecta lat/lng a un porcentaje dentro del
     contenedor, estirando al rango de todos los reportes conocidos. */
  function crearProyeccionRespaldo(reportes) {
    var lats = reportes.map(function (r) { return r.lat; });
    var lngs = reportes.map(function (r) { return r.lng; });
    var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
    var minLng = Math.min.apply(null, lngs), maxLng = Math.max.apply(null, lngs);
    var padLat = (maxLat - minLat) * 0.15 || 0.02;
    var padLng = (maxLng - minLng) * 0.15 || 0.02;
    minLat -= padLat; maxLat += padLat; minLng -= padLng; maxLng += padLng;
    var rangoLat = (maxLat - minLat) || 1;
    var rangoLng = (maxLng - minLng) || 1;

    return function (r) {
      var x = ((r.lng - minLng) / rangoLng) * 100;
      var y = 100 - ((r.lat - minLat) / rangoLat) * 100;
      return { x: clamp(x, 8, 92), y: clamp(y, 8, 92), unidad: "%" };
    };
  }

  /* Reubica los marcadores ya existentes cuando el usuario mueve o hace
     zoom al mapa, sin tener que reconstruir los botones (más fluido). */
  function reposicionarMarcadoresEnPantalla() {
    if (!mapboxMap || !mapReady || !elMarkers) return;
    var botones = elMarkers.querySelectorAll(".mapa-marker[data-lat]");
    for (var i = 0; i < botones.length; i++) {
      var btn = botones[i];
      var lat = parseFloat(btn.getAttribute("data-lat"));
      var lng = parseFloat(btn.getAttribute("data-lng"));
      if (isNaN(lat) || isNaN(lng)) continue;
      var punto = mapboxMap.project([lng, lat]);
      btn.style.left = punto.x + "px";
      btn.style.top = punto.y + "px";
    }
  }

  function currentFilters() {
    return {
      estado: elFiltroEstado.value,
      categoria: elFiltroCategoria.value,
      query: elFiltroBusqueda.value
    };
  }

  function poblarSelectCategorias() {
    AV.data.categories.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.label;
      elFiltroCategoria.appendChild(opt);
    });
  }

  function render() {
    var reportes = AV.reports.filter(currentFilters());
    renderConteo(reportes.length);
    renderMarcadores(reportes);
    renderTarjetas(reportes);
  }

  function renderConteo(n) {
    elCount.textContent = n === 1 ? "1 reporte encontrado." : n + " reportes encontrados.";
    elEmpty.hidden = n !== 0;
  }

  function renderMarcadores(reportesFiltrados) {
    elMarkers.innerHTML = "";
    var todos = AV.reports.getAll();
    var base = todos.length ? todos : reportesFiltrados;
    if (!base.length) return;

    var usarMapbox = !!(mapboxMap && mapReady);
    var proyectarRespaldo = usarMapbox ? null : crearProyeccionRespaldo(base);

    reportesFiltrados.forEach(function (r) {
      var pos = usarMapbox ? proyectarConMapbox(r) : proyectarRespaldo(r);
      var meta = ESTADO_META[r.estado] || {};
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mapa-marker mapa-marker--" + (meta.clase || "");
      btn.style.left = pos.x + pos.unidad;
      btn.style.top = pos.y + pos.unidad;
      btn.setAttribute("data-report-id", r.id);
      btn.setAttribute("data-lat", r.lat);
      btn.setAttribute("data-lng", r.lng);
      btn.setAttribute("aria-label",
        "Reporte " + r.id + ", " + AV.data.getCategoryLabel(r.categoria) + ", " + r.direccion +
        ". Estado: " + (meta.label || r.estado) + ". Ver detalle.");
      btn.innerHTML = '<span aria-hidden="true">' + (meta.icon || "•") + "</span>";
      btn.addEventListener("click", function () { seleccionarReporte(r.id, btn); });
      elMarkers.appendChild(btn);
    });
  }

  function renderTarjetas(reportes) {
    elCards.innerHTML = "";
    reportes.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "reporte-card";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reporte-card__button";
      btn.setAttribute("data-report-id", r.id);
      btn.innerHTML =
        '<span class="reporte-card__folio">' + r.id + "</span>" +
        badgeHTML(r.estado) +
        "<h3>" + AV.data.getCategoryLabel(r.categoria) + "</h3>" +
        '<p class="reporte-card__fecha">' + AV.formatFecha(r.fecha) + "</p>" +
        '<p class="reporte-card__desc">' + r.descripcion + "</p>" +
        '<span class="reporte-card__cta" aria-hidden="true">Ver seguimiento →</span>';
      btn.addEventListener("click", function () { seleccionarReporte(r.id, btn); });

      /* La dirección va como enlace independiente (no dentro del
         botón: un <a> no puede anidarse dentro de un <button> sin
         romper la accesibilidad) que abre la ubicación en Google
         Maps en una pestaña nueva. */
      var enlaceMapa = document.createElement("a");
      enlaceMapa.className = "reporte-card__ubicacion";
      enlaceMapa.href = AV.mapsUrl(r.lat, r.lng);
      enlaceMapa.target = "_blank";
      enlaceMapa.rel = "noopener noreferrer";
      enlaceMapa.innerHTML = "📍 " + r.direccion +
        (r.ubicacionAproximada ? ' <span class="reporte-card__aprox">(ubicación aproximada)</span>' : "") +
        ' <span class="visually-hidden">— abre en Google Maps, en una pestaña nueva</span>';

      li.appendChild(btn);
      li.appendChild(enlaceMapa);
      elCards.appendChild(li);
    });
  }

  function seleccionarReporte(id, triggerEl) {
    var report = AV.reports.getById(id);
    if (!report) return;
    lastFocusedTrigger = triggerEl || lastFocusedTrigger;

    document.querySelectorAll(".mapa-marker.is-selected, .reporte-card__button.is-selected").forEach(function (el) {
      el.classList.remove("is-selected");
    });
    document.querySelectorAll('[data-report-id="' + id + '"]').forEach(function (el) {
      el.classList.add("is-selected");
    });

    elDetalleInfo.innerHTML =
      "<dl>" +
      "<dt>Folio</dt><dd>" + report.id + "</dd>" +
      "<dt>Categoría</dt><dd>" + AV.data.getCategoryLabel(report.categoria) + "</dd>" +
      "<dt>Ubicación</dt><dd><a href=\"" + AV.mapsUrl(report.lat, report.lng) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" +
        report.direccion + "</a> <span class=\"visually-hidden\">— abre en Google Maps, en una pestaña nueva</span>" +
        (report.ubicacionAproximada ? " (ubicación aproximada)" : "") + "</dd>" +
      "<dt>Fecha de reporte</dt><dd>" + AV.formatFecha(report.fecha) + "</dd>" +
      "<dt>Estado actual</dt><dd>" + badgeHTML(report.estado) + "</dd>" +
      "<dt>Descripción</dt><dd>" + report.descripcion + "</dd>" +
      "</dl>";

    AV.render.timeline(elDetalleTimeline, report);

    elDetalle.hidden = false;
    elDetalleHeading.textContent = "Detalle del reporte " + report.id;
    elDetalle.focus();
    AV.scrollIntoViewSafe(elDetalle);

    if (mapboxMap && mapReady) {
      mapboxMap.flyTo({ center: [report.lng, report.lat], zoom: Math.max(mapboxMap.getZoom(), 14), duration: 600 });
    }
  }

  function cerrarDetalle() {
    elDetalle.hidden = true;
    if (lastFocusedTrigger && document.body.contains(lastFocusedTrigger)) {
      lastFocusedTrigger.focus();
    } else {
      elFiltroEstado.focus();
    }
  }

  function limpiarFiltros() {
    elFiltroEstado.value = "todos";
    elFiltroCategoria.value = "todas";
    elFiltroBusqueda.value = "";
    render();
    elFiltroEstado.focus();
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  function init() {
    elMarkers = $("mapa-markers");
    elCards = $("reportes-cards");
    elEmpty = $("reportes-empty");
    elCount = $("filtro-resultado-count");
    elFiltroEstado = $("filtro-estado");
    elFiltroCategoria = $("filtro-categoria");
    elFiltroBusqueda = $("filtro-busqueda");
    elFiltroReset = $("filtro-reset");
    elDetalle = $("detalle-panel");
    elDetalleHeading = $("detalle-heading");
    elDetalleInfo = $("detalle-info");
    elDetalleTimeline = $("detalle-timeline");
    elDetalleCerrar = $("detalle-cerrar");

    if (!elMarkers || !elCards) return;

    poblarSelectCategorias();
    initMapaBase();

    elFiltroEstado.addEventListener("change", render);
    elFiltroCategoria.addEventListener("change", render);
    elFiltroBusqueda.addEventListener("input", debounce(render, 150));
    elFiltroReset.addEventListener("click", limpiarFiltros);
    elDetalleCerrar.addEventListener("click", cerrarDetalle);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !elDetalle.hidden) cerrarDetalle();
    });

    render();

    var params = new URLSearchParams(window.location.search);
    var folio = params.get("folio");
    if (folio && AV.reports.getById(folio)) {
      seleccionarReporte(folio, null);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();