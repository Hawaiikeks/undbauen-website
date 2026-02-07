# Entwickler-Anleitung: …undbauen Website

## 📋 Inhaltsverzeichnis

1. [Erste Schritte](#erste-schritte)
2. [Projektstruktur verstehen](#projektstruktur-verstehen)
3. [Code-Patterns](#code-patterns)
4. [Häufige Aufgaben](#häufige-aufgaben)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Erste Schritte

### Voraussetzungen

- Python 3.x
- Moderner Browser
- Git
- Code-Editor (VS Code empfohlen)

### Setup

1. **Repository klonen:**
```bash
git clone <repository-url>
cd undbauen-website
```

2. **Server starten:**
```bash
python -m http.server 8000
```

3. **Browser öffnen:**
```
http://localhost:8000
```

### Erste Änderung

1. Öffne `app/dashboard.html`
2. Ändere den Titel
3. Lade die Seite neu
4. Sieh die Änderung

---

## Projektstruktur verstehen

### Die drei Bereiche

1. **Öffentliche Website** (`index.html`)
   - Lädt `assets/js/public.js`
   - Für alle Besucher sichtbar

2. **Member Area** (`/app/`)
   - Lädt `assets/js/app.js`
   - Nur für eingeloggte Mitglieder

3. **Backoffice** (`/backoffice/`)
   - Lädt `assets/js/app.js`
   - Nur für Admins/Moderatoren

### JavaScript-Struktur

```
assets/js/
├── app.js              # Haupt-App (Router, Shell)
├── pages/              # Page-spezifische Logik
│   ├── index.js        # Barrel Export
│   ├── dashboard.js    # Dashboard-Rendering
│   └── ...
├── components/         # Wiederverwendbare Komponenten
│   ├── sidebar.js      # Sidebar
│   ├── toast.js        # Toast-Benachrichtigungen
│   └── ...
└── services/           # Business Logic
    ├── apiClient.js    # API-Schnittstelle
    ├── router.js       # Routing
    └── ...
```

---

## Code-Patterns

### Rendering-Pattern

**Alle Seiten folgen diesem Muster:**

```javascript
// assets/js/pages/dashboard.js
export async function renderDashboard() {
  // 1. Hole Daten
  const user = api.me();
  const events = await api.getEvents();
  
  // 2. Erstelle HTML
  const html = `
    <div class="card">
      <h2>Willkommen, ${user.name}!</h2>
      <p>Sie haben ${events.length} Termine</p>
    </div>
  `;
  
  // 3. Füge HTML hinzu
  document.querySelector('main').innerHTML = html;
}
```

### Router-Pattern

**Router verwendet Route-Mapping:**

```javascript
// assets/js/app.js
const routeMap = {
  'dashboard': 'renderDashboard',
  'tickets': 'renderTickets',
  // ...
};

const page = document.body.dataset.page; // "dashboard"
const renderFunction = routeMap[page]; // "renderDashboard"
await pageModules[renderFunction](); // Ruft renderDashboard() auf
```

### Error-Handling-Pattern

**Konsistentes Error-Handling:**

```javascript
import { handleError } from '../services/errorHandler.js';

try {
  // Code
} catch (error) {
  handleError(error, { context: 'router', page: 'dashboard' });
}
```

---

## Häufige Aufgaben

### Neue Seite hinzufügen

Siehe [README.md](./README.md#neue-seite-hinzufügen)

### Komponente erstellen

1. **Komponente erstellen:**
```javascript
// assets/js/components/meine-komponente.js
export function renderMeineKomponente(data) {
  return `
    <div class="meine-komponente">
      <h3>${data.title}</h3>
      <p>${data.content}</p>
    </div>
  `;
}
```

2. **Komponente verwenden:**
```javascript
import { renderMeineKomponente } from '../components/meine-komponente.js';

const html = renderMeineKomponente({ title: 'Test', content: 'Inhalt' });
document.querySelector('#container').innerHTML = html;
```

### API verwenden

```javascript
import { api } from '../services/apiClient.js';

// Daten holen
const user = api.me();
const events = await api.getEvents();

// Daten speichern
await api.createTicket({ title: 'Test', description: '...' });
```

### Toast-Benachrichtigung anzeigen

```javascript
import { toast } from '../components/toast.js';

toast.success('Erfolgreich gespeichert!');
toast.error('Fehler beim Speichern!');
toast.info('Information');
```

---

## Best Practices

### Code-Organisation

- ✅ Jede Seite hat ihre eigene Datei in `pages/`
- ✅ Komponenten sind wiederverwendbar in `components/`
- ✅ Business Logic in `services/`
- ✅ Tests in `tests/`

### Code-Qualität

- ✅ ES6 Modules verwenden
- ✅ JSDoc-Kommentare für Funktionen
- ✅ Konsistentes Error-Handling
- ✅ Validation für alle Inputs
- ✅ ARIA-Attribute für Accessibility

### Performance

- ✅ Dynamische Imports für Page-Module
- ✅ Lazy Loading für Bilder
- ✅ Debouncing für Search
- ✅ Caching für API-Requests

---

## Troubleshooting

### Seite lädt nicht

1. **Prüfe Browser Console:**
   - Öffne Developer Tools (F12)
   - Schaue nach Fehlern

2. **Prüfe Router:**
   - Ist `data-page` Attribut vorhanden?
   - Ist Route in `routeMap` definiert?
   - Existiert Render-Funktion?

3. **Prüfe Authentifizierung:**
   - Ist Benutzer eingeloggt?
   - Hat Benutzer die richtige Rolle?

### Komponente funktioniert nicht

1. **Prüfe Import:**
   ```javascript
   import { component } from '../components/component.js';
   ```

2. **Prüfe Verwendung:**
   - Wird Komponente richtig aufgerufen?
   - Sind alle Parameter vorhanden?

### API-Fehler

1. **Prüfe API-Client:**
   ```javascript
   const user = api.me();
   console.log('User:', user);
   ```

2. **Prüfe Error-Handler:**
   - Werden Fehler korrekt behandelt?
   - Werden Fehler geloggt?

---

## Weitere Ressourcen

- [DETAILLIERTE_WEBSITE_ERKLAERUNG.md](./DETAILLIERTE_WEBSITE_ERKLAERUNG.md) - Detaillierte Erklärung
- [ARCHITEKTUR_DOKUMENTATION.md](./ARCHITEKTUR_DOKUMENTATION.md) - Architektur-Dokumentation
- [VERSTAENDLICHKEIT_BEWERTUNG.md](./VERSTAENDLICHKEIT_BEWERTUNG.md) - Verständlichkeits-Bewertung

---

**Erstellt:** 2024  
**Status:** ✅ Aktuell
