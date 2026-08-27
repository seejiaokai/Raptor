// The published-stage remarks editor (owner, 27 Aug 26). At published a member
// taps THEIR OWN approved leave and edits its note; an admin does it for
// anyone; everyone else's leave stays the read-only Raptor sheet. The note
// lives on the Raptor INPUT the cell derives from, so these render Matrix over
// a real filed leave (pushed into INPUTS + synced in) and drive the sheet.
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { advanceStage, initStore, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { runInbound, leaveInputAt } from '../sync'
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
  runInbound()                 // lands the leave as a Raptor-owned war cell
}

/** Close bidding then publish — advancing is admin-only, so this runs as an
 *  admin; the caller sets the role it actually wants to test afterwards. */
function publish() {
  setRole('admin')
  advanceStage()               // open -> closed
  advanceStage()               // closed -> published
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

describe('the published remarks editor', () => {
  it('opens for the viewer editing their OWN leave, and the note saves', () => {
    publish()
    setRole('member'); setViewer(PERSON)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.getByTestId('remarks-sheet')).toBeTruthy()
    const field = screen.getByTestId('remarks-field') as HTMLTextAreaElement
    expect(field.value).toBe('Bali till 15 Feb')
    fireEvent.change(field, { target: { value: 'Phuket instead' } })
    fireEvent.click(screen.getByTestId('remarks-save'))
    expect(INPUTS.find((r: any) => r.iid === 'rmk-test').remarks).toBe('Phuket instead')
  })

  it('opens for an admin on anyone else’s leave', () => {
    publish()
    setRole('admin'); setViewer('someone-else')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.getByTestId('remarks-sheet')).toBeTruthy()
  })

  it('is the read-only Raptor sheet, NOT the editor, for a member on someone else’s leave', () => {
    publish()
    setRole('member'); setViewer('asics')       // viewing as asics, cell is dusk's
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.queryByTestId('remarks-sheet')).toBeNull()
    expect(screen.getByTestId('raptor-sheet')).toBeTruthy()
  })

  it('does not open before the war is published', () => {
    // still open for bidding — a tap is the ordinary Raptor-owned read-only sheet
    setRole('member'); setViewer(PERSON)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    expect(screen.queryByTestId('remarks-sheet')).toBeNull()
  })
})
