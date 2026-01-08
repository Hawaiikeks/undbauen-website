# 🧪 Test-Plan: Umstrukturierung

## ✅ Vorbereitung

1. **Server starten:**
   ```bash
   cd scripts
   START_SERVER.bat
   # Oder: python -m http.server 8000
   ```

2. **Browser öffnen:**
   ```
   http://localhost:8000/src/public/index.html
   ```

---

## 📋 Test-Checkliste

### Phase 1: Öffentliche Seite

- [ ] **Landing Page lädt**
  - URL: `http://localhost:8000/src/public/index.html`
  - CSS lädt korrekt
  - JavaScript lädt korrekt
  - Keine Console-Fehler

- [ ] **Navigation funktioniert**
  - Alle Links funktionieren
  - Scroll-Navigation funktioniert
  - Hero-Animation läuft

- [ ] **Login-Modal**
  - Öffnet sich korrekt
  - Login funktioniert
  - Redirect nach Login funktioniert

---

### Phase 2: Member-Bereich

#### Login & Redirect
- [ ] **Login funktioniert**
  - Email/Passwort eingeben
  - Login-Button klicken
  - Erfolgreiche Meldung
  - Redirect zu Dashboard

- [ ] **Dashboard lädt**
  - URL: `http://localhost:8000/src/app/dashboard.html`
  - Sidebar wird angezeigt
  - Dashboard-Inhalt wird geladen
  - Keine Console-Fehler

#### Navigation
- [ ] **Sidebar-Navigation**
  - Alle Links funktionieren
  - Aktive Route wird hervorgehoben
  - Mobile-Menü funktioniert

- [ ] **Seiten-Navigation**
  - [ ] Tickets (`src/app/tickets.html`)
  - [ ] Forum (`src/app/forum.html`)
  - [ ] Forum-Kategorie (`src/app/forum-kategorie.html`)
  - [ ] Forum-Thread (`src/app/forum-thread.html`)
  - [ ] Messages (`src/app/nachrichten.html`)
  - [ ] Neue Nachricht (`src/app/neue-nachricht.html`)
  - [ ] Resources (`src/app/resources.html`)
  - [ ] Knowledge Base (`src/app/knowledge.html`)
  - [ ] Termine (`src/app/termine.html`)
  - [ ] Monatsupdates (`src/app/monatsupdates.html`)
  - [ ] Mitglieder (`src/app/mitglieder.html`)
  - [ ] Profil (`src/app/profil.html`)
  - [ ] Einstellungen (`src/app/einstellungen.html`)

#### Funktionen
- [ ] **Tickets**
  - Ticket erstellen
  - Tickets anzeigen
  - Ticket-Details öffnen

- [ ] **Forum**
  - Kategorien anzeigen
  - Thread erstellen
  - Post erstellen
  - Reaktionen funktionieren

- [ ] **Messages**
  - Nachrichten anzeigen
  - Neue Nachricht erstellen
  - Nachricht senden

- [ ] **Resources**
  - Resources anzeigen
  - Resource öffnen

- [ ] **Knowledge Base**
  - Artikel anzeigen
  - Artikel öffnen

---

### Phase 3: Admin-Bereich

#### Login & Zugriff
- [ ] **Admin-Login**
  - Als Admin einloggen
  - Redirect zu Admin-Dashboard

- [ ] **Admin-Dashboard lädt**
  - URL: `http://localhost:8000/src/admin/index.html`
  - Admin-Navigation wird angezeigt
  - Dashboard-Inhalt wird geladen

#### Navigation
- [ ] **Admin-Navigation**
  - Alle Links funktionieren
  - [ ] Inbox (`src/admin/inbox.html`)
  - [ ] Reports (`src/admin/reports.html`)
  - [ ] Public Pages (`src/admin/public-pages.html`)
  - [ ] Resources (`src/admin/resources.html`)
  - [ ] Knowledge (`src/admin/knowledge.html`)
  - [ ] Audit Log (`src/admin/audit.html`)

#### User-Verwaltung ⭐ WICHTIG
- [ ] **User anzeigen**
  - User-Liste wird geladen
  - User-Details werden angezeigt

- [ ] **User hinzufügen** ⭐
  - Neuen User erstellen
  - Name, Email, Passwort eingeben
  - Rolle zuweisen
  - User wird erstellt
  - Erfolgsmeldung

- [ ] **User bearbeiten**
  - User-Details bearbeiten
  - Änderungen speichern
  - Änderungen werden gespeichert

- [ ] **User löschen** ⭐
  - User auswählen
  - Löschen-Button klicken
  - Bestätigung
  - User wird gelöscht
  - User verschwindet aus Liste

#### Content-Verwaltung ⭐ WICHTIG
- [ ] **Content anzeigen**
  - Alle Content-Typen anzeigen
  - Content-Details anzeigen

- [ ] **Content hinzufügen** ⭐
  - Neuen Content erstellen
  - Alle Felder ausfüllen
  - Content speichern
  - Content wird erstellt
  - Erfolgsmeldung

- [ ] **Content bearbeiten**
  - Content auswählen
  - Bearbeiten
  - Änderungen speichern
  - Änderungen werden gespeichert

- [ ] **Content löschen** ⭐
  - Content auswählen
  - Löschen-Button klicken
  - Bestätigung
  - Content wird gelöscht
  - Content verschwindet aus Liste

#### Spezifische Admin-Funktionen
- [ ] **Tickets-Inbox**
  - Tickets anzeigen
  - Ticket bearbeiten
  - Ticket-Status ändern

- [ ] **Reports**
  - Reports anzeigen
  - Report bearbeiten
  - Report löschen

- [ ] **Public Pages Editor**
  - Seiten anzeigen
  - Seite bearbeiten
  - Seite speichern

- [ ] **Resources-Verwaltung**
  - Resources anzeigen
  - Resource hinzufügen
  - Resource bearbeiten
  - Resource löschen

- [ ] **Knowledge-Verwaltung**
  - Artikel anzeigen
  - Artikel hinzufügen
  - Artikel bearbeiten
  - Artikel löschen

- [ ] **Audit Log**
  - Audit-Log anzeigen
  - Filter funktionieren
  - Details anzeigen

---

## 🐛 Bekannte Probleme dokumentieren

Wenn etwas nicht funktioniert:
1. Console-Fehler notieren
2. URL notieren
3. Schritte zur Reproduktion notieren
4. Screenshot (falls möglich)

---

## ✅ Test abgeschlossen

Nach allen Tests:
- [ ] Alle Funktionen funktionieren
- [ ] Keine Console-Fehler
- [ ] Alle Pfade funktionieren
- [ ] User add/delete funktioniert
- [ ] Content add/delete funktioniert

---

## 📝 Test-Ergebnisse

**Datum:** _______________  
**Getestet von:** _______________  

### Ergebnisse:
- ✅ Funktioniert
- ⚠️ Funktioniert mit Problemen
- ❌ Funktioniert nicht

**Notizen:**
_________________________________
_________________________________
_________________________________









