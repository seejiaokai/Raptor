import { DAYS } from './data'
import { SCHED } from './publish'
/* ---- day bookkeeping ------------------------------------------------------
   Every amendment key starts with its day index, whatever the prefix:
     0.1.0.0.p   ar:0.1.0   at:0.1.0   st:0.1.0.0   it:0.1
     d:0.0.1     s:0.amt.1.pax.3        g:0.2        a:0.4.0
   so one parse serves them all and an AL can always say which days it touched. */
export function keyDay(key:any){const s=String(key),c=s.indexOf(':');
  const n=parseInt((c<0?s:s.slice(c+1)).split('.')[0],10);
  return Number.isFinite(n)?n:-1;}
export function uniqDays(keys:any):any[]{return [...new Set((keys||[]).map(keyDay))].filter((i:any)=>i>=0&&i<DAYS.length).sort((a:any,b:any)=>a-b);}
/* ---------------------------------------------------------------------------
   DELETING A ROW RENUMBERS EVERYTHING AFTER IT
   The amendment machinery addresses rows by index — dn:0.2, ap:0.3.prog,
   fr:0.1.0.3, and the bare flying key 0.1.0.3.p — so a plain splice silently
   slides every mark past the cut onto the wrong row: an AL1 tint lands on a note
   nobody amended, and the issued AL record permanently mis-attributes which item
   it changed. shiftKeys() rewrites the key space to match the splice — marks ON
   the deleted row are dropped, marks after it move down one — across pending,
   changes and every issued AL. `head` is the literal text a key must start with,
   `pos` is which dot-separated component after `head` carries the index.
   --------------------------------------------------------------------------- */
export function shiftKeys(head:any,pos:any,ix:any){
  if(!head||!isFinite(ix))return;
  const move=(k:any)=>{
    if(String(k).indexOf(head)!==0)return k;            // a different key space
    const a=k.slice(head.length).split('.');
    const n=+a[pos];
    if(!isFinite(n)||n<ix)return k;                     // before the cut
    if(n===ix)return null;                              // the row itself is gone
    a[pos]=String(n-1);
    return head+a.join('.');
  };
  const remap=(o:any)=>{const out:any={}; Object.keys(o||{}).forEach((k:any)=>{const m=move(k); if(m)out[m]=o[k];}); return out;};
  SCHED.pending=remap(SCHED.pending);
  SCHED.changes=remap(SCHED.changes);
  (SCHED.als||[]).forEach((a:any)=>{a.keys=(a.keys||[]).map(move).filter(Boolean);});
}
/* ---------------------------------------------------------------------------
   REORDERING A LIST RENUMBERS IT TOO — and unlike a delete, nothing may be lost
   shiftKeys() above handles a splice: marks ON the cut row are dropped, marks
   after it move down one. A reorder is the other shape — every row survives and
   simply changes address, so the remap must be a BIJECTION. Drop a key here and
   an issued AL silently forgets an amendment; collide two and one amendment
   permanently re-labels itself as being about a different sortie. Neither shows
   on screen, which is why this is tested on its own before anything calls it.
   `oldOf[newIndex] = oldIndex` — the same shape groundOrder() already returns,
   so freezing a rendered order and moving one row are the same operation.
   An index outside the permutation is left ALONE rather than dropped: a stale
   key from a longer list is inert, a vanished one is a lost record.
   --------------------------------------------------------------------------- */
export function permuteKeys(head:any,pos:any,oldOf:any){
  if(!head||!Array.isArray(oldOf))return;
  const newOf:any={}; oldOf.forEach((o:any,n:any)=>{newOf[o]=n;});
  const move=(k:any)=>{
    if(String(k).indexOf(head)!==0)return k;            // a different key space
    const a=k.slice(head.length).split('.');
    const n=+a[pos];
    if(!isFinite(n)||!(n in newOf))return k;
    a[pos]=String(newOf[n]);
    return head+a.join('.');
  };
  const remap=(o:any)=>{const out:any={}; Object.keys(o||{}).forEach((k:any)=>{out[move(k)]=o[k];}); return out;};
  SCHED.pending=remap(SCHED.pending);
  SCHED.changes=remap(SCHED.changes);
  (SCHED.als||[]).forEach((a:any)=>{a.keys=(a.keys||[]).map(move);});
}
/* one row moving to another position, `to` being its index AFTER removal —
   plain splice-out / splice-in, the same arithmetic the model array does. */
export function moveKeys(head:any,pos:any,from:any,to:any,len:any){
  if(!isFinite(from)||!isFinite(to)||from===to)return;
  if(!isFinite(len)||from<0||to<0||from>=len||to>=len)return;
  const oldOf=[]; for(let i=0;i<len;i++)oldOf.push(i);
  oldOf.splice(to,0,oldOf.splice(from,1)[0]);
  permuteKeys(head,pos,oldOf);
}
/* every key space that carries an AIRCRAFT index on one formation */
export function shiftAircraft(di:any,gi:any,li:any,ai:any){
  [`fr:${di}.${gi}.${li}.`,`st:${di}.${gi}.${li}.`,`${di}.${gi}.${li}.`]
    .forEach((h:any)=>shiftKeys(h,0,ai));
}
/* every key space that carries a FORMATION index on one wave */
export function shiftFormation(di:any,gi:any,li:any){
  [`ff:${di}.${gi}.`,`fr:${di}.${gi}.`,`st:${di}.${gi}.`,`ar:${di}.${gi}.`,`at:${di}.${gi}.`,
   `${di}.${gi}.`].forEach((h:any)=>shiftKeys(h,0,li));
}
/* every key space that carries a WAVE index on one day */
export function shiftWave(di:any,gi:any){
  [`wl:${di}.`,`ff:${di}.`,`fr:${di}.`,`st:${di}.`,`ar:${di}.`,`at:${di}.`,`it:${di}.`,
   `tr:${di}.`,`${di}.`].forEach((h:any)=>shiftKeys(h,0,gi));
}
