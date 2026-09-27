/* Alerta Verde — Módulo: carga de evidencia fotográfica (paso 4).
   Simulado: los archivos nunca se envían a ningún servidor, solo se
   previsualizan en el navegador con URL.createObjectURL. */
window.AV = window.AV || {};
AV.modules = AV.modules || {};

(function () {
  var MAX_FILES = 3;
  var MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  var ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
  var files = [];

  function $(id) { return document.getElementById(id); }

  function render() {
    var list = $("upload-preview-list");
    if (!list) return;
    list.innerHTML = "";
    files.forEach(function (file, index) {
      var li = document.createElement("li");
      li.className = "upload-preview-item";

      var img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = "";

      var name = document.createElement("span");
      name.className = "upload-preview-name";
      name.textContent = file.name + " (" + Math.round(file.size / 1024) + " KB)";

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "upload-preview-remove";
      removeBtn.textContent = "Quitar";
      removeBtn.setAttribute("aria-label", "Quitar fotografía " + file.name);
      removeBtn.addEventListener("click", function () {
        files.splice(index, 1);
        render();
      });

      li.appendChild(img);
      li.appendChild(name);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
  }

  function agregarArchivos(fileList) {
    var errorEl = $("upload-error");
    var zone = $("upload-zone");
    errorEl.textContent = "";
    zone.removeAttribute("aria-invalid");

    var candidatos = Array.prototype.slice.call(fileList);
    for (var i = 0; i < candidatos.length; i++) {
      var f = candidatos[i];
      if (files.length >= MAX_FILES) {
        errorEl.textContent = "Solo puedes adjuntar hasta " + MAX_FILES + " fotografías.";
        zone.setAttribute("aria-invalid", "true");
        break;
      }
      if (ALLOWED_TYPES.indexOf(f.type) === -1) {
        errorEl.textContent = "Formato no permitido: " + f.name + ". Usa JPG, PNG o WEBP.";
        zone.setAttribute("aria-invalid", "true");
        continue;
      }
      if (f.size > MAX_SIZE) {
        errorEl.textContent = "El archivo " + f.name + " supera el límite de 5 MB.";
        zone.setAttribute("aria-invalid", "true");
        continue;
      }
      files.push(f);
    }
    render();
  }

  function init() {
    var zone = $("upload-zone");
    var input = $("upload-input");
    if (!zone || !input) return;

    zone.addEventListener("click", function () { input.click(); });
    zone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      zone.classList.add("is-dragover");
    });
    zone.addEventListener("dragleave", function () {
      zone.classList.remove("is-dragover");
    });
    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      zone.classList.remove("is-dragover");
      if (e.dataTransfer && e.dataTransfer.files) agregarArchivos(e.dataTransfer.files);
    });
    input.addEventListener("change", function () {
      agregarArchivos(input.files);
      input.value = "";
    });
  }

  AV.modules.getUploadedFiles = function () { return files.slice(); };
  AV.modules.resetUploads = function () {
    files = [];
    render();
  };

  document.addEventListener("DOMContentLoaded", init);
})();