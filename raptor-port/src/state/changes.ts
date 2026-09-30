/* NEW TO YOU — each person's own "seen" for the change history ([DRAFT-PENDING], 28 Sep 26).

   Owner, D170 (25 Sep 26): "a change made by someone else shows as new to you (a gold dot, NEW, the 'N new' count)
   until you press 'Mark all as seen' in the changes window, which affects only your own view" — like unread email; and
   (the agent's reading, uncorrected) a member's "Mark all as seen" is his own too. The history itself is the squadron's
   (engine/editlog.ts — durable, D336 (b)); what is NEW is per person, and lives here.

   ONE ROW PER PERSON, BY POSITION ([DB-READINESS] group A, phase 4.3 — plan §2.5's matrix, Fable F2-02):

     `settings/seen:<pid>` = { upto: { at, lineId } | null, extra: lineId[] }

   the design's `EditLogSeen` row. Every other person's seen used to share one record (`changeseen`), so two people
   marking at once would each rewrite the other's; and it pointed at line NUMBERS, which were per browser. A line's place
   now is its POSITION in the history's order — (at, lineId), engine/editlog.ts — the same on every client:
   `upto` — every line at or before it is seen; `extra` — lines after it marked seen one by one (the window marks exactly
   what it LISTED: a day, or the week). Marking folds `extra` into `upto` wherever every line up to a point is seen,
   yours, or has no person, so the row stays small however long the history grows.

   Written by ONE command, `changes.seen` — the `access.seen` precedent (the admins' bell, D216/D227) — which may write
   only the signed-in person's OWN row: perms.ts (`EditLogSeen`, own row) and data-model.md §11, together.
   A line is never new to its own author, never new when no person made it (a boot or reconciler line), and nothing is
   new to someone signed in without a person (a guest, a request waiting, nobody). */
import { store } from '../engine/hooks'
import { ELOG, posOf, posCmp, type ELogRow, type LinePos } from '../engine/editlog'
import { me } from './perms'
import { commitSettingsIntent } from './people-settings-commit'
import { ACCOUNTS_LIST } from './accounts'

export const SEEN_PFX = 'seen:'
const isPos = (v: any): v is LinePos => !!v && typeof v === 'object' && Number.isFinite(v.at) && typeof v.lineId === 'string'
/* an account's `seenFrom` — where the history stood when it was made (accounts.ts) */
const seenFromOf = (pid: string): LinePos | null => {
  const a = ACCOUNTS_LIST.find(x => x.pid === pid)
  return a && isPos(a.seenFrom) ? a.seenFrom : null
}

export const CHANGES_TYPES = ['changes.seen'] as const

type Seen = { upto: LinePos | null; extra: string[] }
let SEEN: Record<string, Seen> = {}
/* bumps on every load and mark — the week's per-viewer marks (the chips, the OG tag) memoise on it with the log's
   length, so a render never re-derives what has not changed */
export let SEEN_VER = 0

/* one person's row, read defensively */
function readSeen(v: any): Seen | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const upto = isPos(v.upto) ? { at: +v.upto.at, lineId: v.upto.lineId } : null
  const extra = Array.isArray(v.extra) ? [...new Set<string>(v.extra.filter((s: any) => typeof s === 'string' && s))] : []
  return { upto, extra }
}

/* a settings loader: runs at boot and inside every settings rollback, so it NEVER writes */
export function changesLoad(): void {
  const out: Record<string, Seen> = {}
  for (const k of store.keys(SEEN_PFX)) {
    const pid = k.slice(SEEN_PFX.length)
    const s = pid ? readSeen(store.get(k, null)) : null
    if (s) out[pid] = s
  }
  SEEN = out
  SEEN_VER++
}

const after = (r: ELogRow, p: LinePos) => posCmp(posOf(r), p) > 0

/* is this line new to the person signed in (or to `pid`)? */
export function isNewToMe(r: ELogRow, pid: string | null = me()): boolean {
  if (!pid || !r.pid || r.pid === pid) return false
  const s = SEEN[pid]
  /* no seen row yet: someone given access after the history began starts with nothing new (his account's `seenFrom`,
     Fable F6); a seeded account has none and reads every other person's line as new */
  if (!s) { const from = seenFromOf(pid); return from == null || after(r, from) }
  return (s.upto == null || after(r, s.upto)) && !s.extra.includes(r.lineId)
}

/* "Mark all as seen" — the lines the window listed, for the person signed in. ONE command writing his own row; true when
   it wrote, false when there was nothing to mark or nobody to mark it for (a refusal reads false too — the window greys
   its button whenever nothing is new, so a refusal is never a tap the person could make). */
export function markSeen(rows: readonly ELogRow[]): boolean {
  const pid = me()
  if (!pid) return false
  const ids = rows.filter(r => isNewToMe(r, pid)).map(r => r.lineId)
  if (!ids.length) return false
  const cur: Seen = SEEN[pid] || { upto: seenFromOf(pid), extra: [] }
  const extra = new Set<string>([...cur.extra, ...ids])
  let upto = cur.upto
  for (const r of ELOG.rows) {                        // the log is kept in its order, (at, lineId)
    if (upto && !after(r, upto)) continue
    if (extra.has(r.lineId) || !r.pid || r.pid === pid) upto = posOf(r)
    else break
  }
  /* a line folded into `upto` leaves `extra`; so does one no longer in the loaded history (it can never be listed again) */
  const loaded = new Set(ELOG.rows.filter(r => !upto || after(r, upto)).map(r => r.lineId))
  const next: Seen = { upto, extra: [...extra].filter(id => loaded.has(id)).sort() }
  const res = commitSettingsIntent('changes.seen', { owner: pid }, () => { store.set(SEEN_PFX + pid, next) })
  if (!(res as any).ok) { changesLoad(); return false }
  SEEN = { ...SEEN, [pid]: next }
  SEEN_VER++
  return true
}
