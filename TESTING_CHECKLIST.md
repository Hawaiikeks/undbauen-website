# Testing Checklist - …undbauen

> **Hinweis:** Für detaillierte Admin-Tests siehe [ADMIN_TESTING_GUIDE.md](./ADMIN_TESTING_GUIDE.md)

## ✅ Smoke Tests

### 1. Ticket Flow
- [ ] Login als Member
- [ ] Dashboard öffnen
- [ ] "Idee einreichen" klicken
- [ ] Ticket-Wizard durchlaufen
- [ ] Ticket erstellen
- [ ] Ticket erscheint in `/app/tickets.html`
- [ ] Login als Moderator
- [ ] Ticket in `/backoffice/inbox.html` sehen
- [ ] Status ändern (z.B. "In Bearbeitung")
- [ ] Notification wird erstellt
- [ ] Member erhält Notification

### 2. Report Flow
- [ ] Login als Member
- [ ] Content melden (Post/Comment)
- [ ] Report-Modal öffnen
- [ ] Grund auswählen
- [ ] Report absenden
- [ ] Login als Moderator
- [ ] Report in `/backoffice/reports.html` sehen
- [ ] Aktion ausführen (dismiss/resolve)
- [ ] Audit Log Eintrag prüfen

### 3. Resource Flow
- [ ] Login als Editor
- [ ] Resource in `/backoffice/resources.html` erstellen
- [ ] File hochladen
- [ ] Version erstellen
- [ ] Login als Member
- [ ] Resource in `/app/resources.html` sehen
- [ ] Download testen

### 4. Knowledge Flow
- [ ] Login als Editor
- [ ] Knowledge Item in `/backoffice/knowledge.html` erstellen
- [ ] Status: Draft → Reviewed → Published
- [ ] Login als Member
- [ ] Knowledge Item in `/app/knowledge.html` sehen
- [ ] Suche testen

## 🔐 Permission Tests

### Direct URL Access
- [ ] `/app/dashboard.html` als guest → Redirect zu `/index.html`
- [ ] `/backoffice/inbox.html` als member → Redirect zu `/app/dashboard.html`
- [ ] `/backoffice/inbox.html` als moderator → ✅ Zugriff
- [ ] `/backoffice/users.html` als moderator → Redirect zu `/app/dashboard.html`
- [ ] `/backoffice/users.html` als admin → ✅ Zugriff

### API Protection
- [ ] Ticket erstellen ohne Login → Fehler
- [ ] Resource erstellen als member → Fehler
- [ ] User löschen als moderator → Fehler

## 📤 Upload Security

### File Validation
- [ ] Datei > 50MB hochladen → Fehler
- [ ] Nicht erlaubte Dateityp hochladen → Fehler
- [ ] Nicht erlaubte Dateiendung hochladen → Fehler
- [ ] Gültige Datei hochladen → ✅ Erfolg

### File Storage
- [ ] Base64 Storage funktioniert (Development)
- [ ] File Download funktioniert
- [ ] File wird korrekt gespeichert

## 🛡️ Security Tests

### XSS Sanitization
- [ ] Rich Text mit `<script>` Tag → Script wird entfernt
- [ ] HTML mit `onclick` Attribut → Attribut wird entfernt
- [ ] `javascript:` URLs → Werden entfernt
- [ ] Normale HTML-Tags → Bleiben erhalten

### Input Validation
- [ ] Ungültige E-Mail → Fehler
- [ ] Leeres Pflichtfeld → Fehler
- [ ] Text zu lang → Fehler
- [ ] Gültige Eingaben → ✅ Erfolg

## ♿ Accessibility Tests

### Keyboard Navigation
- [ ] Tab durch alle fokussierbaren Elemente
- [ ] Shift+Tab rückwärts
- [ ] Enter aktiviert Buttons
- [ ] Escape schließt Modals
- [ ] Focus Trap in Modals funktioniert

### Screen Reader
- [ ] ARIA-Labels vorhanden
- [ ] ARIA-Roles korrekt
- [ ] Modal `aria-modal="true"`
- [ ] Buttons haben Labels

### Focus Management
- [ ] Focus wird beim Öffnen von Modals gesetzt
- [ ] Focus wird beim Schließen wiederhergestellt
- [ ] Focus Trap verhindert Tab-Escape

## 📱 Responsive Tests

### Mobile (< 768px)
- [ ] Navigation funktioniert
- [ ] Modals sind vollständig sichtbar
- [ ] Forms sind nutzbar
- [ ] Buttons sind klickbar

### Tablet (768px - 1024px)
- [ ] Layout passt sich an
- [ ] Grid-Layouts funktionieren

### Desktop (> 1024px)
- [ ] Volle Funktionalität
- [ ] Sidebars sichtbar

