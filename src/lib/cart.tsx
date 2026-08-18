import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartItem } from "./types";

const CART_KEY = "msm.cart.v1";
const WISHLIST_KEY = "msm.wishlist.v1";

type CartContextValue = {
  items: CartItem[];
  wishlist: string[];
  ready: boolean;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readJson<CartItem[]>(CART_KEY, []));
    setWishlist(readJson<string[]>(WISHLIST_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, ready]);

  const addItem = useCallback((item: Omit<CartItem, "key">) => {
    const key = `${item.productId}::${item.size}::${item.color}`;
    setItems((current) => {
      const existing = current.find((i) => i.key === key);
      if (existing) {
        return current.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(20, i.quantity + item.quantity) } : i,
        );
      }
      return [...current, { ...item, key }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((i) => i.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current.map((i) =>
        i.key === key ? { ...i, quantity: Math.max(1, Math.min(20, quantity)) } : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      wishlist,
      ready,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted: (productId: string) => wishlist.includes(productId),
    }),
    [items, wishlist, ready, addItem, removeItem, setQuantity, clearCart, toggleWishlist],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
