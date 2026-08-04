import { DAYS } from '../engine/data'
import { PEOPLE, isSpecial, nameToId, QCHIP, QCLASS, LEVELNAME } from '../engine/people'
import { INPUTS, inputCoversDate, isOffType, offWord, isLeave, isDownchit } from '../engine/inputs'
import { isStandalone, scSpare, dayCount, mColor, saExempt, SAWAVE } from '../engine/waves'
import { parseHM, hhmm, hm24, minus } from '../engine/time'
import { slotVal, txtGet, TIME_TXT, whoArr, rowCrew, rowRef } from '../engine/slots'
import { WARN, sevOf, chipOf, chipText, wlbl, WCODE, SEVWORD, CHIP_LABEL } from '../engine/validate'
import { availByWave, personBusy, dayOff, dayEngaged, personWarns } from '../engine/avail'
import { SCHED, alAttr, dayApproved, dayALs, dayCurVer, dayPendCount, alColor, signOf, signMissing, signPeople, SIGN_ROLES, daySigned, nextAL, dowShort, alDays, daySnapOf, dayVersions, verLabel } from '../engine/publish'
import { keyDay } from '../engine/keys'
import { esc, SBDAY, WFOCUS, PFOCUS, DWOPEN, DPREV } from '../state/view'
import { canEditSched } from '../state/auth'
import { ME } from '../state/auth'
import { HOOKS } from '../engine/hooks'

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
const chip=(di:any,id:any)=>PV?null:chipOf(di,id)
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
  return `<span><i style="background:var(--fcp)"></i>FCP (pilot)</span><span><i style="background:var(--rcp)"></i>RCP (WSO)</span>
    <span style="margin-left:8px">Level:</span>
    <span><span class="qk" style="background:var(--q-ocu)">O</span>OCU</span>
    <span><span class="qk" style="background:var(--q-d)">D</span>D</span>
    <span><span class="qk" style="background:var(--q-c);color:#04222b">C</span>C</span>
    <span><span class="qk" style="background:var(--q-b);color:#2a1e02">B</span>B</span>
    <span><span class="qk" style="background:var(--q-a)">A</span>A</span>
    <span><span class="qk" style="background:var(--q-ins)">I</span>IP / instr</span>
    <span style="margin-left:8px"><span class="qk" style="background:var(--me)">▮</span>you</span>
    <span><span class="qk" style="background:#1E86FF">▮</span>selected</span>
    <span style="margin-left:8px">Flags:</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">DT</span>double turn</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">TT</span>tight turn</span>
    <span><span class="qk" style="background:#F0555F">C</span>conflict</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">A</span>advisory — shift + ground</span>
    <span><span class="qk" style="background:#F0555F">R</span>crew rest</span>
    <span><span class="qk" style="background:#F0555F">Q</span>qual / illegal seat</span>
    <span><span class="qk" style="background:#F0555F">B</span>no flight brief</span>
    <span><span class="qk" style="background:#F0555F">B</span>no sim brief</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">D</span>no flight debrief</span>
    <span><span class="qk" style="background:#E5A83B;color:#12100a">D</span>no sim debrief</span>
    <span><span class="qk" style="background:#8A96A3;color:#0B0D10">L</span>long work day</span>`;
    /* (the "Sections:" colour key used to sit here — removed on request; each section
       still carries its own coloured left bar, which is self-explanatory in place.) */
}
/* quotes matter: esc() output lands inside double-quoted attributes in a dozen
   places, so a remark containing a " used to close the attribute — truncating
   the field on the next render and injecting whatever followed */
export function puck(id:any,warn:any,sm:any,flag:any){
  const p=PEOPLE[id]; if(!p)return'';
  if(p.special){   // sentinel puck: canonical size, no seat/qual/SANS decoration
    return `<span class="puck allavail${sm?' sm':''}" tabindex="0" data-person="${id}" title="${esc(p.cs)}"><span class="nm">${esc(p.cs)}</span></span>`;
  }
  const cls=['puck']; if(p.seat==='RCP')cls.push('r'); if(sm)cls.push('sm');
  if(warn){cls.push('warn'); if(warn==='hard')cls.push('hard'); else if(warn==='note')cls.push('note');}
  if(flag==='C'||flag==='CR'||flag==='Q'||flag==='NB'||flag==='SB')cls.push('boxred');   // conflict / crew rest / qual / missed brief → red box
  if(p.san)cls.push('san');                         // SANS → purple right-edge line
  const chipTxt=p.ip?'I':QCHIP[p.q], chipCls=p.ip?'q-ins':QCLASS[p.q];
  const qchip=`<span class="role ${chipCls}">${chipTxt}</span>`;
  const lchip=flag?`<span class="lchip l-${flag.toLowerCase()}" title="${esc(wlbl(CHIP_LABEL[flag]||flag))}">${chipText(flag)}</span>`:'';
  const ttl=p.cs+' · '+LEVELNAME[p.q]+(p.ip?' · IP':'')+(p.sxo?' · SXO':'')+(p.san?' · SANS':'')+(flag?' · '+wlbl(CHIP_LABEL[flag]||flag):'');
  return `<span class="${cls.join(' ')}" tabindex="0" data-person="${id}" title="${ttl}">${lchip}<span class="nm">${p.cs}</span>${qchip}</span>`;
}

