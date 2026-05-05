import { useEffect, useRef } from 'react';

/**
 * Precarga datos en background cuando el usuario navega hacia ciertas vistas
 * Mejora significativamente la percepción de velocidad
 */
export function usePrefetch(callback: () => Promise<any>, dependencies: any[] = []) {
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (prefetchedRef.current) return;

    // Usar requestIdleCallback si está disponible, sino setTimeout
    const prefetch = () => {
      prefetchedRef.current = true;
      callback().catch(err => console.warn('Prefetch failed:', err));
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch);
    } else {
      const timer = setTimeout(prefetch, 1000);
      return () => clearTimeout(timer);
    }
  }, dependencies);
}

/**
 * Precarga de imágenes para mejorar el rendimiento visual
 */
export function usePrefetchImages(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
}
