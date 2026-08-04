/* The Logic tab's rule book — lgRules verbatim. Every value is read out
   of the live engine objects at render time, so the page cannot drift. */
import { VCONF, SHIFT_HARD, kindOff } from '../engine/rules'
import { RANK, CHIP_LABEL, WCODE, chipText, wlbl } from '../engine/validate'
import { LEAVE_TYPES, isLocalLeave, isLeave, isDownchit } from '../engine/inputs'
import { lgT, hm24, hhmm } from '../engine/time'
import { SC_DAY_FROM, SC_DAY_TO } from '../engine/rules'
import { esc } from '../state/view'
import { lgCanEdit } from '../state/auth'

export const LG_TIER:any={hard:'Warning',adv:'Advisory',note:'Note',set:'Setting'};
export const lgV=(v:any)=>`<span class="val">${esc(String(v))}</span>`;
export function lgRules(){
  const SH=Object.keys(SHIFT_HARD).filter((k:any)=>SHIFT_HARD[k]);
  /* every event kind the engine actually produces — 'other' is the push() default
     and no call site uses it, so it is deliberately not listed */
  const KIND:any={fly:'a flight',sim:'a sim',duty:'a duty post',shift:'another shift',
    ground:'a ground event',prog:'a programme item'};
  const chipRow=()=>`<span class="lgchips">`+Object.keys(RANK).sort((a:any,b:any)=>RANK[b]-RANK[a])
    .map((c:any)=>`<span class="lgc"><i style="background:${
      c==='C'||c==='CR'||c==='Q'||c==='NB'||c==='SB'?'#F0555F;color:#fff':
      c==='LD'?'#8A96A3;color:#0B0D10':'#E5A83B'}">${esc(chipText(c))}</i>${esc(wlbl(CHIP_LABEL[c]||c))}</span>`).join('')+`</span>`;
  const matrix=()=>`<span class="lgmatrix">`+Object.keys(KIND).map((k:any)=>{
    const hard=!!SHIFT_HARD[k], off=kindOff(k);
    const body=lgCanEdit()
      ? `<label class="lgtog"><input type="checkbox" data-lgkind="${k}"${hard?' checked':''}>`
        +`${hard?'Warning':'Advisory'}</label>`
      : `<span>${hard?'Warning — he cannot be in two places':'Advisory — you can still give him academics'}</span>`;
    return `<span class="lgcell ${hard?'hard':'adv'}"><span class="k">${esc(KIND[k])}</span>`
      +body+(off?`<span class="lgmod">changed</span>`:'')+`</span>`;}).join('')+`</span>`;
  const leaves=()=>`<span class="lgmatrix">`+Object.keys(LEAVE_TYPES).map((k:any)=>
    `<span class="lgcell ${isLocalLeave(k)?'adv':'hard'}"><span class="k">${esc(k)}</span>`
    +`<span>${esc(LEAVE_TYPES[k])} — ${isLocalLeave(k)?'may still stand an SC SPARE':'cannot be planned at all'}</span></span>`).join('')+`</span>`;

  return [
  {g:'How a day is measured',
   sub:'Before any rule can fire, the engine has to decide how much of the day each commitment actually occupies.',
   rows:[
    {sev:'set',set:['step','dekit'],src:()=>`VCONF.step ${VCONF.step} · VCONF.dekit ${VCONF.dekit}`,
     t:()=>`A sortie occupies the schedule from <b>step</b>, ${lgV(lgT(VCONF.step))} before take-off, to <b>dekit</b>, ${lgV(lgT(VCONF.dekit))} after landing — not just take-off to landing.`},
    {sev:'set',set:['briefLead'],src:()=>`VCONF.briefLead ${VCONF.briefLead}`,
     t:()=>`The <b>flight brief</b> starts ${lgV(lgT(VCONF.briefLead))} before take-off — always, whatever the wave publishes.<span class="why">A published in-time moves the man's <b>report</b> time, and so his working day and his crew rest. It does not move the brief: the brief is a briefing-room event pinned to take-off.</span>`},
    {sev:'set',set:['reportLead'],src:()=>`VCONF.reportLead ${VCONF.reportLead}`,
     t:()=>`The <b>nominal report</b> to the squadron is ${lgV(lgT(VCONF.reportLead))} before take-off.`},
    {sev:'set',set:['debrief'],src:()=>`VCONF.debrief ${VCONF.debrief}`,
     t:()=>`The <b>flight debrief</b> runs for ${lgV(lgT(VCONF.debrief))} after landing.`},
    {sev:'set',set:['minTurn','dur'],src:()=>`VCONF.minTurn ${VCONF.minTurn} · VCONF.dur ${VCONF.dur}`,
     t:()=>`<b>Not currently used:</b> <span class="val">minTurn</span> and <span class="val">dur</span> are carried in the settings but no rule reads them.<span class="why">Listed so the page accounts for every setting in the engine, used or not.</span>`},
    {sev:'set',set:['openEnd'],src:()=>`VCONF.openEnd ${VCONF.openEnd}`,
     t:()=>`A row with a start time and <b>no end time</b> is assumed to run ${lgV(lgT(VCONF.openEnd))}.<span class="why">Without this an open-ended meeting sitting on top of a take-off went completely unflagged.</span>`},
    {sev:'set',src:()=>`collectEvents · shiftLine`,
     t:()=>`A <b>standby shift</b> (SC, AVALON, BB) occupies <b>exactly the hours written on the line</b> — no step, no dekit, no brief, no debrief tail.<span class="why">It is a shift, not a sortie. Padding it like a jet used to make SC AM 07–13 and SC PM 13–19 overlap by fifty minutes and report two clean shifts as one fifteen-hour day.</span>`},
    {sev:'set',src:()=>`win() · e<st → e+=1440`,
     t:()=>`Anything whose end reads <b>earlier than its start</b> has crossed midnight, and is rolled into the next day.<span class="why">Left as written, the interval is inverted and can never overlap anything — which silently switches every check off for that row.</span>`},
   ]},

  {g:'Two things at once',
   sub:'The commonest question the board answers: is this person already busy?',
   rows:[
    {sev:'set',src:()=>`const overlap=(a1:any,a2:any,b1:any,b2:any)=>a1<b2&&b1<a2`,
     t:()=>`Two windows overlap only if one <b>starts before the other ends</b>. Touching end-to-end is <b>not</b> an overlap.<span class="why">This is deliberate, and it is what makes SC AM 07:00–13:00 and SC PM 13:00–19:00 read as two clean shifts rather than a clash.</span>`},
    {sev:'hard',code:'DOUBLE_BOOK',
     t:()=>`Two commitments at the same time for one person is a <b>Warning</b> — he cannot be in two places.<span class="why">Sortie against sortie is excluded here: that is the tight-turn rule's business, not this one.</span>`},
    {sev:'adv',code:'SHIFT_SOFT',extra:matrix,kinds:true,
     t:()=>`A man on an <b>SC MAIN</b> shift is graded by what he runs into — ${SH.length} kinds are hard, the rest are advisory:`},
    {sev:'set',src:()=>`isPersonal / isUnavail`,
     t:()=>`Every personal input is a <b>real commitment</b>, <b>“Fly”</b> included — it clashes with a sortie and eats brief/debrief time exactly like an appointment.<span class="why">There used to be an “offer” exemption for “Available fly”, “Available duty” and “Fly”. Those first two types are gone, and a man who says he is flying elsewhere is not available for this sortie.</span>`},
   ]},

  {g:'Crew rest',
   sub:'The rule the squadron cares about most, and the one with the most edge cases.',
   rows:[
    {sev:'hard',code:'CREW_REST',set:['crewRest'],src:()=>`VCONF.crewRest ${VCONF.crewRest}`,
     t:()=>`Aircrew must have ${lgV(lgT(VCONF.crewRest))} clear before they are <b>told to report</b>. Less than that is a Warning.<span class="why">Exactly ${lgT(VCONF.crewRest)} is legal — the bar is strictly greater-than.</span>`},
    {sev:'adv',code:'CREW_TIGHT',
     t:()=>`If the <b>nominal</b> ${lgT(VCONF.reportLead)} report falls inside the rest window but the instructed report does not, that is an <b>Advisory</b>, not a breach.`},
    {sev:'set',src:()=>`prevFlyEnd → REST[di]`,
     t:()=>`Rest is measured off the last <b>rest-bearing</b> commitment — a sortie or a shift — <b>not</b> off a late desk duty.<span class="why">A sortie ends for rest purposes at landing + the debrief; a shift ends at its LD, with no tail added.</span>`},
    {sev:'set',src:()=>`nomOf · insOf`,
     t:()=>`A shift's <b>own start time is its report time</b>: no ${lgT(VCONF.reportLead)} lead and no brief lead come off it.`},
    {sev:'set',src:()=>`saExempt · scSpare`,
     t:()=>`An <b>SC SPARE</b> carries no crew rest in either direction — standing spare buys none for the next day, and it never closes a spare slot to anyone.`},
   ]},

  {g:'Turning and the length of the day',
   rows:[
    {sev:'adv',code:'TURN',set:['tightTurn'],src:()=>`VCONF.tightTurn ${VCONF.tightTurn}`,
     t:()=>`Landing to the next take-off needs the <b>tight turn threshold</b>, ${lgV(lgT(VCONF.tightTurn))}, or the time the ground actually takes — ${lgV(lgT(VCONF.dekit))} dekit plus ${lgV(lgT(VCONF.step))} step — whichever is longer. Right now that is ${lgV(lgT(Math.max(VCONF.tightTurn,VCONF.dekit+VCONF.step)))}. Less is a tight turn.`},
    {sev:'hard',code:'DT_SUM',
     t:()=>`<b>Double turning</b> — <b>two or more sorties in one day</b> — raises one Warning line at the head of the day naming everyone who is on it. The individual pucks stay amber; the day's summary is the red one.<span class="why">There is no span test: a man on two sorties is double turning whether they are back to back or a whole day apart. How tight the gap is belongs to the tight-turn rule.</span>`},
    {sev:'note',code:'LONGDAY',set:['longDay'],src:()=>`VCONF.longDay ${VCONF.longDay}`,
     t:()=>`More than ${lgV(lgT(VCONF.longDay))} on the books, first commitment to last, is a <b>long work day</b> — a grey note, not a warning.`},
   ]},

  {g:'Briefs and debriefs',
   sub:'A man can be free at take-off and still have no time to prepare.',
   rows:[
    {sev:'hard',code:'NO_BRIEF',
     t:()=>`Anything sitting between the <b>brief time and take-off</b> means there is no time for the flight brief.<span class="why">An event that finishes at or before the brief time is fine — a stand-down 08:30–09:00 against a 10:20 brief is no issue.</span>`},
    {sev:'adv',code:'DEBRIEF',
     t:()=>`Anything inside <b>landing + ${lgT(VCONF.debrief)}</b> costs the flight debrief. Bad, but not unflyable — an Advisory.`},
    {sev:'hard',code:'SIM_BRIEF',set:['epBrief'],src:()=>`VCONF.epBrief ${VCONF.epBrief}`,
     t:()=>`An EP profile on the OFT briefs ${lgV(lgT(VCONF.epBrief))} before the box; the AMT carries its <b>own BRIEF row</b>, and that row's time is the hard line.`},
    {sev:'adv',code:'SIM_DEBRIEF',set:['simDebrief','amtDebrief'],src:()=>`VCONF.simDebrief ${VCONF.simDebrief} · VCONF.amtDebrief ${VCONF.amtDebrief}`,
     t:()=>`A sim debriefs for ${lgV(lgT(VCONF.simDebrief))} after the box, the AMT for ${lgV(lgT(VCONF.amtDebrief))} after its DEBRIEF row.`},
   ]},

  {g:'Qualification and currency',
   rows:[
    {sev:'hard',code:'QUAL',
     t:()=>`<b>Seat rules.</b> A WSO cannot fly the front seat. Only an <b>IP</b> may fly the rear seat. The same two rules apply to the front and rear seats of a sim.`},
    {sev:'hard',code:'ILLEGAL_CREW',
     t:()=>`<b>Two OCU in one aircraft</b> is an illegal crew.`},
    {sev:'adv',code:'OCU_NO_IP',
     t:()=>`An <b>OCU formation with no IP</b> in it raises an Advisory.`},
    {sev:'hard',code:'AAR_QUAL',
     t:()=>`Air-to-air refuelling currency is read <b>straight off the remarks</b>. A bare <b>AAR</b> is night if the wave is a night wave or the sortie runs past 19:00, otherwise day.<span class="why">An <b>A:</b> tag means the front seat; a <b>B:</b> tag is ignored entirely — a WSO holds no AAR currency. <b>NO AAR / NO DAAR / NO NAAR</b> ask for nothing. Only the front seat is checked.</span>`},
    {sev:'hard',code:'SC_QUAL',set:['scDayFrom','scDayTo'],
     src:()=>`VCONF.scDayFrom ${hhmm(VCONF.scDayFrom)} · VCONF.scDayTo ${hhmm(VCONF.scDayTo)}`,
     t:()=>`<b>SC DAY</b> covers a shift sitting wholly inside ${lgV(hhmm(VCONF.scDayFrom))}–${lgV(hhmm(VCONF.scDayTo))}. Anything reaching outside it needs <b>SC NIGHT</b>. A spare is checked for currency exactly like a main.`},
    {sev:'set',src:()=>`q.naar&&!q.daar · q.scNight&&!q.scDay`,
     t:()=>`Night currency is signed off <b>after</b> day currency, never before: <b>NAAR</b> cannot be held without DAAR, and <b>SC NIGHT</b> cannot be held without SC DAY. Removing the day one removes the night one with it.`},
   ]},

  {g:'Leave, downchit and personal inputs',
   rows:[
    {sev:'set',extra:leaves,src:()=>`LEAVE_TYPES`,
     t:()=>`Leave is booked as one of ${lgV(Object.keys(LEAVE_TYPES).length)} things. All of them close a man to flying, sims, duties and ground slots:`},
    {sev:'hard',code:'LEAVE_FLY',
     t:()=>`On leave but planned to fly, sit a sim, stand a duty or take a ground slot — a Warning, and the <b>reason</b> is printed with it.`},
    {sev:'hard',code:'DNIF_FLY',
     t:()=>`On a <b>downchit</b> and planned anyway — a Warning. A downchit closes everything, including an SC spare.`},
    {sev:'hard',code:'INPUT_FLY',
     t:()=>`Any other personal input — an appointment, a meeting — clashing with a sortie.`},
    {sev:'set',src:()=>`isLocalLeave · sparePost`,
     t:()=>`<b>LL and OIL keep the man on the island</b>, so he may still be raised as an <b>SC SPARE</b> — standby is not a task, and it raises no flag. <b>OL and a downchit cannot</b>, and putting one of them on a spare line is a Warning.<span class="why">Standing spare means being reachable and fit to walk. Overseas he is neither; downchecked he is not fit. This is the one thing that IS checked on a spare line besides currency.</span>`},
   ]},

  {g:'The standby lines',
   sub:'SC, AVALON and BB sit outside the day’s flying count — and mostly outside the engine.',
   rows:[
    {sev:'set',src:()=>`saExempt · isStandalone`,
     t:()=>`An <b>SC MAIN</b> line is fully cross-checked, at the hours written on it.`},
    {sev:'set',src:()=>`scSpare`,
     t:()=>`An <b>SC SPARE</b> is standing by, not tasked: he is checked for <b>currency</b>, and for being <b>able to stand it at all</b> — nothing else. He may fly, sit a sim or stand a duty in the same hours, and none of it raises anything; but an overseas leave or a downchit across the shift does.`},
    {sev:'set',src:()=>`w.noconf`,
     t:()=>`<b>AVALON</b> and <b>BB</b> are wholly exempt — nothing on those lines is cross-checked at all.`},
    {sev:'set',src:()=>`slotBar · dayEvents`,
     t:()=>`When an SC slot is armed, the crew picker judges each name against <b>that shift's own window</b>, not the whole day — so a man on SC AM is offered normally for SC PM.`},
   ]},

  {g:'What the puck shows',
   sub:'One puck can carry several problems at once. It prints the most serious.',
   rows:[
    {sev:'set',extra:chipRow,src:()=>`RANK`,
     t:()=>`Flag priority, most serious first:`},
    {sev:'set',src:()=>`cls.push('boxred')`,
     t:()=>`A <b>red box</b> round the whole puck marks a conflict, a crew-rest breach, a qualification problem or a missed brief. The amber flags do not draw one.`},
    {sev:'set',src:()=>`markRing · SEVR`,
     t:()=>`The ring round a puck takes the <b>most serious</b> tier that person carries that day: red beats amber beats grey.`},
   ]},

  {g:'Publishing and amendments',
   rows:[
    {sev:'set',src:()=>`daySigned · signMissing`,
     t:()=>`A day needs all four sign-offs — <b>CUR CK, SKED CK, PLANNED BY, APPROVED BY</b> — before it can be published. Only crew holding the <b>Scheduler</b> qualification appear in the last three.`},
    {sev:'set',src:()=>`signClear(di)`,
     t:()=>`Publishing a day <b>spends its signatures</b>. The next amendment on that day is signed for on its own merits.`},
    {sev:'set',src:()=>`publishALDay · alIssue`,
     t:()=>`An <b>AL</b> is published from the day it belongs to, and takes <b>only that day's</b> unpublished edits. Other days keep theirs.`},
    {sev:'set',src:()=>`publishableKeys`,
     t:()=>`Only edits on a <b>published</b> day can go out as an amendment — an AL never claims to amend something that was never issued.`},
   ]},
  ];
}
