# Quick Reference: Frontpage

**Schnelle Übersicht für Entwickler**

---

## 🔗 Wichtige IDs und Container

### HTML-Container (werden von JavaScript befüllt)

| ID | Datei | Funktion | Zeile |
|----|-------|----------|-------|
| `#socialProofStats` | `pages/members.js` | `renderSocialProof()` | index.html:180 |
| `#peopleSlider` | `pages/members.js` | `renderNetworkSlider()` | index.html:200 |
| `#publicEvents` | `pages/events.js` | `renderPublicEvents()` | index.html:215 |
| `#publicUpdates` | `pages/updates.js` | `renderPublicUpdates()` | index.html:225 |
| `#publicPubs` | `pages/publications.js` | `renderPublicPubs()` | index.html:235 |
| `#testimonialsGrid` | `pages/misc.js` | `renderTestimonials()` | index.html:245 |
| `#partnersGrid` | `pages/misc.js` | `renderPartners()` | index.html:255 |
| `#faqContainer` | `pages/misc.js` | `renderFAQ()` | index.html:265 |

### Navigation-IDs

| ID | Funktion | Zeile |
|----|----------|-------|
| `#searchTrigger` | Öffnet globale Suche | index.html:45 |
| `#mobileMenuToggle` | Mobile Menü Toggle | index.html:48 |
| `#navLinks` | Navigation Container | index.html:53 |
| `#themeToggle` | Theme-Wechsel | index.html:60 |
| `#openAuth` | Öffnet Login-Modal | index.html:63 |

### Modal-IDs

| ID | Funktion | Zeile |
|----|----------|-------|
| `#authOverlay` | Auth-Modal Overlay | index.html:475 |
| `#authTitle` | Auth-Modal Titel | index.html:477 |
| `#panel-login` | Login-Panel | index.html:480 |
| `#panel-register` | Register-Panel | index.html:485 |
| `#panel-forgot` | Forgot-Password-Panel | index.html:490 |
| `#doLogin` | Login-Button | index.html:482 |
| `#doRegister` | Register-Button | index.html:487 |
| `#eventDetailsOverlay` | Event-Details-Modal | index.html:500 |
| `#eventDetailsTitle` | Event-Details Titel | index.html:502 |
| `#eventDetailsContent` | Event-Details Content | index.html:503 |

### Section-Anchors (für Navigation)

| ID | Sektion | Zeile |
|----|---------|-------|
| `#home` | Hero | index.html:70 |
| `#netzwerk` | Netzwerk | index.html:176 |
| `#termine` | Termine | index.html:211 |
| `#updates` | Monatsupdates | index.html:221 |
| `#publikationen` | Publikationen | index.html:231 |
| `#ueber` | Über uns | index.html:241 |
| `#kontakt` | Kontakt | index.html:251 |
| `#testimonials` | Testimonials | index.html:261 |
| `#partners` | Partner | index.html:271 |
| `#faq` | FAQ | index.html:281 |

---

## 📁 Datei-Übersicht

### JavaScript-Module

| Datei | Zeilen | Aufgabe |
|-------|--------|---------|
| `public.js` | 429 | Haupt-App (Entry Point) |
| `pages/events.js` | 208 | Events-Rendering |
| `pages/updates.js` | 80 | Updates-Rendering |
| `pages/publications.js` | 99 | Publications-Rendering |
| `pages/members.js` | 466 | Members-Rendering |
| `pages/misc.js` | 213 | Testimonials, Partners, FAQ |

### CSS-Dateien

| Datei | Größe | Aufgabe |
|-------|-------|---------|
| `base.css` | 36.5 KB | Basis-Styles (Variablen, Reset) |
| `public.css` | 18.2 KB | Public-spezifische Styles |
| `components.css` | 24.6 KB | Komponenten-Styles |

---

## 🎯 Häufige Aufgaben

### Text ändern

