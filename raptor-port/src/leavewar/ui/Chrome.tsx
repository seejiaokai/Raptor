// Raptor's topbar idiom plus the open-dates strip below it. Only real, computable
// facts are surfaced here — no dead nav links to pages that don't exist
// yet (My leave, Ledger, Rules, Roster) and no "closes in N days", which
// the engine does not model. See CLAUDE-facing restyle brief for why.

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { boxText, evaluatePeriod, FIGURES, kindOf, memberToday, openFrom, stretchLabel } from '../engine'
import { CODE_GLOSSARY } from '../engine/codes'
import { getClashes, getClashVersion, openInputWindow, subscribeClashes, type ClashWayOut, type SyncClash } from '../sync'
import { figureCtxOf, focusDay, getState, selectWar } from '../state/store'
import { OpenDatesSheet } from './OpenDatesSheet'
import { dayLabel, shortDate } from './dates'
import { usePhone } from './phone'
import { WarSheet } from './WarSheet'
import { clearNewWarAsk, peekNewWarAsk, subscribeNewWarAsk, type WarAsk } from './warask'
import { useVersion } from './useStore'
import { askLw, isOilUp, lwNavVersion, subscribeLwNav } from './lwnav'
import { fig, myLeaveOf } from './myleave'
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

/* THE TABS' TWO SMALL GLYPHS, in the line style of the app's icons (ui/icons.tsx — the Inputs page's tabs wear them). */
function GridGlyph() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M3.5 9.5h17M3.5 14.5h17M9.5 3.5v17M14.5 3.5v17" />
    </svg>
  )
}
function ClockGlyph() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
    </svg>
  )
}
function GearGlyph() {
  return (
    <svg className="btnglyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  )
}

/* the period list's last line, "+ New period" (D1244) — a value no period id can be */
const NEW_PERIOD = '\u0000new'

export function Topbar() {
  useVersion()
  const { period, wars, role, viewer, people } = getState()
  useSyncExternalStore(subscribeLwNav, lwNavVersion, lwNavVersion)
  const oilUp = isOilUp()
  /* THE LEAVE WAR'S NAVIGATION AS DRAWN IN ROUND 19 (D1254, 22 Oct 26 — "N1 as recommended"; narrowing D1196, D1231, D678,
     D679, D1141 and the 5 Sep 26 grid bar; drawn `docs/mock/lw-overhaul/full-r19-nav.mjs`, `full/r19-nav-*`, and with the
     grid's order `full/r21-rows-*`):
     · ONE TAB ROW, the Inputs page's own (`inputs-tabs` / `intab` — the same look, the same keyboard), with ⚙ at its right
       end for an admin. Its tabs are the ones whose page exists: Grid and OIL now — Approvals joins with its list (M4) and
       Balances with its page (M5), never as a tab with nothing behind it (the build plan's rule for the Approvals button).
       OIL opens the OIL tracker, as the grid card's OIL button did, and reads as the chosen tab while it is up.
     · THEN "View", the period picker and My leave — on a desktop in that same one row (the tabs, View, My leave, ⚙: D679 as
       narrowed); on a phone a second line under the tabs (D678 as narrowed — an admin's third line is gone, D1227's line now
       everyone's).
     · "View", never "Period" (D1174); no "Viewing as" chip (D1173 — the person signed in knows who he is; My leave carries
       his figures); "+ New period" is the period list's last line, an admin's only (D1244), not a button on the row.
     Undo / Redo left this row long ago for the app's top bar (D347). */
  const phone = usePhone()
  const [making, setMaking] = useState(false)
  /* THE SHEET ASKED FOR FROM DAYS (ui/warask.ts): the Holidays list cannot write a holiday on dates no leave period
     holds, and asks for THIS sheet — the one "+ New period" opens — with those dates picked. The ask is taken once: an admin
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
     "+ New period" opens as it always has: no dates picked, at its own layer */
  const closeSheet = () => { setMaking(false); setAsked(null) }
  /* MY LEAVE (D1141): the person signed in, when he has a row on the war — an admin with none has no "my" to show */
  const me = viewer && people.some(p => p.id === viewer) ? viewer : null
  const mine = me ? myLeaveOf(figureCtxOf(), wars, me, memberToday()) : null
  /* the tabs, a tab list in the usual manner (as the Inputs page's): one tab stop, the arrow keys move along it */
  const tabs: Array<['grid' | 'oil', string, () => void]> = [
    ['grid', 'Grid', () => askLw({ kind: 'grid' })],
    ['oil', 'OIL', () => askLw({ kind: 'oil' })],
  ]
  const tabOn = (t: 'grid' | 'oil') => (t === 'oil') === oilUp
  const tabKey = (e: ReactKeyboardEvent, i: number) => {
    const by = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!by) return
    e.preventDefault()
    const to = tabs[(i + by + tabs.length) % tabs.length]!
    to[2]()
  }
  const tabRow = (
    <div className="inputs-tabs lw-tabs" role="tablist" aria-label="Leave War">
      {tabs.map(([t, label, go], i) => (
        <button
          key={t}
          type="button"
          role="tab"
          className="intab"
          data-testid={t === 'oil' ? 'oil-tracker' : 'lw-tab-grid'}
          aria-selected={tabOn(t)}
          tabIndex={tabOn(t) ? 0 : -1}
          title={t === 'oil' ? 'OIL balances, credits and history' : 'The leave grid'}
          onClick={go}
          onKeyDown={e => tabKey(e, i)}
        >
          {t === 'grid' ? <GridGlyph /> : <ClockGlyph />}
          <span className="intab-t">{label}</span>
        </button>
      ))}
    </div>
  )
  const gear = role === 'admin' && (
    <button
      type="button"
      className="lw-gear"
      data-testid="settings-open"
      title="Settings — counters, event rows, roster groups and the order of the grid"
      aria-label="Settings"
      onClick={() => askLw({ kind: 'settings' })}
    >
      <GearGlyph />
    </button>
  )
  const view = (
    <span className="lw-view">
      <span className="lab" data-testid="period-label">View</span>
      {/* A native select rather than a popover: it is the one control that works the same on a phone, a desktop and a
          keyboard. Each option is the war's NAME; an admin's list ends with "+ New period" (D1244), which opens the same
          new-period window "+ New" did and leaves the period on screen as it was. */}
      <select
        className="wk on warpick"
        data-testid="war-picker"
        aria-label="View — which leave period"
        value={period.id}
        onChange={e => { if (e.target.value === NEW_PERIOD) setMaking(true); else selectWar(e.target.value) }}
      >
        {wars.map(w => (
          <option key={w.period.id} value={w.period.id}>
            {w.period.name}
          </option>
        ))}
        {role === 'admin' && <option value={NEW_PERIOD} data-testid="war-new">+ New period</option>}
      </select>
    </span>
  )
  const myLeave = mine && me && (
    /* his own leave at a glance; a tap opens his person window (until the overhaul's person window, M5, today's — the
       build plan's batch 4), where each of his leave and its state is listed */
    <button type="button" className="myleave" data-testid="my-leave" onClick={() => askLw({ kind: 'person', id: me })}>
      <span className="ml-hd">My leave{mine.next && <span className="ml-next"> · next {nextLabel(mine.next)}</span>}</span>
      <span className="ml-figs">
        <b data-testid="my-leave-lve">LVE {fig(mine.lve)}</b> · <span data-testid="my-leave-oil">OIL {fig(mine.oil)}</span> · <span data-testid="my-leave-pending">{fig(mine.pending)} pending</span>
      </span>
      <span className="ml-go" aria-hidden="true">›</span>
    </button>
  )
  return (
    <>
    <div className={`topbar lw-top${phone ? ' lw-top-ph' : ''}`}>
      {tabRow}
      {!phone && view}
      {!phone && <span className="lw-spring" />}
      {!phone && myLeave}
      {gear}
    </div>
    {phone && (
      <div className="lw-viewline">
        {view}
        {myLeave}
      </div>
    )}
    {/* OUTSIDE `.topbar`, and that is load-bearing rather than tidiness: `.topbar` carries `backdrop-filter`, which makes
        it the containing block for any `position: fixed` descendant — the sheet would render clipped at the top of the
        page instead of at the bottom of the viewport. */}
    {making && <WarSheet key={asked ? `${asked.from}|${asked.to}` : 'new'} initial={asked} raised={!!asked} onClose={closeSheet} />}
    </>
  )
}

