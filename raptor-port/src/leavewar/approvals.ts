/* THE APPROVALS LIST'S LINES AND FIGURES (the Leave War overhaul's M4, 8.1 and 8.2 — D1152, D1184, D1189, D1180, D1181,
   D1178, D1192, D1246, D1339, D1346; the build spec §1, §4).

   A LINE IS ONE REQUEST AS THE GRID TREATS IT: the days placed together (D1339, D1346) — one man, one war, the same code,
   state, words, till tick and documents, days in a row (the store's `reqRunKey`, the run one approval turns into one
   Input) — whatever their number: a five-day OL is one line. Oldest first by when it was placed; a request saved before M4
   has no "placed" and sorts first (its PLACED reads a dash). A line joined from next-door bids placed at different times or
   by different people shows the EARLIEST placed time and its "by".

   THE FIGURES are worked out from the war as it stands, ONE time per change of the war (the page memoises them on the
   store's version) — never per repaint of the grid:
   · DAYS — the request's OWN days, as its kind charges them (engine/charge.ts, the one charging rule, run on the
     request alone — `ownDays`): a weekend or a holiday inside it is not counted; a half day is 0.5 (D1246). My leave's
     "pending" is the sum of these (ui/myleave.ts — the M5a build spec's reading 14). Run on the request alone, not on
     his whole leave: a bid that lengthens a pilot's approved run past 15 days counts its own weekdays here, while the
     run's weekends it makes cost show in his tile's Pending (reading 24, §1.5 row 10 — the one case the two differ).
   · LVE BAL — his War bal of the kind the request spends (M5a: the one engine, engine/leaveyear.ts through the store's
     `leaveFiguresOf` — the figure beside his name on the grid and on My leave): a bid takes its leave off at once
     (D1153), so the figure already counts it. A CCL request shows its own kind's War bal, labelled; an OIL request the
     OIL tracker's balance (OIL is never a typed figure — D1209).
   · LOWEST AVAIL — his seat's Available row at its lowest over the request's days, then every Manning row the request
     turns amber or red (or lowers further while already there — D1345's rule, the bid bubble's), each in its colour. Read
     off the bid windows' own what-if (engine/whatif.ts dayWhatIf), on the day rebuilt WITHOUT just this request (the
     other half kept), so the answer is what THIS request does, never the day's every amber row (the survey §4). A man the
     Available rows never count (SANS) reads "SANS · not in Avail". */
import {
  addDays, availPointsOf, availVerdict, chargedDays, codeOf as leaveCodeOf, counterLabel, dayView,
  evaluateDay, fillRow, oilLedgerOf, parseCell,
  type Person, type RequestRec, type Views, type CounterName, type FigureCtx, type LeaveSource,
} from './engine'
import { AM, FULL, PM, type DayView } from './engine/dayview'
import { BAL_KINDS, KIND_COUNTER } from './engine/leaveyear'
import { dayWhatIf, type DayWhatIf, type WhatIfLevel, type WhatIfWar } from './engine/whatif'
import { availRules, figureCtxOf, getState, groupIdOf, leaveFiguresOf, rawState, reqRunKey, type DecidePart } from './state/store'
import { flyAnswer, rosterIsSans } from './sync'

export interface ApprLine {
  /** steady for the visit: the man and his first request's id when the line was first drawn */
  key: string
  personId: string
  warId: string
  code: string
  parts: DecidePart[]
  from: string
  to: string
  placedAt?: number
  placedBy?: string
  remarks?: string
  docIds: string[]
}

export interface ApprFigures {
  days: number
  bal: { counter: CounterName; label: string; value: number } | null
  /** his seat's Available row at its lowest over the days, and its level; null where he is never counted */
  avail: { label: string; value: number; level: WhatIfLevel | null } | null
  /** each Manning row the request turns amber or red, at its lowest */
  turned: Array<{ label: string; value: number; level: WhatIfLevel }>
  sans: boolean
}

