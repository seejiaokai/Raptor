import { HOOKS } from '../engine/hooks'
import { SESSION } from './auth'

/* BUG REPORTS (owner, 25 Aug 26 — "a new tab called Help, inside it allows
   anyone to type in Bug reports. In which admin can view them"). A flat
   session array, DATA not view state: it is deliberately NOT cleared by
   resetSession, so a member can file, log out, and the admin who logs in
   next still finds the report and a lit bell — the closest a one-browser
   prototype gets to "anyone files, the admin sees". Not in the undo
   snapshot either (filing a report is not a schedule edit), and reports
   never expire on a week change. DB-era: this array becomes a table and
   fileReport an insert; the shape below is already the row a realtime
   backend would push, which is why `who` comes through HOOKS.whoami — the
   day accounts become real, reports start naming people with no change
   here (the same seam the edit log rides). */

export type BugReport = {
  id: string
  t: number        // wall clock at filing — the list's date column
  who: string      // display name, from HOOKS.whoami()
  cat: string      // one of BUG_CATS, chosen by the filer
  text: string
  seen: boolean    // has an admin viewed it yet — the bell reads this
}

/* The categories a filer picks from (owner, 25 Aug 26 — "come up with
   categories for the users to select so that when the admin views it, they
   know it's what category"). One per surface a report is usually about,
   plus the cross-cutting three at the end. Adding one is one string here —
   the picker, the chips and the tests all read this list. */
export const BUG_CATS = [
  'Schedule board',
  'Inputs & calendar',
  'Quals',
  'Leave War',
  'Warnings & checks',
  'Display & layout',
  'Speed & loading',
  'Something else',
]

export const REPORTS: BugReport[] = []

let rid = 0
/* File one report. ANYONE logged in may file (no role gate — that is the
   point of the page); the guards are honesty guards: a blank description
   or an unknown category files nothing, and the caller toasts. */
export function fileReport(cat: string, text: string): BugReport | null {
  if (!SESSION) return null
  const tx = String(text || '').trim()
  if (!tx || !BUG_CATS.includes(cat)) return null
  const r: BugReport = { id: 'bug' + (++rid), t: Date.now(), who: HOOKS.whoami(), cat, text: tx, seen: false }
  REPORTS.push(r)
  return r
}

/* newest first — the owner's ordering ("sorted accordingly to latest input
   then oldest"). A copy, so no caller can sort the live array. */
export function reportRows(): BugReport[] {
  return REPORTS.slice().sort((a, b) => b.t - a.t)
}

export function unseenReports(): number {
  return REPORTS.reduce((n, r) => n + (r.seen ? 0 : 1), 0)
}

/* the admin OPENING the Help page is the acknowledgement — not tapping the
   bell (the bell only points there). Called by HelpPage's admin view after
   it has captured which rows to badge as new. */
export function markReportsSeen() {
  REPORTS.forEach(r => { r.seen = true })
}

/* what lights the top-bar bell for bug reports: an ADMIN with unseen
   reports, whatever page they are on. Members' bells are untouched — they
   filed the report, they don't need telling about it. Composed with the
   per-view bellLit() in the shell, never replacing it. */
export function bugAlert(): boolean {
  return !!(SESSION && SESSION.role === 'admin') && unseenReports() > 0
}
