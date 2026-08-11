import { DAYS } from './data'
import { INPUTS, inputCoversDate, isAway, awayAllDay, canSpare, canWork, offWord } from './inputs'
import { PEOPLE, isSpecial, nameToId, aarNeed, aarOK, scShiftKind, scQualOK, isInstrPilot } from './people'
import { parseHM, win, overlap, hm24 } from './time'
import { SHIFT_HARD, VCONF } from './rules'
import { isStandalone, scSpare } from './waves'
import { WARN, restClear, dayEvents } from './validate'
import { waveWindows } from './events'
import { whoArr, rowRef, XKEY } from './slots'
import { keyDay } from './keys'
/* busy windows [s,e] for one person on a day (fly/duty/sim/ground) */
export function personBusy(d:any,id:any){
  const out:any[]=[];
  if(isSpecial(id))return out;                                  // sentinel never occupies anyone's time
  /* one push, so midnight-crossing and open-ended rows are handled the same way
     everywhere: an overnight duty used to come out inverted and read as FREE */
  const add=(st:any,en:any,dflt?:any)=>{const w2=win(st,en,dflt); if(w2)out.push(w2);};
  const has=(r:any,who?:any)=>who===id||((r&&r.more)||[]).includes(id);
  (d.waves||[]).forEach((w:any)=>w.formations.forEach((f:any)=>{ if(f.cx)return; f.aircraft.forEach((a:any)=>{
    if(a.cx)return;
    if(a.p===id||a.w===id){const to=parseHM(f.to); let ld=parseHM(f.ld);
      /* the step and dekit pads are VCONF's, not literals: both are editable on
         the Logic tab (0–240), and slotRules/events.ts/validate.ts all read them
         from there. Hardcoding 60/30 here matched only at the defaults, so
         raising either rule left this strip offering a man the validator already
         considered occupied. */
      if(to!=null&&ld!=null){if(ld<to)ld+=1440; out.push([to-VCONF.step,ld+VCONF.dekit]);}}});}));
  /* both sim devices count, and a row's pax list counts as much as its p/w seats —
     an AMT box session with 8 aircrew makes all 8 of them busy for that window. */
  const sm=d.sims||{}; ['amt','oft'].forEach((k:any)=>(sm[k]||[]).forEach((o:any)=>{ if(o.cx)return;
    if(o.p===id||o.w===id||nameToId(o.who)===id||(o.pax||[]).includes(id)||has(o))
      add(parseHM(o.str),parseHM(o.end),90); }));
  (d.dutywaves||[]).forEach((dw:any)=>dw.rows.forEach((r:any)=>{ if(r.cx)return; if(has(r,r.id))add(parseHM(r.str),parseHM(r.end)); }));
  (d.ground||[]).forEach((g:any)=>{ if(g.cx)return; if(has(g,nameToId(g.who)))add(parseHM(g.str),parseHM(g.end)); });
  (d.allhands||[]).forEach((x:any)=>{ if(x.cx)return;
    if(whoArr(x).some((nm:any)=>nameToId(nm)===id)||has(x))add(parseHM(x.str),parseHM(x.end)); });
  return out;
}
/* engaged = tasked anywhere that day; off = leave/DNIF that day */
export function dayStandby(d:any){const s=new Set();
  (d.waves||[]).forEach((w:any)=>(w.formations||[]).forEach((f:any)=>{if(f.cx)return;
    (f.aircraft||[]).forEach((a:any)=>{if(a.cx||!scSpare(w,f,a))return;
      [a.p,a.w].forEach((id:any)=>{if(id&&PEOPLE[id]&&!PEOPLE[id].special)s.add(id);});});}));
  return s;}
