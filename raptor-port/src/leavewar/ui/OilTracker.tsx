// The OIL TRACKER sheet (owner, 2 Sep 26).
//
// "A button on the row where auto-sort is shown … an OIL tracker, a popup
// list which shows each individual with an OIL BAL. Admin can only edit the
// list, members can only view it. … on that tracker page on the right of the
// balance I am able to credit and add OIL … set any number, with reason and
// a date … a tracker sheet which shows when the OIL was credited and reason.
// The system will auto show when the OIL was taken … struck out, and it will
// automatically use the oldest OIL that was given. … drag and select all
// WSOs to put OIL, date and reason … select which date ranges to look at …
// admin can set a default duration … how long OIL can last."
//
// Two views in one sheet, plus the admin's settings:
//
//   EVERYONE — the roster in its grid order with group headings, one row per
//              person: callsign, CAT, OIL BAL. A tap opens their ledger. An
//              admin also gets a pick box per row, a Select-all per group,
//              and a mouse/pen DRAG down the rows selects the run under it —
//              the "drag and select all WSOs". Any selection opens the
//              credit panel: one amount, one date, one reason, N people.
//   ONE PERSON — the balance, an admin's "+ Add OIL" beside it, the window
//              chips, and the ledger newest-first: every credit (earned day,
//              grant, opening figure) with what became of it — used on which
//              days (fully used = struck through), part left, or expired —
//              and every day taken, with which credit it drew from.
//
// Everything shown is DERIVED by engine/oiltracker.ts from the store's
// openings, ledger and grid; what an admin writes here is a ledger entry
// (grantOil / updateLedgerEntry / removeLedgerEntry) or the policy
// (setOilPolicy). Earned FO/HO days are read off the grid and are not
// editable here — they are the publish wire's, and the schedule is their
// record.
//
// Role: the sheet DRAWS controls for an admin only (absent, not disabled —
// the house rule), and the store refuses a member's write regardless.

import { useRef, useState, type PointerEvent as RPointerEvent, type MouseEvent as RMouseEvent } from 'react'
import {
  addMonths,
  assignGroup,
  catClass,
  catText,
  groupLabel,
  inWindow,
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
  MAX_REASON,
  removeLedgerEntry,
  setOilPolicy,
  updateLedgerEntry,
} from '../state/store'
import { shortDate, shortSpan } from './dates'
import { RangePicker, type Range } from './RangePicker'
import { Sheet } from './Sheet'
import { useVersion } from './useStore'
import './bidpicker.css'
import './oiltracker.css'

/** Rounds for display only, the same rule every figure surface uses. */
const show = (n: number) => String(Math.round(n * 10) / 10)
const signed = (n: number) => (n < 0 ? `−${show(-n)}` : n > 0 ? `+${show(n)}` : '0')
/** A taken total reads with a minus, and "0" rather than "−0" when nothing was. */
const minus = (n: number) => (n ? `−${show(n)}` : '0')

type RangeMode = 'first' | 'months' | 'pick'

/** How much of a credit has been drawn — for the status words. */
const usedOf = (c: OilCredit) => c.used.reduce((s, u) => s + u.amount, 0)

/** The status words on a credit row: what became of it. */
function creditStatus(c: OilCredit): string {
  const used = c.used.map(u => shortDate(u.date)).join(', ')
  if (c.expired) return `expired ${shortDate(c.expires!)}${c.used.length ? ` · ${show(usedOf(c))} used` : ''}`
  if (c.left === 0 && c.used.length) return `used ${used}`
  if (c.used.length) return `${show(c.left)} of ${show(c.amount)} left · used ${used}`
  return c.expires ? `${show(c.left)} left · expires ${shortDate(c.expires)}` : `${show(c.left)} left`
}

/**
 * The credit panel — one amount, one date, one reason, for one or many
 * people. Its own component so its draft state resets with the people it
 * is for (the caller keys it), and so the everyone and one-person views
 * share the exact form.
 */
