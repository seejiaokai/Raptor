import { PEOPLE, isSpecial, realP, isOcu, isInstr, isInstrPilot, aarOK, aarInstrOK, scShiftKind, scQualOK } from './people'
import { isDownchit, isLeave, isUnavail, canSpare, canWork, shiftHardInput, restsInput, inpLabel } from './inputs'
import { VCONF, SHIFT_HARD } from './rules'
import { overlap, hm24, lgT } from './time'
import { collectEvents, shiftEvHard } from './events'
import { HOOKS } from './hooks'
import { sansGate, SANS_LABEL } from './avail'
import { seedRunIn, prevSundaySeed, nextMondaySeed } from './weekctx'
import { CURWEEK } from './waves'

/* the reference guards its header counters with $() lookups; the engine takes
   $ from the hooks (null outside a browser) so the guarded lines stay verbatim */
const $=(id:any)=>HOOKS.$(id);
export const WCODE:any={DOUBLE_BOOK:'Conflict — two events at once',DNIF_FLY:'Downchit + flying',LEAVE_FLY:'On leave + flying',INPUT_FLY:'Personal input clash',
  TURN:'Tight turn',ILLEGAL_CREW:'Illegal aircrew combination',CREW_SOLO:'Crew solo — only allowed under syllabus',CO_APPROVAL:'Crew combination — CO approval required',OCU_NO_IP:'OCU without IP',CREW_REST:'Crew rest (<{crewRest})',QUAL:'Qualification — illegal seat',
  NO_BRIEF:'No time for the flight brief',DEBRIEF:'No time for the flight debrief',SIM_BRIEF:'No time for the sim brief',SIM_DEBRIEF:'No time for the sim debrief',
  CREW_TIGHT:'Tight turning — crew rest',LONGDAY:'Long work day',DT_SUM:'Double turning',
  DAYS_RUN:'No break day — too many days in a row',
  SC_QUAL:'SC currency — wrong shift',AAR_QUAL:'AAR currency — not qualified',AAR_INSTR:'AAR — back seat not cleared to instruct',NO_IR:'IRT without an IR examiner',
  PAX_CREW:'Incentive passenger — crew pairing needs approval',
  SHIFT_SOFT:'On shift — also down for a ground event',
  SC_INTIME:'In-time window cut — busy between report and shift start',
  SANS_AVAIL:'SANS availability — planned outside the availability filed'};
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
export let WARN:any={all:[],byDay:[],sev:{},chip:{},dash:{},trace:{}};
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
/* ONE PERSON'S WORKING DAY, out of the events they are on that day — the ONE
   definition of it (extracted 20 Aug 26 for the Insights work-hours section;
   the long-work-day note below is its other reader).

   Report (the published in-time when the wave has one, else T/O − reportLead)
   through last landing + the debrief pad, or plain start→end for everything
   that is not flying. `ef` is the FLY event that set the END, null when a
   non-flying commitment did, so a caller can name the debrief pad baked into
   it. Null when the person has nothing with both a start and an end.

   It is a function rather than two copies for the reason
   docs/feature-impact.md §drift-seams exists: a week's total hours and the
   note that says a day is long have to mean the same thing, or one of them is
   lying. The body is the long-day block's own, moved unchanged. */
