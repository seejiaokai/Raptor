import { DAYS } from './data'
import { INPUTS, inputCoversDate, inputFlags, inputDormant, inpWin, isSansAvail, inpMeta, shiftHardInput, shiftHardLabel } from './inputs'
import { PEOPLE, isSpecial, nameToId, aarNeed } from './people'
import { toMin, parseHM, win, overlap } from './time'
import { VCONF, SHIFT_HARD } from './rules'
import { isStandalone, saExempt, CURWEEK } from './waves'
import { whoArr, acceptedDay } from './slots'
import { edgeDate } from './weeks-data'
/* THE ACCEPT DEFERRAL IS PER-DAY, NOT PER-INPUT (audit, 12 Aug 26).
   inputFlags defers a timed accepted input to the ground row the accept
   created — but that row lives on ONE day, while the input may cover
   several. Filtering by inputFlags alone silenced the input on EVERY
   covered day, so accepting a Tue–Thu meeting onto Wednesday switched off
   real INPUT_FLY/NO_BRIEF warnings on Tuesday and Thursday, where no row
   exists to carry the clash. The gate the carve-out promises — "a clash
   surfaces exactly once, as DOUBLE_BOOK on the ROW" — only holds on the
   row's own day, so that is the only day the deferral now applies to.
   A deferred input whose row cannot be found at all stays VISIBLE: with no
   row anywhere, hiding it here would silence the man's absence outright. */
export const inpShow=(inp:any,dt:any,xweek?:any)=>{
  /* SANS AVAILABILITY IS AN OFFER, NOT A COMMITMENT — it must never reach
     day.input (brief/debrief clashes, INPUT_FLY, the midnight-tail machinery
     all read that array). sansGate (avail.ts) is the only thing that judges
     it, against a slot, not against the day (owner, 14 Aug 26). All three
     construction sites funnel through here, so this one line keeps it out
     everywhere at once. */
  if(isSansAvail(inp.type))return false;
  /* A REMOVED INPUT IS DORMANT (owner, 26 Aug 26 — see inputDormant): parked
     back in Personal Inputs by unacceptInput, it speaks NOWHERE until
     re-accepted. Before the xweek bypass on purpose — dormancy holds for
     cross-week seed reads of the loaded week too. */
  if(inputDormant(inp))return false;
  /* CROSS-WEEK SEED READS BYPASS THE ACCEPTED-ROW DEDUP (weekctx.ts, via
     buildDay's xweek flag). acceptedDay(inp) below finds the row on the
     LOADED week's live DAYS — it has no idea a non-loaded day even exists,
     so for a pristine snapshot day (no landed ground row of its own to defer
     to) it would silently drop a spanning input's timed window from the
     seed. The tails (nx/pv, below) never set xweek and keep this dedup. */
  if(xweek)return true;
  if(inputFlags(inp))return true;                 // not a timed accepted input
  const di=acceptedDay(inp);
  return di<0||(DAYS[di]||{}).dt!==dt;            // defer only on the row's day
};
/* IS THIS EVENT A HARD CLASH AGAINST AN SC MAIN SHIFT? (owner, 26 Aug 26).
   The kind table (SHIFT_HARD) still grades ground/prog as academics — amber —
   but a GROUND ROW that IS a red-list commitment is the commitment, not
   academics. Two recoveries, src first: a row lifted from an input carries the
   source TYPE in row.src (inpKey = person|date|type|s|yr — the only place
   'Other' survives, its label being the remarks), corroborated by prog===label
   so a stale or cross-week key can never decide by the wrong row (fail-soft to
   the keywords); a hand-typed row is judged by its own words (shiftHardLabel).
   Programme (a:) rows stay amber always — they cannot be input-derived and the
   owner's keyword rule was stated about ground rows. Lives HERE beside the g:
   key grammar it parses; validator (clash loop) and crew picker (avail.ts
   live) both call it, so the two can never disagree — the same promise
   SHIFT_HARD itself makes. */
