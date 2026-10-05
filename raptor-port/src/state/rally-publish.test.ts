import { beforeEach,afterEach,describe,expect,it,vi } from 'vitest'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, publishALDay, alIssue, dayApproved } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { initStore } from './store'
import { setSession } from './auth'
import { commitSetDayApproved,commitPublishALDay,schedWrite,SCHED_TYPES } from './sched-commit'
import { onCommit } from '../command'
import { histSnap } from './history'
import { reportingIssuesForDay } from '../engine/reporting'
import { validate,workingWarn } from '../engine/validate'

const saved=JSON.stringify(DAYS), savedBook=JSON.stringify(SCHED);
const sign=(di=0)=>Object.assign(signOf(di),{cur:'ignite',sked:'bane',plan:'stiff',appr:'pump'});
const bad=()=>DAYS[0].waves[0].intimes=['09:00 IN TIME','10:15 RALLY'];
let off:()=>void, envelopes:any[], toast:any;
const snap=()=>JSON.stringify({days:DAYS,book:SCHED,hist:histSnap()});
beforeEach(()=>{
  DAYS.splice(0,DAYS.length,...JSON.parse(saved));
  Object.keys(SCHED).forEach(k=>delete SCHED[k]);Object.assign(SCHED,JSON.parse(savedBook));
  Object.assign(SCHED,{pending:{},changes:{},added:{},als:[],al:0,dayOK:{},sign:{},signBind:{},orig:{},cur:{},drafts:{},curDraft:{},correcting:{}});
  DAYS.forEach((d:any)=>{d.waves=[]});
  DAYS[0].waves=[{label:'FIRST WAVE',intimes:['08:00 IN TIME','09:00 RALLY'],formations:[{cs:'VL',to:'12:00',ld:'13:00',br:'10:00',aircraft:[]}]}];
  setSession({user:'ad',role:'admin'});initStore();envelopes=[];off=onCommit(e=>envelopes.push(e));
  toast=vi.spyOn(HOOKS,'toast').mockImplementation(()=>{});
});
afterEach(()=>{off();vi.restoreAllMocks();DAYS.splice(0,DAYS.length,...JSON.parse(saved));Object.keys(SCHED).forEach(k=>delete SCHED[k]);Object.assign(SCHED,JSON.parse(savedBook));});

const orderWarn=(s:any)=>expect(s?.byDay?.warns).toEqual(expect.arrayContaining([expect.objectContaining({code:'REPORT_ORDER',sev:'hard'})]));
const workingOrder=()=>{validate();expect(workingWarn().byDay[0].warns).toEqual(expect.arrayContaining([expect.objectContaining({code:'REPORT_ORDER',sev:'hard'})]));};
const noRefusal=()=>expect(toast.mock.calls.flat().join(' ')).not.toContain('Cannot publish');

describe('RT6 D509 publication retains incorrect timing as a warning',()=>{
  it('engine first publish succeeds with the working and issued red warning',()=>{
    bad();sign();workingOrder();setDayApproved(0,true);
    expect(dayApproved(0)).toBe(true);orderWarn(SCHED.orig[0].w);workingOrder();noRefusal();
  });
  it('command first publish emits its boundary with the warning, then a correction issues normally',()=>{
    schedWrite(SCHED_TYPES.text,bad,{key:'it:0.0'});sign();envelopes.length=0;
    commitSetDayApproved(0,true);expect(dayApproved(0)).toBe(true);orderWarn(SCHED.orig[0].w);
    expect(envelopes.at(-1).boundary.kind).toBe('publish');
    schedWrite(SCHED_TYPES.text,()=>{DAYS[0].waves[0].intimes=['09:00 IN TIME','10:00 RALLY']},{key:'it:0.0'});sign();
    commitPublishALDay(0);expect(SCHED.als).toHaveLength(1);
    expect(SCHED.als[0].snap.w.byDay.warns.some((w:any)=>w.code==='REPORT_ORDER')).toBe(false);
    expect(envelopes.at(-1).boundary.kind).toBe('publish');
    noRefusal();
  });
  it('AL wrapper reconciles stale marks and issues the warning without changing the original',()=>{
    sign();commitSetDayApproved(0,true);const issued=JSON.stringify(SCHED.orig[0]);
    schedWrite(SCHED_TYPES.text,bad,{key:'it:0.0'});sign();
    SCHED.pending['dn:0.999']=1;envelopes.length=0;
    commitPublishALDay(0);expect(envelopes.at(-1).boundary.kind).toBe('publish');
    expect(JSON.stringify(SCHED.orig[0])).toBe(issued);expect(SCHED.als).toHaveLength(1);
    expect(SCHED.pending['dn:0.999']).toBeUndefined();orderWarn(SCHED.als[0].snap.w);workingOrder();noRefusal();
  });
  it('raw engine AL correcting reissue succeeds independently of shown warnings',()=>{
    sign();setDayApproved(0,true);bad();sign();SCHED.pending['it:0.0']=1;SCHED.correcting[0]=true;
    publishALDay(0);expect(SCHED.als).toHaveLength(1);orderWarn(SCHED.als[0].snap.w);workingOrder();noRefusal();
  });
  it('final issue door mints a warning-bearing correcting issue',()=>{
    sign();setDayApproved(0,true);bad();sign();SCHED.pending['it:0.0']=1;SCHED.correcting[0]=true;
    const result=alIssue(0);expect(result.id).not.toBe('');expect(result.seq).toBe(1);
    orderWarn(SCHED.als[0].snap.w);noRefusal();
  });
  it('raw engine AL assigns an imported row its ordinary identity while issuing',()=>{
    sign();setDayApproved(0,true);bad();
    DAYS[0].waves[0].formations.push({cs:'RU',to:'14:00',ld:'15:00',br:'12:00',aircraft:[]});sign();
    publishALDay(0);expect(SCHED.als).toHaveLength(1);orderWarn(SCHED.als[0].snap.w);
    expect(DAYS[0].waves[0].formations[1].rid).toBeTruthy();noRefusal();
  });
  it('both an invalid and a valid neighbouring day publish',()=>{
    bad();sign();sign(1);setDayApproved(0,true);setDayApproved(1,true);
    expect(dayApproved(0)).toBe(true);expect(dayApproved(1)).toBe(true);orderWarn(SCHED.orig[0].w);noRefusal();
  });
  it('optional missing clocks are not a new mandatory-stage publication rule',()=>{
    DAYS[0].waves[0].intimes=['25:90 IN TIME','RALLY AFTER IN'];
    expect(reportingIssuesForDay(DAYS[0]).every(i=>!i.blocking)).toBe(true);
    sign();setDayApproved(0,true);expect(dayApproved(0)).toBe(true);
  });
  it('member command access remains denied even with valid reporting',()=>{
    sign();setSession({user:'ignite',role:'member'});const before=snap();
    commitSetDayApproved(0,true);expect(snap()).toBe(before);expect(dayApproved(0)).toBe(false);
  });
});
