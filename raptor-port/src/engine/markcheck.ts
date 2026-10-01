/* EVERY MARK HAS ITS WARNING — the invariant a hidden warning stands on ([WARN-HIDE-KEPT], owner D469, 1 Oct 26; Fable's
   plan read F5). The validator writes a puck's ring, chip and dash beside the warning that raises them, and since this
   build each mark names that warning's CODE (engine/validate.ts `marks`, `traces`); validate.ts shownOf drops a mark
   when no SHOWN warning of that day and code names that man. A mark filed under the WRONG code would lose its flag
   silently — and only once some OTHER warning on the week is hidden — so nothing on a week with no hides would ever
   show it.
   This is the check for it: the marks of one raw bundle that no warning of their own day and code names, and the
   next-day marks whose warning is not there, word for word. Empty = sound. A pure function with no imports, so the
   test setup can load it into every test file without loading the engine (src/testing/marks-guard.ts runs it after
   EVERY validate() of the whole suite — so every fixture any test builds is checked, not only the demo weeks). */
export function markOrphans(raw:any):string[]{
  const out:string[]=[]; if(!raw||!raw.marks)return out;
  const warns=(di:any)=>(((raw.byDay||[])[di]||{}).warns||[]) as any[];
  (raw.marks as any[]).forEach((m:any)=>{
    if(!m.code){ out.push(`mark ${m.k}=${m.v} on day ${m.di} for ${m.id} names no warning code`); return; }
    if(!warns(m.di).some((w:any)=>w.code===m.code&&(w.who||[]).includes(m.id)))
      out.push(`mark ${m.k}=${m.v} on day ${m.di} for ${m.id} is filed under ${m.code}, but no ${m.code} warning of that day names him`);
  });
  ((raw.traces||[]) as any[]).forEach((t:any)=>{ const w=t.w;
    if(!w){ out.push(`next-day mark on day ${t.pdi} for ${t.id} names no warning`); return; }
    if(w.di==null)return;   // it points across the week's edge: its warning is in a week that is not loaded
    if(!warns(w.di).some((x:any)=>x.code===w.code&&(x.who||[]).includes(t.id)&&x.msg===w.msg))
      out.push(`next-day mark on day ${t.pdi} for ${t.id} points at a ${w.code} warning on day ${w.di} that is not there, word for word`);
  });
  return out;}
