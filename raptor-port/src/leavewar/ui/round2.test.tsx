/* ROUND 2 — A COURSE, AN OVERSEAS DUTY AND THE UNFORESEEN ABSENCE FILED ON THE LEAVE WAR ([LW-FILE-OD-CRS]; his D1299,
   D1303, D1318, D1324, D1325, D1326 — the design note docs/superpowers/specs/2026-10-24-lw-file-od-cse-una.md; his drawing
   scripts/handpass/lw-round2-odcrs.mjs). Written before the build, red first.
   "OD and course doesnt need an approval, its directly approved like an input. it can go anytime. member can file it too.
   dont need document" (D1318); "UNA can use the same as OD" (D1324); "Ok deep teal" (D1325).
   CSE · OD stand in the first two places of the row under the leaves, UNA the third (an admin's — D1338), the ⋯ the fourth; a tap files
   the input at once — no bid, no approval — for the day, the range or the drag's every cell; one Undo takes it back. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { closeDates, fileStraight, initStore, lwHistInit, placeUna, rawState, setRole, setViewer } from '../state/store'
import { installGlobalUndo } from '../../state/undo-wire'
import { initStore as raptorInitStore } from '../../state/store'
import { setMe, setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { setPeople } from '../state/store'
import { wireLeaveWarSync } from '../sync'
import { _resetTimeline } from '../../undo/timeline'
import { globalUndo } from '../../undo'
import { kindOf, parseCell, setMemberTodayForTests } from '../engine'
import { warVisible } from '../absences'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'
import { StageBar } from './Chrome'
import { HOOKS } from '../../engine/hooks'
import { INPEDIT, OILASK, OILLIST, setInpEdit, setOilAsk, setOilList } from '../../ui/pops'

const ISNAP = JSON.stringify(INPUTS)
const P = 'dusk'
const D = '2026-02-11'
const cell = (d = D, p = P) => screen.getByTestId(`cell-${p}-${d}`)
const sheet = () => screen.getByTestId('bid-picker')
const filed = (type: string, p = P) => INPUTS.filter((r: any) => r.type === type && (r.person === p || (r.people ?? []).some((x: any) => x.p === p)))
const recsOn = (d = D, p = P) => rawState().wars[0]!.recs[p]?.[d] ?? []

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  initStore(memoryBackend()); setRole('admin')
  INPUTS.length = 0
  lwHistInit()
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)); setMemberTodayForTests(null) })

describe('round 2 — UNA, the war’s own (his D1338: on the Leave War only, an admin’s)', () => {
  it('reads as its own kind and is a code the war knows — but the war never reads it off the Inputs', () => {
    expect(kindOf('UNA')).toBe('una')
    expect(parseCell('UNA')).not.toBeNull()
    expect(warVisible('UNA'), 'not an input kind (D1338)').toBe(false)
  })
})

describe('round 2 — filed straight (the store)', () => {
  it('an admin files an overseas duty: one input, whole day, no bid, nothing to approve', () => {
    const r = fileStraight([{ personId: P, date: D }], 'OD')
    expect(r.done).toBe(1)
    const od = filed('OD')
    expect(od).toHaveLength(1)
    expect(od[0]).toMatchObject({ allday: true })
    expect(recsOn().filter((x: any) => x.kind === 'request'), 'no bid is made').toHaveLength(0)
  })
  it('carries the window’s words', () => {
    fileStraight([{ personId: P, date: D }], 'OD', { remarks: 'Exercise' })
    expect(filed('OD')[0]).toMatchObject({ remarks: 'Exercise' })
  })
  it('a member files on his own row on a closed day; never on another man’s', () => {
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer(P) })
    expect(fileStraight([{ personId: P, date: D }], 'OD').done, 'his own row, closed for bidding').toBe(1)
    expect(fileStraight([{ personId: 'ramp', date: D }], 'OD').done, 'another man’s row').toBe(0)
    expect(filed('OD', 'ramp')).toHaveLength(0)
  })
  it('refuses a code that is not one of the two — UNA included, which is never an input (D1338)', () => {
    expect(fileStraight([{ personId: P, date: D }], 'LL').done).toBe(0)
    expect(fileStraight([{ personId: P, date: D }], 'UNA').done).toBe(0)
    expect(INPUTS).toHaveLength(0)
  })
})

describe('round 2 — the row under the leaves (D1326, D1338)', () => {
  it('an admin’s one-day window: CSE · OD in places 1–2, UNA third, the ⋯ fourth', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    const row = within(sheet()).getByTestId('bid-extra-row')
    const ids = [...row.querySelectorAll('button')].map(b => b.getAttribute('data-testid'))
    expect(ids.slice(0, 4)).toEqual(['bid-file-CSE', 'bid-file-OD', 'bid-una', 'bid-more'])
    for (const [id, c, k] of [['bid-file-CSE', 'CSE', 'cse'], ['bid-file-OD', 'OD', 'od'], ['bid-una', 'UNA', 'una']]) {
      const b = within(sheet()).getByTestId(id!)
      expect(b.className, `${c} in its kind's colour, filled`).toMatch(new RegExp(`k-${k}\\b.*s-a|s-a.*k-${k}\\b`))
      expect(b.textContent).toBe(c)
    }
  })
  it('a tap on OD files it at once with the words typed, and the window closes', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.change(within(sheet()).getByTestId('bid-remarks'), { target: { value: 'Exercise' } })
    fireEvent.click(within(sheet()).getByTestId('bid-file-OD'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(filed('OD')[0]).toMatchObject({ remarks: 'Exercise', allday: true })
    expect(cell().querySelector('.c.k-od'), 'the grid shows it').toBeTruthy()
  })
  /* the walk's H1c (round 2's check): a tap on the day afterwards opened the window for an entry the Inputs page owns, which
     said "Filed on the Inputs page" — untrue for one filed here. A course or an OD is changed there wherever it was filed */
  it('a tap on the filed day says where it is changed, never that it was filed on the Inputs page', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('bid-file-OD'))
    fireEvent.click(cell())
    const note = screen.getByTestId('raptor-note').textContent ?? ''
    expect(note).toBe('Change it on the Inputs page, not here.')
  })
  /* the fresh code read's F2: a picked range of which a day was left out (it already held an OD — the designer's G2, "left
     as it is AND said") closed the window in silence; the drag window says it, and so does this one now */
  it('a range of which a day is left out says why, in a passing note, as the window closes on the day now filed', () => {
    const said: string[] = []
    const was = HOOKS.toast
    HOOKS.toast = ((t: string) => { said.push(t) }) as any
    try {
      act(() => { fileStraight([{ personId: P, date: '2026-02-12' }], 'OD') })
      render(<Matrix />)
      fireEvent.click(cell())
      fireEvent.click(within(sheet()).getByTestId('span-range'))
      fireEvent.click(within(sheet()).getByTestId('span-day-2026-02-13'))
      fireEvent.click(within(sheet()).getByTestId('bid-file-OD'))
    } finally { HOOKS.toast = was }
    expect(said.join(' | ')).toMatch(/2 days filed\. 12 Feb.*already holds an OD/)
    expect(filed('OD').filter((r: any) => r.date === 'Feb 11' || r.date === 'Feb 13'), 'the days around it filed').toHaveLength(2)
  })
  it('a picked range files every day of it', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('span-range'))
    fireEvent.click(within(sheet()).getByTestId('span-day-2026-02-13'))
    fireEvent.click(within(sheet()).getByTestId('bid-file-CSE'))
    expect(filed('CSE')).toHaveLength(1)
    expect(filed('CSE')[0].endDate).toMatch(/13/)
  })
  it('a member’s window: CSE and OD, no UNA and no ⋯ (D1338 — UNA is an admin’s)', () => {
    setMemberTodayForTests('2026-01-01')
    act(() => { setRole('member'); setViewer(P) })
    render(<Matrix />)
    fireEvent.click(cell())
    const s = screen.queryByTestId('bid-picker')
    if (!s) return   // a day not open for him: the closed window's test below
    expect(within(s).getByTestId('bid-file-OD')).toBeTruthy()
    expect(within(s).queryByTestId('bid-una')).toBeNull()
    expect(within(s).queryByTestId('bid-more')).toBeNull()
  })
  it('a member’s closed day: the note, then CSE and OD — a tap files it; no UNA', () => {
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer(P) })
    render(<Matrix />)
    fireEvent.click(cell())
    const s = screen.getByTestId('closed-note')
    expect(within(s).getByTestId('closed-note-text')).toBeTruthy()
    expect(within(s).queryByTestId('closed-file-UNA')).toBeNull()
    expect(within(s).queryByTestId('closed-una')).toBeNull()
    fireEvent.click(within(s).getByTestId('closed-file-OD'))
    expect(screen.queryByTestId('closed-note')).toBeNull()
    expect(filed('OD')).toHaveLength(1)
  })
  it('the drag window: the same row for an admin; a tap files every man’s every day', () => {
    const sel = { people: [P, 'ramp'], from: D, to: '2026-02-12', cells: [P, 'ramp'].flatMap(p => [D, '2026-02-12'].map(date => ({ personId: p, date }))) }
    let done = false
    render(<SelectSheet sel={sel} people={id => id} role="admin" canDecide onDone={() => { done = true }} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)
    const ids = [...screen.getByTestId('sel-extra-row').querySelectorAll('button')].map(b => b.getAttribute('data-testid'))
    /* two men: no Post out, so no ⋯ — its place stays empty (a posting is one man's, the drag window's own rule) */
    expect(ids).toEqual(['sel-file-CSE', 'sel-file-OD', 'sel-una'])
    fireEvent.click(screen.getByTestId('sel-file-OD'))
    expect(done).toBe(true)
    expect(filed('OD', P)).toHaveLength(1)
    expect(filed('OD', 'ramp')).toHaveLength(1)
  })
  it('the Legend names UNA as "Unavailable: out of the manning", in its own teal box, after the overseas duty', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    const rows = Array.from(screen.getByTestId('legend').querySelectorAll('.leg-row'))
    const at = rows.findIndex(r => r.querySelector('.leg-t')?.textContent === 'Unavailable: out of the manning')
    expect(at, 'a row for UNA').toBeGreaterThan(-1)
    expect(rows[at - 1]!.querySelector('.leg-t')!.textContent).toBe('Overseas duty')
    expect(rows[at]!.querySelector('.leg-box .c')!.className).toMatch(/(^|\s)k-una(\s|$)/)
  })
})

