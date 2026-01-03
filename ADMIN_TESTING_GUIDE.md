# Admin-Bereich Testing Guide

## 🎯 Test-Szenarien für Admin-Funktionen

Dieses Dokument beschreibt detaillierte Tests für alle Admin-Funktionen, insbesondere:
- Content-Erstellung
- Termine (Events) erstellen
- User-Verwaltung (Bearbeiten, Blockieren, Entfernen)
- Löschen von Elementen

---

## 📋 Voraussetzungen

### Test-Accounts erstellen

```javascript
// In Browser Console ausführen
// 1. Admin-Account erstellen
localStorage.setItem('currentUser', JSON.stringify({
  id: 'admin_test',
  email: 'admin@test.de',
  name: 'Test Admin',
  role: 'admin',
  status: 'active'
}));

// 2. Moderator-Account erstellen
localStorage.setItem('currentUser', JSON.stringify({
  id: 'moderator_test',
  email: 'moderator@test.de',
  name: 'Test Moderator',
  role: 'moderator',
  status: 'active'
}));

// 3. Editor-Account erstellen
localStorage.setItem('currentUser', JSON.stringify({
  id: 'editor_test',
  email: 'editor@test.de',
  name: 'Test Editor',
  role: 'editor',
  status: 'active'
}));
```

### Demo-Daten laden

```javascript
import { seedDemoData } from './assets/js/seed/demoData.js';
await seedDemoData();
```

---

## 1️⃣ Content-Erstellung Test

### Test 1.1: Monatsupdate erstellen

**Schritte:**
1. [ ] Als Editor/Admin einloggen
2. [ ] Zu `/backoffice/content.html` navigieren
3. [ ] Tab "Monatsupdates" öffnen
4. [ ] "+ Update" Button klicken
5. [ ] Wizard durchlaufen:
   - [ ] Monat auswählen (z.B. "März 2026")
   - [ ] Titel eingeben (z.B. "Innovationsabend im März 2026")
   - [ ] Teaser eingeben
   - [ ] Intro eingeben
   - [ ] Highlight hinzufügen:
     - [ ] Titel eingeben
     - [ ] Bild hochladen
     - [ ] Member Text mit Rich Text Editor schreiben
     - [ ] Teilnehmer auswählen
   - [ ] Weitere Highlights hinzufügen (mindestens 2)
6. [ ] Vorschau prüfen
7. [ ] "Veröffentlichen" klicken
8. [ ] Erfolgs-Toast prüfen
9. [ ] Redirect zu Admin-Übersicht prüfen
10. [ ] Monatsupdate in Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Monatsupdate wird erstellt
- ✅ Alle Highlights sind vorhanden
- ✅ Bilder werden angezeigt
- ✅ Rich Text Formatierung bleibt erhalten
- ✅ Teilnehmer sind zugewiesen
- ✅ Status ist "published"

**Fehlerfälle testen:**
- [ ] Monat ohne Titel → Fehler
- [ ] Monat ohne Highlights → Fehler
- [ ] Duplikat-Monat → Fehler (nur ein Update pro Monat)

---

### Test 1.2: Monatsupdate bearbeiten

**Schritte:**
1. [ ] Zu `/backoffice/content.html` navigieren
2. [ ] Tab "Monatsupdates" öffnen
3. [ ] Existierendes Update auswählen
4. [ ] "Bearbeiten" klicken
5. [ ] Titel ändern
6. [ ] Highlight bearbeiten:
   - [ ] Text ändern
   - [ ] Bild ersetzen
   - [ ] Teilnehmer hinzufügen/entfernen
7. [ ] "Speichern" klicken
8. [ ] Änderungen prüfen

**Erwartetes Ergebnis:**
- ✅ Änderungen werden gespeichert
- ✅ Rich Text bleibt erhalten
- ✅ Bilder werden aktualisiert

---

### Test 1.3: Monatsupdate löschen

**Schritte:**
1. [ ] Zu `/backoffice/content.html` navigieren
2. [ ] Tab "Monatsupdates" öffnen
3. [ ] Update auswählen
4. [ ] "Entfernen" Button klicken
5. [ ] Bestätigungs-Dialog prüfen
6. [ ] "Ja" bestätigen
7. [ ] Update aus Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Bestätigungs-Dialog erscheint
- ✅ Update wird gelöscht
- ✅ Update verschwindet aus Liste
- ✅ Erfolgs-Toast erscheint

