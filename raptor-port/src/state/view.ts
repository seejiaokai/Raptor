import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { keyDay } from '../engine/keys'
import { slotVal, setSlotVal, fillSlot, armTargetExists } from '../engine/slots'
import { slotBar, personCount } from '../engine/avail'
import { validate } from '../engine/validate'
import { markEdit } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { canEditSched } from './auth'

/* the repaint/gesture call sites inside these verbatim bodies route through
   the hooks — no-ops headless, mapped to the store's notify() when wired */
const toast=(...a:any[])=>HOOKS.toast(...a)
const paintArm=()=>HOOKS.paintArm()
const renderRosters=()=>HOOKS.renderRosters()
const renderScheduler=()=>HOOKS.renderScheduler()
const renderEditWeek=()=>HOOKS.renderEditWeek()
const renderSchedule=(_t?:any,_e?:any)=>HOOKS.renderSchedule()
const isPhone=()=>HOOKS.isPhone()

/* board / page state the reference keeps as globals; the two render gates in
   afterSchedMutate read them. setBoardDay carries the reference's day-tab
   rule: changing the board day disarms a slot armed on another day. */
export let SBDAY:any=null
export let CURPAGE:any='viewsched'
export function setBoardDay(n:any){ if(ARM&&ARM.di!==n)disarmSlot(); SBDAY=n }
export function setPage(p:any){ CURPAGE=p }
/* ARM put-down for history.ts (ESM cannot reassign across modules) */
export function armDrop(){ ARM=null }
/* the phase-3 model half of a puck click: toggle the selection and remember
   the person's count so afterSchedMutate can drop a stale selection. The
   full click behaviour (highlights, warning boxes) is phase-4 UI. */
