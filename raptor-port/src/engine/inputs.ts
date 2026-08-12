import { VCONF } from './rules'
import { hhmm } from './time'
import { CURWEEK } from './waves'
/* A STABLE ADDRESS FOR ONE INPUT (owner, 10 Aug 26 — editing an input's times
   and remarks in place, on the week and on the board).
   Every other editable row in this app is addressed by its position in the
   model (`g:di.ri`, `dr:di.dwi.ri`), and that is safe there because those
   arrays only move when the surface that moves them re-renders. INPUTS does
   not behave like that: `add()` UNSHIFTS, so raising one input renumbers every
   other one, and undo replaces the array wholesale. A cell that captured an
   index when it was drawn and committed it a moment later — after an add on
   the Inputs page, or a Ctrl+Z — would write one man's hours onto another
   man's leave, silently. The content key `inpKey` cannot do this job either:
   it is built from the very fields these cells edit.
   So each input carries an `iid`, minted once and then never changed. It rides
   in the history snapshot with the rest of the record, so undo and redo hand
   back the same object with the same address, and the counter only ever climbs
   within a session, so a replayed snapshot can never collide with a new row. */
/* what an input's two time cells SHOW. An all-day row shows NOTHING — the
   placeholder says "all day", so the pair reads as the rule (see setInpField in
   ui/inputedit.tsx) rather than as a gap somebody forgot to fill. */
export function inpTimeText(inp:any,field:any){
  return (inp.allday||inp.s==null||inp.e==null)?'':hhmm(field==='str'?inp.s:inp.e);}
/* MINTED WHERE A ROW IS CREATED — the seed at boot (state/store.ts) and the
   Inputs page's add() — not lazily at render. Lazily was the first cut and it
   was subtly wrong: a history snapshot taken between the row being created and
   the row being first drawn held no id, so an undo back to it handed back a
   row that then minted a DIFFERENT one, and anything still holding the old
   address was pointing at nothing. Minting at creation puts the id in every
   snapshot the row appears in. The lazy branch stays as a backstop for a row
   that reaches a builder without having gone through either path. */
let IIDN=0;
export function inpId(inp:any){return inp.iid||(inp.iid='i'+(++IIDN));}
export function mintInpIds(){INPUTS.forEach(inpId);}
export function inpById(id:any){return INPUTS.find((r:any)=>r.iid===id)||null;}

/* ---- THE INPUT TYPES ------------------------------------------------------
   The squadron books far more kinds of absence than "leave" (owner, 10 Aug 26).
   ONE TABLE decides everything about a type, and every predicate below is a
   lookup into it. That shape is deliberate, for two reasons.

   The first is drift. This file used to carry five hand-written regexes and the
   week and the board each carried their own copy of one of them; they could and
   did fall out of step. With twenty types and four axes, regexes stop being
   readable long before they stop being wrong.

   The second is the LEGEND (owner, 10 Aug 26 — a button by the type field
   saying what each abbreviation means). It is generated from this table, so
   the explanation a scheduler reads cannot drift from the rule the engine
   enforces. That is only true while the table stays the single source.

   The axes, and what each one actually decides:
     work   — WITHIN the input's hours, may he take a NON-FLYING tasking (a duty
              post, a sim seat, a ground row, a programme item)? Only ATT B: he
              is grounded, not absent, and he is at his desk. Nobody on this
              list may fly within their hours.
     local  — is he still on the island? Drives the wording of the warning, and
              it is the flag the AVALON spare rule will read when the owner
              specifies it (he reserved it deliberately, 10 Aug 26 — do NOT
              infer it).
     ground — may a scheduler promote it onto the day's Ground Programme with
              the → Ground button? The activity types only: leave does not
              belong on the programme.
     half   — does the AM / PM control appear on the Inputs page? Leave and
              medical only (owner's call). The other types already take an
              exact time range, which is finer.

   SPARE ELIGIBILITY IS DERIVED, NOT STORED — see canSpare() below.        */
