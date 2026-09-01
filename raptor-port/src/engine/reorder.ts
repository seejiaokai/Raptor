import { DAYS } from './data'
import { markEdit, markMove, dayApproved, SCHED } from './publish'
import { permuteKeys, moveKeys } from './keys'
import { groundOrder } from './order'
import { parseHM } from './time'
import { store } from './hooks'
import { isStandalone } from './waves'
import { WAVE_KINDS } from './wavetpl'
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
/* REORDERED_DI (review fix, 9 Aug 26 — finding #5): the day a permutation
   just touched, for state/view.ts's afterSchedMutate to disarm a stale-armed
   slot against. armTargetExists alone only asks "does the index still hold
   SOMETHING" — a reorder never changes a list's length, so that guard always
   passed while the address now named a DIFFERENT row: arm the first duty
   slot, drag it down, tap a name, and it plants on whatever moved into that
   index, with a success toast and the amendment mark on the wrong key.
   Day-scoped, not list-scoped — the same blanket reflex the undo path
   (interactions.ts) and the board's own day-tab switch (setBoardDay,
   state/view.ts) already apply: "something on this day just moved" is
   enough reason to put an armed slot down, exactly as "you switched to a
   different day" already is. `done`'s callers pass a day index only when a
   real permutation happened (never for the ground no-op-but-flag-cleared
   path, where the row array itself is untouched and nothing could have
   changed identity). ESM cannot reassign this from another module, so
   popReorderedDay() is the one way out, and it clears on read — the same
   read-once shape SORTALL and CXT already use. */
export let REORDERED_DI:any=null
export function popReorderedDay(){const d=REORDERED_DI; REORDERED_DI=null; return d;}
/* Which mov: KIND a move belongs to, read from the head FIELD key each mover
   hands `done` — the same key it would otherwise mark pending. One prefix, one
   kind; an unknown prefix falls to a generic 'item' (moveKey clamps it anyway). */
const MOVE_KIND:any={wl:'wave',ff:'formation',fr:'aircraft',dr:'duty',dl:'dutyblock',sr:'sim',ap:'programme',dn:'note',gr:'ground'};
const moveKindOf=(key:any)=>{const s=String(key),c=s.indexOf(':');return MOVE_KIND[c<0?'':s.slice(0,c)]||'item';};
/* Record a move. On a PUBLISHED day a move of an ISSUED row is a structural
   amendment recorded with an inert mov: key (see publish.ts) so it survives the
   reconcile that value-drops an ordinary field mark; on a draft day, or when the
   moved row is still a pending draft ADD (its head key sits in SCHED.added — the
   `done` key IS that row's structural-add-key form, so this reads generically), the
   old behaviour stands: mark the head field pending, which keys.ts remaps and the
   add/delete net-no-op path (SCHED.added) can still cancel. `di` is passed only for
   a real permutation; the ground flag-only clear path passes none and stays a plain
   field mark. */
const done=(key:any,di?:any)=>{
  if(di!=null && dayApproved(di) && !SCHED.added[String(key)]) markMove(di,moveKindOf(key));
  else markEdit(key);
  if(di!=null)REORDERED_DI=di; return true;};

/* MANUAL WAVE-BLOCK REORDER (owner, 29 Aug 26 — "within the waves I also want the
   option to reorder … put SC at the top, then 1st wave 2nd wave"). Until now the
   wave BLOCKS themselves could only be resequenced by Auto sort (sortWaves, by the
   earliest time in each); this is the manual sibling, so a scheduler can put a wave
   exactly where they want it. It moves the SAME nine key-space heads sortWaves
   permutes (that list is shiftWave's verbatim, keys.ts — a wave carries its label,
   in-times, traffic and every formation/jet/remark/store/area beneath it), the
   only difference being a single splice (moveKeys) rather than a whole permutation,
   exactly as moveFormation is the manual sibling of sortWave. The bare `${di}.`
   head is the flying-seat address and must ride at position 0 like the rest, or a
   wave that moves leaves every name on it addressed to whichever wave took its
   place. A wave move counts as an amendment, the same rule every mover here
   follows — the wave's position IS the change. Rule inputs are untouched in
   SUBSTANCE (the same clashes exist whichever wave is drawn first); only the index
   in each key changes, and the remap keeps it all attached. */
