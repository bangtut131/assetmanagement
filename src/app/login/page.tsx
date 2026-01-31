"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login, registerUser } = useStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isRegistering) {
            if (!username || !password || !name) {
                alert("Please fill in all fields");
                return;
            }
            await registerUser({ username, password, name, role: 'STAFF' });
            alert("Registration successful! Please wait for administrator approval.");
            setIsRegistering(false);
            setName("");
            setUsername("");
            setPassword("");
        } else {
            if (username.trim()) {
                const result = await login(username, password);
                if (result === 'success') {
                    router.push("/");
                } else if (result === 'pending') {
                    alert("Your account is pending approval by an administrator.");
                } else if (result === 'rejected') {
                    alert("Your account has been rejected. Please contact support.");
                } else {
                    alert("Invalid username or password.");
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
                <div className="bg-white p-8 text-center border-b border-slate-50">
                    <div className="w-full h-16 relative mb-4 flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/gas-logo.png" alt="GAS Logo" className="h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-1">GAS Asset Management</h1>
                    <p className="text-slate-500 text-sm">{isRegistering ? 'Create an Account' : 'Sign in to continue'}</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isRegistering && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-800"
                                        placeholder="Enter your full name"
                                        required={isRegistering}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-800"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-800"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-200"
                        >
                            {isRegistering ? 'Sign Up' : 'Sign In'}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
