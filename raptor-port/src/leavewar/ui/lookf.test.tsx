/* LOOK F ON THE GRID — the box a day draws, pinned whole (D1175, D1160, D1145, D1146, D1167; Ack gone, D1158).
   A box is `<span class="c k-<kind> s-<fill> <place>[ wide][ raptor][ moved]">TEXT</span>` in a cell marked `hasc`:
   its colour is its kind, its fill where it stands (a filled, w hollow and dashed — pending, r grey and struck —
   refused; what nobody bids for is filled), its place how much of the day (whole, top morning, bot afternoon). A day
   with exactly two entries draws both and drops its "+1" (an amber "!" stays) — since his D1727 (6 Nov 26): two halves
   top and bottom, two whole days left and right with their codes turned (`bx-tilt`), a whole day beside a half keeping
   the whole cell (`whole bx-floor`) with the half over its own half (`bx-roof`); three or more keep one box, drawn as the
   top of a stack of cards (`bx-pile` on the cell). */
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
    expect(boxes()).toEqual([['c k-oil s-a whole bx-star', 'FO*']])   // the star takes its own letter size (D1727's fit)
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
    expect(b.every(([cls]) => cls!.split(' ').includes('bx-tilt'))).toBe(true)   // turned to read bottom to top (D1727)
    expect(b.map(([, t]) => t).sort()).toEqual(['CSE', 'LL'])
    expect(b.find(([, t]) => t === 'CSE')![0]).toContain('k-cse s-a')
    expect(b.find(([, t]) => t === 'LL')![0]).toContain('k-ll s-a')
    expect(screen.queryByTestId(`mark-${P}-${D}`)).toBeNull()
  })

  it('a whole day of leave and an HO in the morning: the leave keeps the whole cell, the HO over its morning (D1727)', () => {
    fileAbsence(P, 'LL', D)
    ingestDutyCredit(P, D, 'HO', 'Duty', [[480, 660]])
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-ll s-a whole bx-floor bx-lo', 'LL'], ['c k-oil s-a top bx-roof bx-am bx-star', 'HO*']])
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

  it('three entries keep one box, drawn as the top of a stack of cards; the "+2" stays in the cell for its words', () => {
    fileAbsence(P, 'CSE', D)
    fileAbsence(P, 'OD', D)
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    expect(cell().querySelectorAll('.c')).toHaveLength(1)
    expect(cell().classList.contains('bx-pile')).toBe(true)
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('+2')   // hidden by matrix.css, kept for its title
  })
})

/* THE DAY'S MARKS (his D1727, D1728, D1729, D1730, 6 Nov 26 — [LW-CELL-COMBOS]). jsdom paints nothing, so these pin
   what the stylesheet keys on (`boxcorners-css.test.ts` pins the rules): `bx-alarm` (the "!" an outlined tag the boxes
   make room for), `bx-pile` (the stack of cards for three or more), `bx-gone` (an entry after his posting out: stripes on
   its box, and no PO tag at all — D1728), `bx-last` (his last day in: the yellow line). They replaced the corner tiles'
   moves of 23 Oct 26 (`mklo`, `pohi`, walker 1's #8, #9). */
