# Verknüpfungs-Diagramm: Frontpage

**Visuelle Übersicht aller Verlinkungen und Abhängigkeiten**

---

## 🔗 HTML → JavaScript Verknüpfungen

### Container-IDs (werden von JavaScript befüllt)

```
index.html
│
├── #socialProofStats ────────┐
│                              │
├── #peopleSlider ────────────┤──→ pages/members.js
│                              │    ├── renderSocialProof()
│                              │    └── renderNetworkSlider()
│                              │
├── #publicEvents ─────────────┼──→ pages/events.js
│                              │    └── renderPublicEvents()
│                              │
├── #publicUpdates ────────────┼──→ pages/updates.js
│                              │    └── renderPublicUpdates()
│                              │
├── #publicPubs ───────────────┼──→ pages/publications.js
│                              │    └── renderPublicPubs()
│                              │
├── #testimonialsGrid ─────────┼──→ pages/misc.js
│                              │    ├── renderTestimonials()
│                              │    ├── renderPartners()
│                              │    └── renderFAQ()
│                              │
├── #partnersGrid ─────────────┤
│                              │
└── #faqContainer ─────────────┘
```

### Navigation-IDs (werden von JavaScript verwendet)

```
index.html
│
├── #searchTrigger ────────────→ public.js → components/search.js
├── #mobileMenuToggle ─────────→ public.js → toggleMobileMenu()
├── #themeToggle ──────────────→ public.js → toggleTheme()
├── #openAuth ─────────────────→ public.js → openAuth()
├── #openAuth2 ────────────────→ public.js → openAuth()
└── #navLinks ─────────────────→ public.js → toggleMobileMenu()
```

### Modal-IDs

```
index.html
│
├── #authOverlay ──────────────→ public.js → openAuth() / closeAuth()
│   ├── #authTitle
│   ├── #panel-login
│   │   ├── #loginEmail
│   │   ├── #loginPass
│   │   └── #doLogin ──────────→ public.js → Login-Handler
│   ├── #panel-register
│   │   ├── #regName
│   │   ├── #regEmail
│   │   ├── #regPass
│   │   └── #doRegister ───────→ public.js → Register-Handler
│   └── #panel-forgot
│       ├── #fpEmail
│       └── #doForgot ──────────→ public.js → Forgot-Handler
│
└── #eventDetailsOverlay ─────→ pages/events.js → openEventDetails()
    ├── #eventDetailsTitle
    └── #eventDetailsContent
```

---

## 📊 JavaScript-Module Verknüpfungen

### public.js (Entry Point)

```
public.js (429 Zeilen)
│
├── Imports (Zeile 6-21)
│   ├── services/apiClient.js
│   ├── components/* (9 Components)
│   └── pages/* (5 Page-Module)
│
├── Globale Funktionen (Zeile 35-200)
│   ├── openAuth() ────────────→ Öffnet #authOverlay
│   ├── closeAuth() ───────────→ Schließt #authOverlay
│   ├── toggleTheme() ─────────→ Wechselt Theme
│   ├── toggleMobileMenu() ────→ Mobile Menü
│   └── setTab() ──────────────→ Auth-Modal Tabs
│
└── DOMContentLoaded (Zeile 295-450)
    ├── initTheme()
    ├── heroAnimation.init()
    ├── memberModal.init()
    ├── lazyLoader.init()
    ├── scrollNavigation.init()
    ├── renderPublicEvents() ──→ pages/events.js
    ├── renderPublicUpdates() ──→ pages/updates.js
    ├── renderPublicPubs() ────→ pages/publications.js
    ├── renderSocialProof() ────→ pages/members.js
    ├── renderNetworkSlider() ──→ pages/members.js
    ├── renderTestimonials() ───→ pages/misc.js
    ├── renderPartners() ───────→ pages/misc.js
    └── renderFAQ() ────────────→ pages/misc.js
```

### Page-Module Abhängigkeiten

