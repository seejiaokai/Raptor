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
   DUPLICATE is re-minted: a day template or a duplicated wave copies a row by
   JSON, and that copy is a new row; the first one seen keeps its id. A parked
   DRAFT is the deliberate EXCEPTION (drafts.ts, 11 Sep 26): it is an alternate
   VERSION of the same day, not an independent copy, so it KEEPS the source ids
   — and it never coexists with the live day in DAYS, so the dedupe below never
   sees the two together. */
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
/* a COPY is a new row: the day-template capture/apply strips the ids so the
   copy mints its own, rather than leaving the first-seen dedupe to decide which
   of two identical rows was "first". (A parked DRAFT does NOT strip — keep-ids,
   drafts.ts; a duplicated wave leans on ensureRowIds' dedupe as it coexists in
   the live model.) */
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
/* =====================================================================
   ADDRESSING BY rid (addressing-by-rid, 10 Sep 26) — the amendment book
   resolves a row by its stable `rid`, not its array position, so a delete or
   reorder never renumbers another row's stored key across the shared database.
   ===================================================================== */
/* The DOM stays POSITIONAL: html.ts builds every data-slot / data-area / the
   alAttr colour from the loop index and stringifies no row, which is what keeps
   the byte-parity gate (tfin.js 728/0, html.test.ts) identical. So the two
   worlds meet at a translation boundary — a positional key in from the DOM
   becomes a rid-anchored key in the book (`ridKey`); a stored rid key becomes
   the row's CURRENT positional key to find a live cell (`posKey`).
   restore.ts:dayKeys is the executable grammar these two mirror, prefix for
   prefix; its tests pin every one.
   A key is `prefix:di.…` (or the bare flying seat `di.…`, no prefix); the day
   index is always the first component and stays literal (keyDay depends on it).
   ONLY the position components collapse to a rid — the sim `kind` (amt/oft),
   the field/seat selector, the .xN overflow, the crew index .k and pax.k all
   stay literal. A position component reads `\d+`; a rid never does, so the two
   forms are always told apart. */
/* `iu:<iid>` is here too (Fable review): it addresses an INPUT, carries NO day
   component (slots.ts:297), and must pass through untouched — without this
   posKey read its missing day as "the row is gone" and returned null. */
const NONROW = new Set(['dn', 'sn', 'pn', 'dtn', 'gn', 'del', 'mov', 'inp', 'iu']);
/* per prefix, the position slots (index into the dot-parts) and the array each
   one indexes — parents first, so slot i's row is found inside slot i-1's. The
   first level indexes off the DAY, later levels off the row resolved above. */
function keyLevels(prefix: string, parts: string[]): Array<{ slot: number; arr: (p: any) => any }> | null {
  const W = { slot: 1, arr: (d: any) => d.waves }, F = { slot: 2, arr: (w: any) => w.formations }, A = { slot: 3, arr: (f: any) => f.aircraft };
  switch (prefix) {
    case '': return [W, F, A];                                   // bare flying seat di.gi.li.ai.seat
    case 'wl': case 'it': case 'tr': return [W];
    case 'ff': case 'ar': case 'at': return [W, F];
    case 'fr': case 'st': return [W, F, A];
    case 'dl': return [{ slot: 1, arr: (d: any) => d.dutywaves }];
    case 'dr': case 'd': return [{ slot: 1, arr: (d: any) => d.dutywaves }, { slot: 2, arr: (b: any) => b.rows }];
    case 'sr': case 's': return [{ slot: 2, arr: (d: any) => ((d.sims || {})[parts[1]!] || []) }];  // parts[1]=kind, literal
    case 'ap': case 'a': return [{ slot: 1, arr: (d: any) => d.allhands }];
    case 'gr': case 'g': return [{ slot: 1, arr: (d: any) => d.ground }];
    default: return null;                                        // dn:/sn: etc. never reach here (NONROW)
  }
}
/* a positional key → its rid-anchored form. All-or-nothing: if EVERY row on the
   path carries a rid, each position slot becomes that row's rid; if any row is
   missing a rid (a legacy/pristine row) or a slot is already a rid, the key is
   returned UNCHANGED — the "fallback to position" the scope names, and also what
   makes this idempotent (a rid slot is non-numeric, so the walk bails). */