export const INPUT_META:any={
  /* leave — applied for, or granted inside the squadron. Closes the man to
     everything, but he is at home and reachable, so he may still stand by. */
  'LL':         {name:'local leave',              grp:'leave', work:false, local:true,  ground:false, half:true},
  'OL':         {name:'overseas leave',           grp:'leave', work:false, local:false, ground:false, half:true},
  'OIL':        {name:'off in lieu',              grp:'leave', work:false, local:true,  ground:false, half:true},
  'OFF':        {name:'off — no leave counter',   grp:'leave', work:false, local:true,  ground:false, half:true},
  'CCL':        {name:'childcare leave',          grp:'leave', work:false, local:true,  ground:false, half:true},
  'PL':         {name:'paternity leave',          grp:'leave', work:false, local:true,  ground:false, half:true},
  'FCL':        {name:'family care leave',        grp:'leave', work:false, local:true,  ground:false, half:true},
  'EL':         {name:'embarkation leave',        grp:'leave', work:false, local:true,  ground:false, half:true},
  /* medical — on the island but not fit to walk, so no spare either. ATT B is
     the ONLY type in the app that separates "cannot fly" from "cannot work". */
  'HL':         {name:'hospitalisation leave',    grp:'med',   work:false, local:true,  ground:false, half:true},
  'OML':        {name:'ordinary medical leave',   grp:'med',   work:false, local:true,  ground:false, half:true},
  'ATT C':      {name:'medically down — cannot report to work', grp:'med', work:false, local:true, ground:false, half:true},
  'ATT B':      {name:'medically down — no flying, may still work', grp:'med', work:true, local:true, ground:false, half:true},
  /* activity — a real commitment, but local and droppable, so he may stand by.
     These are the types a scheduler may lift onto the Ground Programme. */
  'Training':   {name:'training',                 grp:'act',   work:false, local:true,  ground:true,  half:false},
  'CSE':        {name:'course',                   grp:'act',   work:false, local:true,  ground:true,  half:false},
  'Meeting':    {name:'meeting',                  grp:'act',   work:false, local:true,  ground:true,  half:false},
  'Fly':        {name:'flying with another squadron', grp:'act', work:false, local:true, ground:true, half:false},
  'Personal':   {name:'personal',                 grp:'act',   work:false, local:true,  ground:true,  half:false},
  'Appointment':{name:'appointment',              grp:'act',   work:false, local:true,  ground:true,  half:false},
  /* overseas duty — replaces Detachment (owner, 10 Aug 26). Out of reach:
     cannot be planned for anything at all, an SC spare included. */
  'OD':         {name:'overseas duty',            grp:'duty',  work:false, local:false, ground:false, half:false},
  'Other':      {name:'other',                    grp:'act',   work:false, local:true,  ground:true,  half:false},
};
/* Looked up case-insensitively and trimmed, because the predicates this
   replaced were regexes with /i and the suite pins that (`isLeave(' oil ')`).
   The types themselves come from a fixed dropdown, but an input restored from
   an older store — or pushed in by a probe — need not match byte for byte. */
const META_IX:any=Object.keys(INPUT_META).reduce((o:any,k:any)=>{o[k.toUpperCase()]=INPUT_META[k];return o;},{});
export function inpMeta(t:any){return META_IX[String(t==null?'':t).trim().toUpperCase()]||null;}
/* the canonical spelling of a type, whatever case it arrived in */
export function inpType(t:any){const u=String(t==null?'':t).trim().toUpperCase();
  return INPUT_TYPES.find((k:any)=>k.toUpperCase()===u)||String(t==null?'':t).trim();}
/* MAY HE STAND A STANDALONE SPARE despite this input? The owner's rule, in the
   words he used: local yes, overseas no — with medical the single carve-out,
   because HL/OML/ATT B/ATT C keep him on the island but not fit to walk. A
   spare is standing by, not tasked, which is why a local commitment does not
   bar one. Derived rather than stored so the rule lives in one place and a
   twenty-row column cannot fall out of step with it.
   Written against "a standalone spare" on purpose: SC is the only kind
   enforced today, and the owner's AVALON rule drops in without re-cutting. */
export function canSpare(t:any){const m=inpMeta(t); return !!m&&m.local&&m.grp!=='med';}
/* LEAVE_TYPES is kept — the Logic page builds its leave matrix from it, and
   the reference suite reaches for it by name — but it is now a VIEW of the
   table above rather than a second list to keep true. */
export const LEAVE_TYPES:any=Object.keys(INPUT_META).reduce((o:any,k:any)=>{if(INPUT_META[k].grp==='leave')o[k]=INPUT_META[k].name;return o;},{});
/* declared as functions, not const arrows, so the regression suite can reach
   them — jsdom does not put a top-level const on window */
