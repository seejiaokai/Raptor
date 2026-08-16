import { DAYS } from './data'
import { SCHED, daySnapOf } from './publish'
import { keyDay } from './keys'
import { nameToId } from './people'
import { parseHM, hhmm } from './time'
/* =====================================================================
   ROLL A DAY BACK TO A PUBLISHED VERSION
   A rollback, not an amendment (owner decision, Aug 26): clicking Restore
   makes that version the live document immediately — content, marks and the
   header chip all become that AL. Nothing goes pending; unpublished edits on
   the day are DISCARDED (reported to the caller); later ALs keep their
   records and stay in the dropdown. Lives in its own module because slots.ts
   already imports publish.ts — restore needs both sides of that edge.
   ===================================================================== */
/* Every user-meaningful field of a PASSED day object (never the global DAYS —
   live and snapshot are walked by the same function without any swap), keyed
   by the address the app itself uses. restoreDayVersion no longer diffs, but
   the walker stays: it is the executable documentation of the slot-key
   grammar, its tests pin every prefix, and probe-bridge exports it.
   Row state that has no text key of its own
   (cx / cx reason / red flag / night) rides as a composite on the row's name
   field — a CX toggle then marks the row it cancelled, which is where the
   scheduler's eye goes. Structured values (opts, intimes, traffic, areas) are
   JSON so null stays distinct from '' — the area cells derive a fallback at
   render time and baking it in would mark cells nobody edited. */
