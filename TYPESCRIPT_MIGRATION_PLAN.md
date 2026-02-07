# TypeScript Migration Plan

## Übersicht

Dieses Dokument beschreibt den Plan für die Migration von JavaScript zu TypeScript.

## Warum TypeScript?

- **Type Safety**: Weniger Runtime-Fehler durch statische Typisierung
- **Bessere IDE-Unterstützung**: Autocomplete, Refactoring, Navigation
- **Selbstdokumentierender Code**: Typen dokumentieren die API
- **Einfachere Wartung**: Fehler werden früher erkannt

## Migration-Strategie

### Phase 1: Setup (1-2 Tage)

1. **TypeScript installieren**
   ```bash
   npm install --save-dev typescript @types/node
   ```

2. **tsconfig.json erstellen**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ES2020",
       "lib": ["ES2020", "DOM"],
       "moduleResolution": "node",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "outDir": "./dist",
       "rootDir": "./assets/js"
     },
     "include": ["assets/js/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

3. **Build-Script hinzufügen**
   ```json
   {
     "scripts": {
       "build": "tsc",
       "watch": "tsc --watch"
     }
   }
   ```

### Phase 2: Schrittweise Migration (2-4 Wochen)

**Reihenfolge:**

1. **Services** (1 Woche)
   - `services/apiClient.js` → `services/apiClient.ts`
   - `services/router.js` → `services/router.ts`
   - `services/authGuard.js` → `services/authGuard.ts`
   - `services/errorHandler.js` → `services/errorHandler.ts`

2. **Repositories** (3-5 Tage)
   - Alle Repository-Dateien migrieren
   - Interfaces für Datenmodelle definieren

3. **Components** (1 Woche)
   - Wichtige Komponenten zuerst
   - UI-Komponenten nach und nach

4. **Pages** (1 Woche)
   - Page-Module migrieren
   - Typen für Page-Props definieren

5. **Main Files** (2-3 Tage)
   - `app.js` → `app.ts`
   - `public.js` → `public.ts`

### Phase 3: Type Definitions (laufend)

**Interfaces definieren:**

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'member' | 'editor' | 'moderator' | 'admin';
  status: 'active' | 'inactive';
}

// types/ticket.ts
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'bug' | 'content' | 'event' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Phase 4: Build-Integration (1 Woche)

1. **Build-Prozess**
   - TypeScript kompiliert zu JavaScript
   - JavaScript-Dateien werden in `dist/` generiert
   - HTML-Dateien verweisen auf kompilierte JS

2. **Development**
   - `tsc --watch` für automatische Kompilierung
   - Source Maps für Debugging

3. **Production**
   - Minification
   - Tree-shaking
   - Bundle-Optimierung

## Herausforderungen

### 1. **localStorage Adapter**

**Problem:** localStorage gibt `any` zurück

**Lösung:**
```typescript
function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
```

### 2. **Dynamische Imports**

**Problem:** Dynamische Imports sind schwer zu typisieren

**Lösung:**
```typescript
const pageModules = await import('./pages/index.js') as typeof import('./pages/index.js');
```

### 3. **DOM-Manipulation**

**Problem:** DOM-Elemente können `null` sein

**Lösung:**
```typescript
const element = document.querySelector<HTMLElement>('#id');
if (!element) {
  throw new Error('Element not found');
}
// element ist jetzt garantiert nicht null
```

## Empfehlungen

1. **Schrittweise Migration**: Nicht alles auf einmal
2. **Strict Mode**: Langsam aktivieren, nicht sofort
3. **Tests**: Während Migration schreiben
4. **Code Reviews**: Jede Migration prüfen

## Zeitplan

- **Phase 1**: 1-2 Tage
- **Phase 2**: 2-4 Wochen
- **Phase 3**: Laufend
- **Phase 4**: 1 Woche

**Gesamt:** ~4-6 Wochen für vollständige Migration

## Nächste Schritte

1. ✅ Plan erstellt
2. ⏳ TypeScript installieren
3. ⏳ Erste Datei migrieren (z.B. `router.ts`)
4. ⏳ Build-Prozess einrichten
5. ⏳ Schrittweise Migration

---

**Status:** Plan erstellt, Migration noch nicht gestartet  
**Erstellt:** 2024
