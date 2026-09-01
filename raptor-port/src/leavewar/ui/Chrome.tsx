// Raptor's topbar idiom plus a stage strip below it. Only real, computable
// facts are surfaced here — no dead nav links to pages that don't exist
// yet (My leave, Ledger, Rules, Roster) and no "closes in N days", which
// the engine does not model. See CLAUDE-facing restyle brief for why.

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { biddingClosed, canReopen, evaluatePeriod, isBiddable, isDuty, nextStage, previousStage, stageLabel } from '../engine'
import { CODE_GLOSSARY } from '../engine/codes'
import { getClashes, getClashVersion, subscribeClashes } from '../sync'
import {
  advanceStage,
  clearBidWindow,
  focusDay,
  lwCanRedo,
  lwCanUndo,
  lwRedo,
  lwUndo,
  reopenStage,
  getState,
  selectWar,
  setBidWindow,
} from '../state/store'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { shortDate, shortSpan } from './dates'
import { WarSheet } from './WarSheet'
import { useVersion } from './useStore'
import './chrome.css'

/** Kept in step with `.umlist`'s width in chrome.css — the clamp has to know
 *  how wide the thing it is clamping actually is. */
const LIST_WIDTH = 244
/** Same, for the colour/mark legend popover (`.leglist`). */
const LEGEND_WIDTH = 272

export function Topbar() {
  useVersion()
  const { period, wars, role, people, viewer } = getState()
  const [making, setMaking] = useState(false)
  // WHOSE view this is (owner, 28 Aug 26 — "make it obvious that im viewing as
  // for example RANGER"). The whole grid — the lit row, the counter column, the
  // figure sheets — answers for the viewing person (Raptor's "View as",
  // mirrored in), and nothing on the page said so out loud. This chip does, at
  // the top of the page where it is always in view. Absent when nobody is being
  // viewed (an admin off any one person), where there is no "you" to name.
  const me = viewer ? people.find(p => p.id === viewer) ?? null : null
  return (
    <>
    {/* The Leave War page's own "142 SQN / LEAVE WAR" mark and "Leave war" nav
        pill were REMOVED (owner, 18 Aug 26 — "142 is repeated… takes too much
        space"). Raptor's shell topbar already carries the 142 SQN identity and
        highlights the Leave War tab, so a second copy under it was pure
        duplication and a band of wasted height on a phone. What stays is the
        real controls only: the period picker here, and the stage strip below. */}
    <div className="topbar">
      <div className="spring">
        {/* A native select rather than a popover: it is the one control that
            works the same on a phone, a desktop and a keyboard, and it needs
            no geometry of its own inside a page that already has a scroller
            and three sheets.

            Each option is the war's NAME only. Adding its stage would widen
            the closed chip to whatever the longest label is, and the stage
            strip immediately below already names the current war's — so the
            cost lands on every phone screen to answer a question only
            someone mid-switch is asking. */}
        {/* The picker carried only the war's name, which says what is in it
            and not what it is. Every chip in the stage strip below is
            labelled this way already. */}
        <span className="lab" data-testid="period-label">Period</span>
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
          <button className="warnew" data-testid="war-new" onClick={() => setMaking(true)}>
            + New
          </button>
        )}
        {/* Undo / redo (owner, 30 Aug 26 — circled the top bar: "Add undo and
            redo on leave war here"). Placed in Leave War's OWN top row — the
            equivalent spot to the schedule's undo/redo, which the app shell only
            shows on the Edit Schedule page — rather than reaching up into the
            shared shell bar (that would cross the Leave War app boundary for a
            button). Shown to everyone: a member undoes their own bids, an admin
            anything. The .bi/.bl split matches the schedule's pair so the label
            drops to an icon on a narrow phone; the accessible name stays the
            word. Disabled state reads the store, and this bar re-renders on
            every store change (useVersion above), so the buttons grey out the
            instant there is nothing left to undo. */}
        <div className="lw-hist" data-testid="lw-hist">
          <button
            className="lw-hbtn"
            data-testid="lw-undo"
            title="Undo the last change"
            disabled={!lwCanUndo()}
            onClick={lwUndo}
          >
            <span className="bi" aria-hidden="true">↶</span><span className="bl"> Undo</span>
          </button>
          <button
            className="lw-hbtn"
            data-testid="lw-redo"
            title="Redo"
            disabled={!lwCanRedo()}
            onClick={lwRedo}
          >
            <span className="bi" aria-hidden="true">↷</span><span className="bl"> Redo</span>
          </button>
        </div>
        {me && (
          <span
            className="lw-viewing"
            data-testid="lw-viewing"
            title={`Every number on this page is ${me.callsign}'s. Change whose with "View as" in the top bar.`}
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
    {making && <WarSheet onClose={() => setMaking(false)} />}
    </>
  )
}

/**
 * Choose which dates the squadron may bid on.
 *
 * The refusals are the store's, not this sheet's: `setBidWindow` re-checks
 * the role and the bounds because the role switch is an affordance rather
 * than a permission, and the picker's own `min`/`max` only stop the mistake
 * being made in the first place.
 */
