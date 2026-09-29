"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartSelection = {
  groupId: string;
  group: string;
  optionId: string;
  option: string;
  priceDelta: number;
};

export type CartLine = {
  key: string;
  menuItemId: string;
  name: string;
  // Base price plus option deltas. Display only: the server recomputes every price.
  unitPrice: number;
  quantity: number;
  selections: CartSelection[];
  // Set on extras picked on another dish's sheet, so they show under that dish.
  extraFor?: { key: string; name: string };
};

type AddInput = {
  menuItemId: string;
  name: string;
  basePrice: number;
  selections: CartSelection[];
  quantity: number;
  extras: { menuItemId: string; name: string; price: number }[];
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  itemCount: number;
  subtotal: number;
  add: (input: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "kellys-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(menuItemId: string, selections: CartSelection[]): string {
  const ids = selections.map((s) => s.optionId).sort();
  return [menuItemId, ...ids].join("|");
}

function mergeLine(lines: CartLine[], line: CartLine): CartLine[] {
  const existing = lines.find((l) => l.key === line.key);
  if (!existing) return [...lines, line];
  return lines.map((l) =>
    l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l,
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Load the saved cart after mount; storage can be unavailable (private mode).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setLines(parsed);
      }
    } catch {
      // Ignore unreadable storage and start with an empty cart.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // The cart still works for this visit without storage.
    }
  }, [lines, ready]);

  const add = useCallback((input: AddInput) => {
    const unitPrice =
      input.basePrice + input.selections.reduce((s, o) => s + o.priceDelta, 0);
    const key = lineKey(input.menuItemId, input.selections);

    setLines((current) => {
      let next = mergeLine(current, {
        key,
        menuItemId: input.menuItemId,
        name: input.name,
        unitPrice,
        quantity: input.quantity,
        selections: input.selections,
      });
      // Extras go one per plate, as their own lines under the dish.
      for (const extra of input.extras) {
        next = mergeLine(next, {
          key: `${extra.menuItemId}@${key}`,
          menuItemId: extra.menuItemId,
          name: extra.name,
          unitPrice: extra.price,
          quantity: input.quantity,
          selections: [],
          extraFor: { key, name: input.name },
        });
      }
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => {
    // Removing a dish also removes the extras picked for it.
    setLines((current) =>
      current.filter((l) => l.key !== key && l.extraFor?.key !== key),
    );
  }, []);

  const setQuantity = useCallback(
    (key: string, quantity: number) => {
      if (quantity < 1) return remove(key);
      setLines((current) =>
        current.map((l) => (l.key === key ? { ...l, quantity } : l)),
      );
    },
    [remove],
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
