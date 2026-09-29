// src/leavewar/state/rows.ts
/* THE LEAVE WAR, ONE ROW PER RECORD ([DB-READINESS] group A, phase 3 — plan §2.5, §2.9, §8 P3-CELL-DIFF).

   The war used to save itself as a handful of big records rewritten whole by every edit — every war with every bid in
   one (`wars`), every opening balance in one, the whole ledger in one, every posting window in one — so two people
   bidding at once overwrote each other. Now each thing is the row of its table in the design (data-model.md §5):

     war:<warId>                 LeaveWar — the period (its days, bands, stage, bidding window; `ord`, its place)
     rec:<warId>:<recId>         LeaveBid — one of the war's own records (a bid, an earned credit, a notice), with its
                                 person, its date and its place at that address (`ord`)
     ledger:<id>                 LeaveLedger — one entry
     opening:<pid>:<counter>     LeaveOpening — one opening balance
     profile:<pid>               LeavePersonProfile — his posting window (`post`, the app's frozen copy of him with the
                                 window on it) and his personnel label (`label`)
     current, oilpolicy and the ⚙ keys (eventdefs, figorder, …)   Setting — unchanged, one key each

   The rows are written FROM THE COMMAND STREAM, like the scheduler's (state/rowmap.ts): the war's store subscribes to
   every command and writes, through its own storage door (state/storage.ts — the war keeps its own seam), exactly the
   rows that command's changes land in, inside the command's one saved group. `lwRows` is that mapping, pure.

   The command layer keeps the war's records at the grain its undo reads — one record per person/date holding the LIST
   there (`lw.cell`) — so the mapping works at the ENVELOPE (P3-CELL-DIFF): every changed address's list before and
   after is spread into its records keyed by (war, record); a record present after and different → one put; present
   only before → one remove; unchanged → nothing. A MOVE (a record leaving one address for another in the same command)
   is therefore exactly one put, carrying its new person and date. And a row is removed only for a record THIS command
   removed: a stale client that still holds a record someone else deleted never writes it back, because that record is
   unchanged in its own before and after. */
import type { Change } from '../../command'
import type { Person } from '../engine'

export const WAR = 'war:'
export const REC = 'rec:'
export const LEDGER = 'ledger:'
export const OPENING = 'opening:'
export const PROFILE = 'profile:'
export const warKey = (warId: string): string => WAR + warId
export const recKey = (warId: string, recId: string): string => `${REC}${warId}:${recId}`
export const ledgerKey = (id: string): string => LEDGER + id
export const openingKey = (pid: string, counter: string): string => `${OPENING}${pid}:${counter}`
export const profileKey = (pid: string): string => PROFILE + pid

/* a key's two parts, the second from the RIGHT (a war id or a person id may one day carry ':'; a record id and a
   counter never do) */
function splitRight(rest: string): [string, string] | null {
  const i = rest.lastIndexOf(':')
  return i > 0 && i < rest.length - 1 ? [rest.slice(0, i), rest.slice(i + 1)] : null
}
export function parseRecKey(k: string): { warId: string; recId: string } | null {
  if (!k.startsWith(REC)) return null
  const p = splitRight(k.slice(REC.length))
  return p && { warId: p[0], recId: p[1] }
}
export function parseOpeningKey(k: string): { pid: string; counter: string } | null {
  if (!k.startsWith(OPENING)) return null
  const p = splitRight(k.slice(OPENING.length))
  return p && { pid: p[0], counter: p[1] }
}
/** an `lw.cell` id `<warId>:<pid>:<date>` — the date and the person from the RIGHT */
export function cellParts(id: string): { warId: string; pid: string; date: string } {
  const iDate = id.lastIndexOf(':'); const date = id.slice(iDate + 1)
  const rest = id.slice(0, iDate); const iPid = rest.lastIndexOf(':')
  return { warId: rest.slice(0, iPid), pid: rest.slice(iPid + 1), date }
}

/** The ⚙ settings, one stored key each (unchanged by this phase — plan §2.5, "the settings-like keys stay"): the
 *  field of the war's `lw.config` record and the key it is kept under. */
export const CONFIG_KEYS: ReadonlyArray<readonly [string, string]> = [
  ['eventDefs', 'eventdefs'], ['figureOrder', 'figorder'], ['rosterOrder', 'rosterorder'],
  ['manningOrder', 'manningorder'], ['manningHidden', 'manninghidden'], ['figureHidden', 'fighidden'],
  ['groupDefs', 'groupdefs'], ['groupPriority', 'grouppriority'], ['groupPriorityCustom', 'grouppriocustom'],
  ['groupColors', 'groupcolors'], ['requirements', 'manningdefs'], ['eventRows', 'eventrows'], ['showSans', 'showsans'],
]
/* the squadron's manning rules are kept as the rule list alone (`manningdefs`), as they always were */
const configValue = (field: string, v: any): string => JSON.stringify(field === 'requirements' ? v?.default?.rules : v)

