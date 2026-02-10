# …undbauen - Community Platform

Eine vollständige Community-Plattform mit Tickets, Resources, Knowledge Base, und mehr.

## 🚀 Quick Start

### Lokale Entwicklung

1. **Server starten:**
```bash
npm install
npm start
```

2. **Browser öffnen:**
```
http://localhost:8000
```

3. **Demo-Daten laden (optional):**
```javascript
// In Browser Console
import { seedDemoData } from './assets/js/seed/demoData.js';
await seedDemoData();
```

## 📁 Projektstruktur

```
/
├── app/                    # Member Area
│   ├── dashboard.html
│   ├── tickets.html
│   ├── resources.html
│   └── ...
├── backoffice/            # Admin/Moderator Area
│   ├── index.html
│   ├── inbox.html
│   └── ...
├── assets/
│   ├── css/              # Stylesheets
│   └── js/
│       ├── app.js        # Main application
│       ├── components/   # UI Components
│       ├── pages/        # Page logic
│       ├── services/     # Services & Repositories
│       └── seed/          # Demo data
└── index.html            # Landing page
```

## ✨ Features

### Member Area
- ✅ Dashboard mit Übersicht
- ✅ Tickets (Ideenbox) - Vorschläge einreichen
- ✅ Resources - Dateien & Links
- ✅ Knowledge Base - Artikel & Guides
- ✅ Events - Termine verwalten
- ✅ Forum - Diskussionen
- ✅ Messages - Nachrichten
- ✅ Profile & Settings

### Backoffice
- ✅ Ticket Inbox (Moderator+)
- ✅ Reports Queue (Moderator+)
- ✅ Content Management (Editor+)
- ✅ Public Pages CMS (Editor+)
- ✅ Resources Management (Editor+)
- ✅ Knowledge Management (Editor+)
- ✅ User Management (Admin)
- ✅ Audit Log (Admin)

### Core Features
- ✅ Global Search (Ctrl+K)
- ✅ Notifications
- ✅ Role-Based Access Control
- ✅ File Upload & Storage
- ✅ Rich Text Editor
- ✅ Responsive Design
- ✅ Accessibility (ARIA, Keyboard Nav)

## 🔐 Rollen

- **guest**: Nicht eingeloggt
- **member**: Standard-Mitglied
- **editor**: Content erstellen/bearbeiten
- **moderator**: Tickets/Reports verwalten
- **admin**: Vollzugriff

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: localStorage (Development), S3-ready (Production)
- **Editor**: Quill.js
- **Development**: Node.js (serve) – `npm start`

## 📚 Dokumentation

- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Vollständige Dokumentation
- [Phase 4 Complete](./PHASE_4_COMPLETE.md) - Integration Details

## 🧪 Testing

### Demo-Daten

```javascript
// Laden
import { seedDemoData } from './assets/js/seed/demoData.js';
await seedDemoData();

// Löschen
import { clearDemoData } from './assets/js/seed/demoData.js';
await clearDemoData();
```

### Test-Checkliste

Siehe [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

## 🔄 Migration zu Backend

Die Anwendung ist vorbereitet für Backend-Integration:

1. **API Endpoints** erstellen
2. **Repositories** anpassen (BackendRepository)
3. **File Storage** migrieren (S3)
4. **Authentication** implementieren (JWT)

Details siehe [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#deployment)

## 📝 Entwicklung

### Code-Organisation

- **Components**: Wiederverwendbare UI-Komponenten
- **Pages**: Page-spezifische Logik
- **Services**: Business Logic & Repositories
- **Seed**: Demo-Daten

### Best Practices

- ES6 Modules verwenden
- Try-Catch für async Operations
- Validation für alle Inputs
- ARIA-Attribute für Accessibility
- Focus Trap für Modals

## 🐛 Bekannte Probleme

- localStorage hat Größenlimit (~5-10MB)
- Base64 File Storage ist ineffizient (nur für Development)
- Keine echte Backend-Integration (noch)

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten

## 👥 Kontakt

Bei Fragen oder Problemen siehe [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

---

**Version:** 1.0.0  
**Status:** Development
