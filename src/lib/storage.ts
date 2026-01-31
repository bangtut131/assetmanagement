import { openDB } from 'idb';
import { StateStorage } from 'zustand/middleware';

const dbPromise = typeof window !== 'undefined'
    ? openDB('proasset-db', 1, {
        upgrade(db) {
            db.createObjectStore('keyval');
        },
    })
    : null;

export const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        if (!dbPromise) return null;
        return (await dbPromise).get('keyval', name) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        if (!dbPromise) return;
        (await dbPromise).put('keyval', value, name);
    },
    removeItem: async (name: string): Promise<void> => {
        if (!dbPromise) return;
        (await dbPromise).delete('keyval', name);
    },
};
