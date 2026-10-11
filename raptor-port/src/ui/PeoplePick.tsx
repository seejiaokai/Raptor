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
   kept on the way back to one person, D656 reading 4) and `several`, and saves through ui/inputedit.tsx commitInput. */
import { useRef, type ReactNode } from 'react'
import { PEOPLE, isSpecial } from '../engine/people'
import { isUpchit, needsDoc, placeholderKind, placeholderProblem, shapeProblem } from '../engine/inputs'
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
   of the six kinds — they are drawn greyed with the reason under them (`phWhy`: the window's own answer, of its
   draft's kind and dates). */
export const PLACEHOLDER_IDS = (): string[] => Object.keys(PEOPLE).filter(id => PEOPLE[id].special)
export const PLACEHOLDER_HEADING = 'Whoever is free that day'
/** The two entries, as a group of a person list. `type`: the kind being filed — offered only for one a placeholder may
 *  carry; `current`: the person now chosen — a placeholder already chosen is ALWAYS listed, whatever the kind has
 *  become, so the box never shows another name over it (nothing is substituted for what he picked). `all`: list both
 *  whatever the kind (a filter, which chooses among what exists). */
export function PlaceholderGroup({ type, current, all, value }: { type?: any; current?: any; all?: boolean; value?: (id: string) => string }) {
  const ids = PLACEHOLDER_IDS().filter(id => all || placeholderKind(type) || String(current ?? '') === id)
  if (!ids.length) return null
  /* `value`: a person FILTER gives a placeholder a value of its own (ui/inputscal-model.ts personFilterValue — its bare
     id 'all' is the filter's "Everyone") */
  return <optgroup label={PLACEHOLDER_HEADING} data-ph="1">{ids.map(id => <option key={id} value={value ? value(id) : id}>{cs(id)}</option>)}</optgroup>
}

/** may he pick someone other than himself for this kind at all? (an admin: yes; a member: a kind he may file for others) */
const mayPickOthers = (type: any): boolean => canEditSched() || mayFileInputFor('\u0000another', type)

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

export function PeoplePick({ people, several, type, sansOnly, lockOne, readOnly, more, moreIds, phWhy, onChange }: {
  people: string[]
  several: boolean
  type: any
  /** the SANS calendar's "+ Commitment": SANS people only */
  sansOnly?: boolean
  /** an input already filed, read by a member: its one person is a value — moving it to another man is a scheduler's */
  lockOne?: boolean
  /** the whole form is one its reader may not change (the input's window, read only): nothing can be picked, so nothing
   *  is said about what may be picked (`[CARD-CHECK-SEEN]` 4, 10 Oct 26 — a member reading another man's medical entry
   *  was told "You can file a medical entry only for yourself") */
  readOnly?: boolean
  /** more choices for the one-person list — an admin's "Posted out / archived" group. (The List's own add form, which
   *  drew this picker with its own field markup and ids, went on 10 Oct 26 — D729; the input's window is its one user.) */
  more?: ReactNode
  /** …and who is IN that group, where the caller's first person may be someone on no list at all — a deleted man, whose
   *  own name must still be the list's value (the List's pencil kept it so; ui/windowdoors.test.tsx). Without it a
   *  caller that passes `more` is taken to list everyone its first person can be. */
  moreIds?: readonly string[]
  /** may THIS input hold a placeholder? — '' or the sentence, from the window that knows its dates as well as its kind
   *  (engine/inputs.ts placeholderProblem, the one body). Without it the kind alone is asked. */
  phWhy?: (id: string) => string
  onChange: (people: string[], several: boolean) => void
}) {
  const roster = pickRoster(sansOnly)
  const first = people[0]
  const others = !lockOne && mayPickOthers(type)
  /* the two placeholders: where he may pick another "person" for this kind, never on the SANS calendar */
  const offerPh = !sansOnly
  /* the switch shows where a group may be filed — and stays while several ARE picked, so a kind that no longer allows
     it never hides what he chose */
  const showSwitch = (mayFileGroup(type) && (!sansOnly || canEditSched())) || several
  const problem = readOnly ? null : pickProblem(people, several, type, phWhy)
  /* THE TWO PLACEHOLDERS, IN "SEVERAL PEOPLE" (D750, D753): one of them, beside the people. `phBar` — why this input
     cannot hold one ('' where it can); one already picked stays lit and can be let go whatever the bar says. */
  const phIds = offerPh && several ? PLACEHOLDER_IDS() : []
  const phBar = (id: string) => (phWhy ? phWhy(id) : placeholderProblem({ person: id, type }))
  const picked = people.filter(p => isSpecial(p))
  const named = people.length - picked.length
  const togglePh = (id: string) => {
    if (people.includes(id)) { if (people.length > 1) onChange(people.filter(p => p !== id), true) }
    else if (!phBar(id)) onChange([...people.filter(p => !isSpecial(p)), id], true)
  }
  const toggle = (id: string) => {
    if (people.includes(id)) { if (people.length > 1) onChange(people.filter(p => p !== id), true) }
    else onChange([...people, id], true)
  }
  const groups = GROUPS.map(g => ({ ...g, ids: roster.filter(id => g.has(PEOPLE[id])) })).filter(g => g.ids.length)
  /* A DRAG PICKS EVERY PUCK IT PASSES (owner D685, 9 Oct 26 — from his iPhone: "I should be able to drag to select
     multiple pucks"). The drag does what its FIRST puck does: begun on a man not picked it picks all it passes; begun
     on a picked man it lets them go — never the last one, as a press never does. It runs across the headings (the
     handlers are on the picker's whole body). ON A PHONE IT STARTS SIDEWAYS: the picker is taller than the screen, so a
     finger moved up or down must stay the list being scrolled (the pucks say `touch-action:pan-y` — the browser keeps
     the vertical swipe and hands the sideways one here; once it is ours it may run down into other rows). With a
     mouse any drag picks. A plain press is still the button's own click; the click a browser sends after a drag is
     swallowed, or it would undo the first puck. Nothing is kept between presses but this one drag. */
  const live = useRef(people)
  live.current = people
  const drag = useRef<{ id: string; on: boolean; x: number; y: number; active: boolean; touch: boolean; seen: Set<string> } | null>(null)
  const swallow = useRef(0)
  const pass = (id: string) => {
    const d = drag.current
    if (!d || d.seen.has(id)) return
    d.seen.add(id)
    const p = live.current
    if (d.on ? p.includes(id) : !p.includes(id) || p.length < 2) return
    live.current = d.on ? [...p, id] : p.filter(x => x !== id)
    onChange(live.current, true)
  }
  const puckAt = (root: HTMLElement, x: number, y: number): string | null => {
    const hit = document.elementFromPoint(x, y) as HTMLElement | null
    const b = hit && typeof hit.closest === 'function' ? hit.closest('[data-pp]') as HTMLElement | null : null
    return b && root.contains(b) ? b.getAttribute('data-pp') : null
  }
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const b = (e.target as HTMLElement).closest('[data-pp]') as HTMLElement | null
    drag.current = null
    if (!b || e.button) return
    const id = b.getAttribute('data-pp')!
    drag.current = { id, on: !live.current.includes(id), x: e.clientX, y: e.clientY, active: false, touch: e.pointerType === 'touch', seen: new Set() }
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    if (!d.active) {
      const dx = Math.abs(e.clientX - d.x), dy = Math.abs(e.clientY - d.y)
      if (Math.max(dx, dy) < 4) return
      if (d.touch && dy > dx) { drag.current = null; return }           // up or down: the list is being scrolled
      d.active = true
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* jsdom */ }
      pass(d.id)
    }
    const id = puckAt(e.currentTarget, e.clientX, e.clientY)
    if (id) pass(id)
  }
  const onUp = () => {
    if (drag.current && drag.current.active) swallow.current = Date.now()
    drag.current = null
  }
  return (
    <div className="inped-f pp" data-testid="pp">
      <span className="inped-k">{several ? 'People' : 'Person'}</span>
      <div className="pp-body" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        onClickCapture={e => {
          /* the click that follows a drag belongs to the drag — once, and only straight after it */
          if (swallow.current && Date.now() - swallow.current < 400 && (e.target as HTMLElement).closest('.pp-pucks')) { swallow.current = 0; e.stopPropagation(); e.preventDefault() }
          else swallow.current = 0
        }}>
        <div className="pp-top">
          {!several && (others
            ? <select id="inpEditPerson" aria-label="Person" value={first ?? ''} onChange={e => onChange([e.target.value], false)}>
              {/* a man no longer on the list (archived since) still reads as himself, never as the first name on it */}
              {first != null && !roster.includes(first) && !isSpecial(first) && (more ? !!moreIds && !moreIds.includes(first) : true) && <option value={first}>{cs(first)}</option>}
              {offerPh && <PlaceholderGroup type={type} current={first} />}
              {roster.map(id => <option key={id} value={id}>{cs(id)}</option>)}
              {more}
            </select>
            : <span className="inped-v" id="inpEditPersonFixed">{cs(first)}</span>)}
          {/* the count is of the PEOPLE; a placeholder is nobody to count and is said beside it (as on the month's bar) */}
          {several && <span className="pp-count" data-testid="pp-count" aria-live="polite">{[named || !picked.length ? `${named} picked` : '', ...picked.map(cs)].filter(Boolean).join(' + ')}</span>}
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
            {/* no press on an input already filed that he reads (`lockOne`): its person is a value there, and the press
                could change nothing (walker A of the ALL AVAIL check, 9 Oct 26 — a dead "File it for me only") */}
            {problem.fix.length > 0 && !lockOne && <button type="button" className="abtn" data-testid="pp-fix" onClick={() => onChange(problem.fix, several && problem.fix.length > 1)}>{problem.fixLabel}</button>}
          </div>
        )}
        {phIds.length > 0 && (
          <div className="pp-group" data-ppgroup="ph" role="group" aria-label={PLACEHOLDER_HEADING}>
            <div className="pp-gh"><b>{PLACEHOLDER_HEADING}</b></div>
            <div className="pp-pucks">
              {phIds.map(id => {
                const on = people.includes(id)
                return (
                  <button key={id} type="button" className={'pp-puck' + (on ? ' on' : '')} data-ph={id} disabled={!on && !!phBar(id)}
                    aria-pressed={on} aria-label={cs(id)} onClick={() => togglePh(id)}>
                    <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: puck(id, false, true, false).replace(' tabindex="0"', '') }} />
                  </button>
                )
              })}
            </div>
            {/* why they are greyed — said once, here, unless the line above already says it of one that is picked */}
            {!problem && !picked.length && !!phBar(phIds[0]!) && <div className="pp-phwhy" data-testid="pp-phwhy">{phBar(phIds[0]!)}</div>}
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
