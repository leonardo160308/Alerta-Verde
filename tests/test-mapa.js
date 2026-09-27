const path = require("path");
const { JSDOM } = require("jsdom");

async function main() {
  const errors = [];
  const virtualConsole = new (require("jsdom").VirtualConsole)();
  virtualConsole.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
  virtualConsole.on("error", (...args) => errors.push("console.error: " + args.join(" ")));

  const dom = await JSDOM.fromFile(path.join(__dirname, "mapa.html"), {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    virtualConsole
  });

  const { window } = dom;

  await new Promise((resolve) => {
    window.document.addEventListener("DOMContentLoaded", () => setTimeout(resolve, 50));
  });
  // dar tiempo a que corran todos los scripts defer en orden
  await new Promise((r) => setTimeout(r, 100));

  const d = window.document;

  function assert(cond, msg) {
    if (!cond) errors.push("ASSERT FAIL: " + msg);
    else console.log("OK: " + msg);
  }

  assert(!!window.AV, "AV existe");
  assert(Array.isArray(window.AV.data.categories) && window.AV.data.categories.length === 7, "7 categorías cargadas");
  assert(Array.isArray(window.AV.data.reportsSeed) && window.AV.data.reportsSeed.length === 14, "14 reportes semilla");
  assert(typeof window.AV.reports.getAll === "function", "AV.reports.getAll existe");

  const markers = d.querySelectorAll(".mapa-marker");
  assert(markers.length === 14, "se renderizaron 14 marcadores, hay " + markers.length);

  const cards = d.querySelectorAll(".reporte-card__button");
  assert(cards.length === 14, "se renderizaron 14 tarjetas, hay " + cards.length);

  const countText = d.getElementById("filtro-resultado-count").textContent;
  assert(/14 reportes encontrados/.test(countText), "conteo inicial correcto: " + countText);

  // Filtrar por categoría "tala" (debe haber 2 en la semilla)
  const catSelect = d.getElementById("filtro-categoria");
  catSelect.value = "tala";
  catSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 20));
  const markersAfterFilter = d.querySelectorAll(".mapa-marker");
  assert(markersAfterFilter.length === 2, "filtro categoría=tala deja 2 marcadores, hay " + markersAfterFilter.length);

  // Reset filtros
  d.getElementById("filtro-reset").click();
  await new Promise((r) => setTimeout(r, 20));
  assert(d.querySelectorAll(".mapa-marker").length === 14, "reset de filtros vuelve a 14 marcadores");

  // Filtrar solo resueltos
  const estadoSelect = d.getElementById("filtro-estado");
  estadoSelect.value = "resuelto";
  estadoSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 20));
  assert(d.querySelectorAll(".mapa-marker").length === 4, "filtro resueltos deja 4, hay " + d.querySelectorAll(".mapa-marker").length);
  estadoSelect.value = "todos";
  estadoSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 20));

  // Buscar por folio
  const busqueda = d.getElementById("filtro-busqueda");
  busqueda.value = "AV-2026-0007";
  busqueda.dispatchEvent(new window.Event("input", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 250));
  assert(d.querySelectorAll(".mapa-marker").length === 1, "búsqueda por folio deja 1 resultado, hay " + d.querySelectorAll(".mapa-marker").length);
  busqueda.value = "";
  busqueda.dispatchEvent(new window.Event("input", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 250));

  // Seleccionar un marcador y verificar panel de detalle + timeline
  const detallePanel = d.getElementById("detalle-panel");
  assert(detallePanel.hidden === true, "panel de detalle inicia oculto");
  const primerMarcador = d.querySelector('.mapa-marker[data-report-id="AV-2026-0007"]');
  assert(!!primerMarcador, "existe marcador para AV-2026-0007");
  primerMarcador.click();
  await new Promise((r) => setTimeout(r, 20));
  assert(detallePanel.hidden === false, "panel de detalle se muestra tras click en marcador");
  assert(d.getElementById("detalle-heading").textContent.indexOf("AV-2026-0007") !== -1, "encabezado de detalle muestra folio correcto");
  const timelineSteps = d.querySelectorAll("#detalle-timeline .timeline-step");
  assert(timelineSteps.length === 4, "timeline tiene 4 etapas, hay " + timelineSteps.length);
  // La última etapa alcanzada se marca "actual" (no "completa"): para un
  // reporte resuelto, "Resuelto" es la etapa actual y las 3 previas están completas.
  assert(d.querySelectorAll("#detalle-timeline .is-complete").length === 3, "AV-2026-0007 (resuelto) muestra 3 etapas previas completas");
  assert(timelineSteps[3].classList.contains("is-current"), "AV-2026-0007 (resuelto): la etapa 'Resuelto' es la actual");

  // Cerrar detalle y verificar que el foco regresa al marcador
  d.getElementById("detalle-cerrar").click();
  await new Promise((r) => setTimeout(r, 20));
  assert(detallePanel.hidden === true, "panel de detalle se oculta al cerrar");

  // Seleccionar un reporte "enviado" y verificar que solo la 1a etapa está completa/actual
  const cardEnviado = d.querySelector('.reporte-card__button[data-report-id="AV-2026-0004"]');
  cardEnviado.click();
  await new Promise((r) => setTimeout(r, 20));
  const steps2 = d.querySelectorAll("#detalle-timeline .timeline-step");
  assert(steps2[0].classList.contains("is-current"), "reporte enviado: etapa 1 es 'actual'");
  assert(steps2[1].classList.contains("is-pending") && steps2[2].classList.contains("is-pending") && steps2[3].classList.contains("is-pending"), "reporte enviado: etapas 2-4 pendientes");

  // Probar folio por querystring (se preserva la base file:// para que
  // los <script src="js/..."> relativos seguan resolviendo al disco)
  const fs = require("fs");
  const html = fs.readFileSync(path.join(__dirname, "mapa.html"), "utf8");
  const fileUrl = "file://" + path.join(__dirname, "mapa.html") + "?folio=AV-2026-0001";
  const dom2 = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    url: fileUrl,
    virtualConsole
  });
  await new Promise((r) => setTimeout(r, 250));
  const d2 = dom2.window.document;
  assert(d2.getElementById("detalle-panel").hidden === false, "?folio= abre el detalle automáticamente");
  assert(d2.getElementById("detalle-heading").textContent.indexOf("AV-2026-0001") !== -1, "?folio= muestra el folio correcto");

  console.log("\n=== ERRORES ===");
  if (errors.length === 0) {
    console.log("Ninguno. Todas las pruebas pasaron.");
  } else {
    errors.forEach((e) => console.log(e));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("EXCEPCIÓN:", e);
  process.exitCode = 1;
});