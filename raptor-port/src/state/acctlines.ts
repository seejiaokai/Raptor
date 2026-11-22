/* HIS OWN ACCOUNT'S BELL LINES (batch 1's second half, plan §7 item 6, §15 D5, D7, D11, §16 D5′–D7′, D11′ — his D2251:
   "the players should be informed when their account status changes"; D2309 the line's shape; D2319 its words).

   ONE BODY says what a change of a man's access owes: `accessIn` reads his access in force on a day over a set of rows —
   his sign-in on or off, the master mark, his role at home, his View and Plan of every other squadron — and `accessParts`
   compares two of them, part by part. The doors that change access (state/accounts.ts, state/units.ts, the archive and
   the posting commands in leavewar/sync.ts) take `accessWas()` before they write and `tellAccess` after, inside their
   own command; the commit gate (state/perms.ts acctLineViolation) asks the same two of the command's own rows before
   and after, so a line reaches only the man whose access that command changed, in words that match the change exactly.
   An Undo and a Redo are judged the same way over the rows they restore (§16 D7′). A change that takes effect later — a
   move saved today ends his rights from tomorrow — is told when it does, by the app's own writer, `tellMoves`, at the
   first load on or after that day and at the midnight wake (D11, D11′). */
import { HOOKS, store } from '../engine/hooks'
import { activeEnvelope } from '../command'
import { PEOPLE } from '../engine/people'
import { addDays } from './flyplan-model'
import { ACCOUNTS_LIST, ACCOUNT_PFX, levelAcct, readAccounts, seedAccounts, type Account } from './accounts'
import { me } from './perms'
import { NOTICES, noticeAccount, type NoticePart, type AcctChange } from './notices'
import { unitRows, unitRowsBefore, unitRowsAfter, todayIso, homeBefore, levelBefore, grantBefore, homeChangesOn } from './units'
import type { UnitRows, GrantLevel } from './units-model'

export type AcctPart = Extract<NoticePart, { k: 'acct' }>

/** HIS ACCESS IN FORCE ON A DAY, over these rows: his sign-in on or off, the master mark, an admin of his home squadron
 *  (by his account's own role — the member view changes nothing, D2253), and his level in every other squadron.
 *  `nums` — each squadron's number as these rows write it (a line about a squadron since removed keeps its number). */
export interface AccessNow {
  pid: string
  on: boolean
  master: boolean
  admin: boolean
  home: string | null
  lv: ReadonlyMap<string, GrantLevel>
  nums: ReadonlyMap<string, string>
}
export function accessIn(a: Account | null | undefined, rows: UnitRows, iso: string): AccessNow | null {
  if (!a) return null
  const pid = String(a.pid)
  const home = homeBefore(pid, iso, rows)
  const admin = a.role === 'admin' && !!home && levelBefore(levelAcct({ ...a, master: undefined }), home, iso, rows) === 'admin'
  const lv = new Map<string, GrantLevel>(), nums = new Map<string, string>()
  for (const u of rows.units) {
    nums.set(u.id, String(u.num))
    if (u.id === home) continue
    const g = grantBefore({ id: a.id, pid, pidFrom: a.pidFrom }, u.id, iso, rows)
    if (g) lv.set(u.id, g.level)
  }
  return { pid, on: a.on !== false, master: a.master === true, admin, home, lv, nums }
}

/** WHAT A CHANGE OF HIS ACCESS OWES HIM, part by part (D2319's words, notices.ts acctWords): the master mark; his role at
 *  home, while his home stays (a move is told on its day — tellMoves); his sign-in; each other squadron's level, in the
 *  squadrons' order. Made a master admin, the Plan rows his Save drops tell nothing — "Full access" covers them (§4 item
 *  5). Plan lowered to View says both: Plan ended, then View given. `why` — the app's own reason for a right that ended
 *  (an archive), said in place of a name. A sign-in re-linked to another man owes nothing: neither man's access changed
 *  as he holds it (the agent's reading, told to him). */
