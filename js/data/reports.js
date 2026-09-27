/* Alerta Verde — Datos simulados: reportes ciudadanos y su seguimiento.
   Fuente única de reportes para el formulario (Fase 3) y para el mapa
   y el seguimiento (Fase 4). No se conecta a ningún servidor: los
   reportes que se envían desde el formulario se guardan únicamente en
   el localStorage de este navegador. */
window.AV = window.AV || {};
AV.data = AV.data || {};

/* Orden y metadatos de las 4 etapas de seguimiento. El orden del
   arreglo define el orden cronológico esperado del proceso y es la
   única fuente de verdad que usa el componente de timeline. */
AV.data.STAGES = [
  {
    id: "enviado",
    label: "Enviado",
    description: "El reporte fue recibido y está en espera de revisión por parte del equipo comunitario."
  },
  {
    id: "verificado",
    label: "Verificado",
    description: "Una persona voluntaria confirmó en sitio que la afectación reportada es real."
  },
  {
    id: "en-atencion",
    label: "En Atención",
    description: "Se están coordinando acciones con la comunidad o con autoridades locales para atender el caso."
  },
  {
    id: "resuelto",
    label: "Resuelto",
    description: "La afectación fue atendida y el reporte se considera cerrado."
  }
];

/* Reportes simulados semilla. Ubicaciones y coordenadas aproximadas de
   espacios verdes de la Ciudad de México, solo con fines de
   demostración visual; no representan datos verificados. */