describe('the day’s marks (D1727, D1728)', () => {
  const has = (c: string, d = D) => cell(d).classList.contains(c)
  const notice = () => {
    /* what the inputs door leaves when a filing replaced a bid — an amber "!" with no box of its own (as daylist.test) */
    act(() => { lwEditLists([{ personId: P, date: D, drop: [], add: [{ id: 'n-test', kind: 'notice', code: 'LL', was: 'pending', byType: 'ATT C', byWho: 'an admin', seq: 7, at: '2026-02-01' } as any] }]) })
  }

  it('#8 — a morning medical over an afternoon bid, with the "!": the cell is `bx-alarm`, the boxes keep their halves', () => {
    fileAbsence(P, '*OML', D)
    expect(setCell(P, D, 'OL*')).toBe(true)
    notice()
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-med s-a top wide', 'OML'], ['c k-ol s-w bot', 'OL']])
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
    expect(has('bx-alarm')).toBe(true)
    expect(has('bx-pile')).toBe(false)
  })

  it('one morning box and the "!": `bx-alarm`', () => {
    fileAbsence(P, '*LL', D)
    fileAbsence(P, '*OL', D)          // two leaves on one morning: one box and the "!" (planted raw — the door would refuse it)
    render(<Matrix />)
    const b = boxes()
    expect(b).toHaveLength(1)
    expect(b[0]![0]).toMatch(/ top$/)
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
    expect(has('bx-alarm')).toBe(true)
  })

  it('a whole day and a morning HO with the "!": the HO over the morning, the cell `bx-alarm`', () => {
    fileAbsence(P, 'LL', D)
    ingestDutyCredit(P, D, 'HO', 'Duty', [[480, 660]])
    render(<Matrix />)
    expect(boxes()).toEqual([['c k-ll s-a whole bx-floor bx-lo', 'LL'], ['c k-oil s-a top bx-roof bx-am bx-star', 'HO*']])
    expect(has('bx-alarm')).toBe(true)
  })

  it('"+2" is a stack, never an alarm', () => {
    fileAbsence(P, 'CSE', D)
    fileAbsence(P, 'OD', D)
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    expect(has('bx-pile')).toBe(true)
    expect(has('bx-alarm')).toBe(false)
  })

  describe('after a posting-out (D1728: no PO tag beside an entry — the stripes on its box say it)', () => {
    beforeEach(() => { setRole('admin'); expect(setPostOut(P, '2026-02-10')).toBe(true) })

    it('an afternoon half: its box, striped, and no PO tag', () => {
      fileAbsence(P, 'LL*', D)
      render(<Matrix />)
      expect(boxes()).toEqual([['c k-ll s-a bot', 'LL']])
      expect(screen.queryByTestId(`potag-${P}-${D}`)).toBeNull()
      expect(has('bx-gone')).toBe(true)
    })

    it('a whole day: the same', () => {
      fileAbsence(P, 'LL', D)
      render(<Matrix />)
      expect(screen.queryByTestId(`potag-${P}-${D}`)).toBeNull()
      expect(has('bx-gone')).toBe(true)
    })

    it('a morning and an afternoon: both boxes, striped', () => {
      fileAbsence(P, '*OL', D)
      fileAbsence(P, 'LL*', D)
      render(<Matrix />)
      expect(boxes()).toEqual([['c k-ol s-a top', 'OL'], ['c k-ll s-a bot', 'LL']])
      expect(has('bx-gone')).toBe(true)
    })

    it('a morning box with the "!": the alarm and the stripes, no PO tag', () => {
      fileAbsence(P, '*LL', D)
      fileAbsence(P, '*OL', D)
      render(<Matrix />)
      expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
      expect(screen.queryByTestId(`potag-${P}-${D}`)).toBeNull()
      expect(has('bx-alarm')).toBe(true)
      expect(has('bx-gone')).toBe(true)
    })

    it('#9a — a posted-out day with nothing on it: the bare "PO" sits in the frame, centred (`c whole`, unboxed)', () => {
      render(<Matrix />)
      const d = '2026-02-12'
      expect(cell(d).classList.contains('gone')).toBe(true)
      expect(cell(d).classList.contains('hasc')).toBe(true)
      expect(cell(d).classList.contains('bx-gone')).toBe(false)
      expect([...cell(d).querySelectorAll('.c')].map(b => [b.className, b.textContent])).toEqual([['c whole', 'PO']])
    })

    it('his last day in is `bx-last`, its tile the yellow line (D1728)', () => {
      render(<Matrix />)
      expect(cell('2026-02-09').classList.contains('bx-last')).toBe(true)
      expect(cell('2026-02-09').querySelector('.polast')).toBeTruthy()
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