export function moveWave(di:any,from:any,to:any){
  const ws=(DAYS[di]||{}).waves; if(!ok(ws,from,to))return false;
  slide(ws,from,to);
  [`wl:${di}.`,`ff:${di}.`,`fr:${di}.`,`st:${di}.`,`ar:${di}.`,`at:${di}.`,`it:${di}.`,
   `tr:${di}.`,`${di}.`].forEach((h:any)=>moveKeys(h,0,from,to,ws.length));
  return done(`wl:${di}.${to}`,di);
}

/* THE ADMIN-SET DEFAULT WAVE ORDER (owner, 29 Aug 26 pt.2 — "allow the default
   arrangement of a schedule to be configured in admin … even to the arrangement of
   the waves under display"). A GLOBAL order over the built-in wave KINDS (Flying
   wave / SC / AVALON / BB). The owner chose "new schedules only": it is applied
   ONLY when a wave is ADDED to a day that is not signed off (ui/board.ts addWave) —
   the new wave lands in its kind's slot instead of at the bottom, so a fresh
   schedule builds up in the house order. It NEVER re-shuffles an existing day and
   NEVER touches a published day (a wave move is a real amendment, and the placement
   rides the same tested moveWave used by the per-day Arrange sheet). Unset (empty)
   ⇒ an added wave appends exactly as before — so an un-customised squadron behaves
   identically to today. Persisted like the wave-hide set (engine/wavetpl.ts): store
   key 'wavedefault', written null while unset, sanitised on load (untrusted). */
let WAVE_DEFAULT:string[]=[];   // empty = no house order set → append as today
function cleanWaveList(order:any):string[]{
  const seen=new Set<string>(); const out:string[]=[];
  if(Array.isArray(order))for(const k of order)if(typeof k==='string'&&(WAVE_KINDS as readonly string[]).indexOf(k)>=0&&!seen.has(k)){seen.add(k);out.push(k);}
  return out;   // deliberately NOT auto-completed: an empty/garbage value stays "unset"
}
/* the built-in wave kinds in their canonical order — the list the Admin panel shows
   (and moveWaveDefault materialises from) when no house order has been set yet. */
const WAVE_CANON:string[]=(WAVE_KINDS as readonly string[]).slice();
export function waveDefault():string[]{return WAVE_DEFAULT.slice();}
/* the order the Admin panel DISPLAYS: the set house order, else the canonical kinds
   as a starting point (still "unset" until the admin nudges one). */
export function waveDefaultView():string[]{return WAVE_DEFAULT.length?WAVE_DEFAULT.slice():WAVE_CANON.slice();}
export function setWaveDefault(order:any){WAVE_DEFAULT=cleanWaveList(order);}
/* move one wave kind up (dir<0) / down (dir>0) in the house order (the Admin
   panel's ▲▼). Materialises the full kind list from the canonical view on the
   first nudge, so from then on the order is explicit and placement is active.
   Caller persists (waveDefaultSave) and repaints. False on a no-op. */
export function moveWaveDefault(key:string,dir:number):boolean{
  const cur=waveDefaultView();
  const from=cur.indexOf(key);
  if(from<0)return false;
  const to=from+(dir<0?-1:1);
  if(to<0||to>=cur.length)return false;
  cur.splice(to,0,cur.splice(from,1)[0]);
  WAVE_DEFAULT=cur;
  return true;
}
export function waveDefaultSave(){store.set('wavedefault',WAVE_DEFAULT.length?WAVE_DEFAULT.slice():null);}
export function waveDefaultLoad(){const raw=store.get('wavedefault',null);WAVE_DEFAULT=Array.isArray(raw)?cleanWaveList(raw):[];}
export function waveDefaultReset(){WAVE_DEFAULT=[];}
/* the sorting kind of a placed wave: a standalone reads its own kind (sc/avalon/bb),
   an ordinary flying wave is 'fly'. This is what the house order ranks. */