/** Every line waiting in one war's records (pending requests only), oldest placed first. */
export function linesOfWar(war: { period: { id: string }; recs: Record<string, Record<string, readonly any[]>> }): ApprLine[] {
  const out: ApprLine[] = []
  for (const [personId, byDate] of Object.entries(war.recs)) {
    const dates = Object.keys(byDate).sort()
    /* the runs: a pending request continues the line of the day before when its run key matches */
    const open = new Map<string, ApprLine>()          // run key → the line the day before ended
    let prevDate = ''
    for (const date of dates) {
      const reqs = (byDate[date] ?? []).filter((r: any): r is RequestRec => r && r.kind === 'request' && r.state === 'pending')
      const next = new Map<string, ApprLine>()
      for (const r of reqs) {
        const k = reqRunKey(r)
        const line = prevDate && addDays(prevDate, 1) === date ? open.get(k) : undefined
        if (line) {
          line.to = date
          line.parts.push({ date, recId: r.id, code: r.code, state: 'pending' })
          if (typeof r.placedAt === 'number' && (line.placedAt === undefined || r.placedAt < line.placedAt)) { line.placedAt = r.placedAt; line.placedBy = r.placedBy }
          next.set(k, line)
          continue
        }
        const l: ApprLine = {
          key: `${personId}|${r.id}`, personId, warId: war.period.id, code: r.code, from: date, to: date,
          parts: [{ date, recId: r.id, code: r.code, state: 'pending' }],
          ...(typeof r.placedAt === 'number' ? { placedAt: r.placedAt } : {}), ...(r.placedBy ? { placedBy: r.placedBy } : {}),
          ...(r.remarks ? { remarks: r.remarks } : {}), docIds: [...(r.docIds ?? [])],
        }
        out.push(l)
        next.set(k, l)
      }
      open.clear()
      for (const [k, l] of next) open.set(k, l)
      prevDate = date
    }
  }
  /* oldest placed first; one saved before M4 (no "placed") first of all; then by date, so the order never wobbles */
  return out.sort((a, b) => (a.placedAt ?? -1) - (b.placedAt ?? -1) || (a.from < b.from ? -1 : a.from > b.from ? 1 : 0) || (a.key < b.key ? -1 : 1))
}

/** The tab's count (8.1): every pending request in EVERY period — the only sign that anything waits (D1208, D1219). */
export function pendingCount(): number {
  let n = 0
  for (const w of rawState().wars) n += linesOfWar(w).length
  return n
}
/** where other periods hold pending lines: "+4 pending in JAN – DEC 27 ›" (8.1, the fresh read's finding 5) */
export function pendingElsewhere(): Array<{ warId: string; name: string; n: number }> {
  const st = rawState()
  return st.wars.filter(w => w.period.id !== st.currentId).map(w => ({ warId: w.period.id, name: w.period.name, n: linesOfWar(w).length })).filter(x => x.n > 0)
}

/* the Available judge — the bid windows' own (sync.ts bidDayLine): the figure against that day's Required, by the row's points */
function judge(seat: 'p' | 'w', have: number, iso: string): '' | WhatIfLevel {
  const rules = availRules()
  const a = flyAnswer(iso)
  return availVerdict(have, a.reqFrom[seat] === 'nf' ? null : a.req[seat], availPointsOf(rules[seat])) as '' | WhatIfLevel
}

/** THE DAYS OF ONE REQUEST, AS ITS KIND CHARGES THEM — the request alone (its days, its codes, their halves), under the
 *  wars' periods and holidays and the pilots' 15-day rule (engine/charge.ts chargedDays): a weekend or a holiday 0, a
 *  half .5. Approvals' DAYS for a line, and, summed over his lines, My leave's "pending" (ui/myleave.ts). */
