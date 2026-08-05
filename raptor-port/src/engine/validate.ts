import { PEOPLE, isSpecial, realP, isOcu, isInstr, isInstrPilot, aarOK, scShiftKind, scQualOK } from './people'
import { isDownchit, isLeave, isLocalLeave, isDetach } from './inputs'
import { VCONF, SHIFT_HARD } from './rules'
import { overlap, hm24, lgT } from './time'
import { collectEvents } from './events'
import { HOOKS } from './hooks'

/* the reference guards its header counters with $() lookups; the engine takes
   $ from the hooks (null outside a browser) so the guarded lines stay verbatim */
const $=(id:any)=>HOOKS.$(id);
export const WCODE:any={DOUBLE_BOOK:'Conflict — two events at once',DNIF_FLY:'Downchit + flying',LEAVE_FLY:'On leave + flying',INPUT_FLY:'Personal input clash',
  TURN:'Tight turn',ILLEGAL_CREW:'Illegal aircrew combination',CREW_SOLO:'Crew solo — only allowed under syllabus',CO_APPROVAL:'Crew combination — CO approval required',OCU_NO_IP:'OCU without IP',CREW_REST:'Crew rest (<{crewRest})',QUAL:'Qualification — illegal seat',
  NO_BRIEF:'No time for the flight brief',DEBRIEF:'No time for the flight debrief',SIM_BRIEF:'No time for the sim brief',SIM_DEBRIEF:'No time for the sim debrief',
  CREW_TIGHT:'Tight turning — crew rest',LONGDAY:'Long work day',DT_SUM:'Double turning',
  DAYS_RUN:'No break day — too many days in a row',
  SC_QUAL:'SC currency — wrong shift',AAR_QUAL:'AAR currency — not qualified',NO_IR:'IRT without an IR examiner',
  SHIFT_SOFT:'On shift — also down for a ground event'};
/* what a flag PRINTS on the puck. The internal codes stay as they are — they
   key the colours, the ranking and the tooltips — but the squadron reads these
   at 9px on a phone, so the glyphs are short: R for crew rest, B for either
   brief, D for either debrief, L for a long day. */
export const CHIP_TEXT:any={DT:'DT',TT:'TT',C:'C',A:'A',Q:'Q',CR:'R',RUN:'7',NB:'B',SB:'B',DB:'D',SD:'D',LD:'L',CP:'CP',CPH:'CP'};
export const chipText=(c:any)=>CHIP_TEXT[c]||c;
/* Which flag a puck shows when a person has more than one on the day. Highest
   wins. Order set by the squadron: qual → conflict → crew rest → no flight brief
   → no flight debrief → no sim brief → no sim debrief → advisory → tight turn →
   double turn → long work day. Module scope, not inside validate(), so the Logic
   tab can print the real ordering rather than a second copy of it.

   CP / CPH are crew pairing (renamed from CC, owner ask 5 Aug 26) — the
   pairing rules, which used to ring the puck and caption nothing. They are TWO
   codes rather than one because a chip carries no severity of its own: CP is
   the advisory colour and CPH the hard one, and both PRINT `CP`, so the
   squadron reads one flag while the engine keeps the two apart. Both are
   INSERTED into the squadron's order rather than reshuffling it: CP leads the
   advisories, CPH sits below the conflict flag, because a man booked into two
   places at once is a harder stop than a pairing that wants a signature.
   Everything that outranked everything else before still does. Adding a code
   here without adding it to RANK would half-work: markChip's first write
   lands (there is nothing to beat) and every later one loses to `undefined`,
   silently freezing the flag. */
export const RANK:any={LD:0,DT:1,TT:2,A:3,SD:4,SB:5,DB:6,NB:7,CP:8,CR:9,RUN:10,CPH:11,C:12,Q:13};
export const CHIP_LABEL:any={DT:'Double turn',TT:'Tight turn',C:'Conflict (two events at once)',
  A:'Advisory — on shift and also down for a ground event or programme item',CR:'Crew rest breach (<{crewRest})',Q:'Qualification — illegal seat',
  NB:'No time for the flight brief',DB:'No time for the flight debrief',SB:'No time for the sim brief',SD:'No time for the sim debrief',LD:'Long work day (>{longDay})',
  RUN:'No break day — too many days on the programme in a row',
  CP:'Crew pairing — this pairing needs approval',CPH:'Crew pairing — not an authorised pairing'};
export const SEVWORD:any={hard:'Warning',adv:'Advisory',note:'Note'};
/* A label may quote a live threshold: {crewRest} prints whatever crew rest is
   set to right now. Without this an edited rule leaves stale numbers behind in
   tooltips and warning lists — the engine says 10h, the chip still says 12h. */
