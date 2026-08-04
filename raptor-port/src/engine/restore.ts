import { DAYS } from './data'
import { SCHED, daySnapOf } from './publish'
/* =====================================================================
   RESTORE A DAY TO A PUBLISHED VERSION
   Not a history rewrite: the snapshot replaces the live day and every field
   that actually moved is marked PENDING, so the revert goes out as the next
   AL like any other edit. Lives in its own module because slots.ts already
   imports publish.ts — restore needs both sides of that edge.
   ===================================================================== */
/* Every user-meaningful field of a PASSED day object (never the global DAYS —
   live and snapshot are walked by the same function without any swap), keyed
   by the address the app itself uses, so the pending marks the diff raises
   decorate real on-screen elements. Row state that has no text key of its own
   (cx / cx reason / red flag / night) rides as a composite on the row's name
   field — a CX toggle then marks the row it cancelled, which is where the
   scheduler's eye goes. Structured values (opts, intimes, traffic, areas) are
   JSON so null stays distinct from '' — the area cells derive a fallback at
   render time and baking it in would mark cells nobody edited. */
export function dayKeys(d:any,di:any){
  const m=new Map<string,string>();
  const S=(v:any)=>String(v==null?'':v);
  const J=(v:any)=>JSON.stringify(v==null?null:v);
  (d.notes||[]).forEach((t:any,ni:any)=>m.set(`dn:${di}.${ni}`,S(t)));
  m.set(`sn:${di}`,S(d.simnotes));
  (d.allhands||[]).forEach((r:any,ri:any)=>{
    m.set(`ap:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+S(r.cxr)+'␟'+(r.flag?1:0));
    m.set(`ap:${di}.${ri}.sub`,S(r.sub)); m.set(`ap:${di}.${ri}.str`,S(r.str)); m.set(`ap:${di}.${ri}.end`,S(r.end));
    const who=Array.isArray(r.who)?r.who:(r.who?[r.who]:[]);
    who.forEach((nm:any,k:any)=>m.set(`a:${di}.${ri}.${k}`,S(nm)));
  });
  (d.waves||[]).forEach((w:any,gi:any)=>{
    m.set(`wl:${di}.${gi}`,S(w.label)+'␟'+(w.night?1:0)+'␟'+S(w.kind));
    m.set(`it:${di}.${gi}`,J(w.intimes||[]));
    m.set(`tr:${di}.${gi}`,J(w.traffic||[]));
    (w.formations||[]).forEach((f:any,li:any)=>{
      m.set(`ff:${di}.${gi}.${li}.cs`,S(f.cs)+'␟'+(f.cx?1:0));
      m.set(`ff:${di}.${gi}.${li}.msn`,S(f.msn));
      m.set(`ff:${di}.${gi}.${li}.to`,S(f.to)); m.set(`ff:${di}.${gi}.${li}.ld`,S(f.ld));
      m.set(`ar:${di}.${gi}.${li}`,J((f.aircraft||[]).map((a:any)=>a.area==null?null:String(a.area))));
      m.set(`at:${di}.${gi}.${li}`,J((f.aircraft||[]).map((a:any)=>a.atime==null?null:String(a.atime))));
      (f.aircraft||[]).forEach((a:any,ai:any)=>{
        m.set(`${di}.${gi}.${li}.${ai}.p`,S(a.p)); m.set(`${di}.${gi}.${li}.${ai}.w`,S(a.w));
        m.set(`fr:${di}.${gi}.${li}.${ai}`,S(a.rmks)+'␟'+(a.cx?1:0)+'␟'+S(a.cxr)+'␟'+(a.flag?1:0)+'␟'+S(a.role)+'␟'+(a.spare?1:0));
        m.set(`st:${di}.${gi}.${li}.${ai}`,J(a.opts||{}));
      });
    });
  });
  (d.dutywaves||[]).forEach((dw:any,wi:any)=>{
    m.set(`dl:${di}.${wi}`,S(dw.label));
    (dw.rows||[]).forEach((r:any,ri:any)=>{
      m.set(`dr:${di}.${wi}.${ri}.role`,S(r.role)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0));
      m.set(`dr:${di}.${wi}.${ri}.str`,S(r.str)); m.set(`dr:${di}.${wi}.${ri}.end`,S(r.end)); m.set(`dr:${di}.${wi}.${ri}.rmks`,S(r.rmks));
      m.set(`d:${di}.${wi}.${ri}`,S(r.id));
      (r.more||[]).forEach((v:any,x:any)=>m.set(`d:${di}.${wi}.${ri}.x${x}`,S(v)));
    });
  });
  Object.keys(d.sims||{}).forEach((kind:any)=>{
    (d.sims[kind]||[]).forEach((r:any,ri:any)=>{
      m.set(`sr:${di}.${kind}.${ri}.label`,S(r.label)+'␟'+S(r.who)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0));
      m.set(`sr:${di}.${kind}.${ri}.str`,S(r.str)); m.set(`sr:${di}.${kind}.${ri}.end`,S(r.end)); m.set(`sr:${di}.${kind}.${ri}.rmks`,S(r.rmks));
      if(Array.isArray(r.pax))r.pax.forEach((v:any,k:any)=>m.set(`s:${di}.${kind}.${ri}.pax.${k}`,S(v)));
      else {m.set(`s:${di}.${kind}.${ri}.p`,S(r.p)); m.set(`s:${di}.${kind}.${ri}.w`,S(r.w));}
      (r.more||[]).forEach((v:any,x:any)=>m.set(`s:${di}.${kind}.${ri}.x${x}`,S(v)));
    });
  });
  (d.ground||[]).forEach((r:any,ri:any)=>{
    m.set(`gr:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0));
    m.set(`gr:${di}.${ri}.str`,S(r.str)); m.set(`gr:${di}.${ri}.end`,S(r.end)); m.set(`gr:${di}.${ri}.rmks`,S(r.rmks));
    m.set(`g:${di}.${ri}`,S(r.who));
    (r.more||[]).forEach((v:any,x:any)=>m.set(`g:${di}.${ri}.x${x}`,S(v)));
  });
  return m;
}
/* false = no such version. Otherwise the number of keys that moved (0 is a
   legitimate answer: restoring a version identical to live). Deliberately NO
   histPush and NO reflow here — the UI caller's afterSchedMutate() → markEdit()
   is the single undo step; a push here would double-step the stack. */
export function restoreDayVersion(di:any,ver:any){
  di=+di;
  const snap=daySnapOf(di,ver); if(!snap)return false;
  const live=dayKeys(DAYS[di],di), old=dayKeys(snap.d,di);
  const nd=JSON.parse(JSON.stringify(snap.d));
  nd.today=!!(DAYS[di]&&DAYS[di].today);   // 'today' tracks the calendar, not the document
  DAYS[di]=nd;
  let n=0;
  /* noteChange's exact body (slots.ts), inlined so this module needs nothing
     from slots: mark pending, drop any published colour the key carried. Keys
     equal in both versions stay untouched — their AL marks survive the revert.
     Keys that exist only in LIVE are rows the restore just removed, and the
     delete rule holds: a delete must not re-mark the address it removed. */
  old.forEach((v:any,k:any)=>{ if(live.get(k)!==v){SCHED.pending[k]=1; delete SCHED.changes[k]; n++;} });
  return n;
}
