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
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { PEOPLE, isSpecial } from '../engine/people'
import { placeholderKind, placeholderProblem } from '../engine/inputs'
import { canEditSched } from '../state/auth'
import { mayFileGroup } from '../state/perms'
import { puck } from './html'
import { edgeAutoScroll, findScroller } from './edgescroll'
/* who the picker offers and what is wrong with the people picked live in ./peoplepick-model (moved whole, 6 Nov 26) */
import { PLACEHOLDER_HEADING, PLACEHOLDER_IDS, cs, mayPickOthers, pickProblem, pickRoster } from './peoplepick-model'

const GROUPS: Array<{ k: string; label: string; has: (p: any) => boolean }> = [
  { k: 'pilots', label: 'Pilots', has: p => !p.san && !p.pers && p.seat !== 'RCP' },
  { k: 'wsos', label: 'WSOs', has: p => !p.san && !p.pers && p.seat === 'RCP' },
  { k: 'sans', label: 'SANS', has: p => !!p.san },
  { k: 'personnel', label: 'Personnel', has: p => !!p.pers && !p.san },
]

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

// eslint-disable-next-line react-doctor/no-high-complexity-react-function -- one picker in its two modes (one person, several), the placeholders and the finger's drag across the pucks share one set of props and refs; split, the drag's reading of what is picked and the lists it lights could drift apart, in the window every input is filed through
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
  /* who is picked, asked once a puck — the groups' pucks and "All" read it in a loop (React Doctor js-set-map-lookups) */
  const chosen = new Set(people)
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
     swallowed, or it would undo the first puck. Nothing is kept between presses but this one drag.
     CARRIED TO THE EDGE OF WHAT IT SCROLLS IN, THE LIST FOLLOWS (owner D900, 15 Oct 26 — "Yes they should too"; the
     design guide §5a, D895): once the drag is the picker's, held at the top or the foot of the window (or the page) the
     faces are in, that scrolls up or down at the app's one edge feel (ui/edgescroll.ts) — and each face that slides
     under the still pointer is passed over, as if the pointer had moved onto it. */
  /* who is picked, for the drag's handlers: today's list after each commit (never written during a render React may throw
     away), moved on by the drag itself between one pick and the redraw it causes */
  const live = useRef(people)
  useLayoutEffect(() => { live.current = people })
  const drag = useRef<{
    id: string; on: boolean; x: number; y: number; active: boolean; touch: boolean; seen: Set<string>
    /** the edge scroll, from the moment the drag is the picker's; and where the pointer last was */
    auto?: ReturnType<typeof edgeAutoScroll>; lx?: number; ly?: number
  } | null>(null)
  const swallow = useRef(0)
  /* the picker taken off the screen mid-drag (its window closed by a key): the edge scroll ends with it */
  useEffect(() => () => { drag.current?.auto?.stop() }, [])
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
    drag.current?.auto?.stop()
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
      const root = e.currentTarget
      /* only the window's own list: where the window holds all its faces there is nothing to show, and the page behind a
         window is never scrolled from inside it (D686) */
      const box = findScroller(root, 'y')
      /* THE BAND IS WHERE THE FACES ARE SEEN (the walk of 15 Oct 26, E4): the window's Save / Cancel bar stays at its
         foot over the last strip of what it scrolls, so its edge is that bar's top — a finger held there is still over
         faces, and picks each one that slides under it. And it runs only while there are faces still to bring into view
         that way: the window holds more than the picker, and ran on to its own end, carrying the faces out of sight. */
      /* what stays put inside the window as it scrolls (its bars), found once as the drag becomes the picker's — not the
         picker itself, nor anything in it */
      const stuck = box && !box.isDoc ? Array.from(box.el.querySelectorAll('*')).filter(k => !root.contains(k) && getComputedStyle(k).position === 'sticky') : []
      const seen = (): [number, number] => {
        const sc = box!.el, r = sc.getBoundingClientRect()
        let lo = Math.max(r.top, 0), hi = Math.min(r.bottom, window.innerHeight)
        for (const k of stuck) {
          const b = k.getBoundingClientRect()
          if (b.bottom >= hi - 1 && b.top > lo) hi = Math.min(hi, b.top)
          else if (b.top <= lo + 1 && b.bottom < hi) lo = Math.max(lo, b.bottom)
        }
        return [lo, hi]
      }
      if (box && !box.isDoc) d.auto = edgeAutoScroll({ from: root, axis: 'y', touch: d.touch, x: e.clientX, y: e.clientY,
        span: seen,
        more: dir => { const r = root.getBoundingClientRect(), [lo, hi] = seen(); return dir > 0 ? r.bottom > hi + 1 : r.top < lo - 1 },
        onScroll: () => {
          const id = drag.current === d ? puckAt(root, d.lx!, d.ly!) : null
          if (id) pass(id)
        } })
    }
    d.lx = e.clientX; d.ly = e.clientY
    d.auto?.point(e.clientX, e.clientY)
    const id = puckAt(e.currentTarget, e.clientX, e.clientY)
    if (id) pass(id)
  }
  const onUp = () => {
    if (drag.current && drag.current.active) swallow.current = Date.now()
    drag.current?.auto?.stop()
    drag.current = null
  }
  return (
    <div className="inped-f pp" data-testid="pp">
      <span className="inped-k">{several ? 'People' : 'Person'}</span>
      {/* eslint-disable-next-line react-doctor/click-events-have-key-events -- not a control: the capture only swallows the one click that ends a finger's drag across the pucks; every puck inside is a button the keyboard reaches and presses */}
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
                const on = chosen.has(id)
                return (
                  <button key={id} type="button" className={'pp-puck' + (on ? ' on' : '')} data-ph={id} disabled={!on && !!phBar(id)}
                    aria-pressed={on} aria-label={cs(id)} onClick={() => togglePh(id)}>
                    <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: puck(id, false, true, false).replace(' tabindex="0"', '') }} />
                  </button>
                )
              })}
            </div>
            {/* why they are greyed — said once, here, unless the line above already says it of one that is picked */}
            {!readOnly && !problem && !picked.length && !!phBar(phIds[0]!) && <div className="pp-phwhy" data-testid="pp-phwhy">{phBar(phIds[0]!)}</div>}
          </div>
        )}
        {several && groups.map(g => {
          const all = g.ids.every(id => chosen.has(id))
          const inGroup = new Set(g.ids)
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
                      const rest = people.filter(p => !inGroup.has(p))
                      /* a second press clears the group — but never the last man: an input is for somebody */
                      if (all) onChange(rest.length ? rest : people.slice(0, 1), true)
                      else onChange([...people, ...g.ids.filter(id => !chosen.has(id))], true)
                    }}>All</button>
                )}
              </div>
              <div className="pp-pucks">
                {g.ids.map(id => (
                  <button key={id} type="button" className={'pp-puck' + (chosen.has(id) ? ' on' : '')} data-pp={id}
                    aria-pressed={chosen.has(id)} aria-label={cs(id)} onClick={() => toggle(id)}>
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
