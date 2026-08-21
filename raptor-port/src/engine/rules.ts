import { hhmm, parseHM, lgT } from './time'
import { store } from './hooks'
/* =====================================================================
   VALIDATION ENGINE — automatically flags scheduling conflicts.
   Thresholds are taken from the 149/142 aircrew sheet (BRF 02:20, crew
   rest 08:00, min turn 20). Rules are pure functions; re-run on any edit.
   ===================================================================== */
export const VCONF:any={briefLead:140, dur:85, step:60, dekit:30, minTurn:20, tightTurn:120, crewRest:720,
  debrief:120,      // land + 2h — the flight debrief window
  reportLead:180,   // report to squadron 3h before T/O
  longDay:720,      // more than 12h on the books = long work day
  epBrief:15,       // an EP sim briefs 15 min prior
  simDebrief:30,    // sim debrief runs 30 min after
  amtDebrief:30,    // AMT DEBRIEF row + 30 min
  openEnd:60,       // a row with a start and no end is assumed to run an hour
  maxRun:6,         // most consecutive days on the programme before a break day is due
  /* The latest a crew can show and still make the jet (owner, 6 Aug 26). A
     `late show` remark excuses a man from the published in-time and from the
     brief, so crew rest expiring after brief time is fine — but not past this
     line, because he cannot walk, kit up and start engines in less than it.
     Rest still running at T/O − showLead is a HARD breach: he is not late to
     the brief, he is unable to make the flight. */
  showLead:60,      // latest show, minutes before T/O
  /* How many days before the week starts a member's input is due (owner,
     9 Aug 26; two weeks rather than one, owner 9 Aug 26). The deadline is
     the week's Monday minus this many days, and the day itself is still on
     time: at 14, an input for the week of Mon 17 Aug is due by Mon 3 Aug,
     and one last touched on the 4th is LATE. Unlike every other setting here
     it grades no flying — it marks the input, and nothing else, and
     downchits are exempt from it entirely (engine/inputs.ts). */
  inputLead:14,     // member input deadline, days before the week's Monday
  scDayFrom:7*60,   // an SC shift wholly inside this window is a DAY shift
  scDayTo:19*60,
  /* PROMOTED FROM HARD-CODED LITERALS (owner, 21 Aug 26 — "I don't wanna
     hard code too many things and have no flexibility"). Both were fixed
     numbers buried in events.ts/avail.ts; at these defaults the engine's
     behaviour is byte-identical to before (and to the reference), so parity
     is untouched — the gain is that the Logic tab can now move them. */
  aarNight:19*60,   // a bare AAR is NIGHT when the sortie lands after this
  simLen:90,        // a sim row with no end time is assumed to run this long
  /* WEEKEND / PUBLIC-HOLIDAY DUTY EARNS OIL (owner, 16-17 Aug 26 — Leave War
     sync wire 4). A duty stood on a non-working day credits OIL in Leave War:
     an SC AM or PM shift is half a day, a whole-day shift a full one, and a
     plain duty row goes by its written hours — this many minutes or more is a
     FULL day (1.0 OIL), under it a HALF (0.5). "6 hours 1 min or more" is the
     owner's own line (17 Aug 26, corrected from a plain 6h the same day):
     exactly six hours is still a HALF day. Like inputLead this grades no
     flying — engine/oil.ts is its only reader, at publish time. */
  oilFullMin:6*60+1}; // scheduled duty minutes that make a FULL day of OIL
/* SC currency. A shift that sits wholly inside 07:00–19:00 is a DAY shift and
   needs SC DAY; anything reaching outside it is a NIGHT shift and needs SC
   NIGHT. Crew change times move, so the window is read off the shift as
   scheduled rather than assumed from the AM/PM label. */
/* the SC day window is a setting, not a constant — it is edited on the Logic tab
   like every other threshold, so it lives in VCONF with the rest of them */
