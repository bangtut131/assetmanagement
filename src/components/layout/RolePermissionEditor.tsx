"use client";

import { useStore } from "@/store/useStore";
import { FeatureKey, FEATURES, Role, FeaturePermission, RESTRICTABLE_FIELDS } from "@/types";
import { useState } from "react";
import { Shield, ChevronDown, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function RolePermissionEditor() {
    const { rolePermissions, updateRolePermission } = useStore();
    const [selectedRole, setSelectedRole] = useState<Role>('STAFF');
    const [expandedFeature, setExpandedFeature] = useState<FeatureKey | null>(null);

    const roles: Role[] = ['SUPER_ADMIN', 'MANAGER', 'STAFF', 'AUDITOR', 'VIEWER'];

    const handlePermissionChange = (feature: FeatureKey, type: 'view' | 'edit', value: boolean) => {
        const currentConfig = rolePermissions[selectedRole][feature];
        const newConfig: FeaturePermission = {
            ...currentConfig,
            [type]: value
        };
        updateRolePermission(selectedRole, feature, newConfig);
    };

    const handleFieldPermissionChange = (feature: FeatureKey, field: string, type: 'view' | 'edit', value: boolean) => {
        const currentConfig = rolePermissions[selectedRole][feature];
        const currentFields = currentConfig.fields || {};

        // Ensure field config exists
        const fieldConfig = currentFields[field] || { view: true, edit: true };

        const newConfig: FeaturePermission = {
            ...currentConfig,
            fields: {
                ...currentFields,
                [field]: {
                    ...fieldConfig,
                    [type]: value
                }
            }
        };
        updateRolePermission(selectedRole, feature, newConfig);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Shield size={16} /> Role Permissions
                </h3>
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                    className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 font-medium bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                    {roles.map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3">
                {(Object.keys(FEATURES) as FeatureKey[]).map((feature) => {
                    const permission = rolePermissions[selectedRole][feature];
                    const isExpanded = expandedFeature === feature;
                    const restrictableFields = RESTRICTABLE_FIELDS[feature];
                    const hasFields = restrictableFields.length > 0;

                    return (
                        <div key={feature} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setExpandedFeature(isExpanded ? null : feature)}
                                        disabled={!hasFields}
                                        className={cn("p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors", !hasFields && "opacity-0")}
                                    >
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                    <span className="font-bold text-sm text-slate-700">{FEATURES[feature]}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permission.view}
                                            onChange={(e) => handlePermissionChange(feature, 'view', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        View
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permission.edit}
                                            onChange={(e) => handlePermissionChange(feature, 'edit', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Edit
                                    </label>
                                </div>
                            </div>

                            {/* Field Level Permissions */}
                            {isExpanded && hasFields && (
                                <div className="p-3 bg-white border-t border-slate-100 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 pl-7">Field Access Control</p>
                                    {restrictableFields.map(field => {
                                        const fieldPerm = permission.fields?.[field] || { view: true, edit: true }; // Default to true if not set
                                        return (
                                            <div key={field} className="flex items-center justify-between pl-7 pr-2 py-1 hover:bg-slate-50 rounded">
                                                <span className="text-xs font-mono text-slate-600">{field}</span>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-2 text-[10px] text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={fieldPerm.view}
                                                            onChange={(e) => handleFieldPermissionChange(feature, field, 'view', e.target.checked)}
                                                            className="rounded border-slate-200 text-purple-600 focus:ring-purple-500 w-3 h-3"
                                                        />
                                                        View
                                                    </label>
                                                    <label className="flex items-center gap-2 text-[10px] text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={fieldPerm.edit}
                                                            onChange={(e) => handleFieldPermissionChange(feature, field, 'edit', e.target.checked)}
                                                            className="rounded border-slate-200 text-purple-600 focus:ring-purple-500 w-3 h-3"
                                                        />
                                                        Edit
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
