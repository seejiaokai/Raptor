import { parseHM } from './time'
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