**Fehlerfälle testen:**
- [ ] "Abbrechen" klicken → Update bleibt erhalten

---

### Test 1.4: Public Pages Editor

**Schritte:**
1. [ ] Als Editor/Admin einloggen
2. [ ] Zu `/backoffice/public-pages.html` navigieren
3. [ ] Section hinzufügen:
   - [ ] "+ Sektion hinzufügen" klicken
   - [ ] Typ auswählen (z.B. "Hero Section")
   - [ ] Titel eingeben
   - [ ] Inhalt eingeben
4. [ ] Section bearbeiten:
   - [ ] Titel ändern
   - [ ] Reihenfolge ändern (↑/↓ Buttons)
5. [ ] Vorschau prüfen:
   - [ ] "Vorschau" Button klicken
   - [ ] Desktop/Mobile Toggle prüfen
6. [ ] Version speichern:
   - [ ] "Version speichern" klicken
   - [ ] Versionshistorie prüfen
7. [ ] Veröffentlichen:
   - [ ] "Veröffentlichen" klicken
   - [ ] Status prüfen

**Erwartetes Ergebnis:**
- ✅ Sections können erstellt werden
- ✅ Sections können bearbeitet werden
- ✅ Reihenfolge kann geändert werden
- ✅ Vorschau funktioniert
- ✅ Versionierung funktioniert
- ✅ Veröffentlichung funktioniert

---

## 2️⃣ Termine (Events) Test

### Test 2.1: Event erstellen

**Schritte:**
1. [ ] Als Admin/Moderator einloggen
2. [ ] Zu `/backoffice/content.html` navigieren
3. [ ] Tab "Termine" öffnen
4. [ ] "+ Neuer Termin" Button klicken
5. [ ] Event-Formular ausfüllen:
   - [ ] Titel eingeben (z.B. "Community Meetup")
   - [ ] Datum auswählen
   - [ ] Uhrzeit eingeben
   - [ ] Ort eingeben
   - [ ] Beschreibung eingeben
   - [ ] Bild hochladen (optional)
   - [ ] Tags hinzufügen
   - [ ] Öffentlich/Privat auswählen
6. [ ] "Speichern" klicken
7. [ ] Event in Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Event wird erstellt
- ✅ Event erscheint in Liste
- ✅ Alle Felder sind korrekt gespeichert
- ✅ Bild wird angezeigt
- ✅ Tags sind vorhanden

**Fehlerfälle testen:**
- [ ] Leerer Titel → Fehler
- [ ] Ungültiges Datum → Fehler
- [ ] Vergangenes Datum → Warnung (optional)

---

### Test 2.2: Event bearbeiten

**Schritte:**
1. [ ] Zu `/backoffice/content.html` navigieren
2. [ ] Tab "Termine" öffnen
3. [ ] Existierendes Event auswählen
4. [ ] "Bearbeiten" klicken
5. [ ] Titel ändern
6. [ ] Datum ändern
7. [ ] Beschreibung ändern
8. [ ] "Speichern" klicken
9. [ ] Änderungen prüfen

**Erwartetes Ergebnis:**
- ✅ Änderungen werden gespeichert
- ✅ Event wird aktualisiert
- ✅ Erfolgs-Toast erscheint

---

### Test 2.3: Event löschen

**Schritte:**
1. [ ] Zu `/backoffice/content.html` navigieren
2. [ ] Tab "Termine" öffnen
3. [ ] Event auswählen
4. [ ] "Entfernen" Button klicken
5. [ ] Bestätigungs-Dialog prüfen:
   - [ ] Text: "Möchten Sie diesen Termin wirklich entfernen?"
   - [ ] Event-Titel wird angezeigt
6. [ ] "Ja" bestätigen
7. [ ] Event aus Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Bestätigungs-Dialog erscheint
- ✅ Event wird gelöscht
- ✅ Event verschwindet aus Liste
- ✅ Erfolgs-Toast erscheint

