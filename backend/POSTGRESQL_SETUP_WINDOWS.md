# PostgreSQL Setup für Windows
## Schritt-für-Schritt Anleitung

---

## Option 1: Docker (Empfohlen - Einfachste Methode)

### Voraussetzung: Docker Desktop installiert

1. **Docker Desktop herunterladen:**
   - https://www.docker.com/products/docker-desktop/
   - Installieren und starten

2. **PostgreSQL Container starten:**
   ```powershell
   docker run --name postgres-undbauen `
     -e POSTGRES_PASSWORD=postgres `
     -e POSTGRES_USER=postgres `
     -p 5432:5432 `
     -d postgres:15
   ```

3. **Datenbank erstellen:**
   ```powershell
   docker exec -it postgres-undbauen psql -U postgres -c "CREATE DATABASE undbauen;"
   ```

4. **Schema importieren:**
   ```powershell
   Get-Content backend\database\schema.sql | docker exec -i postgres-undbauen psql -U postgres -d undbauen
   ```

5. **`.env` Datei anpassen:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=undbauen
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

**Fertig!** Backend sollte jetzt funktionieren.

---

## Option 2: PostgreSQL direkt installieren

### Schritt 1: PostgreSQL herunterladen

1. Gehe zu: https://www.postgresql.org/download/windows/
2. Klicke auf "Download the installer"
3. Wähle die neueste Version (z.B. PostgreSQL 15.x)
4. Lade den Installer herunter

### Schritt 2: PostgreSQL installieren

1. **Installer ausführen**
2. **Installation Directory:** Standard (z.B. `C:\Program Files\PostgreSQL\15`)
3. **Select Components:** Alle auswählen
4. **Data Directory:** Standard
5. **Password:** Wähle ein sicheres Passwort (MERKE ES DIR!)
6. **Port:** 5432 (Standard)
7. **Advanced Options:** Standard
8. **Pre Installation Summary:** Installieren
9. **Installation:** Warten bis fertig
10. **Stack Builder:** Nicht benötigt, schließen

### Schritt 3: PostgreSQL Service prüfen

```powershell
# Service sollte automatisch laufen
Get-Service -Name postgresql*
```

Falls nicht:
```powershell
Start-Service postgresql-x64-15  # Anpassen an deine Version
```

### Schritt 4: Datenbank erstellen

1. **pgAdmin öffnen** (wurde mit installiert)
   - Startmenü → PostgreSQL 15 → pgAdmin 4

2. **Oder über Command Line:**
   ```powershell
   # PostgreSQL bin-Verzeichnis zum PATH hinzufügen (normalerweise automatisch)
   psql -U postgres
   ```

3. **In psql:**
   ```sql
   CREATE DATABASE undbauen;
   \q
   ```

### Schritt 5: Schema importieren

**Option A: Über pgAdmin**
1. pgAdmin öffnen
2. Server → PostgreSQL 15 → Databases → undbauen → Rechtsklick → Query Tool
3. `backend/database/schema.sql` öffnen
4. Inhalt kopieren und ausführen (F5)

**Option B: Über Command Line**
```powershell
psql -U postgres -d undbauen -f backend\database\schema.sql
```

### Schritt 6: `.env` Datei konfigurieren

In `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=undbauen
DB_USER=postgres
DB_PASSWORD=dein_gewähltes_passwort
```

### Schritt 7: Testen

```powershell
cd backend
npm start
```

In anderem Terminal:
```powershell
curl http://localhost:3000/health
```

Sollte zurückgeben:
```json
{"status":"ok","database":"connected","timestamp":"..."}
```

---

## Option 3: Cloud PostgreSQL (Kostenlos)

Falls lokale Installation Probleme macht:

### Railway.app (Empfohlen)

1. Gehe zu: https://railway.app/
2. Sign up (kostenlos)
3. New Project → Provision PostgreSQL
4. PostgreSQL → Variables → Connection String kopieren
5. In `.env`:
   ```env
   # Railway gibt Connection String, z.B.:
   # postgresql://postgres:password@host:5432/railway
   # Aufteilen in:
   DB_HOST=host
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=password
   ```

### Supabase (Alternative)

1. Gehe zu: https://supabase.com/
2. Sign up (kostenlos)
3. New Project erstellen
4. Settings → Database → Connection String
5. In `.env` eintragen

---

## Troubleshooting

### Problem: "psql: command not found"

**Lösung:**
PostgreSQL bin-Verzeichnis zum PATH hinzufügen:
```powershell
# Normalerweise: C:\Program Files\PostgreSQL\15\bin
# Zu System-Umgebungsvariablen PATH hinzufügen
```

### Problem: "Connection refused"

**Lösung:**
```powershell
# Service prüfen
Get-Service postgresql*

# Service starten
Start-Service postgresql-x64-15
```

### Problem: "Password authentication failed"

**Lösung:**
- Passwort in `.env` prüfen
- Standard-Passwort: Das bei Installation gewählte Passwort

### Problem: "Database does not exist"

**Lösung:**
```powershell
psql -U postgres
CREATE DATABASE undbauen;
\q
```

---

## Empfehlung

**Für schnellen Start:** Docker (Option 1)  
**Für Produktion:** Lokale Installation (Option 2)  
**Für Entwicklung ohne Setup:** Cloud (Option 3)

---

## Nächste Schritte

Nach erfolgreicher Installation:

1. ✅ PostgreSQL läuft
2. ✅ Datenbank `undbauen` erstellt
3. ✅ Schema importiert
4. ✅ `.env` konfiguriert
5. ✅ Backend testen: `npm test`






