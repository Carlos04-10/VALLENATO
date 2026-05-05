/**
 * Performance utilities para optimizar la carga y rendering de la aplicación
 */

export function preloadResource(href: string, type: 'script' | 'style' | 'image' | 'font') {
  const link = document.createElement('link');
  
  switch (type) {
    case 'script':
      link.rel = 'preload';
      link.as = 'script';
      break;
    case 'style':
      link.rel = 'preload';
      link.as = 'style';
      break;
    case 'image':
      link.rel = 'prefetch';
      link.as = 'image';
      break;
    case 'font':
      link.rel = 'preload';
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      break;
  }
  
  link.href = href;
  document.head.appendChild(link);
}

export function prefetchRoute(routeName: string) {
  // Prefetch datos específicos basados en la ruta
  const routePrefetches = {
    'explore': () => {
      preloadResource('/assets/restaurant-placeholder.jpg', 'image');
    },
    'checkout': () => {
      preloadResource('/assets/payment-icon.svg', 'image');
    },
  };

  if (routePrefetches[routeName as keyof typeof routePrefetches]) {
    routePrefetches[routeName as keyof typeof routePrefetches]();
  }
}

/**
 * Debounce para funciones de búsqueda y filtrado
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle para scroll y resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Medir performance de funciones (solo en desarrollo)
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  label: string,
  func: T
): T {
  if (process.env.NODE_ENV !== 'development') return func;

  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  }) as T;
}

/**
 * Virtual scrolling para listas largas - si se implementa
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  bufferSize: number;
}

export function getVisibleRange(
  scrollTop: number,
  config: VirtualScrollConfig
): { start: number; end: number } {
  const { itemHeight, containerHeight, bufferSize } = config;
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const end = start + visibleItems + bufferSize * 2;
  return { start, end };
}
