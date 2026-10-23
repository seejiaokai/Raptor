/* The aircrew palette — paletteDay/rosterPuck/armStripHTML/paletteHTML and
   the placeholder row, verbatim. */
import { DAYS } from '../engine/data'
import { PEOPLE, SPECIALS, scQualOK } from '../engine/people'
import { inputLinesOn, inputReadPass, isAway, offWord, awayAllDay, canWork, sansBadge, sansAvailOn } from '../engine/inputs'
import { hm24 } from '../engine/time'
import { dayEngaged, dayOff, dayStandby, slotBar, slotRules } from '../engine/avail'
import { esc, ARM, ROSDAY, slotTitle } from '../state/view'
import { puck, puckMarks } from './html'

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
  /* LINES — one a named person of each input on the day (engine/inputs.ts inputLinesOn), the same read dayOff makes
     (avail.ts dayAway), which is who this is asked about. Worked out once a paint (paletteHTML opens the pass), not
     once a man. The crew list is never drawn inside a published face, so this is the working copy's inputs, as before. */
  const away=inputLinesOn(d.dt).filter((i:any)=>isAway(i)&&awayAllDay(i)&&i.person===id);
  return away.length>0&&away.every((i:any)=>canWork(i.type));
};
/* the kind that grounds him (ATT B today — canWork's one type), named on his line in the list (D1118) */
const groundedType=(id:any,di:any)=>{
  const d=DAYS[di]; if(!d)return '';
  const x=inputLinesOn(d.dt).find((i:any)=>isAway(i)&&awayAllDay(i)&&i.person===id&&canWork(i.type));
  return x?String(x.type):'';
};
/* why this man is crossed out of the list, or '' — one body for his puck (rosterPuck) and the SANS section's order */
function whyOf(id:any,di:any,armKey:any,off:any,rules:any,grounded:any){
  return armKey?slotBar(id,armKey,rules)
    :((off&&off.has(id)&&!grounded)?offReason(id,di)
      :((PEOPLE[id].san&&di>=0&&DAYS[di]&&!sansAvailOn(id,DAYS[di].dt))?'SANS — no availability filed for today':''));
}
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
  const why=whyOf(id,di,armKey,off,rules,grounded);
  const standby=!!(sby&&sby.has(id)), tasked=!!(eng&&eng.has(id));
  /* GROUNDED BUT FREE READS FREE (owner D1118, 21 Oct 26 — D1114's question, "yes as drawn"): with no place picked, a
     man whose only absence is ATT B and who has nothing else that day is drawn in full colour, his line saying what he
     cannot do ("ATT B: no flying") — the fade means "already tasked", and he is not. Tasked elsewhere too, he stays
     faded, as before. Picking a place still judges him by slotBar above. */
  const gFree=grounded&&!tasked&&!why;   // a SANS man on ATT B with no record is struck for that, never drawn free (blind read F3)
  const cls=why?'no':(gFree?'grounded':((grounded||tasked)?'busy':(standby?'standby':'')));
  const sbyKind=standby&&sby.get?sby.get(id):'SC';
  const note=why?`${PEOPLE[id].cs} — ${why}`
    :grounded?`${PEOPLE[id].cs} — grounded today: no flying, but a duty desk, a sim seat or a ground row is still open to him`
    :tasked?`${PEOPLE[id].cs} — already tasked today, but you can still plan him`
    :standby?(sbyKind==='SC'?`${PEOPLE[id].cs} — SC spare, standing by and free for anything else`:`${PEOPLE[id].cs} — ${sbyKind} standby, free for anything else`)
    :PEOPLE[id].cs;
  const gWhy=gFree?`${groundedType(id,di)||'Grounded'}: no flying`:'';
  /* WHILE A SLOT IS ARMED the reason is PRINTED under a crossed-out name, not
     only carried on the title — a phone has no hover, and the owner's rule
     (13 Aug 26) is that the scheduler sees the problem BEFORE the tap, never
     by planting. Armed only: the everyday palette keeps its density. hideWhy
     is the column speaking instead: where every barred name in a column
     shares one reason, paletteHTML prints it once under the header, or a
     front-seat arm would print "WSO — cannot fly front seat" fifteen times. */
  const showWhy=!!(armKey&&why&&!hideWhy);
  return `<span class="rpuck ${cls}${(showWhy||gWhy)?' haswhy':''}" data-drag="1" data-person="${id}"`
    +(why?` data-why="${esc(why)}"`:'')+` title="${esc(note)}"`
    /* the seat's four marks (D1013, D1017): the day that breaks tomorrow's crew rest rings dotted here too, a sanctioned
       late show dashed, with the seat's own chip — the crew list is never drawn inside a published face, so the live read */
    +`>${(m=>puck(id,m.sev,true,m.flag,m.dash,m.trace))(di>=0?puckMarks(di,id):{sev:null,flag:null,dash:false,trace:null})}${showWhy?`<span class="rwhy">${esc(why)}</span>`:(gWhy?`<span class="rwhy">${esc(gWhy)}</span>`:'')}</span>`;
}
/* Why this man's DAY is closed. Only ever asked about someone dayOff() has
   already named, so it must look at the same absences dayOff does — whole-day
   ones. Without the awayAllDay filter a man carrying both an all-day absence
   and a half-day one could have the half-day named as the reason his whole
   day is gone, which reads as a bug in the rule rather than in the sentence. */
