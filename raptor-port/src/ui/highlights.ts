/* The highlight pass and warning-focus scroll — DOM code, verbatim from
   the reference. Runs after every week render; the markup it decorates is
   the verbatim dayHTML output, so the selectors line up exactly. */
import { PEOPLE, isSpecial } from '../engine/people'
import { HLSET, SEARCH, SELID, WFOCUS, ARM, FRESHADD, FRESHOUT, warnFocusMap, personMatchesHL, CURPAGE, SBDAY } from '../state/view'
import { ME } from '../state/auth'
import { slotBar } from '../engine/avail'
import { slotVal } from '../engine/slots'
import { WARN } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { isNewFlag, NEWFLAGS } from '../state/dropflag'
import { hsSet, hsSync } from './pan'

/* A ONE-SHOT callback run at the end of the next highlight pass — i.e. in the
   SAME task as the innerHTML swap that just changed the layout, before the
   browser paints it. The puck-click hold rides here (owner, 7 Aug 26: "the
   page jitters"): its first shipping ran on setTimeout(0), a macrotask AFTER
   paint, so one frame showed the schedule leapt ~220px before the corrective
   scroll snapped it back. Consumed exactly once, cleared even if it throws. */
let PENDING_HOLD:any=null
/* true only while a drop's pulse set may still hold live entries — so the
   ordinary repaint (no drop in the last seconds) does not touch it */
const NEWFLAGS_LIVE=()=>NEWFLAGS.size>0
/* ONE overwrite slot, not a queue — a second queueHold() before the drain
   silently replaces the first, whose callback is simply lost. Two unrelated
   features already share it (holdPuckStill's scroll correction, the stores
   popup's place()); nothing reachable today calls it twice in the same task,
   but that stops being true the moment a third consumer shows up, so treat
   any new use as a review question, not a given. */
export function queueHold(fn:()=>void){PENDING_HOLD=fn}
export function warnWeekId(){return CURPAGE==='editsched'?'eWeek':'vWeek';}
/* The board is showing the warning's own day, so the pucks the focus names are
   on screen there and the week behind the overlay is not worth scrolling.
   Gate on SBDAY, not on finding #schedBoard: the element is always mounted
   (SchedBoard.tsx uses hidden={!open}), so querying for it would say "open"
   with the board shut. */
