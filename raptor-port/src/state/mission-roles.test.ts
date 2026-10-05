/* MIX1 MIX7 MIX8 MIX9 MIX10 MIX11 MIX13 MIX14 — applicable behavioural watches; see Insights build register. */
// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { addDayTpl, dayTplReset, dayTplSave, dayTplLoad, DAYTPL_CFG } from '../engine/daytpl'
import { pickDayTpl, askCx, cxCommit } from '../ui/board'
import { DAYS } from '../engine/data'
import { SCHED, setSign, dayApproved, dayCurVer } from '../engine/publish'
import { computeInsights } from '../engine/insights'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import * as idMint from '../engine/newid'
import { CURWEEK } from '../engine/waves'
import { dayIso } from '../engine/verid'
import { missionContext, encodeRoleId } from '../engine/mission-role'
import { insightsLoad, setMissionTracking, missionTracking } from '../engine/insights-config'
import { store, storeBackend } from '../engine/hooks'
import { initStore, writeText, loadWeek } from './store'
import { ELOG } from '../engine/editlog'
import { schedBaselineClean, resyncSchedBaseline, schedWrite, SCHED_TYPES, commitSetDayApproved, commitPublishALDay, commitUnpublish } from './sched-commit'
import { setSession } from './auth'
import { setPage, setDayPreview, DPREV } from './view'
import { roleStore, roleTarget, setMissionRole, hydrateRoles, readRole, roleReader } from './mission-roles'
import { commandStream, commit, isOk } from '../command'
import { commitAs } from '../command/commit'
import { installGlobalUndo } from './undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
const before = JSON.stringify(DAYS)
beforeEach(() => {
  const mem:Record<string,string>={}
  storeBackend.impl={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v},keys:()=>Object.keys(mem)}
  DAYS.splice(0, DAYS.length, ...JSON.parse(before))
  DAYS.forEach(d=>{d.waves=[]})
  DAYS[0].waves = [{ label:'1',night:false,intimes:[],formations:[{rid:'role-test',cs:'VIPER',msn:'ACM',to:'09:00',ld:'10:00',br:'08:00',area:'',aircraft:[{p:'bane',w:'',area:'',opts:[],rmks:'DS for EAGLE'}]}]}] as any
  Object.assign(SCHED,{pending:{},changes:{},added:{},als:[],al:0,dayOK:{},sign:{},orig:{},cur:{},retired:{},signBind:{},drafts:{},curDraft:{},correcting:{}})
  setSession({user:'ad',role:'admin'}); setPage('editsched'); DPREV.clear()
  initStore(); hydrateRoles([]); store.set('insights',{trackBlueRedSorties:true}); insightsLoad()
  schedBaselineClean(); _resetTimeline(); installGlobalUndo()
})
afterEach(() => {_resetTimeline(); DAYS.splice(0,DAYS.length,...JSON.parse(before)); hydrateRoles([]);storeBackend.impl=null;insightsLoad()})
it('real answer intent writes one annotation, keeps the programme byte-for-byte, and round-trips live Undo', () => {
  const target=roleTarget(0,'role-test')!; const day=JSON.stringify(DAYS), book=JSON.stringify(SCHED)
  const seq=commandStream().length
  expect(isOk(setMissionRole(target,'red'))).toBe(true)
  const env=commandStream().slice(seq).find(e=>e.type==='insights.role.set')!
  expect(env.scope).toEqual({module:'insights',weekId:CURWEEK})
  expect(env.changes.map(c=>c.collection)).toEqual(['insights.role'])
  expect(readRole(target.id)?.side).toBe('red')
  expect(JSON.stringify(DAYS)).toBe(day); expect(JSON.stringify(SCHED)).toBe(book)
  expect(globalUndo().ok).toBe(true); expect(readRole(target.id)).toBeUndefined()
  expect(globalRedo().ok).toBe(true); expect(readRole(target.id)?.side).toBe('red')
  expect(JSON.stringify(DAYS)).toBe(day); expect(JSON.stringify(SCHED)).toBe(book)
})
it('same side makes no envelope; stale context and a forged member intent refuse without touching the answer', () => {
  const t=roleTarget(0,'role-test')!; expect(isOk(setMissionRole(t,'blue'))).toBe(true)
  const n=commandStream().length; expect(isOk(setMissionRole(roleTarget(0,'role-test')!,'blue'))).toBe(true)
  expect(commandStream().length).toBe(n)
  DAYS[0].waves[0].formations[0].msn='DS-2'
  expect(isOk(setMissionRole(t,'red'))).toBe(false)
  setSession({user:'bane',role:'main',pid:'bane'})
  expect(isOk(setMissionRole(roleTarget(0,'role-test')!,'red'))).toBe(false)
  expect(readRole(t.id)?.side).toBe('blue')
})
it('tracking defaults Off on absent/malformed records and toggles through real settings Undo', () => {
  store.set('insights',null); insightsLoad(); expect(missionTracking()).toBe(false)
  store.set('insights',{trackBlueRedSorties:'yes'}); insightsLoad(); expect(missionTracking()).toBe(false)
  setMissionTracking(true); expect(missionTracking()).toBe(true)
  globalUndo(); expect(missionTracking()).toBe(false)
  globalRedo(); expect(missionTracking()).toBe(true)
})
it('resetting hydration clears old in-memory answers; read/write clone; a failing multi-store transaction rolls back', () => {
  const t=roleTarget(0,'role-test')!; setMissionRole(t,'red')
  const v=readRole(t.id)!; v.side='blue'; expect(readRole(t.id)?.side).toBe('red')
  const indexed=roleReader()(t.weekKey,t.dayISO,t.formationRid,t.context) as any
  indexed.side='blue';expect(readRole(t.id)?.side).toBe('red')
  let ran=false
  expect(isOk(commit({type:'people.edit',scope:{module:'insights',weekId:CURWEEK},apply(txn){ran=true;txn.enlist(roleStore); roleStore.write!([{collection:'insights.role',id:t.id,value:{...v,side:'blue'}}]); throw new Error('rollback probe')}}))).toBe(false)
  expect(ran).toBe(true)
  expect(readRole(t.id)?.side).toBe('red')
  hydrateRoles([]); expect(readRole(t.id)).toBeUndefined()
})
const signAll=()=>{for(const [role,person] of [['cur','ignite'],['sked','bane'],['plan','stiff'],['appr','pump']]) schedWrite(SCHED_TYPES.sign,()=>{setSign(0,role!,person!);HOOKS.histPush()})}
const crewMix=()=>computeInsights().flyers.find((f:any)=>f.id==='bane')!.roleMix
it('published A and pending B have independent immediate answers, preserved through AL and withdrawal',()=>{
  signAll();expect(isOk(commitSetDayApproved(0,true))).toBe(true);expect(dayApproved(0)).toBe(true)
  const ver=dayCurVer(0)!, issued=JSON.stringify(SCHED.orig)
  writeText('fr:0.0.0.0','DS FROM VIPER')
  const b=roleTarget(0,'role-test')!;expect(isOk(setMissionRole(b,'blue'))).toBe(true)
  expect(crewMix().unresolved).toBeGreaterThan(0)
  setDayPreview(0,ver)
  const a=roleTarget(0,'role-test')!;expect(a.id).not.toBe(b.id)
  const book=JSON.stringify(SCHED),day=JSON.stringify(DAYS)
  expect(isOk(setMissionRole(a,'red'))).toBe(true)
  expect(JSON.stringify(SCHED)).toBe(book);expect(JSON.stringify(DAYS)).toBe(day);expect(JSON.stringify(SCHED.orig)).toBe(issued)
  expect(crewMix().red).toBeGreaterThan(0);expect(crewMix().blue).toBe(0)
  setDayPreview(0,null);const rows=roleStore.signature!()
  signAll();commitPublishALDay(0);expect(dayCurVer(0)).not.toBe(ver)
  expect(crewMix().blue).toBeGreaterThan(0);expect(roleStore.signature!()).toBe(rows)
  commitUnpublish(0);expect(crewMix().red).toBeGreaterThan(0);expect(roleStore.signature!()).toBe(rows)
})
it('answer/text Undo and Redo select retained contexts without changing text on an answer restore',()=>{
  const a=roleTarget(0,'role-test')!;setMissionRole(a,'red')
  writeText('fr:0.0.0.0','DS FROM VIPER');const b=roleTarget(0,'role-test')!;setMissionRole(b,'blue')
  expect(globalUndo().ok).toBe(true);expect(readRole(b.id)).toBeUndefined();expect(DAYS[0].waves[0].formations[0].aircraft[0].rmks).toBe('DS FROM VIPER')
  expect(globalUndo().ok).toBe(true);expect(roleTarget(0,'role-test')!.id).toBe(a.id);expect(readRole(a.id)?.side).toBe('red')
  expect(globalRedo().ok).toBe(true);expect(roleTarget(0,'role-test')!.id).toBe(b.id);expect(readRole(b.id)).toBeUndefined()
  expect(globalRedo().ok).toBe(true);expect(readRole(b.id)?.side).toBe('blue')
})
it('a same-label withdrawn/reissued Original rejects the old question token',()=>{
  signAll();commitSetDayApproved(0,true);const ver=dayCurVer(0)!
  setDayPreview(0,ver);const old=roleTarget(0,'role-test')!;setDayPreview(0,null)
  commitUnpublish(0);signAll();commitSetDayApproved(0,true);expect(dayCurVer(0)).toBe(ver)
  setDayPreview(0,ver);expect(roleTarget(0,'role-test')!.origin).not.toBe(old.origin)
  expect(isOk(setMissionRole(old,'red'))).toBe(false)
})
it('an otherwise allowed member command cannot smuggle an annotation write',()=>{
  const t=roleTarget(0,'role-test')!;setMissionRole(t,'red');const v=readRole(t.id)!
  setSession({user:'bane',role:'main',pid:'bane'});let ran=false
  const result=commit({type:'people.edit',scope:{module:'people'},meta:{owner:'bane'},apply(txn){ran=true;txn.enlist(roleStore);roleStore.write!([{collection:'insights.role',id:t.id,value:{...v,side:'blue'}}])}})
  expect(ran).toBe(true);expect(isOk(result)).toBe(false);expect(readRole(t.id)?.side).toBe('red')
})
it('role identities are week/date/context records, outside ordinary settings capture', () => {
  const f=DAYS[0].waves[0].formations[0]
  const id=encodeRoleId({weekKey:CURWEEK,dayISO:dayIso(CURWEEK,0),formationRid:f.rid!,context:missionContext(f)})
  expect(roleTarget(0,'role-test')!.id).toBe(id)
  setMissionRole(roleTarget(0,'role-test')!,'blue')
  expect(roleStore.records().get('insights.role/'+id)?.value).toEqual(readRole(id))
  expect(()=>store.set('missionrole:'+id,readRole(id))).toThrow()
})
it('the actual day-template route copies validated seeds to fresh blank-crew rows and one Undo restores both',()=>{
  dayTplReset();const source=roleTarget(0,'role-test')!;setMissionRole(source,'red')
  const t=addDayTpl(0)!;dayTplSave();dayTplLoad()
  expect(DAYTPL_CFG[0]!.missionRoleSeeds?.seeds[0]?.side).toBe('red')
  expect(JSON.stringify(t.d)).not.toContain('role-test')
  const destination=JSON.stringify(DAYS[1]),n=commandStream().length
  expect(pickDayTpl(1,t.id)).toBe('applied')
  const f=DAYS[1].waves[0]!.formations[0]!,target=roleTarget(1,f.rid!)!
  expect(f.rid).not.toBe(source.formationRid);expect(f.aircraft[0]!.p).toBe('');expect(readRole(target.id)?.side).toBe('red')
  expect(readRole(source.id)?.side).toBe('red')
  const changes=commandStream().slice(n).flatMap(e=>e.changes)
  expect(changes.some(c=>c.collection==='days')).toBe(true);expect(changes.some(c=>c.collection==='insights.role')).toBe(true)
  expect(globalUndo().ok).toBe(true);expect(JSON.stringify(DAYS[1])).toBe(destination);expect(readRole(target.id)).toBeUndefined();expect(readRole(source.id)?.side).toBe('red')
  expect(globalRedo().ok).toBe(true);expect(readRole(target.id)?.side).toBe('red')
  dayTplReset()
})
it('a late seed-copy failure rolls the template day and first answer back, then a valid application still works',()=>{
  dayTplReset();const f=DAYS[0].waves[0]!.formations[0]!
  DAYS[0].waves[0]!.formations.push({...JSON.parse(JSON.stringify(f)),rid:'role-second',cs:'EAGLE'})
  DAYS[0].waves[0]!.formations[1]!.aircraft[0]!.rid='role-second-aircraft'
  resyncSchedBaseline();setMissionRole(roleTarget(0,'role-test')!,'red');setMissionRole(roleTarget(0,'role-second')!,'blue')
  const t=addDayTpl(0)!,day=JSON.stringify(DAYS),book=JSON.stringify(SCHED),roles=roleStore.signature!(),n=commandStream().length
  const original=roleStore.write!
  const spy=vi.spyOn(roleStore,'write').mockImplementation((entries,opts)=>{original([entries[0]!],opts);throw new Error('late second-seed refusal')})
  try {expect(pickDayTpl(1,t.id)).toBe('noop')}finally{spy.mockRestore()}
  expect(JSON.stringify(DAYS)).toBe(day);expect(JSON.stringify(SCHED)).toBe(book);expect(roleStore.signature!()).toBe(roles);expect(commandStream().length).toBe(n)
  expect(pickDayTpl(1,t.id)).toBe('applied');expect(DAYS[1].waves[0]!.formations).toHaveLength(2)
  dayTplReset()
})
it('D525/D530 answer/correction history names actor, date and sides, while no-op/refusal creates no role line',()=>{
  const t=roleTarget(0,'role-test')!,n=ELOG.rows.length
  setMissionRole(t,'blue');setMissionRole(roleTarget(0,'role-test')!,'red')
  const lines=ELOG.rows.slice(n).filter((r:any)=>r.fld==='mission-role')
  expect(lines).toHaveLength(2);expect(lines.map((r:any)=>[r.from,r.to])).toEqual([['Unresolved','Blue'],['Blue','Red']])
  expect(lines.every((r:any)=>r.who&&r.date===t.dayISO&&r.lbl.includes('VIPER'))).toBe(true)
  const after=ELOG.rows.length;setMissionRole(roleTarget(0,'role-test')!,'red');setMissionRole(t,'red')
  expect(ELOG.rows.length).toBe(after);globalUndo();expect(ELOG.rows.at(-1)?.lbl).toContain('Undo')
})
it('MIX11 fresh template identity collision refuses atomically through the actual apply route',()=>{
  dayTplReset();setMissionRole(roleTarget(0,'role-test')!,'red');const tpl=addDayTpl(0)!,days=JSON.stringify(DAYS),roles=roleStore.signature!(),n=commandStream().length
  const mint=vi.spyOn(idMint,'newId').mockReturnValue('role-test')
  try{expect(pickDayTpl(1,tpl.id)).toBe('noop')}finally{mint.mockRestore()}
  expect(JSON.stringify(DAYS)).toBe(days);expect(roleStore.signature!()).toBe(roles);expect(commandStream().length).toBe(n)
  expect(pickDayTpl(1,tpl.id)).toBe('applied');dayTplReset()
})
it.each(['missing','future','changed'])('MIX11 template %s seed remains valid unanswered data through library reload and apply',kind=>{
  dayTplReset();const source=roleTarget(0,'role-test')!;setMissionRole(source,'red');const tpl=addDayTpl(0)!
  if(kind==='missing')delete tpl.missionRoleSeeds
  else if(kind==='future')(tpl.missionRoleSeeds as any).format=2
  else tpl.missionRoleSeeds!.seeds[0]!.context='[1,"ACM",["DS FROM RU"]]'
  dayTplSave();dayTplLoad();expect(pickDayTpl(1,tpl.id)).toBe('applied');const target=roleTarget(1,DAYS[1].waves[0]!.formations[0]!.rid!)!
  expect(readRole(target.id)).toBeUndefined();expect(readRole(source.id)?.side).toBe('red');dayTplReset()
})
it('D524/D530 the actual command refuses guest, pending, member and tracking-Off writes',()=>{
  const t=roleTarget(0,'role-test')!,rows=roleStore.signature!()
  for(const role of ['main','guest','pending','off']){setSession({user:'viewer',role});const n=commandStream().length;expect(isOk(setMissionRole(t,'red'))).toBe(false);expect(commandStream().length).toBe(n)}
  setSession({user:'ad',role:'admin'});setMissionTracking(false);const n=commandStream().length
  expect(isOk(setMissionRole(roleTarget(0,'role-test')!,'red'))).toBe(false);expect(commandStream().length).toBe(n);expect(roleStore.signature!()).toBe(rows)
})
it('D529/D530 off-week global Undo and Redo land on the answer week and preserve programme rows',()=>{
  const week=CURWEEK,t=roleTarget(0,'role-test')!;setMissionRole(t,'red');loadWeek('20/07/2026')
  expect(CURWEEK).not.toBe(week);expect(globalUndo()).toMatchObject({ok:true});expect(CURWEEK).toBe(week);expect(readRole(t.id)).toBeUndefined()
  const day=JSON.stringify(DAYS),book=JSON.stringify(SCHED);expect(globalRedo()).toMatchObject({ok:true});expect(readRole(t.id)?.side).toBe('red');expect(JSON.stringify(DAYS)).toBe(day);expect(JSON.stringify(SCHED)).toBe(book)
})
it('MIX14 same-key competing actor blocks the old answer and own Undo, while a different context does not',()=>{
  const old=roleTarget(0,'role-test')!;setMissionRole(old,'red');const stale=roleTarget(0,'role-test')!,v=readRole(old.id)!
  const external=(id:string,value:any)=>commitAs({type:'insights.role.set',scope:{module:'insights',weekId:CURWEEK},apply(txn){txn.enlist(roleStore);roleStore.write!([{collection:'insights.role',id,value}])}},{actor:{id:'other-admin',role:'admin',personId:'stiff',session:{}},origin:'remote'})
  expect(isOk(external(old.id,{...v,side:'blue'}))).toBe(true);const n=commandStream().length,history=ELOG.rows.length
  const refused=setMissionRole(stale,'red');expect(isOk(refused)).toBe(false);expect(JSON.stringify(refused)).toContain(PEOPLE.stiff!.cs);expect(commandStream().length).toBe(n);expect(ELOG.rows.length).toBe(history)
  const undo=globalUndo();expect(undo).toMatchObject({ok:false});expect(JSON.stringify(undo)).toContain(PEOPLE.stiff!.cs)
  _resetTimeline();installGlobalUndo();setMissionRole(roleTarget(0,'role-test')!,'red')
  const otherContext='[1,"ACM",["DS FROM RU"]]',otherId=encodeRoleId({...old,context:otherContext});expect(isOk(external(otherId,{...v,context:otherContext,side:'red'}))).toBe(true)
  expect(globalUndo()).toMatchObject({ok:true});expect(readRole(old.id)?.side).toBe('blue');expect(readRole(otherId)?.side).toBe('red')
})
it('MIX3 MIX4 MIX5 unrelated own text/crew/stores/reorder and cancellation keep the applicable answer with no answer-history write',()=>{
  const t=roleTarget(0,'role-test')!;setMissionRole(t,'red');const annotations=roleStore.signature!(),roleLines=()=>JSON.stringify(ELOG.rows.filter((r:any)=>r.fld==='mission-role')),history=roleLines()
  writeText('ff:0.0.0.to','09:15');writeText('fa:0.0.0.0','AREA 1')
  schedWrite(SCHED_TYPES.mutate,()=>{const f=DAYS[0].waves[0]!.formations[0]!;f.aircraft[0]!.p='stiff';f.aircraft[0]!.w='bane';f.aircraft[0]!.opts=['AAM'];f.aircraft[0]!.flag=true;f.aircraft.push({...f.aircraft[0]!,rid:undefined});f.aircraft.reverse()})
  expect(roleTarget(0,'role-test')!.id).toBe(t.id);expect(roleStore.signature!()).toBe(annotations);expect(roleLines()).toBe(history)
  const aircraft=DAYS[0].waves[0]!.formations[0]!.aircraft[0]!
  askCx(aircraft,'cx:0.0.0.0','VIPER');cxCommit(true,'weather');expect(aircraft.cx).toBe(true);expect(roleStore.signature!()).toBe(annotations)
  askCx(aircraft,'cx:0.0.0.0','VIPER');cxCommit(false,'');expect(aircraft.cx).toBeFalsy();expect(roleTarget(0,'role-test')!.id).toBe(t.id);expect(readRole(t.id)?.side).toBe('red');expect(roleLines()).toBe(history)
})
