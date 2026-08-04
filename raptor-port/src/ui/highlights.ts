/* The highlight pass and warning-focus scroll — DOM code, verbatim from
   the reference. Runs after every week render; the markup it decorates is
   the verbatim dayHTML output, so the selectors line up exactly. */
import { PEOPLE } from '../engine/people'
import { HLSET, SEARCH, SELID, SELKEY, WFOCUS, ARM, warnFocusMap, personMatchesHL, CURPAGE } from '../state/view'
import { ME } from '../state/auth'

/* the proxy-scrollbar mirror arrives with the week-pan surface */
const hsSync:any=undefined
export function warnWeekId(){return CURPAGE==='editsched'?'eWeek':'vWeek';}
export function refreshHighlights(){
  const wf=warnFocusMap();
  const hlActive=HLSET.size>0||!!SEARCH;
  const selActive=!!SELID;
  const focusActive=hlActive||selActive;   // when anything is focused, dim everything else so the highlight pops
  document.querySelectorAll('.puck[data-person]').forEach((el:any)=>{
    const id=el.dataset.person, p=PEOPLE[id];
    el.classList.remove('me','sel','hl','dim','wfoc','advf','echo');
    if(!p)return;
    /* warning focus only governs pucks inside the week scroller — the scheduler
       board and roster palettes keep their normal look */
    if(wf&&el.closest('.week')){
      const dayEl=el.closest('.day[data-day]');
      const g=dayEl?wf.map.get(+dayEl.dataset.day):null;
      if(g&&g.ids.has(id)){el.classList.add('wfoc'); if(g.sev!=='hard')el.classList.add('advf');}
      /* same aircrew, a different day — dashed, so you can trace what fed into it */
      else if(wf.echo&&wf.echo.has(id)){el.classList.add('wfoc','echo'); if(wf.sev!=='hard')el.classList.add('advf');}
      else el.classList.add('dim');
      return;
    }
    const matchHL=hlActive&&personMatchesHL(p);
    /* blue paints on the ONE clicked puck: match its slot key when we have one
       (the normal case), falling back to name-wide only for a keyless puck.
       selActive still keys off SELID, so every OTHER puck — including this
       person's other copies — dims, which is what makes the one pop. */
    const cell=el.closest('[data-slot],[data-fill]');
    const elKey=cell?(cell.dataset.slot||cell.dataset.fill):null;
    const isSel=selActive&&(SELKEY!=null?elKey===SELKEY:id===SELID);
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
export function scrollToWarnFocus(){
  if(!WFOCUS)return;
  const day=document.querySelector('#'+warnWeekId()+' .day[data-day="'+WFOCUS.di+'"]');
  if(!day)return;
  let el:any=null;
  for(const id of WFOCUS.ids){el=day.querySelector('.puck[data-person="'+id+'"]'); if(el)break;}
  const tgt=el||day;
  try{tgt.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});}
  catch(_){try{tgt.scrollIntoView();}catch(__){}}
  if(typeof hsSync==='function')setTimeout(hsSync,320);
}