export function waveKindOf(w:any):string{return isStandalone(w)?((w&&w.kind)||'fly'):'fly';}
/* the slot a newly-added wave of `newKind` should take among the `existing` waves to
   sit in the house order, WITHOUT disturbing the existing waves' relative order: it
   lands just before the first existing wave whose kind ranks after it. Returns
   existing.length (append) when no house order is set, so an un-customised squadron
   is untouched. An unknown kind ranks last (appends). */
export function waveInsertSlot(existing:any[],newKind:string):number{
  if(!WAVE_DEFAULT.length||!Array.isArray(existing))return (existing||[]).length;
  const rank=(k:string)=>{const i=WAVE_DEFAULT.indexOf(k);return i<0?WAVE_DEFAULT.length:i;};
  const nr=rank(newKind);
  for(let i=0;i<existing.length;i++)if(rank(waveKindOf(existing[i]))>nr)return i;
  return existing.length;
}

export function moveFormation(di:any,gi:any,from:any,to:any){
  const w=(DAYS[di]||{}).waves&&DAYS[di].waves[gi]; if(!w||!ok(w.formations,from,to))return false;
  slide(w.formations,from,to);
  [`ff:${di}.${gi}.`,`fr:${di}.${gi}.`,`st:${di}.${gi}.`,`ar:${di}.${gi}.`,`at:${di}.${gi}.`,`${di}.${gi}.`]
    .forEach((h:any)=>moveKeys(h,0,from,to,w.formations.length));
  return done(`ff:${di}.${gi}.${to}.cs`,di);
}
export function moveAircraft(di:any,gi:any,li:any,from:any,to:any){
  const w=(DAYS[di]||{}).waves&&DAYS[di].waves[gi]; const f=w&&w.formations&&w.formations[li];
  if(!f||!ok(f.aircraft,from,to))return false;
  slide(f.aircraft,from,to);
  [`fr:${di}.${gi}.${li}.`,`st:${di}.${gi}.${li}.`,`${di}.${gi}.${li}.`]
    .forEach((h:any)=>moveKeys(h,0,from,to,f.aircraft.length));
  return done(`fr:${di}.${gi}.${li}.${to}`,di);
}
export function moveDutyRow(di:any,wi:any,from:any,to:any){
  const dw=(DAYS[di]||{}).dutywaves&&DAYS[di].dutywaves[wi]; if(!dw||!ok(dw.rows,from,to))return false;
  slide(dw.rows,from,to);
  [`d:${di}.${wi}.`,`dr:${di}.${wi}.`].forEach((h:any)=>moveKeys(h,0,from,to,dw.rows.length));
  return done(`dr:${di}.${wi}.${to}.role`,di);
}
export function moveSimRow(di:any,kind:any,from:any,to:any){
  const rows=((DAYS[di]||{}).sims||{})[kind]; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  [`s:${di}.${kind}.`,`sr:${di}.${kind}.`].forEach((h:any)=>moveKeys(h,0,from,to,rows.length));
  return done(`sr:${di}.${kind}.${to}.label`,di);
}
export function moveProgRow(di:any,from:any,to:any){
  const rows=(DAYS[di]||{}).allhands; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  [`ap:${di}.`,`a:${di}.`].forEach((h:any)=>moveKeys(h,0,from,to,rows.length));
  return done(`ap:${di}.${to}.prog`,di);
}
export function moveNote(di:any,from:any,to:any){
  const rows=(DAYS[di]||{}).notes; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  moveKeys(`dn:${di}.`,0,from,to,rows.length);
  return done(`dn:${di}.${to}`,di);
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
  return done(`gr:${di}.${t}.prog`,di);
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
  /* a wave block resequences among the day's other waves — `mv:w.di.gi`, two
     addresses matching on the day (checked by sameBut above) and differing only
     on the wave index. The outermost move on the flying side. */
  if(kind==='w')return moveWave(n(a[1]),n(a[2]),n(b[2]));
  if(kind==='d')return moveDutyRow(n(a[1]),n(a[2]),n(a[3]),n(b[3]));
  if(kind==='s')return moveSimRow(n(a[1]),a[2],n(a[3]),n(b[3]));
  if(kind==='g')return moveGroundRow(n(a[1]),n(a[2]),n(b[2]));
  if(kind==='p')return moveProgRow(n(a[1]),n(a[2]),n(b[2]));
  if(kind==='n')return moveNote(n(a[1]),n(a[2]),n(b[2]));
  return false;
}
/* ---------------------------------------------------------------------------
   AUTO SORT — a way back that is not Undo (owner, 8 Aug 26)
   The movers above have no rule at all: dragging a row IS the scheduler's
   judgement, and that is deliberate. Auto sort is the opposite move — throw
   the section's own reading order back at it — so each one sorts by whatever
   key actually orders it for a reader: flying by take-off (the jets INSIDE a
   formation are a position, not a time, so they never move), duties by role,
   sims/ground/programme by start time. Overall notes get no sorter: they are
   prose in a chosen order, not data with a natural key, and inventing one
   (alphabetical? first-typed?) would silently reorder someone's argument.
   Same three-beat idiom as a mover — build oldOf, reorder the model, permute
   the SAME key-space heads the matching mover uses, mark the row — except the
   move is a whole permutation rather than a splice, so the identity check
   sits BEFORE any of that: an already-sorted section must change nothing and
   mark nothing, or "Auto sort" on a tidy day becomes an edit of its own that
   the next AL has to explain. */