export function workSpan(evs:any){
  let s:any=null,e:any=null,ef:any=null;
  (evs||[]).forEach((o:any)=>{
    /* the published in-time IS the report time when there is one; only fall
       back to T/O − 3h when the wave published none. Taking the min() of the
       two discarded any in-time later than T/O − 3h and inflated the day —
       three of the four long-day notes on the seed Monday were wrong. */
    /* A SHIFT with a typed in-time is on duty FROM that in-time (owner, 24 Aug
       26 — "if B is filled earlier than TO for main only, include the long day
       duty hours span calculation"). An SC MAIN's report rides the event
       (events.ts), so the day starts at the earlier of it and the shift start —
       min() so a late B cannot shrink the day. Blank B leaves report equal to
       the shift start and this line byte-identical to the old `o.s`; spares
       never reach the event stream at all. */
    const os=o.kind==='fly'?(o.report!=null?o.report:o.to-VCONF.reportLead)
            :o.kind==='shift'&&o.report!=null?Math.min(o.report,o.s):o.s;
    const oe=o.kind==='fly'?o.ld+VCONF.debrief:o.e;
    if(os!=null&&(s==null||os<s))s=os;
    if(oe!=null&&(e==null||oe>e)){e=oe;ef=o.kind==='fly'?o:null;}
  });
  if(s==null||e==null)return null;
  return {s,e,span:e-s,ef};
}
export function dayEvents(di:any,id:any){const m=EVD[di]; return (m&&m[id])||[];}
export function validate(){
  const ev=collectEvents(), all:any[]=[], byDay:any[]=[], sev:any={}, chip:any={}, dash:any={}, trace:any={};
  REST={}; EVD={};
  /* ring precedence: red beats orange beats grey, so a person carrying both a
     long day and a conflict still shows the conflict ring. */
  const SEVR:any={note:1,adv:2,hard:3};
  const markRing=(di:any,id:any,s:any)=>{sev[di]=sev[di]||{}; const c=sev[di][id]; if(!c||SEVR[s]>SEVR[c])sev[di][id]=s;};
  const markChip=(di:any,id:any,c:any)=>{chip[di]=chip[di]||{}; if(!chip[di][id]||RANK[c]>RANK[chip[di][id]])chip[di][id]=c;};
  /* the ring STYLE, which a chip cannot carry: a sanctioned late show rings
     dashed while still counting as the hard warning it is (owner, 6 Aug 26).
     Separate from sev because it is orthogonal — same red, different stroke. */
  const markDash=(di:any,id:any)=>{dash[di]=dash[di]||{}; dash[di][id]=true;};
  /* THE CAUSE, published on the day that CAUSED it (owner, 6 Aug 26). A crew-rest
     breach is raised on the day the man is told to report, but the day a
     scheduler can actually fix is the one BEFORE — so that day carries a
     standing mark of its own: which day it breaks (`di`), the time he had to
     be gone by (`leaveBy`), and the message, so the previous day can print the
     warning without re-deriving a word of it. Keyed by the PREVIOUS day, which
     is what makes it readable straight off the puck. */
  const markTrace=(pdi:any,id:any,t:any)=>{if(pdi==null)return; trace[pdi]=trace[pdi]||{}; trace[pdi][id]=t;};
  const dur=(m:any)=>`${Math.floor(m/60)}h${String(Math.round(m%60)).padStart(2,'0')}`;
  /* CONSECUTIVE WORKING DAYS (owner, Aug 26) — nobody may be on the programme
     more than VCONF.maxRun days without a break day. Counted in day order off
     day.events, which is every kind of tasking there is: a flight, a duty
     post, a sim, a ground item, a programme row. Leave and downchits are not
     tasking, so a day off breaks the run exactly as it should. Computed in one
     pass up front because a run is a property of the WEEK, not of a day, and
     the per-day loop below can then just read the number off.
     SEEDED FROM THE PREVIOUS WEEK since the cross-week work (owner: the
     engine reads continuously, "it doesn't just stay within a week") — a man
     who worked straight through last week walks into this Monday already
     carrying his count, so the limit breaks on the true seventh day, not on
     this week's seventh. seedRunIn (weekctx.ts) walks back from last Sunday
     through weekBundle data, at most maxRun days; an unauthored previous
     week seeds nothing, which is byte-identical to the old fresh start. */
  const RUNLEN:any[]=[]; {
    const run:any=seedRunIn(CURWEEK,VCONF.maxRun);
    ev.forEach((day:any,i:any)=>{
      const on=new Set<any>();
      (day.events||[]).forEach((e:any)=>{ if(e.id&&PEOPLE[e.id]&&!isSpecial(e.id))on.add(e.id); });
      Object.keys(run).forEach((id:any)=>{ if(!on.has(id))run[id]=0; });   // a clear day resets it
      const m:any={}; on.forEach((id:any)=>{ m[id]=run[id]=(run[id]||0)+1; });
      RUNLEN[i]=m;
    });
  }
  /* ONE DAY'S CREW-REST COMPUTATION, extracted verbatim from the day loop
     below (the buildDay-extraction precedent) so the phantom next-Monday
     pass after the loop cannot drift from the real rule — one body, two
     callers, never a second copy of the arithmetic. `phantom` guards every
     write addressed to the CURRENT day (its warning, chips, rings, dash,
     REST) — a phantom day is next week's Monday, which this WARN cannot
     address by day index — leaving exactly one side effect: markTrace onto
     prevSeed.di, the "Breaks Monday" box on the live Sunday that caused
     it (owner, 23 Aug 26 — "If I plan someone who bust crew rest the day
     prior it should also flag out just like what u see for outlaw").
     `add` rides in as a parameter because it is the day loop's own
     closure over that day's `ws` list; the phantom caller passes null —
     every add here is phantom-guarded, so it is never dereferenced. */
  const crewRestDay=(prevSeed:any,day:any,di:any,phantom:any,add:any)=>{
      /* prevFlyEnd/prevEnd were once distinct — the rest-bearing set against
         the last end of ANY kind — and a late non-resting row could mask the
         sortie underneath it. With every kind rest-bearing they track the
         same number; both stay because the reference computes both and the
         fallback below costs nothing. */
      /* WHICH leg ran late, not just how late. The end time alone answers the
         rule but not the reader: the cross-day row on this day is the one
         affordance a scheduler can act on, and it has to be able to point at
         the sortie to move. So the winning event's own slot-key is kept beside
         its minute count (`slot` on a flying/shift event, `key` on the others)
         and travels on the trace — see markTrace below. */
      /* prevFlyLd carries the raw LANDING of the winning rest-end so the tail
         can spell out its own arithmetic (owner, 15 Aug 26 — "at least they
         know the assumption"): a sortie ends at land + debrief, and a
         scheduler who knows this crew walks off the jet fast can read that the
         2h is an assumption, not a fact. Null when the winning end is a SHIFT,
         which ends at its written time with no debrief tail to assume. */
      const prevEnd:any={}, prevFlyEnd:any={}, prevFlyKey:any={}, prevFlyLd:any={};
      prevSeed.events.forEach((e:any)=>{
        /* EVERYTHING THAT ENDS THE DAY BEARS CREW REST (owner, 21 Aug 26 —
           "anything that ends the day prior and affects the 12 hour crew
           rest will be a warning"; this widened twice the same day: first
           duties joined sortie-and-shift, then sims, ground events and
           programme items joined them all). A sortie still ends at land +
           debrief; every other kind ends at its WRITTEN end with no tail —
           a sim's brief/debrief windows live in simwin, not on the event,
           so its box end is what counts here. The tight-turning advisory
           below is now only the nominal-vs-instructed gap, never a
           severity downgrade by event kind; and the REST[] map the picker
           reads is built from the same set, so they cannot disagree. */
        const rests=true;
        const end=e.kind==='fly'?e.ld+VCONF.debrief:e.e;   // a shift/duty ends when it ends
        if(end==null)return;
        if(prevEnd[e.id]==null||end>prevEnd[e.id])prevEnd[e.id]=end;
        if(rests&&(prevFlyEnd[e.id]==null||end>prevFlyEnd[e.id])){prevFlyEnd[e.id]=end; prevFlyKey[e.id]=e.slot||e.key; prevFlyLd[e.id]=e.kind==='fly'?e.ld:null;}
      });
      /* DUTY & COMMITMENT INPUTS BEAR CREW REST TOO (owner, 21 Aug 26 —
         "everything in duty and commitments affects crew rest… do not
         include personal, sans availability", and it counts on both sides).
         Only the restsInput types, and only entries with TYPED times — an
         all-day record spans the full 1439 minutes and has no "timing you
         see" (his words), so it stays with the ordinary clash rules. The
         nx/pv copies are the midnight tails: other days' records shifted
         into this frame — counting an nx entry would file TODAY's own
         meeting as yesterday's end, so both are skipped. The end is the
         written end, no debrief tail; prevFlyLd stays null so the message
         keeps the plain "ended" wording, and prevFlyKey is cleared — an
         input has no board slot for the previous-day trace to jump to.
         REST[di] below is built from these same maps, so the SC picker's
         crew-rest refusal follows this rule with no second copy. */
      prevSeed.input.forEach((i:any)=>{
        if(i.nx||i.pv||!restsInput(i.type))return;
        if(i.s==null||i.e==null||!isFinite(i.e)||i.e-i.s>=1439)return;
        if(prevEnd[i.id]==null||i.e>prevEnd[i.id])prevEnd[i.id]=i.e;
        if(prevFlyEnd[i.id]==null||i.e>prevFlyEnd[i.id]){prevFlyEnd[i.id]=i.e; prevFlyKey[i.id]=null; prevFlyLd[i.id]=null;}
      });
      /* when rest expires today, for everyone who had ANY commitment
         yesterday — the palette reads this to keep an SC slot closed to
         anyone who is not yet clear */
      const restMap:any={};
      Object.keys(prevFlyEnd).forEach((id:any)=>{
        const cl=prevFlyEnd[id]+VCONF.crewRest-1440;
        if(cl>0)restMap[id]=cl;
      });
      if(!phantom)REST[di]=restMap;
      /* today's rest-bearing commitments: sorties AND shifts */
      const byR:any={}; day.fly.forEach((e:any)=>{(byR[e.id]=byR[e.id]||[]).push(e);});
      /* a shift reports when it starts; a sortie reports 3h before T/O */
      const nomOf=(e:any)=>e.shift?e.to:e.to-VCONF.reportLead;
      /* Read the leg's OWN brief (events.ts sets it from the indicated B, or
         from VCONF.briefLead when the line has none) — recomputing
         `e.to-VCONF.briefLead` here would ignore a typed B and quietly
         disagree with the brief window the same engine flags against.

         A `late show` / `show at brief` remark does NOT move this anchor
         (owner, 6 Aug 26): the breach is reported either way, in red, counted
         like any other. What the remark changes is the RING — see makesIt
         below — because a scheduler writing it has sanctioned the late join,
         and the reader still needs to see that crew rest was broken. */
      const briefOf=(e:any)=>e.brief!=null?e.brief:e.to-VCONF.briefLead;
      /* A shift reports at its start UNLESS an in-time was typed for it — an SC
         line's B box is that crew's report time (owner, 24 Aug 26). When set it
         is honoured (the earlier of it and the shift start, so a later value
         cannot push the report past when the watch actually begins); when blank
         e.intime is null and this is byte-identical to the old `e.to`. */
      const insOf=(e:any)=>e.shift?(e.intime!=null?Math.min(e.intime,e.to):e.to):Math.min(e.intime!=null?e.intime:Infinity,briefOf(e));
      Object.keys(byR).forEach((id:any)=>{
        /* Personnel (ground crew) hold no crew-rest rule — an incentive ride
           does not put a ground-crewman on a 12-hour flying clock. */
        if(PEOPLE[id]&&PEOPLE[id].pers)return;
        /* Crew rest runs off the last commitment of ANY kind (owner,
           21 Aug 26 — see the collection above). The prevEnd fallback is
           vestigial now that everything rests, and pfly can only read true
           when a previous end exists at all. */
        const pe=prevFlyEnd[id]!=null?prevFlyEnd[id]:prevEnd[id];
        if(pe==null||!isFinite(pe))return;
        const pfly={[id]:prevFlyEnd[id]!=null};
        const earliest=pe+VCONF.crewRest-1440;         // minutes into TODAY that crew rest expires
        if(earliest<=0)return;                          // 12h already clear before midnight
        const legs=byR[id];
        const nominal=Math.min.apply(null,legs.map(nomOf));
        const instructed=Math.min.apply(null,legs.map(insOf));
        /* THE DAY STARTS AT ITS FIRST COMMITMENT (owner, 21 Aug 26 — "if
           they have anything earlier like a meeting that busts crew rest
           and they fly later, it's also a violation… think it as, this
           person needs 12 hours of rest in order to fly"). His 21:30 →
           09:00 example had the in-time at 10:00 and the brief at 11:00 —
           both legal — and an 08:00 meeting that is not. So the anchor is
           the EARLIEST of the instructed flying report and any other
           scheduled commitment that day: a sim, a duty post, a ground
           event, a programme item. The flying legs themselves stay on
           insOf (their step/dekit pads are derived, not instructions).
           PERSONAL INPUTS joined the candidate set the same day (the second
           reduce): the restsInput types with typed times count — an 08:00
           Meeting input before a 10:00 report binds the breach exactly as a
           ground row would — while 'Personal', 'SANS Availability', leave,
           medical and all-day records stay out. An input-bound breach names
           the input in the message (inpLabel, so an Other reads by its
           remarks) but anchors on the LEG's key — an unaccepted input has
           no schedule row for the warning jump to pan to. When nothing else
           starts earlier, first === instructed and every message below is
           byte-identical to before. */
        const fe0=day.events.reduce((m:any,e:any)=>e.id===id&&e.kind!=='fly'&&e.kind!=='shift'&&e.s!=null&&isFinite(e.s)&&(m==null||e.s<m.s)?e:m,null);
        const fi=day.input.reduce((m:any,i:any)=>i.id===id&&!i.nx&&!i.pv&&restsInput(i.type)&&i.s!=null&&isFinite(i.s)&&i.e!=null&&i.e-i.s<1439&&(m==null||i.s<m.s)?i:m,null);
        const fe=fi!=null&&(fe0==null||fi.s<fe0.s)?{s:fi.s,label:inpLabel(fi)}:fe0;
        const first=Math.min(instructed,fe!=null?fe.s:Infinity);
        const evBound=first<instructed;
        const onShift=legs.some((e:any)=>e.shift);
        /* SPELL OUT THE ASSUMPTION when a sortie set the rest-end: show the
           real landing, name the debrief pad as an assumption, then the
           derived end and the 12h clearance — so the reader can override it in
           their head for a crew that leaves quickly. A shift (prevFlyLd null)
           has no debrief to assume, so it keeps the plain "ended". */
        const landed=prevFlyEnd[id]!=null?prevFlyLd[id]:null;
        const tail=landed!=null
          ? `${prevSeed.dow} landed ${hm24(landed)}, +${lgT(VCONF.debrief)} debrief assumed → ended ${hm24(pe)} → crew rest clear at ${hm24(earliest)}`
          : `${prevSeed.dow} ended ${hm24(pe)} → crew rest clear at ${hm24(earliest)}`;
        if(pfly[id]&&first<earliest){
          const bl=legs.reduce((m:any,e:any)=>insOf(e)<insOf(m)?e:m);   // the leg told to report earliest is the breach
          /* The LEAVE-BY: the latest the previous day could have ended for this
             man to be clear. It is what the scheduler actually needs — "he is
             short" is a complaint, "he had to be gone by 00:00" is an
             instruction — and the previous day's puck prints it when the
             warning is clicked. It rides the warning/trace as DATA only since
             22 Aug 26 (owner: the trace row's bold lead already says it, and
             the message's old ", so he had to leave by" tail said it again —
             "that's like repeating what u said"). first===instructed when no
             earlier event binds, so the unbound arithmetic is unchanged. */
          const leaveBy=hm24(first+1440-VCONF.crewRest);
          /* A sanctioned late show still makes the jet if rest clears by
             STEP, VCONF.step before T/O — the same knob that pads the busy
             window, so editing the step timing moves this line with it
             (owner, 21 Aug 26; a separate showLead key was removed for
             exactly that drift). Then the ring is DASHED:
             same red warning, same count, but the reader can see a scheduler
             meant it. Past that line there is no sanctioning it — he cannot
             walk, kit up and start engines — so it rings solid like any other
             breach. A shift has no take-off to measure against — and neither
             does a MEETING: when an earlier event binds the breach, a late
             show on the jet cannot excuse the 08:00 he reports to first. */
          const makesIt=!bl.shift&&earliest<=bl.to-VCONF.step;
          const dashed=!evBound&&!!bl.lateShow&&makesIt;
          if(!phantom){markChip(di,id,'CR');markRing(di,id,'hard'); if(dashed)markDash(di,id);}
          const prevDi=prevSeed.di;
          /* CAUSE-FIRST, SAID ONCE (owner, 22 Aug 26 — "refine the way u
             reason the crew rest warning. Clear and concise"): one forward
             chain — yesterday's end → when rest clears → the commitment that
             breaks it — with the shortfall in the same breath. The old shape
             stated the report first, re-derived it through the tail, then
             re-stated the leave-by the trace row's own lead already carries. */
          const crMsg=`Crew rest breach — ${tail}, but `
            +(evBound?`his day starts ${hm24(first)} (${fe.label}) before the ${hm24(instructed)} report — only ${dur(first+1440-pe)} rest.`
             :onShift?`${legs.filter((e:any)=>e.shift).map((e:any)=>e.label)[0]} starts ${hm24(instructed)} — only ${dur(instructed+1440-pe)} rest.`
             :`told to report ${hm24(instructed)} — only ${dur(instructed+1440-pe)} rest.`)
            +(dashed?` Late show — he still makes the ${hm24(bl.to-VCONF.step)} step.`
                    :(!evBound&&bl.lateShow?` Late show cannot save it — the ${hm24(bl.to-VCONF.step)} step is still before rest clears.`:''));
          /* the warning anchors on what binds it: the early event's own slot
             key when a meeting caused the breach, the leg otherwise — the
             jump then pans to the row the scheduler has to move */
          if(!phantom)add('hard','CREW_REST',[id],crMsg,evBound?(fe.slot||fe.key||bl.key):bl.key,{prevDi,leaveBy,dashed});
          /* The same breach, filed against the day that caused it — with
             `fromKey`, the leg on THAT day that ran late. It rides on the trace
             and NOT on the warning: parity.test.ts compares every field of
             WARN.byDay against the reference, while WARN.trace is port-only, so
             this stays clear of the reference entirely. */
          markTrace(prevDi,id,{di,dow:day.dow,leaveBy,dashed,msg:crMsg,fromKey:prevFlyKey[id]});
        } else if(nominal<earliest||instructed<earliest){
          /* Chip, no ring (owner, 7 Aug 26). A tight turn is a note, not a
             problem to fix — and this was the ONLY TT that rang: the same-day
             tight turn above chips bare, and so does DT. One glyph meaning
             "ringed problem" here and "unringed note" there is unreadable, so
             the ring goes rather than the chip. The warning itself is
             unchanged — still filed, still counted, still clickable. */
          if(!phantom)markChip(di,id,'TT');
          /* the sim/ground suffix is UNREACHABLE since every kind became
             rest-bearing (pfly is true whenever pe exists) — the ternary
             stays because the patched reference carries the identical line
             and neither side can emit it */
          if(!phantom)add('adv','CREW_TIGHT',[id],`Tight turning — T/O ${hm24(Math.min.apply(null,legs.map((e:any)=>e.to)))} puts the ${lgT(VCONF.reportLead)} report at ${hm24(nominal)}, inside ${lgT(VCONF.crewRest)}. ${tail}`
            +(pfly[id]?'':' (prior day ended on a sim or ground event, so crew rest itself does not apply)'),
            legs.reduce((m:any,e:any)=>nomOf(e)<nomOf(m)?e:m).key);
        }
      });
  };
  ev.forEach((day:any,idx:any)=>{
    const di=day.di, ws:any[]=[], seen=new Set();
    /* publish this day's events for the crew picker (see dayEvents) */
    const evd:any=EVD[di]={}; day.events.forEach((e:any)=>{(evd[e.id]=evd[e.id]||[]).push(e);});
    /* the same rule can fire off two legs of the same sortie pair, so identical
       rows are collapsed rather than printed twice. */
    /* key = the slot-key of the FIRST item the message names, so a click on the
       warning pans to the line that caused it (di.gi.li.ai[.p|w] flying,
       s:/d:/g:/a: rows). Optional — day-spanning warnings carry none. The dedup
       string k stays key-free: first add wins and keeps the first item's key. */
    const add=(s:any,code:any,who:any,msg:any,key?:any,extra?:any)=>{who=who.filter(Boolean);
      const k=code+'|'+who.join(',')+'|'+msg; if(seen.has(k))return; seen.add(k);
      const w={sev:s,code,who,day:day.dow,di,msg,key,...(extra||{})};ws.push(w);all.push(w);};
    const kOf=(e:any)=>e&&(e.slot||e.key)||null;   // byE events carry slot (fly/shift) or key (the rest)
    /* An SC / AVALON / BB line is a SHIFT, not a sortie. Its crew still count
       as tasked and are still checked for clashes and qualification, but a
       handover is not a turn, a 12-hour watch is not a long flying day, and a
       shift start does not imply a brief at T/O − 2h20. */
    const byP:any={}; day.fly.filter((e:any)=>!e.shift).forEach((e:any)=>{(byP[e.id]=byP[e.id]||[]).push(e);});
    /* A genuine double turn is two legs flown one AFTER the other. Legs whose
       AIRBORNE windows overlap are the same air time booked twice — the hard
       DOUBLE_BOOK clash below speaks for that man, and counting him "double
       turning" beside it read as two problems where there is one (owner,
       21 Aug 26 — the conflict is enough, no double-turn advisory on top).
       The airborne window (to..ld) is the line because it is the line the
       clash rule itself draws; a leg with no times stays counted, matching
       the clash's own null guard, which cannot fire without them. Shared by
       the DT chip and the DT_SUM summary so the two can never disagree. */
    const dturns=(ls:any)=>{for(let i=0;i<ls.length;i++)for(let j=i+1;j<ls.length;j++)if(!(ls[i].to!=null&&ls[j].to!=null&&overlap(ls[i].to,ls[i].ld,ls[j].to,ls[j].ld)))return true;return false;};
    // DT (2+ sorties) + TT (tight turn = next in-time within 20-min of previous land)
    Object.keys(byP).forEach((id:any)=>{
      /* Personnel (ground crew) carry only the conflict, long-day and 7-day
         checks — turning an aircraft is not their concern, so a passenger who
         rides two rear seats in a day raises no DT/TT. A genuine overlap is
         still caught below as a hard conflict. */
      if(PEOPLE[id]&&PEOPLE[id].pers)return;
      const es=byP[id].slice().sort((a:any,b:any)=>a.to-b.to);
      if(es.length>=2&&dturns(es))markChip(di,id,'DT');
      for(let i=0;i<es.length-1;i++){ const turn=es[i+1].to-es[i].ld;   // land → next T/O; need 30m dekit + 60m step = 90m
        /* The threshold and the mechanics are edited independently, so either
           can be the binding one: a 60 min threshold with 30 dekit + 60 step
           would let a physically impossible turn through. Take the larger. */
        const need=Math.max(VCONF.tightTurn,VCONF.dekit+VCONF.step);
        /* turn<0 means the two legs OVERLAP — he is airborne twice at once,
           which is not a turn at all. It was reported as one, carrying a
           negative minute count ("Tight turn VL→VL: -85 min"), and the hard
           clash below now speaks for that case instead (owner, 11 Aug 26). */
        if(turn>=0&&turn<need){markChip(di,id,'TT');add('adv','TURN',[id],`Tight turn ${es[i].label}→${es[i+1].label}: ${turn} min land→next T/O (needs ${need} min — threshold ${VCONF.tightTurn}, dekit+step ${VCONF.dekit}+${VCONF.step})`,es[i].key);} }
    });
    /* C — two commitments at the same time for one person.
       Sortie-vs-sortie is the tight-turn rule's business, not this one.
       A SHIFT (SC MAIN) is graded by what it runs into:
         another cockpit — flight, sim, another shift — or a duty POST he has to
         man → Warning, he cannot be in two places;
         a ground event or a programme item → Advisory, because you can still
         give academics to the man who is on SC — with ONE overlay (owner,
         26 Aug 26): a ground row that IS a red-list commitment, by its source
         input or by its own words, is the commitment, not academics → Warning.
         shiftEvHard (events.ts) carries the overlay; Meeting stays the advisory.
       SC SPARE never reaches here at all: a spare is standing by, so he stays
       free for anything else on the day. */
    /* SHIFT_HARD is declared once at the top of the engine — the crew picker
       shares it (and the same shiftEvHard overlay), so the two can never
       disagree about what bars a shift. */
    const byE=evd;
    Object.keys(byE).forEach((id:any)=>{ const es=byE[id].slice().sort((a:any,b:any)=>a.s-b.s);
      for(let i=0;i<es.length;i++)for(let j=i+1;j<es.length;j++){
        const A=es[i],B=es[j];
        /* Sortie-vs-sortie is the tight-turn rule's business — but only where
           the legs are SEQUENTIAL. This used to skip every flying pair, because
           two back-to-back legs overlap the moment the step and dekit pads are
           added and would have rung on every legitimate tight turn. That also
           swallowed the case where the man is genuinely airborne twice at once:
           plan him into two aircraft on the same times and the only thing said
           was an amber tight turn with a negative minute count (owner, 11 Aug
           26). The line between the two is the AIRBORNE window (to..ld), never
           the padded one — so compare those, and let a real overlap fall
           through to the hard clash below. */
        if(A.kind==='fly'&&B.kind==='fly'
           &&!(A.to!=null&&B.to!=null&&overlap(A.to,A.ld,B.to,B.ld)))continue;
        if(!overlap(A.s,A.e,B.s,B.e))continue;
        /* every clash, not just the first: a man double-booked in the morning
           AND in the evening used to be told about the morning only. The red
           ring goes on too — a hard warning with a grey puck was a bug. */
        if(A.kind==='shift'||B.kind==='shift'){
          const sh=A.kind==='shift'?A:B, other=A.kind==='shift'?B:A;
          if(shiftEvHard(other)){
            markChip(di,id,'C'); markRing(di,id,'hard');
            add('hard','DOUBLE_BOOK',[id],`${sh.label} & ${other.label} clash`,kOf(sh)||kOf(other));
          } else {
            /* amber A, not the red conflict C — the puck has to say advisory at a
               glance, the way the note under it already does */
            markChip(di,id,'A'); markRing(di,id,'adv');
            add('adv','SHIFT_SOFT',[id],
              `${PEOPLE[id]?PEOPLE[id].cs:id} is on ${sh.label} (${hm24(sh.s)}–${hm24(sh.e)}) and also down for ${other.label}`,kOf(sh)||kOf(other));
          }
          continue;
        }
        markChip(di,id,'C'); markRing(di,id,'hard');
        /* two seats on the SAME line print the same label, so the general
           wording came out as "VL BFM & VL BFM clash" — which reads like a
           fault in the app rather than a fault in the plan. Name what actually
           happened instead; the two-different-lines wording is unchanged. */
        add('hard','DOUBLE_BOOK',[id],A.label===B.label
          ?`${PEOPLE[id]?PEOPLE[id].cs:id} is in two seats on ${A.label} at once`
          :`${A.label} & ${B.label} clash`,kOf(A)||kOf(B));} });
    /* THE IN-TIME WINDOW (owner, 24 Aug 26 — "have a no brief advisory as well
       if anything cuts or ends between B and TO time for SC main"). An SC MAIN
       with a typed B earlier than the shift start is on duty from that B, so a
       commitment that cuts into or ends inside B→start gets an amber advisory —
       amber, not red, because the shift itself has not been double-booked yet.
       Only a shift event can carry report<s (events.ts sets it from the SC B
       alone; a spare has no event at all), so the guard needs no wave lookup.
       An event that also overlaps the shift window is the clash loop's business
       above and is not re-reported here; a timed personal input is included the
       way crew rest includes it (restsInput, typed times only) — and since
       26 Aug 26 inputs DO speak against the shift window itself (the per-type
       red/amber below), so an input reaching into the shift gets the same
       already-reported exclusion the events have, or one Meeting would read
       both as SHIFT_SOFT and as an in-time cut. */
    Object.keys(byE).forEach((id:any)=>byE[id].forEach((sh:any)=>{
      if(sh.kind!=='shift'||sh.report==null||sh.report>=sh.s)return;
      const cs=PEOPLE[id]?PEOPLE[id].cs:id;
      const cut=(s:any,e:any,label:any)=>{
        markChip(di,id,'A'); markRing(di,id,'adv');
        add('adv','SC_INTIME',[id],
          `${cs} reports ${hm24(sh.report)} for ${sh.label} — ${label} (${hm24(s)}–${hm24(e)}) cuts into the in-time window before the ${hm24(sh.s)} start`,kOf(sh));};
      byE[id].forEach((o:any)=>{ if(o===sh)return;
        if(!overlap(sh.report,sh.s,o.s,o.e))return;
        if(overlap(sh.s,sh.e,o.s,o.e))return;
        cut(o.s,o.e,o.label);});
      day.input.forEach((inp:any)=>{ if(inp.id!==id||inp.nx||inp.pv)return;
        if(!restsInput(inp.type)||inp.s==null||inp.e==null||inp.e-inp.s>=1439)return;
        if(!overlap(sh.report,sh.s,inp.s,inp.e))return;
        if(overlap(sh.s,sh.e,inp.s,inp.e))return;
        cut(inp.s,inp.e,inpLabel(inp));});
    }));
    // C via input clash (DNIF / leave / appointment vs a sortie)
    /* SHIFT lines ride day.fly too, and this loop used to speak over them —
       "Meeting clashes with SC AM" beside the shift's own graded voice, and a
       leave read twice in two wordings. Since the per-type grading (owner,
       26 Aug 26) the events loop below is a shift's ONE voice — red-list and
       ATT B hard, Meeting amber, leave/med/OD hard — so a shift line is
       excluded here outright. Real sorties are untouched. */
    day.fly.forEach((e:any)=>day.input.forEach((inp:any)=>{ if(inp.id!==e.id)return;
      if(e.shift)return;
      if(overlap(e.step,e.dekit,inp.s,inp.e)){
        /* the offer exemption is gone with the "Available *" types (owner
           decision, Aug 26). "Fly with" is now an ordinary commitment: a man who
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
              :`${inp.type} clashes with ${e.label}${why}`,e.key);} }));
    /* being unavailable does not only bar flying — a duty, a sim seat or a
       ground slot on the same day is just as wrong, and used to pass. This
       covered leave and downchits only (owner, 4 Aug 26): a Detachment, or a
       personal input a scheduler has actioned to Unavailable, warned against a
       sortie but let a sim seat, a duty post or a ground row through silently
       — so "unavailable" guarded the jets and nothing else. Now every input
       the validator can see clashes with every kind of tasking. Shifts grade
       the ordinary personal types BY TYPE now (owner, 26 Aug 26 — SC MAIN may
       launch the man): the red-list commitments (shiftHardInput — Training,
       CSE, Fly with, Personal, Appointment, Duty, Other) hard-flag a shift
       exactly like OD always did; a Meeting reads as the amber SHIFT_SOFT
       advisory, the same voice its accepted ground row speaks in, so the raw
       and landed representations of one input can never disagree. The timed
       accepted copy is still deferred to its row (inpShow), so nothing here
       double-reports. Leave, medical and overseas duty still hard-flag a
       shift — those close the man's day outright.
       ATT B (owner, 10 Aug 26; narrowed 26 Aug 26): grounded, not absent —
       unfit to fly but at his desk — so a duty post, a sim seat, a ground row
       or a programme item is proper and must not flag. An SC MAIN SHIFT is the
       exception now: the shift may require him to FLY, so it hard-flags like
       the jet does (and the crew picker already refused him the seat — this
       closes that drift). canWork() still separates "cannot fly" from "cannot
       work" everywhere else. */
    day.events.forEach((e:any)=>{ if(e.kind==='fly')return;
      day.input.forEach((inp:any)=>{ if(inp.id!==e.id)return;
        if(canWork(inp.type)&&e.kind!=='shift')return;
        const dn=isDownchit(inp.type), lv=isLeave(inp.type);
        if(!isUnavail(inp.type)&&e.kind==='shift'&&!shiftHardInput(inp.type)){
          /* Meeting (and any future unflagged commitment) — the shift's amber
             voice, worded byte-for-byte like the ground-row SHIFT_SOFT above */
          if(!overlap(e.s,e.e,inp.s,inp.e))return;
          markChip(di,e.id,'A'); markRing(di,e.id,'adv');
          add('adv','SHIFT_SOFT',[e.id],
            `${PEOPLE[e.id]?PEOPLE[e.id].cs:e.id} is on ${e.label} (${hm24(e.s)}–${hm24(e.e)}) and also down for ${inpLabel(inp)}`,kOf(e));
          return;
        }
        if(!overlap(e.s,e.e,inp.s,inp.e))return;
        markChip(di,e.id,'C'); markRing(di,e.id,'hard');
        const why=inp.remarks?` — reason: ${inp.remarks}`:'';
        add('hard',dn?'DNIF_FLY':lv?'LEAVE_FLY':'INPUT_FLY',[e.id],
          (dn?'Downchit but tasked':lv?'On leave but tasked':`${inp.type} but tasked`)+` — ${e.label}${why}`,kOf(e)); }); });
    /* AVALON'S ONE CHECK (owner, 11 Aug 26). The wave and its desk keep their
       noconf exemption — nothing on them is cross-checked against tasks, rest or
       qualifications — but the owner commissioned exactly one look, the same shape
       as the SC SPARE rule below: a man standing AVALON must be on the island and
       fit. Jet seats (MAIN and SPARE alike) bar what cannot spare — overseas (OL,
       OD) and the whole medical group, ATT B included, because these are jet
       seats and ATT B means no flying. A duty role mans a desk, so ATT B is the
       carve-out (work:true rows test canWork). It warns, never blocks. The shift
       runs 19:00–07:00: day.input's midnight tail (events.ts) is what lets the
       morning half see tomorrow's inputs, so a man fine tonight but overseas from
       tomorrow is caught here with no extra code. */
    (day.sacrew||[]).forEach((sa:any)=>{
      day.input.forEach((inp:any)=>{ if(inp.id!==sa.id)return;
        if(canSpare(inp.type))return;
        if(sa.work&&canWork(inp.type))return;
        if(!overlap(sa.s,sa.e,inp.s,inp.e))return;
        markChip(di,sa.id,'C'); markRing(di,sa.id,'hard');
        const dn=isDownchit(inp.type);
        const why=inp.remarks?` — reason: ${inp.remarks}`:'';
        add('hard',dn?'DNIF_FLY':'LEAVE_FLY',[sa.id],
          `${inp.type} but on ${sa.label} — ${dn?'medically down':'overseas'}${why}`,sa.key);
      });
    });
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
      /* personnel (ground crew) carry only conflict, long-day and the 7-day run
         — an incentive passenger has no flight brief of his own to lose */
      if(PEOPLE[id]&&PEOPLE[id].pers)return;
      const legs=byE[id].filter((e:any)=>e.kind==='fly'), others=byE[id].filter((e:any)=>e.kind!=='fly');
      legs.forEach((lg:any)=>{
        const bs=lg.brief, de=lg.ld+VCONF.debrief;   // brief time is the hardline, not T/O − 3h
        const hits=(s:any,e:any)=>others.filter((o:any)=>overlap(s,e,o.s,o.e)).map((o:any)=>o.label)
          .concat(timedInput.filter((i:any)=>i.id===id&&overlap(s,e,i.s,i.e)).map((i:any)=>i.type));
        const hb=hits(bs,lg.to);
        if(hb.length){markChip(di,id,'NB');markRing(di,id,'adv');
          add('adv','NO_BRIEF',[id],`No time for the ${lg.label} flight brief — ${hb.join(', ')} sits inside ${hm24(bs)}–${hm24(lg.to)} (brief ${hm24(bs)})`,lg.slot);}
        const hd=hits(lg.ld,de);
        if(hd.length){markChip(di,id,'DB');markRing(di,id,'adv');
          add('adv','DEBRIEF',[id],`Not enough time to attend the ${lg.label} debrief — ${hd.join(', ')} sits inside ${hm24(lg.ld)}–${hm24(de)} (land + ${lgT(VCONF.debrief)})`,lg.slot);}
      });
    });
    /* ---- sim brief / debrief windows -------------------------------------
       EP profiles brief 15 min prior and debrief 30 min after. The AMT carries
       its own BRIEF row, so that row's time IS the hard line — nothing is added
       in front of it.                                                          */
    (day.simwin||[]).forEach((sw:any)=>sw.ids.forEach((id:any)=>{
      if(PEOPLE[id]&&PEOPLE[id].pers)return;       // ground crew — no sim brief of their own to lose
      const mine=(byE[id]||[]);
      const hits=(s:any,e:any)=>mine.filter((o:any)=>overlap(s,e,o.s,o.e)).map((o:any)=>o.label)
        .concat(timedInput.filter((i:any)=>i.id===id&&overlap(s,e,i.s,i.e)).map((i:any)=>i.type));
      if(sw.bs!=null&&sw.be!=null&&sw.be>sw.bs){ const h=hits(sw.bs,sw.be);
        /* amber like NO_BRIEF (owner, 4 Aug 26) — same rule, sim flavour */
        if(h.length){markChip(di,id,'SB');markRing(di,id,'adv');
          add('adv','SIM_BRIEF',[id],`No time for the ${sw.label} brief — ${h.join(', ')} sits inside ${hm24(sw.bs)}–${hm24(sw.be)}`,sw.key);} }
      if(sw.ds!=null&&sw.de!=null&&sw.de>sw.ds){ const h=hits(sw.ds,sw.de);
        if(h.length){markChip(di,id,'SD');markRing(di,id,'adv');
          add('adv','SIM_DEBRIEF',[id],`No time for the ${sw.label} debrief — ${h.join(', ')} sits inside ${hm24(sw.ds)}–${hm24(sw.de)}`,sw.key);} }
    }));
    /* ---- double-turn summary --------------------------------------------
       One line at the head of the day telling the next scheduler how many
       bodies are flying twice. Amber, not red (owner, 4 Aug 26): double
       turning is routine and planned, so the summary now matches the amber DT
       chips instead of shouting over them. dturns (above) keeps a man whose
       only "second sortie" overlaps his first out of this count — he is
       double-booked, not double turning, and the hard clash already says so. */
    const dts=Object.keys(byP).filter((id:any)=>byP[id].length>=2&&!(PEOPLE[id]&&PEOPLE[id].pers)&&dturns(byP[id]));
    if(dts.length)add('adv','DT_SUM',dts,`${dts.length} ${dts.length===1?'person is':'people are'} double turning: ${dts.map((id:any)=>PEOPLE[id]?PEOPLE[id].cs:id).join(', ')}`);
    /* ---- long work day --------------------------------------------------
       Report (T/O − 3h, or the published in-time) through land + 2h, or plain
       start→end for everything that is not flying. Over 12h and the day gets a
       grey note stating the actual hours. Personal inputs are left out — an
       all-day input would read as a 24-hour work day.                          */
    Object.keys(byE).forEach((id:any)=>{
      const w=workSpan(byE[id]); if(!w)return;
      /* ef keeps the FLY event that set the day's END (null when a non-flying
         commitment did), so the note can name the debrief pad baked into it. */
      const s=w.s,e=w.e,ef=w.ef,span=w.span;
      if(span>VCONF.longDay){markChip(di,id,'LD');markRing(di,id,'note');
        /* NAME THE DEBRIEF ASSUMPTION (owner, 15 Aug 26 — the same "state the
           assumption" as crew rest). When a sortie closes the day, its end is
           the landing plus the assumed 2h debrief pad, so the note prints the
           real landing and flags the pad — a scheduler who knows this crew
           leaves fast can discount it. A non-flying finish is a fixed clock
           time with nothing to assume, so it stays bare. */
        const back=ef?`${hm24(e)} (last landing ${hm24(ef.ld)} + ${lgT(VCONF.debrief)} debrief assumed)`:`${hm24(e)}`;
        add('note','LONGDAY',[id],`${PEOPLE[id]?PEOPLE[id].cs:id} has a long work day: ${dur(span)}, ${hm24(s)} → ${back}`);}
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
       12h clear from the previous day's last commitment — ANY commitment
       (owner, 21 Aug 26: "anything that ends the day prior and affects the
       12 hour crew rest will be a warning"). A sortie's day ends at land +
       2h (the debrief); a shift, a duty desk row, a sim, a ground event or
       a programme item ends when it ends. The
       squadron's nominal report is T/O − 3h; if the aircrew has actually been
       TOLD to come in earlier than legal — through the published in-time or the
       brief time, whichever is earlier — that is a hard breach, not a caution.

       AN SC SHIFT COUNTS THE SAME AS A SORTIE, at the hours written on the line
       and no others. It ends the previous day for rest purposes at its LD (no
       debrief tail is added), and it must itself start 12h clear — the shift's
       own start time IS the report time, so no 3h lead and no brief lead are
       taken off it either.

       MONDAY IS NO LONGER EXEMPT (the cross-week work — owner: a late Sunday
       must bust the next Monday's rest). The old `if(idx>0)` guard meant the
       first loaded day had no yesterday and the whole block was skipped;
       prevSundaySeed (weekctx.ts) now stands in as Monday's yesterday, built
       from the previous week's bundle by the very same buildDay the loaded
       days use, shaped exactly like ev[idx-1]. Its di is null, so the
       markTrace below no-ops (its own guard) and the breach carries
       prevDi:null — the trace belongs to a day this WARN cannot address, and
       the warning's own message already names Sunday and its end time. An
       unauthored previous week seeds empty maps and the guards below skip
       every man, byte-identical to the old REST[di]={} branch. */
    const prevSeed:any=idx>0?ev[idx-1]:prevSundaySeed(CURWEEK);
    crewRestDay(prevSeed,day,di,false,add);
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
          if(isOcu(p.q)&&isOcu(w.q)){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');markChip(di,ac.p,'CP');markChip(di,ac.w,'CP');add('adv','CREW_SOLO',[ac.p,ac.w],`${p.cs} (OCU pilot) with ${w.cs} (OCU WSO) in ${f.label} — a crew solo, only allowed under the Basic Course Syllabus`,ac.key);}
          else if(isOcu(p.q)||isOcu(w.q)){markRing(di,ac.p,'hard');markRing(di,ac.w,'hard');markChip(di,ac.p,'CPH');markChip(di,ac.w,'CPH');add('hard','ILLEGAL_CREW',[ac.p,ac.w],isOcu(p.q)?`OCU pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} — not an authorised combination (${f.label})`:`OCU WSO ${w.cs} with CAT ${p.q} pilot ${p.cs} — not an authorised combination (${f.label})`,ac.key);}
          else if((p.q==='D'&&(w.q==='C'||w.q==='D'))||(p.q==='C'&&w.q==='D')){markRing(di,ac.p,'adv');markRing(di,ac.w,'adv');markChip(di,ac.p,'CP');markChip(di,ac.w,'CP');add('adv','CO_APPROVAL',[ac.p,ac.w],`CAT ${p.q} pilot ${p.cs} with CAT ${w.q} WSO ${w.cs} in ${f.label} — CO approval required`,ac.key);}
        }
        /* Personnel (ground crew) in a FRONT seat is illegal — they hold no
           flying qualification and may ride a rear seat only. In the REAR seat
           they raise the crew-pairing CP advisory instead: an incentive ride is
           a non-standard pairing that needs approval (owner, Aug 26). The seat
           and combination checks below key on FCP/RCP and never catch a 'GND'
           seat, so these two lines are the whole story for personnel. */
        if(p&&p.pers){markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');add('hard','QUAL',[ac.p],`${p.cs} is ground crew — cannot fly a front seat (${f.label})`,ac.key+'.p');}
        if(w&&w.pers){markChip(di,ac.w,'CP');markRing(di,ac.w,'adv');add('adv','PAX_CREW',[ac.w],`${w.cs} is riding the rear seat of ${f.label} as an incentive passenger — this crew pairing needs approval`,ac.key+'.w');}
        // Q — seat qualification: a WSO can't fly FCP; only an instructor pilot (IP / IR / FI) may fly RCP
        if(p&&p.seat==='RCP'){markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');add('hard','QUAL',[ac.p],`${p.cs} is a WSO — cannot fly FCP (${f.label})`,ac.key+'.p');}
        /* belt and braces: CAT IW is a WSO-only category, so an IW record whose
           seat says FCP is inconsistent data — the Quals-page dropdowns never
           offer IW to a pilot, but a hand-edit could. Flag it, don't hide it. */
        if(p&&p.q==='IW'&&p.seat==='FCP'){markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');add('hard','QUAL',[ac.p],`${p.cs} is CAT IW — a WSO category, cannot fly FCP (${f.label})`,ac.key+'.p');}
        if(w&&w.seat==='FCP'&&!isInstrPilot(w.q)){markChip(di,ac.w,'Q');markRing(di,ac.w,'hard');add('hard','QUAL',[ac.w],`${w.cs} is a pilot, not an instructor — only IP / IR / FI may fly RCP (${f.label})`,ac.key+'.w');}
        /* AAR — the remarks call for it and the FRONT seat is not current.
           A man who is not current may still fly it as TRAINING, but only with
           someone cleared to teach that AAR sitting behind him (owner,
           10 Aug 26). So the three outcomes below, in order of what the
           scheduler has to do about them:
             back seat is an instructor pilot holding the mark → nothing. This
               is the legal training sortie, and flagging it was the bug.
             back seat is an instructor pilot WITHOUT it → AAR_INSTR, and the
               warning names the BACK-SEATER and anchors on his seat, because
               he is the man who has to change.
             back seat empty, a WSO, or a pilot who is not an instructor →
               AAR_QUAL, unchanged: nobody aboard could supervise him.
           Night versus day is already decided — ac.aar is 'DAAR' or 'NAAR'
           straight out of aarNeed, so the same call answers both. */
        if(ac.aar&&p&&!isSpecial(ac.p)&&!aarOK(ac.p,ac.aar)){
          const teacher=!!(w&&w.seat==='FCP'&&isInstrPilot(w.q)&&!isSpecial(ac.w));
          const day=ac.aar==='NAAR'?'night':'day';
          if(teacher&&aarInstrOK(ac.w,ac.aar)){/* supervised — no warning */}
          else if(teacher){
            /* BOTH men wear it, as the combination matrix above does. The
               message names the back-seater and the key anchors on his seat
               because he is the one to change — but the jet is illegal, not
               just his seat, and ringing him alone would leave the pilot who
               is actually flying an AAR he is not current for reading clean.
               Back-seater first in `who`: the message opens with his name. */
            markChip(di,ac.w,'Q');markRing(di,ac.w,'hard');
            markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');
            add('hard','AAR_INSTR',[ac.w,ac.p],
              `${w.cs} is not cleared to instruct ${ac.aar} — ${p.cs} is not ${ac.aar} current and ${f.label} remarks call for ${day} AAR`,ac.key+'.w');}
          else{
            markChip(di,ac.p,'Q');markRing(di,ac.p,'hard');
            add('hard','AAR_QUAL',[ac.p],
              `${p.cs} is not ${ac.aar} current — ${f.label} remarks call for ${day} AAR`,ac.key+'.p');}} });
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
      if(ocuAll.length&&!anyIP){ocuAll.forEach((id:any)=>{markRing(di,id,'adv');markChip(di,id,'CP');});add('adv','OCU_NO_IP',ocuAll,`OCU in ${f.label} with no IP`,f.key);}
      /* NO_IR — an instrument rating test needs an IR examiner aboard (owner,
         Aug 5 '26). The mission lives in f.shift (collectEvents folds f.msn
         into it); a per-aircraft IRT lives in that aircraft's remarks. IRT in
         the formation's msn wants an IR anywhere in the formation; IRT in one
         aircraft's remarks wants the IR in THAT aircraft. Ring only, no chip —
         same shape as OCU_NO_IP, and red: the sortie cannot be examined. */
      const isIR=(id:any)=>{const q=realP(id);return !!(q&&q.q==='IR');};
      if(/\bIRT\b/i.test(String(f.shift||''))&&crewAll.length&&!crewAll.some(isIR)){
        crewAll.forEach((id:any)=>{markRing(di,id,'hard');markChip(di,id,'CPH');});
        add('hard','NO_IR',crewAll,`IRT in ${f.label} with no IR examiner`,f.key);}
      f.acs.forEach((ac:any)=>{ if(!/\bIRT\b/i.test(String(ac.rmks||'')))return;
        const crew=[ac.p,ac.w].filter((id:any)=>id&&realP(id));
        if(crew.length&&!crew.some(isIR)){crew.forEach((id:any)=>{markRing(di,id,'hard');markChip(di,id,'CPH');});
          add('hard','NO_IR',crew,`IRT remarks on ${f.label} with no IR examiner`,ac.key);}});
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
              +` — ${wrong.map((id:any)=>PEOPLE[id].cs).join(', ')} ${wrong.length===1?'is':'are'} not current`,f.key);
          }
        }
        /* WHO MAY NOT STAND AN SC SPARE. Standing by means being on the island
           and fit to walk, so the bar is canSpare() — the owner's rule, local
           yes and overseas no, with the medical group carved out because those
           four keep the man here but not fit (owner, 10 Aug 26). A local
           commitment does NOT bar a spare: he is standing by, not tasked, so
           leave at home, a meeting or a course all still leave him reachable.
           The spare exemption keeps this crew out of every other clash rule,
           so this is the only place any of it can be caught at all.
           Deliberately written against "a standalone spare" rather than SC
           alone: the owner reserved the AVALON rule and it drops in here. */
        (f.spareCrew||[]).forEach((id:any)=>{
          day.input.forEach((inp:any)=>{ if(inp.id!==id)return;
            if(canSpare(inp.type))return;
            if(!overlap(f.s,f.e,inp.s,inp.e))return;
            markChip(di,id,'C'); markRing(di,id,'hard');
            const why=inp.remarks?` — reason: ${inp.remarks}`:'';
            /* say WHICH of the two disqualifies him — "overseas" and "medically
               down" are different problems and the scheduler fixes them
               differently */
            const dn=isDownchit(inp.type);
            add('hard',dn?'DNIF_FLY':'LEAVE_FLY',[id],
              `${inp.type} but standing SC SPARE — ${dn?'medically down':'overseas'}`
              +`, ${f.label}${why}`,f.key); }); });
      }
    });
    /* SANS AVAILABILITY (owner, 14 Aug 26) — a SANS body planted into a
       flying / OFT / AMT slot outside what he actually filed raises a
       persistent amber Advisory, reusing the CP flag (the PAX_CREW
       precedent — no new chip). Checks are built from day.fly (domain
       'fly', the sortie's own step→dekit window — the same window slotBar
       judges a flying seat against, AVALON excluded because saExempt
       formations never reach day.fly at all) plus day.events' sim entries
       whose key names the device (`s:di.amt.ri` / `s:di.oft.ri` — domain is
       the captured word, window is the event's own s→e). A duty, ground or
       programme event carries no matching key, so it never reaches
       sansGate — "any ground event can also be planned" is the owner's rule
       for slotBar too, and the two must not drift apart.
       ONLY 'not-offered' and 'window' raise. 'none' — nothing filed at all —
       is DELIBERATELY silent here: the owner's own example only ever
       describes planting AGAINST a filed record ("indicates A and O…
       planned for F"), and firing on a bare no-record would put this
       Advisory on every seeded SANS flyer the demo week already carries
       (romeo, vinci and krait fly; waldo rides OFT as pax) — seed INPUTS
       carry zero SANS records, so that would break reference parity for a
       rule nobody asked to cover. No-record still reads to the scheduler —
       the palette greys the puck and prints the reason, and the toast on
       planting says the same — it simply never becomes a persistent
       Advisory. 'ok' and 'na' are not a problem and need no comment. */
    const sansChecks:any[]=[];
    day.fly.forEach((e:any)=>sansChecks.push({id:e.id,domain:'fly',s:e.step,en:e.dekit,label:e.label,key:e.key}));
    day.events.forEach((e:any)=>{ const m=/^s:\d+\.(amt|oft)\./.exec(String(e.key||'')); if(!m)return;
      sansChecks.push({id:e.id,domain:m[1],s:e.s,en:e.e,label:e.label,key:e.key}); });
    sansChecks.forEach((c:any)=>{ const p=PEOPLE[c.id]; if(!p||!p.san)return;
      const g=sansGate(c.id,day.dt,c.domain,c.s,c.en);
      if(g.status!=='not-offered'&&g.status!=='window')return;
      markRing(di,c.id,'adv');markChip(di,c.id,'CP');
      const reason=g.status==='not-offered'?`not offering ${SANS_LABEL[c.domain]} today`
        :`available ${hm24(g.off.s)}–${hm24(g.off.e)} only`;
      add('adv','SANS_AVAIL',[c.id],`${p.cs} planned for ${c.label} — ${reason}`,c.key);
    });
    /* Q (sims) — the sim box guards its FRONT seat like the jet (ground crew,
       a WSO, an IW-in-FCP record — none may occupy it). The REAR seat has no
       seat rule at all: an OFT or AMT session does not need an instructor in
       the back (owner, 14 Aug 26 — the jet's IP/IR/FI rear-seat rule used to
       be copied here, and only the jet keeps it). */
    (day.simcrew||[]).forEach((s:any)=>{ const p=realP(s.p);
      if(p&&p.pers){markChip(di,s.p,'Q');markRing(di,s.p,'hard');add('hard','QUAL',[s.p],`${p.cs} is ground crew — cannot take the front seat (${s.label})`,`s:${di}.${s.kind}.${s.ri}.p`);}
      if(p&&p.seat==='RCP'){markChip(di,s.p,'Q');markRing(di,s.p,'hard');add('hard','QUAL',[s.p],`${p.cs} is a WSO — cannot take the front seat (${s.label})`,`s:${di}.${s.kind}.${s.ri}.p`);}
      if(p&&p.q==='IW'&&p.seat==='FCP'){markChip(di,s.p,'Q');markRing(di,s.p,'hard');add('hard','QUAL',[s.p],`${p.cs} is CAT IW — a WSO category, cannot take the front seat (${s.label})`,`s:${di}.${s.kind}.${s.ri}.p`);}
    });
    const SORD:any={hard:0,adv:1,note:2};
    ws.sort((a:any,b:any)=>(SORD[a.sev]??3)-(SORD[b.sev]??3));
    byDay[di]={di,dow:day.dow,warns:ws};
  });
  /* THE FORWARD TRACE ACROSS THE WEEK EDGE (owner, 23 Aug 26): within a week
     a late day draws its "Breaks <tomorrow>" box on the day that CAUSED
     the breach; the Sunday-to-next-Monday edge was the one gap left. Run the
     same extracted computation once more with next Monday's seed standing in
     as the phantom day — weekctx's bundle-or-stash, the very data the real
     Monday will validate against when its week loads — so only Sunday's own
     trace box is written here; the breach warning itself still lands on
     Monday when next week is viewed. The trace carries di:null (no in-week
     day to jump to): dayTraceHTML renders it as an informational row, and an
     unauthored, unedited next week seeds empty arrays and writes nothing. */
  crewRestDay(ev[6],nextMondaySeed(CURWEEK),null,true,null);
  WARN={all,byDay,sev,chip,dash,trace};
  const hard=all.filter((w:any)=>w.sev==='hard').length;
  const note=all.filter((w:any)=>w.sev==='note').length;
  if($('nHard'))$('nHard').textContent=hard;
  if($('nAdv'))$('nAdv').textContent=all.length-hard-note;
  if($('nNote'))$('nNote').textContent=note;
  return WARN;
}
export const sevOf=(di:any,id:any)=>WARN.sev[di]&&WARN.sev[di][id];
export const chipOf=(di:any,id:any)=>WARN.chip&&WARN.chip[di]&&WARN.chip[di][id];
/* the ring STROKE, published per person like the ring colour above it: true
   where a sanctioned late show still makes step, so the puck reads
   as a breach a scheduler meant rather than one nobody noticed. */
export const dashOf=(di:any,id:any)=>!!(WARN.dash&&WARN.dash[di]&&WARN.dash[di][id]);
/* THE PREVIOUS-DAY TRACE, read from the day that caused the breach: what this
   man's day-end does to TOMORROW. Standing model state, not focus state — the
   dotted ring, the CR label and the cross-day row are all painted off this the
   moment the week renders, with nothing clicked (owner, 6 Aug 26). */
export const traceOf=(di:any,id:any)=>(WARN.trace&&WARN.trace[di]&&WARN.trace[di][id])||null;
/* ...and whether the trace OWNS the puck's flag, which it only does when the
   man carries nothing louder of his own that day. One test, so the chip the
   builder prints and the warning a click opens can never disagree. */
export const traceLeads=(di:any,id:any)=>{const t=traceOf(di,id); if(!t)return null;
  const c=chipOf(di,id); return (!c||RANK['CR']>RANK[c])?t:null;};
/* Where the traced breach actually LIVES — its index in the NEXT day's own
   warning list. That pair (day, index) is the address every warning surface
   already navigates by, so a cross-day row and a traced puck both hand the
   ordinary jump the ordinary thing and need no navigation path of their own.
   -1 where the warning has moved under an edit: WARN is rebuilt wholesale. */
export const traceIx=(t:any,id:any)=>{if(!t)return -1;
  const g=WARN.byDay&&WARN.byDay[t.di];
  return (((g&&g.warns)||[]) as any[]).findIndex((w:any)=>w.code==='CREW_REST'&&(w.who||[]).indexOf(id)>=0);};
/* every man whose day-end breaks the NEXT day, for the day that caused it */
export const tracesOn=(di:any)=>{const m=(WARN.trace&&WARN.trace[di])||{};
  return Object.keys(m).map((id:any)=>({id,t:m[id]}));};
/* how often each code fired across the week now on screen, and on which days */
export function lgFired(){
  const out:any={}; (WARN.all||[]).forEach((w:any)=>{
    const o=out[w.code]=out[w.code]||{n:0,days:new Set(),sev:new Set()};
    o.n++; o.days.add(w.di); o.sev.add(w.sev);});
  return out;}
