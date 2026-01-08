# Quick Start Guide
## Backend lokal starten

### Schritt 1: .env Datei erstellen

**Im `backend/` Verzeichnis:**

1. Kopiere `env.example.txt` zu `.env`
2. Oder erstelle manuell eine `.env` Datei mit folgendem Inhalt:

```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000/api

DB_HOST=localhost
DB_PORT=5432
DB_NAME=undbauen
DB_USER=postgres
DB_PASSWORD=dein_postgres_passwort

JWT_SECRET=dein_super_sicheres_jwt_secret_min_32_zeichen_lang
JWT_EXPIRES_IN=7d

STORAGE_TYPE=local

CORS_ORIGIN=http://localhost:8000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

BCRYPT_ROUNDS=12
```

**Wichtig:** Ändere `DB_PASSWORD` und `JWT_SECRET`!

### Schritt 2: PostgreSQL einrichten (falls noch nicht geschehen)

1. PostgreSQL installieren (falls noch nicht vorhanden)
2. Datenbank erstellen:
   ```sql
   CREATE DATABASE undbauen;
   ```
3. Schema importieren:
   ```bash
   psql -U postgres -d undbauen -f backend/database/schema.sql
   ```

### Schritt 3: Server starten

**Im `backend/` Verzeichnis:**

```bash
npm start
```

**Oder für Development mit Auto-Reload:**

```bash
npm run dev
```

### Schritt 4: Testen

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Register Test:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234","firstName":"Test","lastName":"User"}'
```

**Login Test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```

### Fehlerbehebung

**Problem: "Cannot find module 'pg'"**
- Lösung: `npm install` im backend-Verzeichnis ausführen

**Problem: "Connection refused" (Datenbank)**
- Lösung: PostgreSQL läuft nicht oder falsche Credentials in `.env`

**Problem: "Port 3000 already in use"**
- Lösung: Port in `.env` ändern oder anderen Prozess beenden

**Problem: "JWT_SECRET too short"**
- Lösung: JWT_SECRET muss mindestens 32 Zeichen lang sein






