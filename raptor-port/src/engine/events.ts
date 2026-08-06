import { DAYS } from './data'
import { INPUTS, inputCoversDate, inputFlags } from './inputs'
import { PEOPLE, isSpecial, nameToId, aarNeed } from './people'
import { toMin, parseHM, win } from './time'
import { VCONF } from './rules'
import { isStandalone, saExempt } from './waves'
import { whoArr } from './slots'
export function intimeMap(w:any){ const m:any={}; (w.intimes||[]).forEach((t:any)=>{ const tm=(t.match(/(\d{3,4})\s*H/)||[])[1]; const cs=(t.match(/\b([A-Z]{2})\s+IN\s+TIME/i)||[])[1]; if(tm&&cs)m[cs.toUpperCase()]=parseHM(tm); }); return m; }
/* "BRIEF 30 PRIOR", "brief 30", "30 mins prior" — an OFT remark that names its
   own brief lead overrides VCONF.epBrief for that line only (owner, 5 Aug 26);
   the seed EP-4s said 30 while the engine padded 15. \b keeps DEBRIEF out, the
   brief-first order settles "BRIEF 30 PRIOR" on the 30 it names, and the 0–240
   bound mirrors RULE_SPEC.epBrief so a typo like "BRIEF 3000" falls back to
   the default instead of minting a 50-hour window. */
export const briefLeadOf=(rmks:any)=>{ const s=String(rmks||'');
  const m=s.match(/\bbrief\s*[-:]?\s*(\d{1,3})\b/i)||s.match(/\b(\d{1,3})\s*(?:min(?:ute)?s?\s*)?prior\b/i);
  if(!m)return null; const n=+m[1]; return n>0&&n<=240?n:null; };
/* "2A: LATE SHOW", "SHOW AT BRIEF", "show @ brief" — an aircraft remark saying
   this crew is not required at the published in-time, only from the brief
   (owner, 6 Aug 26). Crew rest normally anchors on whichever comes first, the
   in-time or the brief; this moves that crew's anchor onto the brief alone.
   It does NOT excuse the rest rule — the 12h is still measured to the brief,
   so a brief that is itself too early still breaches. Parsed off the remark
   rather than a new field because the ride prefix ("2A:") is the squadron's
   own labelling and the phrase is what carries meaning — the same shape as
   briefLeadOf above and aarNeed in people.ts. */
