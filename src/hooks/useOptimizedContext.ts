import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useCart as useCartOriginal } from './CartContext';
import { useAuth as useAuthOriginal } from './AuthContext';

/**
 * Optimized context hooks que memoizan los callbacks y valores
 * para evitar re-renders innecesarios en componentes suscritos
 */

export function useCart() {
  const context = useCartOriginal();
  
  // Memoizar los callbacks para que no cambien en cada render
  const memoizedAddItem = useCallback(context.addItem, []);
  const memoizedRemoveItem = useCallback(context.removeItem, []);
  const memoizedUpdateQuantity = useCallback(context.updateQuantity, []);
  const memoizedClearCart = useCallback(context.clearCart, []);

  return useMemo(() => ({
    ...context,
    addItem: memoizedAddItem,
    removeItem: memoizedRemoveItem,
    updateQuantity: memoizedUpdateQuantity,
    clearCart: memoizedClearCart,
  }), [context, memoizedAddItem, memoizedRemoveItem, memoizedUpdateQuantity, memoizedClearCart]);
}

export function useAuth() {
  return useAuthOriginal();
}