```
pages/events.js
│
├── Importiert:
│   ├── services/apiClient.js ──→ api.listEvents()
│   └── components/icons.js ────→ getIcon()
│
└── Rendert:
    └── #publicEvents

pages/updates.js
│
├── Importiert:
│   └── services/apiClient.js ─→ api.listUpdatesPublic()
│
└── Rendert:
    └── #publicUpdates

pages/publications.js
│
├── Importiert:
│   ├── services/apiClient.js ─→ api.listPublicationsPublic()
│   └── components/icons.js ───→ getIcon()
│
└── Rendert:
    └── #publicPubs

pages/members.js
│
├── Importiert:
│   ├── services/apiClient.js ─→ api.listMembersPublic()
│   ├── components/hoverCard.js → hoverCard.show()
│   ├── components/memberModal.js → memberModal.show()
│   └── components/icons.js ────→ getIcon()
│
└── Rendert:
    ├── #socialProofStats
    └── #peopleSlider

pages/misc.js
│
├── Importiert:
│   └── (keine, nur Utilities)
│
└── Rendert:
    ├── #testimonialsGrid
    ├── #partnersGrid
    └── #faqContainer
```

---

## 🗄️ Datenfluss

### Datenquelle → Rendering

```
storageAdapter.js (Datenquelle)
│
├── listEvents() ───────────────┐
│                               │
├── listUpdatesPublic() ────────┼──→ apiClient.js
│                               │    │
├── listPublicationsPublic() ───┤    │
│                               │    │
└── listMembersPublic() ────────┘    │
                                      │
                                      ↓
                              pages/*.js (Rendering)
                                      │
                                      ↓
                              index.html (#container)
```

### Beispiel: Events-Rendering

```
1. Browser lädt index.html
   └── Script-Tag: <script src="assets/js/public.js">
       │
       ↓
2. public.js wird geladen
   └── Importiert: pages/events.js
       │
       ↓
3. DOMContentLoaded Event
   └── Ruft auf: renderPublicEvents()
       │
       ↓
4. pages/events.js → renderPublicEvents()
   └── Ruft auf: api.listEvents()
       │
       ↓
5. apiClient.js → listEvents()
   └── Ruft auf: storageAdapter.listEvents()
       │
       ↓
6. storageAdapter.js → listEvents()
   └── Gibt zurück: Array von Events
       │
       ↓
7. pages/events.js → renderPublicEvents()
   └── Rendert HTML
       │
       ↓
8. HTML wird eingefügt in: #publicEvents
```

---

## 🖼️ Bild-Verlinkungen

### Statische Bilder (direkt im HTML)

```
index.html
│
├── Mission-Bilder (Zeile 142-144)
│   └── src="https://images.unsplash.com/..."
│
├── Topics-Bilder (Zeile 233, 243, 253, 263)
│   └── src="https://images.unsplash.com/..."
│
└── Community-Bild (Zeile 209)
    └── src="https://images.unsplash.com/..."
```

**So ändern:**
- Direkt in `index.html` ändern
- Oder: Lokale Bilder verwenden: `src="assets/images/bild.jpg"`

### Dynamische Bilder (über JavaScript)

```
pages/events.js
│
└── getEventImage() ──────────→ Gibt Bild-URL zurück
    └── Verwendet: Unsplash URLs oder lokale Bilder

pages/publications.js
│
└── pubImages Array ───────────→ Array von Bild-URLs
    └── Verwendet: Unsplash URLs oder lokale Bilder

pages/members.js
│
└── defaultPortraits Array ────→ Array von Avatar-URLs
    └── Verwendet: Unsplash URLs oder lokale Bilder
```

**So ändern:**
- Öffne entsprechende JavaScript-Datei
- Ändere Bild-URLs im Array oder in der Funktion

---

## 🎨 CSS-Verlinkungen

### CSS-Dateien werden geladen von:

```
index.html (Zeile 36-38)
│
├── <link href="assets/css/base.css">
├── <link href="assets/css/public.css">
└── <link href="assets/css/components.css">
```

### CSS-Klassen werden verwendet von:

