import { DAYS } from './data'
import { PEOPLE } from './people'
import { validate, WARN, EVD, workSpan } from './validate'
import { isStandalone } from './waves'
/* =====================================================================
   WEEK INSIGHTS — make sense of the week (load, coverage, conflicts)
   ===================================================================== */
export function computeInsights(){
  validate();
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
    const dw=(WARN.byDay[di]&&WARN.byDay[di].warns)||[];
    dayStats.push({dow:d.dow,ac:ds,forms:df,warns:dw.length,hard:dw.filter((x:any)=>x.sev==='hard').length});
  });
  const flyers=Object.keys(fc).map((id:any)=>({id,n:fc[id]})).sort((a:any,b:any)=>b.n-a.n||PEOPLE[a.id].cs.localeCompare(PEOPLE[b.id].cs));
  const idle=Object.keys(PEOPLE).filter((id:any)=>!PEOPLE[id].archived&&!PEOPLE[id].pers&&!fc[id]).sort((a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs));
  const byType:any={}; WARN.all.forEach((w:any)=>byType[w.code]=(byType[w.code]||0)+1);
  /* EVERYONE who has a scheduled hour, longest first — a load picture, so the
     name at the top is the one to look at. `PEOPLE[id]` is guarded because EVD
     is keyed by whatever the day's events carry; the flying list beside it
     makes the same assumption on ids that come from crewed seats. */
  const csOf=(id:any)=>PEOPLE[id]?PEOPLE[id].cs:String(id);
  const hours=Object.keys(wm).map((id:any)=>({id,mins:wm[id],days:wd[id]}))
    .sort((a:any,b:any)=>b.mins-a.mins||csOf(a.id).localeCompare(csOf(b.id)));
  return {sorties,forms,flyers,idle,byType,dayStats,hours};
}
