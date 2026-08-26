/* The scheduler-board panel builders — sbInputsHTML, sbNotesPanel,
   sbProgPanel, sbSimPanel, sbSlot, labelToTitle/titleToLabel — verbatim. */
import { INPUTS, inpMeta, inputCoversDate, inpLabel, inpId, inpTimeText, isPersonal, isUnavail, isSansAvail, sansBadge } from '../engine/inputs'
import { PEOPLE, nameToId } from '../engine/people'
import { hhmm } from '../engine/time'
import { sevOf, chipOf } from '../engine/validate'
import { whoArr } from '../engine/slots'
import { alAttr } from '../engine/publish'
import { groundOrder } from '../engine/order'
import { esc, PIOPEN, notePub } from '../state/view'
import { canEditSched } from '../state/auth'
import { ORD, puck, rowCls, accCtl, inpEditLabel, lateTag, lateChip, lateRowCls, lateRowTitle, sansCardsHTML, notePubTog } from './html'

/* ONE CLOCK ON THE BOARD (owner, 16 Aug 26). Aircrew-submitted input times
   arrive as minutes and format with a colon (hhmm → "09:00"), but every
   scheduler-typed time on this board — brief, take-off, land, duty and ground
   start/end — reads 4-digit ("0900"). Printing the input rows the board's way
   keeps one screen on one clock. The edit box still ACCEPTS either form
   (setInpField's hmOK), so typing is unchanged; only the printed value differs.
   Scoped to the board — the week's input rows and the aircrew Inputs page keep
   their own colon format (both a different surface, neither the ask). */
const hm4 = (m: any) => hhmm(m).replace(':', '')
const inpHM = (inp: any, field: any) => inpTimeText(inp, field).replace(':', '')

/* ---- reorder grip + nudge buttons (owner, 8 Aug 26) -----------------------
   A grip at the far left on desktop, ▲/▼ in the row's own control cluster on a
   phone, where a tall multi-strip flying block and a scrolling finger make a
   drag the wrong gesture. BOTH are always emitted and CSS picks: rendering by
   viewport would make the panel string-diff depend on window size and would not
   survive a resize.
   `mv:<kind>.<container…>.<index>` — parsed only by engine/reorder.ts, and
   carried by the ROW element itself (data-move on .sb-line / .sb-arow /
   .sb-nrow), never by the grip: Task 7's drag machine finds the row under the
   moving pointer with closest('[data-move]'), and a pointer is over the row's
   middle far more often than over an 18px handle — the address has to resolve
   there, not on the grip, or a drag would only ever find a target while
   hovering the handle, which is no drag at all. */
export function sbGrip(ro?:any){
  /* ALWAYS emitted now (review fix, 9 Aug 26 — finding #1). Every row
     template in scheduler.css reserves a fixed leading 18px track for this
     element no matter the render mode, so omitting it (as this used to do
     whenever ro) left every OTHER field in the row one track out of
     register with its own header — a read-only board's callsign input went
     64px → 18px, its notes input 783px → 22px, on every single row. `ro`
     now governs only two things: the `.ro` class, which scheduler.css turns
     into `visibility:hidden` (the box still generates and still holds its
     grid track — display:none would not, and would reproduce the exact
     register bug this fixes) — and the row's OWN data-move attribute
     (rowMove, below), which is what the drag machinery actually keys off.
     rowdrag.ts's onDown already requires closest('[data-move]') on the row
     before it will start anything, so a read-only row's grip is inert the
     moment rowMove withholds that attribute — no separate interaction gate
     needed here. */
  return `<span class="sb-grip${ro?' ro':''}" title="${ro?'':'Drag to move this row'}">⠿</span>`;
}
/* the row's OWN data-move, gated the same way the grip used to gate it: a
   preview or read-only board must render no live control at all, and that
   now includes the address itself, or a stale mutable-looking attribute
   would sit on markup nothing can act on. */
export function rowMove(addr:any,ro?:any){
  return ro?'':` data-move="${addr}"`;
}
export function sbNudge(addr:any,ro?:any){
  return ro?'':`<button class="mbtn nudge" data-mvup="${addr}" title="Move up">▲</button>`
    +`<button class="mbtn nudge" data-mvdn="${addr}" title="Move down">▼</button>`;
}
/* Auto sort — a way back to a sensible order that isn't Undo (owner, 8 Aug
   26). One button per section, beside its own + Row / + Line, gated on the
   same ro flag as the grip and the nudge buttons: a preview or read-only
   board renders no live control at all. `addr` is the section address
   engine/reorder.ts's sortsec dispatch in boardMbtn parses — NOT a mv:
   address, sorting is a whole-section operation, not a row move. */
export function sbSortBtn(addr:any,ro?:any){
  return ro?'':`<button class="mbtn" data-sortsec="${addr}" title="Sort this section">⇅ Auto sort</button>`;
}

export const SB_BANDS=[
  {k:'early',t:'Early',      note:'before 08:00',    lo:0,   hi:480},
  {k:'am',   t:'Morning',    note:'08:00 – 11:59',   lo:480, hi:720},
  {k:'mid',  t:'Midday',     note:'12:00 – 13:59',   lo:720, hi:840},
  {k:'pm',   t:'Afternoon',  note:'14:00 – 16:59',   lo:840, hi:1020},
  {k:'eve',  t:'Evening',    note:'17:00 – 19:59',   lo:1020,hi:1200},
  {k:'late', t:'Late',       note:'20:00 onwards',   lo:1200,hi:100000},
];
/* The colour a type chip wears on the board. Read off INPUT_META rather than
   its own regexes (10 Aug 26): it used to test /^Downchit/ and /^Detachment/
   by hand, and with twenty types those two would simply have stopped matching
   anything — every medical code and OD would have quietly turned into the
   grey ty-gp, which is the "ordinary commitment" colour. Same four colours,
   now derived: medical keeps the downchit red, leave the leave green, OD the
   detachment amber it inherits, and the activity types the grey. */