**Fehlerfälle testen:**
- [ ] "Abbrechen" klicken → Event bleibt erhalten
- [ ] Löschen als Member → Fehler (keine Berechtigung)

---

### Test 2.4: Event-Liste Filter

**Schritte:**
1. [ ] Zu `/backoffice/content.html` navigieren
2. [ ] Tab "Termine" öffnen
3. [ ] Filter testen:
   - [ ] "Alle" → Alle Events
   - [ ] "Kommende" → Nur zukünftige Events
   - [ ] "Vergangene" → Nur vergangene Events
4. [ ] Suche testen:
   - [ ] Suchbegriff eingeben
   - [ ] Ergebnisse prüfen

**Erwartetes Ergebnis:**
- ✅ Filter funktionieren korrekt
- ✅ Suche findet Events
- ✅ Ergebnisse werden korrekt angezeigt

---

## 3️⃣ User-Verwaltung Test

### Test 3.1: User bearbeiten

**Schritte:**
1. [ ] Als Admin einloggen
2. [ ] Zu `/backoffice/users.html` navigieren (oder `/backoffice/content.html` → Tab "Mitglieder")
3. [ ] User aus Liste auswählen
4. [ ] "Bearbeiten" klicken
5. [ ] User-Daten ändern:
   - [ ] Name ändern
   - [ ] E-Mail ändern (falls erlaubt)
   - [ ] Rolle ändern (Dropdown: Member/Admin/Author)
   - [ ] Status ändern
6. [ ] "Speichern" klicken
7. [ ] Änderungen prüfen

**Erwartetes Ergebnis:**
- ✅ User-Daten werden aktualisiert
- ✅ Rolle wird geändert
- ✅ Status wird geändert
- ✅ Erfolgs-Toast erscheint

**Fehlerfälle testen:**
- [ ] Ungültige E-Mail → Fehler
- [ ] Leerer Name → Fehler
- [ ] Bearbeiten als Moderator → Fehler (keine Berechtigung)

---

### Test 3.2: User blockieren (Sperren)

**Schritte:**
1. [ ] Als Admin einloggen
2. [ ] Zu `/backoffice/content.html` navigieren
3. [ ] Tab "Mitglieder" öffnen
4. [ ] User aus Liste auswählen (Status: "aktiv")
5. [ ] "Sperren" Button klicken
6. [ ] Status-Änderung prüfen:
   - [ ] Status ändert sich zu "inaktiv"
   - [ ] Zeile wird grau angezeigt
   - [ ] Button ändert sich zu "Entsperren"
7. [ ] E-Mail-Benachrichtigung prüfen (wenn implementiert)

**Erwartetes Ergebnis:**
- ✅ Status wird auf "inaktiv" gesetzt
- ✅ Zeile wird visuell grau markiert
- ✅ Button ändert sich zu "Entsperren"
- ✅ User erhält E-Mail (wenn implementiert)
- ✅ Audit Log Eintrag wird erstellt

**Fehlerfälle testen:**
- [ ] Blockieren als Moderator → Fehler (keine Berechtigung)

---

### Test 3.3: User entsperren

**Schritte:**
1. [ ] Als Admin einloggen
2. [ ] Zu `/backoffice/content.html` navigieren
3. [ ] Tab "Mitglieder" öffnen
4. [ ] Blockierten User auswählen (Status: "inaktiv")
5. [ ] "Entsperren" Button klicken
6. [ ] Status-Änderung prüfen:
   - [ ] Status ändert sich zu "aktiv"
   - [ ] Zeile wird normal angezeigt
   - [ ] Button ändert sich zu "Sperren"

**Erwartetes Ergebnis:**
- ✅ Status wird auf "aktiv" gesetzt
- ✅ Zeile wird normal angezeigt
- ✅ Button ändert sich zu "Sperren"
- ✅ Audit Log Eintrag wird erstellt

---

### Test 3.4: User entfernen (löschen)

**Schritte:**
1. [ ] Als Admin einloggen
2. [ ] Zu `/backoffice/content.html` navigieren
3. [ ] Tab "Mitglieder" öffnen
4. [ ] User aus Liste auswählen
5. [ ] "Entfernen" Button klicken
6. [ ] Bestätigungs-Dialog prüfen:
   - [ ] Text: "Möchten Sie den User [Name] wirklich entfernen?"
   - [ ] User-Name wird angezeigt
   - [ ] Warnung: "Diese Aktion kann nicht rückgängig gemacht werden"
