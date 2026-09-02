// The OIL TRACKER — one full-screen grid (owner, 2 Sep 26, second cut).
//
// "One row for each person … on top of the names put the category … right
// of each name the balance … on the right side of the grids, show the data
// from left to right, scrollable … each input is 1 column … remove the
// second page … on the mobile the name of the pax is frozen to the left …
// drag to select on the mobile too, the same mechanics as the leave war
// grid … show how much was taken for that same box that was initially
// given … eventually it cancels out entirely once it's all consumed on that
// box … year as a header, the grids vertically aligned … given top-left,
// taken below it, left bottom-right … who the OIL is given by, optional; if
// auto credited put Auto."
//
// So: a table. Two frozen columns (name over its CAT chip; BAL over a
// `+earned −taken` line for the window), then one LANE per calendar year in
// the window, each lane a strip of CREDIT BOXES for that person that year,
// oldest first — every row's 2027 boxes start at the same x because a lane
// is a table column. A box is one credit and reads as a small ledger:
//
//     +7  20 Aug            OC Ops       ← given: amount, date, given by
//     Late recovery                      ← the reason (FLT / SIM / Duty when
//     −1 28 Aug · −1 30 Aug     6 left      earned; the box then says AUTO)
//                                        ← the days taken FROM this credit
//                                          (FIFO, oldest credit first), and
//                                          what is left, bottom-right
//
// Used up: the amount and reason strike through and the box dims; the takes
// stay legible (they are the audit trail). Expired: dimmed, "expired <date>".
// A day taken with nothing left to draw from gets its own red box, so a
// negative balance is never invisible.
//
// Third cut (owner, 2 Sep 26, from the shipped grid): every take is its OWN
// ROW inside the box and `n left` is pinned bottom-right whatever the row's
// height; the CAT chip sits UNDER the name on every row; the window opens
// "from first entry"; and a dead credit — used up, or expired — is ARCHIVED:
// it leaves the strip and is counted in the thin ARCHIVE column beside BAL,
// one tap on which brings every archived box back into the lanes (one switch
// for the whole grid, session-only, opens closed). A live credit with some
// draws, an uncovered take and a correction never archive — the first is
// still money, the other two are what makes a negative balance visible.
//
// Selection (admin): a tap on a name toggles the row; a hold-then-drag (a
// finger) or a plain drag (a mouse) down the NAMES selects the run —
// select.ts's `wireRowSelect`, the grid's own gesture core, so one rhythm
// serves both surfaces. The history strip never starts a selection, so it
// keeps its sideways scroll. Any selection docks the credit bar under the
// grid: one amount, one date, one reason, an optional "given by", N people.
//
// Everything shown is DERIVED by engine/oiltracker.ts from the store's
// openings, ledger and grid (plus each FO/HO cell's note); what an admin
// writes here is a ledger entry (grantOil / updateLedgerEntry /
// removeLedgerEntry), a hand-typed credit's note (setCellNote), or the
// policy (setOilPolicy).
//
// Role: the sheet DRAWS controls for an admin only (absent, not disabled —
// the house rule), and the store refuses a member's write regardless.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  addMonths,
  assignGroup,
  catClass,
  catText,
  groupLabel,
  inWindow,
  MAX_CELL_NOTE,
  MAX_EXPIRY_DAYS,
  MAX_EXPIRY_MONTHS,
  MAX_HISTORY_MONTHS,
  oilLedgerOf,
  OTHER_ID,
  OTHER_LABEL,
  type OilCredit,
  type OilDebit,
  type OilExpiryUnit,
  type OilLedger,
  type Person,
} from '../engine'
import {
  displayRoster,
  figureCtxOf,
  getState,
  grantOil,
  groupsInOrder,
  groupPriorityIds,
  MAX_GIVEN_BY,
  MAX_REASON,
  removeLedgerEntry,
  setCellNote,
  setOilPolicy,
  updateLedgerEntry,
} from '../state/store'
import { shortDate, shortSpan } from './dates'
import { RangePicker, type Range } from './RangePicker'
import { wireRowSelect } from './select'
import { Sheet } from './Sheet'
import { useVersion } from './useStore'
import './bidpicker.css'
import './oiltracker.css'

/** Rounds for display only, the same rule every figure surface uses. */
const show = (n: number) => String(Math.round(n * 10) / 10)
const signed = (n: number) => (n < 0 ? `−${show(-n)}` : n > 0 ? `+${show(n)}` : '0')

