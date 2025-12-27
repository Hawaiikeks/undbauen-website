# …undbauen – Innovationsnetzwerk

Professionelle Netzwerk-/Community-Plattform im AEC-Umfeld.

## 🚀 Schnellstart

### Lokaler Server starten

Die Website benötigt einen lokalen Server, da ES6-Module verwendet werden.

**Windows (PowerShell):**
```powershell
python -m http.server 8000
```

**Windows (CMD):**
```cmd
python -m http.server 8000
```

**Alternative (Node.js):**
```bash
npx http-server -p 8000
```

Dann öffne: `http://localhost:8000`

## 📁 Projektstruktur

```
/
├── index.html              # Public Onepager
├── app/                    # Member-App Seiten
│   ├── dashboard.html
│   ├── termine.html
│   ├── forum.html
│   └── ...
├── assets/
│   ├── css/
│   │   ├── base.css        # Design System (Variablen, Typografie, Buttons, Cards)
│   │   ├── public.css      # Public-spezifische Styles
│   │   └── app.css         # App-spezifische Styles
│   └── js/
│       ├── public.js       # Public-Seite Logik
│       ├── app.js          # App-Seite Logik
│       └── services/
│           ├── apiClient.js
│           └── storageAdapter.js  # localStorage "Backend"
└── README.md
```

## 🎨 Design System

- **Font:** Inter (400, 500, 600)
- **Farbpalette:** Light/Dark Mode mit CSS-Variablen
- **Typografie:** H1 (36px/600), H2 (28px/600), H3 (20px/500), Body (16px/400)
- **Buttons:** Primary, Secondary, Ghost
- **Cards:** Surface mit Border, Hover-Effekte

## 🔐 Login

**Admin Seed:**
- Email: `admin@undbauen.local`
- Passwort: `adminadmin`

## 🛠️ Entwicklung

### Design-System anpassen

Alle Farben, Typografie und Komponenten sind in `assets/css/base.css` definiert:

- CSS-Variablen: `:root` und `[data-theme="dark"]`
- Buttons: `.btn`, `.btn.primary`, `.btn.secondary`, `.btn.ghost`
- Cards: `.card`
- Forms: `.input`, `.textarea`, `.select`

### Neue Features hinzufügen

1. **Public-Seite:** `index.html` + `assets/js/public.js`
2. **App-Seite:** `app/*.html` + `assets/js/app.js`
3. **Backend-Logik:** `assets/js/services/storageAdapter.js`

## 📝 Zusammenarbeit

### Git Workflow

1. **Branch erstellen:**
   ```bash
   git checkout -b feature/mein-feature
   ```

2. **Änderungen committen:**
   ```bash
   git add .
   git commit -m "Beschreibung der Änderung"
   ```

3. **Branch pushen:**
   ```bash
   git push origin feature/mein-feature
   ```

4. **Pull Request erstellen** auf GitHub

### Best Practices

- **Kleine, fokussierte Commits**
- **Aussagekräftige Commit-Messages**
- **Branches für Features/Features verwenden**
- **Vor dem Push testen** (lokaler Server)

## 🔄 Backend-Migration

Aktuell verwendet das Projekt `localStorage` als MVP-Backend. Für die Migration zu einem echten Backend:

1. `assets/js/services/apiClient.js` anpassen
2. `storageAdapter.js` durch HTTP-Adapter ersetzen
3. API-Endpoints implementieren

## 📄 Lizenz

[Lizenz hier einfügen]