export function warnOnBoard(){return SBDAY!=null&&!!WFOCUS&&WFOCUS.di===SBDAY;}
export function refreshHighlights(){
  const wf=warnFocusMap();
  const hlActive=HLSET.size>0||!!SEARCH;
  const selActive=!!SELID;
  const focusActive=hlActive||selActive;   // when anything is focused, dim everything else so the highlight pops
  /* Measured and left alone (6 Sep 26, the drop round): a "quiet path" for
     the no-focus case — strip classes with one `.puck.me,.puck.sel,…` query
     and re-mark the view-as pucks with an attribute query instead of walking
     every puck — came out SLOWER (23 ms vs 11 ms at 4×): a seven-selector
     list is matched against all ~17k elements of the page, while this loop
     visits only the ~660 pucks. The loop stays. */
  document.querySelectorAll('.puck[data-person]').forEach((el:any)=>{
    const id=el.dataset.person, p=PEOPLE[id];
    el.classList.remove('me','sel','hl','dim','wfoc','advf','echo','flagnew');
    if(!p)return;
    /* THE DROP-DELTA PULSE (state/dropflag.ts, 5 Sep 26): a puck a drop has
       just flagged blinks on its own day for a moment — the day the rule
       crossed, which is often not the day dropped on. Hung here, after the
       repaint, because the breach day's block is fresh nodes after the
       per-block swap. Week pucks read their day off .day[data-day]; the
       board renders one day, SBDAY. Palettes and previews never pulse. */
    if(NEWFLAGS_LIVE()){
      const onB=el.closest('.sb-boardwrap')&&!el.closest('.pv-frozen');
      const d=onB?SBDAY:(()=>{const x=el.closest('.day[data-day]');return x?+x.dataset.day:null;})();
      if(d!=null&&isNewFlag(d,id))el.classList.add('flagnew');
    }
    /* Warning focus governs the week scroller and — since the board's issue list
       became clickable — the board's own schedule panels. It must NOT govern the
       roster palettes: a palette puck is a drag source for a day you may not even
       be looking at, so dimming it would fight the arm-and-plant flow. Nor a
       version preview: .pv-frozen is a published snapshot and WARN is live, so
       decorating it would put today's conflicts on last week's paper. */
    const onBoard=wf&&warnOnBoard()&&el.closest('.sb-boardwrap')&&!el.closest('.pv-frozen');
    if(wf&&(el.closest('.week')||onBoard)){
      /* the board renders one day, so there is no .day[data-day] to read and no
         echo to paint — warnOnBoard() has already established it is WFOCUS's day */
      const g=onBoard?wf.map.get(WFOCUS.di):(()=>{const d=el.closest('.day[data-day]');return d?wf.map.get(+d.dataset.day):null;})();
      if(g&&g.ids.has(id)){el.classList.add('wfoc'); if(g.sev!=='hard')el.classList.add('advf');}
      /* same aircrew, a different day — dashed, so you can trace what fed into it */
      else if(!onBoard&&wf.echo&&wf.echo.has(id)){el.classList.add('wfoc','echo'); if(wf.sev!=='hard')el.classList.add('advf');}
      /* dim the rest on the board too — it is denser than the week, and finding
         the puck is the whole point of having clicked the warning */
      else el.classList.add('dim');
      return;
    }
    const matchHL=hlActive&&personMatchesHL(p);
    /* blue paints on EVERY puck of the clicked person — you want to see
       everywhere that name is planted (owner, Aug 26) */
    const isSel=selActive&&id===SELID;
    if(matchHL)el.classList.add('hl');
    if(isSel)el.classList.add('sel');
    /* the "you" indicator is passive: it yields the moment the scheduler is
       actively focusing something (a puck click or a highlight chip), so
       selecting another puck dims your own view-as puck like the rest of the
       board instead of leaving it lit (owner, Aug 26). Idle, it still marks
       your puck, and the legend "you" swatch stays meaningful. */
    if(id===ME&&!focusActive)el.classList.add('me');
    const isFocus=matchHL||isSel;
    if(focusActive&&!isFocus)el.classList.add('dim');
  });
  paintArm();      // every render rebuilds the slots, so the ring is re-hung here
  paintSelRings(); // after paintArm, so an armed element can keep its own ring
  paintFreshAdds();// the ~6s blue box on a just-added row / line / wave / block
  /* the queued hold, after the classes so it measures the final layout */
  if(PENDING_HOLD){const f=PENDING_HOLD; PENDING_HOLD=null; try{f()}catch(_){}}
}
export function paintArm(){
  document.querySelectorAll('.armed').forEach((el:any)=>el.classList.remove('armed'));
  /* mirror "a puck is armed for placement" onto <body>, so the board's "+ add"
     drop strips open for a TAP placement the way body.dnd opens them for a drag
     (owner, 26 Aug 26 — a full row must take a new puck, not swap a seated one).
     Board-scoped in CSS; the week's strip is always present so this is a no-op
     there. */
  document.body.classList.toggle('arming', !!ARM);
  if(!ARM)return;
  document.querySelectorAll('[data-slot],[data-fill]').forEach((el:any)=>{
    if((el.dataset.slot||el.dataset.fill)===ARM.key)el.classList.add('armed');});
  /* the Unavailable-row reassign target (ARM.key 'iu:<iid>') is not a
     data-slot/data-fill key at all — see engine/keys.ts/reassignInput — so it
     gets its own pass rather than folding it into the loop above, which reads
     ARM.key for a grammar this attribute was never meant to speak. The SAME
     iid renders on every day a multi-day filing covers, so all of them ring
     together — there is no single "its" day to prefer. */
  document.querySelectorAll('[data-inpseat]').forEach((el:any)=>{
    if('iu:'+el.dataset.inpseat===ARM.key)el.classList.add('armed');});
}
/* THE JUST-ADDED BLUE BOX (owner, 14 Aug 26 — "everytime I add a new row block
   or wave there will be a blue box around the new thing for around 6 seconds").
   Hung post-render like paintArm rather than baked into the string: SchedBoard
   diffs each panel to decide whether to re-hang it, so a class put in the
   markup would force a re-hang on every keystroke AND an unrelated edit would
   drop it — this survives both, because view.ts keeps the key and this pass
   re-applies the class after any repaint. A STATIC box-shadow, never an
   animation: this clears and re-adds .sb-fresh on every refreshHighlights, so
   an animated one would replay and flicker on each unrelated repaint.
   Board only, and the boardwrap excludes the palette and a frozen preview
   (which is read-only and carries no add anyway). FRESHADD holds the exact
   funnel keys markStructuralAdd recorded — a row/line/note field's data-bfld,
   climbed to its row container; a wave has no data-bfld on the board, so its
   header <select data-wsel> stands in and the whole .sb-go boxes. The outer
   box (the wave) wins over any inner one (its own first line) so a wave never
   draws a second box inside itself. */
