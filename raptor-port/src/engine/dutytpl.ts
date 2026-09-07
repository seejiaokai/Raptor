import { store } from './hooks'
import { parseHM, hmOK, hhmm } from './time'
import { SAWAVE } from './waves'

/* A duty time is a clock time or nothing — the same question txtSet asks of a
   schedule time cell (slots.ts). A malformed value ('2500', 'morning') drops to
   '' (a duty role with no start is legal — many seeded rows carry blank times);
   a valid one is canonicalised to hh:mm — the app's ONE time form (owner,
   30 Aug 26: "everything follows 08:00 consistently"; this used to be the one
   deliberate compact-HHMM minter, which is exactly why a template desk printed
   '0900' beside a hand-edited '08:00') — so `700`/`0700`/`7:00` all land as
   `07:00` and a minted block reads like an edited one. Legacy compact values
   (older saved templates, data.ts seeds) still parse fine everywhere
   (parseHM), and re-fold to hh:mm the next time they cross this helper. Kept
   here as one helper so the two places a template's time crosses out of the
   editor — minted into a real day (blockFromTpl) and reloaded from untrusted
   storage (dutyTplLoad) — fold the same way, and neither can carry a nonsense
   time into the schedule. The editor itself refuses on commit with a toast
   (DutyTplModal); this is the silent net under it. */
export function tplTime(v: any): string {
  const s = String(v == null ? '' : v).trim()
  const m = s && hmOK(s) ? parseHM(s) : null
  return m == null ? '' : hhmm(m)
}

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

   Nothing in validate.ts reads a template. It only MINTS a duty block
   (blockFromTpl). Duties stay DECOUPLED from waves (owner, 13 Aug 26: no wave
   creates a desk, deleting a wave leaves every desk alone) — but since 7 Sep
   26 a template NAMES THE WAVE ITS DESK SERVES (`wave`: '' / 'sc' / 'avalon' / 'bb'),
   and the mint carries that onto the block as the same `sa` marker the
   engine has read since 11 Aug 26. That is what lets the owner's desk rules
   land: an AVALON desk is exempt from every cross-check but the availability
   look (`noconf` + `sa:'avalon'`, events.ts), earns no OIL (oil.ts), and is
   one of the places a man may not hold twice in the same hours — a BB desk is
   its twin (owner, 7 Sep 26, same day); an SC desk is
   checked like any duty row AND counts as an SC seat for the spare's
   same-hours rule (events.ts scSeatHit). A template with no wave mints the
   PLAIN block it always did. The seed week carries no template desk, so
   reference parity is untouched either way. */

export type DutyWave = '' | 'sc' | 'avalon' | 'bb'
export const DUTY_WAVES: readonly DutyWave[] = Object.freeze(['', 'sc', 'avalon', 'bb'])
export type DutyTplRow = { role: string; str: string; end: string }
export type DutyTpl = { id: string; title: string; wave: DutyWave; rows: DutyTplRow[] }

export const MAX_TPL = 24, MAX_TITLE = 24, MAX_ROWS = 24, MAX_ROLE = 24

const mk = (id: string, title: string, wave: DutyWave, rows: [string, string, string][]): DutyTpl =>
  ({ id, title, wave, rows: rows.map(([role, str, end]) => ({ role, str, end })) })

/* seeded from the shapes duties came in as before templates existed: the
   ordinary desk, SC's per-shift desk, and AVALON's overnight desk. BB's desk
   WAS the ordinary one, so it is not seeded a second time. The role vocabulary
   is DUTY_PICK's (engine/waves.ts), spaced the owner's way (OPS O, LOG CELL). */
/* seed times in hh:mm — the app's one time form (owner, 30 Aug 26). The
   editor's boxes show the stored string raw, so the seed itself must carry
   the colon; a pre-fix library in storage refolds on load (tplTime). */
export const DUTYTPL_STD: readonly DutyTpl[] = Object.freeze([
  mk('std', 'Standard', '', [['SDO', '', ''], ['SXO', '', ''], ['OPS O', '', '']]),
  mk('sc', 'SC Shift', 'sc', [['SXO AM', '07:00', '13:00'], ['OPS O AM', '07:00', '13:00'],
    ['SXO PM', '13:00', '19:00'], ['OPS O PM', '13:00', '19:00']]),
  mk('avalon', 'AVALON', 'avalon', [['SXO', '19:00', '07:00'], ['OPS O', '19:00', '07:00'],
    ['RUNNER', '19:00', '07:00'], ['LOG CELL', '19:00', '07:00']]),
])

