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

describe('RT6 D502 real publication refuses incorrect timing atomically',()=>{
  it('engine first publish rejects a signed, uncrewed invalid formation without changing any state',()=>{
    bad();sign();const before=snap();setDayApproved(0,true);
    expect(snap()).toBe(before);expect(dayApproved(0)).toBe(false);
    expect(toast.mock.calls.at(-1)[0]).toContain('rally 10:15 is later than brief 10:00');
  });
  it('command first publish rejects without envelope/boundary, then correction publishes',()=>{
    schedWrite(SCHED_TYPES.text,bad,{key:'it:0.0'});sign();envelopes.length=0;
    const before=snap();commitSetDayApproved(0,true);
    expect(snap()).toBe(before);expect(envelopes).toEqual([]);
    schedWrite(SCHED_TYPES.text,()=>{DAYS[0].waves[0].intimes=['09:00 IN TIME','10:00 RALLY']},{key:'it:0.0'});sign();
    commitSetDayApproved(0,true);expect(dayApproved(0)).toBe(true);
    expect(envelopes.at(-1).boundary.kind).toBe('publish');
  });
  it('AL wrapper gates before stale-mark reconciliation and retains the issued copy and signatures',()=>{
    sign();commitSetDayApproved(0,true);const issued=JSON.stringify(SCHED.orig[0]);
    schedWrite(SCHED_TYPES.text,bad,{key:'it:0.0'});sign();
    // A stale dotted mark must survive refusal too; reconciliation is an issuance action.
    SCHED.pending['dn:0.999']=1;envelopes.length=0;const before=snap();
    commitPublishALDay(0);expect(snap()).toBe(before);expect(envelopes).toEqual([]);
    expect(JSON.stringify(SCHED.orig[0])).toBe(issued);expect(SCHED.als).toHaveLength(0);
  });
  it('engine AL and final issue backstop reject independently of shown warnings',()=>{
    sign();setDayApproved(0,true);bad();sign();SCHED.pending['it:0.0']=1;SCHED.correcting[0]=true;
    const before=snap();publishALDay(0);expect(snap()).toBe(before);
    expect(alIssue(0)).toEqual({seq:0,id:'',sign:{},count:0});expect(snap()).toBe(before);
  });
  it('raw engine AL timing guard refuses before minting a fresh imported row',()=>{
    sign();setDayApproved(0,true);bad();
    DAYS[0].waves[0].formations.push({cs:'RU',to:'14:00',ld:'15:00',br:'12:00',aircraft:[]});sign();
    const before=snap();publishALDay(0);expect(snap()).toBe(before);
    expect(DAYS[0].waves[0].formations[1].rid).toBeUndefined();
  });
  it('invalid day does not prevent a valid neighbouring day publishing',()=>{
    bad();sign();sign(1);setDayApproved(0,true);setDayApproved(1,true);
    expect(dayApproved(0)).toBe(false);expect(dayApproved(1)).toBe(true);
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