export function paintFreshAdds(){
  /* A decoration pass with no page is a no-op. flashAdded (view.ts) arms two
     6-second timers per add, and under vitest a file can finish — and its
     jsdom be torn down — before they fire: CI run 899 (6 Sep 26) went red on
     `ReferenceError: document is not defined` thrown here from a timer
     inputedit.test.tsx had left behind, with every test green. Production
     always has a document; only a dead test environment does not. */
  if(typeof document==='undefined')return;
  document.querySelectorAll('.sb-fresh,.sb-fresh-out').forEach((el:any)=>el.classList.remove('sb-fresh','sb-fresh-out'));
  if(!FRESHADD.size)return;
  const wrap=document.querySelector('#schedBoard .sb-boardwrap:not(.pv-frozen)');
  if(!wrap)return;
  /* element -> the fresh key that boxed it, so the fade phase (FRESHOUT) can be
     read off the same key; all keys of one add share timing, so a target is
     never half-steady half-fading */
  const targets=new Map<any,any>();
  FRESHADD.forEach((k:any)=>{ if(String(k).slice(0,3)==='wl:'){
    const h=wrap.querySelector(`[data-wsel="${String(k).slice(3)}"]`);
    const go=h&&h.closest('.sb-go'); if(go&&!targets.has(go))targets.set(go,k); } });
  wrap.querySelectorAll('[data-bfld]').forEach((el:any)=>{
    const k=el.dataset.bfld; if(!FRESHADD.has(k))return;
    const box=el.closest('.sb-line,.sb-arow,.sb-nrow,.sb-psub'); if(box&&!targets.has(box))targets.set(box,k);
  });
  const list=[...targets.keys()];
  list.forEach((el:any)=>{
    if(list.some((o:any)=>o!==el&&o.contains(el)))return;
    const fading=FRESHOUT.has(targets.get(el));
    const put=(x:any)=>{ x.classList.add('sb-fresh'); if(fading)x.classList.add('sb-fresh-out'); };
    put(el);
    /* a duty + Block records only its header key (dl:) — its template rows are
       loose .sb-arow SIBLINGS, not children, and are not separately tracked —
       so box them too, up to the next block, so the whole new block reads as
       one. Only .sb-psub reaches here (nothing else maps to it), so this never
       widens a plain row's box. */
    if(el.classList.contains('sb-psub'))
      for(let s=el.nextElementSibling;s&&!s.classList.contains('sb-psub');s=s.nextElementSibling)
        if(s.classList.contains('sb-arow'))put(s);
  });
}
/* WHERE CAN THE SELECTED MAN GO (owner, 13 Aug 26). The blue click also rings
   every slot he could take: bright green on an empty slot, dimmed green with a
   soft tint where he would take over from the man in it, nothing where he
   cannot go — so availability reads BEFORE any tap, which is the owner's
   standing rule. GREEN IS ELIGIBILITY, NEVER A SEVERITY: red/amber/grey stay
   the warning tiers, the armed ring stays the only dashed one, and an armed
   element keeps its own ring untouched. The judge is slotBar itself — the same
   oracle the palette and the drop warning read, so the three cannot drift.
   Edit mode only; never for a placeholder (nothing bars a placeholder, so
   every slot would light and the paint would mean nothing). Answers are
   memoised against the selection and WARN's identity: every schedule mutation
   funnels through validate(), which reassigns WARN, so the cache invalidates
   exactly when an answer could change and an ordinary repaint pays only for
   hanging classes. */