export function leaveKey(t:any){const k=String(t==null?'':t).trim().toUpperCase(); return LEAVE_TYPES[k]?k:'';}
export function isLeave(t:any){const m=inpMeta(t); return !!m&&m.grp==='leave';}
export function isLocalLeave(t:any){const m=inpMeta(t); return !!m&&m.grp==='leave'&&m.local;}   // still on the island
/* "Downchit" the TYPE is gone (owner, 10 Aug 26); downchit the CONCEPT is the
   medical group — OML, ATT B, ATT C and HL. Everything that used to ask
   isDownchit still gets the right answer, including the late-input exemption:
   a deadline asks a man to decide in advance, and none of these four is
   decided in advance. Leave and OD stay in scope, because they are applied
   for. See the late-input block below. */
export function isDownchit(t:any){const m=inpMeta(t); return !!m&&m.grp==='med';}
export function isOffType(t:any){return isLeave(t)||isDownchit(t);}
export function isFly(t:any){return /^Fly$/i.test(String(t==null?'':t).trim());}
/* may a NON-FLYING tasking still be given inside this input's hours? */
export function canWork(t:any){const m=inpMeta(t); return !!m&&!!m.work;}
/* AWAY for availability (owner, Aug 26): leave and downchits close the day on
   type alone. A Fly means the man is flying with ANOTHER SQUADRON — so once a
   scheduler has actioned it (either destination) he reads as unavailable in
   the crew strip, the palette and slotBar, while the item itself can sit on
   the Ground Programme. Un-actioned Fly is still just a request, exactly like
   the validator gate — the two gates must not drift apart. */
/* OVERSEAS DUTY BELONGS HERE, and its predecessor never did (10 Aug 26).
   `Detachment` sat in isUnavail but NOT in isAway, so a detached man was
   neither hidden from the palette nor barred from a slot — he only ever raised
   a warning after you had planted him. The owner's rule for OD is explicit:
   "cannot be planned for anything, including an SC spare", and a picker that
   still offers him cannot deliver that. Widened from isOffType to isUnavail,
   which is leave + medical + overseas duty — the three groups that mean the
   man is simply not there.
   The activity types stay out on purpose. They close the man in the WARNING
   list (every input counts now — see inputFlags) but they do not strike him
   out of the palette, which is exactly how an actioned personal input has
   always behaved. Widening that too would be a change nobody asked for. */
export function isAway(inp:any){return isUnavail(inp.type)||(isFly(inp.type)&&!!inp.acc);}
/* DOES THIS ABSENCE CLOSE THE WHOLE DAY, or only some hours (owner, 10 Aug 26 —
   AM / PM half-days)? It does when it says so, AND when it carries no usable
   window at all: {person:'pike', type:'OD'} with neither allday nor s/e is a
   real shape (parity.test.ts pins one), and reading it as a zero-length
   absence would quietly free a man who is off for a week. Both ends are
   required, so a half-day with a blank end does not become a one-hour absence
   through win()'s open-ended default. A thin record fails CLOSED — the same
   rule slotRules follows for a row with no times of its own. */
export function awayAllDay(inp:any){return !!inp.allday||inp.s==null||inp.e==null;}
/* THE ABSENCE'S WINDOW, ROLLED (owner, 11 Aug 26). An absence typed 22:00–02:00
   crosses midnight, exactly as a duty row, a sim box or a night sortie typed the
   same way does — win() and the ld<to roll have handled those since the port.
   Personal inputs were the one row type left out: both entry paths refused
   e<=s outright, so an overnight absence could not be recorded at all, and a
   record that arrived any other way was passed to overlap() inverted, where it
   silently matched nothing. Every reader goes through here, or the picker and
   the warning list drift apart on the one shape neither of them can see.
   A record with neither the all-day flag nor both times FAILS CLOSED here
   too, as the WHOLE day (audit, 12 Aug 26). It used to return null, which
   left the two halves of the same question disagreeing: awayAllDay called
   such a man away and struck him out of the palette, while every validator
   overlap against a null window was false, so planting him anyway raised
   NOTHING — the one drift the picker and the warning list must never have.
   [0,1439] is exactly 1439 wide, so validate.ts's timedInput filter reads it
   as all-day, which is what awayAllDay already decided it was. No UI path can
   mint such a record — both entry paths always write the flag or both times —
   so this is the guard for whatever arrives from a restore, an import or a
   probe, not a live bug being papered over. */
