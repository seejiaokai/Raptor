// Raptor's topbar idiom plus the open-dates strip below it. Only real, computable
// facts are surfaced here — no dead nav links to pages that don't exist
// yet (My leave, Ledger, Rules, Roster) and no "closes in N days", which
// the engine does not model. See CLAUDE-facing restyle brief for why.

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { boxText, evaluatePeriod, FIGURES, kindOf, memberToday, openFrom, stretchLabel } from '../engine'
import { CODE_GLOSSARY } from '../engine/codes'
import { getClashes, getClashVersion, openInputWindow, subscribeClashes, type ClashWayOut, type SyncClash } from '../sync'
import { focusDay, getState, selectWar } from '../state/store'
import { OpenDatesSheet } from './OpenDatesSheet'
import { dayLabel, shortDate } from './dates'
import { usePhone } from './phone'
import { WarSheet } from './WarSheet'
import { clearNewWarAsk, peekNewWarAsk, subscribeNewWarAsk, type WarAsk } from './warask'
import { useVersion } from './useStore'
import './chrome.css'

/** One of the Legend's swatches: the grid's OWN box, drawn by the same classes the cell uses (look F — D1175), in a frame
 *  a cell's size. `fill` a (filled), w (pending), r (refused); `place` where it sits in the cell; `mark` an edge. */
function LegBox({ code, text, fill = 'a', place = 'whole', mark }: { code: string; text?: string; fill?: 'a' | 'w' | 'r'; place?: 'whole' | 'top' | 'bot'; mark?: 'raptor' | 'moved' }) {
  const t = text ?? boxText(code)
  return (
    <span className="leg-box">
      <span className={`c k-${kindOf(code)} s-${fill} ${place}${t.length > 2 ? ' wide' : ''}${mark ? ` ${mark}` : ''}`}>{t}</span>
    </span>
  )
}

/** Kept in step with `.umlist`'s width in chrome.css — the clamp has to know
 *  how wide the thing it is clamping actually is. */
const LIST_WIDTH = 244
/** Same, for the colour/mark legend popover (`.leglist`). Widened +40px
 *  (6 Sep 26) for the figures section: `−MED TOT` is the longest swatch
 *  word the popover now carries, and the constant has to track the CSS
 *  width exactly or the clamp math above places the popover off-screen. */
const LEGEND_WIDTH = 312
/** What each clash tells the admin to do — where it can actually be undone ([ABSENCE-SMALL-SEEN] 1, 28 Sep 26; the reason
 *  for each is at `clashWayOut` in sync.ts). "Resolve on the sheet" sent him to a sheet with no control on it whenever
 *  the leave in the way was filed on the Inputs page.
 *  THE WORDS OF RECORD (owner D827, D837 — 14 Oct 26; docs/superpowers/briefs/2026-10-13-wording-recheck.md, the second
 *  table): each is an instruction that starts with its verb, and is the clash's own link — a tap goes where it says. */
/* THE APPROVED-LEAVE LINE (D1177 narrowing D827 — "Step the war back to Bidding Closed" is reworded at the build: there
   is no stage to step back): "Change the approved leave", its sentence "…but the bid is approved OL", as the overhaul's
   drawing of the phone's clash note has them (r7-19, approved with the plan — D1250). A tap opens the day for that
   person, where the admin sends it back, moves or deletes it at any time. */
const WAY_OUT: Record<ClashWayOut, string> = {
  bid: 'Decide the bid',
  war: 'Change the approved leave',
  inputs: 'Change the leave on Inputs',
}
/** What clashes, as a sentence — today's words less the name and the date, which stand beside it (D825: every key word
 *  kept). Where the leave in the way is one the war APPROVED the sentence says so (r7-19): it is why the instruction is
 *  to change the approved leave rather than decide a bid. */
export function clashWhat(c: SyncClash): string {
  const held = `${c.wayOut === 'war' ? 'approved ' : ''}${c.bidCode}`
  return c.kind === 'duty'
    ? `Weekend/PH work earns ${c.inputCode}, but the day holds ${held}`
    : `The input is ${c.inputCode}, but the bid is ${held}`
}

