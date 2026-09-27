/* Alerta Verde — Módulo: geolocalización en el formulario de reporte.
   No envía datos a ningún servidor propio; solo llena los campos
   ocultos geoLat/geoLng usados por reportForm.js. Además muestra una
   vista previa en un mapa real (Mapbox) con un marcador arrastrable,
   para que la persona pueda confirmar o corregir el punto exacto
   antes de enviar el reporte, y usa el Geocoding API de Mapbox
   (mismo token público que el mapa) para sugerir automáticamente el
   texto del campo "Dirección o punto de referencia". Si la búsqueda
   de dirección falla (sin internet, token restringido, etc.) el
   formulario sigue funcionando: las coordenadas ya quedaron
   guardadas y la persona puede escribir la dirección a mano. */
window.AV = window.AV || {};
AV.modules = AV.modules || {};

(function () {
  var previewMap = null;
  var previewMarker = null;

  /* Reverse geocoding: coordenadas → texto de dirección legible.
     Usa el mismo token público (pk.) que ya vive en AV.config, así
     que no requiere ninguna clave adicional. */
  function buscarDireccion(lat, lng, onSuccess, onError) {
    if (!AV.config || !AV.config.MAPBOX_TOKEN) { onError(); return; }

    var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      lng + "," + lat + ".json?access_token=" + AV.config.MAPBOX_TOKEN +
      "&language=es&limit=1&types=address,poi,neighborhood,place";

    fetch(url)
      .then(function (res) { if (!res.ok) throw new Error("geocoding-error"); return res.json(); })
      .then(function (data) {
        var feature = data && data.features && data.features[0];
        if (feature && feature.place_name) onSuccess(feature.place_name);
        else onError();
      })
      .catch(onError);
  }

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
    var direccionInput = document.getElementById("direccion");
    if (!button || !status || !latInput || !lngInput) return;

    function actualizarCampos(lat, lng) {
      latInput.value = lat.toFixed(5);
      lngInput.value = lng.toFixed(5);
    }

    /* Busca la dirección de (lat, lng) y la escribe en el campo de
       texto; el campo queda editable en todo momento por si la
       persona quiere corregirla o agregar un punto de referencia. */
    function autocompletarDireccion(lat, lng, mensajeBase) {
      if (!direccionInput) { status.textContent = mensajeBase; return; }
      status.textContent = mensajeBase + " Buscando la dirección…";
      buscarDireccion(
        lat, lng,
        function (direccion) {
          direccionInput.value = direccion;
          direccionInput.setAttribute("readonly", "");
          status.textContent = mensajeBase + " Dirección detectada.";
        },
        function () {
          /* No se pudo traducir el punto a una dirección legible: se
             desbloquea el campo para que la persona la escriba, en
             vez de dejarla sin forma de completar el reporte. */
          direccionInput.removeAttribute("readonly");
          status.textContent = mensajeBase + " No se pudo obtener la dirección automáticamente; escríbela tú.";
        }
      );
    }

    button.addEventListener("click", function () {
      if (!("geolocation" in navigator)) {
        if (direccionInput) direccionInput.removeAttribute("readonly");
        status.textContent = "Tu navegador no permite obtener la ubicación automáticamente. Escribe la dirección o punto de referencia manualmente.";
        return;
      }

      button.disabled = true;
      status.textContent = "Obteniendo tu ubicación…";

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude, lng = pos.coords.longitude;
          actualizarCampos(lat, lng);
          button.disabled = false;
          autocompletarDireccion(lat, lng, "Ubicación obtenida (" + latInput.value + ", " + lngInput.value + ").");

          if (mapDiv && hintEl) {
            mostrarMapaPreview(mapDiv, hintEl, lat, lng, function (nuevoLat, nuevoLng) {
              actualizarCampos(nuevoLat, nuevoLng);
              autocompletarDireccion(nuevoLat, nuevoLng, "Ubicación ajustada manualmente (" + latInput.value + ", " + lngInput.value + ").");
            });
          }
        },
        function () {
          if (direccionInput) direccionInput.removeAttribute("readonly");
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