export function dayEngaged(d:any){const s=new Set(),add=(id:any)=>{if(id&&PEOPLE[id]&&!PEOPLE[id].special)s.add(id);};
  /* an SC SPARE is deliberately NOT counted as tasked: he is standing by and may
     be planned for anything else, so he must read as free in the palette. */
  (d.waves||[]).forEach((w:any)=>w.formations.forEach((f:any)=>{if(f.cx)return;f.aircraft.forEach((a:any)=>{
    if(a.cx||scSpare(w,f,a))return;add(a.p);add(a.w);});}));
  const sm=d.sims||{}; ['amt','oft'].forEach((k:any)=>(sm[k]||[]).forEach((o:any)=>{if(o.cx)return;add(o.p);add(o.w);add(nameToId(o.who));(o.pax||[]).forEach(add);}));
  /* the extras dropped under a row are tasked exactly as much as the person in
     its primary seat — they used to be counted as free all day */
  const more=(r:any)=>((r&&r.more)||[]).forEach(add);
  (d.dutywaves||[]).forEach((dw:any)=>dw.rows.forEach((r:any)=>{if(!r.cx){add(r.id);more(r);}}));
  (d.ground||[]).forEach((g:any)=>{if(!g.cx){add(nameToId(g.who));more(g);}});
  (d.allhands||[]).forEach((x:any)=>{if(x.cx)return;(Array.isArray(x.who)?x.who:(x.who?[x.who]:[])).forEach((w:any)=>add(nameToId(w)));more(x);});
  ['amt','oft'].forEach((k:any)=>((d.sims||{})[k]||[]).forEach((o:any)=>{if(!o.cx)more(o);}));
  return s;}
/* AWAY, split by whether the absence closes the DAY or only some HOURS
   (10 Aug 26, for the AM/PM half-days). Built in ONE pass because the palette
   asks about sixty people and sixty scans of the same list is the shape this
   is replacing, not the shape to grow into. */
export function dayAway(d:any){const all=new Set(), tw:any={};
  INPUTS.forEach((inp:any)=>{ if(!isAway(inp)||!inputCoversDate(inp,d.dt)||!PEOPLE[inp.person])return;
    if(awayAllDay(inp)){all.add(inp.person);return;}
    const w2=win(inp.s,inp.e); if(w2)(tw[inp.person]=tw[inp.person]||[]).push(w2); });
  return {all,tw};}
/* OFF means off for the WHOLE day, and deliberately kept narrow: it also feeds
   the day-info "off" tally and the palette's struck-through rank, and a man on
   AM leave is genuinely not off for the day. Timed absences are handled by
   availByWave below, per wave. */
export function dayOff(d:any){return dayAway(d).all;}
/* available crew bucketed by wave; anyWave = free across every wave (untasked) */
export function availByWave(d:any){
  const wins:any[]=waveWindows(d), aw=dayAway(d), off=aw.all, eng=dayEngaged(d);
  const byWave=wins.map(()=>[] as any[]), anyWave:any[]=[];
  const bySort=(a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs);
  Object.keys(PEOPLE).forEach((id:any)=>{
    if(PEOPLE[id].archived||off.has(id))return;
    /* AN ABSENCE OCCUPIES TIME EXACTLY AS A TASK DOES, so it is folded into
       the same busy list rather than checked on a second path — one overlap
       rule, not two that can drift.
       The untasked fast path is where a timed absence would otherwise be lost
       outright: a man with nothing else on is still not available during his
       leave, so he only reads free-all-day when there is genuinely nothing to
       check him against. But a day with NO waves (Friday, the weekend) has no
       bands to bucket into, and there anyWave is the only bucket there is —
       without that second guard he would vanish from the strip altogether,
       which is the same bug in a different corner. */
    const away=aw.tw[id]||[];
    if(!eng.has(id)&&(!away.length||!wins.length)){anyWave.push(id);return;}
    const busy=personBusy(d,id).concat(away);
    wins.forEach((w:any,i:any)=>{ if(!busy.some(([bs,be]:any)=>bs<w.e&&be>w.s))byWave[i].push(id); });
  });
  byWave.forEach((a:any)=>a.sort(bySort)); anyWave.sort(bySort);
  return {wins,byWave,anyWave};
}
/* every place a person is written into the week, counted */
export function personCount(id:any){
  if(!id)return 0;
  let n=0; const hit=(v:any)=>{if(v===id)n++;};
  const more=(r:any)=>((r&&r.more)||[]).forEach(hit);
  DAYS.forEach((d:any)=>{
    (d.waves||[]).forEach((w:any)=>(w.formations||[]).forEach((f:any)=>(f.aircraft||[]).forEach((a:any)=>{hit(a.p);hit(a.w);})));
    ['amt','oft'].forEach((k:any)=>((d.sims||{})[k]||[]).forEach((o:any)=>{
      hit(o.p);hit(o.w);hit(nameToId(o.who));(o.pax||[]).forEach((x:any)=>hit(nameToId(x)||x));more(o);}));
    (d.dutywaves||[]).forEach((dw:any)=>(dw.rows||[]).forEach((r:any)=>{hit(r.id);more(r);}));
    (d.ground||[]).forEach((g:any)=>{hit(nameToId(g.who));more(g);});
    (d.allhands||[]).forEach((x:any)=>{(Array.isArray(x.who)?x.who:(x.who?[x.who]:[])).forEach((v:any)=>hit(nameToId(v)));more(x);});
  });
  return n;
}
/* every day index on which this person is named in a warning */
export function personWarnDays(id:any){
  const out:any[]=[];
  WARN.byDay.forEach((g:any)=>{ if(g&&g.warns&&g.warns.some((w:any)=>(w.who||[]).includes(id)))out.push(g.di); });
  return out;
}
export function personWarns(di:any,id:any){
  const g=WARN.byDay[di];
  if(!g||!g.warns)return [];
  return g.warns.map((w:any,ix:any)=>({w,ix})).filter((x:any)=>(x.w.who||[]).includes(id));
}
/* ---------------------------------------------------------------------------
   WHO MAY BE PLANNED INTO THIS SLOT
   The picker used to list the whole squadron and leave it to the validation
   engine to complain afterwards. It now offers only crew who are actually
   eligible for the slot in front of you: the seat rules, SC currency for an SC
   shift, and nobody on leave or downchit that day. Nothing becomes impossible —
   the ineligible are folded away behind a "show anyway" line with the reason
   against each name — but the default list is the one you can plan from.
   --------------------------------------------------------------------------- */
