"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { X, Camera, Scan, Save, Info, DollarSign, Calendar, Tag } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Asset } from "@/types";
import { calculateDepreciation, formatCurrency, getHierarchicalLocations } from "@/lib/utils";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";

interface AssetFormProps {
    asset?: Asset | null;
    onClose: () => void;
}

export function AssetForm({ asset, onClose }: AssetFormProps) {
    const { locations, addAsset, updateAsset } = useStore();
    const defaultLocationId = asset?.locationId || (locations.length > 0 ? locations[0].id : '');

    const [formData, setFormData] = useState<Partial<Asset>>(asset ? { ...asset } : {
        name: '', category: 'Elektronik', locationId: defaultLocationId, price: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        usefulLife: 5, status: 'Baik', barcode: '', image: null, deletionStatus: null
    });

    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const structuredLocations = useMemo(() => getHierarchicalLocations(locations), [locations]);

    const depreciationPreview = calculateDepreciation(
        Number(formData.price || 0),
        formData.purchaseDate || '',
        Number(formData.usefulLife || 0)
    );

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({ ...formData, image: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;

        const newAsset = {
            ...formData,
            id: formData.id || Math.random().toString(36).substr(2, 9),
        } as Asset;

        if (asset) {
            updateAsset(newAsset);
        } else {
            addAsset(newAsset);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 border border-white/20">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{asset ? 'Edit Asset' : 'Add New Asset'}</h2>
                        <p className="text-slate-500 text-sm">Fill in the details below to track your inventory.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 p-2.5 rounded-full shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-4 md:p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Left Column: Image & Quick Stats */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Asset Image</label>
                            <div className="relative group aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-indigo-400 transition-all cursor-pointer">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400 p-6">
                                        <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-3">
                                            <Camera className="text-indigo-500" size={28} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">Click to Upload</p>
                                        <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">Change Photo</span>
                                </div>
                            </div>
                        </div>

                        {/* Depreciation Mini Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">Financial Preview</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-slate-400 text-xs mb-1">Estimated Value</p>
                                        <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(depreciationPreview.currentValue)}</p>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-white/10 pt-3">
                                        <div>
                                            <p className="text-slate-400 text-[10px]">Depreciation / Year</p>
                                            <p className="text-sm font-semibold">{formatCurrency(depreciationPreview.depreciationPerYear)}</p>
                                        </div>
                                        <div className="bg-white/10 p-1.5 rounded-lg">
                                            <DollarSign size={16} className="text-emerald-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag size={14} /> Asset Name
                                </label>
                                <input required type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700 bg-slate-50/50 focus:bg-white"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. MacBook Pro M3 Max" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                                <div className="relative">
                                    <select className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 focus:bg-white text-slate-700 font-medium pr-8"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        {['Elektronik', 'Furniture', 'Kendaraan', 'Mesin', 'Umum'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                                <div className="relative">
                                    <select required className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 focus:bg-white text-slate-700 font-medium pr-8"
                                        value={formData.locationId} onChange={e => setFormData({ ...formData, locationId: e.target.value })}>
                                        <option value="" disabled>Select Location</option>
                                        {structuredLocations.map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {'\u00A0\u00A0'.repeat(loc.level * 2)} {loc.level > 0 ? '↳ ' : ''}{loc.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                </div>
                            </div>

                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Scan size={14} /> Barcode / QR
                                </label>
                                <div className="flex gap-2">
                                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-slate-50/50 focus:bg-white"
                                        value={formData.barcode || ''} onChange={e => setFormData({ ...formData, barcode: e.target.value })} placeholder="Scan or type..." />
                                    <button type="button" onClick={() => setIsScannerOpen(true)}
                                        className="bg-slate-800 text-white px-4 rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200 shrink-0">
                                        <Scan size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-slate-400 font-medium">Rp</span>
                                    <input required type="number" className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 bg-slate-50/50 focus:bg-white"
                                        value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={14} /> Purchase Date
                                </label>
                                <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 bg-slate-50/50 focus:bg-white font-medium"
                                    value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Useful Life (Years)</label>
                                <input required type="number" min="1" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 bg-slate-50/50 focus:bg-white"
                                    value={formData.usefulLife} onChange={e => setFormData({ ...formData, usefulLife: Number(e.target.value) })} />
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Status</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {['Baik', 'Perbaikan', 'Rusak', 'Hilang'].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: status as any })}
                                            className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${formData.status === status
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-200'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 pt-6 border-t border-slate-100 flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Info size={16} />
                            <span>All fields marked are required.</span>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm">Cancel</button>
                            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 text-sm transition-transform active:scale-95">
                                <Save size={18} /> Save Asset
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {isScannerOpen && (
                <BarcodeScanner
                    onScanSuccess={(code) => {
                        setFormData(prev => ({ ...prev, barcode: code }));
                        setIsScannerOpen(false);
                    }}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
}
