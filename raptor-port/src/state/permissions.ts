/* WHO MAY DO WHAT — the one place (owner, D200 (3), 26 Sep 26: "One place in the app answers 'may this person do
   this?', mirroring the table, with a test that fails when the two disagree — so the server's rules at the database
   step are a translation of an agreed list, not a hunt").

   The table is docs/data-model.md §11 — the list IT builds the database's security roles from. Its app copy is
   permissions.json beside this file, and scripts/permcheck.mjs holds the two equal cell for cell (in the document
   gate on every change, docs-only included, and in permissions.test.ts). This module is PURE: data and one
   function, no session, no imports from the rest of the app — so the document gate, the tests and auth.ts's `may()`
   all read the same answer. `may()` (state/auth.ts) is the one binding to the signed-in person.

   Three roles (§11): admin, member (the app's 'main'), and waiting — someone signed in with a defence mail no
   account carries (D204). 'own' is what a member may do to a row that is his own, on top of what he may do to any. */
import TABLE from './permissions.json'

export type Op = 'C' | 'R' | 'U' | 'D'
export type PermRole = 'admin' | 'member' | 'waiting'
type Row = { tables: string[]; admin: string; member: string; own: string }
type WaitRow = { tables: string[]; any: string; own: string; guestSwitch: boolean }

const ROWS = new Map<string, Row>()
for (const r of (TABLE as any).tables as Row[]) for (const t of r.tables) ROWS.set(t, r)
const WAIT = new Map<string, WaitRow>()
for (const r of (TABLE as any).waiting as WaitRow[]) for (const t of r.tables) WAIT.set(t, r)

/* every table name §11 knows — a gate naming anything else is a typo, and the ratchet test fails it */
export const TABLES: ReadonlySet<string> = new Set(ROWS.keys())
export const isTable = (t: string) => ROWS.has(t)

/* the answer. `isOwn` — the row is the asker's own (the caller decides what "own" means for the table: §11's
   "Own row is…" column). `guestView` — the admin's switch letting people waiting read the programme (D204).
   An unknown table is refused, never guessed. */
export function allowed(role: PermRole | null, op: Op, table: string, isOwn = false, guestView = false): boolean {
  if (!role) return false
  if (role === 'waiting') {
    const w = WAIT.get(table)
    if (!w) return false
    if (isOwn && w.own.includes(op)) return true
    return w.any.includes(op) && (!w.guestSwitch || guestView)
  }
  const r = ROWS.get(table)
  if (!r) return false
  if (role === 'admin') return r.admin.includes(op)
  return r.member.includes(op) || (isOwn && r.own.includes(op))
}

/* THE GATES THAT ARE NOT SCHEDULE WRITES (Fable F4, 26 Sep 26). `canEditSched()` (state/auth.ts) is the named
   alias for the true schedule writers — the week, the board, drafts, the planning layer, the day's view toggles and
   its OIL earn decisions — all ScheduleWeek U in §11. Everything else names its OWN table here, once, so what each
   door claims is readable in one list and the ratchet (permissions.test.ts) can hold every call to a real cell. */
export const GATES = {
  /* the rules (Logic), the four template / default editors, the qualification columns, section defaults */
  settings: ['U', 'Setting'],
  /* Admin → Data → Clear edit history (25 Aug 26) */
  clearEditLog: ['D', 'EditLog'],
  /* a person on the Quals page: add, edit (own row for a member — D149), archive, restore */
  addPerson: ['C', 'Person'],
  editPerson: ['U', 'Person'],
  archivePerson: ['D', 'Person'],
  /* a qualification tick on the Quals page (own row for a member — D149) */
  tickQual: ['U', 'QualMark'],
  /* a personal input: file (for whom), edit, delete — own row for a member */
  fileInput: ['C', 'Input'],
  editInput: ['U', 'Input'],
  deleteInput: ['D', 'Input'],
  /* a medical document on an input: upload, view — own for a member */
  addDocument: ['C', 'Attachment'],
  /* accounts and access requests (Admin → Users, D166, D204) */
  manageAccounts: ['U', 'User'],
  decideRequests: ['U', 'AccessRequest'],
  /* a waiting person's own request (D204) */
  ownRequest: ['C', 'AccessRequest'],
  /* reading who is absent (the Unavailable and SANS blocks): never for someone waiting (§11) */
  readInputs: ['R', 'Input'],
} as const satisfies Record<string, readonly [Op, string]>
export type GateName = keyof typeof GATES
