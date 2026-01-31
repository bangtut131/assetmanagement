import { create } from 'zustand';
import { Asset, Location, AuditSession, User, Role, ROLE_PERMISSIONS, FeatureKey, FeaturePermission, RolePermissionConfig } from '@/types';
import { supabase } from '@/lib/supabase';

export interface AuditLog {
    id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'RESET' | 'AUDIT_START' | 'AUDIT_SCAN' | 'AUDIT_COMPLETE';
    target: string;
    details: string;
    timestamp: string;
    user: string;
}

interface AppState {
    isLoading: boolean;
    assets: Asset[];
    locations: Location[];
    auditLogs: AuditLog[];
    auditSessions: AuditSession[];
    currentAuditId: string | null;
    currentUser: User | null;

    // UI State
    isSettingsOpen: boolean;
    settingsActiveTab: 'general' | 'logs' | 'users' | 'permissions' | 'profile';
    openSettings: (tab?: 'general' | 'logs' | 'users' | 'permissions' | 'profile') => void;
    closeSettings: () => void;

    // Permissions
    rolePermissions: Record<Role, RolePermissionConfig>;
    hasPermission: (feature: FeatureKey, action: 'view' | 'edit', field?: string) => boolean;
    updateRolePermission: (role: Role, feature: FeatureKey, config: FeaturePermission) => void;

    // Initialization
    fetchInitialData: () => Promise<void>;

    // User Actions
    login: (username: string, password?: string) => Promise<'success' | 'invalid_credentials' | 'pending' | 'rejected'>;
    logout: () => void;
    registerUser: (user: Omit<User, 'id' | 'status'>) => Promise<void>;
    changePassword: (userId: string, newPassword: string) => Promise<void>;
    addUser: (user: User) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    approveUser: (id: string) => Promise<void>;
    rejectUser: (id: string) => Promise<void>;

    // Data Actions
    addAsset: (asset: Asset) => Promise<void>;
    updateAsset: (asset: Asset) => Promise<void>;
    deleteAsset: (id: string) => Promise<void>;
    requestDeleteAsset: (id: string) => Promise<void>;
    approveDeleteAsset: (id: string) => Promise<void>;
    rejectDeleteAsset: (id: string) => Promise<void>;

    addLocation: (location: Location) => Promise<void>;
    deleteLocation: (id: string) => Promise<void>;

    // Audit Actions
    startAudit: (auditorName: string) => void;
    scanAuditAsset: (barcode: string) => boolean;
    cancelAudit: () => void;
    completeAudit: () => void;

    resetData: () => Promise<void>;
    addLog: (action: AuditLog['action'], target: string, details: string) => void;
    importData: (data: AppState) => void;
}

