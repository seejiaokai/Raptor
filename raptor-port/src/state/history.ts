import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { logAction } from '../engine/editlog'
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
/* `dr`/`cd` carry SCHED.drafts and SCHED.curDraft (engine/drafts.ts) — the
   per-day alternate blobs and which one the live day is. In the snapshot for
   the same reason the AL records are: a duplicate or a draft switch is one
   ordinary undo step, and undoing past it must bring the blobs back too. */
export function histSnap(){return JSON.stringify({d:DAYS,i:INPUTS,c:SCHED.changes,p:SCHED.pending,ad:SCHED.added,a:SCHED.als,al:SCHED.al,ok:SCHED.dayOK,sg:SCHED.sign,o:SCHED.orig,cv:SCHED.cur,dr:SCHED.drafts,cd:SCHED.curDraft});}
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
  SCHED.changes=s.c||{}; SCHED.pending=s.p||{}; SCHED.added=s.ad||{}; SCHED.als=s.a||[];
  SCHED.al=s.al||0; SCHED.dayOK=s.ok||{};
  SCHED.sign=s.sg||{};
  SCHED.orig=s.o||{};
  SCHED.cur=s.cv||{};   // stale entries are inert — dayCurVer self-heals
  SCHED.drafts=s.dr||{}; SCHED.curDraft=s.cd||{};
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
/* Undo and redo are logged, and they do NOT erase what they undo.
   histSnap() deliberately does not carry the edit log, so an undo restores
   the schedule and leaves the record of how it got that way standing — a log
   you can rewrite by pressing undo is not a log. Without these two lines the
   list would show an edit whose value has since silently reverted, with
   nothing to say why; with them it reads the way it happened. */
export function undo(){ if(HIST.ix<=0)return toast('Nothing to undo'); histApply(HIST.ix-1); logAction(null,'Undo'); toast('Undo'); }
export function redo(){ if(HIST.ix>=HIST.stack.length-1)return toast('Nothing to redo'); histApply(HIST.ix+1); logAction(null,'Redo'); toast('Redo'); }
