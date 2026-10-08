/* THE PEOPLE PICKER — who an input is for (owner D654, D655, D656, D658, D659 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "The picker").

   D656: "hybrid" — by default ONE person from an A-to-Z list, as today; a "Several people" switch then shows the
   schedule's pucks in groups — Pilots, WSOs and SANS, each A to Z, drawn compact (four across on a phone); D659: a
   fourth heading, "Personnel", for ground crew, only where the roster holds ground crew. Each puck is ui/html.ts puck()
   itself (D649 — never a look-alike), inside a button: picked ones lit, the rest dimmed.

   WHO MAY PICK WHOM is asked of the one module (state/perms.ts): an admin files for anyone, and for several on every
   kind but the medical ones and the upchit (each needs its own document — D655 reading 4); a member files for another
   man only a duty or a commitment, while the members' switch is on (D655), and never SANS availability (D658).

   NOTHING IS EVER SUBSTITUTED FOR WHAT HE PICKED. When a change of kind — or the switch turned off under him — leaves
   people picked that he may not file that kind for, they stay shown; one line says why and one press offers the
   correction (`pickProblem` — the editor's Save refuses with the same sentence).

   The picker holds no state and writes nothing: its owner keeps `people` (in the order picked — the first is the one
   kept on the way back to one person, D656 reading 4) and `several`, and saves through ui/inputedit.tsx commitGroup. */
import type { ReactNode } from 'react'
import { PEOPLE } from '../engine/people'
import { isUpchit, needsDoc } from '../engine/inputs'
import { canEditSched } from '../state/auth'
import { mayFileGroup, mayFileInputFor, me } from '../state/perms'
import { fileForOtherRefusal, rosterOptions } from './inputedit'
import { puck } from './html'

const cs = (id: any): string => (PEOPLE[id] ? String(PEOPLE[id].cs) : String(id ?? ''))
const az = (ids: string[]) => [...ids].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))

/** the people this picker offers: today's list (no archived man, no placeholder puck), SANS people only on the SANS
 *  calendar — a SANS availability is refused for anyone else at the save */
export const pickRoster = (sansOnly?: boolean): string[] =>
  az(rosterOptions().filter(id => !PEOPLE[id].special && (!sansOnly || PEOPLE[id].san)))

const GROUPS: Array<{ k: string; label: string; has: (p: any) => boolean }> = [
  { k: 'pilots', label: 'Pilots', has: p => !p.san && !p.pers && p.seat !== 'RCP' },
  { k: 'wsos', label: 'WSOs', has: p => !p.san && !p.pers && p.seat === 'RCP' },
  { k: 'sans', label: 'SANS', has: p => !!p.san },
  { k: 'personnel', label: 'Personnel', has: p => !!p.pers && !p.san },
]

/** may he pick someone other than himself for this kind at all? (an admin: yes; a member: a kind he may file for others) */
const mayPickOthers = (type: any): boolean => canEditSched() || mayFileInputFor('\u0000another', type)

/** What is wrong with the people picked for this kind, and the one press that corrects it — or null. */
export function pickProblem(people: readonly string[], several: boolean, type: any): { why: string; fix: string[]; fixLabel: string } | null {
  const mine = me()
  if (several && people.length > 1 && !mayFileGroup(type)) {
    if (canEditSched()) return {
      why: `${isUpchit(type) ? 'An upchit' : needsDoc(type) ? 'A medical entry' : 'This'} is filed for one person at a time — each needs its own document`,
      fix: [people[0]], fixLabel: `Keep ${cs(people[0])} only`,
    }
    return { why: fileForOtherRefusal(type), fix: mine != null ? [mine] : [people[0]], fixLabel: 'File it for me only' }
  }
  const other = people.find(p => !mayFileInputFor(p, type))
  if (other != null && !canEditSched()) return { why: fileForOtherRefusal(type), fix: mine != null ? [mine] : [], fixLabel: 'File it for me only' }
  return null
}