export function inTypeCls(t:any){
  const m=inpMeta(t);
  if(!m)return 'ty-gp';
  return m.grp==='med'?'ty-dn':m.grp==='leave'?'ty-lv':m.grp==='duty'?'ty-dt':m.grp==='sans'?'ty-sn':'ty-gp';
}
/* The remarks cell shared by the board's two input surfaces — the inputs bands
   and the Personal Inputs panel. The LATE badge leads it (owner, 9 Aug 26 —
   the mark moved out of the type chip into remarks); the cell clips with an
   ellipsis, so anything that must survive a long remark has to come first.
   The em dash is the placeholder for "nothing written", and it is dropped when
   the badge is there — "LATE —" would read as a remark that says nothing. */
/* dt (optional): only ever passed for a SANS row, from sbInpRow's read-only
   branch below — sbInputsHTML's own call omits it, so that surface is
   unchanged. The badge prefixes the same way lateTag does, one span nested
   inside this cell rather than a new sibling, because sbi-rm is a grid CHILD
   in both callers and adding a sibling there would misregister every column
   after it (the c6r register lesson, see sbInpRow). */
function sbiRmk(inp:any,dt?:any){
  const lt=lateTag(inp), v=inp.remarks||'';
  const sb=isSansAvail(inp.type)&&dt?sansBadge(inp.person,dt):'';
  const sbt=sb?`<span class="sansb" title="SANS availability">${esc(sb)}</span>`:'';
  return `<span class="sbi-rm" title="${esc(v)}">${lt}${sbt}${esc(v)||(lt||sbt?'':'—')}</span>`;
}
/* No longer rendered on the board (owner, 22 Aug 26 — the summary band was
   removed; the live Personal Inputs / Unavailable / SANS panels carry the
   data). Kept as a pure builder because probe-bridge still exposes it. */
export function sbInputsHTML(d:any,di:any){
  const rows=INPUTS.filter((inp:any)=>inputCoversDate(inp,d.dt));
  let h=`<div class="sbi-h"><b>Inputs · ${esc(d.dow)} ${esc(d.dt)}</b>`
   +`<span class="sbi-n">${rows.length} entr${rows.length===1?'y':'ies'} · morning → late</span></div>`;
  if(!rows.length)return h+`<div class="sbi-empty">No personal inputs submitted for this day.</div>`;
  const row=(inp:any)=>{
    const pk=PEOPLE[inp.person]
      ? `<span class="seat">${puck(inp.person,sevOf(di,inp.person),true,chipOf(di,inp.person))}</span>`
      : `<span class="itxt">${esc(inp.person)}</span>`;
    const t=inp.allday?(inp.endDate?`all day · till ${esc(inp.endDate)}`:'all day')
                      :`${hm4(inp.s)} – ${hm4(inp.e)}`;
    return `<div class="sbi-row"><span class="sbi-t">${t}</span>${pk}`
      +`<span class="sbi-ty ${inTypeCls(inp.type)}" title="${esc(inp.type)}">${esc(inpLabel(inp))}</span>`
      +sbiRmk(inp)+`</div>`;
  };
  const band=(title:any,note:any,cls:any,list:any)=>`<div class="sbi-band ${cls}">${title}<span class="bn">${note}</span></div>`
      +list.map(row).join('');
  const allday=rows.filter((r:any)=>r.allday)
    .sort((a:any,b:any)=>(PEOPLE[a.person]?PEOPLE[a.person].cs:a.person).localeCompare(PEOPLE[b.person]?PEOPLE[b.person].cs:b.person));
  if(allday.length)h+=band('All day','full-day inputs',' allday',allday);
  SB_BANDS.forEach((b:any)=>{
    const g=rows.filter((r:any)=>!r.allday&&(r.s||0)>=b.lo&&(r.s||0)<b.hi).sort((x:any,y:any)=>(x.s||0)-(y.s||0));
    if(g.length)h+=band(b.t,b.note,b.k,g);
  });
  return h;
}
/* ---- board panel 1: overall notes for the whole day ---------------------
   Free-text lines that head the day in the week view (EP of the week, ORDERS,
   whatever the scheduler wants everyone to read first). */
/* pv: the board is showing a published snapshot — every control that could
   write is withheld (disabled inputs, no add/del/CX buttons, no drop targets),
   because the keys in this markup address the LIVE model, not the snapshot.
   ro: pv OR not in edit mode (board.ts's stoRO/mvRO) — widened alongside pv
   at every gate below (reviewer-found residual, 9 Aug 26): a read-only board
   (a session that may not edit it, board still legitimately open on its
   own page) used to leave this panel's +Note/nudge/delete live and its own
   text input `disabled`-free, exactly the same shape of gap the flying
   line's inputs had before the first pass of this fix. */
