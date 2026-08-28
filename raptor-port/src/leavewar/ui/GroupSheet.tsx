/* WHICH GROUPS THE LEFT COLUMN SHOWS — the admin editor (owner, 28 Aug 26:
   "include a button here for admin, when they click it, they will be able to
   edit what sub category is shown on the left column. for example SC Day
   qualification, SC Night qualification. ETC").
 *
 * Three things in one sheet, in the order the owner described them:
 *
 * 1. WHICH GROUPS EXIST. Every built-in plus every qualification the squadron
 *    currently has — the list grows on its own ("take note when new
 *    qualifications are added this list will also grow, to be selected"),
 *    because it is built from the live catalogue rather than a constant here.
 * 2. THE ORDER, top to bottom, by DRAG ("In order to rearrange the order of the
 *    rows from top to bottom. i should be able to drag and drop") — the same ⠿
 *    grip and the same drag machine the roster and count rows already use.
 * 3. WHO WINS when somebody matches two groups — a SEPARATE priority list, the
 *    owner's explicit choice when asked. A person shows exactly once, and this
 *    is what decides where ("if theres a cat c column, but there is also a SC D
 *    column. They should always show up in the qualifications column instead of
 *    CAT. in that priority").
 *
 * Tapping a group HIGHLIGHTS the people in it ("allow me to click to highlight
 * the applicable pucks. In that page. So I can see like who's qualified for
 * e.g"), so the effect of a choice is visible before it is made.
 */

import { useState } from 'react'
import {
  groupLabel,
  matchesGroup,
  OTHER_LABEL,
  type GroupDef,
} from '../engine'
import {
  addGroup,
  getState,
  groupIdOf,
  groupsInOrder,
  groupPriorityIds,
  moveGroupPriorityTo,
  moveGroupTo,
  offerableGroupList,
  resetGroups,
  setGroupDefs,
} from '../state/store'
import { Sheet } from './Sheet'
import './bidpicker.css'