export function dayKeys(d:any,di:any){
  const m=new Map<string,string>();
  const S=(v:any)=>String(v==null?'':v);
  const J=(v:any)=>JSON.stringify(v==null?null:v);
  /* Person-valued cells are compared CANONICALLY: a seed/pre-fix row holds the
     person's id ('nact') where an app write stores his callsign ('Nact') —
     both name the same man, and comparing them raw made a moved-and-restored
     person on such a row read as a permanent diff (a pending mark that could
     never clear, and a rebase diff that was never real). nameToId resolves a
     callsign to its id and returns undefined for anything else — an id, free
     text, a placeholder — so P() folds the two spellings together and leaves
     every other value untouched. Keys and structure are unchanged.
     TIME cells fold the same way (owner's revert rule, 16 Aug 26): the seed
     stores '0700' where txtSet writes '07:00', so re-typing the very time the
     issued document shows read as a permanent pending edit — an AL whose whole
     content is a respelling. parseHM is the shared loose reader and returns
     null for anything that is not a clock time, so free text ('TBD', '') passes
     through raw. The JSON composites (it:/tr:/ar:/at:) are left raw — both
     documents reach them through one normalising write path; fold inside the
     JSON only if this class ever bites there. */
  const P=(v:any)=>{const s=S(v);return nameToId(s)||s;};
  const T=(v:any)=>{const s=S(v);const min=parseHM(s);return min==null?s:hhmm(min);};
  (d.notes||[]).forEach((t:any,ni:any)=>m.set(`dn:${di}.${ni}`,S(t)));
  m.set(`sn:${di}`,S(d.simnotes));
  m.set(`pn:${di}`,S(d.prognotes));
  m.set(`dtn:${di}`,S(d.dutynotes));
  m.set(`gn:${di}`,S(d.grndnotes));
  (d.allhands||[]).forEach((r:any,ri:any)=>{
    m.set(`ap:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+S(r.cxr)+'␟'+(r.flag?1:0));
    m.set(`ap:${di}.${ri}.sub`,S(r.sub)); m.set(`ap:${di}.${ri}.str`,T(r.str)); m.set(`ap:${di}.${ri}.end`,T(r.end));
    const who=Array.isArray(r.who)?r.who:(r.who?[r.who]:[]);
    who.forEach((nm:any,k:any)=>m.set(`a:${di}.${ri}.${k}`,P(nm)));
  });
  (d.waves||[]).forEach((w:any,gi:any)=>{
    m.set(`wl:${di}.${gi}`,S(w.label)+'␟'+(w.night?1:0)+'␟'+S(w.kind));
    m.set(`it:${di}.${gi}`,J(w.intimes||[]));
    m.set(`tr:${di}.${gi}`,J(w.traffic||[]));
    (w.formations||[]).forEach((f:any,li:any)=>{
      m.set(`ff:${di}.${gi}.${li}.cs`,S(f.cs)+'␟'+(f.cx?1:0));
      m.set(`ff:${di}.${gi}.${li}.msn`,S(f.msn));
      m.set(`ff:${di}.${gi}.${li}.to`,T(f.to)); m.set(`ff:${di}.${gi}.${li}.ld`,T(f.ld));
      m.set(`ff:${di}.${gi}.${li}.br`,T(f.br));   // the indicated brief time — rolls back with its line
      m.set(`ar:${di}.${gi}.${li}`,J((f.aircraft||[]).map((a:any)=>a.area==null?null:String(a.area))));
      m.set(`at:${di}.${gi}.${li}`,J((f.aircraft||[]).map((a:any)=>a.atime==null?null:String(a.atime))));
      (f.aircraft||[]).forEach((a:any,ai:any)=>{
        m.set(`${di}.${gi}.${li}.${ai}.p`,P(a.p)); m.set(`${di}.${gi}.${li}.${ai}.w`,P(a.w));
        m.set(`fr:${di}.${gi}.${li}.${ai}`,S(a.rmks)+'␟'+(a.cx?1:0)+'␟'+S(a.cxr)+'␟'+(a.flag?1:0)+'␟'+S(a.role)+'␟'+(a.spare?1:0));
        m.set(`st:${di}.${gi}.${li}.${ai}`,J(a.opts||{}));
      });
    });
  });
  (d.dutywaves||[]).forEach((dw:any,wi:any)=>{
    m.set(`dl:${di}.${wi}`,S(dw.label));
    (dw.rows||[]).forEach((r:any,ri:any)=>{
      m.set(`dr:${di}.${wi}.${ri}.role`,S(r.role)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0));
      m.set(`dr:${di}.${wi}.${ri}.str`,T(r.str)); m.set(`dr:${di}.${wi}.${ri}.end`,T(r.end)); m.set(`dr:${di}.${wi}.${ri}.rmks`,S(r.rmks));
      m.set(`d:${di}.${wi}.${ri}`,P(r.id));
      (r.more||[]).forEach((v:any,x:any)=>m.set(`d:${di}.${wi}.${ri}.x${x}`,P(v)));
    });
  });
  Object.keys(d.sims||{}).forEach((kind:any)=>{
    (d.sims[kind]||[]).forEach((r:any,ri:any)=>{
      m.set(`sr:${di}.${kind}.${ri}.label`,S(r.label)+'␟'+S(r.who)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0));
      m.set(`sr:${di}.${kind}.${ri}.str`,T(r.str)); m.set(`sr:${di}.${kind}.${ri}.end`,T(r.end)); m.set(`sr:${di}.${kind}.${ri}.rmks`,S(r.rmks));
      if(Array.isArray(r.pax))r.pax.forEach((v:any,k:any)=>m.set(`s:${di}.${kind}.${ri}.pax.${k}`,P(v)));
      else {m.set(`s:${di}.${kind}.${ri}.p`,P(r.p)); m.set(`s:${di}.${kind}.${ri}.w`,P(r.w));}
      (r.more||[]).forEach((v:any,x:any)=>m.set(`s:${di}.${kind}.${ri}.x${x}`,P(v)));
    });
  });
  (d.ground||[]).forEach((r:any,ri:any)=>{
    m.set(`gr:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0));
    m.set(`gr:${di}.${ri}.str`,T(r.str)); m.set(`gr:${di}.${ri}.end`,T(r.end)); m.set(`gr:${di}.${ri}.rmks`,S(r.rmks));
    m.set(`g:${di}.${ri}`,P(r.who));
    (r.more||[]).forEach((v:any,x:any)=>m.set(`g:${di}.${ri}.x${x}`,P(v)));
  });
  return m;
}
/* false = no such version. Otherwise the number of unpublished edits the
   rollback DISCARDED (0 is the common answer) — that count is what the toast
   owes the user. Deliberately NO histPush and NO reflow here — the UI
   caller's afterSchedMutate() → markEdit() is the single undo step; a push
   here would double-step the stack. Signatures, dayOK, orig and the AL
   records are all untouched: the day stays published, rolling back neither
   needs nor spends a sign-off, and later ALs keep their dropdown entries. */
export function restoreDayVersion(di:any,ver:any){
  di=+di;
  const snap=daySnapOf(di,ver); if(!snap)return false;
  const nd=JSON.parse(JSON.stringify(snap.d));
  nd.today=!!(DAYS[di]&&DAYS[di].today);   // 'today' tracks the calendar, not the document
  DAYS[di]=nd;
  /* wipe the day's mark slices FIRST, then install the snapshot's own changes
     slice, so the day wears exactly the marks it was issued with — a rollback
     to the Original (whose slice is empty) shows no marks at all */
  Object.keys(SCHED.changes).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.changes[k];});
  let dropped=0;
  Object.keys(SCHED.pending).forEach((k:any)=>{if(keyDay(k)===di){delete SCHED.pending[k];dropped++;}});
  /* A rollback replaces the whole live day with issued content. Any draft-add
     identities for that day belonged to rows just discarded; leaving them at
     reused addresses can make a later deletion of an issued row look like a
     draft no-op. */
  Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.added[k];});
  Object.keys(snap.c||{}).forEach((k:any)=>{SCHED.changes[k]=snap.c[k];});
  SCHED.cur=SCHED.cur||{}; SCHED.cur[di]=(ver==='orig')?'orig':+ver;
  return dropped;
}
