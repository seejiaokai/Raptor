/* The scheduler-board panel builders — sbInputsHTML, sbNotesPanel,
   sbProgPanel, sbSimPanel, sbSlot, labelToTitle/titleToLabel — verbatim. */
import { INPUTS, isLeave, inputCoversDate, inpLabel, isPersonal, isUnavail } from '../engine/inputs'
import { PEOPLE, nameToId } from '../engine/people'
import { hhmm } from '../engine/time'
import { sevOf, chipOf } from '../engine/validate'
import { whoArr } from '../engine/slots'
import { alAttr } from '../engine/publish'
import { groundOrder } from '../engine/order'
import { esc } from '../state/view'
import { ORD } from './html'
import { puck, rowCls, accCtl } from './html'

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
  return ro?'':`<span class="sb-grip" title="Drag to move this row">⠿</span>`;
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
export function inTypeCls(t:any){
  if(/^Downchit/i.test(t))return 'ty-dn';
  if(isLeave(t))return 'ty-lv';
  if(/^Detachment/i.test(t))return 'ty-dt';
  return 'ty-gp';
}
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
                      :`${hhmm(inp.s)} – ${hhmm(inp.e)}`;
    return `<div class="sbi-row"><span class="sbi-t">${t}</span>${pk}`
      +`<span class="sbi-ty ${inTypeCls(inp.type)}" title="${esc(inp.type)}">${esc(inpLabel(inp))}</span>`
      +`<span class="sbi-rm" title="${esc(inp.remarks||'')}">${esc(inp.remarks||'—')}</span></div>`;
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
   because the keys in this markup address the LIVE model, not the snapshot */
