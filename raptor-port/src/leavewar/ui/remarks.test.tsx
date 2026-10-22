// The remarks editor (owner, 27 Aug 26 — the published stage's; D418 narrowed by D1177, 21 Oct 26: "a member's
// approved leave offers only its remarks, any time; the leave itself he changes on the Inputs page, D1166"). A member
// taps THEIR OWN approved leave and edits its note, whether or not the day is open for bidding; everyone else's leave
// stays the read-only Raptor sheet. An ADMIN's tap no longer opens a remarks-only editor: nothing is frozen, so his tap
// opens what changes the leave (the scenario designer's S6 — the decide window for leave approved on the war; the
// read-only sheet pointing to the Inputs page for leave filed there). The note lives on the Raptor INPUT the cell derives
// from, so these render Matrix over a real filed leave (pushed into INPUTS + synced in) and drive the sheet.
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { closeDates, getState, initStore, setBidState, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { syncAbsences, leaveInputAt } from '../sync'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)

// DUSK is a war person the deciding tests already tap on 2026-02-11.
const PERSON = 'dusk'
const CELL = 'cell-dusk-2026-02-11'

function seedLeave(remarks = 'Bali till 15 Feb') {
  INPUTS.length = 0
  INPUTS.push({
    iid: 'rmk-test', person: PERSON, type: 'LL',
    date: 'Feb 11', endDate: 'Feb 13', yr: 2026, allday: true, remarks,
  })
  syncAbsences()               // the war reads the filed leave
}

/** Close every date (was "close bidding then publish" — the stages went, D1177). Closing is admin-only, so this runs
 *  as an admin; the caller sets the role it actually wants to test afterwards. */
function closeAll() {
  setRole('admin')
  closeDates('2026-01-01', '2026-12-31')
}

beforeEach(() => { initStore(memoryBackend()); seedLeave() })
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('leaveInputAt — the Raptor row a war cell derives from', () => {
  it('finds the covering leave for a date inside the span', () => {
    expect(leaveInputAt(PERSON, '2026-02-12')?.iid).toBe('rmk-test')
  })
  it('returns null off the span, for another person, and outside a leave', () => {
    expect(leaveInputAt(PERSON, '2026-03-01')).toBeNull()
    expect(leaveInputAt('asics', '2026-02-12')).toBeNull()
  })
})

describe('the remarks editor', () => {
  it('opens for the viewer editing their OWN leave on a closed day, and the note saves', () => {
    closeAll()
    setRole('member'); setViewer(PERSON)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.getByTestId('remarks-sheet')).toBeTruthy()
    const field = screen.getByTestId('remarks-field') as HTMLTextAreaElement
    /* the box holds the typed words only — the date is printed from the leave's dates (owner D948) */
    expect(field.value).toBe('Bali')
    fireEvent.change(field, { target: { value: 'Phuket instead' } })
    fireEvent.click(screen.getByTestId('remarks-save'))
    expect(INPUTS.find((r: any) => r.iid === 'rmk-test').remarks).toBe('Phuket instead')
  })

  /* WAS "does not open before the war is published" (a tap was then the read-only Raptor sheet). REVERSED by D1177's
     reading, D418 narrowed: "a member adds remarks to his approved leave at any time" — an OPEN day included. */
  it('opens for his own leave on a day still OPEN for bidding too', () => {
    setRole('member'); setViewer(PERSON)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.getByTestId('remarks-sheet')).toBeTruthy()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.queryByTestId('closed-note')).toBeNull()
  })

  /* …and for leave approved on the WAR (not filed on the Inputs page): his tap on his own approved bid opens its
     remarks, open or closed. ASICS's seeded pending half day on 23 Jan, approved by the admin. */
  it('opens for his own leave approved on the war, open day or closed', () => {
    setRole('admin')
    setBidState('asics', '2026-01-23', 'approved')
    expect(getState().states.asics['2026-01-23']?.state).toBe('approved')
    setRole('member'); setViewer('asics')
    const r = render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-asics-2026-01-23'))
    expect(screen.getByTestId('remarks-sheet')).toBeTruthy()
    r.unmount()
    closeAll()
    setRole('member'); setViewer('asics')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-asics-2026-01-23'))
    expect(screen.getByTestId('remarks-sheet')).toBeTruthy()
  })

  /* WAS "opens for an admin on anyone else's leave" (at published). CHANGED by D1177's reading and the scenario
     designer's S6: an admin's tap never opens a remarks-only editor — for leave filed on the Inputs page it is the
     read-only sheet that says where to change it (the decide window for leave approved on the war: deciding.test.tsx). */
  it('is NOT a remarks-only editor for an admin — leave filed on the Inputs page reads as such', () => {
    closeAll()
    setRole('admin'); setViewer('someone-else')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.queryByTestId('remarks-sheet')).toBeNull()
    expect(screen.getByTestId('raptor-sheet')).toBeTruthy()
  })

  it('is the read-only Raptor sheet, NOT the editor, for a member on someone else’s leave', () => {
    closeAll()
    setRole('member'); setViewer('asics')       // viewing as asics, cell is dusk's
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.queryByTestId('remarks-sheet')).toBeNull()
    expect(screen.getByTestId('raptor-sheet')).toBeTruthy()
  })
})
