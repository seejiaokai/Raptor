/* THE PEOPLE PICKER'S READINGS — who the picker offers and what is wrong with the people picked (ui/PeoplePick.tsx is the
   picker itself; its account of who may pick whom is there). Moved out of that file whole on the night of 6 Nov 26 (React
   Doctor's only-export-components: a file of components keeps Fast Refresh only when it exports components alone);
   nothing in them changed. */
import { PEOPLE, isSpecial } from '../engine/people'
import { isUpchit, needsDoc, placeholderProblem, shapeProblem } from '../engine/inputs'
import { canEditSched } from '../state/auth'
import { mayFileGroup, mayFileInputFor, me } from '../state/perms'
import { fileForOtherRefusal, rosterOptions } from './inputedit'

export const cs = (id: any): string => (PEOPLE[id] ? String(PEOPLE[id].cs) : String(id ?? ''))
const az = (ids: string[]) => [...ids].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))

/** the people this picker offers: today's list (no archived man, no placeholder puck), SANS people only on the SANS
 *  calendar — a SANS availability is refused for anyone else at the save */
export const pickRoster = (sansOnly?: boolean): string[] =>
  az(rosterOptions().filter(id => !PEOPLE[id].special && (!sansOnly || PEOPLE[id].san)))

/* ---- "ALL AVAIL" AND "ALL" AS A CHOICE ([INPUT-ALL-AVAIL]; owner D700, D702, D711, D712, D713 — 9 Oct 26) ------------
   His words: "Can the inputs have an all avail and all selection too? Only allowed for duty and other commitments."
   The schedule's two placeholders are offered in the ONE-PERSON list, under a heading that says what both mean (D702:
   each "stands for whoever is free" — and neither takes ground crew, D52, so "everyone" would be false). Which kinds
   may carry one, and that it is one day, is ONE body — engine/inputs.ts placeholderProblem — asked here, at every save
   door and by the save boundary's hard check.
   AND IN "SEVERAL PEOPLE" TOO (step 3 of the one-rule build, 12 Oct 26 — owner D750: "'Several people' takes ALL AVAIL
   / ALL, so the puck is one of the input's own people"; D753: "offered only where the input is a single day; and an
   input takes ALL or ALL AVAIL, never both"; the plan 2026-10-11-one-rule-plan.md §4.5). Until then a placeholder was
   filed on its own and "Several people" refused one. Now the two are pucks of their own above the groups, under the
   same heading: one may be picked beside the people; where this input cannot hold one — longer than a day, or not one
   of the seven kinds (six until D778, 12 Oct 26) — they are drawn greyed with the reason under them (`phWhy`: the window's own answer, of its
   draft's kind and dates). */
export const PLACEHOLDER_IDS = (): string[] => Object.keys(PEOPLE).filter(id => PEOPLE[id].special)
export const PLACEHOLDER_HEADING = 'Whoever is free that day'

/** may he pick someone other than himself for this kind at all? (an admin: yes; a member: a kind he may file for others) */
export const mayPickOthers = (type: any): boolean => canEditSched() || mayFileInputFor('\u0000another', type)

/** What is wrong with the people picked for this kind, and the one press that corrects it — or null. */
export function pickProblem(people: readonly string[], several: boolean, type: any, phWhy?: (id: string) => string): { why: string; fix: string[]; fixLabel: string } | null {
  const mine = me()
  /* A PLACEHOLDER PICKED ([INPUT-ALL-AVAIL]; one of an input's people since step 3 of the one-rule build — D750, D753).
     Where this input cannot hold one — a kind it may not carry, or longer than a day (`phWhy`, where the caller knows
     its dates; the kind alone where it does not, and the save says the rest by the same body) — the sentence is the
     one body's. The one press: beside other people, it is taken out; alone, a MEMBER files it for himself. Never both
     of them (D753), however that came about. */
  const phs = people.filter(p => isSpecial(p))
  const ph = phs[0]
  if (phs.length > 1) return { why: shapeProblem({ type, people: people.map(p => ({ p })) }) || `This input already has ${cs(ph)}`, fix: people.filter(p => p !== phs[1]), fixLabel: `Take ${cs(phs[1])} out` }
  if (ph != null) {
    const why = phWhy ? phWhy(ph) : placeholderProblem({ person: ph, type })
    if (why && people.length > 1) return { why, fix: people.filter(p => p !== ph), fixLabel: `Take ${cs(ph)} out` }
    /* the one press is a MEMBER's ("File it for me only" — what he may always do); an admin is offered none: he
       picks the name it is really for from the list (Astra's scenario design, 9 Oct 26 — the admin was being offered
       to file another kind's input for HIMSELF) */
    if (why) return { why, fix: !canEditSched() && mine != null ? [mine] : [], fixLabel: 'File it for me only' }
  }
  if (several && people.length > 1 && !mayFileGroup(type)) {
    if (canEditSched()) return {
      why: `${isUpchit(type) ? 'An upchit' : needsDoc(type) ? 'A medical entry' : 'This'} is filed for one person at a time — each needs its own document`,
      fix: [people[0]], fixLabel: `Keep ${cs(people[0])} only`,
    }
    return { why: fileForOtherRefusal(type), fix: mine != null ? [mine] : [people[0]], fixLabel: 'File it for me only' }
  }
  const other = people.find(p => !isSpecial(p) && !mayFileInputFor(p, type))
  if (other != null && !canEditSched()) return { why: fileForOtherRefusal(type), fix: mine != null ? [mine] : [], fixLabel: 'File it for me only' }
  return null
}
