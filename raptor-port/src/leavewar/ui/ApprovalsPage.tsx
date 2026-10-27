/* APPROVALS — THE ADMIN'S LIST OF LEAVE WAITING FOR A DECISION (the Leave War overhaul's M4, batch 8 — D1152, D1197, D1184,
   D1189, D1192, D1180, D1181, D1178, D1254, D1420, D1421, D1231, D1361, D1330, D1246, D1175; the red team's A4, A11, B8, B12;
   the build spec docs/superpowers/plans/2026-10-27-lw-m4-build-spec.md §1; drawn full/r22-1-desk, r22-2-desk, r22-3-desk,
   r22-5-phone, r22-6-phone — D1420 "as drawn").

   A tab's page in the grid card's place (LeaveWarPage.tsx). One line a request — the days placed together (D1339, D1346):
   the "new" dot · his puck (the schedule's own — lesson 25) · the kind's box drawn pending (look F) · the dates (a link to
   the grid) · DAYS · LVE BAL · LOWEST AVAIL · PLACED · the paperclip · Approve · Refuse. Oldest first by when it was
   placed. On a phone two lines a request (A11). The figures come from `../approvals.ts`, worked out once per change of the
   war.

   DECIDING (D1361, D1330, D1421): Approve and Refuse rest grey, their words green and red. A tap decides that one request at
   once — one command, one Undo — and its button lights; the line STAYS where it is, lit, until he leaves Approvals or
   changes the dates, so a slip is put right by a second tap on the lit button and nothing moves under his finger. The
   count and "Approve all" count only what is still pending. A request the rules refuse says why, in red, under its dates,
   and stays pending; one drawn from a state since changed says what happened (B8). Every decision goes through the store's
   ONE writer, `decideRequests`, which answers per line with the ids the line now has (approving turns a request into an
   Input; a put-back mints a new request) — so the line follows them, and its own second tap is never read as stale.

   APPROVE ALL (A4): approves exactly what the list shows. One press arms it ("Approve 13 — tap again"); a second approves
   every pending line shown as ONE command and one Undo. Anything that changes what the list shows while it is armed — a
   filter, a line decided, an Undo, a request coming or going — disarms it, so the second tap never approves a number he
   did not read.

   NEW (D1231's reading, 8.4): the moment he OPENED the tab is stored (state/apprseen.ts) and the previous one kept for the
   visit: a request placed since wears the cyan dot, and "New N" shows only those. The dots go when he leaves Approvals. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { boxText, kindOf, parseCell } from '../engine'
import { decideRequests, getState, getVersion, lineStale, postedOutBy, selectWar, type DecideTo } from '../state/store'
import { figuresOf, linesOfWar, pendingCount, pendingElsewhere, type ApprFigures, type ApprLine } from '../approvals'
import { alsoSince, openRequestDocs, postingPendingTag, puckHtml, rosterCallsign, type AlsoLine } from '../sync'
import { openApprovals } from '../../state/apprseen'
import { me } from '../../state/perms'
import { ClipIcon } from '../../ui/icons'
import { askLw, apprMode, setApprMode, subscribeLwNav } from './lwnav'
import { ringCell } from './cellring'
import { RangePicker, type Range } from './RangePicker'
import { usePhone } from './phone'
import { useVersion } from './useStore'
import './approvals.css'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dow = (iso: string) => DOW[new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).getUTCDay()]
const dm = (iso: string) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`
const fig = (n: number) => String(Math.round(n * 2) / 2).replace('-', '−')

/** the "Pick dates…" chip once a span is picked: "13 Jan – 15 Jan"; one day is one day, "13 Jan" (the walk, 27 Oct 26 — it
 *  read "13 Jan – 13 Jan") */