export function ridKey(key: any, days: any[]): string {
  const s = String(key), c = s.indexOf(':'), prefix = c < 0 ? '' : s.slice(0, c);
  if (NONROW.has(prefix)) return s;
  const parts = (c < 0 ? s : s.slice(c + 1)).split('.'), day = (days || [])[+parts[0]!];
  if (!day) return s;
  const lv = keyLevels(prefix, parts); if (!lv) return s;
  const out = parts.slice(); let container: any = day;
  for (const { slot, arr } of lv) {
    const a = arr(container), comp = parts[slot]!;
    if (!/^\d+$/.test(comp)) return s;                           // already a rid / not positional → leave it
    const row = Array.isArray(a) ? a[+comp] : null;
    if (!row || typeof row.rid !== 'string' || !row.rid) return s;   // no id here → positional fallback
    out[slot] = row.rid; container = row;
  }
  return (c < 0 ? '' : prefix + ':') + out.join('.');
}
/* a rid-anchored key → the row's CURRENT positional key, or null if the row is
   gone (a deleted rid). Tolerant of a mixed key: a numeric slot is kept as-is
   (a legacy/fallback address), a rid slot is resolved to the row's live index. */
export function posKey(key: any, days: any[]): string | null {
  const s = String(key), c = s.indexOf(':'), prefix = c < 0 ? '' : s.slice(0, c);
  if (NONROW.has(prefix)) return s;
  const parts = (c < 0 ? s : s.slice(c + 1)).split('.'), day = (days || [])[+parts[0]!];
  if (!day) return null;
  const lv = keyLevels(prefix, parts); if (!lv) return s;
  const out = parts.slice(); let container: any = day;
  for (const { slot, arr } of lv) {
    const a = arr(container); if (!Array.isArray(a)) return null;
    const comp = parts[slot];
    /* a short/malformed key leaves this slot undefined; without the guard the
       findIndex below would match the first row that has NO rid (r.rid ===
       undefined) and hand back a real-looking address for the wrong row */
    if (typeof comp !== 'string' || !comp) return null;
    const ix = /^\d+$/.test(comp) ? +comp : a.findIndex((r: any) => r && r.rid === comp);
    if (ix < 0 || !a[ix]) return null;                          // the addressed row is gone
    out[slot] = String(ix); container = a[ix];
  }
  return (c < 0 ? '' : prefix + ':') + out.join('.');
}
/* Is this key a ROW address — a keyLevels-known prefix, or the bare flying
   seat — rather than a note / synthetic (NONROW) or an unknown key? The
   write-in self-heal gates on this so a note or del:/mov: key never triggers a
   wasted mint walk (posKey returns the string, not null, for an unknown prefix,
   so an ungated check could not tell them apart). */
export function isRowKey(key:any):boolean{
  const s=String(key),c=s.indexOf(':'),prefix=c<0?'':s.slice(0,c);
  if(NONROW.has(prefix))return false;
  const parts=(c<0?s:s.slice(c+1)).split('.');
  return keyLevels(prefix,parts)!==null;
}
/* THE WRITE-IN TRANSLATE, self-healing (review finding 1). A mark is stored
   rid-anchored, but ridKey can only anchor a row that ALREADY carries a rid —
   and a freshly-created row is marked (noteChange / markEdit / trackStructuralAdd)
   BEFORE the next histPush mints its id. So when ridKey returns the key
   unchanged AND it is a row key, mint the whole week's ids (ensureRowIds —
   whole-week, never per-day, so a cross-day duplicate is re-minted before it
   can orphan the mark) and translate once more. This is the SAFETY mechanism:
   a missed per-site mint at any creation path cannot silently store a positional
   key, so the board's per-site mints are an optimisation, not the guarantee.
   A NONROW / unknown key returns unchanged with no walk; an already-rid key is
   idempotent (ridKey bails on the first non-numeric slot, so no walk). */
