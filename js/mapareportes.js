/* Alerta Verde — Controlador de la página "Mapa de reportes" (Fase 4).
   Mapa simulado (sin librerías externas ni API keys): las coordenadas
   lat/lng de AV.reports se proyectan a posiciones porcentuales dentro
   de un contenedor. Cada marcador es un <button> real, así que el
   mapa es utilizable con teclado; además existe una lista equivalente
   totalmente accesible como alternativa al mapa. */
window.AV = window.AV || {};

(function () {
  var elMarkers, elCards, elEmpty, elCount;
  var elFiltroEstado, elFiltroCategoria, elFiltroBusqueda, elFiltroReset;
  var elDetalle, elDetalleHeading, elDetalleInfo, elDetalleTimeline, elDetalleCerrar;
  var lastFocusedTrigger = null;

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

  /* Devuelve una función que convierte lat/lng en un punto {x, y}
     porcentual dentro del contenedor del mapa, con un margen para
     que ningún marcador quede pegado al borde. */
  function crearProyeccion(reportes) {
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
      return { x: clamp(x, 8, 92), y: clamp(y, 8, 92) };
    };
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
    var proyectar = crearProyeccion(base);

    reportesFiltrados.forEach(function (r) {
      var pos = proyectar(r);
      var meta = ESTADO_META[r.estado] || {};
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mapa-marker mapa-marker--" + (meta.clase || "");
      btn.style.left = pos.x + "%";
      btn.style.top = pos.y + "%";
      btn.setAttribute("data-report-id", r.id);
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
        '<p class="reporte-card__ubicacion">' + r.direccion +
          (r.ubicacionAproximada ? ' <span class="reporte-card__aprox">(ubicación aproximada)</span>' : "") + "</p>" +
        '<p class="reporte-card__fecha">' + AV.formatFecha(r.fecha) + "</p>" +
        '<p class="reporte-card__desc">' + r.descripcion + "</p>" +
        '<span class="reporte-card__cta" aria-hidden="true">Ver seguimiento →</span>';
      btn.addEventListener("click", function () { seleccionarReporte(r.id, btn); });

      li.appendChild(btn);
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
      "<dt>Ubicación</dt><dd>" + report.direccion + (report.ubicacionAproximada ? " (ubicación aproximada)" : "") + "</dd>" +
      "<dt>Fecha de reporte</dt><dd>" + AV.formatFecha(report.fecha) + "</dd>" +
      "<dt>Estado actual</dt><dd>" + badgeHTML(report.estado) + "</dd>" +
      "<dt>Descripción</dt><dd>" + report.descripcion + "</dd>" +
      "</dl>";

    AV.render.timeline(elDetalleTimeline, report);

    elDetalle.hidden = false;
    elDetalleHeading.textContent = "Detalle del reporte " + report.id;
    elDetalle.focus();
    AV.scrollIntoViewSafe(elDetalle);
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