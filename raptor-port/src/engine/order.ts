import { parseHM } from './time'
/* duty display order: SDO, then SXO, then OPS-O, then anything else. Moved
   out of ui/html.ts alongside groundOrder (8 Aug 26) — engine/reorder.ts's
   sortDutyBlock needs this table to sort a duty block itself, and the
   engine must not import from ui/. */
export const DUTY_ORDER:any={'SDO':0,'SXO':1,'OPS-O':2,'OPS O':2,'RUNNER':3,'LOGCELL':4,'LOG CELL':4};
/* Render-time ordering for the day's Ground Programme. It lived in ui/html.ts
   until the board learned to reorder rows (8 Aug 26): engine/reorder.ts has to
   freeze the order a scheduler can SEE before it moves anything within it, and
   the engine must not import from ui/. Pure — parseHM and nothing else.
   `man`: this day's list has been reordered by hand, so the time sort stands
   down and the model order IS the order (owner, 8 Aug 26).

   Ground Programme reads in start-time order (owner, Aug 26) — but ONLY at
   render. ri is the row's slot key (g:di.ri / gr:di.ri) and pending marks, AL
   colouring and published amendments all address through it, so the MODEL
   array is never reordered; each entry keeps its original index for key
   building. parseHM reads both the seed's '1020' and accept's '10:20' forms.
   Time-less rows (all-day accepts, fresh "+ Item" blanks) sink to the bottom —
   which is also where the model appends them, so a new row never jumps away
   from under the scheduler typing into it. Ties keep model order; the
   explicit fallback matters because Infinity-Infinity is NaN, which sort
   treats as "equal" inconsistently. */
export function groundOrder(grd:any[],man?:any){
  const rows=grd||[];
  const ix=rows.map((row:any,ri:number)=>({row,ri}));
  if(man)return ix;
  return ix.sort((a:any,b:any)=>{
    const ta=parseHM(a.row.str), tb=parseHM(b.row.str)
    if(ta==null||tb==null)return ta==null&&tb==null?a.ri-b.ri:(ta==null?1:-1)
    return (ta-tb)||(a.ri-b.ri)
  })
}

/* ===== the SCHEDULE SECTION ORDER (owner, 29 Aug 26) ==========================
   The owner can re-arrange the big schedule sections per day — on Edit Schedule
   and the Scheduler Board — and a saved whole-day template remembers it.

   This is a pure DISPLAY order and NOTHING ELSE. It is the render sequence the
   two builders (ui/html.ts dayHTML, ui/board.ts boardHTML) emit their section
   panels in — it is never a slot key, never part of SCHED.*, and never an AL
   amendment. Reordering a section moves NO row inside any array, so every
   di.gi.li.ai / d: / s: / g: / a: key, and everything the validator, publish/AL,
   edit log, week-stash and Leave-War sync read, is byte-identical before and
   after. That orthogonality is the whole reason the owner's "don't corrupt the
   rules" requirement is met — keep secOrder out of the key grammar and out of
   SCHED.*. It rides undo and week navigation for free because history.ts:histSnap
   and weekstash both serialise DAYS wholesale (the d.gman precedent, reorder.ts).
   Its one write path is state/store.ts:moveSection (histPush + notify, no
   markEdit). Persistence of a chosen order is via the DAY TEMPLATE
   (engine/daytpl.ts), not localStorage of the live day — session-only like the
   rest of the schedule model. */
/* 'prog' is the Programme unit (day notes + Common/Ground Programme — one panel
   on Edit Schedule, the notes + prog panels moved together on the board). */
export const SECTIONS:string[]=['prog','waves','duty','sims','ground'];

/* the day's section order: its own arrangement first (unknown keys dropped),
   then any canonical section it did not list, appended in default order so the
   list is robust if SECTIONS ever grows. An absent/empty d.secOrder yields the
   plain canonical order, so a pristine day — and the read-only reference — render
   exactly as they did before this feature (parity stays 728/0). */
export function secOrder(d:any):string[]{
  const raw=(d&&Array.isArray(d.secOrder))?d.secOrder:[];
  const seen=new Set<string>(); const out:string[]=[];
  for(const k of raw)if(typeof k==='string'&&SECTIONS.indexOf(k)>=0&&!seen.has(k)){seen.add(k);out.push(k);} // stored order, unknowns and repeats dropped
  for(const k of SECTIONS)if(!seen.has(k))out.push(k);                                                     // then any section it didn't list
  return out;
}

/* move one section up (dir<0) or down (dir>0) in this day's order. A PURE model
   mutation — the caller does the histPush + notify (state/store.ts:moveSection);
   no markEdit, because layout is not an amendment. Returns false on a no-op (a
   section already at the end it is nudged toward, or a key not in the set).
   Materialises d.secOrder from the resolved order on the first move, so the day
   carries a full, sanitised list from then on. */
export function moveSectionModel(d:any,key:string,dir:number):boolean{
  if(!d)return false;
  const cur=secOrder(d);
  const from=cur.indexOf(key);
  if(from<0)return false;
  const to=from+(dir<0?-1:1);
  if(to<0||to>=cur.length)return false;
  const next=cur.slice();
  next.splice(to,0,next.splice(from,1)[0]);
  d.secOrder=next;
  return true;
}
