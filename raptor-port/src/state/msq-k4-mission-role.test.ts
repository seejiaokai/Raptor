// @vitest-environment jsdom
/* REPRO K4 — another squadron's mission-role (insights.role) answer written through a valid commit, and Undo crossing
   into it (core read, security S3; its Undo variant was traced, not run, by the reader). Correct (D2191/D2192: 142's
   plain admin writes nothing of 149's; D148 + the unit filter of Undo: a 142 step never writes 149's rows): both
   refused, 149's saved answer untouched. RED while the claim holds.
   Harness: state/units-switch.test.ts's boot, copied. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { CURWEEK } from '../engine/waves'
import { storesReset } from '../engine/stores'
import { encodeRoleId } from '../engine/mission-role'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, resetSession, switchUnit, forgetUnitPlans, notify, setEntryTrigger } from '../state/store'
import { setSession } from '../state/auth'
import { signIn, sessionFor } from '../state/accounts'
import { hydrate, wirePersist } from '../state/persist'
import { _resetTimeline, globalUndo } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { roleStore } from '../state/mission-roles'
import { commit, isOk } from '../command'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const BOOT_WEEK = CURWEEK
const signInAs = (name: string, pass = 'x') => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
function resetWorld() {
  if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT)
  forgetUnitPlans()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  stashClear(); loadWeek(BOOT_WEEK); stashClear()
  storesReset()
}
async function boot(be: MemoryBackend) {
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb, postman } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  return { wb, postman }
}
/* SETUP ONLY (the reshape plan §9.2), phase 3: with the midnight swap switched on, the next notify re-enters his own
   squadron when the pick has no right behind it (state/store.ts, the blind read's R6), so Hunter's pick of 149 with no
   right there would not stand; the gate is tested here with the page held where it is picked, as before. */
setEntryTrigger(false)
beforeEach(() => { vi.useFakeTimers(); resetWorld(); _resetTimeline(); installGlobalUndo() })
afterEach(() => { vi.useRealTimers(); setSession(null); resetWorld(); _resetTimeline(); storeBackend.impl = null })

const ident = { weekKey: '13/07/2026', dayISO: '2026-07-13', formationRid: 'f-k4', context: JSON.stringify([1, 'ACM', []]) }
const ID = encodeRoleId(ident)
const answer = (side: 'blue' | 'red') => commit({
  type: 'insights.role.set', scope: { module: 'insights', weekId: CURWEEK } as any,
  apply(txn: any) { txn.enlist(roleStore); roleStore.write!([{ collection: 'insights.role', id: ID, value: { format: 1, contextVersion: 1, ...ident, side } } as any]) },
} as any)
const KEY149 = 'u149@missionrole:' + ID

describe("K4 — 149's blue/red answers and 142's plain admin (Hunter)", () => {
  it('(control) the master writes 149\'s answer: saved under 149', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    switchUnit('u149')
    expect(isOk(answer('red'))).toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', KEY149)).toContain('red')
  })
  it('Hunter, with no right in 149, writes an answer while 149 is in view: refused, nothing saved under 149', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad2', 'a2')
    switchUnit('u149')
    const r = answer('red')
    await vi.advanceTimersByTimeAsync(300)
    expect({ ok: isOk(r), saved: wb.get('settings', KEY149) }).toEqual({ ok: false, saved: null })
  })
  it("Undo crosses: Hunter answers in 142, switches to 149 and presses Undo — 149's own answer (red, the master's) is untouched", async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    switchUnit('u149')
    expect(isOk(answer('red'))).toBe(true)
    switchUnit('u142')
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', KEY149)).toContain('red')
    signInAs('ad2', 'a2')
    expect(UNIT).toBe('u142')
    expect(isOk(answer('blue'))).toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', 'u142@missionrole:' + ID)).toContain('blue')
    switchUnit('u149')
    const u = globalUndo() as any
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', KEY149) ?? '(149 row deleted)', `undo ok=${u?.ok}`).toContain('red')
    expect(wb.get('settings', 'u142@missionrole:' + ID), "142's own answer is the one Undo may take back").toContain('blue')
  })
  it('the same Undo, Hunter holding an honest View of 149 (so the switch to 149 is one the screen offers)', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)
    switchUnit('u149')
    expect(isOk(answer('red'))).toBe(true)
    switchUnit('u142')
    await vi.advanceTimersByTimeAsync(300)
    signInAs('ad2', 'a2')
    expect(isOk(answer('blue'))).toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    switchUnit('u149')
    const u = globalUndo() as any
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', KEY149) ?? '(149 row deleted)', `undo ok=${u?.ok}`).toContain('red')
  })
})
import { setGrant } from '../state/units'

/* §19b R11 (the blind read, Astra F2): the gate roll-call's row 25 said HAS IT, but the answer's id named no squadron, so a
   View holder passed the door. K4's tests add Hunter with View and with Plan of 149 (D2191: View reads only; D2199,
   D2201: Plan gives full access as 149's own admins have). */
describe("K4 + R11 — Hunter holding View, then Plan, of 149", () => {
  it('with View of 149 he answers while 149 is in view: refused, nothing saved under 149', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    switchUnit('u149')
    const r = answer('red')
    await vi.advanceTimersByTimeAsync(300)
    expect({ ok: isOk(r), saved: wb.get('settings', KEY149) }).toEqual({ ok: false, saved: null })
  })
  it('with Plan of 149 he answers while 149 is in view: saved under 149, as its own admins’ would be', async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    switchUnit('u149')
    expect(isOk(answer('red'))).toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', KEY149)).toContain('red')
    expect(wb.get('settings', 'u142@missionrole:' + ID), 'never written under 142').toBeNull()
  })
  it("with Plan of 149: he answers in 142, switches to 149 and presses Undo — 149's own answer is untouched, his 142 one stays", async () => {
    const { wb } = await boot(new MemoryBackend())
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    switchUnit('u149')
    expect(isOk(answer('red'))).toBe(true)
    switchUnit('u142')
    await vi.advanceTimersByTimeAsync(300)
    signInAs('ad2', 'a2')
    expect(isOk(answer('blue'))).toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    switchUnit('u149')
    const u = globalUndo() as any
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', KEY149) ?? '(149 row deleted)', `undo ok=${u?.ok}`).toContain('red')
    expect(wb.get('settings', 'u142@missionrole:' + ID), 'his 142 answer waits for him in 142').toContain('blue')
    switchUnit('u142')
    expect((globalUndo() as any).ok, 'and is his to undo there').toBe(true)
    await vi.advanceTimersByTimeAsync(300)
    expect(wb.get('settings', 'u142@missionrole:' + ID)).toBeNull()
  })
})
