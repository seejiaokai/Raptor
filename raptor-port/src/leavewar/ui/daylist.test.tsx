// The multi-record box and its tap list ([ARCH-STACK] step 4 — owner comp
// docs/img/step4-multi-record-box.png, design §25 OA10-001, answer C).
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { advanceStage, ingestDutyCredit, initStore, lwEditLists, rawState, setCell, setManualCredit, setPostOut, setRole, setViewer } from '../state/store'
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


/* ====================================================================== */
/*  An award is editable ON THE DAY, even on a day he also worked         */
/* ====================================================================== */

describe('the OIL detail blocks on a day holding both (N16, 21 Sep 26)', () => {
  const SAT = '2026-01-03'
  const WORKED: Array<[number, number]> = [[480, 1080]]
  const both = () => {
    setRole('admin')
    setManualCredit(P, SAT, 'FO', { note: 'Exercise recovery', givenBy: 'OC Ops', days: 3 })
    ingestDutyCredit(P, SAT, 'FO', 'Duty', WORKED)
    const recs = rawState().wars.find(w => w.period.start <= SAT && SAT <= w.period.end)!
      .recs[P]![SAT]!.filter(r => r.kind === 'credit') as any[]
    return { award: recs.find(r => r.oil === 'manual')!, earned: recs.find(r => r.oil === 'auto')! }
  }
  const open = () => { render(<Matrix />); fireEvent.click(screen.getByTestId(`cell-${P}-${SAT}`)) }

  it('names the two kinds APART — an award is not "OIL earned"', () => {
    /* Every credit line read "OIL earned", which of an award is simply untrue
       (N13). On a day carrying both, the sheet said the same four words twice
       and the reader had no way to tell which was which. */
    const { award, earned } = both()
    open()
    expect(screen.getByTestId(`dl-c-${award.id}`).textContent).toContain('OIL award')
    expect(screen.getByTestId(`dl-c-${earned.id}`).textContent).toContain('OIL earned')
  })

  it('reads each one back on its own — reason, giver and worth', () => {
    const { award, earned } = both()
    open()
    expect(screen.getByTestId(`oil-detail-why-${award.id}`).textContent).toBe('Exercise recovery')
    expect(screen.getByTestId(`oil-detail-given-${award.id}`).textContent).toBe('OC Ops')
    expect(screen.getByTestId(`oil-detail-days-${award.id}`).textContent).toContain('3 days')
    // the schedule's own day names the SCHEDULE, never the admin
    expect(screen.getByTestId(`oil-detail-given-${earned.id}`).textContent).toBe('Weekend/PH')
  })

  it('lets an admin CHANGE the award from the day itself (owner, [LW-OIL-DETAIL])', () => {
    /* His ruling is that an award's reason, giver and days are editable in
       every sheet it opens in. On a day holding both, this sheet is the only
       thing a tap opens — the single-record window never shows — so without
       an editor here the ruling quietly stopped being true on exactly the
       days N16 creates. */
    const { award, earned } = both()
    open()
    fireEvent.click(screen.getByTestId(`dl-oil-edit-${award.id}`))
    fireEvent.change(screen.getByTestId(`oil-edit-why-${award.id}`), { target: { value: 'Recovery' } })
    fireEvent.change(screen.getByTestId(`oil-edit-given-${award.id}`), { target: { value: 'CO' } })
    fireEvent.change(screen.getByTestId(`oil-edit-days-${award.id}`), { target: { value: '2' } })
    fireEvent.click(screen.getByTestId(`oil-edit-save-${award.id}`))

    const after = rawState().wars.find(w => w.period.start <= SAT && SAT <= w.period.end)!
      .recs[P]![SAT]!.find((r: any) => r.id === award.id) as any
    expect(after).toMatchObject({ note: 'Recovery', givenBy: 'CO', days: 2 })
    // and the schedule's own credit is untouched by it
    const still = rawState().wars.find(w => w.period.start <= SAT && SAT <= w.period.end)!
      .recs[P]![SAT]!.find((r: any) => r.id === earned.id) as any
    expect(still).toMatchObject({ code: 'FO', oil: 'auto', note: 'Duty' })
    expect(still.days).toBeUndefined()
  })

  it('never offers to edit the credit the schedule owns', () => {
    const { earned } = both()
    open()
    expect(screen.queryByTestId(`dl-oil-edit-${earned.id}`)).toBeNull()
    expect(screen.queryByTestId(`dl-clear-${earned.id}`)).toBeNull()
  })

  it('a member is not offered the editor at all', () => {
    both()
    setRole('member'); setViewer(P)
    open()
    expect(screen.queryByText('Edit…')).toBeNull()
  })
})
