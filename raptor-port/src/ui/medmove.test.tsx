// @vitest-environment jsdom
/* A MEDICAL MOVED BY A DRAG OR A REASSIGN IS ASKED ABOUT FIRST (the absence-record re-test, AB4, 26 Sep 26 — found
   independently by both plan reviews, Fable F4 and Astra A).

   The owner's rule (27 Aug 26): a different-type medical overlap is put to the filer — "choose who holds the shared
   days", no default — and an upchit's effects are put to him on the summary sheet, BEFORE anything is written. The
   edit window and the Inputs table ask. The Inputs calendar's chip drag and the schedule's reassign (the Unavailable
   row's person) went straight to commitInputEdit, whose trim plan resolved the clash itself with its safety default
   (every tail kept): the older medical was cut and split with no question and no sheet.

   Now both doors hand the move to the same two sheets (ui/MedMoveConfirm.tsx) and write nothing until they are
   answered; a drag or reassign that raises no question still lands at once. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { histInit, initStore, setSession, writeInputs } from '../state/store'
import { setMe } from '../state/auth'
import { INPUTS, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { commitChipMove } from './caldrag'
import { reassignInput } from './inputedit'
import { MEDMOVE, setMedMove } from './pops'
import { MedMoveConfirm } from './MedMoveConfirm'

const ISNAP = JSON.stringify(INPUTS)
let said: string[] = []
const realToast = HOOKS.toast
let host: HTMLDivElement, root: Root

beforeAll(() => { initStore() })
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'a', role: 'admin' } as any)
  setMe('bane')
  said = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  histInit()
  setMedMove(null)
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
})
afterEach(() => { act(() => root.unmount()); host.remove(); HOOKS.toast = realToast; setMedMove(null) })

const plant = (r: any) => {
  const row: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, ...r }
  inpId(row)
  writeInputs(() => { INPUTS.unshift(row) })
  return row
}
const spans = (p: string) => INPUTS.filter((x: any) => x.person === p)
  .map((x: any) => `${x.type} ${x.date}${x.endDate ? '-' + x.endDate : ''}`).sort()
const mount = async () => { await act(async () => { root.render(<MedMoveConfirm />) }) }
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const click = async (el: Element | null) => { await act(async () => { (el as HTMLElement).click() }) }
const byText = (re: RegExp) => [...document.querySelectorAll('button')].find(b => re.test(b.textContent || '')) || null

describe('the calendar drag of a medical onto a different-type medical', () => {
  it('writes nothing and asks who holds the shared days — with no default when the other covers only part', async () => {
    /* a two-day ATT C dragged so it shares ONE day with the HL: the sheet has a real choice to put (where the other
       medical covers the WHOLE moved entry, the sheet forces "replaces" — MedClashConfirm's own rule) */
    plant({ person: 'bapster', type: 'HL', date: 'Jul 20', endDate: 'Jul 24' })
    const c = plant({ person: 'bapster', type: 'ATT C', date: 'Jul 27', endDate: 'Jul 28' })
    const before = JSON.stringify(INPUTS)
    expect(commitChipMove({ kind: 'input', iid: c.iid }, '2026-07-27', '2026-07-24')).toBe(false)
    expect(JSON.stringify(INPUTS), 'nothing is written before the question is answered').toBe(before)
    expect(MEDMOVE?.ask?.kind).toBe('clash')
    await mount()
    expect($('[data-testid="medclash"]'), 'the clash sheet is up').toBeTruthy()
    expect(($('[data-testid="medclash-save"]') as HTMLButtonElement).disabled, 'no default: Save waits for a choice').toBe(true)
  })

  it('answered, it moves the medical and cuts the other exactly as chosen — one undo step, "Moved to" said', async () => {
    plant({ person: 'bapster', type: 'HL', date: 'Jul 20', endDate: 'Jul 24' })
    const c = plant({ person: 'bapster', type: 'ATT C', date: 'Jul 27' })
    commitChipMove({ kind: 'input', iid: c.iid }, '2026-07-27', '2026-07-22')
    await mount()
    await click(byText(/ATT C replaces/))
    await click($('[data-testid="medclash-save"]'))
    expect(spans('bapster')).toEqual(['ATT C Jul 22', 'HL Jul 20-Jul 21'])   // the leftover 23–24 removed (the default the sheet shows)
    expect(said).toContain('Moved to 22 Jul')
    expect(MEDMOVE, 'the sheet is done').toBe(null)
  })

  it('cancelled, nothing moves and nothing is cut', async () => {
    plant({ person: 'bapster', type: 'HL', date: 'Jul 20', endDate: 'Jul 24' })
    const c = plant({ person: 'bapster', type: 'ATT C', date: 'Jul 27' })
    const before = JSON.stringify(INPUTS)
    commitChipMove({ kind: 'input', iid: c.iid }, '2026-07-27', '2026-07-22')
    await mount()
    await click(byText(/^Cancel$/))
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(MEDMOVE).toBe(null)
  })

  it('a medical dragged where it meets no other medical still lands at once', () => {
    const c = plant({ person: 'bapster', type: 'ATT C', date: 'Jul 27' })
    expect(commitChipMove({ kind: 'input', iid: c.iid }, '2026-07-27', '2026-07-29')).toBe(true)
    expect(spans('bapster')).toEqual(['ATT C Jul 29'])
    expect(MEDMOVE).toBe(null)
  })
})

describe('the calendar drag of an upchit', () => {
  it('puts what it ends on the summary sheet before anything is written', async () => {
    plant({ person: 'bapster', type: 'OML', date: 'Jul 20', endDate: 'Jul 31' })
    const u = plant({ person: 'bapster', type: 'Upchit', date: 'Aug 3', allday: true })
    const before = JSON.stringify(INPUTS)
    commitChipMove({ kind: 'input', iid: u.iid }, '2026-08-03', '2026-07-25')
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(MEDMOVE?.ask?.kind).toBe('up')
  })
})

describe('the schedule’s reassign of a medical to another man', () => {
  it('writes nothing and asks, when the new holder already carries a different medical there', () => {
    plant({ person: 'haowen', type: 'OML', date: 'Jul 20', endDate: 'Jul 24' })
    const c = plant({ person: 'bapster', type: 'ATT C', date: 'Jul 22' })
    const before = JSON.stringify(INPUTS)
    expect(reassignInput(c.iid, 'haowen')).toBe(false)
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(MEDMOVE?.ask?.kind).toBe('clash')
  })
})
