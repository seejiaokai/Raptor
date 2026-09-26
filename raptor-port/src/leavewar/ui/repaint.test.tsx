// THE LEAVE WAR REPAINTS WHEN AN ABSENCE CHANGES ON THE INPUTS PAGE (the absence-record re-test's break tests,
// 26 Sep 26 — bug-check order §8.4). The war reads the Inputs; nothing is copied. So a leave filed, edited or deleted
// on the Inputs page shows on the war only if the war's grid is TOLD to redraw. Every earlier test read the war's
// state straight from the store, which is right whether or not the grid redraws — switching the repaint off left all
// of them green. These mount the real grid with the real wiring (sync.ts wireLeaveWarSync, as main.tsx does) and look
// at the box on screen.

import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore as raptorInitStore, writeInputs } from '../../state/store'
import { setMe, setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { initStore as lwInitStore, setPeople } from '../state/store'
import { memoryBackend } from '../state/storage'
import { wireLeaveWarSync } from '../sync'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
})
afterEach(() => { setSession(null); setMe('bane') })

const box = (p: string, iso: string) => screen.getByTestId(`cell-${p}-${iso}`).textContent ?? ''

describe('the war grid redraws on an Inputs change', () => {
  it('a leave filed, re-typed and deleted on the Inputs page shows on the grid each time', () => {
    render(<Matrix />)
    expect(box('ammo', '2026-02-10')).not.toMatch(/LL|OL/)
    act(() => { writeInputs(() => { INPUTS.unshift({ iid: 'rp1', person: 'ammo', type: 'LL', date: 'Feb 10', yr: 2026, allday: true, remarks: '', mod: '2026-02-01' }) }) })
    expect(box('ammo', '2026-02-10')).toMatch(/LL/)
    act(() => { writeInputs(() => { const r = INPUTS.find((x: any) => x.iid === 'rp1'); r.type = 'OL' }) })
    expect(box('ammo', '2026-02-10')).toMatch(/OL/)
    act(() => { writeInputs(() => { INPUTS.splice(INPUTS.findIndex((x: any) => x.iid === 'rp1'), 1) }) })
    expect(box('ammo', '2026-02-10')).not.toMatch(/LL|OL/)
  })
})
