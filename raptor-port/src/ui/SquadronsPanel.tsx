/* ADMIN → SQUADRONS (batch 1's second half, plan §6 — P2, PG1, D2110, D2196, D2298, D2306, D2308, D2336; the approved
   pictures docs/mock/2026-11-22-msq-b1-screens/img/b1-3, b1-4, b1-9, b1-10 and p7). Screen parts only: what they show
   is read by ui/squadrons-model.ts, and every change goes through state/units.ts's doors — one command each, one Undo
   step each, the commit gate judging the same rows again.

   Laid out from Admin → Users' own parts, as drawn: a "Squadrons · N" heading over a row per squadron (its place today
   and its people), "+ New squadron" under them for a master admin only, then "Places · N", a row per place (the
   squadrons at it and its time zone for today, "142 · 149 · Perth · GMT+8"). A tapped row opens its form underneath, one
   at a time, as a person's row does on Users.
   - A squadron's row opens only for an admin of it (the move door's own check, units.ts mayMoveUnit): its Place list,
     ending "+ New place…", which opens the new place's name and time zone in the same form (D2298) — the move and its
     new place one command — and D2306's line "Saved at once. The new place applies from tomorrow." (D2119, D2160).
   - A place's row opens for every admin: its name and time zone; where the door would refuse him (units.ts
     placeChangeProblem — an admin of every squadron at it, today or from a later day, a master admin always) both
     boxes and Save are greyed and the door's own words say why (D2336). The drawing greyed only the time zone (p7); the
     door refuses a rename of the place too, so the name is greyed with it — greyed states match what the door refuses.
   - "+ New squadron" (D2308, D2298): the number (a faded "150"), the place, its first admin — only the admins the door
     would take (units.ts firstAdminProblem) — and D2306's line with the number typed filled in; Save makes the
     squadron, its place row, the new place if one is typed and the first admin's Plan as ONE command (addUnit). The new
     squadron's row then wears the app's just-added mark for its six seconds (D850, D876 — Users' acc-ring). */
import { useEffect, useState } from 'react'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { addUnit, moveUnit, setPlace, placeChangeProblem, mayMoveUnit, placeById, placeOfOn, places, todayIso, type UnitSave, type NewPlace } from '../state/units'
import { accountById } from '../state/accounts'
import { PEOPLE } from '../engine/people'
import { actorIsMaster } from './useraccess-model'
import { squadronRows, placeRows, tzChoices, firstAdminChoices, newSqnNote, NUM_EXAMPLE, NEW_PLACE } from './squadrons-model'
import { useVersion } from './useStore'

/* a door's answer said: refused — its words in the warning toast, the form kept; saved — the toast's words if any, then
   `then`. A save the command queued (a commit in flight) is answered when it lands. */
const run = (r: UnitSave, ok: string | null, then: (r: UnitSave) => void) => {
  const done = (x: UnitSave) => {
    if (!x.ok) { HOOKS.toast(x.message || 'This change could not be saved.', 'warn'); notify(); return }
    if (ok) HOOKS.toast(ok)
    notify(); then(x)
  }
  if (r.pending) void r.pending.then(done); else done(r)
}
/* the app's just-added mark's six seconds (state/view.ts FRESH_MS; Users' acc-ring) */
const RING_MS = 6000

/* THE PLACE LIST AND, ON "+ New place…", THE NEW PLACE'S NAME AND TIME ZONE IN THE SAME FORM (D2298) — shared by a
   squadron's move and "+ New squadron" */
interface PlacePick { place: string; name: string; tz: string }
const sortedPlaces = () => places().slice().sort((a, b) => a.name.localeCompare(b.name))
const firstPlace = (): string => sortedPlaces()[0]?.id ?? NEW_PLACE
/* a new place's time zone starts on the first place's — the zone the squadrons here already share */
const startTz = (): string => placeById(firstPlace())?.tz ?? 'Australia/Perth'
const pickOf = (p: PlacePick): string | NewPlace => (p.place === NEW_PLACE ? { name: p.name, tz: p.tz } : p.place)

