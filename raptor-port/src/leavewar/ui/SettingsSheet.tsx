/* THE ONE ⚙ SETTINGS SHEET (owner, 3 Sep 26 — "this row will just have a settings
   icon and an OIL tracker … inside the settings icon"). Every admin CONFIG control
   folds in here: the counters and event rows up top, then the roster GROUPS below.
   What is NOT here is REARRANGING — moving people and reordering the category blocks
   is a hands-on-the-grid job (owner: "I thought the rearrange could be done on the
   grid main page itself"), so it lives on the grid in rearrange mode, not in this
   window.

   The groups editor is folded in from the old GroupSheet, squeezed into tight rows
   ("make use of the space and squeeze the data"). This sheet ADDS/REMOVES groups,
   REORDERS them (owner, 3 Sep 26 — "allow me to drag and drop to rearrange the
   groups": the ⠿ grip, the same machine and the same write as the grid's heading
   grip, so the two never disagree), PICKS a qualification group's colour ("allow me
   to pick the colour i want" — a palette strip that opens under the row the moment
   the group is added, and again from its swatch), shows who is in each, and sets the
   OVERRIDE who-wins order. Who-wins follows the page order by default (owner: "the
   priority order should also change by default in accordance with the category
   order"); the "Who wins" list is tucked behind a disclosure, opened only when
   someone wants a different order. */

import { Fragment, useEffect, useState } from 'react'
import {
  assignGroup,
  groupLabel,
  type Person,
  matchesGroup,
  OTHER_ID,
  OTHER_LABEL,
  SANS_GROUP_ID,
  type GroupDef,
} from '../engine'
import {
  addEventRow,
  addGroup,
  clearGroupPriority,
  DEFAULT_EVENT_ROWS,
  eventRowUsed,
  getState,
  groupsInOrder,
  groupPriorityIds,
  isGroupPriorityCustom,
  MAX_EVENT_ROWS,
  offerableGroupList,
  removeEventRow,
  resetGroups,
  resetRosterOrder,
  rosterFollowsDefault,
  setGroupColor,
  setGroupDefs,
  setShowSans,
} from '../state/store'
import { subLwScreen, isLwOnScreen } from '../state/screen'
import { Sheet } from './Sheet'
import { PALETTE, groupColorOf, isColourable } from './groupColor'
import './bidpicker.css'

