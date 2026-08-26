import { VCONF } from './rules'
import { hhmm, hm24 } from './time'
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
     These are the types a scheduler may lift onto the Ground Programme.
     shiftHard (owner, 26 Aug 26): across an SC MAIN shift this type is a hard
     CONFLICT, not academics — the man is genuinely committed elsewhere while the
     shift may launch him. Meeting is the deliberate exception (advisory): you can
     still give a meeting to the man on standby. The flag feeds shiftHardInput()
     AND the derived label matcher below, so a future red type is one edit here.
     A per-type Logic-tab toggle was considered and deferred — it would need a
     rulesSave/Load blob like SHIFT_HARD's `s`; the owner named fixed types. */
  'Training':   {name:'training',                 grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  'CSE':        {name:'course',                   grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  'Meeting':    {name:'meeting',                  grp:'act',   work:false, local:true,  ground:true,  half:false},
  /* renamed from 'Fly' (owner, 14 Aug 26) — reads better in the dropdown, and
     the reference's own `^Fly$` offer regexes simply stop matching, which is
     the commitment semantics both engines already agree on */
  'Fly with':   {name:'flying with another squadron', grp:'act', work:false, local:true, ground:true, half:false, shiftHard:true},
  'Personal':   {name:'personal',                 grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  'Appointment':{name:'appointment',              grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  /* a LOCAL duty (owner, 18 Aug 26 — "a new input call Duty… local… same kind
     of rules similar to appointment"). grp:'act' makes it behave EXACTLY like
     an Appointment everywhere by construction: a personal input (drawn in the
     Personal block, not Unavailable), on the island (canSpare yes), liftable
     onto the Ground Programme (ground:true), warns-but-does-not-bar, and it
     does NOT cross to Leave War (the sync only carries leave/medical). It sits
     under the dropdown's "Duty & other commitments" heading, distinct from OD
     (overseas duty, grp:'duty' — out of reach). Placed AFTER the medical block
     so the leave/med indices the suite pins stay put. */
  'Duty':       {name:'duty',                     grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  /* overseas duty — replaces Detachment (owner, 10 Aug 26). Out of reach:
     cannot be planned for anything at all, an SC spare included. */
  'OD':         {name:'overseas duty',            grp:'duty',  work:false, local:false, ground:false, half:false},
  'Other':      {name:'other',                    grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  /* SANS AVAILABILITY (owner, 14 Aug 26) — SANS aircrew filing POSITIVE
     availability for Fly / AMT / OFT, not an absence. grp:'sans' keeps it
     out of isPersonal (it is not a Ground Programme candidate) and inside
     isUnavail (see the comment there — that predicate's name is now stale
     but its callers, the Accept refusal and "no Accept controls" chief among
     them, are exactly right for this type too). local:true, ground:false so
     it behaves like an on-island commitment for canSpare/the Ground button;
     work:false because filing this says nothing about a non-flying tasking.
     half:true (owner, 14 Aug 26 — reworked from three per-event windows): the
     record carries ONE window through the standard All day / AM / PM / Custom
     template like any leave input, and `sans` is reduced to which events are
     offered ({f/o/a: true}). See isSansAvail/sansAvailOn/sansWindow/sansBadge
     below and sansGate in avail.ts. */
  'SANS Availability':{name:'SANS availability',  grp:'sans',  work:false, local:true,  ground:false, half:true},
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
export function isFly(t:any){return /^Fly with$/i.test(String(t==null?'':t).trim());}
/* may a NON-FLYING tasking still be given inside this input's hours? */
export function canWork(t:any){const m=inpMeta(t); return !!m&&!!m.work;}
/* IS THIS COMMITMENT A HARD CONFLICT ACROSS AN SC MAIN SHIFT? (owner, 26 Aug
   26). The shift may launch the man, so most commitments are a real conflict;
   Meeting stays the advisory. One body — the validator's raw-input gate, the
   ground-row severity upgrade and the crew picker all ask HERE. */
export function shiftHardInput(t:any){const m=inpMeta(t); return !!m&&!!m.shiftHard;}
/* The HAND-TYPED fallback: a scheduler typing TRAINING onto a ground row means
   training whether or not an input backs it (owner, 26 Aug 26 — "types the
   exact key words"). DERIVED from the shiftHard flags above so the two can
   never disagree; word-boundary so "OTHER SQUADRON VISIT" trips on its word
   deliberately (the owner chose the keywords knowing they are common words).
   DRIFT SEAM: testing/refwin.ts restates this doctrine as literal regexes —
   reshift's RH ground-label list hand-copies THIS keyword list, and reinput
   states the AMBER complement (the MEETING literal, since 26 Aug 26 when an
   unknown type stopped reading soft on a shift: everything not explicitly
   soft is hard in both engines, fail closed). So: a new shiftHard type
   updates this derived body silently but leaves reshift's RH literal stale;
   a type MOVED to the amber side must also join reinput's soft literal.
   Change one, walk all three. */
const SHIFT_HARD_RE=new RegExp('\\b('+Object.keys(INPUT_META).filter((k:any)=>INPUT_META[k].shiftHard)
  .map((k:any)=>k.toUpperCase().replace(/\s+/g,'\\s+')).join('|')+')\\b','i');
export function shiftHardLabel(s:any){return SHIFT_HARD_RE.test(String(s==null?'':s));}
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
/* SANS AVAILABILITY IS UNAVAIL BUT NOT AWAY (owner, 14 Aug 26) — it is a
   POSITIVE record (what he IS offering), so it must not strike him out of
   the palette or close a slot the way leave/medical/OD do; sansGate in
   avail.ts is what actually judges a flying/OFT/AMT seat against it. isUnavail
   itself is left alone (see its own comment) — the offer semantics live here,
   as an explicit carve-out at the one call site that decides "away". */
/* the Fly leg reads ACTIONED ('g'/'u'), never 'r' — a removed Fly-with is
   dormant (owner, 26 Aug 26) and must not strike the man out of the palette */
export function isAway(inp:any){return (isUnavail(inp.type)&&!isSansAvail(inp.type))||(isFly(inp.type)&&(inp.acc==='g'||inp.acc==='u'));}
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
   commitment, "Fly with" included, so it clashes and consumes brief/debrief time
   exactly like an Appointment does.
   DERIVED from INPUT_META, in its declaration order, so the list a scheduler
   picks from and the rules the engine applies cannot disagree about which
   types exist. "Downchit" and "Detachment" were removed on 10 Aug 26 —
   OML / ATT B / ATT C carry the medical meaning now, and OD the overseas one.
   AMENDMENT (owner, 14 Aug 26): SANS-scoped offers were reinstated as the
   'SANS Availability' type — restricted to SANS aircrew, and read only by
   sansGate (avail.ts), not by the general clash/brief machinery the deleted
   offer types once shared with every other commitment. See
   docs/engine-rules.md §SANS availability. */
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
/* the SANS availability type — see the INPUT_META entry's comment */
export function isSansAvail(t:any){const m=inpMeta(t); return !!m&&m.grp==='sans';}
/* THE ALL-DAY DEFAULT A BRAND-NEW INPUT OPENS WITH (owner, 22 Aug 26 —
   "untick all day by default for all u see under duty and other commitments
   except sans availability"). Every "Duty & other commitments" type BUT SANS
   Availability opens with All day OFF, because those are timed commitments the
   aircrew states real hours for (a meeting, an appointment, a training slot).
   Leave, medical and SANS Availability keep All day ON: an absence or a
   whole-window availability reads all-day far more often than not. Keyed off
   the SAME dropdown grouping the legend uses (typeGroup 'other' is exactly the
   "Duty & other commitments" heading) so the two can never drift.
   A NEW-INPUT default ONLY — it decides what an empty add form starts on, and
   never touches the saved allday of a record already on file. */
export function defaultAllday(t:any){return !(typeGroup(t)==='other'&&!isSansAvail(t));}
/* DOES THIS INPUT TYPE BEAR CREW REST? (owner, 21 Aug 26 — "everything in
   duty and commitments affects crew rest if the person is flying… do not
   include personal, sans availability"). The "Duty & other commitments"
   dropdown group minus those two: Training, CSE, Meeting, Fly with,
   Appointment, Duty, OD, Other. Leave and medical types are out of scope by
   the same ruling — a downchit is not a working day.
   NAMING TRAP: the exclusion is the TYPE spelled 'Personal', not the
   "personal inputs" feature — every type in this file is a personal input.
   validate.ts additionally requires TYPED times (a window narrower than
   all-day): the owner's words were "use the timings u see", and an all-day
   record has none. The patched reference mirrors this set as an inline
   regex in refwin.ts:reirest() — change one, change both. */
export function restsInput(t:any){const m=inpMeta(t);
  if(!m||m.grp==='leave'||m.grp==='med')return false;
  const c=inpType(t); return c!=='Personal'&&c!=='SANS Availability';}
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
   automatically go in") — EXCEPT one a scheduler has since REMOVED, which is
   dormant (acc 'r', the 26 Aug 26 rule — see inputDormant below).
   It used to be `isUnavail(type) || acc==='u' || …`,
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
export function inputFlags(inp:any){return !inputDormant(inp)&&!(inp.acc==='g'&&!inp.allday);}
/* A REMOVED INPUT IS DORMANT (owner, 26 Aug 26 — tested the SC-grading
   preview, removed an accepted Training back to Personal Inputs and it still
   flagged: "if it goes there, stop it from flagging anything, until its
   added back to ground programme"). unacceptInput parks the input as
   acc 'r' — still listed in Personal Inputs, Accept offered again — and this
   predicate is the ONE body that blanks it out of the engine: inputFlags
   above (the validator's day-blind gate, which is ALSO refwin's reference
   seed filter, so the reference simply never receives a dormant input and
   parity cannot diverge) and events.ts's inpShow (day.input + the midnight
   tails + the crew picker, which reads the same gate). The other acc states
   keep their voices: 'g' landed (the row speaks, or the raw voice for
   all-day), 'u' actioned to Unavailable (bars duties), and undefined —
   never landed at all, e.g. filed onto a published day — still counts, which
   is why dormancy is this explicit marker and not "no acc". */
export function inputDormant(inp:any){return !!inp&&inp.acc==='r';}
/* inputs use machine-readable date + minute fields so the validator can reason about them.
   s/e are minutes-from-midnight; allday inputs cover the whole day. */
/* The `mod` stamps are spread either side of the demo week's input deadline on
   purpose (owner, 9 Aug 26 — see isLateInput below). At the standard 14 days
   the week of Mon 13 Jul is due by Mon 29 Jun, so this seed shows every case
   a reader needs to see: comfortably early (pike, taipan, vinci, bruise),
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
  {person:'taipan',date:'Jul 15', allday:true,               type:'OL',          remarks:'Overseas leave — off island',mod:'2026-06-22'},
  {person:'nasty', date:'Jul 14', allday:true,               type:'LL',          remarks:'Local leave',  mod:'2026-06-30'},
  {person:'shrek', date:'Jul 14', allday:true,               type:'OIL',         remarks:'OIL — CO approved, post-detachment',mod:'2026-07-02'},
  {person:'sufa',  date:'Jul 13', endDate:'Jul 17', allday:true, type:'ATT C',   remarks:'Medically down till 17 Jul', mod:'2026-07-12'},
  {person:'bruise',date:'Jul 13', allday:true,               type:'Fly with',    remarks:'Keen for any wave',mod:'2026-06-20'},
  {person:'vinci', date:'Jul 13', allday:false, s:540, e:1020,type:'Meeting',     remarks:'Desk / staff work',mod:'2026-06-26'},
  {person:'pike',  date:'Jul 15', endDate:'Jul 17', allday:true, type:'OD',       remarks:'Overseas duty — exercise, off island',mod:'2026-06-18'},
  {person:'yeti',  date:'Jul 13', allday:false, s:600, e:660, type:'Appointment', remarks:'HSP blood panel',mod:'2026-07-06'},
];
export const DATES=['Jul 13','Jul 14','Jul 15','Jul 16','Jul 17','Jul 18','Jul 19'];  // Mon..Sun index → date label
/* the pristine week-1 inputs + date labels, captured here at module load —
   before initStore mints iids or seeds demo SANS — so the week selector can
   reload this week clean (state/store.ts:loadWeek → engine/weeks-data.ts). */
export const WEEK1_INPUTS_SNAP=JSON.stringify(INPUTS);
export const WEEK1_DATES=[...DATES];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* THE YEAR THE UNLABELLED DATES BELONG TO (owner, 12 Aug 26 — leave that runs
   into the new year). The stored labels leave the LOADED week's year implicit
   so an ordinary same-week date reads 'Jul 14' with no clutter; a date in any
   OTHER year is stored WITH its year ('Jan 3 2027' — see fmt in
   ui/inputedit.tsx), and dateOrd reads it back below. Derived from CURWEEK so
   the convention tracks whatever week is loaded — there is only ever one, and
   it falls back to the demo's 2026 if CURWEEK is unreadable. */
/* MEMOISED 25 Aug 26 — profiled at a year-plus of INPUTS (5,000 rows), this
   function and the weekStartISO() string-build under it were, with dateOrd's
   own parsing, ~80% of validate() and loadWeek(): every inputCoversDate call
   re-derived the same year from the same CURWEEK. The memo keys on CURWEEK
   itself, so a week change re-derives on the very next call — it cannot serve
   a stale year — and the derivation is byte-identical to the original. */
let byWk:any, byY=0;
export function baseYear(){
  if(CURWEEK!==byWk||byWk===undefined){byWk=CURWEEK;const y=+String(weekStartISO()).slice(0,4);byY=isFinite(y)&&y?y:2026;}
  return byY;
}
/* 'Jul 18' → 20260718, a sortable ordinal that ORDERS ACROSS YEARS. Spans used
   to be compared through DATES.indexOf, which returns -1 for any date outside
   the loaded week: a detachment running Jul 15→24 then covered NO day at all
   and the man read as available all week. Comparing the dates themselves clamps
   at both ends and does not care whether an endpoint is in the week.
   The ordinal now leads with the YEAR (year*10000 + month*100 + day) so a leave
   running Dec 28 → Jan 3 sorts FORWARDS: without the year 'Jan 3' read as 103,
   BEHIND 'Dec 28' at 1228, so the span covered nothing (owner, 12 Aug 26). A
   label may carry a trailing 4-digit year for a date outside baseYear()'s year;
   without one it belongs to `fb` — an INPUT ROW'S OWN anchor year (`yr`, the
   loaded year the row was created or last edited under; owner bug, 24 Aug 26)
   — falling back to baseYear() when no anchor is given. Before `fb` a bare
   label re-resolved against whatever week was CURRENTLY loaded, so an input
   filed for Jul 13 2026 covered Jul 13 of any year the user scrolled to. */
/* The label PARSE is memoised (25 Aug 26, same profile as baseYear above):
   a schedule pass calls this millions of times over the same handful of day
   and input labels, and the split/indexOf parse was the single hottest line
   in the app. Only the parse is cached — a given string always parses the
   same, so the memo is pure; the YEAR fallback (label year → row anchor →
   baseYear) still resolves per call, exactly as before, so nothing here can
   go stale when the loaded week or a row's `yr` changes. The map is capped:
   labels are typed by users and effectively bounded, but a runaway feed must
   degrade to a cleared cache, never to unbounded memory. */
const ORD_MEMO=new Map<any,any>();
export function dateOrd(lbl:any,fb?:any){
  let c=ORD_MEMO.get(lbl);
  if(c===undefined){
    const p=String(lbl==null?'':lbl).trim().split(/\s+/);
    const m=MONTHS.indexOf(p[0]), d=+p[1];
    c=(m<0||!isFinite(d))?null:{md:(m+1)*100+d,yl:p.length>2&&isFinite(+p[2])?+p[2]:null};
    if(ORD_MEMO.size>9000)ORD_MEMO.clear();
    ORD_MEMO.set(lbl,c);
  }
  if(c===null)return null;
  const y=c.yl!=null?c.yl:(isFinite(+fb)&&+fb>0?+fb:baseYear());
  return y*10000+c.md;
}
/* Does this input cover the loaded-week day labelled `dt`? Both sides resolve
   to REAL dates: dt through the week-label convention (bare = baseYear; a day
   outside the loaded week's own year is labelled WITH its year — weeks-data.ts
   weekLabels), the input's labels through its own `yr` anchor. The single-day
   arm used to be bare string equality, which is exactly how a 2026 input
   matched the same words meaning a 2027 day; it keeps string equality only as
   the fallback for a label no calendar can parse, where it can do no harm. */
export function inputCoversDate(inp:any,dt:any){
  const t=dateOrd(dt), a=dateOrd(inp.date,inp.yr);
  if(!inp.endDate){ if(t==null||a==null)return inp.date===dt; return t===a; }
  const b=dateOrd(inp.endDate,inp.yr);
  if(t==null||a==null||b==null)return false;
  return t>=a&&t<=b;
}
/* The loaded day index a label resolves to — BY DATE VALUE, never by string.
   DATES.indexOf(inp.date) was the other half of the cross-year bug: 'Jul 13'
   anchored to 2026 string-matched the 'Jul 13' of a loaded 2027 week, so the
   auto-land pass planted last year's input on this year's ground programme.
   Falls back to the plain indexOf only for an unparseable label. */
export function dateIx(lbl:any,yr?:any){
  const o=dateOrd(lbl,yr);
  if(o==null)return DATES.indexOf(lbl);
  for(let i=0;i<DATES.length;i++){ if(dateOrd(DATES[i])===o)return i; }
  return -1;
}
/* THE SANS RECORD COVERING one person on one day, or null — the single place
   that finds it, so sansGate (avail.ts), the badge below and the palette /
   week / board readers all see the same record. Returns the WHOLE input row
   (owner rework, 14 Aug 26 — it used to return just the `sans` payload): the
   offered events are flags in `rec.sans` ({f?:true, o?:true, a?:true}, absent
   = not offered) and the ONE shared window lives in the row's own standard
   allday / half / s / e fields, read through sansWindow below. */
export function sansAvailOn(id:any,dt:any){
  return INPUTS.find((x:any)=>x.person===id&&isSansAvail(x.type)&&inputCoversDate(x,dt))||null;
}
/* the record's one offered window in minutes, [s,e]. AM/PM are the same
   halves the standard template writes (HALF_AM/HALF_PM in ui/inputedit.tsx —
   00:00–12:00 / 12:01–23:59); a malformed record with neither flag nor both
   times fails OPEN to the whole day, the same call inpWin makes for a thin
   absence — the two readers must not disagree about what a broken row means. */
export function sansWindow(rec:any){
  if(!rec||rec.allday)return [0,1439];
  if(rec.half==='am')return [0,720];
  if(rec.half==='pm')return [721,1439];
  if(rec.s==null||rec.e==null)return [0,1439];
  /* roll an overnight offer the way inpWin does (inputs.ts, its own comment):
     the write path permits e<s for every half-day type, SANS included, so an
     offer typed 22:00–02:00 stores [1320,120]; left un-rolled, sansGate's
     containment could never read a night slot as covered. The two readers must
     not disagree about what an overnight row means. */
  return [rec.s,rec.e<rec.s?rec.e+1440:rec.e];
}
/* which events the record offers, as the scheduler reads them — "F/O/A",
   "F/O", "A"… Fixed f,o,a order regardless of tick order, so the same person
   reads the same way on the palette, the week group and the board panel. */
const SANS_ABBR:any={f:'F',o:'O',a:'A'};
export function sansLetters(rec:any){
  const ev=(rec&&rec.sans)||{};
  return ['f','o','a'].filter((k:any)=>ev[k]).map((k:any)=>SANS_ABBR[k]).join('/');
}
/* the badge beside a SANS member's name — letters plus the one window:
   "F/O/A" (all day), "F/O · AM", "A · 08:00–12:00". '' when no record is
   filed — every caller already treats an empty badge as "nothing to print"
   (see e.g. sbSansPanel/sansAvailHTML). */
export function sansBadge(id:any,dt:any){
  const rec=sansAvailOn(id,dt); if(!rec)return '';
  const w=rec.allday?'':rec.half==='am'?' · AM':rec.half==='pm'?' · PM'
    :(rec.s!=null&&rec.e!=null?` · ${hm24(rec.s)}–${hm24(rec.e)}`:'');
  return sansLetters(rec)+w;
}
/* ---- LATE INPUTS (owner, 9 Aug 26) ---------------------------------------
   The squadron wants members' inputs in before the week is planned, and wants
   a late one to SAY it is late wherever it appears. The deadline is the
   Monday of the week the INPUT'S OWN first day falls in, minus
   VCONF.inputLead days, and the deadline day itself is still on time — "no
   later than a week prior" means the 10th is fine for the week of the 17th,
   the 11th is not.

   THE DEADLINE RUNS WITH THE INPUT'S OWN WEEK (owner, 24 Aug 26 — "it's a
   running deadline"). It used to be computed from the LOADED week (CURWEEK),
   which was an invariant while every surface only ever drew the loaded
   week's inputs — and became silently wrong the day the Inputs page went
   global (22 Aug 26): a leave for 24 Dec filed four months early wore a
   LATE tag because the AUGUST week being viewed had a long-expired
   deadline. A span is judged by its FIRST day's week — the earliest week it
   touches, whose planning the change could have disturbed.

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
/* a week-start ISO date → that week's input deadline (its Monday minus the
   lead), '' in for '' out so unknown stays unknown */
function dueOfWeekISO(ws:any){
  if(!ws)return '';
  const n=Math.max(0,+VCONF.inputLead||0);
  const t=Date.UTC(+ws.slice(0,4),+ws.slice(5,7)-1,+ws.slice(8,10))-n*86400000;
  const d=new Date(t);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
}
/* the last day an input for the LOADED week (or the given week key) may be
   touched and still count as on time — kept for callers that reason about a
   week rather than an input (probe-bridge, tests); the mark itself judges
   each input by inputOwnDueISO below */
export function inputDueISO(wk?:any){ return dueOfWeekISO(weekStartISO(wk)); }
/* the Monday of the week the input's own FIRST day falls in, resolved
   through the row's anchor year (dateOrd + inp.yr, the 24 Aug 26 convention)
   so 'Jul 13' filed for 2027 is judged against 2027's week. '' when the date
   is unreadable — an unknown week is an unknown deadline, and unknown never
   accuses (the same rule inputStampISO already applies to the stamp). */
export function inputWeekStartISO(inp:any){
  const o=dateOrd(inp&&inp.date,inp&&inp.yr); if(o==null)return '';
  const ms=Date.UTC(Math.floor(o/10000),Math.floor(o/100)%100-1,o%100);
  const d=new Date(ms-(((new Date(ms).getUTCDay()+6)%7)*86400000));
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
}
/* the running deadline: the last day THIS input may be touched and still
   count as on time, wherever the viewer happens to be */
export function inputOwnDueISO(inp:any){ return dueOfWeekISO(inputWeekStartISO(inp)); }
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
  const s=inputStampISO(inp), due=inputOwnDueISO(inp);
  return !!s&&!!due&&s>due;
}
/* '2026-08-11' → '11 Aug', the form the rest of the app prints dates in */
export function isoLabel(iso:any){
  if(!isISO(iso))return '';
  return `${+String(iso).slice(8,10)} ${MONTHS[+String(iso).slice(5,7)-1]||''}`.trim();
}
/* The date tail the Inputs page and the Leave War sync both append to a
   personal input's remarks, so a reader sees how long it runs without anyone
   typing it and nobody has to repeat the type — the type column already says
   LL/OL (owner, Aug 26; extended to synced leave and single days 18 Aug 26).
   A span reads "till 17 Jul" (its LAST day). A single day reads "till 15 Jul"
   when `single` is 'till', "on 15 Jul" when 'on', or nothing when 'none'.
   The Inputs CALENDAR passes 'till' (owner, 18 Aug 26 — "a one-day input should
   still show till <date>"): its picker fires on the first click of a two-click
   range, and "till 13 Jul" showing then updating to "till 18 Jul" reads
   consistently, where the old "on 13 Jul" that VANISHED on the second click did
   not — which is why 'none' (no one-day token) existed and the calendar no
   longer needs it. A SYNCED leave, whose span is already settled when it mints,
   passes 'on'. Dates are ISO 'yyyy-mm-dd'. */
export function remarksDateTail(startISO:any, endISO:any, single:'on'|'none'|'till'){
  if(!endISO||endISO===startISO){
    if(single==='none'||!isISO(startISO))return '';
    return `${single==='till'?'till':'on'} ${isoLabel(startISO)}`;
  }
  return `till ${isoLabel(endISO)}`;
}
/* The date token, matched WHEREVER it sits in a remark — not anchored to the
   end. That is the difference the owner asked for (18 Aug 26): "if the user has
   till 13 Jul Bangkok, when the date changes the Bangkok remains." The token is
   the calendar's to rewrite; everything around it — before OR after — is the
   typist's and is kept.
   BOUNDED AT BOTH ENDS (review fix, 19 Aug 26): without \b the token matched
   MID-WORD — "Reunion 12 Jul dinner" matched the "on 12 Jul" inside "Reunion"
   and a re-pick rewrote it to "Reunitill 18 Jul dinner", destroying the
   typist's word. The trailing \b keeps "till 15 July" (the month written out)
   from being half-eaten the same way — an unrecognised spelling is left alone
   and the fresh token appended, which is the lesser wrong. */
const DATE_TOKEN=/\b(?:till|on)\s+\d{1,2}\s+[A-Za-z]{3}\b/i;
/* Rewrite (or insert, or remove) the date token inside a remark IN PLACE,
   leaving the surrounding prose untouched. `single` is passed straight to
   `remarksDateTail`: the Inputs calendar passes 'till' (a one-day pick reads
   "till <that day>"), a synced leave passes 'on'. When the desired
   token is empty and one is present it is dropped and the gap tidied; when it
   is present elsewhere it is replaced; otherwise it is appended. */
export function withRemarksTail(remark:any, startISO:any, endISO:any, single:'on'|'none'|'till'){
  const tok=remarksDateTail(startISO,endISO,single);
  const s=String(remark==null?'':remark);
  if(DATE_TOKEN.test(s)){
    return s.replace(DATE_TOKEN,tok).replace(/\s{2,}/g,' ').trim();
  }
  if(!tok)return s.trim();
  const head=s.trim();
  return head?`${head} ${tok}`:tok;
}
/* what the mark says when you hover it — plain enough for the squadron */
export function lateNote(inp:any){
  if(!isLateInput(inp))return '';
  /* dates outside the loaded week's own year carry it — 'Jan 4 2027' — the
     same convention every label in the app follows (weekLabels, fmt) */
  const lbl=(iso:any)=>{const l=isoLabel(iso); const y=+String(iso).slice(0,4); return l&&y!==baseYear()?`${l} ${y}`:l;};
  return `Late input — last changed ${lbl(inputStampISO(inp))}, after the ${lbl(inputOwnDueISO(inp))} deadline for its week of ${lbl(inputWeekStartISO(inp))}.`;
}

