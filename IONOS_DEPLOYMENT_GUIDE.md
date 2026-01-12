# IONOS Deployment Guide
## undbauen - Schritt-für-Schritt Anleitung für IONOS Webhosting

**Erstellt:** 2025-01-27  
**Ziel:** Website auf IONOS produktiv starten

---

## 📋 Voraussetzungen

### Was du brauchst:
1. ✅ IONOS Webhosting-Paket (mit PHP/Node.js Support)
2. ✅ PostgreSQL Datenbank (IONOS bietet PostgreSQL an)
3. ✅ Domain (z.B. `undbauen.de`)
4. ✅ SSL-Zertifikat (IONOS bietet kostenloses SSL)
5. ✅ FTP/SSH Zugang zu IONOS

### Optionen bei IONOS:

#### Option A: Shared Hosting (einfacher, günstiger)
- **Vorteil:** Einfaches Setup, keine Server-Verwaltung
- **Nachteil:** Begrenzte Node.js-Unterstützung
- **Empfehlung:** Für MVP/Startphase

#### Option B: VPS/Cloud Server (flexibler, mehr Kontrolle)
- **Vorteil:** Volle Kontrolle, Node.js möglich
- **Nachteil:** Mehr Verwaltung nötig
- **Empfehlung:** Für Produktion mit Backend

---

## 🚀 Deployment-Strategie

### Strategie 1: Frontend-only (MVP)
**Wenn IONOS kein Node.js unterstützt:**

1. Frontend auf IONOS hochladen
2. Backend auf separatem Service (z.B. Railway, Render, Heroku)
3. API-Calls von Frontend zu externem Backend

### Strategie 2: Full Stack (empfohlen)
**Wenn IONOS Node.js unterstützt:**

1. Frontend auf IONOS
2. Backend auf IONOS (Node.js)
3. PostgreSQL auf IONOS

---

## 📝 Schritt-für-Schritt Anleitung

### Phase 1: Vorbereitung (Lokal)

#### 1.1 Build Frontend

```bash
# Im Projekt-Root
cd src
# Frontend-Dateien sind bereits statisch, keine Build-Schritte nötig
# Aber: API-URL anpassen
```

#### 1.2 Backend vorbereiten

```bash
cd backend
npm install --production
# .env für Production erstellen
```

#### 1.3 Datenbank-Schema exportieren

```bash
# Schema ist bereits in backend/database/schema.sql
```

---

### Phase 2: IONOS Setup

#### 2.1 PostgreSQL Datenbank einrichten

1. **IONOS Control Panel öffnen**
2. **Datenbanken → PostgreSQL → Neue Datenbank erstellen**
3. **Datenbank-Details notieren:**
   - Host: `db123456789.ionos.com` (oder ähnlich)
   - Port: `5432`
   - Datenbankname: `undbauen`
   - Benutzername: `undbauen_user`
   - Passwort: (sicher speichern!)

#### 2.2 Datenbank-Schema importieren

**Option A: Über phpPgAdmin (IONOS Control Panel)**
1. phpPgAdmin öffnen
2. Datenbank auswählen
3. SQL-Query ausführen
4. `backend/database/schema.sql` Inhalt einfügen und ausführen

**Option B: Über psql (SSH)**
```bash
psql -h db123456789.ionos.com -U undbauen_user -d undbauen -f schema.sql
```

#### 2.3 SSL-Zertifikat aktivieren

