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
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { boxText, kindOf } from '../engine'
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
import { datesWords, dm, dow, MON, rangeWords } from './approvaldates'
import './approvals.css'

const fig = (n: number) => String(Math.round(n * 2) / 2).replace('-', '−')

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
  /** every decision made here this visit, the newest first, each with the parts it left — so after any Undo or Redo the
   *  line shows the one the record now holds (the scenario designer's ★1; the fixes' M3: a one-tap change of mind, D1428,
   *  is two decisions, and an Undo of the second must light the first again) */
  forms?: Array<{ lit: Exclude<DecideTo, 'pending'>; parts: ApprLine['parts'] }>
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

// eslint-disable-next-line react-doctor/no-high-complexity-react-function, react-doctor/no-giant-component -- the page's rows, their merge, the armed Approve all and the visit's facts share one set of state and refs; split, its hooks and the order its effects run in would move, on the page that decides leave
export function ApprovalsPage({ shown }: { shown: boolean }) {
  useVersion()
  const phone = usePhone()
  const st = getState()
  const version = getVersion()
  const pid = me()
  /* the moment he opened it — written now, the previous one kept for this visit (state/apprseen.ts) */
  const [prev, setPrev] = useState<number | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-doctor/rendering-hydration-no-flicker -- once per visit: opening writes the moment he opened it, so a re-run would move his "since you last looked" mark mid-visit; and that write to storage is a side effect no render may make — until it runs nothing is marked new, so nothing flashes
  useEffect(() => { setPrev(openApprovals(pid != null ? String(pid) : null)) }, [])
  const [filter, setFilterRaw] = useState<Filter>({ kind: 'all' })
  const [picking, setPicking] = useState(false)
  const pickRef = useRef<HTMLDivElement | null>(null)
  const pickBtn = useRef<HTMLButtonElement | null>(null)
  /* "Pick dates…" is a click-open popup: it closes on a press outside it (its button counting as inside) and on Escape,
     the keyboard back on its button (4 Sep 26; the scenario designer's 14) */
  // eslint-disable-next-line react-doctor/effect-needs-cleanup -- a press's own listeners must outlive this effect (that press closes the picker, which ends it) to take the click it makes; each removes itself at that click, a cancel, the next press or 500 ms after the lift
  useEffect(() => {
    if (!picking) return
    const down = (e: Event) => {
      const t = e.target as Node | null
      if (t && (pickRef.current?.contains(t) || pickBtn.current?.contains(t))) return
      setPicking(false)
      /* …AND THAT PRESS ONLY CLOSES IT (the fixes' M4 — the re-walk's B-F3): on a phone the calendar stands inline above the
         list, so closing it on the press moved the list up under the finger, and the click that ends the press landed on
         ANOTHER man's Approve — a decision he never made (D1421: nothing moves under his finger). The click this press
         makes is taken here, before anything under it can act — on a desktop by the mouse as on a phone by a finger: the
         click that follows THIS press's lift, and only that one; a press that makes no click (a scroll) leaves nothing
         waiting for the next.
         FROM THE LIFT, HOWEVER LONG THE PRESS (the fixes' round 2, R2-1): the taker was timed from the press, so a press held
         about a second — an iPhone fires the click at the lift — found nothing waiting and approved the line then under the
         finger. It is armed at this press's own lift and ends on a cancelled press, the next press, or half a second after
         the lift (the click follows the lift at once).
         ONLY WHERE THE PRESS WOULD MISS (R2-2): a click on what was pressed, which has not moved, does its job — the top
         bar's Undo, the bell, the Grid tab need no second press; one that lands elsewhere, or on a thing the calendar's
         closing moved, is taken.
         …MEASURED BY THE CONTROL EACH IS ON (the fixes' round 3, R3-1, R3-2): round 2 asked whether the press's target
         CONTAINED the click's — so a finger on the empty card beside or under the calendar (the card holds every line and
         never moves) let its click, landing on a line's Approve as the list moved up, act: M4 again; and an icon pressed and
         its button's edge lifted was taken, the icon not holding its own button. Now the press and the click each resolve to
         the nearest pressable thing; they must be the same one, and it must not have moved. */
      const PRESS = 'button, a[href], input, select, textarea, label, summary, [role="button"], [role="tab"], [role="link"], [role="option"], [tabindex]:not([tabindex="-1"])'
      const t0 = e.target instanceof Element ? e.target : null
      const a0 = t0 ? t0.closest(PRESS) : null
      const box = a0 ?? t0
      const r0 = box ? box.getBoundingClientRect() : null
      const pid = (e as PointerEvent).pointerId
      let timer = 0
      const moved = () => {
        if (!box || !r0 || !box.isConnected) return true
        const r = box.getBoundingClientRect()
        return Math.abs(r.top - r0.top) >= 1 || Math.abs(r.left - r0.left) >= 1
      }
      const eat = (c: Event) => {
        const a1 = c.target instanceof Element ? c.target.closest(PRESS) : null
        if (a1 !== a0 || moved()) { c.preventDefault(); c.stopPropagation() }
        done()
      }
      const lift = (u: Event) => {
        const up = (u as PointerEvent).pointerId
        if (pid !== undefined && up !== undefined && up !== pid) return
        document.removeEventListener('pointerup', lift, true)
        document.addEventListener('click', eat, true)
        timer = window.setTimeout(done, 500)
      }
      const done = () => {
        document.removeEventListener('pointerup', lift, true); document.removeEventListener('click', eat, true)
        document.removeEventListener('pointercancel', done, true); document.removeEventListener('pointerdown', done, true)
        clearTimeout(timer)
      }
      document.addEventListener('pointerup', lift, true)
      document.addEventListener('pointercancel', done, true)
      setTimeout(() => document.addEventListener('pointerdown', done, true), 0)
    }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setPicking(false); pickBtn.current?.focus() } }
    document.addEventListener('pointerdown', down, true)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key) }
  }, [picking])
  const [armed, setArmed] = useState<string | null>(null)
  /* ANOTHER PERIOD STARTS THE PICK AFRESH (the D1444 read's F2): the rows already start afresh with the period (D1421), but the
     filter did not — "+2 in JAN - DEC 27 ›" with Feb picked opened the other period on the old Feb ("Nothing here for these
     dates", no chip lit, Approve all 0). The filter, the date picker and an armed Approve all go with the period. */
  const periodId = st.period.id
  useEffect(() => { setFilterRaw({ kind: 'all' }); setPicking(false); setArmed(null) }, [periodId])
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
        /* pending again (an Undo of the decision made here, or one made elsewhere put back): the light goes — the decisions
           kept aside, so a Redo lights the right one again (★1, M3) */
        const ids = new Set([...r.ids, ...recIds(match)])
        out.push({ key: r.key, line: match, ids, ...(r.forms ? { forms: r.forms } : {}), ...(r.msg && r.msg.kind === 'refused' ? { msg: r.msg } : {}) })
        continue
      }
      /* NOT PENDING: the line shows the decision the record now holds — the newest made here whose every day still stands
         as it left them. A lit line is asked too, never kept on trust (the fixes' M3 and M7: an Undo of a one-tap change of
         mind left "Refused" lit over an approval standing again; a change on the grid left "Approved" lit over a bid). */
      const standing = r.forms?.find(f => lineStale(r.line.personId, f.parts) === null)
      if (standing) {
        out.push({ key: r.key, line: { ...r.line, parts: standing.parts }, ids: r.ids, lit: standing.lit, ...(r.forms ? { forms: r.forms } : {}) })
        continue
      }
      /* …and decided here but put back to a bid ELSEWHERE (the grid's lit Approve — D1330): the new request is the same
         one, so it takes this line's place, pending, rather than standing beside a stale copy (M7) */
      if (r.forms?.length) {
        const again = fresh.find(l => !used.has(l) && l.personId === r.line.personId && l.code === r.line.code &&
          l.parts.map(p => p.date).join() === r.line.parts.map(p => p.date).join())
        if (again) {
          used.add(again)
          out.push({ key: r.key, line: again, ids: new Set([...r.ids, ...recIds(again)]), forms: r.forms })
          continue
        }
      }
      /* JOINED into a line another row already holds (a day placed between two drawn lines — D1339, D1346), every day of
         it still standing: that row is the line now, so this one simply goes — never a greyed "No longer there" (★8) */
      if ([...r.ids].some(id => byId.has(id)) && lineStale(r.line.personId, r.line.parts) === null) {
        const holder = out.find(x => { const xIds = new Set(recIds(x.line)); return [...r.ids].some(id => x.ids.has(id) || xIds.has(id)) })
        if (holder) r.ids.forEach(id => holder.ids.add(id))
        continue
      }
      /* gone from the pending list while on screen (B8), or its decision here no longer standing (M7): say what happened,
         unlit — a light says the record holds that decision, and it does not */
      const why = r.msg?.kind === 'stale' ? r.msg.why : lineStale(r.line.personId, r.line.parts) || 'No longer there'
      const { lit: _gone, ...rest } = r
      out.push({ ...rest, msg: { kind: 'stale', why } })
    }
    for (const l of fresh) if (!used.has(l)) out.push({ key: l.key, line: l, ids: new Set(recIds(l)) })
    out.sort((a, b) => (a.line.placedAt ?? -1) - (b.line.placedAt ?? -1) || (a.line.from < b.line.from ? -1 : a.line.from > b.line.from ? 1 : 0) || (a.key < b.key ? -1 : 1))
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh, st.period.id, tick])
  /* the rows as drawn, kept for the next merge and for Approve / Refuse — written once the render that drew them has
     committed, never during a render React may throw away (the next merge, and every press, comes after it) */
  const periodNow = st.period.id
  useLayoutEffect(() => { rowsRef.current = { period: periodNow, rows } })

  /* the figures, once per change of the war, for the lines still pending (a lit line keeps the figures it was decided on) */
  const people = st.people
  const figs = useMemo(() => {
    const m = new Map<string, ApprFigures>()
    /* each man found once by his id (the first with it, as a search of the list would) */
    const byId = new Map<string, (typeof people)[number]>()
    for (const p of people) if (!byId.has(p.id)) byId.set(p.id, p)
    for (const r of rows) {
      if (r.lit || r.msg?.kind === 'stale') continue
      m.set(r.key, figuresOf(r.line, byId.get(r.line.personId)))
    }
    return m
  }, [rows, people])
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
        /* the decision and the parts it left, newest first — what an Undo or Redo is read against (M3). EVERY one is kept,
           not one a light (the fixes' round 2, R2-3): each approval is a leave of its own, so Approve, Refuse, Approve lost
           the first approval, and two Undos found no decision standing though the record held it. An older one stands only
           where the record holds exactly its records again. */
        if (to !== 'pending') row.forms = [{ lit: to, parts: o.parts }, ...(row.forms ?? [])]
        delete row.msg
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

  /* (each chip keyed by what it stands for — the month chips are drawn from a list; with D1444, 28 Oct 26) */
  const fchip = (on: boolean, label: React.ReactNode, onClick: () => void, opts: { dim?: boolean; testid?: string } = {}) => (
    <button key={opts.testid} type="button" className={`appr-f${on ? ' on' : ''}${opts.dim ? ' dim' : ''}`} aria-pressed={on} onClick={onClick} data-testid={opts.testid}>{label}</button>
  )
  /* HIS D1444 (28 Oct 26 — D1439 built as drawn, scripts/handpass/lw-m4-d1439-mock.mjs): on a phone only the months holding
     requests show, on the row of New and All in the grid's own columns — a month's chip comes with its first request and
     goes with its last, and Pick dates… still reaches any date; the month he has picked stays while it is picked, so the
     choice he made never vanishes under him. The desktop keeps every month, a month with nothing pending dimmed (D1430). */
  /* …AND A MONTH WHOSE LINE STILL STANDS ON THE PAGE KEEPS ITS CHIP (the D1444 read's F1; the host's reading, to be named to
     him): deciding a month's only request took its chip away at once, and where that emptied a row of chips the lit line and
     everything under it jumped up 42px under his finger — against D1421 (nothing moves under his finger) and D672 (an Undo
     leaves the screen where it is). So a chip stays, dimmed as a month with nothing pending is, while any line of its month
     stands on the page — pending, decided here, or gone — and goes when the rows start afresh: another filter, another
     period, leaving Approvals. (`rows` holds every line of the period whatever the filter.) */
  const monthOnPage = (ym: string) => rows.some(r => r.line.parts.some(p => p.date.slice(0, 7) === ym))
  const monthShown = (ym: string) => !phone || monthOnPage(ym) || (filter.kind === 'month' && filter.ym === ym)
  const filterRow = (
    <div className="appr-filters" role="group" aria-label="Which requests to show">
      {fchip(filter.kind === 'new', <><span className={`appr-dot${newCount ? '' : ' none'}`} aria-hidden="true" />New {newCount}</>, () => setFilter({ kind: 'new' }), { testid: 'appr-new' })}
      {/* a thin upright line between New and the dates, as drawn (his D1430, r22-1-desk), so New never reads as one more date */}
      {!phone && <span className="appr-vs" aria-hidden="true" />}
      {!phone && <span className="appr-lab">Dates</span>}
      {fchip(filter.kind === 'all', 'All', () => setFilter({ kind: 'all' }), { testid: 'appr-all' })}
      {months.filter(monthShown).map(ym => fchip(filter.kind === 'month' && filter.ym === ym, MON[+ym.slice(5, 7) - 1], () => setFilter({ kind: 'month', ym }), { dim: !monthHas(ym), testid: `appr-m-${ym}` }))}
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
          {/* on a phone "+2 in JAN – DEC 27 ›" — the period's own name, "pending" dropped — so it stands on the title's line
              (his D1444); the desktop keeps its words */}
          +{e.n}{phone ? '' : ' pending'} in {e.name} ›
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
          // eslint-disable-next-line react-doctor/prefer-tag-over-role -- the list holds its column-heading row, which is no request: a <ul> may hold only list items, and the browser's list margins and markers would change its look
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
          // eslint-disable-next-line react-doctor/prefer-tag-over-role -- the list holds its own heading line, which is no list item: a <ul> may hold only list items, and the browser's list margins and markers would change its look
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

// eslint-disable-next-line react-doctor/no-high-complexity-react-function -- one request's line, its phone and desktop layouts built from the same parts side by side; split, the two layouts could drift apart
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
      // eslint-disable-next-line react-doctor/prefer-tag-over-role -- a line of the list above, which stays a role="list" box (it holds its column headings): an <li> outside a <ul> is not valid
      <div className={`appr-line ph${r.lit ? ` lit-${r.lit}` : ''}${stale ? ' stale' : ''}`} role="listitem" data-testid={`appr-line-${l.personId}`}>
        <div className="appr-l1">{puck}{box}{dates}{clip}{btns}</div>
        <div className="appr-l2">{days}{bal}{avail}{placed}</div>
      </div>
    )
  }
  return (
    // eslint-disable-next-line react-doctor/prefer-tag-over-role -- a line of the list above, which stays a role="list" box (it holds its column headings): an <li> outside a <ul> is not valid
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
    // eslint-disable-next-line react-doctor/prefer-tag-over-role -- a line of the "Also since you last looked" list, which stays a role="list" box (it holds its heading): an <li> outside a <ul> is not valid
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
      {/* "15 pending · 3 new", as both drawings write it (r22-4-desk, r22-6-phone — his D1432, D1440) */}
      <span className="appr-slim-n">{n} pending{VISIT.newCount ? ` · ${VISIT.newCount} new` : ''}</span>
      <span className="appr-spring" />
      <button type="button" className="appr-back" data-testid="appr-back" onClick={() => setApprMode('page')}>Back ▴</button>
      <button type="button" className="appr-x" data-testid="appr-slim-x" aria-label="Close Approvals" onClick={() => setApprMode('off')}>✕</button>
    </div>
  )
}
