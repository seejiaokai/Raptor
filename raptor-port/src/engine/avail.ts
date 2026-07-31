import { DAYS } from './data'
import { INPUTS, inputCoversDate, isOffType, isLocalLeave, offWord } from './inputs'
import { PEOPLE, isSpecial, nameToId, aarNeed, aarOK, scShiftKind, scQualOK, isInstr } from './people'
import { parseHM, win, overlap, hm24 } from './time'
import { SHIFT_HARD } from './rules'
import { isStandalone, scSpare } from './waves'
import { WARN, restClear, dayEvents } from './validate'
import { waveWindows } from './events'
import { whoArr } from './slots'
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
      if(to!=null&&ld!=null){if(ld<to)ld+=1440; out.push([to-60,ld+30]);}}});}));
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
export function dayOff(d:any){const s=new Set();
  INPUTS.forEach((inp:any)=>{ if(isOffType(inp.type)&&inputCoversDate(inp,d.dt)&&PEOPLE[inp.person])s.add(inp.person); });
  return s;}
/* available crew bucketed by wave; anyWave = free across every wave (untasked) */
export function availByWave(d:any){
  const wins:any[]=waveWindows(d), off=dayOff(d), eng=dayEngaged(d);
  const byWave=wins.map(()=>[] as any[]), anyWave:any[]=[];
  const bySort=(a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs);
  Object.keys(PEOPLE).forEach((id:any)=>{
    if(PEOPLE[id].archived||off.has(id))return;
    if(!eng.has(id)){anyWave.push(id);return;}          // untasked → free every wave
    const busy=personBusy(d,id);
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
  const k=String(key), out:any={seat:null,sc:null,scStart:null,scEnd:null,scSpare:false,aar:null,di:-1};
  out.di=keyDay(k);
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
  if(r.seat==='w'&&p.seat==='FCP'&&!(p.ip||isInstr(p.q)))return 'pilot, not IP — only an IP may fly rear seat';
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
    /* LL and OIL keep the man on the island, and an SC SPARE is standby rather
       than a task — so those two do not close a spare slot to him. OL does, and
       so does a downchit: away is away, and unfit is unfit. */
    const sparePost=!!(r.sc&&r.scSpare);
    const off=INPUTS.filter((x:any)=>isOffType(x.type)&&x.person===id&&inputCoversDate(x,DAYS[r.di].dt))
      .filter((x:any)=>!(sparePost&&isLocalLeave(x.type)));
    if(off.length)return offWord(off[0]);
  }
  return '';
}
