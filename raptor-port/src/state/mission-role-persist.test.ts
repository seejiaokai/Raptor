/* MIX12 — applicable behavioural watches; see Insights build register. */
// @vitest-environment jsdom
/* Real command → mapper → Whiteboard → Postman → backend routes (D524, D529–D531). */
import { beforeEach, afterEach, it, expect, vi } from 'vitest'
import { MemoryBackend } from '../storage/memory'
import { bootStorage } from '../storage/boot'
import { makeSchema, schemaJSON } from '../storage/schema'
import { settingsAdapter } from '../storage/adapters'
import type { Postman } from '../storage/postman'
import { hydrate, wirePersist } from './persist'
import { initStore, writeText } from './store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { storeBackend } from '../engine/hooks'
import { setSession } from './auth'
import { setPage, DPREV } from './view'
import { setMissionTracking } from '../engine/insights-config'
import { roleTarget, readRole, setMissionRole, roleStore } from './mission-roles'
import { schedWrite, SCHED_TYPES, schedBaselineClean } from './sched-commit'
import { installGlobalUndo } from './undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { addDayTpl, dayTplReset } from '../engine/daytpl'
import { pickDayTpl } from '../ui/board'
import '../tracker/fold'
const baseline=JSON.stringify(DAYS)
let postman:Postman
async function boot(be:MemoryBackend){
  const result=await bootStorage(be);postman=result.postman
  storeBackend.impl=settingsAdapter(result.wb);hydrate(result.wb);initStore();wirePersist(result.wb)
  return result
}
beforeEach(()=>{vi.useFakeTimers();DAYS.splice(0,DAYS.length,...JSON.parse(baseline));Object.assign(SCHED,{pending:{},changes:{},added:{},als:[],al:0,dayOK:{},sign:{},orig:{},cur:{},retired:{},signBind:{},drafts:{},curDraft:{},correcting:{}});setSession({user:'ad',role:'admin'});setPage('editsched');DPREV.clear();_resetTimeline();installGlobalUndo()})
afterEach(async()=>{if(postman){const pending=postman.flush();await vi.advanceTimersByTimeAsync(1500);await pending;postman.detach()}vi.useRealTimers();_resetTimeline();dayTplReset();storeBackend.impl=null;DAYS.splice(0,DAYS.length,...JSON.parse(baseline))})
async function setup(){
  const be=new MemoryBackend();be.seed({settings:{schema:schemaJSON(makeSchema(6,true))}})
  const {wb}=await boot(be)
  setMissionTracking(true)
  schedWrite(SCHED_TYPES.mutate,()=>{DAYS.forEach(d=>{d.waves=[]});DAYS[0].waves=[{label:'1',night:false,intimes:[],formations:[{rid:'role-persist',cs:'VIPER',msn:'ACM',to:'0900',ld:'1000',br:'0800',area:'',aircraft:[{p:'bane',w:'',area:'',opts:[],rmks:'DS FOR EAGLE'}]}]}] as any})
  writeText('fr:0.0.0.0','DS FROM VIPER');schedBaselineClean();await postman.flush();_resetTimeline();installGlobalUndo()
  return {be,wb,t:roleTarget(0,'role-persist')!}
}
it('one accepted annotation is a sealed save group, reloads intact, and does not write programme rows',async()=>{
  const {be,wb,t}=await setup(),groups:any[]=[];const off=wb.subscribe(g=>groups.push(g))
  setMissionRole(t,'red');expect(groups).toHaveLength(1)
  expect(groups[0].filter((e:any)=>e.collection==='settings').map((e:any)=>e.id)).toContain('missionrole:'+t.id)
  expect(groups[0].some((e:any)=>e.collection==='weeks'||e.collection==='inputs'||e.collection==='leavewar')).toBe(false)
  await postman.flush();expect(be.peek('settings','missionrole:'+t.id)).toContain('"side":"red"')
  off();postman.detach();await boot(be);expect(readRole(t.id)?.side).toBe('red')
})
it('a backend failure retains accepted state and the exact whole group until retry succeeds',async()=>{
  const {be,wb,t}=await setup();be.failNext(1);setMissionRole(t,'blue');await postman.flush()
  expect(postman.status).toBe('failed');expect(readRole(t.id)?.side).toBe('blue');expect(wb.get('settings','missionrole:'+t.id)).toContain('"blue"');expect(be.peek('settings','missionrole:'+t.id)).toBeNull()
  await postman.flush();expect(postman.status).toBe('saved');expect(be.peek('settings','missionrole:'+t.id)).toBe(wb.get('settings','missionrole:'+t.id))
})
it('Undo during a slow accepted save wins over the older in-flight answer',async()=>{
  const {be,t}=await setup();be.latency=500;setMissionRole(t,'red');const sending=postman.flush()
  expect(globalUndo()).toMatchObject({ok:true});expect(readRole(t.id)).toBeUndefined()
  await vi.advanceTimersByTimeAsync(500);await sending;const final=postman.flush();await vi.advanceTimersByTimeAsync(500);await final
  expect(be.peek('settings','missionrole:'+t.id)).toBeNull();be.latency=0
})
it('an interrupted template group recovers day and annotation together, even when first boot replay fails',async()=>{
  const {be,t}=await setup();setMissionRole(t,'red');await postman.flush();const tpl=addDayTpl(0)!;be.crashNextAfter(1)
  expect(pickDayTpl(1,tpl.id)).toBe('applied');const dest=roleTarget(1,DAYS[1].waves[0]!.formations[0]!.rid!)!
  await postman.flush();expect(postman.status).toBe('failed');expect(be.peekJournal()?.some(e=>e.id==='missionrole:'+dest.id)).toBe(true)
  postman.detach();be.failReplay(1);await boot(be)
  expect(postman.status).toBe('failed');expect(readRole(dest.id)?.side).toBe('red');expect(DAYS[1].waves[0]!.formations[0]!.rid).toBe(dest.formationRid)
  await postman.flush();expect(postman.status).toBe('saved');expect(be.peekJournal()).toBeNull();expect(be.peek('settings','missionrole:'+dest.id)).not.toBeNull()
})
it('late reducer failure emits no save group and restores the entire destination',async()=>{
  const {wb,t}=await setup();setMissionRole(t,'blue');await postman.flush();const tpl=addDayTpl(0)!,day=JSON.stringify(DAYS[1]),roles=roleStore.signature!(),groups:any[]=[]
  const off=wb.subscribe(g=>groups.push(g)),write=roleStore.write!,spy=vi.spyOn(roleStore,'write').mockImplementation((entries,opts)=>{write(entries,opts);throw new Error('after seed write')})
  try{expect(pickDayTpl(1,tpl.id)).toBe('noop')}finally{spy.mockRestore();off()}
  expect(groups).toHaveLength(0);expect(JSON.stringify(DAYS[1])).toBe(day);expect(roleStore.signature!()).toBe(roles)
})
it('empty rehydrate clears old answers and malformed role rows remain byte-for-byte through unrelated saves',async()=>{
  const {t}=await setup();setMissionRole(t,'red');await postman.flush();postman.detach()
  const be=new MemoryBackend(),raw='{ malformed future annotation'
  be.seed({settings:{schema:schemaJSON(makeSchema(6,true)),'missionrole:broken%xx':raw}})
  const {wb}=await boot(be);expect(readRole(t.id)).toBeUndefined();expect(wb.get('settings','missionrole:broken%xx')).toBe(raw)
  setMissionTracking(true);await postman.flush();expect(be.peek('settings','missionrole:broken%xx')).toBe(raw)
})
it('MIX12 two independently answered contexts survive the actual backend flush and boot',async()=>{
  const {be,t}=await setup();setMissionRole(t,'red');writeText('fr:0.0.0.0','DS FOR VL');const second=roleTarget(0,'role-persist')!;setMissionRole(second,'blue');await postman.flush()
  expect(second.id).not.toBe(t.id);const firstBytes=be.peek('settings','missionrole:'+t.id),secondBytes=be.peek('settings','missionrole:'+second.id)
  postman.detach();await boot(be);expect(readRole(t.id)?.side).toBe('red');expect(readRole(second.id)?.side).toBe('blue');expect(be.peek('settings','missionrole:'+t.id)).toBe(firstBytes);expect(be.peek('settings','missionrole:'+second.id)).toBe(secondBytes)
})
it('MIX12 existing pre-schema wipe filters annotation rows and unfinished journal while preserving other settings',async()=>{
  const {t}=await setup();postman.detach();const be=new MemoryBackend();be.seed({settings:{schema:'4',['missionrole:'+t.id]:'old annotation',insights:'{"trackBlueRedSorties":true}'},weeks:{old:'{}'}})
  be.crashNextAfter(1);await expect(be.putMany([{collection:'settings',id:'missionrole:'+t.id,value:'pending old annotation'},{collection:'weeks',id:'old',value:'{}'},{collection:'settings',id:'preserved-test',value:'{"keep":true}'}])).rejects.toThrow()
  be.failReplay(1);const {wb}=await boot(be);await postman.flush()
  expect(wb.has('settings','missionrole:'+t.id)).toBe(false);expect(readRole(t.id)).toBeUndefined();expect(be.peek('settings','missionrole:'+t.id)).toBeNull();expect(be.peek('weeks','old')).toBeNull();expect(wb.get('settings','preserved-test')).toBe('{"keep":true}');expect(wb.get('settings','insights')).toBe('{"trackBlueRedSorties":true}');expect(be.peekJournal()).toBeNull()
})