export function Topbar() {
  useVersion()
  const { period, wars, role, people, viewer } = getState()
  /* ON A PHONE THIS LINE IS THE PERIOD, "+" AND "VIEWING AS" — ONE LINE ([LW-PHONE-HEADER-SPACE]; owner, D678,
     8 Oct 26 — "A looks good", of three ideas drawn into the running build after "how can we optimise the space such
     that we don't use so much vertical space?"). The word "Period" goes (the picker says it, and still names itself
     to a screen reader) and "+ New" reads "+": that is what lets the chip come back up beside the picker, where
     D365 had it on a line of its own. A TABLET AND A DESKTOP ARE NOT TOUCHED (D679 — "keep the same for desktop"):
     every `phone ?` below leaves their markup exactly as it was. The sizes are chrome.css's phone block. */
  const phone = usePhone()
  const [making, setMaking] = useState(false)
  /* THE SHEET ASKED FOR FROM DAYS (ui/warask.ts): the Holidays list cannot write a holiday on dates no leave period
     holds, and asks for THIS sheet — the one "+ New" opens — with those dates picked. The ask is taken once: an admin
     gets the sheet, raised above the window that asked; anyone else has no such sheet, and the ask is dropped rather
     than left to spring up at the next admin. */
  const ask = useSyncExternalStore(subscribeNewWarAsk, peekNewWarAsk, peekNewWarAsk)
  const [asked, setAsked] = useState<WarAsk | null>(null)
  useEffect(() => {
    if (!ask) return
    if (role === 'admin') { setAsked(ask); setMaking(true) }
    clearNewWarAsk()
  }, [ask, role])
  /* however the sheet closes — Create, its ✕, Escape, a press outside — the asked dates go with it, so the next
     "+ New" opens as it always has: no dates picked, at its own layer */
  const closeSheet = () => { setMaking(false); setAsked(null) }
  // WHOSE view this is (owner, 28 Aug 26 — "make it obvious that im viewing as
  // for example RANGER"). The whole grid — the lit row, the counter column, the
  // figure sheets — answers for the viewing person (Raptor's "View as",
  // mirrored in), and nothing on the page said so out loud. This chip does, at
  // the top of the page where it is always in view. Absent when nobody is being
  // viewed (an admin off any one person), where there is no "you" to name.
  const me = viewer ? people.find(p => p.id === viewer) ?? null : null
  return (
    <>
    {/* The Leave War page's own "142 / LEAVE WAR" mark and "Leave war" nav
        pill were REMOVED (owner, 18 Aug 26 — "142 is repeated… takes too much
        space"). Raptor's shell topbar already carries the 142 identity and
        highlights the Leave War tab, so a second copy under it was pure
        duplication and a band of wasted height on a phone. What stays is the
        real controls only: the period picker here, and the open-dates strip below. */}
    <div className="topbar">
      <div className="spring">
        {/* A native select rather than a popover: it is the one control that
            works the same on a phone, a desktop and a keyboard, and it needs
            no geometry of its own inside a page that already has a scroller
            and three sheets.

            Each option is the war's NAME only: the open-dates strip
            immediately below says what is open in the current one. */}
        {!phone && <span className="lab" data-testid="period-label">Period</span>}
        <select
          className="wk on warpick"
          data-testid="war-picker"
          aria-label="Period — which leave war"
          value={period.id}
          onChange={e => selectWar(e.target.value)}
        >
          {wars.map(w => (
            <option key={w.period.id} value={w.period.id}>
              {w.period.name}
            </option>
          ))}
        </select>
        {role === 'admin' && (
          <button className="warnew" data-testid="war-new" aria-label={phone ? 'New period' : undefined} onClick={() => setMaking(true)}>
            {phone ? '+' : '+ New'}
          </button>
        )}
        {/* THE WAR'S UNDO / REDO LEFT THIS ROW for the app's top bar ([UNDO-TOPBAR] — owner D347, 28 Sep 26: "all undo
            and redo buttons should be at the top bar … standardised … like how the edit schedule is", his phone picture
            circling this pair with an arrow up to the top bar). The same one undo, in Edit Schedule's place and look
            (ui/Shell.tsx, ui/topbits.tsx). His 30 Aug 26 "Add undo and redo on leave war here" placement is narrowed by it. */}
        {me && (
          <span
            className="lw-viewing"
            data-testid="lw-viewing"
            title={`Every number on this page is ${me.callsign}'s — the person signed in.`}
          >
            <svg className="eye" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
              <path d="M12 5c-5 0-8.5 4.5-9.5 7 1 2.5 4.5 7 9.5 7s8.5-4.5 9.5-7c-1-2.5-4.5-7-9.5-7Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="2.6" fill="currentColor" />
            </svg>
            <span className="vlab">Viewing as</span>
            <b className="vwho">{me.callsign}</b>
          </span>
        )}
      </div>
    </div>
    {/* OUTSIDE `.topbar`, and that is load-bearing rather than tidiness.
        `.topbar` carries `backdrop-filter`, which makes it the containing
        block for any `position: fixed` descendant — so the sheet's
        `bottom: 14px` would resolve against the topbar's own 60px-tall box
        and render clipped at the top of the page instead of at the bottom of
        the viewport. jsdom computes no layout, so every unit test passed
        while it was broken; the browser gate is what caught it. */}
    {making && <WarSheet key={asked ? `${asked.from}|${asked.to}` : 'new'} initial={asked} raised={!!asked} onClose={closeSheet} />}
    </>
  )
}