export function SettingsSheet({
  onClose,
  onAddCounter,
  onDays,
  onEvents,
  onRearrange,
  onGroupDragStart,
  onPriorityDragStart,
  draggingId,
  dragOver,
  dragAfter,
  shown,
}: {
  onClose: () => void
  /** Open the counter builder (Matrix owns the form + its `counterEdit` state). */
  onAddCounter: () => void
  /** Open Days — the admin's window that says what kind of day each date is (Matrix closes this sheet first). */
  onDays: () => void
  /** Open the Events list — the Event rows' events over the period in View (D1500; Matrix closes this sheet first). */
  onEvents?: () => void
  /** Turn the grid's Rearrange on — the drag handles on its rows (Matrix closes this sheet first). Rearrange moved here
   *  from the grid card's bar (D1254). */
  onRearrange?: () => void
  /** Drag in the groups list (display order — the same write as the grid's heading
   *  grip) and in the who-wins (priority) list — both wired by Matrix to the one
   *  drag machine. */
  onGroupDragStart?: (e: React.PointerEvent, id: string) => void
  onPriorityDragStart?: (e: React.PointerEvent, id: string) => void
  draggingId?: string | null
  dragOver?: string | null
  /** The pointer is in the hovered row's LOWER half — the drop lands after it,
   *  so the bar is drawn on its bottom edge (the roster rows' `.after`). */
  dragAfter?: boolean
  /** The grid's "does his row ride the months on screen" test (Matrix's rowInWindow over its measured window): Reset
   *  order judges the order of the men the grid DRAWS, not of the whole roster ([LW-SETTINGS-SMALL]). */
  shown?: (p: Person) => boolean
}) {
  const { people, qualCatalog, eventRows, showSans, groupColors } = getState()
  // the roster, as drawn, is out of the default order — Reset order has something to do (judged by what the grid
  // SHOWS, so a drag away and back reads as the default: rosterFollowsDefault)
  const handOrder = !rosterFollowsDefault(shown)
  // Reset order ARMS first; local, so closing the sheet takes the question back
  const [armOrder, setArmOrder] = useState(false)
  // …and so does leaving the Leave War: the page is kept mounted, so an open sheet survives a page switch, and a
  // "Really reset?" met again on coming back would reset on one tap the person no longer knows was the second
  // ([LW-SETTINGS-SMALL]). The page's own on-screen signal (a listener set, not the store — nothing re-renders the grid).
  useEffect(() => subLwScreen(() => { if (!isLwOnScreen()) setArmOrder(false) }), [])
  /* …and when the line greys under it (the grid scrolled to months where the order is the default, an Undo): an armed
     question never waits on a greyed line to fire on one tap when it lights again (the blind read's L2) */
  useEffect(() => { if (!handOrder) setArmOrder(false) }, [handOrder])
  const chosen = groupsInOrder()
  const offered = offerableGroupList()
  const priority = groupPriorityIds()
  const chosenIds = new Set(chosen.map(d => d.id))
  // Which group draws each person — ONE walk per render, shared by every row's
  // count and by the who-is-in list (`groupIdOf` per person per row re-derived
  // the group order each call: groups × people × 3 reads, for nothing).
  const homeOf = new Map(people.map(p => [p.id, assignGroup(p, chosen, priority)]))
  const overClass = (id: string) =>
    dragOver === id && draggingId !== id ? (dragAfter ? ' dragover after' : ' dragover') : ''
  const custom = isGroupPriorityCustom()
  const lastEventRowUsed = eventRowUsed(eventRows - 1)
  // Which group's people are lit (tap a name to show, tap again to clear).
  const [lit, setLit] = useState<string | null>(null)
  // The who-wins override is tucked away — rarely touched (owner, 3 Sep 26).
  const [whoOpen, setWhoOpen] = useState(false)
  // Which qualification group's colour palette is open under its row. Opened by
  // the add (pick straight after adding) and by the row's swatch. It closes the
  // moment a colour is picked (see the dot below), and closes on a click outside
  // it — the app's standing rule for a click-open popup (owner, 4 Sep 26 — "if i
  // close outside the box … it should close the colour pallete. or after i
  // selected a colour it will auto close … build pop up windows to have auto
  // close feature if i click outside of it").
  const [colorFor, setColorFor] = useState<string | null>(null)
  useEffect(() => {
    if (!colorFor) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      // A press on the palette itself, or on any group's colour swatch, is not
      // "outside": the swatch owns its own open/close toggle, so leaving it to
      // that button avoids a close-then-reopen fight on the same tap.
      if (t && (t.closest('.set-palette') || t.closest('.set-swbtn'))) return
      setColorFor(null)
    }
    /* Escape peels the palette first, not the whole sheet: the Sheet's own
       Escape listens on `document` (capture), and a `window` capture listener
       runs ahead of it, so stopping the event here leaves the sheet up. */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Kept-mounted guard (as Sheet.tsx): act only while Leave War is showing.
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      setColorFor(null)
    }
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [colorFor])

  const label = (d: GroupDef) => groupLabel(d, qualCatalog)
  const shownIn = (d: GroupDef) => people.filter(p => homeOf.get(p.id) === d.id)
  const membersOf = (d: GroupDef) => people.filter(p => matchesGroup(p, d))

  // Remove a group. The SANS row is not a stored group — its ✕ just turns the
  // Show SANS switch back off (owner, 3 Sep 26); everything else drops normally.
  const drop = (d: GroupDef) => {
    if (d.kind === 'sans') { setShowSans(false); return }
    setGroupDefs(chosen.filter(x => x.id !== d.id && x.id !== SANS_GROUP_ID))
  }

  const litDef = lit ? chosen.find(d => d.id === lit) ?? null : null
  const swClass = (id: string) => `set-sw g-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <Sheet testid="settings-sheet" label="Settings" onClose={onClose}>
      {/* THE WINDOW AS DRAWN IN M5b ROUND 1 (owner D1499, 29 Oct 26 — "All as recommended"; it answers his D1205, "very
          wordy and not clean and not intuitive"; the drawing docs/mock/lw-overhaul/full/m5b/m5b-d1-settings-*, made by
          full-m5b-draw.mjs). The title is "SETTINGS" alone; the three trays and their sentences became the bid window's
          own label rows — Year, Manning, Order — and the groups' sentences went (215 words to 104). What each button
          does still rides its title, read on a hover and by a screen reader. */}
      <div className="bidsheet-hd">
        <span className="who">SETTINGS</span>
        <button className="x" data-testid="settings-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="set-rows">
        {/* ---- Year: Calendar… — the Inputs / SANS calendar job's way in (plan §3.3). ON SCREEN IT IS "CALENDAR" (owner,
            D675, 8 Oct 26); the code and the working records still call the window Days. It opens the scheduler's Days
            window, where each date is set day flying, night flying or no fly, and where the year's public holidays and
            Off days are one list (the same records as the Event rows here). The sheet closes first — Days is a window
            that leaves the grid working behind it (D641), and this sheet would cover it.
            Events… (D1500) opens the Event rows' events over the period in View as one list; this sheet closes first too. */}
        <div className="bidsheet-row">
          <span className="lab">Year</span>
          <button
            className="rtbtn"
            data-testid="settings-days"
            title="Open the Calendar — set each date day flying, night flying or no fly, and the year's holidays"
            onClick={onDays}
          >Calendar…</button>
          <button
            className="rtbtn"
            data-testid="settings-events"
            title="Every event on the Event rows, in the period in View"
            onClick={onEvents}
          >Events…</button>
        </div>
        {/* ---- Manning: the counters and the Event rows. ("↺ Reset counters" stood here until D669 (owner, 8 Oct 26): the
            Manning block now comes with no counters, so there is nothing to go back to.) The Show SANS switch that
            stood here went with D1221 / D1499: "+ SANS" is the first of the add chips below. */}
        <div className="bidsheet-row">
          <span className="lab">Manning</span>
          <button
            className="rtbtn"
            data-testid="counter-add"
            title="Add a manning counter — pick who it counts and when it turns amber or red"
            onClick={onAddCounter}
          >＋ Counter</button>
          <button
            className="rtbtn"
            data-testid="event-add"
            disabled={eventRows >= MAX_EVENT_ROWS}
            title={eventRows >= MAX_EVENT_ROWS ? `At most ${MAX_EVENT_ROWS} event rows` : 'Add another event row'}
            onClick={() => addEventRow()}
          >＋ Event row</button>
          {eventRows > DEFAULT_EVENT_ROWS && (
            <button
              className="rtbtn"
              data-testid="event-remove"
              disabled={lastEventRowUsed}
              title={lastEventRowUsed ? 'Clear the last event row before removing it' : 'Remove the last event row'}
              onClick={() => removeEventRow()}
            >－ Event row</button>
          )}
        </div>
        {/* ---- Order: REARRANGE (moved here from the grid card's bar, D1254 — it turns the grid's drag handles on and
            closes this window; the grid's bar then carries "Done", the one way out) and RESET ORDER (owner, D160, 24 Sep
            26 — "9 yes": a "Reset order" line here; the grid's old Auto-sort button and strip stay gone). Reset order asks
            once — fifty rows arranged by hand are real work — and is greyed while the roster already follows the default
            (its title says so; the sentence under it went with D1499). The store clears the saved order (resetRosterOrder),
            so a man who joins later lands in his ranked place too; the one Undo brings the arrangement back. */}
        <div className="bidsheet-row">
          <span className="lab">Order</span>
          {onRearrange && (
            <button className="rtbtn" data-testid="settings-rearrange" title="Drag people and category blocks on the grid" onClick={onRearrange}>
              ⇅ Rearrange the grid
            </button>
          )}
          <button
            className={`rtbtn set-danger set-order${armOrder ? ' arm' : ''}`}
            data-testid="roster-reset-order"
            disabled={!handOrder}
            title={handOrder ? 'Put every row back in the default order — each group as listed below, pilots above WSOs, then by CAT and callsign' : 'The roster is already in the default order'}
            onClick={() => {
              if (!armOrder) { setArmOrder(true); return }
              setArmOrder(false)
              resetRosterOrder()
            }}
          >{armOrder ? 'Really reset?' : '↺ Reset order'}</button>
        </div>
      </div>

      {/* ---- the groups shown, top to bottom ---------------------------------- */}
      <div className="gs-sec">Groups</div>
      <div className="set-grows" data-testid="group-chosen">
        {chosen.map(d => {
          const isSans = d.kind === 'sans'
          const shown = shownIn(d).length
          const colour = groupColorOf(d.id, groupColors)
          const pickable = isColourable(d.id)
          return (
            <Fragment key={d.id}>
              <div
                className={`set-grow${isSans ? ' sans' : ''}${draggingId === d.id ? ' dragging' : ''}${overClass(d.id)}`}
                data-testid={`grow-${d.id}`}
                data-grow={isSans ? undefined : d.id}
              >
                {/* The SANS row is auto-placed at the foot and never moves; every
                    other row has the grip. Its pointerdown starts the drag; the
                    machine hit-tests `[data-grow]` under the pointer, which while
                    this sheet is up are these rows. */}
                {isSans
                  ? <span className="set-grip off" aria-hidden="true" />
                  : (
                    <span
                      className="set-grip"
                      data-testid={`gsdrag-${d.id}`}
                      title={`Drag to move ${label(d)}`}
                      style={{ touchAction: 'none' }}
                      onPointerDown={e => onGroupDragStart?.(e, d.id)}
                    >⠿</span>
                  )}
                {pickable
                  ? (
                    <button
                      className={`set-sw set-swbtn${colorFor === d.id ? ' on' : ''}`}
                      data-testid={`gcolor-${d.id}`}
                      style={{ background: colour }}
                      aria-label={`Pick a colour for ${label(d)}`}
                      title={`Pick a colour for ${label(d)}`}
                      aria-expanded={colorFor === d.id}
                      onClick={() => setColorFor(v => (v === d.id ? null : d.id))}
                    />
                  )
                  : <span className={swClass(d.id)} />}
                <button
                  className={`set-gname${lit === d.id ? ' on' : ''}`}
                  data-testid={`gpick-${d.id}`}
                  aria-pressed={lit === d.id}
                  onClick={() => setLit(v => (v === d.id ? null : d.id))}
                >{label(d)}</button>
                {isSans
                  ? <span className="set-badge">shown · counted</span>
                  : <span className="set-gkd">{d.kind === 'qual' ? 'qual' : 'cat'}</span>}
                <span className="set-gct">{shown}</span>
                <button
                  className="set-gdel"
                  data-testid={`gdrop-${d.id}`}
                  aria-label={isSans ? 'Hide SANS again' : `Remove the ${label(d)} group`}
                  title={isSans ? 'Hide SANS again' : `Remove the ${label(d)} group`}
                  onClick={() => { if (colorFor === d.id) setColorFor(null); drop(d) }}
                >✕</button>
              </div>
              {/* The colour palette for THIS group (owner, 3 Sep 26 — "allow me to
                  pick the colour i want"): twelve dots, the current one ringed. A
                  tap stores the pick; the heading swatch and the quals popover pill
                  both take it at once. */}
              {pickable && colorFor === d.id && (
                <div className="set-palette" data-testid={`gpalette-${d.id}`} role="radiogroup" aria-label={`Colour for ${label(d)}`}>
                  <span className="set-plab">Colour for {label(d)}</span>
                  <div className="set-dots">
                    {PALETTE.map(c => (
                      <button
                        key={c}
                        // case-blind: a stored pick is read leniently, any case
                        className={`set-dot${colour?.toUpperCase() === c ? ' on' : ''}`}
                        data-testid={`gdot-${d.id}-${c.slice(1).toLowerCase()}`}
                        role="radio"
                        aria-checked={colour?.toUpperCase() === c}
                        aria-label={c}
                        style={{ background: c }}
                        onClick={() => { setGroupColor(d.id, c); setColorFor(null) }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Fragment>
          )
        })}
        {/* EVERYONE ELSE, THE LIST'S LAST ROW (D1499 — in place of the sentence "Anyone no group above claims is shown
            under Everyone else, always last"): where people no group claims are drawn, always last on the grid. It cannot
            be moved or removed, so it has no grip, no colour and no ✕ — their places kept, so its count lines up with
            the rows above; no `data-grow`, so a drag never lands on it. A SANS man never falls into it (D1215: SANS is
            off the roster altogether until "+ SANS"). */}
        <div className="set-grow other" data-testid="grow-OTHER">
          <span className="set-grip off" aria-hidden="true" />
          <span className="set-sw set-swnone" aria-hidden="true" />
          <span className="set-gname">{OTHER_LABEL}</span>
          <span className="set-gkd">last</span>
          <span className="set-gct">{people.filter(p => homeOf.get(p.id) === OTHER_ID).length}</span>
          <span className="set-gdel off" aria-hidden="true" />
        </div>
      </div>

      {/* who is in the tapped group */}
      {litDef && (() => {
        const here = shownIn(litDef)
        const above = membersOf(litDef).filter(p => homeOf.get(p.id) !== litDef.id)
        return (
          <div className="gs-who" data-testid="group-members">
            <div className="gs-sec">Shown in {label(litDef)}</div>
            <div className="gs-chips">
              {here.map(p => (
                <span key={p.id} className="gs-chip" data-testid={`gmem-${p.id}`}>{p.callsign}</span>
              ))}
              {here.length === 0 && <span className="gs-empty">nobody — every one of them is claimed higher up</span>}
            </div>
            {above.length > 0 && (
              <>
                <div className="gs-sec">Also fit it, but shown higher up</div>
                <div className="gs-chips">
                  {above.map(p => (
                    <span key={p.id} className="gs-chip muted" data-testid={`gelse-${p.id}`}>{p.callsign}</span>
                  ))}
                </div>
                <div className="gs-note">
                  Move {label(litDef)} higher on the grid (or under <b>Who wins</b>) to draw them here instead.
                </div>
              </>
            )}
          </div>
        )
      })()}

      {/* ---- add a group ---------------------------------------------------- */}
      <div className="gs-sec">Add a group</div>
      <div className="gs-chips" data-testid="group-offer">
        {/* "+ SANS" FIRST, while SANS is off (owner D1221, D1499; D1215 — SANS men are off the war unless he puts them on,
            the squadron's main way): it puts them on as their own group at the foot, counted by seat like everyone
            else; its row's ✕ takes them off again. It replaced the Show SANS switch. */}
        {!showSans && (
          <button className="tchip" data-testid="gadd-SANS" title="Put SANS aircrew on the Leave War, as their own group at the foot" onClick={() => setShowSans(true)}>
            + SANS
          </button>
        )}
        {offered.filter(d => !chosenIds.has(d.id)).map(d => (
          <button
            key={d.id}
            className="tchip"
            data-testid={`gadd-${d.id}`}
            // Adding a qualification group opens its palette straight away, so the
            // colour is picked as part of adding it (owner, 3 Sep 26).
            onClick={() => { addGroup(d); setColorFor(isColourable(d.id) ? d.id : null) }}
          >
            + {label(d)}
          </button>
        ))}
        {showSans && offered.every(d => chosenIds.has(d.id)) && <span className="gs-empty">every group is already shown</span>}
      </div>

      {/* ---- who wins (the override, tucked away) ---------------------------- */}
      <button
        className="set-disc"
        data-testid="who-wins-toggle"
        aria-expanded={whoOpen}
        onClick={() => setWhoOpen(o => !o)}
      >
        <span className="cv">{whoOpen ? '▾' : '▸'}</span>
        <span className="dl">Who wins when someone fits two</span>
        <span className="dh">{custom ? 'custom order set' : 'follows the page'}</span>
      </button>
      {whoOpen && (
        <>
          <div className="gs-note">
            {custom
              ? 'A custom order is set, so it no longer follows the page. Drag to change it.'
              : 'Right now this follows the page order (higher on the grid wins). Drag a group here to set your own order instead.'}
          </div>
          <div className="clist" data-testid="group-priority">
            {priority.filter(id => id !== SANS_GROUP_ID).map((id, i) => {
              const d = chosen.find(x => x.id === id)
              if (!d) return null
              return (
                <div
                  key={id}
                  className={`crow-wrap gs-row${draggingId === id ? ' dragging' : ''}${overClass(id)}`}
                  data-gprio={id}
                  data-testid={`gprio-${id}`}
                >
                  <span
                    className="drag"
                    data-testid={`gpdrag-${id}`}
                    title={`Drag to change where ${label(d)} ranks`}
                    style={{ touchAction: 'none' }}
                    onPointerDown={e => onPriorityDragStart?.(e, id)}
                  >⠿</span>
                  <span className="crow bdrow">
                    <span className="crow-top"><span className="cn">{i + 1}. {label(d)}</span></span>
                  </span>
                </div>
              )
            })}
          </div>
          {custom && (
            <div className="cfoot">
              <button className="creset" data-testid="who-wins-reset" onClick={() => clearGroupPriority()}>
                Match the page order
              </button>
            </div>
          )}
        </>
      )}

      <div className="cfoot">
        <button className="creset" data-testid="group-reset" onClick={() => resetGroups()}>
          Back to the standard groups
        </button>
      </div>
    </Sheet>
  )
}
