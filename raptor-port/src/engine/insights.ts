import { DAYS } from './data'
import { PEOPLE } from './people'
import { validate, WARN } from './validate'
import { isStandalone } from './waves'
/* =====================================================================
   WEEK INSIGHTS — make sense of the week (load, coverage, conflicts)
   ===================================================================== */
export function computeInsights(){
  validate();
  let sorties=0,forms=0; const fc:any={}, dayStats:any[]=[];
  DAYS.forEach((d:any,di:any)=>{
    let ds=0,df=0;
    /* waves.ts dayCount() is the precedent for what counts as "the day's flying":
       a standalone wave (SC/AVALON/BB) is a handover of the SAME jets across
       shifts, not extra sorties, and a cancelled formation/aircraft never flew.
       Before this, sorties/forms/fc (and idle, which is derived from fc) counted
       both while dayStats.warns/hard — read straight off WARN, which already
       skips cancelled and exempt lines — did not: one object, two rules. */
    (d.waves||[]).forEach((w:any)=>{if(isStandalone(w))return;w.formations.forEach((f:any)=>{if(f.cx)return;forms++;df++;f.aircraft.forEach((a:any)=>{if(a.cx)return;sorties++;ds++;[a.p,a.w].forEach((id:any)=>{if(id)fc[id]=(fc[id]||0)+1;});});});});
    const dw=(WARN.byDay[di]&&WARN.byDay[di].warns)||[];
    dayStats.push({dow:d.dow,ac:ds,forms:df,warns:dw.length,hard:dw.filter((x:any)=>x.sev==='hard').length});
  });
  const flyers=Object.keys(fc).map((id:any)=>({id,n:fc[id]})).sort((a:any,b:any)=>b.n-a.n||PEOPLE[a.id].cs.localeCompare(PEOPLE[b.id].cs));
  const idle=Object.keys(PEOPLE).filter((id:any)=>!PEOPLE[id].archived&&!fc[id]).sort((a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs));
  const byType:any={}; WARN.all.forEach((w:any)=>byType[w.code]=(byType[w.code]||0)+1);
  return {sorties,forms,flyers,idle,byType,dayStats};
}