let SELRINGS:any=null
export function paintSelRings(){
  document.querySelectorAll('.oktake,.oktake-f').forEach((el:any)=>el.classList.remove('oktake','oktake-f'));
  const id=SELID;
  if(!id||!HOOKS.editMode()||isSpecial(id))return;
  if(!SELRINGS||SELRINGS.id!==id||SELRINGS.warn!==WARN)SELRINGS={id,warn:WARN,map:new Map()};
  document.querySelectorAll('[data-slot],[data-fill]').forEach((el:any)=>{
    if(el.classList.contains('armed'))return;
    const raw=el.dataset.slot||el.dataset.fill; if(!raw)return;
    let why=SELRINGS.map.get(raw);
    if(why===undefined){try{why=slotBar(id,raw)}catch(_){why='?'} SELRINGS.map.set(raw,why);}
    if(why)return;
    /* an append target is by nature an empty spot; a data-slot may hold the
       man himself (noise — skip) or someone he could take over from.
       Guarded: a repaint can hold DOM a beat staler than the model (a row
       just deleted), and slotVal — unlike slotRules — throws on a key whose
       row is gone. A stale element gets no ring rather than a crash. */
    let occ='';
    if(el.dataset.slot){try{occ=slotVal(String(raw).replace(/\.\+$/,''))}catch(_){return}}
    if(occ===id)return;
    el.classList.add(occ?'oktake-f':'oktake');
  });
}
/* The element carrying the warning's anchor key — the seat (or append cell) of
   the LINE that caused the flag. Segment-safe prefix match: a full key matches
   itself, a row/aircraft prefix matches only through a following '.', so
   's:0.oft.1' can never claim 's:0.oft.12.p'. Preview markup emits no
   data-slot (slotCell/lSeat drop it under PV), so an anchor never resolves
   into a frozen version — exactly the fallback we want there. */
export function anchorEl(root:any,key:any){
  if(!key)return null
  for(const el of root.querySelectorAll('[data-slot],[data-fill]')){
    const k=(el as any).dataset.slot||(el as any).dataset.fill
    if(k===key||(k&&k.indexOf(key+'.')===0))return el as any
  }
  return null
}
/* Which puck to land on. Since warnings carry the causing line's slot-key,
   the anchor wins when it resolves: land on the flagged person's puck INSIDE
   that line (so "no time for the flight brief" pans to the flight line, not
   the sim row that ate the brief), or on the row itself when the name is only
   free text there. Everything below the anchor branch is the old heuristic,
   kept verbatim as the fallback — a stale key after an edit, or a surface not
   rendering that section, must behave exactly as before.
   One id is the old rule: the first puck of the first id, in document order.
   Two or more is the crew-combination family (ILLEGAL_CREW, CREW_SOLO,
   CO_APPROVAL, NO_IR) where `who` is the pilot AND the WSO of ONE aircraft —
   there the row holding both is the place the scheduler actually has to look,
   so prefer the candidate whose nearest ancestor containing two of the named
   people is the shallowest. That finds .acrow on the week and .sb-line on the
   board without naming either: hard-coding the row classes would mean six
   selectors across two surfaces and a list that rots the next time a section
   is added. */
