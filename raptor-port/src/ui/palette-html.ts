/* The aircrew palette — paletteDay/rosterPuck/armStripHTML/paletteHTML and
   the placeholder row, verbatim. */
import { DAYS } from '../engine/data'
import { PEOPLE, SPECIALS, scQualOK } from '../engine/people'
import { INPUTS, isAway, inputCoversDate, offWord, awayAllDay, canWork, sansBadge, sansAvailOn } from '../engine/inputs'
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
export function rosterPuck(id:any,di:any,armKey:any,eng:any,off:any,sby:any,rules:any,hideWhy?:any){
  const grounded=!armKey&&!!(off&&off.has(id))&&groundedOnly(id,di);
  /* RECORD-LESS SANS ARE STRUCK BY DEFAULT (owner bug report, 14 Aug 26) — with
     nothing armed there is no slot to ask slotBar about, so a SANS man who has
     filed nothing for the day used to read as ordinarily available; only
     arming a seat ever asked the SANS gate anything (see slotBar's own SANS
     block in avail.ts). Checked AFTER the off/grounded reason so a real
     absence keeps outranking "no record filed", the same order sansGate
     itself applies against the absence checks in slotBar. Uses the exact
     words slotBar prints for the 'none' status, one vocabulary either way.
     `p.special` placeholders never reach rosterPuck (specialRowHTML draws
     them separately) and a non-SANS man never has `.san`, so both are
     untouched by construction, not by an extra guard here. */
  const why=armKey?slotBar(id,armKey,rules)
    :((off&&off.has(id)&&!grounded)?offReason(id,di)
      :((PEOPLE[id].san&&di>=0&&DAYS[di]&&!sansAvailOn(id,DAYS[di].dt))?'SANS — no availability filed for today':''));
  const standby=!!(sby&&sby.has(id));
  const cls=why?'no':((grounded||(eng&&eng.has(id)))?'busy':(standby?'standby':''));
  const note=why?`${PEOPLE[id].cs} — ${why}`
    :grounded?`${PEOPLE[id].cs} — grounded today: no flying, but a duty desk, a sim seat or a ground row is still open to him`
    :(eng&&eng.has(id))?`${PEOPLE[id].cs} — already tasked today, but you can still plan him`
    :standby?`${PEOPLE[id].cs} — SC spare, standing by and free for anything else`
    :PEOPLE[id].cs;
  /* WHILE A SLOT IS ARMED the reason is PRINTED under a crossed-out name, not
     only carried on the title — a phone has no hover, and the owner's rule
     (13 Aug 26) is that the scheduler sees the problem BEFORE the tap, never
     by planting. Armed only: the everyday palette keeps its density. hideWhy
     is the column speaking instead: where every barred name in a column
     shares one reason, paletteHTML prints it once under the header, or a
     front-seat arm would print "WSO — cannot fly front seat" fifteen times. */
  const showWhy=!!(armKey&&why&&!hideWhy);
  return `<span class="rpuck ${cls}${showWhy?' haswhy':''}" draggable="true" data-person="${id}"`
    +(why?` data-why="${esc(why)}"`:'')+` title="${esc(note)}"`
    +`>${puck(id,sevOf(di,id),true,chipOf(di,id))}${showWhy?`<span class="rwhy">${esc(why)}</span>`:''}</span>`;
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
  /* AN ARMED SLOT CHANGES WHAT THE PALETTE IS SAYING.
     Ordinarily the pucks are faded by whether the man is tasked anywhere on the
     day. That is the wrong question once a slot is armed: the scheduler is
     asking "who can take THIS slot", a man tasked elsewhere on the day can
     still be perfectly plannable here, and the grey fade read as "not
     available" (owner, 14 Aug 26 — "no grey out when I click on an event to be
     filled"; this rule was born SC-only on 12 Aug for exactly the same
     misreading, and the owner's ask generalises it). So with any slot armed the
     day-wide fade is switched off entirely — `.no` alone carries the meaning:
     anyone showing normally can be planned, anyone struck through cannot, and
     says why. An SC slot additionally cuts the list to the crew holding that
     shift's currency. The everyday, unarmed palette keeps its fades. */
  const arules=armKey?slotRules(armKey):null;
  const scArm=!!(arules&&arules.sc);
  const eng=armKey?new Set():eng0, sby=armKey?new Set():sby0;
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
  /* SANS members are no longer split into a per-column sub-band (owner, 14 Aug
     26) — they move into ONE full-width section below, sansAvailHTML, so
     every column here lists non-SANS crew only. */
  const sel=(seat:any)=>Object.keys(PEOPLE).filter((id:any)=>ok(id)&&PEOPLE[id].seat===seat&&!PEOPLE[id].san).sort(bySort);
  const col=(title:any,seat:any)=>{
    const act=sel(seat), free=act.filter((id:any)=>!rank(id)).length;
    /* one reason shared by EVERY barred name in the column reads ONCE, under
       the header — a front-seat arm bars every WSO for the same structural
       reason, and repeating it per name tripled the drawer's height */
    let colWhy='';
    if(armKey){
      const whys=act.map((id:any)=>slotBar(id,armKey,arules)).filter(Boolean);
      if(whys.length>=2&&whys.every((w:any)=>w===whys[0]))colWhy=whys[0];
    }
    return `<div class="rcol"><div class="rh">${title} · ${free} free</div>`
      +(colWhy?`<div class="rwhy">${esc(colWhy)}</div>`:'')
      +act.map((id:any)=>rosterPuck(id,di,armKey,eng,off,sby,arules,!!colWhy)).join('')
      +`</div>`;};
  /* THE PANEL'S OWN DAY PICKER (owner, 15 Aug 26). The palette follows the
     left-most day in view, but on a wide screen the last days of the week can
     never reach the left edge (Sunday is the final day and clamps the scroll),
     so their crew was unreachable by scrolling alone. The ‹ › arrows step the
     crew day directly — clamped to the week — reaching every day at any width.
     Only when NOT armed: an armed slot pins the palette to ITS day, and letting
     the arrows walk off it mid-plan would be a lie about which slot is live. */
  const lastDay=DAYS.length-1;
  const dayLbl=d.dow
    ? (ARM
      ? `<span class="mono" style="color:var(--ink-3)">${esc(d.dow)}</span>`
      : `<button class="er-daynav" data-crewstep="-1" title="Previous day"${di<=0?' disabled':''}>‹</button>`
        +`<span class="mono er-dayname" style="color:var(--ink-3)">${esc(d.dow)}</span>`
        +`<button class="er-daynav" data-crewstep="1" title="Next day"${di>=lastDay?' disabled':''}>›</button>`)
    : '';
  const head=o.head===false?'':`<div class="er-h">${ARM?'Tap a name to plan':'Aircrew'}`
    +(d.dow?` · ${dayLbl}`:'')+`</div>`;
  /* Personnel (ground crew) — shown only when the squadron actually has some.
     They can be dropped into a rear seat, a duty desk, a ground row or a sim;
     slotBar strikes them the moment a FRONT seat is armed. Same sorted list,
     free count and arm-greying col() computes, drawn as a full-width band whose
     pucks wrap horizontally rather than a narrow seat column — see the swap
     comment below. */
  const hasPers=sel('GND').length>0;
  const persBand=()=>{
    const act=sel('GND'), free=act.filter((id:any)=>!rank(id)).length;
    let colWhy='';
    if(armKey){const whys=act.map((id:any)=>slotBar(id,armKey,arules)).filter(Boolean);
      if(whys.length>=2&&whys.every((w:any)=>w===whys[0]))colWhy=whys[0];}
    return `<div class="rall rpers"><div class="rh2">Personnel · ${free} free</div>`
      +(colWhy?`<div class="rwhy">${esc(colWhy)}</div>`:'')
      +`<div class="rpers-pucks">`
      +act.map((id:any)=>rosterPuck(id,di,armKey,eng,off,sby,arules,!!colWhy)).join('')
      +`</div></div>`;
  };
  /* SANS Avail and Personnel SWAPPED (owner, 24 Aug 26). The SANS availability
     band — the day's "who is offering to fly / observe / AAR" list — now sits
     directly under the two crew columns, and ground crew drop to their own
     full-width band at the very bottom, out of the seat-column grid: they were
     the least-central column and the SANS offers earn the more prominent slot.
     The crew columns stay Pilots | WSOs. */
  return head+armStripHTML()+specialRowHTML(di)
    +`<div class="rcols">${col('Pilots','FCP')}${col('WSOs','RCP')}</div>`
    +sansAvailHTML(di,armKey,eng,off,sby,arules)
    +(hasPers?persBand():'');
}
export function specialRowHTML(di:any){
  if(!SPECIALS.length)return '';
  return `<div class="rall"><div class="rh2">Placeholders · drag in</div>`
    +SPECIALS.map((id:any)=>`<span class="rpuck" draggable="true" data-person="${id}" title="${esc(PEOPLE[id].cs)} — a placeholder, never validated">${puck(id,null,true,null)}</span>`).join('')
    +`</div>`;
}
/* SANS AVAILABILITY, ONE FULL-WIDTH SECTION (owner, 14 Aug 26) — every SANS
   member used to sit in a sub-band under his own seat column; that band is
   gone (see col() above) and every SANS body, pilot or WSO, now lists here
   instead, callsign-sorted, whichever column he'd otherwise have been in.
   Grey-out is automatic — rosterPuck already reads slotBar, which already
   carries the SANS gate (avail.ts) — this function only has to draw the row
   and the badge, not decide who is barred.
   `ok()` is the SAME archived/SC-currency filter paletteHTML's own columns
   apply, recomputed here rather than threaded through as a parameter: this
   is a standalone exported function (palette.test.ts and board-html.ts both
   call it directly), and arules already carries everything ok() needs. */