function NewPlaceFields(p: { nameId: string; tzId: string; pick: PlacePick; onChange: (x: PlacePick) => void }) {
  return (
    <div className="adm-2col">
      <div className="mfield"><label htmlFor={p.nameId}>New place's name</label>
        <input id={p.nameId} value={p.pick.name} maxLength={60} autoComplete="off"
          onChange={e => p.onChange({ ...p.pick, name: e.target.value })} /></div>
      <div className="mfield"><label htmlFor={p.tzId}>Time zone</label>
        <select id={p.tzId} value={p.pick.tz} onChange={e => p.onChange({ ...p.pick, tz: e.target.value })}>
          {tzChoices(todayIso(), [p.pick.tz]).map(z => <option key={z.tz} value={z.tz}>{z.label}</option>)}
        </select></div>
    </div>
  )
}
function PlaceOptions() {
  return <>{sortedPlaces().map(pl => <option key={pl.id} value={pl.id}>{pl.name}</option>)}<option value={NEW_PLACE}>+ New place…</option></>
}

/* ---- a squadron's place (b1-4) ---- */
function MoveEditor(p: { unit: string; onClose: () => void }) {
  const [pick, setPick] = useState<PlacePick>(() => ({ place: placeOfOn(p.unit, todayIso())?.id ?? firstPlace(), name: '', tz: startTz() }))
  const save = () => run(moveUnit(p.unit, pickOf(pick)), 'Saved', () => p.onClose())
  return (
    <div className="acc-edit" data-moving={p.unit}>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor="sqPlace">Place</label>
          <select id="sqPlace" value={pick.place} onChange={e => setPick({ ...pick, place: e.target.value })}><PlaceOptions /></select></div>
      </div>
      {pick.place === NEW_PLACE && <NewPlaceFields nameId="sqPlaceName" tzId="sqPlaceTz" pick={pick} onChange={setPick} />}
      <p className="acc-sub sq-note" id="sqMoveNote">Saved at once. The new place applies from tomorrow.</p>
      <div className="acc-acts">
        <button className="abtn primary" id="sqMoveSave" onClick={save}>Save</button>
        <button className="abtn" id="sqMoveCancel" onClick={p.onClose}>Cancel</button>
      </div>
    </div>
  )
}

