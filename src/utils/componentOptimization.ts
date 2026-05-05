import { memo, ReactNode } from 'react';

/**
 * HOC para memoizar componentes y evitar re-renders innecesarios
 * Útil para componentes puros que reciben props complejas
 */
export const withMemo = <P extends object>(Component: React.ComponentType<P>) => {
  return memo(Component);
};

/**
 * Hook para optimizar props complejas usando shallowEqual
 */
export function useShallowEqual<T>(obj: T): T {
  const prevRef = { current: obj };

  if (!shallowEqual(prevRef.current, obj)) {
    prevRef.current = obj;
  }

  return prevRef.current;
}

function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
}

/**
 * Componente wrapper para Suspense lazy loading
 */
interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SuspenseWrapper = ({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  ) 
}: SuspenseWrapperProps) => {
  return fallback;
};
