/* The scheduler-board panel builders — sbInputsHTML, sbNotesPanel,
   sbProgPanel, sbSimPanel, sbSlot, labelToTitle/titleToLabel — verbatim. */
import { INPUTS, isLeave, inputCoversDate } from '../engine/inputs'
import { PEOPLE, nameToId } from '../engine/people'
import { hhmm } from '../engine/time'
import { sevOf, chipOf } from '../engine/validate'
import { whoArr } from '../engine/slots'
import { alAttr } from '../engine/publish'
import { esc } from '../state/view'
import { ORD } from './html'
import { puck, rowCls } from './html'

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
  if(/^Office/i.test(t))return 'ty-of';
  if(/^Available/i.test(t))return 'ty-av';
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
      +`<span class="sbi-ty ${inTypeCls(inp.type)}" title="${esc(inp.type)}">${esc(inp.type)}</span>`
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
export function sbNotesPanel(d:any,di:any,pv?:any){
  const n=d.notes||[];
  let s=`<div class="sb-panel notes"><div class="sb-ph">Overall notes <span class="sub">shown at the head of the day</span>`
    +(pv?'':`<span class="gctl"><button class="mbtn add" data-nadd="${di}" title="Add a note line">+ Note</button></span>`)+`</div><div class="sb-pb">`;
  if(!n.length)s+=`<div class="sb-empty">Nothing yet — “+ Note” adds a line that every viewer sees at the top of the day.</div>`;
  n.forEach((t:any,ni:any)=>{ s+=`<div class="sb-nrow"><span class="nx">${ni+1}.</span>`
    +`<input class="nin" data-bfld="dn:${di}.${ni}"${alAttr(`dn:${di}.${ni}`)}${pv?' disabled':''} value="${esc(t)}" placeholder="e.g. EP OF THE WEEK — ENGINE FIRE ON GROUND">`
    +(pv?'':`<button class="mbtn del" data-ndel="${di}.${ni}" title="Remove this note">✕</button>`)+`</div>`; });
  return s+`</div></div>`;
}
/* ---- board panel 2: overall programme (squadron-wide, affects everyone) --- */
export function sbProgPanel(d:any,di:any,pv?:any){
  const rows=d.allhands||[];
  let s=`<div class="sb-panel prog"><div class="sb-ph">Overall programme <span class="sub">squadron-wide — affects all</span>`
    +(pv?'':`<span class="gctl"><button class="mbtn add" data-padd="${di}" title="Add a squadron-wide item">+ Item</button></span>`)+`</div><div class="sb-pb">`;
  if(!rows.length)s+=`<div class="sb-empty">Nothing squadron-wide yet — “+ Item” adds a mass brief, PT, safety stand-down and the like.</div>`;
  else{
    s+=`<div class="sb-acols"><span>Item</span><span>Detail</span><span>Start</span><span>End</span><span>People</span><span></span></div>`;
    rows.forEach((x:any,ri:any)=>{
      const arr=whoArr(x);
      /* same hole guard as the week view — an empty .itxt shifts every later puck */
      const inner=arr.map((nm:any,k:any)=>{const id=nameToId(nm);
        if(id&&PEOPLE[id])return `<span class="seat"${pv?'':` data-slot="a:${di}.${ri}.${k}"`}${alAttr(`a:${di}.${ri}.${k}`)}${pv?'':' draggable="true"'}>${puck(id,pv?null:sevOf(di,id),true,pv?null:chipOf(di,id))}</span>`;
        return String(nm||'').trim()?`<span class="itxt">${esc(nm)}</span>`:'';}).join('');
      s+=`<div class="sb-arow${rowCls(x)}">`
        +`<input class="ain" data-bfld="ap:${di}.${ri}.prog"${alAttr(`ap:${di}.${ri}.prog`)}${pv?' disabled':''} value="${esc(x.prog||'')}" placeholder="MASS BRIEF">`
        +`<input class="ain" data-bfld="ap:${di}.${ri}.sub"${alAttr(`ap:${di}.${ri}.sub`)}${pv?' disabled':''} value="${esc(x.sub||'')}" placeholder="detail / location">`
        +`<input class="atm" data-bfld="ap:${di}.${ri}.str"${alAttr(`ap:${di}.${ri}.str`)}${pv?' disabled':''} value="${esc(x.str||'')}" placeholder="0800">`
        +`<input class="atm" data-bfld="ap:${di}.${ri}.end"${alAttr(`ap:${di}.${ri}.end`)}${pv?' disabled':''} value="${esc(x.end||'')}" placeholder="0900">`
        +`<div class="ppl"${pv?'':` data-fill="a:${di}.${ri}.+"`}>${inner||'<span class="itxt">all</span>'}</div>`
        +(pv?'':`<span class="lctl">`
        +`<button class="mbtn${x.cx?' on':''}" data-pcx="${di}.${ri}" title="${x.cx?'Restore this item':'Cancel this item (CX)'}">CX</button>`
        +`<button class="mbtn red${x.flag?' on':''}" data-pflag="${di}.${ri}" title="${x.flag?'Clear the red box':'Red box — flag for the next scheduler'}">■</button>`
        +`<button class="mbtn del" data-pdel="${di}.${ri}" title="Remove this item">✕</button></span>`)+`</div>`;
    });
  }
  return s+`</div></div>`;
}
/* ---- board panel 3: sim planning notes, at the bottom of the board ------- */
export function sbSimPanel(d:any,di:any,pv?:any){
  return `<div class="sb-panel simn"><div class="sb-ph">Sim planning notes <span class="sub">read by whoever plans the next cycle</span></div>`
    +`<div class="sb-pb"><textarea class="sb-nbox" data-bfld="sn:${di}"${alAttr(`sn:${di}`)}${pv?' disabled':''} placeholder="e.g. OFT 2 u/s Thu PM — 4-ship EP profile pushed to next week. Divot still owes an AMT EP.">${esc(d.simnotes||'')}</textarea>`
    +`<div class="sb-hint">Appears under the Sims block of the day for every viewer.</div></div></div>`;
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