export function sbNotesPanel(d:any,di:any,pv?:any,ro?:any){
  const n=d.notes||[];
  let s=`<div class="sb-panel notes"><div class="sb-ph">Overall notes <span class="sub">shown at the head of the day</span>`
    +(ro?'':`<span class="gctl"><button class="mbtn add" data-nadd="${di}" title="Add a note line">+ Note</button></span>`)+`</div><div class="sb-pb">`;
  if(!n.length)s+=`<div class="sb-empty">Nothing yet — “+ Note” adds a line that every viewer sees at the top of the day.</div>`;
  /* the three trailing controls are wrapped in one .lctl, same as every
     other row (sbRowCtl / board.ts's prog row) — an unwrapped ▲▼✕ is three
     flat grid children, not one, and the phone template below is written
     for four items (grip-gone, nx, nin, lctl), not five */
  n.forEach((t:any,ni:any)=>{ s+=`<div class="sb-nrow"${rowMove(`mv:n.${di}.${ni}`,ro)}>`+sbGrip(ro)+`<span class="nx">${ni+1}.</span>`
    +`<input class="nin" data-bfld="dn:${di}.${ni}"${alAttr(`dn:${di}.${ni}`)}${ro?' disabled':''} value="${esc(t)}" placeholder="e.g. EP, ORDERS, NO FLY, SQN OFF">`
    +(ro?'':`<span class="lctl">`+sbNudge(`mv:n.${di}.${ni}`,ro)+`<button class="mbtn del" data-ndel="${di}.${ni}" title="Remove this note">✕</button></span>`)+`</div>`; });
  return s+`</div></div>`;
}
/* ---- board panel 2: overall programme (squadron-wide, affects everyone) --- */
export function sbProgPanel(d:any,di:any,pv?:any,ro?:any){
  const rows=d.allhands||[];
  let s=`<div class="sb-panel prog"><div class="sb-ph">Common Programme <span class="sub">squadron-wide — affects all</span>`
    +(ro?'':`<span class="gctl">${sbSortBtn(`p.${di}`,ro)}<button class="mbtn add" data-padd="${di}" title="Add a squadron-wide item">+ Item</button></span>`)+`</div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">Nothing squadron-wide yet — “+ Item” adds a mass brief, PT, safety stand-down and the like.</div>`;
  else{
    /* SAME c6r shape as the ground / duty / sim rows — Item | Start | End |
       People | Rmks | ctl — so the Common Programme reads and lays out exactly
       like the Ground Programme below it on a phone (owner, 22 Aug 26 — "make
       the common programme mobile layout similar to this", pointing at the
       ground list). The old `cprog` grid carried an extra DETAIL / location
       column between Item and Start; the owner asked for it gone ("no need for
       detail and location — you can remove it"), and dropping it is what lets
       the row collapse onto the c6r template with no divergence left to keep.
       The `.sub` model field and its `ap:*.sub` funnel key stay (keys.test.ts /
       publish.test.ts pin the keyspace) — it simply has no board editor now. */
    s+=`<div class="sb-acols c6r"><span></span><span>Item</span><span>Start</span><span>End</span><span>People</span><span>Rmks</span><span></span></div>`;
    rows.forEach((x:any,ri:any)=>{
      const arr=whoArr(x);
      /* same hole guard as the week view — an empty .itxt shifts every later puck.
         ro, not pv, for the same reason every gate in this panel was widened
         (reviewer-found residual, 9 Aug 26) — these are the "36 draggable
         seats" the reviewer counted on a read-only board. */
      const inner=arr.map((nm:any,k:any)=>{const id=nameToId(nm);
        if(id&&PEOPLE[id])return `<span class="seat"${ro?'':` data-slot="a:${di}.${ri}.${k}"`}${alAttr(`a:${di}.${ri}.${k}`)}${ro?'':' draggable="true"'}>${puck(id,ro?null:sevOf(di,id),true,ro?null:chipOf(di,id))}</span>`;
        return String(nm||'').trim()?`<span class="itxt">${esc(nm)}</span>`:'';}).join('');
      s+=`<div class="sb-arow c6r${rowCls(x)}"${rowMove(`mv:p.${di}.${ri}`,ro)}>`+sbGrip(ro)
        +`<input class="ain" data-bfld="ap:${di}.${ri}.prog"${alAttr(`ap:${di}.${ri}.prog`)}${ro?' disabled':''} value="${esc(x.prog||'')}">`
        +`<input class="atm" data-bfld="ap:${di}.${ri}.str"${alAttr(`ap:${di}.${ri}.str`)}${ro?' disabled':''} value="${esc(x.str||'')}">`
        +`<input class="atm" data-bfld="ap:${di}.${ri}.end"${alAttr(`ap:${di}.${ri}.end`)}${ro?' disabled':''} value="${esc(x.end||'')}">`
        /* no "all" ghost on an empty people cell (owner, 26 Aug 26 — "if no
           puck is there, just assume that no one is planned for that line").
           The engine already reads it that way (whoArr matches named people
           only); the word said otherwise. Empty cell, same data-fill target. */
        +`<div class="ppl"${ro?'':` data-fill="a:${di}.${ri}.+"`}>${inner}</div>`
        +sbRmk(`ap:${di}.${ri}.rmks`,x.rmks,ro)
        +(ro?'':`<span class="lctl">`+sbNudge(`mv:p.${di}.${ri}`,ro)
        +`<button class="mbtn${x.cx?' on':''}" data-pcx="${di}.${ri}" title="${x.cx?'Restore this item':'Cancel this item (CX)'}">CX</button>`
        +`<button class="mbtn red${x.flag?' on':''}" data-pflag="${di}.${ri}" title="${x.flag?'Clear the red box':'Red box — flag for the next scheduler'}">■</button>`
        +`<button class="mbtn del" data-pdel="${di}.${ri}" title="Remove this item">✕</button></span>`)+`</div>`;
    });
  }
  return s+sbNote(d,di,'pn','prognotes','e.g. CFG visit shifts SODB right by 15 min — brief the duty crew.',ro)+`</div></div>`;
}
/* The scheduler's hand-over note for one block. Same text the week shows under
   the matching section, through the same funnel key — edit it in either place.
   Never on the view-only page: it is working traffic, not the issued programme. */
/* NO PLACEHOLDER (owner, 10 Aug 26). Every one of these boxes carried a
   worked example — "e.g. SDO swapped — Bane has the PHA at 1700" — and a
   scheduler reading the board fast could not tell a suggestion from a note
   somebody had actually left. The heading above already says what the box is
   for. `ph` is kept in the signature and ignored, so the four call sites stay
   self-documenting about what each note is FOR without printing it. */
export function sbNote(d:any,di:any,key:any,field:any,_ph:any,pv?:any){
  const k=`${key}:${di}`, pub=notePub(k);
  /* the show-on-view-only toggle (owner, Aug 26) — same builder the week uses, so
     a note's public state and label read the same on both surfaces. Only a live,
     editable board offers it; a read-only board just shows the current label. */
  const tog=(!pv&&canEditSched())?notePubTog(k,pub):'';
  return `<div class="sb-note"><div class="sb-nh">${pub?'Public notes':'Scheduler notes'}${tog}</div>`
    +`<textarea class="sb-nbox" data-bfld="${k}"${alAttr(k)}${pv?' disabled':''}>${esc(d[field]||'')}</textarea></div>`;
}
/* ---- duty / sim / ground panels (owner request, Aug 26) -------------------
   The board finally carries every section the week day carries. Same
   six-column grid (c6r): Item | Start | End | People | Rmks | ctl. Seats and
   fill targets speak the ordinary slot-key grammar, so the board's generic
   arm/drag handlers and the mutation funnel cover them with NO new wiring —
   only the row-level mbtns needed handler branches (board.ts).
   sbSeat/sbMore/sbTxt/sbRowCtl all keep the parameter NAME `pv` below — the
   original meaning (a frozen published-version preview) still applies
   whenever a caller genuinely passes the board's own `pv` — but every call
   site in this file now passes `ro` (pv OR not in edit mode) instead, the
   same widening board.ts's flying line already got, closing a
   reviewer-found residual (9 Aug 26): these rows' seats, fill targets, text
   inputs and CX/flag/delete clusters were still `pv`-only, so a read-only
   board (a session that may not edit it, board still legitimately open on
   its own page) left them fully live — dragging a name onto a duty row wrote it into the
   model, and a duty/sim/ground/programme text field kept whatever was typed
   into it even though the write was never committed. */
