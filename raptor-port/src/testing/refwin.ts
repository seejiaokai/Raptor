/* Booting the untouched reference app in jsdom, for the parity tests.
   NOT a test file itself — vitest fails a *.test.ts that declares no tests, so
   this deliberately sits outside that glob. Nothing in the app imports it, so
   it never reaches a bundle.

   The reference is the read-only spec for existing behaviour, and the parity
   tests byte-compare against it. Where the port has deliberately diverged, the
   house idiom is to excise the divergence from BOTH strings and pin it
   positively — never to weaken the comparison.

   This helper removes one whole class of divergence at the source. The seed
   INPUTS no longer match: the port dropped "Office" / "Available fly" /
   "Available duty" and gained "Detachment" (owner decision, Aug 26). Rather
   than excising every row those types touch, push the port's INPUTS into the
   reference so both engines compute from IDENTICAL input data, leaving only the
   structural divergences for the tests themselves to handle. */
import { readFileSync } from 'node:fs'
import { JSDOM, VirtualConsole } from 'jsdom'
import { INPUTS } from '../engine/inputs'

export async function refWindow(): Promise<any> {
  const html = readFileSync('reference/scheduler.html', 'utf8')
  const vc = new VirtualConsole()
  vc.on('jsdomError', () => {})
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', virtualConsole: vc, pretendToBeVisual: true })
  const w: any = dom.window
  w.URL.createObjectURL = () => 'blob:x'
  w.HTMLElement.prototype.scrollIntoView = () => {}
  await new Promise(r => setTimeout(r, 300))
  syncInputs(w)
  w.eval('validate()')
  return w
}

/* `w.INPUTS = [...]` does NOT work. The reference declares `let INPUTS` at the
   top level of a classic script, which is a global LEXICAL binding, not a
   property of window — assigning to w.INPUTS just creates a shadowing property
   the page never reads. An indirect eval resolves the real binding.

   Mutated in place rather than reassigned, because the reference's own history
   restore does `INPUTS.length=0; …push(…)` and holds references to the array. */
export function syncInputs(w: any) {
  w.eval('INPUTS.length=0;INPUTS.push.apply(INPUTS,JSON.parse('
    + JSON.stringify(JSON.stringify(INPUTS)) + '))')
}

/* One divergence the sync CANNOT close: the reference's `isOffer` is a `const`,
   so it cannot be patched out, and the reference still treats "Fly" as an offer
   that clashes with nothing. Verified invisible on this seed for two
   independent reasons — bruise has no fly legs on the day he holds a Fly input,
   and his row is all-day (e-s === 1439), which the brief/debrief pass excludes
   either way. If a future seed hands an offer-typed input to somebody who
   flies, the parity tests will go red here. That is correct: the two builds
   really would disagree, and the seed would need re-thinking. */
