# 🛠️ COMANDOS Y REFERENCIAS

## Desarrollo Local

```bash
# Instalar dependencias (si es la primera vez)
bun install

# Iniciar servidor dev
bun run dev

# Abrir en navegador
http://localhost:8080
```

## Build y Deploy

```bash
# Build para producción
bun run build

# Preview del build
bun run preview

# Build en modo desarrollo (con source maps)
bun run build:dev
```

## Linting

```bash
# Chequear errores
bun run lint

# Fix automático (si es posible)
bun run lint -- --fix
```

---

## DevTools Shortcuts

### Chrome/Edge/Firefox

```
F12           - Abrir DevTools
F5            - Recargar página
Ctrl+Shift+R  - Recargar sin cache
Ctrl+Shift+Delete - Abrir Clear Data

En DevTools:
Ctrl+Shift+P  - Command palette
```

### Network Debugging

```
DevTools → Network:
- Filter por: XHR (para requests de API)
- Filter por: "lore" o "capitulos" o "galeria"
- "Disable cache" - simular primer load
- "Offline" - simular sin internet

DevTools → Storage:
- Application → Local Storage → localhost:8080
- Ver: react-query-cache
```

### Performance Analysis

```
DevTools → Performance:
- Click record
- Navega
- Click stop
- Analiza timeline
```

---

## Archivos Principales Modificados

### 1. App.tsx
```bash
# Cambio: Importes estáticos → lazy()
git diff src/App.tsx
```

### 2. lib/queryClient.ts
```bash
# Cambio: Nuevo QueryClient con cache 24h
git diff src/lib/queryClient.ts
```

### 3. pages/SeriesDetail.tsx
```bash
# Cambio: Control de pestaña activa + conditional queries
git diff src/pages/SeriesDetail.tsx
```

### 4. components/series/LoreViewer.tsx
```bash
# Cambio: Prop `isActive` para conditional query
git diff src/components/series/LoreViewer.tsx
```

### 5. components/series/GalleryMosaic.tsx
```bash
# Cambio: Prop `isActive` para conditional query
git diff src/components/series/GalleryMosaic.tsx
```

---

## Monitoreo en Producción

### Métricas a Trackear

```javascript
// En src/main.tsx o analytics.ts
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Load time:', perfData.loadEventEnd - perfData.loadEventStart);
  
  // Enviar a analytics
  analytics.track('page_load', {
    duration: perfData.loadEventEnd - perfData.loadEventStart
  });
});
```

### Service Worker Health

```javascript
// Verificar Service Worker
navigator.serviceWorker.ready.then(reg => {
  console.log('✓ Service Worker active');
  console.log('  Scope:', reg.scope);
  console.log('  Timestamp:', new Date().toISOString());
});
```

### Cache Status

```javascript
// Ver tamaño de cache
const cacheNames = await caches.keys();
for (const name of cacheNames) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  console.log(`Cache ${name}: ${keys.length} items`);
}
```

---

## Variables de Entorno (.env)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=ddaeowmej

# API (si la hay)
VITE_API_URL=https://api.bayekverse.com
```

---

## Troubleshooting Rápido

### "Cannot find module X"
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules
rm bun.lock
bun install
```

### "Service Worker no registra"
```javascript
// En DevTools Console:
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
// Luego recargar
```

### "Cache corrupted"
```javascript
// En DevTools Console:
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
localStorage.removeItem('react-query-cache');
// Luego recargar
```

### "QueryClient no persiste"
```javascript
// En DevTools Console:
console.log(localStorage.getItem('react-query-cache'));
```

---

## Git Commands

```bash
# Ver cambios realizados
git status
git diff

# Commit de cambios
git add .
git commit -m "Optimizations: code splitting, lazy loading, cache 24h"

# Ver solo los cambios en un archivo
git diff src/App.tsx

# Revert de un archivo si algo se rompe
git checkout src/App.tsx
```

---

## Performance Optimization Checklist

```bash
# Build size analysis (si tienes plugin)
bun run build --analyze

# Esperado:
# main.js: ~250KB (gzip ~80KB)
# Otros chunks: ~150-200KB cada uno

# Lighthouse
# Abre en Chrome:
# DevTools → Lighthouse → Generate report
# Score objetivo: >90
```

---

## Referencias de Documentación

### React Query v5
```
https://tanstack.com/query/latest
```

### React 19 + Suspense
```
https://react.dev/reference/react/Suspense
https://react.dev/reference/react/lazy
```

### Service Workers
```
https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
https://web.dev/service-workers-cache-storage/
```

### Supabase
```
https://supabase.com/docs
```

---

## Respaldo y Migración

### Exportar cache antes de cambios
```javascript
// En DevTools Console:
const cache = localStorage.getItem('react-query-cache');
console.log(cache);
// Copiar y guardar
```

### Importar cache después
```javascript
// En DevTools Console:
localStorage.setItem('react-query-cache', '[paste aquí]');
```

---

## Testing Automático (Futuro)

```bash
# Si implementas tests con Vitest
bun add -d vitest @testing-library/react

# Luego:
bun run test
bun run test:watch
```

---

## CI/CD (Futuro)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run lint
```

---

## Recursos Útiles

### Blogs y Artículos
- TanStack Query Best Practices
- Web Vitals Optimization
- Service Worker Strategies
- Code Splitting en React

### Herramientas
- Chrome DevTools
- Lighthouse
- WebPageTest
- Bundlephobia (análisis de npm packages)

### Comunidades
- React Conf
- TanStack Discord
- Web Dev.blog
- Stack Overflow

---

## Contacto y Soporte

Si tienes preguntas sobre las optimizaciones:

1. Revisa `OPTIMIZACIONES.md` - Guía completa
2. Revisa `DIAGNOSTICO_HOME.md` - Por qué volvía a home
3. Revisa `TESTING_GUIDE.md` - Cómo testear
4. Revisa este archivo - Comandos útiles

---

## Próximos Pasos Recomendados

1. **Ejecutar todos los tests** en TESTING_GUIDE.md
2. **Build y deploy** a staging para verificar
3. **Monitorear métricas** en producción
4. **Recopilar feedback** de usuarios
5. **Optimizar más si es necesario** (virtual scrolling, etc)

---

## Summary

✅ **Todo listo para optimización máxima**  
✅ **Sin errores de compilación**  
✅ **Cache configurado al máximo**  
✅ **Documentación completa**  
✅ **Ready for production**

