# Git Workflow - Wie arbeiten wir zusammen?

## 🎯 Regel: **NICHT direkt auf `main` arbeiten!**

### ✅ Richtig: Feature-Branches verwenden
### ❌ Falsch: Direkt auf `main` committen

---

## 📋 Standard-Workflow für alle Änderungen:

### 1. **Aktuellen Stand holen:**
```bash
git checkout main
git pull origin main
```

### 2. **Neuen Feature-Branch erstellen:**
```bash
git checkout -b feature/mein-feature-name
```

**Branch-Namen Beispiele:**
- `feature/dark-mode-toggle`
- `feature/user-profile-edit`
- `fix/login-error`
- `refactor/css-variables`

### 3. **Änderungen machen** (Dateien bearbeiten)

### 4. **Änderungen committen:**
```bash
git add .
git commit -m "Beschreibung: Was wurde geändert"
```

### 5. **Branch pushen:**
```bash
git push origin feature/mein-feature-name
```

### 6. **Pull Request auf GitHub erstellen:**
- Gehe zu: https://github.com/Hawaiikeks/undbauen-website
- Klicke auf **"Compare & pull request"**
- Beschreibe die Änderungen
- Wähle Reviewer aus (falls vorhanden)
- Erstelle den Pull Request

### 7. **Nach Review: Merge in main:**
- Nach Code-Review auf GitHub
- Klicke auf **"Merge pull request"**
- Branch kann gelöscht werden

### 8. **Zurück zu main wechseln:**
```bash
git checkout main
git pull origin main
```

---

## ⚠️ Ausnahme: Nur für kleine Hotfixes

**Nur wenn:**
- Sehr kleine, kritische Bugfixes
- Tippfehler in Dokumentation
- Kleine CSS-Anpassungen (< 5 Zeilen)

**Dann direkt auf main:**
```bash
git checkout main
git pull origin main
# Änderung machen
git add .
git commit -m "Hotfix: Beschreibung"
git push origin main
```

**Aber:** Auch hier ist ein Branch besser!

---

## 🔄 Workflow-Visualisierung:

```
main (stabil)
  │
  ├── feature/dark-mode (entwickelt)
  │     └── [Änderungen]
  │
  ├── feature/user-profile (entwickelt)
  │     └── [Änderungen]
  │
  └── fix/login-error (entwickelt)
        └── [Änderungen]
        
Nach Review → Merge in main
```

---

## 📝 Branch-Naming Convention:

| Präfix | Verwendung | Beispiel |
|--------|-----------|----------|
| `feature/` | Neue Features | `feature/dark-mode-toggle` |
| `fix/` | Bugfixes | `fix/login-error` |
| `refactor/` | Code-Verbesserungen | `refactor/css-structure` |
| `docs/` | Dokumentation | `docs/readme-update` |
| `style/` | Nur CSS/Design | `style/button-colors` |

---

## 🎯 Zusammenfassung:

### ✅ **Immer:**
- Feature-Branches für Änderungen
- Pull Requests für Reviews
- `main` bleibt stabil

### ❌ **Niemals:**
- Direkt auf `main` entwickeln
- `main` ohne Review pushen
- Große Änderungen ohne Branch

---

## 🚀 Quick-Start für neue Features:

```bash
# 1. Aktuell sein
git checkout main
git pull origin main

# 2. Branch erstellen
git checkout -b feature/mein-feature

# 3. Arbeiten, committen, pushen
git add .
git commit -m "Feature: Beschreibung"
git push origin feature/mein-feature

# 4. Pull Request auf GitHub erstellen
```

---

## 💡 Warum dieser Workflow?

1. **Code-Review:** Andere können Änderungen prüfen
2. **Stabilität:** `main` bleibt immer funktionsfähig
3. **Rückgängig:** Einfach Branch löschen, wenn nicht gewollt
4. **Parallel:** Mehrere Features gleichzeitig entwickeln
5. **Geschichte:** Klare Historie, was wann warum geändert wurde




