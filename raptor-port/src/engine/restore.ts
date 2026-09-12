import { nameToId } from './people'
import { parseHM, hhmm } from './time'
/* =====================================================================
   THE SLOT-KEY GRAMMAR WALKER (dayKeys)
   Phase 2 removed restoreDayVersion (the in-place rollback take-back): the
   only supported way to pull an old version forward is now
   loadVersionToWorkingCopy → publish the next AL (drafts.ts). The walker below
   STAYS — it is the executable documentation of the slot-key grammar, its tests
   pin every prefix, rebaseDayPending/reconcileIssuedMarks use it, and
   probe-bridge exports it.
   ===================================================================== */
/* Every user-meaningful field of a PASSED day object (never the global DAYS —
   live and snapshot are walked by the same function without any swap), keyed
   by the address the app itself uses.
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
    /* `info` (the ⓘ info-only flag) rides the composite (audit, 8 Sep 26):
       without it a flip on a published day fingerprinted as "no change" and
       reconcile threw the pending mark away — the flip could never be issued */
    m.set(`ap:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+S(r.cxr)+'␟'+(r.flag?1:0)+'␟'+(r.info?1:0));
    m.set(`ap:${di}.${ri}.sub`,S(r.sub)); m.set(`ap:${di}.${ri}.str`,T(r.str)); m.set(`ap:${di}.${ri}.end`,T(r.end));
    m.set(`ap:${di}.${ri}.rmks`,S(r.rmks));
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
      /* the FORMATION-level override f.area/f.atime rides the fingerprint beside
         the per-aircraft values: ui/textedit.ts writes the override (what the
         cell shows, areaText/atimeText) and html.ts renders it, so a diff that
         watched only the aircraft values missed an override edit and reconcile
         then dropped its pending mark (Astra RID-REV-02). null stays distinct
         from '' so unset never reads as an explicit clear. */
      m.set(`ar:${di}.${gi}.${li}`,J([f.area==null?null:String(f.area),(f.aircraft||[]).map((a:any)=>a.area==null?null:String(a.area))]));
      m.set(`at:${di}.${gi}.${li}`,J([f.atime==null?null:String(f.atime),(f.aircraft||[]).map((a:any)=>a.atime==null?null:String(a.atime))]));
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
      /* cxr (the cancel REASON) rides the composite, as ap:/fr: already do —
         without it, changing only a cancelled duty's reason left role/cx/flag
         unchanged, so reconcile dropped the mark and the revised reason reached
         no AL (P2-IMPL-08). canonicalContent inherits this, so bxr: is retired. */
      m.set(`dr:${di}.${wi}.${ri}.role`,S(r.role)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0)+'␟'+S(r.cxr));
      m.set(`dr:${di}.${wi}.${ri}.str`,T(r.str)); m.set(`dr:${di}.${wi}.${ri}.end`,T(r.end)); m.set(`dr:${di}.${wi}.${ri}.rmks`,S(r.rmks));
      m.set(`d:${di}.${wi}.${ri}`,P(r.id));
      (r.more||[]).forEach((v:any,x:any)=>m.set(`d:${di}.${wi}.${ri}.x${x}`,P(v)));
    });
  });
  Object.keys(d.sims||{}).forEach((kind:any)=>{
    (d.sims[kind]||[]).forEach((r:any,ri:any)=>{
      m.set(`sr:${di}.${kind}.${ri}.label`,S(r.label)+'␟'+S(r.who)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0)+'␟'+S(r.cxr));   // + cxr, as dr:/ap:/fr: (P2-IMPL-08)
      m.set(`sr:${di}.${kind}.${ri}.str`,T(r.str)); m.set(`sr:${di}.${kind}.${ri}.end`,T(r.end)); m.set(`sr:${di}.${kind}.${ri}.rmks`,S(r.rmks));
      if(Array.isArray(r.pax))r.pax.forEach((v:any,k:any)=>m.set(`s:${di}.${kind}.${ri}.pax.${k}`,P(v)));
      else {m.set(`s:${di}.${kind}.${ri}.p`,P(r.p)); m.set(`s:${di}.${kind}.${ri}.w`,P(r.w));}
      (r.more||[]).forEach((v:any,x:any)=>m.set(`s:${di}.${kind}.${ri}.x${x}`,P(v)));
    });
  });
  (d.ground||[]).forEach((r:any,ri:any)=>{
    m.set(`gr:${di}.${ri}.prog`,S(r.prog)+'␟'+(r.cx?1:0)+'␟'+(r.flag?1:0)+'␟'+(r.info?1:0)+'␟'+S(r.cxr));   // + info + cxr, as ap: above (P2-IMPL-08)
    m.set(`gr:${di}.${ri}.str`,T(r.str)); m.set(`gr:${di}.${ri}.end`,T(r.end)); m.set(`gr:${di}.${ri}.rmks`,S(r.rmks));
    m.set(`g:${di}.${ri}`,P(r.who));
    (r.more||[]).forEach((v:any,x:any)=>m.set(`g:${di}.${ri}.x${x}`,P(v)));
  });
  return m;
}
