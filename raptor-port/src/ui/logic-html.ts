/* The Logic tab's rule book — lgRules verbatim. Every value is read out
   of the live engine objects at render time, so the page cannot drift. */
import { VCONF, SHIFT_HARD, kindOff, ruleFmt } from '../engine/rules'
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
      c==='C'||c==='CR'||c==='Q'||c==='NB'||c==='SB'||c==='CPH'?'#F0555F;color:#fff':
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
     t:()=>`The <b>flight brief</b> is the time in the line's <b>B</b> box. Where a line has none, this setting suggests one — ${lgV(lgT(VCONF.briefLead))} before take-off — and the scheduler accepts it or types their own.<span class="why">This number is a convenience, not a rule: it only works out the suggestion so nobody has to do the arithmetic. What every brief warning actually follows is the B on the line. A line left blank is still checked, against that same suggested time, so an unconfirmed line never goes silently unchecked. A published in-time moves the man's <b>report</b> time, and so his working day and his crew rest; it does not move the brief.</span>`},
    {sev:'set',set:['reportLead'],src:()=>`VCONF.reportLead ${VCONF.reportLead}`,
     t:()=>`The <b>nominal report</b> to the squadron is ${lgV(lgT(VCONF.reportLead))} before take-off.`},
    {sev:'set',set:['showLead'],src:()=>`VCONF.showLead ${VCONF.showLead}`,
     t:()=>`The <b>latest show</b> is ${lgV(lgT(VCONF.showLead))} before take-off — the line that decides how a crew-rest breach is DRAWN.<span class="why">A remark such as "2A: LATE SHOW" or "SHOW AT BRIEF" does not excuse crew rest and does not remove the warning: the breach is still red and still counted, because the reader has to see that rest was broken. What the remark changes is the ring. While the man still clears rest by the latest show, his puck rings <b>dashed</b> — a scheduler sanctioned this and he does make the jet. Once rest runs past the latest show the ring goes <b>solid</b> again: there is nothing to sanction, because he cannot walk, kit up and start engines in less than this. He is not late to the brief, he is unable to make the flight.</span>`},
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
    {sev:'adv',code:'DT_SUM',
     t:()=>`<b>Double turning</b> — <b>two or more sorties in one day</b> — raises one Advisory line at the head of the day naming everyone who is on it, matching the amber DT pucks. Double turning is routine and planned, not an error.<span class="why">There is no span test: a man on two sorties is double turning whether they are back to back or a whole day apart. How tight the gap is belongs to the tight-turn rule.</span>`},
    {sev:'note',code:'LONGDAY',set:['longDay'],src:()=>`VCONF.longDay ${VCONF.longDay}`,
     t:()=>`More than ${lgV(lgT(VCONF.longDay))} on the books, first commitment to last, is a <b>long work day</b> — a grey note, not a warning.`},
    {sev:'hard',code:'DAYS_RUN',set:['maxRun'],src:()=>`VCONF.maxRun ${VCONF.maxRun}`,
     t:()=>`Nobody may be on the programme more than <span class="val">${VCONF.maxRun}</span> days in a row — a <b>break day</b> is due. The Warning lands on the day that breaks the limit, which is the day to clear.<span class="why">Every kind of tasking counts: a flight, a duty post, a sim, a ground item, a programme row. Leave and downchits are not tasking, so a day off resets the count.</span>`},
   ]},

  {g:'Briefs and debriefs',
   sub:'A man can be free at take-off and still have no time to prepare.',
   rows:[
    {sev:'adv',code:'NO_BRIEF',
     t:()=>`Anything sitting between the <b>brief time and take-off</b> means there is no time for the flight brief — an Advisory: the clash itself already carries the Warning; the eaten brief window is the advice on top of it.<span class="why">An event that finishes at or before the brief time is fine — a stand-down 08:30–09:00 against a 10:20 brief is no issue.</span>`},
    {sev:'adv',code:'DEBRIEF',
     t:()=>`Anything inside <b>landing + ${lgT(VCONF.debrief)}</b> costs the flight debrief. Bad, but not unflyable — an Advisory.`},
    {sev:'adv',code:'SIM_BRIEF',set:['epBrief'],src:()=>`VCONF.epBrief ${VCONF.epBrief}`,
     t:()=>`An EP profile on the OFT briefs ${lgV(lgT(VCONF.epBrief))} before the box — unless its remarks name a lead (<b>BRIEF 30 PRIOR</b>, <b>30 mins prior</b>), which wins for that line; the AMT carries its <b>own BRIEF row</b>, and that row's time is the hard line.`},
    {sev:'adv',code:'SIM_DEBRIEF',set:['simDebrief','amtDebrief'],src:()=>`VCONF.simDebrief ${VCONF.simDebrief} · VCONF.amtDebrief ${VCONF.amtDebrief}`,
     t:()=>`A sim debriefs for ${lgV(lgT(VCONF.simDebrief))} after the box, the AMT for ${lgV(lgT(VCONF.amtDebrief))} after its DEBRIEF row.`},
   ]},

  {g:'Qualification and currency',
   rows:[
    {sev:'hard',code:'QUAL',
     t:()=>`<b>Seat rules.</b> A WSO cannot fly the front seat. Only an instructor pilot — <b>IP, IR or FI</b> — may fly the rear seat; <b>IW</b> is a WSO-only category and sits RCP only. A pilot <b>FI</b> follows the IP rules, a WSO FI the IW rules. The same rules apply to the front and rear seats of a sim.`},
    {sev:'hard',code:'ILLEGAL_CREW',
     t:()=>`<b>The combination matrix</b> (F-15SG Table 1.5-2). An <b>OCU pilot</b> may not fly with a <b>CAT A–D WSO</b>, and an <b>OCU WSO</b> may not fly with a <b>CAT A–D pilot</b> — not authorised combinations, a Warning.<span class="why">An instructor in either seat clears the matrix: an instructor pilot (IP / IR / FI) flies with anyone, an instructor WSO with any front seat.</span>`},
    {sev:'adv',code:'CREW_SOLO',
     t:()=>`<b>OCU pilot with OCU WSO</b> is a <b>crew solo</b> — only allowed for sorties designated under the F-15SG Basic Course Syllabus. An Advisory.`},
    {sev:'adv',code:'CO_APPROVAL',
     t:()=>`<b>D+C, C+D and D+D</b> (pilot + WSO) require <b>CO approval</b>. An Advisory.`},
    {sev:'adv',code:'OCU_NO_IP',
     t:()=>`An <b>OCU formation with no instructor</b> (IW / IP / IR / FI) in it raises an Advisory.`},
    {sev:'hard',code:'NO_IR',
     t:()=>`An <b>IRT</b> — an instrument rating test — needs an <b>IR</b> (instrument rating examiner) in the crew. IRT in a formation's <b>mission</b> wants an IR anywhere in that formation; IRT in one aircraft's <b>remarks</b> wants the IR in that aircraft.`},
    {sev:'hard',code:'AAR_QUAL',
     t:()=>`Air-to-air refuelling currency is read <b>straight off the remarks</b>. A bare <b>AAR</b> is night if the wave is a night wave or the sortie runs past 19:00, otherwise day.<span class="why">An <b>A:</b> tag means the front seat; a <b>B:</b> tag is ignored entirely — a WSO holds no AAR currency. <b>NO AAR / NO DAAR / NO NAAR</b> ask for nothing. Only the front seat is checked.</span>`},
    {sev:'hard',code:'AAR_INSTR',
     t:()=>`A pilot who is <b>not</b> current may still fly a refuelling sortie as <b>training</b> — but only with someone cleared to <b>instruct</b> that AAR in the back seat. If the man behind him is an instructor pilot without the mark, the line is flagged on <b>him</b>.<span class="why">Being IP / IR / FI is not enough on its own: instructing AAR from the rear cockpit is a separate sign-off, recorded on the Quals page as an <b>I</b> in place of the tick on DAAR or NAAR. When the back seat holds the right mark for what the remarks ask, the front seat's own currency warning is <b>cleared</b> — a supervised training sortie is legal and should not read as a fault. With the back seat empty, holding a WSO, or holding a pilot who is not an instructor, nobody aboard can supervise and the front-seat warning stands instead.</span>`},
    {sev:'hard',code:'SC_QUAL',set:['scDayFrom','scDayTo'],
     src:()=>`VCONF.scDayFrom ${hhmm(VCONF.scDayFrom)} · VCONF.scDayTo ${hhmm(VCONF.scDayTo)}`,
     t:()=>`<b>SC DAY</b> covers a shift sitting wholly inside ${lgV(hhmm(VCONF.scDayFrom))}–${lgV(hhmm(VCONF.scDayTo))}. Anything reaching outside it needs <b>SC NIGHT</b>. A spare is checked for currency exactly like a main.`},
    {sev:'set',src:()=>`q.naar&&!q.daar · q.naar==='I'&&q.daar!=='I' · q.scNight&&!q.scDay`,
     t:()=>`Night currency is signed off <b>after</b> day currency, never before: <b>NAAR</b> cannot be held without DAAR, and <b>SC NIGHT</b> cannot be held without SC DAY. Removing the day one removes the night one with it. The <b>instructor mark</b> follows the same order one rung up — the NAAR <b>I</b> needs the DAAR <b>I</b> — but withdrawing the day mark only <b>demotes</b> the night one back to a plain tick: he is still night current, he is simply no longer cleared to teach it.`},
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
     t:()=>`Any other input the validator can see — a Detachment, or a personal input a scheduler has actioned to Unavailable — clashing with a sortie, a sim, a duty or a ground slot. Un-actioned personal inputs are requests and raise nothing.`},
    /* no `code`: this is a MARK, not a validator code — giving it one would
       put it in the fired-rules lookup and imply the engine emits it. */
    {sev:'note',set:['inputLead'],src:()=>`VCONF.inputLead ${VCONF.inputLead}`,
     t:()=>`A member's input is due <b>${lgV(ruleFmt('inputLead',VCONF.inputLead))}</b> before the week starts. One last changed after that deadline is marked <b>LATE</b> wherever it appears — the week, the board, the Inputs page, and the view-only programme.<span class="why">The deadline is the week's Monday minus this setting, and the deadline day itself is still on time: at ${esc(ruleFmt('inputLead',VCONF.inputLead))} an input for the week of Mon 17 Aug is due by Mon 3 Aug, and one touched on the 4th is late. What is measured is the <b>last change</b>, not the first submission, so an input raised early and then amended after the deadline still reads late — the deadline exists so the week can be planned against something that has stopped moving. This is a <b>mark only</b>: it raises no warning, closes no slot and changes nothing the validator sees. <b>Downchits are exempt</b> — going DNIF is not a decision a man makes in advance, and marking the one input type that is always last-minute would only teach everyone to ignore the mark. Leave and detachments are <b>not</b> exempt: those are applied for, and applying late is the thing this is about.</span>`},
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
