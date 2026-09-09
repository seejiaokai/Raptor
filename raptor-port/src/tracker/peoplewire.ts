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
import { setPeople, setWhoami } from './people.js'

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

let wired = false
/* Once per page load, from TrackerPage's first mount. Subscribes to Raptor's
   store for the life of the page (the Tracker section is kept mounted once
   visited, so there is nothing to unsubscribe on), pushes the first
   projection at once, and wires whoami for the by-stamp. Idempotent: a second
   mount (logout → login swaps the Shell) must not stack a second subscriber. */
export function wireTrackerPeople(): void {
  if (wired) return
  wired = true
  setWhoami(() => HOOKS.whoami())
  const push = () => setPeople(projectForTracker(PEOPLE))
  subscribe(push)
  push()
}
