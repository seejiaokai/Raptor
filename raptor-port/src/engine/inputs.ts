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
export function isFly(t:any){return /^Fly$/i.test(String(t==null?'':t).trim());}
/* AWAY for availability (owner, Aug 26): leave and downchits close the day on
   type alone. A Fly means the man is flying with ANOTHER SQUADRON — so once a
   scheduler has actioned it (either destination) he reads as unavailable in
   the crew strip, the palette and slotBar, while the item itself can sit on
   the Ground Programme. Un-actioned Fly is still just a request, exactly like
   the validator gate — the two gates must not drift apart. */
export function isAway(inp:any){return isOffType(inp.type)||(isFly(inp.type)&&!!inp.acc);}
/* how an entry reads when it is the reason a slot is closed */
export function offWord(inp:any){const k=leaveKey(inp.type);
  return (k?`${LEAVE_TYPES[k]} (${k})`:isFly(inp.type)?'flying with another squadron':String(inp.type).toLowerCase())+(inp.remarks?' — '+inp.remarks:'');}
/* "Office", "Available fly" and "Available duty" are gone (owner decision, Aug 26).
   The first was a desk marker nobody read off the programme; the other two were
   OFFERS — a man saying what he WANTED rather than where he had to be. With them
   gone the offer concept goes with them: every remaining non-leave type is a real
   commitment, "Fly" included, so it clashes and consumes brief/debrief time
   exactly like an Appointment does. "Detachment" is new and reads as unavailable. */
export const INPUT_TYPES=['LL','OL','OIL','Detachment','Training','Meeting','Fly','Personal','Downchit','Appointment','Other'];
/* The two halves of the day's input blocks, and the ONLY place the split is
   decided — the week and the board both used to carry their own copy of this
   regex and could drift apart.
     UNAVAIL  — closes the man's day outright. Rendered to everyone, on every
                page, without the scheduler doing anything.
     PERSONAL — submitted by aircrew, NOT yet part of the issued programme. The
                scheduler accepts it (see acceptInput) to promote it into the
                ground programme, so it never reaches the view-only page. */
export function isDetach(t:any){return /^Detachment$/i.test(String(t==null?'':t).trim());}
export function isUnavail(t:any){return isDetach(t)||isLeave(t)||isDownchit(t);}
export function isPersonal(t:any){return /^(Meeting|Training|Personal|Appointment|Fly|Other)$/i.test(String(t==null?'':t).trim());}
export function isOther(t:any){return /^Other$/i.test(String(t==null?'':t).trim());}
/* "Other" is the catch-all: the TYPE says nothing, so what the person actually
   typed is the name of the thing (owner, Aug 26). Everywhere an input is
   labelled — the Personal Inputs list, the Unavailable block, the board rows,
   and the ground row accept creates — an Other reads by its remarks, falling
   back to the bare type while the box is still empty. */
export function inpLabel(inp:any){
  const rm=String((inp&&inp.remarks)||'').trim();
  return (isOther(inp&&inp.type)&&rm)?rm:String((inp&&inp.type)||'');
}
/* The validator's gate (owner, Aug 26): an unavailable-typed input always
   counts, but a personal input only counts once a scheduler has ACTIONED it.
   'u' files it under Unavailable, so it clashes like a Detachment does; 'g' is
   already represented by the ground row acceptInput created — letting it flag
   here too would print every clash twice (INPUT_FLY on the input plus
   DOUBLE_BOOK on the row). An un-actioned personal input is invisible to
   validate(): it is a request, not yet part of anyone's programme.
   The one exception to the 'g' rule (4 Aug 26): an ALL-DAY input accepted to
   Ground makes a time-less row, and a time-less row never becomes an event —
   so an all-day Fly accepted to the ground programme flagged nothing even
   with the man planted in a sortie. An all-day Fly is exactly the case that
   must flag (he is flying with another squadron the whole day), so it stays
   visible here; a TIMED Fly to 'g' still defers to its row, and the all-day
   row it leaves behind is time-less, so nothing prints twice. */
export function inputFlags(inp:any){return isUnavail(inp.type)||inp.acc==='u'||(isFly(inp.type)&&inp.acc==='g'&&!!inp.allday);}
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
  {person:'bruise',date:'Jul 13', allday:true,               type:'Fly',         remarks:'Keen for any wave',mod:'2026-07-12'},
  {person:'vinci', date:'Jul 13', allday:false, s:540, e:1020,type:'Meeting',     remarks:'Desk / staff work',mod:'2026-07-12'},
  {person:'pike',  date:'Jul 15', endDate:'Jul 17', allday:true, type:'Detachment', remarks:'Det — exercise, off island',mod:'2026-07-13'},
  {person:'yeti',  date:'Jul 13', allday:false, s:600, e:660, type:'Appointment', remarks:'HSP blood panel',mod:'2026-07-12'},
];
export const DATES=['Jul 13','Jul 14','Jul 15','Jul 16','Jul 17','Jul 18','Jul 19'];  // Mon..Sun index → date label
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* 'Jul 18' → 718, a sortable ordinal. Spans used to be compared through
   DATES.indexOf, which returns -1 for any date outside the loaded week: a
   detachment running Jul 15→24 then covered NO day at all and the man read as
   available all week. Comparing the dates themselves clamps at both ends and
   does not care whether an endpoint is in the week. */
export function dateOrd(lbl:any){
  const p=String(lbl==null?'':lbl).trim().split(/\s+/);
  const m=MONTHS.indexOf(p[0]), d=+p[1];
  return (m<0||!isFinite(d))?null:(m+1)*100+d;
}
export function inputCoversDate(inp:any,dt:any){
  if(!inp.endDate)return inp.date===dt;
  const t=dateOrd(dt), a=dateOrd(inp.date), b=dateOrd(inp.endDate);
  if(t==null||a==null||b==null)return false;
  return t>=a&&t<=b;
}

