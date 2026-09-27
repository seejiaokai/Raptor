// [LW-MOVE-STANDARD] — ONE FORMAT AND LOOK FOR THE LEAVE WAR'S SHEETS, AND A MOVE ON EVERY RECORD THAT CAN MOVE.
//
// His rulings (27 Sep 26, .claude/rules/decisions/leave-war.md): D264 one format and look for the one-day sheet and the
// drag-selection sheet; D265 a record that can move always offers Move (a bid beside an OIL award moves alone); D266 the
// day's list moves a record by the move mode, no date box; and his answers to the mock-up
// (docs/mock/lw-move-standard.html) — D331 order A: Decide → Selected (Move · Delete) → How much → Which leave; D332
// "Delete" the one word (the one-day Clear and the list's Clear), dashed grey; D333 a member's Move on his own bid while
// bidding is open; D334 the Move button a grey chip with a teal arrow ("⇄ Move") on every sheet; D335 the one-day sheet
// keeps How many, a picked range widening what it acts on.
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { advanceStage, clearCells, decideRequestById, getState, initStore, lwHistInit, rawState, setCell, setCellRange, setManualCredit, setRole, setViewer } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { canEditCell } from '../engine'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'
import type { Selection } from './select'

beforeEach(() => {
  initStore(memoryBackend())
  lwHistInit()
  setRole('admin')
  setLwOnScreen(true)
})

const P = 'dusk'
const recsAt = (p: string, d: string) => rawState().wars[0]!.recs[p]?.[d] ?? []
const bidsAt = (p: string, d: string) => recsAt(p, d).filter((r: any) => r.kind === 'request') as any[]
const awardAt = (p: string, d: string) => recsAt(p, d).some((r: any) => r.kind === 'credit' && r.oil === 'manual')
const rowOf = (testid: string) => screen.getByTestId(testid).closest('.bidsheet-row') as HTMLElement
/** Is `a`'s row above `b`'s row in the sheet? */
const above = (a: string, b: string) => !!(rowOf(a).compareDocumentPosition(rowOf(b)) & Node.DOCUMENT_POSITION_FOLLOWING)
/** A deliberate click on a day, past the double-click guard that opens every move. */
const land = async (testid: string) => {
  await act(async () => { await new Promise(r => setTimeout(r, 420)) })
  fireEvent.click(screen.getByTestId(testid))
}
/** The ONE Move look (D334): the grey chip — class `move` — with a teal arrow before the word. */
const isMoveChip = (el: HTMLElement) => {
  expect(el.className).toContain('dchip')
  expect(el.className).toContain('move')
  expect(el.querySelector('.mvarr')?.textContent).toBe('⇄')
  expect(el.textContent).toBe('⇄Move')
}
/** The ONE Delete look (D332): the word Delete, dashed grey — class `del`, never the red `refuse`. */
const isDeleteChip = (el: HTMLElement) => {
  expect(el.className).toContain('del')
  expect(el.className).not.toContain('refuse')
  expect(el.textContent).toMatch(/^Delete/)
}

describe('the one-day sheet, in order A (D331, D335)', () => {
  beforeEach(() => { setCell(P, '2026-02-11', 'LL') })

  it('How many → Decide → Selected (Move · Delete) → How much → Which leave → +OIL / PO / PI', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    expect(above('span-one', 'decide-ack')).toBe(true)
    expect(above('decide-ack', 'decide-shift')).toBe(true)
    expect(above('decide-shift', 'portion-full')).toBe(true)
    expect(above('portion-full', `bid-LL`)).toBe(true)
    expect(above('bid-LL', 'bid-postout')).toBe(true)
    // Move and Delete share the Selected row; Move is no longer on the decision row, Delete no longer a leave chip
    expect(rowOf('decide-shift')).toBe(rowOf('bid-clear'))
    expect(rowOf('decide-shift')).not.toBe(rowOf('decide-ack'))
    expect(rowOf('bid-clear')).not.toBe(rowOf('bid-LL'))
    expect(within(rowOf('decide-shift')).getByText('Selected')).toBeTruthy()
    expect(within(rowOf('decide-ack')).getByText('Decide')).toBeTruthy()
  })

  it('Move is the one Move look, Delete the one Delete look', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    isMoveChip(screen.getByTestId('decide-shift'))
    isDeleteChip(screen.getByTestId('bid-clear'))
  })

  it('an EMPTY day has no Decide and no Selected row — it opens on the leave, as before', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-12`))
    expect(screen.queryByTestId('decide-ack')).toBeNull()
    expect(screen.queryByTestId('decide-shift')).toBeNull()
    expect(screen.queryByTestId('bid-clear')).toBeNull()
    expect(screen.getByTestId('bid-LL')).toBeTruthy()
  })

  it('a day holding only an OIL award offers Delete (it names the award first) and no Move', () => {
    setManualCredit(P, '2026-02-13', 'FO', { note: 'Exercise recovery' })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-13`))
    expect(screen.queryByTestId('decide-shift')).toBeNull()
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(screen.getByTestId('span-note').textContent).toContain('Delete also takes')
    expect(screen.getByTestId('span-note').textContent).toContain('tap Delete again')
    expect(screen.getByTestId('bid-clear').textContent).toBe('Delete — sure?')
    expect(awardAt(P, '2026-02-13')).toBe(true)
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(awardAt(P, '2026-02-13')).toBe(false)
  })
})

