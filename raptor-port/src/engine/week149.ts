/* ---- 149'S DEMO WEEK (week of Mon 13 Jul 26) — multi-squadron batch 1, step 4 ----
   The second demo squadron's own week, on the SAME dates as 142's first authored week (engine/data.ts), so a walk can
   put the two squadrons' schedules side by side and prove they never meet: 149's people only (state/demoseed.ts
   seedDemo149 — their own ids and callsigns, never 142's handles), one day wave a weekday with one two-ship and an SDO,
   the weekend empty. Plain on purpose: it carries no deliberate warning (142's second week is the one that exercises
   them), and nobody in it is on two things at once. Read only through weeks-data.ts weekBundle, for 149 alone, and only
   while the authored weeks are on (the demo — never a shared store's). Demo data, wiped before the database (D56). */
const opts=()=>({tk2:true,tpod:false,nav:false,bombs:''});
const jet=(p:string,w:string,area:string,rmks:string)=>({p,w,area,rmks,opts:opts()});
const day=(dow:string,dt:string,pairs:Array<[string,string,string,string]>,to:string,ld:string,sdo:string)=>({dow,dt,wc:'2 X 2 X 0',notes:[],allhands:[],
  waves:[{label:'WAVE 1',night:false,intimes:[],traffic:[],formations:[{cs:'HK',msn:'BFM',to,ld,aircraft:pairs.map(([p,w,a,r])=>jet(p,w,a,r))}]}],
  sims:{amt:[],oft:[]},dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:sdo,str:'0700',end:'1500'}]}],ground:[]});
const empty=(dow:string,dt:string)=>({dow,dt,wc:'0 X 0 X 0',notes:[],allhands:[],waves:[],sims:{amt:[],oft:[]},dutywaves:[],ground:[]});
export const WEEK149_DATES=['Jul 13','Jul 14','Jul 15','Jul 16','Jul 17','Jul 18','Jul 19'];
export function week149Days():any[]{
  return [
    day('Monday','Jul 13',[['kes9','fal9','NORTH','1B: BFM-2'],['osp9','her9','SOUTH','2A: BFM-1']],'09:40','11:05','mer9'),
    day('Tuesday','Jul 14',[['mer9','rav9','EAST','1B: BFM-3'],['har9','shr9','SOUTH','2A: BFM-2']],'09:40','11:05','kes9'),
    day('Wednesday','Jul 15',[['kes9','gan9','NORTH','1B: OCU BFM-1'],['con9','fal9','SOUTH','2A: OCU BFM-1']],'10:40','12:05','osp9'),
    day('Thursday','Jul 16',[['osp9','her9','WEST','1B: BFM-4'],['mer9','rav9','SOUTH','2A: BFM-4']],'09:40','11:05','har9'),
    day('Friday','Jul 17',[['har9','shr9','NORTH','1B: BFM-3'],['kes9','fal9','SOUTH','2A: BFM-5']],'09:40','11:05','mer9'),
    empty('Saturday','Jul 18'),
    empty('Sunday','Jul 19'),
  ];
}
