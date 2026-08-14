import { DAYS } from '../engine/data'
import { PEOPLE, isSpecial, nameToId, QCHIP, QCLASS, LEVELNAME } from '../engine/people'
import { INPUTS, inputCoversDate, inpLabel, inpId, inpTimeText, isOffType, offWord, isLeave, isDownchit, isPersonal, isUnavail, isSansAvail, sansBadge, sansAvailOn, sansWindow, sansLetters, isLateInput, lateNote } from '../engine/inputs'
import { isStandalone, scSpare, dayCount, mColor, saExempt, SAWAVE } from '../engine/waves'
import { parseHM, hhmm, hm24, minus } from '../engine/time'
import { slotVal, txtGet, TIME_TXT, whoArr, rowCrew, rowRef, inpKey } from '../engine/slots'
/* RANK left with the focus-scoped trace: ranking the CR chip against the day's
   own worst is traceLeads' job now, in the engine, so both the chip and the
   click that follows it read one test */
import { WARN, sevOf, chipOf, dashOf, traceOf, traceLeads, traceIx, tracesOn, chipText, wlbl, WCODE, SEVWORD, CHIP_LABEL } from '../engine/validate'
import { availByWave, personBusy, dayOff, dayEngaged, personWarns } from '../engine/avail'
import { SCHED, alAttr, dayApproved, dayALs, dayCurVer, dayPendCount, alColor, signOf, signMissing, signPeople, SIGN_ROLES, daySigned, nextAL, dowShort, alDays, daySnapOf, dayVersions, verLabel } from '../engine/publish'
import { keyDay } from '../engine/keys'
import { VCONF } from '../engine/rules'
import { esc, SBDAY, WFOCUS, PFOCUS, DWOPEN, DPREV, AVOPEN } from '../state/view'
import { canEditSched } from '../state/auth'
import { ME } from '../state/auth'
import { HOOKS } from '../engine/hooks'
import { STORE_CFG, groundOrder } from '../engine'

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
let PV=false, PVV:any=null
const sev=(di:any,id:any)=>PV?null:sevOf(di,id)
/* THE PREVIOUS-DAY TRACE (owner, 6 Aug 26; made a standing mark 6 Aug 26).
   A crew-rest breach is raised on the day the man is told to report, but the
   day a scheduler can still FIX is the one before — so that day carries the
   mark: a dotted ring, a CR label, and the leave-by time, painted the moment
   the week renders. It used to appear only while the warning was focused,
   which meant you had to already know about the breach to be shown its cause.
   Model state now (validate() files every breach against its previous day and
   publishes it as WARN.trace), so this re-derives nothing — and PV still gets
   nothing at all, because a frozen snapshot must not read live WARN. */
const traceHit=(di:any,id:any)=>PV?null:traceOf(di,id)
/* the flag the puck prints: the day's own worst chip, or CR where this day
   caused tomorrow's breach and the man carries nothing louder of his own.
   traceLeads applies exactly that test, and interactions.ts routes the click
   by the same call, so the chip and the warning it opens cannot disagree. */
const chip=(di:any,id:any)=>{ if(PV)return null
  return traceLeads(di,id)?'CR':chipOf(di,id) }
const dsh=(di:any,id:any)=>PV?false:dashOf(di,id)
/* the ONE place the snapshot may stand in for the live model. finally is not
   optional: a throw mid-build with the swap live would leave the old day
   installed as the real schedule — a silent history rewrite on the next
   validate. */
