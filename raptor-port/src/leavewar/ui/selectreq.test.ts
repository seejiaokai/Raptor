// @vitest-environment jsdom
/* PICKING SEVERAL REQUIRED CELLS — the grid's drag, a THIRD kind (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3 "Picking several"; owner D636, D637, D622).

   A drag that starts on a Required cell picks a rectangle over the two Required rows × days. The event rows' one-line
   rule is NOT reused — both seats in one pick is the point (D622: one number can fill both). Arming is the grid's own,
   unchanged for every kind: 4px for a mouse (so Shift-drag and press-pause-drag both pick — D636), a 180ms hold for a
   finger. The geometry is pure (`parseReqCell`, `reqRange`); the gesture is `wireSelect`'s, parameterised. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseReqCell, reqRange, wireSelect, type ReqSelection, type Selection } from './select'

describe('a Required cell’s id', () => {
  it('is req-p-<date> or req-w-<date>, and nothing else of the four rows', () => {
    expect(parseReqCell('req-p-2026-01-05')).toEqual({ row: 'p', date: '2026-01-05' })
    expect(parseReqCell('req-w-2026-12-31')).toEqual({ row: 'w', date: '2026-12-31' })
    for (const no of ['avail-p-2026-01-05', 'fly-row-req-p', 'req-x-2026-01-05', 'req-p-2026-1-5', 'cell-req-p-2026-01-05', '', null, undefined])
      expect(parseReqCell(no as any), String(no)).toBeNull()
  })
})

describe('the rectangle between two Required cells', () => {
  const DATES = ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08']
  it('one row dragged along: that seat, the days between, in the grid’s order', () => {
    expect(reqRange(DATES, { row: 'w', date: '2026-01-07' }, { row: 'w', date: '2026-01-05' }))
      .toEqual({ rows: ['w'], from: '2026-01-05', to: '2026-01-07', dates: ['2026-01-05', '2026-01-06', '2026-01-07'] })
  })
  it('across both rows: BOTH seats — pilots first, whichever row the drag began on', () => {
    expect(reqRange(DATES, { row: 'w', date: '2026-01-06' }, { row: 'p', date: '2026-01-06' })!.rows).toEqual(['p', 'w'])
    expect(reqRange(DATES, { row: 'p', date: '2026-01-06' }, { row: 'w', date: '2026-01-08' }))
      .toEqual({ rows: ['p', 'w'], from: '2026-01-06', to: '2026-01-08', dates: ['2026-01-06', '2026-01-07', '2026-01-08'] })
  })
  it('a date off the drawn days paints nothing rather than guessing', () => {
    expect(reqRange(DATES, { row: 'p', date: '2026-02-01' }, { row: 'p', date: '2026-01-06' })).toBeNull()
  })
})

describe('the drag itself, on the grid’s one listener', () => {
  const DATES = ['2026-01-05', '2026-01-06', '2026-01-07']
  let wrap: HTMLElement, teardown: () => void
  let under: Element | null = null
  const origEFP = document.elementFromPoint
  const picked: ReqSelection[] = [], roster: Selection[] = []
  let reqOn = true
  const td = (id: string) => wrap.querySelector(`[data-testid="${id}"]`) as HTMLElement
  const ev = (type: string, target: EventTarget, init: PointerEventInit = {}) =>
    target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 1, pointerType: 'mouse', button: 0, clientX: 5, clientY: 5, ...init }))
  beforeEach(() => {
    vi.useFakeTimers()
    picked.length = 0; roster.length = 0; reqOn = true
    document.elementFromPoint = () => under
    wrap = document.createElement('div')
    for (const row of ['req-p', 'req-w', 'avail-p', 'cell-ramp']) for (const d of DATES) {
      const c = document.createElement('div'); c.setAttribute('data-testid', `${row}-${d}`); wrap.appendChild(c)
    }
    document.body.appendChild(wrap)
    teardown = wireSelect(wrap, {
      order: () => ['ramp'], dates: () => DATES, enabled: () => true, onSelect: s => roster.push(s),
      reqEnabled: () => reqOn, onReqSelect: s => picked.push(s),
    })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  it('a mouse drag from a Required P cell to a Required W cell two days on picks both rows × three days, painted as it goes', () => {
    ev('pointerdown', td('req-p-2026-01-05'))
    under = td('req-w-2026-01-07')
    ev('pointermove', window, { clientX: 30 })
    for (const r of ['req-p', 'req-w']) for (const d of DATES) expect(td(`${r}-${d}`).classList.contains('selcell'), `${r}-${d}`).toBe(true)
    expect(td('avail-p-2026-01-05').classList.contains('selcell')).toBe(false)
    ev('pointerup', window)
    expect(picked).toEqual([{ rows: ['p', 'w'], from: '2026-01-05', to: '2026-01-07', dates: DATES }])
    expect(roster).toEqual([])
    expect(wrap.querySelector('.selcell')).toBeNull()                 // the gesture wipes its own paint on release
  })
  it('kept to one row: that seat alone', () => {
    ev('pointerdown', td('req-w-2026-01-06'))
    under = td('req-w-2026-01-07')
    ev('pointermove', window, { clientX: 30 }); ev('pointerup', window)
    expect(picked).toEqual([{ rows: ['w'], from: '2026-01-06', to: '2026-01-07', dates: ['2026-01-06', '2026-01-07'] }])
  })
  it('straying onto another row of the grid keeps the rows it had and takes that column’s DATE', () => {
    ev('pointerdown', td('req-p-2026-01-05'))
    under = td('cell-ramp-2026-01-07')                                 // the finger slid down into the roster
    ev('pointermove', window, { clientX: 30 }); ev('pointerup', window)
    expect(picked).toEqual([{ rows: ['p'], from: '2026-01-05', to: '2026-01-07', dates: DATES }])
  })
  it('over nothing at all it holds the last cell it was over', () => {
    ev('pointerdown', td('req-p-2026-01-05'))
    under = td('req-w-2026-01-06'); ev('pointermove', window, { clientX: 30 })
    under = null; ev('pointermove', window, { clientX: 60 }); ev('pointerup', window)
    expect(picked[0]).toMatchObject({ rows: ['p', 'w'], to: '2026-01-06' })
  })
  it('a press that never moves 4px is an ordinary click: nothing picked', () => {
    ev('pointerdown', td('req-p-2026-01-05')); ev('pointermove', window, { clientX: 7 }); ev('pointerup', window)
    expect(picked).toEqual([])
  })
  it('a finger must hold 180ms; then even a still lift picks the one cell', () => {
    ev('pointerdown', td('req-p-2026-01-06'), { pointerType: 'touch' })
    under = td('req-p-2026-01-06')
    vi.advanceTimersByTime(200)
    ev('pointerup', window, { pointerType: 'touch' })
    expect(picked).toEqual([{ rows: ['p'], from: '2026-01-06', to: '2026-01-06', dates: ['2026-01-06'] }])
  })
  it('a quick finger flick across them is the grid’s own scroll, never a pick', () => {
    ev('pointerdown', td('req-p-2026-01-05'), { pointerType: 'touch' })
    ev('pointermove', window, { pointerType: 'touch', clientX: 60 }); ev('pointerup', window, { pointerType: 'touch' })
    expect(picked).toEqual([])
  })
  it('not for a member (or wherever the caller says no): a press on a Required cell starts nothing', () => {
    reqOn = false
    ev('pointerdown', td('req-p-2026-01-05')); under = td('req-w-2026-01-07')
    ev('pointermove', window, { clientX: 30 }); ev('pointerup', window)
    expect(picked).toEqual([]); expect(roster).toEqual([])
  })
  it('a drag that starts on an Available cell picks nothing; a roster drag is what it always was', () => {
    ev('pointerdown', td('avail-p-2026-01-05')); under = td('req-p-2026-01-07')
    ev('pointermove', window, { clientX: 30 }); ev('pointerup', window)
    expect(picked).toEqual([])
    ev('pointerdown', td('cell-ramp-2026-01-05')); under = td('cell-ramp-2026-01-06')
    ev('pointermove', window, { clientX: 30 }); ev('pointerup', window)
    expect(roster).toHaveLength(1); expect(roster[0]!.cells).toHaveLength(2)
    /* and a roster drag that strays over the Required rows stays a roster drag */
    ev('pointerdown', td('cell-ramp-2026-01-05')); under = td('req-p-2026-01-07')
    ev('pointermove', window, { clientX: 30 }); ev('pointerup', window)
    expect(picked).toEqual([]); expect(roster).toHaveLength(2)
  })
})
