/* ---- THE MEDICAL TRACKER'S DERIVATIONS (owner, 27 Aug 26) -----------------
   Who is medically down as of a date, who owes an upchit, who upchitted —
   and the two TRIM plans the write path applies when an upchit or a newer
   medical input shortens an older one.

   Everything here is DERIVED AT READ TIME from INPUTS plus an explicit as-of
   ordinal (dateOrd form, y*10000+m*100+d). Nothing is stored and nothing
   runs on load: "auto-moves to Pending Upchit on expiry" is simply what
   pendingUpchits answers the day after a downchit's end, and a new medical
   input removes the pending puck because the answer changes — the
   isLateInput precedent, chosen over a boot pass precisely because the
   parity harness reads INPUTS pristine and never boots.

   The PLANNERS return {row, action, newEndOrd} lists and mutate nothing:
   the one applier lives in ui/inputedit.tsx (applyMedPlan), which knows the
   Leave-War retraction discipline. Engine code must not import the sync.

   An unparseable date FAILS CLOSED here — the row is skipped, never guessed
   at and never deleted on a guess (the missing-input doctrine).           */
import { INPUTS, inpType, isDownchit, isUpchit, dateOrd } from './inputs';

const DAY_MS=86400000;
const ordMs=(o:any)=>Date.UTC(Math.floor(o/10000),Math.floor(o/100)%100-1,o%100);
const msOrd=(t:any)=>{const d=new Date(t);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();};
/* ordinal ± n days, through real UTC dates — ordinals do not subtract across
   month ends, which is why this exists */
export function ordShift(o:any,days:any){return o==null?null:msOrd(ordMs(o)+days*DAY_MS);}
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* an ordinal back to the label convention the records store — bare 'Jul 13'
   when the year is the ROW'S OWN anchor (so dateOrd(label, yr) round-trips),
   'Jul 13 2027' otherwise (fmt's rule, anchored to the row rather than the
   loaded week: a trim must not re-date a row by writing a label its own yr
   cannot resolve) */
export function ordLabel(o:any,yr:any){
  if(o==null)return '';
  const y=Math.floor(o/10000),lbl=`${MONTHS[Math.floor(o/100)%100-1]||''} ${o%100}`;
  return (isFinite(+yr)&&+yr>0?+yr:y)===y?lbl:lbl+' '+y;
}
/* a medical row's span in ordinals, resolved through its own anchor year */
export function medStartOrd(r:any){return dateOrd(r&&r.date,r&&r.yr);}
export function medEndOrd(r:any){return dateOrd((r&&(r.endDate||r.date)),r&&r.yr);}

const medRows=(person?:any)=>INPUTS.filter((r:any)=>isDownchit(r.type)&&(person==null||r.person===person));
const upRows=(person?:any)=>INPUTS.filter((r:any)=>isUpchit(r.type)&&(person==null||r.person===person));

/* MEDICALLY DOWN as of a date: every downchit input covering it, one entry
   per input (the trim rules keep a person to one live row in practice, but a
   restore can hold overlaps and hiding one would be lying about the record) */
export function medDownAsOf(asOf:any){
  const out:any=[];
  for(const r of medRows()){const a=medStartOrd(r),b=medEndOrd(r);
    if(a==null||b==null)continue;
    if(a<=asOf&&asOf<=b)out.push({person:r.person,row:r,endOrd:b});}
  return out.sort((x:any,y:any)=>String(x.person).localeCompare(String(y.person)));
}
/* PENDING UPCHIT: the person's LATEST-ended downchit that has expired, still
   unanswered. Dropped when (a) any downchit covers as-of (still or again
   down), (b) any downchit STARTS after that end — a newer entry replaces the
   nag even future-dated (owner: "his puck from pending upchit will disappear
   and the updated input will show instead"), or (c) an upchit is dated on or
   after that end — after a trim the downchit's end IS the upchit date, so >=
   is the covering test, while an earlier episode's upchit sits below it and
   keeps nagging. Unbounded into the past on purpose: an owed upchit does not
   age out. */