export function withDaySnap(di:any,ver:any,fn:any){
  const snap=daySnapOf(di,ver)
  if(!snap)return fn(false)
  const d0=DAYS[di], c0=SCHED.changes, p0=SCHED.pending
  DAYS[di]=snap.d; SCHED.changes=snap.c||{}; SCHED.pending={}
  PV=true; PVV=ver
  try { return fn(true) }
  finally { DAYS[di]=d0; SCHED.changes=c0; SCHED.pending=p0; PV=false; PVV=null }
}
export function dayPreviewHTML(di:any,ver:any,edFallback:any){
  return withDaySnap(di,ver,(ok:any)=>ok?dayHTML(di,false,true):dayHTML(di,edFallback,true))
}
export function verSelHTML(di:any){
  const vs=dayVersions(di)
  if(vs.length<2)return ''
  const cur=DPREV.has(di)?DPREV.get(di):'live'
  return `<select class="dver" data-dver="${di}" title="View this day as it was issued — pick a version">`
    +vs.map((v:any)=>`<option value="${v}"${String(v)===String(cur)?' selected':''}>${verLabel(v)}</option>`).join('')+`</select>`
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
    <span><span class="qk" style="background:#E5A83B;color:#12100a">DT</span>double turn</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">TT</span>tight turn</span>
    <span><span class="qk" style="background:#F0555F">C</span>conflict</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">A</span>advisory — shift + ground</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">CP</span>crew pairing — needs approval</span>
    <span><span class="qk" style="background:#F0555F">CP</span>crew pairing — not authorised</span>
    <span><span class="qk" style="background:#F0555F">R</span>crew rest</span>
    <span><span class="qk" style="background:#F0555F">7</span>no break day</span>
    <span><span class="qk" style="background:#F0555F">Q</span>qual / illegal seat</span>
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
export function puck(id:any,warn:any,sm:any,flag:any,dash?:any,trace?:any){
  const p=PEOPLE[id]; if(!p)return'';
  if(p.special){   // sentinel puck: canonical size, no seat/qual/SANS decoration
    return `<span class="puck allavail${sm?' sm':''}" tabindex="0" data-person="${id}" title="${esc(p.cs)}"><span class="nm">${esc(p.cs)}</span></span>`;
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
  const trFlag=!!trace&&flag==='CR';       // the printed flag came off the trace
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
  const qchip=p.q?`<span class="role ${chipCls}">${chipTxt}</span>`:'';
  /* The trace speaks in the reader's terms — the day it breaks and the time
     this man had to be gone by — rather than the generic threshold label a CR
     chip carries on the day of the breach itself. Only when the trace OWNS the
     flag: where a louder chip won it, that chip keeps its own caption and the
     trace text rides on the puck title below instead. */
  const trLbl=trace?`Crew rest — ${trace.dow||'the next day'} is broken by this day: he had to leave by ${trace.leaveBy}`:'';
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
  return `<span class="${cls.join(' ')}" tabindex="0" data-person="${id}" title="${ttl}">${lchip}<span class="nm">${esc(p.cs)}</span>${qchip}</span>`;
}

export function slotCell(id:any,sev:any,key:any,kind:any,editable:any,flag:any,dash?:any,trace?:any){
  const al=alAttr(key);
  /* preview: no data-slot, no draggable — the key addresses the LIVE model */
  if(id) return `<span class="seat"${PV?'':` data-slot="${key}"`}${al}${editable?' draggable="true"':''}>${puck(id,sev,false,flag,dash,trace)}</span>`;
  if(editable) return `<span class="seat empty-slot" data-slot="${key}"${al}>+ ${kind}</span>`;
  return `<span class="seat"${al}></span>`;
}
export function fmtT(s:any){const m=parseHM(s);return m==null?esc(s||''):hhmm(m);}
export const ORD=['1st','2nd','3rd','4th','5th'];
export function plCols(){return `<div class="pl-cols"><span class="h-nm">Name</span><span class="h-st">Start</span><span class="h-en">End</span><span class="h-pp">People</span><span class="h-rk">Rmks</span></div>`;}
/* one crew position inside a list cell (programme / duties / sims / ground).
   Draggable in edit mode; renders nothing when empty so cells stay clean. */
export function lSeat(di:any,id:any,key:any,ed:any){
  if(!(id&&PEOPLE[id]))return '';
  return `<span class="seat"${PV?'':` data-slot="${key}"`}${alAttr(key)}${ed?' draggable="true"':''}>${puck(id,sev(di,id),true,chip(di,id),dsh(di,id),traceHit(di,id))}</span>`;}
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
export function lCell(inner:any,fillKey:any,ed:any,cls:any){
  const live=!!(ed&&fillKey);
  return `<div class="ppl ${cls||''}"${live?` data-fill="${fillKey}"`:''}>${inner||''}`
    +(live?`<span class="addz" aria-hidden="true">+ add</span>`:'')+`</div>`;}
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
  const lt=late||'', lc=lt?' has-late':'';
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
/* The scheduler's hand-over note for one block of the day. EDIT AND BOARD ONLY —
   the view-only week is the ISSUED programme and must not carry working notes,
   so this returns nothing when ed is false even if the note has text in it
   (owner request, Aug 26). Reading is still open to any scheduler-side viewer;
   only writing needs canEditSched(). */
export function blkNoteHTML(di:any,d:any,ed:any,key:any,field:any){
  if(!ed)return '';
  const v=d[field]||'', a=alAttr(`${key}:${di}`);
  return `<div class="blknote-h">Scheduler notes</div>`
    +(canEditSched()
      ? `<div class="blknote ed" contenteditable="true" spellcheck="false" data-txt="${key}:${di}"${a}>${esc(v)}</div>`
      : `<div class="blknote"${a}>${esc(v)}</div>`);
}
/* Available-crew block: active aircrew by wave, then SANS grouped separately (they run to
   different currency requirements — see sanStatus()). Rendered at the bottom of the day.
   COLLAPSED to its one-line summary by default (owner, 13 Aug 26 — "the window
   is pretty big"); the header toggles per day through AVOPEN. Expanded, a wave
   line counts EVERYONE who can fly it — its own leftovers PLUS the all-day
   crew, who are by construction free for every wave — because the old
   leftovers-only count printed "— none free —" over a wave 22 people could
   fly, and the owner read that as a bug (13 Aug 26; it was the panel lying,
   not the engine). The grids still list each man once: the wave rows keep
   only the partially-free, the all-day crew keep their own group. */
export function availHTML(d:any,di:any,ed:any){
  const A=availByWave(d);
  /* in edit mode an available puck is a drag source — drag it straight onto a line,
     a duty, a sim or a programme item */
  const pk=(id:any)=>`<span class="seat"${ed?` draggable="true" data-person="${id}"`:''}>${puck(id,sev(di,id),true,chip(di,id),dsh(di,id),traceHit(di,id))}</span>`;
  const active=(ids:any)=>ids.filter((id:any)=>!PEOPLE[id].san);
  const grid=(ids:any)=>ids.length?`<div class="ap-grid">`+ids.map(pk).join('')+`</div>`:`<div class="ap-empty">— none free —</div>`;
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
  if(!AVOPEN.has(di)){
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
   (inpKey(inp)), so the delegated click router in interactions.ts needs no
   new wiring to open the input-edit dialog from it. `ro` (a read-only board)
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
      : `<button class="sanscard" data-inpedit="${esc(inpKey(inp))}" title="Edit this input — times, type, remarks or delete">${inner}</button>`;
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
  return `<div class="sub plist one sec sec-sans"><div class="sub-h">SANS Availability`
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
  if(PV)return '';
  if(!pf&&!DWOPEN.has(di))return '';
  const rows=tracesOn(di)
    .filter(({id}:any)=>!pf||id===pf)
    .map(({id,t}:any)=>({id,t,ix:traceIx(t,id)}))
    .filter((r:any)=>r.ix>=0);
  if(!rows.length)return '';
  return `<div class="dwtrace">`+rows.map(({id,t,ix}:any)=>{
    const cs=PEOPLE[id]?PEOPLE[id].cs:id;
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
    const on=WFOCUS&&WFOCUS.di===t.di&&WFOCUS.ix===ix;
    return `<div class="witem hard wtr${on?' on':''}" data-wdi="${t.di}" data-wix="${ix}"${pan} title="Jump to the line on this day that caused it">`
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
export function dayWarnHTML(di:any){
  const all=(WARN.byDay[di]&&WARN.byDay[di].warns)||[];
  /* the strip stands on its own: a day with no issues of its own can still be
     the day that wrecks tomorrow, and that is exactly the case worth seeing */
  if(!all.length)return soloTrace(di,PFOCUS&&PFOCUS.id);
  /* When a puck is clicked the box narrows to that person's issues on this day
     — every other day they are flagged on opens the same way, so a cause that
     sits on the day before is right there next to the effect. */
  const pf=PFOCUS&&PFOCUS.id;
  const items=pf?personWarns(di,pf):all.map((w:any,ix:any)=>({w,ix}));
  if(pf&&!items.length)return soloTrace(di,pf);
  const dw=items.map((x:any)=>x.w);
  const worst=dw.some((w:any)=>w.sev==='hard')?'hard':dw.some((w:any)=>w.sev==='adv')?'adv':'note';
  const nh=dw.filter((w:any)=>w.sev==='hard').length;
  const open=DWOPEN.has(di);
  const cs=pf&&PEOPLE[pf]?PEOPLE[pf].cs:'';
  let h=`<div class="dwbox ${open?'open':''}${pf?' pfoc':''}" data-dwbox="${di}">`
   +`<div class="daywarn ${worst}" data-daywarn="${di}">`
   +`${pf?`<span class="dwwho">${esc(cs)}</span>`:''}`
   +`<b>⚠ ${dw.length} issue${dw.length>1?'s':''}</b>`
   +`${nh?` · ${nh} warning`:''} · <span class="dwcue">${open?'tap to collapse':'tap to review'}</span>`
   +`<span class="dwcar">${open?'▲':'▼'}</span></div>`;
  if(open){
    const row=({w,ix}:any)=>{
      const names=(w.who||[]).map((id:any)=>PEOPLE[id]?PEOPLE[id].cs:id).join(', ');
      const on=WFOCUS&&WFOCUS.di===di&&WFOCUS.ix===ix;
      return `<div class="witem ${w.sev}${on?' on':''}" data-wdi="${di}" data-wix="${ix}" title="Jump to the puck that caused this">`
        +`<span class="wbar"></span><span><span class="wcode">${esc(wlbl(WCODE[w.code]||w.code))}</span>`
        +`<b>${esc(names)}</b>${names?' — ':''}${esc(w.msg||'')}</span></div>`;
    };
    /* the cross-day row ranks below this day's warnings and above its
       advisories (owner, 7 Aug 26): it is red business, but tomorrow's.
       items are already severity-sorted (validate.ts), so the seam is the
       first non-hard row. */
    const cut=items.findIndex((x:any)=>x.w.sev!=='hard');
    const hards=cut<0?items:items.slice(0,cut), rest=cut<0?[]:items.slice(cut);
    h+=`<div class="dwlist">`+hards.map(row).join('')
     +dayTraceHTML(di,pf)
     +rest.map(row).join('')
     +(pf&&PFOCUS.days.length>1
        ? `<div class="dwecho">${esc(cs)} is also flagged on ${esc(PFOCUS.days.filter((x:any)=>x!==di).map(dowShort).join(', '))}</div>`:'')
     +(WFOCUS&&WFOCUS.di===di
        ? `<div class="dwecho">The same aircrew are lit dashed on every other day they appear</div>`
          +`<button class="dwclear" data-dwclear="1">✕ ${pf?`Back to ${esc(cs)}’s issues`:'Clear focus'}</button>`:'')
     +`</div>`;
  }
  return h+`</div>`;
}
export function intimesInner(w:any){
  return ((w&&w.intimes)||[]).map((t:any)=>`<span>${esc(t).replace(/^(\s*\d{3,4}\s*H)/i,'<b>$1</b>')}</span>`).join('');}
/* AREA and TIME are not the model fields they are edited through. Until a
   scheduler types over them they READ OFF THE AIRCRAFT: the distinct area codes on
   the formation, and the formation's own TO–LD. Both surfaces have to agree on that
   or clearing the cell would heal it to '' while the renderer still says AA2NS —
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
export function rowCls(o:any){return (o&&o.cx?' cx':'')+(o&&o.flag?' redbox':'');}
/* CX carries its reason: "CX DUE WX" rather than a bare CX, so the next
   scheduler reading the day knows why the line went. */
export function cxText(o:any){const r=o&&o.cxr?String(o.cxr).trim():'';return r?('CX DUE '+r):'CX';}
export function cxTag(o:any){return o&&o.cx?`<span class="cxtag" title="${esc(cxText(o))}">${esc(cxText(o))}</span>`:'';}
export function flagTag(o:any){return o&&o.flag?'<span class="flagtag" title="Flagged for the next scheduler">!</span>':'';}
/* LATE INPUT (owner, 9 Aug 26) — the mark that rides on an input last changed
   after the week's deadline (engine/inputs.ts's isLateInput). It is drawn
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
export function lateTag(inp:any){
  return (inp&&isLateInput(inp))?`<span class="latetag" title="${esc(lateNote(inp))}">LATE</span>`:'';}
/* the same mark on a row that CAME from an input — the ground row acceptInput
   builds, which carries the source input's key in `src`. This is what carries
   the mark onto the view-only page for a personal input: accepting it is the
   only way one reaches that page at all, and the mark has to survive the
   promotion or it would vanish exactly where the squadron reads the day. */
export function srcInput(o:any){
  const k=o&&o.src; if(!k)return null;
  return INPUTS.find((x:any)=>inpKey(x)===k)||null;}
export function lateTagOf(o:any){return lateTag(srcInput(o));}
/* The board's duty/sim/ground rows are a SEVEN-item grid whose header reserves
   exactly seven tracks, and every cell is a bare <input> with nowhere to nest
   a chip — an eighth grid item would walk every field one track left of its
   own header, which is the register bug the whole-branch review already found
   once. So the board's promoted ground row wears the mark as a row class (an
   inset amber edge, the .redbox idiom) plus the note in its tooltip: no extra
   node, no extra grid item, nothing to knock out of register. The row's own
   INPUT still carries the full chip in the Personal Inputs panel above it. */
export function lateRowCls(o:any){const inp=srcInput(o); return (inp&&isLateInput(inp))?' lateinp':'';}
export function lateRowTitle(o:any){const inp=srcInput(o); return (inp&&isLateInput(inp))?` title="${esc(lateNote(inp))}"`:'';}
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
export function dayHTML(di:any,ed:any,vsel?:any){
  const d=DAYS[di];
    /* ---- per-day approval strip -------------------------------------------
       Each day carries its own publish state, ONE version chip (the version the
       day is currently showing — not the AL history, which lives in the ⓘ
       panel) and its own pending-edit count. In edit mode the publish is a
       button; in view mode it is a read-only stamp, because clicking a day in
       the view-only page must never lead into editing.                        */
    const ok=dayApproved(di), dals=dayALs(di), dp=dayPendCount(di);
    /* the chip appears once amendments exist: a published day with no ALs
       anywhere keeps the clean "✓ Published" look, but a day rolled back to
       the Original while ALs sit in the dropdown must say so — silence there
       would look identical to "never amended". Grey ORIG, never AL1's cyan. */
    const cv=dayCurVer(di);
    const alChips=(ok&&cv!=null&&(cv!=='orig'||dals.length))
      ? (cv==='orig'
        ? `<span class="dal orig" title="${DAYS[di].dow} is currently at the Original — as first published">ORIG</span>`
        : `<span class="dal" data-alc="${cv}" title="${DAYS[di].dow} is currently at AL${cv}">AL${cv}</span>`)
      : '';
    const pendChip=dp?`<span class="dpend" title="${dp} unpublished edit${dp>1?'s':''} on this day${ok?'':' — publish the day before publishing an AL'}">${dp}&nbsp;pending</span>`:'';
    const sgOK=daySigned(di);
    const beak=ed
      ? `<button class="dbeak ${ok?'ok':''}${(!ok&&!sgOK)?' locked':''}" data-beak="${di}"${(!ok&&!sgOK)?' disabled':''} title="${ok?'Reopen '+d.dow+' to draft':(sgOK?'Publish '+d.dow+' — approve this day only':'Sign off '+signMissing(di).join(', ')+' before publishing '+d.dow)}">${ok?'✓ Published':'Publish day'}</button>`
      : `<span class="dbeak ro ${ok?'ok':''}" title="${ok?d.dow+' has been published':d.dow+' is still draft'}">${ok?'✓ Published':'Draft'}</span>`;
    /* per-day AL publish — lives beside the day's own publish button, only on a
       PUBLISHED day that carries pending edits of its own. Locked (darkened,
       like the publish-day lock) until the day's four sign-offs are in. The
       view page gets no button — status only. */
    const alN=nextAL();
    const alpub=(ed&&ok&&dp)
      ? `<button class="dbeak dalpub${sgOK?'':' locked'}" data-alpub="${di}"${sgOK?'':' disabled'} title="${sgOK
          ?`Publish AL${alN} — ${dp} change${dp>1?'s':''} on ${d.dow} only`
          :`Sign off ${signMissing(di).join(', ')} before publishing AL${alN}`}">Publish AL${alN}</button>`
      :'';
    /* the ⓘ chip is the ONLY way into the day panel on the view page, and it opens a
       read-only panel — clicking a day in view mode must never lead into editing. */
    const infoChip=`<button class="dinfobtn" data-dayinfo="${di}" title="${d.dow} — approval, AL versions, advisories">i</button>`;
    /* preview banner: the tint is the version's own colour, so "which AL am I
       looking at" reads the same way the marks do */
    const pvBar=PV
      ? `<div class="dprev-bar"${PVV!=='orig'?` style="--alc:${alColor(+PVV)}"`:''}>Viewing <b>${verLabel(PVV)}</b> as issued — read-only`
        +`<button class="dbeak dprev-restore" data-restore="${di}" data-rver="${PVV}" title="Make this version the live schedule now — later ALs stay available in the dropdown">Restore this version</button></div>`
      : '';
    let h=`<section class="day ${d.today?'today':''} ${ok?'dok':''}${PV?' preview':''}" data-day="${di}">
      <div class="day-head">${ed
        ? `<span class="dow sb-open" data-sbday="${di}" title="Open scheduler board">${d.dow}</span><span class="dt sb-open" data-sbday="${di}" title="Open scheduler board">${d.dt}${d.today?' · Today':''}</span>`
        : `<span class="dow di-open" data-dayinfo="${di}" title="Day details">${d.dow}</span><span class="dt di-open" data-dayinfo="${di}" title="Day details">${d.dt}${d.today?' · Today':''}</span>`}
      <span class="badge" title="Aircraft per wave · standalone lines after the slash">${dayCount(d)}</span>
      <span class="dstat">${vsel?verSelHTML(di):''}${alChips}${pendChip}${infoChip}${beak}${alpub}</span></div>`
      +pvBar
      +(ed?`<div class="signoff day-sign" data-signbar="${di}">${signoffHTML(di,false)}</div>`:'')
      +`<div class="day-body">`;
    /* warnings are live-model state — a snapshot is never validated */
    if(!PV)h+=dayWarnHTML(di);
    // ---- all-hands header: EP/ORDERS notes + squadron-wide items ----
    const hasNotes=!!(d.notes&&d.notes.length), hasAH=!!(d.allhands&&d.allhands.length);
    if(hasNotes||hasAH||ed){
      h+=`<div class="allhands sec sec-prog"><div class="ah-h">Common Programme</div>`;
      (d.notes||[]).forEach((n:any,ni:any)=>h+=ted(`dn:${di}.${ni}`,n,ed,'ah-note','div'));
      if(hasAH){
        h+=`<div class="ah-cols"><span>Name</span><span>Start</span><span>End</span><span>People</span></div>`;
        d.allhands.forEach((x:any,ri:any)=>{
          const arr=whoArr(x);
          /* A BLANKED ENTRY IS A HOLE, NOT FREE TEXT. setSlotVal's 'a:' branch holds
             the index instead of splicing, so a published AL key keeps pointing at
             the same person — which means who[] legitimately carries gaps. Rendered
             as an empty .itxt each gap became a zero-width flex item that still ate
             the cell's 4px gap, walking every later puck to the right: four gaps put
             a puck 16px out of line with the rest of its row. */
          const inner=arr.map((nm:any,k:any)=>{const id=nameToId(nm);
            if(id&&PEOPLE[id])return lSeat(di,id,`a:${di}.${ri}.${k}`,ed);
            return String(nm||'').trim()?`<span class="itxt">${esc(nm)}</span>`:'';}).join('');
          const ppl=lCell(inner,`a:${di}.${ri}.+`,ed,arr.length===1?'one':'');
          const sub=(x.sub||ed)?ted(`ap:${di}.${ri}.sub`,x.sub,ed,'sub'):'';
          h+=`<div class="ah-row${rowCls(x)}"><span class="nm">${cxTag(x)}${flagTag(x)}${ted(`ap:${di}.${ri}.prog`,x.prog,ed,'ntx')}${sub}</span>`
            +`${ted(`ap:${di}.${ri}.str`,x.str,ed,'t')}${ted(`ap:${di}.${ri}.end`,x.end,ed,'t')}${ppl}</div>`;
        });
      }
      if(ed&&!hasNotes&&!hasAH)h+=`<div class="ah-empty">Nothing squadron-wide yet — add notes and programme items from the scheduler board.</div>`;
      h+=blkNoteHTML(di,d,ed,'pn','prognotes');
      h+=`</div>`;
    }
    if(!d.waves||!d.waves.length)
      h+=`<div class="nobox" style="background:rgba(138,150,163,.08);border-color:var(--edge);border-left-color:var(--edge-2);color:var(--ink-3)">No flying — ground day.</div>`;
    // ---- waves ----
    (d.waves||[]).forEach((w:any,gi:any)=>{
      /* a wave can legitimately be empty for a moment — the scheduler just removed its
         last line and is about to add another — so never index formations[0] blind. */
      const f0=(w.formations||[])[0];
      const sa=isStandalone(w);
      const edge=sa?'var(--san)':`var(--${mColor(f0?f0.msn:'')})`;
      h+=`<div class="go ${w.night?'night':''} ${sa?'sa sa-'+(w.kind||'x'):''}" style="border-left-color:${sa?'var(--san)':(w.night?'var(--hard)':edge)}">
        <div class="go-tab"><span class="asd">${ted(`wl:${di}.${gi}`,w.label,ed,'ntx')}${!sa&&w.night&&!/night/i.test(w.label)?' · NIGHT':''}`
        +`${sa?`<span class="satag" title="${esc((SAWAVE[w.kind]||{}).note||'Standalone — outside the day\u2019s flying count')}">standalone${w.noconf?(w.kind==='avalon'?' · availability check only':' · not cross-checked'):''}</span>`:''}</span>
        ${sa?'':`<button class="airbtn" data-air="${di}|${gi}">Traffic</button>`}</div>`;
      if(w.intimes&&w.intimes.length)
        h+=`<div class="intimes"${alAttr(`it:${di}.${gi}`)} ${ed?`contenteditable="true" spellcheck="false" data-intimes="${di}|${gi}"`:''}>${intimesInner(w)}</div>`;
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
        h+=`<div class="form${rowCls(f)}">
          <div class="fcell csmsn" style="${spans}">${cxTag(f)}${flagTag(f)}<b><span class="mdot" style="background:${sa?'var(--san)':`var(--${mColor(f.msn)})`}"></span>${ted(fp+'.cs',f.cs,ed,'ntx')}</b>${ted(fp+'.msn',f.msn,ed,'','i')}</div>
          ${sa
            ? `<div class="fcell bto" style="${spans}">${ted(fp+'.to',f.to,ed,'ntx','span')}</div>`
            : `<div class="fcell bto" style="${spans}">${brSug}${ted(fp+'.br',brShown,ed,'','b')}${ted(fp+'.to',f.to,ed,'','span')}</div>`}
          <div class="fcell ld" style="${spans}">${ted(fp+'.ld',f.ld,ed,'ntx')}</div>`;
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
              +`<span class="bombs" contenteditable="true" data-bombs="${key}">${esc(o.bombs||'')}</span></span>`
            : storesView(o);
          const acx=(f.cx?'':rowCls(a))+((sa&&a.spare)?' spare':'');   // a cancelled formation already fades the whole block
          /* marks "nothing at all to say about this jet". RMKS is a real column again so
             the empty cell just stays blank rather than being hidden, but the class is
             kept as the hook anything later needs to spot a silent aircraft. */
          const rmkE=(!ed&&!(a.rmks||'').trim()&&!storesView(o)&&!a.cx&&!a.flag)?' rmk-e':'';
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
             LEAVE_FLY — the red C) and SC currency, which is checked for MAIN
             and SPARE alike (SC_QUAL — the red Q). Nothing else can anchor to
             an exempt line, and both rules are hard, so these pucks ring red
             or not at all — the owner confirmed no amber rule lives here. BB
             can anchor nothing and so never rings, with no special case. */
          const chk=!saExempt(w,f,a), fkey=`${di}.${gi}.${li}`;
          const own=(id:any)=>{ if(PV||!id)return null;
            const g=WARN.byDay[di];
            const hit=((g&&g.warns)||[]).find((x:any)=>(x.code==='DNIF_FLY'||x.code==='LEAVE_FLY'||x.code==='SC_QUAL')
              &&(x.who||[]).includes(id)&&(x.key===fkey||String(x.key||'').indexOf(fkey+'.')===0));
            return hit?(hit.code==='SC_QUAL'?'Q':'C'):null; };
          const sv=(id:any)=>chk?sev(di,id):(own(id)?'hard':null), cp=(id:any)=>chk?chip(di,id):own(id), dh=(id:any)=>chk?dsh(di,id):false,
                tr=(id:any)=>chk?traceHit(di,id):null;
          h+=`<div class="acrow${ai?'':' r1'}${acx}" style="--gr:${ai+1}"><span class="pucks">${slotCell(a.p,sv(a.p),key+'.p','FCP',ed,cp(a.p),dh(a.p),tr(a.p))}${slotCell(a.w,sv(a.w),key+'.w','RCP',ed,cp(a.w),dh(a.w),tr(a.w))}</span></div>
              <div class="rmkcell${ai?'':' r1'}${acx}${rmkE}" style="--gr:${ai+1}"${alAttr(`st:${key}`)}>${cxTag(a)}${flagTag(a)}${ted(`fr:${key}`,a.rmks,ed,'ntx',null,sa?(a.role||(a.spare?'SPARE':'MAIN')):null)}${sa?'':stores}</div>`;
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
    /* ---- ground programme (scheduler-entered) ----
       On the scheduler's side it is one of TWO ground blocks, so it says which
       one it is. The view-only page sees no personal inputs at all, so there is
       nothing to distinguish it from and the qualifier would be noise.
       `|| ed` for the same reason as Duties: the notes box must survive an
       empty section. */
    if((d.ground&&d.ground.length)||ed){
      const grd=d.ground||[];
      h+=`<div class="sub plist one sec sec-grnd"><div class="sub-h">Ground Programme${ed?' · scheduler':''}</div>`+(grd.length?plCols():'');
      groundOrder(grd,d.gman).forEach(({row:x,ri}:any)=>{const id=nameToId(x.who), key=`g:${di}.${ri}`;
        const inner=((id&&PEOPLE[id])?lSeat(di,id,key,ed):(x.who?`<span class="itxt">${esc(x.who)}</span>`:''))+moreSeats(di,key,ed);
        const n=rowCrew('g',[di,ri]).filter(Boolean).length;
        h+=plRow(x.prog,x.str,x.end,lCell(inner,key+'.+',ed,n<=1?'one':''),`gr:${di}.${ri}`,'prog',ed,x);});
      h+=blkNoteHTML(di,d,ed,'gn','grndnotes');
      h+=`</div>`;
    }
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
      /* what is typeable is only discoverable on hover, and half the squadron
         is on a phone where there is no hover — so the block says it once,
         rather than every row carrying a hint it has no room for.
         Scheduler-side only: the view-only week cannot edit anything. */
      let s=`<div class="sub plist one sec ${cls||''}"><div class="sub-h">${title}${ed?`<span class="pl-hint">times and remarks type in place · clear a time for all day · press the type to change it</span>`:''}</div>`;
      /* Unavailable is the block the squadron reads every single day, so it
         prints even when nobody is on it — "Nil" is the answer, not a missing
         section. */
      if(!rows.length)return s+`<div class="pl-nil">Nil</div></div>`;
      s+=plCols();
      rows.forEach((inp:any)=>{
        const pk=PEOPLE[inp.person]
          ? `<span class="seat">${puck(inp.person,sev(di,inp.person),true,chip(di,inp.person))}</span>`
          : `<span class="itxt">${esc(inp.person)}</span>`;
        /* the input's own free text now reads in the RMKS column, so the NAME column
           carries the type and every block lines up on the same five columns */
        s+=`<div class="pl-row${acc&&inp.acc?' accd':''}">`
          +`<span class="nm">${inpEditLabel(inp,ed,inpLabel(inp),'ntx')}</span>${inpTimeCells(inp,ed)}`
          +`<div class="ppl one">${pk}</div>${inpRmkCell(inp,ed,d.dt)}`
          +(acc?accCtl(di,inp):'')+`</div>`; });
      return s+`</div>`; };
    if(ed)h+=inGrp('Personal Inputs',(inp:any)=>isPersonal(inp.type)&&inp.acc!=='u','sec-inp',false,true);
    // ---- available crew (computed, not an input type) stays scheduler-side ----
    if(ed)h+=availHTML(d,di,ed);
    /* SANS AVAILABILITY IS ITS OWN GROUP, drawn as a card grid rather than
       through inGrp's row builder (owner rework, 14 Aug 26 — see
       sansSectionHTML/sansCardsHTML above for why). Scheduler-side only, like
       Personal Inputs: a member files it on the Inputs page, a scheduler
       reads it here. */
    h+=sansSectionHTML(d,di,ed);
    // SANS Availability is an offer, not an absence — it reads isUnavail (no Accept controls) but does not belong in this block
    h+=inGrp('Unavailable',(inp:any)=>(isUnavail(inp.type)||inp.acc==='u')&&!isSansAvail(inp.type),'sec-unav',true);
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
  return `<button class="${cls} inpedit" data-inpedit="${esc(inpKey(inp))}" title="Edit this input — times, type, remarks or delete">${t}</button>`;
}
/* The accept control on a personal-input row. "Other" is the one type whose
   destination is genuinely ambiguous — it can be something the squadron has to
   run (ground programme) or something that simply closes the man (unavailable) —
   so it offers both. Everything else has one sensible home. An accepted row
   shows Undo instead, which removes the ground row it created. */
export function accCtl(di:any,inp:any){
  if(!canEditSched())return `<span class="accs"></span>`;
  const k=esc(inpKey(inp));
  if(inp.acc)return `<span class="accs"><button class="accb undo" data-acc="x" data-accd="${di}" data-acck="${k}" title="Undo — removes the ground-programme row this created">Undo</button></span>`;
  const b=(dest:any,lbl:any,ttl:any)=>`<button class="accb" data-acc="${dest}" data-accd="${di}" data-acck="${k}" title="${ttl}">${lbl}</button>`;
  return `<span class="accs">`
    +(/^Other$/i.test(String(inp.type))
      ? b('g','→ Ground','Accept into the ground programme')+b('u','→ Unavail','File under Unavailable')
      : b('g','Accept','Accept into the ground programme'))
    +`</span>`;
}
/* the strip that lives in one day's header. `full` is the roomy board version. */
export function signoffHTML(di:any,full:any){
  const g=signOf(di), miss=signMissing(di), any=SIGN_ROLES.some((r:any)=>g[r[0]]);
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
    +`<span class="so-state ${miss.length?'no':'yes'}">${miss.length
        ? `${miss.length} to sign${full?' · '+miss.join(', '):''}`
        : 'Signed — this day can be published'}</span>`;
}
/* =====================================================================
   DAY DETAILS — the ⓘ chip on every day head. Approval state, which AL
   versions amended this day, unpublished edits, what the day is actually
   tasking, and every warning / advisory / note on it. Read-only: opening it
   from the view page must never lead into editing.
   ===================================================================== */
export function dayInfoHTML(di:any){
  const d=DAYS[di]; if(!d)return '';
  const ok=dayApproved(di), dp=dayPendCount(di);
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
  const alRecs=SCHED.als.filter((a:any)=>alDays(a).includes(di));
  const alRows=alRecs.length
    ? alRecs.map((a:any)=>{const n=(a.keys||[]).filter((k:any)=>keyDay(k)===di).length;
        return `<span class="dip-al" data-alc="${a.n}">AL${a.n}<i>${n} item${n===1?'':'s'}</i></span>`;}).join('')
    : `<span class="dip-none">No amendment has touched this day yet</span>`;
  /* same visibility rule as the day-head chip: name the current version once
     amendments exist, so a rolled-back day says which document it is showing */
  const cv=dayCurVer(di);
  const atVer=(ok&&cv!=null&&(cv!=='orig'||alRecs.length))?` · at ${verLabel(cv)}`:'';
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