/** the old whole-list records this phase replaces — never written again; the fold removes them */
export const OLD_BLOBS = ['wars', 'openings', 'ledger', 'postouts', 'perslabels', 'personedits'] as const

export type Profile = { post?: Person; label?: string }
/** a profile row's value, or null when it holds nothing (the row then goes) */
export function profileJSON(p: Profile): string | null {
  const o: Profile = {}
  if (p.post) o.post = p.post
  if (p.label) o.label = p.label
  return o.post || o.label ? JSON.stringify(o) : null
}
/** a record row's value: the record, with its person and date */
export const recJSON = (rec: object, pid: string, date: string): string => JSON.stringify({ ...rec, pid, date })

export type LwRow = { key: string; value: string | null }
/** the part of a profile a command did not change, as it now stands */
export interface LwNow { post(pid: string): Person | undefined; label(pid: string): string | undefined }

/** THE ROWS ONE COMMAND'S CHANGES TO THE WAR LAND IN (above). Each row once: a put beats a remove, the later put wins.
 *  Throws on a remove no change of this command answers — a row is never removed by inference. */
export function lwRows(changes: readonly Change[], now: LwNow): LwRow[] {
  const out = new Map<string, string | null>()
  const put = (k: string, v: string) => { out.delete(k); out.set(k, v) }
  const remove = (k: string) => { if (out.get(k) != null) return; out.delete(k); out.set(k, null) }
  const before = new Map<string, string>(), after = new Map<string, string>()
  const profiles = new Map<string, { post?: Change; label?: Change }>()
  for (const c of changes) {
    switch (c.collection) {
      case 'lw.cell': {
        const { warId, pid, date } = cellParts(c.id)
        const spread = (side: Map<string, string>, list: unknown) => {
          if (Array.isArray(list)) for (const r of list) if (r && typeof r === 'object' && typeof (r as any).id === 'string') side.set(recKey(warId, (r as any).id), recJSON(r, pid, date))
        }
        spread(before, c.before)
        if (c.op !== 'delete') spread(after, c.after)
        break
      }
      case 'lw.war': if (c.op === 'delete') remove(warKey(c.id)); else put(warKey(c.id), JSON.stringify(c.after)); break
      case 'lw.ledger': if (c.op === 'delete') remove(ledgerKey(c.id)); else put(ledgerKey(c.id), JSON.stringify(c.after)); break
      case 'lw.opening': if (c.op === 'delete') remove(OPENING + c.id); else put(OPENING + c.id, JSON.stringify(c.after)); break
      case 'lw.postouts': case 'lw.label': {
        let p = profiles.get(c.id)
        if (!p) profiles.set(c.id, p = {})
        if (c.collection === 'lw.label') p.label = c; else p.post = c
        break
      }
      case 'lw.oilpolicy': if (c.op !== 'delete') put('oilpolicy', JSON.stringify(c.after)); break
      /* which war is on screen is recorded as the bare id (never read back at boot — the store's initStore says why) */
      case 'lw.current': if (c.op !== 'delete') put('current', String(c.after)); break
      case 'lw.config': {
        if (c.op === 'delete') break
        const b: any = c.before && typeof c.before === 'object' ? c.before : null, a: any = c.after || {}
        for (const [field, key] of CONFIG_KEYS) {
          if (!(field in a)) continue
          const v = configValue(field, a[field])
          if (!b || configValue(field, b[field]) !== v) put(key, v)
        }
        break
      }
    }
  }
  /* P3-CELL-DIFF — the war's own records, diffed across every address the command touched */
  for (const [k, v] of after) if (before.get(k) !== v) put(k, v)
  for (const k of before.keys()) if (!after.has(k)) remove(k)
  /* a profile row is his window and his label: rebuilt from what the command changed and, for the half it did not,
     what stands now; it goes only when a delete of one half leaves nothing */
  for (const [pid, p] of profiles) {
    const post = p.post ? (p.post.op === 'delete' ? undefined : p.post.after as Person) : now.post(pid)
    const label = p.label ? (p.label.op === 'delete' ? undefined : p.label.after as string) : now.label(pid)
    const v = profileJSON({ post, label })
    if (v !== null) put(profileKey(pid), v)
    else if (p.post?.op === 'delete' || p.label?.op === 'delete') remove(profileKey(pid))
    else throw new Error(`lwRows: ${pid}'s profile would be emptied with no delete to answer`)
  }
  return [...out].map(([key, value]) => ({ key, value }))
}

/** Every row of a whole world — its records as puts, nothing before them. The first boot's seed and the demo world
 *  (store.ts writeWorldRows) and the fold (store.ts leavewarConverter) write these. */
export function allRows(records: Iterable<{ collection: string; id: string; value?: unknown }>, now: LwNow): LwRow[] {
  const puts: Change[] = []
  for (const r of records) puts.push({ op: 'put', collection: r.collection as Change['collection'], id: r.id, after: r.value })
  return lwRows(puts, now)
}