describe('Pick a range widens what the one-day sheet acts on (D335)', () => {
  beforeEach(() => { setCellRange(P, '2026-02-11', '2026-02-13', 'LL') })
  const pickRange = () => {
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    fireEvent.click(screen.getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-13'))
  }

  it('Move picks up every day in the range', async () => {
    render(<Matrix />)
    pickRange()
    fireEvent.click(screen.getByTestId('decide-shift'))
    expect(screen.getByTestId('move-banner').textContent).toContain('3 entries')
    await land(`cell-${P}-2026-02-18`)
    expect(['2026-02-18', '2026-02-19', '2026-02-20'].map(d => bidsAt(P, d).length)).toEqual([1, 1, 1])
    expect(bidsAt(P, '2026-02-11')).toHaveLength(0)
  })

  it('Decide answers every day in the range', () => {
    render(<Matrix />)
    pickRange()
    fireEvent.click(screen.getByTestId('decide-ack'))
    expect(['2026-02-11', '2026-02-12', '2026-02-13'].map(d => bidsAt(P, d)[0]?.state)).toEqual(['acknowledged', 'acknowledged', 'acknowledged'])
  })

  it('Delete takes every day in the range', () => {
    render(<Matrix />)
    pickRange()
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(['2026-02-11', '2026-02-12', '2026-02-13'].map(d => bidsAt(P, d).length)).toEqual([0, 0, 0])
  })
})

describe('a morning and an afternoon bid — the list picks ONE (D266; Fable’s S6)', () => {
  it('Move on the morning carries the morning only: "1 entry · 1 bid stays"', async () => {
    setCell(P, '2026-02-11', '*LL')
    setCell(P, '2026-02-11', 'LL*')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    const am = bidsAt(P, '2026-02-11').find((r: any) => r.code === '*LL')!
    expect(screen.getAllByTestId(/^dl-move-/)).toHaveLength(2)
    fireEvent.click(screen.getByTestId(`dl-move-${am.id}`))
    const said = screen.getByTestId('move-banner').textContent!
    expect(said).toContain('1 entry')
    expect(said).toContain('1 bid stays')
    await land(`cell-${P}-2026-02-12`)
    expect(bidsAt(P, '2026-02-12').map((r: any) => r.code)).toEqual(['*LL'])
    expect(bidsAt(P, '2026-02-11').map((r: any) => r.code)).toEqual(['LL*'])
  })
})

describe('a range that sweeps up an award day and an empty day (Fable’s S14)', () => {
  it('moves only the bids — "2 entries", the award named as staying — and keeps the gap between them', async () => {
    setManualCredit(P, '2026-02-10', 'FO', {})
    setCell(P, '2026-02-11', 'LL')
    setCell(P, '2026-02-13', 'LL')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-10`))
    fireEvent.click(screen.getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-13'))
    fireEvent.click(screen.getByTestId('decide-shift'))
    const said = screen.getByTestId('move-banner').textContent!
    expect(said).toContain('2 entries')
    expect(said).toContain('1 OIL award stays')
    await land(`cell-${P}-2026-02-17`)                 // the earliest bid (11 Feb) lands on the day tapped
    expect(bidsAt(P, '2026-02-17')).toHaveLength(1)
    expect(bidsAt(P, '2026-02-19')).toHaveLength(1)    // 13 Feb keeps its two-day gap
    expect(awardAt(P, '2026-02-10')).toBe(true)
  })
})

describe('a bid moved once bidding has closed says where it came from on its list line (Fable’s S4)', () => {
  it('the award on top hides the grid’s dotted mark, so the line carries it', async () => {
    setCell(P, '2026-02-11', 'LL')
    setManualCredit(P, '2026-02-16', 'FO', {})
    advanceStage()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    fireEvent.click(screen.getByTestId('decide-shift'))
    await land(`cell-${P}-2026-02-16`)
    expect(bidsAt(P, '2026-02-16')).toHaveLength(1)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-16`))
    const bid = bidsAt(P, '2026-02-16')[0]!
    expect(screen.getByTestId(`dl-r-${bid.id}`).textContent).toContain('moved from Wed 11 Feb')
  })
})