export function GroupSheet({
  onClose,
  onRowDragStart,
  onPriorityDragStart,
  draggingId,
  dragOver,
}: {
  onClose: () => void
  /** Begin a drag in the DISPLAY list / the PRIORITY list. Wired by Matrix to
   *  the one drag machine, so a group reorders exactly like a roster row. */
  onRowDragStart?: (e: React.PointerEvent, id: string) => void
  onPriorityDragStart?: (e: React.PointerEvent, id: string) => void
  draggingId?: string | null
  dragOver?: string | null
}) {
  const { people, qualCatalog } = getState()
  const chosen = groupsInOrder()
  const offered = offerableGroupList()
  const priority = groupPriorityIds()
  const chosenIds = new Set(chosen.map(d => d.id))
  // Which group's people are lit right now (tap to show, tap again to clear).
  const [lit, setLit] = useState<string | null>(null)

  const label = (d: GroupDef) => groupLabel(d, qualCatalog)
  /* TWO DIFFERENT QUESTIONS, and the sheet used to answer only the first (bug
     sweep, 28 Aug 26). `matchesGroup` is "does this person QUALIFY for the
     group"; `groupIdOf` is "which group actually DRAWS them", after priority
     has decided between the groups they match. The row's headline number is now
     the second — the count the grid will agree with — because reporting 44 for
     a group the grid shows nobody in is a promise the page does not keep. The
     first is still worth saying, so where they differ the row says both. */
  const membersOf = (d: GroupDef) => people.filter(p => matchesGroup(p, d))
  const shownIn = (d: GroupDef) => people.filter(p => groupIdOf(p) === d.id)

  const add = (d: GroupDef) => addGroup(d)
  const drop = (id: string) => setGroupDefs(chosen.filter(d => d.id !== id))

  const litDef = lit ? offered.find(d => d.id === lit) : null

  return (
    <Sheet testid="group-sheet" label="Which groups the roster shows" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">ROSTER GROUPS</span>
        <span className="dt">drag to reorder · tap a name to see who is in it</span>
        <button className="x" data-testid="group-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* ---- 1 + 2: the groups that are shown, in their top-to-bottom order --- */}
      <div className="gs-sec">Shown, top to bottom</div>
      <div className="clist" data-testid="group-chosen">
        {chosen.map(d => {
          const shown = shownIn(d).length
          const elsewhere = membersOf(d).length - shown
          return (
            <div
              key={d.id}
              className={`crow-wrap gs-row${draggingId === d.id ? ' dragging' : ''}${dragOver === d.id && draggingId !== d.id ? ' dragover' : ''}`}
              data-grow={d.id}
              data-testid={`grow-${d.id}`}
            >
              <span
                className="drag"
                data-testid={`gdrag-${d.id}`}
                title={`Drag to move ${label(d)}`}
                style={{ touchAction: 'none' }}
                onPointerDown={e => onRowDragStart?.(e, d.id)}
              >⠿</span>
              <button
                className={`crow gs-pick${lit === d.id ? ' on' : ''}`}
                data-testid={`gpick-${d.id}`}
                aria-pressed={lit === d.id}
                onClick={() => setLit(v => (v === d.id ? null : d.id))}
              >
                <span className="crow-top">
                  <span className="cn">{label(d)}</span>
                  <span className="ct">{shown} {shown === 1 ? 'person' : 'people'}</span>
                </span>
                <span className="csub">
                  {d.kind === 'qual' ? 'qualification' : 'category'}
                  {elsewhere > 0 && ` · ${elsewhere} more fit it, shown higher up`}
                </span>
              </button>
              {/* A built-in can be taken off the grid too — anyone it held falls
                  to "Everyone else", which is always drawn last, so nobody is
                  ever lost off the roster. */}
              <button
                className="cmv gs-del"
                data-testid={`gdrop-${d.id}`}
                aria-label={`Remove the ${label(d)} group`}
                title={`Remove the ${label(d)} group`}
                onClick={() => drop(d.id)}
              >✕</button>
            </div>
          )
        })}
      </div>
      <div className="gs-note">
        Anyone no group above claims is shown under <b>{OTHER_LABEL}</b>, always last.
      </div>

      {/* ---- who is in the tapped group -------------------------------------
           Split in two (bug sweep, 28 Aug 26): the people this group actually
           DRAWS, and the ones who fit it but are drawn higher up. One flat list
           of everyone who qualified read as a promise about the grid, and a
           group ranked below an exhaustive category could keep that promise for
           nobody at all. The second list is also the explanation for the first
           being short, right where the admin is looking. */}
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
                  Drag {label(litDef)} up under <b>Who wins</b> to draw them here instead.
                </div>
              </>
            )}
          </div>
        )
      })()}

      {/* ---- 1: what can be added ------------------------------------------- */}
      <div className="gs-sec">Add a group</div>
      <div className="gs-chips" data-testid="group-offer">
        {offered.filter(d => !chosenIds.has(d.id)).map(d => (
          <button
            key={d.id}
            className="tchip"
            data-testid={`gadd-${d.id}`}
            onClick={() => add(d)}
          >+ {label(d)}</button>
        ))}
        {offered.every(d => chosenIds.has(d.id)) && <span className="gs-empty">every group is already shown</span>}
      </div>

      {/* ---- 3: the separate tie-break order --------------------------------- */}
      <div className="gs-sec">
        Who wins when someone fits two
        <span className="gs-hint">the first match down this list claims them</span>
      </div>
      <div className="clist" data-testid="group-priority">
        {priority.map((id, i) => {
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
                <span className="crow-top">
                  <span className="cn">{i + 1}. {label(d)}</span>
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="cfoot">
        <button className="creset" data-testid="group-reset" onClick={() => resetGroups()}>
          Back to the standard groups
        </button>
      </div>
    </Sheet>
  )
}

/* The two move commits, exported so Matrix can hand them to its one drag
   machine without importing the store twice. */
export const GROUP_MOVE = moveGroupTo
export const GROUP_PRIORITY_MOVE = moveGroupPriorityTo