```
HTML-Klassen → CSS-Dateien
│
├── .hero ─────────────────────→ public.css
├── .section ──────────────────→ base.css
├── .container ────────────────→ base.css
├── .btn ──────────────────────→ components.css
├── .modal ────────────────────→ components.css
├── .card ─────────────────────→ components.css
└── .person-card ───────────────→ public.css
```

---

## 📦 Component-Verlinkungen

### Components werden verwendet von:

```
components/heroAnimation.js
└── Wird verwendet von: public.js (Zeile 250)

components/memberModal.js
└── Wird verwendet von: pages/members.js (Zeile 250)

components/hoverCard.js
└── Wird verwendet von: pages/members.js (Zeile 270)

components/toast.js
└── Wird verwendet von: public.js (Zeile 380, 390)

components/search.js
└── Wird verwendet von: public.js (Zeile 302)
    └── #searchTrigger Button

components/lazyLoad.js
└── Wird verwendet von: public.js (Zeile 240)

components/scrollNavigation.js
└── Wird verwendet von: public.js (Zeile 245)

components/parallax.js
└── Wird verwendet von: public.js (Zeile 28-32)
    └── Nur wenn .hero-network-visual vorhanden

components/icons.js
└── Wird verwendet von:
    ├── pages/events.js
    ├── pages/publications.js
    └── pages/members.js
```

---

## 🔄 Event-Handler Verknüpfungen

### Click-Handler

```
index.html Element → public.js Handler
│
├── #searchTrigger ────────────→ globalSearch.open()
├── #mobileMenuToggle ─────────→ toggleMobileMenu()
├── #themeToggle ───────────────→ toggleTheme()
├── #openAuth ──────────────────→ openAuth()
├── #openAuth2 ─────────────────→ openAuth()
├── #closeAuth ─────────────────→ closeAuth()
├── #doLogin ───────────────────→ Login-Handler (Zeile 380)
├── #doRegister ────────────────→ Register-Handler (Zeile 400)
├── #doForgot ──────────────────→ Forgot-Handler (Zeile 420)
├── #closeEventDetails ─────────→ closeEventDetails()
└── .tab (data-tab) ────────────→ setTab()
```

### Dynamische Handler (werden von Page-Modulen erstellt)

```
pages/events.js
│
└── [data-open-event-details] ──→ openEventDetails()
    └── Wird erstellt in: renderPublicEvents()

pages/members.js
│
└── .person-card ───────────────→ memberModal.show()
    └── Wird erstellt in: renderNetworkSlider()
```

---

## 📍 Navigation-Anchors

### Section-Anchors (für Scroll-Navigation)

```
Navigation-Link → HTML-Section
│
├── #home ──────────────────────→ <section id="home">
├── #netzwerk ──────────────────→ <section id="netzwerk">
├── #termine ───────────────────→ <section id="termine">
├── #updates ───────────────────→ <section id="updates">
├── #publikationen ─────────────→ <section id="publikationen">
├── #ueber ─────────────────────→ <section id="ueber">
├── #kontakt ───────────────────→ <section id="kontakt">
├── #testimonials ──────────────→ <section id="testimonials">
├── #partners ──────────────────→ <section id="partners">
└── #faq ───────────────────────→ <section id="faq">
```

**Wichtig:** Diese IDs müssen im HTML vorhanden sein, damit die Navigation funktioniert!

---

## 🎯 Zusammenfassung

### Datenfluss

```
storageAdapter.js (Daten)
    ↓
apiClient.js (API-Interface)
    ↓
pages/*.js (Rendering)
    ↓
index.html (#container)
```

### Rendering-Flow

```
public.js (Entry Point)
    ↓
DOMContentLoaded Event
    ↓
Render-Funktionen aufrufen
    ↓
Page-Module rendern HTML
    ↓
HTML wird in Container eingefügt
```

### Event-Flow

```
User-Interaktion (Click, etc.)
    ↓
Event-Handler in public.js
    ↓
Funktion wird ausgeführt
    ↓
UI wird aktualisiert
```

---

**Weitere Details:** Siehe `ENTWICKLER_ANLEITUNG.md`
