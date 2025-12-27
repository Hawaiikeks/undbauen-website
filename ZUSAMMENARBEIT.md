# Zusammenarbeit an der Website

## 🚀 Schritt 1: GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com) und erstelle ein neues Repository
2. **Wichtig:** Repository **NICHT** mit README initialisieren (wir haben schon einen)
3. Notiere dir die Repository-URL (z.B. `https://github.com/dein-username/undbauen.git`)

## 🔗 Schritt 2: Lokales Repository mit GitHub verbinden

Führe diese Befehle in deinem Terminal aus (ersetze `DEINE-URL` mit deiner GitHub-URL):

```bash
git remote add origin DEINE-URL
git branch -M main
git push -u origin main
```

**Beispiel:**
```bash
git remote add origin https://github.com/lukegilbert/undbauen.git
git branch -M main
git push -u origin main
```

## 👥 Schritt 3: Andere Entwickler einladen

1. Gehe zu deinem GitHub Repository
2. Klicke auf **Settings** → **Collaborators**
3. Füge die GitHub-Usernames der Teammitglieder hinzu
4. Sie erhalten eine Einladungs-Email

## 📥 Schritt 4: Andere Entwickler - Repository klonen

Die anderen Entwickler führen aus:

```bash
git clone DEINE-REPOSITORY-URL
cd test  # oder wie dein Projekt-Ordner heißt
```

## 🔄 Schritt 5: Workflow für Zusammenarbeit

### Täglicher Workflow

**1. Neueste Änderungen holen:**
```bash
git pull origin main
```

**2. Feature-Branch erstellen:**
```bash
git checkout -b feature/neue-funktion
```

**3. Änderungen machen** (Dateien bearbeiten)

**4. Änderungen committen:**
```bash
git add .
git commit -m "Beschreibung: Was wurde geändert"
```

**5. Branch pushen:**
```bash
git push origin feature/neue-funktion
```

**6. Pull Request auf GitHub erstellen:**
- Gehe zu deinem Repository auf GitHub
- Klicke auf **"Compare & pull request"**
- Beschreibe die Änderungen
- Wähle Reviewer aus
- Erstelle den Pull Request

**7. Nach Review: Merge in main:**
- Nach Code-Review auf GitHub
- Klicke auf **"Merge pull request"**
- Branch kann gelöscht werden

**8. Zurück zu main wechseln:**
```bash
git checkout main
git pull origin main
```

## 🛠️ Häufige Git-Befehle

### Status prüfen
```bash
git status
```

### Änderungen anzeigen
```bash
git diff
```

### Branch wechseln
```bash
git checkout main
git checkout feature/mein-feature
```

### Alle Branches anzeigen
```bash
git branch -a
```

### Änderungen verwerfen (Vorsicht!)
```bash
git checkout -- dateiname.html
```

### Letzten Commit rückgängig machen
```bash
git reset --soft HEAD~1
```

## ⚠️ Wichtige Regeln

1. **Niemals direkt auf `main` committen** (außer Hotfixes)
2. **Immer erst `git pull`** vor dem Arbeiten
3. **Kleine, fokussierte Commits** (nicht alles auf einmal)
4. **Aussagekräftige Commit-Messages:**
   - ❌ "fix"
   - ✅ "Fix: Hero-Banner Text-Shadow in Dark Mode"
5. **Vor dem Push testen** (lokaler Server starten)

## 🔀 Merge-Konflikte lösen

Falls es Konflikte gibt:

1. Git zeigt dir die konfliktbehafteten Dateien
2. Öffne die Dateien in deinem Editor
3. Suche nach `<<<<<<<`, `=======`, `>>>>>>>`
4. Entscheide, welche Version behalten werden soll
5. Entferne die Markierungen
6. Committe die Lösung:
   ```bash
   git add .
   git commit -m "Resolve merge conflict in base.css"
   ```

## 📋 Branch-Naming Convention

- `feature/` - Neue Features (z.B. `feature/dark-mode-toggle`)
- `fix/` - Bugfixes (z.B. `fix/login-error`)
- `refactor/` - Code-Verbesserungen (z.B. `refactor/css-variables`)
- `docs/` - Dokumentation (z.B. `docs/readme-update`)

## 🎯 Best Practices

- **Regelmäßig committen** (nicht alles am Ende)
- **Pull Requests für Reviews nutzen**
- **Code-Kommentare** für komplexe Logik
- **README aktuell halten**

## 🆘 Hilfe

Bei Problemen:
- `git status` zeigt den aktuellen Zustand
- `git log` zeigt die Commit-Historie
- GitHub hat eine gute Dokumentation: [docs.github.com](https://docs.github.com)

