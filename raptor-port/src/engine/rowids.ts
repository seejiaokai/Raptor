// src/engine/rowids.ts
/* STABLE ROW IDS (10 Sep 26, the stable-ids round). A schedule row — a wave,
   a Go, a seat pair, a duty block or desk, a sim row, a programme or ground
   row — is addressed by its POSITION (the slot-key grammar, keys.ts), and
   deleting a row renumbers the ones after it. The shared database wants a
   key that survives that, the way `iid` gives an input one. So every row
   carries `rid`: opaque, minted at creation, never printed (html.ts builds
   every key from the loop index — parity stays byte-identical), never used
   for addressing this round. Random rather than a counter so two browsers
   never mint the same id.
   ONE walk mints them, and it runs before every baseline and snapshot
   (store.ts initStore/loadWeek, history.ts histInit/histPush), so nothing
   is rendered or saved before a row has its id — inputs.ts's lesson that an
   id minted later than the snapshot it should be in is worse than none. A
   DUPLICATE is re-minted: a day template, a duplicated wave, a draft copy a
   row by JSON, and the copy is a new row; the first one seen keeps its id. */
export function mintRowId(){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
/* every row object of one day, parents before children, in section order */
export function rowsOf(d:any):any[]{
  const out:any[]=[];
  (d.allhands||[]).forEach((r:any)=>out.push(r));
  (d.waves||[]).forEach((w:any)=>{out.push(w);(w.formations||[]).forEach((f:any)=>{out.push(f);(f.aircraft||[]).forEach((a:any)=>out.push(a));});});
  const s=d.sims||{};(s.amt||[]).forEach((r:any)=>out.push(r));(s.oft||[]).forEach((r:any)=>out.push(r));
  (d.dutywaves||[]).forEach((b:any)=>{out.push(b);(b.rows||[]).forEach((r:any)=>out.push(r));});
  (d.ground||[]).forEach((r:any)=>out.push(r));
  return out;
}
/* mint a missing rid, re-mint a duplicate; returns how many were minted */
export function ensureRowIds(days:any[]):number{
  const seen=new Set<string>();let n=0;
  for(const d of days||[])for(const r of rowsOf(d||{})){
    if(!r||typeof r!=='object')continue;
    if(typeof r.rid!=='string'||!r.rid||seen.has(r.rid)){r.rid=mintRowId();n++;}
    seen.add(r.rid);
  }
  return n;
}
/* a COPY is a new row: template capture/apply and a duplicated draft strip
   the ids so the copy mints its own — never the first-seen dedupe deciding
   which of two identical rows was "first" */
export function stripRowIds(d:any){for(const r of rowsOf(d||{}))if(r&&typeof r==='object')delete r.rid;}
/* every row with its ADDRESS (section.index… path) — the pairing key for a
   snapshot written before ids existed: the row at the same address in the
   live day is the same row */
export function pathsOf(d:any):Array<[string,any]>{
  const out:Array<[string,any]>=[];
  (d.allhands||[]).forEach((r:any,i:number)=>out.push(['allhands.'+i,r]));
  (d.waves||[]).forEach((w:any,gi:number)=>{out.push(['waves.'+gi,w]);(w.formations||[]).forEach((f:any,li:number)=>{out.push(['waves.'+gi+'.formations.'+li,f]);(f.aircraft||[]).forEach((a:any,ai:number)=>out.push(['waves.'+gi+'.formations.'+li+'.aircraft.'+ai,a]));});});
  const s=d.sims||{};(s.amt||[]).forEach((r:any,i:number)=>out.push(['sims.amt.'+i,r]));(s.oft||[]).forEach((r:any,i:number)=>out.push(['sims.oft.'+i,r]));
  (d.dutywaves||[]).forEach((b:any,wi:number)=>{out.push(['dutywaves.'+wi,b]);(b.rows||[]).forEach((r:any,ri:number)=>out.push(['dutywaves.'+wi+'.rows.'+ri,r]));});
  (d.ground||[]).forEach((r:any,i:number)=>out.push(['ground.'+i,r]));
  return out;
}
/* THE BACKFILL (review finding 6): the amendment book — SCHED.orig, every
   AL's day snapshots, the drafts — is persisted with the week, so a book
   written before ids existed would mint a DIFFERENT id on every restore. Run
   once per boot/week-load, after ensureRowIds(DAYS) and before the baseline:
   a snapshot row still without an id takes the live row's id at the same
   address, or a minted one when the address is gone; written into the
   snapshot so it persists. Idempotent — rows that have an id are untouched. */
export function backfillSnapshotIds(sched:any,days:any[]):number{
  let n=0;const fill=(snapDay:any,di:number)=>{if(!snapDay)return;const live=new Map(pathsOf(days[di]||{}));
    for(const [p,r] of pathsOf(snapDay)){if(!r||typeof r!=='object'||(typeof r.rid==='string'&&r.rid))continue;const l=live.get(p);r.rid=(l&&typeof l.rid==='string'&&l.rid)?l.rid:mintRowId();n++;}};
  Object.keys(sched.orig||{}).forEach((k:any)=>fill(sched.orig[k]&&sched.orig[k].d,+k));
  (sched.als||[]).forEach((al:any)=>Object.keys(al.snap||{}).forEach((k:any)=>fill(al.snap[k]&&al.snap[k].d,+k)));
  Object.keys(sched.drafts||{}).forEach((k:any)=>(sched.drafts[k]||[]).forEach((t:any)=>fill(t&&t.d,+k)));
  return n;
}
