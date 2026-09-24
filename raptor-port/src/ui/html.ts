import { DAYS } from '../engine/data'
import { noteText } from '../engine/note'
import { PEOPLE, isSpecial, whoId, QCHIP, QCLASS, LEVELNAME, byCrew } from '../engine/people'
import { INPUTS, inputCoversDate, inpLabel, inpId, inpTimeText, isOffType, offWord, isLeave, isDownchit, isPersonal, isUnavail, isSansAvail, isUpchit, sansBadge, sansAvailOn, sansWindow, sansLetters, isLateInput, lateNote } from '../engine/inputs'
import { isStandalone, scSpare, dayCount, mColor, saExempt, SAWAVE } from '../engine/waves'
import { intimeFold } from '../engine/events'
import { parseHM, hhmm, hm24, minus } from '../engine/time'
import { slotVal, txtGet, TIME_TXT, whoArr, rowCrew, rowRef } from '../engine/slots'
/* RANK left with the focus-scoped trace: ranking the CR chip against the day's
   own worst is traceLeads' job now, in the engine, so both the chip and the
   click that follows it read one test */
import { WARN, sevOf, chipOf, dashOf, traceOf, traceLeads, traceChip, traceIx, tracesOn, chipText, wlbl, WCODE, SEVWORD, CHIP_LABEL, ordinal, withOfficialWarn, officialWarn, fltNoLen, FLT_NO_LEN_SAYS } from '../engine/validate'
import { availByWave, personBusy, dayOff, dayEngaged, personWarns } from '../engine/avail'
import { SCHED, alAttr, dayApproved, dayCurVer, dayPendCount, dayShownPendCount, dayDelta, dayDiscardCount, alColor, signOf, signMissing, signShown, signPeople, SIGN_ROLES, daySigned, nextSeq, dowShort, alCount, daySnapOf, verLabel, protectedWeek, notYetSigned } from '../engine/publish'
import { verSeq } from '../engine/verid'
import { dayDrafts, curDraftId, isDraftVer, draftVerLabel } from '../engine/drafts'
import { keyDay } from '../engine/keys'
import { VCONF } from '../engine/rules'
import { esc, SBDAY, WFOCUS, PFOCUS, DWOPEN, DPREV, AVSHUT, PIOPEN, VWORK, CURPAGE, lateShown, restArmed, unpubArmed, notePub, stSavedOn, warnShown, WMOPEN } from '../state/view'
import { canEditSched } from '../state/auth'
import { ME } from '../state/auth'
import { HOOKS } from '../engine/hooks'
import { oilBarOf, oilItemOfKey, inputItemKey, oilSentinelSummary, oilFromWords } from './oilmode'
import { oilReadPass } from '../engine/oilev'
import { STORE_CFG, groundOrder, secOrder } from '../engine'

const editMode=()=>HOOKS.editMode()

/* =====================================================================
   VERSION PREVIEW — render a day as a published snapshot instead of live
   PV is true only while a preview build is in flight. It suppresses the two
   things a snapshot must not touch: WARN reads (warnings are live-model state;
   validating a snapshot would clobber WARN for every surface — the
   no-validate-on-repaint rule) and the write surfaces (data-slot / draggable —
   those keys address the LIVE model, so acting on them from an old rendering
   would edit today's schedule while showing yesterday's).
   ===================================================================== */
/* PVQ — the QUIET flavour of PV (owner, 15 Aug 26): the view page's issued
   DEFAULT for a published day renders through the same withDaySnap freeze,
   but it is not a "preview" the viewer chose — it IS that page's normal
   answer. So under PV&&PVQ the banner and Restore button are withheld (the
   day head's own "✓ Published" stamp + version chip + picker are the
   labelling) and the section class reads `issued`, not `preview`, so the
   preview dimming and its CSS never apply to the page's default face. */
let PV=false, PVV:any=null, PVQ=false
/* OFW — the OFFICIAL-FLAGS overlay (published-schedule flagging, §5.4/§8). A
   published day's frozen face renders under PV (content frozen, write surfaces
   stripped) but must now SHOW the flags of its issued version. OFW says "show the
   flags on this frozen face"; dayIssuedHTML pairs it with withOfficialWarn so the
   flags read are the OFFICIAL bundle's, matching the frozen text under them. The
   PV null-gates below become `PV&&!OFW` so the frozen face flags while every other
   preview (an old AL, a parked draft: a past version is read, not checked) still
   shows none. The write surfaces (data-slot / data-drag) stay gated on PV alone —
   OFW never re-enables editing. */
let OFW=false
/* the LIVE unpublished-edit count captured by withDaySnap BEFORE it zeroes
   pending — what the discard-confirm button must show (P2-IMPL-09). Read only
   under PV; withDaySnap sets it before the swap and restores it in finally. */
let PVND=0
const sev=(di:any,id:any)=>(PV&&!OFW)?null:sevOf(di,id)
/* THE PREVIOUS-DAY TRACE (owner, 6 Aug 26; made a standing mark 6 Aug 26).
   A crew-rest breach is raised on the day the man is told to report, but the
   day a scheduler can still FIX is the one before — so that day carries the
   mark: a dotted ring, a CR label, and the leave-by time, painted the moment
   the week renders. It used to appear only while the warning was focused,
   which meant you had to already know about the breach to be shown its cause.
   Model state now (validate() files every breach against its previous day and
   publishes it as WARN.trace), so this re-derives nothing — and PV still gets
   nothing at all, because a frozen snapshot must not read live WARN. */
const traceHit=(di:any,id:any)=>(PV&&!OFW)?null:traceOf(di,id)
/* the flag the puck prints: the day's own worst chip, or CR where this day
   caused tomorrow's breach and the man carries nothing louder of his own.
   traceLeads applies exactly that test, and interactions.ts routes the click
   by the same call, so the chip and the warning it opens cannot disagree. */
const chip=(di:any,id:any)=>{ if(PV&&!OFW)return null
  const t=traceLeads(di,id); return t?traceChip(t):chipOf(di,id) }
const dsh=(di:any,id:any)=>(PV&&!OFW)?false:dashOf(di,id)
/* the ONE place the snapshot may stand in for the live model. finally is not
   optional: a throw mid-build with the swap live would leave the old day
   installed as the real schedule — a silent history rewrite on the next
   validate. */
export function withDaySnap(di:any,ver:any,fn:any){
  const snap=daySnapOf(di,ver)
  if(!snap)return fn(false)
  /* capture the LIVE discard count BEFORE the swap zeroes pending (P2-IMPL-09) —
     the confirm button reads it as PVND, so it never shows "Discard 0 edits". */
  const nd0=dayDiscardCount(di)
  const d0=DAYS[di], c0=SCHED.changes, p0=SCHED.pending, nd=PVND
  DAYS[di]=snap.d; SCHED.changes=snap.c||{}; SCHED.pending={}
  PV=true; PVV=ver; PVND=nd0
  try { return fn(true) }
  finally { DAYS[di]=d0; SCHED.changes=c0; SCHED.pending=p0; PV=false; PVV=null; PVND=nd }
}
/* [ALL-AVAIL-WINDOW] — THE WORLD A COUNT CHIP WAS DRAWN IN, replayed for the
   window its tap opens (Fable S3, 23 Sep 26). A chip is drawn in one of three
   worlds and says which: the working copy (no version); a version preview — a
   past AL, a parked plan — which reads and does not check (PV: no flags); or
   the view page's ISSUED FACE, which wears its OFFICIAL flags (PV + OFW +
   withOfficialWarn, exactly as dayIssuedHTML builds it). The window used to
   replay only the first step — its crowd came through withDaySnap — and read the
   flags, the figures and the puck marks from the LIVE day, so an issued list
   wore today's warnings and today's money. Replaying the whole world gives every
   reader inside the window the answer the chip's own face showed, with no reader
   needing to know.
   `fn(false)`: the version no longer resolves (unpublished, undone). It runs in
   the LIVE world, so the caller must treat it as GONE and read nothing. */
export function withChipWorld<T>(di:any,ver:any,ofw:any,fn:(ok:boolean)=>T):T{
  /* no version, official world: the view page's draft day (Fable F6) */
  if(!ver)return ofw?withOfficialWarn(()=>fn(true)):fn(true)
  if(!ofw)return withDaySnap(di,ver,(ok:any)=>fn(!!ok))
  const q=PVQ,o=OFW
  PVQ=true; OFW=true
  try{ return withDaySnap(di,ver,(ok:any)=>ok?withOfficialWarn(()=>fn(true)):fn(false)) }
  finally{ PVQ=q; OFW=o }
}
export function dayPreviewHTML(di:any,ver:any,edFallback:any){
  return withDaySnap(di,ver,(ok:any)=>ok?dayHTML(di,false,true):dayHTML(di,edFallback,true))
}
/* an APPROVED day whose issued snapshot cannot be resolved — a legacy /
   unsupported book, whose 'orig'/numeric identities no longer resolve. The crew
   must NOT be shown the live working DRAFT under a "Published" label
   (P2-REREVIEW-06); render an explicit, read-only unavailable notice instead. */
/* the ONE quarantine notice sentence, shared by the week's dayUnsupportedHTML and
   the board's own guard (board.ts:boardHTML) so the two surfaces can never drift
   (Q2R-06). */
export const QUARANTINE_NOTE = "This day's published schedule was created by an older version of the app and can't be shown here. It has not changed — open it on the device that created it."
function dayUnsupportedHTML(di:any){
  const d=DAYS[di]
  return `<section class="day ${d.today?'today':''} dok issued" data-day="${di}">`
    +`<div class="day-head"><span class="dow di-open" data-dayinfo="${di}" title="Day details">${d.dow}</span>`
    +`<span class="dt di-open" data-dayinfo="${di}" title="Day details">${esc(d.dt)}${d.today?' · Today':''}</span></div>`
    +`<div class="dprev-bar">${QUARANTINE_NOTE}</div>`
    +`</section>`
}
/* the VIEW page's default render for a PUBLISHED day (owner, 15 Aug 26): the
   frozen issued document, not the live working copy — a scheduler's
   in-progress edits stay invisible to viewers until the next AL goes out.
   Quiet mode (PVQ above): no preview banner, no Restore, class `issued`. */
export function dayIssuedHTML(di:any){
  /* Classify AUTHORITY by the WEEK/BOOK, never by whether verIds resolve
     (P2-REV2-03): an unsupported book (wrong amV, or content filed under the
     wrong week) can still carry valid verIds a changed draft resolves — but it is
     NOT authoritative and must never be shown as the issued document. Show the
     unavailable notice for an approved day; the plain draft for a never-approved
     one. Checked BEFORE dayCurVer so a resolvable-but-unsupported record can't slip
     past the ver==null branch below. */
  /* a PROTECTED week shows the unavailable notice for EVERY day, not only its
     approved ones (P2-QREV/Fable-7): an unreadable/damaged book loads the SEED as
     a placeholder whose days are unapproved, so the old `dayApproved ? notice :
     seed` reading rendered that seed as if it were the real schedule, with no
     indication the week is quarantined. The whole book is frozen, so the whole
     week reads as unavailable. */
  if(protectedWeek())
    return dayUnsupportedHTML(di)
  const ver=dayCurVer(di)
  if(ver==null){
    /* an approved day with NO resolvable issued snapshot is a legacy/unsupported
       book — show the unavailable notice, NEVER the live draft (P2-REREVIEW-06).
       A never-approved day (not reached from ViewWeek) keeps the plain render. */
    return dayApproved(di)?dayUnsupportedHTML(di):dayHTML(di,false)
  }
  /* the issued face now OVERLAYS the OFFICIAL flags (§5.4/§8): OFW un-suppresses the
     flag helpers + warning list on this frozen face, and withOfficialWarn points the
     warning reads at the OFFICIAL bundle — the version validated against this very
     snapshot — so the flags match the frozen text. Content stays byte-frozen (PV) and
     the write surfaces stay stripped (PV alone gates those). */
  /* the "Not Yet Signed" marker is a WORKING-COPY affordance only (owner, 16 Sep 26):
     the published/issued face stays TRUE until the working copy is published, so marking
     it "not yet signed" was confusing. dayHTML renders it only when !PV (the edit/working
     face); the issued face (PV, here) never does — so nothing is captured across the swap. */
  PVQ=true; OFW=true
  try{ return withDaySnap(di,ver,(ok:any)=>withOfficialWarn(()=>ok?dayHTML(di,false):dayHTML(di,false))) }
  finally{ PVQ=false; OFW=false }
}
/* THE VIEW-ONLY WEEK'S per-day render (owner, 16 Sep 26 — [CRP-FLAG] Item 2).
   Extracted from ViewWeek.tsx so the view page and its pins share ONE dispatch,
   not a mirror that can drift (the drift-seam doctrine). ASSUMES THE VIEW PAGE:
   ViewWeek gates on CURPAGE==='viewsched' before calling this, so it needs no page
   check of its own — but state/view.ts:dayDisplaysOfficial (the mirror the click and
   details consumers read) DOES add that page gate. Don't reuse viewDayHTML off the
   view page, or the render and the click-world mirrors diverge (Fable CRP-I2-R3-001). Per day:
   · a PUBLISHED day → its ISSUED face (dayIssuedHTML), unless the viewer has
     peeked the working copy (VWORK) — then the live working render, which carries
     its own "Working draft" stamp.
   · a DRAFT day → the live working render, but with its FLAGS resolved in the
     OFFICIAL world (withOfficialWarn). A draft has no issued content of its own,
     so its CONTENT is the working draft either way; but a CROSS-DAY rule (the
     7-day run, crew rest over a week/day boundary) must reference a PUBLISHED
     neighbour at its ISSUED version. Without this, an unpublished working-copy fix
     to that neighbour — e.g. taking a man off a published Monday's live copy —
     silences a breach the issued schedule still carries, on the very day it lands
     (a draft Sunday). When nothing published in the dependency window diverges,
     OFFICIAL aliases WORKING and this wrap is a no-op, so the ordinary week stays
     byte-identical (parity untouched). The EDIT week deliberately does NOT wrap:
     there the working copy IS the truth, so the scheduler sees their pending fix
     clear the breach — their live preview. A DPREV draft PREVIEW keeps its
     content-swapped render as-is (its flags were computed on the live day, not
     the previewed snapshot), so it is left un-wrapped. */
export function viewDayHTML(di:any){
  if(dayApproved(di)) return VWORK.has(di)?dayHTML(di,false):dayIssuedHTML(di)
  const ver=DPREV.get(di)
  if(!isDraftVer(ver)) return withOfficialWarn(()=>dayHTML(di,false))
  if(!daySnapOf(di,ver)){ DPREV.delete(di); return withOfficialWarn(()=>dayHTML(di,false)) }
  return withDaySnap(di,ver,()=>dayHTML(di,false))
}
/* THE PLANS SELECTOR (owner, 15 Sep 26 — the day-head redesign, LOCKED spec
   docs/superpowers/specs/2026-09-15-plans-selector-redteam.md). ONE white
   button per day whose LABEL is what you are looking at, opening a menu
   (board.ts's planMenu) that both switches plans and previews issued versions.
   It REPLACES three older controls at once — the green "Live copy" pill, the
   "Drafts" button and the grouped <select data-dver> — so the day head reads as
   one thing, not three. Shared verbatim by the week's day head and the board's
   sign strip (A5), ONE body so the two surfaces can never drift.
   The label:
     · previewing an issued version → amber "👁 AL2" (what you are viewing)
     · a named plan is live         → the plan's name ("Plan B")
     · otherwise                    → "Live working copy"
   It ALWAYS renders (it is also the "+ Alt Plan" entry point), which is why it
   lives inside the day head's already-excised .dhtpl span — the byte-parity day
   head is untouched (A6). Long plan names are clamped in CSS with the full name
   in the tooltip (A8). */
export function planSelectorHTML(di:any,cls?:any){
  di=+di
  const pv=DPREV.has(di)
  const sel=dayDrafts(di).find((t:any)=>t.id===curDraftId(di))
  const label=pv?`👁 ${esc(draftVerLabel(di,DPREV.get(di)))}`
    :sel?esc(sel.name)
    :'Live working copy'
  const title=pv?`Viewing ${draftVerLabel(di,DPREV.get(di))} — tap to switch plan or look at another version`
    :sel?`${sel.name} — tap to switch plan or look at another version`   /* A8: the full plan name in the tooltip, since the label clamps at 150px */
    :'Switch between your plans, or look back at an issued version'
  return `<button class="planselbtn${pv?' pv':''}${cls?' '+cls:''}" data-planmenu="${di}" title="${esc(title)}"><span class="psl">${label}</span><span class="psc">▾</span></button>`
}
/* THE ISSUED-VERSION TITLE TAG (owner, 15 Sep 26). A green tag beside the day
   title naming the issued version (ORIG / ALn) once the day is published, a
   dashed "DRAFT" tag while it is not. It REPLACES the "✓ Published · ALn" pill
   that used to ride the publish stamp (dayStatHTML) — the day's publish STATUS
   is now the tag, and the publish ACTIONS (Publish day / Publish AL) stay as
   buttons. It names the LIVE issued version (dayCurVer), so under a preview it
   still says what the day IS while the selector says what you are viewing.
   Edit-surface only: it rides the excised .dhtpl on the week and the board's
   own sign strip, never the byte-compared view-week day head (the view page
   keeps its own pickers). */
export function verTagHTML(di:any){
  di=+di
  if(!dayApproved(di)) return `<span class="verchip draft" title="${esc(DAYS[di]?.dow||'')} is still a working draft — not yet published">DRAFT</span>`
  const cv=dayCurVer(di)
  if(cv==null) return ''   // published with no snapshot — probe/import state
  /* COLOUR BY AL NUMBER (owner, 15 Sep 26 — item 3): AL1 cyan, AL2 amber, AL3
     green, … off the SAME data-alc palette the amendment marks use (one source, so
     the tag and the marks can never drift). ORIG stays grey, DRAFT dashed. */
  return verSeq(cv)===0
    ? `<span class="verchip orig" title="${esc(DAYS[di]?.dow||'')} is issued as the Original">ORIG</span>`
    : `<span class="verchip" data-alc="${verSeq(cv)}" title="${esc(DAYS[di]?.dow||'')} is issued as ${verLabel(cv)}">${verLabel(cv)}</span>`
}
/* "NOT YET SIGNED" (owner, 16 Sep 26 — register AM24): on the WORKING copy of a published
   day whose content differs from its signed, issued version — derived from the canonical
   delta (notYetSigned), never from the raw pending marks — and never on the issued face
   (PV). ONE body for both working-copy surfaces, the week's day head and the scheduler
   board's publish strip ([HUMAN-RETEST] the amendment system, walk S5, 24 Sep 26: the board
   never drew it, so the same day read signed-clean there and "Not yet signed" on the week).
   Read on the LIVE day: inside a withDaySnap swap the day diffs against itself. */
