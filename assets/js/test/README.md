# Unit Tests

Unit Test Suite für die undbauen Website.

## 📁 Struktur

- `testRunner.js` - Test-Framework (Assertions, Test-Runner)
- `utils.test.js` - Tests für Utility-Funktionen
- `validation.test.js` - Tests für Validierungs-Funktionen
- `storageAdapter.test.js` - Tests für Storage-Adapter
- `runAllTests.js` - Test-Runner für alle Suites
- `adminTestRunner.js` - Integration-Tests für Admin-Funktionen

## 🚀 Tests ausführen

### Im Browser

1. Server starten:
   ```bash
   cd src
   python -m http.server 8000
   ```

2. Browser öffnen:
   ```
   http://localhost:8000/test-runner.html
   ```

3. Tests ausführen:
   - Klicke auf "▶️ Alle Tests ausführen" oder
   - Führe einzelne Test-Suites aus

### In der Browser-Konsole

```javascript
// Alle Tests ausführen
import('./assets/js/test/runAllTests.js').then(m => m.runAllTests());

// Oder einzelne Suites
import('./assets/js/test/utils.test.js').then(m => m.runUtilsTests());
import('./assets/js/test/validation.test.js').then(m => m.runValidationTests());
import('./assets/js/test/storageAdapter.test.js').then(m => m.runStorageAdapterTests());
```

### In Node.js (mit Mock localStorage)

```bash
node --experimental-modules test-runner.js
```

## 📊 Test-Statistiken

Die Tests decken ab:
- ✅ Utility-Funktionen (fmtDate, parseTags, formatFileSize, etc.)
- ✅ Validierungs-Funktionen (isValidEmail, validatePasswordStrength, etc.)
- ✅ Storage-Adapter-Funktionen (login, register, bookEvent, etc.)
- ✅ Edge Cases (null/undefined, leere Strings, ungültige Typen)

## 🧪 Neue Tests hinzufügen

1. Erstelle eine neue Test-Datei: `myModule.test.js`
2. Importiere das Test-Framework:
   ```javascript
   import { describe } from './testRunner.js';
   ```
3. Schreibe Tests:
   ```javascript
   export async function runMyModuleTests() {
     const suite = describe('MyModule Tests', (test) => {
       test('my test name', () => {
         test.assertEquals(actual, expected, 'Error message');
       });
     });
     return await suite.run();
   }
   ```
4. Füge die Suite zu `runAllTests.js` hinzu

## ✅ Verfügbare Assertions

- `test.assert(condition, message)` - Prüft ob Bedingung wahr ist
- `test.assertEquals(actual, expected, message)` - Prüft Gleichheit
- `test.assertTruthy(value, message)` - Prüft ob Wert truthy ist
- `test.assertFalsy(value, message)` - Prüft ob Wert falsy ist
- `test.assertNull(value, message)` - Prüft ob Wert null/undefined ist
- `test.assertContains(array, item, message)` - Prüft ob Array Item enthält
- `test.assertThrows(fn, expectedError)` - Prüft ob Funktion Fehler wirft

## 📝 Best Practices

1. **Isolierte Tests**: Jeder Test sollte unabhängig sein
2. **Klare Namen**: Test-Namen sollten beschreiben, was getestet wird
3. **Edge Cases**: Teste auch null/undefined/leere Werte
4. **Cleanup**: Bereinige nach Tests (z.B. Mock-Daten löschen)

## 🔍 Debugging

Falls Tests fehlschlagen:
1. Prüfe die Browser-Konsole für Details
2. Prüfe die `console-output` Sektion in der Test-Runner HTML
3. Verwende `console.log()` in Tests für Debugging