const clone = (t: DutyTpl): DutyTpl => ({ id: t.id, title: t.title, wave: t.wave, rows: t.rows.map(r => ({ ...r })) })
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
    wave: '', rows: [{ role: '', str: '', end: '' }] }
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

/* which wave this desk serves — the one field the engine reads off the minted
   block (as `sa`). Only the three known values; anything else is refused so a
   stray string can never reach events.ts/oil.ts as a marker they half-know. */
export function setTplWave(id: string, wave: DutyWave): boolean {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t || DUTY_WAVES.indexOf(wave) < 0) return false
  t.wave = wave
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

/* mint a duty block from a template — the one thing "+ Block" asks for.
   Rows are copied (id blank, ready to seat a body), so the placed block is a
   free-standing copy the library no longer owns. A template with no wave
   mints the PLAIN {label,rows} block, byte-identical to before 7 Sep 26; one
   naming a wave carries it as `sa`, and `noconf` mirrors the WAVE's own
   exemption exactly as the retired waveDutyBlock did (SAWAVE[kind].all —
   AVALON's desk sits outside the conflict engine with its wave, an SC desk is
   checked like any duty row), so the engine reads a template desk and a
   pre-decoupling desk from an old AL snapshot the same way. */
export function blockFromTpl(id: string): any | null {
  const t = DUTYTPL_CFG.find(t => t.id === id)
  if (!t) return null
  const blk: any = { label: t.title, rows: t.rows.map(r => ({ role: r.role, id: '', str: tplTime(r.str), end: tplTime(r.end) })) }
  if (t.wave) { blk.sa = t.wave; if (SAWAVE[t.wave] && SAWAVE[t.wave].all) blk.noconf = true }
  return blk
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
  /* Advance SEQ past every restored 'uN' BEFORE minting any id (bug sweep,
     18 Aug 26). Without this an id-less entry that mints inside the loop could
     take a 'uN' a LATER entry then also claims — two rows sharing one id, the
     second unreachable to rename/delete/place. The day-template loader already
     pre-scans for exactly this reason; the post-loop pass alone cannot, since
     it runs after the collision is minted. */
  if (Array.isArray(raw)) for (const t of raw) {
    const id = (t as any)?.id
    const m = typeof id === 'string' ? /^u(\d+)$/.exec(id) : null
    if (m) SEQ = Math.max(SEQ, +m[1]!)
  }
  if (Array.isArray(raw)) for (const t of raw) {
    if (out.length >= MAX_TPL) break
    if (!t || typeof t !== 'object' || !Array.isArray((t as any).rows)) continue
    const id = typeof (t as any).id === 'string' && (t as any).id ? (t as any).id : newId()
    const title = typeof (t as any).title === 'string' ? (t as any).title.slice(0, MAX_TITLE) : ''
    /* the wave: one of the three known values, else none — EXCEPT a library
       saved before the field existed (7 Sep 26), where the two seeded desks
       still carry their seed ids and get their seed waves back rather than
       silently turning into plain desks on the first load after the update */
    const rw = (t as any).wave
    const wave: DutyWave = DUTY_WAVES.indexOf(rw) >= 0 ? rw
      : (rw === undefined && (id === 'sc' || id === 'avalon') ? id : '')
    const rows: DutyTplRow[] = []
    for (const r of (t as any).rows) {
      if (rows.length >= MAX_ROWS) break
      if (!r || typeof r !== 'object') continue
      rows.push({
        role: typeof r.role === 'string' ? r.role.slice(0, MAX_ROLE) : '',
        str: tplTime(r.str),
        end: tplTime(r.end),
      })
    }
    out.push({ id, title, wave, rows })
  }
  DUTYTPL_CFG = out.length ? out : stdCopy()
  /* SEQ was advanced past every restored 'uN' in the pre-scan above, before
     any id was minted, so a later add cannot reuse one. */
}

export function dutyTplReset() {
  DUTYTPL_CFG = stdCopy()
  store.set('dutytpl', null)
}
