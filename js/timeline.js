/* Alerta Verde — Componente: timeline de seguimiento de un reporte.
   Renderiza las 4 etapas (AV.data.STAGES) dentro de un <ol>, marcando
   completadas, la actual y las pendientes con forma + texto (no solo
   color), para que sea legible con lectores de pantalla. */
window.AV = window.AV || {};
AV.render = AV.render || {};

AV.render.timeline = function (container, report) {
  if (!container || !report) return;
  container.innerHTML = "";

  var alcanzadas = {};
  (report.historial || []).forEach(function (h) { alcanzadas[h.estado] = h.fecha; });

  var indiceActual = -1;
  AV.data.STAGES.forEach(function (stage, i) {
    if (alcanzadas[stage.id]) indiceActual = i;
  });

  AV.data.STAGES.forEach(function (stage, i) {
    var li = document.createElement("li");
    var claseEstado, icono, textoEstado;

    if (i < indiceActual) {
      claseEstado = "is-complete"; icono = "✓"; textoEstado = "completado";
    } else if (i === indiceActual) {
      claseEstado = "is-current"; icono = "●"; textoEstado = "estado actual";
      li.setAttribute("aria-current", "step");
    } else {
      claseEstado = "is-pending"; icono = "○"; textoEstado = "pendiente";
    }
    li.className = "timeline-step " + claseEstado;

    var indicador = document.createElement("span");
    indicador.className = "timeline-indicator";
    indicador.setAttribute("aria-hidden", "true");
    indicador.textContent = icono;

    var contenido = document.createElement("div");
    contenido.className = "timeline-content";

    var nombre = document.createElement("p");
    nombre.className = "timeline-name";
    nombre.textContent = stage.label + " — " + textoEstado;

    var fecha = document.createElement("p");
    fecha.className = "timeline-date";
    fecha.textContent = alcanzadas[stage.id] ? AV.formatFecha(alcanzadas[stage.id]) : "Pendiente";

    var descripcion = document.createElement("p");
    descripcion.className = "timeline-desc";
    descripcion.textContent = stage.description;

    contenido.appendChild(nombre);
    contenido.appendChild(fecha);
    contenido.appendChild(descripcion);
    li.appendChild(indicador);
    li.appendChild(contenido);
    container.appendChild(li);
  });
};