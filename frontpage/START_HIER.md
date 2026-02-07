# 🚀 START HIER - Für neue Entwickler

**Willkommen! Diese Datei ist dein Einstiegspunkt.**

---

## 📚 Dokumentations-Übersicht

### Für absolute Anfänger

1. **[START_HIER.md](./START_HIER.md)** ← Du bist hier!
2. **[ENTWICKLER_ANLEITUNG.md](./ENTWICKLER_ANLEITUNG.md)** - Vollständige Anleitung (26 KB)
3. **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)** - Bilder & Content ändern (12 KB)
4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Schnelle Referenz (6 KB)

### Für Fortgeschrittene

5. **[STRUCTURE.md](./STRUCTURE.md)** - Detaillierte Struktur-Erklärung
6. **[OPTIMIERUNGS_ANALYSE.md](./OPTIMIERUNGS_ANALYSE.md)** - Technische Details
7. **[README.md](./README.md)** - Projekt-Übersicht

---

## ⚡ Schnellstart (5 Minuten)

### 1. Projekt starten

```bash
cd frontpage
python -m http.server 8000
```

Öffne: http://localhost:8000

### 2. Wichtige Dateien kennenlernen

| Datei | Was ist das? |
|-------|--------------|
| `index.html` | Die einzige HTML-Datei (Frontpage) |
| `assets/js/public.js` | Haupt-App (koordiniert alles) |
| `assets/js/pages/` | Page-Module (Events, Updates, etc.) |
| `assets/css/` | Stylesheets (3 Dateien) |
| `assets/images/` | Bilder-Verzeichnis (aktuell leer) |

### 3. Erste Änderung machen

**Text ändern:**

1. Öffne `index.html`
2. Finde Zeile 129: `<p class="hero-subtitle">...`
3. Ändere den Text
4. Speichern & Browser aktualisieren

**Bild hinzufügen:**

1. Lade Bild hoch: `assets/images/mein-bild.jpg`
2. Öffne `index.html` Zeile 142
3. Ändere: `<img src="assets/images/mein-bild.jpg" ...`
4. Speichern & Browser aktualisieren

---

## 🗺️ Wie ist die Frontpage aufgebaut?

### HTML-Struktur (index.html)

```
index.html
├── <head>                    # Meta-Tags, CSS, Fonts
├── <header>                  # Navigation
├── <main>                    # Hauptinhalt
│   ├── Hero                  # Große Überschrift
│   ├── Mission               # Text + Bilder
│   ├── Innovationsabend      # Statische Cards
│   ├── Netzwerk              # Wird von JavaScript befüllt
│   ├── Termine               # Wird von JavaScript befüllt
│   ├── Updates               # Wird von JavaScript befüllt
│   ├── Publikationen         # Wird von JavaScript befüllt
│   ├── Über uns              # Statischer Text
│   ├── Testimonials          # Wird von JavaScript befüllt
│   ├── Partners              # Wird von JavaScript befüllt
│   └── FAQ                   # Wird von JavaScript befüllt
└── Modals                    # Login, Event-Details
```

### JavaScript-Struktur

```
public.js (Entry Point)
├── Importiert alle Page-Module
├── Initialisiert Components
└── Ruft Render-Funktionen auf

Page-Module (pages/)
├── events.js      → Rendert #publicEvents
├── updates.js    → Rendert #publicUpdates
├── publications.js → Rendert #publicPubs
├── members.js    → Rendert #peopleSlider, #socialProofStats
└── misc.js       → Rendert #testimonialsGrid, #partnersGrid, #faqContainer
```

### CSS-Struktur

```
base.css          → Basis-Styles (Variablen, Reset)
public.css        → Public-spezifische Styles
components.css    → Komponenten-Styles (Modal, Toast, etc.)
```

---

## 🔗 Wichtige Verlinkungen

### HTML → JavaScript

| HTML-ID | JavaScript-Datei | Funktion |
|---------|-----------------|----------|
| `#publicEvents` | `pages/events.js` | `renderPublicEvents()` |
| `#publicUpdates` | `pages/updates.js` | `renderPublicUpdates()` |
| `#publicPubs` | `pages/publications.js` | `renderPublicPubs()` |
| `#peopleSlider` | `pages/members.js` | `renderNetworkSlider()` |
| `#socialProofStats` | `pages/members.js` | `renderSocialProof()` |
| `#testimonialsGrid` | `pages/misc.js` | `renderTestimonials()` |
| `#partnersGrid` | `pages/misc.js` | `renderPartners()` |
| `#faqContainer` | `pages/misc.js` | `renderFAQ()` |

### JavaScript → Daten

| JavaScript-Funktion | Datenquelle |
|---------------------|-------------|
| `renderPublicEvents()` | `api.listEvents()` → `storageAdapter.js` |
| `renderPublicUpdates()` | `api.listUpdatesPublic()` → `storageAdapter.js` |
| `renderPublicPubs()` | `api.listPublicationsPublic()` → `storageAdapter.js` |
| `renderNetworkSlider()` | `api.listMembersPublic()` → `storageAdapter.js` |

---

## 📝 Häufige Aufgaben

### Text ändern

**Statisch (direkt im HTML):**
- Hero-Text: `index.html` Zeile 124-129
- Mission-Text: `index.html` Zeile 137-140
- Section-Titel: `index.html` Zeile 152, 178, etc.

**Dynamisch (über JavaScript):**
- Testimonials: `pages/misc.js` Zeile 20-60
- FAQ: `pages/misc.js` Zeile 120-200
- Partners: `pages/misc.js` Zeile 70-100

### Bilder ändern

**Statisch (direkt im HTML):**
- Mission-Bilder: `index.html` Zeile 142-144
- Topics-Bilder: `index.html` Zeile 233, 243, etc.

**Dynamisch (über JavaScript):**
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

---

## 🎯 Nächste Schritte

1. ✅ **Projekt lokal starten** (siehe oben)
2. ✅ **Kleine Änderung machen** (Text oder Bild)
3. 📖 **ENTWICKLER_ANLEITUNG.md lesen** (vollständige Anleitung)
4. 📖 **CONTENT_GUIDE.md lesen** (Bilder & Content)
5. 🔍 **Code durchsehen** (HTML, JavaScript, CSS)

---

## ❓ Hilfe benötigt?

1. **Browser-Konsole öffnen** (F12) → Prüfe Fehler
2. **QUICK_REFERENCE.md** → Schnelle Übersicht
3. **ENTWICKLER_ANLEITUNG.md** → Vollständige Anleitung
4. **Troubleshooting** → Siehe `ENTWICKLER_ANLEITUNG.md` Abschnitt "Troubleshooting"

---

## 📋 Checkliste für neue Entwickler

- [ ] Projekt lokal gestartet (`python -m http.server 8000`)
- [ ] Browser geöffnet (http://localhost:8000)
- [ ] HTML-Struktur verstanden (`index.html` durchgesehen)
- [ ] JavaScript-Struktur verstanden (`public.js` durchgesehen)
- [ ] Erste Änderung gemacht (Text oder Bild)
- [ ] ENTWICKLER_ANLEITUNG.md gelesen
- [ ] CONTENT_GUIDE.md gelesen

---

**Viel Erfolg! 🚀**

Bei Fragen: Siehe `ENTWICKLER_ANLEITUNG.md` oder prüfe die Browser-Konsole (F12).
