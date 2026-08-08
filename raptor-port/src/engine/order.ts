import { parseHM } from './time'
/* Render-time ordering for the day's Ground Programme. It lived in ui/html.ts
   until the board learned to reorder rows (8 Aug 26): engine/reorder.ts has to
   freeze the order a scheduler can SEE before it moves anything within it, and
   the engine must not import from ui/. Pure — parseHM and nothing else.
   `man`: this day's list has been reordered by hand, so the time sort stands
   down and the model order IS the order (owner, 8 Aug 26). */
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
