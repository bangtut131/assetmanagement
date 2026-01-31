export interface Asset {
    id: string;
    name: string;
    category: string;
    locationId: string;
    price: number;
    purchaseDate: string;
    usefulLife: number;
    status: 'Baik' | 'Perbaikan' | 'Rusak' | 'Hilang';
    barcode: string | null;
    image: string | null;
    deletionStatus: 'pending' | null;
    deletionRequestDate: string | null;
}

export interface Location {
    id: string;
    name: string;
    parentId: string | null;
}

export interface AssetStatus {
    label: string;
    value: string;
    color: string;
}

export interface DepreciationResult {
    currentValue: number;
    depreciationPerYear: number;
    ageYears: number;
}

export interface AuditSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string | null;
    status: 'In Progress' | 'Completed' | 'Cancelled';
    totalAssetsToCheck: number;
    scannedAssets: string[]; // List of Asset IDs
    missingAssets: string[]; // List of Asset IDs (populated on completion)
    auditorName: string;
}

export type Role = 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AUDITOR' | 'VIEWER';

export interface User {
    id: string;
    username: string;
    password?: string; // Optional for compatibility/initial seed, but should be used
    name: string;
    role: Role;
    avatar?: string;
    status: 'active' | 'pending' | 'rejected';
}

// Granular Permissions
export type PermissionType = 'view' | 'edit';

export interface FieldPermission {
    view: boolean;
    edit: boolean;
}

export interface FeaturePermission {
    view: boolean;
    edit: boolean;
    fields?: Record<string, FieldPermission>;
}

export type FeatureKey = 'dashboard' | 'assets' | 'locations' | 'approvals' | 'audit' | 'settings' | 'users';

export const FEATURES: Record<FeatureKey, string> = {
    dashboard: 'Dashboard',
    assets: 'Assets Management',
    locations: 'Locations',
    approvals: 'Approvals',
    audit: 'Audit & Opname',
    settings: 'System Settings',
    users: 'User Management',
};

// Default configuration for fields that can be restricted
export const RESTRICTABLE_FIELDS: Record<FeatureKey, string[]> = {
    assets: ['price', 'purchaseDate', 'usefulLife'],
    dashboard: [],
    locations: [],
    approvals: [],
    audit: [],
    settings: [],
    users: [],
};

export type RolePermissionConfig = Record<FeatureKey, FeaturePermission>;

// Initial Defaults
export const ROLE_PERMISSIONS: Record<Role, RolePermissionConfig> = {
    SUPER_ADMIN: {
        dashboard: { view: true, edit: true },
        assets: { view: true, edit: true },
        locations: { view: true, edit: true },
        approvals: { view: true, edit: true },
        audit: { view: true, edit: true },
        settings: { view: true, edit: true },
        users: { view: true, edit: true },
    },
    MANAGER: {
        dashboard: { view: true, edit: false },
        assets: { view: true, edit: true },
        locations: { view: true, edit: true },
        approvals: { view: true, edit: true },
        audit: { view: true, edit: true },
        settings: { view: true, edit: false },
        users: { view: true, edit: false },
    },
    STAFF: {
        dashboard: { view: true, edit: false },
        assets: { view: true, edit: false, fields: { price: { view: false, edit: false } } }, // Cannot see price
        locations: { view: true, edit: false },
        approvals: { view: false, edit: false },
        audit: { view: true, edit: true },
        settings: { view: false, edit: false },
        users: { view: false, edit: false },
    },
    AUDITOR: {
        dashboard: { view: false, edit: false },
        assets: { view: true, edit: false },
        locations: { view: true, edit: false },
        approvals: { view: false, edit: false },
        audit: { view: true, edit: true },
        settings: { view: true, edit: false }, // Can maybe view reports/logs
        users: { view: false, edit: false },
    },
    VIEWER: {
        dashboard: { view: true, edit: false },
        assets: { view: true, edit: false },
        locations: { view: true, edit: false },
        approvals: { view: false, edit: false },
        audit: { view: false, edit: false },
        settings: { view: false, edit: false },
        users: { view: false, edit: false },
    }
};