/* "next 30 Jan" — the day and month, as drawn; the year only when it is not this year's */
function nextLabel(iso: string): string {
  const d = shortDate(iso)
  return iso.slice(0, 4) === memberToday().slice(0, 4) ? d.slice(0, d.lastIndexOf(' ')) : d
}

/** THE GRID'S OWN BAR (D1254, D1196 as narrowed, D1243): [▸ Manning | 1 red ›] · the open dates · … · Legend — the same for
 *  everyone, standing on the grid card above the month buttons (`full/r19-nav-*`, `full/r21-rows-*`). The grid hands it
 *  the Manning fold (its own state — the counts it hides are the grid's rows) and anything that rides the bar's right end
 *  before Legend (the zoom pair until pinch to zoom replaces it — [LW-PHONE-PINCH-ZOOM], D1228; "Done" while rearranging). */
export function StageBar({ manningOpen = true, onManning, extra }: { manningOpen?: boolean; onManning?: () => void; extra?: ReactNode } = {}) {
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
    <div className="filters lw-gridbar">
      {/* MANNING, AT THE LEFT, AND ITS COUNT OF RED DAYS AS ITS RIGHT HALF (D1240, D1243 — "1 red ›"): the left half folds
          the Manning rows (a view toggle, either role); the right half counts the days a Manning, Available P or Available
          W row is below its rule — red only, amber is not counted — and a tap lists them, a tap on a line takes the grid
          there (today's list, in the new place). With no red day the right half goes and the button reads "Manning". */}
      <span className={`lw-manning${redDays > 0 ? ' has-red' : ''}`}>
        <button
          type="button"
          className="fchip mn-l"
          data-testid="counts-toggle"
          aria-expanded={manningOpen}
          title={manningOpen ? 'Hide the manning counts' : 'Show the manning counts'}
          onClick={onManning}
        >
          <span className="mn-car" aria-hidden="true">{manningOpen ? '▾' : '▸'}</span> Manning
        </button>
        {redDays > 0 && (
          <button
            type="button"
            ref={chipRef}
            className="fchip mn-r undermanned"
            data-testid="undermanned"
            onClick={() => setListOpen(o => !o)}
            aria-expanded={showList}
            aria-label={`${redDays} red day${redDays === 1 ? '' : 's'}: show the days that break a manning rule`}
            title="Show the days that break a manning rule"
          >
            <b>{redDays}</b> red <span aria-hidden="true">›</span>
          </button>
        )}
      </span>
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
      <span className="lw-spring" />
      {extra}
      {/* The colour/mark KEY, at the bar's right end (D1254 — as drawn). Read-only for everyone — it explains the grid,
          it does not change it. */}
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
