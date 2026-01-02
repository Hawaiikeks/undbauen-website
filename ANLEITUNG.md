# So öffnest du die Website

## Option 1: Server läuft bereits (empfohlen)
Der Server sollte bereits laufen. Öffne einfach im Browser:
**http://localhost:8000**

## Option 2: Server neu starten
Falls die Seite nicht lädt, starte den Server neu:

### Mit Node.js:
```bash
npm start
```

### Windows (PowerShell):
```powershell
python -m http.server 8000
```

Oder doppelklicke auf: `START_SERVER.bat`

### Dann im Browser öffnen:
http://localhost:8000

## Option 3: VS Code Live Server
1. Installiere die Extension "Live Server" in VS Code
2. Rechtsklick auf `index.html` → "Open with Live Server"

## Wichtig
- **NICHT** direkt die HTML-Datei öffnen (file://)
- ES6-Module funktionieren nur über einen Server
- Der Server muss laufen, damit Login/Registrierung funktioniert

## Troubleshooting

### Seite lädt nicht?
1. Prüfe, ob der Server läuft (Terminal-Fenster sollte offen sein)
2. Prüfe die Browser-Konsole (F12) auf Fehler
3. Stelle sicher, dass Port 8000 nicht belegt ist

### Login funktioniert nicht?
- Öffne die Browser-Konsole (F12)
- Prüfe auf Fehler (meist "Failed to load module")
- Stelle sicher, dass du über http://localhost:8000 öffnest (nicht file://)

### Theme-Toggle funktioniert nicht?
- Klicke auf den 🌓 Button in der Navigation
- Das Theme wird in localStorage gespeichert

