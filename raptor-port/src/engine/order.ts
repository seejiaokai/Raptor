import { parseHM } from './time'
import { store } from './hooks'
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
/* 'notes' is the day's Overall Notes and 'prog' the Common Programme. On the
   BOARD they are two separate, independently draggable panels (owner, 31 Aug 26 —
   "split them apart"): each renders its own card with its own drag handle. On the
   EDIT WEEK the day notes still print as lines inside the Common Programme block
   (they never had a card of their own there), so the week keeps them in the 'prog'
   slice and its 'notes' slice is empty — which is exactly why the view week and the
   read-only reference stay byte-identical (the empty slice adds nothing, parity
   728/0). Splitting is a display concern only: no slot key, SCHED.* or AL reads a
   section key, so the rules are byte-identical before and after. */
/* The last four keys are the board's CREW WORKING-AID panels — Personal Inputs,
   Available crew, SANS availability, Unavailable — folded into the SAME draggable
   list so the scheduler can arrange the whole board as one (owner, 31 Aug 26 — "one
   list, drag anywhere"). They take effect on the SCHEDULER BOARD only: ui/html.ts's
   week appends these panels separately (they are working aids, and two of them are
   parity-locked on the view week), so their week slice bits are empty and reordering
   them changes nothing there — the same empty-slice mechanism that keeps 'notes'
   byte-identical on the week keeps all four parity-safe (728/0). Being ordinary
   section keys they ride the per-day order, the admin house default and the
   "set default?" snackbar for free; none is a slot key / SCHED.* / AL, so the rules
   read byte-identically before and after (the owner's "don't corrupt the rules"
   guarantee). */
export const SECTIONS:string[]=['notes','prog','waves','duty','sims','ground','inputs','avail','sans','unav'];

/* THE ADMIN-SET DEFAULT SECTION ORDER (owner, 29 Aug 26 pt.2 — "allow the default
   arrangement of a schedule to be configured in admin"). A single GLOBAL fallback:
   a day that has no secOrder of its own renders in THIS order, so an admin sets the
   squadron's house order once instead of arranging every week by hand. It is still
   DISPLAY ONLY — it only reorders the same panels secOrder already reorders, never a
   slot key / SCHED.* / AL — so the rules read byte-identically (the owner's "don't
   corrupt the rules" line, same guarantee as the per-day order above).
   It defaults to the canonical SECTIONS, so an un-customised squadron — and the
   read-only reference, which never boots this loader — stay byte-identical (parity
   728/0). Persisted like the wave-hide set (engine/wavetpl.ts): store key
   'secdefault', written null while it equals canonical, sanitised on load because
   localStorage is hand-editable. A day's OWN secOrder still wins over this — an
   explicitly-arranged day keeps its arrangement; only un-arranged days follow the
   house default (see secOrder below). */
let SEC_DEFAULT:string[]=SECTIONS.slice();
/* keep only known section keys, no repeats, then append any canonical section the
   input left out — so the stored default is always a full, valid list. */
function cleanSecList(order:any):string[]{
  const seen=new Set<string>(); const out:string[]=[];
  if(Array.isArray(order))for(const k of order)if(typeof k==='string'&&SECTIONS.indexOf(k)>=0&&!seen.has(k)){seen.add(k);out.push(k);}
  for(const k of SECTIONS)if(!seen.has(k))out.push(k);
  return out;
}
function isCanonicalSec(o:string[]):boolean{return o.length===SECTIONS.length&&o.every((k,i)=>k===SECTIONS[i]);}
export function secDefault():string[]{return SEC_DEFAULT.slice();}
export function setSecDefault(order:any){SEC_DEFAULT=cleanSecList(order);}
/* move one section up (dir<0) / down (dir>0) in the GLOBAL default (the Admin
   panel's ▲▼). Pure state — the caller persists (secDefaultSave) and repaints.
   Returns false on a no-op, mirroring moveSectionModel. */
export function moveSecDefault(key:string,dir:number):boolean{
  const from=SEC_DEFAULT.indexOf(key);
  if(from<0)return false;
  const to=from+(dir<0?-1:1);
  if(to<0||to>=SEC_DEFAULT.length)return false;
  const next=SEC_DEFAULT.slice();
  next.splice(to,0,next.splice(from,1)[0]);
  SEC_DEFAULT=next;
  return true;
}
export function secDefaultSave(){store.set('secdefault',isCanonicalSec(SEC_DEFAULT)?null:SEC_DEFAULT.slice());}
export function secDefaultLoad(){const raw=store.get('secdefault',null);SEC_DEFAULT=(raw==null)?SECTIONS.slice():cleanSecList(raw);}
export function secDefaultReset(){SEC_DEFAULT=SECTIONS.slice();}

/* the day's section order: its own arrangement first (unknown keys dropped), then
   the ADMIN DEFAULT order for any section it did not list, then any remaining
   canonical section as a final safety net. So an explicitly-arranged day keeps its
   own order, an un-arranged day follows the admin's house default, and — when that
   default is the canonical SECTIONS (the un-customised baseline) — a pristine day
   and the read-only reference render exactly as before (parity stays 728/0). */
export function secOrder(d:any):string[]{
  const raw=(d&&Array.isArray(d.secOrder))?d.secOrder:[];
  const seen=new Set<string>(); const out:string[]=[];
  for(const k of raw)if(typeof k==='string'&&SECTIONS.indexOf(k)>=0&&!seen.has(k)){seen.add(k);out.push(k);} // stored order, unknowns and repeats dropped
  for(const k of SEC_DEFAULT)if(SECTIONS.indexOf(k)>=0&&!seen.has(k)){seen.add(k);out.push(k);}             // then the admin house default
  for(const k of SECTIONS)if(!seen.has(k))out.push(k);                                                     // safety: any canonical the default lacks
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
/* move fromKey to where toKey currently sits — the DRAG sibling of
   moveSectionModel (which only steps ±1). A drop can span several positions, so
   the sheet's ±1 nudge is not enough. Same splice semantics as engine/reorder.ts
   slide() (the row-drag path), so a section drag reads the same as a row drag:
   remove fromKey, re-insert at toKey's index in the CURRENT resolved order.
   Materialises a full d.secOrder from the first move. Pure display mutation —
   the caller does histPush + notify (state/store.ts:moveSectionTo); no markEdit,
   no slot key, so the rules stay byte-identical (see secOrder above). Returns
   false on a no-op or an unknown key. */
export function reorderSectionTo(d:any,fromKey:string,toKey:string):boolean{
  if(!d||fromKey===toKey)return false;
  const cur=secOrder(d);
  const from=cur.indexOf(fromKey), to=cur.indexOf(toKey);
  if(from<0||to<0)return false;
  const next=cur.slice();
  next.splice(to,0,next.splice(from,1)[0]);
  d.secOrder=next;
  return true;
}
