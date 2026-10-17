export type UserRole = 
  | 'OWNER' 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'ACCOUNTANT' 
  | 'SALES' 
  | 'VIEWER' 
  | 'CUSTOMER' 
  | 'CREDIT_MANAGER';

export interface Permission {
  action: string;
  resource: string;
}

// Role hierarchy and permissions definition
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  OWNER: ['*'], // Full unrestricted access
  ADMIN: [
    'users:read', 'users:write', 'users:invite', 'roles:manage',
    'organization:write', 'invoices:*', 'payments:*', 'customers:*',
    'ledger:*', 'banking:*', 'ai:*', 'workflows:*', 'credit:*', 'analytics:read'
  ],
  MANAGER: [
    'organization:read', 'invoices:*', 'payments:*', 'customers:*',
    'ledger:read', 'banking:read', 'ai:read', 'workflows:*', 'credit:read', 'analytics:read'
  ],
  ACCOUNTANT: [
    'invoices:*', 'payments:*', 'customers:read', 'ledger:*', 'banking:read', 'analytics:read'
  ],
  CREDIT_MANAGER: [
    'credit:*', 'customers:read', 'invoices:read', 'payments:read', 'analytics:read'
  ],
  SALES: [
    'customers:*', 'quotes:*', 'invoices:create', 'invoices:read', 'payments:read'
  ],
  VIEWER: [
    'customers:read', 'invoices:read', 'payments:read', 'ledger:read', 'analytics:read'
  ],
  CUSTOMER: [
    'invoices:read_own', 'payments:create_own', 'receipts:read_own', 'shop:read'
  ]
};

/**
 * Checks if a user role has permission to perform an action on a resource.
 */
export function hasPermission(userRole: UserRole | undefined, permission: string): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  if (permissions.includes('*')) return true;
  if (permissions.includes(permission)) return true;

  // Check wildcard scopes like 'invoices:*'
  const [resource] = permission.split(':');
  if (permissions.includes(`${resource}:*`)) return true;

  return false;
}

/**
 * Verifies whether the actor role is authorized to change user roles or organization settings.
 */
export function canManageRoles(actorRole: UserRole | undefined): boolean {
  return actorRole === 'OWNER' || actorRole === 'ADMIN';
}