1. **IONOS Control Panel → SSL**
2. **Kostenloses SSL aktivieren** (Let's Encrypt)
3. **Domain bestätigen**
4. **HTTPS erzwingen aktivieren**

---

### Phase 3: Backend Deployment

#### 3.1 Backend-Dateien hochladen

**Via FTP:**
```bash
# Backend-Ordner auf IONOS hochladen
# Pfad: /htdocs/backend/ oder /api/
```

**Via SSH (wenn verfügbar):**
```bash
scp -r backend/ user@ionos-server:/var/www/backend/
```

#### 3.2 Backend konfigurieren

**`.env` Datei auf Server erstellen:**
```env
NODE_ENV=production
PORT=3000
API_BASE_URL=https://undbauen.de/api

DB_HOST=db123456789.ionos.com
DB_PORT=5432
DB_NAME=undbauen
DB_USER=undbauen_user
DB_PASSWORD=dein_sicheres_passwort

JWT_SECRET=dein_super_sicheres_jwt_secret_min_32_zeichen
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://undbauen.de

STORAGE_TYPE=local
# Oder S3/CDN wenn konfiguriert

BCRYPT_ROUNDS=12
```

#### 3.3 Node.js Dependencies installieren

**Via SSH:**
```bash
cd /var/www/backend
npm install --production
```

#### 3.4 Backend starten

**Option A: PM2 (empfohlen)**
```bash
npm install -g pm2
pm2 start server.js --name undbauen-api
pm2 save
pm2 startup
```

**Option B: Systemd Service**
```bash
# Service-Datei erstellen: /etc/systemd/system/undbauen-api.service
sudo systemctl enable undbauen-api
sudo systemctl start undbauen-api
```

**Option C: IONOS Node.js Manager** (falls verfügbar)
- Im Control Panel Node.js App erstellen
- Start-Script: `node server.js`

---

### Phase 4: Frontend Deployment

#### 4.1 Frontend-Dateien hochladen

**Via FTP:**
```
src/
├── app/          → /htdocs/app/
├── admin/        → /htdocs/admin/
├── public/       → /htdocs/
├── assets/       → /htdocs/assets/
└── index.html    → /htdocs/index.html
```

**Wichtig:**
- `sw.js` ins Root-Verzeichnis (`/htdocs/sw.js`)
- Alle Pfade sind relativ, sollten funktionieren

#### 4.2 API-URL anpassen

**In `src/assets/js/services/apiClient.js`:**
```javascript
// Production API URL
const API_BASE_URL = 'https://undbauen.de/api';
// Oder: 'https://api.undbauen.de' wenn Backend auf Subdomain
```

#### 4.3 .htaccess für SPA Routing

**Datei erstellen: `/htdocs/.htaccess`:**
```apache
# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA Routing - alle Requests zu index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

### Phase 5: Reverse Proxy Setup (wenn nötig)

**Wenn Backend auf Port 3000 läuft, aber über Domain erreichbar sein soll:**

**.htaccess für API-Routing:**
```apache
# API Requests zu Backend weiterleiten
RewriteCond %{REQUEST_URI} ^/api/(.*)$
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

**Oder: Nginx Config (wenn verfügbar):**
```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

### Phase 6: Testing

#### 6.1 Health Check
```bash
curl https://undbauen.de/api/health
# Sollte zurückgeben: {"status":"ok","database":"connected"}
```

#### 6.2 Frontend testen
1. https://undbauen.de öffnen
2. Login testen
3. Alle Hauptfunktionen testen

#### 6.3 API testen
```bash
# Register
curl -X POST https://undbauen.de/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234","firstName":"Test","lastName":"User"}'

# Login
curl -X POST https://undbauen.de/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```

---

## 🔧 Troubleshooting

### Problem: Backend startet nicht
**Lösung:**
- Node.js Version prüfen: `node --version` (sollte 18+ sein)
- Port prüfen: Ist Port 3000 verfügbar?
- Logs prüfen: `pm2 logs undbauen-api`

### Problem: Datenbank-Verbindung fehlgeschlagen
**Lösung:**
- Firewall-Regeln prüfen (IONOS erlaubt externe DB-Verbindungen?)
- Host/Port/User/Password in `.env` prüfen
- Test: `psql -h db123456789.ionos.com -U undbauen_user -d undbauen`

### Problem: CORS-Fehler
**Lösung:**
- `CORS_ORIGIN` in `.env` auf korrekte Domain setzen
- Backend-Neustart: `pm2 restart undbauen-api`

### Problem: 404 auf Frontend-Routes
**Lösung:**
- `.htaccess` prüfen (SPA Routing)
- Apache `mod_rewrite` aktiviert?

---

## 📊 Post-Deployment Checklist

- [ ] SSL aktiviert und HTTPS erzwungen
- [ ] Backend läuft und antwortet auf `/api/health`
- [ ] Datenbank verbunden
- [ ] Frontend lädt korrekt
- [ ] Login/Register funktioniert
- [ ] API-Calls funktionieren
- [ ] Security Headers gesetzt
- [ ] Monitoring aktiviert (optional)
- [ ] Backup-Strategie eingerichtet

---

## 🔄 Updates & Wartung

### Frontend Update
```bash
# Neue Dateien via FTP hochladen
# Oder: Git Pull (wenn Git auf Server)
```

### Backend Update
```bash
cd /var/www/backend
git pull  # oder Dateien hochladen
npm install --production
pm2 restart undbauen-api
```

### Datenbank-Migration
```bash
psql -h db123456789.ionos.com -U undbauen_user -d undbauen -f migration.sql
```

---

## 💡 Alternative: Externes Backend

**Wenn IONOS kein Node.js unterstützt:**

### Option 1: Railway.app (kostenlos für Start)
1. Backend auf Railway deployen
2. PostgreSQL auf Railway
3. API-URL: `https://undbauen-api.railway.app`

### Option 2: Render.com
1. Backend auf Render deployen
2. PostgreSQL auf Render
3. API-URL: `https://undbauen-api.onrender.com`

### Option 3: Heroku
1. Backend auf Heroku deployen
2. PostgreSQL Add-on
3. API-URL: `https://undbauen-api.herokuapp.com`

**Frontend bleibt auf IONOS, API-Calls gehen zu externem Backend.**

---

## 📞 Support

Bei Problemen:
1. IONOS Support kontaktieren
2. Logs prüfen: `pm2 logs` oder Server-Logs
3. Health Check: `/api/health` Endpoint

---

**Status:** ✅ Deployment-Guide erstellt  
**Nächster Schritt:** Backend vollständig implementieren, dann Deployment testen






