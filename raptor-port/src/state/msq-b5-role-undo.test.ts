// @vitest-environment jsdom
/* B5 (Fable 4, its last point; Opus shape 2): a blue/red answer's change id carries no squadron, and persist.ts's
   insights.role mapper qualifies it with the squadron IN VIEW at write time. An answer given on 142's schedule, then the
   schedule switched to 149 and Undo pressed: the step passes timeline.ts inUnitView (no unit in its ids), and its Undo
   writes 149's row and leaves 142's answer stored. D148: Undo steps back the person's own change — the right one, never
   a phantom in another squadron. Harness as state/mission-role-persist.test.ts. Latent until the "149 ▾" pick calls
   switchUnit (step 5), as the reader says. */
import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import { MemoryBackend } from '../storage/memory'
import { bootStorage } from '../storage/boot'
import { makeSchema, schemaJSON } from '../storage/schema'
import { settingsAdapter } from '../storage/adapters'
import type { Postman } from '../storage/postman'
import { hydrate, wirePersist } from '../state/persist'
import { initStore, writeText, switchUnit, forgetUnitPlans } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { storeBackend } from '../engine/hooks'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { setSession } from '../state/auth'
import { setPage, DPREV } from '../state/view'
import { setMissionTracking } from '../engine/insights-config'
import { roleTarget, setMissionRole } from '../state/mission-roles'
import { schedWrite, SCHED_TYPES, schedBaselineClean } from '../state/sched-commit'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import '../tracker/fold'
const baseline = JSON.stringify(DAYS)
let postman: Postman
async function boot(be: MemoryBackend) {
  const result = await bootStorage(be); postman = result.postman
  storeBackend.impl = settingsAdapter(result.wb); hydrate(result.wb); initStore(); wirePersist(result.wb)
  return result
}
beforeEach(() => { vi.useFakeTimers(); DAYS.splice(0, DAYS.length, ...JSON.parse(baseline)); Object.assign(SCHED, { pending: {}, changes: {}, added: {}, als: [], al: 0, dayOK: {}, sign: {}, orig: {}, cur: {}, retired: {}, signBind: {}, drafts: {}, curDraft: {}, correcting: {} }); setSession({ user: 'ad', role: 'admin' }); setPage('editsched'); DPREV.clear(); _resetTimeline(); installGlobalUndo() })
afterEach(async () => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); if (postman) { const pending = postman.flush(); await vi.advanceTimersByTimeAsync(1500); await pending; postman.detach() } vi.useRealTimers(); _resetTimeline(); storeBackend.impl = null; DAYS.splice(0, DAYS.length, ...JSON.parse(baseline)) })

it("an answer given on 142's schedule, Undo pressed with 149 in view: never a 149 row written, 142's never left stale", async () => {
  const be = new MemoryBackend(); be.seed({ settings: { schema: schemaJSON(makeSchema(6, true)) } })
  const { wb } = await boot(be)
  setMissionTracking(true)
  schedWrite(SCHED_TYPES.mutate, () => { DAYS.forEach(d => { d.waves = [] }); DAYS[0].waves = [{ label: '1', night: false, intimes: [], formations: [{ rid: 'role-b5', cs: 'VIPER', msn: 'ACM', to: '0900', ld: '1000', br: '0800', area: '', aircraft: [{ p: 'bane', w: '', area: '', opts: [], rmks: 'DS FOR EAGLE' }] }] }] as any })
  writeText('fr:0.0.0.0', 'DS FROM VIPER'); schedBaselineClean(); await postman.flush(); _resetTimeline(); installGlobalUndo()
  const t = roleTarget(0, 'role-b5')!
  setMissionRole(t, 'red')
  await postman.flush()
  expect(wb.get('settings', 'u142@missionrole:' + t.id)).toContain('"red"')
  switchUnit('u149')
  const r: any = globalUndo()
  await postman.flush()
  expect(wb.get('settings', 'u149@missionrole:' + t.id), 'a row written into 149').toBeNull()
  if (r && r.ok) expect(wb.get('settings', 'u142@missionrole:' + t.id), "Undo said done, 142's answer still stored").toBeNull()
})
