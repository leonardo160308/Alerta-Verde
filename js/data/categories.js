/* Alerta Verde — Datos simulados: categorías de afectación.
   Estructura modular pensada para sustituirse por una API real
   sin cambiar el resto de la interfaz. */
window.AV = window.AV || {};
AV.data = AV.data || {};

AV.data.categories = [
  { id: "tala", label: "Tala o poda irregular" },
  { id: "basura", label: "Acumulación de basura" },
  { id: "incendio", label: "Incendio o quema" },
  { id: "plaga", label: "Plaga o enfermedad en vegetación" },
  { id: "invasion", label: "Invasión del espacio verde" },
  { id: "riego", label: "Riego o mantenimiento deficiente" },
  { id: "otro", label: "Otro" }
];
