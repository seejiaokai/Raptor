/* WHO PLACED AN ENTRY, AND WHEN — the one small-print line (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.8; owner D629, 7 Oct 26: "Can u also show who placed
   that input at what time and day? A small one.").

   The record carries the four facts (state/inputstamp.ts writes them at every door that makes or changes an input):
   `by` / `at` — who filed it and when; `modBy` / `modAt` — its last change. This turns them into the line, ONE body for
   every place an entry is listed or opened (the SANS calendar's opened day first; the Inputs calendar's opened day, the
   List, the editor's foot, a Medical card and the document viewer take the same line with step 5) — never the month's
   own cells, which have no room (D629's reading 1).

     Placed by Saber · 7 Oct 26, 14:32
     Placed by Saber for Wisp · 7 Oct 26, 14:32                         the filer is not the person it is for
     Placed by Saber · 7 Oct 26, 14:32 · changed by Ranger · 8 Oct 26, 09:10

   A record that never recorded who placed it shows NO line (D56: what was saved before the stamps existed is demo
   data — it is not guessed at). A change the app made by itself (a posting that ran on its date) has a time and no
   name. The day and time are the reader's own clock's — the moment is stored once, as a moment. */
import { PEOPLE } from '../engine/people'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const two = (n: number) => String(n).padStart(2, '0')
/** a stored moment as "7 Oct 26, 14:32"; '' for anything that is not one */
export function stampText(ms: unknown): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return ''
  const d = new Date(ms)
  return `${d.getDate()} ${MON[d.getMonth()]} ${two(d.getFullYear() % 100)}, ${two(d.getHours())}:${two(d.getMinutes())}`
}
/* a callsign, never a code: someone since taken off the roster is still on record underneath (D290) and keeps his
   name; an id nothing knows is said in words */
const nameOf = (id: unknown, people: Record<string, any>): string => {
  const p = id == null ? null : people[String(id)]
  return p && p.cs ? String(p.cs) : 'someone no longer listed'
}

export function placedLine(r: any, people: Record<string, any> = PEOPLE): string {
  if (!r || r.by == null || r.by === '') return ''
  const when = stampText(r.at)
  if (!when) return ''
  const forWhom = r.person != null && String(r.person) !== String(r.by) ? ` for ${nameOf(r.person, people)}` : ''
  let out = `Placed by ${nameOf(r.by, people)}${forWhom} · ${when}`
  const changed = stampText(r.modAt)
  /* a record as it was filed says its last change is the filing itself — one fact, said once */
  if (changed && (r.modAt !== r.at || (r.modBy != null && String(r.modBy) !== String(r.by)))) {
    out += r.modBy != null && r.modBy !== '' ? ` · changed by ${nameOf(r.modBy, people)} · ${changed}` : ` · changed ${changed}`
  }
  return out
}

/** THE LINE FOR A SHARED INPUT (owner D655, D629 — "Placed by Saber for 4 people · 7 Oct 26, 14:32"): who filed the
 *  entry, for how many, and when — one line for the whole of it. Its filer is the entry's own (`grpBy`), else whoever
 *  placed its first record; the moment is the earliest any of its records was placed; its last change is the latest
 *  any of them carries. One record is the ordinary line. */
export function placedLineOf(rows: readonly any[], people: Record<string, any> = PEOPLE): string {
  const list = (rows || []).filter(Boolean)
  if (list.length < 2) return list.length ? placedLine(list[0], people) : ''
  const stamped = list.filter(r => r.by != null && r.by !== '' && stampText(r.at))
  if (!stamped.length) return ''
  const withFiler = stamped.find(r => r.grpBy != null && r.grpBy !== '')
  const filer = withFiler ? withFiler.grpBy : stamped[0].by
  let out = `Placed by ${nameOf(filer, people)} for ${list.length} people · ${stampText(Math.min(...stamped.map(r => r.at)))}`
  const changed = stamped
    .filter(r => stampText(r.modAt) && (r.modAt !== r.at || (r.modBy != null && String(r.modBy) !== String(r.by))))
    .sort((a, b) => b.modAt - a.modAt)[0]
  if (changed) out += changed.modBy != null && changed.modBy !== '' ? ` · changed by ${nameOf(changed.modBy, people)} · ${stampText(changed.modAt)}` : ` · changed ${stampText(changed.modAt)}`
  return out
}
