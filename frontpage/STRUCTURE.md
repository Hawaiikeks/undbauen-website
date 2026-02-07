# Frontpage Struktur-Dokumentation

## 📁 Verzeichnisstruktur

```
frontpage/
│
├── index.html                    # Frontpage HTML (Hauptdatei)
│
├── assets/
│   ├── css/
│   │   ├── base.css             # Basis-Styles (Variablen, Reset, Utilities)
│   │   ├── public.css           # Public-spezifische Styles
│   │   └── components.css       # Komponenten-Styles (Modal, Toast, etc.)
│   │
│   ├── js/
│   │   ├── public.js            # Haupt-App (Entry Point)
│   │   │
│   │   ├── components/          # UI-Komponenten (alphabetisch sortiert)
│   │   │   ├── heroAnimation.js    # Hero-Animation mit rotierenden Wörtern
│   │   │   ├── hoverCard.js        # Hover-Karten für Mitglieder-Profile
│   │   │   ├── icons.js            # Icon-System (Lucide Icons)
│   │   │   ├── lazyLoad.js         # Lazy Loading für Bilder
│   │   │   ├── memberModal.js      # Modal für Mitglieder-Details
│   │   │   ├── parallax.js         # Parallax-Effekte für Hero-Section
│   │   │   ├── scrollNavigation.js # Scroll-Navigation & Scroll-to-Top
│   │   │   ├── search.js           # Globale Suche (Ctrl+K)
│   │   │   └── toast.js            # Toast-Benachrichtigungen
│   │   │
│   │   └── services/            # Services (alphabetisch sortiert)
│   │       ├── apiClient.js        # API-Schnittstelle (vereinfacht)
│   │       ├── metaTags.js         # SEO Meta-Tags Management
│   │       └── storageAdapter.js   # Daten-Speicherung (vereinfacht)
│   │
│   └── images/                  # Bilder (falls vorhanden)
│
├── README.md                    # Haupt-Dokumentation
└── STRUCTURE.md                 # Diese Datei (Struktur-Dokumentation)
```

---

## 📋 Datei-Beschreibungen

### HTML

#### `index.html`
- **Zweck:** Haupt-HTML-Datei der Frontpage
- **Enthält:** Alle Sections (Hero, Network, Events, etc.), Modals (Auth, Event Details)
- **Lädt:** CSS (base.css, public.css, components.css) und JavaScript (public.js)

---

### CSS

#### `assets/css/base.css`
- **Zweck:** Basis-Styles für die gesamte Website
- **Enthält:** CSS-Variablen, Reset, Typography, Utilities, Button-System, Card-System
- **Wichtig:** Basis für alle anderen Styles

#### `assets/css/public.css`
- **Zweck:** Public-spezifische Styles
- **Enthält:** Navigation, Hero-Section, Sections, Event-Cards, Network-Slider, etc.

#### `assets/css/components.css`
- **Zweck:** Komponenten-Styles
- **Enthält:** Modal, Toast, Hover-Card, Search-Overlay, etc.

---

### JavaScript - Components

#### `assets/js/components/heroAnimation.js`
- **Zweck:** Hero-Animation mit rotierenden architektonischen Wörtern
- **Export:** `heroAnimation` Object mit `init()` Methode
- **Verwendung:** Wird in `public.js` importiert und initialisiert

#### `assets/js/components/hoverCard.js`
- **Zweck:** Hover-Karten für Mitglieder-Profile
- **Export:** `hoverCard` Object mit `show()` und `hide()` Methoden
- **Verwendung:** Wird in `public.js` importiert

#### `assets/js/components/icons.js`
- **Zweck:** Icon-System mit Lucide Icons
- **Export:** `icons` Object mit SVG-Icons, `getIcon()` Funktion
- **Verwendung:** Wird in `public.js` und anderen Components verwendet

#### `assets/js/components/lazyLoad.js`
- **Zweck:** Lazy Loading für Bilder
- **Export:** `lazyLoader` Object mit `init()` Methode
- **Verwendung:** Wird in `public.js` importiert und initialisiert

