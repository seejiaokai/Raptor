/* WHAT EACH PERSON HAS READ OF HIS BELL'S NOTICES ([ALL-AVAIL-AS-MEMBER] step 7, 12 Oct 26 — the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.10, "READ IS ITS OWN RECORD, NEVER A WRITE TO THE NOTICE";
   Fable F9; owner D148, D769).

   A notice (state/notices.ts) is part of the step that made it. If reading it rewrote it, the maker's Undo of his change
   would be refused — "Ranger changed this after your action" — the fault docs/undo-contract.md §5 names for every seen
   mark. So what a person has read is HIS OWN record, and the notice is never touched:

     `settings/noticeseen:<pid>` = { upto: <ms>, ids: <notice id>[] }

   `ids` — the notices he has read, by id: one for a tap on a line, every one of his for "Mark all read". `upto` — a
   floor under them: every notice made at or before it is read. Nothing in this build moves it (it stays 0); it is the
   database step's, for when a retention sweep clears old notices and their ids with them (`[NOTICE-RETENTION]`).
   WHY "MARK ALL READ" DOES NOT SIMPLY MOVE THE FLOOR TO HIS NEWEST: a notice is part of its maker's step, and a Redo puts
   it back as it was — with its first time. Under a floor moved since, that notice came back already "read", and the man
   was never told (found by the older tests re-expressed, 12 Oct 26). Read is by id, so what comes back is new to him. The same shape and the same door as the change history's own "seen"
   (state/changes.ts — one row a person, D170): ONE command, `notices.seen`, which may write only the signed-in person's
   own row (state/perms.ts, docs/data-model.md §11 — together, D200) and is never an Undo step (undo/timeline.ts
   NOT_STEPS).

   The plan's letter has `noticeseen/<person>` as a collection of its own; it is a row of the settings collection
   instead, as every other per-person seen record is — the same one-record-a-person, with no new kind of store. */
import { store } from '../engine/hooks'
import { me } from './perms'
import { commitSettingsIntent } from './people-settings-commit'
import { NOTICES, noticeLive, type Notice } from './notices'

export const NOTICESEEN_PFX = 'noticeseen:'
export const NOTICE_TYPES = ['notices.seen'] as const

type Seen = { upto: number; ids: string[] }
let SEEN: Record<string, Seen> = {}

function readSeen(v: any): Seen | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  return { upto: Number.isFinite(v.upto) ? +v.upto : 0, ids: Array.isArray(v.ids) ? [...new Set<string>(v.ids.filter((s: any) => typeof s === 'string' && s))] : [] }
}

/* a settings loader: runs at boot and inside every settings rollback, so it NEVER writes */
export function noticeSeenLoad(): void {
  const out: Record<string, Seen> = {}
  for (const k of store.keys(NOTICESEEN_PFX)) {
    const pid = k.slice(NOTICESEEN_PFX.length)
    const s = pid ? readSeen(store.get(k, null)) : null
    if (s) out[pid] = s
  }
  SEEN = out
}

/** is this notice unread by the person it is addressed to? (`pid` — the person signed in) */
export function isUnread(n: Notice, pid: string | null = me()): boolean {
  if (!pid || n.to !== pid) return false
  /* a holiday's line with nothing left to answer is not listed, so it is not unread either — it must never light a
     bell whose list would then be empty ([OIL-ASK-NOTIFY]; state/notices.ts noticeLive — the one body) */
  if (!noticeLive(n)) return false
  const s = SEEN[pid]
  return !s || (n.at > s.upto && !s.ids.includes(n.id))
}
/** how many of his notices he has not read — what lights the bell */
export function unreadFor(pid: string | null = me()): number {
  if (!pid) return 0
  let n = 0
  for (const x of NOTICES) if (isUnread(x, pid)) n++
  return n
}

function write(pid: string, next: Seen): boolean {
  const res = commitSettingsIntent('notices.seen', { owner: pid }, () => { store.set(NOTICESEEN_PFX + pid, next) })
  if (!(res as any).ok) { noticeSeenLoad(); return false }
  SEEN = { ...SEEN, [pid]: next }
  return true
}
/** a tap on a line: that one notice is read. True when it wrote; false when it was read already, or is not his. */
export function markNoticeRead(id: string): boolean {
  const pid = me()
  const n = pid ? NOTICES.find(x => x.id === id && x.to === pid) : null
  if (!pid || !n || !isUnread(n, pid)) return false
  const cur = SEEN[pid] || { upto: 0, ids: [] }
  /* an id whose notice is gone (its maker's Undo took it) can never be listed again — it leaves the record here */
  const live = new Set(NOTICES.filter(x => x.to === pid && x.at > cur.upto).map(x => x.id))
  return write(pid, { upto: cur.upto, ids: [...new Set([...cur.ids, id])].filter(x => live.has(x)).sort() })
}
/** "Mark all read" — everything addressed to the person signed in, each by its id */
export function markAllNoticesRead(): boolean {
  const pid = me()
  if (!pid || !unreadFor(pid)) return false
  const cur = SEEN[pid] || { upto: 0, ids: [] }
  return write(pid, { upto: cur.upto, ids: NOTICES.filter(x => x.to === pid && x.at > cur.upto).map(x => x.id).sort() })
}
