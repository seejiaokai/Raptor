/* LOOK F ON THE GRID — the box a day draws, pinned whole (D1175, D1160, D1145, D1146, D1167; Ack gone, D1158).
   A box is `<span class="c k-<kind> s-<fill> <place>[ wide][ raptor][ moved]">TEXT</span>` in a cell marked `hasc`:
   its colour is its kind, its fill where it stands (a filled, w hollow and dashed — pending, r grey and struck —
   refused; what nobody bids for is filled), its place how much of the day (whole, top morning, bot afternoon). A day
   with exactly two entries draws both — two halves top and bottom, two whole days left and right, a whole day beside
   a half with the half in its own half of the right side — and drops its "+1" (an amber "!" stays); three or more keep
   one box and "+n". */
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { closeDates, ingestDutyCredit, initStore, lwEditLists, setBidState, setCell, setPostOut, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { Matrix } from './Matrix'

beforeEach(() => { initStore(memoryBackend()) })

const P = 'dusk'
const D = '2026-02-11'
const cell = (d = D) => screen.getByTestId(`cell-${P}-${d}`)
/** each box's look classes and letters — the `raptor` edge (filed on the Inputs page) is an edge mark, pinned on its
 *  own, so it is left out here */
const boxes = (d = D) => [...cell(d).querySelectorAll('.c')].map(b => [b.className.replace(/ raptor\b/, ''), b.textContent])
const decide = (d: string, bid: 'approved' | 'refused') => act(() => { setRole('admin'); closeDates('2026-01-01', '2026-12-31'); setBidState(P, d, bid) })

describe('one entry, one box', () => {
  it('a whole day of approved LL is `k-ll s-a whole`, in a cell marked hasc', () => {
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-ll s-a whole', 'LL']])
    expect(cell().classList.contains('hasc')).toBe(true)
    // filed on the Inputs page, so its left edge says so — on top of the look, never instead of it
    expect(cell().querySelector('.c')!.classList.contains('raptor')).toBe(true)
  })

  it('a morning LL bid, pending, is hollow in the top half — `s-w top`, no arrow', () => {
    expect(setCell(P, D, '*LL')).toBe(true)
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-ll s-w top', 'LL']])
  })

  it('an afternoon bid approved fills the bottom half; a refused one is struck — `s-r`', () => {
    expect(setCell(P, D, 'OL*')).toBe(true)
    expect(setCell(P, '2026-02-12', 'LL')).toBe(true)
    render(<Matrix />)
    decide(D, 'approved')
    decide('2026-02-12', 'refused')
    expect(boxes()).toEqual([['c k-ol s-a bot', 'OL']])
    expect(boxes('2026-02-12')).toEqual([['c k-ll s-r whole', 'LL']])
  })

  it('an FO credit is OIL green and filled — `k-oil s-a` — with the app’s star', () => {
    ingestDutyCredit(P, D, 'FO', 'Duty', [[480, 1080]])
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-oil s-a whole', 'FO*']])
  })

  it('a medical is rose and filled — `k-med s-a` — ATT B printed B', () => {
    fileAbsence(P, 'ATTB', D)
    fileAbsence(P, 'HL', '2026-02-12')
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-med s-a whole', 'B']])
    expect(boxes('2026-02-12')).toEqual([['c k-med s-a whole', 'HL']])
  })

  it('a three-letter code is `wide` (a step smaller, D1167); an empty day has no box and no hasc', () => {
    fileAbsence(P, 'CCL', D)
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-care s-a whole wide', 'CCL']])
    expect(boxes('2026-02-13')).toEqual([])
    expect(cell('2026-02-13').classList.contains('hasc')).toBe(false)
  })
})

describe('two entries on one day both show (D1146, D1167)', () => {
  it('a morning LL and an afternoon bid: top and bottom, each its own fill, and no +1', () => {
    fileAbsence(P, '*LL', D)
    expect(setCell(P, D, 'OIL*')).toBe(true)
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-ll s-a top', 'LL'], ['c k-oilt s-w bot wide', 'OIL']])   // an OIL taken: its own kind (D1323)
    expect(screen.queryByTestId(`mark-${P}-${D}`)).toBeNull()
    expect(cell().classList.contains('mkd')).toBe(false)
  })

  it('two whole days — leave during a course — side by side, each the full height', () => {
    fileAbsence(P, 'CSE', D)
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    const b = boxes()
    expect(b).toHaveLength(2)
    expect(b.map(([cls]) => cls!.split(' ').find(c => c === 'left' || c === 'right'))).toEqual(['left', 'right'])
    expect(b.map(([, t]) => t).sort()).toEqual(['CSE', 'LL'])
    expect(b.find(([, t]) => t === 'CSE')![0]).toContain('k-cse s-a')
    expect(b.find(([, t]) => t === 'LL')![0]).toContain('k-ll s-a')
    expect(screen.queryByTestId(`mark-${P}-${D}`)).toBeNull()
  })

  it('a whole day of leave and an HO in the morning: the leave on the left, the HO in the right’s top half', () => {
    fileAbsence(P, 'LL', D)
    ingestDutyCredit(P, D, 'HO', 'Duty', [[480, 660]])
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-ll s-a left', 'LL'], ['c k-oil s-a right-am', 'HO*']])
    // a credit the schedule earned on a day of leave is the admin's to look at (the clash rules, not look F): its amber
    // "!" stays with both boxes drawn — only a "+1" is dropped
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
  })

  it('two leaves on the same time: both drawn, and the amber ! stays', () => {
    fileAbsence(P, 'LL', D)
    fileAbsence(P, 'OL', D)          // planted raw — the door would refuse it
    render(<Matrix />)
    expect(cell().querySelectorAll('.c')).toHaveLength(2)
    const mk = screen.getByTestId(`mark-${P}-${D}`)
    expect(mk.textContent).toBe('!')
    expect(mk.className).toContain('warn')
  })

  it('three entries keep one box and "+2"', () => {
    fileAbsence(P, 'CSE', D)
    fileAbsence(P, 'OD', D)
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    expect(cell().querySelectorAll('.c')).toHaveLength(1)
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('+2')
  })
})

/* WALKER 1's FAILS (M2's walk, 23 Oct 26 — `docs/handpass/parts/lw-m2-w1.md` #8, #9, #11). jsdom paints nothing, so
   these pin what the stylesheet keys on: the cell's `mklo` (the mark drops to the bottom-right) and `pohi` (the PO tag
   rises to the top-right) where the other corner on the right is free, their absence where it is not (the box's
   letters then step aside — `boxcorners-css.test.ts` pins those rules), and each box's own `raptor` edge. */
describe('a corner tile never covers a box’s letters (walker 1 #8, #9)', () => {
  const has = (c: string, d = D) => cell(d).classList.contains(c)
  const notice = () => {
    /* what the inputs door leaves when a filing replaced a bid — an amber "!" with no box of its own (as daylist.test) */
    act(() => { lwEditLists([{ personId: P, date: D, drop: [], add: [{ id: 'n-test', kind: 'notice', code: 'LL', was: 'pending', byType: 'ATT C', byWho: 'an admin', seq: 7, at: '2026-02-01' } as any] }]) })
  }

  it('#8 — a morning medical over an afternoon bid, with the "!": no free corner, so the mark stays and no class moves it', () => {
    fileAbsence(P, '*OML', D)
    expect(setCell(P, D, 'OL*')).toBe(true)
    notice()
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-med s-a top wide', 'OML'], ['c k-ol s-w bot', 'OL']])
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
    expect(has('mkd')).toBe(true)
    expect(has('mklo')).toBe(false)     // the top box's letters step aside instead (matrix.css)
  })

  it('#12’s observation — one morning box and its corner: the mark drops to the empty bottom-right', () => {
    fileAbsence(P, '*LL', D)
    fileAbsence(P, '*OL', D)          // two leaves on one morning: one box and the "!" (planted raw — the door would refuse it)
    render(<Matrix />)
    const b = boxes()
    expect(b).toHaveLength(1)
    expect(b[0]![0]).toMatch(/ top$/)
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
    expect(has('mklo')).toBe(true)
  })

  it('a whole day and a morning HO with the "!": the HO’s quarter is under the corner, so the mark drops below it', () => {
    fileAbsence(P, 'LL', D)
    ingestDutyCredit(P, D, 'HO', 'Duty', [[480, 660]])
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-ll s-a left', 'LL'], ['c k-oil s-a right-am', 'HO*']])
    expect(has('mklo')).toBe(true)
  })

  it('a whole day’s letters sit mid-height: the mark keeps its corner', () => {
    fileAbsence(P, 'CSE', D)
    fileAbsence(P, 'OD', D)
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('+2')
    expect(has('mklo')).toBe(false)
  })

  describe('after a posting-out (#9)', () => {
    beforeEach(() => { setRole('admin'); expect(setPostOut(P, '2026-02-10')).toBe(true) })

    it('#9b — an afternoon half: the PO tag rises to the empty top-right', () => {
      fileAbsence(P, 'LL*', D)
      render(<Matrix />)
      expect(boxes()).toEqual([['c k-ll s-a bot', 'LL']])
      expect(screen.getByTestId(`potag-${P}-${D}`)).toBeTruthy()
      expect(has('pohi')).toBe(true)
    })

    it('a whole day: the tag keeps its corner (it touches only the box’s corner, as the approved drawing has it)', () => {
      fileAbsence(P, 'LL', D)
      render(<Matrix />)
      expect(screen.getByTestId(`potag-${P}-${D}`)).toBeTruthy()
      expect(has('pohi')).toBe(false)
    })

    it('a morning and an afternoon: no free corner — the tag stays and the bottom box’s letters step aside', () => {
      fileAbsence(P, '*OL', D)
      fileAbsence(P, 'LL*', D)
      render(<Matrix />)
      expect(boxes()).toEqual([['c k-ol s-a top', 'OL'], ['c k-ll s-a bot', 'LL']])
      expect(has('pohi')).toBe(false)
    })

    it('a morning box with the "!": the tag holds the bottom-right, so the mark stays up and neither moves', () => {
      fileAbsence(P, '*LL', D)
      fileAbsence(P, '*OL', D)
      render(<Matrix />)
      expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
      expect(screen.getByTestId(`potag-${P}-${D}`)).toBeTruthy()
      expect(has('mklo')).toBe(false)
      expect(has('pohi')).toBe(false)
    })

    it('#9a — a posted-out day with nothing on it: the bare "PO" sits in the frame, centred (`c whole`, unboxed)', () => {
      render(<Matrix />)
      const d = '2026-02-12'
      expect(cell(d).classList.contains('gone')).toBe(true)
      expect(cell(d).classList.contains('hasc')).toBe(true)
      expect([...cell(d).querySelectorAll('.c')].map(b => [b.className, b.textContent])).toEqual([['c whole', 'PO']])
    })
  })
})

describe('the Inputs-page edge is each entry’s own, never the day’s (walker 1 #11)', () => {
  const edge = (d = D) => [...cell(d).querySelectorAll('.c')].map(b => [b.textContent, b.classList.contains('raptor')])

  it('an LL approved on the grid, then a course filed on the Inputs page: only the course wears the edge', () => {
    expect(setCell(P, D, 'LL')).toBe(true)
    decide(D, 'approved')
    fileAbsence(P, 'CSE', D)
    render(<Matrix />)
    expect(edge()).toEqual([['LL', false], ['CSE', true]])
  })

  it('a morning LL approved on the grid beside a course: the same', () => {
    expect(setCell(P, D, '*LL')).toBe(true)
    decide(D, 'approved')
    fileAbsence(P, 'CSE', D)
    render(<Matrix />)
    expect(edge()).toEqual([['LL', false], ['CSE', true]])
  })

  it('an LL approved on the grid beside overseas duty: the same', () => {
    expect(setCell(P, D, 'LL')).toBe(true)
    decide(D, 'approved')
    fileAbsence(P, 'OD', D)
    render(<Matrix />)
    expect(edge()).toEqual([['LL', false], ['OD', true]])
  })

  it('leave filed on the Inputs page keeps its edge beside a course; the app’s own credit wears it as the second box as it does alone', () => {
    fileAbsence(P, 'LL', D)
    fileAbsence(P, 'CSE', D)
    fileAbsence(P, 'LL', '2026-02-12')
    ingestDutyCredit(P, '2026-02-12', 'HO', 'Duty', [[480, 660]])
    ingestDutyCredit(P, '2026-02-13', 'HO', 'Duty', [[480, 660]])
    render(<Matrix />)
    expect(edge()).toEqual([['LL', true], ['CSE', true]])
    expect(edge('2026-02-12')).toEqual([['LL', true], ['HO*', true]])
    expect(edge('2026-02-13')).toEqual([['HO*', true]])
  })
})
