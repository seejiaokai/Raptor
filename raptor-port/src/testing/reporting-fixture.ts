/* D502 test precondition only. Legacy reference data has IN after implied B.
   Publication/history tests need a VALID schedule before exercising issuance.
   Call once BEFORE their baseline clones; never call after the action under test.
   Production/reference seed and actual Rally/wrong-pair regression fixtures stay intact. */
import { DAYS } from '../engine/data'
import { flightBrief, intimeTime, parseReportingLines } from '../engine/reporting'
import { hm24, parseHM } from '../engine/time'

export function validReportingFixture(){
  DAYS.forEach((d:any)=>(d.waves||[]).forEach((w:any)=>{
    if(w.standalone)return;
    const parsed=parseReportingLines(w);
    w.intimes=(w.intimes||[]).map((line:string,index:number)=>{
      const p=parsed[index]; if(p.clock==null||p.activities.includes('rally'))return line;
      const affected=(w.formations||[]).filter((f:any)=>!f.cx&&(!p.targets.length||p.targets.some(t=>t.toLowerCase()===String(f.cs||'').trim().toLowerCase())));
      const limits=affected.map((f:any)=>{
        const to=parseHM(f.to); if(to==null)return null;
        const report=p.clock!>to?p.clock!-1440:p.clock!;
        const brief=flightBrief(f,to);
        return report>brief?brief:null;
      }).filter((t:any)=>t!=null);
      if(!limits.length)return line;
      const brief=Math.min(...limits);
      // D503: a later clock is already valid on the prior day; preserve it.
      let changed=false;
      return line.replace(/(^|[^A-Za-z0-9])(?:(\d{1,2}):(\d{2})|(\d{3,4}))(\s*[HLhl]?)(?![A-Za-z0-9])/g,
        (all,lead,ch,cm,d4,suf)=>{
          if(changed||intimeTime(all)==null)return all;
          changed=true;const clock=hm24(brief);return lead+(ch!=null?clock:clock.replace(':',''))+suf;
        });
    });
  }));
}
