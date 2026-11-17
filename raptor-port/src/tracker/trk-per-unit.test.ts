// @vitest-environment jsdom
/* EACH SQUADRON'S TRACKER IS A WHOLE WORLD OF ITS OWN — multi-squadron batch 1, step 4 (the plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4 "The Leave War and the Tracker — each a whole world
   per unit"; D2167: 142 and 149 each keep a Tracker of their own). The brief's own test: in 142 delete a ball, import a
   chart and change a flex setting — 149's Tracker is unchanged, before and after signing out and in.

   "Signing out and in" is a fresh load of the Tracker's modules over the same saved records (signing out reloads the
   app — ui/logout.ts), its doorway handed the boot's maker of each unit's door (src/boot.ts → storage/adapters.ts
   trackerTarget(wb, unit)) and the signed-in person's squadron. Red first: before step 4 the doorway had one door for
   the whole collection, so 142's delete, import and flex setting were 149's too. */
import { afterAll, describe, expect, it, vi } from 'vitest'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'

const wb = new Whiteboard()
const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
afterAll(() => board.remove())

/* every stored record of one unit's Tracker, by its full key */
const recordsOf = (unit: string) => Object.fromEntries(wb.keys('tracker').filter(k => k.startsWith(unit + '@')).sort().map(k => [k, wb.get('tracker', k)]))
const tick = () => new Promise(r => setTimeout(r, 0))

/* a fresh Tracker — as after a sign-in — over the same saved records, for a person of `unit` */
async function openAs(unit: string): Promise<any> {
  vi.resetModules()
  const st: any = await import('./storage.js')
  st.setStorageMaker((u: string) => trackerTarget(wb, u), () => unit)
  const C: any = await import('./app/core.js')
  await C.init()
  await C.whenLoaded()
  expect(st.storageUnit(), 'the doorway is bound to the signed-in person\'s own squadron').toBe(unit)
  return C
}
const answer = async (C: any, v: any) => { for (let i = 0; i < 400 && !C.dlg; i++) await tick(); C.dlgClose(v) }

describe('each squadron keeps a Tracker of its own (step 4)', () => {
  it('in 142: a ball deleted, a chart imported, a flex setting changed — 149\'s Tracker unchanged, before and after signing out and in', async () => {
    /* 149's Tracker first: its first load seeds its own course */
    const T149 = await openAs('u149')
    const flex149 = T149.flexSetting().from
    const before149 = recordsOf('u149')
    expect(Object.keys(before149).length, '149 has a Tracker of its own, stored under its unit').toBeGreaterThan(0)

    /* signed out; a 142 person signs in */
    const C = await openAs('u142')
    const sylId = C.curSylId()
    const ball = C.SYL[C.SYL.length - 1].id
    C.toggleArrange(); C.openEdit(ball)
    const d = C.deleteFromEditModal(); await answer(C, true); await d
    C.toggleArrange(); await C.saveChangesClick()
    expect(C.byid[ball], '142\'s ball is deleted').toBeFalsy()
    /* a chart brought in from a file — 142's own current chart, added as a new one */
    const file = await C.collectCharts([sylId])
    await C.applyCharts(file, { ids: [sylId], mode: 'add', rename: { from: sylId, to: 'scimp142', label: 'IMPORTED 142' } })
    expect(C.sylName('scimp142'), '142 has the imported chart').toBe('IMPORTED 142')
    const from = [8, 14, 21, 31, 60, 120]
    expect((await C.setFlexSetting({ on: true, from })).ok, '142\'s flex setting changed').toBe(true)

    expect(recordsOf('u149'), '149\'s stored Tracker is exactly as it was').toEqual(before149)
    expect(Object.keys(wb.keys('tracker').reduce((o: any, k: string) => (k.includes('@') ? o : { ...o, [k]: 1 }), {})), 'nothing stored under no unit').toEqual([])

    /* signed out; 149's person signs in again: his Tracker reads as before */
    const B = await openAs('u149')
    expect(B.sylName('scimp142'), '149 never sees 142\'s imported chart').toBe('')
    expect(B.flexSetting().from, '149\'s flex setting is its own').toEqual(flex149)
    expect(recordsOf('u149'), '…and its stored Tracker is still as it was').toEqual(before149)

    /* and 142's own changes stay 142's, after its sign-in again */
    const A = await openAs('u142')
    expect(A.sylName('scimp142')).toBe('IMPORTED 142')
    expect(A.flexSetting().from).toEqual(from)
    if (A.curSylId() === sylId) expect(A.byid[ball], '142\'s ball stays deleted').toBeFalsy()
  })

  it('once loaded, the Tracker keeps its squadron — a bind to another unit is refused, never a silent switch', async () => {
    const st: any = await import('./storage.js')
    expect(st.storageUnit()).toBe('u142')
    expect(st.bindStorageUnit('u149')).toBe(false)
    expect(st.storageUnit()).toBe('u142')
  })
})
