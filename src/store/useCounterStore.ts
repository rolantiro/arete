import { create } from "zustand";

type CounterState = {
  cartCount: number;
  wishlistCount: number;
  setCartCount: (count: number) => void;
  setWishlistCount: (count: number) => void;
  incrementCart: (by?: number) => void;
  toggleWishlist: (delta: 1 | -1) => void;
};

export const useCounterStore = create<CounterState>((set) => ({
  cartCount: 0,
  wishlistCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
  setWishlistCount: (count) => set({ wishlistCount: count }),
  incrementCart: (by = 1) =>
    set((state) => ({ cartCount: Math.max(0, state.cartCount + by) })),
  toggleWishlist: (delta) =>
    set((state) => ({
      wishlistCount: Math.max(0, state.wishlistCount + delta),
    })),
}));