describe('a bid beside an OIL award — the day’s list (D265, D266)', () => {
  beforeEach(() => {
    setManualCredit(P, '2026-02-11', 'FO', { note: 'Exercise recovery' })
    setCell(P, '2026-02-11', 'LL')
  })

  it('the bid’s line offers the one Move and Delete, in the sheets’ order; the award’s line no Move', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    expect(screen.getByTestId('daylist-sheet')).toBeTruthy()
    const bid = bidsAt(P, '2026-02-11')[0]!
    const line = screen.getByTestId(`dl-r-${bid.id}`)
    const names = within(line).getAllByRole('button').map(b => b.textContent)
    expect(names).toEqual(['Ack', 'Approve', 'Refuse', '⇄Move', 'Delete'])
    isMoveChip(within(line).getByTestId(`dl-move-${bid.id}`))
    isDeleteChip(within(line).getByTestId(`dl-clear-${bid.id}`))
    const award = recsAt(P, '2026-02-11').find((r: any) => r.kind === 'credit')!
    const aline = screen.getByTestId(`dl-c-${award.id}`)
    expect(within(aline).queryByTestId(`dl-move-${award.id}`)).toBeNull()
    isDeleteChip(within(aline).getByTestId(`dl-clear-${award.id}`))
  })

  it('Move closes the list and picks up THAT record — no date box; the banner says the award stays', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    const bid = bidsAt(P, '2026-02-11')[0]!
    expect(document.querySelector('[data-testid^="dl-moveto-"]')).toBeNull()
    fireEvent.click(screen.getByTestId(`dl-move-${bid.id}`))
    expect(screen.queryByTestId('daylist-sheet')).toBeNull()
    const said = screen.getByTestId('move-banner').textContent!
    expect(said).toContain('1 entry')
    expect(said).toContain('OIL award stays')
    await land(`cell-${P}-2026-02-16`)
    expect(bidsAt(P, '2026-02-16')).toHaveLength(1)
    expect(bidsAt(P, '2026-02-11')).toHaveLength(0)
    expect(awardAt(P, '2026-02-11')).toBe(true)
  })

  it('a dragged block over that day offers Move, and moves the bid alone', () => {
    const sel: Selection = { people: [P], from: '2026-02-11', to: '2026-02-11', cells: [{ personId: P, date: '2026-02-11' }] }
    let moved: Selection | null = null
    render(<SelectSheet sel={sel} people={id => id} role="admin" canDecide={true} onDone={() => {}} onMove={s => { moved = s }} onClose={() => {}} />)
    isMoveChip(screen.getByTestId('sel-move'))
    fireEvent.click(screen.getByTestId('sel-move'))
    expect(moved).not.toBeNull()
  })
})

describe('the drag-selection sheet, in order A (D331)', () => {
  const sel: Selection = {
    people: [P], from: '2026-02-11', to: '2026-02-12',
    cells: [{ personId: P, date: '2026-02-11' }, { personId: P, date: '2026-02-12' }],
  }
  beforeEach(() => { setCell(P, '2026-02-11', 'LL') })

  it('Decide → Selected (Move · Delete) → How much → Which leave → PO', () => {
    render(<SelectSheet sel={sel} people={id => id} role="admin" canDecide={true} onDone={() => {}} onMove={() => {}} onPostOut={() => {}} onClose={() => {}} />)
    expect(above('sel-approve', 'sel-move')).toBe(true)
    expect(rowOf('sel-move')).toBe(rowOf('sel-delete'))
    expect(above('sel-move', 'sel-portion-full')).toBe(true)
    expect(above('sel-portion-full', 'sel-LL')).toBe(true)
    expect(above('sel-LL', 'sel-postout')).toBe(true)
    expect(within(rowOf('sel-move')).getByText('Selected')).toBeTruthy()
    isMoveChip(screen.getByTestId('sel-move'))
    isDeleteChip(screen.getByTestId('sel-delete'))
    expect(screen.getByTestId('sel-postout').textContent).toBe('PO')
  })
})