export function sbNotesPanel(d:any,di:any,pv?:any,ro?:any){
  const n=d.notes||[];
  let s=`<div class="sb-panel notes"><div class="sb-ph">Overall notes <span class="sub">shown at the head of the day</span>`
    +(pv?'':`<span class="gctl"><button class="mbtn add" data-nadd="${di}" title="Add a note line">+ Note</button></span>`)+`</div><div class="sb-pb">`;
  if(!n.length)s+=`<div class="sb-empty">Nothing yet — “+ Note” adds a line that every viewer sees at the top of the day.</div>`;
  /* the three trailing controls are wrapped in one .lctl, same as every
     other row (sbRowCtl / board.ts's prog row) — an unwrapped ▲▼✕ is three
     flat grid children, not one, and the phone template below is written
     for four items (grip-gone, nx, nin, lctl), not five */
  n.forEach((t:any,ni:any)=>{ s+=`<div class="sb-nrow"${rowMove(`mv:n.${di}.${ni}`,ro)}>`+sbGrip(ro)+`<span class="nx">${ni+1}.</span>`
    +`<input class="nin" data-bfld="dn:${di}.${ni}"${alAttr(`dn:${di}.${ni}`)}${pv?' disabled':''} value="${esc(t)}" placeholder="e.g. EP OF THE WEEK — ENGINE FIRE ON GROUND">`
    +(pv?'':`<span class="lctl">`+sbNudge(`mv:n.${di}.${ni}`,ro)+`<button class="mbtn del" data-ndel="${di}.${ni}" title="Remove this note">✕</button></span>`)+`</div>`; });
  return s+`</div></div>`;
}
/* ---- board panel 2: overall programme (squadron-wide, affects everyone) --- */
export function sbProgPanel(d:any,di:any,pv?:any,ro?:any){
  const rows=d.allhands||[];
  let s=`<div class="sb-panel prog"><div class="sb-ph">Overall programme <span class="sub">squadron-wide — affects all</span>`
    +(pv?'':`<span class="gctl">${sbSortBtn(`p.${di}`,ro)}<button class="mbtn add" data-padd="${di}" title="Add a squadron-wide item">+ Item</button></span>`)+`</div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">Nothing squadron-wide yet — “+ Item” adds a mass brief, PT, safety stand-down and the like.</div>`;
  else{
    s+=`<div class="sb-acols"><span></span><span>Item</span><span>Detail</span><span>Start</span><span>End</span><span>People</span><span></span></div>`;
    rows.forEach((x:any,ri:any)=>{
      const arr=whoArr(x);
      /* same hole guard as the week view — an empty .itxt shifts every later puck */
      const inner=arr.map((nm:any,k:any)=>{const id=nameToId(nm);
        if(id&&PEOPLE[id])return `<span class="seat"${pv?'':` data-slot="a:${di}.${ri}.${k}"`}${alAttr(`a:${di}.${ri}.${k}`)}${pv?'':' draggable="true"'}>${puck(id,pv?null:sevOf(di,id),true,pv?null:chipOf(di,id))}</span>`;
        return String(nm||'').trim()?`<span class="itxt">${esc(nm)}</span>`:'';}).join('');
      s+=`<div class="sb-arow${rowCls(x)}"${rowMove(`mv:p.${di}.${ri}`,ro)}>`+sbGrip(ro)
        +`<input class="ain" data-bfld="ap:${di}.${ri}.prog"${alAttr(`ap:${di}.${ri}.prog`)}${pv?' disabled':''} value="${esc(x.prog||'')}" placeholder="MASS BRIEF">`
        +`<input class="ain" data-bfld="ap:${di}.${ri}.sub"${alAttr(`ap:${di}.${ri}.sub`)}${pv?' disabled':''} value="${esc(x.sub||'')}" placeholder="detail / location">`
        +`<input class="atm" data-bfld="ap:${di}.${ri}.str"${alAttr(`ap:${di}.${ri}.str`)}${pv?' disabled':''} value="${esc(x.str||'')}" placeholder="0800">`
        +`<input class="atm" data-bfld="ap:${di}.${ri}.end"${alAttr(`ap:${di}.${ri}.end`)}${pv?' disabled':''} value="${esc(x.end||'')}" placeholder="0900">`
        +`<div class="ppl"${pv?'':` data-fill="a:${di}.${ri}.+"`}>${inner||'<span class="itxt">all</span>'}</div>`
        +(pv?'':`<span class="lctl">`+sbNudge(`mv:p.${di}.${ri}`,ro)
        +`<button class="mbtn${x.cx?' on':''}" data-pcx="${di}.${ri}" title="${x.cx?'Restore this item':'Cancel this item (CX)'}">CX</button>`
        +`<button class="mbtn red${x.flag?' on':''}" data-pflag="${di}.${ri}" title="${x.flag?'Clear the red box':'Red box — flag for the next scheduler'}">■</button>`
        +`<button class="mbtn del" data-pdel="${di}.${ri}" title="Remove this item">✕</button></span>`)+`</div>`;
    });
  }
  return s+sbNote(d,di,'pn','prognotes','e.g. CFG visit shifts SODB right by 15 min — brief the duty crew.',pv)+`</div></div>`;
}
/* The scheduler's hand-over note for one block. Same text the week shows under
   the matching section, through the same funnel key — edit it in either place.
   Never on the view-only page: it is working traffic, not the issued programme. */
export function sbNote(d:any,di:any,key:any,field:any,ph:any,pv?:any){
  return `<div class="sb-note"><div class="sb-nh">Scheduler notes</div>`
    +`<textarea class="sb-nbox" data-bfld="${key}:${di}"${alAttr(`${key}:${di}`)}${pv?' disabled':''} placeholder="${esc(ph)}">${esc(d[field]||'')}</textarea></div>`;
}
/* ---- duty / sim / ground panels (owner request, Aug 26) -------------------
   The board finally carries every section the week day carries. Same
   six-column grid (c6r): Item | Start | End | People | Rmks | ctl. Seats and
   fill targets speak the ordinary slot-key grammar, so the board's generic
   arm/drag handlers and the mutation funnel cover them with NO new wiring —
   only the row-level mbtns needed handler branches (board.ts). */
