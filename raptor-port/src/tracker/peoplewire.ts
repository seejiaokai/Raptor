/* The Raptor side of the people bridge (9 Sep 26, the person → Tracker link).
   This file imports the engine, so it is imported by TrackerPage.tsx ONLY —
   never by anything under tracker/app or tracker/components, which are the
   lazy chunk and must stay free of Raptor's store (tracker.test.tsx guards
   that by reading the sources). It projects PEOPLE into the few fields the
   Tracker's + Add dialog shows and files, and re-projects on every Raptor
   notify; the bridge's own signature guard makes an unrelated notify free. */
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { subscribe } from '../state/store'
import { setPeople, setWhoami, setWhoamiId, setGonePeople } from './people.js'
import { setTrackerAdmin } from './role.js'
import { roleOf } from '../state/perms'

export type TrackerPerson = { id: string; cs: string; seat: string; q: string; sxo: boolean }

/* Who is offered: every non-archived, non-sentinel, non-ground body — the
   people who could be placed on a course. Ground crew are skipped by seat as
   well as by `pers` because seat 'GND' is what every personnel branch reads
   (people.ts). OCU-category first — the trainees are who this dialog is for —
   then pilots before WSOs, then callsign, so the list reads the way the
   squadron's own roster does. */
export function projectForTracker(people: any): TrackerPerson[] {
  const out: TrackerPerson[] = []
  for (const id of Object.keys(people || {})) {
    const p = people[id]
    if (!p || p.archived || p.special || p.pers || p.seat === 'GND') continue
    out.push({ id, cs: String(p.cs || id), seat: String(p.seat || ''), q: p.q || '', sxo: !!p.sxo })
  }
  const seatRank = (s: string) => (s === 'FCP' ? 0 : s === 'RCP' ? 1 : 2)
  out.sort((a, b) =>
    ((a.q === 'OCU' ? 0 : 1) - (b.q === 'OCU' ? 0 : 1))
    || (seatRank(a.seat) - seatRank(b.seat))
    || a.cs.localeCompare(b.cs))
  return out
}

/* The men deleted through Post out (D290's hidden mark — state/person-delete.ts), for the Tracker's D981 */
export function deletedForTracker(people: any): string[] {
  return Object.keys(people || {}).filter(id => !!(people[id] && people[id].deleted))
}

let wired = false
/* Once per page load, from TrackerPage's first mount. Subscribes to Raptor's
   store for the life of the page (the Tracker section is kept mounted once
   visited, so there is nothing to unsubscribe on), pushes the first
   projection at once, and wires whoami for the by-stamp. Idempotent: a second
   mount (logout → login swaps the Shell) must not stack a second subscriber. */
/* Raptor answers 'Unknown' with no session (engine/hooks.ts, state/store.ts);
   the bridge's contract is '' = nobody known, and core.js then OMITS the `by`
   field rather than stamping a mark with a name that names nobody. */
export function whoamiForTracker(): string {
  const v = HOOKS.whoami()
  return v === 'Unknown' ? '' : v
}
/* The signed-in PERSON's id, for the Tracker's per-person place (D376). Nobody ('')
   whenever there is no session: after a logout Raptor's person id falls back to the
   headless default — a real member's id — and a pick written then must never land
   under his name (the plan's red team, Fable F6). A guest or a pending account has
   no person. */
export function whoamiIdForTracker(): string {
  if (HOOKS.whoami() === 'Unknown') return ''
  const v = HOOKS.whoamiId()
  return v ? String(v) : ''
}
/* May the signed-in person change the Tracker's flex settings? (owner D1014 — an admin's alone; the Tracker's one admin
   gate.) Asked of Raptor's one permissions module each time. No session at all is the headless engine (a unit test, the
   boot) — never a person — and it answers yes, as every Tracker question always has for it; the Tracker is not on
   screen without a session. */
export function trackerAdminForTracker(): boolean {
  const w = roleOf()
  return w === null || w === 'admin'
}
export function wireTrackerPeople(): void {
  if (wired) return
  wired = true
  setTrackerAdmin(trackerAdminForTracker)
  setWhoami(whoamiForTracker)
  setWhoamiId(whoamiIdForTracker)
  const push = () => { setPeople(projectForTracker(PEOPLE)); setGonePeople(deletedForTracker(PEOPLE)) }
  subscribe(push)
  push()
}