#### `assets/js/components/memberModal.js`
- **Zweck:** Modal für Mitglieder-Details
- **Export:** `memberModal` Object mit `init()` und `show()` Methoden
- **Verwendung:** Wird in `public.js` importiert

#### `assets/js/components/parallax.js`
- **Zweck:** Parallax-Effekte für Hero-Section
- **Export:** `parallaxHero` Object mit `init()` Methode
- **Verwendung:** Wird dynamisch in `public.js` geladen (nur wenn Hero-Section vorhanden)

#### `assets/js/components/scrollNavigation.js`
- **Zweck:** Scroll-Navigation & Scroll-to-Top Button
- **Export:** `scrollNavigation` Object mit `init()` Methode
- **Verwendung:** Wird in `public.js` importiert und initialisiert

#### `assets/js/components/search.js`
- **Zweck:** Globale Suche (Ctrl+K)
- **Export:** `globalSearch` Object mit `init()` Methode
- **Verwendung:** Wird in `public.js` importiert

#### `assets/js/components/toast.js`
- **Zweck:** Toast-Benachrichtigungen
- **Export:** `toast` Object mit `success()`, `error()`, `info()` Methoden
- **Verwendung:** Wird in `public.js` importiert

---

### JavaScript - Services

#### `assets/js/services/apiClient.js`
- **Zweck:** Zentrale API-Schnittstelle
- **Export:** `api` Object (vereinfacht, nur Public-Funktionen)
- **Verwendung:** Wird in `public.js` und Components verwendet

#### `assets/js/services/metaTags.js`
- **Zweck:** SEO Meta-Tags Management
- **Export:** `setMetaTags()`, `initDefaultMetaTags()` Funktionen
- **Verwendung:** Wird in `index.html` verwendet

#### `assets/js/services/storageAdapter.js`
- **Zweck:** Daten-Speicherung (localStorage)
- **Export:** `storageAdapter` Object (vereinfacht, nur Public-Funktionen)
- **Verwendung:** Wird in `apiClient.js` verwendet

---

### JavaScript - Main

#### `assets/js/public.js`
- **Zweck:** Haupt-App (Entry Point)
- **Enthält:** Alle Frontpage-Logik (Events, Members, Updates, etc.)
- **Imports:** Alle Components und Services
- **Initialisiert:** Alle Components beim Laden

---

## 🔗 Abhängigkeiten

### Abhängigkeits-Graph:

```
index.html
  ↓
public.js
  ↓
├── apiClient.js → storageAdapter.js
├── toast.js
├── hoverCard.js
├── scrollNavigation.js
├── search.js → apiClient.js
├── lazyLoad.js
├── icons.js
├── memberModal.js → icons.js
├── heroAnimation.js
└── parallax.js (dynamisch)
```

---

## 📊 Datei-Statistiken

| Kategorie | Anzahl | Gesamt-Größe |
|-----------|--------|--------------|
| **HTML** | 1 | ~15 KB |
| **CSS** | 3 | ~50 KB |
| **Components** | 9 | ~30 KB |
| **Services** | 3 | ~250 KB (storageAdapter vereinfacht) |
| **Main** | 1 | ~80 KB |
| **Gesamt** | **17 Dateien** | **~425 KB** |

---

## ✅ Qualitäts-Kriterien

### Struktur:
- ✅ Alphabetisch sortiert (Components)
- ✅ Klare Trennung (Components vs. Services)
- ✅ Logische Gruppierung

### Code:
- ✅ JSDoc-Kommentare vorhanden
- ✅ Klare Funktionsnamen
- ✅ Konsistente Patterns

### Dokumentation:
- ✅ README.md erklärt alles
- ✅ STRUCTURE.md erklärt Struktur
- ✅ Kommentare im Code

### Minimalismus:
- ✅ Nur benötigte Dateien
- ✅ Keine Redundanz
- ✅ Klare Abhängigkeiten

---

**Erstellt:** 2024  
**Status:** ✅ Struktur dokumentiert
