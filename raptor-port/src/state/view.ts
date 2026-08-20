import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { keyDay } from '../engine/keys'
import { slotVal, setSlotVal, fillSlot, armTargetExists } from '../engine/slots'
import { popReorderedDay } from '../engine/reorder'
import { slotBar, personCount, personWarnDays } from '../engine/avail'
import { validate, WARN } from '../engine/validate'
import { markEdit, daySnapOf } from '../engine/publish'
import { curDraftId, reconcileIssuedMarks } from '../engine/drafts'
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
/* Monotonic board-navigation generation. A swipe settles asynchronously; the
   day value alone cannot distinguish close -> reopen on the same day (ABA).
   Every real open/close/day change advances this token so an older settle can
   never steer a newer board instance. */
export let BOARDREV=0
export let CURPAGE:any='viewsched'
/* the phone board once hid an EMPTY remarks box on a duty/sim/ground row and
   revealed one at a time behind a "+", tracked here by RMKOPEN. The owner asked
   for every remarks box to show at all times (16 Aug 26 — it rides the pucks'
   row now, so it costs no extra line), so the reveal, its "+" and RMKOPEN are
   all gone; nothing addresses a board row by key in transient view state today,
   which is why store.ts wires HOOKS.remapViewKeys to a no-op. */
/* the day the palette is looking at. The reference's #editToggle used to sit
   here as EDITON; it was removed on 9 Aug 26 (owner) — the board is reachable
   only as admin → Edit Schedule, so intent to edit is implied by being there,
   and View-only Sched already IS the read-only mode. A second mechanism for
   the same job only created states (a live board on a dead page, controls
   that looked live and did nothing) that had to be guarded one at a time. */
export let ROSDAY:any=0
export function setRosDay(n:any){ ROSDAY=n }

/* ---- HISTORY MODE (owner, 11 Aug 26) --------------------------------------
   The board's History toggle. A VIEW mode, not an edit mode: it changes what
   the board tells you and never what it will let you do — a detail stays
   just as editable with it on, on both surfaces. That is the whole reason it
   is not gated on editMode() the way Sort all and + Wave are; reading who
   changed something is not editing it, so a read-only board can carry it too.

   It lives here rather than in ui/pops.ts because a BUILDER reads it:
   boardWarnHTML puts the way into the changes list at the end of the day's
   checks panel while the mode is on, and that has to be in the string —
   SchedBoard diffs each panel to decide whether to re-hang it, so anything
   added to the DOM afterwards is lost on the next unrelated repaint. ui/
   builders already read this module for CURPAGE, ARM and the selection.
   (The per-cell affordance is NOT in the string: it is one `.hist-on` class
   on the board wrap, so the cells cost no extra nodes — see
   `docs/ui-contracts.md` §History on the board.)
   Session-scoped and deliberately not persisted, like sbWide: the log it
   surfaces does not survive a reload either, so a toggle that did would come
   back up pointing at nothing. */
export let HISTMODE=false
export function setHistMode(on:any){ HISTMODE=!!on }
export function toggleHistMode(){ HISTMODE=!HISTMODE; return HISTMODE }

/* ---- THE LATE-INPUT MARKS CAN BE TURNED OFF (owner, 20 Aug 26 — "can u give
   the scheduler board the option to remove late input tags?") ---------------
   The mark has never had an off switch. `VCONF.inputLead` is a day count whose
   most permissive setting is 0 ("due by the Monday itself"), so a squadron that
   does not run an input deadline at all could not silence it short of a rule
   change — HANDOFF has carried that as a known gap since 9 Aug 26, and this is
   it being asked for.

   A SWITCH, not a per-badge delete. Clearing one mark at a time would need a
   forgiven-input registry and, worse, a way BACK for a scheduler who cleared
   the wrong one — the "deleting the last in-time" trap. A switch is reversible
   by pressing it again, which is the whole argument.

   It hides the mark on the SCHEDULE surfaces only — the board, the edit week
   and the view-only week, the places a scheduler reads a day. The Inputs page
   keeps its own (`InputsPage.tsx`): that page IS the paperwork record, and
   quieting a busy board is a different thing from erasing when an input was
   filed. The engine is untouched either way — `isLateInput` still answers, the
   mark was never a warning (§Stable decisions), and nothing here reaches
   `validate()`.

   ADMIN-ONLY at the write path, like every other write in this app: a member
   must not be able to switch off the mark on their own late input.

   Session-scoped and not persisted, like HISTMODE and sbWide. If the squadron
   wants "we do not run a deadline" to stick, that is the same server/database
   work as everything else on HANDOFF's list — the switch is not the place to
   grow a second persistence path. */
export let LATEMARK=true
export function setLateMark(on:any){ LATEMARK=!!on }
export function toggleLateMark(){ if(!canEditSched())return LATEMARK; LATEMARK=!LATEMARK; return LATEMARK }