export function nysMarkHTML(di:any){
  return (!PV&&notYetSigned(di))?`<span class="nysmark" title="This working copy has edits that have not been signed and published yet — the published schedule stays as-is until you publish">Not yet signed</span>`:''
}
/* THE VIEW-ONLY WEEK'S DRAFT PICKER (owner, 15 Aug 26 — "on view schedule
   mode, you can also view the different drafts"). The view page deliberately
   never grew the version machinery — issued schedules only — and it still
   hasn't: this select lists ONLY the day's drafts, never ORIG/ALn, and only
   exists once drafts do. The selected draft reads as value 'live' (marked ●)
   because the live day IS it; the rest go through the same DPREV/'d:' frozen
   preview the edit surfaces use, read-only banner and all. Same data-dver
   attribute, so Shell.tsx's one document change listener routes it with no
   new wiring. */
export function viewDraftSelHTML(di:any){
  const drs=dayDrafts(di)
  if(!drs.length)return ''
  const selId=curDraftId(di)
  const cur=DPREV.has(di)?String(DPREV.get(di)):'live'
  return `<select class="dver" data-dver="${di}" title="This day has alternate drafts — pick one to view">`
    +drs.map((t:any)=>{const v=t.id===selId?'live':'d:'+t.id
      return `<option value="${esc(v)}"${v===cur?' selected':''}>${esc(t.name)}${t.id===selId?' ●':''}</option>`}).join('')
    +`</select>`
}
/* THE VIEW PAGE'S ONE VERSION CONTROL (owner, 15 Aug 26). Once a day is
   PUBLISHED the drafts-only picker above is withdrawn — stored alternatives
   are the scheduler's business once a document is out — and the viewer gets
   exactly two entries instead: the issued document (the default; the frozen
   snapshot dayIssuedHTML renders) and the live working copy the scheduler is
   editing toward the next AL, labelled so it can never be mistaken for the
   issued schedule. data-vwork, not data-dver: the choice is VWORK view
   state, per-day, and Shell.tsx's change listener routes it separately —
   deliberately NOT the DPREV machinery, so an edit-page preview can never
   bleed into the view page or vice versa. An UNPUBLISHED day keeps the
   drafts-only picker unchanged. */
export function viewVerSelHTML(di:any){
  di=+di
  if(!dayApproved(di))return viewDraftSelHTML(di)
  const cv=dayCurVer(di)
  if(cv==null)return ''   // published with no snapshot — probe/import state, nothing to offer
  const work=VWORK.has(di)
  return `<select class="dver" data-vwork="${di}" title="This day is published — view the issued schedule or the working draft">`
    +`<option value="issued"${work?'':' selected'}>${esc(verLabel(cv))} — as issued</option>`
    +`<option value="working"${work?' selected':''}>Working draft — not issued</option>`
    +`</select>`
}
export function legendHTML(){
  return `<span><i style="background:var(--fcp)"></i>FCP (pilot)</span><span><i style="background:var(--rcp)"></i>RCP (WSO)</span><span data-leg="pers"><i style="background:var(--pers);box-shadow:inset 0 0 0 1px var(--pers-line)"></i>Personnel (ground crew)</span>
    <span style="margin-left:8px">Level:</span>
    <span><span class="qk" style="background:var(--q-ocu)">O</span>OCU</span>
    <span><span class="qk" style="background:var(--q-d)">D</span>D</span>
    <span><span class="qk" style="background:var(--q-c);color:#04222b">C</span>C</span>
    <span><span class="qk" style="background:var(--q-b);color:#2a1e02">B</span>B</span>
    <span><span class="qk" style="background:var(--q-a)">A</span>A</span>
    <span><span class="qk" style="background:var(--q-ins)">IW</span>IWSO</span>
    <span><span class="qk" style="background:var(--q-ins)">IP</span>IP</span>
    <span><span class="qk" style="background:var(--q-ins)">IR</span>IR exmr</span>
    <span><span class="qk" style="background:var(--q-ins)">FI</span>FWI</span>
    <span style="margin-left:8px"><span class="qk" style="background:var(--me)">▮</span>you</span>
    <span><span class="qk" style="background:#1E86FF">▮</span>selected</span>
    <span style="margin-left:8px">Flags:</span>
    <span><span class="qk" style="background:#F0555F">C</span>conflict</span>
    <span><span class="qk" style="background:#F0555F">CP</span>crew pairing — not authorised</span>
    <span><span class="qk" style="background:#F0555F">R</span>crew rest</span>
    <span><span class="qk" style="background:#F0555F">7</span>no break day</span>
    <span><span class="qk" style="background:#F0555F">Q</span>qual / illegal seat</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">DT</span>double turn</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">TT</span>tight turn</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">A</span>advisory — shift + ground</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">CP</span>crew pairing — needs approval</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">B</span>no flight brief</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">B</span>no sim brief</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">D</span>no flight debrief</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">D</span>no sim debrief</span>
    <span><span class="qk" style="background:#8A96A3;color:#0B0D10">L</span>long work day</span>`;
    /* (the "Sections:" colour key used to sit here — removed on request; each section
       still carries its own coloured left bar, which is self-explanatory in place.) */
}
/* quotes matter: esc() output lands inside double-quoted attributes in a dozen
   places, so a remark containing a " used to close the attribute — truncating
   the field on the next render and injecting whatever followed */
/* `oil` (7th, optional — [OIL-AUTO-REMOVE] §2.1 item 3 / §2.10): the OIL
   decoration this puck wears. Two quite different jobs, both of them the man's
   DAY figure rather than what one event earned:
     · inside the board's OIL mode, `{on,amt}` glows the puck and prints FO / HO
       in place of the qualification letter, so every tap shows its consequence;
     · on the issued schedule, `{bar:'FO'|'HO'}` draws the green edge down the
       puck's left side — full height for a full day, a shorter paler bar for a
       half (the owner picked this over a chip: it costs no width, so no callsign
       clips and the measured puck geometry is untouched).
   Optional and absent by default, so the ten other call sites and the byte-exact
   reference parity are unchanged — five days a week nothing is emitted at all. */
export function puck(id:any,warn:any,sm:any,flag:any,dash?:any,trace?:any,oil?:any){
  const p=PEOPLE[id]; if(!p)return'';
  if(p.special){   // sentinel puck: canonical size, no seat/qual/SANS decoration
    /* A SENTINEL WEARS THE BAR ONLY WHEN THE PEOPLE BEHIND IT AGREE (§7.6, as the
       owner refined it: "if everyone in the all avail or all puck is granted OIL,
       it should be green"). ALL / ALL AVAIL is not a person and cannot carry a
       person's figure — the men behind one puck can earn a full day, a half day
       and nothing at once — so a MIXED puck wears no bar and its count chip says
       so instead. The caller decides which of the four states this is. */
    return `<span class="puck allavail${sm?' sm':''}${oilCls(oil)}" tabindex="0" data-person="${id}" title="${esc(p.cs)}${oilTtl(oil)}"><span class="nm">${esc(p.cs)}</span></span>`;
  }
  const cls=['puck']; if(p.seat==='RCP')cls.push('r'); if(p.pers)cls.push('pers'); if(sm)cls.push('sm');
  if(warn){cls.push('warn'); if(warn==='hard')cls.push('hard'); else if(warn==='note')cls.push('note');}
  /* conflict / crew rest / qual / missed brief → red box. `dash` swaps the
     stroke without touching the colour: a crew-rest breach a scheduler
     sanctioned with a `late show` remark is the same red warning, drawn so
     the reader can see somebody meant it (owner, 6 Aug 26). Gated on the
     PRINTED flag being CR, not merely on dash: a man can carry a sanctioned
     late show AND an unrelated conflict, and the conflict outranks it for the
     chip — dashing that ring would caption someone else's warning as
     "sanctioned". The ring belongs to the flag it shows. */
  /* A CR flag that came off the TRACE is not this man's own breach — he flew a
     legal day, it is tomorrow he wrecks — so it must never ring solid red. The
     dotted ring below is its whole visual, and the red-box branch stands down
     for it. Any other flag still owns the box: the trace is additive, and
     boxred is a box-shadow while boxdot is an outline, so both can be worn at
     once by a man who has a conflict of his own AND breaks tomorrow's rest. */
  /* …and since 5 Sep 26 the RUN trace too: the '7' on a puck that is a day
     of a run breaking later in the week. Each flag is owned by the trace
     only when the trace carries THAT kind, so a man's own CR breach beside
     a run trace keeps its solid box. */
  const trFlag=!!trace&&((flag==='CR'&&trace.leaveBy!=null)||(flag==='RUN'&&!!trace.run));       // the printed flag came off the trace
  /* The box follows the SEVERITY the rule was raised at (owner, 10 Aug 26).
     NB and SB used to sit here, so a man whose brief was merely eaten wore a
     red box over an amber ring — the puck said "warning", the checks list
     said "advisory". They are adv (owner, 4 Aug 26: the clash carries the
     red, the eaten window is advice on top) so they come off. RUN goes on:
     no-break-day IS hard, and it was the one red rule drawing no box. */
  if((flag==='C'||flag==='CR'||flag==='Q'||flag==='RUN')&&!trFlag)
    cls.push(dash&&flag==='CR'?'boxdash':'boxred');
  if(trace)cls.push('boxdot');
  if(p.san)cls.push('san');                         // SANS → purple right-edge line
  /* Personnel (ground crew) hold no CAT, so no qualification chip — a white
     puck with just the callsign. Every other person keeps their CAT chip. */
  const chipTxt=QCHIP[p.q], chipCls=QCLASS[p.q];
  /* IN OIL MODE THE FIGURE TAKES THE QUALIFICATION LETTER'S PLACE (§2.1 item 3).
     The letter is not what a scheduler is reading in that mode, and the figure has
     to be where the eye already goes or the mode looks broken: unticking one puck
     often changes nothing (another event still spans the day) and occasionally
     costs half a day, so every tap must show its consequence immediately. */
  const qchip=(oil&&oil.amt!==undefined)?oilChipHTML(oil):(p.q?`<span class="role ${chipCls}">${chipTxt}</span>`:'');
  /* The trace speaks in the reader's terms — the day it breaks and the time
     this man had to be gone by — rather than the generic threshold label a CR
     chip carries on the day of the breach itself. Only when the trace OWNS the
     flag: where a louder chip won it, that chip keeps its own caption and the
     trace text rides on the puck title below instead. */
  const trLbl=!trace?'':[
    trace.leaveBy!=null?`Crew rest — ${trace.dow||'the next day'} is broken by this day: he had to leave by ${trace.leaveBy}`:'',
    trace.run?`Consecutive days — ${trace.run.dow||'next Monday'} is his ${ordinal(trace.run.n)} day in a row: a break day is due before then`:'',
  ].filter(Boolean).join(' · ');
  const lchip=flag?`<span class="lchip l-${flag.toLowerCase()}" title="${esc(trFlag?trLbl:wlbl(CHIP_LABEL[flag]||flag))}">${chipText(flag)}</span>`:'';
  /* esc() the CALLSIGN in both places, as the sentinel branch above already
     does. A callsign is free text — renameCallsign (slots.ts) only trims and
     de-duplicates it — so one rename containing a quote or an angle bracket
     used to close the title attribute early and inject real markup onto that
     person's puck on every surface it renders (11 call sites, all landing via
     innerHTML). Only the callsign: the rest of the title is our own constant
     text, and CHIP_LABEL legitimately carries `<` and `>` ("Crew rest breach
     (<12h)"), which the reference does not escape — escaping the whole string
     would break the byte-exact markup parity for no safety gain. */
  /* a trace-owned CR says its piece ONCE: the generic "Crew rest breach
     (<12h)" that CHIP_LABEL prints on the day of the breach would sit here
     next to the trace's own sentence and caption a breach this day does not
     have. Any other flag keeps its label and the trace appends to it. */
  const ttl=esc(p.cs)+' · '+(p.pers?'Personnel · ground crew':LEVELNAME[p.q])+(p.sxo?' · SXO':'')+(p.san?' · SANS':'')
    +(flag&&!trFlag?' · '+wlbl(CHIP_LABEL[flag]||flag):'')+(trace?' · '+trLbl:'');
  return `<span class="${cls.join(' ')}${oilCls(oil)}" tabindex="0" data-person="${id}" title="${ttl}${oilTtl(oil)}">${lchip}<span class="nm">${esc(p.cs)}</span>${qchip}</span>`;
}
/* THE GREEN EDGE, and the mode's glow — one place, so the two can never drift.
   `bar` is the issued schedule's mark (§2.10): a 4px SOLID bar down the LEFT
   edge, full height for a full day, the bottom half and a shade paler for a
   half — height is the structural signal that survives colour-blindness, the
   tint is the one that survives being read alone with nothing to compare it to.
   It deliberately does NOT reuse the palette's standby mark (a 2px INSET green
   on `.rpuck.standby`): different weight, its own colour token, and it exists
   only on weekend / public-holiday days, so the two cannot be confused even
   with the palette and the board on screen together.
   `on`/`amt` is the OIL mode's own glow — solid for a full day, an outline only
   for a half (§2.1 item 4). */
export function oilCls(oil:any){
  if(!oil)return '';
  if(oil.bar)return ` oilbar oilbar-${String(oil.bar).toLowerCase()}`;
  if(oil.amt===undefined)return '';
  return oil.on?` oilglow${oil.amt==='HO'?' half':''}`:' oildim';
}
export function oilTtl(oil:any){
  if(!oil||!oil.bar)return '';
  return oil.bar==='FO'?' · earns a full day of OIL':' · earns half a day of OIL';
}
/* the figure the mode prints where the qualification letter sits. A dash means
   "earns nothing from this event" — the man may still have a figure for the day
   off his OTHER events, which is exactly what the mode is for showing. */
export function oilChipHTML(oil:any){
  if(!oil||oil.amt===undefined)return '';
  if(!oil.on)return `<span class="role oilno" title="Earns nothing from this event">—</span>`;
  const amt=oil.amt;
  return `<span class="role oilamt${amt==='HO'?' half':''}" title="${amt==='FO'?'A full day of OIL':amt==='HO'?'Half a day of OIL':'No measurable hours yet'}">${amt||'·'}</span>`;
}

export function slotCell(id:any,sev:any,key:any,kind:any,editable:any,flag:any,dash?:any,trace?:any,di?:any){
  const al=alAttr(key);
  /* THE WEEK'S FLYING SEATS WEAR THE GREEN EDGE TOO (owner, 21 Sep 26). This is
     the week's own cockpit-seat builder — every flying line and every SC shift —
     and it called puck() with six arguments, so the 7th (the OIL decoration)
     was never passed. The week's lSeat comment claimed the mark reached "the
     flying lines"; it reached everything lSeat draws, and lSeat does not draw
     these. Same hole as the board's sbSlot, in the other renderer. `di` is
     optional only so no other caller has to change; the one real caller passes
     it, and without it the seat simply draws as it always did. */
  const oil=(id&&di!=null)?oilSeatDeco(di,id,key).oil:null;
  /* preview: no data-slot, no data-drag — the key addresses the LIVE model */
  if(id) return `<span class="seat"${PV?'':` data-slot="${key}"`}${al}${editable?' data-drag="1"':''}>${puck(id,sev,false,flag,dash,trace,oil)}</span>`;
  if(editable) return `<span class="seat empty-slot" data-slot="${key}"${al}>+ ${kind}</span>`;
  return `<span class="seat"${al}></span>`;
}
export function fmtT(s:any){const m=parseHM(s);return m==null?esc(s||''):hhmm(m);}
export const ORD=['1st','2nd','3rd','4th','5th'];
export function plCols(){return `<div class="pl-cols"><span class="h-nm">Name</span><span class="h-st">Start</span><span class="h-en">End</span><span class="h-pp">People</span><span class="h-rk">Rmks</span></div>`;}
/* AN EXEMPT DESK'S PUCK FOLLOWS ITS OWN RULES AND NOTHING ELSE (sweep, 7 Sep
   26 — the 11 Aug 26 owner word for exempt flying seats, "the rings should
   also follow", which never reached the duty rows: a clean AVALON desk wore
   the man's worst warning from anywhere in the day). A row on a `noconf`
   block (AVALON's or BB's desk) reads the day's warning list for entries
   ANCHORED to that row — or naming it as the other half of a same-hours pair
   (`also`, the seat-anchored DOUBLE_BOOK) — and naming this man: the
   availability look (DNIF_FLY / LEAVE_FLY) and the one-man-two-places clash
   (DOUBLE_BOOK), the only codes a desk can carry, all hard, so it rings red
   or not at all. Returns undefined for an ordinary desk (day-wide decoration,
   unchanged), null for a clean exempt row, 'C' for a lit one. One body for
   the week (lSeat) and the board (sbSeat) so the two cannot drift. */
export function exemptDeskOwn(di:any,key:any,id:any){
  const m=/^d:(\d+)\.(\d+)\.(\d+)/.exec(String(key||'')); if(!m)return undefined;
  const dw=((DAYS[+m[1]]||{}).dutywaves||[])[+m[2]]; if(!dw||!dw.noconf)return undefined;
  if((PV&&!OFW)||!id)return null;   /* official face shows these flags too (§8, Codex CRPF-008) */
  const rk=`d:${m[1]}.${m[2]}.${m[3]}`, g=WARN.byDay[di];
  const hit=((g&&g.warns)||[]).find((x:any)=>(x.code==='DNIF_FLY'||x.code==='LEAVE_FLY'||x.code==='DOUBLE_BOOK')
    &&(x.who||[]).includes(id)&&(x.key===rk||x.also===rk));
  return hit?'C':null;
}
/* one crew position inside a list cell (programme / duties / sims / ground).
   Draggable in edit mode; renders nothing when empty so cells stay clean. */
export function lSeat(di:any,id:any,key:any,ed:any){
  if(!(id&&PEOPLE[id]))return '';
  /* OIL IS SHOWN POSITIVELY ([OIL-AUTO-REMOVE] §2.10) — a green bar down the
     puck's left edge on a weekend or public holiday, and nothing at all on the
     other five days. This is the ONE week seat renderer, so the mark reaches the
     flying lines, the sims, the duty desks, the Ground Programme and the Common
     Programme from here. A SENTINEL is not a person and carries its own summary
     instead (§7.6). Deliberately NOT suppressed under a version preview: the bar
     is part of the issued document, and inside the preview DAYS[di] IS the
     snapshot, so the figure it shows is the frozen one the credit came from. */
  const oilDeco=oilSeatDeco(di,id,key);
  const ex=exemptDeskOwn(di,key,id);
  const inner=ex===undefined?puck(id,sev(di,id),true,chip(di,id),dsh(di,id),traceHit(di,id),oilDeco.oil):puck(id,ex?'hard':null,true,ex,false,null,oilDeco.oil);
  return `<span class="seat"${PV?'':` data-slot="${key}"`}${alAttr(key)}${ed?' data-drag="1"':''}>${inner}${oilDeco.chip}</span>`;}
/* THE OIL DECORATION FOR ONE SEAT, in one body shared by the week (lSeat) and
   the board (sbSeat), so the two surfaces can never show a man a different
   figure. For a person it is his own day figure; for a resolved ALL / ALL AVAIL
   puck it is the four-state summary of the people behind it plus the count chip
   that carries the mixed case. */
