import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

export function useCache<T>(key: string, ttl: number = DEFAULT_TTL) {
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data;
  }, [key, ttl]);

  const set = useCallback((data: T) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, [key]);

  const clear = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  return { get, set, clear };
}

// Cache global para compartir entre componentes
export const globalCache = new Map<string, CacheEntry<any>>();

export function useGlobalCache<T>(key: string, ttl: number = DEFAULT_TTL) {
  const get = useCallback((): T | null => {
    const entry = globalCache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      globalCache.delete(key);
      return null;
    }

    return entry.data as T;
  }, [key, ttl]);

  const set = useCallback((data: T) => {
    globalCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, [key]);

  const clear = useCallback(() => {
    globalCache.delete(key);
  }, [key]);

  return { get, set, clear };
}