/* highlight state */
export let SELID:any=null;                 // clicked person (blue)
/* What was on screen before the current selection, so a second click on the
   same puck reverses the first rather than clearing everything. */
export let SELPREV:any=null;
/* How many places that person occupied when they were selected. If a delete
   takes one away the selection is dropped for everybody — you cannot go on
   pointing at a puck that is no longer there. */
export let SELSEEN=0;
export function slotCell(id:any,sev:any,key:any,kind:any,editable:any,flag:any){
  const al=alAttr(key);
  /* preview: no data-slot, no draggable — the key addresses the LIVE model */
  if(id) return `<span class="seat"${PV?'':` data-slot="${key}"`}${al}${editable?' draggable="true"':''}>${puck(id,sev,false,flag)}</span>`;
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
  return `<span class="seat"${PV?'':` data-slot="${key}"`}${alAttr(key)}${ed?' draggable="true"':''}>${puck(id,sev(di,id),true,chip(di,id))}</span>`;}
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
  return `<div class="pl-row${rowCls(o)}"><span class="nm">${cxTag(o)}${flagTag(o)}${nmi}</span>${t(str,'str')}${t(end,'end')}${pplHtml||'<div class="ppl one"></div>'}${plRmk(base,ed,o,rmkTxt)}</div>`;}
/* RMKS cell — column 5 on desktop, a full-width strip under the row on a phone.
   Rows addressable through a text key (duties / sims / ground) get an editable cell;
   read-only rows (personal inputs) get a plain one. An empty cell is dropped on the
   phone so the strip never eats a row's worth of height for nothing, but it is kept
   in edit mode because that blank cell is the only place to click to write a remark. */
export function plRmk(base:any,ed:any,o:any,rmkTxt:any){
  const live=ed&&canEditSched();
  if(base&&rmkTxt===undefined){
    const v=(o&&o.rmks)||'';
    if(!v&&!live)return `<span class="rmk rk-e"></span>`;
    return `<span class="rmk">${ted(base+'.rmks',v,ed,'ntx')}</span>`;
  }
  const v=rmkTxt||'';
  return `<span class="rmk${v?'':' rk-e'}"><span class="ntx">${esc(v)}</span></span>`;}
/* free-text planning notes attached to a whole block (currently the Sims block).
   Read-only viewers see the note only when there is one; schedulers always get the
   box so there is somewhere to write before anything has been written. */
export function simNoteHTML(di:any,d:any,ed:any){
  const v=d.simnotes||'';
  if(!v&&!ed)return '';
  const a=alAttr(`sn:${di}`);
  return `<div class="blknote-h">Sim planning notes</div>`
    +(ed&&canEditSched()
      ? `<div class="blknote ed" contenteditable="true" spellcheck="false" data-txt="sn:${di}"${a}>${esc(v)}</div>`
      : `<div class="blknote"${a}>${esc(v)}</div>`);
}
/* duty display order: SDO, then SXO, then OPS-O, then anything else */
export const DUTY_ORDER:any={'SDO':0,'SXO':1,'OPS-O':2,'OPS O':2,'RUNNER':3,'LOGCELL':4,'LOG CELL':4};
export function dutySort(rows:any){return (rows||[]).slice().sort((a:any,b:any)=>((DUTY_ORDER[a.role]??9)-(DUTY_ORDER[b.role]??9)));}
/* Available-crew block: active aircrew by wave, then SANS grouped separately (they run to
   different currency requirements — see sanStatus()). Rendered at the bottom of the day. */