function WindowSheet({ onClose }: { onClose: () => void }) {
  const { period } = getState()
  const [range, setRange] = useState<Range | null>(
    period.bidFrom && period.bidTo ? { from: period.bidFrom, to: period.bidTo } : null,
  )
  const [problem, setProblem] = useState('')

  const apply = () => {
    const result = range ? setBidWindow(range.from, range.to) : clearBidWindow()
    if (result === 'set') return onClose()
    setProblem(
      result === 'outside'
        ? `Those dates leave ${period.name}, which runs ${shortSpan(period.start, period.end)}.`
        : result === 'backwards'
          ? 'The end date is before the start date.'
          : 'Only an admin can open bidding.',
    )
  }

  return (
    <Sheet testid="window-sheet" label="Open bidding on" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">OPEN BIDDING ON</span>
        <span className="dt">{period.name}</span>
        <button className="x" data-testid="window-cancel" onClick={onClose} aria-label="Cancel">
          ✕
        </button>
      </div>
      <div className="bidsheet-row">
        <RangePicker
          testid="window"
          min={period.start}
          max={period.end}
          value={range}
          onChange={setRange}
        />
      </div>
      <div className="bidsheet-row">
        <span className="lab" />
        <button className="dchip approve" data-testid="window-apply" onClick={apply}>
          {range ? 'Open these dates' : 'Open the whole year'}
        </button>
        {/* Clearing is a real choice, not a fallback: before a schedule firms
            up at all, the whole year being open is the right state. */}
        <span className="note">
          The year stays on screen. Only these dates are editable by the squadron.
        </span>
        {problem && <span className="note warn" data-testid="window-problem">{problem}</span>}
      </div>
    </Sheet>
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
  const { people, period, grid, states, requirements, role } = getState()
  const dates = period.days.map(d => d.date)
  // Duplicates the same evaluatePeriod call Matrix makes internally. Both
  // stay self-contained (no prop plumbing between them) so Matrix keeps
  // rendering standalone in its existing tests; the cost is one extra pass
  // over a 90-day period, which is not worth threading props for. Both must
  // be handed the same `states`, or the strip counts a different squadron
  // from the one the grid below it is painting.
  const verdicts = evaluatePeriod(people, grid, states, requirements, dates)
  // The red days themselves, not just how many. Recomputed every render like
  // the tally beside them: a list built once would send a scheduler to a day
  // a refusal had already recovered.
  const red = dates.filter(d => verdicts[d].verdict === 'red')
  const redDays = red.length
  const next = nextStage(period.stage)
  // The way back, and who may take it. Both asked of the engine rather than
  // worked out here, so the control the strip draws and the write the store
  // will accept cannot disagree.
  const back = canReopen(period.stage, role) ? previousStage(period.stage) : null
  const [listOpen, setListOpen] = useState(false)
  const showList = listOpen && redDays > 0

  // Where the list hangs. Measured, because the strip wraps: the chip is in a
  // different place on a phone than on a desktop, and a list anchored to its
  // left edge runs off the right of a narrow viewport and stops being
  // clickable at all.
  const chipRef = useRef<HTMLButtonElement>(null)
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
    <div className="filters">
      <span className="lab">Stage</span>
      <span
        className={`fchip${period.stage === 'open' ? ' stage-open' : ''}`}
        data-testid="stage-now"
      >
        {stageLabel(period.stage)}
      </span>
      {/* The control sits beside the stage it moves, so the strip reads as
          one thing rather than as a label and an unrelated button. It names
          the stage it will move TO — the label answers "what does this do",
          and the chip immediately to its left is already showing where the
          period stands.
          Forward only, and disabled at the end of the cycle: `nextStage`
          owns which transitions exist and this asks it rather than deciding
          for itself.
          ADMIN ONLY, absent rather than disabled for a member (owner, 27 Aug
          26 — "for a member i shouldnt be able to click on bidding closed or
          published, thats an admin function"), the same idiom as the back
          control below; the store's advanceStage refuses a member write
          regardless. Members still BID as before — this is the only
          member-facing change. */}
      {role === 'admin' && <button
        className="stage-go"
        data-testid="stage-advance"
        disabled={next === null}
        title={next ? `Move this period to ${stageLabel(next)}` : 'The cycle ends at published'}
        onClick={advanceStage}
      >
        → {next ? stageLabel(next) : 'END OF CYCLE'}
      </button>}
      {/* Stepping the cycle BACK — how bidding is opened again after being
          closed (owner, 10 Aug 26). Admin only, and absent rather than
          disabled for a member: a disabled control advertises something they
          cannot have, and this one is not theirs to want.

          It names where it returns to, exactly as the forward control names
          where it goes, so the two read as one cycle. Nothing here is
          destructive — every decision already made survives the move; see
          `reopenStage`. */}
      {back && (
        <button
          className="stage-go"
          data-testid="stage-back"
          title={`Step this period back to ${stageLabel(back)}. Bids and decisions already made are kept.`}
          onClick={reopenStage}
        >
          ← {stageLabel(back)}
        </button>
      )}
      {/* Which part of the year the squadron may bid on. The war is a whole
          year on screen and the schedule firms up a quarter at a time, so
          this is what "the admin opens a period" means — the year stays
          visible and this much of it is writable.

          Only shown while the war is OPEN: a draft or closed war is shut to
          the squadron on every date, and a window advertised beside "BIDDING
          CLOSED" would contradict it. */}
      {period.stage === 'open' && (
        <>
          <span className="lab" style={{ marginLeft: 12 }}>Bidding on</span>
          <button
            className={`fchip winchip${role === 'admin' ? ' can' : ''}`}
            data-testid="bid-window"
            disabled={role !== 'admin'}
            title={role === 'admin'
              ? 'Choose which dates the squadron may bid on'
              : 'The dates the squadron may bid on'}
            onClick={() => setPicking(true)}
          >
            {period.bidFrom && period.bidTo
              ? shortSpan(period.bidFrom, period.bidTo)
              : 'THE WHOLE YEAR'}
          </button>
        </>
      )}
      {/* The standalone app's "Viewing as" role toggle stood here — an
          unverified affordance anyone could flip, because that app had no
          login. Inside Raptor there IS a login: the role now comes from the
          session (resetSession → setRole, admin account = admin here), the
          Raptor topbar already shows the Admin/Member badge, and a toggle
          that disagreed with the login would be a lie. Do not re-add it. */}
      <span className="lab" style={{ marginLeft: 12 }}>Under-manned</span>
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
        title={redDays === 0
          ? 'No day in this war breaks a manning rule'
          : 'Show the days that break a manning rule'}
      >
        {redDays} day{redDays === 1 ? '' : 's'}
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
              <div className="leg-sec">The fill colour — where a bid stands</div>
              <div className="leg-row"><span className="leg-sw appr">LL</span><span className="leg-t">Approved</span></div>
              <div className="leg-row"><span className="leg-sw tbc">LL</span><span className="leg-t">Pending — waiting on a decision</span></div>
              <div className="leg-row"><span className="leg-sw ref">LL</span><span className="leg-t">Refused</span></div>
              <div className="leg-sec">The left edge — where it came from</div>
              <div className="leg-row"><span className="leg-sw raptor">LL</span><span className="leg-t">Filed on the Inputs page — change it there, not here</span></div>
              {/* The moved stripe exists only once bidding has closed
                  (movedShown, one biddingClosed body with the store) — while
                  the war is open the legend must not advertise a mark no cell
                  can wear, sending readers hunting for it. */}
              {biddingClosed(period.stage) && (
                <div className="leg-row"><span className="leg-sw moved">LL</span><span className="leg-t">Moved here from another day</span></div>
              )}
              <div className="leg-sec">The <b>*</b> — a half day</div>
              <div className="leg-row"><span className="leg-sw plain">*LL</span><span className="leg-t">AM (before the code)</span></div>
              <div className="leg-row"><span className="leg-sw plain">LL*</span><span className="leg-t">PM (after the code)</span></div>
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
                      <span className={'leg-sw ' + (isDuty(r.show) ? 'sc' : !isBiddable(r.show) ? 'info' : 'plain')}>{r.show}</span>
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
      {role === 'admin' && clashes.length > 0 && (
        <div className="syncclash" data-testid="sync-clashes">
          <span className="n">
            {clashes.length} clash{clashes.length === 1 ? '' : 'es'} with the schedule
          </span>
          {clashes.map((c, i) => (
            // kind AND both codes AND the index join the key (review fix,
            // 19 Aug 26 — kind alone was not enough): two split-clashes, or a
            // split-clash beside an ingest clash, legitimately share one
            // person, date and kind (a full-day LL plus a PM OML against one
            // approved bid), and a duplicate key drops one strip row on
            // repaint — hiding a clash the admin must resolve. The list is
            // re-derived whole on every pass, so the index is a safe
            // tiebreak, not a reorder hazard.
            <span className="row" key={`${c.kind ?? 'leave'}-${c.person}-${c.date}-${c.inputCode}-${c.bidCode}-${i}`}>
              {c.kind === 'duty'
                ? <>{(people.find(p => p.id === c.person)?.callsign ?? c.person)}: weekend/PH work
                    earns {c.inputCode} but {shortDate(c.date)} holds {c.bidCode} — resolve on the sheet</>
                : <>{(people.find(p => p.id === c.person)?.callsign ?? c.person)}: input {c.inputCode} vs
                    bid {c.bidCode} on {shortDate(c.date)} — resolve on the sheet</>}
            </span>
          ))}
        </div>
      )}
      {/* Rendered inside `.filters` rather than `.topbar`, which carries no
          `backdrop-filter` — see the note on WarSheet in Topbar for why that
          distinction decides where a `position: fixed` sheet actually lands. */}
      {picking && <WindowSheet onClose={() => setPicking(false)} />}
    </div>
  )
}