export function shiftHardGround(e:any){
  if(!e||e.kind!=='ground')return false;
  const m=/^g:(\d+)\.(\d+)$/.exec(String(e.key||''));
  const row=m&&DAYS[+m[1]]&&((DAYS[+m[1]].ground||[])[+m[2]]);
  if(row&&row.src&&String(row.prog||'')===String(e.label||'')){
    const t=String(row.src).split('|')[2];
    if(inpMeta(t))return shiftHardInput(t);
  }
  return shiftHardLabel(e.label);
}
export function shiftEvHard(e:any){return !!SHIFT_HARD[e.kind]||shiftHardGround(e);}
/* DOES HE ALREADY HOLD ANOTHER SC SEAT IN THESE HOURS? (owner, 31 Aug 26 —
   "give a warning conflict if u are planned for MAIN and SPARE in the same
   time framing … the 1300 is not a conflict"; SPARE+SPARE ruled the same red
   the same day.) A spare seat never becomes an event, so EVD cannot answer
   this — the walk reads the day MODEL, which also lets the crew picker ask
   the identical question BEFORE a plant (slotBar) and the validator after
   it, off this one body, so the two can never drift. overlap() is half-open:
   SC AM 07:00–13:00 and PM 13:00–19:00 share only the 13:00 instant and stay
   two clean shifts — the owner's own example. selfKey excludes the seat
   being asked about (a re-arm, or the seat a warning is being raised FOR).
   SC only on purpose: the AVALON rule stays owner-reserved (10 Aug 26). */
export function scSeatHit(di:any,id:any,s:any,e:any,selfKey:any){
  const d=DAYS[di]; if(!d||!id||s==null||e==null)return null;
  let hit:any=null;
  (d.waves||[]).forEach((w:any,gi:any)=>{ if(hit||!isStandalone(w)||w.kind!=='sc')return;
    (w.formations||[]).forEach((f:any,li:any)=>{ if(hit||f.cx)return;
      const st=parseHM(f.to); let en=parseHM(f.ld||f.to);
      if(st==null||en==null)return; if(en<st)en+=1440;
      if(!overlap(s,e,st,en))return;
      (f.aircraft||[]).forEach((a:any,ai:any)=>{ if(hit||a.cx)return;
        [['p',a.p],['w',a.w]].forEach(([seat,pid]:any)=>{ if(hit||pid!==id||!PEOPLE[pid]||isSpecial(pid))return;
          const k=`${di}.${gi}.${li}.${ai}.${seat}`;
          if(k===selfKey)return;
          hit={label:`${f.cs} ${f.msn}`,role:saExempt(w,f,a)?'SPARE':'MAIN',s:st,e:en,key:k};});});});});
  return hit;
}
/* The time WRITTEN in an in-time line (owner, 21 Aug 26 — "can u accept any
   form of combination"): 0900 · 09:00 · 0900H · 09:00H · 0900L · 09:00L, any
   case on the suffix. The FIRST token that reads as a real clock time wins;
   a token glued to letters (FL240, D15R) never matches, and out-of-range
   digits (2590) are skipped rather than misread. Shared by intimeMap and
   waveInTime so the report time and the wave windows can never read one line
   two ways. */
export function intimeTime(s:any){
  const re=/(?:^|[^A-Za-z0-9])(?:(\d{1,2}):(\d{2})|(\d{3,4}))\s*[HL]?(?![A-Za-z0-9])/gi;
  let m:any;
  while((m=re.exec(String(s||'')))){
    const h=m[1]!=null?+m[1]:+m[3].slice(0,m[3].length-2);
    const mi=m[1]!=null?+m[2]:+m[3].slice(-2);
    if(h<24&&mi<60)return h*60+mi;
  }
  return null;
}
/* THE SAME grammar, folding instead of reading (owner, 30 Aug 26 — every time
   reads 08:00, and a hand-typed line auto-gains the colon). Rewrites each token
   the reader above would accept into hh:mm, keeping any H/L suffix ("0900H" →
   "09:00H") and every other word exactly as typed; a token the reader skips
   (2590, FL240) is left alone, so the fold can never change what the line MEANS
   — the two must share one grammar or a fold could create/destroy a report
   time. Applied only where an edited line COMMITS (textedit.ts) and where the
   "+ In time" button mints one (interactions.ts) — never to stored lines at
   render, so the seed week's model text stays byte-identical for parity. */
