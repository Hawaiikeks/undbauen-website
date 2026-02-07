# Tests

Umfassende Tests für die Anwendung.

## Struktur

- `test-framework.js` - Einfaches Test-Framework
- `router.test.js` - Router-Tests
- `errorHandler.test.js` - Error-Handler-Tests
- `pages.test.js` - Page-Module-Tests
- `components.test.js` - Component-Tests
- `services.test.js` - Service-Tests

## Ausführen

```bash
# Im Browser Console - Alle Tests
import('./tests/router.test.js');
import('./tests/errorHandler.test.js');
import('./tests/pages.test.js');
import('./tests/components.test.js');
import('./tests/services.test.js');
```

## Test-Kategorien

### Router Tests
- Route-Definitionen
- Route-Erkennung
- Route-Validierung

### Error Handler Tests
- Fehler-Kategorisierung
- Fehler-Behandlung
- User-Messages

### Page Module Tests
- Export-Verfügbarkeit
- Funktionstypen
- Spezifische Page-Tests

### Component Tests
- Sidebar-Navigation
- Icons
- Toast-Notifications

### Service Tests
- API Client
- Auth Guard
- Error Handler
- Router

## Erweitern

Weitere Tests können nach dem gleichen Pattern hinzugefügt werden:

```javascript
import { describe, it, expect } from './test-framework.js';

describe('My Module', () => {
  it('should do something', () => {
    expect(actual).toBe(expected);
  });
});
```