AV.data.reportsSeed = [
  {
    id: "AV-2026-0001",
    categoria: "tala",
    direccion: "Bosque de Chapultepec, 1.ª Sección",
    lat: 19.4127, lng: -99.1936,
    fecha: "2026-08-02",
    estado: "resuelto",
    descripcion: "Tala de al menos ocho árboles adultos cerca del Lago Menor.",
    historial: [
      { estado: "enviado", fecha: "2026-08-02" },
      { estado: "verificado", fecha: "2026-08-04" },
      { estado: "en-atencion", fecha: "2026-08-10" },
      { estado: "resuelto", fecha: "2026-08-22" }
    ]
  },
  {
    id: "AV-2026-0002",
    categoria: "basura",
    direccion: "Parque México, Condesa",
    lat: 19.4118, lng: -99.1716,
    fecha: "2026-09-05",
    estado: "en-atencion",
    descripcion: "Acumulación de basura doméstica junto al foro al aire libre.",
    historial: [
      { estado: "enviado", fecha: "2026-09-05" },
      { estado: "verificado", fecha: "2026-09-07" },
      { estado: "en-atencion", fecha: "2026-09-12" }
    ]
  },
  {
    id: "AV-2026-0003",
    categoria: "plaga",
    direccion: "Viveros de Coyoacán",
    lat: 19.3465, lng: -99.1636,
    fecha: "2026-09-15",
    estado: "verificado",
    descripcion: "Plaga de descortezador en un grupo de cedros del sendero principal.",
    historial: [
      { estado: "enviado", fecha: "2026-09-15" },
      { estado: "verificado", fecha: "2026-09-18" }
    ]
  },
  {
    id: "AV-2026-0004",
    categoria: "riego",
    direccion: "Parque Hundido, Extremadura Insurgentes",
    lat: 19.3775, lng: -99.1755,
    fecha: "2026-09-24",
    estado: "enviado",
    descripcion: "El sistema de riego lleva más de dos semanas sin funcionar.",
    historial: [
      { estado: "enviado", fecha: "2026-09-24" }
    ]
  },
  {
    id: "AV-2026-0005",
    categoria: "basura",
    direccion: "Alameda Central",
    lat: 19.4358, lng: -99.1441,
    fecha: "2026-08-10",
    estado: "resuelto",
    descripcion: "Contenedores desbordados sobre la explanada norte.",
    historial: [
      { estado: "enviado", fecha: "2026-08-10" },
      { estado: "verificado", fecha: "2026-08-11" },
      { estado: "en-atencion", fecha: "2026-08-15" },
      { estado: "resuelto", fecha: "2026-08-20" }
    ]
  },
  {
    id: "AV-2026-0006",
    categoria: "invasion",
    direccion: "Parque Naucalli, Naucalpan",
    lat: 19.4550, lng: -99.2400,
    fecha: "2026-08-28",
    estado: "en-atencion",
    descripcion: "Instalación de puestos fijos no autorizados sobre una jardinera.",
    historial: [
      { estado: "enviado", fecha: "2026-08-28" },
      { estado: "verificado", fecha: "2026-09-01" },
      { estado: "en-atencion", fecha: "2026-09-10" }
    ]
  },
  {
    id: "AV-2026-0007",
    categoria: "incendio",
    direccion: "Bosque de Tlalpan, entrada San Miguel Ajusco",
    lat: 19.2865, lng: -99.1930,
    fecha: "2026-07-20",
    estado: "resuelto",
    descripcion: "Conato de incendio en pastizal seco cerca del área de picnic.",
    historial: [
      { estado: "enviado", fecha: "2026-07-20" },
      { estado: "verificado", fecha: "2026-07-21" },
      { estado: "en-atencion", fecha: "2026-07-23" },
      { estado: "resuelto", fecha: "2026-08-05" }
    ]
  },
  {
    id: "AV-2026-0008",
    categoria: "tala",
    direccion: "Parque Ecológico de Xochimilco",
    lat: 19.2647, lng: -99.1030,
    fecha: "2026-09-10",
    estado: "verificado",
    descripcion: "Poda severa no autorizada en la zona de ahuejotes.",
    historial: [
      { estado: "enviado", fecha: "2026-09-10" },
      { estado: "verificado", fecha: "2026-09-14" }
    ]
  },
  {
    id: "AV-2026-0009",
    categoria: "otro",
    direccion: "Parque Lira, San Miguel Chapultepec",
    lat: 19.4020, lng: -99.1870,
    fecha: "2026-09-25",
    estado: "enviado",
    descripcion: "Bancas y luminarias dañadas por vandalismo reciente.",
    historial: [
      { estado: "enviado", fecha: "2026-09-25" }
    ]
  },
  {
    id: "AV-2026-0010",
    categoria: "basura",
    direccion: "Parque de los Venados",
    lat: 19.3690, lng: -99.1590,
    fecha: "2026-09-02",
    estado: "en-atencion",
    descripcion: "Escombro de construcción abandonado junto a la ciclovía.",
    historial: [
      { estado: "enviado", fecha: "2026-09-02" },
      { estado: "verificado", fecha: "2026-09-04" },
      { estado: "en-atencion", fecha: "2026-09-09" }
    ]
  },
  {
    id: "AV-2026-0011",
    categoria: "riego",
    direccion: "Parque Tezozómoc, Azcapotzalco",
    lat: 19.4770, lng: -99.1870,
    fecha: "2026-08-15",
    estado: "resuelto",
    descripcion: "Fuga de agua constante en la zona de juegos infantiles.",
    historial: [
      { estado: "enviado", fecha: "2026-08-15" },
      { estado: "verificado", fecha: "2026-08-17" },
      { estado: "en-atencion", fecha: "2026-08-19" },
      { estado: "resuelto", fecha: "2026-08-30" }
    ]
  },
  {
    id: "AV-2026-0012",
    categoria: "incendio",
    direccion: "Bosque de Aragón",
    lat: 19.4570, lng: -99.0790,
    fecha: "2026-09-19",
    estado: "verificado",
    descripcion: "Restos de fogata mal apagada cerca del área boscosa.",
    historial: [
      { estado: "enviado", fecha: "2026-09-19" },
      { estado: "verificado", fecha: "2026-09-21" }
    ]
  },
  {
    id: "AV-2026-0013",
    categoria: "invasion",
    direccion: "Parque Lincoln, Polanco",
    lat: 19.4320, lng: -99.1930,
    fecha: "2026-09-23",
    estado: "enviado",
    descripcion: "Construcción improvisada dentro del área verde protegida.",
    historial: [
      { estado: "enviado", fecha: "2026-09-23" }
    ]
  },
  {
    id: "AV-2026-0014",
    categoria: "plaga",
    direccion: "Jardín Botánico, Ciudad Universitaria",
    lat: 19.3260, lng: -99.1830,
    fecha: "2026-08-30",
    estado: "en-atencion",
    descripcion: "Presencia de muérdago en varios ejemplares del área de encinos.",
    historial: [
      { estado: "enviado", fecha: "2026-08-30" },
      { estado: "verificado", fecha: "2026-09-02" },
      { estado: "en-atencion", fecha: "2026-09-08" }
    ]
  }
];