export function ownDays(personId: string, parts: ReadonlyArray<{ date: string; code?: string }>, ctx: FigureCtx = figureCtxOf()): number {
  const row: Record<string, DayView> = {}
  const held = new Map<string, Array<{ code: string; win: typeof FULL }>>()
  for (const p of parts) {
    const cell = parseCell(p.code)
    if (!cell) continue
    const win = cell.portion === 'am' ? AM : cell.portion === 'pm' ? PM : FULL
    held.set(p.date, [...(held.get(p.date) ?? []), { code: cell.type, win }])
  }
  for (const [date, list] of held) row[date] = dayView(list.map((x, i) => ({ id: `own:${date}:${i}`, kind: 'request' as const, code: x.code, win: x.win, state: 'pending' as const })))
  /* the wars only for their periods (which days are holidays), never their leave; the request is the one row */
  const sources: LeaveSource[] = [...ctx.sources.map(w => ({ grid: {}, states: {}, views: {}, ...(w.period ? { period: w.period } : {}) })), { grid: {}, states: {}, views: { [personId]: row } }]
  let days = 0
  for (const list of chargedDays(sources, personId, ctx).values()) for (const t of list) days += t.amount
  return Math.round(days * 2) / 2
}

/** One line's figures, on the war on screen (the list shows the period on view — D1184). */
export function figuresOf(line: ApprLine, who: Person | undefined): ApprFigures {
  const st = getState()
  const ctx = figureCtxOf()
  /* DAYS — the request's own days, as its kind charges them (`ownDays`) */
  const days = ownDays(line.personId, line.parts, ctx)
  /* LVE BAL — his War bal of the kind it spends, as it stands (it already counts this request — D1153); OIL the tracker's */
  const spends = leaveCodeOf(line.code)?.spends ?? null
  let bal: ApprFigures['bal'] = null
  if (spends) {
    const kind = BAL_KINDS.find(k => KIND_COUNTER[k] === spends.counter)
    const value = spends.counter === 'oil' ? oilLedgerOf(ctx, line.personId).balance : kind ? leaveFiguresOf(line.personId).kinds[kind].war : null
    if (value !== null) bal = { counter: spends.counter, label: spends.counter === 'annual' ? '' : counterLabel(spends.counter), value }
  }
  /* LOWEST AVAIL — this request's own what-if, day by day */
  /* a SANS man — drawn in the SANS group, or not on the war at all while SANS is off it (D1215, D1221): then the war's
     roster has no row for him and the roster is asked (the scenario designer's ★10) */
  const sans = who ? groupIdOf(who) === 'SANS' : rosterIsSans(line.personId)
  const war: WhatIfWar = { people: st.people, grid: st.grid, states: st.states, requirements: st.requirements, views: st.views, avail: availRules() }
  let avail: ApprFigures['avail'] = null
  const turned = new Map<string, { label: string; value: number; level: WhatIfLevel }>()
  for (const p of line.parts) {
    const row = st.views[line.personId] ?? {}
    const day = row[p.date]
    /* the day WITHOUT just this request — the other half and everything else kept */
    const without = day ? dayView(day.all.filter(c => c.id !== p.recId)) : undefined
    const views: Views = { ...st.views, [line.personId]: { ...row, ...(without ? { [p.date]: without } : {}) } }
    const w: DayWhatIf = dayWhatIf({ ...war, views }, line.personId, p.date, line.code, judge)
    if (w.avail && (!avail || w.avail.after < avail.value)) avail = { label: w.avail.label, value: w.avail.after, level: w.avail.level }
    /* the Manning rows, by the bubble's rule (D1345): a row the request turns amber or red, or one already there whose
       figure it lowers further */
    const after: Views = { ...views, [line.personId]: fillRow(views[line.personId] ?? {}, [p.date], line.code) }
    const was = evaluateDay(st.people, st.grid, st.states, st.requirements, p.date, views)
    const now = evaluateDay(st.people, st.grid, st.states, st.requirements, p.date, after)
    const RANK = { ok: 0, amber: 1, red: 2 } as const
    for (const r of now.results) {
      if (r.verdict === 'ok') continue
      const b = was.results.find(x => x.ruleId === r.ruleId)
      if (b && RANK[r.verdict] <= RANK[b.verdict] && r.have >= b.have) continue
      const t = turned.get(r.ruleId)
      if (!t || r.have < t.value || (r.verdict === 'red' && t.level !== 'red')) turned.set(r.ruleId, { label: r.label, value: r.have, level: r.verdict })
    }
  }
  return { days, bal, avail, turned: [...turned.values()], sans }
}
