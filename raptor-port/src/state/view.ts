import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { keyDay } from '../engine/keys'
import { slotVal, setSlotVal, fillSlot, armTargetExists } from '../engine/slots'
import { popReorderedDay } from '../engine/reorder'
import { slotBar, personCount, personWarnDays } from '../engine/avail'
import { validate, WARN } from '../engine/validate'
import { markEdit, daySnapOf } from '../engine/publish'
import { isLead, isInstr, isOcu } from '../engine/people'
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
/* the Edit-mode switch (the reference's #editToggle, on by default) and the
   day the palette is looking at */
export let EDITON:any=true
export function setEditOn(v:any){ EDITON=!!v }
export let ROSDAY:any=0
export function setRosDay(n:any){ ROSDAY=n }
export function setBoardDay(n:any){
  if(ARM&&ARM.di!==n)disarmSlot();
  /* the day-tab switch disarms a slot armed on another day (above) but used to
     leave WFOCUS pointed at the day just left — warnOnBoard() (WFOCUS.di===
     SBDAY) then goes false and highlights.ts stops lighting anything, so the
     lit pucks and selected issue row silently vanish while the app still
     holds a focus the user can neither see nor clear from the board. Clear it
     only when the board was ALREADY open (SBDAY!=null — the null->n open path
     must not touch it, or a week-set focus would drop the moment the board
     opens on some other day), the day is REALLY changing (n!==SBDAY), and the
     focus is not for the day being switched TO (WFOCUS.di!==n) — landing on
     the focused warning's own day must keep it lit. */
  if(SBDAY!=null&&n!==SBDAY&&WFOCUS&&WFOCUS.di!==n)WFOCUS=null;
  SBDAY=n;
}
/* The board's full close, shared by setPage (below) and ui/board.ts's
   closeScheduler — one cleanup, two call sites, not two copies of it.
   SBDAY null (setBoardDay already disarms ARM as part of that, since
   ARM.di is never null so `ARM.di!==n` is true the moment n is null) and
   the aircrew drawer parked (`ros-open`, a body class the phone board sets
   — reviewer found it survives a page change otherwise, so a scheduler
   landing back on Edit Schedule at phone width found the drawer already
   out). state/ has no business importing ui/board.ts (the layering CLAUDE.md
   describes — state is read by the engine and by ui, never the reverse),
   so this lives here instead and board.ts's closeScheduler calls it.
   HOOKS.closeBoardDialogs() (reviewer-found follow-up, 9 Aug 26): the
   board's own CX-with-a-reason box and Sort all's confirm dialog are
   module state in ui/board.ts (CXT/SORTALL), and neither was cleared by
   this close — a page change with one of those open left it painting over
   the next page, with cxCommit carrying no guard of its own to stop a
   confirm from writing to the live model underneath. Same doorway-out
   pattern as every other engine/state -> app callback (HOOKS.editMode,
   HOOKS.renderScheduler, …), because a circular import straight to
   ui/board.ts is exactly the layering violation this function's own
   SBDAY/ros-open comment above already declined. */
export function closeBoardState(){
  setBoardDay(null);
  if(typeof document!=='undefined')document.body.classList.remove('ros-open');
  HOOKS.closeBoardDialogs();
}
export function setPage(p:any){
  /* A page change closes any body-level popup (owner, 8 Aug 26 — the stores
     box used to ride along to View-only Sched, floating over a page with no C
     button on it). These popups live outside the React tree, so no component
     unmount will ever take them down — and the stores box holds a document
     click listener only it knows how to unhook (its _offClick — see
     interactions.ts's openStoresMenu), so removal MUST go through that or it
     leaks. Same-page set: nothing to do, and resetSession's setPage on a
     login that lands where it already was must not reach into the DOM. The
     typeof guard: resetSession routes every login/logout through here, and
     the headless state tests run with no document at all. */
  if(p!==CURPAGE&&typeof document!=='undefined')document.querySelectorAll('.stmenu, .wavemenu').forEach(x=>{
    const off=(x as any)._offClick;
    if(off)document.removeEventListener('click',off);
    x.remove();
  });
  /* CLOSE THE BOARD OUTRIGHT the moment the page stops being Edit Schedule —
     found live by a reviewer (9 Aug 26): SchedBoard.tsx's render gate
     (CURPAGE==='editsched') hides the PAINT, but this codebase deliberately
     left SBDAY itself untouched so a return to Edit Schedule would resume
     the board — and Shell.tsx's context-menu clear-a-seat handler carries
     `HOOKS.editMode() || SBDAY != null`, an escape hatch that exists ONLY
     because the board used to legitimately paint over whatever page you
     were on and so was assumed safe to trust on its own. Once the render
     stopped painting it but SBDAY kept living, that assumption broke: on
     View-only Sched with a board left open, editMode() reads false (wrong
     page) but the escape hatch still read SBDAY!=null as "trust it anyway"
     — so a real right-click on a WEEK puck (not the board's own, the one
     now VISIBLE underneath) cleared it. Scoped to leaving 'editsched'
     specifically (not every same-page no-op set, and not landing ON
     'editsched', which is the resume this codebase chose to keep) —
     p!==CURPAGE is already computed above for the popup cleanup, so this
     reuses it rather than a second comparison. */
  if(p!==CURPAGE&&p!=='editsched'&&SBDAY!=null)closeBoardState();
  CURPAGE=p;
}
/* ARM put-down for history.ts (ESM cannot reassign across modules) */
export function armDrop(){ ARM=null }
export function setWarnFocus(w:any){ WFOCUS=w }
/* the model half of a puck click — the reference's handler body verbatim
   (2527-2549), with pk.closest('.week') passed in as inWeek. */