const isIdentity=(o:any)=>o.every((v:any,i:any)=>v===i);
/* stable sort of the index range [0,n) by keyFn(i) — null keys (no parseable
   time) sink to the bottom, in model order, same fallback as groundOrder;
   ties elsewhere break on the original index so equal keys never reshuffle. */
const keySort=(n:any,keyFn:any)=>{const idx:any[]=[];for(let i=0;i<n;i++)idx.push(i);
  return idx.sort((a:any,b:any)=>{const ka=keyFn(a),kb=keyFn(b);
    if(ka==null||kb==null)return ka==null&&kb==null?a-b:(ka==null?1:-1);
    return (ka-kb)||(a-b);});};
export function sortWave(di:any,gi:any){
  const w=(DAYS[di]||{}).waves&&DAYS[di].waves[gi]; if(!w||!Array.isArray(w.formations))return false;
  const fs=w.formations, oldOf=keySort(fs.length,(i:any)=>parseHM(fs[i].to));
  if(isIdentity(oldOf))return false;
  w.formations=oldOf.map((o:any)=>fs[o]);
  [`ff:${di}.${gi}.`,`fr:${di}.${gi}.`,`st:${di}.${gi}.`,`ar:${di}.${gi}.`,`at:${di}.${gi}.`,`${di}.${gi}.`]
    .forEach((h:any)=>permuteKeys(h,0,oldOf));
  return done(`ff:${di}.${gi}.0.cs`,di);
}
/* THE BLOCKS THEMSELVES, ORDERED BY THE EARLIEST TIME INSIDE THEM (owner,
   11 Aug 26). Until now Sort all tidied the rows INSIDE each wave and each
   duty block and left the blocks themselves wherever they were added, so
   building AVALON (19:00) before SC (07:00) left the night wave printed above
   the morning one for the rest of the day, with nothing short of delete-and-
   retype to fix it. The owner asked for the outer order too, and named the
   two-level rule himself: sort the lines within a block first, then order the
   blocks by the EARLIEST line in each — so 0700/0900 stays above 0800/1000
   even though the second block owns the later 1000.
   Taking the minimum rather than the first row is what makes those two beats
   independent: sortDay runs the inner sorters first (the natural reading, and
   the only order in which the inner key permutations are addressed at indices
   that still exist), but the answer would be the same either way, so an
   out-of-order block can never drag its whole wave to the wrong place.
   A block with no parseable time anywhere in it — a BB wave, whose hours are
   the scheduler's to set, or a wave whose last line was just deleted — has no
   key at all and sinks to the bottom in model order, the same fallback every
   sorter in this file already uses for a time-less row. */
const firstT=(rows:any,pick:any)=>{let m:any=null;
  (rows||[]).forEach((r:any)=>{const t=parseHM(pick(r)); if(t!=null&&(m==null||t<m))m=t;});
  return m;};
