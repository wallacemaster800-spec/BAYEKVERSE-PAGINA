# 🧪 GUÍA DE TESTING - Verificar Optimizaciones

## Antes de empezar

1. Abre DevTools: `F12`
2. Ve a pestaña **Network**
3. Marca: `Disable cache` (para simular primer load)

---

## TEST 1: Lazy Loading de Páginas ✅

### Objetivo
Verificar que las páginas se carguen bajo demanda (code splitting)

### Pasos
```
1. Network tab → Clear
2. Abre Home (/)
3. Observa la pestaña Network:
   ✅ Debería cargar:
      - main.js
      - index.{hash}.js (Index page)
      - assets ...
   
   ❌ NO debería cargar:
      - SeriesDetail
      - Admin
      - Login
```

### Resultado esperado
```
Main bundle: ~250KB (antes era 450KB)
```

---

## TEST 2: Recarga en Lore (PROBLEMA ORIGINAL) 🎯

### Objetivo
Verificar que recargando en Lore no vuelve a home

### Pasos
```
1. Ve a cualquier serie: /series/breaking-bad
2. Haz clic en pestaña "LORE"
3. Presiona F5 (recargar página)
4. Observa:
   ✅ Debería:
      - Quedarse en /series/breaking-bad
      - Pestaña Lore activa
      - Network: solo 1-2 requests (getSession + lore)
   
   ❌ NO debería:
      - Ir a /
      - Cargar episodios
      - Cargar galería
```

### Network Expected
```
GET /auth/v1/user          (auth check)
GET /rest/v1/lore?...      (lore data)

Total: ~50-100KB
Queries: 2
```

---

## TEST 3: Cambio de Pestañas (Lazy Loading por Tab) 📑

### Objetivo
Verificar que solo se cargan datos de la tab activa

### Pasos
```
1. /series/breaking-bad (Episodios por defecto)
2. Network tab → Observa requests
3. Haz clic en "GALERÍA"
4. Network tab → Observa nuevos requests
5. Haz clic en "LORE"
6. Network tab → Observa nuevos requests
7. Vuelve a "EPISODIOS"
   
   Observar:
   ✅ Cada tab hace su query la PRIMERA VEZ
   ✅ Al volver a tab anterior: SIN nuevos requests (cacheado)
```

### Network Expected
```
Tab "Episodios": 
  GET /capitulos?series_id=...

Tab "Galería":
  GET /galeria?series_id=...

Tab "Lore":
  GET /lore?series_id=...

Volver a "Episodios":
  (sin requests - cached 24h)
```

---

## TEST 4: Cache Persistencia (24 horas) ⏰

### Objetivo
Verificar que los datos se cachean por 24 horas

### Pasos
```
1. Ve a /series/breaking-bad
2. Abre todas las tabs una vez (Episodios, Lore, Galería)
3. Network tab → Observa requests hechos
4. Recarga página (F5)
5. Network tab → Observa:
   ✅ Debería:
      - Solo request de auth (getSession)
      - Datos cargados sin requests (desde cache)
      - Muy rápido (<200ms)
   
   ❌ NO debería:
      - Hacer requests de capitulos, lore, galeria
      - Mostrar loading skeletons (todo cacheado)
```

### Storage Expected
```
localStorage:
  react-query-cache: {...}  (cache de queries)
```

---

## TEST 5: Service Worker (Offline) 📡

### Objetivo
Verificar que funciona offline con Service Worker

### Pasos
```
1. Carga /series/breaking-bad
2. Abre todas las tabs (Episodios, Lore, Galería)
3. DevTools → Network tab → Offline ⚪
4. Recarga página (F5)
5. Observar:
   ✅ Debería:
      - Cargar contenido desde cache
      - SIN errores de red
      - Página funcional offline
   
   ❌ NO debería:
      - Error "No internet"
      - Página en blanco
```

### Expected
```
Service Worker status:
  ✓ Registered
  ✓ Active
  ✓ Caching resources
```

---

## TEST 6: Bundle Size Reduction 📦

### Objetivo
Verificar que el bundle es más pequeño

### Pasos
```
1. Terminal: npm run build
2. Observar salida:
   
   ✅ Main bundle: ~250KB (antes ~450KB)
   ✅ Chunks separados para páginas
```