/** Day and month only — the lane header carries the year (owner, 2 Sep 26).
 *  A draw in another year than its credit's lane says so with two digits. */
const dm = (date: string) => shortDate(date).replace(/\s\d{2}$/, '')
const dmy = (date: string, laneYear: string) => (date.slice(0, 4) === laneYear ? dm(date) : shortDate(date))

type RangeMode = 'first' | 'months' | 'pick'

/** One BOX on a person's strip: a credit, or a debit no credit covered. */
type Box = { year: string; date: string; c?: OilCredit; d?: OilDebit; archived?: true }

const yearOf = (date: string, fallback: string) => (date ? date.slice(0, 4) : fallback)

/** A whole-number field that commits on blur or Enter, so a person can clear
 *  it and retype without the store refusing the empty moment. */
function IntField({ testid, value, min, max, onCommit }: {
  testid: string
  value: number
  min: number
  max: number
  onCommit: (n: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  const [was, setWas] = useState(value)
  if (was !== value) { setWas(value); setDraft(String(value)) }
  const commit = () => {
    const n = Number(draft)
    if (Number.isInteger(n) && n >= min && n <= max) onCommit(n)
    else setDraft(String(value))
  }
  return (
    <input
      type="number"
      className="oil-num"
      data-testid={testid}
      min={min}
      max={max}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit() }}
    />
  )
}

/** A single-day picker behind a chip: the chip shows the day, a tap opens the
 *  calendar under it, a tap on a day closes it. */
