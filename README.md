# …undbauen

Statische Landing Page – Vanilla HTML/CSS/JS, kein Framework, kein Backend.

## Stack

- **HTML/CSS/JS** – ES6 Modules, kein Build-Step
- **Server** – `serve` (Node.js) für lokale Entwicklung

## Lokaler Server starten

```bash
npm install
npm start
# → http://localhost:8000
```

## Projektstruktur

```
index.html                  # Landing Page
assets/
  css/
    base.css                # Variablen, Reset, globale Komponenten
    public.css              # Seitenspezifische Styles
    components.css          # UI-Komponenten (Modal, FAQ, Hover-Card …)
    fonts.css               # Schriften
  js/
    public.js               # Haupt-Logik (Events, Netzwerk-Slider, FAQ, CTA)
    data.js                 # Statische Daten (Members, Events)
    components/
      heroAnimation.js      # Wort-Rotation im Hero
      hoverCard.js          # Hover-Preview auf Person-Cards
      memberModal.js        # Mitglieder-Detail-Modal
      icons.js              # SVG-Icon-Helper
  img/                      # Bilder
```

## Daten pflegen

Mitglieder und Termine direkt in `assets/js/data.js` bearbeiten – kein Backend, kein API.