export const lateShowOf=(rmks:any)=>/\b(?:late\s*show|show\s*(?:at|@)\s*brief|brief\s*show)\b/i.test(String(rmks||''));
export function collectEvents(){
  return DAYS.map((d:any,di:any)=>{
    const fly:any[]=[],forms:any[]=[],events:any[]=[],simcrew:any[]=[];
    (d.waves||[]).forEach((w:any,gi:any)=>{
      const im=intimeMap(w);
      w.formations.forEach((f:any,li:any)=>{
        if(f.cx)return;                                        // cancelled line — nothing to check
        if(saExempt(w,f,null))return;                          // AVALON / BB — wholly outside the engine
        const toM=toMin(f.to);
        let ldM=toMin(f.ld||f.to); if(ldM<toM)ldM+=1440;      // landed after midnight
        /* A STANDALONE line is a SHIFT, not a sortie: 0700–1300 means 0700–1300.
           It used to be padded like a jet — an hour of step in front, half an
           hour of dekit behind, a brief before that and a two-hour debrief tail —
           which made SC AM (07–13) and SC PM (13–19) overlap by 50 minutes and
           reported two clean abutting shifts as one fifteen-hour day. */
        const shiftLine=isStandalone(w);
        /* The brief time the scheduler INDICATED on the line (f.br) governs
           every brief-driven rule (owner, 6 Aug 26). VCONF.briefLead is only
           the default the board offers as a suggestion to accept — a blank B
           is still checked, against that same suggested time, so a line
           nobody has confirmed never goes silently unchecked. A standalone
           wave is a shift, not a sortie: it briefs nothing, and a value typed
           on one stays inert because every consumer gates on shift first. */
        const brTyped=shiftLine?null:parseHM(f.br);
        const briefM=shiftLine?null:(brTyped!=null?brTyped:toM-VCONF.briefLead);
        const stepM=shiftLine?toM:toM-VCONF.step;               // sortie: step 1h pre-T/O
        const dekitM=shiftLine?ldM:ldM+VCONF.dekit;             // sortie: land + 30m dekit
        /* intime is the in-time the wave actually PUBLISHED (null when none is
           given); report falls back to the step time so the occupied window is
           still right. Crew rest needs the difference between the two. */
        const intime=(im[f.cs]!=null)?im[f.cs]:null;
        const report=(intime!=null)?intime:stepM;
        const fcps:any[]=[],acs:any[]=[],allCrew:any[]=[],spareCrew:any[]=[];
        f.aircraft.forEach((a:any,ai:any)=>{ if(a.cx)return;
          /* collected BEFORE the spare exemption: a spare crew is not checked
             against other commitments, but their SC currency still is */
          [a.p,a.w].forEach((id:any)=>{if(id&&PEOPLE[id]&&!isSpecial(id))allCrew.push(id);});
          if(saExempt(w,f,a)){                                  // SC SPARE — stood by, not cross-checked
            /* ...but still kept, because "not cross-checked against other tasks"
               is not the same as "may be anywhere on earth" */
            [a.p,a.w].forEach((id:any)=>{if(id&&PEOPLE[id]&&!isSpecial(id))spareCrew.push(id);});
            return;}
          /* night for AAR purposes: the wave says so, or the sortie itself runs
             past 19:00 between take-off and landing */
          /* key = the aircraft's slot-key prefix, captured HERE because acs
             excludes CX'd and spare aircraft — ai is not recoverable by
             position later. Warnings anchor on it to pan to the line. */
          acs.push({p:a.p,w:a.w,rmks:a.rmks,aar:aarNeed(a.rmks,!!w.night||ldM>19*60),key:`${di}.${gi}.${li}.${ai}`});
          [['FCP',a.p],['RCP',a.w]].forEach((pair:any)=>{ const seat=pair[0],id=pair[1]; if(!id||isSpecial(id))return;
            if(seat==='FCP')fcps.push(id);
            fly.push({id,seat,brief:briefM,to:toM,ld:ldM,step:stepM,dekit:dekitM,report,intime,
              lateShow:!shiftLine&&lateShowOf(a.rmks),   // this crew shows at the brief, not at the in-time
              shift:shiftLine,label:`${f.cs} ${f.msn}`,key:`${di}.${gi}.${li}.${ai}.${seat==='FCP'?'p':'w'}`});
            /* the slot key this event came off — so the crew picker can ask
               "is he busy at this hour" without counting the very slot it is
               about to plant him into (he occupies it in a swap or a re-test) */
            events.push({id,s:stepM,e:dekitM,to:toM,ld:ldM,report,brief:briefM,label:`${f.cs} ${f.msn}`,
              kind:shiftLine?'shift':'fly',slot:`${di}.${gi}.${li}.${ai}.${seat==='FCP'?'p':'w'}`});
          });
        });
        /* an SC formation carries its shift window so the SC DAY / SC NIGHT
           currency can be checked against it */
        forms.push({label:`${f.cs} ${f.msn}`,cs:f.cs,fcps,acs,
          sc:isStandalone(w)&&w.kind==='sc', shift:f.msn||f.shift||'', s:toM, e:ldM,
          allCrew:[...new Set(allCrew)], spareCrew:[...new Set(spareCrew)],key:`${di}.${gi}.${li}`});
      });
    });
    ['amt','oft'].forEach((k:any)=>((d.sims&&d.sims[k])||[]).forEach((s:any,ri:any)=>{ if(s.cx)return;
      const st=parseHM(s.str), en=parseHM(s.end)!=null?parseHM(s.end):(st!=null?st+90:null);
      /* a sim box has the same two seats as the jet: front = pilot, back = WSO.
         only rows that actually name a p/w pair get seat-qualification checked. */
      if(s.p||s.w)simcrew.push({p:s.p,w:s.w,label:(k.toUpperCase()+' '+(s.label||'sim')),kind:k,ri});
      /* through win(), like every other row: a 2300–0100 box used to be stored
         as [1380,60] — an inverted interval that `overlap` can never match, so
         every check on that row was silently switched off. And the bodies
         dropped underneath the row (more[]) are as tasked as the two in seats. */
      const sw=win(st,en,90); if(!sw)return;
      [s.p,s.w,nameToId(s.who)].concat(s.pax||[]).concat(s.more||[])
        .forEach((id:any)=>{ if(id&&PEOPLE[id]&&!isSpecial(id))events.push({id,s:sw[0],e:sw[1],label:'Sim '+s.label,kind:'sim',key:'s:'+di+'.'+k+'.'+ri}); }); }));
    /* ---- sim brief / debrief windows -------------------------------------
       An EP profile on the OFT briefs 15 min before the box — unless its
       remarks name their own lead (briefLeadOf above), which wins for that
       line — and debriefs for 30 min after. The AMT is run as a block: it
       carries its OWN BRIEF row, and that row's time is the hard line — no
       extra lead is added on top — while its debrief is the DEBRIEF row + 30.
       Windows deliberately ABUT the box rather than overlap it, so the sim
       never clashes with itself.                                              */
    const simwin:any[]=[];
    const isB=(r:any)=>/^\s*BRIEF/i.test(r.label||''), isD=(r:any)=>/DEBRIEF/i.test(r.label||'');
    const rowIds=(r:any)=>[r.p,r.w,nameToId(r.who)].concat(r.pax||[]).concat(r.more||[]).filter((id:any)=>id&&PEOPLE[id]&&!isSpecial(id));
    ((d.sims&&d.sims.oft)||[]).forEach((s:any,ri:any)=>{ if(s.cx)return; if(!/EP/i.test(s.label||''))return;
      const st=parseHM(s.str); if(st==null)return;
      const en=parseHM(s.end)!=null?parseHM(s.end):st+90, ids=rowIds(s); if(!ids.length)return;
      const lead=briefLeadOf(s.rmks);
      simwin.push({ids,label:'OFT '+(s.label||'sim'),bs:st-(lead!=null?lead:VCONF.epBrief),be:st,ds:en,de:en+VCONF.simDebrief,key:`s:${di}.oft.${ri}`}); });
    (()=>{ const rows=((d.sims&&d.sims.amt)||[]).filter((r:any)=>!r.cx); if(!rows.length)return;
      const box=rows.filter((r:any)=>!isB(r)&&!isD(r));
      const ids=[...new Set(box.reduce((a:any,r:any)=>a.concat(rowIds(r)),[]))]; if(!ids.length)return;
      const br=rows.find(isB), dr=rows.find(isD);
      const bs=br?parseHM(br.str):null;
      const boxStart=box.reduce((m:any,r:any)=>{const t=parseHM(r.str);return t!=null&&(m==null||t<m)?t:m;},null);
      const boxEnd=box.reduce((m:any,r:any)=>{const t=parseHM(r.end)!=null?parseHM(r.end):parseHM(r.str);return t!=null&&(m==null||t>m)?t:m;},null);
      const ds=dr?parseHM(dr.str):boxEnd;
      /* the AMT block anchors on its BRIEF row if it has one, else the first
         box row; indexOf against the MODEL array recovers the true ri because
         `rows` was filtered (cx dropped) */
      simwin.push({ids,label:'AMT',
        bs:bs!=null?bs:null, be:bs!=null?(boxStart!=null?boxStart:bs):null,
        ds:ds!=null?ds:null, de:ds!=null?ds+VCONF.amtDebrief:null,key:'s:'+di+'.amt.'+d.sims.amt.indexOf(br||box[0])}); })();
    /* every body on a row counts, not just the one in its primary seat: the
       extras dropped underneath (row.more) were invisible to the engine, so a
       man added to a duty could fly straight through it unflagged. */
    /* kind matters now: a shift clashing with a duty post is a Warning, with a
       ground event or a programme item only an Advisory. */
    const push=(id:any,st:any,en:any,label:any,kind:any,key?:any)=>{
      if(!id||!PEOPLE[id]||isSpecial(id))return;
      const w2=win(st,en); if(!w2)return;
      /* the same man in the row's seat AND in its more[] is one commitment, not
         two — he used to be flagged as clashing with himself */
      if(events.some((x:any)=>x.id===id&&x.s===w2[0]&&x.e===w2[1]&&x.label===label))return;
      events.push({id,s:w2[0],e:w2[1],label,kind:kind||'other',key});
    };
    const extras=(r:any)=>(r&&r.more)||[];
    (d.dutywaves||[]).forEach((dw:any,dwi:any)=>dw.rows.forEach((r:any,ri:any)=>{ if(r.cx||dw.noconf||r.noconf)return;
      const st=parseHM(r.str),en=parseHM(r.end);
      push(r.id,st,en,r.role+' duty','duty',`d:${di}.${dwi}.${ri}`);
      extras(r).forEach((x:any)=>push(x,st,en,r.role+' duty','duty',`d:${di}.${dwi}.${ri}`)); }));
    (d.ground||[]).forEach((g:any,ri:any)=>{ if(g.cx)return;
      const st=parseHM(g.str),en=parseHM(g.end);
      push(nameToId(g.who),st,en,g.prog,'ground',`g:${di}.${ri}`);
      extras(g).forEach((x:any)=>push(x,st,en,g.prog,'ground',`g:${di}.${ri}`)); });
    /* the squadron-wide Programme was never read here at all — a man booked to
       a 0845–1630 engagement could be scheduled to fly at 1245 with nothing
       said about it */
    (d.allhands||[]).forEach((x:any,ri:any)=>{ if(x.cx)return;
      const st=parseHM(x.str),en=parseHM(x.end);
      whoArr(x).forEach((nm:any)=>push(nameToId(nm),st,en,x.prog||'programme','prog',`a:${di}.${ri}`));
      extras(x).forEach((v:any)=>push(v,st,en,x.prog||'programme','prog',`a:${di}.${ri}`)); });
    const input=INPUTS.filter((inp:any)=>inputCoversDate(inp,d.dt)&&inputFlags(inp)).map((inp:any)=>({id:inp.person,s:inp.allday?0:inp.s,e:inp.allday?1439:inp.e,type:inp.type,remarks:inp.remarks}));
    return {di,dow:d.dow,dt:d.dt,fly,forms,input,events,simcrew,simwin};
  });
}
/* earliest IN-TIME of a wave (from the wave's in-time lines; fallback = earliest TO) */
export function waveInTime(w:any){
  let best:any=null;
  (w.intimes||[]).forEach((s:any)=>{const m=String(s).match(/(\d{3,4})\s*[hH]/); if(m){const t=parseHM(m[1]); if(t!=null&&(best==null||t<best))best=t;}});
  if(best==null)(w.formations||[]).forEach((f:any)=>{const to=parseHM(f.to); if(to!=null&&(best==null||to<best))best=to;});
  return best;
}
/* Contiguous wave BANDS keyed off each wave's earliest in-time.
   Band 1 = start-of-day → wave-2 in-time; band 2 = wave-2 in-time → wave-3 in-time;
   last band → end of day. (matches "morning up to next wave's in-time = this wave") */
export function waveWindows(d:any){
  const ws=(d.waves||[]).map((w:any)=>({label:w.label,night:!!w.night,in:waveInTime(w)})).filter((w:any)=>w.in!=null)
          .sort((a:any,b:any)=>a.in-b.in);
  return ws.map((w:any,i:any)=>({label:w.label,night:w.night,in:w.in,s:(i===0?0:w.in),e:(i<ws.length-1?ws[i+1].in:1440)}));
}