export function offReason(id:any,di:any){
  const d=DAYS[di]; if(!d)return '';
  const x=inputLinesOn(d.dt).find((i:any)=>isAway(i)&&awayAllDay(i)&&i.person===id);
  return x?offWord(x):'';
}
export function armStripHTML(){
  if(!ARM)return '';
  /* an SC slot says which shift it is and that the list has been cut to the crew
     holding that currency — otherwise the missing names look like a bug */
  const base=String(ARM.key).replace(/\.\+$/,'');
  const r=slotRules(base);
  const note=r.sc?`<span class="scnote">${r.sc==='day'?'SC DAY':'SC NIGHT'} current only`
      +(r.scStart!=null&&r.scEnd!=null?` · shift ${hm24(r.scStart)}–${hm24(r.scEnd)}`:'')+`</span>`:'';
  /* the line as it is NOW, read at every paint: a callsign or mission typed after the seat was picked shows at once
     ([ARM-STRIP-STALE-TITLE] — the title stored when it was picked went stale); the stored one only if the place is gone */
  const title=slotTitle(base)||ARM.title;
  return `<div class="ros-arm"><span>Planning <b>${title}</b>${note}</span>`
    +`<button class="x" data-disarm="1" title="Cancel">✕</button></div>`;
}
/* the shared body of both palettes */
/* ONE PAINT READS EACH DAY'S INPUTS ONCE (engine/inputs.ts inputReadPass; Fable's read of the one-rule plan, F10): the
   list asks why each man may or may not take the armed place — four reads of a day's inputs a man (avail.ts slotBar) —
   and the builder writes nothing, which is the shape a pass requires. */