export const SC_DAY_FROM=7*60, SC_DAY_TO=19*60;   // squadron standard, kept for reference
/* What an SC MAIN shift cannot share a minute with. A flight, a sim, a duty post
   or another shift means the man is wanted in two places — hard. A ground event
   or a squadron programme item is not: you can still give academics to the man
   standing SC, so that pairing is only an advisory (SHIFT_SOFT). The crew picker
   reads this same table, so what bars a name from an armed SC slot and what the
   engine flags afterwards can never drift apart. */
/* Every event kind, and whether an SC MAIN shift clashing with it is a Warning
   (true) or an Advisory (false). A full map rather than a sparse one so the Logic
   tab can offer every kind as a toggle — the engine only ever tests truthiness. */
export const SHIFT_HARD:any={fly:true,sim:true,duty:true,shift:true,ground:false,prog:false};
/* =====================================================================
   EDITABLE RULES
   The engine reads its thresholds out of VCONF and its clash grading out of
   SHIFT_HARD. Both are plain objects, so the Logic tab edits them in place and
   every rule that reads them changes with them — nothing is duplicated.

   RULE_STD is the squadron standard, captured before anything can touch it. It
   is the thing "Reset to standard" restores, and the thing a modified setting is
   measured against. Overrides are saved locally and reloaded on next open.

   Deliberately NOT here: no rule versioning (a published day is not stamped with
   the rules it was flown under) and no second-person approval. The squadron
   asked for neither. What IS kept: only an admin can edit, a modified value is
   labelled wherever it appears, and the week banner says so.
   ===================================================================== */
export const RULE_STD:any=Object.freeze({v:JSON.parse(JSON.stringify(VCONF)),
                              s:JSON.parse(JSON.stringify(SHIFT_HARD))});
/* every setting the Logic tab may edit: label, unit, and the bounds outside
   which a value is not a squadron rule but a typo */
export const RULE_SPEC:any={
  step:      {t:'Step before take-off',      u:'min', lo:0,  hi:240},
  dekit:     {t:'Dekit after landing',       u:'min', lo:0,  hi:240},
  briefLead: {t:'Flight brief before T/O',   u:'min', lo:0,  hi:480},
  reportLead:{t:'Nominal report before T/O', u:'min', lo:0,  hi:480},
  showLead:  {t:'Latest show before T/O',    u:'min', lo:0,  hi:480},
  debrief:   {t:'Flight debrief after land', u:'min', lo:0,  hi:480},
  crewRest:  {t:'Crew rest',                 u:'min', lo:240,hi:1440},
  tightTurn: {t:'Tight turn threshold',      u:'min', lo:0,  hi:480},
  longDay:   {t:'Long work day',             u:'min', lo:240,hi:1440},
  openEnd:   {t:'Assumed length, no end time',u:'min',lo:5,  hi:480},
  epBrief:   {t:'EP sim brief',              u:'min', lo:0,  hi:240},
  simDebrief:{t:'Sim debrief',               u:'min', lo:0,  hi:240},
  amtDebrief:{t:'AMT debrief',               u:'min', lo:0,  hi:240},
  scDayFrom: {t:'SC day window opens',       u:'time',lo:0,  hi:1439},
  scDayTo:   {t:'SC day window closes',      u:'time',lo:0,  hi:1439},
  aarNight:  {t:'Bare AAR is night after',   u:'time',lo:0,  hi:1439},
  simLen:    {t:'Assumed sim length, no end time',u:'min',lo:15,hi:480},
  oilFullMin:{t:'Weekend duty full day (OIL)',u:'min',lo:60, hi:720},
  maxRun:    {t:'Max days worked in a row',  u:'days',lo:1,  hi:14},
  inputLead: {t:'Member input deadline before the week',u:'days',lo:0,hi:60},
  minTurn:   {t:'Minimum turn (unused)',     u:'min', lo:0,  hi:480},
  dur:       {t:'Default sortie length (unused)',u:'min',lo:0,hi:480},
};
export const KIND_LABEL:any={fly:'a flight',sim:'a sim',duty:'a duty post',shift:'another shift',
  ground:'a ground event',prog:'a programme item'};