/* The wave key space is the widest permutation in this file — nine heads,
   because a wave carries its label, its in-times, its traffic and every
   formation, jet, remark, store and area beneath it. The list is `shiftWave`'s
   (keys.ts) verbatim: the same heads a wave DELETE renumbers are exactly the
   ones a wave move must remap, and keeping the two literally identical is what
   stops one of them growing a tenth head the other never hears about.
   The bare `${di}.` head is the flying seat address, which is why it must be
   permuted at position 0 like the rest — a wave that moves without it leaves
   every name on it addressed to whichever wave took its place.
   Standalone waves are NOT held back to the end. SC, AVALON and BB sit outside
   the day's flying count (engine/waves.ts) but they are read down the day like
   any other block, and the owner's own example is two of them — AVALON built
   first at 19:00, SC second at 07:00, SC wanted on top. So the sort is flat
   across every wave on the day, standalone or not, and a 07:00 SC will
   legitimately come to rest above an 08:00 ordinary wave.
   What this deliberately does NOT do is renumber the labels. "WAVE 1" is free
   text the scheduler typed and may well have replaced with something else
   entirely, so a day sorted into 0700-then-0800 can read WAVE 2 above WAVE 1;
   rewriting those to match would clobber every hand-chosen name on the day to
   fix a cosmetic mismatch. Told to the owner at the time, not hidden. */
