import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

export const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export const calculateDepreciation = (price: number, purchaseDate: string, usefulLifeYears: number) => {
    if (!usefulLifeYears || usefulLifeYears <= 0) return { currentValue: price, depreciationPerYear: 0, ageYears: 0 };

    const now = new Date();
    const purchase = new Date(purchaseDate);
    const diffTime = Math.abs(now.getTime() - purchase.getTime());
    const ageYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

    const depreciationPerYear = price / usefulLifeYears;
    const totalDepreciation = depreciationPerYear * ageYears;

    let currentValue = price - totalDepreciation;
    if (currentValue < 0) currentValue = 0;

    return {
        currentValue: Math.round(currentValue),
        depreciationPerYear: Math.round(depreciationPerYear),
        ageYears: Number(ageYears.toFixed(1))
    };
};

export const getHierarchicalLocations = (locations: any[], parentId: string | null = null, level = 0): any[] => {
    const list: any[] = [];
    const children = locations.filter(l => l.parentId === parentId);
    children.forEach(child => {
        list.push({ ...child, level });
        const subChildren = getHierarchicalLocations(locations, child.id, level + 1);
        list.push(...subChildren);
    });
    return list;
};
