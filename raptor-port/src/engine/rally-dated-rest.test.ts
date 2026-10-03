import { afterEach,beforeEach,describe,expect,it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { CURWEEK,setCurWeek,makeStandalone } from './waves'
import { emptyWeek,shiftWeekKey } from './weeks-data'
import { stashPut,stashClear } from './weekstash'
import { VCONF } from './rules'
import { SCHED } from './publish'
import { validate,workingWarn,officialRaw,REST,restTraceEntries,traceOf,restIfPlaced,crossDayIfPlaced } from './validate'
import { hideKey } from './warnhide'
import { verId,dayIso } from './verid'
import { dayWarnHTML } from '../ui/html'
import { DWOPEN } from '../state/view'

const saved={d:JSON.stringify(DAYS),i:JSON.stringify(INPUTS),book:JSON.stringify(SCHED),v:{...VCONF},week:CURWEEK}
const WK='03/08/2026', NEXT=shiftWeekKey(WK,1), PREV=shiftWeekKey(WK,-1)
const wave=(report='11:00')=>({label:'WAVE 1',intimes:[report+' IN TIME'],formations:[{cs:'VL',to:'10:00',ld:'11:00',br:'07:40',aircraft:[{p:'bane',w:'',rmks:'',opts:{}}]}]})
const duty=(end='0200')=>[{label:'Duty',rows:[{role:'Duty',id:'bane',str:'2200',end}]}]
beforeEach(()=>{
  stashClear();setCurWeek(WK);DAYS.splice(0,DAYS.length,...emptyWeek(WK).days);INPUTS.splice(0)
  Object.keys(SCHED).forEach(k=>delete SCHED[k]);Object.assign(SCHED,{orig:{},cur:{},als:[],pending:{},changes:{},dayOK:{},sign:{}})
  Object.assign(VCONF,{briefLead:140,step:60,dekit:30,reportLead:180,debrief:120,crewRest:720,maxRun:6})
})
afterEach(()=>{
  stashClear();DWOPEN.clear();setCurWeek(saved.week);DAYS.splice(0,DAYS.length,...JSON.parse(saved.d));INPUTS.splice(0,INPUTS.length,...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k=>delete SCHED[k]);Object.assign(SCHED,JSON.parse(saved.book));Object.assign(VCONF,saved.v)
})
const cr=(bundle:any,di:number)=>bundle.all.find((w:any)=>w.di===di&&w.code==='CREW_REST'&&w.who.includes('bane'))

describe('RT8 dated-rest week/world/trace boundaries',()=>{
  it('review E labels prior-day report and long-day start, and describes overlap against the actual duty-end date',()=>{
    DAYS[0].dutywaves=duty('2300');DAYS[1].waves=[wave('22:00')];
    const warnings=validate();const warning=cr(warnings,1);
    expect(warning.msg).toContain('told to report 22:00 (previous day) — 1h00 before his Monday duty ends.');
    expect(warning.msg).not.toContain('-1h00');expect(warning.leaveBy).toBe('10:00');
    expect(warnings.all.find((w:any)=>w.di===1&&w.code==='LONGDAY'&&w.who.includes('bane')).msg)
      .toContain('15h00, 22:00 (previous day) → 13:00');
    expect(restTraceEntries(traceOf(0,'bane'))[0]).toMatchObject({leaveBy:'10:00',msg:warning.msg});
    VCONF.crewRest=1440;expect(cr(validate(),1).leaveBy).toBe('22:00 (previous day)');VCONF.crewRest=720;
    DAYS[0].dutywaves=duty('0100');
    expect(cr(validate(),1).msg).toContain('3h00 before his Tuesday duty ends.');
  })
  it('review E pre-drop backward clearance and placed warning use the same signed clock wording',()=>{
    DAYS[0].dutywaves=[{label:'Duty',rows:[{role:'Duty',id:'bane',str:'0600',end:'0800'}]}];
    const w=wave('19:00');w.formations[0].aircraft[0].p='ignite';DAYS[1].waves=[w];validate();
    const key='1.0.0.0.p',hint=restIfPlaced('bane',key);
    expect(hint).toMatchObject({dir:'back',earliest:-240,leaveBy:'07:00'});
    expect(crossDayIfPlaced('bane',key)).toBe('crew rest — not clear until 20:00 (previous day)');
    w.intimes=['19:00 IN TIME'];validate();const before=restIfPlaced('bane',key)!;
    expect(before.msg).toContain('told to report 19:00 (previous day)');
    w.formations[0].aircraft[0].p='bane';expect(cr(validate(),1).msg).toBe(before.msg);
  })
  it('Sunday overnight source governs Tuesday previous-day report across empty Monday',()=>{
    const prev:any[]=emptyWeek(PREV).days;prev[6].dutywaves=duty();stashPut(PREV,JSON.stringify({d:prev}))
    DAYS[1].waves=[wave()]
    const warning=cr(validate(),1)
    expect(warning.msg).toContain('Sunday ended 02:00');expect(warning.msg).toContain('only 9h00 rest')
    expect(warning.msg).toContain('told to report 11:00 (previous day)');expect(warning.leaveBy).toBe('23:00')
    expect(warning.prevDi).toBeNull();expect(REST[1].bane).toBe(-600)
  })
  it('review E an older Thursday trace dates its leave-by on Thursday for Saturday previous-day reporting',()=>{
    DAYS[3].dutywaves=duty();DAYS[5].waves=[wave()]
    const warning=cr(validate(),5)
    expect(warning.msg).toContain('Thursday ended 02:00');expect(warning.msg).toContain('only 9h00 rest')
    expect(warning.msg).toContain('told to report 11:00 (previous day)');expect(warning.prevDi).toBe(3)
    expect(warning.leaveBy).toBe('23:00');expect(REST[5].bane).toBe(-600)
    expect(restTraceEntries(traceOf(3,'bane'))[0]).toMatchObject({di:5,leaveBy:'23:00',msg:warning.msg})
  })
  it('an issued older Sunday stays authoritative until its pending end is issued, including after probe globals restore',()=>{
    const prev:any[]=emptyWeek(PREV).days;prev[6].dutywaves=duty('2300')
    const issued={...prev[6],dutywaves:duty()},id=verId(dayIso(PREV,6),0)
    stashPut(PREV,JSON.stringify({d:prev,ok:{6:1},cv:{6:id},o:{6:{id,d:issued,c:{},fil:{}}},a:[]}))
    DAYS[1].waves=[wave()]
    expect(cr(validate(),1)).toBeUndefined()
    expect(cr(officialRaw(),1).msg).toContain('only 9h00 rest')
    expect(REST[1].bane).toBe(-780)
  })
  function externalTargets(){
    Object.assign(VCONF,{debrief:480,crewRest:1440})
    DAYS[6].waves=[{label:'WAVE 1',intimes:[],formations:[{cs:'VL',to:'23:30',ld:'23:00',br:'21:00',aircraft:[{p:'bane',w:'',rmks:'',opts:{}}]}]}]
    const next:any[]=emptyWeek(NEXT).days,sc:any=makeStandalone('sc')
    sc.formations=[{cs:'SC',to:'00:15',ld:'00:30',br:'23:00',shift:'MAIN',aircraft:[{p:'bane',w:'',rmks:'',opts:{}}]}]
    next[1].waves=[sc];next[3].waves=[{...wave('00:30'),formations:[{...wave().formations[0],to:'00:15',ld:'01:00',br:'00:10'}]}]
    stashPut(NEXT,JSON.stringify({d:next}));return next
  }
  it('external Tuesday and Thursday targets both survive with correct labels, identities, and inert navigation',()=>{
    externalTargets();validate()
    const entries=restTraceEntries(traceOf(6,'bane'))
    expect(entries.map((t:any)=>[t.di,t.targetDi,t.targetWeek])).toEqual([[null,1,NEXT],[null,3,NEXT]])
    DWOPEN.add(6);const h=dayWarnHTML(6)
    expect(h).toContain('Breaks Tuesday');expect(h).toContain('Breaks Thursday')
    expect(h).toContain("Next week's Tuesday");expect(h).toContain("Next week's Thursday")
    expect((h.match(/class="witem hard wtr/g)||[]).length).toBe(2)
    for(const row of h.match(/<div class="witem hard wtr[^]*?<\/div>/g)||[])expect(row).not.toContain('data-wdi')
  })
  it('actual external target hides remove only their own source trace and unhide restores it',()=>{
    const next=externalTargets();validate()
    const entries=restTraceEntries(traceOf(6,'bane'))
    const key=(t:any)=>hideKey({di:t.targetDi,code:'CREW_REST',who:['bane'],msg:t.msg})
    stashPut(NEXT,JSON.stringify({d:next,wo:[key(entries[0])]}));validate()
    expect(restTraceEntries(workingWarn().trace[6].bane).map((t:any)=>t.targetDi)).toEqual([3])
    stashPut(NEXT,JSON.stringify({d:next,wo:[key(entries[1])]}));validate()
    expect(restTraceEntries(workingWarn().trace[6].bane).map((t:any)=>t.targetDi)).toEqual([1])
    stashPut(NEXT,JSON.stringify({d:next,wo:[]}));validate()
    expect(restTraceEntries(workingWarn().trace[6].bane).map((t:any)=>t.targetDi)).toEqual([1,3])
  })
  it('next-Tuesday-only unpublished reporting divergence cannot alias into the official world',()=>{
    const next:any[]=emptyWeek(NEXT).days;next[1].waves=[wave('14:00')]
    const issued={...next[1],waves:[wave()]},id=verId(dayIso(NEXT,1),0)
    stashPut(NEXT,JSON.stringify({d:next,ok:{1:1},cv:{1:id},o:{1:{id,d:issued,c:{},fil:{}}},a:[]}))
    DAYS[6].dutywaves=duty()
    validate();expect(traceOf(6,'bane')).toBeNull()
    expect(restTraceEntries(officialRaw().trace[6].bane).map((t:any)=>t.targetDi)).toEqual([1])
  })
})