export function paletteHTML(di:any,opts?:any){ return inputReadPass(()=>paletteHTMLBody(di,opts)); }
function paletteHTMLBody(di:any,opts?:any){
  const o=opts||{}, d=DAYS[di]||{};
  /* the armed key AS ARMED — a "+ add" keeps its `.+`, which slotBar reads as a NEW place (its one-man-one-place-on-a-
     row check, [CROWD-SWAP-SAYS-BUSY] W3's walk: a man already in the crowd struck from its own "+ add"); slotRules
     strips the `.+` itself, and nothing else here reads more than whether a slot is armed */
  const armKey=ARM?String(ARM.key):'';
  /* a man only standing by is not "tasked" in this list (owner D1120) — dayEngaged asked to leave standby rows out */
  const eng0=d.dow?dayEngaged(d,true):new Set(), off=d.dow?dayOff(d):new Set();
  const sby0=d.dow?dayStandby(d):new Map();
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
  const eng=armKey?new Set():eng0, sby=armKey?new Map():sby0;
  const ok=(id:any)=>!PEOPLE[id].archived&&(!scArm||scQualOK(id,arules.sc));
  /* rank 2 = cannot be planned here, 1 = tasked but plannable, 0 = free. The
     off set (leave / downchit) is drawn struck-through but used to be ranked 0,
     so the column header counted men on leave among the "N free" and sorted them
     to the top alongside genuinely available crew. */
  /* rank 2 is "cannot be planned here", which is what draws the strike-through
     and drops him out of the "N free" count. A grounded-only man (ATT B) is
     rank 1 — tasked-but-plannable — for the same reason rosterPuck no longer
     strikes him: he is unavailable for a jet, not for the day. */
  /* .5 = grounded but otherwise free (D1118): drawn in full colour, sorted straight after the free men, and still out
     of "N free" — the count is of men who can fly */
  const rank=(id:any)=>(armKey?(slotBar(id,armKey,arules)?2:0)
                       :((off&&off.has(id))?(groundedOnly(id,di)?(eng.has(id)?1:.5):2):0))||(eng.has(id)?1:0);
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
/* THE PLACEHOLDER ROW SAYS THE REFUSAL BEFORE THE TAP (D33; [OIL-SEATS-CAN-EARN]
   step 2). The owner's rule (13 Aug 26) is that the scheduler sees the problem
   BEFORE he plants, never by planting — and with a cockpit armed these two pucks
   are the one thing on this page that cannot go where he is aiming. So they are
   struck out and the reason is PRINTED, exactly as a barred name is, because a
   phone has no hover to carry a title.
   It reads ARM itself rather than taking the key as a parameter, the way
   armStripHTML beside it does: the function is exported and called directly by
   board-html and the tests, and a second signature is a second thing to keep in
   step. */
export function specialRowHTML(di:any){
  if(!SPECIALS.length)return '';
  const armKey=ARM?String(ARM.key):'';   // as armed — see paletteHTML
  return `<div class="rall"><div class="rh2">Placeholders</div>`
    +SPECIALS.map((id:any)=>{
      const why=armKey?slotBar(id,armKey):'';
      return `<span class="rpuck${why?' no haswhy':''}" data-drag="1" data-person="${id}"`
        +(why?` data-why="${esc(why)}"`:'')
        +` title="${esc(why?`${PEOPLE[id].cs} — ${why}`:`${PEOPLE[id].cs} — a placeholder, never validated`)}"`
        +`>${puck(id,null,true,null)}${why?`<span class="rwhy">${esc(why)}</span>`:''}</span>`;
    }).join('')
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
   is a standalone exported function (palette.test.ts calls it directly), and arules already carries everything ok() needs. */
export function sansAvailHTML(di:any,armKey:any,eng:any,off:any,sby:any,arules:any){
  const scArm=!!(arules&&arules.sc);
  const ok=(id:any)=>!PEOPLE[id].archived&&(!scArm||scQualOK(id,arules.sc));
  /* ORDERED AS THE PILOTS AND WSOs ARE, AND COUNTED (owner D1119, 21 Oct 26 — round 2 of the look, "yes to both"):
     free first, then grounded-but-free, then tasked, then crossed out, callsign order within each; the heading counts
     the free men as the columns' do. Each man's rank is read from the same reason his puck prints (whyOf). */
  const rk=(id:any)=>{const g=!armKey&&!!(off&&off.has(id))&&groundedOnly(id,di);
    if(whyOf(id,di,armKey,off,arules,g))return 2;
    const t=!!(eng&&eng.has(id));return g?(t?1:.5):(t?1:0);};
  const ids=Object.keys(PEOPLE).filter((id:any)=>ok(id)&&PEOPLE[id].san)
    .map((id:any)=>[id,rk(id)] as [any,number])
    .sort((a:any,b:any)=>a[1]-b[1]||PEOPLE[a[0]].cs.localeCompare(PEOPLE[b[0]].cs));
  if(!ids.length)return '';
  const free=ids.filter(([,r])=>!r).length;
  const d=DAYS[di]||{};
  /* each row prints its OWN reason (rosterPuck's hideWhy left off, unlike
     col()'s colWhy dedup) — a shared reason only makes sense where a whole
     column is barred for one structural cause (e.g. every WSO); here eleven
     different people can each be barred for a different SANS record, or none
     at all, and folding those into one line would just be wrong. */
  return `<div class="rall rsans"><div class="rh2">SANS Avail · ${free} free</div>`
    +ids.map(([id]:any)=>{
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