/* ---- THE DAY YOU ARE LOOKING AT, CARRIED ACROSS A PAGE SWITCH ------------
   (owner, 9 Aug 26.) View-only Sched and Edit Schedule are two separate
   horizontal scrollers — `#vWeek` and `#eWeek` — each holding its own
   scrollLeft, so reading Thursday on one and switching to the other used to
   drop you back on Monday. It is the same week; it should be the same day.

   Nothing in the model knows where a week is parked, so the only honest
   answer is geometry: the leftmost day box still on screen. That has to be
   read while the OUTGOING page is still laid out, and `.page` is display:none
   the moment React re-renders — so setPage below is the one moment it can be
   taken, and these two helpers live here rather than in ui/pan.ts because
   pan.ts already imports this module and the reverse would be a cycle.
   pan.ts's own palette-follow reads through weekLeftDay too, so the two
   agree on the boundary case by construction rather than by coincidence. */
export let CARRYDAY:any=null
export function setCarryDay(n:any){ CARRYDAY=n }
/* The 8px slack is what stops a day scrolled all but out of view from
   counting as the one being read. Null, never a guess, when there is no DOM
   (the headless state tests) or no week built yet — the caller then leaves
   the destination's own scroll alone, which is the pre-existing behaviour. */
export function weekLeftDay(el:any):any{
  if(!el||typeof el.querySelectorAll!=='function'||typeof el.getBoundingClientRect!=='function')return null
  const ds=Array.from(el.querySelectorAll('.day[data-day]')) as any[]
  if(!ds.length)return null
  const x=el.getBoundingClientRect().left+8
  const hit=ds.find((d:any)=>d.getBoundingClientRect().right>x)||ds[0]
  const n=+hit.dataset.day
  return Number.isFinite(n)?n:null
}
/* the write half — put day `di` at the week's left edge. Deliberately the
   mirror of weekLeftDay, so a read on one page and a write on the other land
   where they started. `+=` on the measured gap rather than an absolute
   offsetLeft: the week has padding and the day boxes are not its offset
   parent on every layout, and a relative nudge is right under both. */
