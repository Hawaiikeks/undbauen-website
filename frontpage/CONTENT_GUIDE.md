# Content-Guide: Bilder und Content einfügen/ändern

**Praktische Anleitung für Content-Manager und Entwickler**

---

## 📋 Inhaltsverzeichnis

1. [Bilder hinzufügen](#bilder-hinzufügen)
2. [Text ändern](#text-ändern)
3. [Events ändern](#events-ändern)
4. [Updates ändern](#updates-ändern)
5. [Publications ändern](#publications-ändern)
6. [Testimonials ändern](#testimonials-ändern)
7. [Partners ändern](#partners-ändern)
8. [FAQ ändern](#faq-ändern)
9. [Member-Avatare ändern](#member-avatare-ändern)

---

## 🖼️ Bilder hinzufügen

### Schritt 1: Bild vorbereiten

**Empfohlene Formate:**
- **WebP** (moderne Browser, beste Kompression)
- **JPG** (für Fotos)
- **PNG** (für Logos mit Transparenz)

**Empfohlene Größen:**
- Hero-Bilder: **1920x1080px** (max. 500 KB)
- Event-Bilder: **800x600px** (max. 200 KB)
- Avatar-Bilder: **400x400px** (max. 100 KB)
- Partner-Logos: **200x100px** (max. 50 KB)

**Bild-Optimierung:**
- Verwende Tools wie [TinyPNG](https://tinypng.com/) oder [ImageOptim](https://imageoptim.com/)
- Komprimiere Bilder vor dem Upload

### Schritt 2: Bild hochladen

1. Erstelle Verzeichnisstruktur (falls nicht vorhanden):
```
frontpage/assets/images/
├── events/          # Event-Bilder
├── avatars/         # Avatar-Bilder
├── partners/        # Partner-Logos
└── hero/            # Hero-Bilder
```

2. Lade Bild hoch:
```
frontpage/assets/images/events/event-januar.jpg
```

### Schritt 3: Bild einbinden

**Option A: Statisches Bild (direkt im HTML)**

1. Öffne `index.html`
2. Finde die Stelle, wo das Bild eingefügt werden soll
3. Füge hinzu:
```html
<img src="assets/images/events/event-januar.jpg" alt="Event Januar 2024" loading="lazy" />
```

**Beispiel: Mission-Bilder ändern**

1. Öffne `index.html` Zeile 141-149
2. Ändere:
```html
<div class="mission-images">
  <img src="assets/images/mission1.jpg" alt="Mission Bild 1" loading="lazy" />
  <img src="assets/images/mission2.jpg" alt="Mission Bild 2" loading="lazy" />
</div>
```

**Option B: Dynamisches Bild (über JavaScript)**

**Event-Bilder ändern:**

1. Öffne `assets/js/pages/events.js`
2. Finde Zeile 50-80: `getEventImage()` Funktion
3. Ändere:
```javascript
const getEventImage = (ev, index = 0) => {
  const format = (ev.format || "").toLowerCase();
  
  if (format.includes("innovationsabend")) {
    // Lokale Bilder verwenden
    const localImages = [
      'assets/images/events/innovation-1.jpg',
      'assets/images/events/innovation-2.jpg',
      'assets/images/events/innovation-3.jpg',
      'assets/images/events/innovation-4.jpg'
    ];
    return localImages[index % localImages.length];
  }
  
  // Fallback zu Unsplash
  return 'https://images.unsplash.com/...';
};
```

**Publication-Bilder ändern:**

1. Öffne `assets/js/pages/publications.js`
2. Finde Zeile 30-40: `pubImages` Array
3. Ändere:
```javascript
const pubImages = [
  'assets/images/publications/pub1.jpg',
  'assets/images/publications/pub2.jpg',
  'assets/images/publications/pub3.jpg',
];
```

---

## ✏️ Text ändern

### Statischer Text (direkt im HTML)

**Hero-Überschrift ändern:**

1. Öffne `index.html` Zeile 124-128
2. Ändere:
```html
<h1 id="hero-heading">
  <div class="headline-wrapper">
    Dein neuer Text hier
  </div>
</h1>
```

**Hero-Untertitel ändern:**

1. Öffne `index.html` Zeile 129
2. Ändere:
```html
<p class="hero-subtitle">Dein neuer Untertitel hier</p>
```

**Mission-Text ändern:**

1. Öffne `index.html` Zeile 137-140
2. Ändere:
```html
<div class="mission-text">
  <p>Dein neuer Mission-Text hier</p>
</div>
```

**Section-Titel ändern:**

1. Öffne `index.html`
2. Finde den gewünschten `<h2>` Tag
3. Ändere den Text direkt

### Dynamischer Text (über JavaScript)

**Testimonials ändern:**

1. Öffne `assets/js/pages/misc.js`
2. Finde Zeile 20-60: `renderTestimonials()` Funktion
3. Ändere das `testimonials` Array:
```javascript
const testimonials = [
  {
    name: "Max Mustermann",
    role: "Architekt",
    company: "Mustermann Architekten",
    quote: "Dein neues Zitat hier...",
    avatar: "assets/images/avatars/max.jpg"  // Optional
  },
  // Füge weitere Testimonials hinzu...
];
```

**FAQ ändern:**

1. Öffne `assets/js/pages/misc.js`
2. Finde Zeile 120-200: `renderFAQ()` Funktion
3. Ändere das `faqs` Array:
```javascript
const faqs = [
  {
    question: "Deine neue Frage?",
    answer: "Deine neue Antwort hier..."
  },
  // Füge weitere FAQs hinzu...
];
```

---

## 📅 Events ändern

### Events hinzufügen/ändern

**Datei:** `assets/js/services/storageAdapter.js`

**Funktion:** `listEvents()` (Zeile ~150-200)

**Schritt 1: Funktion finden**

1. Öffne `assets/js/services/storageAdapter.js`
2. Suche nach `function listEvents()` oder `export const listEvents`

**Schritt 2: Event hinzufügen**

```javascript
function listEvents() {
  const events = getJSON(K.events) || [];
  return [
    {
      id: "event_2024_02",
      title: "Innovationsabend Februar 2024",
      date: "2024-02-15",
      time: "18:00",
      format: "Innovationsabend",
      location: "Berlin, Hauptstraße 123",
      description: "Beschreibung des Events...",
      descriptionPublic: "Öffentliche Beschreibung...",
      capacity: 50,
      durationMinutes: 120,
      tags: ["Innovation", "Networking", "Architektur"]
    },
    // ... weitere Events
  ];
}
```

**Wichtig:**
- `id` muss eindeutig sein
- `date` Format: `YYYY-MM-DD`
- `time` Format: `HH:MM`
- `tags` ist ein Array von Strings

**Schritt 3: Event-Bild zuordnen**

1. Öffne `assets/js/pages/events.js`
2. Finde `getEventImage()` Funktion (Zeile 50-80)
3. Füge Logik hinzu, um Event-Bilder zuzuordnen:
```javascript
const getEventImage = (ev, index = 0) => {
  // Spezifisches Bild für Event-ID
  if (ev.id === "event_2024_02") {
    return 'assets/images/events/event-februar.jpg';
  }
  
  // Standard-Logik
  const format = (ev.format || "").toLowerCase();
  // ...
};
```

---

## 📰 Updates ändern

### Updates hinzufügen/ändern

**Datei:** `assets/js/services/storageAdapter.js`

**Funktion:** `listUpdatesPublic()` (Zeile ~200-250)

**Schritt 1: Update hinzufügen**

```javascript
function listUpdatesPublic() {
  const updates = getJSON(K.cmsUpdates) || [];
  return [
    {
      id: "update_2024_02",
      title: "Monatsupdate Februar 2024",
      intro: "Kurze Einleitung zum Update...",
      highlights: [
        "Highlight 1",
        "Highlight 2",
        "Highlight 3"
      ],
      createdAt: "2024-02-01T00:00:00Z",
      date: "2024-02-01"
    },
    // ... weitere Updates
  ];
}
```

**Wichtig:**
- `createdAt` Format: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
- `highlights` ist ein Array von Strings (max. 3 werden angezeigt)

---

## 📚 Publications ändern

### Publications hinzufügen/ändern

**Datei:** `assets/js/services/storageAdapter.js`

**Funktion:** `listPublicationsPublic()` (Zeile ~250-300)

**Schritt 1: Publication hinzufügen**

```javascript
function listPublicationsPublic() {
  const pubs = getJSON(K.cmsPubs) || [];
  return [
    {
      id: "pub_2024_01",
      title: "Neue Publikation",
      abstract: "Zusammenfassung der Publikation...",
      tags: ["Tag1", "Tag2", "Tag3"],
      createdAt: "2024-01-15T00:00:00Z",
      date: "2024-01-15",
      downloadUrl: "https://example.com/pub.pdf"  // Optional
    },
    // ... weitere Publications
  ];
}
```

**Schritt 2: Publication-Bild zuordnen**

1. Öffne `assets/js/pages/publications.js`
2. Finde `pubImages` Array (Zeile 30-40)
3. Füge Bild hinzu:
```javascript
const pubImages = [
  'assets/images/publications/pub1.jpg',
  'assets/images/publications/pub2.jpg',
  'assets/images/publications/pub3.jpg',
  'assets/images/publications/pub4.jpg',  // Neues Bild
];
```

---

## 💬 Testimonials ändern

### Testimonials hinzufügen/ändern

**Datei:** `assets/js/pages/misc.js`

**Funktion:** `renderTestimonials()` (Zeile 20-60)

**Schritt 1: Testimonial hinzufügen**

```javascript
const testimonials = [
  {
    name: "Anna Schmidt",
    role: "Projektleiterin",
    company: "Schmidt Bau GmbH",
    quote: "…undbauen hat mir geholfen, wertvolle Kontakte zu knüpfen...",
    avatar: "assets/images/avatars/anna.jpg"  // Optional
  },
  // Füge weitere Testimonials hinzu...
];
```

**Schritt 2: Avatar-Bild hinzufügen**

1. Lade Avatar-Bild hoch: `assets/images/avatars/anna.jpg`
2. Setze `avatar` Property im Testimonial-Objekt

**Wichtig:**
- Wenn `avatar` null ist, wird ein Initials-Platzhalter angezeigt
- Avatar-Bild sollte quadratisch sein (400x400px empfohlen)

---

## 🤝 Partners ändern

### Partners hinzufügen/ändern

**Datei:** `assets/js/pages/misc.js`

**Funktion:** `renderPartners()` (Zeile 70-100)

**Schritt 1: Partner hinzufügen**

```javascript
const partners = [
  {
    name: "Partner Name",
    logo: "assets/images/partners/partner1.png",
    url: "https://partner-website.com"
  },
  // Füge weitere Partner hinzu...
];
```

**Schritt 2: Logo-Bild hinzufügen**

1. Lade Logo hoch: `assets/images/partners/partner1.png`
2. Setze `logo` Property im Partner-Objekt

**Wichtig:**
- Logo sollte transparenten Hintergrund haben (PNG)
- Empfohlene Größe: 200x100px
- Wenn `logo` null ist, wird ein Text-Platzhalter angezeigt

---

## ❓ FAQ ändern

### FAQ hinzufügen/ändern

**Datei:** `assets/js/pages/misc.js`

**Funktion:** `renderFAQ()` (Zeile 120-200)

**Schritt 1: FAQ hinzufügen**

```javascript
const faqs = [
  {
    question: "Wie kann ich Mitglied werden?",
    answer: "Sie können sich über den 'Mitglied werden'-Button registrieren..."
  },
  {
    question: "Deine neue Frage?",
    answer: "Deine neue Antwort..."
  },
  // Füge weitere FAQs hinzu...
];
```

**Wichtig:**
- FAQs werden automatisch als Accordion gerendert
- Nur eine FAQ kann gleichzeitig geöffnet sein

---

## 👤 Member-Avatare ändern

### Avatar-Bilder ändern

**Datei:** `assets/js/pages/members.js`

**Funktion:** `defaultPortraits` Array (Zeile 120-130)

**Schritt 1: Avatar-Bilder hinzufügen**

1. Lade Avatar-Bilder hoch: `assets/images/avatars/avatar1.jpg`, etc.
2. Öffne `assets/js/pages/members.js`
3. Finde `defaultPortraits` Array (Zeile 120-130)
4. Ändere:
```javascript
const defaultPortraits = [
  'assets/images/avatars/avatar1.jpg',
  'assets/images/avatars/avatar2.jpg',
  'assets/images/avatars/avatar3.jpg',
  // Füge weitere Avatare hinzu...
];
```

**Wichtig:**
- Avatare werden basierend auf Member-Name/E-Mail zugeordnet (Hash-basiert)
- Empfohlene Größe: 400x400px
- Format: JPG oder PNG

---

## ✅ Checkliste für Content-Änderungen

- [ ] Bild vorbereitet (Format, Größe, Kompression)
- [ ] Bild hochgeladen (`assets/images/`)
- [ ] Bild-Pfad korrekt (relativ zu `index.html`)
- [ ] Text geändert (HTML oder JavaScript)
- [ ] Daten-Struktur korrekt (Events, Updates, etc.)
- [ ] Browser-Konsole geprüft (keine Fehler)
- [ ] Lokal getestet (`python -m http.server 8000`)

---

## 🎯 Best Practices

### Bilder

1. **Immer optimieren** vor dem Upload
2. **Beschreibende Dateinamen** verwenden (`event-januar-2024.jpg`)
3. **Alt-Texte** immer setzen (`alt="Beschreibung"`)
4. **Lazy Loading** verwenden (`loading="lazy"`)

### Text

1. **Konsistente Formatierung** verwenden
2. **Kurze, prägnante Texte** schreiben
3. **SEO-freundlich** formulieren

### Daten

1. **Konsistente IDs** verwenden (`event_2024_02`)
2. **Korrekte Datumsformate** verwenden (`YYYY-MM-DD`)
3. **Arrays korrekt formatieren** (Strings in Anführungszeichen)

---

**Weitere Details:** Siehe `ENTWICKLER_ANLEITUNG.md`
