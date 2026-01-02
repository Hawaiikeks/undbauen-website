# Projekt-Fortschritt & Prompts

In diesem Dokument wird der Fortschritt der Entwicklung und die verwendeten Prompts festgehalten.

## Session: 02. Januar 2026

### Aufgabe: Repository installieren und in Node.js App umwandeln

**Prompt 1:**
> installiere https://github.com/Hawaiikeks/undbauen-website

**Aktion:**
- Repository geklont.
- Projektstruktur analysiert.
- Lokale Server-Optionen (Python/Node.js) identifiziert.

**Prompt 2:**
> mach eine node js app daraus.

**Aktion:**
- `npm init -y` ausgeführt.
- `express` installiert.
- `server.js` erstellt (Express-Server für statische Dateien).
- `package.json` aktualisiert (Start-Script hinzugefügt).
- `.gitignore` erstellt.
- `README.md` und `ANLEITUNG.md` aktualisiert.

**Prompt 4:**
> @ls_readme.md

**Aktion:**
- Header aktualisiert (Logo, Menü-Struktur "... & und", "&bau varianten" Login).
- Theme-Toggle in den Footer verschoben.
- Automatische System-Theme-Erkennung implementiert.
- Three.js Hero-Szene erstellt (`hero-scene.html`) und per Iframe eingebunden.
- 3D-Schriftzug "undBau" und Personen-Icons in Three.js implementiert.
- Design-Richtlinien aus `ls_readme.md` beachtet.

**Prompt 5:**
> füge mouse controls hinzuu

**Aktion:**
- `OrbitControls` zur Three.js Hero-Szene hinzugefügt.
- Zoom und Panning deaktiviert (passend für eine Hero-Sektion).
- Damping (Trägheit) für weichere Bewegungen aktiviert.
- Vertikale Rotation eingeschränkt, um den Fokus auf dem Schriftzug zu halten.
- Auto-Rotation als dezente Hintergrundbewegung beibehalten.

**Prompt 6:**
> mach daraus ein leeres iframe

**Aktion:**
- `hero-scene.html` geleert. Die Three.js-Logik wurde entfernt, das Iframe-Grundgerüst bleibt jedoch erhalten.

**Prompt 7:**
> lade das iframe http://localhost:5173/

**Aktion:**
- Die `src` des Iframes in `index.html` auf `http://localhost:5173/` geändert.

**Prompt 8:**
> entferne die iframe änderung wieder

**Aktion:**
- Iframe aus `index.html` entfernt.
- Ursprüngliches SVG-Netzwerk-Visual im Hero-Bereich wiederhergestellt.
- CSS für die Hero-Sektion zurückgesetzt (Iframe-Styles entfernt, SVG-Styles wiederhergestellt).

**Prompt 9:**
> Header kein Text nur dreieck als logo.

**Aktion:**
- Text "…undbauen" aus dem Header und Footer entfernt.
- Logo auf das reine Dreieck (SVG) reduziert.
- Größe des Logos im Header leicht erhöht (32px), um ohne Text präsent zu sein.

**Prompt 10:**
> nur & und im header und vor &Bauen schieben

**Aktion:**
- Den Menüpunkt "... & und" in "& und" umbenannt.
- Den Menüpunkt "& und" in der Navigation nach hinten verschoben, sodass er nun direkt vor dem "&Bauen"-Button steht.

**Prompt 11:**
> Bauen ohne & im header

**Aktion:**
- Das Ampersand (`&`) vom "Bauen"-Button im Header entfernt.

**Prompt 12:**
> stelle die aktuelle text Animation ... und bauen als 3d mit three js dar

**Aktion:**
- Three.js 3D-Animation in `hero-scene.html` erstellt.
- Iframe in `index.html` wiederhergestellt und auf `hero-scene.html` gesetzt.

**Prompt 13:**
> entferne den netzwerk part mit den steckbriefen

**Aktion:**
- Die Sektion "Das Netzwerk" (Slider mit Profilen) aus der `index.html` entfernt.
- Den Link "Netzwerk" aus der Navigationsleiste entfernt.

**Prompt 14:**
> verschiebe Thmen & Inhalte in Publikationen (öffentliche Inhalte)

**Aktion:**
- Die Sektion "Themen & Inhalte" entfernt.
- Die Inhalte (Digitale Transformation, Nachhaltigkeit etc.) in die Sektion "Publikationen" integriert.
- Die Sektion "Publikationen" in "Themen & Publikationen" umbenannt.
- Navigationslink im Dropdown entsprechend angepasst.

**Prompt 15:**
> vorderung soll mouse events durchlassen

**Aktion:**
- `pointer-events: none` explizit für `.hero-content` und `.hero-overlay` sichergestellt.
- `pointer-events: auto` für `.hero-iframe` hinzugefügt, um Interaktion mit der Three.js-Szene zu ermöglichen.

**Prompt 16:**
> ich kann im viewer nicht drehen

**Aktion:**
- `OrbitControls` in `hero-scene.html` wiederhergestellt, die beim Revert der 3D-Animation verloren gegangen waren.
- Damping aktiviert und Zoom/Pan deaktiviert für eine optimale Hero-User-Experience.

**Prompt 17:**
> füge beleuchtung oben rechts hinzu

**Aktion:**
- Ein zusätzliches `PointLight` in der Three.js-Szene oben rechts positioniert (`10, 10, 5`).
- Die Lichtfarbe auf Weiß gesetzt, um einen stärkeren Kontrast und Highlights auf den 3D-Objekten zu erzeugen.

**Prompt 18:**
> Wording zu Hoch PlanenBauenBetreiben
> Wir schaffen Räume für den Dialog zwischen Visionären, Machern und Querdenkern der gebauten Umwelt. In einer Zeit tiefgreifender Transformation braucht es Formate, die verbinden statt trennen, die Fragen stellen statt Antworten zu verkaufen.
> …undbauen ist mehr als ein Netzwerk. Es ist eine Haltung.
> übernimm die Aktuelle Publikationen kachel für Themen & Puplikaitionen entferne dann den bereich. Aktuelle Publikationen

**Aktion:**
- Hero-Untertitel in "PlanenBauenBetreiben" geändert.
- Mission-Text aktualisiert.
- Sektion "Themen & Publikationen" bereinigt: Manuelle Themen-Kacheln entfernt, sodass nur noch die dynamischen Publikations-Kacheln (`publicPubs`) angezeigt werden. Überschrift "Aktuelle Publikationen" entfernt.

**Prompt 19:**
> lege die felder Kommende Termine und Moantsupdes zusammen

**Aktion:**
- Die Sektionen "Kommende Termine" und "Monatsupdates" zu einer neuen Sektion "Termine & Updates" zusammengefasst.
- Navigation und Dropdown-Links entsprechend auf `#updates` (neu: "Termine & Updates") aktualisiert.
- Struktur innerhalb der Sektion mit klaren Zwischenüberschriften verbessert.

**Prompt 20:**
> das es eine mischung der beiden Felder ist

**Aktion:**
- Die getrennten Grids für Termine und Updates in einen gemeinsamen "Mixed Feed" überführt.
- JavaScript angepasst, um Termine und Updates abwechselnd in einem gemeinsamen Container (`#publicMixedFeed`) darzustellen.
- Jeder Karte ein Badge ("Termin" oder "Update") hinzugefügt, um die Herkunft im Mix deutlich zu machen.

**Prompt 21:**
> Einlogen zum Buchen raus wo kahm das her?

**Aktion:**
- Den statischen Text "Innovationsabend: Einloggen zum Buchen." aus den Event-Karten im Mixed Feed entfernt.