export function selectPerson(id:any){
  const off=(SELID===id)
  if(off){selRestore();return}
  selKeep(); SELID=id; SELSEEN=personCount(id)
}
export function esc(s:any){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
export let SELID:any=null;                 // clicked person (blue)
/* What was on screen before the current selection, so a second click on the
   same puck reverses the first rather than clearing everything. */
export let SELPREV:any=null;
/* How many places that person occupied when they were selected. If a delete
   takes one away the selection is dropped for everybody — you cannot go on
   pointing at a puck that is no longer there. */
export let SELSEEN=0;
export function selKeep(){
  if(SELID)return;               // already inside a selection — keep the ORIGINAL
  SELPREV={wfocus:WFOCUS,dwopen:[...DWOPEN],pfocus:PFOCUS};
}
export function selRestore(){
  SELID=null; SELSEEN=0;
  const p=SELPREV; SELPREV=null;
  WFOCUS=p?p.wfocus:null; PFOCUS=p?p.pfocus:null;
  DWOPEN.clear(); if(p&&p.dwopen)p.dwopen.forEach((di:any)=>DWOPEN.add(di));
}
/* the person selection only — a warning focus set by the caller must survive,
   which is why clearOtherHL uses this and not selDrop */
export function selClear(){ SELID=null; SELSEEN=0; SELPREV=null; PFOCUS=null; }
/* everything: the person, the warning focus and every open day box */
export function selDrop(){ selClear(); WFOCUS=null; DWOPEN.clear(); }
export const HLSET=new Set();          // active highlight chips
export let SEARCH='';                  // search term (applies to active page)
/* inline warnings: which day boxes are expanded, and which single warning (if any)
   the view is focused on. WFOCUS wins over every other highlight so the puck that
   caused the error is the only thing lit. */
export const DWOPEN=new Set();         // day indices whose issue box is expanded
export let WFOCUS:any=null;                // {di,ix,ids:[…],sev}
/* B14: clicking a puck opens that person's issues wherever in the week they
   fall, so a Tuesday crew-rest breach caused by a Monday night wave shows up
   on both days at once. PFOCUS is the clicked person, not a warning. */
export let PFOCUS:any=null;                // {id, days:[…]}
export let ARM:any=null;                                   // {key, di, title} or null
export function armedKey(){return ARM?ARM.key:'';}
export function armSlot(key:any,el?:any){
  if(!canEditSched())return;
  const base=String(key).replace(/\.\+$/,'');
  if(ARM&&ARM.key===key){disarmSlot();return;}   // tapping it again puts it down
  ARM={key,di:keyDay(base),title:slotTitle(base)};
  paintArm(); renderRosters();
  if(el&&el.scrollIntoView)try{el.scrollIntoView({block:'nearest',inline:'nearest'});}catch(_){}
  if(isPhone())document.body.classList.add('ros-open');   // the palette IS the picker
}
export function disarmSlot(){ if(!ARM)return; ARM=null; paintArm(); renderRosters(); }
/* place a name from the palette into whatever is armed */
export function placeArmed(id:any){
  if(!ARM||!id)return false;
  const why=slotBar(id,String(ARM.key).replace(/\.\+$/,''));
  if(why){toast(`${PEOPLE[id].cs} — ${why}`,'warn');return false;}   // darkened names do not plant
  const key=ARM.key;
  if(/\.\+$/.test(key))fillSlot(key,id); else setSlotVal(key,id);
  armDrop();
  afterSchedMutate(); paintArm();
  toast(`${PEOPLE[id].cs} planned`);
  return true;
}
/* what a slot is called, for the picker's title */
export function slotTitle(key:any){
  const k=String(key);
  if(k.indexOf(':')<0){const a=k.split('.');
    const f=(((DAYS[+a[0]]||{}).waves||[])[+a[1]]||{formations:[]}).formations[+a[2]]||{};
    return `${a[4]==='p'?'FCP':'RCP'} · <span class="mono" style="color:var(--ink-3)">${esc(f.cs||'')} ${esc(f.msn||'')}</span>`;}
  const p=k.slice(0,k.indexOf(':')), a=k.slice(k.indexOf(':')+1).split('.');
  const d=DAYS[+a[0]]||{};
  try{
    if(p==='d')return `Duty · <span class="mono" style="color:var(--ink-3)">${esc(d.dutywaves[+a[1]].rows[+a[2]].role)}</span>`;
    if(p==='g')return `Ground · <span class="mono" style="color:var(--ink-3)">${esc(d.ground[+a[1]].prog)}</span>`;
    if(p==='a')return `Programme · <span class="mono" style="color:var(--ink-3)">${esc(d.allhands[+a[1]].prog)}</span>`;
    if(p==='s')return `Sim · <span class="mono" style="color:var(--ink-3)">${esc(String(a[1]).toUpperCase())} ${esc(d.sims[a[1]][+a[2]].label||'')}</span>`;
  }catch(_){}
  return 'Assign crew';
}
export function afterSchedMutate(){
  markEdit();
  /* Delete a puck while its person is selected and the selection goes with it —
     for every day, not just the one you deleted from. Counting rather than
     watching each delete path catches all of them: clearing a slot, right-click,
     dragging to the bin, removing a line, removing a whole wave. */
  if(SELID){ const n=personCount(SELID); if(n<SELSEEN)selDrop(); else SELSEEN=n; }
  /* AND the same for an ARMED SLOT. Deleting the line, formation or wave a slot
     is armed on used to leave ARM pointing into thin air: the next palette tap
     threw out of flyRef and planted nobody, and — worse — when the index was
     since taken by a DIFFERENT row it planted the name there silently, with a
     success toast and the amendment mark on the wrong key. histApply and the
     board's day tabs already disarm for exactly this reason. */
  if(ARM&&!armTargetExists(ARM.key))disarmSlot();
  validate();
  if(SBDAY!=null)renderScheduler();
  if(CURPAGE==='editsched')renderEditWeek();
  if(CURPAGE==='viewsched')renderSchedule('vWeek',false);
}