export function PeoplePick({ people, several, type, sansOnly, lockOne, form, more, onChange }: {
  people: string[]
  several: boolean
  type: any
  /** the SANS calendar's "+ Commitment": SANS people only */
  sansOnly?: boolean
  /** an input already filed, read by a member: its one person is a value — moving it to another man is a scheduler's */
  lockOne?: boolean
  /** the List's own Add form: its field markup and its own ids (`inPerson` / `inPersonFixed`), as they always were */
  form?: boolean
  /** more choices for the one-person list — the form's "Posted out / archived" group */
  more?: ReactNode
  onChange: (people: string[], several: boolean) => void
}) {
  const roster = pickRoster(sansOnly)
  const first = people[0]
  const others = !lockOne && mayPickOthers(type)
  /* the switch shows where a group may be filed — and stays while several ARE picked, so a kind that no longer allows
     it never hides what he chose */
  const showSwitch = (mayFileGroup(type) && (!sansOnly || canEditSched())) || several
  const problem = pickProblem(people, several, type)
  const toggle = (id: string) => {
    if (people.includes(id)) { if (people.length > 1) onChange(people.filter(p => p !== id), true) }
    else onChange([...people, id], true)
  }
  const groups = GROUPS.map(g => ({ ...g, ids: roster.filter(id => g.has(PEOPLE[id])) })).filter(g => g.ids.length)
  return (
    <div className={(form ? 'ifield' : 'inped-f') + ' pp'} data-testid="pp">
      {form ? <label>{several ? 'People' : 'Person'}</label> : <span className="inped-k">{several ? 'People' : 'Person'}</span>}
      <div className="pp-body">
        <div className="pp-top">
          {!several && (others
            ? <select id={form ? 'inPerson' : 'inpEditPerson'} aria-label="Person" value={first ?? ''} onChange={e => onChange([e.target.value], false)}>
              {/* a man no longer on the list (archived since) still reads as himself, never as the first name on it */}
              {!more && first != null && !roster.includes(first) && <option value={first}>{cs(first)}</option>}
              {roster.map(id => <option key={id} value={id}>{cs(id)}</option>)}
              {more}
            </select>
            : form ? <div className="inper-fixed" id="inPersonFixed" aria-label="Person">{cs(first)}</div>
              : <span className="inped-v" id="inpEditPersonFixed">{cs(first)}</span>)}
          {several && <span className="pp-count" data-testid="pp-count" aria-live="polite">{people.length} picked</span>}
          {showSwitch && (
            <button type="button" className={'pp-sw' + (several ? ' on' : '')} role="switch" aria-checked={several} data-testid="pp-several"
              onClick={() => onChange(several ? people.slice(0, 1) : people.slice(), !several)}>
              <span className="pp-sw-dot" aria-hidden="true" />Several people
            </button>
          )}
        </div>
        {problem && (
          <div className="pp-why" data-testid="pp-why" role="alert">
            <span>{problem.why}</span>
            {problem.fix.length > 0 && <button type="button" className="abtn" data-testid="pp-fix" onClick={() => onChange(problem.fix, false)}>{problem.fixLabel}</button>}
          </div>
        )}
        {several && groups.map(g => {
          const all = g.ids.every(id => people.includes(id))
          /* "All" on the SANS heading only where SANS is the one group there is (the SANS calendar) — D656 names it on
             Pilots and WSOs, D659 on Personnel */
          const withAll = g.k !== 'sans' || groups.length === 1
          return (
            <div key={g.k} className="pp-group" data-ppgroup={g.k} role="group" aria-label={g.label}>
              <div className="pp-gh">
                <b>{g.label}</b>
                {withAll && (
                  <button type="button" className={'pp-all' + (all ? ' on' : '')} aria-pressed={all} data-testid={'pp-all-' + g.k}
                    onClick={() => {
                      const rest = people.filter(p => !g.ids.includes(p))
                      /* a second press clears the group — but never the last man: an input is for somebody */
                      if (all) onChange(rest.length ? rest : people.slice(0, 1), true)
                      else onChange([...people, ...g.ids.filter(id => !people.includes(id))], true)
                    }}>All</button>
                )}
              </div>
              <div className="pp-pucks">
                {g.ids.map(id => (
                  <button key={id} type="button" className={'pp-puck' + (people.includes(id) ? ' on' : '')} data-pp={id}
                    aria-pressed={people.includes(id)} aria-label={cs(id)} onClick={() => toggle(id)}>
                    <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: puck(id, false, true, false).replace(' tabindex="0"', '') }} />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