export function availHTML(d:any,di:any,ed:any){
  const A=availByWave(d);
  /* in edit mode an available puck is a drag source — drag it straight onto a line,
     a duty, a sim or a programme item */
  const pk=(id:any)=>`<span class="seat"${ed?` draggable="true" data-person="${id}"`:''}>${puck(id,sev(di,id),true,chip(di,id))}</span>`;
  const active=(ids:any)=>ids.filter((id:any)=>!PEOPLE[id].san), sans=(ids:any)=>ids.filter((id:any)=>PEOPLE[id].san);
  const grid=(ids:any)=>ids.length?`<div class="ap-grid">`+ids.map(pk).join('')+`</div>`:`<div class="ap-empty">— none free —</div>`;
  const bandTxt=(w:any)=>{const a=w.s>0?hhmm(w.s):'AM', b=w.e<1440?hhmm(w.e):'end';return `${a}–${b}`;};
  let h=`<div class="availpuck sec sec-avail"><div class="ap-h"><span>Available crew</span><span class="n">by wave</span></div>`;
  if(A.wins.length){
    A.wins.forEach((w:any,i:any)=>{const ids=active(A.byWave[i]);
      h+=`<div class="ap-grp">${ORD[i]||(i+1)+'th'} wave${w.night?' · night':''} <span style="color:var(--ink-3);font-weight:500">${bandTxt(w)}</span> · ${ids.length}</div>`+grid(ids);});
    const allA=active(A.anyWave);
    h+=`<div class="ap-grp">Available all day · ${allA.length}</div>`+grid(allA);
  } else {
    const allA=active(A.anyWave);
    h+=`<div class="ap-grp">Available all day · ${allA.length}</div>`+(allA.length?grid(allA):`<div class="ap-empty">Everyone is on the programme.</div>`);
  }
  // SANS grouped together (separate currency requirements)
  const sansAll:any[]=[]; A.wins.forEach((w:any,i:any)=>sans(A.byWave[i]).forEach((id:any)=>{if(!sansAll.includes(id))sansAll.push(id);}));
  sans(A.anyWave).forEach((id:any)=>{if(!sansAll.includes(id))sansAll.push(id);});
  h+=`<div class="ap-grp sans-grp">SANS available <span style="color:var(--ink-3);font-weight:500">· staff-assigned / NS</span> · ${sansAll.length}</div>`;
  h+= sansAll.length?`<div class="ap-grid">`+sansAll.map(pk).join('')+`</div>`:`<div class="ap-empty">— none free —</div>`;
  return h+`</div>`;
}
export function storesView(o:any){
  o=o||{}; const lab:any={tk2:'2TK',tpod:'TPOD',nav:'NAV'};
  const on=['tk2','tpod','nav'].filter((k:any)=>o[k]);
  if(!on.length&&!o.bombs)return'';
  return `<span class="stores">`+on.map((k:any)=>`<span class="stchip on">${lab[k]}</span>`).join('')+(o.bombs?`<span class="stchip bomb">◈ ${esc(o.bombs)}</span>`:'')+`</span>`;
}
/* the day's issue strip. Collapsed it is a one-line summary; expanded (DWOPEN)
   it lists the warnings right here in the column — no centred modal. */
