/* Alerta Verde — Módulo: formulario de reporte de 5 pasos.
   Controla la navegación del stepper, la validación por paso, el
   resumen de revisión y el "envío" simulado del reporte (se guarda
   con AV.reports.add, definido en js/data/reports.js). No se envía
   ningún dato a un servidor. */
window.AV = window.AV || {};

(function () {
  var form, steps, stepperItems, prevBtn, nextBtn, submitBtn;
  var alertBox, loadingPanel, successPanel;
  var currentStep = 1;
  var TOTAL_STEPS = 5;

  function $(id) { return document.getElementById(id); }

  function poblarCategorias() {
    var group = $("categoria-group");
    if (!group || !window.AV.data || !AV.data.categories) return;
    AV.data.categories.forEach(function (c) {
      var label = document.createElement("label");
      label.className = "radio-option";
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "categoria";
      input.value = c.id;
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + c.label));
      group.appendChild(label);
    });
  }

  function mostrarPaso(n) {
    steps.forEach(function (step) {
      step.hidden = Number(step.getAttribute("data-step")) !== n;
    });
    stepperItems.forEach(function (item) {
      var stepNum = Number(item.getAttribute("data-step-indicator"));
      item.classList.toggle("is-current", stepNum === n);
      item.classList.toggle("is-complete", stepNum < n);
    });
    prevBtn.hidden = n === 1;
    nextBtn.hidden = n === TOTAL_STEPS;
    submitBtn.hidden = n !== TOTAL_STEPS;

    if (n === TOTAL_STEPS) construirResumen();
    limpiarAlerta();

    var legend = steps[n - 1].querySelector("legend");
    if (legend) {
      legend.setAttribute("tabindex", "-1");
      legend.focus();
    }
  }

  function limpiarAlerta() {
    alertBox.hidden = true;
    alertBox.textContent = "";
  }

  function mostrarAlerta(msg) {
    alertBox.hidden = false;
    alertBox.textContent = msg;
  }

  function limpiarErrores() {
    ["direccion-error", "categoria-error", "descripcion-error"].forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = "";
    });
  }

  function validarPaso(n) {
    limpiarErrores();

    if (n === 1) {
      var direccion = $("direccion");
      if (!direccion.value.trim()) {
        $("direccion-error").textContent = "Indica una dirección o punto de referencia.";
        direccion.setAttribute("aria-invalid", "true");
        direccion.focus();
        return false;
      }
      direccion.removeAttribute("aria-invalid");
      return true;
    }

    if (n === 2) {
      var checked = form.querySelector('input[name="categoria"]:checked');
      if (!checked) {
        $("categoria-error").textContent = "Selecciona una categoría de afectación.";
        return false;
      }
      return true;
    }

    if (n === 3) {
      var desc = $("descripcion");
      if (desc.value.trim().length < 20) {
        $("descripcion-error").textContent = "Describe lo que observaste con al menos 20 caracteres.";
        desc.setAttribute("aria-invalid", "true");
        desc.focus();
        return false;
      }
      desc.removeAttribute("aria-invalid");
      return true;
    }

    return true;
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function construirResumenHTML() {
    var direccion = $("direccion").value.trim();
    var categoriaInput = form.querySelector('input[name="categoria"]:checked');
    var categoriaLabel = categoriaInput ? AV.data.getCategoryLabel(categoriaInput.value) : "—";
    var descripcion = $("descripcion").value.trim();
    var fotos = (window.AV.modules && AV.modules.getUploadedFiles) ? AV.modules.getUploadedFiles() : [];
    var fotosTexto = fotos.length
      ? fotos.length + " archivo(s): " + fotos.map(function (f) { return f.name; }).join(", ")
      : "Sin fotografías";

    return (
      "<dl>" +
      "<dt>Ubicación</dt><dd>" + escapeHTML(direccion) + ' <button type="button" class="edit-link" data-goto="1">Editar</button></dd>' +
      "<dt>Categoría</dt><dd>" + escapeHTML(categoriaLabel) + ' <button type="button" class="edit-link" data-goto="2">Editar</button></dd>' +
      "<dt>Descripción</dt><dd>" + escapeHTML(descripcion) + ' <button type="button" class="edit-link" data-goto="3">Editar</button></dd>' +
      "<dt>Evidencia</dt><dd>" + escapeHTML(fotosTexto) + ' <button type="button" class="edit-link" data-goto="4">Editar</button></dd>' +
      "</dl>"
    );
  }

  function construirResumen() {
    var contenedor = $("review-summary");
    contenedor.innerHTML = construirResumenHTML();
    contenedor.querySelectorAll(".edit-link").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentStep = Number(btn.getAttribute("data-goto"));
        mostrarPaso(currentStep);
      });
    });
  }

  function enviarReporte() {
    var direccion = $("direccion").value.trim();
    var categoriaInput = form.querySelector('input[name="categoria"]:checked');
    var descripcion = $("descripcion").value.trim();
    var latVal = $("geo-lat").value;
    var lngVal = $("geo-lng").value;

    form.hidden = true;
    alertBox.hidden = true;
    loadingPanel.hidden = false;

    // Simula la latencia de un envío real sin contactar ningún servidor.
    setTimeout(function () {
      var nuevo = AV.reports.add({
        direccion: direccion,
        categoria: categoriaInput ? categoriaInput.value : "otro",
        descripcion: descripcion,
        lat: latVal ? parseFloat(latVal) : undefined,
        lng: lngVal ? parseFloat(lngVal) : undefined
      });

      loadingPanel.hidden = true;
      successPanel.hidden = false;

      $("success-folio").textContent = nuevo.id;
      var mapLink = $("success-map-link");
      if (mapLink) mapLink.setAttribute("href", "mapa.html?folio=" + encodeURIComponent(nuevo.id));

      var successSummary = $("success-summary");
      successSummary.innerHTML = construirResumenHTML();
      successSummary.querySelectorAll(".edit-link").forEach(function (b) { b.remove(); });

      var heading = successPanel.querySelector("h2");
      heading.setAttribute("tabindex", "-1");
      heading.focus();
      AV.scrollIntoViewSafe(successPanel);
    }, 900);
  }

  function resetFormulario() {
    form.reset();
    form.hidden = false;
    successPanel.hidden = true;
    $("geo-lat").value = "";
    $("geo-lng").value = "";
    $("geo-status").textContent = "";
    if (window.AV.modules && AV.modules.resetUploads) AV.modules.resetUploads();
    currentStep = 1;
    mostrarPaso(1);
  }

  function init() {
    form = $("report-form");
    if (!form) return;

    steps = Array.prototype.slice.call(document.querySelectorAll(".form-step"));
    stepperItems = Array.prototype.slice.call(document.querySelectorAll(".stepper__item"));
    prevBtn = $("prev-button");
    nextBtn = $("next-button");
    submitBtn = $("submit-button");
    alertBox = $("form-alert");
    loadingPanel = $("loading-panel");
    successPanel = $("success-panel");

    poblarCategorias();

    var descTextarea = $("descripcion");
    var descCount = $("descripcion-count");
    if (descTextarea && descCount) {
      descTextarea.addEventListener("input", function () {
        descCount.textContent = String(descTextarea.value.length);
      });
    }

    nextBtn.addEventListener("click", function () {
      if (!validarPaso(currentStep)) {
        mostrarAlerta("Revisa los campos marcados antes de continuar.");
        return;
      }
      currentStep = Math.min(TOTAL_STEPS, currentStep + 1);
      mostrarPaso(currentStep);
    });

    prevBtn.addEventListener("click", function () {
      currentStep = Math.max(1, currentStep - 1);
      mostrarPaso(currentStep);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var direccionValida = $("direccion").value.trim().length > 0;
      var categoriaValida = !!form.querySelector('input[name="categoria"]:checked');
      var descripcionValida = $("descripcion").value.trim().length >= 20;
      if (!direccionValida || !categoriaValida || !descripcionValida) {
        mostrarAlerta("Hay campos incompletos. Revisa los pasos anteriores antes de enviar.");
        return;
      }
      enviarReporte();
    });

    $("new-report-button").addEventListener("click", resetFormulario);

    mostrarPaso(1);
  }

  document.addEventListener("DOMContentLoaded", init);
})();