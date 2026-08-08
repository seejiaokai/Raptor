import { DAYS } from './data'
import { markEdit } from './publish'
import { permuteKeys, moveKeys } from './keys'
import { groundOrder } from './order'
/* ---------------------------------------------------------------------------
   REORDERING A BOARD LIST (owner, 8 Aug 26)
   Every list on the board is drawn in model order and a new row lands at the
   bottom, so the only way to resequence used to be delete-and-retype.
   Each mover here is the same three beats: splice the model, remap the
   amendment key space with the SAME heads the matching shift* helper in
   keys.ts uses, then mark the moved row at its NEW address.
   Why a key at all, when a DELETE marks nothing: a delete must not re-mark the
   address it just removed, but a move's row still exists and its position IS
   the change — marking it is what puts the day into the next AL, which is what
   "a move counts as an amendment" (owner) has to mean mechanically. Same idiom
   every add already uses.
   `to` is the destination index AFTER removal — plain splice-out/splice-in.
   --------------------------------------------------------------------------- */
const ok=(a:any,from:any,to:any)=>Array.isArray(a)&&isFinite(from)&&isFinite(to)&&from!==to
  &&from>=0&&to>=0&&from<a.length&&to<a.length;
const slide=(a:any,from:any,to:any)=>{a.splice(to,0,a.splice(from,1)[0]);};
const done=(key:any)=>{markEdit(key); return true;};

export function moveFormation(di:any,gi:any,from:any,to:any){
  const w=(DAYS[di]||{}).waves&&DAYS[di].waves[gi]; if(!w||!ok(w.formations,from,to))return false;
  slide(w.formations,from,to);
  [`ff:${di}.${gi}.`,`fr:${di}.${gi}.`,`st:${di}.${gi}.`,`ar:${di}.${gi}.`,`at:${di}.${gi}.`,`${di}.${gi}.`]
    .forEach((h:any)=>moveKeys(h,0,from,to,w.formations.length));
  return done(`ff:${di}.${gi}.${to}.cs`);
}
export function moveAircraft(di:any,gi:any,li:any,from:any,to:any){
  const w=(DAYS[di]||{}).waves&&DAYS[di].waves[gi]; const f=w&&w.formations&&w.formations[li];
  if(!f||!ok(f.aircraft,from,to))return false;
  slide(f.aircraft,from,to);
  [`fr:${di}.${gi}.${li}.`,`st:${di}.${gi}.${li}.`,`${di}.${gi}.${li}.`]
    .forEach((h:any)=>moveKeys(h,0,from,to,f.aircraft.length));
  return done(`fr:${di}.${gi}.${li}.${to}`);
}
export function moveDutyRow(di:any,wi:any,from:any,to:any){
  const dw=(DAYS[di]||{}).dutywaves&&DAYS[di].dutywaves[wi]; if(!dw||!ok(dw.rows,from,to))return false;
  slide(dw.rows,from,to);
  [`d:${di}.${wi}.`,`dr:${di}.${wi}.`].forEach((h:any)=>moveKeys(h,0,from,to,dw.rows.length));
  return done(`dr:${di}.${wi}.${to}.role`);
}
export function moveSimRow(di:any,kind:any,from:any,to:any){
  const rows=((DAYS[di]||{}).sims||{})[kind]; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  [`s:${di}.${kind}.`,`sr:${di}.${kind}.`].forEach((h:any)=>moveKeys(h,0,from,to,rows.length));
  return done(`sr:${di}.${kind}.${to}.label`);
}
export function moveProgRow(di:any,from:any,to:any){
  const rows=(DAYS[di]||{}).allhands; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  [`ap:${di}.`,`a:${di}.`].forEach((h:any)=>moveKeys(h,0,from,to,rows.length));
  return done(`ap:${di}.${to}.prog`);
}
export function moveNote(di:any,from:any,to:any){
  const rows=(DAYS[di]||{}).notes; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  moveKeys(`dn:${di}.`,0,from,to,rows.length);
  return done(`dn:${di}.${to}`);
}
/* Ground is the one list rendered in a SORTED order (by start time, on the week
   and the board alike), so a move expressed in model indices would be undone by
   the very next redraw — and the first move in particular would read as doing
   nothing at all: drag the 1000 line above the 0800 line and a naive model move
   puts it at model index 1, where the sort still prints it last.
   So the first manual move FREEZES the order on screen into the model — a whole
   permutation, keys and all — sets gman, translates the caller's model indices
   into that frozen order, and only then does the ordinary move. The way back is
   Undo: histSnap() serialises DAYS, so gman rolls back with the order and no
   second control is needed (owner, 8 Aug 26). */
