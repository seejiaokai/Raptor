/* ---- LEAVE ---------------------------------------------------------------
   The squadron does not book "leave"; it books one of three things.
     LL  · local leave     — applied for on the leave system, man stays on island
     OL  · overseas leave  — applied for on the leave system, man is out of reach
     OIL · off in lieu     — given by the commander, run inside the squadron.
                             Nothing is applied for anywhere, but it is leave.
   All three are leave for every purpose the schedule cares about: they close the
   man to flying, duties, sims and ground slots exactly as before.
   LL and OIL keep him on the island, so he MAY still be raised as an SC SPARE —
   a spare is standing by, not tasked. OL cannot: he is away.               */
export const LEAVE_TYPES:any={LL:'local leave',OL:'overseas leave',OIL:'off in lieu'};
/* declared as functions, not const arrows, so the regression suite can reach
   them — jsdom does not put a top-level const on window */
export function leaveKey(t:any){const k=String(t==null?'':t).trim().toUpperCase(); return LEAVE_TYPES[k]?k:'';}
export function isLeave(t:any){return !!leaveKey(t);}
export function isLocalLeave(t:any){const k=leaveKey(t); return k==='LL'||k==='OIL';}   // still on the island
export function isDownchit(t:any){return /DNIF|Downchit/i.test(String(t==null?'':t));}
export function isOffType(t:any){return isLeave(t)||isDownchit(t);}
/* how an entry reads when it is the reason a slot is closed */
export function offWord(inp:any){const k=leaveKey(inp.type);
  return (k?`${LEAVE_TYPES[k]} (${k})`:String(inp.type).toLowerCase())+(inp.remarks?' — '+inp.remarks:'');}
export const INPUT_TYPES=['LL','OL','OIL','Training','Meeting','Fly','Personal','Office','Downchit','Appointment','Available fly','Available duty','Other'];
/* "Available fly", "Available duty" and "Fly" say what a man WANTS, not where he
   has to be. They must never clash with anything — a volunteer being flagged for
   blocking his own brief is nonsense, and it is exactly what used to happen. */
export const isOffer=(t:any)=>/^Available/i.test(String(t||''))||/^Fly$/i.test(String(t||''));
/* inputs use machine-readable date + minute fields so the validator can reason about them.
   s/e are minutes-from-midnight; allday inputs cover the whole day. */
export let INPUTS:any[]=[
  {person:'divot', date:'Jul 13', allday:true,               type:'Downchit',    remarks:'Downchit 13 Jul', mod:'2026-07-12'},
  {person:'bane',  date:'Jul 16', allday:false, s:1020,e:1110,type:'Appointment', remarks:'Medical / PHA', mod:'2026-07-14'},
  {person:'salsa', date:'Jul 14', allday:false, s:840, e:960, type:'Appointment', remarks:'Dental appt',  mod:'2026-07-13'},
  {person:'j_lee', date:'Jul 15', allday:true,               type:'OL',          remarks:'Overseas — SG out',mod:'2026-07-13'},
  {person:'nasty', date:'Jul 14', allday:true,               type:'LL',          remarks:'Local leave',  mod:'2026-07-13'},
  {person:'shrek', date:'Jul 14', allday:true,               type:'OIL',         remarks:'OIL — CO approved, post-detachment',mod:'2026-07-13'},
  {person:'sufa',  date:'Jul 13', endDate:'Jul 17', allday:true, type:'Downchit', remarks:'Downchit till 17 Jul', mod:'2026-07-12'},
  {person:'bruise',date:'Jul 13', allday:true,               type:'Available fly',remarks:'Avail all day',mod:'2026-07-12'},
  {person:'pike',  date:'Jul 13', allday:true,               type:'Available duty',remarks:'',           mod:'2026-07-12'},
  {person:'vinci', date:'Jul 13', allday:false, s:540, e:1020,type:'Office',      remarks:'Office day',   mod:'2026-07-12'},
  {person:'yeti',  date:'Jul 13', allday:false, s:600, e:660, type:'Appointment', remarks:'HSP blood panel',mod:'2026-07-12'},
];
export const DATES=['Jul 13','Jul 14','Jul 15','Jul 16','Jul 17'];  // Mon..Fri index → date label
export function inputCoversDate(inp:any,dt:any){
  if(inp.endDate){return DATES.indexOf(dt)>=DATES.indexOf(inp.date)&&DATES.indexOf(dt)<=DATES.indexOf(inp.endDate);}
  return inp.date===dt;
}