**Statisch (HTML):**
- Hero-Text: `index.html` Zeile 124-128
- Mission-Text: `index.html` Zeile 137-140
- Section-Titel: `index.html` Zeile 152, 179, etc.

**Dynamisch (JavaScript):**
- Testimonials: `pages/misc.js` Zeile 20-60
- FAQ: `pages/misc.js` Zeile 120-200
- Partners: `pages/misc.js` Zeile 70-100

### Bilder ändern

**Statisch (HTML):**
- Mission-Bilder: `index.html` Zeile 141-149

**Dynamisch (JavaScript):**
- Event-Bilder: `pages/events.js` Zeile 50-80
- Publication-Bilder: `pages/publications.js` Zeile 30-40
- Member-Avatare: `pages/members.js` Zeile 120-130

### Daten ändern

**Events:**
- `services/storageAdapter.js` Zeile 150-200 (`listEvents()`)

**Updates:**
- `services/storageAdapter.js` Zeile 200-250 (`listUpdatesPublic()`)

**Publications:**
- `services/storageAdapter.js` Zeile 250-300 (`listPublicationsPublic()`)

**Members:**
- `services/storageAdapter.js` Zeile 300-350 (`listMembersPublic()`)

### Styles ändern

**Farben:**
- `base.css` Zeile 10-30 (CSS-Variablen)

**Hero-Design:**
- `public.css` Zeile 1-100

**Button-Design:**
- `components.css` Zeile 1-100

---

## 🔧 Schnell-Befehle

### Server starten
```bash
cd frontpage
python -m http.server 8000
```

### Dateien zählen
```bash
# JavaScript-Dateien
Get-ChildItem -Path "frontpage/assets/js" -Recurse -File | Measure-Object

# CSS-Dateien
Get-ChildItem -Path "frontpage/assets/css" -File | Measure-Object
```

### Zeilen zählen
```bash
# JavaScript-Zeilen
(Get-Content "frontpage/assets/js/public.js" | Measure-Object -Line).Lines
```

---

## 📝 Code-Beispiele

### Neues Testimonial hinzufügen

**Datei:** `assets/js/pages/misc.js` Zeile 20-60

```javascript
const testimonials = [
  {
    name: "Neuer Name",
    role: "Neue Rolle",
    company: "Neue Firma",
    quote: "Neues Zitat...",
    avatar: "assets/images/avatars/avatar.jpg"  // Optional
  },
  // ... weitere Testimonials
];
```

### Neues Event hinzufügen

**Datei:** `assets/js/services/storageAdapter.js` Zeile 150-200

```javascript
function listEvents() {
  const events = getJSON(K.events) || [];
  return [
    {
      id: "event_new",
      title: "Neues Event",
      date: "2024-02-15",
      time: "18:00",
      format: "Innovationsabend",
      location: "Berlin",
      description: "Beschreibung...",
      tags: ["Tag1", "Tag2"]
    },
    // ... weitere Events
  ];
}
```

### Neue Farbe setzen

**Datei:** `assets/css/base.css` Zeile 10-30

```css
:root {
  --primary: #2563eb;  /* Ändere diese Farbe */
  --accent: #7c3aed;   /* Ändere diese Farbe */
}
```

---

## 🐛 Häufige Probleme

### Content wird nicht angezeigt
1. Prüfe Browser-Konsole (F12)
2. Prüfe Container-ID: `document.querySelector('#containerId')`
3. Prüfe Render-Funktion: Wird sie aufgerufen?

### Bilder werden nicht geladen
1. Prüfe Bild-Pfad (relativ zu `index.html`)
2. Prüfe, ob Bild existiert
3. Prüfe Browser-Konsole auf 404-Fehler

### JavaScript-Fehler
1. Öffne Browser-Konsole (F12)
2. Prüfe Fehlermeldung
3. Prüfe Imports: Sind sie korrekt?

---

**Weitere Details:** Siehe `ENTWICKLER_ANLEITUNG.md`
