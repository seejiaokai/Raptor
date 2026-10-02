import { afterEach,beforeEach,describe,expect,it } from 'vitest'
import { DAYS } from './data'
import { PEOPLE } from './people'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { buildDay } from './events'
import { personBusy,slotRules } from './avail'
import { dayOilSpans } from './oil'
import { validate,workSpan,REST,restIfPlaced,rawWarn,shownOf,restTraceEntries,traceOf } from './validate'
import { hideKey } from './warnhide'
import { availByWave } from './avail'
import { dayHTML } from '../ui/html'
import { DWOPEN } from '../state/view'
import { makeStandalone } from './waves'

const saved={d:JSON.stringify(DAYS),i:JSON.stringify(INPUTS),book:JSON.stringify(SCHED),v:{...VCONF}}
const f=(to='12:00',ld='13:00',br='10:00')=>({cs:'VL',to,ld,br,aircraft:[{p:'bane',w:'',rmks:'',opts:{}}]})
const flight=(lines=['09:00 IN TIME','09:30 RALLY'],form=f())=>({label:'WAVE 1',intimes:lines,formations:[form]})
const eventDay=(d:any)=>buildDay(d,0,undefined,undefined).events.filter((e:any)=>e.id==='bane')
beforeEach(()=>{
  Object.assign(VCONF,{briefLead:140,step:60,dekit:30,reportLead:180,debrief:120,crewRest:720,longDay:720})
  DAYS.forEach((d:any)=>Object.assign(d,{waves:[],sims:{amt:[],oft:[]},ground:[],allhands:[],dutywaves:[]}))
  INPUTS.splice(0);Object.assign(SCHED,{orig:{},cur:{},als:[],pending:{},changes:{},dayOK:{},sign:{}})
})
afterEach(()=>{
  DAYS.splice(0,DAYS.length,...JSON.parse(saved.d));INPUTS.splice(0,INPUTS.length,...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k=>delete SCHED[k]);Object.assign(SCHED,JSON.parse(saved.book));Object.assign(VCONF,saved.v)
})