function warnTarget(root:any,ids:any[],key?:any){
  const a=anchorEl(root,key)
  if(a){
    /* the seat's row: .acrow / .pl-row / .ah-row on the week, .sb-line /
       .sb-arow on the board — the anchor element itself when the key sits
       outside any of them */
    const row=a.closest('.acrow,.pl-row,.ah-row,.sb-line,.sb-arow')||a
    const pk=[...row.querySelectorAll('.puck[data-person]')]
      .find((el:any)=>ids.includes(el.dataset.person))
    return pk||row
  }
  /* ONE query, so the candidates come back in document order — looping the ids
     instead would order by `who` and silently break the tie-break below.
     The Available-crew block is excluded outright: it is a derived list of who
     is FREE that hour, so no warning ever comes from it, and being a flat grid
     it would out-score a puck nested in a flying line under any depth rule
     (it renders on the edit week only, which is where this was reported). */
  const cand=[...root.querySelectorAll('.puck[data-person]')]
    .filter((el:any)=>ids.includes(el.dataset.person)&&!el.closest('.availpuck'));
  /* One named person cannot have a "row holding two of them", so there is
     nothing to weigh: take the first, which is the old behaviour. Testing the
     CANDIDATE count here instead of the NAME count was the bug — a lone name
     on screen twice fell into the loop below, never satisfied it, and every
     candidate scored full depth-to-root, handing the win to the shallowest
     nesting rather than the right seat. */
  if(ids.length<2||cand.length<2)return cand[0]||null;
  let best=null, bestD=Infinity;
  for(const el of cand){
    let d=0;
    for(let a=el.parentElement; a&&a!==root.parentElement; a=a.parentElement){
      d++;
      const seen=new Set([...a.querySelectorAll('.puck[data-person]')]
        .map((x:any)=>x.dataset.person).filter((p:any)=>ids.includes(p)));
      /* only a REAL co-location scores; strict < leaves document order to
         break ties */
      if(seen.size>=2){if(d<bestD){bestD=d; best=el;} break;}
    }
  }
  /* nobody shares a row — the crew are spread across the day, so fall back to
     document order rather than to whichever puck happens to sit shallowest */
  return best||cand[0];
}
export function scrollToWarnFocus(){
  if(!WFOCUS)return;
  const onBoard=warnOnBoard();
  /* A PAN OVERRIDE: land somewhere other than the focused warning's own day.
     Set only by the cross-day crew-rest row (interactions.ts), which is filed
     against tomorrow's breach but is READ on the day that caused it — the
     scheduler clicked it to be shown the late line here, not the flagged one
     there. Off-board only: that row is built by html.ts and the board never
     draws it, so an override cannot arise there, and today's behaviour is the
     honest fallback if one somehow survives into a board context.
     A panKey gone stale under an edit resolves nothing in anchorEl and falls
     back to his first puck on this day — still the right day, which is more
     than the un-overridden path would manage. */
  const pan=!onBoard&&WFOCUS.panDi!=null;
  const pdi=pan?WFOCUS.panDi:WFOCUS.di, pkey=pan?WFOCUS.panKey:WFOCUS.key;
  const root:any=onBoard
    ? document.querySelector('#schedBoard .sb-boardwrap')
    /* NOT #schedBoard: it also holds #sbRoster, whose palette pucks are real
       .puck[data-person] built for paletteDay() — a name flagged today but not
       planted today would resolve there and scroll the roster instead */
    : document.querySelector('#'+warnWeekId()+' .day[data-day="'+pdi+'"]');
  if(!root)return;
  const tgt=warnTarget(root,WFOCUS.ids,pkey)||root;
  /* The week is snap-scrolled (.week{scroll-snap-type:x mandatory} with
     .day{scroll-snap-align:start}), and inline:'center' asks to rest at a
     position that is NOT a snap point — the browser re-snaps afterwards to
     whichever day start is nearest, which on a 620px day box can leave you a
     whole day past the one you clicked. So place the day by hand first, onto
     its snap point, instantly; then scrollIntoView only has the vertical left
     to do and inline:'nearest' keeps it from fighting the snap back. */
  if(!onBoard){
    const week:any=document.getElementById(warnWeekId());
    /* HOLD THE LATERAL VIEW (owner, 6 Aug 26). The pan above used to run on
       every click, so a warning on the day you were already reading — sitting
       comfortably mid-screen — snapped that day hard to the left edge and
       threw the rest of your week off the side. Nothing was gained: the puck
       was already in front of you. So the horizontal moves only when the
       destination is genuinely not on screen; when it is, scrollLeft is not
       touched at all and the jump is purely vertical.
       Measured on the PUCK, not its day: half a day box can hang past the
       right edge with the target still perfectly readable, and panning then
       would be the same unasked-for lurch in a smaller size.
       A zero-width week means nothing is measurable — jsdom has no layout —
       and the honest reading of "I cannot tell" is the old unconditional pan,
       so the behaviour under test stays the behaviour that shipped. */
    if(week){
      const wr=week.getBoundingClientRect(), tr=tgt.getBoundingClientRect();
      const inView=wr.width>0&&tr.left>=wr.left-1&&tr.right<=wr.right+1;
      if(!inView){
        /* rect delta, not offsetLeft: .week is position:static, so a day's
           offsetParent is not the scroller */
        hsSet(week,week.scrollLeft+root.getBoundingClientRect().left-wr.left);
        hsSync();   // the bar geometry, now that the horizontal is final
      }
    }
  }
  try{tgt.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});}
  catch(_){try{tgt.scrollIntoView();}catch(__){}}
}

/* the fresh-add box's own lifecycle repaint (view.ts flashAdded: the fade,
   then the removal) is this decoration pass alone — wired here the way pan.ts
   wires weekSwapped, and never a notify() (5 Sep 26; hooks.ts has the why) */
HOOKS.paintFreshAdds = paintFreshAdds