export function oilSeatDeco(di:any,id:any,key:any,itemOf?:string):{oil:any;chip:string}{
  /* WHICH EVENT this seat belongs to — hoisted, because since O-1 the ordinary
     person's bar needs it too: the figure is his day, but it is only shown on
     the events that counted towards it. `itemOf` is for the one puck that has no
     seat address to resolve — a claim on the inputs strip, which knows its own
     item directly. */
  const item=itemOf!=null?itemOf:oilItemOfKey(di,key);
  if(isSpecial(id)){
    const sum=oilSentinelSummary(di,item);
    if(!sum)return {oil:null,chip:''};
    /* THE VERSION THE CHIP WAS DRAWN IN (Codex OSE-R2-05). The snapshot is
       installed only while this HTML is being built; a tap happens long after,
       when DAYS[di] is the live day again. Without this the chip on an issued
       page would count the men it went out with and the tap would list whoever
       is free today — one number, a different list, on the same puck. Empty
       means the working copy, which is what a tap should read there. */
    const ver=PV&&PVV!=null?String(PVV):'';
    /* THE COUNT NOW SHOWS ON EVERY DAY ([OIL-SEATS-CAN-EARN] step 9, D27), so
       the words have to fit a day that earns nobody anything. Saying "None of
       these 9 earn OIL today" on a Tuesday would be true and useless — nobody
       earns OIL on a Tuesday. On such a day the count IS the whole answer, and
       D37 says to read it as what it is: who has nothing else on at that time,
       not a promise that they will be there. */
    /* NO SINGLE AMOUNT IS TWO DIFFERENT STATES, and reading them as one put a
       false sentence about money on the face of an issued day (walk, 22 Sep 26).
       `bar` is null whenever the men behind the puck do not all get the SAME
       amount — which is true both when some earn nothing AND when every one of
       them earns but at two different rates. The second case was drawn with the
       first's words: a chip reading "30 of 30 earn" captioned "Some of these men
       earn OIL and some do not". Two sentences contradicting each other on one
       puck, over money, on a published document. They are split here. */
    const mixedAmt=sum.earns&&sum.bar==null&&sum.n>0&&sum.earn===sum.n;   // all earn, at different amounts
    const partial=sum.earns&&sum.bar==null&&sum.earn>0&&sum.earn<sum.n;   // some earn, some do not
    const some=mixedAmt||partial;
    const txt=sum.unrecorded?'?':mixedAmt?`All ${sum.n} earn`:partial?`${sum.earn} of ${sum.n} earn`:String(sum.n);
    /* WHICH ANSWER IS THIS ([OIL-SEATS-CAN-EARN] step 10, D37)? Since step 9 the
       same puck can show two different numbers — the list the day went out with,
       and the list as things stand today. A number that does not say which is
       worse than no number, because the scheduler cannot tell whether he is
       reading a record or a live count. One phrase, used here and on the tap. */
    const from=` (${oilFromWords(ver)})`;
    const ttl=sum.unrecorded
      ?'This schedule was issued before the app kept a record of who was behind this puck'
      :(!sum.earns
        ?`${sum.n} with nothing else on at that time — tap to see them`
        :mixedAmt?`All ${sum.n} earn — some a full day, some half a day — tap to see each one`
          :partial?'Some of these men earn OIL and some do not — tap to see each one'
            :sum.bar?`All ${sum.n} earn ${sum.bar==='FO'?'a full day':'half a day'} — tap to see each one`
              :`None of these ${sum.n} earn OIL today — tap to see each one`)+from;
    return {oil:sum.bar?{bar:sum.bar}:null,
      /* data-oilofw: the chip was drawn in the OFFICIAL flag world — the view
         page's ISSUED FACE (OFW), or a draft day the view page resolves in the
         official world (withOfficialWarn — Fable F6: its window drew the
         working world's flags). The window replays exactly that world
         (withChipWorld below). A version preview (PV without OFW) never
         carries it: a past version is read, not checked. */
      chip:`<span class="oilcount${some?' some':''}" data-oilsent="${esc(item)}" data-oilday="${+di}" data-oilver="${esc(ver)}"${(ver?OFW:WARN===officialWarn())?' data-oilofw="1"':''} title="${esc(ttl)}">${txt}</span>`};
  }
  return {oil:oilBarOf(di,id,item),chip:''};
}
/* the people cell itself — a drop target in edit mode (data-fill) */
/* the extra bodies dropped onto a row, after its own seats */
export function moreSeats(di:any,base:any,ed:any){
  const c=base.indexOf(':'); if(c<0)return '';
  const r=rowRef(base.slice(0,c),base.slice(c+1).split('.'));
  return ((r&&r.more)||[]).map((id:any,i:any)=>lSeat(di,id,base+'.x'+i,ed)).join('');
}
/* Every append-capable cell carries a full-width strip under its pucks so there
   is always somewhere to mean "below" — on a row holding a single puck the cell
   is only one puck tall, and without this there is no BELOW to drop into. It is
   invisible until a drag starts, and it never takes the hit test itself, so the
   drop still resolves to the cell and appends. */
/* the one "+ add" strip body — the board's people cells reuse it (board-html.ts)
   so the two surfaces cannot drift (owner, 26 Aug 26 — a full board row swapped a
   seated puck instead of taking a new one, exactly because the board never drew
   this drop-below target the week always has). */
export const ADDZ=`<span class="addz" aria-hidden="true">+ add</span>`;
export function lCell(inner:any,fillKey:any,ed:any,cls:any){
  const live=!!(ed&&fillKey);
  return `<div class="ppl ${cls||''}"${live?` data-fill="${fillKey}"`:''}>${inner||''}`
    +(live?ADDZ:'')+`</div>`;}
/* base+nf give the row its text paths (base='dr:0.1.2', nf='role'); o is the model
   row itself, which supplies the CX / red-flag decoration. Both are optional, so
   any caller that hasn't been converted still renders exactly as before. */
export function plRow(name:any,str:any,end:any,pplHtml:any,base:any,nf:any,ed:any,o:any,rmkTxt?:any){
  const nmi=base?ted(base+'.'+nf,name,ed,'ntx'):esc(name);
  /* t-s / t-e let the phone stack the two times into a single TIME column */
  const t=(v:any,f:any)=>{const c='t t-'+(f==='str'?'s':'e');
    return base?ted(base+'.'+f,v,ed,c):`<span class="${c}">${v?esc(fmtT(v)):''}</span>`;};
  return `<div class="pl-row${rowCls(o)}"><span class="nm">${cxTag(o)}${flagTag(o)}${nmi}</span>${t(str,'str')}${t(end,'end')}${pplHtml||'<div class="ppl one"></div>'}${plRmk(base,ed,o,rmkTxt,lateTagOf(o))}</div>`;}
/* RMKS cell — column 5 on desktop, a full-width strip under the row on a phone.
   Rows addressable through a text key (duties / sims / ground) get an editable cell;
   read-only rows (personal inputs) get a plain one. An empty cell is dropped on the
   phone so the strip never eats a row's worth of height for nothing, but it is kept
   in edit mode because that blank cell is the only place to click to write a remark. */
/* `late` is pre-built badge HTML, not a flag, because the two callers resolve it
   differently — an input row has the input in hand, a promoted row has to walk
   `src` back to it. It leads the cell rather than trailing the text: a remark
   can be long enough to be clipped, and the mark is the part that must survive
   the clip. `has-late` turns the cell into a flex row so the badge sits BESIDE
   the text; `.ntx` is display:block, and without that switch the badge would
   take a line of its own and grow a fixed-height list row. */
export function plRmk(base:any,ed:any,o:any,rmkTxt:any,late?:any){
  const live=ed&&canEditSched();
  /* leading badges in the REMARKS cell: the ⓘ info-only mark (owner, 1 Sep 26 —
     moved here from beside the name, so it shares the one column the late mark
     already uses — remarks is where a reader looks for "why is this line like
     this") then the LATE badge. Both float left via .rmk.has-late so a remark
     wraps beside them; an info item usually has no remark, so the ⓘ sits alone. */
  const lt=fyiTag(o)+(late||''), lc=lt?' has-late':'';
  if(base&&rmkTxt===undefined){
    const v=(o&&o.rmks)||'';
    if(!v&&!live)return `<span class="rmk rk-e${lc}">${lt}</span>`;
    return `<span class="rmk${lc}">${lt}${ted(base+'.rmks',v,ed,'ntx')}</span>`;
  }
  const v=rmkTxt||'';
  return `<span class="rmk${v?'':' rk-e'}${lc}">${lt}<span class="ntx">${esc(v)}</span></span>`;}
/* free-text planning notes attached to a whole block (currently the Sims block).
   Read-only viewers see the note only when there is one; schedulers always get the
   box so there is somewhere to write before anything has been written. */
/* The scheduler's hand-over note for one block of the day. Scheduler-side by
   default (edit week + board), so the view-only week — the ISSUED programme —
   normally carries none of it. But a scheduler can now MAKE ONE PUBLIC (owner,
   Aug 26): a public note also shows on the view-only week, under the header
   "Notes", while the edit week and board header read "Public notes" and carry
   the toggle. The public flag is view.NOTEPUB, keyed by this note's own funnel
   key. On the view-only week a public note prints only when it has text (an
   empty box is nothing to issue); note that a public note whose SECTION has no
   rows on the view-only week is not drawn, because the empty section itself is
   not — an acceptable edge, the note still reads on the edit side. Reading a
   scheduler-side note is open to any scheduler-side viewer; only writing (and
   flipping the public flag) needs canEditSched(). */
export function blkNoteHTML(di:any,d:any,ed:any,key:any,field:any){
  const k=`${key}:${di}`, v=d[field]||'', a=alAttr(k), pub=notePub(k);
  if(!ed){
    if(!pub||!v)return '';
    return `<div class="blknote-h">Notes</div><div class="blknote"${a}>${esc(v)}</div>`;
  }
  const ce=canEditSched();
  return `<div class="blknote-h">${pub?'Public notes':'Scheduler notes'}${ce?notePubTog(k,pub):''}</div>`
    +(ce
      ? `<div class="blknote ed" contenteditable="true" spellcheck="false" data-txt="${key}:${di}"${a}>${esc(v)}</div>`
      : `<div class="blknote"${a}>${esc(v)}</div>`);
}
/* The show-on-view-only toggle that rides a scheduler-note header, on the edit
   week and the board alike. One builder so the two surfaces cannot drift. */
export function notePubTog(k:any,pub:any){
  return `<button class="notepub${pub?' on':''}" data-notepub="${esc(k)}" title="${pub?'Showing on the view-only schedule — tap to keep it scheduler-only':'Show this note on the view-only schedule'}">${pub?'On view-only ✓':'Make public'}</button>`;
}
/* Available-crew block: active aircrew by wave, then SANS grouped separately (they run to
   different currency requirements — see sanStatus()). Rendered at the bottom of the day.
   OPEN by default now (owner, Aug 26 — "all available crew section will open by
   default in edit schedule"); the header toggles per day through AVSHUT, which
   tracks the days the scheduler has folded (reversing the 13 Aug 26 "the window
   is pretty big" collapse-by-default). Expanded, a wave
   line counts EVERYONE who can fly it — its own leftovers PLUS the all-day
   crew, who are by construction free for every wave — because the old
   leftovers-only count printed "— none free —" over a wave 22 people could
   fly, and the owner read that as a bug (13 Aug 26; it was the panel lying,
   not the engine). The grids still list each man once: the wave rows keep
   only the partially-free, the all-day crew keep their own group. */
/* ---- what [ALL-AVAIL-WINDOW] draws, exported rather than copied (D38) ----
   The window draws REAL PUCKS carrying the same warning flags the rest of the
   app draws. Both helpers live HERE, beside the four PV-gated lookups they use,
   and are exported instead of being re-derived in the window's own file.

   THE REASON IS NOT TIDINESS. `sev`/`chip`/`dsh`/`traceHit` each null out under
   PV — a frozen snapshot must not read live WARN — and a second reader that
   forgot that gate would flag an ISSUED document from today's warnings. That is
   the same shape as the defect D44 exists to stop, and the codebase has already
   paid for it once (the chip and its tap were two readers, which is how a chip
   reading 27 sat over a tap saying nobody was behind the puck). One drawer. */
export function personPuckHTML(di:any,id:any,oil?:any){
  return puck(id,sev(di,id),true,chip(di,id),dsh(di,id),traceHit(di,id),oil)
}
/* Every warning this man carries on this day, worst first, in the words the
   warning list already uses. D36/D38: the window SHOWS the clash and lets the
   scheduler judge it — it must never filter the man out, which is the change
   D36 refuses. Returns [] under PV for the same reason the flags do. */
export function personWarnMsgs(di:any,id:any):{sev:string,msg:string}[]{
  if(PV&&!OFW)return []
  const g=WARN.byDay&&WARN.byDay[+di]
  return (((g&&g.warns)||[]) as any[])
    .filter(w=>w&&(w.who||[]).includes(String(id)))
    .map(w=>({sev:String(w.sev||'note'),msg:String(w.msg||'')}))
    .filter(w=>w.msg)
}
export function availHTML(d:any,di:any,ed:any){
  const A=availByWave(d);
  /* in edit mode an available puck is a drag source — drag it straight onto a line,
     a duty, a sim or a programme item */
  const pk=(id:any)=>`<span class="seat"${ed?` data-drag="1" data-person="${id}"`:''}>${puck(id,sev(di,id),true,chip(di,id),dsh(di,id),traceHit(di,id))}</span>`;
  const active=(ids:any)=>ids.filter((id:any)=>!PEOPLE[id].san);
  /* pilots-then-WSOs in CAT-ladder order (owner, 24 Aug 26 — the same reading
     order as the add-people picker; byCrew is the shared comparator). availByWave
     hands these back callsign-sorted; this is a display re-order only. */
  const grid=(ids:any)=>ids.length?`<div class="ap-grid">`+[...ids].sort(byCrew).map(pk).join('')+`</div>`:`<div class="ap-empty">— none free —</div>`;
  const bandTxt=(w:any)=>{const a=w.s>0?hhmm(w.s):'AM', b=w.e<1440?hhmm(w.e):'end';return `${a}–${b}`;};
  /* SANS AVAILABILITY LEFT THIS PANEL ENTIRELY (owner, 14 Aug 26) — it used to
     list every SANS body availByWave found free, which is the wrong
     question: it never asked what a SANS man had actually OFFERED, only
     whether nothing else was on his day. SANS crew now read from their own
     filed records in the card grid below the input blocks (sansCardsHTML),
     so this panel keeps a single count — how many SANS are offering
     ANYTHING today — as a pointer to that grid, not a second listing of it. */
  const sansOffering=Object.keys(PEOPLE).filter((id:any)=>PEOPLE[id].san&&!PEOPLE[id].archived&&sansAvailOn(id,d.dt)).length;
  const allA=active(A.anyWave);
  if(AVSHUT.has(di)){
    const parts=[`${allA.length} all day`];
    A.wins.forEach((w:any,i:any)=>{const n=active(A.byWave[i]).length;
      if(n)parts.push(`+${n} ${w.night?'night':(ORD[i]||(i+1)+'th')+' wave'}`);});
    parts.push(`${sansOffering} SANS offering`);
    return `<div class="availpuck sec sec-avail"><div class="ap-h" data-avtog="${di}">`
      +`<span>Available crew</span><span class="n">${parts.join(' · ')} ⌄</span></div></div>`;
  }
  let h=`<div class="availpuck sec sec-avail"><div class="ap-h" data-avtog="${di}">`
    +`<span>Available crew</span><span class="n">by wave · close ⌃</span></div>`;
  if(A.wins.length){
    A.wins.forEach((w:any,i:any)=>{const ids=active(A.byWave[i]), total=ids.length+allA.length;
      h+=`<div class="ap-grp">${ORD[i]||(i+1)+'th'} wave${w.night?' · night':''} <span style="color:var(--ink-3);font-weight:500">${bandTxt(w)}</span> · ${total} can fly</div>`;
      h+=ids.length?grid(ids):(total?`<div class="ap-empty">all of them are under Available all day ↓</div>`:`<div class="ap-empty">— none free —</div>`);});
    h+=`<div class="ap-grp">Available all day · ${allA.length}</div>`+grid(allA);
  } else {
    h+=`<div class="ap-grp">Available all day · ${allA.length}</div>`+(allA.length?grid(allA):`<div class="ap-empty">Everyone is on the programme.</div>`);
  }
  return h+`</div>`;
}
/* ---- SANS AVAILABILITY, ONE CARD GRID (owner rework, 14 Aug 26) ----------
   The old per-record ROW — a full-width strip of typeable time/remarks
   cells — made sense when the owner had a handful of SANS filing hours; with
   26 in real use, 26 full-width rows is the wrong shape. One shared builder
   now backs BOTH the week's SANS group (sansSectionHTML below) and the
   board's SANS panel (sbSansPanel, ui/board-html.ts) so a scheduler reads
   the identical grid wherever they open it — sansCardsHTML is exported for
   exactly that second caller. A card is: the puck, the record's own window
   as plain text, the offered-event letters (--san purple, the .sansb
   family), and the remarks, ellipsized. The whole card is the click target —
   it carries the SAME data-inpedit address inpEditLabel already builds
   (the input's stable inpId), so the delegated click router in interactions.ts
   needs no new wiring to open the input-edit dialog from it. `ro` (a read-only board)
   withholds that attribute and draws a plain, unclickable div instead of a
   button — the same editable/read-only split every other input row already
   makes (see inpEditLabel itself). */
const SANS_COMBO_ORDER=['F/O/A','F/O','F/A','O/A','F','O','A'];
function sansCardTime(rec:any){
  if(rec.allday)return 'all day';
  if(rec.half==='am')return 'AM';
  if(rec.half==='pm')return 'PM';
  if(rec.s!=null&&rec.e!=null)return `${hm24(rec.s)}–${hm24(rec.e)}`;
  return 'all day';                    // a thin record fails open, same as sansWindow
}
/* ORDER (owner spec, 14 Aug 26): a bounded window (not all-day) first,
   earliest start first — sansWindow already answers "AM sorts as 0, PM as
   721" for the two half-day cases, so this needs no separate am/pm case of
   its own. All-day records follow, grouped by which events they offer, in
   ONE fixed combo order: sansLetters always prints f/o/a in that order, so
   the seven possible combinations ARE the seven strings in SANS_COMBO_ORDER
   — no group headers, because the letters already printed on each card say
   which group it is in. Array.prototype.sort is stable (ES2019+), so
   records that tie on both keys keep whatever order the caller handed in. */
