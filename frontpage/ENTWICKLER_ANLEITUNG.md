# Entwickler-Anleitung: Frontpage

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2024  
**Zielgruppe:** Neue Entwickler, die mit der Frontpage arbeiten möchten

---

## 📋 Inhaltsverzeichnis

1. [Schnellstart](#schnellstart)
2. [Projektstruktur](#projektstruktur)
3. [HTML-Struktur](#html-struktur)
4. [Content ändern](#content-ändern)
5. [Bilder hinzufügen/ändern](#bilder-hinzufügenändern)
6. [JavaScript-Module](#javascript-module)
7. [Styling anpassen](#styling-anpassen)
8. [Neue Features hinzufügen](#neue-features-hinzufügen)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Schnellstart

### Lokale Entwicklung starten

```bash
# 1. In das Frontpage-Verzeichnis wechseln
cd frontpage

# 2. Lokalen Server starten
python -m http.server 8000

# 3. Browser öffnen
# http://localhost:8000
```

### Projekt öffnen

Die Frontpage ist eine **statische Website** ohne Build-Prozess. Einfach die Dateien öffnen und bearbeiten.

---

## 📁 Projektstruktur

```
frontpage/
│
├── index.html                    # Haupt-HTML-Datei (Frontpage)
│
├── assets/
│   ├── css/                      # Stylesheets
│   │   ├── base.css             # Basis-Styles (Variablen, Reset, Utilities)
│   │   ├── public.css           # Public-spezifische Styles
│   │   └── components.css       # Komponenten-Styles (Modal, Toast, etc.)
│   │
│   ├── js/
│   │   ├── public.js            # Haupt-App (Entry Point, 429 Zeilen)
│   │   │
│   │   ├── components/          # UI-Komponenten (9 Dateien)
│   │   │   ├── heroAnimation.js    # Hero-Animation mit rotierenden Wörtern
│   │   │   ├── hoverCard.js        # Hover-Karten für Mitglieder-Profile
│   │   │   ├── icons.js            # Icon-System (Lucide Icons)
│   │   │   ├── lazyLoad.js         # Lazy Loading für Bilder
│   │   │   ├── memberModal.js      # Modal für Mitglieder-Details
│   │   │   ├── parallax.js         # Parallax-Effekt für Hero
│   │   │   ├── scrollNavigation.js # Scroll-Navigation
│   │   │   ├── search.js           # Globale Suche
│   │   │   └── toast.js            # Toast-Benachrichtigungen
│   │   │
│   │   ├── pages/               # Page-Module (5 Dateien)
│   │   │   ├── events.js        # Events-Rendering (208 Zeilen)
│   │   │   ├── members.js       # Members-Rendering (466 Zeilen)
│   │   │   ├── misc.js          # Testimonials, Partners, FAQ (213 Zeilen)
│   │   │   ├── publications.js  # Publications-Rendering (99 Zeilen)
│   │   │   └── updates.js       # Updates-Rendering (80 Zeilen)
│   │   │
│   │   └── services/            # Services (3 Dateien)
│   │       ├── apiClient.js      # API-Client (18 Zeilen)
│   │       ├── metaTags.js       # SEO Meta-Tags Service
│   │       └── storageAdapter.js # localStorage "Backend" (494 Zeilen)
│   │
│   └── images/                  # Bilder (aktuell leer, bereit für Uploads)
│
└── Dokumentation/
    ├── README.md                # Haupt-Dokumentation
    ├── STRUCTURE.md             # Struktur-Dokumentation
    ├── OPTIMIERUNGS_ANALYSE.md  # Optimierungsanalyse
    └── ENTWICKLER_ANLEITUNG.md  # Diese Datei
```

---

## 📄 HTML-Struktur

### Haupt-HTML (`index.html`)

Die Frontpage besteht aus **einem einzigen HTML-File** (`index.html`) mit folgenden Hauptbereichen:

#### 1. **Head-Bereich** (Zeilen 1-39)
```html
<head>
  <!-- Meta-Tags (SEO) -->
  <!-- Open Graph / Facebook -->
  <!-- Twitter -->
  <!-- Fonts (Google Fonts: Inter) -->
  <!-- CSS-Dateien -->
</head>
```

**Wichtig:**
- CSS-Dateien werden hier eingebunden
- Meta-Tags für SEO sind hier definiert
- Fonts werden von Google Fonts geladen

#### 2. **Header** (Zeilen 42-66)
```html
<header class="publicNav">
  <div class="container publicNavInner">
    <a class="brand">…undbauen</a>
    <button id="searchTrigger">Suche</button>
    <button id="mobileMenuToggle">Menü</button>
    <nav id="navLinks">
      <!-- Navigation Links -->
      <button id="themeToggle">Theme</button>
      <button id="openAuth">Login</button>
    </nav>
  </div>
</header>
```

**IDs für JavaScript:**
- `searchTrigger` - Öffnet globale Suche
- `mobileMenuToggle` - Mobile Menü Toggle
- `navLinks` - Navigation Container
- `themeToggle` - Theme-Wechsel (Dark/Light)
- `openAuth` - Öffnet Login-Modal

#### 3. **Main-Bereich** (Zeilen 68-470)

Die Frontpage besteht aus **8 Haupt-Sektionen**:

##### Sektion 1: Hero (Zeilen 70-133)
```html
<section id="home" class="hero">
  <div class="hero-network-visual">...</div>
  <div class="hero-content">
    <h1 id="hero-heading">...</h1>
    <p class="hero-subtitle">...</p>
  </div>
</section>
```

**IDs/Classes:**
- `id="home"` - Anchor für Navigation
- `id="hero-heading"` - Hauptüberschrift (wird von `heroAnimation.js` animiert)
- `class="hero-subtitle"` - Untertitel

##### Sektion 2: Mission (Zeilen 134-149)
```html
<section class="mission">
  <div class="container">
    <div class="mission-text">...</div>
    <div class="mission-images">...</div>
  </div>
</section>
```

**Content ändern:**
- Text direkt im HTML ändern
- Bilder in `mission-images` div ändern

##### Sektion 3: Innovationsabend (Zeilen 150-175)
```html
<section class="innovationsabend">
  <div class="container">
    <h2>Der monatliche Innovationsabend</h2>
    <div class="event-grid">
      <div class="event-card">...</div>
    </div>
  </div>
</section>
```

**Content ändern:**
- Statischer Content, direkt im HTML ändern

##### Sektion 4: Netzwerk (Zeilen 176-210)
```html
<section id="netzwerk" class="network">
  <div class="container">
    <h2 id="netzwerk-heading">Netzwerk</h2>
    <div class="social-proof-stats" id="socialProofStats"></div>
    <div class="network-filters" id="networkFilters">...</div>
    <div class="network-slider-container">
      <div class="people-slider" id="peopleSlider"></div>
    </div>
  </div>
</section>
```

**IDs für JavaScript:**
- `id="netzwerk"` - Anchor für Navigation
- `id="socialProofStats"` - Wird von `pages/members.js` → `renderSocialProof()` befüllt
- `id="networkFilters"` - Filter-Container (optional)
- `id="peopleSlider"` - Wird von `pages/members.js` → `renderNetworkSlider()` befüllt

**Wichtig:** Diese Sektion wird **dynamisch von JavaScript** befüllt!

##### Sektion 5: Termine (Zeilen 211-220)
```html
<section id="termine" class="section">
  <div class="container">
    <h2>Termine</h2>
    <div id="publicEvents"></div>
  </div>
</section>
```

**IDs für JavaScript:**
- `id="termine"` - Anchor für Navigation
- `id="publicEvents"` - Wird von `pages/events.js` → `renderPublicEvents()` befüllt

**Wichtig:** Diese Sektion wird **dynamisch von JavaScript** befüllt!

##### Sektion 6: Monatsupdates (Zeilen 221-230)
```html
<section id="updates" class="section">
  <div class="container">
    <h2>Monatsupdates</h2>
    <div id="publicUpdates"></div>
  </div>
</section>
```

**IDs für JavaScript:**
- `id="updates"` - Anchor für Navigation
- `id="publicUpdates"` - Wird von `pages/updates.js` → `renderPublicUpdates()` befüllt

**Wichtig:** Diese Sektion wird **dynamisch von JavaScript** befüllt!

##### Sektion 7: Publikationen (Zeilen 231-240)
```html
<section id="publikationen" class="section">
  <div class="container">
    <h2>Publikationen</h2>
    <div id="publicPubs"></div>
  </div>
</section>
```

**IDs für JavaScript:**
- `id="publikationen"` - Anchor für Navigation
- `id="publicPubs"` - Wird von `pages/publications.js` → `renderPublicPubs()` befüllt

**Wichtig:** Diese Sektion wird **dynamisch von JavaScript** befüllt!

##### Sektion 8: Über uns / Kontakt (Zeilen 241-470)
```html
<section id="ueber" class="section">...</section>
<section id="kontakt" class="section">...</section>
<section id="testimonials" class="section">
  <div id="testimonialsGrid"></div>
</section>
<section id="partners" class="section">
  <div id="partnersGrid"></div>
</section>
<section id="faq" class="section">
  <div id="faqContainer"></div>
</section>
```

**IDs für JavaScript:**
- `id="testimonialsGrid"` - Wird von `pages/misc.js` → `renderTestimonials()` befüllt
- `id="partnersGrid"` - Wird von `pages/misc.js` → `renderPartners()` befüllt
- `id="faqContainer"` - Wird von `pages/misc.js` → `renderFAQ()` befüllt

**Wichtig:** Diese Sektionen werden **dynamisch von JavaScript** befüllt!

#### 4. **Modals** (Zeilen 471-508)

##### Auth-Modal (Login/Register)
```html
<div id="authOverlay" class="modal-overlay">
  <div class="modal">
    <div id="authTitle">Login</div>
    <div id="panel-login">...</div>
    <div id="panel-register">...</div>
    <div id="panel-forgot">...</div>
  </div>
</div>
```

**IDs für JavaScript:**
- `id="authOverlay"` - Modal-Overlay
- `id="authTitle"` - Titel (wird dynamisch geändert)
- `id="panel-login"` - Login-Panel
- `id="panel-register"` - Register-Panel
- `id="panel-forgot"` - Forgot-Password-Panel
- `id="doLogin"` - Login-Button
- `id="doRegister"` - Register-Button
- `id="loginEmail"`, `id="loginPass"` - Login-Inputs
- `id="regName"`, `id="regEmail"`, `id="regPass"` - Register-Inputs

##### Event-Details-Modal
```html
<div id="eventDetailsOverlay" class="modal-overlay">
  <div class="modal">
    <h2 id="eventDetailsTitle"></h2>
    <div id="eventDetailsContent"></div>
  </div>
</div>
```

**IDs für JavaScript:**
- `id="eventDetailsOverlay"` - Modal-Overlay
- `id="eventDetailsTitle"` - Event-Titel
- `id="eventDetailsContent"` - Event-Content (wird dynamisch befüllt)

#### 5. **Scripts** (Zeilen 509-510)
```html
<script type="module" src="assets/js/public.js"></script>
```

**Wichtig:** Nur **eine** JavaScript-Datei wird geladen (`public.js`), die alle Module importiert!

---

## ✏️ Content ändern

### Statischer Content (direkt im HTML)

#### Text ändern

**Beispiel: Hero-Überschrift ändern**

1. Öffne `index.html`
2. Finde Zeile 124-128:
```html
<h1 id="hero-heading">
  <div class="headline-wrapper">
    <!-- Hier steht der Text -->
  </div>
</h1>
```
3. Ändere den Text direkt im HTML

**Beispiel: Mission-Text ändern**

1. Öffne `index.html`
2. Finde Zeile 137-140:
```html
<div class="mission-text">
  <!-- Hier steht der Text -->
</div>
```
3. Ändere den Text direkt im HTML

#### HTML-Struktur ändern

**Wichtig:** Wenn du HTML-Struktur änderst:
- Stelle sicher, dass IDs/Classes erhalten bleiben, die von JavaScript verwendet werden
- Prüfe, ob JavaScript-Funktionen die neuen Elemente finden können

### Dynamischer Content (über JavaScript)

#### Events ändern

**Datei:** `assets/js/pages/events.js`

**Funktion:** `renderPublicEvents()`

**Datenquelle:** `api.listEvents()` (aus `storageAdapter.js`)

**So ändern:**
1. Öffne `assets/js/services/storageAdapter.js`
2. Finde die Funktion `listEvents()` (Zeile ~150)
3. Ändere die Events-Daten oder füge neue hinzu

**Oder:** Ändere das Rendering in `assets/js/pages/events.js`:
- Zeile 225-328: `renderPublicEvents()` Funktion
- Hier kannst du das HTML-Template für Event-Cards ändern

#### Updates ändern

**Datei:** `assets/js/pages/updates.js`

**Funktion:** `renderPublicUpdates()`

**Datenquelle:** `api.listUpdatesPublic()` (aus `storageAdapter.js`)

**So ändern:**
1. Öffne `assets/js/services/storageAdapter.js`
2. Finde die Funktion `listUpdatesPublic()` (Zeile ~200)
3. Ändere die Updates-Daten oder füge neue hinzu

**Oder:** Ändere das Rendering in `assets/js/pages/updates.js`:
- Zeile 20-60: `renderPublicUpdates()` Funktion
- Hier kannst du das HTML-Template für Update-Items ändern

#### Publications ändern

**Datei:** `assets/js/pages/publications.js`

**Funktion:** `renderPublicPubs()`

**Datenquelle:** `api.listPublicationsPublic()` (aus `storageAdapter.js`)

**So ändern:**
1. Öffne `assets/js/services/storageAdapter.js`
2. Finde die Funktion `listPublicationsPublic()` (Zeile ~250)
3. Ändere die Publications-Daten oder füge neue hinzu

**Oder:** Ändere das Rendering in `assets/js/pages/publications.js`:
- Zeile 20-80: `renderPublicPubs()` Funktion
- Hier kannst du das HTML-Template für Publication-Cards ändern

#### Testimonials ändern

**Datei:** `assets/js/pages/misc.js`

**Funktion:** `renderTestimonials()`

**So ändern:**
1. Öffne `assets/js/pages/misc.js`
2. Finde Zeile 20-60: `renderTestimonials()` Funktion
3. Ändere das `testimonials` Array:
```javascript
const testimonials = [
  {
    name: "Dr. Sarah Müller",
    role: "Architektin & BIM-Expertin",
    company: "Müller Architekten",
    quote: "…undbauen hat mir geholfen...",
    avatar: null  // Optional: URL zu Avatar-Bild
  },
  // Füge weitere Testimonials hinzu...
];
```

#### Partners ändern

**Datei:** `assets/js/pages/misc.js`

**Funktion:** `renderPartners()`

**So ändern:**
1. Öffne `assets/js/pages/misc.js`
2. Finde Zeile 70-100: `renderPartners()` Funktion
3. Ändere das `partners` Array:
```javascript
const partners = [
  { name: "Partner 1", logo: "assets/images/partner1.png", url: "https://..." },
  { name: "Partner 2", logo: "assets/images/partner2.png", url: "https://..." },
  // Füge weitere Partner hinzu...
];
```

#### FAQ ändern

**Datei:** `assets/js/pages/misc.js`

**Funktion:** `renderFAQ()`

**So ändern:**
1. Öffne `assets/js/pages/misc.js`
2. Finde Zeile 120-200: `renderFAQ()` Funktion
3. Ändere das `faqs` Array:
```javascript
const faqs = [
  {
    question: "Wie kann ich Mitglied werden?",
    answer: "Sie können sich über den 'Mitglied werden'-Button registrieren..."
  },
  // Füge weitere FAQs hinzu...
];
```

---

## 🖼️ Bilder hinzufügen/ändern

### Bilder-Verzeichnis

**Pfad:** `frontpage/assets/images/`

**Aktuell:** Leer (bereit für Uploads)

### Bilder einbinden

#### 1. Bild hochladen

1. Lade dein Bild in `frontpage/assets/images/` hoch
2. Beispiel: `frontpage/assets/images/hero-image.jpg`

#### 2. Bild im HTML verwenden

**Statisches Bild (direkt im HTML):**

```html
<img src="assets/images/hero-image.jpg" alt="Beschreibung" />
```

**Beispiel:** Mission-Bilder ändern (Zeile 141-149 in `index.html`):
```html
<div class="mission-images">
  <img src="assets/images/mission1.jpg" alt="Mission Bild 1" />
  <img src="assets/images/mission2.jpg" alt="Mission Bild 2" />
</div>
```

#### 3. Bild in JavaScript verwenden

**Dynamisches Bild (über JavaScript):**

**Beispiel:** Event-Bilder ändern (`assets/js/pages/events.js`):

1. Öffne `assets/js/pages/events.js`
2. Finde Zeile 50-80: `getEventImage()` Funktion
3. Ändere die Bild-URLs:
```javascript
const getEventImage = (ev, index = 0) => {
  // Lokale Bilder verwenden:
  if (format.includes("innovationsabend")) {
    return 'assets/images/events/innovation-' + index + '.jpg';
  }
  // Oder weiterhin Unsplash verwenden:
  return 'https://images.unsplash.com/...';
};
```

**Beispiel:** Partner-Logos ändern (`assets/js/pages/misc.js`):

1. Öffne `assets/js/pages/misc.js`
2. Finde Zeile 70-100: `renderPartners()` Funktion
3. Ändere die Logo-URLs:
```javascript
const partners = [
  { name: "Partner 1", logo: "assets/images/partners/partner1.png", url: "#" },
  { name: "Partner 2", logo: "assets/images/partners/partner2.png", url: "#" },
];
```

**Beispiel:** Member-Avatare ändern (`assets/js/pages/members.js`):

1. Öffne `assets/js/pages/members.js`
2. Finde Zeile 120-130: `defaultPortraits` Array
3. Ändere die Avatar-URLs:
```javascript
const defaultPortraits = [
  'assets/images/avatars/avatar1.jpg',
  'assets/images/avatars/avatar2.jpg',
  // ...
];
```

### Bild-Optimierung

**Empfehlungen:**
- **Format:** WebP (moderne Browser) oder JPG/PNG (Fallback)
- **Größe:** 
  - Hero-Bilder: max. 1920x1080px
  - Event-Bilder: max. 800x600px
  - Avatar-Bilder: max. 400x400px
  - Partner-Logos: max. 200x100px
- **Komprimierung:** Verwende Tools wie TinyPNG oder ImageOptim

### Lazy Loading

**Automatisch aktiviert** für alle Bilder mit `loading="lazy"` Attribut:

```html
<img src="assets/images/image.jpg" alt="Beschreibung" loading="lazy" />
```

**Wichtig:** Lazy Loading wird automatisch von `lazyLoad.js` Component gehandhabt!

---

## 🔗 JavaScript-Module

### Entry Point: `public.js`

**Datei:** `assets/js/public.js` (429 Zeilen)

**Aufgabe:** Haupt-App, koordiniert alle Module

**Wichtig:**
- Diese Datei importiert alle Page-Module
- Initialisiert alle Components
- Bindet Event-Handler

**Struktur:**
```javascript
// 1. Imports (Zeilen 6-21)
import { api } from "./services/apiClient.js";
import { renderPublicEvents } from "./pages/events.js";
// ...

// 2. Globale Funktionen (Zeilen 35-200)
const openAuth = () => { ... };
const toggleTheme = () => { ... };
// ...

// 3. DOMContentLoaded (Zeilen 295-450)
document.addEventListener("DOMContentLoaded", async () => {
  // Initialisierung
  // Render-Funktionen aufrufen
});
```

### Page-Module

#### `pages/events.js` (208 Zeilen)

**Funktion:** Rendert Events-Sektion

**Wird aufgerufen von:** `public.js` Zeile 270

**Container-ID:** `#publicEvents`

**Datenquelle:** `api.listEvents()`

**So ändern:**
- Event-Template ändern: Zeile 100-150
- Event-Bilder ändern: Zeile 50-80 (`getEventImage()`)

#### `pages/updates.js` (80 Zeilen)

**Funktion:** Rendert Updates-Sektion

**Wird aufgerufen von:** `public.js` Zeile 275

**Container-ID:** `#publicUpdates`

**Datenquelle:** `api.listUpdatesPublic()`

**So ändern:**
- Update-Template ändern: Zeile 40-70

#### `pages/publications.js` (99 Zeilen)

**Funktion:** Rendert Publications-Sektion

**Wird aufgerufen von:** `public.js` Zeile 280

**Container-ID:** `#publicPubs`

**Datenquelle:** `api.listPublicationsPublic()`

**So ändern:**
- Publication-Template ändern: Zeile 40-80
- Publication-Bilder ändern: Zeile 30-40 (`pubImages` Array)

#### `pages/members.js` (466 Zeilen)

**Funktionen:**
- `renderSocialProof()` - Rendert Statistik-Karten
- `renderNetworkSlider()` - Rendert Member-Slider

**Wird aufgerufen von:** `public.js` Zeile 265, 285

**Container-IDs:** `#socialProofStats`, `#peopleSlider`

**Datenquelle:** `api.listMembersPublic()`

**So ändern:**
- Member-Card-Template ändern: Zeile 150-200 (`renderMemberCard()`)
- Avatar-Bilder ändern: Zeile 120-130 (`defaultPortraits` Array)
- Filter-Logik ändern: Zeile 60-100 (`filterAndSortMembers()`)

#### `pages/misc.js` (213 Zeilen)

**Funktionen:**
- `renderTestimonials()` - Rendert Testimonials
- `renderPartners()` - Rendert Partner-Logos
- `renderFAQ()` - Rendert FAQ-Accordion

**Wird aufgerufen von:** `public.js` Zeile 290, 295, 300

**Container-IDs:** `#testimonialsGrid`, `#partnersGrid`, `#faqContainer`

**So ändern:**
- Testimonials ändern: Zeile 20-60
- Partners ändern: Zeile 70-100
- FAQ ändern: Zeile 120-200

### Components

#### `components/heroAnimation.js`

**Aufgabe:** Animiert Hero-Überschrift mit rotierenden Wörtern

**Wird verwendet von:** `public.js` Zeile 250

**So ändern:**
- Animation-Geschwindigkeit ändern: Zeile 30-50
- Wörter ändern: Zeile 20-30

#### `components/memberModal.js`

**Aufgabe:** Zeigt Member-Details in Modal

**Wird verwendet von:** `pages/members.js` Zeile 250

**So ändern:**
- Modal-Template ändern: Zeile 50-150

#### `components/toast.js`

**Aufgabe:** Zeigt Toast-Benachrichtigungen

**Wird verwendet von:** `public.js` Zeile 380, 390

**So ändern:**
- Toast-Styles ändern: `components.css` Zeile 1000-1100

### Services

#### `services/storageAdapter.js` (494 Zeilen)

**Aufgabe:** MVP "Backend" über localStorage

**Wichtig:** Hier sind alle Daten gespeichert!

**So ändern:**
- Events ändern: Zeile 150-200 (`listEvents()`)
- Updates ändern: Zeile 200-250 (`listUpdatesPublic()`)
- Publications ändern: Zeile 250-300 (`listPublicationsPublic()`)
- Members ändern: Zeile 300-350 (`listMembersPublic()`)

**Datenstruktur:**
```javascript
// Events
{
  id: "event_1",
  title: "Innovationsabend Januar",
  date: "2024-01-15",
  time: "18:00",
  format: "Innovationsabend",
  location: "Berlin",
  description: "...",
  tags: ["Innovation", "Networking"]
}

// Updates
{
  id: "update_1",
  title: "Monatsupdate Januar",
  intro: "...",
  highlights: ["Highlight 1", "Highlight 2"],
  createdAt: "2024-01-01T00:00:00Z"
}

// Publications
{
  id: "pub_1",
  title: "Publikation Titel",
  abstract: "...",
  tags: ["Tag 1", "Tag 2"],
  createdAt: "2024-01-01T00:00:00Z"
}
```

---

## 🎨 Styling anpassen

### CSS-Dateien

#### `base.css` (36.5 KB)

**Aufgabe:** Basis-Styles (Variablen, Reset, Utilities)

**Wichtig:**
- **CSS-Variablen** (Zeile 1-50): Hier kannst du Farben, Schriftarten, etc. ändern
- **Reset-Styles** (Zeile 50-100): Browser-Reset
- **Utility-Classes** (Zeile 100-200): `.container`, `.section`, etc.

**So ändern:**
- Farben ändern: Zeile 10-30 (CSS-Variablen)
- Schriftarten ändern: Zeile 30-40
- Container-Breite ändern: Zeile 150 (`--max-width`)

#### `public.css` (18.2 KB)

**Aufgabe:** Public-spezifische Styles

**Wichtig:**
- Hero-Styles (Zeile 1-100)
- Section-Styles (Zeile 100-200)
- Public-Navigation (Zeile 200-300)

**So ändern:**
- Hero-Design ändern: Zeile 1-100
- Section-Abstand ändern: Zeile 100-200

#### `components.css` (24.6 KB)

**Aufgabe:** Komponenten-Styles

**Wichtig:**
- Button-Styles (Zeile 1-100)
- Card-Styles (Zeile 100-200)
- Modal-Styles (Zeile 200-300)
- Toast-Styles (Zeile 1000-1100)

**So ändern:**
- Button-Design ändern: Zeile 1-100
- Card-Design ändern: Zeile 100-200
- Modal-Design ändern: Zeile 200-300

### CSS-Variablen ändern

**Datei:** `assets/css/base.css` Zeile 1-50

**Beispiel:**
```css
:root {
  --primary: #2563eb;        /* Primärfarbe ändern */
  --accent: #7c3aed;         /* Akzentfarbe ändern */
  --bg: #ffffff;             /* Hintergrundfarbe ändern */
  --text-primary: #1f2937;   /* Textfarbe ändern */
  --max-width: 1200px;       /* Container-Breite ändern */
}
```

**Wichtig:** Änderungen hier wirken sich auf die gesamte Website aus!

---

## ➕ Neue Features hinzufügen

### Neue Sektion hinzufügen

#### Schritt 1: HTML hinzufügen

1. Öffne `index.html`
2. Füge neue Sektion hinzu:
```html
<section id="neue-sektion" class="section">
  <div class="container">
    <h2>Neue Sektion</h2>
    <div id="neueSektionContent"></div>
  </div>
</section>
```

#### Schritt 2: JavaScript-Modul erstellen

1. Erstelle `assets/js/pages/neueSektion.js`:
```javascript
const $ = (s) => document.querySelector(s);

export const renderNeueSektion = () => {
  const container = $("#neueSektionContent");
  if (!container) return;
  
  container.innerHTML = `
    <div class="card">
      <h3>Neuer Content</h3>
      <p>Hier steht der neue Content.</p>
    </div>
  `;
};
```

#### Schritt 3: In `public.js` importieren

1. Öffne `assets/js/public.js`
2. Füge Import hinzu (Zeile 20):
```javascript
import { renderNeueSektion } from "./pages/neueSektion.js";
```

3. Füge Render-Aufruf hinzu (Zeile 300):
```javascript
try {
  renderNeueSektion();
} catch (error) {
  console.error('Error rendering neue sektion:', error);
}
```

### Neue Component hinzufügen

#### Schritt 1: Component erstellen

1. Erstelle `assets/js/components/neueComponent.js`:
```javascript
export const neueComponent = {
  init() {
    // Initialisierung
  },
  
  show() {
    // Component anzeigen
  },
  
  hide() {
    // Component verstecken
  }
};
```

#### Schritt 2: In `public.js` importieren

1. Öffne `assets/js/public.js`
2. Füge Import hinzu (Zeile 10):
```javascript
import { neueComponent } from "./components/neueComponent.js";
```

3. Initialisiere Component (Zeile 250):
```javascript
if (neueComponent && neueComponent.init) {
  neueComponent.init();
}
```

---

## 🐛 Troubleshooting

### Problem: Content wird nicht angezeigt

**Lösung:**
1. Prüfe Browser-Konsole (F12) auf Fehler
2. Prüfe, ob Container-ID existiert: `document.querySelector('#containerId')`
3. Prüfe, ob Render-Funktion aufgerufen wird: `public.js` Zeile 260-300

### Problem: Bilder werden nicht geladen

**Lösung:**
1. Prüfe Bild-Pfad: Relativ zu `index.html` oder absolut
2. Prüfe, ob Bild existiert: `assets/images/bild.jpg`
3. Prüfe Browser-Konsole auf 404-Fehler

### Problem: JavaScript-Fehler

**Lösung:**
1. Öffne Browser-Konsole (F12)
2. Prüfe Fehlermeldung
3. Prüfe, ob alle Imports korrekt sind
4. Prüfe, ob alle Funktionen exportiert werden (`export const`)

### Problem: Styles werden nicht angewendet

**Lösung:**
1. Prüfe, ob CSS-Datei geladen wird: Browser DevTools → Network
2. Prüfe CSS-Selektoren: Sind sie korrekt?
3. Prüfe CSS-Spezifität: Gibt es Konflikte?

### Problem: Mobile-Menü funktioniert nicht

**Lösung:**
1. Prüfe, ob `mobileMenuToggle` Button existiert: `index.html` Zeile 48
2. Prüfe, ob Event-Handler gebunden ist: `public.js` Zeile 310
3. Prüfe CSS: `components.css` Zeile 500-600

---

## 📚 Weitere Ressourcen

### Dokumentation

- **README.md** - Haupt-Dokumentation
- **STRUCTURE.md** - Detaillierte Struktur-Erklärung
- **OPTIMIERUNGS_ANALYSE.md** - Optimierungs-Details

### Code-Kommentare

Alle wichtigen Funktionen haben **JSDoc-Kommentare**:
```javascript
/**
 * Beschreibung der Funktion
 * @param {string} param - Parameter-Beschreibung
 * @returns {void}
 */
```

### Browser-Support

- **Moderne Browser:** Chrome, Firefox, Safari, Edge (letzte 2 Versionen)
- **ES6 Modules:** Werden nativ unterstützt
- **CSS Variables:** Werden nativ unterstützt

---

## ✅ Checkliste für neue Entwickler

- [ ] Projekt lokal gestartet (`python -m http.server 8000`)
- [ ] Struktur verstanden (`STRUCTURE.md` gelesen)
- [ ] HTML-Struktur verstanden (`index.html` durchgesehen)
- [ ] JavaScript-Module verstanden (`pages/` Verzeichnis durchgesehen)
- [ ] CSS-Struktur verstanden (`css/` Verzeichnis durchgesehen)
- [ ] Content geändert (Test: Text in HTML geändert)
- [ ] Bild hinzugefügt (Test: Bild in `assets/images/` hochgeladen)
- [ ] JavaScript-Modul geändert (Test: Testimonial geändert)
- [ ] CSS geändert (Test: Farbe geändert)

---

## 🎯 Nächste Schritte

1. **Projekt lokal starten** und durchsehen
2. **Kleine Änderungen** machen (Text, Bilder)
3. **JavaScript-Module** verstehen
4. **CSS anpassen**
5. **Neue Features** hinzufügen

---

**Viel Erfolg! 🚀**

Bei Fragen oder Problemen: Siehe `Troubleshooting` oder prüfe die Browser-Konsole (F12).