function sbSeat(di:any,key:any,id:any,pv?:any){
  if(!(id&&PEOPLE[id]))return '';
  return `<span class="seat"${pv?'':` data-slot="${key}"`}${alAttr(key)}${pv?'':' draggable="true"'}>${puck(id,pv?null:sevOf(di,id),true,pv?null:chipOf(di,id))}</span>`;
}
function sbMore(di:any,base:any,r:any,pv?:any){
  return ((r&&r.more)||[]).map((id:any,i:any)=>sbSeat(di,`${base}.x${i}`,id,pv)).join('');
}
/* `extra` carries per-cell attributes a caller needs on the input itself —
   today only the duty ROLE cell's data-rolepick hook. Passed as a string
   rather than another boolean so the next one costs nothing here.
   An EMPTY `ph` emits no placeholder attribute at all rather than an empty
   one: `placeholder=""` still counts as a placeholder to CSS, and the whole
   point of the 10 Aug pass is that a box with nothing in it looks empty. */
function sbTxt(cls:any,path:any,v:any,ph:any,pv:any,extra?:any){
  return boxHTML(cls,`data-bfld="${path}"${alAttr(path)}${pv?' disabled':''}${extra||''}`,v,ph);
}
/* ONE builder for every typed box on the board, because they now come in two
   ELEMENT shapes and the choice must not be made call site by call site
   (owner, 20 Aug 26 — "if the text overflows, the text box will grow
   vertically. Apply this to all text box as well").
   A free-text field is a <textarea rows="1">, not an <input>: an <input>
   cannot wrap its value at any width, and no CSS makes it — the text simply
   scrolls out of sight inside the box, which is the thing the owner is asking
   to stop. The GROWING is `field-sizing:content` in scheduler.css, the same
   mechanism the scheduler-notes box has used since 13 Aug 26 (and with the
   same graceful degradation to a one-line box where it is unsupported).
   A TIME cell stays an <input>: it holds `0715`, there is nothing in it to
   wrap, and the guard rails already refuse anything that is not a time.
   Class is what decides, so a caller keeps passing the class it always did.
   The leading newline is REQUIRED, not stray formatting: an HTML parser
   discards exactly one newline immediately after `<textarea>`, so without it
   a pasted value that genuinely starts with a blank line would lose it on
   every repaint. Enter still commits (textedit.ts's routeKeyDown), so a
   hand-typed break cannot get in — a paste is the only way one arrives. */
export function boxHTML(cls:any,attrs:any,v:any,ph:any){
  const p=ph?` placeholder="${ph}"`:'';
  if(/(^|\s)(atm|tm)(\s|$)/.test(cls))return `<input class="${cls}" ${attrs} value="${esc(v||'')}"${p}>`;
  return `<textarea rows="1" class="${cls}" ${attrs}${p}>\n${esc(v||'')}</textarea>`;
}
/* a duty / sim / ground / programme remarks input, shown at ALL times now
   (owner, 16 Aug 26). It used to be hidden while empty on a phone with a "+"
   on the row's control strip to reveal one at a time (the RMKOPEN machinery,
   now retired) — but the owner asked every box to sit beside the pucks on
   their own row instead, where an empty one costs no extra line, so there is
   nothing to hide or reveal. The faded "Remarks" placeholder says what the
   empty box is. */
function sbRmk(path:any,v:any,pv:any){
  return sbTxt('ain rmkin',path,v,'Remarks',pv);
}
function sbRowCtl(pv:any,o:any,addr:any,pre:any,what:any,mv?:any){
  return pv?'':`<span class="lctl">`+(mv||'')
    +`<button class="mbtn${o.cx?' on':''}" data-${pre}cx="${addr}" title="${o.cx?'Restore '+what:'Cancel '+what+' (CX)'}">CX</button>`
    +`<button class="mbtn red${o.flag?' on':''}" data-${pre}flag="${addr}" title="${o.flag?'Clear the red box':'Red box — flag for the next scheduler'}">■</button>`
    +`<button class="mbtn del" data-${pre}del="${addr}" title="Remove ${what}">✕</button></span>`;
}
/* ROLE, not Item (owner, 10 Aug 26) — a duty row names a job, and "Item" read
   as a generic list entry. The other c6r panels (sims, ground) keep Item:
   those rows genuinely are items, not roles, so this constant is duties-only
   and the shared one below stays as it was. */