export function accessParts(b: AccessNow | null, a: AccessNow | null, why?: 'archived'): AcctPart[] {
  if (!b || !a || b.pid !== a.pid) return []
  const out: AcctPart[] = []
  if (!b.master && a.master) out.push({ k: 'acct', c: 'master' })
  if (b.master && !a.master) out.push({ k: 'acct', c: 'masterEnd' })
  if (b.home && b.home === a.home && b.admin !== a.admin) {
    out.push(a.admin ? { k: 'acct', c: 'admin', u: a.home!, num: a.nums.get(a.home!) ?? b.nums.get(a.home!) ?? '' } : { k: 'acct', c: 'member' })
  }
  if (b.on !== a.on) out.push({ k: 'acct', c: a.on ? 'on' : 'off' })
  if (!(a.master && !b.master)) {
    const ids = [...new Set([...b.lv.keys(), ...a.lv.keys()])]
    const num = (u: string): string => a.nums.get(u) ?? b.nums.get(u) ?? ''
    ids.sort((x, y) => num(x).localeCompare(num(y), undefined, { numeric: true }) || (x < y ? -1 : 1))
    for (const u of ids) {
      const lb = b.lv.get(u) ?? null, la = a.lv.get(u) ?? null
      if (lb === la) continue
      const end = (c: AcctChange): AcctPart => ({ k: 'acct', c, u, num: num(u), ...(why ? { why } : {}) })
      if (la === 'admin') out.push({ k: 'acct', c: 'plan', u, num: num(u) })
      else if (la === 'view') { if (lb === 'admin') out.push(end('planEnd')); out.push({ k: 'acct', c: 'view', u, num: num(u) }) }
      else out.push(end(lb === 'admin' ? 'planEnd' : 'viewEnd'))
    }
  }
  return out
}
/** …and what a MOVE owes him on its day (D11 — K3, D2203): every View and Plan he held the day before ends, and an admin
 *  is a member of the squadron he joins; each said by the app, with no one's name — "View of 149 ended: you moved to 150",
 *  "Made a member: you moved to 149". */
export function movedParts(b: AccessNow | null, a: AccessNow | null): AcctPart[] {
  if (!b || !a || b.pid !== a.pid || !a.home || b.home === a.home) return []
  const mv = a.nums.get(a.home) ?? b.nums.get(a.home) ?? ''
  const out: AcctPart[] = []
  if (b.admin && !a.admin) out.push({ k: 'acct', c: 'member', why: 'moved', mv })
  const num = (u: string): string => a.nums.get(u) ?? b.nums.get(u) ?? ''
  const ids = [...b.lv.keys()].filter(u => a.lv.get(u) !== b.lv.get(u) && !(u === a.home))
  ids.sort((x, y) => num(x).localeCompare(num(y), undefined, { numeric: true }) || (x < y ? -1 : 1))
  for (const u of ids) out.push({ k: 'acct', c: b.lv.get(u) === 'admin' ? 'planEnd' : 'viewEnd', u, num: num(u), why: 'moved', mv })
  return out
}
/** WHO SIGNS IT: the person who made the change — but the app, with no name, where the app did it: a right an archive
 *  ended, a move's, and a suspension an Overseas posting made (D2319: "Suspended" with no name) */
export const acctByApp = (p: AcctPart, after: Pick<Account, 'offBy'> | null | undefined): boolean =>
  !!p.why || (p.c === 'off' && after?.offBy === 'po')
/** the day a move's line names and its fixed id (D11): a second load, or a second browser, finds it and writes nothing */
export const movedLineId = (accountId: string, day: string, p: AcctPart): string => `acct:mv:${accountId}:${day}:${p.c}:${p.u ?? ''}`

/* ---- the writers ---- */
/** every account's access today, with whether its man is archived — taken by a door BEFORE it writes */
export type AccessWas = ReadonlyMap<string, { now: AccessNow | null; archived: boolean }>
/* (the accounts AS STORED, read the loader's way — the seeded list where none is stored — never the list in memory: the
   commit gate judges the rows the command wrote, so the writer reads the same, and the two cannot disagree; a change the
   command does not record owes nothing) */
function storedAccounts(): Account[] {
  const rows = store.keys(ACCOUNT_PFX).map(k => store.get(k, null)).filter(Boolean)
  return rows.length ? readAccounts(rows) : seedAccounts()
}
export function accessWas(): AccessWas {
  const rows = unitRows(), today = todayIso()
  return new Map(storedAccounts().map(a => [a.id, { now: accessIn(a, rows, today), archived: !!(PEOPLE as any)[String(a.pid)]?.archived }]))
}
const TOLD = new WeakMap<object, Set<string>>()
/** the lines the step owes, written INSIDE its command, after its writes: one a change, to the account's man, signed by
 *  whoever made it (acctByApp), dated today; the scheduler store (the bell) enlisted only where a line is owed. */
export function tellAccess(txn: any, was: AccessWas): number {
  const rows = unitRows(), today = todayIso(), at = Date.now(), by = me()
  let wrote = 0, enlisted = false
  for (const a of storedAccounts()) {
    const w = was.get(a.id)
    if (!w) continue
    const pid = String(a.pid)
    const why = !w.archived && !!(PEOPLE as any)[pid]?.archived ? 'archived' as const : undefined
    const parts = accessParts(w.now, accessIn(a, rows, today), why)
    if (!parts.length) continue
    if (!enlisted) { HOOKS.bellEnlist(txn); enlisted = true }
    /* (once a command: a posting run at once inside the posting's own command tells from both — the inner pass and the
       outer door — and the gate owes each line once) */
    const env = activeEnvelope()
    let told = env ? TOLD.get(env) : undefined
    if (env && !told) TOLD.set(env, (told = new Set()))
    for (const p of parts) {
      const key = `${pid}|${JSON.stringify(p)}`
      if (told?.has(key)) continue
      if (noticeAccount(pid, acctByApp(p, a) ? null : by, p, today, at)) { wrote++; told?.add(key) }
    }
  }
  if (enlisted) HOOKS.bellEnd()
  return wrote
}
/** AN UNDO OR REDO OF A STEP THAT TOLD HIM (§16 D7′ — R3-O10, R3-F9; the war's shape, leavewar/sync.ts followUpsOwed):
 *  the restore always takes the step's own line away (an Undo) or puts it back (a Redo) by its verified replay. Where he
 *  had READ a line the Undo took away, he is told the opposite — what the Undo changed on his access, worked out over the
 *  rows the restore left against those it found (accessParts, the gate's own body), each line naming (`ref`) the step's
 *  line it answers; unread, it simply went. A Redo puts the step's line back as it was; where he had read the opposite
 *  line, he is told again with a fresh unread one. Run inside the restore, after its rows are back (undo-wire's
 *  `reversed`). `forward` — the step's own changes as it made them. */