function sbSeat(di:any,key:any,id:any,pv?:any){
  if(!(id&&PEOPLE[id]))return '';
  return `<span class="seat"${pv?'':` data-slot="${key}"`}${alAttr(key)}${pv?'':' draggable="true"'}>${puck(id,pv?null:sevOf(di,id),true,pv?null:chipOf(di,id))}</span>`;
}
function sbMore(di:any,base:any,r:any,pv?:any){
  return ((r&&r.more)||[]).map((id:any,i:any)=>sbSeat(di,`${base}.x${i}`,id,pv)).join('');
}
function sbTxt(cls:any,path:any,v:any,ph:any,pv:any){
  return `<input class="${cls}" data-bfld="${path}"${alAttr(path)}${pv?' disabled':''} value="${esc(v||'')}" placeholder="${ph}">`;
}
function sbRowCtl(pv:any,o:any,addr:any,pre:any,what:any,mv?:any){
  return pv?'':`<span class="lctl">`+(mv||'')
    +`<button class="mbtn${o.cx?' on':''}" data-${pre}cx="${addr}" title="${o.cx?'Restore '+what:'Cancel '+what+' (CX)'}">CX</button>`
    +`<button class="mbtn red${o.flag?' on':''}" data-${pre}flag="${addr}" title="${o.flag?'Clear the red box':'Red box — flag for the next scheduler'}">■</button>`
    +`<button class="mbtn del" data-${pre}del="${addr}" title="Remove ${what}">✕</button></span>`;
}
const C6=`<div class="sb-acols c6r"><span></span><span>Item</span><span>Start</span><span>End</span><span>People</span><span>Rmks</span><span></span></div>`;
export function sbDutyPanel(d:any,di:any,pv?:any,ro?:any){
  const dws=d.dutywaves||[];
  let s=`<div class="sb-panel duty"><div class="sb-ph">Duties <span class="sub">SDO / SXO / ops desk, by block</span>`
    +(pv?'':`<span class="gctl"><button class="mbtn add" data-dwadd="${di}" title="Add a duty block">+ Block</button></span>`)+`</div><div class="sb-pb">`;
  if(!dws.length)s+=`<div class="sb-empty">No duty blocks yet — “+ Block” adds one.</div>`;
  dws.forEach((dwv:any,wi:any)=>{
    s+=`<div class="sb-psub">`+sbTxt('ain',`dl:${di}.${wi}`,dwv.label,'WAVE 1 DUTIES',pv)
      +(pv?'':`<span class="gctl">${sbSortBtn(`d.${di}.${wi}`,ro)}<button class="mbtn add" data-dradd="${di}.${wi}" title="Add a duty row">+ Row</button>`
      +`<button class="mbtn del" data-dwdel="${di}.${wi}" title="Remove this block and its rows">✕ Block</button></span>`)+`</div>`;
    if((dwv.rows||[]).length)s+=C6;
    /* MODEL order, not dutySort — an editor whose rows jump as a role is typed
       would be hostile, and the slot keys are model indices anyway */
    (dwv.rows||[]).forEach((r:any,ri:any)=>{
      const base=`d:${di}.${wi}.${ri}`, t=`dr:${di}.${wi}.${ri}`;
      const inner=(PEOPLE[r.id]?sbSeat(di,base,r.id,pv):(r.id?`<span class="itxt">${esc(r.id)}</span>`:''))+sbMore(di,base,r,pv);
      s+=`<div class="sb-arow c6r${rowCls(r)}"${rowMove(`mv:d.${di}.${wi}.${ri}`,ro)}>`+sbGrip(ro)
        +sbTxt('ain',`${t}.role`,r.role,'SDO',pv)+sbTxt('atm',`${t}.str`,r.str,'0800',pv)+sbTxt('atm',`${t}.end`,r.end,'1700',pv)
        +`<div class="ppl"${pv?'':` data-fill="${base}.+"`}>${inner}</div>`
        +sbTxt('ain rmkin',`${t}.rmks`,r.rmks,'remarks',pv)
        +sbRowCtl(pv,r,`${di}.${wi}.${ri}`,'dr','this duty',sbNudge(`mv:d.${di}.${wi}.${ri}`,ro))+`</div>`;
    });
  });
  return s+sbNote(d,di,'dtn','dutynotes','e.g. SDO swapped — Bane has the PHA at 1700, Pike covers the last hour.',pv)+`</div></div>`;
}
export function sbSimRowsPanel(d:any,di:any,pv?:any,ro?:any){
  const sims=d.sims||{};
  let s=`<div class="sb-panel simr"><div class="sb-ph">Sims <span class="sub">AMT and OFT rows</span></div><div class="sb-pb">`;
  [['AMT','amt'],['OFT','oft']].forEach(([title,kind]:any)=>{
    const rows=sims[kind]||[];
    s+=`<div class="sb-psub"><span class="ntx">${title}</span>`
      +(pv?'':`<span class="gctl">${sbSortBtn(`s.${di}.${kind}`,ro)}<button class="mbtn add" data-sradd="${di}.${kind}" title="Add a ${title} row">+ Row</button></span>`)+`</div>`;
    if(!rows.length){s+=`<div class="sb-empty">No ${title} rows.</div>`;return;}
    s+=C6;
    rows.forEach((r:any,ri:any)=>{
      const base=`s:${di}.${kind}.${ri}`, t=`sr:${di}.${kind}.${ri}`;
      /* same two row shapes as the week: a 2-seat crew (p/w) or a pax list */
      const pax=Array.isArray(r.pax)?r.pax:null;
      /* A deleted pax HOLDS its index (slots.ts's pax branch splices nothing),
         so the hole must stay VISIBLE: render it as a droppable empty slot,
         not as nothing (owner, 8 Aug 26 — deleting one WSO from the AMT BOX
         visually collapsed the block upward, and there was no slot to drop
         the replacement back into). Same .sb-slot.empty[data-slot] shape as
         the flying line's seats, so boardArmClick's tap-to-arm and the drag
         machine's drop targeting cover it with no new wiring. A preview
         keeps rendering nothing — a frozen day is not a planning surface. */
      const seats=pax?pax.map((id:any,pi:any)=>{
        const k=`${base}.pax.${pi}`;
        return (id&&PEOPLE[id])?sbSeat(di,k,id,pv)
          :(pv?'':`<span class="sb-slot empty pax" data-slot="${k}" title="Empty seat — tap or drop a puck to fill">+</span>`);
      }).join('')
        :sbSeat(di,`${base}.p`,r.p,pv)+sbSeat(di,`${base}.w`,r.w,pv);
      const txt=(!seats&&r.who)?`<span class="itxt">${esc(r.who)}</span>`:'';
      s+=`<div class="sb-arow c6r${rowCls(r)}"${rowMove(`mv:s.${di}.${kind}.${ri}`,ro)}>`+sbGrip(ro)
        +sbTxt('ain',`${t}.label`,r.label,'EP SIM',pv)+sbTxt('atm',`${t}.str`,r.str,'0900',pv)+sbTxt('atm',`${t}.end`,r.end,'1100',pv)
        +`<div class="ppl"${pv?'':` data-fill="${base}.+"`}>${txt+seats+sbMore(di,base,r,pv)}</div>`
        +sbTxt('ain rmkin',`${t}.rmks`,r.rmks,'remarks',pv)
        +sbRowCtl(pv,r,`${di}.${kind}.${ri}`,'sr','this sim',sbNudge(`mv:s.${di}.${kind}.${ri}`,ro))+`</div>`;
    });
  });
  return s+sbNote(d,di,'sn','simnotes','e.g. OFT 2 u/s Thu PM — 4-ship EP profile pushed to next week. Divot still owes an AMT EP.',pv)+`</div></div>`;
}
export function sbGroundPanel(d:any,di:any,pv?:any,ro?:any){
  const rows=d.ground||[];
  let s=`<div class="sb-panel grnd"><div class="sb-ph">Ground Programme · scheduler <span class="sub">briefs, reviews, admin</span>`
    +(pv?'':`<span class="gctl">${sbSortBtn(`g.${di}`,ro)}<button class="mbtn add" data-gradd="${di}" title="Add a ground item">+ Item</button></span>`)+`</div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">No ground items yet — “+ Item” adds one.</div>`;
  else{
    s+=C6;
    /* same render-time ordering as the week — keys keep their model index */
    groundOrder(rows).forEach(({row:x,ri}:any)=>{
      const base=`g:${di}.${ri}`, t=`gr:${di}.${ri}`, id=nameToId(x.who);
      const inner=((id&&PEOPLE[id])?sbSeat(di,base,id,pv):(x.who?`<span class="itxt">${esc(x.who)}</span>`:''))+sbMore(di,base,x,pv);
      s+=`<div class="sb-arow c6r${rowCls(x)}"${rowMove(`mv:g.${di}.${ri}`,ro)}>`+sbGrip(ro)
        +sbTxt('ain',`${t}.prog`,x.prog,'OCU PROGRESS REVIEW',pv)+sbTxt('atm',`${t}.str`,x.str,'1400',pv)+sbTxt('atm',`${t}.end`,x.end,'1500',pv)
        +`<div class="ppl"${pv?'':` data-fill="${base}.+"`}>${inner}</div>`
        +sbTxt('ain rmkin',`${t}.rmks`,x.rmks,'remarks',pv)
        +sbRowCtl(pv,x,`${di}.${ri}`,'gr','this item',sbNudge(`mv:g.${di}.${ri}`,ro))+`</div>`;
    });
  }
  return s+sbNote(d,di,'gn','grndnotes','e.g. Two medicals already at 1030 — keep the next one clear of the wave brief.',pv)+`</div></div>`;
}
/* read-only ALWAYS: these rows are aircrew-submitted inputs, not schedule
   data — there are no funnel keys for them, and the place to change them is
   the Inputs page. Reuses the .sbi-row look from the bands panel below. */
