# …undbauen - Community Platform

Eine vollständige Community-Plattform für Fachleute aus Architektur, Ingenieurwesen und Bauwesen.

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Schnellstart](#schnellstart)
3. [Projektstruktur](#projektstruktur)
4. [Features](#features)
5. [Architektur](#architektur)
6. [Entwicklung](#entwicklung)
7. [Dokumentation](#dokumentation)
8. [Deployment](#deployment)

---

## Überblick

Die **…undbauen** Website ist eine **reine Landing Page** (öffentliche Startseite). Login, Member-Bereich und Backoffice wurden entfernt.

### Technologie-Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (ES6 Modules)
- **Storage**: localStorage (Development), vorbereitet für Backend-Integration
- **Editor**: Quill.js für Rich Text Editing
- **Charts**: Chart.js für Datenvisualisierung
- **Server**: Node.js (serve) für statische Dateien (Development)

---

## Schnellstart

### Voraussetzungen

- **Node.js** 18 oder höher (für lokalen Server)
- Moderner Browser (Chrome, Firefox, Safari, Edge)

### Lokale Entwicklung

1. **Repository klonen:**
```bash
git clone <repository-url>
cd undbauen-website
```

2. **Abhängigkeiten installieren:**
```bash
npm install
```

3. **Server starten:**
```bash
npm start
# oder: npm run dev
# Windows: .\scripts\START_SERVER.ps1 oder .\scripts\START_SERVER.bat
```

4. **Browser öffnen:**
```
http://localhost:8000
```

---

## Projektstruktur

```
undbauen-website/
│
├── index.html                    # Öffentliche Landing Page
│
├── assets/
│   ├── css/                      # Stylesheets
│   │   ├── base.css              # Basis-Styles
│   │   ├── public.css            # Public/Landing Styles
│   │   ├── components.css        # Component Styles
│   │   └── ...
│   │
│   └── js/                       # JavaScript
│       ├── public.js            # Landing Page (Navigation, Hero, Termine, Kontakt)
│       ├── components/           # UI-Komponenten (Toast, HoverCard, Search, …)
│       ├── services/             # API-Client, Storage, Meta-Tags, …
│
├── docs/                         # Dokumentation
│   └── ...                      # Weitere Dokumentation
│
└── scripts/                      # Skripte
    └── START_SERVER.ps1         # Server-Start-Script
```

---

## Features (Landing Page)

- ✅ **Startseite** – Hero, Mission, Netzwerk, Themen, Termine, FAQ, Kontakt
- ✅ **Navigation** – Scroll-Navigation, Mobile-Menü
- ✅ **Suche** (Ctrl+K) – Globale Suche (öffentliche Inhalte)
- ✅ **Responsive Design** – Mobile-first
- ✅ **Accessibility** – ARIA, Tastatur, Skip-Link
- ✅ **Theme** – Dark/Light (z. B. im Impressum)

---

## Architektur

### Router-System

Die Website verwendet ein automatisiertes Router-System:

1. **HTML-Datei** hat `data-page` Attribut
2. **HTML** lädt nur `app.js`
3. **app.js** Router lädt Page-Modul aus `pages/index.js`
4. **Page-Modul** rendert die Seite

**Beispiel:**
```html
<!-- app/dashboard.html -->
<body data-page="dashboard">
  <script src="../assets/js/app.js"></script>
</body>
```

```javascript
// assets/js/app.js
const routeMap = {
  'dashboard': 'renderDashboard',
  'tickets': 'renderTickets',
  // ...
};
const renderFunction = routeMap[page];
await pageModules[renderFunction]();
```

### Authentifizierung

- **Guard-System**: Prüft Login und Berechtigungen
- **Rollen**: guest, member, editor, moderator, admin
- **Route-Protection**: Automatische Weiterleitung bei fehlenden Berechtigungen

### Datenfluss

```
Benutzer öffnet Seite
    ↓
Browser lädt HTML-Datei
    ↓
HTML lädt app.js
    ↓
app.js prüft Authentifizierung
    ↓
Router lädt Page-Modul
    ↓
Page-Modul holt Daten vom API
    ↓
Seite wird gerendert
```

---

## Entwicklung

### Code-Organisation

- **Pages** (`assets/js/pages/`) - Page-spezifische Logik
- **Components** (`assets/js/components/`) - Wiederverwendbare UI-Komponenten
- **Services** (`assets/js/services/`) - Business Logic & Repositories
### Best Practices

- ✅ ES6 Modules verwenden
- ✅ Try-Catch für async Operations
- ✅ Validation für alle Inputs
- ✅ ARIA-Attribute für Accessibility
- ✅ Konsistentes Error-Handling
- ✅ JSDoc-Kommentare für Funktionen

### Neue Seite hinzufügen

1. **HTML-Datei erstellen:**
```html
<!-- app/neue-seite.html -->
<body data-page="neue-seite">
  <main id="main-content"></main>
  <script src="../assets/js/app.js"></script>
</body>
```

2. **Route in router.js hinzufügen:**
```javascript
'/app/neue-seite.html': { page: 'neue-seite', role: 'member' }
```

3. **Route-Mapping in app.js hinzufügen:**
```javascript
const routeMap = {
  // ...
  'neue-seite': 'renderNeueSeite'
};
```

4. **Render-Funktion erstellen:**
```javascript
// assets/js/pages/neue-seite.js
export async function renderNeueSeite() {
  const html = `<div class="card"><h2>Neue Seite</h2></div>`;
  document.querySelector('main').innerHTML = html;
}
```

5. **In pages/index.js exportieren:**
```javascript
export { renderNeueSeite } from './neue-seite.js';
```

### Komponente verwenden

```javascript
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

// Toast anzeigen
toast.success('Erfolgreich gespeichert!');

// Modal öffnen
modal.open({
  title: 'Bestätigung',
  content: 'Sind Sie sicher?',
  onConfirm: () => { /* ... */ }
});
```

---

## Dokumentation

### Hauptdokumentation

- **[DETAILLIERTE_WEBSITE_ERKLAERUNG.md](./DETAILLIERTE_WEBSITE_ERKLAERUNG.md)** - Detaillierte Erklärung der Website-Struktur
- **[ARCHITEKTUR_DOKUMENTATION.md](./ARCHITEKTUR_DOKUMENTATION.md)** - Vollständige Architektur-Dokumentation
- **[VERSTAENDLICHKEIT_BEWERTUNG.md](./VERSTAENDLICHKEIT_BEWERTUNG.md)** - Bewertung der Verständlichkeit für neue Entwickler

### Entwickler-Anleitungen

- **[FINAL_ANALYSE_8_10.md](./FINAL_ANALYSE_8_10.md)** - Code-Qualitäts-Analyse
- **[TYPESCRIPT_MIGRATION_PLAN.md](./TYPESCRIPT_MIGRATION_PLAN.md)** - TypeScript-Migrationsplan
---

---

## Deployment

### Development

```bash
npm install
npm start
```
Server läuft auf http://localhost:8000

### Production (vorbereitet)

Die Anwendung ist vorbereitet für Backend-Integration:

1. **API Endpoints** erstellen
2. **Repositories** anpassen (BackendRepository)
3. **File Storage** migrieren (S3)
4. **Authentication** implementieren (JWT)

Siehe `backend/README.md` für Backend-Details.

---

## Rollen

- **guest**: Nicht eingeloggt
- **member**: Standard-Mitglied
- **editor**: Kann Inhalte erstellen/bearbeiten
- **moderator**: Kann Tickets/Reports verwalten
- **admin**: Vollzugriff

---

## Bekannte Einschränkungen

- ⚠️ localStorage hat Größenlimit (~5-10MB)
- ⚠️ Base64 File Storage ist ineffizient (nur für Development)
- ⚠️ Keine echte Backend-Integration (noch)

---

## Lizenz

Proprietär - Alle Rechte vorbehalten

---

## Version

**Version:** 1.0.0  
**Status:** Production Ready  
**Letzte Aktualisierung:** 2024

---

## Support

Bei Fragen oder Problemen siehe die [Dokumentation](./DETAILLIERTE_WEBSITE_ERKLAERUNG.md) oder erstelle ein Issue.