## 🔍 Search Tests

### Global Search (Ctrl+K)
- [ ] Öffnet mit Ctrl+K
- [ ] Suche nach Member → Ergebnisse
- [ ] Suche nach Event → Ergebnisse
- [ ] Suche nach Knowledge → Ergebnisse (nur wenn eingeloggt)
- [ ] Suche nach Resource → Ergebnisse (nur wenn eingeloggt)
- [ ] Keine Ergebnisse → Empty State
- [ ] Escape schließt Search

## 📊 Data Tests

### Empty States
- [ ] Keine Tickets → Empty State angezeigt
- [ ] Keine Resources → Empty State angezeigt
- [ ] Keine Knowledge Items → Empty State angezeigt

### Loading States
- [ ] Während Daten geladen werden → Loading State
- [ ] Nach Laden → Content angezeigt

### Error States
- [ ] Bei Fehler → Error State angezeigt
- [ ] Retry-Button funktioniert

## 🔄 State Management

### Form State
- [ ] Formular-Daten bleiben bei Navigation erhalten
- [ ] Auto-Save funktioniert (wenn implementiert)

### Filter State
- [ ] Filter bleiben nach Navigation erhalten
- [ ] URL-Parameter werden korrekt gelesen

## 🎨 UI/UX Tests

### Modals
- [ ] Öffnen/Schließen funktioniert
- [ ] Overlay-Click schließt Modal
- [ ] Escape schließt Modal
- [ ] Focus Trap funktioniert

### Toast Notifications
- [ ] Erfolg → Grüner Toast
- [ ] Fehler → Roter Toast
- [ ] Info → Blauer Toast
- [ ] Auto-Dismiss funktioniert
- [ ] Manuelles Schließen funktioniert

### Navigation
- [ ] Breadcrumbs funktionieren
- [ ] Zurück-Button funktioniert
- [ ] Links führen zu korrekten Seiten

## 🧹 Cleanup Tests

### Demo Data
- [ ] `seedDemoData()` erstellt alle Daten
- [ ] `clearDemoData()` löscht alle Daten
- [ ] Keine Duplikate nach mehrfachem Seeding

## 📝 Form Tests

### Ticket Wizard
- [ ] Alle Schritte durchlaufbar
- [ ] Zurück-Button funktioniert
- [ ] Validierung funktioniert
- [ ] Submit erstellt Ticket

### Resource Form
- [ ] Alle Felder editierbar
- [ ] Validierung funktioniert
- [ ] File Upload funktioniert
- [ ] Submit erstellt Resource

### Knowledge Form
- [ ] Alle Felder editierbar
- [ ] Status-Workflow funktioniert
- [ ] Submit erstellt Knowledge Item

## 🔗 Integration Tests

### Deep Linking
- [ ] Notification → Öffnet korrekte Seite
- [ ] Search Result → Öffnet korrekte Seite
- [ ] Link mit Parametern → Parameter werden gelesen

### Cross-Feature
- [ ] Ticket erstellen → Notification
- [ ] Report erstellen → Audit Log
- [ ] Resource veröffentlichen → Sichtbar für Members

## 🐛 Edge Cases

### Leere Daten
- [ ] Leere Arrays werden korrekt behandelt
- [ ] Null/Undefined werden korrekt behandelt

### Große Datenmengen
- [ ] Viele Tickets → Performance OK
- [ ] Viele Resources → Performance OK
- [ ] Viele Knowledge Items → Performance OK

### Sonderzeichen
- [ ] Umlaute in Texten → Korrekt angezeigt
- [ ] Emojis → Korrekt angezeigt
- [ ] HTML-Entities → Korrekt escaped

## ✅ Acceptance Criteria

### Tickets
- [x] Create ticket via wizard
- [x] Appears in `/app/tickets`
- [x] Inbox filters work
- [x] Status change triggers notification
- [x] Attachment validation

### Notifications
- [x] Badge count correct
- [x] Nav dot present
- [x] Deep-link works
- [x] Auto read works
- [x] Mark all read works

### Reports
- [x] Report created
- [x] Queue shows reports
- [x] Moderator actions work
- [x] Audit log created

### Resources
- [x] List/search/filter works
- [x] Versioning works
- [x] Signed download (Base64 for now)
- [x] Featured shown on dashboard

### Knowledge
- [x] Published only visible to members
- [x] Moderator can create
- [x] Relations (prepared)
- [x] Global search finds items

### Audit
- [x] Critical actions logged
- [x] Ticket status changes logged
- [x] Report actions logged
- [x] Publish actions logged

---

**Test-Datum:** _______________  
**Getestet von:** _______________  
**Ergebnis:** _______________

