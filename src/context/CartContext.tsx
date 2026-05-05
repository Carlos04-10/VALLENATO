import React, { createContext, useContext, useState, useMemo } from 'react';

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantId: string;
  restaurantName: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  restaurantId: string | null;
  restaurantName: string | null;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const restaurantId = useMemo(() => items[0]?.restaurantId || null, [items]);
  const restaurantName = useMemo(() => items[0]?.restaurantName || null, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      // Check if adding from a different restaurant
      if (prevItems.length > 0 && prevItems[0].restaurantId !== newItem.restaurantId) {
        if (window.confirm("Añadir platos de un restaurante diferente vaciará tu carrito actual. ¿Deseas continuar?")) {
          return [{ ...newItem, quantity: 1 }];
        }
        return prevItems;
      }

      const existingItem = prevItems.find(item => item.id === newItem.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (id: number | string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  
  const subtotal = useMemo(() => items.reduce((sum, item) => {
    const priceNum = typeof item.price === 'string' 
      ? parseFloat((item.price as string).replace('$', '')) 
      : item.price;
    return sum + (priceNum * item.quantity);
  }, 0), [items]);

  const deliveryFee = subtotal > 0 ? 2.50 : 0;
  const serviceFee = subtotal > 0 ? 1.20 : 0;
  const total = subtotal + deliveryFee + serviceFee;

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    restaurantId,
    restaurantName,
    totalItems,
    subtotal,
    deliveryFee,
    serviceFee,
    total
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
