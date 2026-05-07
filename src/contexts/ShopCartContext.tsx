"use client";

/**
 * Cart state for the /shop/* miniature collection.
 *
 * - Items are keyed by `productSlug + applianceType` so two Individual
 *   Models with different appliance types stay as separate lines, but
 *   adding the same line twice merges quantities. Complete Collection
 *   has no applianceType so any add is merged into one line.
 * - Persisted to localStorage under STORAGE_KEY so the cart survives a
 *   page refresh or returning the next day. SSR-safe: state seeds from
 *   `[]` on the server, then hydrates from localStorage on first mount.
 * - subtotal / totalQuantity are derived (not stored) — keeps the source
 *   of truth in `items` and avoids drift.
 *
 * Provider lives in src/app/(original)/shop/layout.tsx so the cart is
 * available across product pages, the cart page, checkout, and the
 * thank-you page. The header (Nav.tsx) reads it via useShopCart() too.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ApplianceType =
  | "Clear Retainer"
  | "Wrap-around Retainer"
  | "Nance Holding Arch"
  | "Lingual Arch"
  | "Expansion Plate";

export type ProductSlug = "complete-collection" | "individual-model";

export type CartItem = {
  /** Stable per-line id derived from productSlug+applianceType. */
  id: string;
  productSlug: ProductSlug;
  name: string;
  price: number;
  quantity: number;
  /** Only present for Individual Model lines. */
  applianceType?: ApplianceType;
};

type AddInput = Omit<CartItem, "id" | "quantity"> & { quantity?: number };

type ShopCartContextType = {
  items: CartItem[];
  addItem: (item: AddInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  /** True once we've read localStorage on the client. Components that
   *  flash an empty cart on first paint can guard their UI on this. */
  hydrated: boolean;
};

const STORAGE_KEY = "aso-shop-cart-v1";
const MAX_QTY = 10;

function makeId(slug: ProductSlug, applianceType?: ApplianceType): string {
  return applianceType ? `${slug}::${applianceType}` : slug;
}

function clampQty(n: number): number {
  if (!Number.isFinite(n)) return 1;
  if (n < 1) return 1;
  if (n > MAX_QTY) return MAX_QTY;
  return Math.floor(n);
}

const ShopCartContext = createContext<ShopCartContextType | null>(null);

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first client render.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* corrupt JSON / blocked storage — start with empty cart */
    }
    setHydrated(true);
  }, []);

  // Persist on change, but only after hydration so we don't overwrite
  // saved cart with the initial empty state on first render.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota / blocked storage — silently degrade */
    }
  }, [items, hydrated]);

  const addItem = useCallback((input: AddInput) => {
    const id = makeId(input.productSlug, input.applianceType);
    const addQty = clampQty(input.quantity ?? 1);
    setItems((prev) => {
      const existing = prev.find((it) => it.id === id);
      if (existing) {
        return prev.map((it) =>
          it.id === id
            ? { ...it, quantity: clampQty(it.quantity + addQty) }
            : it
        );
      }
      const next: CartItem = {
        id,
        productSlug: input.productSlug,
        name: input.name,
        price: input.price,
        quantity: addQty,
        applianceType: input.applianceType,
      };
      return [...prev, next];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const q = clampQty(quantity);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: q } : it))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.quantity, 0),
    [items]
  );

  const value = useMemo<ShopCartContextType>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalQuantity,
      subtotal,
      hydrated,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalQuantity,
      subtotal,
      hydrated,
    ]
  );

  return (
    <ShopCartContext.Provider value={value}>
      {children}
    </ShopCartContext.Provider>
  );
}

export function useShopCart(): ShopCartContextType {
  const ctx = useContext(ShopCartContext);
  if (!ctx) {
    throw new Error("useShopCart must be used inside <ShopCartProvider>");
  }
  return ctx;
}

/**
 * Header-safe variant: returns null when used outside the provider
 * (e.g. on non-shop pages where Nav.tsx still renders the cart icon).
 * Lets the icon hide itself instead of crashing the whole header.
 */
export function useShopCartOptional(): ShopCartContextType | null {
  return useContext(ShopCartContext);
}
