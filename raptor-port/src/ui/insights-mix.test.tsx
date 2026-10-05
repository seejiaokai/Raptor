// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { storeBackend } from '../engine/hooks'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV } from '../state/view'
import { setMissionTracking } from '../engine/insights-config'
import { schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { hydrateRoles } from '../state/mission-roles'
import { roleTarget, setMissionRole } from '../state/mission-roles'
import { allows, T } from '../state/perms'
import { resetSched } from '../engine/publish'
import { setInsights, setInsightsAll } from './pops'
import { insightsHTML } from './Modals'
const day=JSON.stringify(DAYS),people=JSON.stringify(PEOPLE)
const html=()=>{const el=document.createElement('div');el.innerHTML=insightsHTML();return el}
function flyers(n:number,msn='ACM'){
  const ids=Object.keys(PEOPLE).filter(id=>!PEOPLE[id].special).slice(0,n)
  schedWrite(SCHED_TYPES.mutate,()=>{DAYS.forEach(d=>{d.waves=[]});DAYS[0].waves=[{label:'1',formations:ids.map((id,i)=>({cs:'VIPER '+i,msn,to:'0900',ld:'1000',aircraft:[{p:id,w:'',rmks:'',opts:[],area:''}]}))}] as any})
  return ids
}
beforeEach(()=>{const mem:Record<string,string>={};storeBackend.impl={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v},keys:()=>Object.keys(mem)};resetSched();DAYS.splice(0,DAYS.length,...JSON.parse(day));setSession({user:'ad',role:'admin'});setPage('editsched');DPREV.clear();initStore();hydrateRoles([]);setMissionTracking(true);setInsights(false);setInsights(true)})
afterEach(()=>{DAYS.splice(0,DAYS.length,...JSON.parse(day));Object.keys(PEOPLE).forEach(k=>delete PEOPLE[k]);Object.assign(PEOPLE,JSON.parse(people));storeBackend.impl=null;resetSched();setInsights(false)})
it('MIX15 D512/D513/D516/D523 initial twelve/all/reset and 0/12/13/many use the actual shared renderer',()=>{
  for(const n of [0,12,13,20]){flyers(n);setInsightsAll(false);const el=html();expect(el.querySelectorAll('.mission-mix-row')).toHaveLength(Math.min(12,n));expect(!!el.querySelector('[data-insights-all]')).toBe(n>12);setInsightsAll(true);expect(html().querySelectorAll('.mission-mix-row')).toHaveLength(n)}
  setInsights(false);setInsights(true);expect(html().querySelectorAll('.mission-mix-row')).toHaveLength(12)
})
it('MIX4 MIX14 MIX15 four seats split two/two, one unresolved makes ordinary four; member and guest reads match admin',()=>{
  const ids=flyers(1),id=ids[0]!
  schedWrite(SCHED_TYPES.mutate,()=>{const w=DAYS[0].waves[0]!;const f=w.formations[0]!;f.aircraft[0]!.w=id;w.formations.push({...JSON.parse(JSON.stringify(f)),rid:undefined,msn:'RED'});})
  let el=html(),r=el.querySelector('.mission-mix-row')!;expect(r.querySelector('.v')?.textContent).toBe('4');expect(r.textContent).toContain('2');expect(r.querySelector('.mix-segments')).not.toBeNull()
  schedWrite(SCHED_TYPES.mutate,()=>{DAYS[0].waves[0]!.formations[0]!.aircraft[0]!.rmks='DS FOR VL'})
  expect(html().querySelector('.mix-segments')).toBeNull();setMissionRole(roleTarget(0,DAYS[0].waves[0]!.formations[0]!.rid!)!,'blue');const admin=insightsHTML()
  for(const role of ['main','guest']){setSession({user:'viewer',role});expect(allows(role==='main'?'member':'guest',T.missionrole,'R')).toBe(true);expect(insightsHTML()).toBe(admin)}
})
it('MIX15 D512/D523 unsupported labels escape/fallback and unresolved rows retain one ordinary total',()=>{
  const ids=flyers(13);PEOPLE[ids[0]!]!.cs='<a long callsign &>';const f=DAYS[0].waves[0]!.formations[0]!
  schedWrite(SCHED_TYPES.mutate,()=>{f.aircraft[0]!.rmks='DS FOR EAGLE';f.aircraft.push({p:'missing-person',w:'',rmks:'',opts:[],area:''} as any)})
  setInsightsAll(true);const el=html(),row=[...el.querySelectorAll('.mission-mix-row')].find(r=>r.querySelector('.nm')?.textContent==='<a long callsign &>')!
  expect(row.querySelector('.fill')).not.toBeNull();expect(row.querySelector('.mix-segments')).toBeNull();expect(row.querySelector('.v')?.textContent).toBe('1');expect(el.querySelector('.nm a')).toBeNull();expect(el.textContent).toContain('missing-person')
  setMissionTracking(false);expect(html().querySelector('.insights-legend')).toBeNull();expect(html().querySelectorAll('.ibar')).not.toHaveLength(0)
})
