# Navigation Analyse - Fehlende Seiten

## ✅ Behobene Probleme

### 1. Dashboard-Fehler behoben
- **Problem:** `ReferenceError: favs is not defined`
- **Lösung:** Variable `favs` im richtigen Scope definiert

### 2. Navigation aktualisiert

#### Redaktion (Editor/Admin):
- ✅ **Öffentliche Seiten** (mit Icon: `layout-template`)
- ✅ **Monatsupdatesverwaltung** (umbenannt von "Inhaltsverwaltung", Icon: `calendar-check`)
- ✅ **Terminverwaltung** (Icon: `calendar-plus`)
- ✨ **Ressourcenverwaltung** (NEU hinzugefügt, Icon: `folder-open`)
- ✨ **Wissensverwaltung** (NEU hinzugefügt, Icon: `book-open`)

#### Backoffice (Moderator/Admin):
- ✅ **Ticket-Inbox** (Icon: `inbox`)
- ✅ **Berichte** (Icon: `flag`)
- ✅ **Benutzerverwaltung** (Icon: `users-cog`)
- ✅ **Aktivitätsprotokoll** (Icon: `activity`)

---

## 📋 Seiten NICHT in der Navigation

Diese Seiten sind **absichtlich nicht in der Navigation**, da sie über Links/Buttons von anderen Seiten aufgerufen werden:

### App-Bereich (`/app/`)

#### ✅ Korrekt ausgeblendet (Detail-Seiten):
1. **`forum-kategorie.html`** - Wird von `forum.html` per Link geöffnet
2. **`forum-thread.html`** - Wird von `forum.html` per Link geöffnet
3. **`member.html`** - Wird von `mitglieder.html` per Link geöffnet (Mitgliedsprofil)
4. **`neue-nachricht.html`** - Wird von `nachrichten.html` per Button geöffnet
5. **`update-detail.html`** - Wird von `monatsupdates.html` per Link geöffnet

#### ⚠️ Potentiell wichtig:
6. **`admin-update-wizard.html`**
   - **Was ist das?** Wizard zum Erstellen/Bearbeiten von Monatsupdates
   - **Sollte in Navigation?** Könnte unter "Redaktion → Monatsupdatesverwaltung" integriert werden
   - **Alternative:** Über Button auf der Monatsupdates-Seite aufrufbar (wahrscheinlich bereits implementiert)

7. **`profil.html`**
   - **Was ist das?** Alternative Profilseite zu `einstellungen.html`
   - **Konflikt:** Aktuell verlinkt Navigation auf `einstellungen.html` als "Profil"
   - **Sollte in Navigation?** Vermutlich redundant - eine der beiden Seiten sollte entfernt oder zusammengeführt werden
   - **Empfehlung:** Prüfen Sie den Unterschied zwischen beiden Seiten

8. **`tickets.html`**
   - **Was ist das?** Ticket-System (Support-Tickets?)
   - **Unterschied zu Backoffice → Ticket-Inbox?** 
     - `backoffice/inbox.html` = Admin-Ansicht (alle Tickets verwalten)
     - `app/tickets.html` = Benutzer-Ansicht (eigene Tickets erstellen/anzeigen)
   - **Sollte in Navigation?** JA - könnte für Member/Editor wichtig sein
   - **Empfehlung:** In Member-Navigation als "Meine Tickets" oder "Support" hinzufügen

### Backoffice-Bereich (`/backoffice/`)

9. **`index.html`**
   - **Was ist das?** Backoffice Landingpage/Dashboard
   - **Sollte in Navigation?** NEIN - ist vermutlich eine Übersichtsseite
   - **Status:** Könnte als Redirect-Seite dienen

---

## 🎯 Empfehlungen

### HOCH PRIORITÄT:
1. **`app/tickets.html`** → Sollte in Member-Navigation hinzugefügt werden
   - Vorschlag: Nach "Nachrichten" als "Support-Tickets" oder "Meine Tickets"
   - Icon: `life-buoy` oder `help-circle`

### MITTEL PRIORITÄT:
2. **`app/profil.html` vs `app/einstellungen.html`**
   - Prüfen Sie den Unterschied
   - Entscheiden Sie, welche Seite behalten werden soll
   - Eventuell zusammenführen

### NIEDRIG PRIORITÄT:
3. **`app/admin-update-wizard.html`**
   - Wird wahrscheinlich bereits über Button auf Monatsupdates-Seite aufgerufen
   - Keine Navigation nötig (außer Sie möchten direkten Zugriff)

---

## 📊 Vollständige Navigation-Übersicht

### Member (Basis-Mitglied):
- Dashboard ✅
- Nachrichten ✅
- Forum ✅
- Termine ✅
- Monatsupdates ✅
- Ressourcen ✅
- Wissensdatenbank ✅
- Profil ✅
- **FEHLEND: Support-Tickets** ❌

### Editor:
- Alle Member-Items +
- Mitglieder ✅
- **Redaktion** (collapsible):
  - Öffentliche Seiten ✅
  - Monatsupdatesverwaltung ✅
  - Terminverwaltung ✅
  - Ressourcenverwaltung ✅ (NEU)
  - Wissensverwaltung ✅ (NEU)

### Moderator:
- Alle Member-Items +
- Mitglieder ✅
- **Backoffice** (collapsible):
  - Ticket-Inbox ✅
  - Berichte ✅
  - Aktivitätsprotokoll ✅

### Admin:
- Alle Member-Items +
- Mitglieder ✅
- **Redaktion** (collapsible):
  - Öffentliche Seiten ✅
  - Monatsupdatesverwaltung ✅
  - Terminverwaltung ✅
  - Ressourcenverwaltung ✅ (NEU)
  - Wissensverwaltung ✅ (NEU)
- **Backoffice** (collapsible):
  - Ticket-Inbox ✅
  - Berichte ✅
  - Benutzerverwaltung ✅
  - Aktivitätsprotokoll ✅

---

## 🚀 Nächste Schritte

1. **Entscheiden Sie:** Soll `app/tickets.html` zur Navigation hinzugefügt werden?
2. **Prüfen Sie:** Unterschied zwischen `profil.html` und `einstellungen.html`
3. **Testen Sie:** Die neuen Redaktions-Seiten (Resources- und Wissensverwaltung)
4. **Verifizieren Sie:** Alle Icons werden korrekt angezeigt


