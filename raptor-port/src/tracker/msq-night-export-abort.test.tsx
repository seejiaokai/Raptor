// @vitest-environment jsdom
/* AN EXPORT ABANDONED WHILE ITS FILE IS BEING WRITTEN COMMITS NOTHING (the night of 24 Nov 26, Astra's read of the nine
   fixes, finding 1). The Export checks that its session and squadron still stand around the gathering and after the
   write (the night's fix 5) — but the writer itself (fileStore.js writeTo) waited on the browser to open the file and to
   write it, and then closed it whatever had happened meanwhile: a squadron picked during either wait still overwrote the
   backup he had chosen, and the check after it only hid the message. The writer asks before it writes and again before
   it closes; gone, it aborts the stream — the file as it was — and nothing is reported.
   Red first: the stream was closed. The harness is msq-night-gestures.test.tsx's. */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import * as core from './app/core.js'
import * as st from './storage.js'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { saveAccess } from '../state/accounts'
import { todayIso } from '../state/units'
import { pageUnit, setTrkUnitProbe } from '../state/perms'
import { pickSquadron } from '../state/pick'
import { wireTrackerPeople } from './peoplewire'

const C: any = core
const S: any = st
const wb = new Whiteboard()
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u); await settle() }) }
const storedHas = (unit: string, needle: string) => wb.keys('tracker')
  .filter(k => k.startsWith(unit + '@') && !k.includes(':lay')).some(k => String(wb.get('tracker', k)).includes(needle))

let board: HTMLElement | null = null
beforeAll(() => {
  S.setStorageMaker((u: string) => trackerTarget(wb, u), () => pageUnit('own', todayIso()))
  setTrkUnitProbe(() => S.storageUnit())
})
useMsqWorld()
afterAll(() => { board?.remove(); setTrkUnitProbe(null); S.setStorageMaker(null, null); S.setStorageImpl(null) })

beforeEach(async () => {
  signInAs('saber')
  expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
  signInAs('hunter')
  if (!board) {
    board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    board.getBoundingClientRect = () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON() { return {} } }) as DOMRect
    Object.defineProperty(board, 'clientWidth', { configurable: true, get: () => 800 })
    Object.defineProperty(board, 'clientHeight', { configurable: true, get: () => 600 })
    wireTrackerPeople()
    await C.init(); await C.whenLoaded()
  }
  await act(async () => { await settle() })
  if (C.dlg) await act(async () => { C.dlgClose(false); await settle() })
  if (C.sylDirty) await C.saveChangesClick()
  if (C.arrangeMode) C.toggleArrange()
  if (S.storageUnit() !== 'u142') await pick('u142')
  await pick('u149'); await pick('u142')
})

describe('a squadron picked while the Export\'s file is being opened or written', () => {
  const start = () => { C.setCopyOpt('charts', true); C.setCopyOpt('students', true); C.setCopyPickAll(true); return C.saveCopyClick() }
  for (const at of ['createWritable', 'write'] as const) {
    it(`during ${at}(): the stream is aborted, never closed, and nothing is reported`, async () => {
      const calls: string[] = []
      let reached = false, release: () => void = () => {}
      const gate = () => new Promise<void>(r => { reached = true; release = r })
      const stream = {
        write: async () => { calls.push('write'); if (at === 'write') await gate() },
        close: async () => { calls.push('close') },
        abort: async () => { calls.push('abort') },
      }
      ;(window as any).__pickSaveForTests = async (name: string) => ({ name, createWritable: async () => { calls.push('open'); if (at === 'createWritable') await gate(); return stream } })
      try {
        const p = start()
        await until(() => reached)
        await pick('u149')
        await act(async () => { release(); await p; await settle() })
        expect(calls, 'the file is never committed').not.toContain('close')
        expect(calls, 'the stream is aborted: the backup stays as it was').toContain('abort')
        if (at === 'createWritable') expect(calls, 'nothing written after the pick').not.toContain('write')
        expect(C.dlg ?? null, 'no "Exported as…" over 149').toBeNull()
      } finally { delete (window as any).__pickSaveForTests; if (C.dlg) C.dlgClose(true) }
    })
  }
  it('(control) with no pick the Export writes, closes and reports as it did', async () => {
    const calls: string[] = []
    const stream = { write: async () => { calls.push('write') }, close: async () => { calls.push('close') }, abort: async () => { calls.push('abort') } }
    ;(window as any).__pickSaveForTests = async (name: string) => ({ name, createWritable: async () => stream })
    try {
      const p = start()
      await until(() => C.dlg)
      expect(C.dlg.msg).toContain('Exported as')
      await act(async () => { C.dlgClose(true); await p })
      expect(calls).toEqual(['write', 'close'])
    } finally { delete (window as any).__pickSaveForTests }
  })
})
