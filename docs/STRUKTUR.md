# 📁 Projektstruktur

## Neue Struktur (nach Umstrukturierung)

```
undbauen/
├── src/                          # ALLER CODE
│   ├── public/                   # Öffentliche Landing Page
│   │   └── index.html
│   ├── app/                      # Member-Bereich
│   │   ├── dashboard.html
│   │   ├── tickets.html
│   │   ├── forum.html
│   │   └── ... (18 Seiten)
│   ├── admin/                    # Admin-Bereich
│   │   ├── index.html
│   │   ├── inbox.html
│   │   ├── reports.html
│   │   └── ... (7 Seiten)
│   └── assets/                   # Assets
│       ├── css/                  # Stylesheets
│       ├── js/                   # JavaScript
│       │   ├── app.js
│       │   ├── public.js
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── ...
│       └── images/               # Bilder
│
├── docs/                         # DOKUMENTATION
│   ├── README.md
│   └── TESTING_CHECKLIST.md
│
├── config/                       # KONFIGURATION
│   └── .gitignore
│
├── scripts/                      # SKRIPTE
│   ├── START_SERVER.bat
│   └── START_SERVER.ps1
│
└── sw.js                         # Service Worker (im Root für Browser-Zugriff)
```

## 📝 Wichtige Pfade

### HTML-Dateien:
- **Landing Page:** `src/public/index.html`
- **Member-Bereich:** `src/app/*.html`
- **Admin-Bereich:** `src/admin/*.html`

### Assets:
- **CSS:** `src/assets/css/*.css`
- **JavaScript:** `src/assets/js/*.js`
- **Bilder:** `src/assets/images/*`

### Relativ-Pfade:
- Von `src/public/index.html` → `../assets/`
- Von `src/app/*.html` → `../assets/`
- Von `src/admin/*.html` → `../assets/`

## 🚀 Server starten

```bash
# Windows
cd scripts
START_SERVER.bat

# Oder direkt:
python -m http.server 8000
```

Dann öffnen: `http://localhost:8000/src/public/index.html`