export function moveGroundRow(di:any,from:any,to:any){
  const d=DAYS[di]; const rows=d&&d.ground; if(!ok(rows,from,to))return false;
  let f=from,t=to;
  if(!d.gman){
    const oldOf=groundOrder(rows).map((x:any)=>x.ri);
    const newOf:any={}; oldOf.forEach((o:any,n:any)=>{newOf[o]=n;});
    const frozen=oldOf.map((o:any)=>rows[o]);
    rows.length=0; frozen.forEach((r:any)=>rows.push(r));
    [`g:${di}.`,`gr:${di}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
    d.gman=true; f=newOf[from]; t=newOf[to];
  }
  if(!ok(rows,f,t))return false;
  slide(rows,f,t);
  [`g:${di}.`,`gr:${di}.`].forEach((h:any)=>moveKeys(h,0,f,t,rows.length));
  return done(`gr:${di}.${t}.prog`);
}
/* ---- the one entry point the UI calls -------------------------------------
   Addresses are `mv:<kind>.<container…>.<index>`. For every kind but `ac`, two
   rows may exchange places IFF their addresses match on everything but the last
   component — one test that enforces every containment rule at once (a duty row
   cannot change block, an AMT row cannot become an OFT row) with no per-kind
   special casing.
   `ac` is the one address with two meanings, because a flying row is one JET but
   the owner asked for both a formation that travels as a block and jets that
   resequence inside it, and there is only one grip. The DROP decides: land on a
   sibling jet and the jets resequence; land on another formation in the same Go
   and the whole formation travels; land in another Go and it is refused. That is
   the only reading consistent with "a jet may never leave its formation" — a
   drag ending outside the formation cannot mean "move this jet there". */
export function applyMove(fromAddr:any,toAddr:any){
  const A=String(fromAddr||''), B=String(toAddr||'');
  if(A.indexOf('mv:')!==0||B.indexOf('mv:')!==0||A===B)return false;
  const a=A.slice(3).split('.'), b=B.slice(3).split('.');
  if(a[0]!==b[0]||a.length!==b.length||a.length<3)return false;
  const kind=a[0], n=(s:any)=>{const v=parseInt(s,10); return Number.isFinite(v)?v:-1;};
  /* the container is everything but the last component */
  const sameBut=(k:number)=>a.slice(1,k).join('.')===b.slice(1,k).join('.');
  if(kind==='ac'){
    if(a.length!==5)return false;
    const di=n(a[1]), gi=n(a[2]);
    if(!sameBut(3))return false;                       // different day or Go
    if(a[3]===b[3])return moveAircraft(di,gi,n(a[3]),n(a[4]),n(b[4]));
    return moveFormation(di,gi,n(a[3]),n(b[3]));
  }
  if(!sameBut(a.length-1))return false;
  if(kind==='d')return moveDutyRow(n(a[1]),n(a[2]),n(a[3]),n(b[3]));
  if(kind==='s')return moveSimRow(n(a[1]),a[2],n(a[3]),n(b[3]));
  if(kind==='g')return moveGroundRow(n(a[1]),n(a[2]),n(b[2]));
  if(kind==='p')return moveProgRow(n(a[1]),n(a[2]),n(b[2]));
  if(kind==='n')return moveNote(n(a[1]),n(a[2]),n(b[2]));
  return false;
}
