import { describe, expect, it } from 'vitest'
import { buildDay, seatIntime, waveInTime, waveWindows } from './events'
import { workSpan } from './validate'
import { VCONF } from './rules'
import { resolveReporting, reportingIssuesForDay, reportingIssuesForWave } from './reporting'
import { DAYS } from './data'
import { WEEK2_DAYS } from './week2'
import { readFileSync } from 'node:fs'

const formation = (cs='VL', to='12:00') => ({cs,to,ld:'13:00',br:'10:00',aircraft:[{p:'ignite',w:'bane',rmks:'',opts:{}}]})
const wave = (intimes:string[], formations=[formation(),formation('RU')]) => ({label:'FIRST WAVE',intimes,formations})

describe('Rally reporting decisions D497–D507: RT1 scope, RT2 grammar, RT3 actual dates, RT4 consumers, RT5 stages', () => {
  it('review F the live vocabulary states all approved reporting rules and retires both older passages',()=>{
    const vocabulary=readFileSync(new URL('../../docs/remarks-vocabulary.md',import.meta.url),'utf8');
    for(const phrase of ['IN TIME','RALLY AFTER IN TIME','RALLYING','D503','D505','D506','REPORT_ORDER','REPORT_UNRESOLVED','previous day','LATE SHOW'])
      expect(vocabulary).toContain(phrase);
    const rules=readFileSync(new URL('../../docs/engine-rules.md',import.meta.url),'utf8');
    expect(rules.match(/Superseded by In-time \/ Rally/g)).toHaveLength(2);
  })
  it('review B distinguishes the suggested brief from an explicitly typed brief',()=>{
    for(const br of ['', 'TBD']){
      const w=wave(['12:00 IN TIME'],[{...formation(),to:'12:40',br}]);
      expect(reportingIssuesForWave(w)[0].msg).toBe('VL: in-time 12:00 is later than suggested brief 10:20.');
    }
    const w=wave(['12:00 IN TIME'],[{...formation(),to:'12:40',br:'10:20'}]);
    expect(reportingIssuesForWave(w)[0].msg).toBe('VL: in-time 12:00 is later than brief 10:20.');
  })
  it.each([['week 1',DAYS],['week 2',WEEK2_DAYS]])('review C fresh %s has no reporting-order warning',(_name,days)=>{
    expect(days.flatMap((d:any)=>reportingIssuesForDay(d)).filter((i:any)=>i.code==='REPORT_ORDER')).toEqual([]);
  })
  it('review C changes only the approved demo clocks, keeping their words and valid clocks',()=>{
    const expected=[
      [DAYS,0,0,['0940H: FIRST WAVE VL IN TIME + WX/NOTAMS','1040H: FIRST WAVE RU IN TIME + WX/NOTAMS']],
      [DAYS,0,1,['1645H: NIGHT WAVE VL IN TIME + WX/NOTAMS','1620H: NIGHT WAVE RU IN TIME + WX/NOTAMS']],
      [DAYS,1,0,['0600H: FIRST WAVE VL IN TIME + WX/NOTAMS','0700H: FIRST WAVE RU IN TIME + WX/NOTAMS']],
      [DAYS,1,1,['1200H: SECOND WAVE VL IN TIME + WX/NOTAMS','1140H: SECOND WAVE RU IN TIME + WX/NOTAMS']],
      [DAYS,2,0,['0735H: FIRST WAVE VL IN TIME + WX/NOTAMS','0735H: FIRST WAVE RU IN TIME + WX/NOTAMS']],
      [DAYS,2,1,['1000H: SECOND WAVE VL IN TIME + WX/NOTAMS','1000H: SECOND WAVE RU IN TIME + WX/NOTAMS']],
      [DAYS,3,0,['0945H: FIRST WAVE VL IN TIME + WX/NOTAMS','0945H: FIRST WAVE RU IN TIME + WX/NOTAMS']],
      [DAYS,3,1,['1345H: NIGHT WAVE VL IN TIME + WX/NOTAMS','1345H: NIGHT WAVE RU IN TIME + WX/NOTAMS']],
      [WEEK2_DAYS,0,0,['0540H: FIRST WAVE VL IN TIME + WX/NOTAMS','0540H: FIRST WAVE RU IN TIME + WX/NOTAMS']],
      [WEEK2_DAYS,0,1,['0730H: SECOND WAVE VL IN TIME + WX/NOTAMS']],
      [WEEK2_DAYS,1,0,['0500H: FIRST WAVE VL IN TIME + WX/NOTAMS']],
      [WEEK2_DAYS,2,1,['1705H: NIGHT WAVE VL IN TIME + WX/NOTAMS']],
      [WEEK2_DAYS,3,0,['0430H: FIRST WAVE VL IN TIME + WX/NOTAMS']],
    ] as const;
    for(const [days,di,gi,lines] of expected)expect(days[di].waves[gi].intimes).toEqual(lines);
  })
  it('D505 scopes IN and RALLY separately, preserving a wide IN under specific RALLY', () => {
    const w=wave(['08:00 IN TIME','08:30 VL RALLY'])
    expect(seatIntime(w,w.formations[0],720)).toBe(480)
    expect(seatIntime(w,w.formations[1],720)).toBe(480)
  })
  it('D505 a specific IN replaces wide IN without losing the wide RALLY', () => {
    const w=wave(['08:00 IN TIME','09:00 RALLY','08:30 VL IN TIME'])
    expect(seatIntime(w,w.formations[0],720)).toBe(510)
    expect(seatIntime(w,w.formations[1],720)).toBe(480)
  })
  it('D506 duplicate specific activity chooses earliest regardless of row order', () => {
    for (const lines of [['08:00 VL IN TIME','09:00 VL IN TIME'],['09:00 VL IN TIME','08:00 VL IN TIME']]) {
      const w=wave(lines)
      expect(seatIntime(w,w.formations[0],720)).toBe(480)
    }
  })
  it('D503/D506 resolves date before comparing wide and specific duplicates', () => {
    for (const suffix of ['',' VL']) {
      const w=wave([`23:00${suffix} IN TIME`,`01:00${suffix} IN TIME`],[formation('VL','01:30')])
      expect(seatIntime(w,w.formations[0],90)).toBe(-60)
    }
  })
  it('D503 applies the previous-day decision to daytime take-off independently of reportLead', () => {
    const w=wave(['19:20 VL IN TIME'],[formation('VL','10:00')])
    expect(seatIntime(w,w.formations[0],600)).toBe(-280)
  })
  it('WORKSPAN-NEGATIVE retains the actual reporting instruction and exposes the long day', () => {
    const f={...formation('VL','10:00'),ld:'11:25',br:'07:40'}
    const d={dow:'Mon',dt:'2026-10-05',waves:[wave(['19:20 VL IN TIME'],[f])],sims:{amt:[],oft:[]},dutywaves:[],ground:[],allhands:[]}
    const events=buildDay(d,0,'2026-10-06','2026-10-04').events.filter((e:any)=>e.id==='ignite')
    expect(events[0].report).toBe(-280)
    expect(workSpan(events)?.span).toBe(685+VCONF.debrief+280)
  })
  it('D503 wave header uses applicable resolved reporting, rather than raw minimum', () => {
    const w=wave(['23:00 VL RALLY','01:00 VL RALLY'],[formation('VL','01:30')])
    expect(waveInTime(w)).toBe(-60)
  })
  it('D503 availability bands stay in today without reversing prior-day boundaries', () => {
    const d={waves:[wave(['22:00 IN TIME'],[formation('VL','01:00')]),wave(['23:00 IN TIME'],[formation('RU','02:00')])]}
    const wins=waveWindows(d)
    expect(wins.map((w:any)=>[w.s,w.e])).toEqual([[0,0],[0,1440]])
  })
  it('keeps SC typed-B report priority and its existing bounded midnight policy', () => {
    const w={...wave(['08:00 IN TIME']),kind:'sc',standalone:true}
    const f={...formation('SC','10:00'),br:'11:00'}
    expect(seatIntime(w,f,600)).toBe(660)
  })
  it('a negative-origin band ending at midnight remains empty without changing ordinary midnight ties',()=>{
    const d={waves:[wave(['23:00 IN TIME'],[formation('VL','01:00')]),wave(['00:00 IN TIME'],[formation('RU','02:00')])]}
    expect(waveWindows(d)[0]).toMatchObject({in:-60,s:0,e:0,priorEmpty:true})
    const ties={waves:[wave(['00:00 IN TIME'],[formation('VL','01:00')]),wave(['00:00 IN TIME'],[formation('RU','02:00')])]}
    expect(waveWindows(ties)[0].priorEmpty).toBeUndefined()
  })
  it('D497 rally alone can report and missing report still falls back to step', () => {
    const w=wave(['08:00 RALLY'])
    expect(seatIntime(w,w.formations[0],720)).toBe(480)
    expect(seatIntime(wave([]),w.formations[0],720)).toBe(null)
  })
  it('D497 immediate rally derives only its applicable IN; D505 specific immediate overrides wide rally', () => {
    const w=wave(['08:00 IN TIME','09:00 RALLY','VL RALLY AFTER IN TIME'])
    expect(resolveReporting(w,w.formations[0],720).rally).toBe(480)
    expect(resolveReporting(w,w.formations[1],720).rally).toBe(540)
    const both=wave(['08:00 IN-TIME + RALLY'])
    expect(resolveReporting(both,both.formations[0],720)).toMatchObject({inTime:480,rally:480,report:480})
  })
  it('W3 D505 a formation RALLY AFTER IN TIME typed WITH a clock is its rally only — the whole-wave in-time still starts its day, in either order', () => {
    for(const lines of [['08:00H: IN TIME + WX/NOTAMS','08:30H: VL RALLY AFTER IN TIME'],['08:30H: VL RALLY AFTER IN TIME','08:00H: IN TIME + WX/NOTAMS']]){
      const w=wave(lines,[formation('VL','11:00'),formation('RU','11:00')])
      expect(resolveReporting(w,w.formations[0],660)).toMatchObject({inTime:480,rally:510,report:480})
      expect(resolveReporting(w,w.formations[1],660)).toMatchObject({inTime:480,rally:null,report:480})
      expect(seatIntime(w,w.formations[0],660)).toBe(480)
    }
  })
  it('D500/D504 matching includes remarks, bounded own-wave tokens, and no person targeting', () => {
    const w=wave(['08:00 IN TIME | TRUE','09:00 RALLY (vl + IGNITE)'])
    expect(resolveReporting(w,w.formations[0],720).rally).toBe(540)
    expect(resolveReporting(w,w.formations[1],720).rally).toBe(null)
    expect(resolveReporting(w,w.formations[1],720).inTime).toBe(480)
  })
  it('D502/D507 names the actual wrong pair and accepts rally equal to brief', () => {
    const w=wave(['09:00 IN TIME','08:00 RALLY'])
    expect(reportingIssuesForWave(w)[0]).toMatchObject({blocking:true,code:'REPORT_ORDER',msg:'VL: in-time 09:00 is later than rally 08:00.'})
    w.intimes=['09:00 IN TIME','10:00 RALLY']
    expect(reportingIssuesForWave(w)).toEqual([])
    w.intimes=['09:00 IN TIME','10:15 RALLY']
    expect(reportingIssuesForWave(w)[0].msg).toBe('VL: rally 10:15 is later than brief 10:00.')
  })
  it('D502 includes uncrewed active formations, skips cancellation and standalone exceptions', () => {
    const f={...formation(),aircraft:[]}; const w=wave(['10:15 RALLY'],[f])
    expect(reportingIssuesForDay({waves:[w]})).toHaveLength(1)
    expect(reportingIssuesForDay({waves:[{...w,formations:[{...f,cx:'weather'}]}]})).toEqual([])
    expect(reportingIssuesForDay({waves:[{...w,standalone:true,kind:'sc'}]})).toEqual([])
  })
  it('D502 unresolved prose remains nonblocking; D501 first valid token and clockless notes preserved', () => {
    for(const text of ['25:90 IN TIME','VL RALLY AFTER IN']){
      const w=wave([text],[formation()]); const issues=reportingIssuesForWave(w)
      expect(issues).toHaveLength(1)
      expect(issues[0]).toMatchObject({blocking:false,code:'REPORT_UNRESOLVED'})
      expect(resolveReporting(w,w.formations[0],720).report).toBe(null)
    }
    for(const text of ['RALLY TBD','IN TIME TBD','NO RALLY','IN TIME + WX/NOTAMS'])
      expect(reportingIssuesForWave(wave([text]))).toEqual([])
    const w=wave(['2590 THEN 0900 INTIME'])
    expect(resolveReporting(w,w.formations[0],720).inTime).toBe(540)
  })
  it('W19 a clock spelt in a way the app does not read is told so, like 25:90 — and prose with digits is left alone', () => {
    for(const text of ['8h00 VL IN TIME','8.00 IN TIME','08.00 RALLY','0800IN TIME + WX/NOTAMS','800RALLY']){
      const w=wave([text],[formation()]); const issues=reportingIssuesForWave(w)
      expect(issues,text).toHaveLength(1)
      expect(issues[0],text).toMatchObject({blocking:false,code:'REPORT_UNRESOLVED',msg:'VL: reporting line 1 has no recognised clock. Check the time.'})
    }
    for(const text of ['IN TIME + 2 SHIPS','RALLY AT FL240','IN TIME BLDG 12','RALLY 2.5 HRS PRIOR','IN TIME A0900 glued','IN TIME 12345 block','8 IN TIME'])
      expect(reportingIssuesForWave(wave([text],[formation()])),text).toEqual([])
    /* a readable clock elsewhere on the line is the line's clock — nothing to say */
    expect(reportingIssuesForWave(wave(['8.00 or 08:00 IN TIME'],[formation()]))).toEqual([])
  })
  it('D503 resolves each same-callsign formation using its own take-off', () => {
    const w=wave(['08:00 VL IN TIME'],[formation('VL','07:00'),formation('VL','12:00')])
    expect(resolveReporting(w,w.formations[0],420).inTime).toBe(-960)
    expect(resolveReporting(w,w.formations[1],720).inTime).toBe(480)
  })
  it('D503 preserves typed-brief date rules and D49 permits equal take-off/landing', () => {
    const f={...formation('VL','12:00'),br:'13:00',ld:'12:00'}
    const issues=reportingIssuesForWave(wave([],[f]))
    expect(issues.map(i=>i.msg)).toEqual(['VL: brief 13:00 is later than take-off 12:00.'])
    f.br='10:00'; expect(reportingIssuesForWave(wave([],[f]))).toEqual([])
  })
})