describe('RT4/RT8 independent Rally consumer arithmetic',()=>{
  it('an overnight duty two authored dates earlier governs a previous-day report across an empty date',()=>{
    DAYS[0].dutywaves=[{label:'Duty',rows:[{role:'Duty',id:'bane',str:'2200',end:'0200'}]}]
    DAYS[2].waves=[flight(['11:00 IN TIME'],f('10:00','11:00','07:40'))]
    const warning=validate().all.find((w:any)=>w.di===2&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning,'Monday duty ends Tuesday02:00; Tuesday11:00 report gives nine hours').toBeTruthy()
    expect(warning.msg).toContain('only 9h00 rest');expect(warning.prevDi).toBe(0)
    expect(REST[2].bane).toBe(-600)
    DAYS[2].waves[0].intimes=['14:00 IN TIME']
    expect(validate().all.some((w:any)=>w.di===2&&w.code==='CREW_REST'&&w.who.includes('bane'))).toBe(false)
  })
  it('placing a late flight can break a report two authored dates ahead across an empty date',()=>{
    DAYS[0].waves=[flight([], {...f('22:00','00:00','20:00'),aircraft:[{p:'stiff',w:'',rmks:'',opts:{}}]})]
    DAYS[2].waves=[flight(['11:00 IN TIME'],f('10:00','11:00','07:40'))]
    validate()
    expect(restIfPlaced('bane','0.0.0.0.w')).toMatchObject({dir:'fwd',di:2,dow:DAYS[2].dow})
  })
  it('an older flight plus debrief and a qualifying written input keep their actual origin; excluded inputs do not govern rest',()=>{
    DAYS[0].waves=[flight([],f('22:00','00:00','20:00'))]
    DAYS[2].waves=[flight(['11:00 IN TIME'],f('10:00','11:00','07:40'))]
    let warning=validate().all.find((w:any)=>w.di===2&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning.msg).toContain('Monday landed 00:00');expect(warning.msg).toContain('only 9h00 rest')
    DAYS[0].waves=[]
    INPUTS.push({person:'bane',date:DAYS[0].dt,type:'Meeting',allday:false,s:1320,e:1560,remarks:'overnight',mod:''})
    warning=validate().all.find((w:any)=>w.di===2&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning.msg).toContain('only 9h00 rest');expect(warning.prevDi).toBe(0)
    INPUTS[0].type='Personal'
    expect(validate().all.some((w:any)=>w.di===2&&w.code==='CREW_REST'&&w.who.includes('bane'))).toBe(false)
  })
  it('four authored dates of reach covers the configured maximum without losing source provenance or forward placement',()=>{
    Object.assign(VCONF,{debrief:480,crewRest:1440})
    DAYS[0].waves=[flight([],f('23:30','23:00','21:00'))]
    DAYS[4].waves=[flight(['00:30 IN TIME'],f('00:15','01:00','00:10'))]
    const warning=validate().all.find((w:any)=>w.di===4&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning.msg).toContain('only 17h30 rest');expect(warning.prevDi).toBe(0)
    expect(traceOf(0,'bane').di).toBe(4)
    DAYS[0].waves[0].formations[0].aircraft[0].p='stiff';validate()
    expect(restIfPlaced('bane','0.0.0.0.w')).toMatchObject({dir:'fwd',di:4})
  })
  it('multiple future breaches retain independent trace rows and hide replay preserves each other and a run trace',()=>{
    Object.assign(VCONF,{debrief:480,crewRest:1440})
    DAYS[0].waves=[flight([],f('23:30','23:00','21:00'))]
    const sc:any=makeStandalone('sc');sc.formations=[{...f('00:15','00:30','23:00'),shift:'MAIN'}]
    DAYS[2].waves=[sc]
    DAYS[3].waves=[flight(['00:30 IN TIME'],f('00:15','01:00','00:10'))]
    validate();const raw=rawWarn(), entries=restTraceEntries(raw.trace[0].bane)
    expect(entries.map((t:any)=>t.di)).toEqual([2,3])
    const withRun={...raw,traces:[...raw.traces,{pdi:0,id:'bane',t:{run:{di:3,dow:'Thursday',n:7}},w:{di:3,code:'DAYS_RUN',who:['bane'],msg:'run'}}],
      byDay:raw.byDay.map((g:any)=>g.di===3?{...g,warns:[...g.warns,{di:3,code:'DAYS_RUN',who:['bane'],msg:'run'}]}:g)}
    const replay=shownOf(withRun,(w:any)=>w.di===2&&w.code==='CREW_REST',undefined,true)
    expect(restTraceEntries(replay.trace[0].bane).map((t:any)=>t.di)).toEqual([3])
    expect(replay.trace[0].bane.run).toMatchObject({di:3,n:7})
    DWOPEN.add(0);try{expect(dayHTML(0,false)).toContain('Breaks Wednesday');expect(dayHTML(0,false)).toContain('Breaks Thursday')}finally{DWOPEN.delete(0)}
    expect(shownOf(raw,()=>false,undefined,true).trace).toEqual(raw.trace)
  })
  it('moving away the older source removes its contribution from all forward placement checks',()=>{
    DAYS[0].waves=[flight([],f('22:00','00:00','20:00'))]
    DAYS[2].waves=[flight(['11:00 IN TIME'],f('10:00','11:00','07:40'))]
    DAYS[1].waves=[flight([],{...f('10:00','11:00','07:40'),aircraft:[{p:'stiff',w:'',rmks:'',opts:{}}]})]
    validate()
    expect(restIfPlaced('bane','1.0.0.0.w')).toMatchObject({dir:'back'})
    const moved=restIfPlaced('bane','1.0.0.0.w',{di:0,key:'0.0.0.0.p',leaves:true})
    expect(moved).toMatchObject({dir:'fwd',di:2})
    expect(moved!.msg).toContain('Tuesday landed 11:00')
    expect(moved!.msg).not.toContain('Monday landed')
    DAYS[0].waves[0].formations[0].aircraft[0].p='';validate()
    expect(traceOf(0,'bane')).toBeNull();expect(REST[2].bane).toBeUndefined()
  })
  it('prior-empty midnight band has no members or wave-specific all-day total while the all-day list remains',()=>{
    DAYS[0].waves=[flight(['23:00 IN TIME'],f('01:00','02:00','23:30')),flight(['00:00 IN TIME'],f('02:00','03:00','00:00'))]
    const A=availByWave(DAYS[0]);expect(A.anyWave.length).toBeGreaterThan(0);expect(A.byWave[0]).toEqual([])
    expect(dayHTML(0,true)).toMatch(/1st wave[^]*?· 0 can fly/)
    expect(dayHTML(0,true)).toContain(`Available all day · ${A.anyWave.filter((id:any)=>!PEOPLE[id].san).length}`)
  })
  it('ordinary busy and nominal OIL stay distinct from the earlier reporting work span and SANS window',()=>{
    const d=DAYS[0];d.waves=[flight()]
    expect(workSpan(eventDay(d))?.span).toBe(360)
    expect(personBusy(d,'bane')).toEqual([[660,810]])
    expect(slotRules('0.0.0.0.p')).toMatchObject({slotStart:660,slotEnd:810,sansStart:540})
    expect(dayOilSpans(d).bane).toEqual([[540,900]])
    d.waves[0].intimes=['07:00 RALLY']
    expect(workSpan(eventDay(d))?.span).toBe(480)
    expect(slotRules('0.0.0.0.p').sansStart).toBe(420)
    expect(personBusy(d,'bane')).toEqual([[660,810]])
    expect(dayOilSpans(d).bane).toEqual([[540,900]])
  })
  it('a scheduled earlier commitment extends work span; an unaccepted qualifying input affects rest only',()=>{
    DAYS[0].dutywaves=[{label:'Duty',rows:[{role:'Duty',id:'bane',str:'2130',end:'2130'}]}]
    const d=DAYS[1];d.waves=[flight()]
    d.ground=[{prog:'MTG',str:'0800',end:'0830',who:'bane'}]
    expect(workSpan(eventDay(d))?.span).toBe(420)
    let warning=validate().all.find((w:any)=>w.di===1&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning.msg).toContain('only 10h30 rest')
    d.ground=[];INPUTS.push({person:'bane',date:d.dt,type:'Meeting',allday:false,s:480,e:510,remarks:'early',mod:''})
    expect(workSpan(eventDay(d))?.span).toBe(360)
    warning=validate().all.find((w:any)=>w.di===1&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning.msg).toContain('only 10h30 rest')
  })
  it('D503 broad daytime prior report assesses only 2h20 rest against yesterday17:00',()=>{
    DAYS[0].dutywaves=[{label:'Duty',rows:[{role:'Duty',id:'bane',str:'1200',end:'1700'}]}]
    DAYS[1].waves=[flight(['19:20 IN TIME'],f('10:00','11:25','07:40'))]
    const warning=validate().all.find((w:any)=>w.di===1&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning.msg).toContain('only 2h20 rest');expect(REST[1].bane).toBe(300)
    expect(workSpan(eventDay(DAYS[1]))?.span).toBe(1085)
  })
  it('D503 prior-day reporting before the previous duty ends stays a breach with a readable signed gap',()=>{
    DAYS[0].dutywaves=[{label:'Duty',rows:[{role:'Duty',id:'bane',str:'1200',end:'2330'}]}]
    DAYS[1].waves=[flight(['23:00 IN TIME'],f('01:30','03:00','23:10'))]
    const warning=validate().all.find((w:any)=>w.di===1&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning.msg).toContain('only -0h30 rest')
    expect(warning.msg).not.toContain('-1h-30')
  })
  it('D503 previous-day23:00 report still breaches when twelve-hour rest clears exactly midnight',()=>{
    DAYS[0].dutywaves=[{label:'Duty',rows:[{role:'Duty',id:'bane',str:'0800',end:'1200'}]}]
    DAYS[1].waves=[flight(['23:00 IN TIME'],f('01:30','03:00','23:10'))]
    const warning=validate().all.find((w:any)=>w.di===1&&w.code==='CREW_REST'&&w.who.includes('bane'))
    expect(warning,'11h from yesterday12:00 to yesterday23:00 is one hour short').toBeTruthy()
    expect(warning.msg).toContain('only 11h00 rest')
    expect(REST[1].bane).toBe(0)
  })
  it('SC early and late typed B preserve existing clamped work rules rather than broad D503',()=>{
    const sc:any=makeStandalone('sc');sc.formations=[{...f('07:00','13:00','05:00'),shift:'MAIN'}]
    DAYS[0].waves=[sc]
    expect(workSpan(eventDay(DAYS[0]))?.span).toBe(480)
    sc.formations[0].br='19:00';expect(workSpan(eventDay(DAYS[0]))?.span).toBe(360)
    sc.formations[0].to='01:30';sc.formations[0].ld='07:00';sc.formations[0].br='23:00'
    expect(workSpan(eventDay(DAYS[0]))?.span).toBe(480)
  })
  it('work span includes later nonflight end without adding gaps or a false debrief tail',()=>{
    const d=DAYS[0];d.waves=[flight(['19:20 IN TIME'],f('10:00','11:25','07:40'))]
    d.ground=[{prog:'MTG',str:'1400',end:'1600',who:'bane'}]
    expect(workSpan(eventDay(d))).toMatchObject({span:1240,e:960,ef:null})
  })
})