/* ---- "+ New squadron" (b1-9, b1-10) ---- */
function NewSquadron(p: { onClose: () => void; onMade: (id: string) => void }) {
  const [num, setNum] = useState('')
  const [pick, setPick] = useState<PlacePick>(() => ({ place: firstPlace(), name: '', tz: startTz() }))
  const [admin, setAdmin] = useState('')
  const admins = firstAdminChoices(todayIso())
  const fa = admin ? accountById(admin) : undefined
  const faCs = fa ? String((PEOPLE as any)[fa.pid]?.cs ?? '') : null
  const save = () => run(addUnit(num, pickOf(pick), admin || undefined), null, r => { if (r.id) p.onMade(r.id) })
  return (
    <div className="acc-row od-row od-row-on" data-new-sqn="1">
      <div className="acc-main">
        <span className="acc-name">New squadron</span>
        <span className="acc-sub">Not saved yet</span>
      </div>
      <span className="od-rc" />
      <div className="acc-edit">
        <div className="adm-2col">
          <div className="mfield"><label htmlFor="sqNewNum">Squadron number</label>
            {/* eslint-disable-next-line react-doctor/no-autofocus -- "+ New squadron" is pressed to type a number: the caret waits in its box, as the request card's first box takes it */}
            <input id="sqNewNum" value={num} placeholder={NUM_EXAMPLE} maxLength={12} autoComplete="off" autoFocus
              onChange={e => setNum(e.target.value)} /></div>
          <div className="mfield"><label htmlFor="sqNewPlace">Place</label>
            <select id="sqNewPlace" value={pick.place} onChange={e => setPick({ ...pick, place: e.target.value })}><PlaceOptions /></select></div>
        </div>
        {pick.place === NEW_PLACE && <NewPlaceFields nameId="sqNewPlaceName" tzId="sqNewTz" pick={pick} onChange={setPick} />}
        <div className="adm-2col">
          <div className="mfield"><label htmlFor="sqNewAdmin">First admin</label>
            <select id="sqNewAdmin" value={admin} onChange={e => setAdmin(e.target.value)}>
              <option value="">Pick an admin…</option>
              {admins.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select></div>
        </div>
        <p className="acc-sub sq-note" id="sqNewNote">{newSqnNote(num, faCs, pick.place === NEW_PLACE ? pick.name : null)}</p>
        <div className="acc-acts">
          <button className="abtn primary" id="sqNewSave" onClick={save}>Save</button>
          <button className="abtn" id="sqNewCancel" onClick={p.onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

/* ---- a place's name and time zone (p7) ---- */
function PlaceEditor(p: { id: string; onClose: () => void }) {
  const pl = placeById(p.id)
  const [name, setName] = useState(pl?.name ?? '')
  const [tz, setTz] = useState(pl?.tz ?? '')
  const why = placeChangeProblem(p.id)
  const save = () => {
    if (pl && name === pl.name && tz === pl.tz) return p.onClose()
    run(setPlace({ id: p.id, name, tz }), 'Saved', () => p.onClose())
  }
  return (
    <div className="acc-edit" data-placing={p.id}>
      <div className="adm-2col">
        <div className="mfield"><label htmlFor="plName">Name</label>
          <input id="plName" value={name} maxLength={60} autoComplete="off" disabled={!!why} onChange={e => setName(e.target.value)} /></div>
        <div className="mfield"><label htmlFor="plTz">Time zone</label>
          <select id="plTz" value={tz} disabled={!!why} onChange={e => setTz(e.target.value)}>
            {tzChoices(todayIso(), [tz]).map(z => <option key={z.tz} value={z.tz}>{z.label}</option>)}
          </select></div>
      </div>
      {why && <p className="adm-note sq-why" id="plWhy">{why}</p>}
      <div className="acc-acts">
        <button className="abtn primary" id="plSave" disabled={!!why} onClick={save}>Save</button>
        <button className="abtn" id="plCancel" onClick={p.onClose}>Cancel</button>
      </div>
    </div>
  )
}

type Open = { kind: 'unit' | 'place'; id: string } | { kind: 'new' } | null
export function SquadronsPanel() {
  useVersion()
  const today = todayIso()
  const [open, setOpen] = useState<Open>(null)
  /* the squadron just made, wearing the just-added mark for its six seconds */
  const [ring, setRing] = useState<string | null>(null)
  useEffect(() => {
    if (!ring) return
    const t = setTimeout(() => setRing(null), RING_MS)
    return () => clearTimeout(t)
  }, [ring])
  const master = actorIsMaster()
  const sq = squadronRows(today)
  const pls = placeRows(today)
  const making = !!open && open.kind === 'new'
  const isOpen = (kind: 'unit' | 'place', id: string) => !!open && open.kind === kind && open.id === id
  const toggle = (kind: 'unit' | 'place', id: string) => setOpen(isOpen(kind, id) ? null : { kind, id })
  const close = () => setOpen(null)
  return (
    <>
      <h4 className="adm-sub">Squadrons · {sq.length}</h4>
      <div className="acc-list od-list" id="sqList">
        {sq.map(r => {
          const may = mayMoveUnit(r.id)
          const on = may && isOpen('unit', r.id)
          return (
            <div key={r.id} className={'acc-row od-row' + (on ? ' od-row-on' : '') + (ring === r.id ? ' acc-ring' : '')} data-unit={r.id}>
              <button className="acc-main acc-tap" disabled={!may} onClick={() => toggle('unit', r.id)}
                title={may ? `Change ${r.num}'s place` : `Only an admin of ${r.num} can change its place.`}>
                <span className="acc-name">{r.num}</span>
                <span className="acc-sub">{r.sub}</span>
              </button>
              <span className="od-rc" />
              {on && <MoveEditor unit={r.id} onClose={close} />}
            </div>
          )
        })}
        {making && master && <NewSquadron onClose={close} onMade={id => { setOpen(null); setRing(id) }} />}
      </div>
      {master && !making && (
        <div className="sq-add"><button className="abtn" id="sqNew" onClick={() => setOpen({ kind: 'new' })}>+ New squadron</button></div>
      )}
      <div className="sq-places">
        <h4 className="adm-sub">Places · {pls.length}</h4>
        <div className="acc-list od-list" id="sqPlaces">
          {pls.map(r => {
            const on = isOpen('place', r.id)
            return (
              <div key={r.id} className={'acc-row od-row' + (on ? ' od-row-on' : '')} data-place={r.id}>
                <button className="acc-main acc-tap" onClick={() => toggle('place', r.id)} title={`Change ${r.name}`}>
                  <span className="acc-name">{r.name}</span>
                  <span className="acc-sub">{r.sub}</span>
                </button>
                <span className="od-rc" />
                {on && <PlaceEditor id={r.id} onClose={close} />}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