function DayChip({ testid, pickerId, value, today, onPick }: {
  testid: string
  pickerId: string
  value: string
  today: string
  onPick: (d: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <span className="oil-daychip">
      <button className="tchip" data-testid={testid} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        📅 {value ? shortDate(value) : 'date'} ▾
      </button>
      {open && (
        <span className="oil-pop">
          <RangePicker
            compact
            testid={pickerId}
            anchor={value || today}
            value={value ? { from: value, to: value } : null}
            // A single day: a tap on a later day than the one shown arrives
            // as a range starting at the shown day, so take its far end.
            onChange={r => { if (!r) return; onPick(r.to !== value ? r.to : r.from); setOpen(false) }}
          />
        </span>
      )}
    </span>
  )
}

/**
 * The credit bar's form — one amount, one date, one reason, an optional
 * "given by", for one or many people. Its own component so its draft state
 * resets with the people it is for (the caller keys it).
 */
function CreditForm({ ids, names, today, onDone }: {
  ids: string[]
  names: string
  today: string
  onDone: () => void
}) {
  const [amt, setAmt] = useState('1')
  const [date, setDate] = useState(today)
  const [reason, setReason] = useState('')
  const [given, setGiven] = useState('')
  const [err, setErr] = useState('')
  const save = () => {
    const problem = grantOil(ids, Number(amt), date, reason, given)
    if (problem) { setErr(problem); return }
    onDone()
  }
  return (
    <div className="oil-bar form" data-testid="oil-credit-panel">
      <b className="oil-who" data-testid="oil-credit-who">OIL credits · {names}</b>
      <input
        type="number"
        step="0.5"
        className="oil-num"
        data-testid="oil-amt"
        value={amt}
        onChange={e => setAmt(e.target.value)}
        aria-label="Days of OIL — a negative number is a correction"
        title="days · a negative number is a correction"
      />
      <DayChip testid="oil-date" pickerId="oildate" value={date} today={today} onPick={setDate} />
      <input
        className="oil-text"
        data-testid="oil-reason"
        maxLength={MAX_REASON}
        value={reason}
        placeholder="reason"
        aria-label="Reason"
        onChange={e => setReason(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save() }}
      />
      <input
        className="oil-text given"
        data-testid="oil-given"
        maxLength={MAX_GIVEN_BY}
        value={given}
        placeholder="given by (optional)"
        aria-label="Given by"
        onChange={e => setGiven(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save() }}
      />
      <button className="dchip approve" data-testid="oil-credit-save" onClick={save}>Save</button>
      {err && <span className="note warn" data-testid="oil-credit-err">{err}</span>}
    </div>
  )
}

export function OilTracker({ person, focus, onClose, onGranted }: {
  /** Scroll to this person's row on open (the Cinch's OIL BAL, or a manual
   *  OIL write on the grid); `null` opens at the top. */
  person: string | null
  /** The day whose box to light, when opened from a grid write. */
  focus?: string | null
  onClose: () => void
  /** After an admin's credit, edit or delete lands — the matrix snaps its
   *  counter column to OIL BAL (owner, 2 Sep 26). */
  onGranted?: () => void
}) {
  useVersion()
  const { people, role, oilPolicy, qualCatalog } = getState()
  const admin = role === 'admin'
  const ctx = figureCtxOf()
  const today = ctx.asOf!
  const thisYear = today.slice(0, 4)

  const [view, setView] = useState<'grid' | 'settings'>('grid')
  const [legend, setLegend] = useState(false)
  // The ARCHIVE column's switch: closed hides every dead credit, open shows
  // them all. One switch for the grid (owner: "all the archived data will
  // expand").
  const [archiveOpen, setArchiveOpen] = useState(false)
  const toggleArchive = () => setArchiveOpen(o => !o)

  // The history window (owner: "select which date ranges to look at … can
  // also be shown from the beginning of the first input"). Opens on the
  // admin's default; either role can switch it for the sheet's lifetime.
  const [mode, setMode] = useState<RangeMode>(oilPolicy.historyMonths === null ? 'first' : 'months')
  const [pick, setPick] = useState<Range | null>(null)
  const [picking, setPicking] = useState(false)
  const months = oilPolicy.historyMonths ?? 6

  // Selection (admin): the picked ids. The drag itself lives in select.ts.
  const [sel, setSel] = useState<Set<string>>(() => new Set())
  const wrapRef = useRef<HTMLDivElement>(null)

  // The grant being edited (its draft), the one armed for deletion, and the
  // hand-typed credit whose note is being written.
  const [editId, setEditId] = useState<string | null>(null)
  const [eAmt, setEAmt] = useState('')
  const [eDate, setEDate] = useState('')
  const [eReason, setEReason] = useState('')
  const [eGiven, setEGiven] = useState('')
  const [eErr, setEErr] = useState('')
  const [armDel, setArmDel] = useState<string | null>(null)
  const [noteId, setNoteId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const groupDefs = groupsInOrder()
  const priority = groupPriorityIds()
  const homeOf = (p: Person) => assignGroup(p, groupDefs, priority)
  const labelOfGroup = (id: string) => {
    if (id === OTHER_ID) return OTHER_LABEL
    const d = groupDefs.find(x => x.id === id)
    return d ? groupLabel(d, qualCatalog) : id
  }
  const roster = displayRoster()
  const orderIds = roster.map(p => p.id)
  const ledgers = new Map<string, OilLedger>(roster.map(p => [p.id, oilLedgerOf(ctx, p.id)]))

  // The earliest dated entry anyone has — "from the first input".
  let first: string | null = null
  for (const led of ledgers.values()) if (led.first && (!first || led.first < first)) first = led.first

  const win: { from: string | null; to: string | null; label: string } = (() => {
    if (mode === 'pick' && pick) return { from: pick.from, to: pick.to, label: shortSpan(pick.from, pick.to) }
    if (mode === 'months') {
      const from = addMonths(today, -months)
      return { from, to: null, label: `${shortDate(from)} – today` }
    }
    return { from: null, to: null, label: first ? `${shortDate(first)} – today` : 'everything on record' }
  })()

  /* ---- the drag-select gesture, bound once ------------------------------ */
  const selCtxRef = useRef<{ order: () => string[]; enabled: () => boolean; onSelect: (ids: string[]) => void }>({ order: () => [], enabled: () => false, onSelect: () => {} })
  selCtxRef.current = {
    order: () => orderIds,
    enabled: () => admin && view === 'grid',
    onSelect: ids => setSel(prev => new Set([...prev, ...ids])),
  }
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    return wireRowSelect(wrap, {
      order: () => selCtxRef.current.order(),
      enabled: () => selCtxRef.current.enabled(),
      onSelect: ids => selCtxRef.current.onSelect(ids),
    })
  }, [view])

  // Opened on someone: bring their row into view once.
  useEffect(() => {
    if (!person) return
    const row = wrapRef.current?.querySelector<HTMLElement>(`[data-oilrow="${person}"]`)
    row?.scrollIntoView?.({ block: 'center' })
  }, [person])
  // Opened on a day whose credit is already in the archive (a grid write
  // that drew the last of it): open the archive, or the lit box is hidden.
  const focusLed = person && focus ? ledgers.get(person) : undefined
  const focusArchived = !!focusLed?.credits.some(c => c.date === focus && c.left === 0 && (c.used.length > 0 || c.expired > 0))
  useEffect(() => { if (focusArchived) setArchiveOpen(true) }, [focusArchived])

  // A tap outside the open credit bar cancels it (no save) — the owner asked
  // for this in place of a Deselect button (owner, 2 Sep 26). A tap on a name
  // still (de)selects, and a tap inside the bar (its inputs, the date pop) is
  // left alone; anything else clears the selection and folds the bar away.
  const hasSel = admin && sel.size > 0
  useEffect(() => {
    if (!hasSel) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('[data-testid="oil-credit-panel"]') || t?.closest('[data-oilpick]')) return
      setSel(new Set())
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [hasSel])

  const toggle = (id: string) => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const callsignOf = (id: string) => people.find(p => p.id === id)?.callsign ?? id
  const namesOf = (ids: string[]) => {
    const names = ids.map(callsignOf)
    return names.length > 3 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ')
  }
  const done = () => { onGranted?.() }

  /* ---- editing a grant / a hand-typed credit's note --------------------- */
  const startEdit = (c: OilCredit) => {
    setEditId(c.ledgerId!); setEAmt(String(c.amount)); setEDate(c.date); setEReason(c.reason); setEGiven(c.givenBy ?? ''); setEErr(''); setArmDel(null); setNoteId(null)
  }
  const saveEdit = () => {
    const problem = updateLedgerEntry(editId!, { amount: Number(eAmt), date: eDate, reason: eReason, givenBy: eGiven })
    if (problem) { setEErr(problem); return }
    setEditId(null)
    done()
  }
  const startNote = (c: OilCredit, personId: string) => {
    setNoteId(`${personId}|${c.date}`); setNoteDraft(c.manual && c.reason !== 'weekend duty' && c.reason !== 'PH duty' ? c.reason : ''); setEditId(null)
  }
  const saveNote = (personId: string, date: string) => {
    const problem = setCellNote(personId, date, noteDraft)
    if (problem) { setEErr(problem); return }
    setNoteId(null); setEErr('')
    done()
  }

  /* ---- SETTINGS (admin) ------------------------------------------------ */
  if (view === 'settings' && admin) {
    const exp = oilPolicy.expiry
    const setUnit = (unit: OilExpiryUnit) =>
      setOilPolicy({ expiry: { n: exp?.unit === unit ? exp.n : unit === 'days' ? 90 : 6, unit } })
    return (
      <Sheet testid="oil-sheet" label="OIL tracker settings" onClose={onClose} full>
        <div className="bidsheet-hd">
          <span className="who">OIL TRACKER</span>
          <span className="dt">settings · squadron-wide</span>
          <button className="x" data-testid="oil-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="oil-set">
          <div className="bidsheet-row">
            <span className="lab">OIL lasts</span>
            <button className={`tchip${!exp ? ' on' : ''}`} data-testid="oil-exp-forever" onClick={() => setOilPolicy({ expiry: null })}>Forever</button>
            <button className={`tchip${exp?.unit === 'days' ? ' on' : ''}`} data-testid="oil-exp-days" onClick={() => setUnit('days')}>Days</button>
            <button className={`tchip${exp?.unit === 'months' ? ' on' : ''}`} data-testid="oil-exp-months" onClick={() => setUnit('months')}>Months</button>
            {exp && (
              <IntField
                testid="oil-exp-n"
                value={exp.n}
                min={1}
                max={exp.unit === 'days' ? MAX_EXPIRY_DAYS : MAX_EXPIRY_MONTHS}
                onCommit={n => setOilPolicy({ expiry: { n, unit: exp.unit } })}
              />
            )}
          </div>
          <span className="note">
            {exp
              ? `A credit can be used for ${exp.n} ${exp.unit} from the day it was earned or given; whatever is left after that expires and leaves the balance.`
              : 'A credit never expires.'}
            {' '}Counted from each credit's own date. The opening figure never expires. A change here re-reads every balance.
          </span>
          <div className="bidsheet-row">
            <span className="lab">History</span>
            <button className={`tchip${oilPolicy.historyMonths === null ? ' on' : ''}`} data-testid="oil-hist-first" onClick={() => setOilPolicy({ historyMonths: null })}>From first entry</button>
            <button className={`tchip${oilPolicy.historyMonths !== null ? ' on' : ''}`} data-testid="oil-hist-months" onClick={() => setOilPolicy({ historyMonths: oilPolicy.historyMonths ?? 6 })}>Last N months</button>
            {oilPolicy.historyMonths !== null && (
              <IntField testid="oil-hist-n" value={oilPolicy.historyMonths} min={1} max={MAX_HISTORY_MONTHS} onCommit={n => setOilPolicy({ historyMonths: n })} />
            )}
          </div>
          <span className="note">The window the tracker opens on. Anyone can widen or narrow it while looking.</span>
          <div className="bidsheet-row">
            <button className="tchip" data-testid="oil-settings-done" onClick={() => setView('grid')}>‹ Back to the tracker</button>
          </div>
        </div>
      </Sheet>
    )
  }

  /* ---- THE GRID -------------------------------------------------------- */
  // Every person's boxes in the window, and the set of years they span. A
  // dead credit is tagged `archived` and, with the archive closed, left out
  // of the strip (but counted, so the row's archive cell can say how many).
  const boxesOf = new Map<string, Box[]>()
  const archivedOf = new Map<string, number>()
  const years = new Set<string>()
  let anyBox = false
  for (const p of roster) {
    const led = ledgers.get(p.id)!
    const all: Box[] = []
    for (const c of led.credits) {
      // A credit shows when its own day is in the window, or any day taken
      // from it is — a March credit drawn on in August belongs to August's
      // reader too.
      if (!(inWindow(c.date, win.from, win.to) || c.used.some(u => inWindow(u.date, win.from, win.to)))) continue
      const dead = c.left === 0 && (c.used.length > 0 || c.expired > 0)
      all.push({ year: yearOf(c.date, first?.slice(0, 4) ?? thisYear), date: c.date, c, ...(dead ? { archived: true as const } : {}) })
    }
    for (const d of led.debits) {
      // A take nothing covered, or an admin's correction (its own record,
      // editable) — the rest of a debit lives inside the credit it drew from.
      if (!(d.unbacked > 0 || d.source === 'correction')) continue
      if (!inWindow(d.date, win.from, win.to)) continue
      all.push({ year: yearOf(d.date, thisYear), date: d.date, d })
    }
    all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    archivedOf.set(p.id, all.filter(b => b.archived).length)
    const boxes = archiveOpen ? all : all.filter(b => !b.archived)
    for (const b of boxes) years.add(b.year)
    if (boxes.length) anyBox = true
    boxesOf.set(p.id, boxes)
  }
  const lanes = [...years].sort()
  const span = 3 + Math.max(1, lanes.length) + 1   // name, bal, archive, lanes (or one filler), filler

  const selIds = orderIds.filter(id => sel.has(id))

  const renderBox = (p: Person, b: Box, lane: string): ReactNode => {
    // A ledger id is unique on its own; an earned / opening id is per war and
    // date, shared across people, so the test id carries the person too.
    const tid = (id: string, ledgerId?: string) => (ledgerId ? id : `${p.id}-${id}`)
    if (b.c) {
      const c = b.c
      const usedUp = c.left === 0 && !c.expired && c.used.length > 0
      const editing = editId !== null && c.ledgerId === editId
      const noting = noteId === `${p.id}|${c.date}`
      const here = !!focus && p.id === person && c.date === focus
      const cls = `oil-e credit${c.source === 'grant' ? ' grant' : ''}${usedUp ? ' used' : ''}${c.expired ? ' expired' : ''}${here ? ' here' : ''}${editing || noting ? ' editing' : ''}`
      const canEdit = admin && c.source === 'grant'
      const canNote = admin && c.source === 'auto' && c.manual
      if (editing) {
        return (
          <div key={c.id} className={cls} data-testid={`oil-entry-${tid(c.id, c.ledgerId)}`}>
            <div className="oil-edit">
              <input type="number" step="0.5" className="oil-num" data-testid="oil-edit-amt" value={eAmt} onChange={e => setEAmt(e.target.value)} aria-label="Days" />
              <DayChip testid="oil-edit-date" pickerId="oileditdate" value={eDate} today={today} onPick={setEDate} />
              <input className="oil-text" data-testid="oil-edit-reason" maxLength={MAX_REASON} value={eReason} onChange={e => setEReason(e.target.value)} aria-label="Reason" placeholder="reason" />
              <input className="oil-text given" data-testid="oil-edit-given" maxLength={MAX_GIVEN_BY} value={eGiven} onChange={e => setEGiven(e.target.value)} aria-label="Given by" placeholder="given by (optional)" />
              <span className="acts">
                <button className="dchip approve" data-testid="oil-edit-save" onClick={saveEdit}>Save</button>
                <button className="tchip clear" data-testid="oil-edit-cancel" onClick={() => setEditId(null)}>Cancel</button>
                <button
                  className={`tchip${armDel === c.ledgerId ? ' arm' : ' clear'}`}
                  data-testid={`oil-del-${c.ledgerId}`}
                  onClick={() => { if (armDel === c.ledgerId) { removeLedgerEntry(c.ledgerId!); setArmDel(null); setEditId(null); done() } else setArmDel(c.ledgerId!) }}
                >
                  {armDel === c.ledgerId ? 'Really delete?' : 'Delete'}
                </button>
              </span>
              {eErr && <span className="note warn" data-testid="oil-edit-err">{eErr}</span>}
            </div>
          </div>
        )
      }
      return (
        <div
          key={c.id}
          className={cls}
          data-testid={`oil-entry-${tid(c.id, c.ledgerId)}`}
          role={canEdit ? 'button' : undefined}
          tabIndex={canEdit ? 0 : undefined}
          onClick={canEdit ? () => startEdit(c) : undefined}
          onKeyDown={canEdit ? e => { if (e.key === 'Enter') startEdit(c) } : undefined}
          title={canEdit ? 'Tap to edit this credit' : undefined}
        >
          <div className="l1">
            <span className="amt">{signed(c.amount)}</span>
            <span className="dt">{c.date ? dmy(c.date, lane) : 'carried in'}</span>
            {c.source === 'auto' && !c.manual && <span className="by auto">Auto</span>}
            {c.source === 'grant' && c.givenBy && <span className="by">{c.givenBy}</span>}
          </div>
          {noting ? (
            <div className="l2 noting" onClick={e => e.stopPropagation()}>
              <input
                className="oil-text"
                data-testid="oil-note-input"
                maxLength={MAX_CELL_NOTE}
                value={noteDraft}
                placeholder="why — e.g. FLT, SIM, Duty"
                aria-label="Reason"
                autoFocus
                onChange={e => setNoteDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveNote(p.id, c.date); if (e.key === 'Escape') setNoteId(null) }}
              />
              <button className="dchip approve" data-testid="oil-note-save" onClick={() => saveNote(p.id, c.date)}>Save</button>
              {eErr && <span className="note warn">{eErr}</span>}
            </div>
          ) : (
            <div className="l2">
              {canNote ? (
                <button className="oil-notebtn" data-testid={`oil-note-${tid(c.id, c.ledgerId)}`} onClick={e => { e.stopPropagation(); startNote(c, p.id) }} title="Say why this credit was given">
                  {c.manual && c.reason !== 'weekend duty' && c.reason !== 'PH duty' ? c.reason : '+ reason'}
                </button>
              ) : (
                <span className="rt">{c.reason}</span>
              )}
            </div>
          )}
          <div className="l3">
            {/* one row per take (owner, 2 Sep 26 — "subsequent inputs on a new row") */}
            <span className="tk">{c.used.map((u, i) => <span key={i} className="tk1">−{show(u.amount)} {dmy(u.date, lane)}</span>)}</span>
            <span className={`left${c.expired ? ' zero exp' : c.left === 0 ? ' zero' : ''}`} data-testid={`oil-status-${tid(c.id, c.ledgerId)}`}>
              {c.expired ? `expired ${dmy(c.expires!, lane)}` : `${show(c.left)} left`}
            </span>
          </div>
        </div>
      )
    }
    const d = b.d!
    const editing = d.source === 'correction' && editId !== null && d.ledgerId === editId
    if (editing) {
      return (
        <div key={d.id} className="oil-e take editing" data-testid={`oil-entry-${tid(d.id, d.ledgerId)}`}>
          <div className="oil-edit">
            <input type="number" step="0.5" className="oil-num" data-testid="oil-edit-amt" value={eAmt} onChange={e => setEAmt(e.target.value)} aria-label="Days" />
            <DayChip testid="oil-edit-date" pickerId="oileditdate" value={eDate} today={today} onPick={setEDate} />
            <input className="oil-text" data-testid="oil-edit-reason" maxLength={MAX_REASON} value={eReason} onChange={e => setEReason(e.target.value)} aria-label="Reason" placeholder="reason" />
            <span className="acts">
              <button className="dchip approve" data-testid="oil-edit-save" onClick={saveEdit}>Save</button>
              <button className="tchip clear" data-testid="oil-edit-cancel" onClick={() => setEditId(null)}>Cancel</button>
              <button
                className={`tchip${armDel === d.ledgerId ? ' arm' : ' clear'}`}
                data-testid={`oil-del-${d.ledgerId}`}
                onClick={() => { if (armDel === d.ledgerId) { removeLedgerEntry(d.ledgerId!); setArmDel(null); setEditId(null); done() } else setArmDel(d.ledgerId!) }}
              >
                {armDel === d.ledgerId ? 'Really delete?' : 'Delete'}
              </button>
            </span>
            {eErr && <span className="note warn" data-testid="oil-edit-err">{eErr}</span>}
          </div>
        </div>
      )
    }
    const canEdit = admin && d.source === 'correction'
    const startCorrEdit = () => { setEditId(d.ledgerId!); setEAmt(String(-d.amount)); setEDate(d.date); setEReason(d.reason); setEGiven(''); setEErr(''); setArmDel(null) }
    return (
      <div
        key={d.id}
        className={`oil-e take${d.source === 'correction' ? ' corr' : ''}`}
        data-testid={`oil-entry-${tid(d.id, d.ledgerId)}`}
        role={canEdit ? 'button' : undefined}
        tabIndex={canEdit ? 0 : undefined}
        onClick={canEdit ? startCorrEdit : undefined}
        onKeyDown={canEdit ? e => { if (e.key === 'Enter') startCorrEdit() } : undefined}
      >
        <div className="l1">
          <span className="amt">−{show(d.amount)}</span>
          <span className="dt">{d.date ? dmy(d.date, lane) : 'carried in'}</span>
        </div>
        <div className="l2">
          <span className="rt">
            {d.source === 'correction' ? `${d.reason} · correction` : d.source === 'opening' ? 'opening figure' : 'taken'}
            {d.unbacked ? ' · not covered' : ''}
          </span>
        </div>
      </div>
    )
  }

  const rows: ReactNode[] = []
  let prevG: string | null = null
  for (const p of roster) {
    const g = homeOf(p)
    if (g !== prevG) {
      prevG = g
      const n = roster.filter(x => homeOf(x) === g).length
      rows.push(
        <tr key={`g:${g}`} className="oil-grp" data-testid={`oil-grp-${g}`}>
          <td colSpan={span}><span className="gl">{labelOfGroup(g)}<span className="gcount">· {n}</span></span></td>
        </tr>,
      )
    }
    const led = ledgers.get(p.id)!
    const boxes = boxesOf.get(p.id)!
    let plus = 0, minus = 0
    for (const c of led.credits) if (c.source !== 'opening' && inWindow(c.date, win.from, win.to)) plus += c.amount
    for (const d of led.debits) if (d.source !== 'opening' && inWindow(d.date, win.from, win.to)) minus += d.amount
    const idle = boxes.length === 0
    const archivedN = archivedOf.get(p.id) ?? 0
    const on = sel.has(p.id)
    rows.push(
      <tr key={p.id} className={`oil-row${on ? ' on' : ''}${idle ? ' idle' : ''}${p.id === person ? ' here' : ''}`} data-testid={`oil-row-${p.id}`} data-oilrow={p.id}>
        <td
          className="oil-name f c1"
          data-oilpick=""
          data-testid={`oil-name-${p.id}`}
          role={admin ? 'button' : undefined}
          aria-pressed={admin ? on : undefined}
          tabIndex={admin ? 0 : undefined}
          onClick={admin ? () => toggle(p.id) : undefined}
          onKeyDown={admin ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(p.id) } } : undefined}
        >
          <span className="who">{p.callsign}</span>
          <span className={`catchip ${catClass(p)}`}>{catText(p)}</span>
        </td>
        <td className="oil-balc f c2">
          <span className={`bal${led.balance < 0 ? ' neg' : led.balance > 0 ? ' pos' : ''}`} data-testid={`oil-bal-${p.id}`}>{show(led.balance)}</span>
          {!idle && (plus > 0 || minus > 0) && (
            <span className="pmline" data-testid={`oil-pm-${p.id}`}>
              <span className={`sg${plus ? ' g' : ''}`}>{plus ? '+' : ''}</span><span className={`nm${plus ? ' g' : ''}`}>{show(plus)}</span>
              <span className={`sg${minus ? ' r' : ''}`}>{minus ? '−' : ''}</span><span className={`nm${minus ? ' r' : ''}`}>{show(minus)}</span>
            </span>
          )}
        </td>
        <td className={`oil-arch f c3${archiveOpen ? ' open' : ''}`} data-testid={`oil-arch-${p.id}`} onClick={toggleArchive} title={archivedN ? `${archivedN} used-up credit${archivedN === 1 ? '' : 's'} in the archive` : undefined}>
          {archivedN > 0 && <span className="an">{archivedN}</span>}
        </td>
        {lanes.length === 0 ? <td className="lane" /> : lanes.map(y => (
          <td key={y} className="lane">
            <div className="ents">{boxes.filter(b => b.year === y).map(b => renderBox(p, b, y))}</div>
          </td>
        ))}
        <td className="fill" />
      </tr>,
    )
  }

  return (
    <Sheet testid="oil-sheet" label="OIL tracker" onClose={onClose} full>
      <div className="bidsheet-hd">
        <span className="who">OIL TRACKER</span>
        <span className="dt">{admin ? 'one row per person · the oldest credit is used first' : 'one row per person'}</span>
        <button className="x" data-testid="oil-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="oil-tools">
        <span className="lab">Show</span>
        <button className={`tchip${mode === 'first' ? ' on' : ''}`} data-testid="oil-range-first" onClick={() => { setMode('first'); setPicking(false) }}>
          From first entry
        </button>
        <button className={`tchip${mode === 'months' ? ' on' : ''}`} data-testid="oil-range-months" onClick={() => { setMode('months'); setPicking(false) }}>
          Last {months} months
        </button>
        <button className={`tchip${mode === 'pick' ? ' on' : ''}`} data-testid="oil-range-pick" onClick={() => { setMode('pick'); setPicking(true) }}>
          Pick dates
        </button>
        <span className="note oil-window" data-testid="oil-window">{win.label}</span>
        <span className="oil-right">
          <button className={`tchip${legend ? ' on' : ''}`} data-testid="oil-legend" aria-expanded={legend} onClick={() => setLegend(l => !l)} title="What the boxes mean">?</button>
          {admin && <button className="tchip" data-testid="oil-settings" onClick={() => setView('settings')}>⚙ Settings</button>}
        </span>
      </div>
      {mode === 'pick' && picking && (
        <div className="bidsheet-row oil-pickrow">
          <RangePicker compact testid="oilrange" anchor={today} value={pick} onChange={setPick} />
          <button className="tchip clear" data-testid="oilrange-done" onClick={() => setPicking(false)}>Done</button>
        </div>
      )}
      {legend && (
        <div className="oil-legendbox note" data-testid="oil-legend-text">
          One box per credit: what was given top-left, who gave it top-right (<b>Auto</b> = earned by working a weekend or PH — FLT, SIM or Duty), the reason under it,
          each day taken from it on its own red line, and what is left bottom-right. The oldest credit is used first. A used-up or expired credit folds into the <b>Archive</b> column beside BAL — tap it to show them all (struck through = used up; dimmed = expired). A red box = a day taken with nothing left to draw from.
          {admin ? ' Tap a name to pick it, hold and drag down the names to pick several, then credit them all at once below. Tap a credit you gave to edit it.' : ''}
        </div>
      )}
      <div ref={wrapRef} className="oil-wrap" data-testid="oil-list">
        <table className="oil-grid">
          <thead>
            <tr className="yrs">
              <th className="f c1" />
              <th className="f c2" />
              <th
                className={`oil-arch f c3${archiveOpen ? ' open' : ''}`}
                rowSpan={2}
                data-testid="oil-archive"
                role="button"
                aria-pressed={archiveOpen}
                tabIndex={0}
                title={archiveOpen ? 'Hide the used-up credits' : 'Show the used-up credits'}
                onClick={toggleArchive}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleArchive() } }}
              >
                <span className="vword">Archive</span>
              </th>
              {lanes.length === 0 ? <th className="yl" /> : lanes.map(y => <th key={y} className="yl" data-testid={`oil-year-${y}`}>{y}</th>)}
              <th className="fill" />
            </tr>
            <tr className="cols">
              <th className="f c1">Name</th>
              <th className="f c2">Bal</th>
              <th className="yl" colSpan={Math.max(1, lanes.length)}>Credits · oldest first →</th>
              <th className="fill" />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        {!anyBox && <div className="note oil-empty" data-testid="oil-empty">Nothing in this window.</div>}
      </div>
      {admin && selIds.length > 0 && (
        <CreditForm key={selIds.join('|')} ids={selIds} names={namesOf(selIds)} today={today} onDone={() => { setSel(new Set()); done() }} />
      )}
      {admin && selIds.length === 0 && (
        <div className="oil-bar idle" data-testid="oil-bar-idle">Tap a name to credit OIL · hold and drag down the names to pick several</div>
      )}
    </Sheet>
  )
}