export function inpWin(inp:any){
  if(!inp)return null;
  const s=inp.allday?0:inp.s, e=inp.allday?1439:inp.e;
  if(s==null||e==null)return [0,1439];
  return [s,e<s?e+1440:e];
}
/* how an entry reads when it is the reason a slot is closed. The words come
   off INPUT_META, so the reason a scheduler reads here, the text in the type
   legend and the rule the engine applied are all the same string. */
export function offWord(inp:any){const m=inpMeta(inp.type);
  const half=inp.half==='am'?' (AM)':inp.half==='pm'?' (PM)':'';
  if(!m)return String(inp.type).toLowerCase()+half+(inp.remarks?' — '+inp.remarks:'');
  /* an ABBREVIATION carries its code so a reader can match it back to the
     legend; a type that is already an ordinary word ("Training") would only
     read as "training (Training)", so it does not */
  const t=inpType(inp.type), abbr=m.name.toLowerCase()!==t.toLowerCase();
  return `${m.name}${abbr?` (${t})`:''}${half}`+(inp.remarks?' — '+inp.remarks:'');}
/* "Office", "Available fly" and "Available duty" are gone (owner decision, Aug 26).
   The first was a desk marker nobody read off the programme; the other two were
   OFFERS — a man saying what he WANTED rather than where he had to be. With them
   gone the offer concept goes with them: every remaining non-leave type is a real
   commitment, "Fly" included, so it clashes and consumes brief/debrief time
   exactly like an Appointment does.
   DERIVED from INPUT_META, in its declaration order, so the list a scheduler
   picks from and the rules the engine applies cannot disagree about which
   types exist. "Downchit" and "Detachment" were removed on 10 Aug 26 —
   OML / ATT B / ATT C carry the medical meaning now, and OD the overseas one. */
export const INPUT_TYPES=Object.keys(INPUT_META);
/* the three groups the type dropdown and the legend are cut into */
export const TYPE_GROUPS:any=[
  {k:'leave',t:'Leave'},{k:'med',t:'Medical'},{k:'other',t:'Duty & other commitments'}];
export function typeGroup(t:any){const m=inpMeta(t); return !m?'other':m.grp==='leave'?'leave':m.grp==='med'?'med':'other';}
/* The two halves of the day's input blocks, and the ONLY place the split is
   decided — the week and the board both used to carry their own copy of this
   regex and could drift apart.
     UNAVAIL  — leave, medical and overseas duty. The block the squadron reads
                every day: a man who is simply not there.
     PERSONAL — the activity types. A real commitment he is here for, which a
                scheduler may lift onto the Ground Programme (see acceptInput).
   NOTE this split is now PRESENTATIONAL ONLY (owner, 10 Aug 26). It decides
   which block a row is drawn in and nothing else — every input closes the
   man's hours the moment it is entered, whichever block it lands in. The gate
   that used to make "unavailable" mean "counts to the validator" was
   inputFlags, and it no longer discriminates. */
export function isUnavail(t:any){const m=inpMeta(t); return !!m&&m.grp!=='act';}
export function isPersonal(t:any){const m=inpMeta(t); return !!m&&m.grp==='act';}
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
/* The validator's gate. EVERY INPUT NOW COUNTS (owner, 10 Aug 26 — "all will
   automatically go in"). It used to be `isUnavail(type) || acc==='u' || …`,
   so a Training or an Appointment blocked nothing at all until a scheduler had
   actioned it: it was a request, not part of anyone's programme. The owner
   wants the opposite — an input closes the man's hours the moment he types it,
   and the scheduler's job becomes editing or removing it, not admitting it.

   ONE carve-out survives, and it is not about admission: an input a scheduler
   has promoted to a Ground row ('g') is already represented BY that row, so
   letting it flag here as well would print every clash twice — INPUT_FLY on
   the input plus DOUBLE_BOOK on the row.
   That defers only where the row can actually carry the clash. An ALL-DAY
   input makes a TIME-LESS ground row, and a time-less row never becomes an
   event (4 Aug 26), so it would flag nothing at all — it stays visible here
   instead. A timed one defers to its row, which does the flagging properly.
   PER-INPUT only: the row lives on ONE day of a multi-day span, so
   events.ts's inpShow narrows this to that day (audit, 12 Aug 26) — every
   other covered day keeps the input's voice. This function stays the
   day-blind half because refwin.ts seeds the reference through it, where
   no day context exists. */
export function inputFlags(inp:any){return !(inp.acc==='g'&&!inp.allday);}
/* inputs use machine-readable date + minute fields so the validator can reason about them.
   s/e are minutes-from-midnight; allday inputs cover the whole day. */
