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
   structural divergences for the tests themselves to handle.

   The push is filtered through inputFlags (owner, Aug 26): the port's
   validator no longer sees an un-actioned personal input, and the reference
   has no accept gate of its own, so it must be fed only what the port's
   validator would see or its warnings diverge. filter() preserves order, so
   day.input still compares byte-for-byte. */
import { readFileSync } from 'node:fs'
import { JSDOM, VirtualConsole } from 'jsdom'
import { INPUTS, inputFlags } from '../engine/inputs'

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
    + JSON.stringify(JSON.stringify(INPUTS.filter(inputFlags))) + '))')
}

/* One divergence the sync CANNOT close: the reference's `isOffer` is a `const`,
   so it cannot be patched out, and the reference still treats "Fly" as an offer
   that clashes with nothing. The inputFlags filter shrinks the exposure — an
   UN-ACTIONED Fly input no longer reaches either engine — but a Fly input
   filed under Unavailable ('u') would pass the filter and the engines really
   would disagree (the port clashes it, the reference exempts it). The seed
   accepts nothing, so this stays invisible; if a future seed does that, the
   parity tests go red here, correctly, and the seed needs re-thinking. */
