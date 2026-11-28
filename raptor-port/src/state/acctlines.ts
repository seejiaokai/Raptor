/* HIS OWN ACCOUNT'S BELL LINES (batch 1's second half, plan §7 item 6, §15 D5, D7, D11, §16 D5′–D7′, D11′ — his D2251:
   "the players should be informed when their account status changes"; D2309 the line's shape; D2319 its words).

   ONE BODY says what a change of a man's access owes: `accessIn` reads his access in force on a day over a set of rows —
   his sign-in on or off, the master mark, his role at home, his View and Plan of every other squadron — and `accessParts`
   compares two of them, part by part. The doors that change access (state/accounts.ts, state/units.ts, the archive and
   the posting commands in leavewar/sync.ts) take `accessWas()` before they write and `tellAccess` after, inside their
   own command; the commit gate (state/perms.ts acctLineViolation) asks the same two of the command's own rows before
   and after, so a line reaches only the man whose access that command changed, in words that match the change exactly.
   An Undo and a Redo are judged the same way over the rows they restore (§16 D7′). A change that takes effect later — a
   move saved today ends his rights from tomorrow — is told when it does, by the app's own writer, writeMoveLines, at the
   first load on or after that day and at the midnight wake (D11, D11′): once, whole, to the squadron's admins as they
   are at the moment it goes out (his D2908). */