export function selectPerson(id:any,inWeek?:any){
  /* Clicking a puck lights up EVERY copy of that person (owner, Aug 26): you
     want to see everywhere that name is planted, so selection is name-scoped.
     A second click on the same person clears. */
  const off=(SELID===id);
  if(off){ selRestore(); }
  else {
    selKeep();
    SELID=id;
    WFOCUS=null; DWOPEN.clear(); PFOCUS=null;
    if(inWeek){
      if(!WARN.byDay.length)validate();
      const days=personWarnDays(id);
      if(days.length){ PFOCUS={id,days}; days.forEach((di:any)=>DWOPEN.add(di)); }
    }
    SELSEEN=personCount(id);
  }
}
/* a warning focus owns the highlight, so drop the other selections — the
   reference also blanks the chip classes and search fields here; in React
   both derive from HLSET/SEARCH, so clearing the state IS clearing the UI */
export function clearOtherHL(){
  selClear(); HLSET.clear(); SEARCH='';
}
export function setSearch(v:any){ SEARCH=String(v==null?'':v).trim() }
/* day strip → expand / collapse in place (reference 3992-3994, verbatim) */
export function toggleDayWarn(di:any){
  di=+di;
  if(DWOPEN.has(di)){DWOPEN.delete(di); if(WFOCUS&&WFOCUS.di===di)WFOCUS=null;}
  else {DWOPEN.add(di); WFOCUS=null; clearOtherHL();}
}
/* one warning → focus + snap (reference 3997-4003, verbatim) */
export function focusWarn(di:any,ix:any){
  di=+di; ix=+ix;
  const g=WARN.byDay[di], w=g&&g.warns&&g.warns[ix]; if(!w)return;
  if(WFOCUS&&WFOCUS.di===di&&WFOCUS.ix===ix)WFOCUS=null;
  /* keep PFOCUS across clearOtherHL: picking one of a person's warnings must
     not widen their box back out to the whole day's list */
  else {const keep=PFOCUS, keepSel=keep?SELID:null; clearOtherHL(); PFOCUS=keep; SELID=keepSel;
        /* code/prevDi/leaveBy ride along so the week can trace a crew-rest
           breach back to the day that caused it without re-deriving anything
           the engine already worked out (validate.ts attaches them). */
        WFOCUS={di,ix,ids:(w.who||[]).slice(),sev:w.sev,key:w.key,code:w.code,prevDi:w.prevDi,leaveBy:w.leaveBy};}
}
/* step back one level: drop the warning focus but stay on the person */
export function clearWarnFocus(){ WFOCUS=null }
/* pill buttons: expand every day carrying that severity (reference 3901-3908) */
export function openWarns(sev:any){
  validate();
  DWOPEN.clear(); WFOCUS=null; PFOCUS=null;
  WARN.byDay.forEach((g:any)=>{if(g&&g.warns&&g.warns.length&&(!sev||g.warns.some((w:any)=>w.sev===sev)))DWOPEN.add(g.di);});
  clearOtherHL();
  if(!DWOPEN.size){toast(sev==='hard'?'No warnings this week ✓':'Nothing flagged this week ✓');}
}
export function esc(s:any){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
export let SELID:any=null;                 // clicked person (blue) — every puck of that name lights
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
/* which days are previewing a published version instead of the live model —
   di → 'orig' | AL number. View state, never model state: it survives no
   reload and takes no part in undo. Same in-place-mutation pattern as DWOPEN
   (ESM cannot reassign across modules). */
export const DPREV=new Map()
export function setDayPreview(di:any,ver:any){ if(ver==null||ver==='live')DPREV.delete(+di); else DPREV.set(+di,ver) }
export function dayPreview(di:any){ return DPREV.has(+di)?DPREV.get(+di):null }
/* drop any preview whose snapshot no longer exists — undo across a publish,
   unpublishAL, a week switch: without this the day would render the live model
   while its header claims to show history */
export function prunePreviews(){ for(const [di,ver] of [...DPREV]){ if(!daySnapOf(di,ver))DPREV.delete(di) } }
/* {di,ix,ids:[…],sev,key,code,prevDi,leaveBy} — key = the causing line's
   slot-key, if the warning carries one. The cross-day crew-rest row adds
   panDi/panKey: land on THAT day and THAT line instead, the one case where the
   focused warning and the place the view goes are different days. */
export let WFOCUS:any=null;
/* B14: clicking a puck opens that person's issues wherever in the week they
   fall, so a Tuesday crew-rest breach caused by a Monday night wave shows up
   on both days at once. PFOCUS is the clicked person, not a warning. */
export let PFOCUS:any=null;                // {id, days:[…]}
export function personMatchesHL(p:any){
  for(const f of HLSET){
    if(f==='A'&&p.q==='A')return true;
    if(f==='B'&&p.q==='B')return true;
    if(f==='C'&&p.q==='C')return true;
    if(f==='D'&&p.q==='D')return true;
    if(f==='FL'&&isLead(p.q))return true;
    if(f==='SUP'&&isLead(p.q))return true;      // supervisors — Cat A and B
    if(f==='INS'&&isInstr(p.q))return true;
    if(f==='SXO'&&p.quals.sxo)return true;
    if(f==='SANS'&&p.san)return true;
    if(f==='OCU'&&isOcu(p.q))return true;
  }
  if(SEARCH){const s=SEARCH.toLowerCase(); if(p.cs.toLowerCase().includes(s)||(p.name||'').toLowerCase().includes(s))return true;}
  return false;
}
/* {map: day index -> {ids:Set, sev}, echo:Set, sev} for the current warning
   focus, or null.
   A single focused warning wins. The day it belongs to lights its crew solid;
   B14 also lights those same people on EVERY other day of the week, dashed, so
   a cross-day cause — crew rest running back into last night's wave, a double
   turn split over midnight — is visible without hunting for it. With no single
   warning focused, every expanded day box lights all of the people flagged that
   day, scoped per day, and nothing echoes. */
export function warnFocusMap(){
  /* a focused warning always owns the highlight, even inside a person focus —
     the box stays narrowed to the clicked person, the lighting follows the
     warning's whole crew */
  if(WFOCUS){const m=new Map();m.set(WFOCUS.di,{ids:new Set(WFOCUS.ids),sev:WFOCUS.sev});
    return {map:m,echo:new Set(WFOCUS.ids),sev:WFOCUS.sev};}
  if(PFOCUS)return null;          // a clicked puck alone uses the ordinary selection highlight
  if(!DWOPEN.size)return null;
  const m=new Map();
  DWOPEN.forEach((di:any)=>{const g=WARN.byDay[di]; if(!g||!g.warns||!g.warns.length)return;
    const ids=new Set(); let sev='adv';
    g.warns.forEach((w:any)=>{(w.who||[]).forEach((id:any)=>ids.add(id)); if(w.sev==='hard')sev='hard';});
    if(ids.size)m.set(di,{ids,sev});});
  return m.size?{map:m,echo:null,sev:null}:null;
}
export let ARM:any=null;                                   // {key, di, title} or null
export function armedKey(){return ARM?ARM.key:'';}
export function armSlot(key:any,el?:any){
  if(!canEditSched())return;
  const base=String(key).replace(/\.\+$/,'');
  /* a previewing day is read-only; preview markup emits no armable surfaces,
     but a stale element from the pre-preview render must not arm a live key */
  if(DPREV.has(keyDay(base)))return
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
  /* a successful fill PARKS the drawer (owner, 8 Aug 26): the point of
     planting is seeing the puck land, and the open drawer covers it.
     Refusals return above, so an aborted pick keeps the drawer out. */
  if(isPhone())document.body.classList.remove('ros-open');
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
  /* a reorder can strand an armed slot on a row that still EXISTS but is no
     longer the one that was armed — armTargetExists alone cannot see that
     (see engine/reorder.ts's REORDERED_DI comment). Popped UNCONDITIONALLY,
     never inside the `ARM&&` short-circuit: skipping the read whenever
     nothing is currently armed would leave a stale day index sitting there
     for the NEXT arm to trip over, on a mutation that never reordered
     anything itself. */
  const reorderedDi=popReorderedDay();
  if(ARM&&ARM.di===reorderedDi)disarmSlot();
  validate();
  if(SBDAY!=null)renderScheduler();
  if(CURPAGE==='editsched')renderEditWeek();
  if(CURPAGE==='viewsched')renderSchedule('vWeek',false);
}
