# …undbauen – Innovationsnetzwerk

## 🚀 Schnellstart

**WICHTIG:** Diese Website verwendet ES6-Module, die nur über einen lokalen Server funktionieren. Öffne die Dateien **NICHT** direkt im Browser (file://), sondern starte einen lokalen Server.

### Option 1: VS Code Live Server (Empfohlen)

1. Installiere die Extension "Live Server" in VS Code
2. Rechtsklick auf `index.html` → "Open with Live Server"
3. Die Seite öffnet sich automatisch im Browser

### Option 2: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Dann im Browser öffnen:
# http://localhost:8000
```

### Option 3: Node.js http-server

```bash
# Installieren
npm install -g http-server

# Starten
http-server

# Dann im Browser öffnen:
# http://localhost:8080
```

### Option 4: PHP Built-in Server

```bash
php -S localhost:8000
```

## 🔑 Login-Daten

**Admin Account:**
- Email: `admin@undbauen.local`
- Passwort: `adminadmin`

## ✨ Features

- ✅ Public Onepager mit Login/Registrierung
- ✅ Member-App (Dashboard, Termine, Forum, Nachrichten, Mitglieder)
- ✅ Admin-Bereich
- ✅ Hell/Dunkel Theme Toggle (🌓 Button in der Navigation)
- ✅ localStorage-basiertes Backend (MVP)
- ✅ ICS-Export für Termine

## 🎨 Theme wechseln

Klicke auf den **🌓 Button** in der Navigation, um zwischen hell und dunkel zu wechseln. Die Einstellung wird in localStorage gespeichert.

## 📁 Projektstruktur

```
/
├── index.html              # Public Onepager
├── assets/
│   ├── css/               # Stylesheets
│   └── js/                # JavaScript
│       ├── public.js      # Public-Seite Logic
│       ├── app.js         # App-Seiten Logic
│       └── services/      # API Layer
└── app/                   # Member-App Seiten
```

## 🐛 Probleme?

Wenn Login/Registrierung nicht funktioniert:
1. Stelle sicher, dass du einen **lokalen Server** verwendest (nicht file://)
2. Öffne die Browser-Konsole (F12) und prüfe auf Fehler
3. Stelle sicher, dass alle Dateien korrekt geladen werden