export function sansAvailHTML(di:any,armKey:any,eng:any,off:any,sby:any,arules:any){
  const scArm=!!(arules&&arules.sc);
  const ok=(id:any)=>!PEOPLE[id].archived&&(!scArm||scQualOK(id,arules.sc));
  const ids=Object.keys(PEOPLE).filter((id:any)=>ok(id)&&PEOPLE[id].san)
    .sort((a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs));
  if(!ids.length)return '';
  const d=DAYS[di]||{};
  /* each row prints its OWN reason (rosterPuck's hideWhy left off, unlike
     col()'s colWhy dedup) — a shared reason only makes sense where a whole
     column is barred for one structural cause (e.g. every WSO); here eleven
     different people can each be barred for a different SANS record, or none
     at all, and folding those into one line would just be wrong. */
  return `<div class="rall rsans"><div class="rh2">SANS Avail</div>`
    +ids.map((id:any)=>{
      const badge=sansBadge(id,d.dt);
      /* the record's own remarks, ellipsized (owner, 14 Aug 26) — a sibling of
         the badge, same reasoning as .rsans-b's own comment: never nested
         inside .rpuck, or a struck .rpuck.no.haswhy column would fight it for
         the puck's own flex-basis. Nothing at all when there is no record or
         the record carries no remarks — an empty span would still cost the
         row a gap nobody asked for. */
      const rec=sansAvailOn(id,d.dt), rmk=rec&&String(rec.remarks||'').trim();
      return `<div class="rsans-row">${rosterPuck(id,di,armKey,eng,off,sby,arules)}`
        +(badge?`<span class="rsans-b">${esc(badge)}</span>`:'')
        +(rmk?`<span class="rsans-r" title="${esc(rmk)}">${esc(rmk)}</span>`:'')+`</div>`;
    }).join('')+`</div>`;
}

/* ---- week horizontal-scroll arrows ---- */