export function sansCardsHTML(rows:any[],di:any,ro?:any){
  if(!rows||!rows.length)return '';
  const ordered=rows.slice().sort((a:any,b:any)=>{
    const at=!a.allday, bt=!b.allday;
    if(at!==bt)return at?-1:1;
    if(at)return sansWindow(a)[0]-sansWindow(b)[0];
    const ai=SANS_COMBO_ORDER.indexOf(sansLetters(a)), bi=SANS_COMBO_ORDER.indexOf(sansLetters(b));
    return (ai<0?SANS_COMBO_ORDER.length:ai)-(bi<0?SANS_COMBO_ORDER.length:bi);
  });
  return `<div class="sanscards">`+ordered.map((inp:any)=>{
    const pk=PEOPLE[inp.person]
      ? puck(inp.person,sev(di,inp.person),true,chip(di,inp.person))
      : `<span class="itxt">${esc(inp.person)}</span>`;
    const letters=sansLetters(inp);
    const rmk=String(inp.remarks||'').trim();
    const inner=`<span class="sanscard-top">${pk}${letters?`<span class="sanscard-l">${esc(letters)}</span>`:''}</span>`
      +`<span class="sanscard-t">${esc(sansCardTime(inp))}</span>`
      +(rmk?`<span class="sanscard-r" title="${esc(rmk)}">${esc(rmk)}</span>`:'');
    return ro
      ? `<div class="sanscard">${inner}</div>`
      : `<button class="sanscard" data-inpedit="${esc(inpId(inp))}" title="Edit this input — times, type, remarks or delete">${inner}</button>`;
  }).join('')+`</div>`;
}
/* the week's own wrapper — same `.sub.plist.one.sec.sec-sans` shape (and the
   same purple left-bar contract) every other input group under dayHTML
   wears, scheduler-side only like Personal Inputs: a member files this on
   the Inputs page, a scheduler reads it here. Unlike the board's panel
   (always drawn, empty state and all — see sbSansPanel) this keeps inGrp's
   old convention of printing NOTHING when there is nothing to show: the week
   is the day's working surface, not a squadron-wide list that owes an
   explicit "nil" every single day. */
export function sansSectionHTML(d:any,di:any,ed:any){
  if(!ed)return '';
  const rows=INPUTS.filter((inp:any)=>inputCoversDate(inp,d.dt)&&isSansAvail(inp.type));
  if(!rows.length)return '';
  return `<div class="sub plist one sec sec-sans"><div class="sub-h">SANS Avail`
    +`<span class="pl-hint">press a card to edit</span></div>`
    +sansCardsHTML(rows,di,false)+`</div>`;
}
export function storesView(o:any){
  o=o||{};
  const on=STORE_CFG.filter(([k]:any)=>o[k]);
  if(!on.length&&!o.bombs)return'';
  return `<span class="stores">`+on.map(([,lab]:any)=>`<span class="stchip on">${esc(lab)}</span>`).join('')+(o.bombs?`<span class="stchip bomb">◈ ${esc(o.bombs)}</span>`:'')+`</span>`;
}
/* the day's issue strip. Collapsed it is a one-line summary; expanded (DWOPEN)
   it lists the warnings right here in the column — no centred modal. */
/* THE CROSS-DAY STRIP: what this day does to the next one. A crew-rest breach
   is raised where the man is TOLD TO REPORT, so the day that caused it — the
   only day a scheduler can still change — used to say nothing at all. It sits
   INSIDE the day's issue list, below the warnings and above the advisories
   (owner, 7 Aug 26 — red business, but tomorrow's), in the same row box as its
   neighbours (the container is display:contents; the dotted bar and the pink
   label are the identity, not a different box). Deliberately outside the
   ⚠ count above it: these are not this day's issues, they are its
   consequences, and inflating the day's issue count with tomorrow's warning
   would make two days report the same breach.
   Each row carries the NEXT day's (di, ix), so the ordinary .witem handler
   navigates it with no new click path — and a row whose warning has moved
   under an edit (WARN is rebuilt wholesale) is dropped rather than left
   pointing at whatever now sits at that index.

   ON DEMAND, not standing (owner, from the deployed site, 7 Aug 26). It used
   to paint with nothing clicked, which put several lines of tomorrow's prose
   on top of a day whose own issue list was still collapsed — the day read as
   though it had a problem of its own. It now needs an ASK: the day's warning
   list open, or that man's puck clicked. What stays standing is the mark on
   the PUCK — the dotted ring and its R tag (owner's call, same message) — so
   the day still says "there is something here, and here is where to click"
   without saying what. That is the whole difference from the pre-6 Aug
   behaviour this looks like a revert to: back then only focusing the warning
   itself revealed the cause, so you had to already know; now the day tells
   you where to look, and opening the list is enough to be told. */
function dayTraceHTML(di:any,pf:any){
  if(PV&&!OFW)return '';
  if(!pf&&!DWOPEN.has(di))return '';
  /* one trace object can carry TWO rows since 5 Sep 26: the crew-rest
     fields (top level) and the run trace (`run`) — each resolves its own
     warning on its own breach day (tdi), so they are split here */
  const rows=tracesOn(di)
    .filter(({id}:any)=>!pf||id===pf)
    .flatMap(({id,t}:any)=>[
      ...(t.leaveBy!=null?[{id,t,kind:'CR',tdi:t.di,ix:t.di==null?-1:traceIx(t,id)}]:[]),
      ...(t.run?[{id,t,kind:'RUN',tdi:t.run.di,ix:t.run.di==null?-1:traceIx(t,id,'RUN')}]:[]),
    ])
    /* tdi==null is the FORWARD trace across the week edge (validate.ts's
       phantom next-Monday pass): the breach it points at lives on next
       week's Monday, a day this week's warning list cannot address — so
       there is no warning index to resolve and none is required. Every
       other trace still drops out when its warning no longer resolves. */
    .filter((r:any)=>r.ix>=0||r.tdi==null);
  if(!rows.length)return '';
  return `<div class="dwtrace">`+rows.map(({id,t,kind,tdi,ix}:any)=>{
    const cs=PEOPLE[id]?PEOPLE[id].cs:id;
    /* THE RUN ROW (owner, 5 Sep 26): the same box crew rest draws, saying
       which day the run breaks on. Nothing to pan to — the cause is the
       whole run, not one sortie — so no wpd/wpk; the jump still focuses the
       breach on its own day, or is inert for next Monday. */
    if(kind==='RUN'){
      const r=t.run;
      const onR=r.di!=null&&WFOCUS&&WFOCUS.di===r.di&&WFOCUS.ix===ix;
      const addrR=r.di!=null?` data-wdi="${r.di}" data-wix="${ix}" title="Jump to the day the run breaks"`
                            :` title="Next week's Monday — load it to see the breach itself"`;
      return `<div class="witem hard wtr${onR?' on':''}"${addrR}>`
        +`<span class="wbar"></span><span><span class="wcode">Breaks ${esc(r.dow||'next Monday')}</span>`
        +`<b>${esc(cs)}</b> — his ${ordinal(r.n)} day in a row falls on ${esc(r.dow||'next Monday')}; a break day before then clears it.</span></div>`;
    }
    /* THE VIEW STAYS HERE (owner, from the deployed site, 7 Aug 26). The row
       still addresses the NEXT day's warning — that breach is what gets focused,
       and his pucks there light — but the pan lands on the leg on THIS day that
       caused it. The row's own prose already says which day breaks; what it
       cannot show is which sortie ran late, and that is the only thing on the
       page a scheduler can still move. `wpd` is this day (the builder's own di,
       so it cannot disagree with where the row is drawn) and `wpk` the causing
       leg's slot-key; interactions.ts hangs them on the focus and
       scrollToWarnFocus prefers them. Absent fromKey emits neither and the row
       behaves exactly as it did. */
    const pan=t.fromKey?` data-wpd="${di}" data-wpk="${esc(t.fromKey)}"`:'';
    /* the active mark keys on the address the row CARRIES — the next day's
       warning — because that is what a click on it focuses */
    const on=tdi!=null&&WFOCUS&&WFOCUS.di===tdi&&WFOCUS.ix===ix;
    /* the forward (cross-week) trace carries no data-wdi: there is no
       warning on THIS week to focus — interactions.ts's `.witem[data-wdi]`
       branch simply never matches it, so a tap is inert rather than a
       misfire. The breach itself appears on Monday when next week loads. */
    const addr=t.di!=null?` data-wdi="${t.di}" data-wix="${ix}"${pan} title="Jump to the line on this day that caused it"`
                         :` title="Next week's Monday — load it to see the breach itself"`;
    return `<div class="witem hard wtr${on?' on':''}"${addr}>`
      +`<span class="wbar"></span><span><span class="wcode">Breaks ${esc(t.dow||'the next day')}</span>`
      +`<b>${esc(cs)}</b> — had to leave by <b>${esc(t.leaveBy)}</b>. ${esc(t.msg||'')}</span></div>`;
  }).join('')+`</div>`;
}
/* A day with no issue box of its own still shows the trace in the SAME
   geometry as everyone else's rows (owner, 7 Aug 26 — its old private
   container was a different width and a different box, which read as a
   different kind of thing). `solo` restores the top border .dwlist sheds
   when a .daywarn header sits above it. */
const soloTrace=(di:any,pf:any)=>{
  const t=dayTraceHTML(di,pf);
  return t?`<div class="dwbox open"><div class="dwlist solo">${t}</div></div>`:'';
};
/* the year whose leave war period is missing, for the one check that offers to
   create it — '' for every other check, for a member, and whenever a period
   already covers the day. Asked of the hook, so the button and the sentence
   beside it cannot ever name different years. */
/* EXPORTED because the board's side panel draws this same check (boardWarnHTML
   in ui/board.ts) and carried only the mute ✕ — so on the one surface where a
   scheduler actually works the day and publishes it, the app named what was
   missing and offered no way out (walk find, 22 Sep 26, on Sat 6 Feb 28). One
   body, so the button and the sentence beside it can never name different
   years, and only this check ever grows an action. */
export function mkPeriod(w:any,di:any){
  return w&&w.code==='OIL_NO_PERIOD'&&canEditSched()?HOOKS.oilNoPeriod(+di):'';
}
export function dayWarnHTML(di:any){
  const all=(WARN.byDay[di]&&WARN.byDay[di].warns)||[];
  /* When a puck is clicked the box narrows to that person's issues on this day
     — every other day they are flagged on opens the same way, so a cause that
     sits on the day before is right there next to the effect. */
  const pf=PFOCUS&&PFOCUS.id;
  /* THE "GOES AWAY / NEW ONCE SIGNED" DIFF (published-schedule flagging, §6/§14.5).
     On the WORKING view of a published day whose working copy diverges from the
     signed version, mark each warning the unpublished edit will ADD ("new once
     signed") and, struck through, each one it will CLEAR ("goes away once signed").
     Gated hard so a non-diverged / unapproved / official-face render is byte-identical
     (parity): OFF the official face (!OFW), the day is published, and OFFICIAL is a
     DISTINCT bundle from WORKING (the alias means no divergence anywhere). Keyed by
     code + who + flag-day + cause-day, message EXCLUDED so a within-threshold edit
     does not mark spuriously (§14.5). Computed BEFORE the empty-list early return
     (Codex CRPF-012) so a hidden fix that clears the LAST warning still shows its
     "goes away" row; person-filtered so a pf-focused box shows only that person's. */
  const diffMode=!OFW&&dayApproved(di)&&officialWarn()!==WARN;
  const inPf=(w:any)=>!pf||(w.who||[]).includes(pf);
  const wkey=(w:any)=>`${w.code}|${(w.who||[]).slice().sort().join(',')}|${w.di}|${w.prevDi==null?'':w.prevDi}`;
  const offW:any[]=diffMode?((officialWarn().byDay[di]&&officialWarn().byDay[di].warns)||[]).filter(inPf):[];
  const workKeys=new Set(all.filter(inPf).map(wkey));
  const offKeys=new Set(offW.map(wkey));
  const goneW=diffMode?offW.filter((w:any)=>!workKeys.has(wkey(w))):[];
  const sigNew=(w:any)=>diffMode&&!offKeys.has(wkey(w))?`<span class="wsig new" title="This warning is not on the signed version — publishing this day adds it">new once signed</span>`:'';
  const items=pf?personWarns(di,pf):all.map((w:any,ix:any)=>({w,ix}));
  /* the strip stands on its own: a day with no issues of its own can still be the
     day that wrecks tomorrow, or one whose only issues clear once signed — both
     worth seeing. Only bail when there is genuinely nothing to show. */
  if(!items.length&&!goneW.length)return soloTrace(di,pf);
  const dw=items.map((x:any)=>x.w);
  /* the header count stays the TRUE total — muting a check declutters the
     list, it does not change what the day is (the board does the same). So
     worst / nh / the issue count all read `dw`, the full set including any
     muted rows; only the LIST below drops them. When the working day is clean but
     signed warnings remain to clear, the header names those instead. */
  const sevOfList=(ls:any[])=>ls.some((w:any)=>w.sev==='hard')?'hard':ls.some((w:any)=>w.sev==='adv')?'adv':'note';
  const worst=dw.length?sevOfList(dw):sevOfList(goneW);
  const nh=dw.filter((w:any)=>w.sev==='hard').length;
  const open=DWOPEN.has(di);
  const cs=pf&&PEOPLE[pf]?PEOPLE[pf].cs:'';
  let h=`<div class="dwbox ${open?'open':''}${pf?' pfoc':''}" data-dwbox="${di}">`
   +`<div class="daywarn ${worst}" data-daywarn="${di}">`
   +`${pf?`<span class="dwwho">${esc(cs)}</span>`:''}`
   +(dw.length
      ? `<b>⚠ ${dw.length} issue${dw.length>1?'s':''}</b>${nh?` · ${nh} warning`:''}`
      : `<b>⚠ ${goneW.length} to clear once signed</b>`)
   +` · <span class="dwcue">${open?'tap to collapse':'tap to review'}</span>`
   +`<span class="dwcar">${open?'▲':'▼'}</span></div>`;
  if(open){
    /* MUTING A CHECK IS AVAILABLE ON EDIT SCHEDULE TOO (owner, 29 Aug 26 —
       "the hide warning option should be available on edit schedule too …
       and both are in sync"). The board already lets a scheduler hide one
       check; the mute set (view.WARNOFF) is keyed by the warning's CONTENT,
       not by which surface it was hidden from, so rendering the same ✕ / ↺
       controls here shares that one set — a check hidden on the board is
       hidden on the week and vice versa, no extra wiring. Gated to Edit
       Schedule (editMode()) exactly like the board's canEditSched(): the
       View-only week stays the honest full record with no controls, so its
       markup is byte-identical to before. The ✕/↺ clicks (data-woff) and the
       reveal (data-wmtog) route through the SAME delegated handlers the board
       uses — see interactions.ts. */
    const ed=editMode();
    const row=({w,ix}:any,muted?:boolean)=>{
      const names=(w.who||[]).map((id:any)=>PEOPLE[id]?PEOPLE[id].cs:id).join(', ');
      const on=WFOCUS&&WFOCUS.di===di&&WFOCUS.ix===ix;
      return `<div class="witem ${w.sev}${on?' on':''}${muted?' muted':''}" data-wdi="${di}" data-wix="${ix}" title="Jump to the puck that caused this">`
        +`<span class="wbar"></span><span${ed?' class="wtx"':''}><span class="wcode">${esc(wlbl(WCODE[w.code]||w.code))}</span>`
        +`<b>${esc(names)}</b>${names?' — ':''}${esc(w.msg||'')}${sigNew(w)}</span>`
        +(ed?`<button class="witem-mute" data-woff="${di}.${ix}" title="${muted?'Show this check again':'Hide this check — it comes back if the situation changes'}">${muted?'↺':'✕'}</button>`:'')
        /* THE WAY OUT, BESIDE THE REASON (owner's ruling D19, 22 Sep 26 —
           "indicate that the leave war period doesn't exist, create it"). Only
           this one check carries an action, and only for a scheduler: saying
           what is missing and leaving him to find the Leave War himself is half
           an answer. The year is read from the SAME hook the warning was
           written from, never parsed back out of its sentence. */
        +(mkPeriod(w,di)?`<button class="witem-act" data-mkperiod="${esc(mkPeriod(w,di))}" title="Creates the ${esc(mkPeriod(w,di))} leave war period in draft and takes you to the Leave War to set its bidding window">Create the ${esc(mkPeriod(w,di))} period</button>`:'')
        +`</div>`;
    };
    /* an OFFICIAL-only warning (it clears once the day is signed): struck through,
       non-interactive (its index belongs to the official bundle, not this working
       list), ranked by its own severity among the shown rows. */
    const goneRow=(w:any)=>{
      const names=(w.who||[]).map((id:any)=>PEOPLE[id]?PEOPLE[id].cs:id).join(', ');
      return `<div class="witem ${w.sev} gone" title="On the signed version — publishing this day removes it">`
        +`<span class="wbar"></span><span${ed?' class="wtx"':''}><s><span class="wcode">${esc(wlbl(WCODE[w.code]||w.code))}</span> `
        +`<b>${esc(names)}</b></s> <span class="wsig gone">goes away once signed</span></span></div>`;
    };
    /* split the muted checks out of the visible list (edit only). warnShown
       reads the shared WARNOFF; the hidden ones gather under a "N hidden"
       reveal so they stay reachable to un-mute, the board's shape. */
    const shown=ed?items.filter((x:any)=>warnShown(x.w)):items;
    const hidden=ed?items.filter((x:any)=>!warnShown(x.w)):[];
    /* the cross-day row ranks below this day's warnings and above its
       advisories (owner, 7 Aug 26): it is red business, but tomorrow's.
       items are already severity-sorted (validate.ts), so the seam is the
       first non-hard row. */
    const cut=shown.findIndex((x:any)=>x.w.sev!=='hard');
    const hards=cut<0?shown:shown.slice(0,cut), rest=cut<0?[]:shown.slice(cut);
    const mopen=WMOPEN.has(di);
    h+=`<div class="dwlist">`+hards.map((x:any)=>row(x)).join('')
     +dayTraceHTML(di,pf)
     +rest.map((x:any)=>row(x)).join('')
     +goneW.map(goneRow).join('')
     +(hidden.length
        ? `<div class="wmuted-h${mopen?' open':''}" data-wmtog="${di}" title="Show or hide the checks you have muted">`
          +`<span class="dwcar">${mopen?'▲':'▼'}</span>${hidden.length} hidden</div>`
          +(mopen?hidden.map((x:any)=>row(x,true)).join(''):''):'')
     +(pf&&PFOCUS.days.length>1
        ? `<div class="dwecho">${esc(cs)} is also flagged on ${esc(PFOCUS.days.filter((x:any)=>x!==di).map(dowShort).join(', '))}</div>`:'')
     +(WFOCUS&&WFOCUS.di===di
        ? `<div class="dwecho">The same aircrew are lit dashed on every other day they appear</div>`
          +`<button class="dwclear" data-dwclear="1">✕ ${pf?`Back to ${esc(cs)}’s issues`:'Clear focus'}</button>`:'')
     +`</div>`;
  }
  return h+`</div>`;
}
/* One line's display markup — the leading time bolded AND display-folded to
   hh:mm (owner, 30 Aug 26: every time reads 08:00). The pattern matches the
   whole grammar intimeTime accepts (0900 / 09:00, H/L suffix), and the fold
   is intimeFold — the reader's own twin — so a token the reader skips (2590)
   is left as typed and the fold can never change what a line means. DISPLAY
   only: the model string is untouched here, which is what keeps the seed's
   stored lines byte-identical for parity (the html.test dayHTML compare
   folds the reference's own <b>NNNNH</b> the same way before comparing —
   its noItTime normaliser, a no-op on the port's already-folded output). */
