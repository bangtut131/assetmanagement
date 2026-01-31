"use client";

import { useStore } from "@/store/useStore";
import { User, Role } from "@/types";
import { useState } from "react";
import { Trash2, Edit, Plus, User as UserIcon, Shield, Check, X } from "lucide-react";

export function UserManagementTab() {
    const { users, currentUser, addUser, updateUser, deleteUser, approveUser, rejectUser } = useStore();
    const [isEditing, setIsEditing] = useState<string | null>(null); // User ID being edited
    const [isAdding, setIsAdding] = useState(false);

    // Form States
    const [formData, setFormData] = useState<Partial<User>>({
        username: '',
        name: '',
        role: 'STAFF'
    });

    const activeUsers = users.filter((u: User) => u.status === 'active' || !u.status); // fallback for existing
    const pendingUsers = users.filter((u: User) => u.status === 'pending');

    const roles: Role[] = ['SUPER_ADMIN', 'MANAGER', 'STAFF', 'AUDITOR', 'VIEWER'];

    const handleSave = () => {
        if (!formData.username || !formData.name) return alert("Username and Name are required");

        if (isAdding) {
            // Check uniqueness
            if (users.some(u => u.username.toLowerCase() === formData.username?.toLowerCase())) {
                return alert("Username already exists!");
            }

            addUser({
                id: Math.random().toString(36).substr(2, 9),
                username: formData.username,
                name: formData.name,
                role: formData.role as Role,
                status: 'active'
            });
        } else if (isEditing) {
            const existing = users.find(u => u.id === isEditing);
            if (existing) {
                updateUser({
                    ...existing,
                    name: formData.name!,
                    role: formData.role as Role
                    // Username usually not editable to prevent login issues, but let's allow it for now or lock it?
                    // Let's lock username for edit
                });
            }
        }

        resetForm();
    };

    const resetForm = () => {
        setIsAdding(false);
        setIsEditing(null);
        setFormData({ username: '', name: '', role: 'STAFF' });
    };

    const startEdit = (user: User) => {
        setFormData({ username: user.username, name: user.name, role: user.role });
        setIsEditing(user.id);
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            deleteUser(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <UserIcon size={16} /> User Accounts
                </h3>
                {!isAdding && !isEditing && (
                    <button
                        onClick={() => { setIsAdding(true); setFormData({ username: '', name: '', role: 'STAFF' }); }}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                        <Plus size={14} /> Add User
                    </button>
                )}
            </div>

            {/* Form Area */}
            {(isAdding || isEditing) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">{isAdding ? 'New User' : 'Edit User'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                disabled={!!isEditing} // Lock username on edit
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 disabled:bg-slate-100"
                                placeholder="e.g. johndoe"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200"
                            >
                                {roles.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={resetForm} className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center gap-1">
                            <Check size={14} /> Save
                        </button>
                    </div>
                </div>
            )}

            {/* List Area */}
            {/* Pending Users Section */}
            {pendingUsers.length > 0 && (
                <div className="space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                        <Shield size={14} /> Pending Approvals
                    </h4>
                    <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-amber-100/50 text-amber-700 font-bold uppercase text-[10px]">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Requested Role</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                                {pendingUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-amber-100/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-800">{user.name}</div>
                                            <div className="text-xs text-slate-500">@{user.username}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-amber-200 text-amber-600 shadow-sm">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => approveUser(user.id)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => rejectUser(user.id)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Active Users Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {activeUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                                            {user.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{user.name}</div>
                                            <div className="text-xs text-slate-400">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    {user.username !== 'admin' && ( // Prevent deleting main admin
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => startEdit(user)}
                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {activeUsers.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No active users found.
                    </div>
                )}
            </div>
        </div>
    );
}
