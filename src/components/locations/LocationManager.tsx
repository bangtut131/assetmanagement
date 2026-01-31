"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { getHierarchicalLocations } from "@/lib/utils";
import { Map, PlusCircle, Trash2, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { Location } from "@/types";

export function LocationManager() {
    const { locations, addLocation, deleteLocation, assets } = useStore();
    const [newLocName, setNewLocName] = useState('');
    const [newLocParent, setNewLocParent] = useState('');

    const structuredLocations = useMemo(() => getHierarchicalLocations(locations), [locations]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLocName.trim()) return;

        const newLoc: Location = {
            id: Math.random().toString(36).substr(2, 9),
            name: newLocName,
            parentId: newLocParent || null
        };

        addLocation(newLoc);
        setNewLocName('');
    };

    const handleDelete = (id: string) => {
        const hasChildren = locations.some(l => l.parentId === id);
        const hasAssets = assets.some(a => a.locationId === id);
        if (hasChildren) { alert("Tidak bisa menghapus: Lokasi ini memiliki sub-lokasi."); return; }
        if (hasAssets) { alert("Tidak bisa menghapus: Masih ada aset di lokasi ini."); return; }

        if (confirm('Hapus lokasi ini?')) {
            deleteLocation(id);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Sidebar Form */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 h-fit lg:sticky lg:top-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 text-white">
                        <PlusCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Add New Location</h3>
                        <p className="text-xs text-slate-400">Create a new branch or room.</p>
                    </div>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Location Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Server Room B"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 transition-all font-medium text-sm"
                            value={newLocName}
                            onChange={e => setNewLocName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Parent Location</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all font-medium text-sm text-slate-700"
                                value={newLocParent}
                                onChange={e => setNewLocParent(e.target.value)}
                            >
                                <option value="">-- No Parent (Root Level) --</option>
                                {structuredLocations.map(loc => (
                                    <option key={loc.id} value={loc.id}>
                                        {'\u00A0\u00A0'.repeat(loc.level * 2)} {loc.level > 0 ? '↳ ' : ''}{loc.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={16} />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 font-bold tracking-wide shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-2">
                        Create Location
                    </button>
                </form>
            </div>

            {/* Tree Visualization */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 text-indigo-600">
                            <Map size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800">Location Structure</h2>
                    </div>
                    <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                        {locations.length} Active Nodes
                    </span>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="space-y-2">
                        {structuredLocations.map((loc, index) => (
                            <div
                                key={loc.id}
                                className="group flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 transition-all cursor-default"
                                style={{ marginLeft: `${loc.level * 32}px` }}
                            >
                                <div className="flex items-center gap-3">
                                    {loc.level > 0 && (
                                        <div className="w-6 h-px bg-slate-200 -ml-4"></div>
                                    )}
                                    <FolderOpen size={20} className={`text-indigo-400 ${loc.level === 0 ? 'fill-indigo-100' : ''}`} />
                                    <span className={`font-semibold ${loc.level === 0 ? 'text-slate-800 text-base' : 'text-slate-600 text-sm'}`}>
                                        {loc.name}
                                    </span>
                                    {/* Dot connectors visualization could be added here */}
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(loc.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete Location"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {structuredLocations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Folder size={48} className="mb-4 opacity-20" />
                                <p>No locations found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
