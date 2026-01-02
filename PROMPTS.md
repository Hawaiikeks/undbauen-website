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