export const wlbl=(s:any)=>String(s==null?'':s).replace(/\{(\w+)\}/g,(m:any,k:any)=>k in VCONF?lgT(VCONF[k]):m);
export let WARN:any={all:[],byDay:[],sev:{},chip:{}};
/* when crew rest expires today, per day index, per person — minutes into the
   day. Filled by validate(); read by the crew picker so an SC slot can be
   closed to anyone who is not yet clear of the previous day. */
export let REST:any={};
export function restClear(di:any,id:any){const m=REST[di]; const v=m&&m[id]; return v==null?null:v;}
/* every cross-checked commitment on a day, bucketed by person — published the
   same way REST is, so the crew picker can ask "is he busy at THIS hour" without
   running collectEvents() again for every name in the palette. SC SPARE lines
   are absent here exactly as they are absent from the engine. */
export let EVD:any={};
export function dayEvents(di:any,id:any){const m=EVD[di]; return (m&&m[id])||[];}
export function validate(){
  const ev=collectEvents(), all:any[]=[], byDay:any[]=[], sev:any={}, chip:any={};
  REST={}; EVD={};
  /* ring precedence: red beats orange beats grey, so a person carrying both a
     long day and a conflict still shows the conflict ring. */
  const SEVR:any={note:1,adv:2,hard:3};
  const markRing=(di:any,id:any,s:any)=>{sev[di]=sev[di]||{}; const c=sev[di][id]; if(!c||SEVR[s]>SEVR[c])sev[di][id]=s;};
  const markChip=(di:any,id:any,c:any)=>{chip[di]=chip[di]||{}; if(!chip[di][id]||RANK[c]>RANK[chip[di][id]])chip[di][id]=c;};
  const dur=(m:any)=>`${Math.floor(m/60)}h${String(Math.round(m%60)).padStart(2,'0')}`;
  /* CONSECUTIVE WORKING DAYS (owner, Aug 26) — nobody may be on the programme
     more than VCONF.maxRun days without a break day. Counted in day order off
     day.events, which is every kind of tasking there is: a flight, a duty
     post, a sim, a ground item, a programme row. Leave and downchits are not
     tasking, so a day off breaks the run exactly as it should. Computed in one
     pass up front because a run is a property of the WEEK, not of a day, and
     the per-day loop below can then just read the number off. */
  const RUNLEN:any[]=[]; {
    const run:any={};
    ev.forEach((day:any,i:any)=>{
      const on=new Set<any>();
      (day.events||[]).forEach((e:any)=>{ if(e.id&&PEOPLE[e.id]&&!isSpecial(e.id))on.add(e.id); });
      Object.keys(run).forEach((id:any)=>{ if(!on.has(id))run[id]=0; });   // a clear day resets it
      const m:any={}; on.forEach((id:any)=>{ m[id]=run[id]=(run[id]||0)+1; });
      RUNLEN[i]=m;
    });
  }
  ev.forEach((day:any,idx:any)=>{
    const di=day.di, ws:any[]=[], seen=new Set();
    /* publish this day's events for the crew picker (see dayEvents) */
    const evd:any=EVD[di]={}; day.events.forEach((e:any)=>{(evd[e.id]=evd[e.id]||[]).push(e);});
    /* the same rule can fire off two legs of the same sortie pair, so identical
       rows are collapsed rather than printed twice. */
    const add=(s:any,code:any,who:any,msg:any)=>{who=who.filter(Boolean);
      const k=code+'|'+who.join(',')+'|'+msg; if(seen.has(k))return; seen.add(k);
      const w={sev:s,code,who,day:day.dow,di,msg};ws.push(w);all.push(w);};
    /* An SC / AVALON / BB line is a SHIFT, not a sortie. Its crew still count
       as tasked and are still checked for clashes and qualification, but a
       handover is not a turn, a 12-hour watch is not a long flying day, and a
       shift start does not imply a brief at T/O − 2h20. */
    const byP:any={}; day.fly.filter((e:any)=>!e.shift).forEach((e:any)=>{(byP[e.id]=byP[e.id]||[]).push(e);});
    // DT (2+ sorties) + TT (tight turn = next in-time within 20-min of previous land)
    Object.keys(byP).forEach((id:any)=>{
      const es=byP[id].slice().sort((a:any,b:any)=>a.to-b.to);
      if(es.length>=2)markChip(di,id,'DT');
      for(let i=0;i<es.length-1;i++){ const turn=es[i+1].to-es[i].ld;   // land → next T/O; need 30m dekit + 60m step = 90m
        /* The threshold and the mechanics are edited independently, so either
           can be the binding one: a 60 min threshold with 30 dekit + 60 step
           would let a physically impossible turn through. Take the larger. */
        const need=Math.max(VCONF.tightTurn,VCONF.dekit+VCONF.step);
        if(turn<need){markChip(di,id,'TT');add('adv','TURN',[id],`Tight turn ${es[i].label}→${es[i+1].label}: ${turn} min land→next T/O (needs ${need} min — threshold ${VCONF.tightTurn}, dekit+step ${VCONF.dekit}+${VCONF.step})`);} }
    });
    /* C — two commitments at the same time for one person.
       Sortie-vs-sortie is the tight-turn rule's business, not this one.
       A SHIFT (SC MAIN) is graded by what it runs into:
         another cockpit — flight, sim, another shift — or a duty POST he has to
         man → Warning, he cannot be in two places;
         a ground event or a programme item → Advisory, because you can still
         give academics to the man who is on SC.
       SC SPARE never reaches here at all: a spare is standing by, so he stays
       free for anything else on the day. */
    /* SHIFT_HARD is declared once at the top of the engine — the crew picker
       shares it, so the two can never disagree about what bars a shift. */
    const byE=evd;
    Object.keys(byE).forEach((id:any)=>{ const es=byE[id].slice().sort((a:any,b:any)=>a.s-b.s);
      for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++){
        const A=es[i],B=es[j];
        if(A.kind==='fly'&&B.kind==='fly')continue;
        if(!overlap(A.s,A.e,B.s,B.e))continue;
        /* every clash, not just the first: a man double-booked in the morning
           AND in the evening used to be told about the morning only. The red
           ring goes on too — a hard warning with a grey puck was a bug. */
        if(A.kind==='shift'||B.kind==='shift'){
          const sh=A.kind==='shift'?A:B, other=A.kind==='shift'?B:A;
          if(SHIFT_HARD[other.kind]){
            markChip(di,id,'C'); markRing(di,id,'hard');
            add('hard','DOUBLE_BOOK',[id],`${sh.label} & ${other.label} clash`);
          } else {
            /* amber A, not the red conflict C — the puck has to say advisory at a
               glance, the way the note under it already does */
            markChip(di,id,'A'); markRing(di,id,'adv');
            add('adv','SHIFT_SOFT',[id],
              `${PEOPLE[id]?PEOPLE[id].cs:id} is on ${sh.label} (${hm24(sh.s)}–${hm24(sh.e)}) and also down for ${other.label}`);
          }
          continue;
        }
        markChip(di,id,'C'); markRing(di,id,'hard');
        add('hard','DOUBLE_BOOK',[id],`${A.label} & ${B.label} clash`);} });
    // C via input clash (DNIF / leave / appointment vs a sortie)
    day.fly.forEach((e:any)=>day.input.forEach((inp:any)=>{ if(inp.id!==e.id)return;
      if(overlap(e.step,e.dekit,inp.s,inp.e)){
        /* the offer exemption is gone with the "Available *" types (owner
           decision, Aug 26). "Fly" is now an ordinary commitment: a man who
           says he is flying elsewhere is not available for this sortie, so it
           clashes exactly like a Meeting or an Appointment does. */
        markChip(di,e.id,'C'); markRing(di,e.id,'hard');
        const dn=isDownchit(inp.type),lv=isLeave(inp.type);
        /* the REASON is the whole point of the flag — a downchit body planned to
           fly has to say what grounded them, not merely that something clashes. */
        const why=inp.remarks?` — reason: ${inp.remarks}`:'';
        add('hard',dn?'DNIF_FLY':lv?'LEAVE_FLY':'INPUT_FLY',[e.id],
          dn?`Downchit but planned to fly ${e.label}${why}`
            :lv?`On leave but planned to fly ${e.label}${why}`
              :`${inp.type} clashes with ${e.label}${why}`);} }));
    /* being unavailable does not only bar flying — a duty, a sim seat or a
       ground slot on the same day is just as wrong, and used to pass. This
       covered leave and downchits only (owner, 4 Aug 26): a Detachment, or a
       personal input a scheduler has actioned to Unavailable, warned against a
       sortie but let a sim seat, a duty post or a ground row through silently
       — so "unavailable" guarded the jets and nothing else. Now every input
       the validator can see clashes with every kind of tasking. Shifts are the
       one carve-out for the ordinary personal types: an accepted row against
       an SC shift is deliberately the soft SHIFT_SOFT advisory, and the raw
       input must not shout red over that. Leave, downchits and detachments
       still hard-flag a shift — those close the man's day outright. */
    day.events.forEach((e:any)=>{ if(e.kind==='fly')return;
      day.input.forEach((inp:any)=>{ if(inp.id!==e.id)return;
        const dn=isDownchit(inp.type), lv=isLeave(inp.type);
        if(!dn&&!lv&&!isDetach(inp.type)&&e.kind==='shift')return;
        if(!overlap(e.s,e.e,inp.s,inp.e))return;
        markChip(di,e.id,'C'); markRing(di,e.id,'hard');
        const why=inp.remarks?` — reason: ${inp.remarks}`:'';
        add('hard',dn?'DNIF_FLY':lv?'LEAVE_FLY':'INPUT_FLY',[e.id],
          (dn?'Downchit but tasked':lv?'On leave but tasked':`${inp.type} but tasked`)+` — ${e.label}${why}`); }); });
    /* ---- BRIEF / DEBRIEF windows round each sortie -----------------------
       The published BRIEF time (the B column, T/O − 2h20) is the hardline: the
       brief starts then, so only an event reaching PAST it steals brief time.
       An event that finishes at or before the brief time is fine — e.g. a stand
       -down 0830–0900 against a 1020 brief is no issue. Anything sitting inside
       brief → T/O means there is no time for the flight brief. Losing the brief
       or the debrief window is amber, not red (owner, 4 Aug 26): the clash
       itself already carries the red — the eaten window is advice on top of it,
       and a red here painted the whole puck red for what is a squeeze, not an
       impossibility. Land + 2h is the debrief. Both are
       tested against the person's non-flying commitments and their timed personal
       inputs — a second sortie in the window is the tight-turn rule's business,
       and all-day inputs are already caught above.                            */
    const timedInput=day.input.filter((i:any)=>i.e-i.s<1439);
    Object.keys(byE).forEach((id:any)=>{
      const legs=byE[id].filter((e:any)=>e.kind==='fly'), others=byE[id].filter((e:any)=>e.kind!=='fly');
      legs.forEach((lg:any)=>{
        const bs=lg.brief, de=lg.ld+VCONF.debrief;   // brief time is the hardline, not T/O − 3h
        const hits=(s:any,e:any)=>others.filter((o:any)=>overlap(s,e,o.s,o.e)).map((o:any)=>o.label)
          .concat(timedInput.filter((i:any)=>i.id===id&&overlap(s,e,i.s,i.e)).map((i:any)=>i.type));
        const hb=hits(bs,lg.to);
        if(hb.length){markChip(di,id,'NB');markRing(di,id,'adv');
          add('adv','NO_BRIEF',[id],`No time for the ${lg.label} flight brief — ${hb.join(', ')} sits inside ${hm24(bs)}–${hm24(lg.to)} (brief ${hm24(bs)})`);}
        const hd=hits(lg.ld,de);
        if(hd.length){markChip(di,id,'DB');markRing(di,id,'adv');
          add('adv','DEBRIEF',[id],`Not enough time to attend the ${lg.label} debrief — ${hd.join(', ')} sits inside ${hm24(lg.ld)}–${hm24(de)} (land + 2h)`);}
      });
    });
    /* ---- sim brief / debrief windows -------------------------------------
       EP profiles brief 15 min prior and debrief 30 min after. The AMT carries
       its own BRIEF row, so that row's time IS the hard line — nothing is added
       in front of it.                                                          */
    (day.simwin||[]).forEach((sw:any)=>sw.ids.forEach((id:any)=>{
      const mine=(byE[id]||[]);
      const hits=(s:any,e:any)=>mine.filter((o:any)=>overlap(s,e,o.s,o.e)).map((o:any)=>o.label)
        .concat(timedInput.filter((i:any)=>i.id===id&&overlap(s,e,i.s,i.e)).map((i:any)=>i.type));
      if(sw.bs!=null&&sw.be!=null&&sw.be>sw.bs){ const h=hits(sw.bs,sw.be);
        /* amber like NO_BRIEF (owner, 4 Aug 26) — same rule, sim flavour */
        if(h.length){markChip(di,id,'SB');markRing(di,id,'adv');
          add('adv','SIM_BRIEF',[id],`No time for the ${sw.label} brief — ${h.join(', ')} sits inside ${hm24(sw.bs)}–${hm24(sw.be)}`);} }
      if(sw.ds!=null&&sw.de!=null&&sw.de>sw.ds){ const h=hits(sw.ds,sw.de);
        if(h.length){markChip(di,id,'SD');markRing(di,id,'adv');
          add('adv','SIM_DEBRIEF',[id],`No time for the ${sw.label} debrief — ${h.join(', ')} sits inside ${hm24(sw.ds)}–${hm24(sw.de)}`);} }
    }));
    /* ---- double-turn summary --------------------------------------------
       One line at the head of the day telling the next scheduler how many
       bodies are flying twice. Amber, not red (owner, 4 Aug 26): double
       turning is routine and planned, so the summary now matches the amber DT
       chips instead of shouting over them.                                     */
    const dts=Object.keys(byP).filter((id:any)=>byP[id].length>=2);
    if(dts.length)add('adv','DT_SUM',dts,`${dts.length} ${dts.length===1?'person is':'people are'} double turning: ${dts.map((id:any)=>PEOPLE[id]?PEOPLE[id].cs:id).join(', ')}`);
    /* ---- long work day --------------------------------------------------
       Report (T/O − 3h, or the published in-time) through land + 2h, or plain
       start→end for everything that is not flying. Over 12h and the day gets a
       grey note stating the actual hours. Personal inputs are left out — an
       all-day input would read as a 24-hour work day.                          */
    Object.keys(byE).forEach((id:any)=>{
      let s:any=null,e:any=null;
      byE[id].forEach((o:any)=>{
        /* the published in-time IS the report time when there is one; only fall
           back to T/O − 3h when the wave published none. Taking the min() of the
           two discarded any in-time later than T/O − 3h and inflated the day —
           three of the four long-day notes on the seed Monday were wrong. */
        const os=o.kind==='fly'?(o.report!=null?o.report:o.to-VCONF.reportLead):o.s;
        const oe=o.kind==='fly'?o.ld+VCONF.debrief:o.e;
        if(os!=null&&(s==null||os<s))s=os;
        if(oe!=null&&(e==null||oe>e))e=oe;
      });
      if(s==null||e==null)return;
      const span=e-s;
      if(span>VCONF.longDay){markChip(di,id,'LD');markRing(di,id,'note');
        add('note','LONGDAY',[id],`${PEOPLE[id]?PEOPLE[id].cs:id} has a long work day: ${dur(span)} (${hm24(s)} → ${hm24(e)})`);}
    });
    /* the run breaks its limit ON this day, which is the day the scheduler has
       to clear — so that is where the flag lands */
    Object.keys(RUNLEN[idx]||{}).forEach((id:any)=>{
      const n=RUNLEN[idx][id];
      if(n>VCONF.maxRun){
        markChip(di,id,'RUN'); markRing(di,id,'hard');
        add('hard','DAYS_RUN',[id],`${PEOPLE[id]?PEOPLE[id].cs:id} is on the programme ${n} days in a row — ${VCONF.maxRun} is the limit, so a break day is due`);}
    });
    /* ---- crew rest across the day boundary -------------------------------
       12h clear from the previous day's last commitment. A sortie's day ends at
       land + 2h (the debrief); sims and ground events do NOT attract crew rest,
       but a short gap after one is still worth calling tight turning. The
       squadron's nominal report is T/O − 3h; if the aircrew has actually been
       TOLD to come in earlier than legal — through the published in-time or the
       brief time, whichever is earlier — that is a hard breach, not a caution.

       AN SC SHIFT COUNTS THE SAME AS A SORTIE, at the hours written on the line
       and no others. It ends the previous day for rest purposes at its LD (no
       debrief tail is added), and it must itself start 12h clear — the shift's
       own start time IS the report time, so no 3h lead and no brief lead are
       taken off it either. */
    if(idx>0){
      /* Track the last FLYING end separately from the last end of any kind.
         Keeping only the single latest event meant a late duty row could mask
         the sortie underneath it and downgrade a hard crew-rest breach to an
         advisory — adding a duty removed a warning. */
      const prevEnd:any={}, prevFlyEnd:any={};
      ev[idx-1].events.forEach((e:any)=>{
        const rests=(e.kind==='fly'||e.kind==='shift');
        const end=e.kind==='fly'?e.ld+VCONF.debrief:e.e;   // a shift ends when it ends
        if(end==null)return;
        if(prevEnd[e.id]==null||end>prevEnd[e.id])prevEnd[e.id]=end;
        if(rests&&(prevFlyEnd[e.id]==null||end>prevFlyEnd[e.id]))prevFlyEnd[e.id]=end;
      });
      /* when rest expires today, for everyone who flew or stood a shift
         yesterday — the palette reads this to keep an SC slot closed to anyone
         who is not yet clear */
      const restMap:any={};
      Object.keys(prevFlyEnd).forEach((id:any)=>{
        const cl=prevFlyEnd[id]+VCONF.crewRest-1440;
        if(cl>0)restMap[id]=cl;
      });
      REST[di]=restMap;
      /* today's rest-bearing commitments: sorties AND shifts */
      const byR:any={}; day.fly.forEach((e:any)=>{(byR[e.id]=byR[e.id]||[]).push(e);});
      /* a shift reports when it starts; a sortie reports 3h before T/O */
      const nomOf=(e:any)=>e.shift?e.to:e.to-VCONF.reportLead;
      const insOf=(e:any)=>e.shift?e.to:Math.min(e.intime!=null?e.intime:Infinity,e.to-VCONF.briefLead);
      Object.keys(byR).forEach((id:any)=>{
        /* Crew rest runs off the last REST-BEARING commitment — a sortie or a
           shift — not off a late desk duty. Taking the max of both meant an
           18:00–23:59 SXO row raised a hard breach for a man who landed at 10:00,
           while REST[] (built from prevFlyEnd alone) reported him clear: the
           picker handed him the slot and the engine immediately red-flagged it.
           When nothing rest-bearing happened yesterday we still fall back to the
           last end of any kind — that is what feeds the tight-turning advisory. */
        const pe=prevFlyEnd[id]!=null?prevFlyEnd[id]:prevEnd[id];
        if(pe==null||!isFinite(pe))return;
        const pfly={[id]:prevFlyEnd[id]!=null};
        const earliest=pe+VCONF.crewRest-1440;         // minutes into TODAY that crew rest expires
        if(earliest<=0)return;                          // 12h already clear before midnight
        const legs=byR[id];
        const nominal=Math.min.apply(null,legs.map(nomOf));
        const instructed=Math.min.apply(null,legs.map(insOf));
        const onShift=legs.some((e:any)=>e.shift);
        const tail=`${ev[idx-1].dow} ended ${hm24(pe)} → crew rest clear at ${hm24(earliest)}`;
        if(pfly[id]&&instructed<earliest){
          markChip(di,id,'CR');markRing(di,id,'hard');
          add('hard','CREW_REST',[id],
            (onShift?`Crew rest breach — ${legs.filter((e:any)=>e.shift).map((e:any)=>e.label)[0]} starts ${hm24(instructed)}, only ${dur(instructed+1440-pe)} rest. `
                   :`Crew rest breach — told to report ${hm24(instructed)}, only ${dur(instructed+1440-pe)} rest. `)+tail);
        } else if(nominal<earliest||instructed<earliest){
          markChip(di,id,'TT');markRing(di,id,'adv');
          add('adv','CREW_TIGHT',[id],`Tight turning — T/O ${hm24(Math.min.apply(null,legs.map((e:any)=>e.to)))} puts the ${lgT(VCONF.reportLead)} report at ${hm24(nominal)}, inside ${lgT(VCONF.crewRest)}. ${tail}`
            +(pfly[id]?'':' (prior day ended on a sim or ground event, so crew rest itself does not apply)'));
        }
      });
    } else REST[di]={};
    // crew combination matrix + OCU without IP — shown as puck rings
    day.forms.forEach((f:any)=>{
      f.acs.forEach((ac:any)=>{ const p=realP(ac.p),w=realP(ac.w);
        /* ---- combination matrix (F-15SG Table 1.5-2, owner Aug 5 '26) ----
           Graded only when the front seat is a CAT A–D or OCU pilot and the
           back seat is a CAT A–D or OCU WSO: an instructor in either seat
           clears the matrix outright — an instructor pilot (IP/IR/FI) flies
           with anyone, and an instructor WSO with any front seat (the
           table's IR footnote on the OCU-pilot column is disregarded —
           owner). A mis-seated body is the seat rules' (QUAL) business, not
           this one's. The gradings:
             OCU pilot + CAT A–D WSO  → Warning, not an authorised combination
             CAT A–D pilot + OCU WSO  → Warning, not an authorised combination
             OCU pilot + OCU WSO      → Advisory — a crew solo, only allowed
                                        under the Basic Course Syllabus
             D+C, C+D, D+D (fmr+WSO)  → Advisory — CO approval required
           This SUPERSEDES the old two-OCU hard rule: the matrix reads that
           pairing as the crew-solo advisory. Ring only, no chip — the
           ILLEGAL_CREW shape. */
        if(p&&w&&p.seat==='FCP'&&w.seat==='RCP'&&!isInstrPilot(p.q)&&!isInstr(w.q)){
          if(isOcu(p.q)&&isOcu(w.q)){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');markChip(di,ac.p,'CP');markChip(di,ac.w,'CP');add('adv','CREW_SOLO',[ac.p,ac.w],`${p.cs} (OCU pilot) with ${w.cs} (OCU WSO) in ${f.label} — a crew solo, only allowed under the Basic Course Syllabus`);}
          else if(isOcu(p.q)||isOcu(w.q)){markRing(di,ac.p,'hard');markRing(di,ac.w,'hard');markChip(di,ac.p,'CPH');markChip(di,ac.w,'CPH');add('hard','ILLEGAL_CREW',[ac.p,ac.w],isOcu(p.q)?`OCU pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} — not an authorised combination (${f.label})`:`OCU WSO ${w.cs} with CAT ${p.q} pilot ${p.cs} — not an authorised combination (${f.label})`);}
          else if((p.q==='D'&&(w.q==='C'||w.q==='D'))||(p.q==='C'&&w.q==='D')){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');markChip(di,ac.p,'CP');markChip(di,ac.w,'CP');add('adv','CO_APPROVAL',[ac.p,ac.w],`CAT ${p.q} pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} in ${f.label} — CO approval required`);}
        }
        // Q — seat qualification: a WSO can't fly FCP; only an instructor pilot (IP / IR / FI) may fly RCP
        if(p&&p.seat==='RCP'){markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');add('hard','QUAL',[ac.p],`${p.cs} is a WSO — cannot fly FCP (${f.label})`);}
        /* belt and braces: CAT IW is a WSO-only category, so an IW record whose
           seat says FCP is inconsistent data — the Quals-page dropdowns never
           offer IW to a pilot, but a hand-edit could. Flag it, don't hide it. */
        if(p&&p.q==='IW'&&p.seat==='FCP'){markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');add('hard','QUAL',[ac.p],`${p.cs} is CAT IW — a WSO category, cannot fly FCP (${f.label})`);}
        if(w&&w.seat==='FCP'&&!isInstrPilot(w.q)){markChip(di,ac.w,'Q');markRing(di,ac.w,'hard');add('hard','QUAL',[ac.w],`${w.cs} is a pilot, not an instructor — only IP / IR / FI may fly RCP (${f.label})`);}
        /* AAR — the remarks call for it and the FRONT seat is not current */
        if(ac.aar&&p&&!isSpecial(ac.p)&&!aarOK(ac.p,ac.aar)){
          markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');
          add('hard','AAR_QUAL',[ac.p],
            `${p.cs} is not ${ac.aar} current — ${f.label} remarks call for ${ac.aar==='NAAR'?'night':'day'} AAR`);} });
      const ocus=f.fcps.filter((id:any)=>PEOPLE[id]&&isOcu(PEOPLE[id].q));
      const hasIP=f.fcps.some((id:any)=>PEOPLE[id]&&isInstr(PEOPLE[id].q));
      /* an IP in the BACK seat supervises just as well as one in the front —
         the seat rules explicitly allow it, so looking only at FCPs both
         flagged the standard OCU sortie and missed an OCU in the rear */
      /* crewAll used to be `.filter(Boolean)` — truthy-only, so the ALL AVAIL
         sentinel (a special PEOPLE record, never a real body) flowed straight
         through into OCU_NO_IP's ocuAll/anyIP and NO_IR's who/ring/chip below,
         landing a red ring + CPH chip on a sentinel that fills a seat with no
         one really in it. events.ts:37 builds the same crew list and already
         excludes specials this way; validate.test.ts pins "ALL AVAIL sentinels
         never raise warnings" and this line was the hole in that invariant.
         The warning itself still fires for the real crew that remains —
         only the sentinel stops being named/ringed/chipped. */
      const crewAll=[...new Set(f.acs.reduce((a:any,x:any)=>a.concat([x.p,x.w]),[]).filter((id:any)=>id&&PEOPLE[id]&&!isSpecial(id)))];
      const ocuAll=crewAll.filter((id:any)=>PEOPLE[id]&&isOcu(PEOPLE[id].q));
      const anyIP=crewAll.some((id:any)=>PEOPLE[id]&&isInstr(PEOPLE[id].q));
      if(ocuAll.length&&!anyIP){ocuAll.forEach((id:any)=>{markRing(di,id,'adv');markChip(di,id,'CP');});add('adv','OCU_NO_IP',ocuAll,`OCU in ${f.label} with no IP`);}
      /* NO_IR — an instrument rating test needs an IR examiner aboard (owner,
         Aug 5 '26). The mission lives in f.shift (collectEvents folds f.msn
         into it); a per-aircraft IRT lives in that aircraft's remarks. IRT in
         the formation's msn wants an IR anywhere in the formation; IRT in one
         aircraft's remarks wants the IR in THAT aircraft. Ring only, no chip —
         same shape as OCU_NO_IP, and red: the sortie cannot be examined. */
      const isIR=(id:any)=>{const q=realP(id);return !!(q&&q.q==='IR');};
      if(/\bIRT\b/i.test(String(f.shift||''))&&crewAll.length&&!crewAll.some(isIR)){
        crewAll.forEach((id:any)=>{markRing(di,id,'hard');markChip(di,id,'CPH');});
        add('hard','NO_IR',crewAll,`IRT in ${f.label} with no IR examiner`);}
      f.acs.forEach((ac:any)=>{ if(!/\bIRT\b/i.test(String(ac.rmks||'')))return;
        const crew=[ac.p,ac.w].filter((id:any)=>id&&realP(id));
        if(crew.length&&!crew.some(isIR)){crew.forEach((id:any)=>{markRing(di,id,'hard');markChip(di,id,'CPH');});
          add('hard','NO_IR',crew,`IRT remarks on ${f.label} with no IR examiner`);}});
      /* SC currency — read off the shift as scheduled, both MAIN and SPARE.
         This is about the person's own qualification, not a clash with another
         commitment, so the spare exemption does not cover it. */
      if(f.sc){
        const kind=scShiftKind(f.s,f.e);
        if(kind){
          const wrong=(f.allCrew||[]).filter((id:any)=>PEOPLE[id]&&!isSpecial(id)&&!scQualOK(id,kind));
          if(wrong.length){
            const win=`${hm24(f.s)}–${hm24(f.e)}`;
            wrong.forEach((id:any)=>{markChip(di,id,'Q');markRing(di,id,'hard');});
            add('hard','SC_QUAL',wrong,
              `${kind==='day'?'SC DAY':'SC NIGHT'} currency needed for ${f.label} (${win})`
              +` — ${wrong.map((id:any)=>PEOPLE[id].cs).join(', ')} ${wrong.length===1?'is':'are'} not current`);
          }
        }
        /* A downchit or OVERSEAS leave closes an SC SPARE: standing by means
           being on the island and fit to walk. LL and OIL do not — the man is at
           home, but he is here. The spare exemption keeps this crew out of every
           clash rule, so this is the only place it can be caught at all. */
        (f.spareCrew||[]).forEach((id:any)=>{
          day.input.forEach((inp:any)=>{ if(inp.id!==id)return;
            const dn=isDownchit(inp.type), lv=isLeave(inp.type)&&!isLocalLeave(inp.type);
            if(!dn&&!lv)return;
            if(!overlap(f.s,f.e,inp.s,inp.e))return;
            markChip(di,id,'C'); markRing(di,id,'hard');
            const why=inp.remarks?` — reason: ${inp.remarks}`:'';
            add('hard',dn?'DNIF_FLY':'LEAVE_FLY',[id],
              (dn?'Downchit but standing SC SPARE':`${inp.type} but standing SC SPARE`)
              +` — ${f.label}${why}`); }); });
      }
    });
    /* Q (sims) — the sim box is seated like the jet: a WSO cannot occupy the
       front seat, and only an instructor pilot (IP / IR / FI) may occupy the
       back seat. */
    (day.simcrew||[]).forEach((s:any)=>{ const p=realP(s.p),w=realP(s.w);
      if(p&&p.seat==='RCP'){markChip(di,s.p,'Q');markRing(di,s.p,'hard');add('hard','QUAL',[s.p],`${p.cs} is a WSO — cannot take the front seat (${s.label})`);}
      if(p&&p.q==='IW'&&p.seat==='FCP'){markChip(di,s.p,'Q');markRing(di,s.p,'hard');add('hard','QUAL',[s.p],`${p.cs} is CAT IW — a WSO category, cannot take the front seat (${s.label})`);}
      if(w&&w.seat==='FCP'&&!isInstrPilot(w.q)){markChip(di,s.w,'Q');markRing(di,s.w,'hard');add('hard','QUAL',[s.w],`${w.cs} is a pilot, not an instructor — only IP / IR / FI may take the back seat (${s.label})`);}
    });
    const SORD:any={hard:0,adv:1,note:2};
    ws.sort((a:any,b:any)=>(SORD[a.sev]??3)-(SORD[b.sev]??3));
    byDay[di]={di,dow:day.dow,warns:ws};
  });
  WARN={all,byDay,sev,chip};
  const hard=all.filter((w:any)=>w.sev==='hard').length;
  const note=all.filter((w:any)=>w.sev==='note').length;
  if($('nHard'))$('nHard').textContent=hard;
  if($('nAdv'))$('nAdv').textContent=all.length-hard-note;
  if($('nNote'))$('nNote').textContent=note;
  return WARN;
}
export const sevOf=(di:any,id:any)=>WARN.sev[di]&&WARN.sev[di][id];
export const chipOf=(di:any,id:any)=>WARN.chip&&WARN.chip[di]&&WARN.chip[di][id];
/* how often each code fired across the week now on screen, and on which days */
export function lgFired(){
  const out:any={}; (WARN.all||[]).forEach((w:any)=>{
    const o=out[w.code]=out[w.code]||{n:0,days:new Set(),sev:new Set()};
    o.n++; o.days.add(w.di); o.sev.add(w.sev);});
  return out;}
