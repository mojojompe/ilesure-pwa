import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { Listing } from '../types';

// Custom storage object for idb-keyval
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface ListingState {
  listings: Listing[];
  setListings: (listings: Listing[]) => void;
  getListingById: (id: string) => Listing | undefined;
}

export const useListingStore = create<ListingState>()(
  persist(
    (set, get) => ({
      listings: [],
      setListings: (listings) => set({ listings }),
      getListingById: (id) => get().listings.find((listing) => listing.id === id),
    }),
    {
      name: 'ilesure-listings-storage', // unique name
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