export const useStore = create<AppState>((set, get) => ({
    isLoading: false,
    assets: [],
    locations: [],
    auditLogs: [],
    auditSessions: [],
    users: [],
    currentAuditId: null,
    currentUser: null,
    isSettingsOpen: false,
    settingsActiveTab: 'general',
    rolePermissions: ROLE_PERMISSIONS,

    openSettings: (tab = 'general') => set({ isSettingsOpen: true, settingsActiveTab: tab }),
    closeSettings: () => set({ isSettingsOpen: false }),

    fetchInitialData: async () => {
        set({ isLoading: true });
        try {
            const { data: assets } = await supabase.from('assets').select('*');
            const { data: locations } = await supabase.from('locations').select('*');
            const { data: users } = await supabase.from('users').select('*');
            const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
            const { data: sessions } = await supabase.from('audit_sessions').select('*').order('created_at', { ascending: false });

            set({
                assets: assets || [],
                locations: locations || [],
                users: users || [],
                auditLogs: logs || [],
                auditSessions: sessions || [],
                isLoading: false
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            set({ isLoading: false });
        }
    },

    login: async (username, password) => {
        // Since we store plain text passwords currently, we query directly
        const { data: user } = await supabase.from('users')
            .select('*')
            .ilike('username', username)
            .single();

        if (user) {
            if (password && user.password && user.password !== password) {
                return 'invalid_credentials';
            }
            if (user.status === 'pending') return 'pending';
            if (user.status === 'rejected') return 'rejected';

            set({ currentUser: user });
            get().addLog('UPDATE', 'System', `User logged in: ${user.username}`);
            return 'success';
        }
        return 'invalid_credentials';
    },

    registerUser: async (userData) => {
        const id = crypto.randomUUID();
        const newUser = { ...userData, id, status: 'pending', role: 'VIEWER' }; // Default role VIEWER until approved/changed
        // Actually interface allows passing role
        const { error } = await supabase.from('users').insert([{ ...userData, id, status: 'pending' }]);

        if (!error) {
            set(state => ({ users: [...state.users, { ...userData, id, status: 'pending' } as User] })); // Optimistic
            get().addLog('CREATE', 'User', `New registration: ${userData.username}`);
        }
    },

    logout: () => {
        const user = get().currentUser;
        if (user) get().addLog('UPDATE', 'System', `User logged out: ${user.username}`);
        set({ currentUser: null });
    },

    changePassword: async (userId, newPassword) => {
        await supabase.from('users').update({ password: newPassword }).eq('id', userId);
        set(state => ({
            users: state.users.map(u => u.id === userId ? { ...u, password: newPassword } : u),
            currentUser: state.currentUser?.id === userId ? { ...state.currentUser, password: newPassword } : state.currentUser
        }));
        get().addLog('UPDATE', 'User', 'Password changed');
    },

    addUser: async (user) => {
        await supabase.from('users').insert([user]);
        set(state => ({ users: [...state.users, user] }));
        get().addLog('CREATE', 'User Management', `Created user ${user.username}`);
    },

    updateUser: async (user) => {
        await supabase.from('users').update(user).eq('id', user.id);
        set((state) => ({
            users: state.users.map(u => u.id === user.id ? user : u),
            currentUser: state.currentUser?.id === user.id ? user : state.currentUser
        }));
        get().addLog('UPDATE', 'User Management', `Updated user ${user.username}`);
    },

    deleteUser: async (id) => {
        await supabase.from('users').delete().eq('id', id);
        set((state) => ({ users: state.users.filter(u => u.id !== id) }));
        get().addLog('DELETE', 'User Management', `Deleted user ${id}`);
    },

    approveUser: async (id) => {
        await supabase.from('users').update({ status: 'active' }).eq('id', id);
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, status: 'active' } : u)
        }));
        get().addLog('APPROVE', 'User', `User approved: ${id}`);
    },

    rejectUser: async (id) => {
        await supabase.from('users').update({ status: 'rejected' }).eq('id', id);
        set(state => ({
            users: state.users.map(u => u.id === id ? { ...u, status: 'rejected' } : u)
        }));
        get().addLog('REJECT', 'User', `User rejected: ${id}`);
    },

    addAsset: async (asset) => {
        await supabase.from('assets').insert([asset]);
        set((state) => ({ assets: [asset, ...state.assets] }));
        get().addLog('CREATE', asset.name, `Added new asset ${asset.name}`);
    },

    updateAsset: async (asset) => {
        await supabase.from('assets').update(asset).eq('id', asset.id);
        set((state) => ({ assets: state.assets.map(a => a.id === asset.id ? asset : a) }));
        get().addLog('UPDATE', asset.name, `Updated details for ${asset.name}`);
    },

    deleteAsset: async (id) => {
        await supabase.from('assets').delete().eq('id', id);
        set((state) => ({ assets: state.assets.filter(a => a.id !== id) }));
        get().addLog('DELETE', 'Asset', `Deleted asset ${id}`);
    },

    requestDeleteAsset: async (id) => {
        const date = new Date().toISOString();
        await supabase.from('assets').update({ deletion_status: 'pending', deletion_request_date: date }).eq('id', id);
        set((state) => ({
            assets: state.assets.map(a => a.id === id ? { ...a, deletionStatus: 'pending', deletionRequestDate: date } : a)
        }));
    },

    approveDeleteAsset: async (id) => {
        await supabase.from('assets').delete().eq('id', id);
        set((state) => ({ assets: state.assets.filter(a => a.id !== id) }));
        get().addLog('APPROVE', 'Asset', `Approved deletion of asset ${id}`);
    },

    rejectDeleteAsset: async (id) => {
        await supabase.from('assets').update({ deletion_status: null, deletion_request_date: null }).eq('id', id);
        set((state) => ({
            assets: state.assets.map(a => a.id === id ? { ...a, deletionStatus: null, deletionRequestDate: null } : a)
        }));
    },

    addLocation: async (location) => {
        await supabase.from('locations').insert([location]);
        set((state) => ({ locations: [...state.locations, location] }));
        get().addLog('CREATE', location.name, `Created location ${location.name}`);
    },

    deleteLocation: async (id) => {
        await supabase.from('locations').delete().eq('id', id);
        set((state) => ({ locations: state.locations.filter(l => l.id !== id) }));
        get().addLog('DELETE', 'Location', `Deleted location ${id}`);
    },

    addLog: async (action, target, details) => {
        const log = {
            action, target, details,
            timestamp: new Date().toISOString(),
            user: get().currentUser?.username || 'System'
        };
        // We log locally and asynchronously push to DB
        set(state => ({ auditLogs: [{ ...log, id: Math.random().toString() }, ...state.auditLogs] }));
        await supabase.from('audit_logs').insert([log]);
    },

    // Audit internals (Local mostly, but sync sessions)
    startAudit: (auditorName) => {
        const id = crypto.randomUUID();
        const start = new Date().toISOString();
        const newSession: AuditSession = {
            id,
            name: `Audit ${start}`,
            startDate: start,
            endDate: null,
            status: 'In Progress',
            totalAssetsToCheck: get().assets.length,
            scannedAssets: [],
            missingAssets: [],
            auditorName
        };
        set(state => ({ auditSessions: [newSession, ...state.auditSessions], currentAuditId: id }));
        // Sync to DB
        supabase.from('audit_sessions').insert([newSession]).then();
        get().addLog('AUDIT_START', 'Stock Opname', `Started new audit session`);
    },

    scanAuditAsset: (barcode) => {
        // Local logic preserved for speed, could sync later or periodically
        const state = get();
        if (!state.currentAuditId) return false;

        const asset = state.assets.find(a => a.barcode === barcode || a.id === barcode);
        if (!asset) return false;

        const session = state.auditSessions.find(s => s.id === state.currentAuditId);
        if (!session) return false;

        if (!session.scannedAssets.includes(asset.id)) {
            const updatedSession = { ...session, scannedAssets: [...session.scannedAssets, asset.id] };
            set(state => ({
                auditSessions: state.auditSessions.map(s => s.id === state.currentAuditId ? updatedSession : s)
            }));
            // Update DB
            supabase.from('audit_sessions').update({ scanned_assets: updatedSession.scannedAssets }).eq('id', session.id).then();
            get().addLog('AUDIT_SCAN', asset.name, `Scanned asset`);
            return true;
        }
        return true;
    },

    completeAudit: () => {
        const state = get();
        if (!state.currentAuditId) return;
        const session = state.auditSessions.find(s => s.id === state.currentAuditId);
        if (!session) return;

        const allAssetIds = state.assets.map(a => a.id);
        const missing = allAssetIds.filter(id => !session.scannedAssets.includes(id));
        const endDate = new Date().toISOString();

        const updatedSession = { ...session, status: 'Completed', endDate, missingAssets: missing };

        set(state => ({
            currentAuditId: null,
            auditSessions: state.auditSessions.map(s => s.id === session.id ? updatedSession as AuditSession : s)
        }));

        supabase.from('audit_sessions').update({
            status: 'Completed',
            end_date: endDate,
            missing_assets: missing
        }).eq('id', session.id).then();

        get().addLog('AUDIT_COMPLETE', 'Stock Opname', `Completed audit.`);
        // Assuming cancelAudit just clears local ID, Supabase session remains "In Progress" or deleted? Implementation choice.
        // For simplicity we leave it.
    },

    cancelAudit: () => set({ currentAuditId: null }),

    resetData: async () => {
        // Clears everything from Supabase
        await supabase.from('assets').delete().neq('id', '0');
        await supabase.from('locations').delete().neq('id', '0');
        // Keep users? Or reset them too? Usually reset wipes data but not admin?
        // For safety let's just wipe assets/locations/logs
        await supabase.from('audit_logs').delete().neq('id', '0');
        set({ assets: [], locations: [], auditLogs: [], auditSessions: [] });
        get().addLog('RESET', 'System', 'Factory reset performed');
    },

    importData: async (data: AppState) => {
        // Clear existing
        await get().resetData();
        // Bulk insert
        if (data.assets.length) await supabase.from('assets').insert(data.assets);
        if (data.locations.length) await supabase.from('locations').insert(data.locations);
        // Sync state
        await get().fetchInitialData();
        get().addLog('RESET', 'System', 'Data imported');
    },

    // Permissions (Local for now, could move to DB)
    hasPermission: (feature, action, field) => {
        const user = get().currentUser;
        if (!user) return false;
        const permissions = get().rolePermissions[user.role];
        if (!permissions) return false;
        const featureConfig = permissions[feature];
        if (!featureConfig) return false;
        if (field && featureConfig.fields && featureConfig.fields[field]) return featureConfig.fields[field][action];
        return featureConfig[action];
    },
    updateRolePermission: (role, feature, config) => {
        set(state => ({
            rolePermissions: {
                ...state.rolePermissions,
                [role]: { ...state.rolePermissions[role], [feature]: config }
            }
        }));
    }
}));
