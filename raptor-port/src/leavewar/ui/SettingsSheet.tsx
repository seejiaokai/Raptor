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

import { Fragment, useState } from 'react'
import {
  groupLabel,
  matchesGroup,
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
  groupIdOf,
  groupsInOrder,
  groupPriorityIds,
  isGroupPriorityCustom,
  MAX_EVENT_ROWS,
  offerableGroupList,
  removeEventRow,
  resetGroups,
  setGroupColor,
  setGroupDefs,
  setShowSans,
} from '../state/store'
import { Sheet } from './Sheet'
import { PALETTE, groupColorOf, isColourable } from './groupColor'
import './bidpicker.css'

export function SettingsSheet({
  onClose,
  onAddCounter,
  armCounterReset,
  onResetCounters,
  onGroupDragStart,
  onPriorityDragStart,
  draggingId,
  dragOver,
}: {
  onClose: () => void
  /** Open the counter builder (Matrix owns the form + its `counterEdit` state). */
  onAddCounter: () => void
  /** Reset counters ARMS first (Matrix owns the arm state so it disarms when this
   *  sheet closes); this sheet only shows the armed/unarmed label and forwards taps. */
  armCounterReset: boolean
  onResetCounters: () => void
  /** Drag in the groups list (display order — the same write as the grid's heading
   *  grip) and in the who-wins (priority) list — both wired by Matrix to the one
   *  drag machine. */
  onGroupDragStart?: (e: React.PointerEvent, id: string) => void
  onPriorityDragStart?: (e: React.PointerEvent, id: string) => void
  draggingId?: string | null
  dragOver?: string | null
}) {
  const { people, qualCatalog, eventRows, showSans, groupColors } = getState()
  const chosen = groupsInOrder()
  const offered = offerableGroupList()
  const priority = groupPriorityIds()
  const chosenIds = new Set(chosen.map(d => d.id))
  const custom = isGroupPriorityCustom()
  const lastEventRowUsed = eventRowUsed(eventRows - 1)
  // Which group's people are lit (tap a name to show, tap again to clear).
  const [lit, setLit] = useState<string | null>(null)
  // The who-wins override is tucked away — rarely touched (owner, 3 Sep 26).
  const [whoOpen, setWhoOpen] = useState(false)
  // Which qualification group's colour palette is open under its row. Opened by
  // the add (pick straight after adding) and by the row's swatch.
  const [colorFor, setColorFor] = useState<string | null>(null)

  const label = (d: GroupDef) => groupLabel(d, qualCatalog)
  const shownIn = (d: GroupDef) => people.filter(p => groupIdOf(p) === d.id)
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
    <Sheet testid="settings-sheet" label="Roster, counters and groups" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">SETTINGS</span>
        <span className="dt">counters, rows &amp; groups</span>
        <button className="x" data-testid="settings-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* ---- counters & rows ------------------------------------------------- */}
      <div className="gs-sec">Counters &amp; rows</div>
      <div className="set-tray">
        <div className="set-ctrls">
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
          <button
            className={`rtbtn${showSans ? ' on' : ''}`}
            data-testid="sans-toggle"
            aria-pressed={showSans}
            title={showSans ? 'Take SANS aircrew off the leave war roster' : 'Put SANS aircrew on the leave war roster'}
            onClick={() => setShowSans(!showSans)}
          >{showSans ? '✓ SANS shown' : 'Show SANS'}</button>
          <button
            className={`rtbtn set-danger${armCounterReset ? ' arm' : ''}`}
            data-testid="counter-reset-all"
            title="Put the built-in counters back — counters you built are discarded"
            onClick={onResetCounters}
          >{armCounterReset ? 'Really reset?' : '↺ Reset counters'}</button>
        </div>
        <div className="set-hint">Reset counters asks once before it clears your custom counters.</div>
      </div>
      <div className="gs-note">
        Showing SANS puts them on the roster as <b>their own group at the very bottom</b>,
        and on the days they are available they <b>count toward the manning numbers</b> like
        everyone else.
      </div>

      {/* ---- the groups shown, top to bottom ---------------------------------- */}
      <div className="gs-sec">
        Groups — shown, top to bottom
        <span className="gs-hint">drag ⠿ to reorder · tap a name for who is in it · tap a dot for its colour</span>
      </div>
      <div className="set-grows" data-testid="group-chosen">
        {chosen.map(d => {
          const isSans = d.kind === 'sans'
          const shown = shownIn(d).length
          const colour = groupColorOf(d.id, groupColors)
          const pickable = isColourable(d.id)
          return (
            <Fragment key={d.id}>
              <div
                className={`set-grow${isSans ? ' sans' : ''}${draggingId === d.id ? ' dragging' : ''}${dragOver === d.id && draggingId !== d.id ? ' dragover' : ''}`}
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
                        className={`set-dot${colour === c ? ' on' : ''}`}
                        data-testid={`gdot-${d.id}-${c.slice(1).toLowerCase()}`}
                        role="radio"
                        aria-checked={colour === c}
                        aria-label={c}
                        style={{ background: c }}
                        onClick={() => setGroupColor(d.id, c)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
      <div className="gs-note">
        Anyone no group above claims is shown under <b>{OTHER_LABEL}</b>, always last.
      </div>

      {/* who is in the tapped group */}
      {litDef && (() => {
        const here = shownIn(litDef)
        const above = membersOf(litDef).filter(p => groupIdOf(p) !== litDef.id)
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
      <div className="gs-sec">
        Add a group
        <span className="gs-hint">the qualification options — grows as the squadron adds Quals</span>
      </div>
      <div className="gs-chips" data-testid="group-offer">
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
        {offered.every(d => chosenIds.has(d.id)) && <span className="gs-empty">every group is already shown</span>}
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
        <span className="dh">{custom ? 'custom order set' : 'follows the page — rarely needed'}</span>
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
                  className={`crow-wrap gs-row${draggingId === id ? ' dragging' : ''}${dragOver === id && draggingId !== id ? ' dragover' : ''}`}
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
