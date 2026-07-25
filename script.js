// File da escludere dal sommario
const EXCLUDED_FILES = ["README.md", "readme.md"];

// Verifica che il manifest contenga solo nomi di file Markdown locali
function isValidDocumentName(file) {
    return typeof file === "string"
        && file.endsWith(".md")
        && !EXCLUDED_FILES.includes(file)
        && !file.includes("/")
        && !file.includes("\\");
}

// Carica dal manifest la whitelist dei documenti consentiti
async function loadAllowedDocuments() {
    const response = await fetch("manifest.json");

    if (!response.ok) {
        throw new Error("manifest.json non trovato");
    }

    const manifest = await response.json();

    if (!manifest || !Array.isArray(manifest.documents)) {
        throw new Error("manifest.json non valido");
    }

    return manifest.documents.filter(isValidDocumentName);
}

// Converte il nome file in un titolo leggibile
function formatTitle(filename) {
    return filename
        .replace(".md", "")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

// Mostra un messaggio nel sommario usando solo contenuto testuale
function showSummaryMessage(summary, title, messages) {
    const errorBox = document.createElement("div");
    const heading = document.createElement("h2");

    errorBox.className = "error-box";
    heading.textContent = title;
    errorBox.appendChild(heading);

    messages.forEach(message => {
        const paragraph = document.createElement("p");
        paragraph.textContent = message;
        errorBox.appendChild(paragraph);
    });

    summary.replaceChildren(errorBox);
}

// Mostra un messaggio testuale nel visualizzatore
function showViewerMessage(content, title, message) {
    const heading = document.createElement("h1");
    const paragraph = document.createElement("p");

    heading.textContent = title;
    paragraph.textContent = message;
    content.replaceChildren(heading, paragraph);
}

// Genera il sommario nella home
async function loadSummary() {
    const summary = document.getElementById("summary");

    if (!summary) return;

    summary.setAttribute("aria-busy", "true");

    try {
        const files = await loadAllowedDocuments();

        if (files.length === 0) {
            showSummaryMessage(
                summary,
                "Nessun documento disponibile",
                ["Aggiungi almeno un file .md nel manifest.json."]
            );
            return;
        }

        summary.replaceChildren();

        files.forEach(file => {
            const card = document.createElement("a");
            const icon = document.createElement("div");
            const heading = document.createElement("h2");
            const description = document.createElement("p");

            card.className = "card";
            card.href = `viewer.html?file=${encodeURIComponent(file)}`;

            icon.className = "icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = "📘";
            heading.textContent = formatTitle(file);
            description.textContent = "Apri questa guideline";

            card.append(icon, heading, description);
            summary.appendChild(card);
        });

    } catch (error) {
        showSummaryMessage(
            summary,
            "Errore",
            [
                "Impossibile caricare il sommario.",
                "Controlla che esista il file manifest.json."
            ]
        );

        console.error(error);
    } finally {
        summary.setAttribute("aria-busy", "false");
    }
}

// Carica un markdown nella pagina viewer
async function loadViewer() {
    const content = document.getElementById("markdown-content");

    if (!content) return;

    content.setAttribute("aria-busy", "true");

    const params = new URLSearchParams(window.location.search);
    const file = params.get("file");

    if (!isValidDocumentName(file)) {
        showViewerMessage(
            content,
            "Documento non valido",
            "Il documento richiesto non è valido."
        );
        content.setAttribute("aria-busy", "false");
        return;
    }

    try {
        const allowedDocuments = await loadAllowedDocuments();

        if (!allowedDocuments.includes(file)) {
            showViewerMessage(
                content,
                "Documento non valido",
                "Il documento richiesto non è presente nel manifest."
            );
            return;
        }

        const response = await fetch(file);

        if (!response.ok) {
            throw new Error("File markdown non trovato");
        }

        const markdown = await response.text();
        const html = marked.parse(markdown);

        content.innerHTML = DOMPurify.sanitize(html);
        document.title = formatTitle(file);

    } catch (error) {
        showViewerMessage(
            content,
            "Documento non trovato",
            `Impossibile caricare il file ${file}.`
        );

        console.error(error);
    } finally {
        content.setAttribute("aria-busy", "false");
    }
}

// Avvio
document.addEventListener("DOMContentLoaded", () => {
    loadSummary();
    loadViewer();
});
