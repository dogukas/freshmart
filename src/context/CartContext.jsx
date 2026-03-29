import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchProducts } from '../api/services';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('freshmart_cart');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('freshmart_wishlist');
    try {
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [toasts, setToasts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Persistence to LocalStorage
  useEffect(() => {
    localStorage.setItem('freshmart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('freshmart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Load products from Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoadingProducts(true);
      const data = await fetchProducts();
      setProducts(data);
      setIsLoadingProducts(false);
    }
    loadData();
  }, []);

  // --- Toasts ---
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  // --- Cart ---
  const addToCart = useCallback((productId, productName) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    if (productName) {
      showToast(`${productName} sepete eklendi! 🛒`, 'success');
    }
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => {
      const qty = (prev[productId] || 0) - 1;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: qty };
    });
  }, []);

  const clearFromCart = useCallback((productId) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const getQty = useCallback((productId) => cart[productId] || 0, [cart]);

  const cartTotal = Object.values(cart).reduce((a, b) => a + b, 0);

  // --- Wishlist ---
  const toggleWishlist = useCallback((productId, productName) => {
    setWishlist(prev => {
      const next = { ...prev };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = true;
      }
      return next;
    });

    setWishlist(prev => {
      if (prev[productId]) {
        showToast(`${productName || 'Item'} removed from wishlist`, 'info');
      } else {
        showToast(`${productName || 'Item'} added to wishlist! ♡`, 'love');
      }
      return prev;
    });
  }, [showToast]);

  const isWishlisted = useCallback((productId) => !!wishlist[productId], [wishlist]);
  const wishlistTotal = Object.keys(wishlist).length;

  const emptyCart = useCallback(() => {
    setCart({});
  }, []);

  return (
    <CartContext.Provider value={{
      products, isLoadingProducts,
      cart, addToCart, removeFromCart, clearFromCart, emptyCart, getQty, cartTotal,
      wishlist, toggleWishlist, isWishlisted, wishlistTotal,
      toasts, showToast, cartOpen, setCartOpen, isCheckoutOpen, setCheckoutOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
