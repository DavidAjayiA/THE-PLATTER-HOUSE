import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("tph_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("tph_last_order");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("tph_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === product.name);
      if (existing) {
        return prev.map((item) =>
          item.name === product.name ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          name: product.name,
          category: product.category || "General",
          price: product.price,
          qty: 1,
          image: product.image,
        },
      ];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        )
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem("tph_cart");
    } catch (e) {
      console.error(e);
    }
  };

  const saveOrder = (orderData) => {
    setLastOrder(orderData);
    try {
      localStorage.setItem("tph_last_order", JSON.stringify(orderData));
      const existing = JSON.parse(localStorage.getItem("tph_orders") || "[]");
      const index = existing.findIndex((o) => o.orderNumber === orderData.orderNumber);
      if (index >= 0) {
        existing[index] = orderData;
      } else {
        existing.unshift(orderData);
      }
      localStorage.setItem("tph_orders", JSON.stringify(existing));
    } catch (e) {
      console.error("Failed to save order to localStorage", e);
    }
    // Note: Do not clear cart here; cart is cleared only once payment is verified/confirmed.
  };

  const updateOrderStatus = (orderNumber, updates) => {
    try {
      const existing = JSON.parse(localStorage.getItem("tph_orders") || "[]");
      const index = existing.findIndex((o) => o.orderNumber === orderNumber);
      if (index >= 0) {
        existing[index] = { ...existing[index], ...updates };
        localStorage.setItem("tph_orders", JSON.stringify(existing));
      }
      const localLast = JSON.parse(localStorage.getItem("tph_last_order") || "null");
      if (localLast && localLast.orderNumber === orderNumber) {
        const updatedLast = { ...localLast, ...updates };
        localStorage.setItem("tph_last_order", JSON.stringify(updatedLast));
        setLastOrder(updatedLast);
      }
    } catch (e) {
      console.error("Failed to update order status", e);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        lastOrder,
        saveOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      cart: [],
      cartCount: 0,
      addToCart: () => {},
      updateQty: () => {},
      removeItem: () => {},
      clearCart: () => {},
      lastOrder: null,
      saveOrder: () => {},
      updateOrderStatus: () => {},
    };
  }
  return context;
}