export function intimeFold(s:any){
  return String(s==null?'':s).replace(
    /(^|[^A-Za-z0-9])(?:(\d{1,2}):(\d{2})|(\d{3,4}))(\s*[HLhl]?)(?![A-Za-z0-9])/g,
    (all,lead,ch,cm,d4,suf)=>{
      const h=ch!=null?+ch:+d4.slice(0,d4.length-2);
      const mi=ch!=null?+cm:+d4.slice(-2);
      if(!(h<24&&mi<60))return all;
      return lead+String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')+suf;
    });
}
/* WHICH formations a line's time applies to (owner, 21 Aug 26): a line that
   names one of THIS WAVE's formation callsigns is that formation's in-time;
   a line naming none is the WHOLE WAVE's, standing in for every formation
   that has no line of its own (a specific line always beats a wide one,
   whatever order they were typed). The callsign match is against the wave's
   OWN formations — never a fixed phrase — so "0900H: RU IN TIME",
   "RU 0900" and "0900 RU show" all reach the RU line, and a bare
   "0900H: IN TIME + WX/NOTAMS" reaches everyone. The reference's stricter
   "<CS> IN TIME" grammar reads every SEED line identically (each seed line
   names its formation), so parity is untouched where data exercises it. */
export function intimeMap(w:any){
  const m:any={}; let wide:any=null;
  const rx=(cs:any)=>new RegExp(`(^|[^A-Za-z0-9])${String(cs).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^A-Za-z0-9]|$)`,'i');
  /* keyed by the formation's cs AS TYPED (events.ts looks up im[f.cs]);
     the match itself trims and ignores case */
  const css=(w.formations||[]).map((f:any)=>String(f.cs==null?'':f.cs)).filter((c:any)=>c.trim());
  (w.intimes||[]).forEach((line:any)=>{
    const t=intimeTime(line); if(t==null)return;
    const hits=css.filter((cs:any)=>rx(cs.trim()).test(String(line)));
    if(hits.length)hits.forEach((cs:any)=>m[cs]=t);
    else if(wide==null||t<wide)wide=t;                 // several wide lines: the earliest is the show
  });
  if(wide!=null)css.forEach((cs:any)=>{ if(m[cs]==null)m[cs]=wide; });
  return m;
}
/* THE SEAT'S OWN IN-TIME — one body, two callers (owner, 26 Aug 26: "SANS
   should consider IN TIME till land plus 30 minutes for availability").
   collectEvents feeds this into every fly event's `intime`, and slotRules
   (avail.ts) asks it for the SANS window's front edge, so the two readings
   of "when is this crew told to report" cannot drift — the second copy
   would be exactly the seam the one-gate doctrine exists to prevent.
   A typed SC B outranks the wave's published in-time lines (the 24 Aug 26
   repurposing; AVALON/BB never carry kind 'sc', so that equality is the
   whole guard), and either clock rolls back a day when the configured
   report lead already crosses midnight — the same limited roll
   collectEvents' preflight applies to a typed B. `im` is the wave's parsed
   in-time map when the caller already holds one (collectEvents builds it
   once per wave); left out, it is derived here. */
export function seatIntime(w:any,f:any,toM:any,im?:any){
  const pre=(t:any)=>t!=null&&toM-VCONF.reportLead<0&&t>toM?t-1440:t;
  const scIn=(w&&w.kind==='sc')?parseHM(f.br):null;
  if(scIn!=null)return pre(scIn);
  const m=im||intimeMap(w);
  return m[f.cs]!=null?pre(m[f.cs]):null;
}
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
/* THE PER-DAY BUILDER, extracted so a cross-week seed read (weekctx.ts) can
   run the exact same rule logic against an ADJACENT week's day — the day
   object comes from weekBundle(prevWeek) instead of the live DAYS array —
   without a second copy of any of it. nextDt/prevDt are date labels (not
   DAYS lookups) so the caller decides what's "next"/"previous", which is
   what lets collectEvents below hand the loaded week's Monday/Sunday the
   ADJACENT WEEK's edge dates instead of nothing. xweek marks a cross-week
   read for inpShow (see its own comment) — never set by collectEvents. */