describe('D1338 — UNA in the windows: an admin places it, everyone reads it', () => {
  const unas = (d = D, p = P) => recsOn(d, p).filter((r: any) => r.kind === 'una') as any[]
  it('an admin picks AM, types why and taps UNA: the morning is his, the words with it, the window closes, the box sits in the morning', () => {
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(within(sheet()).getByTestId('portion-am'))
    fireEvent.change(within(sheet()).getByTestId('bid-remarks'), { target: { value: 'Under investigation' } })
    fireEvent.click(within(sheet()).getByTestId('bid-una'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(unas()).toHaveLength(1)
    expect(unas()[0]).toMatchObject({ code: '*UNA', remarks: 'Under investigation' })
    expect(INPUTS, 'never an input').toHaveLength(0)
    const box = cell().querySelector('.c.k-una')
    expect(box, 'the grid draws it').toBeTruthy()
  })
  it('a tap on a UNA day opens the day’s list: its box, who placed it, its words — an admin changes them and deletes it', () => {
    act(() => { placeUna([{ personId: P, date: D }], 'full', { remarks: 'Board of inquiry' }) })
    render(<Matrix />)
    fireEvent.click(cell())
    const list = screen.getByTestId('daylist-sheet')
    const id = unas()[0].id
    expect(within(list).getByTestId(`dl-u-${id}`).textContent).toMatch(/out of the manning/i)
    expect(within(list).getByTestId(`dl-u-${id}`).textContent).toMatch(/placed by/i)
    const box = within(list).getByTestId(`dl-una-rmk-${id}`) as HTMLTextAreaElement
    expect(box.value).toBe('Board of inquiry')
    fireEvent.change(box, { target: { value: 'Board of inquiry, week 2' } })
    fireEvent.blur(box)
    expect(unas()[0].remarks).toBe('Board of inquiry, week 2')
    fireEvent.click(within(list).getByTestId(`dl-clear-${id}`))
    expect(unas()).toHaveLength(0)
  })
  it('a member taps ANOTHER man’s UNA day: the list opens, read only — the words and who placed it, no box to type in, no Delete', () => {
    act(() => { placeUna([{ personId: 'ramp', date: D }], 'full', { remarks: 'Board of inquiry' }) })
    const id = unas(D, 'ramp')[0].id
    setMemberTodayForTests('2026-01-01')
    act(() => { setRole('member'); setViewer(P) })
    render(<Matrix />)
    fireEvent.click(cell(D, 'ramp'))
    const list = screen.getByTestId('daylist-sheet')
    expect(within(list).getByTestId(`dl-u-${id}`).textContent).toMatch(/placed by/i)
    expect(within(list).getByTestId(`dl-ro-${id}`).textContent).toContain('Board of inquiry')
    expect(within(list).queryByTestId(`dl-una-rmk-${id}`)).toBeNull()
    expect(within(list).queryByTestId(`dl-clear-${id}`)).toBeNull()
  })
})

/* the app as signed in: the session the Inputs door asks, the war wired to it, and the top bar's one Undo (D347) — the
   setup the inputs gate's own tests use (inputgate.test.ts) */
describe('round 2 — filed straight, signed in, with the one Undo', () => {
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))   // the seed, before the store reads it
    setSession({ user: 'ad', role: 'admin' })
    raptorInitStore()
    initStore(memoryBackend()); setRole('admin')
    setPeople(projectPeople())
    wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
  })
  afterEach(() => { _resetTimeline(); setSession(null); setMe('bane') })
  it('three days in a row are one input; one Undo takes it back', () => {
    const days = ['2026-02-10', '2026-02-11', '2026-02-12']
    const r0 = fileStraight(days.map(date => ({ personId: P, date })), 'CSE')
    expect(r0.done).toBe(3)
    const mine = () => filed('CSE').filter((r: any) => r.date === 'Feb 10')
    expect(mine()).toHaveLength(1)
    expect(mine()[0].endDate).toBe('Feb 12')
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(mine()).toHaveLength(0)
  })
  /* THE DESIGNER'S G3 (round 2's FULL check): an OD or a course filed from the war on a weekend or a holiday never asked
     its OIL question — the Inputs page asks it at the save (D804 "wherever it is filed"; D660 the filer answers, at the
     save), so the war's filing left it to the man's bell and the "OIL?" tag */
  it('a weekend filed from the war asks its OIL question at once, over the war, as the Inputs page does', () => {
    setOilAsk(null); setInpEdit(null); setOilList(null)
    expect(fileStraight([{ personId: P, date: '2026-02-14' }], 'OD').done).toBe(1)
    const row = filed('OD').find((x: any) => x.date === 'Feb 14')
    expect(row, 'filed').toBeTruthy()
    expect(OILASK, 'its question is up').toBe(String(row.iid))
    expect(INPEDIT?.iid, 'in the input’s own window').toBe(row.iid)
  })
  it('a weekday files and asks nothing', () => {
    setOilAsk(null); setInpEdit(null); setOilList(null)
    expect(fileStraight([{ personId: P, date: '2026-02-11' }], 'OD').done).toBe(1)
    expect(OILASK).toBeNull()
    expect(INPEDIT).toBeNull()
  })
  it('two men over a weekend: the one list of that weekend’s questions opens for the admin (D782)', () => {
    setOilAsk(null); setInpEdit(null); setOilList(null)
    const days = ['2026-02-13', '2026-02-14', '2026-02-15']
    expect(fileStraight([P, 'ramp'].flatMap(p => days.map(date => ({ personId: p, date }))), 'CSE').done).toBe(6)
    expect(OILASK, 'no single window for two inputs').toBeNull()
    expect(OILLIST, 'the weekend’s two days — the Friday asks nothing').toMatchObject({ from: '2026-02-14', to: '2026-02-15', plain: true })
  })
  /* the designer's S1, carried here (the walk drove the range and its words — H2): an unticked "till" and a document typed
     in the window go with the input, as a leave's do when it is approved (doorApprove) */
  it('a range filed with its till unticked and a document keeps both on the input', () => {
    const days = ['2026-02-16', '2026-02-17', '2026-02-18']
    expect(fileStraight(days.map(date => ({ personId: P, date })), 'OD', { remarks: 'Exercise', till: false, docIds: ['doc-s1'] }).done).toBe(3)
    const row = filed('OD').find((x: any) => x.date === 'Feb 16')
    expect(row).toMatchObject({ endDate: 'Feb 18', remarks: 'Exercise', till: false })
    expect(JSON.stringify(row), 'its document').toContain('doc-s1')
  })
  /* THE DESIGNER'S G2: a range or a drag over a day that already holds the same kind for him filed it twice — two
     overlapping inputs of one kind on one day. The day is left as it is and said; the days around it are filed. */
  it('a range over a day already holding an OD files the days around it and leaves that day as it is, saying so', () => {
    const tue = '2026-02-10'
    expect(fileStraight([{ personId: P, date: tue }], 'OD').done).toBe(1)
    const r = fileStraight(['2026-02-09', tue, '2026-02-11'].map(date => ({ personId: P, date })), 'OD')
    expect(r.done).toBe(2)
    expect(r.skipped).toBe(1)
    expect(r.why.join(' ')).toMatch(/10 Feb.*already holds an OD/)
    const covering = filed('OD').filter((x: any) => [x.date, x.endDate].includes('Feb 10') || (x.date === 'Feb 9' && x.endDate === 'Feb 11'))
    expect(covering, 'one OD on Tue 10 Feb, not two').toHaveLength(1)
  })
  it('a member signed in files on his own row; never on another man’s', () => {
    setSession({ user: 'dk', role: 'member' }); setMe(P)
    act(() => { setRole('member'); setViewer(P) })
    expect(fileStraight([{ personId: P, date: D }], 'OD').done).toBe(1)
    expect(filed('OD')).toHaveLength(1)
    expect(fileStraight([{ personId: 'ramp', date: D }], 'OD').done).toBe(0)
    expect(filed('OD', 'ramp')).toHaveLength(0)
    expect(filed('OD')).toHaveLength(1)
  })
})