/* The `mod` stamps are spread either side of the demo week's input deadline on
   purpose (owner, 9 Aug 26 — see isLateInput below). At the standard 14 days
   the week of Mon 13 Jul is due by Mon 29 Jun, so this seed shows every case
   a reader needs to see: comfortably early (pike, j_lee, vinci, bruise),
   exactly ON the deadline (bane — the deadline day itself is on time), just
   missed by a day (nasty), plainly late (shrek, yeti, and salsa's dental
   appointment booked after planning closed), and EXEMPT-though-latest-of-all
   (divot and sufa's downchits, stamped 12 Jul and marked by nothing).
   Before this they were all stamped inside their own week, which marked every
   input late and made the mark meaningless. */
export let INPUTS:any[]=[
  {person:'divot', date:'Jul 13', allday:true,               type:'OML',         remarks:'Medical leave 13 Jul', mod:'2026-07-12'},
  {person:'bane',  date:'Jul 16', allday:false, s:1020,e:1110,type:'Appointment', remarks:'Medical / PHA', mod:'2026-06-29'},
  {person:'salsa', date:'Jul 14', allday:false, s:840, e:960, type:'Appointment', remarks:'Dental appt',  mod:'2026-07-09'},
  {person:'j_lee', date:'Jul 15', allday:true,               type:'OL',          remarks:'Overseas — SG out',mod:'2026-06-22'},
  {person:'nasty', date:'Jul 14', allday:true,               type:'LL',          remarks:'Local leave',  mod:'2026-06-30'},
  {person:'shrek', date:'Jul 14', allday:true,               type:'OIL',         remarks:'OIL — CO approved, post-detachment',mod:'2026-07-02'},
  {person:'sufa',  date:'Jul 13', endDate:'Jul 17', allday:true, type:'ATT C',   remarks:'Medically down till 17 Jul', mod:'2026-07-12'},
  {person:'bruise',date:'Jul 13', allday:true,               type:'Fly',         remarks:'Keen for any wave',mod:'2026-06-20'},
  {person:'vinci', date:'Jul 13', allday:false, s:540, e:1020,type:'Meeting',     remarks:'Desk / staff work',mod:'2026-06-26'},
  {person:'pike',  date:'Jul 15', endDate:'Jul 17', allday:true, type:'OD',       remarks:'Overseas duty — exercise, off island',mod:'2026-06-18'},
  {person:'yeti',  date:'Jul 13', allday:false, s:600, e:660, type:'Appointment', remarks:'HSP blood panel',mod:'2026-07-06'},
];
export const DATES=['Jul 13','Jul 14','Jul 15','Jul 16','Jul 17','Jul 18','Jul 19'];  // Mon..Sun index → date label
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* THE YEAR THE UNLABELLED DATES BELONG TO (owner, 12 Aug 26 — leave that runs
   into the new year). The stored labels leave the LOADED week's year implicit
   so an ordinary same-week date reads 'Jul 14' with no clutter; a date in any
   OTHER year is stored WITH its year ('Jan 3 2027' — see fmt in
   ui/inputedit.tsx), and dateOrd reads it back below. Derived from CURWEEK so
   the convention tracks whatever week is loaded — there is only ever one, and
   it falls back to the demo's 2026 if CURWEEK is unreadable. */
export function baseYear(){const y=+String(weekStartISO()).slice(0,4);return isFinite(y)&&y?y:2026;}
/* 'Jul 18' → 20260718, a sortable ordinal that ORDERS ACROSS YEARS. Spans used
   to be compared through DATES.indexOf, which returns -1 for any date outside
   the loaded week: a detachment running Jul 15→24 then covered NO day at all
   and the man read as available all week. Comparing the dates themselves clamps
   at both ends and does not care whether an endpoint is in the week.
   The ordinal now leads with the YEAR (year*10000 + month*100 + day) so a leave
   running Dec 28 → Jan 3 sorts FORWARDS: without the year 'Jan 3' read as 103,
   BEHIND 'Dec 28' at 1228, so the span covered nothing (owner, 12 Aug 26). A
   label may carry a trailing 4-digit year for a date outside baseYear()'s year;
   without one it belongs to baseYear(). */