export function pendingUpchits(asOf:any){
  const by:any={};
  for(const r of medRows()){const a=medStartOrd(r),b=medEndOrd(r);
    if(a==null||b==null)continue;
    const p=r.person,e=by[p]=by[p]||{covered:false,latest:null,starts:[]};
    e.starts.push(a);
    if(a<=asOf&&asOf<=b){e.covered=true;continue;}
    if(b<asOf&&(!e.latest||b>e.latest.endOrd))e.latest={person:p,row:r,endOrd:b};}
  const out:any=[];
  for(const p of Object.keys(by)){const e=by[p];
    if(e.covered||!e.latest)continue;
    if(e.starts.some((s:any)=>s>e.latest.endOrd))continue;
    if(upRows(p).some((u:any)=>{const o=medStartOrd(u);return o!=null&&o>=e.latest.endOrd;}))continue;
    out.push(e.latest);}
  return out.sort((x:any,y:any)=>String(x.person).localeCompare(String(y.person)));
}
/* UPCHIT COMPLETE: upchits dated inside the trailing window (default 30
   days), newest first — the section's own 30-day rule (owner, 27 Aug 26) */
export function upchitsWithin(asOf:any,days:any=30){
  const from=ordShift(asOf,-days);
  const out:any=[];
  if(from==null)return out;   // an unreadable as-of answers nothing, never everything
  for(const r of upRows()){const o=medStartOrd(r);
    if(o==null||o>asOf||o<=from)continue;
    out.push({person:r.person,row:r,ord:o});}
  return out.sort((x:any,y:any)=>y.ord-x.ord||String(x.person).localeCompare(String(y.person)));
}
/* THE TRIM PLANS. One primitive decides trim-vs-delete; both flows use it. */
const trimTo=(r:any,newEnd:any)=>{const a=medStartOrd(r);
  return newEnd<a?{row:r,action:'delete'}:{row:r,action:'trim',newEndOrd:newEnd};};
/* an upchit on X: every downchit of the person RUNNING AT X (started on or
   before it, still running past it) is cut to end ON X (down 10–13, upchit
   12 → 10–12). Rows already ended are left alone — the pending nag clears
   through pendingUpchits, no mutation needed. Rows that START AFTER X are
   left alone too, deliberately: they are the "newer entry" the owner said
   replaces the nag (a future surgery already filed, with its own document),
   not part of the episode this upchit closes — the first cut swept them into
   trimTo's delete branch, so an upchit for an OLD episode silently destroyed
   an unrelated future downchit, the one case the delete branch could ever
   actually fire on (the refusal gate demands a row starting on/before X, and
   only a row starting AFTER X can reach newEnd<start). */
export function upchitTrimPlan(person:any,xOrd:any,except?:any){
  const out:any=[];
  if(xOrd==null)return out;
  for(const r of medRows(person)){if(r===except)continue;
    const a=medStartOrd(r),b=medEndOrd(r);
    if(a==null||b==null||b<=xOrd||a>xOrd)continue;
    out.push(trimTo(r,xOrd));}
  return out;
}
/* a NEW medical input of a DIFFERENT type wins its days (owner: "the latest
   input ... overwrites the previous input thats conflicting") — and ONLY its
   days: every overlapping other-type downchit is cut to end the day BEFORE
   the new one starts (deleted when nothing remains before it), and when the
   old row also ran PAST the new one's end, the surviving tail rides the plan
   as a second same-type row for the applier to mint. The first cut dropped
   that tail wholesale, so a two-day ATT B dropped mid-way through a long
   hospitalisation silently marked the man fit for the rest of it — days the
   new input never claimed, the exact silent availability error the tracker
   exists to prevent. Same-type overlap never reaches here; it is refused at
   the form. */
export function newMedTrimPlan(person:any,type:any,aOrd:any,bOrd:any,except?:any){
  const out:any=[];
  if(aOrd==null)return out;
  const b=bOrd==null?aOrd:bOrd, t=inpType(type);
  for(const r of medRows(person)){if(r===except)continue;
    if(inpType(r.type)===t)continue;
    const s=medStartOrd(r),e=medEndOrd(r);
    if(s==null||e==null)continue;
    if(s>b||e<aOrd)continue;
    const p:any=trimTo(r,ordShift(aOrd,-1));
    if(e>b)p.tail={startOrd:ordShift(b,1),endOrd:e};
    out.push(p);}
  return out;
}
