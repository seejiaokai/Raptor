// @vitest-environment jsdom
/* A Blue/Red answer on a built-in demo day nobody has edited — through the real command, save and boot. Its own file:
   the week stash is module state, and mission-role-persist.test.ts leaves a saved copy of this same week behind. */
import { afterEach, beforeEach, it, expect, vi } from 'vitest'
import { MemoryBackend } from '../storage/memory'
import { bootStorage } from '../storage/boot'
import { makeSchema, schemaJSON } from '../storage/schema'
import { settingsAdapter } from '../storage/adapters'
import type { Postman } from '../storage/postman'
import { hydrate, wirePersist } from './persist'
import { initStore, loadWeek } from './store'
import { DAYS } from '../engine/data'
import { storeBackend } from '../engine/hooks'
import { setSession } from './auth'
import { setPage, DPREV } from './view'
import { setMissionTracking } from '../engine/insights-config'
import { computeInsights } from '../engine/insights'
import { roleTarget, readRole, setMissionRole } from './mission-roles'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import '../tracker/fold'
const baseline=JSON.stringify(DAYS)
let postman:Postman
async function boot(be:MemoryBackend){
  const result=await bootStorage(be);postman=result.postman
  storeBackend.impl=settingsAdapter(result.wb);hydrate(result.wb);initStore();wirePersist(result.wb)
  return result
}
beforeEach(()=>{vi.useFakeTimers();DAYS.splice(0,DAYS.length,...JSON.parse(baseline));setSession({user:'ad',role:'admin'});setPage('editsched');DPREV.clear();_resetTimeline();installGlobalUndo()})
afterEach(async()=>{if(postman){const pending=postman.flush();await vi.advanceTimersByTimeAsync(1500);await pending;postman.detach()}vi.useRealTimers();_resetTimeline();storeBackend.impl=null;DAYS.splice(0,DAYS.length,...JSON.parse(baseline))})
const asks=()=>DAYS[1].waves.flatMap((w:any)=>w.formations).map((f:any)=>roleTarget(1,f.rid)).filter(Boolean) as any[]
/* W8 (the Codex stack check, 5 Oct 26; D530 "the answer is saved"): an answer writes no day, so a demo day nobody has
   edited is never saved — and its lines' hidden row ids were minted at random on every load, so the stored answer
   matched nothing after a reload, a sign-in or a week switch. The two built-in weeks now carry repeatable ids. */
it('W8 an answer on a demo day NOBODY has edited survives the real save and a fresh boot',async()=>{
  const be=new MemoryBackend();be.seed({settings:{schema:schemaJSON(makeSchema(6,true))}})
  await boot(be);setMissionTracking(true);_resetTimeline();installGlobalUndo()
  const t=asks()[0];expect(t,'the demo Tuesday carries a line that asks').toBeTruthy()
  setMissionRole(t,'red');await postman.flush();expect(be.peek('weeks','13/07/2026#1'),'the day itself was never saved').toBeNull()
  postman.detach();DAYS.splice(0,DAYS.length,...JSON.parse(baseline))   // a reload starts from the built-in week again
  await boot(be);setMissionTracking(true)
  const again=asks()[0];expect(again.formationRid,'the line is the same line').toBe(t.formationRid)
  expect(again.id).toBe(t.id);expect(readRole(again.id)?.side).toBe('red')
})
it('W8 the same answer survives a visit to the next week and back, and Insights still counts it',async()=>{
  const be=new MemoryBackend();be.seed({settings:{schema:schemaJSON(makeSchema(6,true))}})
  await boot(be);setMissionTracking(true)
  const t=asks()[0];setMissionRole(t,'red')
  const crew=DAYS[1].waves.flatMap((w:any)=>w.formations).find((f:any)=>f.rid===t.formationRid).aircraft.flatMap((a:any)=>[a.p,a.w]).filter(Boolean)
  const unresolved=()=>computeInsights().flyers.filter((f:any)=>crew.includes(f.id)).map((f:any)=>f.roleMix.unresolved)
  const before=unresolved()
  loadWeek('20/07/2026');loadWeek('13/07/2026')
  expect(asks()[0].id).toBe(t.id);expect(readRole(t.id)?.side).toBe('red');expect(unresolved()).toEqual(before)
})