### Esperado
```
dist/index.html                    10 kB │ gzip: 4 kB
dist/assets/main-xxxxx.js         250 kB │ gzip: 80 kB
dist/assets/index-xxxxx.js         150 kB │ gzip: 45 kB
dist/assets/series-detail-xx.js    120 kB │ gzip: 35 kB
dist/service-worker.js             15 kB │ gzip: 5 kB

Total: ~545KB (antes ~800KB) ✅
```

---

## TEST 7: Performance Timing 🚀

### Objetivo
Verificar que el rendering es más rápido

### Pasos
```
1. DevTools → Performance tab
2. Haz clic en record ⚫
3. Navega: Home → Series → Lore → Galería → Home
4. Detén recording
5. Observar:
   ✅ First Contentful Paint: <1s (antes 2-3s)
   ✅ Largest Contentful Paint: <1.5s
   ✅ Cumulative Layout Shift: <0.1
```

### Timeline esperado
```
0ms    - Navigation start
100ms  - JS parsing
300ms  - React render
500ms  - Component mount
800ms  - Data fetch completion
1000ms - First Contentful Paint ✅
```

---

## TEST 8: Memory Usage 💾

### Objetivo
Verificar que no hay memory leaks

### Pasos
```
1. DevTools → Memory tab
2. Toma snapshot inicial
3. Navega entre series 5-10 veces
4. Toma snapshot final
5. Compare:
   ✅ Memory crecimiento: <20MB
   ❌ Memory crecimiento: >50MB = problema
```

---

## TEST 9: Conditional Query Execution 🔄

### Objetivo
Verificar que las queries no se ejecutan si la tab no está activa

### Pasos
```
1. /series/breaking-bad
2. DevTools → Network → Filter: "lore"
3. Pestaña activa: "Episodios"
4. Observar:
   ❌ SIN requests de lore
   
5. Haz clic en "LORE"
   ✅ Aparecen requests de lore
   
6. Vuelve a "EPISODIOS"
   ✅ Episodios ya cacheados (sin requests)
```

---

## TEST 10: Auth Session Persistence 🔐

### Objetivo
Verificar que la auth session se mantiene

### Pasos
```
1. /login → Inicia sesión
2. Recarga página (F5)
3. Observar:
   ✅ Deberías seguir autenticado
   ✅ NO se pide login nuevamente
4. Storage → Cookies/LocalStorage
   ✅ Auth token presente
```

---

## ✅ Checklist de Validación

Marca cada test mientras lo ejecutas:

- [ ] Test 1: Lazy loading de páginas
- [ ] Test 2: Recarga en Lore (NO va a home)
- [ ] Test 3: Cambio de pestañas (lazy loading)
- [ ] Test 4: Cache 24 horas
- [ ] Test 5: Service Worker offline
- [ ] Test 6: Bundle size reduction
- [ ] Test 7: Performance timing
- [ ] Test 8: Memory usage
- [ ] Test 9: Conditional queries
- [ ] Test 10: Auth persistence

---

## 🐛 Troubleshooting

### Si ves "Network error"
```
1. Verifica conexión a Supabase
2. Check VITE_SUPABASE_URL en .env
3. Revisa console: F12 → Console
```

### Si Service Worker no registra
```
1. DevTools → Application → Service Workers
2. Debería estar en "Active"
3. Si no: 
   - Limpia cache: DevTools → Clear storage
   - Recargar: F5
```

### Si ves requests innecesarios
```
1. Check Network: Filter "lore"
2. Si se carga en tab "Episodios": problema
3. Revisa SeriesDetail.tsx activeTab state
```

### Si el bundle sigue grande
```
1. npm run build
2. Analiza: npm run build --analyze (si tienes plugin)
3. Busca importes estáticos en App.tsx
```

---

## 📊 Métricas a Monitorear

Después de deployment, monitorear:

| Métrica | Target | Actual |
|---------|--------|--------|
| Bundle size | <300KB | ? |
| First Paint | <1s | ? |
| Data per session | <200KB | ? |
| Cache hit rate | >80% | ? |
| Offline support | ✅ | ? |
| No layout shift | <0.1 | ? |

---

## 🎯 Conclusión

Si todos los tests pasan ✅:

**La aplicación está completamente optimizada!**

- ✅ Carga rápida
- ✅ Cache eficiente
- ✅ Funciona offline
- ✅ No vuelve a home
- ✅ Bajo consumo de datos