/* a setting reads as a clock time or as a duration */
export const ruleFmt=(k:any,v:any)=>{const u=RULE_SPEC[k]&&RULE_SPEC[k].u;
  return u==='time'?hhmm(v):u==='days'?`${v} day${v===1?'':'s'}`:lgT(v);};
export const ruleParse=(k:any,txt:any)=>{
  const s=String(txt).trim();
  /* clock fields tolerate the squadron's own spellings — "1900", "19:00",
     "1900H", "19:00L" all mean the same time (owner, 21 Aug 26: "whats the
     tolerance in detecting data that are similar, like 0900 vs 0900H").
     The suffix is stripped, not parsed: H and L both mean local here. */
  if(RULE_SPEC[k]&&RULE_SPEC[k].u==='time'){const m=parseHM(s.replace(/\s*[HL]$/i,'')); return m==null?null:m;}
  /* a day count is a plain number — "6", "6 days" — never minutes */
  if(RULE_SPEC[k]&&RULE_SPEC[k].u==='days'){const m=s.match(/^(\d+)/); return m?+m[1]:null;}
  /* "12h", "2h20", "90", "90 min" all mean the same thing */
  const hm=s.match(/^(\d+)\s*h\s*(\d{1,2})?$/i);
  if(hm)return +hm[1]*60+(+(hm[2]||0));
  const n=s.match(/^(\d+(?:\.\d+)?)\s*(?:min|m)?$/i);
  return n?Math.round(+n[1]):null;};
export function ruleOff(k:any){return VCONF[k]!==RULE_STD.v[k];}
export function kindOff(k:any){return !!SHIFT_HARD[k]!==!!RULE_STD.s[k];}
export function rulesOffCount(){
  return Object.keys(RULE_SPEC).filter(ruleOff).length
       + Object.keys(KIND_LABEL).filter(kindOff).length;}
/* persistence — only what differs from standard is stored, so a later change to
   the standard is picked up rather than silently overridden by a stale copy */
export function rulesSave(){
  const v:any={},s:any={};
  Object.keys(RULE_SPEC).forEach((k:any)=>{if(ruleOff(k))v[k]=VCONF[k];});
  Object.keys(KIND_LABEL).forEach((k:any)=>{if(kindOff(k))s[k]=!!SHIFT_HARD[k];});
  store.set('rules',(Object.keys(v).length||Object.keys(s).length)?{v,s}:null);}
export function rulesLoad(){
  const r=store.get('rules',null); if(!r)return;
  /* isFinite("840") is true — a string sailed through and every arithmetic on
     it became concatenation, poisoning REST[] and the crew-rest maths. Storage
     is editable by hand, so it is treated as untrusted input. */
  Object.keys(r.v||{}).forEach((k:any)=>{const sp=RULE_SPEC[k], n=r.v[k];
    if(sp&&typeof n==='number'&&isFinite(n)&&n>=sp.lo&&n<=sp.hi)VCONF[k]=n;});
  /* hasOwnProperty, not `in`: `in` walks the prototype chain, so a stored blob
     carrying "toString" or "constructor" as a key wrote those onto SHIFT_HARD
     as real own properties (audit, 12 Aug 26). Grading was unaffected — only
     the six real kinds are ever looked up — but the Logic page counted them
     and told the squadron "10 kinds are hard" when four are, and any future
     string coercion of SHIFT_HARD would have thrown. Only reachable by hand-
     editing storage, which is exactly the input a LOAD path has to survive. */
  Object.keys(r.s||{}).forEach((k:any)=>{if(Object.prototype.hasOwnProperty.call(KIND_LABEL,k))SHIFT_HARD[k]=!!r.s[k];});}
export function rulesReset(){
  Object.keys(RULE_STD.v).forEach((k:any)=>VCONF[k]=RULE_STD.v[k]);
  Object.keys(RULE_STD.s).forEach((k:any)=>SHIFT_HARD[k]=RULE_STD.s[k]);
  store.set('rules',null);}