export function sortWaves(di:any){
  const d=DAYS[di]; const ws=d&&d.waves; if(!Array.isArray(ws))return false;
  const oldOf=keySort(ws.length,(i:any)=>firstT(ws[i]&&ws[i].formations,(f:any)=>f.to));
  if(isIdentity(oldOf))return false;
  d.waves=oldOf.map((o:any)=>ws[o]);
  [`wl:${di}.`,`ff:${di}.`,`fr:${di}.`,`st:${di}.`,`ar:${di}.`,`at:${di}.`,`it:${di}.`,
   `tr:${di}.`,`${di}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
  return done(`wl:${di}.0`,di);
}
/* The duty side of the same rule (owner, 11 Aug 26 — "apply this logic to
   duties as well for their start time"): rows inside a block sort by start
   time already, and now the BLOCKS order by the earliest start in each. A
   block keeps its own label untouched for the same reason a wave does.
   The `sa` marker that ties an AVALON desk to its wave (engine/waves.ts's
   saDutyIx) is a string on the block, not an index into `d.waves`, so a wave
   and its desk can be reordered independently without either losing the
   other — which is what lets these two sorters stay separate functions
   rather than one paired walk. */
export function sortDutyBlocks(di:any){
  const d=DAYS[di]; const dws=d&&d.dutywaves; if(!Array.isArray(dws))return false;
  const oldOf=keySort(dws.length,(i:any)=>firstT(dws[i]&&dws[i].rows,(r:any)=>r.str));
  if(isIdentity(oldOf))return false;
  d.dutywaves=oldOf.map((o:any)=>dws[o]);
  /* the same three heads the block DELETE path in ui/board.ts renumbers */
  [`d:${di}.`,`dr:${di}.`,`dl:${di}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
  return done(`dl:${di}.0`,di);
}
export function sortDutyBlock(di:any,wi:any){
  const dw=(DAYS[di]||{}).dutywaves&&DAYS[di].dutywaves[wi]; if(!dw||!Array.isArray(dw.rows))return false;
  /* BY START TIME, not by role rank (owner, 10 Aug 26). A duty block is read
     down the day — who has the desk at 07:00, who takes it at 13:00 — and
     role rank shuffled an SC PM desk above an AM one. Same key as sortSims
     just below: parseHM, time-less rows to the bottom, ties keeping model
     order. `DUTY_ORDER` stays — it is still the pick-list order for a fresh
     row (engine/waves.ts DUTY_PICK) and the render order of a block nobody
     has sorted. Nothing sorts on its own: this runs from Auto sort / Sort
     all only, which is the whole point — rows must not move under a typist. */
  const rows=dw.rows, oldOf=keySort(rows.length,(i:any)=>parseHM(rows[i].str));
  if(isIdentity(oldOf))return false;
  dw.rows=oldOf.map((o:any)=>rows[o]);
  [`d:${di}.${wi}.`,`dr:${di}.${wi}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
  return done(`dr:${di}.${wi}.0.role`,di);
}
export function sortSims(di:any,kind:any){
  const d=DAYS[di]; const rows=d&&d.sims&&d.sims[kind]; if(!Array.isArray(rows))return false;
  const oldOf=keySort(rows.length,(i:any)=>parseHM(rows[i].str));
  if(isIdentity(oldOf))return false;
  d.sims[kind]=oldOf.map((o:any)=>rows[o]);
  [`s:${di}.${kind}.`,`sr:${di}.${kind}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
  return done(`sr:${di}.${kind}.0.label`,di);
}
/* Ground also clears gman — Auto sort IS the way back to time-sorted
   rendering, so calling it must switch manual mode off even on the one day
   it turns out there was nothing left to permute; that flag carries no
   amendment key, so clearing it here never conflicts with "marks nothing".
   But clearing it IS itself a change on a day that was frozen in manual
   mode: the list resumes sorting itself even when the rows it was frozen
   into already happened to read in time order, and a caller that reports
   "nothing happened" there would be wrong — the day just stopped being
   frozen (review fix, 9 Aug 26). `wasMan` is read before the clear so the
   return can tell the two false-looking cases apart: truly nothing to do
   (never marks, returns false) vs. only the flag moving (marks the row so
   the day goes out amended, returns true, but the ROW ARRAY itself is left
   untouched — same object, not a copy — which is what lets the caller in
   board.ts tell "the flag flipped" apart from "the rows visibly moved" by
   reference, without re-deriving the sort here a second time). */
export function sortGround(di:any){
  const d=DAYS[di]; const rows=d&&d.ground; const wasMan=!!(d&&d.gman); if(d)d.gman=false;
  if(!Array.isArray(rows))return false;
  const oldOf=keySort(rows.length,(i:any)=>parseHM(rows[i].str));
  if(isIdentity(oldOf))return wasMan?done(`gr:${di}.0.prog`):false;
  d.ground=oldOf.map((o:any)=>rows[o]);
  [`g:${di}.`,`gr:${di}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
  return done(`gr:${di}.0.prog`,di);
}
export function sortProg(di:any){
  const d=DAYS[di]; const rows=d&&d.allhands; if(!Array.isArray(rows))return false;
  const oldOf=keySort(rows.length,(i:any)=>parseHM(rows[i].str));
  if(isIdentity(oldOf))return false;
  d.allhands=oldOf.map((o:any)=>rows[o]);
  [`ap:${di}.`,`a:${di}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
  return done(`ap:${di}.0.prog`,di);
}
/* every section of one day, notes excluded — the primitive Task 10's
   `Sort all` composes over every day in the week.
   INSIDE BEFORE OUTSIDE, and the order is load-bearing (owner, 11 Aug 26):
   each inner sorter permutes key heads addressed at a FIXED wave or block
   index (`ff:0.2.`, `dr:0.1.`), so it has to run while those indices still
   name the wave and block it was handed. Sorting the outer lists first would
   leave every inner call remapping the key space of whichever block had moved
   into that slot. The two-level result the owner asked for is the same either
   way — an outer key is the minimum over the whole block, which no amount of
   reordering inside it can change — so this is about the amendment records
   staying attached to the right sortie, not about the order on screen. */
export function sortDay(di:any){
  const d=DAYS[di]; if(!d)return false;
  let any=false;
  (d.waves||[]).forEach((_:any,gi:any)=>{if(sortWave(di,gi))any=true;});
  if(sortWaves(di))any=true;
  (d.dutywaves||[]).forEach((_:any,wi:any)=>{if(sortDutyBlock(di,wi))any=true;});
  if(sortDutyBlocks(di))any=true;
  Object.keys(d.sims||{}).forEach((kind:any)=>{if(sortSims(di,kind))any=true;});
  if(sortGround(di))any=true;
  if(sortProg(di))any=true;
  return any;
}
