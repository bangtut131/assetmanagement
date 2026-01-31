"use client";

import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AssetTable } from "@/components/assets/AssetTable";
import { useStore } from "@/store/useStore";
import { Map, List, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AssetForm } from "@/components/assets/AssetForm";
import { Asset } from "@/types";

export default function Dashboard() {
  const { assets, deleteAsset, requestDeleteAsset } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Show only 4 recent assets
  const recentAssets = assets.slice(0, 4);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <StatsGrid />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/locations" className="group">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                  <Map size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Location Management</h3>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">Organize your physical infrastructure. Manage offices, warehouses, and rooms in a hierarchical structure.</p>
              </div>
              <div className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/assets" className="group">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-slate-100"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-700">
                  <List size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Asset Inventory</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm">View full asset list, perform audits, edit details, and manage lifecycle.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-full hover:bg-slate-100 text-slate-400 group-hover:text-slate-700 transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Assets</h3>
            <p className="text-slate-500 text-sm">Latest items added to the inventory.</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 flex items-center gap-2 transition-transform active:scale-95">
            <Plus size={18} /> Add New Asset
          </button>
        </div>

        <AssetTable
          assets={recentAssets}
          onEdit={(a) => { setEditingAsset(a); setIsFormOpen(true); }}
          onRequestDelete={(id) => requestDeleteAsset(id)}
        />

        {recentAssets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="text-slate-300" size={32} />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">No Assets Yet</h4>
            <p className="text-slate-400 text-sm">Start by adding your first asset to the system.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <AssetForm
          asset={editingAsset}
          onClose={() => { setIsFormOpen(false); setEditingAsset(null); }}
        />
      )}
    </div>
  );
}
