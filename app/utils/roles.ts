/**
 * Parse comma-separated roles string into an array of role strings
 * @param roles - Comma-separated roles string (e.g., "admin,user,moderator")
 * @returns Array of individual role strings
 */
export function getRoles(roles: string | null | undefined): string[] {
  if (!roles)
    return []
  return roles.split(',').map(role => role.trim()).filter(Boolean)
}

/**
 * Get color variant for a role badge
 * @param role - Role name
 * @returns Nuxt UI color variant
 */
export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    admin: 'primary',
    moderator: 'amber',
    user: 'neutral',
  }
  return roleColors[role.toLowerCase()] || 'gray'
}