export function dayWarnHTML(di:any){
  const all=(WARN.byDay[di]&&WARN.byDay[di].warns)||[];
  if(!all.length)return '';
  /* When a puck is clicked the box narrows to that person's issues on this day
     — every other day they are flagged on opens the same way, so a cause that
     sits on the day before is right there next to the effect. */
  const pf=PFOCUS&&PFOCUS.id;
  const items=pf?personWarns(di,pf):all.map((w:any,ix:any)=>({w,ix}));
  if(pf&&!items.length)return '';
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
    h+=`<div class="dwlist">`+items.map(({w,ix}:any)=>{
      const names=(w.who||[]).map((id:any)=>PEOPLE[id]?PEOPLE[id].cs:id).join(', ');
      const on=WFOCUS&&WFOCUS.di===di&&WFOCUS.ix===ix;
      return `<div class="witem ${w.sev}${on?' on':''}" data-wdi="${di}" data-wix="${ix}" title="Jump to the puck that caused this">`
        +`<span class="wbar"></span><span><span class="wcode">${esc(wlbl(WCODE[w.code]||w.code))}</span>`
        +`<b>${esc(names)}</b>${names?' — ':''}${esc(w.msg||'')}</span></div>`;
    }).join('')
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
export function ted(path:any,val:any,ed:any,cls:any,tag?:any){
  tag=tag||'span';
  const t=TIME_TXT.test(String(path))?fmtT(val):esc(val==null?'':val);
  const a=alAttr(path);
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
      h+=`<div class="allhands sec sec-prog"><div class="ah-h">Programme</div>`;
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
        +`${sa?`<span class="satag" title="${esc((SAWAVE[w.kind]||{}).note||'Standalone — outside the day\u2019s flying count')}">standalone${w.noconf?' · not cross-checked':''}</span>`:''}</span>
        ${sa?'':`<button class="airbtn" data-air="${di}|${gi}">Traffic</button>`}</div>`;
      if(w.intimes&&w.intimes.length)
        h+=`<div class="intimes"${alAttr(`it:${di}.${gi}`)} ${ed?`contenteditable="true" spellcheck="false" data-intimes="${di}|${gi}"`:''}>${intimesInner(w)}</div>`;
      h+=sa
        ? `<div class="cols formcols"><span>${esc(w.label||'')}<br>SHIFT</span><span class="c-c">START</span><span class="c-c">END</span><span>FCP / RCP</span><span>RMKS</span></div>`
        : `<div class="cols formcols"><span>CS<br>MSN</span><span class="c-c">B<br>TO</span><span class="c-c">LD</span><span>FCP / RCP</span><span>RMKS</span></div>`;
      w.formations.forEach((f:any,li:any)=>{
        const brief=minus(f.to,140), rows=f.aircraft.length;
        const areaTxt = areaText(f), timeTxt = atimeText(f);
        const fp=`ff:${di}.${gi}.${li}`;
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
            : `<div class="fcell bto" style="${spans}"><b>${brief}</b>${ted(fp+'.to',f.to,ed,'','span')}</div>`}
          <div class="fcell ld" style="${spans}">${ted(fp+'.ld',f.ld,ed,'ntx')}</div>`;
        f.aircraft.forEach((a:any,ai:any)=>{
          const key=`${di}.${gi}.${li}.${ai}`, o=a.opts||{};
          const stores=ed
            ? `<span class="stores">`+['tk2','tpod','nav'].map((k:any)=>`<span class="stchip ${o[k]?'on':''}" data-store="${key}.${k}">${k==='tk2'?'2TK':k.toUpperCase()}</span>`).join('')
              +`<span class="bombs" contenteditable="true" data-bombs="${key}">${esc(o.bombs||'')}</span></span>`
            : storesView(o);
          const acx=(f.cx?'':rowCls(a))+((sa&&a.spare)?' spare':'');   // a cancelled formation already fades the whole block
          /* marks "nothing at all to say about this jet". RMKS is a real column again so
             the empty cell just stays blank rather than being hidden, but the class is
             kept as the hook anything later needs to spot a silent aircraft. */
          const rmkE=(!ed&&!(a.rmks||'').trim()&&!storesView(o)&&!a.cx&&!a.flag)?' rmk-e':'';
          /* a line the engine isn't checking shows no ring and no flag — a red
             puck there would read as "this SC line has a problem" when the
             problem, if any, belongs to that person's other flying */
          const chk=!saExempt(w,f,a);
          const sv=(id:any)=>chk?sev(di,id):null, cp=(id:any)=>chk?chip(di,id):null;
          h+=`<div class="acrow${ai?'':' r1'}${acx}" style="--gr:${ai+1}"><span class="pucks">${slotCell(a.p,sv(a.p),key+'.p','FCP',ed,cp(a.p))}${slotCell(a.w,sv(a.w),key+'.w','RCP',ed,cp(a.w))}</span></div>
              <div class="rmkcell${ai?'':' r1'}${acx}${rmkE}" style="--gr:${ai+1}"${alAttr(`st:${key}`)}>${cxTag(a)}${flagTag(a)}${sa?`<span class="rolet ${a.spare?'spare':'main'}" title="${a.spare?'Spare crew — standing by, not cross-checked against anything else':'Main crew'}">${esc(a.role||(a.spare?'SPARE':'MAIN'))}</span>`:''}${ted(`fr:${key}`,a.rmks,ed,'ntx')}${sa?'':stores}</div>`;
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
    if(d.dutywaves&&d.dutywaves.length){
      h+=`<div class="sub plist sec sec-duty"><div class="sub-h">Duties</div>`+plCols();
      d.dutywaves.forEach((dwv:any,wi:any)=>{
        h+=`<div class="pl-sub">${ted(`dl:${di}.${wi}`,dwv.label,ed,'ntx')}</div>`;
        dutySort(dwv.rows).forEach((r:any)=>{
          const ri=dwv.rows.indexOf(r), key=`d:${di}.${wi}.${ri}`;
          const inner=(PEOPLE[r.id]?lSeat(di,r.id,key,ed):(r.id?`<span class="itxt">${esc(r.id)}</span>`:''))+moreSeats(di,key,ed);
          const n=rowCrew('d',[di,wi,ri]).filter(Boolean).length;
          h+=plRow(r.role,r.str,r.end,lCell(inner,key+'.+',ed,n<=1?'one':''),`dr:${di}.${wi}.${ri}`,'role',ed,r);});
      });
      h+=`</div>`;
    }
    // ---- SIMS category (AMT + OFT), after duties ----
    const sims=d.sims||{};
    if((sims.amt&&sims.amt.length)||(sims.oft&&sims.oft.length)||d.simnotes||ed){
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
      h+=simNoteHTML(di,d,ed);
      h+=`</div>`;
    }
    // ---- ground programme (scheduler-entered, always shown) ----
    if(d.ground&&d.ground.length){
      h+=`<div class="sub plist one sec sec-grnd"><div class="sub-h">Ground programme · scheduler</div>`+plCols();
      d.ground.forEach((x:any,ri:any)=>{const id=nameToId(x.who), key=`g:${di}.${ri}`;
        const inner=((id&&PEOPLE[id])?lSeat(di,id,key,ed):(x.who?`<span class="itxt">${esc(x.who)}</span>`:''))+moreSeats(di,key,ed);
        const n=rowCrew('g',[di,ri]).filter(Boolean).length;
        h+=plRow(x.prog,x.str,x.end,lCell(inner,key+'.+',ed,n<=1?'one':''),`gr:${di}.${ri}`,'prog',ed,x);});
      h+=`</div>`;
    }
    // ---- personal inputs (user-entered) grouped into ground / available / office / DNIF / leave ----
    const dayInputs=INPUTS.filter((inp:any)=>inputCoversDate(inp,d.dt));
    /* personal-input groups use the SAME columnar grid as duties / sims / ground:
       Name | Start | End | People.  All-day rows span the two time columns. */
    const inGrp=(title:any,filt:any,cls:any,always?:any)=>{ const rows=dayInputs.filter(filt);
      if(!rows.length&&!always)return'';
      let s=`<div class="sub plist one sec ${cls||''}"><div class="sub-h">${title}</div>`;
      /* Leave and Downchit are the two blocks the squadron reads every single day,
         so they print even when nobody is on them — "NIL" is the answer, not a
         missing section. */
      if(!rows.length)return s+`<div class="pl-nil">Nil</div></div>`;
      s+=plCols();
      rows.forEach((inp:any)=>{
        const pk=PEOPLE[inp.person]
          ? `<span class="seat">${puck(inp.person,sev(di,inp.person),true,chip(di,inp.person))}</span>`
          : `<span class="itxt">${esc(inp.person)}</span>`;
        const tcell=inp.allday
          ? `<span class="t allday">all day</span>`
          : `<span class="t">${esc(hhmm(inp.s))}</span><span class="t">${esc(hhmm(inp.e))}</span>`;
        /* the input's own free text now reads in the RMKS column, so the NAME column
           carries the type and every block lines up on the same five columns */
        s+=`<div class="pl-row"><span class="nm"><span class="ntx">${esc(inp.type)}</span></span>${tcell}<div class="ppl one">${pk}</div>${plRmk(null,ed,null,inp.remarks||'')}</div>`; });
      return s+`</div>`; };
    h+=inGrp('Ground programme · personal inputs',(inp:any)=>/Appointment|Meeting|Personal|Training|Fly$|Other/i.test(inp.type),'sec-inp');
    h+=inGrp('Available',(inp:any)=>/^Available/i.test(inp.type),'sec-avail');
    h+=inGrp('Office',(inp:any)=>inp.type==='Office','sec-off');
    // ---- available crew sits directly under Office ----
    h+=availHTML(d,di,ed);
    // ---- leave, then downchit, close the day ----
    h+=inGrp('Leave',(inp:any)=>isLeave(inp.type),'sec-leave',true);
    h+=inGrp('Downchit',(inp:any)=>inp.type==='Downchit','sec-dnco',true);
    h+=`</div>`; // /day-body
    return h+`</section>`;
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
      return `<div class="witem ${w.sev}" data-adv="${di}.${ix}" title="Jump to the puck that caused this">`
        +`<span class="wbar"></span><span><span class="wcode">${SEVWORD[w.sev]} · ${esc(wlbl(WCODE[w.code]||w.code))}</span>`
        +`<b>${esc(names)}</b>${names?' — ':''}${esc(w.msg||'')}</span></div>`;}).join('')+`</div>`;
  }
  return h;
}
