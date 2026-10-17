export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SALES' | 'VIEWER';

export type Permission = 
  | 'customers:read' | 'customers:write' | 'customers:delete'
  | 'quotes:read' | 'quotes:write'
  | 'invoices:read' | 'invoices:create' | 'invoices:cancel'
  | 'payments:read' | 'payments:register'
  | 'ledger:read' | 'ledger:write'
  | 'web3:verify' | 'web3:manage'
  | 'admin:manage' | 'audit:read';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'customers:read', 'customers:write', 'customers:delete',
    'quotes:read', 'quotes:write',
    'invoices:read', 'invoices:create', 'invoices:cancel',
    'payments:read', 'payments:register',
    'ledger:read', 'ledger:write',
    'web3:verify', 'web3:manage',
    'admin:manage', 'audit:read'
  ],
  ADMIN: [
    'customers:read', 'customers:write', 'customers:delete',
    'quotes:read', 'quotes:write',
    'invoices:read', 'invoices:create', 'invoices:cancel',
    'payments:read', 'payments:register',
    'ledger:read', 'ledger:write',
    'web3:verify', 'web3:manage',
    'admin:manage', 'audit:read'
  ],
  ACCOUNTANT: [
    'customers:read',
    'quotes:read',
    'invoices:read', 'invoices:create',
    'payments:read', 'payments:register',
    'ledger:read', 'ledger:write',
    'web3:verify',
    'audit:read'
  ],
  MANAGER: [
    'customers:read', 'customers:write',
    'quotes:read', 'quotes:write',
    'invoices:read', 'invoices:create',
    'payments:read', 'payments:register',
    'web3:verify'
  ],
  SALES: [
    'customers:read', 'customers:write',
    'quotes:read', 'quotes:write',
    'invoices:read'
  ],
  VIEWER: [
    'customers:read',
    'quotes:read',
    'invoices:read',
    'payments:read',
    'ledger:read'
  ]
};

export class RbacMiddleware {
  public static hasPermission(userRole: Role, requiredPermission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(requiredPermission);
  }

  public static validateAccess(userRole: Role, requiredPermission: Permission): void {
    if (!this.hasPermission(userRole, requiredPermission)) {
      throw new Error(`[FORBIDDEN] Acceso denegado. El rol '${userRole}' no posee el permiso '${requiredPermission}'.`);
    }
  }
}
