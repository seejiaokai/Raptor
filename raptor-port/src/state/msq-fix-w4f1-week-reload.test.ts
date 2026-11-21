// @vitest-environment jsdom
/* W4-F1 (the walk of 21 Nov 26, walker W4): fresh world, Kestrel (149's admin) signs in on Wed 15 Jul, types into Fri 17's
   first remarks box on Edit Schedule, and reloads. A week's first save writes only the day the command changed
   (state/persist.ts scheduleRows — the group walk's H3), so 149's stored week is its week row and Friday's day row; the
   reload reads every day with no row as "the week untouched" — and asked for it with the squadron split off the week's
   key, so the untouched days came from the squadron in view at the boot (142, before anyone signs in): Mon–Thu of 149's
   week then showed 142's days (Warden, Ranger…), on Edit Schedule, View-only Sched, Insights and the CSV.
   Harness as state/msq-b5-role-undo.test.ts (a real whiteboard, hydrate, initStore, wirePersist), the reload a second
   boot on the same backend with the squadron in view put back to the boot's. */
import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import { MemoryBackend } from '../storage/memory'
import { bootStorage } from '../storage/boot'
import { makeSchema, schemaJSON } from '../storage/schema'
import { settingsAdapter } from '../storage/adapters'
import type { Postman } from '../storage/postman'
import { hydrate, wirePersist } from '../state/persist'
import { initStore, writeText, switchUnit, forgetUnitPlans, resetSession } from '../state/store'
import { DAYS } from '../engine/data'
import { storeBackend } from '../engine/hooks'
import { UNIT, BOOT_UNIT, setUnitInView } from '../engine/unitview'
import { setSession } from '../state/auth'
import { setPage } from '../state/view'
import { signIn, sessionFor, accountsLoad } from '../state/accounts'
import { unitsLoad } from '../state/units'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { week149Days } from '../engine/week149'
import '../tracker/fold'

let postman: Postman | null = null
async function boot(be: MemoryBackend) {
  const result = await bootStorage(be); postman = result.postman
  storeBackend.impl = settingsAdapter(result.wb); hydrate(result.wb); initStore(); wirePersist(result.wb)
  accountsLoad(); unitsLoad()
  return result
}
async function settle() { if (postman) { const pending = postman.flush(); await vi.advanceTimersByTimeAsync(1500); await pending } }
const kestrelIn = () => { const r = signIn('ad9', 'a9'); resetSession(sessionFor(r)); setPage('editsched') }
const crewOf = (d: any): string[] => (d?.waves ?? []).flatMap((w: any) => (w.formations ?? []).flatMap((f: any) => (f.aircraft ?? []).flatMap((a: any) => [a.p, a.w])))

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 15, 10, 0, 0)); _resetTimeline(); installGlobalUndo() })
afterEach(async () => {
  setSession(null); resetSession(null)
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
  forgetUnitPlans()
  await settle(); postman?.detach(); postman = null
  vi.useRealTimers(); _resetTimeline(); storeBackend.impl = null
})

const WANT = week149Days().map(crewOf)

it("control: Kestrel's week with no edit reads 149's own days after a reload", async () => {
  const be = new MemoryBackend(); be.seed({ settings: { schema: schemaJSON(makeSchema(6, true)) } })
  await boot(be)
  kestrelIn()
  expect(UNIT).toBe('u149')
  expect(DAYS.map(crewOf)).toEqual(WANT)
  await settle(); postman!.detach(); postman = null
  setSession(null); resetSession(null); setUnitInView(BOOT_UNIT)
  await boot(be)
  kestrelIn()
  expect(DAYS.map(crewOf)).toEqual(WANT)
})

it("W4-F1: Kestrel types into Fri 17's first remarks box and reloads — Mon–Thu are still 149's days, never 142's", async () => {
  const be = new MemoryBackend(); be.seed({ settings: { schema: schemaJSON(makeSchema(6, true)) } })
  const first = await boot(be)
  kestrelIn()
  expect(writeText('fr:4.0.0.0', 'W4 149 FRI')).toBe(true)
  await settle()
  /* the week's first save: its week row and the one day the command changed */
  expect(first.wb.keys('weeks').filter(k => k.startsWith('u149@')).sort()).toEqual(['u149@13-07-2026', 'u149@13-07-2026#4'])
  postman!.detach(); postman = null
  /* the reload: a page loaded afresh holds the boot's squadron until someone signs in */
  setSession(null); resetSession(null); setUnitInView(BOOT_UNIT)
  await boot(be)
  kestrelIn()
  expect(UNIT).toBe('u149')
  expect(DAYS.map(crewOf), "149's week after the reload").toEqual(WANT)
  expect(DAYS[4].waves[0].formations[0].aircraft[0].rmks).toBe('W4 149 FRI')
})
