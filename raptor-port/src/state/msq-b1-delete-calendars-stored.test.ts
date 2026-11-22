// @vitest-environment jsdom
/* B1 — THE STORED COPY (the reshape plan §6.4's B1 tests: "a refused delete leaves the other calendar untouched, stored and
   cached; a reload"). The shared world (test-support/msq-world.ts) with the app's own saved copy wired under it — a
   whiteboard on the memory backend and the row writer of every command (state/persist.ts wireRows) — so 149's calendar
   here lives in its STORED ROWS, not only in the page's kept copy: the delete's strip must write those rows, inside the
   delete's own command, and a reload must read the note without him. Its own file: the row writer, once wired, stays
   wired for the file. */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { useMsqWorld, signInAs, PID } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans, writeInputs } from './store'
import { PLANPUCKS, addPlanPuck } from './plan'
import { deletePerson, applyDelete, deleteCutoff } from './person-delete'
import { wireRows } from './persist'
import { peopleStore, settingsStore } from './people-settings-commit'
import { schedStore, resyncBeforeEnlist } from './sched-commit'
import { bootStorage } from '../storage/boot'
import { MemoryBackend } from '../storage/memory'
import type { Whiteboard } from '../storage/whiteboard'
import { commit, CmdRefused } from '../command'
import { UNIT, BOOT_UNIT } from '../engine/unitview'

let wb: Whiteboard
beforeAll(async () => { wb = (await bootStorage(new MemoryBackend())).wb; wireRows(wb) })
useMsqWorld()
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); PLANPUCKS.length = 0 })

const row = (id: string): any => { const v = wb.get('plan', `u149@pp:${id}`); return v == null ? null : JSON.parse(v) }
/* Saber files a 149 note through the app's own door (saved as its row), goes back to 142, and the page forgets the kept
   copy — as a reload would: 149's calendar is now only its stored rows */
function storedNote(text: string): string {
  signInAs('saber')
  switchUnit('u149')
  expect(writeInputs(() => { addPlanPuck('2026-07-20', text, [PID.osprey, 'mer9']) })).toBe(true)
  const id = PLANPUCKS.find((p: any) => p.text === text)!.id
  switchUnit('u142')
  forgetUnitPlans()
  expect(row(id), 'the note is saved as its row').toMatchObject({ text, ids: [PID.osprey, 'mer9'] })
  return id
}

describe("B1 — the delete writes 149's stored rows, and a reload reads them", () => {
  it('Saber deletes Osprey with 142 in view: the row loses him, a gap; reloaded, 149 shows the note without him', () => {
    const id = storedNote('Stored range day')
    expect(deletePerson(PID.osprey)).toBeNull()
    expect(row(id)).toMatchObject({ text: 'Stored range day', ids: ['', 'mer9'] })
    forgetUnitPlans()
    switchUnit('u149')
    expect(PLANPUCKS.find((p: any) => p.id === id)).toMatchObject({ ids: ['', 'mer9'] })
  })
  it('a delete refused after its strip ran writes no row', () => {
    const id = storedNote('Kept range day')
    const r = commit({
      type: 'person.delete', scope: { module: 'people' }, meta: null,
      apply: (txn: any) => {
        resyncBeforeEnlist()
        txn.enlist(peopleStore); txn.enlist(settingsStore); txn.enlist(schedStore)
        applyDelete(PID.osprey, deleteCutoff(null))
        throw new CmdRefused('refused later in the command')
      },
    })
    expect((r as any).ok).toBe(false)
    expect(row(id)).toMatchObject({ ids: [PID.osprey, 'mer9'] })
  })
})
