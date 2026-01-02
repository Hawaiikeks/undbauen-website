const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

// Statische Dateien aus dem aktuellen Verzeichnis servieren
app.use(express.static(__dirname));

// Fallback für die App-Seiten (falls man direkt /app/dashboard aufrufen will ohne .html)
// Aber da es eine statische Seite ist, lassen wir es erst mal simpel.
// Express.static kümmert sich um index.html im Root.

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