export function StageBar() {
  useVersion()
  /* The clash list lives in the sync module, not the store — it is a view of
     two live records, re-derived on every inbound pass — so it carries its
     own subscription rather than riding the store's version. */
  useSyncExternalStore(subscribeClashes, getClashVersion, getClashVersion)
  const clashes = getClashes()
  const [picking, setPicking] = useState(false)
  const { people, period, grid, states, views, requirements, role } = getState()
  /* THE CLASH NOTE ([LW-CLASH-NOTE-PHONE] — owner D805, D823, D827: "A+", approved as drawn on 13 Oct 26; the design of
     record is docs/mock/design-look-13oct.html and scripts/handpass/dl-clash.mjs, modes N-closed / N-open).
     ON A PHONE it was one amber box squeezed into what the second line's four buttons left — 100 of 390 wide, 294 tall
     for two clashes — because that line does not wrap (D678). It is a slim line of its own under the two lines, the
     width of the screen, that opens its list in place: one row a clash, every row the same two-line shape.
     · ONE CLASH STARTS OPEN, MORE START CLOSED, and once he has pressed Show or Hide his choice is kept for the visit.
     · A TAP GOES WHERE THE INSTRUCTION SAYS (`goClash`): the day opened for that person — the sheet a tap on his cell
       opens — or, for leave filed on the Inputs page, that leave's own window there.
     · NO INNER SCROLL: a long list pushes the grid down, and Hide is the way back.
     A TABLET AND A DESKTOP KEEP THE STRIP WHERE AND AS IT WAS (D679) — it says each clash in the same words, and its
     instruction is a link that goes to the same place. */
  const [clashPick, setClashPick] = useState<boolean | null>(null)
  /* HIS SHOW / HIDE IS A CHOICE ABOUT THE NOTE IN FRONT OF HIM (the fresh read of 14 Oct 26, R3). This row stays drawn
     for the whole sign-in, and the choice was never forgotten: after one Hide a lone clash raised an hour later started
     closed, after one Show several started open. When the last clash goes the note goes, and the next one starts by
     the rule again — one open, several closed (D827). */
  useEffect(() => { if (clashes.length === 0) setClashPick(null) }, [clashes.length])
  const clashOpen = clashPick ?? clashes.length === 1
  const whoOf = (id: string) => people.find(p => p.id === id)?.callsign ?? id
  /* the day as the day's own sheets say it — "Sat 18 Jul" — with its year only where that is not the year on screen */
  const yearHere = period.days[0]?.date.slice(0, 4)
  const clashDay = (date: string) => `${dayLabel(date)}${date.slice(0, 4) !== yearHere ? ` ${date.slice(2, 4)}` : ''}`
  const goClash = (c: SyncClash) => {
    if (c.wayOut === 'inputs' && c.iid && openInputWindow(c.iid)) return
    /* the list covers every period: put the clash's own on screen first, then ask the grid for the day and the person */
    if (c.war && c.war !== period.id) selectWar(c.war)
    focusDay(c.date, { open: c.person })
  }
  // kind AND both codes AND the index join the key (review fix, 19 Aug 26 — kind alone was not enough): two
  // split-clashes, or a split-clash beside an ingest clash, legitimately share one person, date and kind (a full-day LL
  // plus a PM OML against one approved bid), and a duplicate key drops one row on repaint — hiding a clash the admin
  // must resolve. The list is re-derived whole on every pass, so the index is a safe tiebreak, not a reorder hazard.
  const clashKey = (c: SyncClash, i: number) => `${c.kind ?? 'leave'}-${c.person}-${c.date}-${c.inputCode}-${c.bidCode}-${i}`
  const dates = period.days.map(d => d.date)
  // Duplicates the same evaluatePeriod call Matrix makes internally. Both
  // stay self-contained (no prop plumbing between them) so Matrix keeps
  // rendering standalone in its existing tests; the cost is one extra pass
  // over a 90-day period, which is not worth threading props for. Both must
  // be handed the same `states`, or the strip counts a different squadron
  // from the one the grid below it is painting.
  const verdicts = evaluatePeriod(people, grid, states, requirements, dates, views)
  // The red days themselves, not just how many. Recomputed every render like
  // the tally beside them: a list built once would send a scheduler to a day
  // a refusal had already recovered.
  const red = dates.filter(d => verdicts[d].verdict === 'red')
  const redDays = red.length
  const [listOpen, setListOpen] = useState(false)
  const showList = listOpen && redDays > 0

  /* ON A PHONE THIS STRIP IS ONE LINE — the open dates, under-manned, Legend ([LW-PHONE-HEADER-SPACE]; owner, D678,
     8 Oct 26: idea A of the page he was shown; the stage chip and its menu went with the stages, D1177). The words
     "Under-manned" go on a phone (the buttons say it) and the dates read without their year. A TABLET AND A DESKTOP
     draw the same chip with its longer words (D679). */
  const phone = usePhone()
  /* WHAT IS OPEN, AS THIS PERSON SEES IT (D1177; D1211): the admin every open stretch; a member those from today on —
     he never bids before today, so a stretch wholly past is not "open" to him. The chip shows the first and counts the
     rest ("+1"); with none it reads "Bidding closed". One chip, a button for everyone: an admin's tap opens the "Open
     for bidding" window to change them, a member's opens it to read them — and, with nothing open, the last open stretch
     and who closed it. */
  /* what is open FROM TODAY, for the admin as for a member (D1268, 23 Oct 26): an admin whose only open dates are past reads
     "Bidding closed" here, as every member does, not "Open 1 Mar – 31 May" that no member can use a day of */
  const openNow = openFrom(period, memberToday())

  // Where the list hangs. Measured, because the strip wraps: the chip is in a
  // different place on a phone than on a desktop, and a list anchored to its
  // left edge runs off the right of a narrow viewport and stops being
  // clickable at all.
  const chipRef = useRef<HTMLButtonElement>(null)
  /* the open chip: the window it opens hands the keyboard back to it on closing (the design guide §3 — M1's walk, A-F2) */
  const openChipRef = useRef<HTMLButtonElement>(null)
  const [at, setAt] = useState<{ left: number; top: number } | null>(null)
  useLayoutEffect(() => {
    if (!showList) { setAt(null); return }
    const r = chipRef.current?.getBoundingClientRect()
    if (!r) return
    const margin = 8
    setAt({
      left: Math.max(margin, Math.min(r.left, window.innerWidth - LIST_WIDTH - margin)),
      top: r.bottom + margin,
    })
  }, [showList, redDays])

  // The colour/mark KEY (owner, 27 Aug 26 — "a pop out legend to explain what
  // each colour means, especially the dotted orange and the blue shade… the *
  // also means what"). Same hang-off-the-chip pattern as the under-manned
  // list above, anchored to its own button so it stays reachable on a phone
  // where the strip wraps.
  const [legOpen, setLegOpen] = useState(false)
  const legRef = useRef<HTMLButtonElement>(null)
  const [legAt, setLegAt] = useState<{ left: number; top: number } | null>(null)
  /* ESCAPE CLOSES BOTH POP-OUTS (bug sweep, 28 Aug 26). These two hang off
     their chip over a full-page scrim, so a pointer always had a way out — but
     a keyboard had none, and every sibling surface in the app closes on Escape.
     One handler for the pair: the Legend is the upper layer when both are
     somehow open, so it peels first, exactly the way the input editor peels its
     own sheets. `Sheet` carries the same rule for the panels it wraps; these
     two use a different overlay, which is why it is restated here. */
  useEffect(() => {
    if (!legOpen && !listOpen) return
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      /* Same kept-mounted guard as Sheet.tsx (bug-hunt fix, 1 Sep 26): the
         legend/list overlay left open behind a tab switch must not swallow
         Escape on a Raptor page nor close itself unseen. */
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      if (legOpen) setLegOpen(false)
      else setListOpen(false)
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [legOpen, listOpen])
  useLayoutEffect(() => {
    if (!legOpen) { setLegAt(null); return }
    const r = legRef.current?.getBoundingClientRect()
    if (!r) return
    const margin = 8
    setLegAt({
      left: Math.max(margin, Math.min(r.left, window.innerWidth - LEGEND_WIDTH - margin)),
      top: r.bottom + margin,
    })
  }, [legOpen])

  return (
    <>
    <div className="filters">
      <button
        className={`fchip openchip${openNow.length ? ' open-on' : ''}`}
        data-testid="open-chip"
        ref={openChipRef}
        aria-haspopup="dialog"
        aria-expanded={picking}
        title={role === 'admin' ? 'Choose the dates open for bidding' : 'The dates open for bidding'}
        onClick={() => setPicking(true)}
      >
        {openNow.length ? (
          <>
            <span className="openword">{phone ? 'Open' : 'Open for bidding'}</span>{' '}
            <span className="opentxt">{stretchLabel(openNow[0]!)}</span>
            {openNow.length > 1 && <span className="openmore">{' '}+{openNow.length - 1}</span>}
          </>
        ) : (
          <span className="opentxt">Bidding closed</span>
        )}
      </button>
      {/* The standalone app's "Viewing as" role toggle stood here — an
          unverified affordance anyone could flip, because that app had no
          login. Inside Raptor there IS a login: the role now comes from the
          session (resetSession → setRole, admin account = admin here), the
          Raptor topbar already shows the Admin/Member badge, and a toggle
          that disagreed with the login would be a lie. Do not re-add it. */}
      {!phone && <span className="lab" style={{ marginLeft: 12 }}>Under-manned</span>}
      {/* The tally used to be a dead end: it said seven days were broken and
          left the scheduler to find them by eye across 365 columns. It opens
          the list of those days instead, and choosing one jumps the grid to
          it — the same jump the month strip makes, for the same reason. */}
      <button
        ref={chipRef}
        className={`fchip${redDays > 0 ? ' undermanned' : ''}`}
        data-testid="undermanned"
        onClick={() => setListOpen(o => !o)}
        disabled={redDays === 0}
        aria-expanded={showList}
        aria-label={phone ? `Under-manned: ${redDays} day${redDays === 1 ? '' : 's'}` : undefined}
        title={redDays === 0
          ? 'No day in this war breaks a manning rule'
          : 'Show the days that break a manning rule'}
      >
        {/* on a phone the label beside the count is gone, so the count carries one quiet word of it (D678 — "Under 0
            days", as drawn) */}
        {phone && <span className="umlab">Under </span>}{redDays} day{redDays === 1 ? '' : 's'}
      </button>
      {showList && (
        <>
          <div className="umscrim" data-testid="undermanned-scrim" onClick={() => setListOpen(false)} />
          <div
            className="umlist"
            data-testid="undermanned-list"
            role="dialog"
            aria-label="Under-manned days"
            style={at ? { left: at.left, top: at.top } : undefined}
          >
            <div className="umlist-hd">Days breaking a manning rule</div>
            <div className="umlist-body">
              {red.map(date => {
                // Which rules are red, and the figure that broke each. "SXO 0"
                // and "IWSO 1" are different problems and a scheduler acts
                // differently on them, so a list of bare dates would just mean
                // opening all seven to find out which is which.
                const broken = verdicts[date].results.filter(r => r.verdict === 'red')
                return (
                  <button
                    key={date}
                    className="umrow"
                    data-testid={`undermanned-day-${date}`}
                    onClick={() => { focusDay(date); setListOpen(false) }}
                  >
                    <span className="d">{shortDate(date)}</span>
                    <span className="why">{broken.map(r => `${r.label} ${r.have}`).join(' · ')}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
      {/* The colour/mark KEY, to the RIGHT of the under-manned tally (owner,
          27 Aug 26). Read-only for everyone — it explains the grid, it does
          not change it. */}
      <button
        ref={legRef}
        className="fchip legkey"
        data-testid="legend-open"
        onClick={() => setLegOpen(o => !o)}
        aria-expanded={legOpen}
        title="What the colours and marks on the grid mean"
      >
        Legend
      </button>
      {legOpen && (
        <>
          <div className="umscrim" data-testid="legend-scrim" onClick={() => setLegOpen(false)} />
          <div
            className="leglist"
            data-testid="legend"
            role="dialog"
            aria-label="What the colours and marks mean"
            style={legAt ? { left: legAt.left, top: legAt.top } : undefined}
          >
            <div className="umlist-hd">What the grid is telling you</div>
            <div className="leglist-body">
              {/* LOOK F's Legend, as drawn (`docs/mock/lw-overhaul/full/r7-07-legend-phone.png` — D1175, D1158, D1160,
                  D1167): the colour is the kind, the fill where it stands, the size how much of the day. Every swatch is
                  the grid's own box (`LegBox`, the same classes the cell draws), so the key cannot say a colour the grid
                  does not paint. */}
              <div className="leg-sec">The colour: what kind</div>
              <div className="leg-row"><LegBox code="LL" /><span className="leg-t">Local leave</span></div>
              <div className="leg-row"><LegBox code="OL" /><span className="leg-t">Overseas leave</span></div>
              <div className="leg-row"><LegBox code="OIL" /><span className="leg-t">Off in lieu (OIL; FO a day credited, HO half a day; a star, the app credited it)</span></div>
              <div className="leg-row"><LegBox code="CCL" /><span className="leg-t">Other leave: CCL, FCL, PL, CL, EL</span></div>
              <div className="leg-row"><LegBox code="CSE" /><span className="leg-t">Course</span></div>
              <div className="leg-row"><LegBox code="OD" /><span className="leg-t">Overseas duty</span></div>
              <div className="leg-row"><LegBox code="ATTC" text="C" /><span className="leg-t">Medical: B, C, OML, HL</span></div>
              <div className="leg-sec">The fill: where it stands</div>
              <div className="leg-row"><LegBox code="LL" /><span className="leg-t">Approved</span></div>
              <div className="leg-row"><LegBox code="LL" fill="w" /><span className="leg-t">Pending a decision</span></div>
              <div className="leg-row"><LegBox code="LL" fill="r" /><span className="leg-t">Refused</span></div>
              <div className="leg-sec">The size: how much of the day</div>
              <div className="leg-row"><LegBox code="LL" /><span className="leg-t">A whole day</span></div>
              <div className="leg-row"><LegBox code="LL" place="top" /><span className="leg-t">Morning (AM)</span></div>
              <div className="leg-row"><LegBox code="LL" place="bot" /><span className="leg-t">Afternoon (PM)</span></div>
              <div className="leg-row">
                <span className="leg-box"><span className="c k-oil s-a left">FO</span><span className="c k-ol s-r right">OL</span></span>
                <span className="leg-t">Two entries on one day</span>
              </div>
              <div className="leg-sec">The dates</div>
              <div className="leg-row"><span className="leg-box leg-open" /><span className="leg-t">Open for bidding</span></div>
              <div className="leg-row"><span className="leg-box leg-shut" /><span className="leg-t">Not open for bidding</span></div>
              <div className="leg-sec">The left edge: where it came from</div>
              <div className="leg-row"><LegBox code="LL" mark="raptor" /><span className="leg-t">Filed on the Inputs page: change it there, not here</span></div>
              {/* the moved stripe: any move of a leave already approved wears it (D1177 — no longer only once bidding closed) */}
              <div className="leg-row"><LegBox code="LL" mark="moved" /><span className="leg-t">Moved here from another day</span></div>
              {/* [ARCH-STACK] step 4 — the corner mark: one code per day, the
                  rest behind a count (owner comp, 19 Sep 26) */}
              <div className="leg-sec">The corner — more on the day</div>
              <div className="leg-row"><span className="leg-sw appr legmk">LL<i className="lmk more">+1</i></span><span className="leg-t">More on this day — tap to see every entry</span></div>
              <div className="leg-row"><span className="leg-sw appr legmk">LL<i className="lmk warn">!</i></span><span className="leg-t">Something on this day needs an admin — tap to see</span></div>
              <div className="leg-row"><span className="leg-sw appr legmk">LL<i className="lmk po">PO</i></span><span className="leg-t">Leave after a posting-out — not counted for manning</span></div>
              {/* The figures (owner, 6 Sep 26): the colours the boxes and the
                  column titles wear, then what each column counts — read off
                  the figure catalogue so this can never drift from the grid. */}
              <div data-testid="legend-figures">
                <div className="leg-sec">The figures — the colours</div>
                <div className="leg-row"><span className="leg-sw plain figw">26</span><span className="leg-t">white — balance left (+ in the title)</span></div>
                <div className="leg-row"><span className="leg-sw plain figa">3</span><span className="leg-t">amber — local leave (LL) taken</span></div>
                <div className="leg-row"><span className="leg-sw plain figr">2</span><span className="leg-t">red — overseas leave (OL) taken, days used, or a total (− in the title)</span></div>
                <div className="leg-row"><span className="leg-sw plain figr">−4</span><span className="leg-t">red with a minus — a balance below zero</span></div>
                <div className="leg-sec">The figures — each column</div>
                {FIGURES.map(f => (
                  <div key={f.id} className="leg-row"><span className={`leg-sw plain ${f.kind === 'bal' ? 'figw' : 'figr'}`}>{f.title}</span><span className="leg-t">{f.desc}</span></div>
                ))}
              </div>
              {/* What the LETTERS mean (owner, 28 Aug 26). The grid shows codes
                  the Inputs page never explains — FO/HO above all, which are not
                  even typed there. Each swatch takes the grid's OWN colour by
                  the same rule the cell does (duty → sc, non-bid marker → info,
                  leave → plain), so it doubles as a key to those two colours the
                  sections above don't cover. Data is CODE_GLOSSARY in codes.ts,
                  built from the catalogue — one source, no drift. */}
              {CODE_GLOSSARY.map(g => (
                <div key={g.group}>
                  <div className={'leg-sec' + (g.onlyHere ? ' leg-sec-here' : '')}>{g.group}</div>
                  {g.rows.map(r => (
                    <div className="leg-row" key={r.show}>
                      <LegBox code={r.show} />
                      <span className="leg-t">{r.mean}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* Sync clashes (wire 2): a leave input filed in Raptor asking for a
          date the squadron already bid differently on. The rule is that
          neither side is silently overwritten — the input stands, the bid
          stands, and the ADMIN resolves it on the sheet — so the strip is
          admin-only, the way every other resolution control here is. It
          re-derives on every inbound pass and holds nothing of its own. */}
      {role === 'admin' && clashes.length > 0 && !phone && (
        <div className="syncclash" data-testid="sync-clashes">
          <span className="n">
            {clashes.length} clash{clashes.length === 1 ? '' : 'es'} with the schedule
          </span>
          {clashes.map((c, i) => (
            <span className="row" key={clashKey(c, i)}>
              <b>{whoOf(c.person)}</b> · {clashDay(c.date)} · {clashWhat(c)}.{' '}
              <button type="button" className="clashgo" data-testid={`clash-go-${i}`} onClick={() => goClash(c)}>{WAY_OUT[c.wayOut]}{'\u00a0'}›</button>
            </span>
          ))}
        </div>
      )}
      {/* Rendered inside `.filters` rather than `.topbar`, which carries no
          `backdrop-filter` — see the note on WarSheet in Topbar for why that
          distinction decides where a `position: fixed` sheet actually lands. */}
      {picking && <OpenDatesSheet onClose={() => { setPicking(false); openChipRef.current?.focus({ preventScroll: true }) }} />}
    </div>
    {/* THE PHONE'S CLASH NOTE — after the two lines, never inside the second (above). Admin only, as the strip is. */}
    {role === 'admin' && clashes.length > 0 && phone && (
      <div className="clashnote" data-testid="sync-clashes">
        <button
          type="button"
          className="clashline"
          data-testid="clash-line"
          aria-expanded={clashOpen}
          aria-controls="lw-clash-list"
          onClick={() => setClashPick(!clashOpen)}
        >
          <span className="clash-n"><span aria-hidden="true">⚠ </span>{clashes.length} clash{clashes.length === 1 ? '' : 'es'} with the schedule</span>{' '}
          {/* its small arrow is drawn by the stylesheet, as the stage button's is — a "▾" letter comes from whatever
              font the phone falls back to. (The space before it is for a screen reader: the button's name is its
              words run together, and "…the scheduleHide" is not a word.) */}
          <span className={`clash-toggle${clashOpen ? ' clash-up' : ''}`}>{clashOpen ? 'Hide' : 'Show'}</span>
        </button>
        {clashOpen && (
          /* EVERY PART WEARS A NAME OF THE NOTE'S OWN (`clash-…`): the schedule's stylesheet is one global sheet and
             already owns `.day` (a day of the week) and `.go` (a wave) — a bare `go` here made the line 46 tall
             instead of 30 on the check's first walk, 14 Oct 26 */
          <div className="clashlist" id="lw-clash-list" data-testid="clash-list">
            {clashes.map((c, i) => (
              <button type="button" className="clashrow" key={clashKey(c, i)} data-testid={`clash-row-${i}`} onClick={() => goClash(c)}>
                <span className="clash-who">{whoOf(c.person)}</span>
                <span className="clash-day">{clashDay(c.date)}</span>
                <span className="clash-do">{WAY_OUT[c.wayOut]}{'\u00a0'}›</span>
                <span className="clash-what">{clashWhat(c)}</span>
              </button>
            ))}
            {/* THE NAMES' COLUMN IS AS WIDE AS THE ROSTER'S LONGEST CALLSIGN, so every day starts in the same place on
                every visit, whoever happens to be clashing (D826 — Fable's read of the drawing). Sized by the roster
                itself: every callsign, unseen and with no height, in the first column — in the list's own letters,
                whatever font the phone draws them in. Never read out. */}
            <span className="clashsizer" aria-hidden="true">{people.map(p => <i key={p.id}>{p.callsign}</i>)}</span>
          </div>
        )}
      </div>
    )}
    </>
  )
}