const C6_DUTY=`<div class="sb-acols c6r"><span></span><span>Role</span><span>Start</span><span>End</span><span>People</span><span>Rmks</span><span></span></div>`;
const C6=`<div class="sb-acols c6r"><span></span><span>Item</span><span>Start</span><span>End</span><span>People</span><span>Rmks</span><span></span></div>`;
export function sbDutyPanel(d:any,di:any,pv?:any,ro?:any){
  const dws=d.dutywaves||[];
  let s=`<div class="sb-panel duty"><div class="sb-ph">Duties <span class="sub">SDO / SXO / ops desk, by block</span>`
    +(ro?'':`<span class="gctl"><button class="mbtn add" data-dwadd="${di}" title="Add a duty block">+ Block</button></span>`)+`</div><div class="sb-pb">`;
  if(!dws.length)s+=`<div class="sb-empty">No duty blocks yet — “+ Block” adds one.</div>`;
  dws.forEach((dwv:any,wi:any)=>{
    s+=`<div class="sb-psub">`+sbTxt('ain',`dl:${di}.${wi}`,dwv.label,'WAVE 1 DUTIES',ro)
      +(ro?'':`<span class="gctl">${sbSortBtn(`d.${di}.${wi}`,ro)}<button class="mbtn add" data-dradd="${di}.${wi}" title="Add a duty row">+ Row</button>`
      +`<button class="mbtn del" data-dwdel="${di}.${wi}" title="Remove this block and its rows">✕ Block</button></span>`)+`</div>`;
    if((dwv.rows||[]).length)s+=C6_DUTY;
    /* MODEL order, not dutySort — an editor whose rows jump as a role is typed
       would be hostile, and the slot keys are model indices anyway */
    (dwv.rows||[]).forEach((r:any,ri:any)=>{
      const base=`d:${di}.${wi}.${ri}`, t=`dr:${di}.${wi}.${ri}`;
      const inner=(PEOPLE[r.id]?sbSeat(di,base,r.id,ro):(r.id?`<span class="itxt">${esc(r.id)}</span>`:''))+sbMore(di,base,r,ro);
      /* NO PLACEHOLDERS ON A DUTY ROW (owner, 10 Aug 26). They read as typed
         text — an empty role box showed "SDO" and a blank block looked
         staffed. The column headings above already say Role / Start / End /
         Rmks, so the ghost words were saying it twice and lying once. The
         ROLE cell offers its pick-list on click instead (data-rolepick). */
      s+=`<div class="sb-arow c6r${rowCls(r)}"${rowMove(`mv:d.${di}.${wi}.${ri}`,ro)}>`+sbGrip(ro)
        +sbTxt('ain',`${t}.role`,r.role,'',ro,ro?'':` data-rolepick="${di}.${wi}.${ri}"`)
        +sbTxt('atm',`${t}.str`,r.str,'',ro)+sbTxt('atm',`${t}.end`,r.end,'',ro)
        +`<div class="ppl"${ro?'':` data-fill="${base}.+"`}>${inner}</div>`
        +sbRmk(`${t}.rmks`,r.rmks,ro)
        +sbRowCtl(ro,r,`${di}.${wi}.${ri}`,'dr','this duty',sbNudge(`mv:d.${di}.${wi}.${ri}`,ro))+`</div>`;
    });
  });
  return s+sbNote(d,di,'dtn','dutynotes','e.g. SDO swapped — Bane has the PHA at 1700, Pike covers the last hour.',ro)+`</div></div>`;
}
export function sbSimRowsPanel(d:any,di:any,pv?:any,ro?:any){
  const sims=d.sims||{};
  let s=`<div class="sb-panel simr"><div class="sb-ph">Sims <span class="sub">AMT and OFT rows</span></div><div class="sb-pb">`;
  [['AMT','amt'],['OFT','oft']].forEach(([title,kind]:any)=>{
    const rows=sims[kind]||[];
    s+=`<div class="sb-psub"><span class="ntx">${title}</span>`
      +(ro?'':`<span class="gctl">${sbSortBtn(`s.${di}.${kind}`,ro)}${kind==='amt'?`<button class="mbtn add" data-sblkadd="${di}" title="Add an AMT block — BRIEF, BOX and DEBRIEF together">+ Block</button>`:''}<button class="mbtn add" data-sradd="${di}.${kind}" title="Add a ${title} row">+ Row</button></span>`)+`</div>`;
    if(!rows.length){s+=`<div class="sb-empty">No ${title} rows.</div>`;return;}
    s+=C6;
    rows.forEach((r:any,ri:any)=>{
      const base=`s:${di}.${kind}.${ri}`, t=`sr:${di}.${kind}.${ri}`;
      /* A deleted pax HOLDS its index (slots.ts's pax branch splices nothing),
         so the hole must stay VISIBLE: render it as a droppable empty slot,
         not as nothing (owner, 8 Aug 26 — deleting one WSO from the AMT BOX
         visually collapsed the block upward, and there was no slot to drop
         the replacement back into). Same .sb-slot.empty[data-slot] shape as
         the flying line's seats, so boardArmClick's tap-to-arm and the drag
         machine's drop targeting cover it with no new wiring. ro (not pv
         alone, reviewer-found residual 9 Aug 26) — a frozen preview OR a
         read-only board both keep rendering nothing here.
         AMT IS A THREE-ROW BLOCK (BRIEF / BOX / DEBRIEF) and the crew rides the
         BOX row ONLY (owner, 13 Aug 26): BRIEF and DEBRIEF are times, so they
         show no seats. On the box the crew reads FCP (left) / RCP (right),
         paired top-to-bottom (positions 1..n down) on a fixed two-column grid
         (.fcprcp) — so a removed puck leaves its own seat empty in place and the
         pairing never reshuffles. Not capped: the grid grows a pair at a time.
         OFT (and any other sim) keeps the plain wrap it always had. */
      const isAmt=kind==='amt', isBriefR=/^\s*BRIEF/i.test(r.label||''), isDebR=/DEBRIEF/i.test(r.label||'');
      /* a who-only row ("SIMS (149)", "ALL PILOTS") keeps its free text; the
         moment a real body sits in a seat the text yields, as it always has */
      const whoOnly=!!String(r.who||'').trim()&&!PEOPLE[r.p]&&!PEOPLE[r.w];
      let pplCell;
      if(isAmt&&(isBriefR||isDebR)){
        pplCell=`<div class="ppl"></div>`;
      }else if(Array.isArray(r.pax)){
        if(isAmt){
          /* pad to an even count (>=2) so every pair is complete — the trailing
             slot of an odd crew is a droppable RCP, not a gap */
          const n=Math.max(2,r.pax.length+(r.pax.length%2));
          const cells=Array.from({length:n},(_:any,pi:any)=>{const k=`${base}.pax.${pi}`, id=r.pax[pi];
            return (id&&PEOPLE[id])?sbSeat(di,k,id,ro)
              :(ro?'':`<span class="sb-slot empty pax" data-slot="${k}" title="Empty seat — tap or drop a puck to fill">+</span>`);}).join('');
          pplCell=`<div class="ppl fcprcp"${ro?'':` data-fill="${base}.+"`}><span class="hd">FCP</span><span class="hd">RCP</span>${cells}${sbMore(di,base,r,ro)}</div>`;
        }else{
          const seats=r.pax.map((id:any,pi:any)=>{
            const k=`${base}.pax.${pi}`;
            return (id&&PEOPLE[id])?sbSeat(di,k,id,ro)
              :(ro?'':`<span class="sb-slot empty pax" data-slot="${k}" title="Empty seat — tap or drop a puck to fill">+</span>`);
          }).join('');
          pplCell=`<div class="ppl"${ro?'':` data-fill="${base}.+"`}>${seats+sbMore(di,base,r,ro)}</div>`;
        }
      }else if(!whoOnly){
        /* THE SEAT GRID NOW COVERS THE OFT TOO (owner, 14 Aug 26 — "the OFT
           can only sit 2 people... anything additional are the instructors or
           observers"). The two REAL seats render first — FCP | RCP, empty ones
           droppable, and the seat-qual rules stay anchored on p/w exactly as
           before. Instructors/observers ride `more[]`, paired below on the
           same grid; a removed extra HOLDS its index (slots.ts trims trailing
           blanks only), so the hole renders as a droppable slot in place and
           the others never reshuffle — the AMT's own contract, which extras
           used to break by collapsing (sbMore skips empty ids). The engine
           checks extras for time clashes only, which is the whole point. */
        const seatCell=(k:any,id:any,lbl:any)=>PEOPLE[id]?sbSeat(di,k,id,ro)
          :(ro?'':`<span class="sb-slot empty" data-slot="${k}" title="${lbl} — tap or drop a puck to fill">+</span>`);
        let cells=seatCell(`${base}.p`,r.p,'FCP')+seatCell(`${base}.w`,r.w,'RCP');
        const more=r.more||[], n=more.length+(more.length%2);
        for(let i=0;i<n;i++){const id=more[i];
          cells+=(id&&PEOPLE[id])?sbSeat(di,`${base}.x${i}`,id,ro)
            :(ro?'':`<span class="sb-slot empty pax" data-slot="${base}.x${i}" title="Instructor / observer — tap or drop a puck to fill">+</span>`);}
        pplCell=`<div class="ppl fcprcp"${ro?'':` data-fill="${base}.+"`}><span class="hd">FCP</span><span class="hd">RCP</span>${cells}</div>`;
      }else{
        pplCell=`<div class="ppl"${ro?'':` data-fill="${base}.+"`}><span class="itxt">${esc(r.who)}</span>${sbMore(di,base,r,ro)}</div>`;
      }
      s+=`<div class="sb-arow c6r${rowCls(r)}"${rowMove(`mv:s.${di}.${kind}.${ri}`,ro)}>`+sbGrip(ro)
        +sbTxt('ain',`${t}.label`,r.label,'EP SIM',ro)+sbTxt('atm',`${t}.str`,r.str,'',ro)+sbTxt('atm',`${t}.end`,r.end,'',ro)
        +pplCell
        +sbRmk(`${t}.rmks`,r.rmks,ro)
        +sbRowCtl(ro,r,`${di}.${kind}.${ri}`,'sr','this sim',sbNudge(`mv:s.${di}.${kind}.${ri}`,ro))+`</div>`;
    });
  });
  return s+sbNote(d,di,'sn','simnotes','e.g. OFT 2 u/s Thu PM — 4-ship EP profile pushed to next week. Divot still owes an AMT EP.',ro)+`</div></div>`;
}
export function sbGroundPanel(d:any,di:any,pv?:any,ro?:any){
  const rows=d.ground||[];
  /* + Inputs (owner, 19 Aug 26 — moved here from the Personal Inputs panel and
     renamed): a scheduler adds an activity input (Meeting, CSE…) FROM the
     ground programme, and it lands ON the ground programme — the dialog offers
     only ground-eligible types and commitNewInput accepts the new row straight
     onto this section (see interactions.ts / ui/inputedit.tsx). "+ Item" beside
     it stays the bare-row add for things that are not anybody's input. */
  let s=`<div class="sb-panel grnd"><div class="sb-ph">Ground Programme <span class="sub">briefs, reviews, admin</span>`
    +(ro?'':`<span class="gctl"><button class="sb-addinp" data-inpadd="${di}.g" title="Add a personal input (meeting, course…) — it goes straight onto the Ground Programme">+ Inputs</button>${sbSortBtn(`g.${di}`,ro)}<button class="mbtn add" data-gradd="${di}" title="Add a ground item">+ Item</button></span>`)+`</div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">No ground items yet — “+ Item” adds one.</div>`;
  else{
    s+=C6;
    /* same render-time ordering as the week — keys keep their model index */
    groundOrder(rows,d.gman).forEach(({row:x,ri}:any)=>{
      const base=`g:${di}.${ri}`, t=`gr:${di}.${ri}`, id=nameToId(x.who);
      const inner=((id&&PEOPLE[id])?sbSeat(di,base,id,ro):(x.who?`<span class="itxt">${esc(x.who)}</span>`:''))+sbMore(di,base,x,ro);
      s+=`<div class="sb-arow c6r${rowCls(x)}${lateRowCls(x)}"${lateRowTitle(x)}${rowMove(`mv:g.${di}.${ri}`,ro)}>`+sbGrip(ro)
        +sbTxt('ain',`${t}.prog`,x.prog,'OCU PROGRESS REVIEW',ro)+sbTxt('atm',`${t}.str`,x.str,'',ro)+sbTxt('atm',`${t}.end`,x.end,'',ro)
        +`<div class="ppl"${ro?'':` data-fill="${base}.+"`}>${inner}</div>`
        +sbRmk(`${t}.rmks`,x.rmks,ro)
        +sbRowCtl(ro,x,`${di}.${ri}`,'gr','this item',sbNudge(`mv:g.${di}.${ri}`,ro))+`</div>`;
    });
  }
  return s+sbNote(d,di,'gn','grndnotes','e.g. Two medicals already at 1030 — keep the next one clear of the wave brief.',ro)+`</div></div>`;
}
/* AN INPUT ROW ON THE BOARD (owner, 10 Aug 26 — "on personal inputs and
   unavailable in schedule board, they can be editable in the same modality as
   ground programme").
   So a live board draws them as `sb-arow c6r` rows, which IS the ground
   programme's row: same seven tracks, same boxes, same register under the same
   header. Start, End and Rmks are ordinary fields; they carry `data-ifld`
   rather than the ground row's `data-bfld`, because an input has no funnel key
   and its write is not a schedule write — see setInpField in ui/inputedit.tsx.
   The TYPE keeps the dialog behind it: it is the one thing here that is a
   choice from a list rather than typed text, and delete rides with it.
   A READ-ONLY board (a preview, or a session that may not edit) keeps the old
   compact `.sbi-row`, which is also what the read-only bands panel below
   draws — nothing is gained by showing a scheduler's fields to someone who
   cannot use them, and the two panels stay legible at a glance. */
