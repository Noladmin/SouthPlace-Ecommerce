import type { Admin, Role } from "@/lib/types"

export type AdminPermission =
  | "view_admin_users"
  | "view_analytics"
  | "manage_settings"
  | "view_payments"

const rolePermissions: Record<Role, AdminPermission[]> = {
  SUPER_ADMIN_USER: ["view_admin_users", "view_analytics", "manage_settings", "view_payments"],
  ADMIN_USER: ["view_payments"],
  USER: [],
}

export function hasAdminPermission(
  adminOrRole: Pick<Admin, "role"> | Role | null | undefined,
  permission: AdminPermission
): boolean {
  const role = typeof adminOrRole === "string" ? adminOrRole : adminOrRole?.role
  if (!role) return false
  return rolePermissions[role]?.includes(permission) ?? false
}
