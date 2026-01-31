"use client";

import { useStore } from "@/store/useStore";
import { formatCurrency, calculateDepreciation } from "@/lib/utils";
import { Edit, Trash2, MapPin, Image as ImageIcon, Clock, MoreVertical, Archive } from "lucide-react";
import { Asset } from "@/types";

interface AssetTableProps {
    assets: Asset[];
    onEdit: (asset: Asset) => void;
    onRequestDelete: (id: string, name: string) => void;
}

export function AssetTable({ assets, onEdit, onRequestDelete }: AssetTableProps) {
    const { locations, hasPermission } = useStore();

    const getLocationName = (locationId: string) => {
        const loc = locations.find(l => l.id === locationId);
        return loc ? loc.name : 'Unknown';
    };

    const canEdit = hasPermission('assets', 'edit');
    const canViewPrice = hasPermission('assets', 'view', 'price');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map(asset => {
                const calc = calculateDepreciation(asset.price, asset.purchaseDate, asset.usefulLife);
                const locName = getLocationName(asset.locationId);
                const isPending = asset.deletionStatus === 'pending';

                return (
                    <div key={asset.id} className={`group bg-white rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 relative overflow-hidden flex flex-col ${isPending ? 'border-rose-100 ring-4 ring-rose-50' : 'border-slate-100'}`}>

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide backdrop-blur-md border border-white/20 ${asset.status === 'Baik' ? 'bg-emerald-500/90 text-white' :
                                asset.status === 'Perbaikan' ? 'bg-amber-500/90 text-white' :
                                    'bg-rose-500/90 text-white'
                                }`}>
                                {asset.status}
                            </span>
                        </div>

                        {isPending && (
                            <div className="absolute top-3 right-3 z-10 bg-rose-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
                                <Clock size={10} /> Pending
                            </div>
                        )}

                        {/* Image Section */}
                        <div className="h-48 relative bg-slate-100 overflow-hidden">
                            {asset.image ? (
                                <img src={asset.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={asset.name} />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                    <ImageIcon size={32} className="mb-2 opacity-50" />
                                    <span className="text-[10px] font-medium uppercase tracking-widest opacity-40">No Image</span>
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Action Buttons (Reveal on Hover) */}
                            <div className="absolute bottom-3 right-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                {canEdit && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(asset); }} className="bg-white text-slate-700 hover:text-indigo-600 p-2 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRequestDelete(asset.id, asset.name); }}
                                            className="bg-white text-slate-700 hover:text-rose-600 p-2 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                                            title="Delete / Request Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="mb-3">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1 block">{asset.category}</span>
                                <h4 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{asset.name}</h4>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <div className="p-1.5 bg-slate-100 rounded-full">
                                        <MapPin size={12} className="text-slate-400" />
                                    </div>
                                    <span className="font-medium truncate">{locName}</span>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                                    <div>
                                        {canViewPrice ? (
                                            <>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Current Value</p>
                                                <p className="font-bold text-slate-700 text-sm" suppressHydrationWarning>{formatCurrency(calc.currentValue)}</p>
                                            </>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 italic">Price Hidden</p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Barcode</p>
                                        <p className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{asset.barcode || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
