/* ---- THE LOADABLE WEEKS ----
   The week selector (the .wk chips) switches between loaded weeks now (owner,
   21 Aug 26). `weekBundle(v)` hands state/store.ts:loadWeek a FRESH DEEP COPY
   of the chosen week's model each call — the live DAYS/INPUTS get spliced in
   place, so the backing datasets here must never be handed out directly.
     · 13/07/2026 → the seed week (from the pristine week-1 snapshots)
     · 20/07/2026 → the authored second week (engine/week2.ts)
     · anything else → a blank, editable week — 7 bare Mon..Sun days a scheduler
       can start filling in (the owner's end-state: click ahead to a future week
       and build it; cross-week persistence is the later, server-side step).
   A leaf module: imports data/inputs/week2 only, so it introduces no cycle. */
import { WEEK1_DAYS_SNAP } from './data'
import { WEEK1_INPUTS_SNAP, WEEK1_DATES } from './inputs'
import { WEEK2_DAYS, WEEK2_DATES, WEEK2_INPUTS } from './week2'

const DOW=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* days in month, leap-year aware — a pure walker so no Date/timezone enters */
function dim(m:number,y:number){return [31,(y%4===0&&(y%100!==0||y%400===0))?29:28,31,30,31,30,31,31,30,31,30,31][m-1];}
/* seven 'Mon DD' labels from a dd/mm/yyyy week-start value */
function weekLabels(v:any){
  const parts=String(v).split('/').map((x:any)=>parseInt(x,10));
  let d=parts[0]||1,m=parts[1]||1,y=parts[2]||2026; const out:any[]=[];
  for(let i=0;i<7;i++){out.push(`${MON[m-1]} ${d}`); d++; if(d>dim(m,y)){d=1;m++;if(m>12){m=1;y++;}}}
  return out;
}
/* a blank week: every day section present-but-empty (exactly the seed weekend's
   shape) so dayCount/dayKeys never hit a hole, and the edit flow can add waves
   and lines to it like any other week */
export function emptyWeek(v:any){
  const labels=weekLabels(v);
  const days=labels.map((dt:any,i:number)=>({dow:DOW[i],dt,wc:'0 X 0 X 0',notes:[],allhands:[],waves:[],sims:{amt:[],oft:[]},dutywaves:[],ground:[]}));
  return {days,dates:labels.slice(),inputs:[],seedSans:false};
}
export function weekBundle(v:any){
  if(v==='13/07/2026') return {days:JSON.parse(WEEK1_DAYS_SNAP), dates:WEEK1_DATES.slice(), inputs:JSON.parse(WEEK1_INPUTS_SNAP), seedSans:true};
  if(v==='20/07/2026') return {days:JSON.parse(JSON.stringify(WEEK2_DAYS)), dates:WEEK2_DATES.slice(), inputs:JSON.parse(JSON.stringify(WEEK2_INPUTS)), seedSans:false};
  return emptyWeek(v);
}
/* PERSONAL INPUTS ARE GLOBAL, NOT WEEK-SCOPED (owner, 22 Aug 26 — "show all
   inputs regardless of which week I am selected on"). The module-load INPUTS is
   week 1's; this hands boot every OTHER authored week's inputs to merge in once,
   so the Inputs page carries them all while date-matching still scopes each
   week's SCHEDULE to its own. A fresh deep copy — the backing dataset is never
   handed out live. Blank/other weeks contribute nothing. */
export function otherWeekInputs(){ return JSON.parse(JSON.stringify(WEEK2_INPUTS)); }
