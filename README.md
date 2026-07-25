# manuali_vari

Archivio statico di documenti Markdown.

## Avvio locale

Avvia un server HTTP dalla cartella del progetto:

```bash
python3 -m http.server 8000
```

Apri `http://localhost:8000/` nel browser.

## Aggiungere un documento

1. Aggiungi il nuovo file `.md` nella cartella principale del progetto.
2. Inserisci il suo nome nell'array `documents` di `manifest.json`:

```json
{
  "documents": [
    "tesi_triennale.md",
    "nuovo_documento.md"
  ]
}
```