/* API de acceso a reportes: combina los reportes semilla con los que
   la persona haya enviado desde este navegador (Fase 3), sin duplicar
   la fuente de datos entre páginas. */
AV.reports = (function () {
  var STORAGE_KEY = "av_user_reports";
  var COUNTER_KEY = "av_report_counter";
  /* Ubicación de respaldo (Zócalo, CDMX) para reportes enviados sin
     geolocalización; se marcan con ubicacionAproximada = true. */
  var FALLBACK = { lat: 19.4326, lng: -99.1332 };

  function leerReportesUsuario() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function guardarReportesUsuario(lista) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    } catch (e) {
      /* Almacenamiento no disponible (modo privado, cuota, etc.):
         el reporte seguirá visible en esta sesión aunque no persista. */
    }
  }

  function siguienteFolio() {
    var year = new Date().getFullYear();
    var count = AV.data.reportsSeed.length + leerReportesUsuario().length + 1;
    try {
      var stored = window.localStorage.getItem(COUNTER_KEY);
      count = stored ? parseInt(stored, 10) + 1 : count;
      window.localStorage.setItem(COUNTER_KEY, String(count));
    } catch (e) {
      /* Sin persistencia disponible; se usa el conteo calculado. */
    }
    var numero = String(count);
    while (numero.length < 4) numero = "0" + numero;
    return "AV-" + year + "-" + numero;
  }

  function getAll() {
    return AV.data.reportsSeed.concat(leerReportesUsuario());
  }

  function getById(id) {
    var encontrados = getAll().filter(function (r) { return r.id === id; });
    return encontrados.length ? encontrados[0] : null;
  }

  function add(input) {
    var hoy = new Date().toISOString().slice(0, 10);
    var tieneCoordenadas = typeof input.lat === "number" && !isNaN(input.lat) &&
                            typeof input.lng === "number" && !isNaN(input.lng);
    var reporte = {
      id: siguienteFolio(),
      categoria: input.categoria || "otro",
      direccion: input.direccion || "Ubicación no especificada",
      lat: tieneCoordenadas ? input.lat : FALLBACK.lat,
      lng: tieneCoordenadas ? input.lng : FALLBACK.lng,
      ubicacionAproximada: !tieneCoordenadas,
      fecha: hoy,
      estado: "enviado",
      descripcion: input.descripcion || "",
      historial: [{ estado: "enviado", fecha: hoy }]
    };
    var lista = leerReportesUsuario();
    lista.push(reporte);
    guardarReportesUsuario(lista);
    return reporte;
  }

  function filter(opts) {
    opts = opts || {};
    var estado = opts.estado || "todos";
    var categoria = opts.categoria || "todas";
    var query = (opts.query || "").trim().toLowerCase();

    return getAll().filter(function (r) {
      if (categoria !== "todas" && r.categoria !== categoria) return false;
      if (estado === "activos" && r.estado === "resuelto") return false;
      if (estado === "resuelto" && r.estado !== "resuelto") return false;
      if (estado !== "todos" && estado !== "activos" && estado !== "resuelto" && r.estado !== estado) return false;
      if (query) {
        var haystack = (r.id + " " + r.direccion + " " + r.descripcion).toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }
      return true;
    }).sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  }

  return { getAll: getAll, getById: getById, add: add, filter: filter };
})();