/* The highlight pass and warning-focus scroll — DOM code, verbatim from
   the reference. Runs after every week render; the markup it decorates is
   the verbatim dayHTML output, so the selectors line up exactly. */
import { PEOPLE } from '../engine/people'
import { HLSET, SEARCH, SELID, WFOCUS, ARM, warnFocusMap, personMatchesHL, CURPAGE, SBDAY } from '../state/view'
import { ME } from '../state/auth'
import { hsSet, hsSync } from './pan'

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
  document.querySelectorAll('.puck[data-person]').forEach((el:any)=>{
    const id=el.dataset.person, p=PEOPLE[id];
    el.classList.remove('me','sel','hl','dim','wfoc','advf','echo');
    if(!p)return;
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
}
export function paintArm(){
  document.querySelectorAll('.armed').forEach((el:any)=>el.classList.remove('armed'));
  if(!ARM)return;
  document.querySelectorAll('[data-slot],[data-fill]').forEach((el:any)=>{
    if((el.dataset.slot||el.dataset.fill)===ARM.key)el.classList.add('armed');});
}
/* Which puck to land on, given a warning names PEOPLE and never a seat.
   One id is the old rule: the first puck of the first id, in document order.
   Two or more is the crew-combination family (ILLEGAL_CREW, CREW_SOLO,
   CO_APPROVAL, NO_IR) where `who` is the pilot AND the WSO of ONE aircraft —
   there the row holding both is the place the scheduler actually has to look,
   so prefer the candidate whose nearest ancestor containing two of the named
   people is the shallowest. That finds .acrow on the week and .sb-line on the
   board without naming either: hard-coding the row classes would mean six
   selectors across two surfaces and a list that rots the next time a section
   is added. */
function warnTarget(root:any,ids:any[]){
  /* ONE query, so the candidates come back in document order — looping the ids
     instead would order by `who` and silently break the tie-break below */
  const cand=[...root.querySelectorAll('.puck[data-person]')]
    .filter((el:any)=>ids.includes(el.dataset.person));
  if(cand.length<2)return cand[0]||null;
  let best=cand[0], bestD=Infinity;
  for(const el of cand){
    let d=0;
    for(let a=el.parentElement; a&&a!==root.parentElement; a=a.parentElement){
      d++;
      const seen=new Set([...a.querySelectorAll('.puck[data-person]')]
        .map((x:any)=>x.dataset.person).filter((p:any)=>ids.includes(p)));
      if(seen.size>=2)break;
    }
    if(d<bestD){bestD=d; best=el;}   // strict <, so document order breaks ties
  }
  return best;
}
export function scrollToWarnFocus(){
  if(!WFOCUS)return;
  const onBoard=warnOnBoard();
  const root:any=onBoard
    ? document.querySelector('#schedBoard .sb-boardwrap')
    /* NOT #schedBoard: it also holds #sbRoster, whose palette pucks are real
       .puck[data-person] built for paletteDay() — a name flagged today but not
       planted today would resolve there and scroll the roster instead */
    : document.querySelector('#'+warnWeekId()+' .day[data-day="'+WFOCUS.di+'"]');
  if(!root)return;
  const tgt=warnTarget(root,WFOCUS.ids)||root;
  /* The week is snap-scrolled (.week{scroll-snap-type:x mandatory} with
     .day{scroll-snap-align:start}), and inline:'center' asks to rest at a
     position that is NOT a snap point — the browser re-snaps afterwards to
     whichever day start is nearest, which on a 620px day box can leave you a
     whole day past the one you clicked. So place the day by hand first, onto
     its snap point, instantly; then scrollIntoView only has the vertical left
     to do and inline:'nearest' keeps it from fighting the snap back. */
  if(!onBoard){
    const week:any=document.getElementById(warnWeekId());
    if(week){
      /* rect delta, not offsetLeft: .week is position:static, so a day's
         offsetParent is not the scroller */
      hsSet(week,week.scrollLeft+root.getBoundingClientRect().left-week.getBoundingClientRect().left);
      hsSync();   // the bar geometry, now that the horizontal is final
    }
  }
  try{tgt.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});}
  catch(_){try{tgt.scrollIntoView();}catch(__){}}
}
