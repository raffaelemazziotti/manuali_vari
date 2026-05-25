// File da escludere dal sommario
const EXCLUDED_FILES = ["README.md", "readme.md"];

// Converte il nome file in un titolo leggibile
function formatTitle(filename) {
    return filename
        .replace(".md", "")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Genera il sommario nella home
async function loadSummary() {
    const summary = document.getElementById("summary");

    if (!summary) return;

    try {
        const response = await fetch("manifest.json");

        if (!response.ok) {
            throw new Error("manifest.json non trovato");
        }

        const manifest = await response.json();

        const files = manifest.documents.filter(file => {
            return !EXCLUDED_FILES.includes(file);
        });

        if (files.length === 0) {
            summary.innerHTML = `
        <div class="error-box">
          <h2>Nessun documento disponibile</h2>
          <p>Aggiungi almeno un file .md nel manifest.json.</p>
        </div>
      `;
            return;
        }

        summary.innerHTML = "";

        files.forEach(file => {
            const card = document.createElement("a");

            card.className = "card";
            card.href = `viewer.html?file=${encodeURIComponent(file)}`;

            card.innerHTML = `
        <div class="icon">📘</div>
        <h2>${formatTitle(file)}</h2>
        <p>Apri questa guideline</p>
      `;

            summary.appendChild(card);
        });

    } catch (error) {
        summary.innerHTML = `
      <div class="error-box">
        <h2>Errore</h2>
        <p>Impossibile caricare il sommario.</p>
        <p>Controlla che esista il file <strong>manifest.json</strong>.</p>
      </div>
    `;

        console.error(error);
    }
}

// Carica un markdown nella pagina viewer
async function loadViewer() {
    const content = document.getElementById("markdown-content");

    if (!content) return;

    const params = new URLSearchParams(window.location.search);
    const file = params.get("file");

    if (!file || !file.endsWith(".md") || EXCLUDED_FILES.includes(file)) {
        content.innerHTML = `
      <h1>Documento non valido</h1>
      <p>Il documento richiesto non è valido.</p>
    `;
        return;
    }

    try {
        const response = await fetch(file);

        if (!response.ok) {
            throw new Error("File markdown non trovato");
        }

        const markdown = await response.text();

        content.innerHTML = marked.parse(markdown);
        document.title = formatTitle(file);

    } catch (error) {
        content.innerHTML = `
      <h1>Documento non trovato</h1>
      <p>Impossibile caricare il file <strong>${file}</strong>.</p>
    `;

        console.error(error);
    }
}

// Avvio
document.addEventListener("DOMContentLoaded", () => {
    loadSummary();
    loadViewer();
});