export function ridWriteKey(key:any,days:any[]):string{
  const s=String(key),m=ridKey(s,days);
  if(m!==s)return m;                       // anchored, or already rid
  if(!isRowKey(s))return m;                // note / synthetic / unknown — leave positional
  ensureRowIds(days);
  return ridKey(s,days);
}
/* MIGRATE A PERSISTED BOOK written with positional keys (the storage seam now
   persists SCHED per browser). Runs once per boot/week-load AFTER
   backfillSnapshotIds (every row has a rid) and BEFORE the baseline, so a
   re-keying is not read as a dirtying edit. Rewrites the live book — pending,
   changes, added, and every AL's keys/adds/structAdds/snap.c — from positional
   to rid form against the live DAYS; an unresolvable key is left positional
   (fallback). Idempotent: an already-rid key returns itself. Returns how many
   keys changed. NOTE: not wired into store.ts in this foundation step — a pure
   function, tested in isolation; the wiring is task 5. */
export function migrateBookKeys(sched: any, days: any[]): number {
  if (!sched) return 0;
  let n = 0;
  const one = (k: any, d: any[]) => { const m = ridKey(k, d); if (m !== k) n++; return m; };
  const remap = (o: any, d: any[]) => { const out: any = {}; for (const k of Object.keys(o || {})) out[one(k, d)] = o[k]; return out; };
  sched.pending = remap(sched.pending, days);
  sched.changes = remap(sched.changes, days);
  sched.added = remap(sched.added, days);
  (sched.als || []).forEach((al: any) => {
    /* keys/adds/structAdds address the LIVE model (they paint live cells), so
       they translate against the live day. */
    if (al.keys) al.keys = al.keys.map((k: any) => one(k, days));
    if (al.adds) al.adds = al.adds.map((k: any) => one(k, days));
    if (al.structAdds) al.structAdds = al.structAdds.map((k: any) => one(k, days));
    /* a snapshot's changes-slice addresses the SNAPSHOT's OWN rows (restore
       installs snap.c alongside snap.d), so it translates against snap.d — which
       backfillSnapshotIds has already given rids. Translating it against the
       live day would map a row that has since moved onto the wrong rid, the
       exact mis-attribution this change exists to prevent. A legacy snap with
       no day blob falls back to the live day. */
    if (al.snap) Object.keys(al.snap).forEach((di: any) => {
      const sd = al.snap[di]; if (!sd || !sd.c) return;
      let ref = days;
      if (sd.d) { ref = []; ref[+di] = sd.d; }
      sd.c = remap(sd.c, ref);
    });
  });
  /* Fable-B: SCHED.orig[di].c drives the reissue/Original preview and rides
     this same stash. Missing here, its marks are lost on migration. Re-key it
     against its OWN snapshot day (orig[di].d), exactly as al.snap.c above —
     backfillSnapshotIds has already given orig[di].d its rids. */
  Object.keys(sched.orig || {}).forEach((di: any) => {
    const o = sched.orig[di]; if (!o || !o.c) return;
    let ref = days;
    if (o.d) { ref = []; ref[+di] = o.d; }
    o.c = remap(o.c, ref);
  });
  return n;
}
/* NOTE — there is deliberately NO draft-blob "re-pair by zero rid overlap"
   migration (the design's Astra RID-R5-02 proposed one; removed after the build
   bug-check, Astra RID-IR-02/03). Two reasons it was unsound: (1) a MODERN draft
   that legitimately replaced all its rows also shares zero rids with the live
   day, so a zero-overlap heuristic cannot tell it from a pre-upgrade blob and
   would corrupt its identity on the next week-stash restore; (2) SCHED is
   SESSION-ONLY (no localStorage envelope — see weekstash.ts / weekstash.test.ts),
   so a pre-`rid` book written by an older build never reaches this build across a
   reload, which is the only situation the re-pair targeted. migrateBookKeys below
   (idempotent, a no-op on an already-rid book) is the whole safe migration; a
   future persistent (database-era) book would carry an explicit format/version
   to gate any migration on, not infer legacy-ness from row-id overlap. */
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