export function buildDay(d:any,di:any,nextDt:any,prevDt:any,xweek?:any){
    const fly:any[]=[],forms:any[]=[],events:any[]=[],simcrew:any[]=[],sacrew:any[]=[];
    (d.waves||[]).forEach((w:any,gi:any)=>{
      const im=intimeMap(w);
      w.formations.forEach((f:any,li:any)=>{
        if(f.cx)return;                                        // cancelled line — nothing to check
        if(saExempt(w,f,null)){                                // AVALON / BB — outside the conflict engine
          /* AVALON'S ONE CHECK (owner, 11 Aug 26). The wave stays noconf — its crew are
             cross-checked against nothing — but the men on it must be on the island and
             fit, so their names and the shift window are collected here for the single
             look validate() gives them. MAIN and SPARE alike: both are jet seats.
             BB is deliberately NOT collected — the owner specified AVALON only. */
          if(w.kind==='avalon'){
            const sTo=toMin(f.to); let sLd=toMin(f.ld||f.to); if(sLd<sTo)sLd+=1440;
            if(isFinite(sTo)&&isFinite(sLd))f.aircraft.forEach((a:any,ai:any)=>{ if(a.cx)return;
              /* the warning names the wave by its FULL label (AVALON), not the
                 formation callsign — that was shortened to "AV" on 25 Aug 26 for
                 the narrow board callsign box, and the LEAVE_FLY/DNIF prose reads
                 as prose ("but on AVALON — overseas"). Don't re-shorten to f.cs. */
              [['p',a.p],['w',a.w]].forEach(([seat,id]:any)=>{ if(id&&PEOPLE[id]&&!isSpecial(id))sacrew.push({id,s:sTo,e:sLd,label:`${w.label} ${f.msn}`,key:`${di}.${gi}.${li}.${ai}.${seat}`,work:false}); });
            });
          }
          return;
        }
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
        /* A clock printed before a small-hours T/O belongs to the PREVIOUS
           evening. Blank briefs already went negative through subtraction,
           but typed B and published in-times stayed at +22:10 / +21:30 and
           were therefore read as nearly a day AFTER a 00:30 launch. Roll any
           stated pre-flight clock later than T/O back one day, the same
           timeline the default brief already uses. The roll is limited to a
           T/O whose configured brief/report lead already crosses midnight;
           a later clock typed against an ordinary daytime sortie remains a
           visible bad time rather than silently becoming nearly 24h early. */
        const preflight=(t:any,lead:any)=>t!=null&&toM-lead<0&&t>toM?t-1440:t;
        const brTyped=shiftLine?null:parseHM(f.br);
        const briefM=shiftLine?null:(brTyped!=null?preflight(brTyped,VCONF.briefLead):toM-VCONF.briefLead);
        const stepM=shiftLine?toM:toM-VCONF.step;               // sortie: step 1h pre-T/O
        const dekitM=shiftLine?ldM:ldM+VCONF.dekit;             // sortie: land + 30m dekit
        /* intime is the in-time the wave actually PUBLISHED (null when none is
           given); report falls back to the step time so the occupied window is
           still right. Crew rest needs the difference between the two.
           SC (owner, 24 Aug 26): a standalone briefs nothing, but the B box on
           an SC line is repurposed as that crew's IN-TIME — the report time,
           usually earlier than the shift start. Typed, it becomes the in-time
           that anchors crew rest and the advisories; blank (the normal case)
           leaves SC on its shift start exactly as before. AVALON/BB never reach
           here (saExempt returns above), so w.kind==='sc' is the whole guard.
           The body lives in seatIntime above (26 Aug 26) so slotRules' SANS
           window reads the identical clock — same SC-B precedence, same
           midnight roll. */
        const intime=seatIntime(w,f,toM,im);
        const report=(intime!=null)?intime:stepM;
        const fcps:any[]=[],acs:any[]=[],allCrew:any[]=[],spareCrew:any[]=[],spareAcs:any[]=[];
        f.aircraft.forEach((a:any,ai:any)=>{ if(a.cx)return;
          /* collected BEFORE the spare exemption: a spare crew is not checked
             against other commitments, but their SC currency still is */
          [a.p,a.w].forEach((id:any)=>{if(id&&PEOPLE[id]&&!isSpecial(id))allCrew.push(id);});
          if(saExempt(w,f,a)){                                  // SC SPARE — stood by, not cross-checked
            /* ...but still kept, because "not cross-checked against other tasks"
               is not the same as "may be anywhere on earth" */
            [a.p,a.w].forEach((id:any)=>{if(id&&PEOPLE[id]&&!isSpecial(id))spareCrew.push(id);});
            /* the RAW rows too, beside the deduped id set (31 Aug 26): the
               spare seat rule needs to know WHICH seat holds the man, and the
               two-SC-seats conflict needs the same man on two spare rows to
               stay two rows — the Set above collapses him to one id */
            spareAcs.push({p:a.p,w:a.w,key:`${di}.${gi}.${li}.${ai}`});
            return;}
          /* night for AAR purposes: the wave says so, or the sortie itself runs
             past 19:00 between take-off and landing */
          /* key = the aircraft's slot-key prefix, captured HERE because acs
             excludes CX'd and spare aircraft — ai is not recoverable by
             position later. Warnings anchor on it to pan to the line. */
          /* NIGHT AAR IS THE WAVE'S CALL, NOT THE CLOCK'S (owner, 21 Aug 26,
             the same afternoon the 19:00 clock line briefly became a setting:
             "make the rule for NAAR instead of a time — if the wave is night
             and AAR is mentioned, it's night AAR. Or NAAR is mentioned").
             A bare AAR is night only on a night wave; a landing time never
             decides it. An explicit NAAR/DAAR in the remarks still overrides
             either way, inside aarNeed. The reference's clock clause is
             excised by refwin.ts:reaar() so both engines agree everywhere. */
          acs.push({p:a.p,w:a.w,rmks:a.rmks,aar:aarNeed(a.rmks,!!w.night),key:`${di}.${gi}.${li}.${ai}`});
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
          allCrew:[...new Set(allCrew)], spareCrew:[...new Set(spareCrew)],spareAcs,key:`${di}.${gi}.${li}`});
      });
    });
    ['amt','oft'].forEach((k:any)=>((d.sims&&d.sims[k])||[]).forEach((s:any,ri:any)=>{ if(s.cx)return;
      const st=parseHM(s.str), en=parseHM(s.end)!=null?parseHM(s.end):(st!=null?st+VCONF.simLen:null);
      /* a sim box has the same two seats as the jet: front = pilot, back = WSO.
         only rows that actually name a p/w pair get seat-qualification checked. */
      if(s.p||s.w)simcrew.push({p:s.p,w:s.w,label:(k.toUpperCase()+' '+(s.label||'sim')),kind:k,ri});
      /* through win(), like every other row: a 2300–0100 box used to be stored
         as [1380,60] — an inverted interval that `overlap` can never match, so
         every check on that row was silently switched off. And the bodies
         dropped underneath the row (more[]) are as tasked as the two in seats. */
      const sw=win(st,en,VCONF.simLen); if(!sw)return;
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
      const en=parseHM(s.end)!=null?parseHM(s.end):st+VCONF.simLen, ids=rowIds(s); if(!ids.length)return;
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
      /* DEBRIEF is a RANGE now (owner, 13 Aug 26): if the DEBRIEF row carries its
         own end, that is the debrief window's close — a real start-to-end span,
         read straight off the cell. Only when the end is BLANK does it fall back
         to the old ds+VCONF.amtDebrief length, so the seed week (every DEBRIEF
         end empty) is byte-for-byte unchanged and the reference parity holds.
         The AMT block still anchors its BRIEF window on the BRIEF row and its
         box on the box rows; indexOf against the MODEL array recovers the true
         ri because `rows` was filtered (cx dropped). */
      const de=dr&&parseHM(dr.end)!=null?parseHM(dr.end):(ds!=null?ds+VCONF.amtDebrief:null);
      simwin.push({ids,label:'AMT',
        bs:bs!=null?bs:null, be:bs!=null?(boxStart!=null?boxStart:bs):null,
        ds:ds!=null?ds:null, de,key:'s:'+di+'.amt.'+d.sims.amt.indexOf(br||box[0])}); })();
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
    (d.dutywaves||[]).forEach((dw:any,dwi:any)=>dw.rows.forEach((r:any,ri:any)=>{ if(r.cx)return;
      if(dw.noconf||r.noconf){
        /* AVALON's desk shares the wave's exemption, not its invisibility: the same
           one check applies, with ATT B carved out — he cannot fly but he can man a
           desk (owner, 11 Aug 26). work:true is that carve-out. */
        if(dw.sa==='avalon'){
          const w2=win(parseHM(r.str),parseHM(r.end));
          if(w2)[r.id].concat(extras(r)).forEach((id:any)=>{ if(id&&PEOPLE[id]&&!isSpecial(id))sacrew.push({id,s:w2[0],e:w2[1],label:r.role+' duty',key:`d:${di}.${dwi}.${ri}`,work:true}); });
        }
        return;
      }
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
    /* through inpWin, so an absence typed across midnight rolls exactly as a
       duty row or a night sortie does — see inputs.ts. A record with no usable
       window still comes through with null s/e and stays uncheckable. */
    const mapInp=(inp:any)=>{const w2=inpWin(inp);
      return {id:inp.person,s:w2?w2[0]:null,e:w2?w2[1]:null,type:inp.type,remarks:inp.remarks};};
    const input:any[]=INPUTS.filter((inp:any)=>inputCoversDate(inp,d.dt)&&inpShow(inp,d.dt,xweek)).map(mapInp);
    /* THE MIDNIGHT TAIL (owner, 11 Aug 26 — "the default warning engine also checks
       in the same modality for all applicable rules based on timing"). A window that
       runs past midnight — a night sortie's landing and debrief, an overnight duty
       or shift — lives past minute 1440 in this day's minute-space, and win() /
       the ld<to roll already put it there. So TOMORROW's inputs are appended here,
       shifted a day, and every consumer of day.input inherits the check without
       knowing it exists: today's events (all ending ≤1440) can never reach them,
       and a shifted all-day input still spans exactly 1439 minutes, so the
       timedInput filter in validate.ts treats both copies identically. A record
       with no usable window stays uncheckable, exactly as its unshifted copy is.
       `nx` marks the entries as port-only for the parity excision (parity.test.ts)
       and the positive pin in the overnight suite. */
    if(nextDt!=null)INPUTS.filter((inp:any)=>inputCoversDate(inp,nextDt)&&inpShow(inp,nextDt)).forEach((inp:any)=>{
      const m=mapInp(inp); if(m.s==null||m.e==null)return;
      input.push({...m,s:m.s+1440,e:m.e+1440,nx:true});
    });
    /* AND THE SAME TAIL BACKWARDS. The forward half above covers a window that
       runs PAST midnight; the mirror case is a window that starts BEFORE minute
       0. A sortie taking off in the small hours does exactly that — the brief
       lead (140), the step (60) and the report lead (180) are all subtracted
       from the take-off, so a 00:30 T/O briefs at 22:10 the PREVIOUS EVENING and
       its occupied window opens at 23:30 the night before. Those minutes are
       negative in this day's minute-space, and nothing in day.input could ever
       reach them: yesterday's inputs live only on yesterday's day. So a genuine
       clash — a man at a 22:00 meeting the night before a 00:30 take-off — went
       unflagged in complete silence, while the identical case in the forward
       direction flagged correctly (measured both ways, 11 Aug 26).
       Shifted −1440 so yesterday's records land in this day's minute-space, by
       the same rules as the forward half: a record with no usable window stays
       uncheckable, and a shifted all-day input still spans exactly 1439 minutes
       so validate.ts's timedInput filter treats every copy identically. An
       ordinary daytime sortie can never match one of these — its window never
       goes negative — so this adds no warning to any day that did not earn one.
       `pv` marks them port-only for the parity excision, as `nx` does. */
    if(prevDt!=null)INPUTS.filter((inp:any)=>inputCoversDate(inp,prevDt)&&inpShow(inp,prevDt)).forEach((inp:any)=>{
      const m=mapInp(inp); if(m.s==null||m.e==null)return;
      input.push({...m,s:m.s-1440,e:m.e-1440,pv:true});
    });
    return {di,dow:d.dow,dt:d.dt,fly,forms,input,events,simcrew,simwin,sacrew};
}
/* the loaded week's Monday pv-tail and Sunday nx-tail used to read nothing
   past DAYS' own ends (owner ask: continuous rule reading — see weekctx.ts).
   edgeDate hands them the adjacent week's Monday/Sunday date label instead,
   and the global (date-keyed) INPUTS array already carries every authored
   week's rows, so the tail's existing INPUTS.filter(inputCoversDate...) just
   starts finding matches at the week edges it could never reach before. */
export function collectEvents(){
  return DAYS.map((d:any,di:any)=>buildDay(d,di, DAYS[di+1]?DAYS[di+1].dt:edgeDate(CURWEEK,1), DAYS[di-1]?DAYS[di-1].dt:edgeDate(CURWEEK,-1)));
}
/* earliest IN-TIME of a wave (from the wave's in-time lines; fallback = earliest TO) */
export function waveInTime(w:any){
  let best:any=null;
  (w.intimes||[]).forEach((s:any)=>{const t=intimeTime(s); if(t!=null&&(best==null||t<best))best=t;});
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