/* dt (6th param): NO LIVE CALLER any more (owner rework, 14 Aug 26) — SANS
   Availability rows used to draw through this function too, the one caller
   that ever passed dt, and it is what the sansBadge line just below reads.
   sbSansPanel now draws a card grid instead (sansCardsHTML in ui/html.ts),
   so a SANS-typed input never reaches sbInpRow any more — sbUnavailPanel and
   sbInputsGroupPanel both filter it out on the way in. Left in the signature
   rather than stripped: a badge nested INSIDE an existing grid child (never
   a new sibling, or every track after it misregisters the way the grip once
   did — see the c6r register comment further down) is a real, fiddly shape
   to re-derive, and the two rows below already carry it correctly for
   whichever future row type needs a badge like this again. */
function sbInpRow(di:any,inp:any,acc:any,pv:any,ro?:any,dt?:any){
  const RO=ro??pv;
  const sb=isSansAvail(inp.type)&&dt?sansBadge(inp.person,dt):'';
  const sbt=sb?`<span class="sansb" title="SANS availability">${esc(sb)}</span>`:'';
  /* the board's half of "even down to changing the puck" — see html.ts's
     inGrp for the week's twin and the full reasoning. `acc` true is the
     Personal Inputs panel (its own Accept control decides that row's fate
     already); `!acc` is Unavailable, the only panel this seat address opens
     on, and only when the row is actually live (not a read-only/preview
     board). */
  const seatable=!acc&&!RO;
  const pk=PEOPLE[inp.person]
    ? `<span class="seat"${seatable?` data-inpseat="${esc(inpId(inp))}"`:''}>${puck(inp.person,sevOf(di,inp.person),true,chipOf(di,inp.person))}</span>`
    : `<span class="itxt">${esc(inp.person)}</span>`;
  if(RO){
    const t=inp.allday?'all day':`${hm4(inp.s)} – ${hm4(inp.e)}`;
    return `<div class="sbi-row${acc&&inp.acc&&inp.acc!=='r'?' accd':''}"><span class="sbi-t">${t}</span>${pk}`
      +inpEditLabel(inp,false,inpLabel(inp),`sbi-ty ${inTypeCls(inp.type)}`)
      +sbiRmk(inp,dt)+`</div>`;
  }
  const id=inpId(inp);
  const fld=(cls:any,f:any,v:any,ph:any)=>boxHTML(cls,`data-ifld="${esc(id)}.${f}"`,v,ph);
  /* the GRIP's own track, kept even though an input row cannot be dragged.
     Every c6r template reserves a leading 18px track, and the phone rule
     (`display:none` on .sb-grip, three columns for the rest) is written
     against that element specifically — a bare <span> in its place is not
     hidden down there, so it ate the phone's 1fr ITEM column and pushed the
     type into a 46px stub. Same register lesson as finding #1 on 9 Aug 26,
     reached from the other side. */
  /* the LATE chip rides the ITEM cell, right of the type label (owner, 21 Aug
     26 — "show a late tag beside the applicable inputs … under each item").
     It cannot be its own grid child: a c6r row has exactly seven tracks and an
     eighth would walk every field one track left of its header (the register
     bug this file already documents). So on a LATE row the item cell becomes a
     wrapper holding the type label plus the chip; a non-late row keeps the bare
     label and is byte-identical to before. */
  const lc=lateChip(inp);
  const itemCell=inpEditLabel(inp,true,inpLabel(inp),`sbi-ty inpty ${inTypeCls(inp.type)}`);
  return `<div class="sb-arow c6r inprow${acc&&inp.acc&&inp.acc!=='r'?' accd':''}${lateRowCls(inp)}"${lateRowTitle(inp)}>`
    +sbGrip(true)
    +(lc?`<span class="itemcell">${itemCell}${lc}</span>`:itemCell)
    +fld('atm','str',inpHM(inp,'str'),'all day')+fld('atm','end',inpHM(inp,'end'),'')
    +`<div class="ppl">${pk}${sbt}</div>`
    +fld('ain rmkin','rmks',inp.remarks||'','remarks')
    +`<span class="lctl">${acc?accCtl(di,inp):''}</span></div>`;
}
/* ro (5th param, reviewer-found residual 9 Aug 26): accepting an input is a
   write — promotes it into the ground programme through the mutation funnel
   (interactions.ts's routeClick, shared with the week) — and this panel's
   Accept/Undo buttons were gated on pv alone, same gap as every other panel
   above. Defaults to pv when omitted so a caller that genuinely only has pv
   (there are none left after this pass, but the parameter is optional)
   still gets the original, narrower behaviour rather than silently always
   showing the buttons. */
