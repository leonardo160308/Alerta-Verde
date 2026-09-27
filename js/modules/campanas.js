/* Alerta Verde — Controlador de la página "Campañas" (Fase 4).
   La participación es una simulación de frontend: no se envía nada a
   un servidor, solo se guarda un indicador local por campaña en
   localStorage para que el estado persista al recargar la página. */
window.AV = window.AV || {};

(function () {
  var STORAGE_KEY = "av_campanas_participacion";
  var participacion = leerParticipacion();

  function leerParticipacion() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function guardarParticipacion() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(participacion));
    } catch (e) {
      /* Sin almacenamiento disponible: el estado sigue visible en esta sesión. */
    }
  }

  function estaParticipando(id) { return !!participacion[id]; }

  function confirmadosMostrados(c) {
    return c.confirmados + (estaParticipando(c.id) ? 1 : 0);
  }

  function render() {
    var grid = document.getElementById("campanas-grid");
    var empty = document.getElementById("campanas-empty");
    if (!grid) return;
    grid.innerHTML = "";
    var campanas = AV.data.campaigns || [];
    empty.hidden = campanas.length !== 0;
    campanas.forEach(function (c) { grid.appendChild(construirTarjeta(c)); });
  }

  function construirTarjeta(c) {
    var li = document.createElement("li");
    li.className = "campana-card";
    li.innerHTML =
      '<span class="campana-tipo campana-tipo--' + c.tipo + '">' + c.tipoLabel + "</span>" +
      "<h3>" + c.nombre + "</h3>" +
      '<p class="campana-meta"><span>' + AV.formatFecha(c.fecha) + " · " + c.duracion + "</span>" +
      "<span>" + c.ubicacion + "</span></p>" +
      "<p>" + c.descripcion + "</p>" +
      '<p class="campana-info">' + c.infoAdicional + "</p>" +
      '<p class="campana-cupo"></p>' +
      '<button type="button" class="button campana-btn"></button>' +
      '<p class="campana-feedback" role="status" aria-live="polite"></p>';

    var boton = li.querySelector(".campana-btn");
    boton.addEventListener("click", function () { onParticipar(c, li); });

    actualizarTarjeta(c, li, false);
    return li;
  }

  function actualizarTarjeta(c, li, mostrarFeedback) {
    var participando = estaParticipando(c.id);
    var total = confirmadosMostrados(c);
    var lleno = !participando && total >= c.cupo;

    li.querySelector(".campana-cupo").textContent = total + " de " + c.cupo + " lugares confirmados";

    var boton = li.querySelector(".campana-btn");
    boton.className = "button campana-btn " + (participando ? "button-secondary" : "button-primary");
    boton.setAttribute("aria-pressed", String(participando));
    boton.disabled = lleno;
    boton.textContent = lleno ? "Cupo completo" : participando ? "✓ Participando · Cancelar participación" : "Participar";

    if (mostrarFeedback) {
      var feedback = li.querySelector(".campana-feedback");
      feedback.textContent = participando
        ? "¡Gracias! Tu participación en «" + c.nombre + "» quedó registrada en este dispositivo."
        : "Cancelaste tu participación en «" + c.nombre + "».";
    }
  }

  function onParticipar(c, li) {
    var participando = estaParticipando(c.id);
    if (participando) {
      delete participacion[c.id];
    } else {
      participacion[c.id] = true;
    }
    guardarParticipacion();
    actualizarTarjeta(c, li, true);
  }

  document.addEventListener("DOMContentLoaded", render);
})();