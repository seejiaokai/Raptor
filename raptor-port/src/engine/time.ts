import { VCONF } from './rules'
export const toMin=(t:any)=>{const[h,m]=t.split(':').map(Number);return h*60+m};
export const fromMin=(m:any)=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
export function hhmm(m:any){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
/* ONE CLOCK, WITH THE COLON (owner, 30 Aug 26, reversing the previous day's
   4-digit ask — "I saw wrongly … most of the timing format is 08:00. Change it
   back and make sure everything follows that format consistently"). hh:mm IS
   the app's native form: the reference-parity gate pins hhmm / fmtT / fmtTxt
   to it, txtSet commits through hhmm, and the week/warnings/CSV never left it.
   What broke ranks was legacy data — duty templates minted compact '0700'
   strings that the board then echoed raw beside '07:00' cells. fmtHM is the
   display fold for exactly that: it takes a STORED time string (either form —
   parseHM reads both, which is also why the rules engine never cares) and
   prints the one canonical hh:mm, blanking a non-time so an empty cell stays
   empty rather than reading '00:00'. Renderers wrap stored time strings in it;
   values already produced by hhmm/fmtT need nothing. */
export function fmtHM(s:any){const m=parseHM(s);return m==null?'':hhmm(m);}
/* A window whose end reads EARLIER than its start has crossed midnight — an
   overnight duty, a night sortie landing after 00:00. Left as-is the interval
   is inverted and `overlap` can never match it, which silently switched every
   check off for that leg. Roll the end into the next day instead.
   `openEnd` covers a row with a start and no end at all: those used to produce
   no event whatsoever, so an open-ended meeting sitting on top of a take-off
   went unflagged. */
export function win(st:any,en:any,openEnd?:any){
  if(st==null)return null;
  let e=(en==null)?st+(openEnd||VCONF.openEnd):en;
  if(e<st)e+=1440;
  return [st,e];
}
/* land + 2h on a night wave, or T/O − 3h before dawn, can run past midnight in
   either direction — wrap so the clock never prints 25:10 or -1:40. */
export const hm24=(m:any)=>hhmm(((Math.round(m)%1440)+1440)%1440);
/* Subtracting a brief lead from an early T/O runs off the bottom of the
   clock, and `fromMin` (which this used to call) does not wrap a negative:
   minus('01:00',140) came back "-2:-20", printed straight onto the board's B
   column and into the CSV's Brief field. hm24 wraps for exactly this reason,
   so route through it — the brief now reads 22:40, the previous evening. It
   sits below hm24 rather than beside toMin/fromMin because it depends on it. */
/* An UNREADABLE time has no lead to subtract, and saying so beats printing
   arithmetic on a missing number: toMin('') is NaN, so this returned the
   string "NaN:NaN" — which reached the board's and the week's B ghost, the
   view-only week's B column and the CSV's Brief field on EVERY line `+ Line`
   mints, since a new line starts with a blank take-off (audit, 12 Aug 26).
   Empty in, empty out; the ghost then simply offers nothing to accept. */
export const minus=(t:any,n:any)=>{const b=parseHM(t);return b==null?'':hm24(b-n);};
export function parseHM(s:any){ if(s==null||s==='')return null; const t=String(s).replace(/[hH]$/,'').replace(':',''); if(!/^\d{3,4}$/.test(t))return null; const n=+t; return Math.floor(n/100)*60+(n%100); }
/* IS THIS A CLOCK TIME A HUMAN COULD MEAN? parseHM answers only "does it look
   like 3–4 digits", and deliberately stays that way: it is the engine's shared
   reader, used by the Logic tab's rule parsing and by two prose scrapers, and
   its loose semantics are pinned by tests and by the reference. So the RANGE
   question lives here instead, and only the WRITE paths ask it (slots.ts's
   txtSet, inputedit.tsx's cells) — which is where the owner's brief guard
   already sits.
   Two things are refused, both of them values no scheduler means:
     · a minute component of 60–99. `1290` is a fat-finger for `1230`, and
       parseHM rolls it to 13:30 — a time an hour later than the one typed,
       saved silently. That is the commonest of these by far.
     · anything past 24:00. `9999` became 100:39, which printed as a take-off,
       produced a "32h05 work day" note whose own printed ends contradicted
       it, and a crew-rest line reading "-5h-5" rest.
   `2400` stays legal — it is midnight, and audit-c-times.test.ts pins it. */
export function hmOK(s:any){const m=parseHM(s); if(m==null)return false;
  const t=String(s).replace(/[hH]$/,'').replace(':','');
  return (+t)%100<60 && m<=1440;}
export const overlap=(a1:any,a2:any,b1:any,b2:any)=>a1<b2&&b1<a2;
/* 720 → 12h · 140 → 2h20 · 30 → 30 min */
export function lgT(m:any){const h=Math.floor(m/60),x=m%60;
  return h&&x?`${h}h${String(x).padStart(2,'0')}`:h?`${h}h`:`${x} min`;}