describe('the block offers Move and Delete only where they would do something (D332; the break test B18 found no test)', () => {
  it('a block holding only leave filed on the Inputs page offers neither — it is changed there', () => {
    fileAbsence(P, 'LL', '2026-02-11')
    const sel: Selection = { people: [P], from: '2026-02-11', to: '2026-02-11', cells: [{ personId: P, date: '2026-02-11' }] }
    render(<SelectSheet sel={sel} people={id => id} role="admin" canDecide={true} onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    expect(screen.queryByTestId('sel-move')).toBeNull()
    expect(screen.queryByTestId('sel-delete')).toBeNull()
  })
})

describe('a member moves his own bid while bidding is open (D333)', () => {
  it('his one-day sheet offers the one Move, and it picks the bid up', async () => {
    const date = getState().period.bidFrom!
    const next = new Date(Date.parse(`${date}T00:00:00Z`) + 2 * 86400000).toISOString().slice(0, 10)
    setRole('member'); setViewer(P)
    expect(canEditCell(getState().period, 'member', date)).toBe(true)
    expect(setCell(P, date, 'LL')).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${date}`))
    expect(screen.queryByTestId('decide-ack')).toBeNull()        // a member never decides
    isMoveChip(screen.getByTestId('decide-shift'))
    isDeleteChip(screen.getByTestId('bid-clear'))
    fireEvent.click(screen.getByTestId('decide-shift'))
    expect(screen.getByTestId('move-banner').textContent).toContain('1 entry')
    await land(`cell-${P}-${next}`)
    expect(bidsAt(P, next)).toHaveLength(1)
  })

  it('once bidding has closed his sheet does not open, so there is no Move to press', () => {
    const date = getState().period.bidFrom!
    setCell(P, date, 'LL')
    advanceStage()
    setRole('member'); setViewer(P)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${date}`))
    expect(screen.queryByTestId('decide-shift')).toBeNull()
  })
})

/* ---- THE TWO FINAL READS (Fable 5.1 and Astra, blind — docs/superpowers/briefs/2026-09-27-lw-move-standard-final-*.md) ---- */
describe('FR4 — Decide over a picked range, from a day with no bid (Fable 4, Astra 2 — both, blind)', () => {
  it('the range holds bids around an empty tapped day: Decide is drawn and answers every one', () => {
    setCell(P, '2026-02-11', 'LL')
    setCell(P, '2026-02-13', 'LL')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-12`))
    expect(screen.queryByTestId('decide-ack')).toBeNull()               // the one day: nothing to decide
    fireEvent.click(screen.getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-11'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-13'))
    fireEvent.click(screen.getByTestId('decide-ack'))
    expect([bidsAt(P, '2026-02-11')[0]?.state, bidsAt(P, '2026-02-13')[0]?.state]).toEqual(['acknowledged', 'acknowledged'])
  })
  it('a range holding nothing to decide (an award) draws no Decide', () => {
    setManualCredit(P, '2026-02-21', 'FO', {})
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-20`))
    fireEvent.click(screen.getByTestId('span-range'))
    fireEvent.click(screen.getByTestId('span-day-2026-02-21'))
    expect(screen.queryByTestId('decide-ack')).toBeNull()
  })
})

describe('FR5 — the banner names a refused bid that stays (Astra 3)', () => {
  it('a live morning beside a refused one: "1 entry · 1 refused bid stays"', () => {
    setCell(P, '2026-02-11', '*LL')
    const refused = bidsAt(P, '2026-02-11')[0]!.id
    expect(decideRequestById(P, '2026-02-11', refused, 'refused')).toBe(true)
    setCell(P, '2026-02-11', '*OL')
    const live = bidsAt(P, '2026-02-11').find((r: any) => r.id !== refused)!
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    fireEvent.click(screen.getByTestId(`dl-move-${live.id}`))
    const said = screen.getByTestId('move-banner').textContent!
    expect(said).toContain('1 entry')
    expect(said).toContain('1 refused bid stays')
  })
})

describe('FR6 — what was picked up is gone (Astra 4)', () => {
  it('the banner says so, and the next tap lands nothing and ends the move', async () => {
    setCell(P, '2026-02-11', 'LL')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-2026-02-11`))
    fireEvent.click(screen.getByTestId('decide-shift'))
    act(() => { clearCells([{ personId: P, date: '2026-02-11' }]) })
    expect(screen.getByTestId('move-banner').textContent).toContain('no longer there')
    await land(`cell-${P}-2026-02-16`)
    expect(bidsAt(P, '2026-02-16')).toHaveLength(0)
    expect(screen.queryByTestId('move-banner')).toBeNull()
  })
})