export function acctFollowUps(forward: ReadonlyArray<{ collection: string; id: string; op: string; before?: unknown; after?: unknown }>,
  dir: 'undo' | 'redo', read: (pid: string, n: { id: string; at: number }) => boolean): Array<{ to: string; part: AcctPart; ref: string }> {
  const lines = forward.filter(c => c.collection === 'notices' && c.op === 'put' && c.after && (c.after as any).what?.[0]?.k === 'acct').map(c => c.after as any)
  if (!lines.length) return []
  const live = new Set(NOTICES.map(n => n.id))
  const men = new Map<string, string>()   // his pid → the step's line answered
  for (const n of lines) {
    const to = String(n.to)
    if (men.has(to)) continue
    if (dir === 'undo' ? !live.has(n.id) && read(to, n) : live.has(n.id) && NOTICES.some(x => x.ref === n.id && String(x.to) === to && read(to, x))) men.set(to, String(n.id))
  }
  if (!men.size) return []
  /* the restore's before: the rows and accounts as the step left them (an Undo) or found them (a Redo) */
  const side = dir === 'undo' ? 'after' : 'before'
  const rowsB = dir === 'undo' ? unitRowsAfter(forward) : unitRowsBefore(forward)
  const acctB = new Map(ACCOUNTS_LIST.map(a => [a.id, a as Account | null]))
  for (const c of forward) {
    if (c.collection !== 'settings' || !String(c.id).startsWith(ACCOUNT_PFX)) continue
    const v: any = side === 'after' ? (c.op === 'delete' ? null : c.after) : c.before
    acctB.set(String(c.id).slice(ACCOUNT_PFX.length), v ? (v as Account) : null)
  }
  const rows = unitRows(), today = todayIso(), out: Array<{ to: string; part: AcctPart; ref: string }> = []
  for (const a of ACCOUNTS_LIST) {
    const ref = men.get(String(a.pid))
    if (!ref) continue
    for (const p of accessParts(accessIn(acctB.get(a.id), rowsB, today), accessIn(a, rows, today))) out.push({ to: String(a.pid), part: p, ref })
  }
  return out
}
/** THE MOVES THAT HAVE TAKEN EFFECT, not yet told (D11, D11′): every account whose squadron changed on a day up to today,
 *  within the last month (a move older than that is past telling — demo data, D56), each line its fixed id. */
export const MOVES_TOLD_DAYS = 31
export function movesOwed(today: string = todayIso()): Array<{ to: string; part: AcctPart; day: string; id: string }> {
  const rows = unitRows(), out: Array<{ to: string; part: AcctPart; day: string; id: string }> = []
  const have = new Set(NOTICES.map(n => n.id))
  for (const a of ACCOUNTS_LIST) {
    const pid = String(a.pid)
    const x: any = (PEOPLE as any)[pid]
    if (!x || x.deleted || x.special) continue
    for (const d of homeChangesOn(pid, addDays(today, -MOVES_TOLD_DAYS), today)) {
      for (const p of movedParts(accessIn(a, rows, addDays(d, -1)), accessIn(a, rows, d))) {
        const id = movedLineId(a.id, d, p)
        if (!have.has(id)) out.push({ to: pid, part: p, day: d, id })
      }
    }
  }
  return out
}
/** the app's own writer: the owed moves told, in a command of its own out of band (`account.told` — never part of the
 *  step of whoever's load woke it, undo/timeline.ts); installed by leavewar/sync.ts, which runs it at sign-in and at the
 *  midnight wake beside the posting pass. Writes nothing where nothing is owed. */
export function writeMoveLines(commit: (type: string, apply: (txn: any) => void) => unknown, now: number = Date.now()): number {
  const owed = movesOwed()
  if (!owed.length) return 0
  let wrote = 0
  commit('account.told', (txn: any) => {
    HOOKS.bellEnlist(txn)
    for (const o of owed) if (noticeAccount(o.to, null, o.part, o.day, now, o.id)) wrote++
    HOOKS.bellEnd()
  })
  return wrote
}
