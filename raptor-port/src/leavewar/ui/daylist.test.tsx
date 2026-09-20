// The multi-record box and its tap list ([ARCH-STACK] step 4 — owner comp
// docs/img/step4-multi-record-box.png, design §25 OA10-001, answer C).
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { advanceStage, initStore, lwEditLists, rawState, setCell, setPostOut, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { Matrix } from './Matrix'

beforeEach(() => { initStore(memoryBackend()) })

const P = 'dusk'
const D = '2026-02-11'
const cell = () => screen.getByTestId(`cell-${P}-${D}`)

describe('the corner mark', () => {
  it('morning LL + afternoon OIL: the box reads <LL, with a grey +1', () => {
    fileAbsence(P, '*LL', D, D, { lw: true })
    fileAbsence(P, 'OIL*', D, D, { lw: true })
    render(<Matrix />)
    // `<LL` on screen, `*LL` in the record — one fold, `displayCell`
    expect(cell().textContent).toContain('<LL')
    const mk = screen.getByTestId(`mark-${P}-${D}`)
    expect(mk.textContent).toBe('+1')
    expect(mk.className).toContain('more')
  })

  it('a day with one record has no mark', () => {
    fileAbsence(P, 'LL', D)
    render(<Matrix />)
    expect(screen.queryByTestId(`mark-${P}-${D}`)).toBeNull()
  })

  it('two leaves on the same time read amber !', () => {
    fileAbsence(P, 'LL', D)
    fileAbsence(P, 'OL', D)          // planted raw — the door would refuse it
    render(<Matrix />)
    const mk = screen.getByTestId(`mark-${P}-${D}`)
    expect(mk.textContent).toBe('!')
    expect(mk.className).toContain('warn')
  })
})

describe('the tap list', () => {
  it('lists every record on the day, each on its own line', () => {
    fileAbsence(P, '*LL', D, D, { lw: true })
    fileAbsence(P, 'OIL*', D, D, { lw: true })
    render(<Matrix />)
    fireEvent.click(cell())
    const list = screen.getByTestId('daylist')
    const lines = within(list).getAllByRole('listitem')
    expect(lines).toHaveLength(2)
    expect(lines[0]!.textContent).toContain('<LL — local leave, morning · approved')
    expect(lines[1]!.textContent).toContain('OIL> ')
  })

  it('an admin can send one of two approved leaves back to a bid from its own line', () => {
    const am = fileAbsence(P, '*LL', D, D, { lw: true })
    fileAbsence(P, 'OIL*', D, D, { lw: true })
    setRole('admin')
    act(() => { advanceStage() })       // closed — deciding
    render(<Matrix />)
    fireEvent.click(cell())
    fireEvent.click(screen.getByTestId(`dl-unapprove-${am.iid}`))
    expect(INPUTS.some((r: any) => r.iid === am.iid)).toBe(false)
    const list = rawState().wars[0]!.recs[P]![D]!
    expect(list.find(r => r.kind === 'request')).toMatchObject({ code: '*LL', state: 'pending' })
  })

  it('an APPROVED leave on a PUBLISHED war offers the NOTE and nothing else', () => {
    /* Owner, 21 Sep 26: "if the input is approved and published … the member
       and admin can input the remarks there. In order to edit it again, admin
       has to go back to open for bidding or bidding closed." The single-record
       window always obeyed that; THIS list did not, because deciding means
       closed-OR-published — so a day holding two records let an admin send a
       published, approved leave back to a bid in one click (Astra, 21 Sep 26). */
    const am = fileAbsence(P, '*LL', D, D, { lw: true })
    fileAbsence(P, 'OIL*', D, D, { lw: true })
    setRole('admin')
    act(() => { advanceStage(); advanceStage() })     // closed → published
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId(`dl-unapprove-${am.iid}`)).toBeNull()
    expect(screen.queryByTestId(`dl-refuse-${am.iid}`)).toBeNull()
    expect(screen.queryByTestId(`dl-remove-${am.iid}`)).toBeNull()
    expect(screen.queryByTestId(`dl-move-${am.iid}`)).toBeNull()
    expect(screen.getByTestId(`dl-note-${am.iid}`)).toBeTruthy()
  })

  it('leave filed on the Inputs page says so and offers no war action', () => {
    const a = fileAbsence(P, '*LL', D)
    fileAbsence(P, 'CSE', D)
    setRole('admin')
    act(() => { advanceStage() })
    render(<Matrix />)
    fireEvent.click(cell())
    expect(screen.queryByTestId(`dl-unapprove-${a.iid}`)).toBeNull()
    expect(screen.getByTestId('daylist').textContent).toContain('Change it on the Inputs page.')
  })

  it('a replaced-bid notice: amber !, its line, and "OK, seen" clears it', () => {
    setRole('admin')
    expect(setCell(P, D, 'LL')).toBe(true)
    // what the inputs door leaves when someone else's filing replaced the bid
    const req = rawState().wars[0]!.recs[P]![D]![0]!
    act(() => {
      lwEditLists([{ personId: P, date: D, drop: [req.id], add: [{ id: 'n-test', kind: 'notice', code: 'LL', was: 'pending', byType: 'ATT C', byWho: 'an admin', seq: 7, at: '2026-02-01' } as any] }])
    })
    render(<Matrix />)
    expect(screen.getByTestId(`mark-${P}-${D}`).textContent).toBe('!')
    fireEvent.click(cell())
    expect(screen.getByTestId('daylist').textContent).toContain('bid was replaced by ATT C (an admin)')
    const seen = screen.getAllByText('OK, seen')[0]!
    fireEvent.click(seen)
    expect((rawState().wars[0]!.recs[P]?.[D] ?? []).some(r => r.kind === 'notice')).toBe(false)
  })
})

describe('leave outside the time in the squadron (owner answer C)', () => {
  it('leave after a posting-out shows the leave code with the PO tag', () => {
    setRole('admin')
    expect(setPostOut(P, '2026-02-10')).toBe(true)
    fileAbsence(P, 'LL', D)
    setViewer(P)
    render(<Matrix />)
    expect(cell().textContent).toContain('LL')
    expect(screen.getByTestId(`potag-${P}-${D}`)).toBeTruthy()
    expect(cell().className).toContain('gone')        // still off the manning
  })
})

