"use client";

import { usePathname } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SITE } from "@/config/site";
import type { IndexEntry } from "@/data/catalog";
import type { ContactSettings } from "@/data/types";

/**
 * The shop's client state: the bag, the wishlist, recently viewed pieces,
 * toasts, and which overlay is open. Bag, wishlist and history persist in
 * localStorage and stay in sync across tabs.
 */

export type BagLine = { slug: string; size: string; qty: number };

type Persisted = { bag: BagLine[]; wishlist: string[]; viewed: string[] };

const KEY = "sartorial:shop:v1";
const EMPTY: Persisted = { bag: [], wishlist: [], viewed: [] };

let state: Persisted = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function read(): Persisted {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      bag: Array.isArray(parsed.bag)
        ? parsed.bag.filter((l) => l && typeof l.slug === "string" && typeof l.size === "string" && Number.isFinite(l.qty) && l.qty > 0)
        : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist.filter((s) => typeof s === "string") : [],
      viewed: Array.isArray(parsed.viewed) ? parsed.viewed.filter((s) => typeof s === "string") : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(next: Persisted) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: the session still works, it just won't persist.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

export type Toast = { id: string; title: string; body?: string; slug?: string; href?: string; actionLabel?: string };

export type Overlay = "bag" | "search" | "menu" | null;

type ShopContext = {
  ready: boolean;
  bag: Array<BagLine & { product: IndexEntry }>;
  count: number;
  subtotal: number | null;
  add: (slug: string, size: string, qty?: number) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
  wishlist: IndexEntry[];
  isSaved: (slug: string) => boolean;
  toggleSaved: (slug: string) => void;
  viewed: IndexEntry[];
  markViewed: (slug: string) => void;
  lookup: (slug: string) => IndexEntry | undefined;
  index: IndexEntry[];
  /** The house contact details, as set in the admin (WhatsApp number for orders). */
  contact: ContactSettings;
  overlay: Overlay;
  open: (overlay: Exclude<Overlay, null>) => void;
  close: () => void;
  toasts: Toast[];
  notify: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const Ctx = createContext<ShopContext | null>(null);

export function ShopProvider({ index, contact, children }: { index: IndexEntry[]; contact: ContactSettings; children: ReactNode }) {
  const persisted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ready, setReady] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Arriving on a new page closes whatever was open and clears its toasts
  // (covers links, the back button and programmatic navigation alike); see RouteWatcher.
  const onNavigate = useCallback(() => {
    setOverlay(null);
    setToasts([]);
  }, []);

  const bySlug = useMemo(() => new Map(index.map((p) => [p.slug, p])), [index]);

  useEffect(() => {
    if (!hydrated) {
      hydrated = true;
      state = read();
      emit();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after mount
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        state = read();
        emit();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((t) => [{ ...toast, id }, ...t].slice(0, 3));
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss],
  );

  const add = useCallback(
    (slug: string, size: string, qty = 1) => {
      const max = SITE.commerce.maxQuantity;
      const existing = state.bag.find((l) => l.slug === slug && l.size === size);
      const bag = existing
        ? state.bag.map((l) => (l === existing ? { ...l, qty: Math.min(max, l.qty + qty) } : l))
        : [...state.bag, { slug, size, qty: Math.min(max, qty) }];
      write({ ...state, bag });
      const product = bySlug.get(slug);
      notify({ title: "Added to your bag", body: product ? `${product.name} · ${size}` : undefined, slug, href: "/bag", actionLabel: "View bag" });
    },
    [bySlug, notify],
  );

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    const clamped = Math.max(1, Math.min(SITE.commerce.maxQuantity, Math.round(qty)));
    write({ ...state, bag: state.bag.map((l) => (l.slug === slug && l.size === size ? { ...l, qty: clamped } : l)) });
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    write({ ...state, bag: state.bag.filter((l) => !(l.slug === slug && l.size === size)) });
  }, []);

  const clear = useCallback(() => write({ ...state, bag: [] }), []);

  const toggleSaved = useCallback(
    (slug: string) => {
      const saved = state.wishlist.includes(slug);
      write({ ...state, wishlist: saved ? state.wishlist.filter((s) => s !== slug) : [slug, ...state.wishlist] });
      if (!saved) {
        const product = bySlug.get(slug);
        notify({ title: "Saved to your wishlist", body: product?.name, slug, href: "/wishlist", actionLabel: "View" });
      }
    },
    [bySlug, notify],
  );

  const markViewed = useCallback((slug: string) => {
    if (state.viewed[0] === slug) return;
    write({ ...state, viewed: [slug, ...state.viewed.filter((s) => s !== slug)].slice(0, 12) });
  }, []);

  const value = useMemo<ShopContext>(() => {
    const bag = persisted.bag.flatMap((l) => {
      const product = bySlug.get(l.slug);
      return product ? [{ ...l, product }] : [];
    });
    const allPriced = bag.length > 0 && bag.every((l) => typeof l.product.price === "number");
    return {
      ready,
      bag,
      count: bag.reduce((n, l) => n + l.qty, 0),
      subtotal: allPriced ? bag.reduce((n, l) => n + (l.product.price ?? 0) * l.qty, 0) : null,
      add,
      setQty,
      remove,
      clear,
      wishlist: persisted.wishlist.flatMap((s) => bySlug.get(s) ?? []),
      isSaved: (slug) => persisted.wishlist.includes(slug),
      toggleSaved,
      viewed: persisted.viewed.flatMap((s) => bySlug.get(s) ?? []),
      markViewed,
      lookup: (slug) => bySlug.get(slug),
      index,
      contact,
      overlay,
      open: (o) => {
        setOverlay(o);
        // The bag itself is the confirmation: don't leave a toast sitting over its buttons.
        if (o === "bag") setToasts([]);
      },
      close: () => setOverlay(null),
      toasts,
      notify,
      dismiss,
    };
  }, [persisted, bySlug, ready, add, setQty, remove, clear, toggleSaved, markViewed, index, contact, overlay, toasts, notify, dismiss]);

  return (
    <Ctx.Provider value={value}>
      {/* Reading the address needs its own boundary, so pages known only at request time can prerender. */}
      <Suspense fallback={null}>
        <RouteWatcher onChange={onNavigate} />
      </Suspense>
      {children}
    </Ctx.Provider>
  );
}

function RouteWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange();
  }, [pathname, onChange]);
  return null;
}

export function useShop(): ShopContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