export function intimeLineHTML(t:any){
  return esc(t).replace(/^(\s*)((?:\d{1,2}:\d{2}|\d{3,4})\s*[HL]?)(?![0-9A-Za-z])/i,
    (_,sp,tok)=>`${sp}<b>${intimeFold(tok)}</b>`);}
/* ek — the edit surfaces pass `${di}|${gi}` and the block renders PER-LINE:
   each line its own contenteditable span, each with an ordinary ✕ button
   BESIDE it (owner's iPhone, 21 Aug 26 — a button inside a contenteditable
   region is not reliably tappable on iOS, and typing in one shared block let
   WebKit clone spans and duplicate lines). The wrapper div is NOT editable
   any more; textedit.ts commits one line at a time off data-itline, which is
   what makes a stray span WebKit mints invisible to the commit. */
export function intimesInner(w:any,ek?:any){
  return ((w&&w.intimes)||[]).map((t:any,i:number)=> ek
    ? `<span class="itline" contenteditable="true" spellcheck="false" data-itline="${ek}|${i}">${intimeLineHTML(t)}</span>`
      +`<button class="itx" data-itdel="${ek}|${i}" title="Remove this in-time line" aria-label="Remove this in-time line">✕</button>`
    : `<span>${intimeLineHTML(t)}</span>`).join('');}
/* AREA and TIME are not the model fields they are edited through. Until a
   scheduler types over them they READ OFF THE AIRCRAFT: the distinct area codes on
   the formation, and the formation's own TO–LD. Both surfaces have to agree on that
   or clearing the cell would heal it to '' while the renderer still says SOUTH —
   the model unchanged, the markup unchanged, and the strip blank for good. So the
   derivation lives here once and both callers use it. */
export function areaCodesOf(f:any){
  return [...new Set(((f&&f.aircraft)||[]).map((a:any)=>a.area).filter(Boolean))].join('  ·  ');}
export function areaText(f:any){const c=areaCodesOf(f); return f&&f.area!=null?f.area:c;}
export function atimeText(f:any){const c=areaCodesOf(f);
  return f&&f.atime!=null?f.atime:(c?`${f.to.replace(':','')}-${f.ld.replace(':','')}`:'');}
/* a text-domain time formatter. fmtT() is for markup — it returns esc(s) when the
   value will not parse — so assigning it to textContent double-escapes. */
export function fmtTxt(s:any){const m=parseHM(s); return m==null?String(s==null?'':s):hhmm(m);}
/* is this node already exactly what the given markup would parse to? esc() and the
   innerHTML getter do not escape the same characters — an apostrophe or the
   non-breaking space Chrome inserts for a double space makes a raw string compare
   permanently unequal — so the comparison is done after a round trip. */
export let SCRATCH:any=null;
/* one inline-editable text node. View mode emits exactly what it emitted before
   the B9 refactor (a plain span/b/i), so read-only users see no change at all —
   but they DO get the per-item AL colour, which is the point of alAttr here. */
/* `ph` is ghost text for an EMPTY cell, painted by CSS off data-ph (a
   contenteditable has no placeholder of its own). Emitted on the view branch
   too, not only the editable one — the week is what the squadron READS, and
   the one thing it carries today is MAIN/SPARE on a standalone line. */
export function ted(path:any,val:any,ed:any,cls:any,tag?:any,ph?:any){
  tag=tag||'span';
  const t=TIME_TXT.test(String(path))?fmtT(val):esc(val==null?'':val);
  const a=alAttr(path)+(ph?` data-ph="${esc(ph)}"`:'');
  if(!ed||!canEditSched())return `<${tag} class="${cls||''}"${a}>${t}</${tag}>`;
  return `<${tag} class="${cls||''} txed" contenteditable="true" spellcheck="false" data-txt="${path}"${a}>${t}</${tag}>`;
}
/* Committing inside focusout would tear out the element the user is tabbing
   INTO, so validate now (cheap, no DOM) and defer the re-render to a macrotask
   that bails while focus is still inside some other editable text node. */
export let TXTQ=0;
/* `gr-frominput` tints a ground row that came from a personal input (owner,
   Aug 26 — activity inputs auto-land on the programme now, so the two need
   telling apart). `src` is the accept back-link, set only by acceptInput on a
   promoted ground row (slots.ts) — no aircraft, formation or plain input row
   carries it — so this reads true for exactly the input-derived rows on both
   the week (plRow) and the board (sb-arow), and nothing else. */
/* fyi = the ⓘ info-only flag (owner, 1 Sep 26): quiet styling, never a strike —
   the strike is cancel's language. Emitted only when the flag is set, so the
   seed week's markup — and the view-week reference compare — is untouched. */
export function rowCls(o:any){return (o&&o.cx?' cx':'')+(o&&o.info?' fyi':'')+(o&&o.flag?' redbox':'')+(o&&o.src?' gr-frominput':'');}
/* CX carries its reason: "CX DUE WX" rather than a bare CX, so the next
   scheduler reading the day knows why the line went. */
export function cxText(o:any){const r=o&&o.cxr?String(o.cxr).trim():'';return r?('CX DUE '+r):'CX';}
export function cxTag(o:any){return o&&o.cx?`<span class="cxtag" title="${esc(cxText(o))}">${esc(cxText(o))}</span>`:'';}
export function flagTag(o:any){return o&&o.flag?'<span class="flagtag" title="Flagged for the next scheduler">!</span>':'';}
/* the ⓘ info-only chip (owner, 1 Sep 26): a ground/programme item flagged info
   is shown for information and never checked — the chip says so wherever the
   row prints without its board toggle. It rides in the REMARKS cell (owner,
   1 Sep 26 — moved out of the name column, the same one-column rule the late
   mark follows); plRmk / the peek remarks spans are the callers. '' when unset,
   so the seed week's markup (and the view-week reference compare) is
   byte-identical. */
export function fyiTag(o:any){return o&&o.info?'<span class="fyitag" title="Info only — not checked against the rules, and earns no OIL">ⓘ</span>':'';}
/* THE MAIN/SPARE BADGE ON A STANDALONE LINE (owner, 24 Aug 26 — "for SC, can
   I have the option to change the line to SPARE from MAIN, vice versa. Either
   a button that goes into remarks. Rather than a default main or spare faded
   in the remarks"). The role used to live only as the remarks box's faded
   placeholder, which vanished the moment anything was typed and could never
   be changed. It is a solid badge in the remarks cell now, on every surface
   alike; in edit mode it is a button that FLIPS the line (interactions.ts's
   data-sarole branch). Flipping is an engine-visible change, not a rename —
   scSpare/saExempt/dayCount all hang off a.spare — so the handler goes
   through afterSchedMutate, and the remarks box placeholder is plain
   "Remarks" like every other line. */
export function saRoleText(a:any){return a.role||(a.spare?'SPARE':'MAIN');}
export function saRoleHTML(key:any,a:any,ed:any){
  const sp=!!a.spare, role=saRoleText(a);
  if(!ed)return `<span class="sarole ro${sp?' sp':''}">${esc(role)}</span>`;
  /* the tooltip names the checks that ACTUALLY run on this line (sweep, 7 Sep
     26 — it said "fully cross-checked" on an AVALON MAIN, which is exempt
     whole): an SC MAIN is fully checked; an SC SPARE, and every AVALON / BB
     seat, carry the four standby checks only. The wave is read off the key
     (di.gi…), the same model saExempt reads. */
  const kp=String(key).split('.'), wv=(((DAYS[+kp[0]]||{}).waves||[])[+kp[1]]), whole=!!(wv&&wv.noconf);
  const four=(who:any)=>`${who}checked for availability, SC currency, the front seat and another ${whole?'seat or the desk':'SC seat or the SC desk'} in the same hours only.`;
  const title=sp?`SPARE — standing by; ${four('')} Click to make this line MAIN.`
    :whole?`MAIN — ${four('')} Click to make this line SPARE.`
    :'MAIN — fully cross-checked. Click to make this line SPARE.';
  return `<button class="sarole${sp?' sp':''}" data-sarole="${key}" title="${title}">${esc(role)}</button>`;
}
/* LATE INPUT (owner, 9 Aug 26) — the mark that rides on an input last changed
   after its own week's deadline (engine/inputs.ts's isLateInput). It is drawn
   wherever the input itself is drawn, on every page including View-only, and
   it is deliberately NOT gated on edit mode or on the role: the whole ask was
   that it stick with the input rather than being a scheduler's private note.
   Amber, not red — it is an advisory about paperwork, not a flying fault, and
   it must not read louder than a crew-rest ring sitting next to it.
   It lives in the row's REMARKS cell (owner, 9 Aug 26 — moved out of the name
   and type cells the same day it shipped). Remarks is where a reader already
   goes for "why is this man down", which is the question the mark answers, and
   it leaves the name and type columns reading as pure identity. Every surface
   that draws an input has a remarks cell, so the mark stays in one place
   across all of them — the one exception is the board's promoted ground row,
   whose remarks cell is a bare <input> with nowhere to nest a chip; it keeps
   its amber row edge (see lateRowCls). */
/* THE MARK IS READ HERE, ONCE PER INPUT (owner, 21 Aug 26 — per-input dismissal
   replaced the 20 Aug global switch). All four passive helpers below funnel
   through `isLateInput(inp) && lateShown(inp)`, so a mark a scheduler has
   dropped on the board (state/view.ts's LATEOFF) vanishes at a stroke from
   every READ surface: the board's inputs bands and read-only panels (via
   `sbiRmk`, which calls `lateTag`), the edit week, the view-only week and the
   board's promoted ground row. The board's LIVE input rows draw `lateChip`
   instead — the clickable control that is always present so the dropped state
   stays reachable. The Inputs page keeps its own mark — see LATEOFF in
   state/view.ts. Gated at the UI, never in the engine: `isLateInput` goes on
   answering, and the mark was never a rule (§Stable decisions). */
export function lateTag(inp:any){
  return (inp&&isLateInput(inp)&&lateShown(inp))?`<span class="latetag" title="${esc(lateNote(inp))}">LATE</span>`:'';}
/* THE CLICKABLE LATE CHIP (owner, 21 Aug 26 — "when I click on the late orange
   icon beside the line, it will remove the late icon, if I click the same area
   again it will show"). Unlike lateTag (the passive amber badge the week and
   the read surfaces show), this renders on a late input's LIVE board row
   WHENEVER `isLateInput` — solid amber while the mark shows, a dim ghost once
   dropped — so the same spot stays clickable to bring it back. `data-lateoff`
   carries the input id routeClick toggles; admin-gated there. Nothing on a
   non-late row, so an ordinary row is byte-identical to before. */
export function lateChip(inp:any){
  if(!inp||!isLateInput(inp))return '';
  const off=!lateShown(inp);
  return `<button class="latechip${off?' off':''}" data-lateoff="${esc(inpId(inp))}" aria-pressed="${off?'true':'false'}" title="${off?'LATE mark hidden here and on the week — tap to show it again':'Tap to hide this LATE mark from the board and the week (the Inputs page keeps it)'}">LATE</button>`;}
/* the same mark on a row that CAME from an input — the ground row acceptInput
   builds, which carries the source input's key in `src`. This is what carries
   the mark onto the view-only page for a personal input: accepting it is the
   only way one reaches that page at all, and the mark has to survive the
   promotion or it would vanish exactly where the squadron reads the day. */
export function srcInput(o:any){
  const k=o&&o.src; if(!k)return null;
  return INPUTS.find((x:any)=>inpId(x)===k)||null;}
export function lateTagOf(o:any){return lateTag(srcInput(o));}
/* The board's duty/sim/ground rows are a SEVEN-item grid whose header reserves
   exactly seven tracks, and every cell is a bare <input> with nowhere to nest
   a chip — an eighth grid item would walk every field one track left of its
   own header, which is the register bug the whole-branch review already found
   once. So the board's promoted ground row wears the mark as a row class (an
   inset amber edge, the .redbox idiom) plus the note in its tooltip: no extra
   node, no extra grid item, nothing to knock out of register. The row's own
   INPUT still carries the full chip in the Personal Inputs panel above it. */
export function lateRowCls(o:any){const inp=srcInput(o); return (inp&&isLateInput(inp)&&lateShown(inp))?' lateinp':'';}
/* a REMOVED (dormant, acc 'r' — engine/inputs.ts inputDormant) personal input
   reads visibly PARKED (26 Aug 26 bug pass): it flags nothing until accepted
   again, yet its row printed byte-identical to a fresh, counting one sitting
   beside it — the scheduler could not tell which rows were silent. One class
   body for both surfaces (the week's pl-row, the board's inprow/sbi-row),
   faded by CSS; the title says why. */
export function dormRowCls(inp:any){return inp&&inp.acc==='r'?' inp-dorm':'';}
export function dormRowTitle(inp:any){return inp&&inp.acc==='r'?' title="Removed from the day — flags nothing until accepted again"':'';}
export function lateRowTitle(o:any){const inp=srcInput(o); return (inp&&isLateInput(inp)&&lateShown(inp))?` title="${esc(lateNote(inp))}"`:'';}
/* =====================================================================
   ONE DAY'S MARKUP
   Extracted verbatim from renderSchedule's DAYS.map body so a single day can be
   redrawn on its own. It is a PURE function of DAYS[di], WARN, SCHED, INPUTS and
   `ed` — it touches no DOM and holds no state, which is what makes swapping one
   <section class="day"> for a freshly built one indistinguishable from redrawing
   the whole week.
   ===================================================================== */
/* vsel: emit the per-day version dropdown. Only EditWeek (and the preview
   path) passes it, so the view-only page never grows the control — read-only
   users see issued schedules, not the version machinery. */
/* ---- per-day approval strip -------------------------------------------
   Each day carries its own publish state, ONE version chip (the version the
   day is currently showing — not the AL history, which lives in the ⓘ
   panel) and its own pending-edit count. In edit mode the publish is a
   button; in view mode it is a read-only stamp, because clicking a day in
   the view-only page must never lead into editing.
   Shared by the week (dayHTML, below) and the scheduler board's sign-off
   panel (board.ts's boardSignHTML) — "same as edit schedule" means literally
   the same markup, not a second copy that can drift. Deliberately excludes
   verSelHTML: the week passes it only via its own `vsel` param (never on the
   view-only page), and the board has no equivalent slot for it today. */
export function dayStatHTML(di:any,ed:any){
    const d=DAYS[di];
    const ok=dayApproved(di);
    /* the count/eligibility shown for a PUBLISHED day is the canonical delta vs
       the issued version (F-02 — the ONE authority, §3), NOT the raw pending
       marks; a still-DRAFT day has no issued baseline, so it shows its draft
       pending count. `nd>0` on a published day IS dayHasChanges. */
    /* UNDER AN ACTIVE PREVIEW (PV && !PVQ) the pending count is the LIVE discard
       count captured before the snapshot swap (PVND), NOT dayDelta — withDaySnap
       has replaced DAYS[di] with the frozen snapshot, so dayDelta here would diff
       the PREVIEWED version against the issued one and report the wrong number.
       PVND makes the "N pending" chip agree with the read-only bar's "Discard N
       edits" count, which A3 requires (Codex PS-006 / Fable #2). The issued
       DEFAULT face (PVQ, the view page's frozen render) is NOT an active preview:
       it must stay byte-frozen against live edits, so it keeps dayDelta — which,
       being the snapshot diffed against its own issued version, is 0 (no chip). */
    const nd=(PV&&!PVQ)?PVND:dayShownPendCount(di);
    /* a DRAFT preview must never wear the published day's clothes (owner,
       15 Aug 26 — "when I toggle to draft 1, it shouldn't say published"):
       under a d: preview the ✓ Published stamp and the AL chip are replaced
       by a plain Draft stamp, on every surface alike. An AL/ORIG preview
       keeps them — its banner names the previewed version while the chip
       names the live one, the deliberate "live is at AL2, you're viewing
       AL1" reading. The view page's WORKING-COPY choice (VWORK) does the
       same swap for the same reason: live-but-unissued content must not
       read as the issued schedule. */
    const pvDraft=PV&&isDraftVer(PVV);
    /* VWORK is the VIEW PAGE's issued/working choice, so `workView` must be
       scoped to it — CURPAGE==='viewsched'. dayStatHTML is shared: the board's
       sign strip calls it too (board.ts boardSignHTML), and while the board is
       always opened by a scheduler (editMode() true, so !ed is false there
       today), a read-only board render must never wear the view page's
       "Working draft" stamp or lose its AL chip on the strength of a choice
       made on another surface. The bare !ed means "read-only render", which is
       not the same as "the view page". */
    const workView=!ed&&!PV&&ok&&VWORK.has(+di)&&CURPAGE==='viewsched';
    /* THE "✓ PUBLISHED · ALn" STAMP IS RETIRED (owner, 15 Sep 26 — the plans
       selector redesign). The day's publish STATUS is now the green title tag
       (verTagHTML) beside the day name; the publish ACTIONS (Publish day /
       Publish AL) stay as the buttons below. So dayStatHTML no longer renders
       the read-only "✓ Published"/version stamp on a published day — the
       unpublished VIEW page keeps its plain "Draft" stamp (that IS byte-parity
       with the reference on the seed week; only the published branch changed). */
    const pendChip=nd?`<span class="dpend" title="${nd} ${ok?'change':'unpublished edit'}${nd>1?'s':''} on this day${ok?' — ahead of the issued schedule until you publish an AL':' — publish the day before publishing an AL'}">${nd}&nbsp;pending</span>`:'';
    const sgOK=daySigned(di);
    /* THE BEAK (§9, closes BUG-2): on a NEVER-published day it first-approves
       (Publish day). On a PUBLISHED day it renders NOTHING here — a published
       version is frozen, and its status is the green title tag; amending is edit
       the working draft, then Publish AL# (the alpub button below). */
    const beak=pvDraft
      ? `<span class="dbeak ro" title="A stored draft — not the issued schedule">Draft</span>`
      : workView
      ? `<span class="dbeak ro work" title="${d.dow} is published, but this is the working draft — not what was issued">Working draft</span>`
      : (ed&&!ok)
      ? `<button class="dbeak ${!sgOK?'locked':''}" data-beak="${di}"${!sgOK?' disabled':''} title="${sgOK?'Publish '+d.dow+' — approve this day only':'Sign off '+signMissing(di).join(', ')+' before publishing '+d.dow}">Publish day</button>`
      : ok
      ? ''   /* published: stamp retired — the green title tag names the issued version (verTagHTML) */
      : `<span class="dbeak ro " title="${d.dow+' is still draft'}">Draft</span>`;   /* unpublished view — byte-parity with the reference seed week (keep the exact class/space) */
    /* per-day AL publish — lives beside the day's own publish stamp, only on a
       PUBLISHED day that has real changes vs its issued version (dayHasChanges,
       i.e. nd>0 — the canonical delta, NOT the raw pending marks). Locked
       (darkened) until the day's four sign-offs are in. The view page gets no
       button — status only. Per-day only (P2-08 — never publish-all).
       HIDDEN UNDER PREVIEW (owner, 15 Sep 26 — A3): while you are looking at an
       issued version, "Publish AL" would publish the LIVE working copy, not the
       thing on screen — a foot-gun. The read-only bar's Load / Back are the
       actions under a preview, so drop the button there. */
    const alN=nextSeq(di);
    const alpub=(ed&&ok&&nd&&!DPREV.has(+di))
      ? `<button class="dbeak dalpub${sgOK?'':' locked'}" data-alpub="${di}"${sgOK?'':' disabled'} title="${sgOK
          ?`Publish AL${alN} — ${nd} change${nd>1?'s':''} on ${d.dow} only`
          :`Sign off ${signMissing(di).join(', ')} before publishing AL${alN}`}">Publish AL${alN}</button>`
      :'';
    /* [GLOBAL-UNDO] §6.4/§6.5 — the UNPUBLISH button. Retracts the latest issued
       version of a published day back to a working copy (a "quiet correction":
       editing then republishing reissues the SAME label). Shown ONLY on the edit
       surface, on a published day, not while previewing an older version, and not on
       a quarantined week (C10 — never show only to refuse; the command re-checks all
       of this). Two-tap ONLY when the day's OIL credits are bid against (§6.6): the
       first tap arms + warns via the click handler, the armed state paints the
       confirm face here; a day with no clash unpublishes on the single tap. */
    const cv=ok?dayCurVer(di):null;
    const unpub=(ed&&ok&&!DPREV.has(+di)&&!protectedWeek())
      ? (unpubArmed(+di)
          ? `<button class="dbeak dunpub warn" data-unpub="${di}" title="Withdraw ${esc(verLabel(cv))} on ${d.dow} — its OIL credits are bid against on the Leave War; republish to restore them. Tap to confirm.">Withdraw — confirm</button>`
          : `<button class="dbeak dunpub" data-unpub="${di}" title="Unpublish ${d.dow} — pull ${esc(verLabel(cv))} back to a working copy to correct it; republishing reissues the same version">Unpublish</button>`)
      : '';
    /* the ⓘ chip is the ONLY way into the day panel on the view page, and it opens a
       read-only panel — clicking a day in view mode must never lead into editing. */
    const infoChip=`<button class="dinfobtn" data-dayinfo="${di}" title="${d.dow} — approval, AL versions, advisories">i</button>`;
    /* the "Publishes Plan B" chip is RETIRED (owner, 15 Sep 26): the plans
       selector's own label already names the live plan, so a second chip saying
       the same thing is the clutter the redesign removes. */
    return `${pendChip}${infoChip}${beak}${alpub}${unpub}`;
}
/* THE ONE READ-ONLY PASS PER DAY ([OIL-SEATS-CAN-EARN] §5 step 1). From step 1
   the OIL item guard reads the day's whole evidence block instead of an O(1)
   property, and from step 9 the count is asked on every seat on every repaint —
   so a builder that asked per row and per puck would rebuild the block dozens of
   times for one day (Fable R2-7, S4; docs/performance.md Part 1). The builder is
   a pure string producer, which is exactly the shape the pass requires: nothing
   inside it writes DAYS, INPUTS or PEOPLE, so the memo cannot serve a stale
   answer to validation, signing or publication — none of which run in here. */