export function sbInputsGroupPanel(d:any,di:any,pv?:any,day?:any,ro?:any){
  const rows=(day||INPUTS.filter((i:any)=>inputCoversDate(i,d.dt))).filter((inp:any)=>isPersonal(inp.type)&&inp.acc!=='u');
  const acRo=ro??pv;
  /* PERSONAL INPUTS folds to a one-line summary by default (owner, Aug 26 — the
     block is the faded audit echo now activity inputs auto-land on ground). The
     header is the toggle (data-pitog, routeClick). Only when editable; a
     read-only board keeps it open — there is nothing to fold away from. */
  const foldable=!acRo;
  if(foldable&&rows.length&&!PIOPEN.has(di)){
    const onG=rows.filter((r:any)=>r.acc==='g').length;
    return `<div class="sb-panel pinp"><div class="sb-ph pl-fold" data-pitog="${di}">Personal Inputs `
      +`<span class="sub">${rows.length} input${rows.length===1?'':'s'}${onG?` · ${onG} on programme`:''} · show ⌄</span></div></div>`;
  }
  /* this panel's own + Add MOVED to the Ground Programme header as "+ Inputs"
     (owner, 19 Aug 26) — an activity input a scheduler adds belongs on the
     programme, so the button lives where the result lands */
  let s=`<div class="sb-panel pinp"><div class="sb-ph${foldable?' pl-fold':''}"${foldable?` data-pitog="${di}"`:''}>Personal Inputs <span class="sub">submitted by aircrew — accept to put it on the programme${acRo?'':'; times and remarks type in place, clear a time for all day; tap header to hide'}</span></div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">No personal inputs for this day.</div>`;
  else{
    /* Housekeeping reminder (owner, Aug 26; reworded 26 Aug 26 with the
       dormancy rule): a removed input no longer flags anything, so the note
       now says that, and keeps the delete pointer for clearing the list —
       tap its type to open the editor and Delete. Editable panel only. */
    if(!acRo)s+=`<div class="sb-pinote">A removed input flags nothing until accepted again — delete it here if it should go entirely.</div>`;
    if(!acRo)s+=C6;
  }
  rows.forEach((inp:any)=>{ s+=sbInpRow(di,inp,true,acRo,acRo); });
  return s+`</div></div>`;
}
/* Leave, medical and overseas duty close a man's day on their own — nobody
   ACCEPTS them, so this panel carries no Accept control; its rows are as
   editable as the ones above since the owner asked for both (10 Aug 26). */
