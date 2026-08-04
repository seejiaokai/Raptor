import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { armDrop, prunePreviews } from './view'

const toast=(...a:any[])=>HOOKS.toast(...a)
const reflow=()=>HOOKS.reflow()
const syncHistBtns=()=>HOOKS.syncHistBtns()
/* =====================================================================
   UNDO / REDO — snapshot stack over DAYS + the amendment bookkeeping
   ===================================================================== */
export const HIST:any={stack:[],ix:-1,lock:false,cap:60};
/* `ok` carries SCHED.dayOK — the per-day publish state. It replaced the old
   week-wide ap/dr pair, so publishing or reopening a single day is an ordinary
   undo step. */
export function histSnap(){return JSON.stringify({d:DAYS,i:INPUTS,c:SCHED.changes,p:SCHED.pending,a:SCHED.als,al:SCHED.al,ok:SCHED.dayOK,sg:SCHED.sign,o:SCHED.orig,cv:SCHED.cur});}
export function histInit(){HIST.stack=[histSnap()];HIST.ix=0;syncHistBtns();}
export function histPush(){
  if(HIST.lock)return;
  const s=histSnap();
  if(HIST.stack[HIST.ix]===s)return;
  HIST.stack.splice(HIST.ix+1);
  HIST.stack.push(s);
  if(HIST.stack.length>HIST.cap)HIST.stack.shift();
  HIST.ix=HIST.stack.length-1;
  syncHistBtns();
}
export function histApply(i:any){
  if(i<0||i>=HIST.stack.length)return;
  const s=JSON.parse(HIST.stack[i]);
  HIST.ix=i; HIST.lock=true;
  DAYS.length=0; s.d.forEach((x:any)=>DAYS.push(x));
  INPUTS.length=0; (s.i||[]).forEach((x:any)=>INPUTS.push(x));
  SCHED.changes=s.c||{}; SCHED.pending=s.p||{}; SCHED.als=s.a||[];
  SCHED.al=s.al||0; SCHED.dayOK=s.ok||{};
  SCHED.sign=s.sg||{};
  SCHED.orig=s.o||{};
  SCHED.cur=s.cv||{};   // stale entries are inert — dayCurVer self-heals
  /* the model has just been swapped wholesale — an armed slot may now point at a
     wave, row or aircraft that no longer exists. The arm strip stayed on screen
     and the next tap threw "Cannot read properties of undefined" out of flyRef
     and planted nobody. Put the slot down before anything re-renders. */
  armDrop();
  /* same class of stale pointer: a day previewing an AL that the undo just
     un-published would render the live day while claiming to show history */
  prunePreviews();
  reflow();
  HIST.lock=false;
  syncHistBtns();
}
export function undo(){ if(HIST.ix<=0)return toast('Nothing to undo'); histApply(HIST.ix-1); toast('Undo'); }
export function redo(){ if(HIST.ix>=HIST.stack.length-1)return toast('Nothing to redo'); histApply(HIST.ix+1); toast('Redo'); }
