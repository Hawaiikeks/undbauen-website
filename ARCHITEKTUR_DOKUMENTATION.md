# Architektur-Dokumentation: …undbauen Website

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Projektstruktur](#projektstruktur)
3. [Architektur-Patterns](#architektur-patterns)
4. [Detaillierte Ordnerstruktur](#detaillierte-ordnerstruktur)
5. [Hauptdateien und deren Funktion](#hauptdateien-und-deren-funktion)
6. [Datenfluss und Kommunikation](#datenfluss-und-kommunikation)
7. [Seiten und Routen](#seiten-und-routen)
8. [Komponenten-System](#komponenten-system)
9. [Services und Repositories](#services-und-repositories)
10. [Authentifizierung und Berechtigungen](#authentifizierung-und-berechtigungen)
11. [Storage-System](#storage-system)
12. [Entwicklungs-Workflow](#entwicklungs-workflow)

---

## Überblick

Die **…undbauen** Website ist eine Community-Plattform für AEC-Profis (Architektur, Ingenieurwesen, Bauwesen). Sie besteht aus drei Hauptbereichen:

1. **Öffentliche Website** (`index.html`) - Landing Page für Besucher
2. **Member Area** (`/app/`) - Geschützter Bereich für eingeloggte Mitglieder
3. **Backoffice** (`/backoffice/`) - Admin-Bereich für Content-Management

### Technologie-Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (ES6 Modules)
- **Storage**: localStorage (Development), vorbereitet für Backend-Integration
- **Editor**: Quill.js für Rich Text Editing
- **Charts**: Chart.js für Datenvisualisierung
- **Server**: Node.js (serve) für statische Dateien (Development)

---

## Projektstruktur

```
undbauen-website/
│
├── index.html                    # Öffentliche Landing Page
├── app/                          # Member Area (geschützter Bereich)
│   ├── dashboard.html
│   ├── tickets.html
│   ├── resources.html
│   ├── knowledge.html
│   ├── termine.html
│   ├── forum.html
│   ├── nachrichten.html
│   ├── mitglieder.html
│   ├── profil.html
│   ├── einstellungen.html
│   └── monatsupdates.html
│
├── backoffice/                   # Admin-Bereich
│   ├── index.html
│   ├── inbox.html
│   ├── reports.html
│   ├── content.html
│   ├── public-pages.html
│   ├── resources.html
│   ├── knowledge.html
│   └── audit.html
│
├── assets/
│   ├── css/                      # Stylesheets
│   │   ├── base.css              # Basis-Styles (Variablen, Reset, Utilities)
│   │   ├── public.css            # Styles für öffentliche Seite
│   │   ├── app.css               # Styles für Member Area
│   │   ├── components.css        # Komponenten-Styles
│   │   ├── sidebar.css           # Sidebar-Navigation
│   │   ├── knowledge-panels.css  # Knowledge Base Styles
│   │   └── resources-toolbox.css # Resources Styles
│   │
│   └── js/                       # JavaScript Code
│       ├── app.js                # Haupt-App für Member Area
│       ├── public.js             # Haupt-App für öffentliche Seite
│       │
│       ├── components/           # Wiederverwendbare UI-Komponenten
│       │   ├── sidebar.js
│       │   ├── breadcrumbs.js
│       │   ├── toast.js
│       │   ├── modal.js
│       │   ├── search.js
│       │   └── ... (weitere Komponenten)
│       │
│       ├── pages/                # Page-spezifische Logik
│       │   ├── dashboard.js
│       │   ├── tickets.js
│       │   ├── resources.js
│       │   ├── knowledge.js
│       │   └── ... (weitere Seiten)
│       │
│       ├── services/             # Business Logic & Services
│       │   ├── apiClient.js      # Zentrale API-Schnittstelle
│       │   ├── storageAdapter.js # localStorage-Adapter (MVP)
│       │   ├── router.js         # Routing-Logik
│       │   ├── authGuard.js      # Berechtigungsprüfung
│       │   └── repositories/     # Datenzugriffsschicht
│       │       ├── userRepository.js
│       │       ├── ticketRepository.js
│       │       └── ... (weitere Repositories)
│       │
│       ├── seed/                 # Demo-Daten
│       │   └── demoData.js
│       │
│       └── utils/                # Utility-Funktionen
│           ├── domHelpers.js
│           └── buttonHelpers.js
│
├── config/                       # Konfigurationsdateien
├── docs/                         # Dokumentation
└── scripts/                      # Build/Deployment-Skripte
    ├── START_SERVER.ps1
    └── START_SERVER.bat
```

---

## Architektur-Patterns

### 1. **Modularer Aufbau (ES6 Modules)**

Die gesamte Anwendung verwendet ES6 Module für saubere Trennung von Code:

```javascript
// Beispiel: Import in app.js
import { api } from "./services/apiClient.js";
import { breadcrumbs } from "./components/breadcrumbs.js";
```

### 2. **Repository Pattern**

Datenzugriff erfolgt über Repositories, die eine einheitliche API bereitstellen:

```javascript
// Beispiel: Ticket Repository
import { ticketRepository } from './services/repositories/ticketRepository.js';
const tickets = ticketRepository.getAll();
```

### 3. **Service Layer**

Business-Logik ist in Services gekapselt:
- `apiClient.js` - Zentrale API-Schnittstelle
- `storageAdapter.js` - Datenpersistierung (localStorage)
- `router.js` - Routing
- `authGuard.js` - Authentifizierung & Berechtigungen

### 4. **Component-Based UI**

Wiederverwendbare UI-Komponenten:
- Sidebar Navigation
- Modals
- Toast Notifications
- Breadcrumbs
- Search

### 5. **Page-Specific Logic**

Jede Seite hat ihre eigene Logik-Datei in `assets/js/pages/`:
- `dashboard.js` - Dashboard-Logik
- `tickets.js` - Tickets-Verwaltung
- `resources.js` - Resources-Verwaltung

---

## Detaillierte Ordnerstruktur

### `/` (Root-Verzeichnis)

**`index.html`**
- Öffentliche Landing Page
- Enthält alle öffentlichen Sektionen (Hero, Netzwerk, Termine, etc.)
- Lädt `assets/js/public.js` als Haupt-Script

### `/app/` - Member Area

Alle Seiten für eingeloggte Mitglieder:

| Datei | Beschreibung | Lädt Script |
|-------|--------------|-------------|
| `dashboard.html` | Übersichts-Dashboard | `assets/js/app.js` → `pages/dashboard.js` |
| `tickets.html` | Ideenbox / Tickets | `assets/js/app.js` → `pages/tickets.js` |
| `resources.html` | Dateien & Links | `assets/js/app.js` → `pages/resources.js` |
| `knowledge.html` | Knowledge Base | `assets/js/app.js` → `pages/knowledge.js` |
| `termine.html` | Events & Termine | `assets/js/app.js` → `pages/events.js` |
| `forum.html` | Diskussionsforum | `assets/js/app.js` → `pages/forum.js` |
| `nachrichten.html` | Nachrichtensystem | `assets/js/app.js` → `pages/messages.js` |
| `mitglieder.html` | Mitglieder-Übersicht | `assets/js/app.js` → `pages/members.js` |
| `profil.html` | Eigenes Profil | `assets/js/app.js` → `pages/myProfile.js` |
| `einstellungen.html` | Einstellungen | `assets/js/app.js` → `pages/settings.js` |
| `monatsupdates.html` | Monatsupdates | `assets/js/app.js` → `pages/monatsupdates.js` |

**Gemeinsame Struktur aller `/app/` Seiten:**

```html
<!doctype html>
<html lang="de">
<head>
  <!-- Meta Tags, CSS -->
  <link rel="stylesheet" href="../assets/css/base.css"/>
  <link rel="stylesheet" href="../assets/css/app.css"/>
  <link rel="stylesheet" href="../assets/css/sidebar.css"/>
</head>
<body data-page="dashboard">  <!-- Wichtig: data-page Attribut -->
  <div id="sidebarContainer"></div>  <!-- Sidebar wird per JS eingefügt -->
  <div id="mainLayout" class="main-layout">
    <header class="appHeader">...</header>
    <main id="main-content">...</main>
  </div>
  <script type="module" src="../assets/js/app.js"></script>
</body>
</html>
```

### `/backoffice/` - Admin-Bereich

Admin-Seiten für Content-Management:

| Datei | Beschreibung | Benötigte Rolle |
|-------|--------------|-----------------|
| `index.html` | Backoffice Dashboard | editor, moderator, admin |
| `inbox.html` | Ticket-Inbox | moderator, admin |
| `reports.html` | Reports-Verwaltung | moderator, admin |
| `content.html` | Content-Management | editor, moderator, admin |
| `public-pages.html` | Öffentliche Seiten bearbeiten | editor, moderator, admin |
| `resources.html` | Resources verwalten | editor, moderator, admin |
| `knowledge.html` | Knowledge Base verwalten | editor, moderator, admin |
| `audit.html` | Audit-Log | admin |

### `/assets/css/` - Stylesheets

| Datei | Zweck | Verwendung |
|------|------|------------|
| `base.css` | Basis-Styles, CSS-Variablen, Reset, Utilities | Alle Seiten |
| `public.css` | Styles für öffentliche Seite | `index.html` |
| `app.css` | Styles für Member Area | Alle `/app/` Seiten |
| `components.css` | Komponenten-Styles (Buttons, Cards, etc.) | Alle Seiten |
| `sidebar.css` | Sidebar-Navigation | Member Area & Backoffice |
| `knowledge-panels.css` | Knowledge Base spezifische Styles | Knowledge-Seiten |
| `resources-toolbox.css` | Resources spezifische Styles | Resources-Seiten |

**CSS-Architektur:**
- CSS-Variablen für Theming (Light/Dark Mode)
- Utility-Klassen für häufige Patterns
- Komponenten-basierte Styles
- Responsive Design mit Mobile-First Ansatz

### `/assets/js/` - JavaScript Code

#### **Hauptdateien**

**`app.js`** (4332 Zeilen)
- Haupt-Entry-Point für Member Area
- Initialisiert Authentifizierung (`guard()`)
- Setzt Shell (Header, Sidebar, Theme)
- Router für Seiten-spezifische Logik
- Lädt entsprechende Page-Module basierend auf `data-page` Attribut

**`public.js`** (1587 Zeilen)
- Haupt-Entry-Point für öffentliche Seite
- Rendert Netzwerk-Slider, Events, Updates, etc.
- Handhabt Auth-Modal
- Global Search (Strg+K)

#### **`/components/` - UI-Komponenten**

Wiederverwendbare Komponenten:

| Komponente | Datei | Funktion |
|------------|------|----------|
| Sidebar | `sidebar.js` | Navigation für Member Area |
| Breadcrumbs | `breadcrumbs.js` | Breadcrumb-Navigation |
| Toast | `toast.js` | Toast-Benachrichtigungen |
| Modal | `confirmModal.js`, `successModal.js`, etc. | Modals für Bestätigungen |
| Search | `search.js` | Globale Suche (Strg+K) |
| Rich Text Editor | `richTextEditor.js` | Quill.js Wrapper |
| Icons | `icons.js` | Icon-System |
| Avatar Generator | `avatarGenerator.js` | Avatar-Generierung |
| Charts | `chartRenderer.js` | Chart.js Wrapper |
| Lazy Load | `lazyLoad.js` | Lazy Loading für Bilder |
| Notification Bell | `notificationBell.js` | Benachrichtigungs-Bell |

**Beispiel: Komponente verwenden**

```javascript
// In einer Page-Datei
import { toast } from '../components/toast.js';
toast.success('Erfolgreich gespeichert!');
```

#### **`/pages/` - Page-spezifische Logik**

Jede Seite hat ihre eigene Logik-Datei:

| Seite | Datei | Hauptfunktionen |
|-------|-------|-----------------|
| Dashboard | `dashboard.js` | Übersicht, KPIs, Widgets |
| Tickets | `tickets.js` | Ticket-Erstellung, Liste, Details |
| Resources | `resources.js` | Resource-Verwaltung, Upload |
| Knowledge | `knowledge.js` | Knowledge Base Navigation |
| Knowledge Obsidian | `knowledgeObsidian.js` | Obsidian-ähnliche Ansicht |
| Resources Toolbox | `resourcesToolbox.js` | Toolbox-Ansicht für Resources |
| Events | `events.js` | Event-Verwaltung, Buchungen |
| Forum | `forum.js` | Forum-Navigation, Threads |
| Forum Category | `forumCategory.js` | Kategorie-Ansicht |
| Forum Thread | `forumThread.js` | Thread-Details, Posts |
| Messages | `messages.js` | Nachrichtensystem |
| Inbox | `inbox.js` | Backoffice Inbox |
| Members | `members.js` | Mitglieder-Übersicht |
| Member Profile | `memberProfile.js` | Profil-Ansicht |
| My Profile | `myProfile.js` | Eigenes Profil bearbeiten |
| Monatsupdates | `monatsupdates.js` | Updates anzeigen |
| Admin | `admin.js` | Admin-Funktionen |
| Knowledge Admin | `knowledgeAdmin.js` | Knowledge Base verwalten |
| Resources Admin | `resourcesAdmin.js` | Resources verwalten |
| Tools Admin | `toolsAdmin.js` | Tools verwalten |
| Public Pages Editor | `publicPagesEditor.js` | Öffentliche Seiten bearbeiten |
| Reports | `reports.js` | Reports verwalten |
| Audit | `audit.js` | Audit-Log anzeigen |

**Wie Pages geladen werden:**

```javascript
// In app.js (Zeile ~4242)
const page = document.body.dataset.page; // z.B. "dashboard"

// Dynamischer Import basierend auf Seite
if (page === 'dashboard') {
  const { initDashboard } = await import('./pages/dashboard.js');
  initDashboard();
}
```

#### **`/services/` - Services & Business Logic**

**Kern-Services:**

| Service | Datei | Funktion |
|---------|-------|----------|
| API Client | `apiClient.js` | Zentrale API-Schnittstelle (exportiert `api`) |
| Storage Adapter | `storageAdapter.js` | localStorage-Adapter (MVP Backend) |
| Router | `router.js` | Route-Definitionen und Navigation |
| Auth Guard | `authGuard.js` | Berechtigungsprüfung |
| File Storage | `fileStorage.js` | Datei-Upload/Download |
| Validation | `validation.js` | Input-Validierung |
| Logger | `logger.js` | Logging-System |
| Error Handler | `errorHandler.js` | Fehlerbehandlung |
| Security | `security.js` | Sicherheits-Funktionen |
| Rate Limiter | `rateLimiter.js` | Rate Limiting |
| Offline Manager | `offlineManager.js` | Offline-Funktionalität |
| Meta Tags | `metaTags.js` | SEO Meta Tags |
| Monitoring | `monitoring.js` | Performance-Monitoring |

**`/services/repositories/` - Datenzugriffsschicht**

Repositories kapseln Datenzugriff:

| Repository | Datei | Verwaltet |
|------------|-------|-----------|
| Base Repository | `baseRepository.js` | Basis-Funktionalität für alle Repositories |
| User Repository | `userRepository.js` | Benutzer-Daten |
| Ticket Repository | `ticketRepository.js` | Tickets |
| Resource Repository | `resourceRepository.js` | Resources |
| Knowledge Repository | `knowledgeRepository.js` | Knowledge Base |
| Tool Repository | `toolRepository.js` | Tools |
| Notification Repository | `notificationRepository.js` | Benachrichtigungen |
| Report Repository | `reportRepository.js` | Reports |
| Audit Log Repository | `auditLogRepository.js` | Audit-Logs |
| Categories Repository | `categoriesRepository.js` | Kategorien |
| Topics Repository | `topicsRepository.js` | Topics/Themen |
| Relations Repository | `relationsRepository.js` | Beziehungen (z.B. Knowledge Relations) |
| Page Repository | `pageRepository.js` | CMS-Seiten |
| Storage Repository | `storageRepository.js` | Storage-Operationen |

**Repository Pattern Beispiel:**

```javascript
// In einer Page-Datei
import { ticketRepository } from '../services/repositories/ticketRepository.js';

// Tickets abrufen
const tickets = ticketRepository.getAll();

// Ticket erstellen
const newTicket = ticketRepository.create({
  title: 'Neue Idee',
  description: 'Beschreibung...',
  category: 'feature'
});
```

---

## Hauptdateien und deren Funktion

### 1. `index.html` - Öffentliche Landing Page

**Struktur:**
- Hero-Section mit Animation
- Mission-Section
- Innovationsabend-Section
- Netzwerk-Section (Slider)
- Themen-Section
- Termine-Section
- Updates-Section
- Publikationen-Section
- Über uns-Section
- Testimonials
- Partner
- FAQ
- Kontakt
- Legal (Impressum, Datenschutz)

**Scripts:**
```html
<script type="module" src="assets/js/public.js?v=4.2.0"></script>
```

**Initialisierung:**
- `public.js` wird geladen
- Rendert alle Sektionen dynamisch
- Initialisiert Global Search
- Handhabt Auth-Modal

### 2. `assets/js/app.js` - Member Area Entry Point

**Hauptfunktionen:**

1. **Authentifizierung (`guard()`)**
   ```javascript
   function guard() {
     if (!api.isLoggedIn()) {
       window.location.href = '../index.html';
       return false;
     }
     // Route-Berechtigung prüfen
     const guardResult = guardRoute(path);
     return guardResult.allowed;
   }
   ```

2. **Shell Setup (`setShell()`)**
   - Theme initialisieren
   - User-Info anzeigen
   - Sidebar rendern
   - Logout-Handler

3. **Router (`initApp()`)**
   ```javascript
   const page = document.body.dataset.page;
   // Dynamischer Import der Page-Logik
   if (page === 'dashboard') {
     const { initDashboard } = await import('./pages/dashboard.js');
     initDashboard();
   }
   ```

4. **Komponenten-Initialisierung**
   - Breadcrumbs
   - Rich Text Editor (Quill)
   - Sidebar Updates

### 3. `assets/js/public.js` - Öffentliche Seite Entry Point

**Hauptfunktionen:**

1. **Rendering-Funktionen**
   - `renderNetwork()` - Netzwerk-Slider
   - `renderEvents()` - Events-Grid
   - `renderUpdates()` - Updates-Timeline
   - `renderPublications()` - Publikationen-Liste
   - `renderTestimonials()` - Testimonials
   - `renderPartners()` - Partner-Logos
   - `renderFAQ()` - FAQ-Accordion

2. **Auth-Modal**
   - Login/Register/Forgot Password Tabs
   - Form-Handling

3. **Global Search**
   - Strg+K Shortcut
   - Such-Overlay

4. **Event Details Modal**
   - Zeigt Event-Details beim Klick

### 4. `assets/js/services/storageAdapter.js` - Datenpersistierung

**Funktion:**
- MVP "Backend" über localStorage
- Sauberer API-Layer (UI greift NICHT direkt auf localStorage zu)
- Alle Datenoperationen gehen über diesen Adapter

**Wichtige Funktionen:**

```javascript
// User-Management
api.register(email, password, name)
api.login(email, password)
api.logout()
api.me() // Aktueller User

// Daten-Operationen
api.createTicket(data)
api.getTicket(id)
api.listTickets()
api.updateTicket(id, data)
api.deleteTicket(id)

// Ähnlich für: Events, Resources, Knowledge, Forum, Messages, etc.
```

**Storage-Keys:**
```javascript
const K = {
  users: "users",
  session: "session",
  events: "events",
  forumThreads: "forum:threads",
  resources: "resources",
  knowledge: "knowledge",
  // ... weitere Keys
};
```

### 5. `assets/js/services/apiClient.js` - API-Schnittstelle

**Funktion:**
- Zentrale API-Schnittstelle
- Exportiert `api` Objekt
- Verwendet aktuell `storageAdapter` (localStorage)
- Vorbereitet für Backend-Integration (kann auf `httpAdapter` umgestellt werden)

```javascript
import { storageAdapter } from './storageAdapter.js';
export const api = storageAdapter;
```

**Verwendung:**
```javascript
import { api } from './services/apiClient.js';

// Überall im Code
const user = api.me();
const tickets = api.listTickets();
```

### 6. `assets/js/services/router.js` - Routing

**Route-Definitionen:**

```javascript
export const routes = {
  public: {
    '/': { page: 'public', role: null },
    '/index.html': { page: 'public', role: null }
  },
  member: {
    '/app/dashboard.html': { page: 'dashboard', role: 'member' },
    '/app/tickets.html': { page: 'tickets', role: 'member' },
    // ...
  },
  backoffice: {
    '/backoffice/index.html': { page: 'backoffice-dashboard', role: ['editor', 'moderator', 'admin'] },
    // ...
  }
};
```

**Funktionen:**
- `getCurrentPath()` - Aktueller Pfad
- `getCurrentRoute()` - Route-Info für aktuellen Pfad
- `navigateTo(path)` - Navigation mit Guard-Check

### 7. `assets/js/services/authGuard.js` - Berechtigungen

**Funktionen:**

```javascript
// Prüft ob User berechtigt ist
guardRoute(path) // { allowed: boolean, redirect?: string }

// Prüft ob User Rolle hat
hasRequiredRole(role) // boolean

// Prüft ob Route existiert
getRequiredRoleForPath(path) // role | null
```

**Rollen-Hierarchie:**
- `guest` - Nicht eingeloggt
- `member` - Standard-Mitglied
- `editor` - Content erstellen/bearbeiten
- `moderator` - Tickets/Reports verwalten
- `admin` - Vollzugriff

---

## Datenfluss und Kommunikation

### Datenfluss-Diagramm

```
┌─────────────┐
│   HTML Page │
│  (index.html│
│  /app/*.html)│
└──────┬──────┘
       │
       │ lädt
       ▼
┌─────────────┐
│  app.js /   │
│  public.js  │
└──────┬──────┘
       │
       │ importiert
       ▼
┌─────────────┐      ┌──────────────┐
│  Pages/     │─────▶│  Components/ │
│  dashboard.js│      │  sidebar.js   │
└──────┬──────┘      └──────────────┘
       │
       │ verwendet
       ▼
┌─────────────┐
│  apiClient  │
│  (api)      │
└──────┬──────┘
       │
       │ delegiert an
       ▼
┌─────────────┐      ┌──────────────┐
│ storage     │─────▶│ Repositories │
│ Adapter     │      │ ticketRepo    │
└──────┬──────┘      └──────────────┘
       │
       │ speichert in
       ▼
┌─────────────┐
│ localStorage│
└─────────────┘
```

### Beispiel: Ticket erstellen

1. **User klickt auf "Ticket erstellen"** (`tickets.html`)
2. **Form wird ausgefüllt und abgesendet**
3. **`pages/tickets.js`** verarbeitet Submit:
   ```javascript
   const ticketData = {
     title: form.title.value,
     description: form.description.value,
     category: form.category.value
   };
   ```
4. **API-Call über `apiClient`:**
   ```javascript
   const newTicket = api.createTicket(ticketData);
   ```
5. **`storageAdapter`** speichert in localStorage:
   ```javascript
   const tickets = getJSON(K.tickets, []);
   tickets.push(newTicket);
   setJSON(K.tickets, tickets);
   ```
6. **UI wird aktualisiert** (Toast, Liste neu rendern)

---

## Seiten und Routen

### Öffentliche Routen

| Route | Datei | Script | Beschreibung |
|-------|-------|--------|--------------|
| `/` | `index.html` | `public.js` | Landing Page |
| `/index.html` | `index.html` | `public.js` | Landing Page (alternativ) |

### Member Area Routen

| Route | Datei | Script | Page-Modul | Rolle |
|-------|-------|--------|------------|-------|
| `/app/dashboard.html` | `app/dashboard.html` | `app.js` | `dashboard.js` | member+ |
| `/app/tickets.html` | `app/tickets.html` | `app.js` | `tickets.js` | member+ |
| `/app/resources.html` | `app/resources.html` | `app.js` | `resources.js` | member+ |
| `/app/knowledge.html` | `app/knowledge.html` | `app.js` | `knowledge.js` | member+ |
| `/app/termine.html` | `app/termine.html` | `app.js` | `events.js` | member+ |
| `/app/forum.html` | `app/forum.html` | `app.js` | `forum.js` | member+ |
| `/app/nachrichten.html` | `app/nachrichten.html` | `app.js` | `messages.js` | member+ |
| `/app/mitglieder.html` | `app/mitglieder.html` | `app.js` | `members.js` | member+ |
| `/app/profil.html` | `app/profil.html` | `app.js` | `myProfile.js` | member+ |
| `/app/einstellungen.html` | `app/einstellungen.html` | `app.js` | `settings.js` | member+ |
| `/app/monatsupdates.html` | `app/monatsupdates.html` | `app.js` | `monatsupdates.js` | member+ |

### Backoffice Routen

| Route | Datei | Script | Page-Modul | Rolle |
|-------|-------|--------|------------|-------|
| `/backoffice/index.html` | `backoffice/index.html` | `app.js` | `admin.js` | editor+ |
| `/backoffice/inbox.html` | `backoffice/inbox.html` | `app.js` | `inbox.js` | moderator+ |
| `/backoffice/reports.html` | `backoffice/reports.html` | `app.js` | `reports.js` | moderator+ |
| `/backoffice/content.html` | `backoffice/content.html` | `app.js` | `admin.js` | editor+ |
| `/backoffice/public-pages.html` | `backoffice/public-pages.html` | `app.js` | `publicPagesEditor.js` | editor+ |
| `/backoffice/resources.html` | `backoffice/resources.html` | `app.js` | `resourcesAdmin.js` | editor+ |
| `/backoffice/knowledge.html` | `backoffice/knowledge.html` | `app.js` | `knowledgeAdmin.js` | editor+ |
| `/backoffice/audit.html` | `backoffice/audit.html` | `app.js` | `audit.js` | admin |

### Wie Routen funktionieren

1. **HTML-Seite lädt** (z.B. `dashboard.html`)
2. **`data-page` Attribut** identifiziert die Seite:
   ```html
   <body data-page="dashboard">
   ```
3. **`app.js` liest `data-page`:**
   ```javascript
   const page = document.body.dataset.page; // "dashboard"
   ```
4. **Dynamischer Import** der Page-Logik:
   ```javascript
   if (page === 'dashboard') {
     const { initDashboard } = await import('./pages/dashboard.js');
     initDashboard();
   }
   ```
5. **Page-Modul initialisiert** die Seite

---

## Komponenten-System

### Sidebar (`components/sidebar.js`)

**Funktion:**
- Dynamische Navigation basierend auf User-Rolle
- Wird in `#sidebarContainer` gerendert
- Zeigt nur relevante Links für User-Rolle

**Verwendung:**
```javascript
import { initSidebar } from './components/sidebar.js';
initSidebar(userRole, currentPath);
```

**Struktur:**
- Haupt-Navigation (Dashboard, Tickets, etc.)
- Admin-Bereich (nur für editor+)
- User-Menü (Profil, Einstellungen, Logout)

### Breadcrumbs (`components/breadcrumbs.js`)

**Funktion:**
- Zeigt Navigationspfad
- Wird automatisch basierend auf Route generiert

**Verwendung:**
```javascript
import { breadcrumbs } from './components/breadcrumbs.js';
breadcrumbs.init();
```

### Toast (`components/toast.js`)

**Funktion:**
- Benachrichtigungen anzeigen
- Success, Error, Info, Warning

**Verwendung:**
```javascript
import { toast } from './components/toast.js';
toast.success('Erfolgreich gespeichert!');
toast.error('Fehler beim Speichern');
```

### Search (`components/search.js`)

**Funktion:**
- Globale Suche (Strg+K)
- Durchsucht alle Inhalte (Tickets, Resources, Knowledge, etc.)

**Verwendung:**
```javascript
import { globalSearch } from './components/search.js';
globalSearch.init();
```

### Rich Text Editor (`components/richTextEditor.js`)

**Funktion:**
- Quill.js Wrapper
- Für Beschreibungen, Posts, etc.

**Verwendung:**
```javascript
import { richTextEditor } from './components/richTextEditor.js';
richTextEditor.init('#editor-container');
```

---

## Services und Repositories

### Service-Layer

**`apiClient.js`** - Zentrale API-Schnittstelle
- Exportiert `api` Objekt
- Verwendet aktuell `storageAdapter`
- Vorbereitet für Backend-Integration

**`storageAdapter.js`** - localStorage-Adapter
- Alle Datenoperationen
- User-Management
- CRUD-Operationen für alle Entitäten

**`router.js`** - Routing
- Route-Definitionen
- Navigation-Funktionen

**`authGuard.js`** - Berechtigungen
- Route-Guards
- Rollen-Prüfung

### Repository-Layer

Repositories kapseln Datenzugriff und bieten eine einheitliche API:

**Beispiel: Ticket Repository**

```javascript
// assets/js/services/repositories/ticketRepository.js
export const ticketRepository = {
  getAll() {
    return api.listTickets();
  },
  
  getById(id) {
    return api.getTicket(id);
  },
  
  create(data) {
    return api.createTicket(data);
  },
  
  update(id, data) {
    return api.updateTicket(id, data);
  },
  
  delete(id) {
    return api.deleteTicket(id);
  }
};
```

**Verwendung in Pages:**

```javascript
// pages/tickets.js
import { ticketRepository } from '../services/repositories/ticketRepository.js';

const tickets = ticketRepository.getAll();
const newTicket = ticketRepository.create({ title: '...' });
```

---

## Authentifizierung und Berechtigungen

### Authentifizierungs-Flow

1. **User registriert sich** oder **loggt sich ein**
2. **`storageAdapter.login()`** erstellt Session:
   ```javascript
   localStorage.setItem('session', JSON.stringify({
     userId: user.id,
     email: user.email,
     role: user.role,
     expiresAt: ...
   }));
   ```
3. **`api.isLoggedIn()`** prüft Session
4. **`api.me()`** gibt aktuellen User zurück

### Berechtigungs-System

**Rollen-Hierarchie:**
```
guest < member < editor < moderator < admin
```

**Route-Guards:**

```javascript
// In authGuard.js
export function guardRoute(path) {
  if (!api.isLoggedIn()) {
    return { allowed: false, redirect: '/index.html' };
  }
  
  const requiredRole = getRequiredRoleForPath(path);
  if (!hasRequiredRole(requiredRole)) {
    return { allowed: false, redirect: '/app/dashboard.html' };
  }
  
  return { allowed: true };
}
```

**Verwendung:**

```javascript
// In app.js
const guardResult = guard();
if (!guardResult) {
  // Redirect zu Login
  return;
}
```

### Rollen-Berechtigungen

| Rolle | Berechtigungen |
|-------|----------------|
| **guest** | Öffentliche Seite |
| **member** | Member Area (Dashboard, Tickets, Resources, etc.) |
| **editor** | Member Area + Content-Management (Resources, Knowledge, Public Pages) |
| **moderator** | Editor + Ticket-Inbox, Reports |
| **admin** | Alles + User-Management, Audit-Log, Settings |

---

## Storage-System

### Aktuell: localStorage (MVP)

**Vorteile:**
- Kein Backend nötig für Development
- Schnelle Entwicklung
- Einfaches Testing

**Nachteile:**
- Größenlimit (~5-10MB)
- Nur lokal verfügbar
- Keine echte Persistierung zwischen Geräten

### Storage-Struktur

**Keys:**
```javascript
const K = {
  users: "users",                    // Alle Benutzer
  session: "session",                 // Aktuelle Session
  events: "events",                   // Events/Termine
  forumThreads: "forum:threads",     // Forum-Threads
  resources: "resources",              // Resources
  knowledge: "knowledge",             // Knowledge Base
  tickets: "tickets",                 // Tickets
  // ... weitere Keys
};
```

**Datenformat:**
```javascript
// Beispiel: Tickets
[
  {
    id: "ticket_abc123_1234567890",
    title: "Neue Funktion",
    description: "...",
    category: "feature",
    status: "open",
    userId: "user_xyz",
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-01T12:00:00Z"
  }
]
```

### Vorbereitung für Backend

Die Architektur ist vorbereitet für Backend-Integration:

1. **`httpAdapter.js`** - Bereit für HTTP-API
2. **Repository-Pattern** - Einfacher Wechsel zwischen Storage-Adaptern
3. **API-Client** - Kann zwischen Adaptern wechseln:
   ```javascript
   // Aktuell:
   import { storageAdapter } from './storageAdapter.js';
   export const api = storageAdapter;
   
   // Für Backend:
   import { httpAdapter } from './httpAdapter.js';
   export const api = httpAdapter;
   ```

---

## Entwicklungs-Workflow

### 1. Server starten

```bash
npm install
npm start
# Oder mit Script (Windows): .\scripts\START_SERVER.ps1
```

### 2. Browser öffnen

```
http://localhost:8000
```

### 3. Demo-Daten laden (optional)

```javascript
// In Browser Console
import { seedDemoData } from './assets/js/seed/demoData.js';
await seedDemoData();
```

### 4. Test-Accounts

| Email | Passwort | Rolle |
|-------|----------|-------|
| `admin@undbauen.local` | `adminadmin` | admin |
| `moderator@undbauen.local` | `moderator123` | moderator |
| `editor@undbauen.local` | `editor123` | editor |

### 5. Neue Seite hinzufügen

1. **HTML-Datei erstellen** in `/app/`:
   ```html
   <!doctype html>
   <html lang="de">
   <head>
     <link rel="stylesheet" href="../assets/css/base.css"/>
     <link rel="stylesheet" href="../assets/css/app.css"/>
   </head>
   <body data-page="meine-seite">
     <!-- Content -->
     <script type="module" src="../assets/js/app.js"></script>
   </body>
   </html>
   ```
2. **Page-Modul erstellen** in `/assets/js/pages/`:
   ```javascript
   // pages/meineSeite.js
   export function initMeineSeite() {
     console.log('Meine Seite initialisiert');
     // Seite-spezifische Logik
   }
   ```
3. **Router erweitern** in `app.js`:
   ```javascript
   if (page === 'meine-seite') {
     const { initMeineSeite } = await import('./pages/meineSeite.js');
     initMeineSeite();
   }
   ```
4. **Route hinzufügen** in `router.js`:
   ```javascript
   member: {
     '/app/meine-seite.html': { page: 'meine-seite', role: 'member' }
   }
   ```

### 6. Neue Komponente hinzufügen

1. **Komponente erstellen** in `/assets/js/components/`:
   ```javascript
   // components/meineKomponente.js
   export function renderMeineKomponente(container, data) {
     container.innerHTML = `<div>${data}</div>`;
   }
   ```
2. **Verwenden** in Page-Modul:
   ```javascript
   import { renderMeineKomponente } from '../components/meineKomponente.js';
   renderMeineKomponente(document.getElementById('container'), 'Daten');
   ```

### 7. Neues Repository hinzufügen

1. **Repository erstellen** in `/assets/js/services/repositories/`:
   ```javascript
   // repositories/meinRepository.js
   import { api } from '../apiClient.js';
   
   export const meinRepository = {
     getAll() {
       return api.listMeineEntitaet();
     },
     create(data) {
       return api.createMeineEntitaet(data);
     }
   };
   ```
2. **In Storage-Adapter implementieren**:
   ```javascript
   // storageAdapter.js
   listMeineEntitaet() {
     return getJSON(K.meineEntitaet, []);
   }
   createMeineEntitaet(data) {
     const items = getJSON(K.meineEntitaet, []);
     const newItem = { id: uid('item'), ...data, createdAt: nowISO() };
     items.push(newItem);
     setJSON(K.meineEntitaet, items);
     return newItem;
   }
   ```

---

## Zusammenfassung: Wie die Seite aufgebaut ist

### 1. **Drei Hauptbereiche**

- **Öffentliche Seite** (`index.html`) - Landing Page
- **Member Area** (`/app/`) - Für eingeloggte Mitglieder
- **Backoffice** (`/backoffice/`) - Für Admins/Moderatoren

### 2. **Modulare Architektur**

- **Pages** (`/assets/js/pages/`) - Seite-spezifische Logik
- **Components** (`/assets/js/components/`) - Wiederverwendbare UI-Komponenten
- **Services** (`/assets/js/services/`) - Business Logic
- **Repositories** (`/assets/js/services/repositories/`) - Datenzugriff

### 3. **Datenfluss**

```
HTML → app.js/public.js → Pages → Components → API Client → Storage Adapter → localStorage
```

### 4. **Routing**

- `data-page` Attribut identifiziert Seite
- Router lädt entsprechendes Page-Modul
- Auth Guard prüft Berechtigungen

### 5. **Storage**

- Aktuell: localStorage (MVP)
- Vorbereitet für Backend-Integration
- Repository-Pattern für saubere Trennung

### 6. **Entwicklung**

- Node.js (serve) für lokale Entwicklung – `npm start`
- ES6 Modules für modularen Code
- Komponenten-basierte Architektur
- Service-Layer für Business Logic

---

## Nächste Schritte für neue Entwickler

1. **Server starten** und Website öffnen
2. **Demo-Daten laden** für Test-Daten
3. **Mit Test-Account einloggen** (admin@undbauen.local)
4. **Code durchgehen:**
   - Start mit `index.html` (öffentliche Seite)
   - Dann `app/dashboard.html` (Member Area)
   - Dann `assets/js/app.js` (Haupt-Logik)
   - Dann `assets/js/pages/dashboard.js` (Seiten-Logik)
5. **Komponenten verstehen:**
   - `components/sidebar.js` - Navigation
   - `components/toast.js` - Benachrichtigungen
6. **Services verstehen:**
   - `services/apiClient.js` - API-Schnittstelle
   - `services/storageAdapter.js` - Datenpersistierung
   - `services/router.js` - Routing
   - `services/authGuard.js` - Berechtigungen

---

**Version:** 1.0.0  
**Erstellt:** 2024  
**Zuletzt aktualisiert:** 2024
