import { useEffect, useState } from 'react';

/**
 * Hook para ejecutar una acción solo cuando un elemento es visible en pantalla
 * Útil para evitar cargas innecesarias de datos
 */
export function useVisibility<T extends HTMLElement>(
  callback?: () => void
) {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<T | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          callback?.();
          // Puedes descomentar para desuscribirse después de ser visible una vez
          // observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px', // Comienza a cargar 50px antes de ser visible
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, callback]);

  return { setElement, isVisible };
}

/**
 * Hook para detectar si una pestaña está activa sin causa re-renders innecesarios
 */
export function useTabVisibility(isActive: boolean) {
  const [wasActive, setWasActive] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setWasActive(true);
    }
  }, [isActive]);

  // Devuelve `wasActive` para mantener el query activo una vez iniciado
  // pero el componente solo se renderiza cuando `isActive` es true
  return wasActive && isActive;
}
