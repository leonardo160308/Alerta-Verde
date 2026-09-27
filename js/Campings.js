/* Alerta Verde — Datos simulados: campañas de participación comunitaria.
   Fuente única para la página de campañas (Fase 4). No se conecta a
   ningún servidor. */
window.AV = window.AV || {};
AV.data = AV.data || {};

AV.data.campaigns = [
  {
    id: "camp-01",
    tipo: "reforestacion",
    tipoLabel: "Reforestación",
    nombre: "Reforestación en Bosque de Tlalpan",
    descripcion: "Plantación de especies nativas en la zona norte del bosque, con brigadas de riego y cuidado inicial durante la jornada.",
    fecha: "2026-10-11",
    duracion: "9:00 a 13:00 h",
    ubicacion: "Bosque de Tlalpan, entrada San Miguel Ajusco",
    infoAdicional: "Lleva ropa cómoda, agua y protector solar. Herramientas y guantes se proporcionan en el lugar.",
    cupo: 60,
    confirmados: 34
  },
  {
    id: "camp-02",
    tipo: "limpieza",
    tipoLabel: "Limpieza",
    nombre: "Jornada de limpieza — Río Magdalena",
    descripcion: "Recolección de residuos sólidos a lo largo del cauce y separación de materiales reciclables.",
    fecha: "2026-10-04",
    duracion: "8:30 a 12:00 h",
    ubicacion: "Río Magdalena, tramo La Cañada",
    infoAdicional: "Se recomienda calzado cerrado. Guantes y bolsas se entregan al inicio de la jornada.",
    cupo: 40,
    confirmados: 22
  },
  {
    id: "camp-03",
    tipo: "recuperacion",
    tipoLabel: "Recuperación de espacios",
    nombre: "Recuperación del Parque de los Venados",
    descripcion: "Reparación de bancas, señalización y limpieza de jardineras abandonadas en el sector poniente del parque.",
    fecha: "2026-10-18",
    duracion: "10:00 a 14:00 h",
    ubicacion: "Parque de los Venados, sector poniente",
    infoAdicional: "Actividad familiar. Habrá tareas ligeras para niñas y niños con supervisión.",
    cupo: 30,
    confirmados: 12
  },
  {
    id: "camp-04",
    tipo: "reforestacion",
    tipoLabel: "Reforestación",
    nombre: "Reforestación urbana en Azcapotzalco",
    descripcion: "Plantación de árboles de sombra en camellones y banquetas de la colonia, en coordinación con vecinos del sector.",
    fecha: "2026-11-01",
    duracion: "9:00 a 12:30 h",
    ubicacion: "Camellón Av. Aquiles Serdán, Azcapotzalco",
    infoAdicional: "Punto de encuentro en la explanada de Parque Tezozómoc. Se sugiere llevar gorra.",
    cupo: 50,
    confirmados: 9
  },
  {
    id: "camp-05",
    tipo: "limpieza",
    tipoLabel: "Limpieza",
    nombre: "Limpieza comunitaria de canales — Xochimilco",
    descripcion: "Retiro de residuos flotantes y lirio acuático en un tramo de canales, en colaboración con productores locales.",
    fecha: "2026-10-25",
    duracion: "8:00 a 12:00 h",
    ubicacion: "Embarcadero Cuemanco, Xochimilco",
    infoAdicional: "Se proporciona chaleco y equipo básico. No es necesario saber remar.",
    cupo: 45,
    confirmados: 27
  },
  {
    id: "camp-06",
    tipo: "recuperacion",
    tipoLabel: "Recuperación de espacios",
    nombre: "Recuperación de jardineras — Alameda Central",
    descripcion: "Resiembra de jardineras y retiro de maleza invasiva en la explanada norte de la Alameda.",
    fecha: "2026-10-05",
    duracion: "9:00 a 12:00 h",
    ubicacion: "Alameda Central, explanada norte",
    infoAdicional: "Cupo lleno para esta fecha; puedes revisar próximas campañas o volver más adelante.",
    cupo: 25,
    confirmados: 25
  }
];