export const IMPERSONATION_COOKIE = 'admin_impersonation'

export interface Impersonation {
  userId: string
  name: string
  role: 'assistent' | 'apotheek'
}