export function rangeWords(from: string, to: string): string {
  return from === to ? dm(from) : `${dm(from)} – ${dm(to)}`
}
/* "Thu 22 – Fri 23 Jan" · "Fri 23 Jan, AM" on a desktop; "22–23 Jan" · "23 Jan AM" on a phone (as drawn) */
export function datesWords(code: string, from: string, to: string, phone: boolean): string {
  const half = parseCell(code)?.portion
  const h = half === 'am' ? 'AM' : half === 'pm' ? 'PM' : ''
  const sameMonth = from.slice(0, 7) === to.slice(0, 7)
  if (phone) {
    const run = from === to ? dm(from) : sameMonth ? `${+from.slice(8, 10)}–${dm(to)}` : `${dm(from)}–${dm(to)}`
    return h ? `${run} ${h}` : run
  }
  const run = from === to ? `${dow(from)} ${dm(from)}` : sameMonth ? `${dow(from)} ${+from.slice(8, 10)} – ${dow(to)} ${dm(to)}` : `${dow(from)} ${dm(from)} – ${dow(to)} ${dm(to)}`
  return h ? `${run}, ${h}` : run
}
const daysWords = (n: number) => `${fig(n)} ${n === 1 ? 'day' : n <= 1 && n > 0 ? 'day' : 'days'}`
const placedWords = (at?: number) => {
  if (typeof at !== 'number') return '—'
  const d = new Date(at)
  return `${d.getDate()} ${MON[d.getMonth()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

type Filter = { kind: 'all' } | { kind: 'new' } | { kind: 'month'; ym: string } | { kind: 'range'; from: string; to: string }
interface Row {
  key: string
  line: ApprLine
  /** every request id this line has ever had — so it is found again after an Undo or its own second tap */
  ids: Set<string>
  lit?: Exclude<DecideTo, 'pending'>
  /** a decision made here that an Undo took back — kept so a Redo lights the line again (the scenario designer's ★1) */
  undone?: { lit: Exclude<DecideTo, 'pending'>; parts: ApprLine['parts'] }
  msg?: { kind: 'refused' | 'stale'; why: string }
  figs?: ApprFigures
}
const recIds = (l: ApprLine) => l.parts.map(p => p.recId).filter((x): x is string => !!x)

/* the visit's own facts the slim bar reads too (it lives outside the page) — `pending` the page's own count, the period
   on view, as its header says it (the scenario designer's 17); -1 before the page has drawn */
let VISIT = { prev: 0, newCount: 0, pending: -1 }

/* NEW — placed since he last looked, by someone else: what he placed himself is no news to him (the scenario designer's
   16; the same as "Also since you last looked", which never lists what he did himself) */
const isNewFor = (l: ApprLine, prev: number, me: string | null): boolean =>
  typeof l.placedAt === 'number' && l.placedAt > prev && !(me != null && l.placedBy != null && String(l.placedBy) === me)

function inFilter(l: ApprLine, f: Filter, prev: number, me: string | null): boolean {
  if (f.kind === 'all') return true
  if (f.kind === 'new') return isNewFor(l, prev, me)
  const days = l.parts.map(p => p.date)
  if (f.kind === 'month') return days.some(d => d.slice(0, 7) === f.ym)
  return days.some(d => d >= f.from && d <= f.to)
}

export function ApprovalsPage({ shown }: { shown: boolean }) {
  useVersion()
  const phone = usePhone()
  const st = getState()
  const version = getVersion()
  const pid = me()
  /* the moment he opened it — written now, the previous one kept for this visit (state/apprseen.ts) */
  const [prev, setPrev] = useState<number | null>(null)
  useEffect(() => { setPrev(openApprovals(pid != null ? String(pid) : null)) }, [])
  const [filter, setFilterRaw] = useState<Filter>({ kind: 'all' })
  const [picking, setPicking] = useState(false)
  const pickRef = useRef<HTMLDivElement | null>(null)
  const pickBtn = useRef<HTMLButtonElement | null>(null)
  /* "Pick dates…" is a click-open popup: it closes on a press outside it (its button counting as inside) and on Escape,
     the keyboard back on its button (4 Sep 26; the scenario designer's 14) */
  useEffect(() => {
    if (!picking) return
    const down = (e: Event) => {
      const t = e.target as Node | null
      if (t && (pickRef.current?.contains(t) || pickBtn.current?.contains(t))) return
      setPicking(false)
    }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setPicking(false); pickBtn.current?.focus() } }
    document.addEventListener('pointerdown', down, true)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key) }
  }, [picking])
  const [armed, setArmed] = useState<string | null>(null)
  /* a decision the rules refused changes nothing in the war — this repaints the line's reason */
  const [tick, setTick] = useState(0)
  const rowsRef = useRef<{ period: string; rows: Row[] }>({ period: st.period.id, rows: [] })

  /* THE ROWS — the pending lines of the period on view, merged with the lines decided here this visit (they stay lit where
     they were) and the ones gone since they were drawn (they say what happened). Changing the dates — another filter, or
     another period — starts the rows afresh (D1421). */
  const fresh = useMemo(() => {
    const war = getState().wars.find(w => w.period.id === getState().period.id)
    return war ? linesOfWar(war) : []
  }, [version, st.period.id])
  const rows = useMemo(() => {
    let cur = rowsRef.current
    if (cur.period !== st.period.id) cur = { period: st.period.id, rows: [] }
    const byId = new Map<string, ApprLine>()
    for (const l of fresh) for (const id of recIds(l)) byId.set(id, l)
    const used = new Set<ApprLine>()
    const out: Row[] = []
    for (const r of cur.rows) {
      let match: ApprLine | undefined
      for (const id of r.ids) { const l = byId.get(id); if (l && !used.has(l)) { match = l; break } }
      if (match) {
        used.add(match)
        /* pending again (an Undo of the decision made here, or one made elsewhere put back): the light goes — the decision
           kept aside, so a Redo lights it again (★1) */
        const ids = new Set([...r.ids, ...recIds(match)])
        const undone = r.lit ? { lit: r.lit, parts: r.line.parts } : r.undone
        out.push({ key: r.key, line: match, ids, ...(undone ? { undone } : {}), ...(r.msg && r.msg.kind === 'refused' ? { msg: r.msg } : {}) })
        continue
      }
      if (r.lit) { out.push(r); continue }
      /* its decision put back by a Redo — every day stands as decided here: lit again, where it was (★1) */
      if (r.undone && lineStale(r.line.personId, r.undone.parts) === null) {
        out.push({ key: r.key, line: { ...r.line, parts: r.undone.parts }, ids: r.ids, lit: r.undone.lit })
        continue
      }
      /* JOINED into a line another row already holds (a day placed between two drawn lines — D1339, D1346), every day of
         it still standing: that row is the line now, so this one simply goes — never a greyed "No longer there" (★8) */
      if ([...r.ids].some(id => byId.has(id)) && lineStale(r.line.personId, r.line.parts) === null) {
        const holder = out.find(x => [...r.ids].some(id => x.ids.has(id) || recIds(x.line).includes(id)))
        if (holder) r.ids.forEach(id => holder.ids.add(id))
        continue
      }
      /* gone from the pending list while on screen (B8): say what happened */
      const why = r.msg?.kind === 'stale' ? r.msg.why : lineStale(r.line.personId, r.line.parts) || 'No longer there'
      out.push({ ...r, msg: { kind: 'stale', why } })
    }
    for (const l of fresh) if (!used.has(l)) out.push({ key: l.key, line: l, ids: new Set(recIds(l)) })
    out.sort((a, b) => (a.line.placedAt ?? -1) - (b.line.placedAt ?? -1) || (a.line.from < b.line.from ? -1 : a.line.from > b.line.from ? 1 : 0) || (a.key < b.key ? -1 : 1))
    rowsRef.current = { period: st.period.id, rows: out }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh, st.period.id, tick])

  /* the figures, once per change of the war, for the lines still pending (a lit line keeps the figures it was decided on) */
  const figs = useMemo(() => {
    const m = new Map<string, ApprFigures>()
    for (const r of rows) {
      if (r.lit || r.msg?.kind === 'stale') continue
      m.set(r.key, figuresOf(r.line, st.people.find(p => p.id === r.line.personId)))
    }
    return m
  }, [rows])
  for (const r of rows) { const f = figs.get(r.key); if (f) r.figs = f }

  const seen = prev ?? Number.MAX_SAFE_INTEGER
  const mePid = pid != null ? String(pid) : null
  const isNew = (r: Row) => isNewFor(r.line, seen, mePid)
  const pendingRows = rows.filter(r => !r.lit && r.msg?.kind !== 'stale')
  const newCount = pendingRows.filter(isNew).length
  VISIT = { prev: seen, newCount, pending: pendingRows.length }
  const shownRows = rows.filter(r => inFilter(r.line, filter, seen, mePid))
  const toApprove = shownRows.filter(r => !r.lit && r.msg?.kind !== 'stale')
  /* ARMED for exactly the lines shown when it was pressed — anything else and it is not armed (A4) */
  const sig = toApprove.map(r => `${r.key}:${recIds(r.line).join(',')}`).join('|')
  const isArmed = armed !== null && armed === sig && toApprove.length > 0
  const total = pendingCount()
  const elsewhere = pendingElsewhere()

  /* changing the dates starts the rows afresh: the lit lines and the gone ones leave (D1421) */
  const setFilter = (f: Filter) => {
    rowsRef.current = { period: st.period.id, rows: rowsRef.current.rows.filter(r => !r.lit && r.msg?.kind !== 'stale') }
    setFilterRaw(f); setArmed(null); setTick(t => t + 1)
  }

  const apply = (targets: Row[], to: DecideTo) => {
    const out = decideRequests(targets.map(r => ({ personId: r.line.personId, parts: r.line.parts, to })))
    const next = rowsRef.current.rows.slice()
    targets.forEach((r, i) => {
      const o = out[i]!
      const ix = next.findIndex(x => x.key === r.key)
      if (ix < 0) return
      const row = { ...next[ix]! }
      if (o.kind === 'done') {
        row.line = { ...row.line, parts: o.parts }
        row.ids = new Set([...row.ids, ...o.parts.map(p => p.recId).filter((x): x is string => !!x)])
        if (to === 'pending') delete row.lit; else row.lit = to
        delete row.msg; delete row.undone
      } else row.msg = { kind: o.kind, why: o.why }
      next[ix] = row
    })
    rowsRef.current = { period: st.period.id, rows: next }
    setArmed(null); setTick(t => t + 1)
  }
  const press = (r: Row, to: Exclude<DecideTo, 'pending'>) => apply([r], r.lit === to ? 'pending' : to)
  const approveAll = () => {
    if (!isArmed) { setArmed(sig); return }
    apply(toApprove, 'approved')
  }
  /* a request's dates → the Grid, the day ringed, the slim bar up (8.5); a man with no row on the grid → his person window.
     The "also" lines' dates the same (D1231's reading): a withdrawn bid's day ringed, nothing in it. */
  const openAt = (personId: string, date: string) => {
    const onGrid = getState().people.some(p => p.id === personId)
    setApprMode('bar')
    if (onGrid) ringCell(personId, date, 76)
    else askLw({ kind: 'person', id: personId })
  }
  const openDates = (r: Row) => openAt(r.line.personId, r.line.parts[0]!.date)
  /* "ALSO SINCE YOU LAST LOOKED · nothing to decide" (8.4, P9 — drawn r22-2-desk): under the New choice only */
  const also = useMemo(() => (prev == null ? [] : alsoSince(prev, st.period.start, st.period.end, pid != null ? String(pid) : null)),
    [version, prev, st.period.id, st.period.start, st.period.end, pid])

  /* the period's months, as the "Open for bidding" window has them; a month with nothing pending is dimmed */
  const months = useMemo(() => {
    const out: string[] = []
    for (let y = +st.period.start.slice(0, 4), m = +st.period.start.slice(5, 7); ; ) {
      const ym = `${y}-${String(m).padStart(2, '0')}`
      if (ym > st.period.end.slice(0, 7)) break
      out.push(ym)
      if (++m > 12) { m = 1; y++ }
    }
    return out
  }, [st.period.start, st.period.end])
  const monthHas = (ym: string) => pendingRows.some(r => r.line.parts.some(p => p.date.slice(0, 7) === ym))

  const fchip = (on: boolean, label: React.ReactNode, onClick: () => void, opts: { dim?: boolean; testid?: string } = {}) => (
    <button type="button" className={`appr-f${on ? ' on' : ''}${opts.dim ? ' dim' : ''}`} aria-pressed={on} onClick={onClick} data-testid={opts.testid}>{label}</button>
  )
  const filterRow = (
    <div className="appr-filters" role="group" aria-label="Which requests to show">
      {fchip(filter.kind === 'new', <><span className={`appr-dot${newCount ? '' : ' none'}`} aria-hidden="true" />New {newCount}</>, () => setFilter({ kind: 'new' }), { testid: 'appr-new' })}
      {/* a thin upright line between New and the dates, as drawn (his D1430, r22-1-desk), so New never reads as one more date */}
      {!phone && <span className="appr-vs" aria-hidden="true" />}
      {!phone && <span className="appr-lab">Dates</span>}
      {fchip(filter.kind === 'all', 'All', () => setFilter({ kind: 'all' }), { testid: 'appr-all' })}
      {months.map(ym => fchip(filter.kind === 'month' && filter.ym === ym, MON[+ym.slice(5, 7) - 1], () => setFilter({ kind: 'month', ym }), { dim: !monthHas(ym), testid: `appr-m-${ym}` }))}
      <button ref={pickBtn} type="button" className={`appr-f${filter.kind === 'range' ? ' on' : ''}`} data-testid="appr-pick" aria-expanded={picking}
        onClick={() => setPicking(v => !v)}>{filter.kind === 'range' ? rangeWords(filter.from, filter.to) : 'Pick dates…'}</button>
      <span className="appr-spring" />
      <button type="button" className={`appr-all${isArmed ? ' armed' : ''}`} data-testid="appr-approve-all" disabled={!toApprove.length}
        aria-live="polite" onClick={approveAll}>{isArmed ? `Approve ${toApprove.length} — tap again` : `Approve all ${toApprove.length}`}</button>
    </div>
  )

  const head = (
    <div className="appr-head">
      <h2 className="appr-title">Approvals</h2>
      <span className="appr-sub" data-testid="appr-sub">
        {/* "· 3 new since you last looked, Wed 7 Jan 16:40" (his D1430, r22-2): the "since" words belong to the new count —
            with nothing new they would say the pending ones came since he last looked */}
        {pendingRows.length} pending{newCount ? ` · ${newCount} new` : ''}{!phone && prev && newCount ? ` since you last looked, ${dow(isoOf(prev))} ${dm(isoOf(prev))} ${placedWords(prev).split(' ').pop()}` : ''}
      </span>
      {elsewhere.map(e => (
        <button key={e.warId} type="button" className="appr-elsewhere" data-testid="appr-elsewhere" onClick={() => selectWar(e.warId)}>
          +{e.n} pending in {e.name} ›
        </button>
      ))}
    </div>
  )

  return (
    <section className={`appr-page${phone ? ' ph' : ''}`} hidden={!shown} data-testid="approvals-page" aria-label="Approvals">
      <div className="appr-card">
        {head}
        {filterRow}
        {picking && (
          <div className="appr-pickpop" ref={pickRef}>
            <RangePicker testid="appr-range" min={st.period.start} max={st.period.end}
              value={filter.kind === 'range' ? { from: filter.from, to: filter.to } : null}
              onChange={(v: Range | null) => { if (v) { setFilter({ kind: 'range', from: v.from, to: v.to }); if (v.to !== v.from) setPicking(false) } }} />
          </div>
        )}
        {total === 0 && rows.length === 0 && <div className="appr-empty" data-testid="appr-empty">Nothing waiting for a decision.</div>}
        {rows.length > 0 && shownRows.length === 0 && !(filter.kind === 'new' && also.length) && <div className="appr-empty">Nothing here for these dates.</div>}
        {shownRows.length > 0 && (
          <div className="appr-list" role="list">
            {!phone && (
              <div className="appr-cols" aria-hidden="true">
                <span>Name</span><span>Kind</span><span>Dates</span><span>Days</span><span>LVE Bal</span><span>Lowest Avail</span><span>Placed</span>
              </div>
            )}
            {phone && (
              <div className="appr-cols ph" aria-hidden="true"><span>Days</span><span>LVE Bal</span><span>Lowest Avail</span><span className="appr-end">Placed</span></div>
            )}
            {shownRows.map(r => <Line key={r.key} r={r} phone={phone} fresh={isNew(r)} onPress={press} onDates={openDates} />)}
          </div>
        )}
        {filter.kind === 'new' && also.length > 0 && (
          <div className="appr-also" role="list" aria-label="Also since you last looked" data-testid="appr-also">
            <div className="appr-alsohead"><span className="appr-lab">Also since you last looked</span> · nothing to decide</div>
            {also.map(a => <AlsoRow key={a.key} a={a} phone={phone} onDates={openAt} />)}
          </div>
        )}
      </div>
    </section>
  )
}
const isoOf = (ms: number) => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

function Line({ r, phone, fresh, onPress, onDates }: { r: Row; phone: boolean; fresh: boolean; onPress: (r: Row, to: 'approved' | 'refused') => void; onDates: (r: Row) => void }) {
  const l = r.line
  const p = getState().people.find(x => x.id === l.personId)
  const cs = p?.callsign || rosterCallsign(l.personId) || l.personId
  const f = r.figs
  /* B12: his posting — "posting out 12 Mar" before it runs; once it has run, "posted out 14 Oct" */
  const po = postedOutBy(l.personId)
  const tag = po && po !== 'gone' ? `posted out ${dm(addOne(po))}` : postingPendingTag(l.personId)
  const stale = r.msg?.kind === 'stale'
  const by = l.placedBy && l.placedBy !== l.personId ? (getState().people.find(x => x.id === l.placedBy)?.callsign || rosterCallsign(l.placedBy) || '') : ''
  const puck = (
    <span className="appr-who">
      {fresh && !r.lit ? <span className="appr-dot" aria-label="New" /> : <span className="appr-dot none" aria-hidden="true" />}
      <span className="appr-puck" dangerouslySetInnerHTML={{ __html: puckHtml(l.personId, cs) }} />
      {tag && <span className="appr-tag" data-testid="appr-tag">{tag}</span>}
    </span>
  )
  /* a decided line's box shows the decision as the grid draws it — filled once approved, grey and struck through once
     refused (his D1430, r22-3-desk); waiting, the dashed box */
  const box = <span className={`c k-${kindOf(l.code)} ${r.lit === 'approved' ? 's-a' : r.lit === 'refused' ? 's-r' : 's-w'} appr-box`} data-testid="appr-box">{boxText(l.code)}</span>
  const dates = (
    <span className="appr-dates">
      <button type="button" className="appr-dlink" data-testid="appr-dates" onClick={() => onDates(r)}>{datesWords(l.code, l.from, l.to, phone)} ›</button>
      {r.msg && <span className="appr-why" role="status" data-testid="appr-why">{r.msg.why}</span>}
    </span>
  )
  /* every figure reads from the left (his D1438): no right-aligned column — the list's old right-align class, `r`, was also the
     puck's own class for a rear seat, so a WSO's name stood at the right of its puck */
  const days = <span className="appr-days">{f ? daysWords(f.days) : ''}</span>
  const bal = (
    <span className={`appr-bal${f?.bal && f.bal.value < 0 ? ' neg' : ''}`}>
      {f?.bal ? <>{f.bal.label && <small>{f.bal.label} </small>}{fig(f.bal.value)}</> : ''}
    </span>
  )
  const avail = (
    <span className="appr-avail">
      {f?.sans ? <span className="appr-av">SANS · not in Avail</span> : f?.avail
        ? <span className={`appr-av${f.avail.level ? ` ${f.avail.level}` : ''}`}><i>{f.avail.label.replace(/^Available\s+/i, '')}</i><span className="appr-n">{fig(f.avail.value)}</span></span> : null}
      {f?.turned.map(t => <span key={t.label} className={`appr-av ${t.level}`}><i>{t.label}</i><span className="appr-n">{fig(t.value)}</span></span>)}
    </span>
  )
  const placed = <span className="appr-placed">{placedWords(l.placedAt)}{by && <small> · by {by}</small>}</span>
  const clip = l.docIds.length > 0 && (
    <button type="button" className="appr-clip" data-testid="appr-clip" aria-label={`View ${l.docIds.length === 1 ? 'the document' : `${l.docIds.length} documents`}`}
      onClick={() => openRequestDocs({ personId: l.personId, code: l.code, from: l.from, to: l.to, docIds: l.docIds, remarks: l.remarks, placedBy: l.placedBy, placedAt: l.placedAt })}>
      <ClipIcon />{l.docIds.length > 1 && <span>{l.docIds.length}</span>}
    </button>
  )
  /* a decided line keeps its OTHER button pressable (his D1428, as drawn r22-3): one tap changes his mind either way; a
     second tap on the lit one sends it back to pending (D1421); only a line drawn from a state since changed has both off */
  const btns = (
    <span className="appr-btns">
      <button type="button" className={`appr-ok${r.lit === 'approved' ? ' lit' : ''}`} aria-pressed={r.lit === 'approved'} data-testid="appr-approve"
        disabled={stale} onClick={() => onPress(r, 'approved')}>{word(r.lit === 'approved' ? 'Approved' : 'Approve', 'Approved')}</button>
      <button type="button" className={`appr-no${r.lit === 'refused' ? ' lit' : ''}`} aria-pressed={r.lit === 'refused'} data-testid="appr-refuse"
        disabled={stale} onClick={() => onPress(r, 'refused')}>{word(r.lit === 'refused' ? 'Refused' : 'Refuse', 'Refused')}</button>
    </span>
  )
  if (phone) {
    return (
      <div className={`appr-line ph${r.lit ? ` lit-${r.lit}` : ''}${stale ? ' stale' : ''}`} role="listitem" data-testid={`appr-line-${l.personId}`}>
        <div className="appr-l1">{puck}{box}{dates}{clip}{btns}</div>
        <div className="appr-l2">{days}{bal}{avail}{placed}</div>
      </div>
    )
  }
  return (
    <div className={`appr-line${r.lit ? ` lit-${r.lit}` : ''}${stale ? ' stale' : ''}`} role="listitem" data-testid={`appr-line-${l.personId}`}>
      {puck}{box}{dates}{days}{bal}{avail}{placed}<span className="appr-cliphold">{clip}</span>{btns}
    </div>
  )
}
/* a decide button's words, kept the width of its LONGER word whether lit or not (his D1435): the longer word stands hidden
   in the same place, so "Approve" → "Approved" never moves the button's edge under the finger, whatever the phone's letters */
const word = (shown: string, longer: string) => (
  <span className="appr-word" data-long={longer}><span>{shown}</span></span>
)
/* one "also" line: the dot, his puck, the kind's box (a withdrawn bid struck through, a leave filed on the Inputs page
   approved), the dates (a link), what happened and when — nothing to decide, so no buttons */
function AlsoRow({ a, phone, onDates }: { a: AlsoLine; phone: boolean; onDates: (personId: string, date: string) => void }) {
  const cs = getState().people.find(x => x.id === a.personId)?.callsign || rosterCallsign(a.personId) || a.personId
  const byCs = a.by ? (getState().people.find(x => x.id === a.by)?.callsign || rosterCallsign(a.by) || '') : ''
  const what = a.what === 'withdrawn'
    ? `Bid withdrawn by ${byCs || cs}`
    : `Filed on the Inputs page${byCs && a.by !== a.personId ? ` by ${byCs}` : ''} · approved`
  return (
    <div className={`appr-aline${phone ? ' ph' : ''}`} role="listitem" data-testid={`appr-also-${a.what}`}>
      <span className="appr-who"><span className="appr-dot" aria-label="New" /><span className="appr-puck" dangerouslySetInnerHTML={{ __html: puckHtml(a.personId, cs) }} /></span>
      <span className={`c k-${kindOf(a.code)} ${a.what === 'withdrawn' ? 's-r' : 's-a'} appr-box`}>{boxText(a.code)}</span>
      <button type="button" className="appr-dlink" data-testid="appr-also-dates" onClick={() => onDates(a.personId, a.from)}>{datesWords(a.code, a.from, a.to, phone)} ›</button>
      <span className="appr-awhat">{what}</span>
      <span className="appr-placed">{placedWords(a.at)}</span>
    </div>
  )
}
const addOne = (iso: string) => { const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + 1)); return d.toISOString().slice(0, 10) }

/* THE SLIM BAR (8.5 — D1231 as D1254 narrows it; drawn r22-4-desk, r22-6-phone): at the foot of the Grid after a request's
   dates were tapped, on a desktop as on a phone. Back opens Approvals again exactly as he left it; ✕ drops the bar — he
   has left Approvals. */
export function SlimBar() {
  useVersion()
  useSyncExternalStore(subscribeLwNav, apprMode, apprMode)
  /* the page's own count — the period on view, as its header says it (17); the tab carries every period's */
  const n = VISIT.pending >= 0 ? VISIT.pending : pendingCount()
  /* on a desktop the compact bar of his drawing (his D1432, r22-4-desk); a phone keeps its own until he rules on it */
  const phone = usePhone()
  return (
    <div className={`appr-slim${phone ? ' ph' : ''}`} role="region" aria-label="Back to Approvals" data-testid="appr-slim">
      <span className="appr-dot" aria-hidden="true" />
      <b>Approvals</b>
      <span className="appr-slim-n">{phone ? '· ' : ''}{n} pending{VISIT.newCount ? ` · ${VISIT.newCount} new` : ''}</span>
      <span className="appr-spring" />
      <button type="button" className="appr-back" data-testid="appr-back" onClick={() => setApprMode('page')}>Back ▴</button>
      <button type="button" className="appr-x" data-testid="appr-slim-x" aria-label="Close Approvals" onClick={() => setApprMode('off')}>✕</button>
    </div>
  )
}
