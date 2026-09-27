/* Alerta Verde — Módulo: geolocalización opcional en el formulario de
   reporte. No envía datos a ningún servidor; solo llena los campos
   ocultos geoLat/geoLng usados por reportForm.js. */
window.AV = window.AV || {};
AV.modules = AV.modules || {};

(function () {
  function init() {
    var button = document.getElementById("geo-button");
    var status = document.getElementById("geo-status");
    var latInput = document.getElementById("geo-lat");
    var lngInput = document.getElementById("geo-lng");
    if (!button || !status || !latInput || !lngInput) return;

    button.addEventListener("click", function () {
      if (!("geolocation" in navigator)) {
        status.textContent = "Tu navegador no permite obtener la ubicación automáticamente. Escribe la dirección o punto de referencia manualmente.";
        return;
      }

      button.disabled = true;
      status.textContent = "Obteniendo tu ubicación…";

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          latInput.value = pos.coords.latitude.toFixed(5);
          lngInput.value = pos.coords.longitude.toFixed(5);
          status.textContent = "Ubicación obtenida (" + latInput.value + ", " + lngInput.value + "). Puedes describir la dirección con más detalle abajo.";
          button.disabled = false;
        },
        function () {
          status.textContent = "No se pudo obtener tu ubicación automáticamente. Escribe la dirección o punto de referencia manualmente.";
          button.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  AV.modules.initGeolocation = init;
  document.addEventListener("DOMContentLoaded", init);
})();