import { HOOKS, store } from '../engine/hooks'
import { activeEnvelope } from '../command'
import { PEOPLE } from '../engine/people'
import { addDays } from './flyplan-model'
import { ACCOUNTS_LIST, ACCOUNT_PFX, levelAcct, readAccounts, seedAccounts, adminLineAudience, type Account } from './accounts'
import { me } from './perms'
import { NOTICES, noticeAccount, noticePlanLine, isAcctNotice, isPlanLine, type NoticePart, type AcctChange } from './notices'
import { unitRows, unitRowsBefore, unitRowsAfter, todayIso, homeBefore, levelBefore, grantBefore, homeChangesBefore } from './units'
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
 *  squadrons' order. Plan lowered to View says both: Plan ended, then View given. `why` — the app's own reason for a
 *  right that ended (an archive), said in place of a name. A sign-in re-linked to another man owes nothing: neither man's
 *  access changed as he holds it (the agent's reading, told to him).
 *  MADE A MASTER ADMIN (his D2396 (n), D2400 — the drawing docs/mock/2026-11-24-msq-new-words/img/n1-*.png): each View and
 *  Plan his Save ends is said on a line of its own, "Plan of 149 ended: master admin covers every squadron · Saber",
 *  signed by whoever did it (acctByApp) — until now it told nothing, and his bell's last word on 149 stayed "Given Plan of
 *  149". Written BEFORE the mark's line: the bell lists lines of the same moment last written first, so the mark stands
 *  on top with the squadrons under it in their order, as drawn. Taken off, nothing comes back. */
export function accessParts(b: AccessNow | null, a: AccessNow | null, why?: 'archived'): AcctPart[] {
  if (!b || !a || b.pid !== a.pid) return []
  const out: AcctPart[] = []
  const madeMaster = !b.master && a.master
  if (madeMaster) {
    const num = (u: string): string => a.nums.get(u) ?? b.nums.get(u) ?? ''
    const held = [...b.lv.keys()].filter(u => !a.lv.has(u))
    held.sort((x, y) => num(y).localeCompare(num(x), undefined, { numeric: true }) || (x < y ? 1 : -1))
    for (const u of held) out.push({ k: 'acct', c: b.lv.get(u) === 'admin' ? 'planEnd' : 'viewEnd', u, num: num(u), why: 'master' })
    out.push({ k: 'acct', c: 'master' })
  }
  if (b.master && !a.master) out.push({ k: 'acct', c: 'masterEnd' })
  if (b.home && b.home === a.home && b.admin !== a.admin) {
    out.push(a.admin ? { k: 'acct', c: 'admin', u: a.home!, num: a.nums.get(a.home!) ?? b.nums.get(a.home!) ?? '' } : { k: 'acct', c: 'member' })
  }
  if (b.on !== a.on) out.push({ k: 'acct', c: a.on ? 'on' : 'off' })
  if (!madeMaster) {
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
/* ---- the squadron's own line, beside his (U2 — his D2626: "its admins told on the bell"; D2654 E6, E9l) ---- */
export type PlanPart = Extract<NoticePart, { k: 'sqplan' }>
/** WHICH OF HIS CHANGES OWE HIS SQUADRONS' ADMINS A LINE, from the very parts his own lines are written from — so the
 *  writer and the gate (state/perms.ts planLineViolation) cannot disagree: a Plan given (a View raised to Plan too — the
 *  agent's reading) "given"; a Plan ended or lowered to View "ended"; ended while the same change made him a member of his
 *  own squadron (D2250) "member"; ended by his move "moved", with the squadron he moved to. D2808's four endings — an
 *  archive's or an overseas posting's (`why: 'archived'`), being made a master admin (`why: 'master'`), a delete (no
 *  account after: no parts) — are the next step's (U2L) and owe none today. Each `{ u, part }`: the squadron and its line. */
export function planLinesOf(pid: string, parts: readonly AcctPart[]): Array<{ u: string; part: PlanPart }> {
  const member = parts.some(p => p.c === 'member' && !p.why)
  const out: Array<{ u: string; part: PlanPart }> = []
  for (const p of parts) {
    if (!p.u || (p.c !== 'plan' && p.c !== 'planEnd')) continue
    const num = p.num ?? ''
    if (p.c === 'plan') { out.push({ u: p.u, part: { k: 'sqplan', who: pid, c: 'given', num } }); continue }
    if (p.why === 'moved') { out.push({ u: p.u, part: { k: 'sqplan', who: pid, c: 'moved', num, mv: p.mv ?? '' } }); continue }
    if (p.why) continue
    out.push({ u: p.u, part: { k: 'sqplan', who: pid, c: member ? 'member' : 'ended', num } })
  }
  return out
}
/** the fixed id of a move's line to one reader (D11): a second load, or a second browser, finds it and writes nothing */
export const planMovedLineId = (accountId: string, day: string, u: string, reader: string): string => `sqplan:mv:${accountId}:${day}:${u}:${reader}`

/** WHO SIGNS IT: the person who made the change — but the app, with no name, where the app did it: a right an archive
 *  ended, a move's, and a suspension an Overseas posting made (D2319: "Suspended" with no name). A right the mark ended is
 *  the person's who made him a master admin (D2396 (n): "… · Saber"). */
export const acctByApp = (p: AcctPart, after: Pick<Account, 'offBy'> | null | undefined): boolean =>
  (!!p.why && p.why !== 'master') || (p.c === 'off' && after?.offBy === 'po')
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
/* (the squadron rows as the door found them, kept with what it took: a squadron's Plan line goes to that squadron's admins
   as they stood BEFORE the change — the gate reads the same, perms.ts planLineViolation — so a change can never widen the
   audience it writes to) */
const WAS_ROWS = new WeakMap<object, UnitRows>()
export function accessWas(): AccessWas {
  const rows = unitRows(), today = todayIso()
  const was = new Map(storedAccounts().map(a => [a.id, { now: accessIn(a, rows, today), archived: !!(PEOPLE as any)[String(a.pid)]?.archived }]))
  WAS_ROWS.set(was, rows)
  return was
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
    /* …AND THE SQUADRON'S ADMINS, WHERE HIS PLAN OF IT WAS GIVEN OR ENDED (U2 — D2626, D2654 E6): one line each, to the
       squadron's admin audience as it stood before the change, signed by whoever made it — never to him, nor to the one
       who pressed (notices.ts noticePlanLine) */
    for (const l of planLinesOf(pid, parts)) {
      const key = `sq|${pid}|${l.u}|${l.part.c}`
      if (told?.has(key)) continue
      const audience = adminLineAudience(l.u, today, WAS_ROWS.get(was) ?? rows)
      wrote += noticePlanLine(audience, by != null ? String(by) : null, l.part, l.u, today, at)
      told?.add(key)
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
/** A MOVE'S SQUADRON LINE IS TOLD ONCE (U2 fix round 3, fix 5; round 4, part 2 — his D2908, 28 Nov 26: once, the first
 *  time it is sent, to that squadron's admins as they are at that moment). The pass below rescans the moves of the last
 *  weeks at every wake; rounds 1 to 3 worked out "who was a reader that day" from moments the records keep, and road
 *  after road brought a man in after the day with an old moment. The past day is no longer rebuilt at all: the first
 *  telling that succeeds goes to the squadron's admins of THAT moment (accounts.ts adminLineAudience over today), and
 *  once a move has been told no further reader is ever owed its line. "Told" — a stored bell line of that move: any
 *  squadron line with the move's fixed id less its reader (planMovedLineId), or the mover's own line of that Plan ending
 *  on that day (movedLineId — owed from the very part the squadron's line is, and written by the same `account.told`
 *  command, writeMoveLines; it alone marks a telling at which the squadron had no reader to tell).
 *  ONE body: the writer and the gate (state/perms.ts moveTellingViolation, planLineViolation) both ask moveTellingsOwed
 *  below, which asks this — `notices` is the bell as the caller reads it: live for the writer, as it stood before the
 *  command for the gate. The fixed ids, and the old lines coming back on an Undo of a take-away (D2310), are untouched. */
/* …AND A LINE COUNTS ONLY WHERE IT IS THAT MOVE'S LINE, AS THE WRITER WRITES IT (U2 fix round 4, part 1 — the security,
   Opus and Fable readers' squat): judged on the bare id, an ordinary line a person may write — a member's to the admin
   who filed his leave, an admin's "View of 150 ended" or "Suspended" — saved under a move's fixed id marked that move
   told before it happened, and 149's admins were never told "Plan of 149 ended: he moved to 150". So the stored line
   must be, part for part, what writeMoveLines writes: the squadron's line (notices.ts noticePlanLine) one `sqplan`
   part "moved" about the mover, of that squadron and day, by the app, about no input; the mover's own (noticeAccount)
   one `acct` part "Plan of that squadron ended" by his move, to him, by the app, on that day, its very fixed id. The
   gate refuses a person's line under these ids as well (perms.ts reservedLineIdViolation). `pid` — the mover's person,
   from his account where the caller does not hand it in. */
export function moveTold(accountId: string, day: string, unit: string, notices: ReadonlyArray<{ id?: unknown }>,
  pid: string | null = ACCOUNTS_LIST.find(a => a.id === accountId)?.pid ?? null): boolean {
  if (pid == null) return false
  const who = String(pid)
  const squadron = planMovedLineId(accountId, day, unit, '')
  const own = movedLineId(accountId, day, { k: 'acct', c: 'planEnd', u: unit })
  return notices.some((n: any) => {
    if (!n || typeof n !== 'object' || !Array.isArray(n.what) || n.what.length !== 1) return false
    const id = String(n.id ?? ''), p: any = n.what[0]
    if (!p || typeof p !== 'object' || n.by != null || n.iid !== '' || String(n.day) !== day) return false
    if (id.startsWith(squadron)) return isPlanLine(n) && p.k === 'sqplan' && p.c === 'moved' && String(p.who) === who && n.u === unit
    if (id === own) return isAcctNotice(n) && p.k === 'acct' && p.c === 'planEnd' && p.u === unit && p.why === 'moved' && String(n.to) === who
    return false
  })
}
/** THE MOVES THAT HAVE TAKEN EFFECT, not yet told (D11, D11′; U2 fix round 4, part 2 — his D2908): every account whose
 *  squadron changed on a day up to today, within the last month (30 days old is told, 31 is not — a move older than that
 *  is past telling), ONE GROUP an account and move day:
 *  - `own` — the mover's own lines (movedParts: each View and Plan the move ended, an admin joining as a member), each
 *    its fixed id, less any already on the bell;
 *  - `sq` — for each Plan the move ended, "Plan of 149 ended: he moved to 150" to each of that squadron's admins AS THEY
 *    ARE TODAY (accounts.ts adminLineAudience over `today` — the moment it goes out, never the move day), the man himself
 *    out of it; nothing for a move already told (moveTold); and nothing to a reader whose fixed id already stands on
 *    the bell — the writer skips an id already there (notices.ts noticePlanLine), so a line squatting one reader's id
 *    (which moveTold rightly does not count as "told") would otherwise stay owed, never be written, and the gate's
 *    "whole" would refuse the app's own command every day of the month.
 *  A deleted man or a placeholder is owed nothing (notices.ts noticeAccount writes him none); an ARCHIVED mover is owed
 *  his own lines. "No reader" is `sq` empty, never the audience empty.
 *  ONE BODY, asked by the writer (writeMoveLines: the live bell and rows) and by the gate (state/perms.ts
 *  moveTellingViolation: the bell as it stood before the command, the rows as it leaves them), so the two cannot
 *  disagree about what a move owes or who is told. */
export const MOVES_TOLD_DAYS = 31
export interface MoveTelling {
  account: string
  pid: string
  day: string
  own: Array<{ to: string; part: AcctPart; day: string; id: string }>
  sq: Array<{ to: string; u: string; part: PlanPart; day: string; id: string }>
}
export function moveTellingsOwed(today: string, notices: ReadonlyArray<{ id?: unknown }>, rows: UnitRows): MoveTelling[] {
  const out: MoveTelling[] = []
  const have = new Set(notices.map(n => String(n?.id ?? '')))
  for (const a of ACCOUNTS_LIST) {
    const pid = String(a.pid)
    const x: any = (PEOPLE as any)[pid]
    if (!x || x.deleted || x.special) continue
    for (const d of homeChangesBefore(pid, addDays(today, -MOVES_TOLD_DAYS), today, rows)) {
      const g: MoveTelling = { account: a.id, pid, day: d, own: [], sq: [] }
      const parts = movedParts(accessIn(a, rows, addDays(d, -1)), accessIn(a, rows, d))
      for (const p of parts) {
        const id = movedLineId(a.id, d, p)
        if (!have.has(id)) g.own.push({ to: pid, part: p, day: d, id })
      }
      for (const l of planLinesOf(pid, parts)) {
        /* (told once — U2 fix round 3, fix 5: a line of this move stored already, and no further reader is owed it) */
        if (moveTold(a.id, d, l.u, notices, pid)) continue
        for (const to of adminLineAudience(l.u, today, rows)) {
          const id = planMovedLineId(a.id, d, l.u, to)
          if (to !== pid && !have.has(id)) g.sq.push({ to, u: l.u, part: l.part, day: d, id })
        }
      }
      if (g.own.length || g.sq.length) out.push(g)
    }
  }
  return out
}
/** the movers' own lines owed, and the squadrons' admins' — thin readers of the one body over the live bell and rows */
export function movesOwed(today: string = todayIso()): MoveTelling['own'] {
  return moveTellingsOwed(today, NOTICES, unitRows()).flatMap(g => g.own)
}
export function planMovesOwed(today: string = todayIso()): MoveTelling['sq'] {
  return moveTellingsOwed(today, NOTICES, unitRows()).flatMap(g => g.sq)
}
/** the app's own writer: the owed moves told, ONE COMMAND A MOVE, each out of band (`account.told` — never part of the
 *  step of whoever's load woke it, undo/timeline.ts); run by leavewar/sync.ts runMoveLines — at boot, at the midnight
 *  wake and on the page shown on a new day — which holds the mark of a move refused today (`skip`, `done`). A move is
 *  told whole — every line the mover is owed and every reader's — or not at all (the gate holds it), so one move's
 *  refusal rolls back exactly that move and never holds back another's. Each move's lines are worked out again just
 *  before its own command, and again inside it (a queued command runs later): a pass woken by one of its own commands
 *  never sends a move already written. `account` — that account's moves only (tellMovesFirst). Writes nothing where
 *  nothing is owed. */
export interface MoveLinesOpts {
  now?: number
  account?: string
  skip?: (g: MoveTelling) => boolean
  done?: (g: MoveTelling, res: unknown) => void
}
export function writeMoveLines(commit: (type: string, apply: (txn: any) => void) => unknown, opts: MoveLinesOpts = {}): number {
  const mine = (g: MoveTelling): boolean => (opts.account === undefined || g.account === opts.account) && !opts.skip?.(g)
  const fresh = (account: string, day: string): MoveTelling | undefined =>
    moveTellingsOwed(todayIso(), NOTICES, unitRows()).find(g => g.account === account && g.day === day && mine(g))
  let wrote = 0
  for (const first of moveTellingsOwed(todayIso(), NOTICES, unitRows()).filter(mine)) {
    const due = fresh(first.account, first.day)
    if (!due) continue
    const res = commit('account.told', (txn: any) => {
      const g = fresh(first.account, first.day)
      if (!g) return
      const now = opts.now ?? Date.now()
      HOOKS.bellEnlist(txn)
      for (const o of g.own) if (noticeAccount(o.to, null, o.part, o.day, now, o.id)) wrote++
      /* (…and the squadrons' admins told of a Plan his move ended — U2, unsigned: the app ended it) */
      for (const o of g.sq) wrote += noticePlanLine([o.to], null, o.part, o.u, o.day, now, () => o.id)
      HOOKS.bellEnd()
    })
    opts.done?.(due, res)
  }
  return wrote
}
/** AN ACCOUNT'S OWN DUE MOVES ARE TOLD BEFORE A DOOR CHANGES OR REMOVES IT (U2 fix round 4, part 2 — plan v3 §5). What a
 *  move ended is read from the mover's account and right rows as they stand, so a change to them before the first
 *  telling loses the debt: a role change loses his own "Made a member: you moved to 150"; a re-link of his sign-in, or
 *  his account or person deleted, loses the whole telling. So each door that changes or removes an account calls this
 *  first — at its top level, before its own snapshot (accessWas) and its commit, outside any command (inside one the
 *  pass can only wait, which is too late): accounts.ts updateAccount and saveAccess, person-delete.ts deletePerson, and
 *  every Undo and Redo (undo/timeline.ts, with no account named). Keyed on the account being CHANGED: making another
 *  man an admin tells nothing first. The pass is leavewar/sync.ts runMoveLines, installed by its wiring; a move the
 *  pass was refused today is not sent again (the limit the plan names: the change then loses what it destroys). */
let TELL_FIRST: ((account?: string) => void) | null = null
export function setTellMovesFirst(fn: ((account?: string) => void) | null): void { TELL_FIRST = fn }
export function tellMovesFirst(account?: string): void { if (TELL_FIRST) TELL_FIRST(account) }
