/**
 * Portal user types — mirror of backend `App\Enums\PortalRole`.
 *
 * Single source of truth for the `student` / `teacher` / `principal` slugs
 * used as route segments ('/panel/{type}/...'), guard names, and Inertia
 * page props. Components that previously hard-coded these strings should
 * import from here instead.
 */

export const PORTAL_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PRINCIPAL: 'principal',
}

export const PORTAL_ROLE_VALUES = Object.values(PORTAL_ROLES)

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isPortalRole(value) {
  return PORTAL_ROLE_VALUES.includes(value)
}
