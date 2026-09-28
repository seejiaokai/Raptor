/* NEW TO YOU — each person's own "seen" for the change history ([DRAFT-PENDING], 28 Sep 26).

   Owner, D170 (25 Sep 26): "a change made by someone else shows as new to you (a gold dot, NEW, the 'N new' count)
   until you press 'Mark all as seen' in the changes window, which affects only your own view" — like unread email; and
   (the agent's reading, uncorrected) a member's "Mark all as seen" is his own too. The history itself is the squadron's
   (engine/editlog.ts — durable, D336 (b)); what is NEW is per person, and lives here:

     `changeseen` = { [personId]: { upto, extra } }

   `upto` — every line numbered up to it is seen; `extra` — lines above it marked seen one by one (the window marks
   exactly what it LISTED: a day, or the week). Marking folds `extra` into `upto` wherever every line up to a point is
   seen, yours, or has no person, so the record stays small however long the history grows.

   Written by ONE command, `changes.seen` — the `access.seen` precedent (the admins' bell, D216/D227) — which may touch
   only the signed-in person's OWN entry: perms.ts (`EditLogSeen`, own row) and data-model.md §11, together.
   A line is never new to its own author, never new when no person made it (a boot or reconciler line), and nothing is
   new to someone signed in without a person (a guest, a request waiting, nobody). */
import { store } from '../engine/hooks'
import { ELOG, type ELogRow } from '../engine/editlog'
import { me } from './perms'
import { commitSettingsIntent } from './people-settings-commit'
import { ACCOUNTS_LIST } from './accounts'

const seenFromOf = (pid: string): number | null => {
  const a = ACCOUNTS_LIST.find(x => x.pid === pid)
  return a && Number.isFinite(a.seenFrom) ? (a.seenFrom as number) : null
}

export const CHANGES_TYPES = ['changes.seen'] as const

type Seen = { upto: number; extra: number[] }
let SEEN: Record<string, Seen> = {}
/* bumps on every load and mark — the week's per-viewer marks (the chips, the OG tag) memoise on it with the log's
   length, so a render never re-derives what has not changed */
export let SEEN_VER = 0

/* a settings loader: runs at boot and inside every settings rollback, so it NEVER writes */
export function changesLoad(): void {
  const raw = store.get('changeseen', null)
  const out: Record<string, Seen> = {}
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [pid, v] of Object.entries(raw as Record<string, any>)) {
      if (!pid || !v || typeof v !== 'object') continue
      const upto = Number.isFinite(v.upto) ? Math.max(0, +v.upto) : 0
      const extra = Array.isArray(v.extra) ? [...new Set<number>(v.extra.filter((n: any) => Number.isFinite(n) && n > upto))].sort((a, b) => a - b) : []
      out[pid] = { upto, extra }
    }
  }
  SEEN = out
  SEEN_VER++
}

/* is this line new to the person signed in (or to `pid`)? */
export function isNewToMe(r: ELogRow, pid: string | null = me()): boolean {
  if (!pid || !r.pid || r.pid === pid) return false
  const s = SEEN[pid]
  /* no seen record yet: someone given access after the history began starts with nothing new (his account's
     `seenFrom`, Fable F6); a seeded account has none and reads every other person's line as new */
  if (!s) { const from = seenFromOf(pid); return from == null || r.seq >= from }
  return r.seq > s.upto && !s.extra.includes(r.seq)
}

/* "Mark all as seen" — the lines the window listed, for the person signed in. ONE command; true when it wrote, false
   when there was nothing to mark or nobody to mark it for (a refusal reads false too — the window greys its button
   whenever nothing is new, so a refusal is never a tap the person could make). */
export function markSeen(rows: readonly ELogRow[]): boolean {
  const pid = me()
  if (!pid) return false
  const seqs = rows.filter(r => isNewToMe(r, pid)).map(r => r.seq)
  if (!seqs.length) return false
  const from = seenFromOf(pid)
  const cur = SEEN[pid] || { upto: from != null ? Math.max(0, from - 1) : 0, extra: [] }
  const extra = new Set<number>([...cur.extra, ...seqs])
  let upto = cur.upto
  for (const r of ELOG.rows) {                        // the log is kept in number order
    if (r.seq <= upto) continue
    if (extra.has(r.seq) || !r.pid || r.pid === pid) upto = r.seq
    else break
  }
  const next: Record<string, Seen> = { ...SEEN, [pid]: { upto, extra: [...extra].filter(q => q > upto).sort((a, b) => a - b) } }
  const res = commitSettingsIntent('changes.seen', { owner: pid }, () => { store.set('changeseen', next) })
  if (!(res as any).ok) { changesLoad(); return false }
  SEEN = next
  SEEN_VER++
  return true
}
