/* Alerta Verde — Módulo: geolocalización en el formulario de reporte.
   No envía datos a ningún servidor; solo llena los campos ocultos
   geoLat/geoLng usados por reportForm.js. Además muestra una vista
   previa en un mapa real (Mapbox) con un marcador arrastrable, para
   que la persona pueda confirmar o corregir el punto exacto antes de
   enviar el reporte. */
window.AV = window.AV || {};
AV.modules = AV.modules || {};

(function () {
  var previewMap = null;
  var previewMarker = null;

  function mostrarMapaPreview(mapDiv, hintEl, lat, lng, onDragEnd) {
    if (typeof mapboxgl === "undefined" || !AV.config || !AV.config.MAPBOX_TOKEN) return;

    mapDiv.hidden = false;
    hintEl.hidden = false;

    try {
      if (!previewMap) {
        mapboxgl.accessToken = AV.config.MAPBOX_TOKEN;
        previewMap = new mapboxgl.Map({
          container: mapDiv.id,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [lng, lat],
          zoom: 15
        });
        previewMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        previewMarker = new mapboxgl.Marker({ color: "#1A3622", draggable: true })
          .setLngLat([lng, lat])
          .addTo(previewMap);

        previewMarker.on("dragend", function () {
          var ll = previewMarker.getLngLat();
          onDragEnd(ll.lat, ll.lng);
        });

        /* El mapa se crea justo cuando se deja de ocultar su
           contenedor; un resize de cortesía evita que quede recortado
           si el navegador midió el div en 0×0 por una fracción de
           segundo. */
        setTimeout(function () { previewMap.resize(); }, 50);
      } else {
        previewMap.resize();
        previewMap.setCenter([lng, lat]);
        previewMarker.setLngLat([lng, lat]);
      }
    } catch (e) {
      /* Si Mapbox falla (sin internet, token inválido, etc.) el
         formulario sigue funcionando: los campos ocultos ya se
         llenaron antes de llamar a esta función. */
    }
  }

  function init() {
    var button = document.getElementById("geo-button");
    var status = document.getElementById("geo-status");
    var latInput = document.getElementById("geo-lat");
    var lngInput = document.getElementById("geo-lng");
    var mapDiv = document.getElementById("geo-preview-map");
    var hintEl = document.getElementById("geo-preview-hint");
    if (!button || !status || !latInput || !lngInput) return;

    function actualizarCampos(lat, lng) {
      latInput.value = lat.toFixed(5);
      lngInput.value = lng.toFixed(5);
    }

    button.addEventListener("click", function () {
      if (!("geolocation" in navigator)) {
        status.textContent = "Tu navegador no permite obtener la ubicación automáticamente. Escribe la dirección o punto de referencia manualmente.";
        return;
      }

      button.disabled = true;
      status.textContent = "Obteniendo tu ubicación…";

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude, lng = pos.coords.longitude;
          actualizarCampos(lat, lng);
          status.textContent = "Ubicación obtenida (" + latInput.value + ", " + lngInput.value + "). Puedes describir la dirección con más detalle abajo.";
          button.disabled = false;

          if (mapDiv && hintEl) {
            mostrarMapaPreview(mapDiv, hintEl, lat, lng, function (nuevoLat, nuevoLng) {
              actualizarCampos(nuevoLat, nuevoLng);
              status.textContent = "Ubicación ajustada manualmente (" + latInput.value + ", " + lngInput.value + ").";
            });
          }
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
