import { PEOPLE } from './people'
import { validate, issuedWorld, workSpan } from './validate'
import { shownWarns } from './warnhide'
import { isStandalone } from './waves'
/* =====================================================================
   WEEK INSIGHTS — make sense of the week (load, coverage, conflicts)
   ===================================================================== */
/* WHICH SCHEDULE IT COUNTS (owner D477, D478, 1 Oct 26 — "It should show the latest copy, so if working copy is the only
   copy then it will use that, unless its published then use Original, if theres an AL1 then use AL1 etc."): day by day,
   a published day at its LATEST PUBLISHED version, a day not yet published as the working copy — on every page, for
   every figure below. So the days, the events and the warnings all come from ONE world (validate.ts issuedWorld — what
   View-only Sched draws), never from the working globals: a change waiting on a published day (a seat, a leave, a
   hidden warning) moves nothing here until its amendment is out. Pins: ui/insights-published.test.tsx. */
export function computeInsights(){
  validate();
  const {days:DAYS, evd:EVD, warn:WARN, roster:ROSTER}=issuedWorld();
  let sorties=0,forms=0; const fc:any={}, dayStats:any[]=[];
  /* WORK HOURS (owner, 20 Aug 26 — "perhaps have a section to show everyone's
     work hours in the insights for the week"). Summed off the SAME per-person
     day span the long-work-day note is raised from (`workSpan`, validate.ts),
     read out of EVD, which the `validate()` above has just rebuilt. One
     definition, two readers: a week total that disagreed with the note saying
     a day was long would be the drift-seam docs/feature-impact.md warns about.
     What that span means is worth stating, because it is not "hours airborne":
     it is REPORT → last landing + debrief for a flying day, and start → end
     for anything else, which is the day the squadron actually owes the man. */
  const wm:any={}, wd:any={};
  DAYS.forEach((d:any,di:any)=>{
    let ds=0,df=0;
    /* waves.ts dayCount() is the precedent for what counts as "the day's flying":
       a standalone wave (SC/AVALON/BB) is a handover of the SAME jets across
       shifts, not extra sorties, and a cancelled formation/aircraft never flew.
       Before this, sorties/forms/fc (and idle, which is derived from fc) counted
       both while dayStats.warns/hard — read straight off WARN, which already
       skips cancelled and exempt lines — did not: one object, two rules. */
    (d.waves||[]).forEach((w:any)=>{if(isStandalone(w))return;w.formations.forEach((f:any)=>{if(f.cx)return;forms++;df++;f.aircraft.forEach((a:any)=>{if(a.cx)return;sorties++;ds++;[a.p,a.w].forEach((id:any)=>{if(id)fc[id]=(fc[id]||0)+1;});});});});
    const ev=EVD[di]||{};
    Object.keys(ev).forEach((id:any)=>{
      const w=workSpan(ev[id]); if(!w)return;
      wm[id]=(wm[id]||0)+w.span; wd[id]=(wd[id]||0)+1;
    });
    const dw=shownWarns(WARN.byDay[di]&&WARN.byDay[di].warns);   /* a hidden warning is not counted (owner D472, 1 Oct 26) — by the hides that version went out with (D477) */
    dayStats.push({dow:d.dow,ac:ds,forms:df,warns:dw.length,hard:dw.filter((x:any)=>x.sev==='hard').length});
  });
  const flyers=Object.keys(fc).map((id:any)=>({id,n:fc[id]})).sort((a:any,b:any)=>b.n-a.n||PEOPLE[a.id].cs.localeCompare(PEOPLE[b.id].cs));
  /* who is NOT flying, out of the roster those days went out with — never today's list of people: a man added or
     archived since a week was published does not move it (issuedWorld's roster; PEOPLE gives the label only) */
  const idle=ROSTER.filter((id:any)=>PEOPLE[id]&&!fc[id]).sort((a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs));
  const shown=shownWarns(WARN.all), byType:any={}; shown.forEach((w:any)=>byType[w.code]=(byType[w.code]||0)+1);
  /* EVERYONE who has a scheduled hour, longest first — a load picture, so the
     name at the top is the one to look at. `PEOPLE[id]` is guarded because EVD
     is keyed by whatever the day's events carry; the flying list beside it
     makes the same assumption on ids that come from crewed seats. */
  const csOf=(id:any)=>PEOPLE[id]?PEOPLE[id].cs:String(id);
  const hours=Object.keys(wm).map((id:any)=>({id,mins:wm[id],days:wd[id]}))
    .sort((a:any,b:any)=>b.mins-a.mins||csOf(a.id).localeCompare(csOf(b.id)));
  /* the week's two totals, for the window's tile — counted here so the tile and the lists read one world */
  return {sorties,forms,flyers,idle,byType,dayStats,hours,issues:shown.length,hard:shown.filter((w:any)=>w.sev==='hard').length};
}