7. [ ] "Ja" bestätigen
8. [ ] User aus Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Bestätigungs-Dialog erscheint
- ✅ User wird gelöscht
- ✅ User verschwindet aus Liste
- ✅ Mitgliederzahl wird aktualisiert
- ✅ Erfolgs-Toast erscheint
- ✅ Audit Log Eintrag wird erstellt

**Fehlerfälle testen:**
- [ ] "Abbrechen" klicken → User bleibt erhalten
- [ ] Entfernen als Moderator → Fehler (keine Berechtigung)
- [ ] Eigener Account entfernen → Warnung (optional)

---

### Test 3.5: Neuen User hinzufügen

**Schritte:**
1. [ ] Als Admin einloggen
2. [ ] Zu `/backoffice/content.html` navigieren
3. [ ] Tab "Mitglieder" öffnen
4. [ ] "+ Neues Mitglied" Button klicken
5. [ ] User-Formular ausfüllen:
   - [ ] Name eingeben
   - [ ] E-Mail eingeben
   - [ ] Rolle auswählen (Dropdown)
   - [ ] Passwort eingeben (falls erforderlich)
6. [ ] "Erstellen" klicken
7. [ ] User in Liste prüfen

**Erwartetes Ergebnis:**
- ✅ User wird erstellt
- ✅ User erscheint in Liste
- ✅ Mitgliederzahl wird aktualisiert
- ✅ Erfolgs-Toast erscheint

**Fehlerfälle testen:**
- [ ] Ungültige E-Mail → Fehler
- [ ] Duplikat-E-Mail → Fehler
- [ ] Leerer Name → Fehler

---

## 4️⃣ Löschen/Entfernen Test

### Test 4.1: Monatsupdate löschen

**Siehe Test 1.3**

---

### Test 4.2: Event löschen

**Siehe Test 2.3**

---

### Test 4.3: Resource löschen

**Schritte:**
1. [ ] Als Editor/Admin einloggen
2. [ ] Zu `/backoffice/resources.html` navigieren
3. [ ] Resource aus Liste auswählen
4. [ ] "Löschen" Button klicken
5. [ ] Bestätigungs-Dialog prüfen
6. [ ] "Ja" bestätigen
7. [ ] Resource aus Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Resource wird gelöscht
- ✅ Resource verschwindet aus Liste
- ✅ Erfolgs-Toast erscheint

---

### Test 4.4: Knowledge Item löschen

**Schritte:**
1. [ ] Als Editor/Admin einloggen
2. [ ] Zu `/backoffice/knowledge.html` navigieren
3. [ ] Knowledge Item aus Liste auswählen
4. [ ] "Löschen" Button klicken
5. [ ] Bestätigungs-Dialog prüfen
6. [ ] "Ja" bestätigen
7. [ ] Knowledge Item aus Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Knowledge Item wird gelöscht
- ✅ Knowledge Item verschwindet aus Liste
- ✅ Erfolgs-Toast erscheint

---

### Test 4.5: Section aus Public Pages löschen

**Schritte:**
1. [ ] Als Editor/Admin einloggen
2. [ ] Zu `/backoffice/public-pages.html` navigieren
3. [ ] Section auswählen
4. [ ] "✕" (Löschen) Button klicken
5. [ ] Bestätigungs-Dialog prüfen
6. [ ] "Ja" bestätigen
7. [ ] Section aus Liste prüfen

**Erwartetes Ergebnis:**
- ✅ Section wird gelöscht
- ✅ Section verschwindet aus Liste
- ✅ Seite kann ohne Section gespeichert werden

---

## 5️⃣ Integration Tests

### Test 5.1: Content → Public View

**Schritte:**
1. [ ] Monatsupdate erstellen (Test 1.1)
2. [ ] Als Member einloggen
3. [ ] Zu `/app/monatsupdates.html` navigieren
4. [ ] Erstelltes Update prüfen:
   - [ ] Update ist sichtbar
   - [ ] Alle Highlights sind vorhanden
   - [ ] Bilder werden angezeigt
   - [ ] Teilnehmer sind angezeigt