export function dateOrd(lbl:any){
  const p=String(lbl==null?'':lbl).trim().split(/\s+/);
  const m=MONTHS.indexOf(p[0]), d=+p[1];
  if(m<0||!isFinite(d))return null;
  const y=p.length>2&&isFinite(+p[2])?+p[2]:baseYear();
  return y*10000+(m+1)*100+d;
}
export function inputCoversDate(inp:any,dt:any){
  if(!inp.endDate)return inp.date===dt;
  const t=dateOrd(dt), a=dateOrd(inp.date), b=dateOrd(inp.endDate);
  if(t==null||a==null||b==null)return false;
  return t>=a&&t<=b;
}
/* ---- LATE INPUTS (owner, 9 Aug 26) ---------------------------------------
   The squadron wants members' inputs in before the week is planned, and wants
   a late one to SAY it is late wherever it appears. The deadline is the week's
   Monday minus VCONF.inputLead days, and the deadline day itself is still on
   time — "no later than a week prior" means the 10th is fine for the week of
   the 17th, the 11th is not.

   What is measured is `mod`, the stamp the Inputs page prints as "Last
   modified" — so an input raised early but CHANGED after the deadline reads
   as late (owner's call, 9 Aug 26). That is the whole point: the deadline
   exists so the week can be planned against something that has stopped
   moving.

   DOWNCHITS ARE EXEMPT (owner, 9 Aug 26). A deadline asks a man to decide in
   advance; going DNIF is not a decision he makes, and a downchit raised the
   morning of the flight is the system working, not somebody being slack.
   Marking it would be scolding him for being ill, and — worse for the
   scheduler — it would put a badge on the one input type that is ALWAYS
   last-minute, which is how a mark stops meaning anything. Leave and overseas
   duty are NOT exempt: those are applied for, and applying late is exactly
   what this is about.
   Since 10 Aug 26 that exemption reads off the MEDICAL GROUP — HL, OML, ATT B
   and ATT C — because the plain "Downchit" type is gone and those four are
   what replaced it. The rule is unchanged in substance: none of the four is
   decided in advance either.

   This is a MARK, not a rule the validator reads. Nothing here raises a
   warning, changes availability, or touches a seat — a paperwork deadline
   does not belong in the list a scheduler reads for crew rest and double
   bookings. Deliberate, and recorded in docs/engine-rules.md.

   Anything with no usable stamp is NOT late. An unknown date is not evidence
   of lateness, and accusing an input because its record is thin is worse
   than staying quiet. */
const pad2=(n:any)=>String(n).padStart(2,'0');
const isISO=(s:any)=>/^\d{4}-\d{2}-\d{2}$/.test(String(s==null?'':s));
/* CURWEEK is 'dd/mm/yyyy'; everything below works in ISO so plain string
   comparison orders dates correctly and no Date object crosses a boundary. */
export function weekStartISO(wk?:any){
  const p=String(wk==null?CURWEEK:wk).split('/');
  if(p.length!==3)return '';
  const d=+p[0],m=+p[1],y=+p[2];
  return (isFinite(d)&&isFinite(m)&&isFinite(y))?`${y}-${pad2(m)}-${pad2(d)}`:'';
}
/* the last day an input may be touched and still count as on time */
export function inputDueISO(wk?:any){
  const ws=weekStartISO(wk); if(!ws)return '';
  const n=Math.max(0,+VCONF.inputLead||0);
  const t=Date.UTC(+ws.slice(0,4),+ws.slice(5,7)-1,+ws.slice(8,10))-n*86400000;
  const d=new Date(t);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
}
/* 'now' is what the Inputs page writes for anything touched this session, so
   it resolves to today rather than reading as "no stamp" — an input edited
   right now is exactly the case the deadline is about. */
export function inputStampISO(inp:any){
  const m=inp&&inp.mod;
  if(m==='now'){const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
  return isISO(m)?String(m):'';
}
export function isLateInput(inp:any){
  if(!inp||isDownchit(inp.type))return false;
  const s=inputStampISO(inp), due=inputDueISO();
  return !!s&&!!due&&s>due;
}
/* '2026-08-11' → '11 Aug', the form the rest of the app prints dates in */
export function isoLabel(iso:any){
  if(!isISO(iso))return '';
  return `${+String(iso).slice(8,10)} ${MONTHS[+String(iso).slice(5,7)-1]||''}`.trim();
}
/* what the mark says when you hover it — plain enough for the squadron */
export function lateNote(inp:any){
  if(!isLateInput(inp))return '';
  return `Late input — last changed ${isoLabel(inputStampISO(inp))}, after the ${isoLabel(inputDueISO())} deadline for the week of ${isoLabel(weekStartISO())}.`;
}

