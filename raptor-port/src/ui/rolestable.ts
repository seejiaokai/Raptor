/* "WHAT EACH ROLE ALLOWS" — THE ROLES TABLE ON A PERSON'S OPENED ROW (his D2302: a table, pages down the side, roles across,
   a tick, "read" or a dash, short numbered notes under it; D2305: built as drawn on 22 Nov — eight rows, five roles, five
   notes; the drawing docs/mock/2026-11-22-msq-b1-screens/draw-roles.mjs `TABLE`, picture k2; every cell's proof
   docs/superpowers/briefs/2026-11-22-msq-roles-table.md §2).

   ONE TABLE, read by the screen (ui/UserAccess.tsx RolesFold) and by the test that signs in a person of each role and
   asks the app's own permission readers whether each page opens and its controls are offered
   (ui/rolestable.test.tsx) — so the words a person reads can never drift from what the app does (D200's rule). A cell
   the app disagrees with is not changed here to make the test pass: it is put to him (D2305 — the table as drawn).

   The roles: Member and Admin of his own squadron; View and Plan — what that access gives of ANOTHER squadron; Master
   admin — any squadron (the brief §2's reading of each column). */

export type Mark = 'yes' | 'read' | 'no'
export interface RoleCell { mark: Mark; note?: number }
export type RolePage = 'editsched' | 'viewsched' | 'logic' | 'inputs' | 'quals' | 'leavewar' | 'tracker' | 'admin'
export type TableRole = 'member' | 'admin' | 'view' | 'plan' | 'master'

export const TABLE_ROLES: TableRole[] = ['member', 'admin', 'view', 'plan', 'master']
export const ROLE_HEADS: Record<TableRole, string> = { member: 'Member', admin: 'Admin', view: 'View', plan: 'Plan', master: 'Master admin' }
/* the label over the grid and the key under it, as drawn (picture k2) */
export const ROLES_LABEL = 'View and Plan give access to another squadron.'
export const ROLES_KEY = '✓ can change · read: can see, not change · — cannot open'
export const MARK_WORD: Record<Mark, string> = { yes: '✓', read: 'read', no: '—' }

const c = (s: string): RoleCell => {
  const [m, n] = s.split('^')
  return { mark: m === '✓' ? 'yes' : m === 'read' ? 'read' : 'no', ...(n ? { note: Number(n) } : {}) }
}
const row = (page: RolePage, name: string, cells: string) => {
  const [member, admin, view, plan, master] = cells.split(' ').map(c)
  return { page, name, cells: { member: member!, admin: admin!, view: view!, plan: plan!, master: master! } as Record<TableRole, RoleCell> }
}
/* the grid — Member, Admin, View, Plan, Master admin */
export const ROLES_TABLE = [
  row('editsched', 'Edit Schedule', '— ✓ — ✓ ✓'),
  row('viewsched', 'View-only Sched', 'read read read read read'),
  row('logic', 'Logic', 'read ✓ read ✓ ✓'),
  row('inputs', 'Inputs', '✓^1 ✓ — ✓ ✓'),
  row('quals', 'Quals', '✓^2 ✓ — ✓ ✓'),
  row('leavewar', 'Leave War', '✓^3 ✓ — ✓ ✓'),
  row('tracker', 'Tracker', '✓^4 ✓ — ✓ ✓'),
  row('admin', 'Admin', '— ✓^5 — ✓^5 ✓'),
]
/* what a tick leaves out — the numbers on the cells */
export const ROLES_NOTES = [
  'Own inputs, and duties and commitments for others while the admin allows it. Sees everyone\'s.',
  'Own row only: not the callsign, Management or Scheduler tick.',
  'Bids for own leave. Sees everyone\'s leave.',
  'Everything but the flex settings.',
  'Only a master admin makes squadrons, gives Plan or makes a master admin.',
]