export function slotRules(key:any){
  /* an append target and an overflow body both sit on the row they hang off,
     so they carry its hours — strip both before looking the row up */
  const k=String(key).replace(/\.\+$/,'').replace(XKEY,'');
  const out:any={seat:null,sc:null,scStart:null,scEnd:null,scSpare:false,aar:null,di:-1,slotStart:null,slotEnd:null,avJet:false,avDuty:false};
  out.di=keyDay(k);
  /* THE SLOT'S OWN HOURS (10 Aug 26, for the AM/PM half-days). Only an SC
     shift carried a window before, which is the whole reason a personal input
     could only ever be judged against the WHOLE DAY outside SC: there was
     nothing to judge it against. Every kind is read off the same row
     collectEvents() reads, and padded the same way, so what the picker bars
     and what the warning list flags cannot drift apart.
     null means UNKNOWN, never FREE — a BB shift is written ['SHIFT','',''] and
     a ground row may carry no times at all, and reading either as "clashes
     with nothing" would silently drop a real absence. slotBar falls back to
     the old whole-day answer instead. Fail closed, both sides. */
  if(/^[dsga]:/.test(k)){
    const kk=k[0], parts=k.slice(2).split('.'), r=rowRef(kk,parts);
    /* AVALON's desk (owner, 11 Aug 26): the wave's `sa` marker survives on its
       duty block (waveDutyBlock), so a `d:` key can tell whether its row is an
       AVALON desk without walking back through DAYS.waves at all. */
    if(kk==='d'){const dwx=((DAYS[+parts[0]]||{}).dutywaves||[])[+parts[1]]; if(dwx&&dwx.sa==='avalon')out.avDuty=true;}
    /* a sim runs 90 minutes when it names no end, matching events.ts;
       everything else falls to VCONF.openEnd, as win() does by default */
    const w2=r&&win(parseHM(r.str),parseHM(r.end),kk==='s'?90:undefined);
    if(w2){out.slotStart=w2[0]; out.slotEnd=w2[1];}
  }
  /* a SIM box has the same two seats as the jet — front pilot, rear IP — and the
     engine checks them (day.simcrew). The picker used to skip the seat rules for
     any key carrying a ':' prefix, so it happily planted a WSO into a sim front
     seat and the engine then raised a hard warning about it. `s:di.kind.ri.p|w`
     — but not `s:di.kind.ri.pax.N`, which is a body in the room, not a seat. */
  if(/^s:/.test(k)){
    const a=k.slice(2).split('.');
    if(a.length===4&&(a[3]==='p'||a[3]==='w'))out.seat=a[3];
  }
  if(k.indexOf(':')<0){                                  // a flying seat
    const a=k.split('.');
    out.seat=a[4];
    const wv=(((DAYS[+a[0]]||{}).waves||[])[+a[1]]);
    const f=wv&&(wv.formations||[])[+a[2]];
    const ac=f&&(f.aircraft||[])[+a[3]];
    if(f&&ac){
      let ld=parseHM(f.ld); const to=parseHM(f.to);
      if(ld!=null&&to!=null&&ld<to)ld+=1440;
      out.aar=aarNeed(ac.rmks,!!wv.night||(ld!=null&&ld>19*60));
    }
    /* the sortie's window, PADDED to the step and the dekit — because that is
       what the validator judges an input against (the brief/debrief loop), and
       a picker that offered a man the engine would immediately flag would be
       worse than no picker. Consequence worth knowing: a morning absence does
       not free a sortie that starts WALKING before noon.
       A standalone line is a shift, not a sortie: 07:00–13:00 means exactly
       that, no step in front and no dekit behind, matching events.ts. */
    if(f){ const st=parseHM(f.to); let en=parseHM(f.ld);
      if(st!=null){ if(en==null)en=st; if(en<st)en+=1440;
        const sh=wv&&isStandalone(wv);
        if(sh&&wv.kind==='avalon')out.avJet=true;    // MAIN or SPARE, both are jet seats (owner, 11 Aug 26)
        out.slotStart=sh?st:st-VCONF.step; out.slotEnd=sh?en:en+VCONF.dekit; } }
    if(wv&&f&&isStandalone(wv)&&wv.kind==='sc'){
      const st=parseHM(f.to); let en=parseHM(f.ld);
      if(st!=null&&en!=null){ if(en<st)en+=1440; out.sc=scShiftKind(st,en); out.scEnd=en; }
      /* a SPARE is standing by, not tasked: he may fly, sit a sim or stand a
         duty in the same hours, and the shift buys him no crew rest either */
      out.scSpare=scSpare(wv,f,ac);
      /* the shift's own start time is the report time — an SC line may only be
         crewed by someone 12h clear of the previous day */
      out.scStart=st;
    }
  }
  return out;
}
/* '' when they may be planned here, otherwise the reason they may not */
export function slotBar(id:any,key:any,rules?:any){
  const p=PEOPLE[id]; if(!p||p.special)return '';
  const r=rules||slotRules(key);
  if(r.seat==='p'&&p.seat==='RCP')return 'WSO — cannot fly front seat';
  if(r.seat==='w'&&p.seat==='FCP'&&!isInstrPilot(p.q))return 'pilot, not an instructor — only IP / IR / FI may fly rear seat';
  if(r.sc&&!scQualOK(id,r.sc))return `not ${r.sc==='day'?'SC DAY':'SC NIGHT'} current`;
  /* SC is treated as flying for crew rest: 12h clear of yesterday or he cannot
     be planned onto the shift at all. Read off the map validate() builds. */
  if(r.scStart!=null&&r.di>=0&&!r.scSpare){
    const cl=restClear(r.di,id);
    if(cl!=null&&cl>r.scStart)return `crew rest — not clear until ${hm24(cl)}`;
  }
  /* AN SC SLOT IS JUDGED AGAINST ITS OWN SHIFT WINDOW, NOT THE WHOLE DAY.
     Being tasked somewhere else on the day says nothing about whether a man can
     stand this shift — SC AM 07–13 and SC PM 13–19 are two clean halves and a
     body on one is perfectly plannable on the other. What bars him is a
     commitment INSIDE the window, and only the hard kinds: a flight, a sim, a
     duty post, another shift. A ground event or a programme item inside the
     window does not bar him — plan it and the engine says so in amber. */
  if(r.sc&&r.scStart!=null&&r.scEnd!=null&&r.di>=0&&!r.scSpare){
    const self=String(key).replace(/\.\+$/,'');
    const live=(e:any)=>SHIFT_HARD[e.kind]&&e.s!=null&&e.e!=null&&e.slot!==self;
    /* both windows are already minutes-from-midnight of day r.di, so plain
       overlap is the whole answer here */
    let hit=dayEvents(r.di,id).find((e:any)=>live(e)&&overlap(r.scStart,r.scEnd,e.s,e.e));
    /* a shift written 19:00–07:00 runs past midnight: its tail belongs to the
       NEXT day, so look there too, with the window rolled back a day */
    if(!hit&&r.scEnd>1440)
      hit=dayEvents(r.di+1,id).find((e:any)=>live(e)&&overlap(r.scStart-1440,r.scEnd-1440,e.s,e.e));
    if(hit)return `on ${hit.label} ${hm24(hit.s)}–${hm24(hit.e)} — inside this shift`;
  }
  if(r.aar&&r.seat==='p'&&!aarOK(id,r.aar))return `not ${r.aar} current`;
  if(r.di>=0&&DAYS[r.di]){
    /* WHY A PERSONAL INPUT CLOSES THIS SLOT — three filters, and the ORDER of
       the last one matters.
       · A STANDALONE SPARE is standby, not a task, so a type that may spare
         does not close it (canSpare: local yes, overseas no, medical never).
         AN AVALON SEAT — jet or desk, MAIN or SPARE (owner, 11 Aug 26) — bars
         exactly what the validator's one check flags: canSpare, with canWork
         already carving ATT B out of a desk below. Folded into the same
         `spareLike` flag as the SC spare so the picker and the warning list
         cannot drift apart — local leave no longer folds a man away from an
         AVALON seat, because the engine raises nothing for it either.
       · ATT B is grounded, not absent, so it closes a FLYING seat only — a
         duty post, a sim seat or a ground row is proper work for him. A flying
         key is the one with no prefix.
       · A HALF-DAY closes its own half. day.input has carried s/e since the
         validator learned to overlap them; this was the last place still
         reading every absence as the whole day, so a man on AM leave was
         struck out of an evening sortie nothing had a complaint about.
         An all-day absence — or one whose record is too thin to place — must
         short-circuit BEFORE any overlap test, and a slot with no window of
         its own keeps the old whole-day answer. Unknown is not "never
         clashes", on either side. */
    const spareLike=!!(r.sc&&r.scSpare)||!!r.avJet||!!r.avDuty;
    const flying=String(key).indexOf(':')<0;
    const kn=r.slotStart!=null&&r.slotEnd!=null;
    const off=INPUTS.filter((x:any)=>isAway(x)&&x.person===id&&inputCoversDate(x,DAYS[r.di].dt))
      .filter((x:any)=>!(spareLike&&canSpare(x.type)))
      .filter((x:any)=>!(canWork(x.type)&&!flying))
      .filter((x:any)=>!kn||awayAllDay(x)||overlap(r.slotStart,r.slotEnd,x.s,x.e));
    if(off.length)return offWord(off[0]);
    /* THE MIDNIGHT TAIL, picker side (owner, 11 Aug 26 — same modality as
       events.ts's day.input, so the picker and the warning list cannot
       disagree). A slot whose window runs past 1440 has a tail that belongs
       to TOMORROW; the same filter chain runs again over tomorrow's inputs,
       shifted +1440 so they land in this slot's minute-space, with an
       all-day (or thin) record covering the whole shifted day so it always
       overlaps a past-midnight window. */
    const nd=kn&&r.slotEnd>1440&&r.di>=0?DAYS[r.di+1]:null;
    const off2=!nd?[]:INPUTS.filter((x:any)=>isAway(x)&&x.person===id&&inputCoversDate(x,nd.dt))
      .filter((x:any)=>!(spareLike&&canSpare(x.type)))
      .filter((x:any)=>!(canWork(x.type)&&!flying))
      .filter((x:any)=>awayAllDay(x)||overlap(r.slotStart,r.slotEnd,x.s+1440,x.e+1440));
    if(off2.length)return offWord(off2[0])+' (tomorrow)';
    /* ...and the same tail BACKWARDS, for the same reason and by the same
       chain (see events.ts's matching block). A slot whose window opens before
       minute 0 — a small-hours take-off, whose step and brief run back into the
       previous evening — has a tail belonging to YESTERDAY, shifted −1440 into
       this slot's minute-space. Without this the picker offered a man who was
       at a meeting the night before, and the warning list stayed silent too, so
       the two agreed only by both being wrong. */
    const pdv=kn&&r.slotStart<0&&r.di>0?DAYS[r.di-1]:null;
    const off3=!pdv?[]:INPUTS.filter((x:any)=>isAway(x)&&x.person===id&&inputCoversDate(x,pdv.dt))
      .filter((x:any)=>!(spareLike&&canSpare(x.type)))
      .filter((x:any)=>!(canWork(x.type)&&!flying))
      .filter((x:any)=>awayAllDay(x)||overlap(r.slotStart,r.slotEnd,x.s-1440,x.e-1440));
    if(off3.length)return offWord(off3[0])+' (yesterday)';
  }
  return '';
}