function sbInpRow(di:any,inp:any,acc:any,pv:any){
  const pk=PEOPLE[inp.person]
    ? `<span class="seat">${puck(inp.person,sevOf(di,inp.person),true,chipOf(di,inp.person))}</span>`
    : `<span class="itxt">${esc(inp.person)}</span>`;
  const t=inp.allday?'all day':`${hhmm(inp.s)} – ${hhmm(inp.e)}`;
  return `<div class="sbi-row${acc&&inp.acc?' accd':''}"><span class="sbi-t">${t}</span>${pk}`
    +`<span class="sbi-ty ${inTypeCls(inp.type)}" title="${esc(inp.type)}">${esc(inpLabel(inp))}</span>`
    +`<span class="sbi-rm" title="${esc(inp.remarks||'')}">${esc(inp.remarks||'—')}</span>`
    +(acc&&!pv?accCtl(di,inp):'')+`</div>`;
}
export function sbInputsGroupPanel(d:any,di:any,pv?:any,day?:any){
  const rows=(day||INPUTS.filter((i:any)=>inputCoversDate(i,d.dt))).filter((inp:any)=>isPersonal(inp.type)&&inp.acc!=='u');
  let s=`<div class="sb-panel pinp"><div class="sb-ph">Personal Inputs <span class="sub">submitted by aircrew — accept to put it on the programme</span></div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">No personal inputs for this day.</div>`;
  rows.forEach((inp:any)=>{ s+=sbInpRow(di,inp,true,pv); });
  return s+`</div></div>`;
}
/* Leave, downchits and detachments close a man's day on their own — nobody
   accepts them, so this panel is read-only and carries no controls. */
export function sbUnavailPanel(d:any,di:any,day?:any){
  const rows=(day||INPUTS.filter((i:any)=>inputCoversDate(i,d.dt))).filter((inp:any)=>isUnavail(inp.type)||inp.acc==='u');
  let s=`<div class="sb-panel unav"><div class="sb-ph">Unavailable <span class="sub">leave, downchits and detachments — edit on the Inputs page</span></div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">Nil — everybody is available today.</div>`;
  rows.forEach((inp:any)=>{ s+=sbInpRow(di,inp,false,true); });
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
export function labelToTitle(w:any){ if(w.night)return 'Night wave'; const m=String(w.label).match(/(\d+)/); return m?((ORD[+m[1]-1]||m[1]+'th')+' wave'):(w.label||'1st wave'); }
export function titleToLabel(v:any){ if(/night/i.test(v))return 'NIGHT WAVE'; const m=v.match(/(\d+)/); return m?('WAVE '+m[1]):v.toUpperCase(); }
