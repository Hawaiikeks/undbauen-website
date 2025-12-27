# Branch: `develop` - Dein Arbeits-Branch

## ✅ Branch erstellt: `develop`

Du arbeitest jetzt auf dem Branch **`develop`**. Alle deine zukünftigen Änderungen sollten auf diesem Branch gemacht werden.

---

## 🔄 Täglicher Workflow:

### 1. **Am Anfang des Tages - Aktuell sein:**
```bash
git checkout develop
git pull origin develop
```

### 2. **Änderungen machen** (Dateien bearbeiten)

### 3. **Änderungen committen:**
```bash
git add .
git commit -m "Beschreibung: Was wurde geändert"
```

### 4. **Branch updaten (pushen):**
```bash
git push origin develop
```

---

## 📋 Wichtige Befehle:

### Aktuellen Branch prüfen:
```bash
git branch
```
Der `*` zeigt, auf welchem Branch du bist.

### Status prüfen:
```bash
git status
```

### Zu develop wechseln:
```bash
git checkout develop
```

### Neueste Änderungen holen:
```bash
git pull origin develop
```

### Änderungen pushen:
```bash
git push origin develop
```

---

## 🎯 Zusammenfassung:

- **Arbeits-Branch:** `develop`
- **Alle Commits:** Gehen auf `develop`
- **Updates:** `git push origin develop`
- **`main`:** Bleibt stabil, wird nur durch Pull Requests aktualisiert

---

## 💡 Später: Von `develop` zu `main`

Wenn du Features fertig hast und in `main` mergen willst:

1. **Pull Request erstellen** auf GitHub:
   - `develop` → `main`
   - Code-Review (falls gewünscht)
   - Merge

2. **Oder direkt mergen** (wenn du allein arbeitest):
   ```bash
   git checkout main
   git merge develop
   git push origin main
   git checkout develop
   ```

---

## ✅ Du bist jetzt auf `develop` und kannst loslegen!