**Erwartetes Ergebnis:**
- ✅ Erstelltes Content ist öffentlich sichtbar
- ✅ Alle Daten sind korrekt

---

### Test 5.2: Event → Member View

**Schritte:**
1. [ ] Event erstellen (Test 2.1)
2. [ ] Als Member einloggen
3. [ ] Zu `/app/termine.html` navigieren
4. [ ] Erstelltes Event prüfen:
   - [ ] Event ist sichtbar
   - [ ] Alle Details sind vorhanden
   - [ ] Bild wird angezeigt

**Erwartetes Ergebnis:**
- ✅ Erstelltes Event ist sichtbar
- ✅ Alle Daten sind korrekt

---

### Test 5.3: User Block → Login Test

**Schritte:**
1. [ ] User blockieren (Test 3.2)
2. [ ] Als blockierter User versuchen einzuloggen
3. [ ] Fehlermeldung prüfen

**Erwartetes Ergebnis:**
- ✅ Blockierter User kann nicht einloggen
- ✅ Fehlermeldung: "Ihr Account wurde gesperrt"

---

## 6️⃣ Edge Cases & Fehlerbehandlung

### Test 6.1: Netzwerk-Fehler

**Schritte:**
1. [ ] Browser DevTools öffnen
2. [ ] Network Throttling aktivieren (Offline)
3. [ ] Content erstellen versuchen
4. [ ] Fehlerbehandlung prüfen

**Erwartetes Ergebnis:**
- ✅ Fehler-Toast erscheint
- ✅ User wird informiert
- ✅ Daten gehen nicht verloren (wenn Auto-Save)

---

### Test 6.2: Große Datenmengen

**Schritte:**
1. [ ] Viele Events erstellen (10+)
2. [ ] Viele Users erstellen (20+)
3. [ ] Performance prüfen:
   - [ ] Ladezeiten
   - [ ] Scroll-Performance
   - [ ] Filter-Performance

**Erwartetes Ergebnis:**
- ✅ Performance bleibt akzeptabel
- ✅ Keine UI-Freezes
- ✅ Filter funktionieren schnell

---

### Test 6.3: Gleichzeitige Bearbeitung

**Schritte:**
1. [ ] Zwei Browser-Tabs öffnen
2. [ ] Gleichen User in beiden Tabs bearbeiten
3. [ ] In Tab 1: Änderungen speichern
4. [ ] In Tab 2: Änderungen speichern
5. [ ] Konflikt-Behandlung prüfen

**Erwartetes Ergebnis:**
- ✅ Letzte Änderung gewinnt (oder Warnung)
- ✅ Keine Datenkorruption

---

## ✅ Test-Zusammenfassung

### Erfolgreiche Tests
- [ ] Content-Erstellung: Monatsupdate
- [ ] Content-Bearbeitung: Monatsupdate
- [ ] Content-Löschung: Monatsupdate
- [ ] Event-Erstellung
- [ ] Event-Bearbeitung
- [ ] Event-Löschung
- [ ] User-Bearbeitung
- [ ] User-Blockierung
- [ ] User-Entsperrung
- [ ] User-Entfernung
- [ ] Resource-Löschung
- [ ] Knowledge Item-Löschung
- [ ] Section-Löschung

### Fehlerfälle
- [ ] Validierung funktioniert
- [ ] Berechtigungen werden geprüft
- [ ] Bestätigungs-Dialoge erscheinen
- [ ] Fehler-Toasts erscheinen

### Integration
- [ ] Content ist öffentlich sichtbar
- [ ] Events sind öffentlich sichtbar
- [ ] Blockierte User können nicht einloggen

---

## 📝 Test-Protokoll

**Test-Datum:** _______________  
**Getestet von:** _______________  
**Browser:** _______________  
**Version:** _______________

### Gefundene Fehler

| # | Beschreibung | Schweregrad | Status |
|---|--------------|-------------|--------|
|   |              |             |        |

### Verbesserungsvorschläge

1. 
2. 
3. 

---

**Status:** ✅ Alle Tests bestanden / ⚠️ Teilweise bestanden / ❌ Fehler gefunden


