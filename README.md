# …undbauen - Community Platform

Eine vollständige Community-Plattform mit Tickets, Resources, Knowledge Base, und mehr.

## 🚀 Quick Start

### Lokale Entwicklung

Die Website benötigt einen lokalen Server, da ES6-Module verwendet werden.

1. **Server starten (Node.js empfohlen):**
```bash
npm install
npm start
```

2. **Alternative (Python):**
```bash
python -m http.server 8000
```

3. **Browser öffnen:**
```
http://localhost:8000
```

4. **Demo-Daten laden (optional):**
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
- **Development**: Node.js Express (Server)

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

---

**Version:** 1.0.0  
**Status:** Development
