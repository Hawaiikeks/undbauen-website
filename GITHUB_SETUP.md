# GitHub Repository Setup

## Schritt 1: Repository auf GitHub erstellen

1. Gehe zu [github.com/new](https://github.com/new)
2. Repository Name: `undbauen-website`
3. Beschreibung (optional): "Innovationsnetzwerk für AEC/BIM/Digitalisierung"
4. **Wichtig:** Repository **NICHT** mit README, .gitignore oder License initialisieren
5. Klicke auf **"Create repository"**

## Schritt 2: Lokales Repository mit GitHub verbinden

Führe diese Befehle in deinem Terminal aus:

```bash
git remote add origin https://github.com/hawaiikeks/undbauen-website.git
git branch -M main
git push -u origin main
```

## Schritt 3: Überprüfen

Nach dem Push solltest du auf GitHub sehen:
- Alle deine Dateien (index.html, app/, assets/, etc.)
- README.md
- .gitignore

## Schritt 4: Collaborators einladen

1. Gehe zu: https://github.com/hawaiikeks/undbauen-website/settings/access
2. Klicke auf **"Add people"**
3. Gib die GitHub-Usernames deiner Teammitglieder ein
4. Sie erhalten eine Einladungs-Email

## Fertig! 🎉

Jetzt können alle zusammenarbeiten. Siehe `ZUSAMMENARBEIT.md` für den Workflow.