export function dayHTML(di:any,ed:any,vsel?:any){ return oilReadPass(()=>dayHTMLBody(di,ed,vsel)); }
function dayHTMLBody(di:any,ed:any,vsel?:any){
  /* A QUARANTINED (unreadable / preserved / unsupported) LOADED week is read-only,
     and its days are UNAPPROVED (the seed is loaded as a placeholder), so both the
     edit week and the view week's unapproved days reach this shared builder — which
     used to paint the seed as if it were the real schedule, with no indication the
     week is frozen (Q2R-06). Surface the same notice dayIssuedHTML shows. Parity is
     untouched: protectedWeek() is never true for the seed weeks the reference pins.
     dayIssuedHTML checks protectedWeek() BEFORE calling dayHTML, so no double. */
  if(protectedWeek()) return dayUnsupportedHTML(di);
  const d=DAYS[di];
    /* dayStatHTML (above) recomputes this same lookup for its own chips; kept
       here too because the <section> class needs it and dayApproved is a bare
       SCHED.dayOK[di] read, not worth threading through as a return value. */
    const ok=dayApproved(di);
    /* preview banner: the tint is the version's own colour, so "which AL am I
       looking at" reads the same way the marks do.
       A DRAFT preview (ver 'd:<id>') carries the draft's name, no AL tint (a
       draft was never issued, so no colour belongs to it) and NO restore
       button: restoring is the published-version rollback, and making a draft
       live is the Drafts menu's job — a second path here would be a second
       write path to keep in step with it. */
    const pvDraft=isDraftVer(PVV);
    /* PVQ: the view page's issued DEFAULT — same freeze, no banner and no
       Restore (never a write control on the view page); the day head's own
       stamp/chip/picker carry the labelling. The WORKING-copy choice is the
       mirror image: a live render that wears a banner precisely because it
       is NOT the issued document this page defaults to. */
    /* the reworded banner (owner, 16 Aug 26). A DRAFT preview offers "Switch
       to this plan" (edit surfaces only — a viewer cannot switch drafts); an
       ISSUED preview offers "Load onto working copy" (was "Restore this
       version" — the word read like "publish it"). Loading discards the day's
       unpublished edits, so when there are any it takes a confirming second
       tap: restArmed drives the two-state button. */
    const armed=restArmed(di,PVV), pend=PV?PVND:dayPendCount(di);
    const pvBar=(PV&&!PVQ)
      ? `<div class="dprev-bar"${(!pvDraft&&verSeq(PVV)!==0)?` style="--alc:${alColor(verSeq(PVV))}"`:''}>`
        /* ← Back to live copy — the way home now the green "Live copy" pill is
           gone (owner, 15 Sep 26 — A2). EDIT-SURFACE only (`vsel`), same as the
           Switch button below: the VIEW page's own 'd:' preview keeps its picker
           (the 'live' option) as the way back, and this scheduler-worded button
           would be out of place there (Fable #4). The board carries its own copy
           in SchedBoard.tsx. data-golive routes through routeClick. */
        +(vsel?`<button class="dbeak dprev-back" data-golive="${di}" title="Return to your live working copy">← Back to live copy</button>`:'')
        +(pvDraft
          /* the Switch action is EDIT-SURFACE only. A preview always renders
             with ed=false (it is read-only), so the edit-week signal is `vsel`
             — the param that also emits the version dropdown — not `ed`, which
             would hide the button on the very surface it belongs to. */
          ? `👁 Viewing plan <b>${esc(draftVerLabel(di,PVV))}</b> — read-only${vsel?'. Switch to it to make it your working copy.':''}`
            +(vsel?`<button class="dbeak dprev-switch" data-draftgo="${di}" data-draftid="${esc(String(PVV).slice(2))}" title="Make this plan your live working copy — your current one is stowed under its own name">Switch to this plan</button>`:'')
          : `👁 Viewing the issued <b>${esc(draftVerLabel(di,PVV))}</b> — read-only. This is what was sent out; it never changes.`
            +(armed
              ? `<button class="dbeak dprev-restore warn" data-restore="${di}" data-rver="${PVV}" title="This discards your ${pend} unpublished edit${pend===1?'':'s'} on the working copy — the issued versions stay unchanged">Discard ${pend} edit${pend===1?'':'s'} &amp; load — confirm</button><button class="dbeak ro dprev-cancel" data-restcancel="${di}" title="Keep your current working copy">Keep editing</button>`
              : `<button class="dbeak dprev-restore" data-restore="${di}" data-rver="${PVV}" title="Load this issued version onto your working copy to edit — nothing is published until you Publish AL, and the issued versions stay unchanged">Load onto working copy</button>`))
        +`</div>`
      : (!ed&&!PV&&ok&&VWORK.has(+di)&&CURPAGE==='viewsched')
      ? `<div class="dprev-bar work">Viewing <b>Working draft</b> — not issued · the issued schedule is ${esc(verLabel(dayCurVer(di)))}</div>`
      : '';
    let h=`<section class="day ${d.today?'today':''} ${ok?'dok':''}${PV?(PVQ?' issued':' preview'):''}" data-day="${di}">
      <div class="day-head">${ed
        ? `<span class="dow crewday" data-crewday="${di}" title="Show this day's crew in the aircrew panel">${d.dow}</span><span class="dt sb-open" data-sbday="${di}" title="Open scheduler board">${d.dt}${d.today?' · Today':''}</span>`
        : `<span class="dow di-open" data-dayinfo="${di}" title="Day details">${d.dow}</span><span class="dt di-open" data-dayinfo="${di}" title="Day details">${d.dt}${d.today?' · Today':''}</span>`}${(ed||vsel)?`<span class="dhtpl">${ed?`<button class="dhbtn" data-daytplopen="${di}" title="Save this day, or apply a saved template">Templates</button>`:''}${planSelectorHTML(di)}</span>`:''}<span class="dhver">${verTagHTML(di)}${nysMarkHTML(di)}</span>
      <span class="badge" title="Aircraft per wave · standalone lines after the slash">${dayCount(d)}</span>
      <span class="dstat">${(!ed&&!vsel)?viewVerSelHTML(di):''}${dayStatHTML(di,ed)}</span></div>`
      +pvBar
      /* THE .dhtpl SPAN carries the day's edit chrome, between the date (.dt) and
         the turn-pattern badge: the Templates button and the plans selector
         (planSelectorHTML). The old "Drafts" button folded into the selector's
         menu; the grouped version <select> and the green "Live copy" pill are gone
         (owner, 15 Sep 26). Gated on `ed||vsel` so the selector is present while
         you PREVIEW an issued version too (a preview renders read-only, ed=false,
         and `vsel` is the edit-week signal) — that is where its label reads the
         amber "👁 AL2" state. Templates stays `ed`-only (you don't apply a
         template while previewing).
         THE GREEN TITLE TAG (verTagHTML) MOVED OUT of .dhtpl into its own .dhver
         span, placed immediately LEFT of the .badge (owner, 15 Sep 26 — item 4),
         and it renders on EVERY surface — edit, view-only and the frozen issued
         face — so the view page names its issued version too (item 5). ORIG/ALn is
         coloured by AL number (item 3); DRAFT is the dashed unpublished tag.
         The day-head is otherwise byte-compared against the reference verbatim, so
         html.test.ts's `noDhTpl` excision lifts the whole `.dhtpl` span off both
         strings, and a sibling `noVerTag` excision lifts the whole `.dhver` span —
         both BALANCED span-depth walks, a no-op on the reference (which has
         neither). The Templates button keeps its `.dhbtn`/data-daytplopen
         routeClick door; the selector's is data-planmenu.
         The sign-off block stays exactly as it was minus the two buttons: still
         edit-mode only, still excised wholesale by noSign (signoffHTML nests no
         <div>, so the lazy match runs to this wrapper's own close). */
      +(ed?`<div class="signoff day-sign" data-signbar="${di}">${signoffHTML(di,false)}</div>`:'')
      +`<div class="day-body">`;
    /* warnings are live-model state — a snapshot is never validated */
    if(!PV||OFW)h+=dayWarnHTML(di);
    /* THE SCHEDULE SECTIONS are captured by slicing `h` at these boundary marks
       and re-emitted in the day's own order (owner, 29 Aug 26 — engine/order.ts
       secOrder), so a re-arrange costs no churn in the dense builders below and
       the DEFAULT order slices back together byte-identical. The warnings above
       and the input-derived blocks (Personal Inputs · Unavailable · SANS ·
       Available) below stay pinned — neither is a schedule section. */
    const secM0=h.length;
    // ---- all-hands header: EP/ORDERS notes + squadron-wide items ----
    const hasNotes=!!(d.notes&&d.notes.length), hasAH=!!(d.allhands&&d.allhands.length);
    if(hasNotes||hasAH||ed){
      h+=`<div class="allhands sec sec-prog"><div class="ah-h">Common Programme</div>`;
      (d.notes||[]).forEach((n:any,ni:any)=>h+=ted(`dn:${di}.${ni}`,noteText(n),ed,'ah-note','div'));
      if(hasAH){
        h+=`<div class="ah-cols"><span>Name</span><span>Start</span><span>End</span><span>People</span><span>Rmks</span></div>`;
        d.allhands.forEach((x:any,ri:any)=>{
          const arr=whoArr(x);
          /* A BLANKED ENTRY IS A HOLE, NOT FREE TEXT. setSlotVal's 'a:' branch holds
             the index instead of splicing, so a published AL key keeps pointing at
             the same person — which means who[] legitimately carries gaps. Rendered
             as an empty .itxt each gap became a zero-width flex item that still ate
             the cell's 4px gap, walking every later puck to the right: four gaps put
             a puck 16px out of line with the rest of its row. */
          const inner=arr.map((nm:any,k:any)=>{const id=whoId(nm);
            if(id&&PEOPLE[id])return lSeat(di,id,`a:${di}.${ri}.${k}`,ed);
            return String(nm||'').trim()?`<span class="itxt">${esc(nm)}</span>`:'';}).join('');
          const ppl=lCell(inner,`a:${di}.${ri}.+`,ed,arr.length===1?'one':'');
          const sub=(x.sub||ed)?ted(`ap:${di}.${ri}.sub`,x.sub,ed,'sub'):'';
          h+=`<div class="ah-row${rowCls(x)}"><span class="nm">${cxTag(x)}${flagTag(x)}${ted(`ap:${di}.${ri}.prog`,x.prog,ed,'ntx')}${sub}</span>`
            +`${ted(`ap:${di}.${ri}.str`,x.str,ed,'t')}${ted(`ap:${di}.${ri}.end`,x.end,ed,'t')}${ppl}${plRmk(`ap:${di}.${ri}`,ed,x,undefined)}</div>`;
        });
      }
      if(ed&&!hasNotes&&!hasAH)h+=`<div class="ah-empty">Nothing squadron-wide yet — add notes and programme items from the scheduler board.</div>`;
      h+=blkNoteHTML(di,d,ed,'pn','prognotes');
      h+=`</div>`;
    }
    const secM1=h.length;
    /* the section header the week's Flying-waves block never had — the one section
       that opened straight onto its first wave, so its drag-rail landed right beside
       that wave's own grip (owner flag, 31 Aug 26). Edit-only, so the view week and
       the read-only reference stay byte-identical (parity 728/0); it gives the rail
       the same header anchor every other week section already has, clear of the wave. */
    if(ed) h+=`<div class="sub-h wv-sech">Flying waves</div>`;
    if(!d.waves||!d.waves.length)
      h+=`<div class="nobox" style="background:rgba(138,150,163,.08);border-color:var(--edge);border-left-color:var(--edge-2);color:var(--ink-3)">No flying — ground day.</div>`;
    // ---- waves ----
    (d.waves||[]).forEach((w:any,gi:any)=>{
      /* a wave can legitimately be empty for a moment — the scheduler just removed its
         last line and is about to add another — so never index formations[0] blind. */
      const f0=(w.formations||[])[0];
      const sa=isStandalone(w);
      const edge=sa?'var(--san)':`var(--${mColor(f0?f0.msn:'')})`;
      h+=`<div class="go ${w.night?'night':''} ${sa?'sa sa-'+(w.kind||'x'):''}"${ed?` data-move="mv:w.${di}.${gi}"`:''} style="border-left-color:${sa?'var(--san)':(w.night?'var(--hard)':edge)}">
        <div class="go-tab">${ed?'<span class="wvgrip" title="Drag to reorder this wave" aria-label="Reorder this wave">⠿</span>':''}<span class="asd">${ted(`wl:${di}.${gi}`,w.label,ed,'ntx')}${!sa&&w.night&&!/night/i.test(w.label)?' · NIGHT':''}`
        +`${sa?`<span class="satag" title="${esc((SAWAVE[w.kind]||{}).note||'Standalone — outside the day\u2019s flying count')}">standalone${w.noconf?' · availability, currency and seat checks only':''}</span>`:''}</span>
        ${sa?'':`<button class="airbtn" data-air="${di}|${gi}">Traffic</button>`}${sa||!ed?'':`<button class="airbtn" data-itadd="${di}|${gi}" title="Add an in-time line to this wave">+ In time</button>`}</div>`;
      /* "+ In time" renders whether or not the wave has lines — the always-there
         add control is the fix for the old trap where deleting the last line
         dropped the whole block with no way back (owner, 21 Aug 26). Standalone
         waves are excluded: a shift briefs nothing, and a typed in-time there
         would silently move waveWindows. interactions.ts owns the click. */
      if(w.intimes&&w.intimes.length)
        h+=`<div class="intimes${ed?' iedit':''}"${alAttr(`it:${di}.${gi}`)} ${ed?`data-intimes="${di}|${gi}"`:''}>${intimesInner(w,ed?`${di}|${gi}`:null)}</div>`;
      h+=sa
        ? `<div class="cols formcols"><span>${esc(w.label||'')}<br>SHIFT</span><span class="c-c">START</span><span class="c-c">END</span><span>FCP / RCP</span><span>RMKS</span></div>`
        : `<div class="cols formcols"><span>CS<br>MSN</span><span class="c-c">B<br>TO</span><span class="c-c">LD</span><span>FCP / RCP</span><span>RMKS</span></div>`;
      w.formations.forEach((f:any,li:any)=>{
        /* the brief lead is a rule the squadron edits on the Logic page, and
           validate() already reads it live (VCONF.briefLead). Hard-coding 140
           here left the engine flagging against the new number while the B
           column kept printing the old one. */
        const brief=minus(f.to,VCONF.briefLead), rows=f.aircraft.length;
        const areaTxt = areaText(f), timeTxt = atimeText(f);
        const fp=`ff:${di}.${gi}.${li}`;
        /* B (owner, 6 Aug 26): the scheduler can now type an INDICATED brief time
           at f.br — '.br' is already in TIME_TXT (engine/slots.ts) so ted() parses
           and formats it exactly like '.to'/'.ld', and txtRef resolves the ff: key
           generically with no new branch needed. editableBr mirrors ted()'s own
           gate (!ed||!canEditSched() falls back to view rendering) rather than
           just `ed`, so a caller that renders ed=true without edit rights (a
           logged-out-mid-edit admin, or a markup-only test) still shows the
           effective time as plain text instead of a blanked-out box. A blank line
           still briefs off the calculated fallback (view mode, and the box's own
           placeholder), and offers that fallback as a click-to-accept SUGGESTION
           above the box in edit mode — accepting is a deliberate click, never a
           silent default, so the model stays blank until someone decides it. */
        const editableBr=ed&&canEditSched();
        const brTyped=parseHM(f.br)!=null;
        const brShown=editableBr?f.br:(brTyped?f.br:brief);
        const brSug=(editableBr&&!brTyped)
          ? `<span class="bsug" data-bacc="${fp}.br" data-bval="${brief}" title="Click to accept the suggested brief time">${brief}</span>`
          : '';
        /* Grid placement is handed to CSS through custom properties rather than
           hardcoded inline grid-row values, so a breakpoint can remap rows without
           the renderer knowing about it.
             --gs : rows spanned by CS/MSN, B/TO, LD
             --gr : the aircraft's puck row (its RMKS cell shares the same row)
             --ga : the AREA strip row
           There used to be --gsm/--grm/--grr/--gam mobile twins, for a phone layout
           that dropped RMKS onto its own full-width strip and so gave every aircraft
           two rows. Remarks now sit right of the pucks at every width, one row per
           aircraft, so the twins are gone. */
        const spans=`--gs:${rows}`;
        /* D49's MARK, ON THE LINE (owner, 22 Sep 26; the walk's rules-sweep FAIL
           3). A line typed with the same take-off and landing still earns — that
           is the ruling — but the day has to SAY the two times cannot both be
           right, and it said so only in the list on the right: the row itself was
           byte-for-byte a correct line's. The two boxes one of which is wrong now
           wear the advisory edge and carry the reason in their own words, so a
           scheduler reading the line is told without opening anything.
           `data-warnkey` is the ADDRESS the warning's own key resolves to
           (ui/highlights.ts anchorEl), which is what makes tapping the warning
           scroll here; the key is built the same way validate.ts builds it.
           Emitted only on a line that actually raises the warning, so an ordinary
           week's markup — and the reference parity compare — is untouched. */
        const noLen=fltNoLen(f);
        const badCls=noLen?' badtm':'';
        /* THE ADDRESS ONLY ON LIVE PAPER (the follow-up code read, G2). The
           MARK belongs on a frozen version preview — a line that went out with
           two identical times went out that way, and the issued page should say
           so. The ADDRESS does not: the highlight pass refuses to decorate a
           `.pv-frozen` preview on purpose (WARN is live, the preview is what the
           squadron was given), and `anchorEl`'s own contract says a preview
           emits nothing for a warning to resolve into. Emitting it everywhere
           broke both — a focused live warning lit a box inside last week's
           paper, and the tap could scroll into one. */
        const badAtt=noLen?`${PV?'':` data-warnkey="${fp}.ld"`} title="${esc((f.cs||w.label||'A flying line')+' '+FLT_NO_LEN_SAYS(parseHM(f.to),sa))}"`:'';
        h+=`<div class="form${rowCls(f)}">
          <div class="fcell csmsn" style="${spans}">${cxTag(f)}${flagTag(f)}<b><span class="mdot" style="background:${sa?'var(--san)':`var(--${mColor(f.msn)})`}"></span>${ted(fp+'.cs',f.cs,ed,'ntx')}</b>${ted(fp+'.msn',f.msn,ed,'','i')}</div>
          ${sa
            ? `<div class="fcell bto${badCls}"${badAtt} style="${spans}">${ted(fp+'.to',f.to,ed,'ntx','span')}</div>`
            : `<div class="fcell bto${badCls}"${badAtt} style="${spans}">${brSug}${ted(fp+'.br',brShown,ed,'','b')}${ted(fp+'.to',f.to,ed,'','span')}</div>`}
          <div class="fcell ld${badCls}"${badAtt} style="${spans}">${ted(fp+'.ld',f.ld,ed,'ntx')}</div>`;
        f.aircraft.forEach((a:any,ai:any)=>{
          const key=`${di}.${gi}.${li}.${ai}`, o=a.opts||{};
          /* edit mode shows the on-chips (click one to remove it) plus C, which
             opens a box listing EVERY store, lit where the jet carries it. The
             box lists everything rather than just the leftovers because it is
             not always rendered next to on-chips it could lean on to tell the
             rest of the story. View mode shows the on-chips only. */
          const stores=ed
            ? `<span class="stores">`+STORE_CFG.filter(([k]:any)=>o[k]).map(([k,lab]:any)=>`<span class="stchip on" data-store="${key}.${k}" title="Remove ${esc(lab)}">${esc(lab)}</span>`).join('')
              +`<button class="stcfg" data-stcfg="${key}" title="Stores configuration">C</button>`
              +`<span class="bombs${stSavedOn(key)?' stsaved':''}" contenteditable="true" data-bombs="${key}">${esc(o.bombs||'')}</span></span>`
            : storesView(o);
          const acx=(f.cx?'':rowCls(a))+((sa&&a.spare)?' spare':'');   // a cancelled formation already fades the whole block
          /* marks "nothing at all to say about this jet". RMKS is a real column again so
             the empty cell just stays blank rather than being hidden, but the class is
             kept as the hook anything later needs to spot a silent aircraft. */
          /* `!sa` — a standalone line always shows its MAIN/SPARE badge now,
             so it is never a "silent" cell even with empty remarks */
          const rmkE=(!ed&&!sa&&!(a.rmks||'').trim()&&!storesView(o)&&!a.cx&&!a.flag)?' rmk-e':'';
          /* AN EXEMPT LINE'S PUCK FOLLOWS ITS OWN RULES AND NOTHING ELSE
             (owner, 11 Aug 26, second pass — "the rings should also follow").
             A fully checked line wears the day's worst decoration like every
             other surface. An exempt line — an SC SPARE, anything on AVALON or
             BB — used to wear NOTHING ("a red puck there would read as 'this
             line has a problem' when the problem belongs to that person's
             other flying"), which hid the one red check these lines DO carry:
             the owner's first live use showed the engine flagging his AVALON
             man while the puck stayed clean. Wearing the whole day's
             decoration instead would resurrect the bleed the old gate existed
             to stop — a spare routinely flies elsewhere the same day. So the
             exempt copy reads the day's warning list for entries ANCHORED TO
             THIS LINE and naming this man: the availability check (DNIF_FLY /
             LEAVE_FLY — the red C), SC currency, which is checked for MAIN
             and SPARE alike (SC_QUAL — the red Q), and — 31 Aug 26 — the two
             SC-SPARE rules: another SC seat in the same hours (DOUBLE_BOOK —
             the red C) and a WSO in the spare front seat (QUAL — the red Q).
             Since 7 Sep 26 AVALON anchors the same three codes for its own
             three rules (SC NIGHT on a MAIN, the pilots-only front seat, one
             man in two AVALON places), so nothing here changed for it.
             Only these four codes can anchor to an exempt line, and all are
             hard, so these pucks ring red or not at all — the owner confirmed
             no amber rule lives here. BB can anchor nothing and so never
             rings, with no special case — until 7 Sep 26, when BB became
             AVALON's twin and anchors the same codes. */
          const chk=!saExempt(w,f,a), fkey=`${di}.${gi}.${li}`;
          const own=(id:any)=>{ if((PV&&!OFW)||!id)return null;   /* official face shows these flags too (Codex CRPF-008) */
            const g=WARN.byDay[di];
            const hit=((g&&g.warns)||[]).find((x:any)=>(x.code==='DNIF_FLY'||x.code==='LEAVE_FLY'||x.code==='SC_QUAL'||x.code==='DOUBLE_BOOK'||x.code==='QUAL')
              /* also `x.also`, so the SECOND place of a one-man-two-places pair
                 rings when it sits in a DIFFERENT wave (an AVALON seat + a BB
                 seat): the clash anchors on the first place, the other in `also`
                 — same match the exempt DESK puck already makes (7 Sep 26). A
                 same-formation pair already rings off the shared key prefix. */
              &&(x.who||[]).includes(id)&&(x.key===fkey||String(x.key||'').indexOf(fkey+'.')===0
                ||x.also===fkey||String(x.also||'').indexOf(fkey+'.')===0));
            return hit?((hit.code==='SC_QUAL'||hit.code==='QUAL')?'Q':'C'):null; };
          const sv=(id:any)=>chk?sev(di,id):(own(id)?'hard':null), cp=(id:any)=>chk?chip(di,id):own(id), dh=(id:any)=>chk?dsh(di,id):false,
                tr=(id:any)=>chk?traceHit(di,id):null;
          h+=`<div class="acrow${ai?'':' r1'}${acx}" style="--gr:${ai+1}"><span class="pucks">${slotCell(a.p,sv(a.p),key+'.p','FCP',ed,cp(a.p),dh(a.p),tr(a.p),di)}${slotCell(a.w,sv(a.w),key+'.w','RCP',ed,cp(a.w),dh(a.w),tr(a.w),di)}</span></div>
              <div class="rmkcell${ai?'':' r1'}${acx}${rmkE}" style="--gr:${ai+1}"${alAttr(`st:${key}`)}>${cxTag(a)}${flagTag(a)}${sa?saRoleHTML(key,a,ed):''}${ted(`fr:${key}`,a.rmks,ed,'ntx',null,ed?'Remarks':null)}${sa?'':stores}</div>`;
        });
        /* AREA strip: full-width row under this formation's aircraft. Rendered whenever
           there is something to show, or always in edit mode so it can be filled in. */
        if(!sa&&(ed||areaTxt||timeTxt))
          h+=`<div class="form-area" style="--ga:${rows+1}"><span class="fa-lb">AREA</span>`
            +`<span class="areacell"${alAttr(`ar:${di}.${gi}.${li}`)} ${ed?`contenteditable="true" spellcheck="false" data-area="${di}.${gi}.${li}"`:''}>${esc(areaTxt)}</span>`
            +`<span class="timecell"${alAttr(`at:${di}.${gi}.${li}`)} ${ed?`contenteditable="true" spellcheck="false" data-atime="${di}.${gi}.${li}"`:''}>${esc(timeTxt)}</span></div>`;
        h+=`</div>`;
      });
      h+=`</div>`;
    });
    const secM2=h.length;
    // ---- duties by wave (directly below the last flying wave) ----
    /* `|| ed` so a day with no duty rows still offers its scheduler-notes box —
       otherwise deleting the last row would strand text already in the model. */
    if((d.dutywaves&&d.dutywaves.length)||ed){
      const dws=d.dutywaves||[];
      h+=`<div class="sub plist sec sec-duty"><div class="sub-h">Duties</div>`+(dws.length?plCols():'');
      dws.forEach((dwv:any,wi:any)=>{
        h+=`<div class="pl-sub">${ted(`dl:${di}.${wi}`,dwv.label,ed,'ntx')}</div>`;
        /* MODEL order, not role-sorted (owner, 8 Aug 26): the board can
           reorder duty rows now, and a fixed role order here would have
           swallowed the change — a scheduler would move a row and the
           issued week would keep printing the old sequence. The board
           already rendered model order, so the two surfaces agree for the
           first time. The seed's rows were re-laid into the order the old
           sort used to produce, so this prints identically until somebody
           actually drags one — which is also what keeps parity.test.ts
           byte-exact against the still-sorting reference, via a refwin
           patch (testing/refwin.ts's reduty(), which pushes the port's
           stored row order into the in-memory reference before either
           engine runs — this diverged mid-build; see reduty()'s own
           comment for what the patch does and does not still guard). */
        (dwv.rows||[]).forEach((r:any,ri:any)=>{
          const key=`d:${di}.${wi}.${ri}`;
          const inner=(PEOPLE[r.id]?lSeat(di,r.id,key,ed):(r.id?`<span class="itxt">${esc(r.id)}</span>`:''))+moreSeats(di,key,ed);
          const n=rowCrew('d',[di,wi,ri]).filter(Boolean).length;
          h+=plRow(r.role,r.str,r.end,lCell(inner,key+'.+',ed,n<=1?'one':''),`dr:${di}.${wi}.${ri}`,'role',ed,r);});
      });
      h+=blkNoteHTML(di,d,ed,'dtn','dutynotes');
      h+=`</div>`;
    }
    const secM3=h.length;
    // ---- SIMS category (AMT + OFT), after duties ----
    const sims=d.sims||{};
    if((sims.amt&&sims.amt.length)||(sims.oft&&sims.oft.length)||ed){
      h+=`<div class="sub plist sec sec-sim"><div class="sub-h">Sims</div>`+plCols();
      const blk=(title:any,kind:any,rows:any)=>{ if(!rows||!rows.length)return'';
        let s=`<div class="pl-sub">${title}</div>`;
        rows.forEach((r:any,ri:any)=>{const base=`s:${di}.${kind}.${ri}`;
          /* two shapes of sim row: a 2-seat crew (p / w), or a pax list of any length.
             Pax pucks are ordinary pucks and simply wrap inside the People cell, so an
             8-crew AMT box lays out as four rows of two without any special casing. */
          const pax=Array.isArray(r.pax)?r.pax:null;
          const seats=pax
            ? pax.map((id:any,pi:any)=>lSeat(di,id,`${base}.pax.${pi}`,ed)).join('')
            : lSeat(di,r.p,base+'.p',ed)+lSeat(di,r.w,base+'.w',ed);
          /* no headcount above the pucks anywhere — the pucks ARE the count, and
             the remarks already say things like "ALL 8 PAX @ AMT BLDG" */
          const txt=(!seats&&r.who)?`<span class="itxt">${esc(r.who)}</span>`:'';
          const n=rowCrew('s',[di,kind,ri]).filter(Boolean).length;
          s+=plRow(r.label,r.str,r.end,lCell(txt+seats+moreSeats(di,base,ed),base+'.+',ed,n<=1?'one':''),`sr:${di}.${kind}.${ri}`,'label',ed,r);});
        return s; };
      h+=blk('AMT','amt',sims.amt)+blk('OFT','oft',sims.oft);
      /* free-text planning notes, at the BOTTOM of the sims block, so whoever plans
         the next sim cycle reads what this scheduler already committed. */
      h+=blkNoteHTML(di,d,ed,'sn','simnotes');
      h+=`</div>`;
    }
    const secM4=h.length;
    /* ---- ground programme (scheduler-entered) ----
       On the scheduler's side it is one of TWO ground blocks, so it says which
       one it is. The view-only page sees no personal inputs at all, so there is
       nothing to distinguish it from and the qualifier would be noise.
       `|| ed` for the same reason as Duties: the notes box must survive an
       empty section. */
    if((d.ground&&d.ground.length)||ed){
      const grd=d.ground||[];
      /* Header is just "Ground Programme" on both surfaces now (owner, 22 Aug
         26 — "change all the ground programme scheduler to GROUND PROGRAMME");
         the old edit-mode "· scheduler" qualifier is gone. Parity still holds —
         the reference carries the qualifier and html.test.ts normalises both to
         "GRND", tolerating its absence. */
      h+=`<div class="sub plist one sec sec-grnd"><div class="sub-h">Ground Programme</div>`+(grd.length?plCols():'');
      groundOrder(grd,d.gman).forEach(({row:x,ri}:any)=>{const id=whoId(x.who), key=`g:${di}.${ri}`;
        const inner=((id&&PEOPLE[id])?lSeat(di,id,key,ed):(x.who?`<span class="itxt">${esc(x.who)}</span>`:''))+moreSeats(di,key,ed);
        const n=rowCrew('g',[di,ri]).filter(Boolean).length;
        h+=plRow(x.prog,x.str,x.end,lCell(inner,key+'.+',ed,n<=1?'one':''),`gr:${di}.${ri}`,'prog',ed,x);});
      h+=blkNoteHTML(di,d,ed,'gn','grndnotes');
      h+=`</div>`;
    }
    /* re-emit the five captured sections in the day's own order. secOrder yields
       the plain canonical order for an un-arranged day, so this slices back to a
       byte-identical string; only a re-arranged day differs.
       In EDIT mode each section is wrapped in a `.dsec[data-secmove]` carrying a
       drag grip, so a scheduler can drag a whole section into a new place (the
       in-place replacement for the old Arrange sheet — store.moveSectionTo, pure
       display order). VIEW mode wraps nothing, so the view week — and the
       read-only reference the parity gate pins — is byte-identical (728/0). */
    /* the week keeps day notes as lines inside the Common Programme block (they
       never had a card of their own here — see engine/order.ts), so the 'notes'
       section is empty on the week and its slice adds nothing: the view week and
       the reference stay byte-identical (parity 728/0). The BOARD is where notes
       and programme are two separate draggable cards.
       secBits is CAPTURED here — before the reorder loop rewrites h — but the loop
       itself runs further down, AFTER the four crew working-aid panels are built,
       so in EDIT mode those panels can join the SAME draggable list (owner, 31 Aug
       26 — "drag markers on edit scheduler … follow the same formatting as the rest
       of the sections", extending the board's one-list model onto the edit week).
       Held at function scope, not inside a block, for exactly that reason. */
    const secBits:any={prog:h.slice(secM0,secM1),waves:h.slice(secM1,secM2),duty:h.slice(secM2,secM3),sims:h.slice(secM3,secM4),ground:h.slice(secM4)};
    /* ---- the two input-derived blocks -------------------------------------
       PERSONAL INPUTS is what aircrew submitted and the scheduler has not yet
       acted on, so it is scheduler-side only — it never reaches the view page.
       The scheduler ACCEPTS a row to promote it into the ground programme above
       (or, for "Other", files it under Unavailable). An accepted row stays here,
       faded, so the scheduler can see what they have already dealt with and undo
       it.  UNAVAILABLE is the opposite: leave, downchits and detachments close a
       man's day on their own, with nobody accepting anything, so it prints on
       every page. It replaces the old separate Leave and Downchit blocks, and
       Available / Office are gone entirely (owner request, Aug 26). */
    const dayInputs=INPUTS.filter((inp:any)=>inputCoversDate(inp,d.dt));
    /* personal-input groups use the SAME columnar grid as duties / sims / ground:
       Name | Start | End | People.  All-day rows span the two time columns. */
    const inGrp=(title:any,filt:any,cls:any,always?:any,acc?:any)=>{ const rows=dayInputs.filter(filt);
      if(!rows.length&&!always)return'';
      /* PERSONAL INPUTS folds to a one-line summary by default (owner, Aug 26).
         Now that activity inputs auto-land on the ground programme, this block
         is the faded audit echo, not the primary planning surface — so it folds
         away by default (the PIOPEN session-view pattern), the header the
         toggle. Only this group (acc) folds and only in edit mode; Unavailable
         stays open — it is a live drop target and the day's must-read. */
      const foldable=!!acc&&!!ed;
      if(foldable&&rows.length&&!PIOPEN.has(di)){
        const onG=rows.filter((r:any)=>r.acc==='g').length;
        return `<div class="sub plist one sec ${cls||''}"><div class="sub-h pl-fold" data-pitog="${di}">`
          +`<span>${title}</span><span class="pl-hint">${rows.length} input${rows.length===1?'':'s'}${onG?` · ${onG} on programme`:''} · show ⌄</span></div></div>`;
      }
      /* what is typeable is only discoverable on hover, and half the squadron
         is on a phone where there is no hover — so the block says it once,
         rather than every row carrying a hint it has no room for.
         Scheduler-side only: the view-only week cannot edit anything. */
      let s=`<div class="sub plist one sec ${cls||''}"><div class="sub-h${foldable?' pl-fold':''}"${foldable?` data-pitog="${di}"`:''}>${title}${ed?`<span class="pl-hint">times and remarks type in place · clear a time for all day · press the type to change it${foldable?' · hide ⌃':''}</span>`:''}</div>`;
      /* Housekeeping reminder (owner, Aug 26; reworded 26 Aug 26 with the
         dormancy rule — one wording with the board's sb-pinote sibling). */
      if(acc&&ed&&rows.length)s+=`<div class="pl-inpnote">A removed input flags nothing until accepted again — delete it here if it should go entirely.</div>`;
      /* Unavailable is the block the squadron reads every single day, so it
         prints even when nobody is on it — "Nil" is the answer, not a missing
         section. */
      if(!rows.length)return s+`<div class="pl-nil">Nil</div></div>`;
      s+=plCols();
      rows.forEach((inp:any)=>{
        /* Unavailable's own puck is a plant/drop target too, so a scheduler can
           tap-arm-then-plant or drag a different name straight onto it — "even
           down to changing the puck" (owner, 14 Aug 26). `acc` here means "this
           is the Personal Inputs group" (it draws the Accept control below), so
           `!acc` is Unavailable — Personal Inputs stays display-only, exactly as
           today, because accepting/declining is its own control already.
           data-inpseat carries the INPUT's iid, not a schedule key: interactions.ts
           and drag.ts read it and call reassignInput (inputedit.tsx), which is the
           SAME relink commitInputEdit already does — never a second write path. */
        const seatable=!acc&&ed;
        const pk=PEOPLE[inp.person]
          ? `<span class="seat"${seatable?` data-inpseat="${esc(inpId(inp))}"`:''}>${puck(inp.person,sev(di,inp.person),true,chip(di,inp.person),false,null,oilSeatDeco(di,inp.person,'',inputItemKey(inpId(inp))).oil)}</span>`
          : `<span class="itxt">${esc(inp.person)}</span>`;
        /* the input's own free text now reads in the RMKS column, so the NAME column
           carries the type and every block lines up on the same five columns */
        s+=`<div class="pl-row${acc&&inp.acc&&inp.acc!=='r'?' accd':''}${acc?dormRowCls(inp):''}"${acc?dormRowTitle(inp):''}>`
          +`<span class="nm">${inpEditLabel(inp,ed,inpLabel(inp),'ntx')}</span>${inpTimeCells(inp,ed)}`
          +`<div class="ppl one">${pk}</div>${inpRmkCell(inp,ed,d.dt)}`
          +(acc?accCtl(di,inp):'')+`</div>`; });
      return s+`</div>`; };
    /* THE FOUR CREW WORKING-AID PANELS. In EDIT mode they join the SAME draggable
       section list as the schedule cards above (owner, 31 Aug 26 — "drag markers on
       edit scheduler … follow the same formatting as the rest of the sections",
       extending the board's 31 Aug "one list, drag anywhere" onto the edit week):
       each goes into secBits under its own section key and the reorder loop below
       places it in the day's own order, wrapped in a draggable .dsec with a grip,
       so an arrangement made here and one made on the board drive the ONE per-day
       order (engine/order.ts) — no second copy to drift.
       In VIEW mode nothing here is draggable and only Unavailable prints, appended
       in its fixed tail position exactly as before, so the view week (and the parity
       gate) stay byte-identical (728/0). Personal Inputs and Available crew are
       scheduler-side (edit only); SANS prints nothing when empty (sansSectionHTML).
       Available crew stays computed (not an input type); SANS is its own card grid
       (owner rework, 14 Aug 26); Unavailable is an offer's opposite and always
       prints, "Nil" and all. */
    const crewInputs=ed?inGrp('Personal Inputs',(inp:any)=>isPersonal(inp.type)&&inp.acc!=='u','sec-inp',false,true):'';
    const crewAvail=ed?availHTML(d,di,ed):'';
    const crewSans=sansSectionHTML(d,di,ed);
    // SANS Availability is an offer, not an absence — it reads isUnavail (no Accept controls) but does not belong in this block
    const crewUnav=inGrp('Unavailable',(inp:any)=>(isUnavail(inp.type)||inp.acc==='u')&&!isSansAvail(inp.type)&&!isUpchit(inp.type),'sec-unav',true);
    if(ed){secBits.inputs=crewInputs;secBits.avail=crewAvail;secBits.sans=crewSans;secBits.unav=crewUnav;}
    /* the dotted ⠿ grip sits INLINE at the head of each section's own header (the
       .ah-h / .sub-h / .ap-h / .wv-sech title), not as a rail in the .dsec gutter —
       so it reads dotted like the wave/row grips, sits beside its title and centres
       on the title line (owner, 31 Aug 26). Edit-only, so parity is untouched. ONE
       robust regex handles every header the ten sections carry — the schedule cards'
       ah-h / sub-h / sub-h.wv-sech, Personal Inputs' foldable sub-h.pl-fold and
       Available crew's ap-h — matching the FIRST such header in each section's own
       bit, so a nested header is never hit. */
    const secGrip='<span class="secgrip" title="Drag to reorder this section" aria-label="Reorder this section">⠿</span>';
    const gripIn=(bit:string)=>bit.replace(/(<div class="(?:ah-h|sub-h|ap-h)\b[^>]*>)/,`$1${secGrip}`);
    h=h.slice(0,secM0)+secOrder(d).map((k:string)=>{const bit=secBits[k]||'';if(!bit)return'';return ed?`<div class="dsec" data-secmove="${di}.${k}">${gripIn(bit)}</div>`:bit;}).join('');
    if(!ed)h+=crewUnav;
    h+=`</div>`; // /day-body
    return h+`</section>`;
}
/* THE INPUT'S OWN LABEL OPENS THE DIALOG, and since the times and the remarks
   became ordinary cells (owner, 10 Aug 26 — "no need to open a new window")
   what is left behind it is the TYPE and DELETE: the two that cannot be a
   text cell in these rows. It is the label rather than a button beside it
   because both surfaces draw these rows as GRIDS with every track already
   spoken for. Three shapes were built and measured first: an extra child
   wraps onto a line of its own (the Unavailable block has no Accept button to
   share that line with, so every row cost a second line); an
   absolutely-positioned button with the remarks cell padded clear of it made
   a remark one word off the boundary wrap, 27px to 39px on "Medically down
   till 17 Jul" at desktop width; and a 20px track of its own does the same
   thing for the same reason — the column has to give up the width either way.
   The label costs nothing because it is already there, and it is also the
   right thing to press: it is what names the input.
   `ed` is HOOKS.editMode() — a scheduler on Edit Schedule. View-only Sched
   draws the Unavailable block too and stays read-only; a member changes his
   own leave on the Inputs page, where the role gate for that already lives. */
/* ---- an input's TIMES and REMARKS, typed in place (owner, 10 Aug 26) -----
   "Edit the input directly like changing the start and end time... in the same
   modality as ground programme." A ground row's cells are `ted()` nodes on a
   `data-txt` key; an input has no funnel key — it is not schedule data — so
   these carry `data-inp` instead and commit through ui/textedit.ts's own
   branch. Everything else about them is the ground row's: same classes, same
   grid tracks, same Enter-commits / Escape-restores.

   READ-ONLY IS UNCHANGED, deliberately and to the byte: the view-only week and
   the reference-parity compare both go down the first branch, which is the
   markup this block has always emitted, `all day` spanning the two time
   columns and all. Only a scheduler on Edit Schedule sees cells.
   BOTH CELLS EMPTY IS "all day" — see setInpField in ui/inputedit.tsx for why
   that is the rule rather than a third control; the placeholder says so, so an
   empty pair reads as the rule and not as a gap. */
export function inpTimeCells(inp:any,ed:any){
  if(!ed||!canEditSched())return inp.allday
    ? `<span class="t allday">all day</span>`
    : `<span class="t">${esc(hhmm(inp.s))}</span><span class="t">${esc(hhmm(inp.e))}</span>`;
  /* only the START cell says it. The phone stacks the two into one TIME column
     (see the t-s / t-e note on plRow), so a placeholder on both read "all day"
     twice down the column — and on either width the pair only needs telling
     once. */
  const cell=(f:any,c:any)=>`<span class="t t-${c} txed inpt" contenteditable="true" spellcheck="false" `
    +`data-inp="${esc(inpId(inp))}.${f}"${f==='str'?' data-ph="all day"':''}>${esc(inpTimeText(inp,f))}</span>`;
  return cell('str','s')+cell('end','e');
}
/* dt (day's date label, only ever in scope where this cell is built) is what
   sansBadge needs to find the record covering THIS day — a span input's badge
   must read the same on every day it covers, not just its start date. Same
   prefix idiom as lateTag just above: printed ahead of the free text, never
   nested inside it, so it survives the contenteditable span untouched. */
export function inpRmkCell(inp:any,ed:any,dt?:any){
  const lt=lateTag(inp), lc=lt?' has-late':'';
  const sb=isSansAvail(inp.type)&&dt?sansBadge(inp.person,dt):'';
  const sbt=sb?`<span class="sansb" title="SANS availability">${esc(sb)}</span>`:'';
  const v=inp.remarks||'';
  if(!ed||!canEditSched())return `<span class="rmk${v?'':' rk-e'}${lc}">${lt}${sbt}<span class="ntx">${esc(v)}</span></span>`;
  return `<span class="rmk${lc}">${lt}${sbt}<span class="ntx txed inpt" contenteditable="true" spellcheck="false" `
    +`data-inp="${esc(inpId(inp))}.rmks" data-ph="remarks">${esc(v)}</span></span>`;
}
export function inpEditLabel(inp:any,ed:any,txt:any,cls:any){
  const t=esc(txt);
  if(!ed)return `<span class="${cls}">${t}</span>`;
  return `<button class="${cls} inpedit" data-inpedit="${esc(inpId(inp))}" title="Edit this input — times, type, remarks or delete">${t}</button>`;
}
/* The accept control on a personal-input row. "Other" is the one type whose
   destination is genuinely ambiguous — it can be something the squadron has to
   run (ground programme) or something that simply closes the man (unavailable) —
   so it offers both. Everything else has one sensible home. An accepted row
   shows Undo instead, which removes the ground row it created. */
export function accCtl(di:any,inp:any){
  if(!canEditSched())return `<span class="accs"></span>`;
  const k=esc(inpId(inp));
  /* 'r' (removed — dormant, see engine/inputs.ts inputDormant) is NOT
     "accepted": the row was undone, so this offers Accept again, which is the
     one way back to a flagging state. Only 'g'/'u' show Undo. */
  if(inp.acc&&inp.acc!=='r')return `<span class="accs"><button class="accb undo" data-acc="x" data-accd="${di}" data-acck="${k}" title="Undo — removes the ground-programme row this created">Undo</button></span>`;
  const b=(dest:any,lbl:any,ttl:any)=>`<button class="accb" data-acc="${dest}" data-accd="${di}" data-acck="${k}" title="${ttl}">${lbl}</button>`;
  return `<span class="accs">`
    +(/^Other$/i.test(String(inp.type))
      ? b('g','→ Ground','Accept into the ground programme')+b('u','→ Unavail','File under Unavailable')
      : b('g','Accept','Accept into the ground programme'))
    +`</span>`;
}
/* the strip that lives in one day's header. `full` is the roomy board version. */
export function signoffHTML(di:any,full:any){
  /* signShown, not signOf: a signature the day's content has moved out from under
     reads EMPTY here (owner, 15 Sep 26 — a change clears the sign-offs). `any`
     (the Clear button) and each select's value/`.on` all follow the shown state. */
  const g=signShown(di), miss=signMissing(di), any=SIGN_ROLES.some((r:any)=>g[r[0]]);
  return `<span class="so-h">Sign-off</span>`
    +SIGN_ROLES.map(([k,lbl,sch]:any)=>{
      const v=g[k], ids=signPeople(sch,v);
      /* the select is stretched invisibly over the whole pill (iPhone Safari
         will not open a select from a tap on its wrapping label, so the label
         text used to be dead space on the phone). The .v span is the visible
         value; it re-renders on every reflow, the same path that used to move
         the `selected` attribute. */
      const shown=v&&PEOPLE[v]?PEOPLE[v].cs:(ids.length?'— name —':'— none appointed —');
      return `<label class="sgn ${v?'on':''}${sch?' sch':''}" title="${esc(lbl)}${sch?' — appointed schedulers only':''}${v&&PEOPLE[v]?' — '+esc(PEOPLE[v].name||PEOPLE[v].cs):''}">`
        +`<span class="k">${esc(lbl)}</span><span class="v">${esc(shown)}</span>`
        +`<select data-sign="${k}" data-signday="${di}" aria-label="${esc(lbl)} — ${esc((DAYS[di]||{}).dow||'')}">`
        +`<option value="">${ids.length?'— name —':'— none appointed —'}</option>`
        +ids.map((id:any)=>`<option value="${id}"${id===v?' selected':''}>${esc(PEOPLE[id].cs)}</option>`).join('')
        +`</select></label>`;}).join('')
    +(any?`<button class="so-clear" data-signclear="${di}">Clear</button>`:'')
    /* the status line is PUBLISH-AWARE once the four are in (owner, 15 Sep 26 —
       item 7). On an unpublished day, signing IS what unlocks the first publish, so
       it still reads "can be published". On an ALREADY-published day it names the
       issued version and says whether there is anything to publish — the old flat
       "can be published" wrongly implied a publish button that (correctly) is not
       there when nothing has changed. dayDelta is the ONE eligibility authority. */
    +`<span class="so-state ${miss.length?'no':'yes'}">${
        miss.length ? `${miss.length} to sign${full?' · '+miss.join(', '):''}`
        : !dayApproved(di) ? 'Signed — this day can be published'
        : (()=>{const cv=dayCurVer(di); if(cv==null) return 'Signed';   // approved but no resolvable snapshot (probe/import) → no ALNaN label (Fable #3)
            const chg=dayDelta(di).length;
            return chg
              ? `Published at ${esc(verLabel(cv))} · ${chg} change${chg>1?'s':''} to publish — Publish AL${nextSeq(di)}`
              : `Published at ${esc(verLabel(cv))} — no changes to publish`;})()
      }</span>`;
}
/* =====================================================================
   DAY DETAILS — the ⓘ chip on every day head. Approval state, which AL
   versions amended this day, unpublished edits, what the day is actually
   tasking, and every warning / advisory / note on it. Read-only: opening it
   from the view page must never lead into editing.
   ===================================================================== */
export function dayInfoHTML(di:any){
  const d=DAYS[di]; if(!d)return '';
  /* the day head's own count (AM23): a published day counts its real difference from the
     issued version, not the raw marks ([HUMAN-RETEST] walk S3, 24 Sep 26) */
  const ok=dayApproved(di), dp=dayShownPendCount(di);
  const dw=(WARN.byDay[di]&&WARN.byDay[di].warns)||[];
  const nS=(v:any)=>dw.filter((w:any)=>w.sev===v).length;
  let ac=0,forms=0,cxn=0;
  (d.waves||[]).forEach((w:any)=>(w.formations||[]).forEach((f:any)=>{forms++;(f.aircraft||[]).forEach((a:any)=>{ac++; if(a.cx||f.cx)cxn++;});}));
  const sims=['amt','oft'].reduce((n:any,k:any)=>n+((((d.sims||{})[k])||[]).filter((r:any)=>!r.cx).length),0);
  const duties=(d.dutywaves||[]).reduce((n:any,g:any)=>n+(g.rows||[]).filter((r:any)=>!r.cx).length,0);
  const grd=(d.ground||[]).filter((g:any)=>!g.cx).length;
  const prog=(d.allhands||[]).filter((x:any)=>!x.cx).length;
  const eng=dayEngaged(d).size, off=dayOff(d).size;
  const A=availByWave(d), freeAll=A.anyWave.length;
  const row=(k:any,v:any)=>`<div class="dip-r"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  const alRecs=SCHED.als.filter((a:any)=>+a.di===di).slice().sort((a:any,b:any)=>+a.seq-+b.seq);
  const alRows=alRecs.length
    ? alRecs.map((a:any)=>{const n=alCount(a);
        return `<span class="dip-al" data-alc="${a.seq}">${verLabel(a.id)}<i>${n} item${n===1?'':'s'}</i></span>`;}).join('')
    : `<span class="dip-none">No amendment has touched this day yet</span>`;
  /* same visibility rule as the day-head chip: name the current version once
     amendments exist, so a rolled-back day says which document it is showing */
  const cv=dayCurVer(di);
  const atVer=(ok&&cv!=null&&(verSeq(cv)!==0||alRecs.length))?` · at ${verLabel(cv)}`:'';
  let h=`<div class="dip-stat ${ok?'ok':'draft'}">${ok?'✓ Published — APPROVED'+atVer:'Draft — not yet published'}`
    +`${dp?`<span class="dip-pend">${dp} unpublished edit${dp>1?'s':''}</span>`:''}</div>`;
  h+=`<div class="dip-h">AL versions covering ${esc(d.dow)}</div><div class="dip-als">${alRows}</div>`;
  h+=`<div class="dip-h">What this day is tasking</div><div class="dip-grid">`
    +row('Waves',(d.waves||[]).length)+row('Formations',forms)
    +row('Aircraft lines',ac+(cxn?` <i>(${cxn} CX)</i>`:''))
    +row('Sim rows',sims)+row('Duties',duties)+row('Ground items',grd)
    +row('Squadron-wide',prog)+row('Aircrew tasked',eng)
    +row('Leave / downchit',off)+row('Free all day',freeAll)
    +`</div>`;
  h+=`<div class="dip-h">Issues on this day</div>`;
  if(!dw.length)h+=`<div class="dip-none">Nothing flagged — this day is clean ✓</div>`;
  else{
    h+=`<div class="dip-sev">`
      +(nS('hard')?`<b class="hard">${nS('hard')} warning</b>`:'')
      +(nS('adv')?`<b class="adv">${nS('adv')} advisory</b>`:'')
      +(nS('note')?`<b class="note">${nS('note')} note</b>`:'')+`</div>`;
    h+=`<div class="dwlist dip-list">`+dw.map((w:any,ix:any)=>{
      const names=(w.who||[]).map((id:any)=>PEOPLE[id]?PEOPLE[id].cs:id).join(', ');
      /* the active mark, same test as the week's rows — every surface that
         navigates says which row is lit (owner, 7 Aug 26; this panel and the
         cross-day row were the two that did not) */
      const on=WFOCUS&&WFOCUS.di===di&&WFOCUS.ix===ix;
      return `<div class="witem ${w.sev}${on?' on':''}" data-adv="${di}.${ix}" title="Jump to the puck that caused this">`
        +`<span class="wbar"></span><span><span class="wcode">${SEVWORD[w.sev]} · ${esc(wlbl(WCODE[w.code]||w.code))}</span>`
        +`<b>${esc(names)}</b>${names?' — ':''}${esc(w.msg||'')}</span></div>`;}).join('')+`</div>`;
  }
  return h;
}
