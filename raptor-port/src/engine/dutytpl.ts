import { store } from './hooks'

/* THE SQUADRON'S DUTY-BLOCK TEMPLATES (owner, 13 Aug 26). "+ Block" offers
   these directly now — a wave no longer has to exist first, and no wave
   auto-creates a desk (that coupling is gone; see addWave / the retired
   waveDutyBlock path). Persisted state with save / load / reset, exactly like
   the stores list and `rules`, so it lives in the engine and the UI stays a
   builder.

   A template is {id,title,rows:[{role,str,end}]}: the id is stable so the
   editor can address one across a reorder; the title prints and is renameable;
   each row carries the default presentation — a role name and its optional
   shift hours. Placing a template COPIES its rows onto the day, so later edits
   to the library never reach a block already on a board, and vice-versa.

   Nothing in validate.ts reads a template. It only MINTS a plain duty block
   (blockFromTpl) — no sa/noconf marker, so a template desk is conflict-checked
   like any other duty row (owner, 13 Aug 26: duties are decoupled from waves,
   and the AVALON/BB desk exemption went with the auto-create). The seed week
   carries no such desk, so this changes nothing the reference parity gate sees. */

export type DutyTplRow = { role: string; str: string; end: string }
export type DutyTpl = { id: string; title: string; rows: DutyTplRow[] }

export const MAX_TPL = 24, MAX_TITLE = 24, MAX_ROWS = 24, MAX_ROLE = 24

const mk = (id: string, title: string, rows: [string, string, string][]): DutyTpl =>
  ({ id, title, rows: rows.map(([role, str, end]) => ({ role, str, end })) })

/* seeded from the shapes duties came in as before templates existed: the
   ordinary desk, SC's per-shift desk, and AVALON's overnight desk. BB's desk
   WAS the ordinary one, so it is not seeded a second time. The role vocabulary
   is DUTY_PICK's (engine/waves.ts), spaced the owner's way (OPS O, LOG CELL). */
export const DUTYTPL_STD: readonly DutyTpl[] = Object.freeze([
  mk('std', 'Standard', [['SDO', '', ''], ['SXO', '', ''], ['OPS O', '', '']]),
  mk('sc', 'SC Shift', [['SXO AM', '0700', '1300'], ['OPS O AM', '0700', '1300'],
    ['SXO PM', '1300', '1900'], ['OPS O PM', '1300', '1900']]),
  mk('avalon', 'AVALON', [['SXO', '1900', '0700'], ['OPS O', '1900', '0700'],
    ['RUNNER', '1900', '0700'], ['LOG CELL', '1900', '0700']]),
])

const clone = (t: DutyTpl): DutyTpl => ({ id: t.id, title: t.title, rows: t.rows.map(r => ({ ...r })) })
const stdCopy = () => DUTYTPL_STD.map(clone)

export let DUTYTPL_CFG: DutyTpl[] = stdCopy()

/* an incrementing suffix, not Math.random / Date.now — deterministic under
   test and enough to keep two live user templates apart. dutyTplLoad bumps it
   past any 'uN' id it restores so a fresh add can never collide with one. */
let SEQ = 0
const newId = () => 'u' + (++SEQ)

export function tplAreStandard() {
  return JSON.stringify(DUTYTPL_CFG) === JSON.stringify(stdCopy())
}

export function addTpl(title = 'New template'): DutyTpl | null {
  if (DUTYTPL_CFG.length >= MAX_TPL) return null
  const t: DutyTpl = { id: newId(), title: String(title).slice(0, MAX_TITLE) || 'New template',
    rows: [{ role: '', str: '', end: '' }] }
  DUTYTPL_CFG.push(t)
  return t
}

export function delTpl(id: string): boolean {
  const i = DUTYTPL_CFG.findIndex(t => t.id === id)
  if (i < 0) return false
  DUTYTPL_CFG.splice(i, 1)
  return true
}

export function renameTpl(id: string, title: string): boolean {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t) return false
  t.title = String(title).slice(0, MAX_TITLE)
  return true
}

export function moveTpl(from: number, to: number): boolean {
  const n = DUTYTPL_CFG.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = DUTYTPL_CFG.splice(from, 1)
  DUTYTPL_CFG.splice(to, 0, row!)
  return true
}

export function addTplRow(id: string): boolean {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t || t.rows.length >= MAX_ROWS) return false
  t.rows.push({ role: '', str: '', end: '' })
  return true
}

export function delTplRow(id: string, ri: number): boolean {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t || !t.rows[ri]) return false
  t.rows.splice(ri, 1)
  return true
}

export function setTplRow(id: string, ri: number, field: 'role' | 'str' | 'end', val: string): boolean {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t) return false
  const r = t.rows[ri]
  if (!r) return false
  if (field === 'role') r.role = String(val).slice(0, MAX_ROLE)
  else if (field === 'str' || field === 'end') r[field] = String(val)
  else return false
  return true
}

export function moveTplRow(id: string, from: number, to: number): boolean {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t) return false
  const n = t.rows.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = t.rows.splice(from, 1)
  t.rows.splice(to, 0, row!)
  return true
}

/* mint a PLAIN duty block from a template — the one thing "+ Block" asks for.
   Rows are copied (id blank, ready to seat a body), so the placed block is a
   free-standing copy the library no longer owns. */
export function blockFromTpl(id: string): any | null {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t) return null
  return { label: t.title, rows: t.rows.map(r => ({ role: r.role, id: '', str: r.str, end: r.end })) }
}

/* An ordered, renameable list IS its order, titles and rows, so — as with the
   stores list — there is no per-entry diff: the whole library is stored, and
   only when it deviates. Standard set → nothing written at all. */
export function dutyTplSave() {
  store.set('dutytpl', tplAreStandard() ? null : DUTYTPL_CFG.map(clone))
}

/* Storage is hand-editable, so it is untrusted (the same scar the stores and
   rules loaders carry). Every field is type-checked and clamped; a template
   with no rows array is dropped, a bad row skipped. If nothing valid survives
   — not an array, all dropped, or nothing saved — the library is set to the
   seed explicitly, never left at whatever it held. */
export function dutyTplLoad() {
  const raw = store.get('dutytpl', null)
  const out: DutyTpl[] = []
  if (Array.isArray(raw)) for (const t of raw) {
    if (out.length >= MAX_TPL) break
    if (!t || typeof t !== 'object' || !Array.isArray((t as any).rows)) continue
    const id = typeof (t as any).id === 'string' && (t as any).id ? (t as any).id : newId()
    const title = typeof (t as any).title === 'string' ? (t as any).title.slice(0, MAX_TITLE) : ''
    const rows: DutyTplRow[] = []
    for (const r of (t as any).rows) {
      if (rows.length >= MAX_ROWS) break
      if (!r || typeof r !== 'object') continue
      rows.push({
        role: typeof r.role === 'string' ? r.role.slice(0, MAX_ROLE) : '',
        str: typeof r.str === 'string' ? r.str : '',
        end: typeof r.end === 'string' ? r.end : '',
      })
    }
    out.push({ id, title, rows })
  }
  DUTYTPL_CFG = out.length ? out : stdCopy()
  /* keep newId ahead of every restored 'uN' so a later add cannot reuse one */
  DUTYTPL_CFG.forEach(t => { const m = /^u(\d+)$/.exec(t.id); if (m) SEQ = Math.max(SEQ, +m[1]!) })
}

export function dutyTplReset() {
  DUTYTPL_CFG = stdCopy()
  store.set('dutytpl', null)
}
