/* The aircrew palette — paletteDay/rosterPuck/armStripHTML/paletteHTML and
   the placeholder row, verbatim. */
import { DAYS } from '../engine/data'
import { PEOPLE, SPECIALS, scQualOK } from '../engine/people'
import { INPUTS, isAway, inputCoversDate, offWord, awayAllDay, canWork } from '../engine/inputs'
import { hm24 } from '../engine/time'
import { dayEngaged, dayOff, dayStandby, slotBar, slotRules } from '../engine/avail'
import { sevOf, chipOf } from '../engine/validate'
import { esc, ARM, ROSDAY } from '../state/view'
import { puck } from './html'

export function paletteDay(){ return ARM&&ARM.di>=0?ARM.di:(DAYS[ROSDAY]?ROSDAY:0); }
/* one puck, with the reason it cannot be used carried on the title */
/* GROUNDED IS NOT ABSENT. ATT B is the one type that bars a flying seat and
   leaves a duty desk, a sim seat and a ground row open — `canWork` is that
   carve-out, and `slotBar` applies it the moment a slot is ARMED. With nothing
   armed there is no slot to judge against, and this fell back to dayOff, which
   only knows "away all day": the man came out struck through and cursor
   not-allowed, i.e. "cannot be used", while the app itself would happily take
   him at a desk one click later. Say what he cannot do instead of refusing him
   outright. Only when EVERY whole-day absence he carries is a canWork one —
   an ATT B man who is also on leave is properly away. */
const groundedOnly=(id:any,di:any)=>{
  const d=DAYS[di]; if(!d)return false;
  const away=INPUTS.filter((i:any)=>isAway(i)&&awayAllDay(i)&&i.person===id&&inputCoversDate(i,d.dt));
  return away.length>0&&away.every((i:any)=>canWork(i.type));
};
export function rosterPuck(id:any,di:any,armKey:any,eng:any,off:any,sby:any,rules:any){
  const grounded=!armKey&&!!(off&&off.has(id))&&groundedOnly(id,di);
  const why=armKey?slotBar(id,armKey,rules):((off&&off.has(id)&&!grounded)?offReason(id,di):'');
  const standby=!!(sby&&sby.has(id));
  const cls=why?'no':((grounded||(eng&&eng.has(id)))?'busy':(standby?'standby':''));
  const note=why?`${PEOPLE[id].cs} — ${why}`
    :grounded?`${PEOPLE[id].cs} — grounded today: no flying, but a duty desk, a sim seat or a ground row is still open to him`
    :(eng&&eng.has(id))?`${PEOPLE[id].cs} — already tasked today, but you can still plan him`
    :standby?`${PEOPLE[id].cs} — SC spare, standing by and free for anything else`
    :PEOPLE[id].cs;
  return `<span class="rpuck ${cls}" draggable="true" data-person="${id}"`
    +(why?` data-why="${esc(why)}"`:'')+` title="${esc(note)}"`
    +`>${puck(id,sevOf(di,id),true,chipOf(di,id))}</span>`;
}
/* Why this man's DAY is closed. Only ever asked about someone dayOff() has
   already named, so it must look at the same absences dayOff does — whole-day
   ones. Without the awayAllDay filter a man carrying both an all-day absence
   and a half-day one could have the half-day named as the reason his whole
   day is gone, which reads as a bug in the rule rather than in the sentence. */