export function sbUnavailPanel(d:any,di:any,day?:any,ro?:any){
  // SANS Availability is an offer, not an absence — it reads isUnavail (no Accept controls) but does not belong in this panel
  const rows=(day||INPUTS.filter((i:any)=>inputCoversDate(i,d.dt))).filter((inp:any)=>(isUnavail(inp.type)||inp.acc==='u')&&!isSansAvail(inp.type));
  /* + Add stays here (owner, Aug 26; reworked 19 Aug 26): the dialog now
     offers only leave/medical/OD types and carries a DATE RANGE, whose till
     date lands in remarks the way the Inputs page's calendar writes it */
  const addBtn=ro?'':`<button class="sb-addinp" data-inpadd="${di}.u" title="Add an unavailability (leave, medical, overseas duty) — pick a date range in the dialog">+ Add</button>`;
  let s=`<div class="sb-panel unav"><div class="sb-ph">Unavailable <span class="sub">leave, medical and overseas duty${ro?'':' — times and remarks type in place, clear a time for all day'}</span>${addBtn}</div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">Nil — everybody is available today.</div>`;
  else if(!ro)s+=C6;
  rows.forEach((inp:any)=>{ s+=sbInpRow(di,inp,false,ro,ro); });
  return s+`</div></div>`;
}
/* SANS AVAILABILITY (owner, 14 Aug 26; card grid rework same day) — a
   POSITIVE record, so it earns its own panel rather than sitting inside
   Unavailable (isUnavail is true for it, which is what bought the
   no-Accept-controls shape above for free when this drew ordinary rows, but
   it is an offer, not an absence — see the guard in sbUnavailPanel).
   No longer modeled on that panel's row builder: sansCardsHTML (ui/html.ts)
   is the ONE grid the week's SANS group draws too, so a scheduler reads the
   identical cards whichever surface they open — no C6 header, no
   per-record row, just the grid or the empty state. The old subtitle ("times
   and remarks type in place, clear a time for all day") described the row
   shape this panel no longer draws; a card opens the input-edit dialog
   instead, so the hint now points at that. */
export function sbSansPanel(d:any,di:any,day?:any,ro?:any){
  const rows=(day||INPUTS.filter((i:any)=>inputCoversDate(i,d.dt))).filter((inp:any)=>isSansAvail(inp.type));
  /* + Add (owner, 19 Aug 26 — SANS availability left the other panels' type
     lists, so it gets its own add HERE, "likewise"): opens the same dialog,
     locked to the SANS type and offering SANS aircrew only */
  const addBtn=ro?'':`<button class="sb-addinp" data-inpadd="${di}.s" title="Add a SANS availability for this day">+ Add</button>`;
  let s=`<div class="sb-panel sansav"><div class="sb-ph">SANS Avail <span class="sub">what SANS aircrew are offering${ro?'':' — press a card to edit'}</span>${addBtn}</div><div class="sb-pb">`;
  s+=rows.length?sansCardsHTML(rows,di,ro):`<div class="sb-empty">No SANS availability filed for this day.</div>`;
  return s+`</div></div>`;
}
/* the board never carried the amendment marks the week view had — added with
   the AL preview (Aug 26) so a board edit shows what it will go out as.
   pv: no data-slot, no draggable, no arm target — those keys are live keys. */
export function sbSlot(di:any,key:any,seat:any,id:any,pv?:any){
  if(id&&PEOPLE[id])return `<div class="sb-slot"><span class="seat"${pv?'':` data-slot="${key}"`}${alAttr(key)}${pv?'':' draggable="true"'}>${puck(id,pv?null:sevOf(di,id),true,pv?null:chipOf(di,id))}</span></div>`;
  if(pv)return `<div class="sb-slot"><span class="itxt">— ${seat==='p'?'FCP':'RCP'} empty —</span></div>`;
  return `<div class="sb-slot empty" data-slot="${key}">+ ${seat==='p'?'FCP':'RCP'}</div>`;
}
/* wave title <-> label. night is set explicitly by choosing "Night wave". */
/* A STANDALONE WAVE ANSWERS WITH ITS OWN KIND, before `night` is consulted
   (owner-reported, 10 Aug 26). `makeStandalone` sets night:true for AVALON and
   BB, so this used to report an AVALON wave as "Night wave" — the board's Go
   dropdown showed the wrong name, and touching that dropdown then ran
   titleToLabel('Night wave') and overwrote w.label with 'NIGHT WAVE', leaving
   a wave that was still `standalone` with kind 'avalon' wearing a name that
   said otherwise. Both halves are fixed here: read the kind first, and let
   titleToLabel round-trip the two standalone titles back out. */
export const SA_TITLE:any={sc:'SC',avalon:'AVALON',bb:'BB'};
export function labelToTitle(w:any){ if(w.standalone&&SA_TITLE[w.kind])return SA_TITLE[w.kind]; if(w.night)return 'Night wave'; const m=String(w.label).match(/(\d+)/); return m?((ORD[+m[1]-1]||m[1]+'th')+' wave'):(w.label||'1st wave'); }
export function titleToLabel(v:any){ if(/night/i.test(v))return 'NIGHT WAVE'; const m=v.match(/(\d+)/); return m?('WAVE '+m[1]):v.toUpperCase(); }
/* the kind a Go-dropdown title names, or '' for an ordinary wave */
export function titleToKind(v:any){ const k=Object.keys(SA_TITLE).find(x=>SA_TITLE[x]===String(v).toUpperCase()); return k||''; }
