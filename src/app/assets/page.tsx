"use client";

import { useState, useEffect, Suspense } from "react";
import { AssetTable } from "@/components/assets/AssetTable";
import { useStore } from "@/store/useStore";
import { Plus, Search, Filter, Shield } from "lucide-react";
import { AssetForm } from "@/components/assets/AssetForm";
import { Asset } from "@/types";
import { useSearchParams } from "next/navigation";

function AssetsContent() {
    const { assets, requestDeleteAsset, hasPermission } = useStore();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const canEdit = hasPermission('assets', 'edit');
    const canView = hasPermission('assets', 'view');

    const [search, setSearch] = useState(initialQuery);

    useEffect(() => {
        const query = searchParams.get('q');
        if (query !== null) {
            setSearch(query);
        }
    }, [searchParams]);

    const [filterStatus, setFilterStatus] = useState('All');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const filteredAssets = assets.filter((a: Asset) => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            (a.barcode ? a.barcode.toLowerCase().includes(search.toLowerCase()) : false) ||
            a.category.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || a.status === filterStatus;
        return matchSearch && matchStatus;
    });

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <Shield size={48} className="mb-4 opacity-20" />
                <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
                <p>You do not have permission to view assets.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Cari aset (nama, barcode, kategori)..."
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {canEdit && (
                    <button
                        onClick={() => { setEditingAsset(null); setIsFormOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-200 flex items-center gap-2 transition-all w-full md:w-auto justify-center"
                    >
                        <Plus size={18} /> Tambah Aset
                    </button>
                )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['All', 'Baik', 'Perbaikan', 'Rusak', 'Hilang'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${filterStatus === status
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {status === 'All' ? 'Semua Status' : status}
                    </button>
                ))}
            </div>

            <AssetTable
                assets={filteredAssets}
                onEdit={(a) => { setEditingAsset(a); setIsFormOpen(true); }}
                onRequestDelete={(id) => requestDeleteAsset(id)}
            />

            {filteredAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <Filter size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Tidak ada aset yang ditemukan.</p>
                    <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
                </div>
            )}

            {isFormOpen && (
                <AssetForm
                    asset={editingAsset}
                    onClose={() => { setIsFormOpen(false); setEditingAsset(null); }}
                />
            )}
        </div>
    );
}

export default function AssetsPage() {
    return (
        <Suspense fallback={
            <div className="py-20 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <AssetsContent />
        </Suspense>
    );
}
