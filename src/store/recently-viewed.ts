import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecentlyViewedItem = {
    productId: string;
    productName: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
};

type RecentlyViewedStore = {
    items: RecentlyViewedItem[];
    addItem: (item: RecentlyViewedItem) => void;
    removeItem: (productId: string) => void;
    clearAll: () => void;
};

const MAX_ITEMS = 10;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
    persist(
        (set) => ({
            items: [],
            addItem: (item) =>
                set((state) => {
                    const filtered = state.items.filter((i) => i.productId !== item.productId);
                    return { items: [item, ...filtered].slice(0, MAX_ITEMS) };
                }),
            removeItem: (productId) =>
                set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
            clearAll: () => set({ items: [] }),
        }),
        { name: 'recently-viewed' }
    )
);
