import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { stashClear, stashPut } from '../engine/weekstash'
import { HIST, initStore, notify, setSession, writeInputsBatch } from '../state/store'
import { docAdd } from '../state/docs'
import { InputEditor } from '../ui/inputedit'
import { INPEDIT, setInpEdit } from '../ui/pops'
import { getState, initStore as lwInitStore, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { runOutbound } from './sync'

const seed = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[]
beforeEach(() => {
  stashClear()
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  initStore()
  setSession({ user: 'a', role: 'admin' })
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  setRole('admin')
  said = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { cleanup(); setInpEdit(null); stashClear(); HOOKS.toast = toast; setSession(null) })
const plant = (type: string, date: string, endDate?: string) => {
  const row = { person: 'ammo', type, date, endDate, yr: 2026, allday: true, remarks: '', docId: docAdd(new Blob(['x'], { type: 'image/png' }) as any).id }
  writeInputsBatch(() => INPUTS.push(row))
  return row
}
const open = (row: any) => { setInpEdit(row); render(<InputEditor />); act(() => notify()) }
const saveEditor = () => fireEvent.click(document.querySelector('#inpEditSave')!)

describe('Pile 1 whole-form medical preflight', () => {
  it.each([true, false])('refuses every segment before the first write (new=%s)', isNew => {
    for (const day of ['02', '05', '06', '07', '08', '09']) setCell('ammo', `2026-02-${day}`, 'OML')
    runOutbound()
    plant('ATT C', 'Feb 4')
    const row = plant('ATT B', 'Feb 2', 'Feb 6')
    if (isNew) INPUTS.splice(INPUTS.indexOf(row), 1)
    stashPut('09/02/2026', 'null')
    const before = JSON.stringify(INPUTS), war = JSON.stringify(getState().wars), history = HIST.stack.length
    open(isNew ? { ...row, _new: true, _ctx: 'u' } : row)
    saveEditor()
    const clashes = screen.getAllByTestId(/^medclash-\d+$/)
    for (const clash of clashes) {
      const buttons = clash.querySelectorAll('.seg button')
      fireEvent.click(buttons[clash.textContent!.includes('ATT C') ? 1 : 0])
    }
    fireEvent.click(screen.getByTestId('medclash-save'))
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(JSON.stringify(getState().wars)).toBe(war)
    expect(HIST.stack).toHaveLength(history)
    expect(INPEDIT).toBeTruthy()
    expect(said.join(' ')).toMatch(/locked/i)
  })

  it.each([true, false])('refuses ticked protected removals before adding or editing an upchit (new=%s)', isNew => {
    setCell('ammo', '2026-02-09', 'OML')
    runOutbound()
    plant('ATT C', 'Feb 2', 'Feb 3')
    const row = plant('Upchit', 'Feb 4')
    if (isNew) INPUTS.splice(INPUTS.indexOf(row), 1)
    stashPut('09/02/2026', 'null')
    const before = JSON.stringify(INPUTS), war = JSON.stringify(getState().wars), history = HIST.stack.length
    open(isNew ? { ...row, _new: true, _ctx: 'up' } : row)
    fireEvent.change(screen.getByLabelText('Remarks'), { target: { value: 'Changed medical paperwork' } })
    saveEditor()
    fireEvent.click(screen.getByTestId('upconf-left-0').querySelectorAll('.seg button')[1])
    fireEvent.click(screen.getByTestId('upconf-save'))
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(JSON.stringify(getState().wars)).toBe(war)
    expect(HIST.stack).toHaveLength(history)
    expect(INPEDIT).toBeTruthy()
    expect(said.join(' ')).toMatch(/locked/i)
  })
})
