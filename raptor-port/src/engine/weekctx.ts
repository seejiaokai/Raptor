/* CROSS-WEEK SEED READS for validate.ts (owner ask: the warnings engine reads
   continuously across week boundaries — a 7-day run and a Sunday-into-Monday
   rest bust must both be caught, not just what fits inside the loaded week).
   Everything here is a PURE READ off weekBundle(v) + the global (date-keyed)
   INPUTS array — nothing here mutates SCHED, DAYS, or INPUTS.

   WINDOW SEMANTICS: lookback only, and bounded — up to VCONF.maxRun days
   before the loaded week's Monday for the consecutive-days run (seedRunIn),
   1 day for crew rest (prevSundaySeed). The one exception, already built into
   buildDay's own tails (events.ts) and NOT duplicated here, is the sliver of
   LOOKAHEAD past midnight: a Sunday sortie/shift that runs past 23:59 reaches
   into next Monday's inputs. Every flag still lands on the day it breaks —
   next Monday's own rest bust fires when next week is loaded and validated,
   seeded by THIS week's Sunday through prevSundaySeed.

   WHAT A NON-LOADED WEEK CANNOT BE MADE TO ANSWER: `weekBundle(v)` (see its
   own comment in weeks-data.ts) hands back the week's SEED/authored shape
   only — SCHED (publish/amendment state) and any session edit made to a week
   after leaving it do not exist to be read, because the app itself forgets
   them the same way (loadWeek's own doctrine — "Personal INPUTS are GLOBAL"
   in CLAUDE.md is the one deliberate exception, and INPUTS is read live here,
   not off the bundle). A seed read is therefore only ever as good as what the
   app still remembers of that week, which is exactly what a scheduler sees on
   navigating back to it — nothing is invented and nothing is silently wrong. */
import { weekBundle, shiftWeekKey } from './weeks-data'
import { buildDay } from './events'
import { INPUTS, inputCoversDate, isPersonal } from './inputs'
import { PEOPLE, isSpecial } from './people'

/* weekBundle(v) is a pure function of v for the two authored weeks and a
   fresh-but-identical blank for everything else (weeks-data.ts) — so caching
   it by key is pure perf, never a drift seam: nothing INPUTS-dependent is
   cached here, only the bundle's own days/dates shape. Module-level and never
   cleared — the set of weeks ever asked for in one session is small. */
const bundleCache:any={};
function bundle(v:any){ if(!(v in bundleCache))bundleCache[v]=weekBundle(v); return bundleCache[v]; }

/* WHICH ids counted as "on the programme" for one bundle day — the seed-side
   mirror of the two things that put a body on RUNLEN's on-set for a LOADED
   day (validate.ts): (1) an actual event (fly/shift/duty/sim/ground/prog —
   buildDay's own `events`), filtered EXACTLY as RUNLEN's `on` set is
   (`PEOPLE[e.id]&&!isSpecial(e.id)`); (2) a personal ACTIVITY input that
   would have auto-landed onto that day's ground programme had this been the
   loaded week (autoAcceptInput, slots.ts: `isPersonal(row.type)` on a
   date-matching row) — because on a NON-loaded week that landing never
   actually happens (no live DAYS to land it onto), so without this half a
   filed activity input would silently not count as work. Two of
   autoAcceptInput's own guards are deliberately NOT mirrored: `row.acc`,
   because that flag records the LOADED week's landing only (loadWeek clears
   every acc and re-lands from scratch — an input spanning the boundary that
   is accepted on the loaded side must still count as work on the seed side,
   and the Set dedups it against any authored ground row); and dayApproved,
   which is publish state that per the file header does not exist to be read
   for a non-loaded week. xweek:true on buildDay bypasses the accepted-row dedup in inpShow
   (events.ts) — irrelevant to workedSet, which never reads day.input, but
   passed for the one buildDay contract every caller here shares. */
function workedSet(day:any,ix:any){
  const built=buildDay(day,ix,null,null,true);
  const ids=new Set<any>();
  (built.events||[]).forEach((e:any)=>{ if(e.id&&PEOPLE[e.id]&&!isSpecial(e.id))ids.add(e.id); });
  INPUTS.forEach((inp:any)=>{
    if(!isPersonal(inp.type))return;
    if(!inputCoversDate(inp,day.dt))return;
    const id=inp.person;
    if(id&&PEOPLE[id]&&!isSpecial(id))ids.add(id);
  });
  return ids;
}

/* CONSECUTIVE-DAYS SEED — per-person count of days worked immediately
   BEFORE the loaded week's Monday, walking back day by day from the
   previous week's Sunday, up to `maxRun` days (RUNLEN only needs to know
   whether a run is already AT the limit walking in, so it never needs to
   walk further than the limit itself). k=1 is the nearest day (prev Sunday),
   k=7 its Monday, k=8..14 (only reached when maxRun>7) walk into the week
   before that. A person absent on a NEARER day (smaller k) must stop
   counting even if they show up on a FARTHER one — `done` enforces that —
   and since only ids present at k=1 can possibly have a run touching the
   boundary, only those are ever tracked at all. */
export function seedRunIn(curWeek:any,maxRun:any){
  const prevKey=shiftWeekKey(curWeek,-1);
  const prevBundle=bundle(prevKey);
  let prevPrevBundle:any=null;
  const counts:any={};
  const done=new Set<any>();
  for(let k=1;k<=maxRun;k++){
    let day:any,ix:any;
    if(k<=7){ ix=7-k; day=prevBundle.days[ix]; }
    else{
      if(!prevPrevBundle)prevPrevBundle=bundle(shiftWeekKey(curWeek,-2));
      ix=14-k; day=prevPrevBundle.days[ix];
    }
    if(!day)break;
    const worked=workedSet(day,ix);
    if(k===1){
      worked.forEach((id:any)=>{ counts[id]=1; });
    }else{
      Object.keys(counts).forEach((id:any)=>{
        if(done.has(id))return;
        if(worked.has(id))counts[id]++; else done.add(id);
      });
    }
  }
  return counts;
}

/* CREW-REST SEED FOR THE LOADED WEEK'S MONDAY — the previous week's Sunday,
   built the same shape as a real `ev[idx-1]` entry (validate.ts's own
   per-day accumulator) so the crew-rest block can read it with no branch of
   its own: `{events,input,dow,di:null}`. `di:null` rather than a real index
   because this day belongs to a week that was never validated — nothing
   should ever markTrace or write REST against it, and `di:null` is already
   the guarded no-op case in both (see validate.ts markTrace / w.prevDi
   consumers). Tails (nx/pv) are irrelevant here and passed null: the
   crew-rest scan reads only `ev[idx-1].events`/`.input`, never another day's
   nx/pv tail entries. */
export function prevSundaySeed(curWeek:any){
  const prevBundle=bundle(shiftWeekKey(curWeek,-1));
  const day=prevBundle.days[6];
  const built=buildDay(day,6,null,null,true);
  return {events:built.events,input:built.input,dow:built.dow,di:null};
}