export function offReason(id:any,di:any){
  const d=DAYS[di]; if(!d)return '';
  const x=INPUTS.find((i:any)=>isAway(i)&&awayAllDay(i)&&i.person===id&&inputCoversDate(i,d.dt));
  return x?offWord(x):'';
}
export function armStripHTML(){
  if(!ARM)return '';
  /* an SC slot says which shift it is and that the list has been cut to the crew
     holding that currency — otherwise the missing names look like a bug */
  const r=slotRules(String(ARM.key).replace(/\.\+$/,''));
  const note=r.sc?`<span class="scnote">${r.sc==='day'?'SC DAY':'SC NIGHT'} current only`
      +(r.scStart!=null&&r.scEnd!=null?` · shift ${hm24(r.scStart)}–${hm24(r.scEnd)}`:'')+`</span>`:'';
  return `<div class="ros-arm"><span>Planning <b>${ARM.title}</b>${note}</span>`
    +`<button class="x" data-disarm="1" title="Cancel">✕</button></div>`;
}
/* the shared body of both palettes */
export function paletteHTML(di:any,opts?:any){
  const o=opts||{}, d=DAYS[di]||{};
  const armKey=ARM?String(ARM.key).replace(/\.\+$/,''):'';
  const eng0=d.dow?dayEngaged(d):new Set(), off=d.dow?dayOff(d):new Set();
  const sby0=d.dow?dayStandby(d):new Set();
  /* AN ARMED SC SLOT CHANGES WHAT THE PALETTE IS SAYING.
     Ordinarily the pucks are faded by whether the man is tasked anywhere on the
     day. That is the wrong question for a shift: he can be on the other half of
     the day and still be perfectly plannable here, and the fade read as "not
     available". So with an SC slot armed the day-wide fade is switched off
     entirely — `.no` alone carries the meaning — and the list is cut down to the
     crew who actually hold the currency for that shift. Anyone left showing
     normally can be planned; anyone struck through cannot, and says why.
     Scoped to SC: an ordinary flying seat still behaves exactly as before. */
  const arules=armKey?slotRules(armKey):null;
  const scArm=!!(arules&&arules.sc);
  const eng=scArm?new Set():eng0, sby=scArm?new Set():sby0;
  const ok=(id:any)=>!PEOPLE[id].archived&&(!scArm||scQualOK(id,arules.sc));
  /* rank 2 = cannot be planned here, 1 = tasked but plannable, 0 = free. The
     off set (leave / downchit) is drawn struck-through but used to be ranked 0,
     so the column header counted men on leave among the "N free" and sorted them
     to the top alongside genuinely available crew. */
  /* rank 2 is "cannot be planned here", which is what draws the strike-through
     and drops him out of the "N free" count. A grounded-only man (ATT B) is
     rank 1 — tasked-but-plannable — for the same reason rosterPuck no longer
     strikes him: he is unavailable for a jet, not for the day. */
  const rank=(id:any)=>(armKey?(slotBar(id,armKey,arules)?2:0)
                       :((off&&off.has(id))?(groundedOnly(id,di)?1:2):0))||(eng.has(id)?1:0);
  const bySort=(a:any,b:any)=>rank(a)-rank(b)||PEOPLE[a].cs.localeCompare(PEOPLE[b].cs);
  const sel=(seat:any,san:any)=>Object.keys(PEOPLE).filter((id:any)=>ok(id)&&PEOPLE[id].seat===seat&&!!PEOPLE[id].san===san).sort(bySort);
  const col=(title:any,seat:any)=>{
    const act=sel(seat,false), sn=sel(seat,true);
    const free=act.concat(sn).filter((id:any)=>!rank(id)).length;
    return `<div class="rcol"><div class="rh">${title} · ${free} free</div>`
      +act.map((id:any)=>rosterPuck(id,di,armKey,eng,off,sby,arules)).join('')
      +(sn.length?`<div class="rh sans">SANS · ${sn.length}</div>`
        +sn.map((id:any)=>rosterPuck(id,di,armKey,eng,off,sby,arules)).join(''):'')
      +`</div>`;};
  const head=o.head===false?'':`<div class="er-h">${ARM?'Tap a name to plan':'Aircrew'}`
    +(d.dow?` · <span class="mono" style="color:var(--ink-3)">${esc(d.dow)}</span>`:'')+`</div>`;
  return head+armStripHTML()+specialRowHTML(di)
    +`<div class="rcols">${col('Pilots','FCP')}${col('WSOs','RCP')}</div>`;
}
export function specialRowHTML(di:any){
  if(!SPECIALS.length)return '';
  return `<div class="rall"><div class="rh2">Placeholders · drag in</div>`
    +SPECIALS.map((id:any)=>`<span class="rpuck" draggable="true" data-person="${id}" title="${esc(PEOPLE[id].cs)} — a placeholder, never validated">${puck(id,null,true,null)}</span>`).join('')
    +`</div>`;
}

/* ---- week horizontal-scroll arrows ---- */