export function scrollWeekToDay(el:any,di:any){
  if(!el||di==null||typeof el.querySelector!=='function')return
  const d=el.querySelector(`.day[data-day="${di}"]`)
  if(!d||typeof d.getBoundingClientRect!=='function')return
  el.scrollLeft+=d.getBoundingClientRect().left-el.getBoundingClientRect().left
}
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
  BOARDREV++;
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
  /* THE BOARD'S DAY COMES BACK OUT WITH YOU (owner, 10 Aug 26). Tab through
     to Thursday on the board, close it, and the week underneath was still
     parked wherever you left it — so the day you had just been editing was
     off screen. CARRYDAY is exactly the mechanism the View-only <-> Edit hop
     already uses (owner, 9 Aug 26): the destination week reads it on its next
     paint and clears it, so nothing new is needed and the two paths cannot
     drift. Read BEFORE setBoardDay(null), which is what clears SBDAY.
     Only when the board really had a day — closeBoardState also runs on
     logout and on leaving the page, where SBDAY is already null and writing
     CARRYDAY would scroll the next week somewhere nobody asked for. */
  if(SBDAY!=null)CARRYDAY=SBDAY;
  setBoardDay(null);
  if(typeof document!=='undefined')document.body.classList.remove('ros-open');
  HOOKS.closeBoardDialogs();
}
/* the two pages that ARE a week, and the scroller each one owns */
export const WEEK_EL:any={viewsched:'vWeek',editsched:'eWeek'}
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
     the board — and Shell.tsx's context-menu clear-a-seat handler USED TO
     carry `HOOKS.editMode() || SBDAY != null`, an escape hatch that existed
     ONLY because the board used to legitimately paint over whatever page
     you were on and so was assumed safe to trust on its own. Once the
     render stopped painting it but SBDAY kept living, that assumption
     broke: on View-only Sched with a board left open, editMode() read
     false (wrong page) but the escape hatch still read SBDAY!=null as
     "trust it anyway" — so a real right-click on a WEEK puck (not the
     board's own, the one now VISIBLE underneath) cleared it. Both halves
     were fixed: the escape hatch is gone from Shell.tsx, and this clears
     SBDAY. Scoped to leaving 'editsched' specifically — landing ON it
     needs no clear, since nothing can have survived the last exit — and
     p!==CURPAGE is already computed above for the popup cleanup, so this
     reuses it rather than a second comparison. */
  const closedBoard=p!==CURPAGE&&p!=='editsched'&&SBDAY!=null;
  if(closedBoard)closeBoardState();
  /* CARRY THE DAY (owner, 9 Aug 26). Read the outgoing week's leftmost day
     while it is still on screen — one line later CURPAGE moves, React swaps
     which .page carries `on`, and display:none takes its layout away. The
     destination week picks CARRYDAY up on its next paint and clears it.
     Captured on leaving EITHER week page, not only on a straight view<->edit
     hop, so a detour through Inputs still lands you back on your day.
     NOT when the line above just closed the board: closeBoardState wrote the
     BOARD's day into CARRYDAY, and the board is the surface the user was
     actually looking at — reading the week parked underneath it would
     overwrite the carry with wherever that week happened to be left
     (audit, 12 Aug 26; ui-contracts — "a board close is just another
     producer"). */
  if(!closedBoard&&p!==CURPAGE&&typeof document!=='undefined'&&WEEK_EL[CURPAGE])
    CARRYDAY=weekLeftDay(document.getElementById(WEEK_EL[CURPAGE]));
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
/* which PUBLISHED days the VIEW page is showing the live WORKING COPY for,
   instead of its default — the frozen issued snapshot (owner, 15 Aug 26: a
   viewer must never mistake the scheduler's in-progress edits for the issued
   schedule, so issued is what renders until they explicitly ask). A Set, not
   a default stored anywhere: no entry IS the issued default, so a fresh
   session opens on the issued document with zero stored state. Deliberately
   separate from DPREV — the edit page's previews must never bleed into the
   view page (pinned in draftsui.test.tsx) and vice versa. Never pruned: an
   entry on a day that gets reopened is inert (unpublished days render live
   regardless), and it becomes meaningful again if the day is re-published. */
export const VWORK=new Set()
export function toggleViewWork(di:any,on:any){ if(on)VWORK.add(+di); else VWORK.delete(+di) }
/* which days' Available-crew panel is EXPANDED — collapsed to its one-line
   summary is the default (owner, 13 Aug 26: "the window is pretty big").
   Session view state in the DWOPEN pattern: in-place mutation because ESM
   cannot reassign across modules, cleared on a session change, never
   persisted and never in a history snapshot. */
export const AVOPEN=new Set()
export function toggleAvail(di:any){ if(AVOPEN.has(+di))AVOPEN.delete(+di); else AVOPEN.add(+di) }
/* RESTARM — the one deliberate confirm in the app (owner, 16 Aug 26). "Load
   onto working copy" (the reworded restore) discards any unpublished edits on
   the day, so when there ARE some it takes two taps: the first arms this flag,
   the second (on the same version) does the load. Any navigation cancels it —
   which is exactly why the clear lives in setDayPreview, the one call every
   version change routes through (dropdown change, Back to live, the load
   itself). {di,ver} while armed, null otherwise. Session-only, no undo. */
export let RESTARM:any=null
export function setRestArm(di:any,ver:any){ RESTARM = di==null?null:{di:+di,ver} }
export function restArmed(di:any,ver:any){ return !!RESTARM && RESTARM.di===+di && String(RESTARM.ver)===String(ver) }
export function setDayPreview(di:any,ver:any){ RESTARM=null; if(ver==null||ver==='live')DPREV.delete(+di); else DPREV.set(+di,ver) }
/* drop any preview whose snapshot no longer exists — undo across a publish,
   unpublishAL, a week switch: without this the day would render the live model
   while its header claims to show history. daySnapOf resolves 'd:<id>' draft
   vers too (engine/publish.ts), so a deleted or undone-away draft's preview
   falls out through the same test — plus one draft-only case: a 'd:' preview
   of the day's now-SELECTED draft (an undo can restore that selection under
   an open preview) would freeze the stale stowed blob while the live day IS
   that draft, so it drops as well. */
export function prunePreviews(){ for(const [di,ver] of [...DPREV]){
  if(!daySnapOf(di,ver)){DPREV.delete(di);continue}
  if(typeof ver==='string'&&ver.slice(0,2)==='d:'&&ver==='d:'+curDraftId(di))DPREV.delete(di)
} }
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
/* ---- FRESHLY ADDED FLASH (owner, 14 Aug 26) -------------------------------
   Every new row / line / wave / block wears a blue box for ~6s so a scheduler
   sees exactly what their tap created. Transient view state in the ARM family:
   never persisted, never in a history snapshot, swept on a session
   change. The box is HUNG post-render by highlights.ts's paintFreshAdds on
   every board repaint (so an unrelated edit inside the window cannot wipe it),
   and the keys held here are the SAME funnel keys markStructuralAdd records —
   fed in through HOOKS.flashAdded — so the two can never drift. Each flash
   schedules its OWN removal, so adding a second thing three seconds later does
   not cut the first one's box short. A key renumbered by a delete inside the
   window simply stops matching an element and the box drops a beat early —
   cosmetic only, so it is not wired through remapViewKeys (which is a no-op
   now that no key-addressed view state remains — see store.ts). */
export const FRESHADD=new Set<string>()
/* the keys in their final FADE-OUT stretch (owner, 14 Aug 26 — "yes fade").
   A separate set, not a flag on FRESHADD, so paintFreshAdds can add the steady
   box (.sb-fresh, static, no flicker on repaint) to every fresh key and the
   fade class (.sb-fresh-out, a CSS animation to transparent) only to those in
   their last stretch — the steady hold never animates, only the dismissal. */
export const FRESHOUT=new Set<string>()
export const FRESH_MS=6000
export const FRESH_FADE_MS=550
export function flashAdded(key:any){
  if(!key)return
  const k=String(key); FRESHADD.add(k)
  /* repaint the board the box lives on and the week behind it — the same
     surfaces afterSchedMutate paints */
  const repaint=()=>{ if(SBDAY!=null)renderScheduler(); if(CURPAGE==='editsched')renderEditWeek() }
  /* enter the fade for the last FRESH_FADE_MS, then remove entirely — two
     timers so the steady box holds static and only the tail animates out */
  setTimeout(()=>{ if(FRESHADD.has(k)){ FRESHOUT.add(k); repaint() } },FRESH_MS-FRESH_FADE_MS)
  setTimeout(()=>{ FRESHADD.delete(k); FRESHOUT.delete(k); repaint() },FRESH_MS)
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
  const key=ARM.key, base=String(key).replace(/\.\+$/,'');
  /* the one refusal left: re-planting the seat's own occupant would write
     nothing and still toast "planned". Reachable since a placeholder-filled
     slot arms (13 Aug 26) — tap the placeholder in the slot, then tap the
     same placeholder on the palette's row. */
  if(!/\.\+$/.test(key)&&slotVal(base)===id){toast(`${PEOPLE[id].cs} — already in that seat`);return false;}
  /* A DARKENED NAME PLANTS TOO (owner, 13 Aug 26 — "everything plants,
     warning after"). The tap used to refuse where a drag warned-and-allowed,
     so the two ways of planting the same man disagreed. The reason is on the
     list BEFORE the tap (the strike, and the printed reason line while
     armed); planting repeats it as the warn toast after the write — the same
     validate-then-ask shape as drag.ts's barDrop — and the validator rings
     the puck the same instant. */
  if(/\.\+$/.test(key))fillSlot(key,id); else setSlotVal(key,id);
  armDrop();
  /* a successful fill PARKS the drawer (owner, 8 Aug 26): the point of
     planting is seeing the puck land, and the open drawer covers it. */
  if(isPhone())document.body.classList.remove('ros-open');
  afterSchedMutate(); paintArm();
  const why=slotBar(id,base);
  if(why)toast(`${PEOPLE[id].cs} — ${why}`,'warn');
  else toast(`${PEOPLE[id].cs} planned`);
  return true;
}
/* what a slot is called, for the picker's title.
   NOT the same function as engine/editlog.ts's keyLabel, which answers a
   similar question for the changes list, and deliberately so: this one emits
   HTML with inline styles and covers only the crew keys, that one is plain
   text and covers the whole grammar — and it lives in the engine, which
   cannot import this module. If a THIRD caller ever wants a name for a slot
   key, fold this into keyLabel rather than adding another. */
export function slotTitle(key:any){
  const k=String(key);
  if(k.indexOf(':')<0){const a=k.split('.');
    const f=(((DAYS[+a[0]]||{}).waves||[])[+a[1]]||{formations:[]}).formations[+a[2]]||{};
    return `${a[4]==='p'?'FCP':'RCP'} · <span class="mono" style="color:var(--ink-3)">${esc(f.cs||'')} ${esc(f.msn||'')}</span>`;}
  const p=k.slice(0,k.indexOf(':')), a=k.slice(k.indexOf(':')+1).split('.');
  /* the reassign-a-puck arm (inputedit.tsx's reassignInput) — 'iu:<iid>',
     no day component, since one input can be filed on several loaded days at
     once and none of them is more "its" day than another */
  if(p==='iu'){
    const inp=INPUTS.find((i:any)=>i.iid===a[0]);
    return inp?`Unavailable · <span class="mono" style="color:var(--ink-3)">${esc(PEOPLE[inp.person]?PEOPLE[inp.person].cs:String(inp.person))}</span>`:'Unavailable';
  }
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
  /* an edit that restored a field to its issued value must not keep its dotted
     "changed" mark (owner, 16 Aug 26). noteChange raised the mark before the
     value landed; this drops it now the write is in, BEFORE markEdit's histPush
     so the reconciled marks are what undo captures. Only removes stale marks. */
  reconcileIssuedMarks();
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