function CreditPanel({ ids, names, today, onDone, onCancel }: {
  ids: string[]
  names: string
  today: string
  onDone: () => void
  onCancel: () => void
}) {
  const [amt, setAmt] = useState('1')
  const [date, setDate] = useState(today)
  const [dateOpen, setDateOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  const save = () => {
    const problem = grantOil(ids, Number(amt), date, reason)
    if (problem) { setErr(problem); return }
    onDone()
  }
  return (
    <div className="oil-credit" data-testid="oil-credit-panel">
      <div className="bidsheet-row">
        <span className="lab">Credit</span>
        <span className="note" data-testid="oil-credit-who">
          <b>{ids.length === 1 ? names : `${ids.length} people`}</b>{ids.length > 1 ? ` · ${names}` : ''}
        </span>
      </div>
      <div className="bidsheet-row">
        <span className="lab">Amount</span>
        <input
          type="number"
          step="0.5"
          className="oil-num"
          data-testid="oil-amt"
          value={amt}
          onChange={e => setAmt(e.target.value)}
          aria-label="Days of OIL"
        />
        <span className="note">days · a negative number is a correction</span>
      </div>
      <div className="bidsheet-row">
        <span className="lab">Date</span>
        <button className="tchip" data-testid="oil-date" aria-expanded={dateOpen} onClick={() => setDateOpen(o => !o)}>
          {shortDate(date)} ▾
        </button>
        <span className="note">the day it counts from</span>
      </div>
      {dateOpen && (
        <div className="bidsheet-row">
          <RangePicker
            compact
            testid="oildate"
            anchor={today}
            value={{ from: date, to: date }}
            // A single day: a tap on a later day than the one shown arrives
            // as a range starting at the shown day, so take its far end.
            onChange={r => { if (!r) return; setDate(r.to !== date ? r.to : r.from); setDateOpen(false) }}
          />
        </div>
      )}
      <div className="bidsheet-row">
        <span className="lab">Reason</span>
        <input
          className="oil-text"
          data-testid="oil-reason"
          maxLength={MAX_REASON}
          value={reason}
          placeholder="Why — e.g. Det recovery, exercise weekend"
          onChange={e => setReason(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save() }}
        />
      </div>
      <div className="bidsheet-row">
        <button className="dchip approve" data-testid="oil-credit-save" onClick={save}>Credit</button>
        <button className="tchip clear" data-testid="oil-credit-cancel" onClick={onCancel}>Cancel</button>
        {err && <span className="note warn" data-testid="oil-credit-err">{err}</span>}
      </div>
    </div>
  )
}

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

export function OilTracker({ person, onClose }: {
  /** Open on one person's ledger, or `null` for everyone. */
  person: string | null
  onClose: () => void
}) {
  useVersion()
  const { people, role, oilPolicy, qualCatalog } = getState()
  const admin = role === 'admin'
  const ctx = figureCtxOf()
  const today = ctx.asOf!

  const [who, setWho] = useState<string | null>(person)
  const [view, setView] = useState<'list' | 'settings'>('list')

  // The history window (owner: "select which date ranges to look at … can
  // also be shown from the beginning of the first input"). Opens on the
  // admin's default; either role can switch it for the sheet's lifetime.
  const [mode, setMode] = useState<RangeMode>(oilPolicy.historyMonths === null ? 'first' : 'months')
  const [pick, setPick] = useState<Range | null>(null)
  const [picking, setPicking] = useState(false)
  const months = oilPolicy.historyMonths ?? 6
  const windowFor = (first: string | null): { from: string | null; to: string | null; label: string } => {
    if (mode === 'pick' && pick) return { from: pick.from, to: pick.to, label: shortSpan(pick.from, pick.to) }
    if (mode === 'months') {
      const from = addMonths(today, -months)
      return { from, to: null, label: `${shortDate(from)} – today` }
    }
    return { from: null, to: null, label: first ? `${shortDate(first)} – today` : 'everything on record' }
  }

  // The everyone view's selection (admin): picked ids, and the run a drag is
  // previewing. A drag is mouse/pen only — a finger scrolls the panel, and
  // taps the pick box or a group's Select all instead.
  const [sel, setSel] = useState<Set<string>>(() => new Set())
  const [drag, setDrag] = useState<{ anchor: string; focus: string } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ anchor: string; x: number; y: number; armed: boolean; id: number } | null>(null)
  const swallow = useRef(false)

  // The one-person view's "+ Add OIL" panel, and the grant being edited /
  // armed for deletion.
  const [crediting, setCrediting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [eAmt, setEAmt] = useState('')
  const [eDate, setEDate] = useState('')
  const [eDateOpen, setEDateOpen] = useState(false)
  const [eReason, setEReason] = useState('')
  const [eErr, setEErr] = useState('')
  const [armDel, setArmDel] = useState<string | null>(null)

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

  /* ---- the drag-select gesture (admin, mouse/pen) ---------------------- */
  const rowAt = (e: RPointerEvent): string | null => {
    const hit = (document.elementFromPoint?.(e.clientX, e.clientY) ?? (e.target as Element | null)) as Element | null
    return hit?.closest?.('[data-oilrow]')?.getAttribute('data-oilrow') ?? null
  }
  const runBetween = (a: string, b: string): string[] => {
    const i = orderIds.indexOf(a), j = orderIds.indexOf(b)
    if (i < 0 || j < 0) return []
    return orderIds.slice(Math.min(i, j), Math.max(i, j) + 1)
  }
  const onPointerDown = (e: RPointerEvent) => {
    if (!admin || e.pointerType === 'touch' || e.button !== 0) return
    const id = (e.target as Element).closest?.('[data-oilrow]')?.getAttribute('data-oilrow')
    if (!id) return
    gesture.current = { anchor: id, x: e.clientX, y: e.clientY, armed: false, id: e.pointerId }
  }
  const onPointerMove = (e: RPointerEvent) => {
    const g = gesture.current
    if (!g) return
    if (!g.armed) {
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < 4) return
      g.armed = true
      try { listRef.current?.setPointerCapture(g.id) } catch { /* jsdom */ }
    }
    const f = rowAt(e)
    if (f) setDrag({ anchor: g.anchor, focus: f })
  }
  const endDrag = (e: RPointerEvent) => {
    const g = gesture.current
    if (!g) return
    gesture.current = null
    if (!g.armed) return
    const focus = rowAt(e) ?? drag?.focus ?? g.anchor
    setSel(prev => new Set([...prev, ...runBetween(g.anchor, focus)]))
    setDrag(null)
    // The click that trails a drag would open the row it ended on.
    swallow.current = true
  }
  const onClickCapture = (e: RMouseEvent) => {
    if (!swallow.current) return
    swallow.current = false
    e.stopPropagation()
    e.preventDefault()
  }
  const preview = drag ? new Set(runBetween(drag.anchor, drag.focus)) : null
  const toggle = (id: string) => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const toggleGroup = (ids: string[]) => setSel(prev => {
    const n = new Set(prev)
    const allIn = ids.every(id => n.has(id))
    for (const id of ids) { if (allIn) n.delete(id); else n.add(id) }
    return n
  })
  const namesOf = (ids: string[]) => ids.map(id => people.find(p => p.id === id)?.callsign ?? id).join(', ')

  /* ---- the window chips, shared by both views ------------------------- */
  const windowChips = (first: string | null) => {
    const win = windowFor(first)
    return (
      <>
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
        </div>
        {mode === 'pick' && picking && (
          <div className="bidsheet-row oil-pickrow">
            <RangePicker compact testid="oilrange" anchor={today} value={pick} onChange={setPick} />
            <button className="tchip clear" data-testid="oilrange-done" onClick={() => setPicking(false)}>Done</button>
          </div>
        )}
      </>
    )
  }

  /* ---- SETTINGS (admin) ------------------------------------------------ */
  if (view === 'settings' && admin) {
    const exp = oilPolicy.expiry
    const setUnit = (unit: OilExpiryUnit) =>
      setOilPolicy({ expiry: { n: exp?.unit === unit ? exp.n : unit === 'days' ? 90 : 6, unit } })
    return (
      <Sheet testid="oil-sheet" label="OIL tracker settings" onClose={onClose}>
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
            <button className="tchip" data-testid="oil-settings-done" onClick={() => setView('list')}>‹ Back to the tracker</button>
          </div>
        </div>
      </Sheet>
    )
  }

  /* ---- ONE PERSON ------------------------------------------------------ */
  const me = who ? people.find(p => p.id === who) : undefined
  if (who && me) {
    const led: OilLedger = oilLedgerOf(ctx, who)
    const win = windowFor(led.first)
    const creditById = new Map(led.credits.map(c => [c.id, c]))
    type Row = { date: string; c?: OilCredit; d?: OilDebit }
    const rows: Row[] = [
      ...led.credits.filter(c => inWindow(c.date, win.from, win.to)).map(c => ({ date: c.date, c })),
      ...led.debits.filter(d => inWindow(d.date, win.from, win.to)).map(d => ({ date: d.date, d })),
    ].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
    let wEarned = 0, wGranted = 0, wTaken = 0, wExpired = 0
    for (const r of rows) {
      if (r.c) { if (r.c.source === 'auto') wEarned += r.c.amount; else if (r.c.source === 'grant') wGranted += r.c.amount; wExpired += r.c.expired }
      if (r.d) { if (r.d.source === 'taken') wTaken += r.d.amount; else if (r.d.source === 'correction') wGranted -= r.d.amount }
    }
    const startEdit = (c: OilCredit) => {
      setEditId(c.ledgerId!); setEAmt(String(c.amount)); setEDate(c.date); setEReason(c.reason); setEErr(''); setEDateOpen(false); setArmDel(null)
    }
    const saveEdit = () => {
      const problem = updateLedgerEntry(editId!, { amount: Number(eAmt), date: eDate, reason: eReason })
      if (problem) { setEErr(problem); return }
      setEditId(null)
    }
    const grantActs = (id: string) => (
      <span className="acts">
        <button className="tchip" data-testid={`oil-edit-${id}`} onClick={() => startEdit(creditById.get(id)!)}>Edit</button>
        <button
          className={`tchip${armDel === id ? ' arm' : ' clear'}`}
          data-testid={`oil-del-${id}`}
          onClick={() => { if (armDel === id) { removeLedgerEntry(id); setArmDel(null) } else setArmDel(id) }}
        >
          {armDel === id ? 'Really delete?' : 'Delete'}
        </button>
      </span>
    )
    return (
      <Sheet testid="oil-sheet" label={`${me.callsign}'s OIL ledger`} onClose={onClose}>
        <div className="bidsheet-hd">
          <span className="who">{me.callsign}</span>
          <span className="dt">OIL ledger · the oldest credit is used first</span>
          <button className="x" data-testid="oil-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="oil-tools">
          <button className="tchip" data-testid="oil-back" onClick={() => { setWho(null); setCrediting(false); setEditId(null) }}>‹ Everyone</button>
          {admin && <button className="tchip" data-testid="oil-settings" onClick={() => setView('settings')}>⚙ Settings</button>}
        </div>
        <div className="oil-bal">
          <span className="oil-balk">
            <span className="k">OIL BAL</span>
            <span className={`big${led.balance < 0 ? ' neg' : ''}`} data-testid="oil-person-bal">{show(led.balance)}</span>
            <span className="k">left</span>
          </span>
          <span className="oil-balsub">
            {led.overdrawn ? <span className="warnk">{show(led.overdrawn)} taken beyond credit</span> : null}
            {led.expired ? <span>{show(led.expired)} expired</span> : null}
          </span>
          {admin && !crediting && (
            <button className="dchip approve" data-testid="oil-add" onClick={() => { setCrediting(true); setEditId(null) }}>+ Add OIL</button>
          )}
        </div>
        {crediting && (
          <CreditPanel key={who} ids={[who]} names={me.callsign} today={today} onDone={() => setCrediting(false)} onCancel={() => setCrediting(false)} />
        )}
        {windowChips(led.first)}
        <div className="oil-entries" data-testid="oil-entries">
          {rows.length === 0 && <span className="note" data-testid="oil-empty">Nothing in this window.</span>}
          {rows.map(r => {
            if (r.c) {
              const c = r.c
              const fullyUsed = c.left === 0 && !c.expired && c.used.length > 0
              const editing = editId !== null && c.ledgerId === editId
              return (
                <div
                  key={c.id}
                  className={`oil-e credit${fullyUsed ? ' used' : ''}${c.expired ? ' expired' : ''}`}
                  data-testid={`oil-entry-${c.id}`}
                >
                  <span className="d">{c.date ? shortDate(c.date) : '—'}</span>
                  <span className="a">{signed(c.amount)}</span>
                  <span className="r">
                    {c.reason}
                    {c.source === 'auto' && <span className="tag" title="From the published schedule">auto</span>}
                    {c.source === 'grant' && c.approvedBy && <span className="tag">by {c.approvedBy}</span>}
                  </span>
                  <span className="s" data-testid={`oil-status-${c.id}`}>{creditStatus(c)}</span>
                  {admin && c.source === 'grant' && !editing && grantActs(c.ledgerId!)}
                  {editing && (
                    <span className="acts oil-editrow">
                      <input type="number" step="0.5" className="oil-num" data-testid="oil-edit-amt" value={eAmt} onChange={e => setEAmt(e.target.value)} aria-label="Days" />
                      <button className="tchip" data-testid="oil-edit-date" onClick={() => setEDateOpen(o => !o)}>{eDate ? shortDate(eDate) : 'date'} ▾</button>
                      <input className="oil-text" data-testid="oil-edit-reason" maxLength={MAX_REASON} value={eReason} onChange={e => setEReason(e.target.value)} aria-label="Reason" />
                      <button className="dchip approve" data-testid="oil-edit-save" onClick={saveEdit}>Save</button>
                      <button className="tchip clear" data-testid="oil-edit-cancel" onClick={() => setEditId(null)}>Cancel</button>
                      {eErr && <span className="note warn">{eErr}</span>}
                      {eDateOpen && (
                        <RangePicker compact testid="oileditdate" anchor={eDate || today} value={eDate ? { from: eDate, to: eDate } : null}
                          onChange={rr => { if (!rr) return; setEDate(rr.to !== eDate ? rr.to : rr.from); setEDateOpen(false) }} />
                      )}
                    </span>
                  )}
                </div>
              )
            }
            const d = r.d!
            const from = d.from.map(f => { const c = creditById.get(f.creditId); return c?.date ? shortDate(c.date) : 'opening' }).join(', ')
            return (
              <div key={d.id} className="oil-e take" data-testid={`oil-entry-${d.id}`}>
                <span className="d">{d.date ? shortDate(d.date) : '—'}</span>
                <span className="a">−{show(d.amount)}</span>
                <span className="r">
                  {d.reason}
                  {d.source === 'correction' && <span className="tag">correction</span>}
                </span>
                <span className="s" data-testid={`oil-status-${d.id}`}>
                  {d.unbacked ? `${show(d.unbacked)} not covered` : from ? `from ${from}` : ''}
                </span>
              </div>
            )
          })}
        </div>
        <div className="oil-foot" data-testid="oil-foot">
          <span>in this window: {signed(wEarned)} earned · {signed(wGranted)} granted · {minus(wTaken)} taken{wExpired ? ` · ${show(wExpired)} expired` : ''}</span>
          <span>balance <b className={led.balance < 0 ? 'neg' : ''}>{show(led.balance)}</b></span>
        </div>
      </Sheet>
    )
  }

  /* ---- EVERYONE -------------------------------------------------------- */
  const win = windowFor(null)
  const selIds = orderIds.filter(id => sel.has(id))
  let prevG: string | null = null
  const items: React.ReactNode[] = []
  for (const p of roster) {
    const g = homeOf(p)
    if (g !== prevG) {
      prevG = g
      const ids = roster.filter(x => homeOf(x) === g).map(x => x.id)
      const allIn = ids.every(id => sel.has(id))
      items.push(
        <div key={`g:${g}`} className="oil-grp" data-testid={`oil-grp-${g}`}>
          <span className="gname">{labelOfGroup(g)}</span>
          <span className="gcount">· {ids.length}</span>
          {admin && (
            <button className="oil-grpsel" data-testid={`oil-grpsel-${g}`} onClick={() => toggleGroup(ids)}>
              {allIn ? 'Unselect all' : 'Select all'}
            </button>
          )}
        </div>,
      )
    }
    const led = oilLedgerOf(ctx, p.id)
    let e = 0, gr = 0, t = 0
    for (const c of led.credits) if (inWindow(c.date, win.from, win.to)) { if (c.source === 'auto') e += c.amount; else if (c.source === 'grant') gr += c.amount }
    for (const d of led.debits) if (inWindow(d.date, win.from, win.to)) { if (d.source === 'taken') t += d.amount; else if (d.source === 'correction') gr -= d.amount }
    const on = sel.has(p.id)
    const pre = !!preview?.has(p.id)
    items.push(
      <div key={p.id} className={`oil-row${on ? ' on' : ''}${pre ? ' pre' : ''}`} data-testid={`oil-row-${p.id}`} data-oilrow={p.id}>
        {admin && (
          <button className="oil-pick" data-testid={`oil-pick-${p.id}`} aria-pressed={on} aria-label={`Select ${p.callsign}`} onClick={() => toggle(p.id)}>
            {on ? '✓' : ''}
          </button>
        )}
        <button className="crow" data-testid={`oil-open-${p.id}`} onClick={() => setWho(p.id)}>
          <span className="crow-top">
            <span className="cn">
              {p.callsign}
              <span className={`catchip ${catClass(p)}`}>{catText(p)}</span>
            </span>
            <span className={`ct${led.balance < 0 ? ' neg' : ''}`} data-testid={`oil-bal-${p.id}`}>{show(led.balance)} left</span>
          </span>
          <span className="csub">
            {signed(e)} earned · {signed(gr)} granted · {minus(t)} taken
            {led.expired ? ` · ${show(led.expired)} expired` : ''}
          </span>
        </button>
      </div>,
    )
  }

  return (
    <Sheet testid="oil-sheet" label="OIL tracker" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">OIL TRACKER</span>
        <span className="dt">{admin ? 'balance per person · tap one for their ledger · pick or drag to credit' : 'balance per person · tap one for their ledger'}</span>
        <button className="x" data-testid="oil-close" onClick={onClose} aria-label="Close">✕</button>
      </div>
      {admin && (
        <div className="oil-tools">
          <button className="tchip" data-testid="oil-settings" onClick={() => setView('settings')}>⚙ Settings</button>
          {selIds.length > 0 && (
            <button className="tchip clear" data-testid="oil-sel-clear" onClick={() => setSel(new Set())}>Clear selection</button>
          )}
        </div>
      )}
      {selIds.length > 0 && (
        <CreditPanel key={selIds.join('|')} ids={selIds} names={namesOf(selIds)} today={today} onDone={() => setSel(new Set())} onCancel={() => setSel(new Set())} />
      )}
      {windowChips(null)}
      <div
        ref={listRef}
        className={`oil-list${drag ? ' dragging' : ''}`}
        data-testid="oil-list"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {items}
      </div>
    </Sheet>
  )
}
