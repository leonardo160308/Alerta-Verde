/* Alerta Verde — Utilidades compartidas.
   Punto único para: configuración de servicios externos (Mapbox),
   formateo de fechas, scroll accesible y helpers de datos que usan
   varias páginas (mapa, reportar, campañas). */
window.AV = window.AV || {};

/* Configuración de servicios externos. El token de Mapbox es público
   (empieza con "pk."), está pensado para vivir en el navegador y se
   puede restringir por dominio desde el dashboard de Mapbox
   (Account → Tokens → URL restrictions). */
AV.config = AV.config || {
  // Pon el token pk. directamente aquí. ¡Es completamente seguro!
  MAPBOX_TOKEN: "pk.eyJ1IjoibGVvb28xNjIxIiwiYSI6ImNtdWplNXZhMDAzaHMyd3BzM2lrcGtvZmIifQ.DkJGIcJHenPTxhjTRo9gtw",
  MAPBOX_STYLE: "mapbox://styles/mapbox/light-v11",
  MAPA_CENTER: [-99.1332, 19.4326],
  MAPA_ZOOM: 10.5
};

/* Convierte una fecha "YYYY-MM-DD" (sin hora) a texto en español,
   construyendo el Date con año/mes/día locales para evitar el
   corrimiento de un día que causa `new Date("YYYY-MM-DD")` en husos
   horarios negativos como el de México. */
AV.formatFecha = function (fechaISO) {
  if (!fechaISO) return "";
  var partes = String(fechaISO).split("-");
  if (partes.length !== 3) return fechaISO;
  var fecha = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
  if (isNaN(fecha.getTime())) return fechaISO;
  try {
    return fecha.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  } catch (e) {
    return fechaISO;
  }
};

/* Hace scroll hasta un elemento respetando prefers-reduced-motion. */
AV.scrollIntoViewSafe = function (el) {
  if (!el || typeof el.scrollIntoView !== "function") return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  } catch (e) {
    el.scrollIntoView();
  }
};

/* Etiqueta legible de una categoría a partir de su id. */
AV.data = AV.data || {};
AV.data.getCategoryLabel = function (id) {
  var lista = AV.data.categories || [];
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id === id) return lista[i].label;
  }
  return id || "Sin categoría";
};

/* Enlace universal a Google Maps para un par de coordenadas: abre la
   app de Maps si está instalada (móvil) o el sitio web (escritorio),
   sin requerir ninguna clave. */
AV.mapsUrl = function (lat, lng) {
  return "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng;
};