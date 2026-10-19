/* D497–D507: transient reporting interpretation. No stored targets or dates.
   Publishing and warnings read this same pure judgment; no validate/publish cycle. */
import { VCONF } from './rules'
import { hm24, parseHM } from './time'

/* AN SC LINE'S TYPED B IS ITS CREW'S IN-TIME (owner, 24 Aug 26) - the ONE body crew rest (events.ts seatIntime) and
   OIL (oil.ts, D606) read it with. The bounded evening-before rule, unchanged: only a shift that starts within the
   nominal lead of midnight rolls a later clock back a day. `lead` is handed in by a reader facing a published day's
   own kept value (D592 (4)); every other reader leaves it out and gets today's. */
export function scIntime(br:any,toM:number,lead?:number|null){
  const t=parseHM(br); if(t==null)return null;
  return toM-(lead==null?VCONF.reportLead:lead)<0&&t>toM?t-1440:t;
}
/* AN SC LINE'S REPORT — ITS IN-TIME BOX OR ITS RALLY BOX, THE EARLIER (owner D1041, 19 Oct 26: SC, AVALON and BB get the
   rally box, D1036, D1040; on SC MAIN a typed rally starts the crew's day as the in-time box does — "SC main only").
   Each box read by scIntime's own rule; the earlier one counts, as the earliest in-time or rally does on a flying line
   (D1032). Crew rest (events.ts seatIntime) and OIL (oil.ts) read the line through this one body. A SPARE line has no
   event stream and OIL gives it its written window, so neither box counts there; AVALON and BB are never read. */
export function scReport(f:any,toM:number,lead?:number|null){
  const c=[scIntime(f&&f.br,toM,lead),scIntime(f&&f.rl,toM,lead)].filter((v):v is number=>v!=null);
  return c.length?Math.min(...c):null;
}
export function intimeTime(s:any){
  const re=/(?:^|[^A-Za-z0-9])(?:(\d{1,2}):(\d{2})|(\d{3,4}))\s*[HL]?(?![A-Za-z0-9])/gi;
  let m:any;
  while((m=re.exec(String(s||'')))){
    const h=m[1]!=null?+m[1]:+m[3].slice(0,m[3].length-2);
    const mi=m[1]!=null?+m[2]:+m[3].slice(-2);
    if(h<24&&mi<60)return h*60+mi;
  }
  return null;
}
export function intimeFold(s:any){
  return String(s==null?'':s).replace(
    /(^|[^A-Za-z0-9])(?:(\d{1,2}):(\d{2})|(\d{3,4}))(\s*[HLhl]?)(?![A-Za-z0-9])/g,
    (all,lead,ch,cm,d4,suf)=>{
      const h=ch!=null?+ch:+d4.slice(0,d4.length-2);
      const mi=ch!=null?+cm:+d4.slice(-2);
      if(!(h<24&&mi<60))return all;
      return lead+String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')+suf;
    });
}
/* W6 (D498, D504; the Codex stack check, 5 Oct 26): the ONE name of the wave's reporting box, wherever it is drawn —
   the box's button and ✕, the wave header, the changes window, the pending list, the change record, the toasts, Undo.
   The rename reached four of them and left the old plural name on the other four; ui/intimesadd.test.tsx draws every place.
   "In-time" since D1026 (19 Oct 26): a rally is each formation's own R box now, so the typed lines are named for the
   in-time alone — though a typed line that still says RALLY is still read as a rally, as before (D1034). */
export const REPORTING_LABEL='In-time';
/* …but where the app states WHEN a wave or a formation reports — a time that may come from an in-time line, a typed rally
   or a formation's own R box (D1026) — it says both: the wave header's evening-before note (html.ts waveHeadTail). */
export const REPORT_WORD='In-time / Rally';
type Activity='inTime'|'rally';
export interface ReportingLine {
  index:number; text:string; clock:number|null; activities:Activity[];
  targets:string[]; immediate:boolean; malformed:boolean;
}
export interface ReportingIssue {
  gi:number; li:number; lines:number[]; code:'REPORT_ORDER'|'REPORT_UNRESOLVED';
  msg:string; blocking:boolean;
  /* the fault is the formation's own R box (D1026): its warning points at the box, and the box explains it */
  box?:boolean;
}
const bounded=(term:string)=>new RegExp(`(^|[^A-Za-z0-9])${term}([^A-Za-z0-9]|$)`,'i');
const inWord=bounded('IN(?:[ \\t-]+TIME|TIME)');
const rallyWord=bounded('RALLY');
const immediateWord=bounded('RALLY[ \\t]+AFTER[ \\t]+IN(?:[ \\t-]+TIME|TIME)?');
export function parseReportingLines(w:any):ReportingLine[]{
  const css=[...new Set<string>((w.formations||[]).map((f:any)=>String(f.cs??'').trim()).filter(Boolean))];
  return (w.intimes||[]).map((value:any,index:number)=>{
    /* W3 (D505): "RALLY AFTER IN TIME" is a RALLY line whether or not a clock is typed with it — with a clock it
       is that rally's own time, never a second in-time (which, on a formation's line, replaced the wave's in-time). */
    const text=String(value??''), clock=intimeTime(text), after=immediateWord.test(text), immediate=clock==null&&after;
    const activities:Activity[]=after?['rally']:[];
    if(!after){
      if(inWord.test(text))activities.push('inTime');
      if(rallyWord.test(text))activities.push('rally');
      if(clock!=null&&!activities.length)activities.push('inTime'); // legacy unlabelled line
    }
    const targets=css.filter(cs=>bounded(cs.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).test(text));
    /* W19 (5 Oct 26): a clock ATTEMPTED in a spelling the reader does not take — 8h00, 8.00, 0800IN — gets the same
       "no recognised clock" line as 25:90; digits that are plainly not a clock (FL240, 2 SHIPS, 2.5 HRS) do not. */
    const malformed=clock==null&&(/(?:^|[^A-Za-z0-9])(?:\d{1,2}:\d{2}|\d{3,4})\s*[HL]?(?![A-Za-z0-9])/i.test(text)
      ||/(?:^|[^A-Za-z0-9])(?:\d{1,2}[.hH]\d{2}(?![A-Za-z0-9])|\d{3,4}(?=[A-Za-z])(?![HLhl](?![A-Za-z0-9])))/.test(text));
    return {index,text,clock,activities,targets,immediate,malformed};
  });
}
export function resolveReporting(w:any,f:any,to:number,parsed=parseReportingLines(w)){
  const cs=String(f.cs??'').trim().toLowerCase();
  const scope=(activity:Activity)=>{
    const candidates=parsed.filter(p=>p.activities.includes(activity)&&(p.clock!=null||p.immediate));
    const own=candidates.filter(p=>p.targets.some(t=>t.toLowerCase()===cs));
    return own.length?own:candidates.filter(p=>!p.targets.length);
  };
  // D503 applies to flight reporting. SC's typed-B and shift policy are unchanged.
  const instant=(clock:number)=>clock>to&&(!w.standalone||to-VCONF.reportLead<0)?clock-1440:clock;
  const pick=(activity:Activity,inTime:number|null,own?:number|null)=>{
    /* THE FORMATION'S OWN RALLY BOX (owner D1026, D1032, 19 Oct 26): f.rl is that formation's rally, so it is one more
       formation-specific rally — it replaces the wave-wide typed RALLY lines (D505: a formation's own instruction
       replaces the general one of the same activity) and stands beside a typed line naming the formation, the earliest
       counting (D506). Read with the same evening-before rule (D503). Never an in-time: the in-time stays the typed
       lines' alone, so a whole-wave in-time 06:00 still starts everyone at 06:00 (D1034). */
    let sc=scope(activity);
    if(own!=null&&!sc.some(p=>p.targets.some(t=>t.toLowerCase()===cs)))sc=[];
    const choices=sc.map(p=>({p:p as ReportingLine|null,time:p.clock!=null?instant(p.clock):inTime})).filter(c=>c.time!=null);
    if(own!=null)choices.push({p:null,time:instant(own)});
    if(!choices.length)return {time:null as number|null,lines:[] as number[],box:false};
    const time=Math.min(...choices.map(c=>c.time!));
    /* box: the time chosen IS the formation's own R box (the fresh read's F1, 19 Oct 26) — so a fault it causes is pointed
       at the box, never at the typed lines */
    return {time,lines:choices.filter(c=>c.time===time&&c.p).map(c=>c.p!.index),box:own!=null&&time===instant(own)};
  };
  const box=w.standalone?null:parseHM(f.rl);
  const incoming=pick('inTime',null), rally=pick('rally',incoming.time,box);
  const stages=[incoming.time,rally.time].filter((t):t is number=>t!=null);
  const unresolved=parsed.filter(p=>!p.targets.length||p.targets.some(t=>t.toLowerCase()===cs))
    .filter(p=>p.malformed||(scope('rally').includes(p)&&p.immediate&&incoming.time==null&&(box==null||p.targets.length>0)));
  return {inTime:incoming.time,rally:rally.time,report:stages.length?Math.min(...stages):null,
    sourceLines:[...new Set([...incoming.lines,...rally.lines])], unresolved, rallyBox:rally.box, inTimeLines:incoming.lines};
}
/* D594 (5 Oct 26): Auto sort and Sort all order a wave's In-time / Rally lines by time — earliest first, an
   evening-before clock before the same day's, a line with no clock last. The key is the line's clock read with the
   SAME evening-before rule resolveReporting applies (D503), against the earliest take-off the line speaks for: its
   named formations, else every formation not cancelled. A line whose formations have no take-off yet keeps its bare
   clock. One body for the sort and the reader, so the two cannot drift. */
export function reportingSortKeys(w:any):(number|null)[]{
  const fs=(w&&w.formations||[]).filter((f:any)=>!f.cx);
  return parseReportingLines(w||{}).map(p=>{
    if(p.clock==null)return null;
    const own=p.targets.length?fs.filter((f:any)=>p.targets.some(t=>t.toLowerCase()===String(f.cs??'').trim().toLowerCase())):fs;
    const tos=own.map((f:any)=>parseHM(f.to)).filter((t:any)=>t!=null&&Number.isFinite(t)) as number[];
    if(!tos.length)return p.clock;
    const to=Math.min(...tos);
    return p.clock>to&&(!w.standalone||to-VCONF.reportLead<0)?p.clock-1440:p.clock;
  });
}
export function flightBrief(f:any,to:number){
  const typed=parseHM(f.br);
  return typed!=null?(to-VCONF.briefLead<0&&typed>to?typed-1440:typed):to-VCONF.briefLead;
}
export const stated=(t:number,short=false)=>hm24(t)+(t<0?short?' (prev day)':' (previous day)':t>=1440?' (next day)':'');
export function reportingIssuesForWave(w:any,gi=0):ReportingIssue[]{
  if(w.standalone)return [];
  const parsed=parseReportingLines(w), issues:ReportingIssue[]=[];
  /* RF5b (6 Oct 26, Astra's and Sol's second reads): a wave whose last line has been removed keeps its reporting text —
     and with no formation to speak for it, an unreadable clock there went quiet again. The wave says it itself. */
  if(!(w.formations||[]).length)parsed.filter(p=>p.malformed).forEach(p=>issues.push({gi,li:0,lines:[p.index],code:'REPORT_UNRESOLVED',blocking:false,
    msg:`${String(w.label||'Wave')}: reporting line ${p.index+1} has no recognised clock. Check the time.`}));
  (w.formations||[]).forEach((f:any,li:number)=>{
    if(f.cx)return;
    const to=parseHM(f.to), name=String(f.cs||w.label||'Formation');
    if(to==null||!Number.isFinite(to)){
      /* RF5 (6 Oct 26, Astra's and Sol's reads; W19): no take-off yet, so no order to check — but a clock the reader
         cannot read is told so now, not only once a take-off is typed. Only that: "rally after in-time" with no
         in-time, and every order check, still wait for the take-off. */
      parsed.filter(p=>p.malformed&&(!p.targets.length||p.targets.some(t=>t.toLowerCase()===String(f.cs??'').trim().toLowerCase())))
        .forEach(p=>issues.push({gi,li,lines:[p.index],code:'REPORT_UNRESOLVED',blocking:false,
          msg:`${name}: reporting line ${p.index+1} has no recognised clock. Check the time.`}));
      return;
    }
    const r=resolveReporting(w,f,to,parsed);
    const stages:{name:string,time:number}[]=[];
    if(r.inTime!=null)stages.push({name:'in-time',time:r.inTime});
    if(r.rally!=null)stages.push({name:'rally',time:r.rally});
    stages.push({name:parseHM(f.br)==null?'suggested brief':'brief',time:flightBrief(f,to)},{name:'take-off',time:to});
    const ld=parseHM(f.ld); if(ld!=null)stages.push({name:'landing',time:ld<to?ld+1440:ld});
    for(let i=1;i<stages.length;i++){
      const before=stages[i-1],after=stages[i];
      if(before.time<=after.time)continue;
      /* THE R BOX'S OWN FAULT IS POINTED AT THE BOX (the fresh read's F1, 19 Oct 26): a pair that includes the rally taken
         from the formation's R box blames the box — no typed line, so the warning's tap lands on the box and the typed lines
         do not explain a fault that is not theirs (D509: "explained while editing") */
      const box=r.rallyBox&&(before.name==='rally'||after.name==='rally');
      /* …but an in-time later than the box's rally is half the typed line's (the narrow read's N1): the in-time is always a
         typed line (D1034) and often the culprit, so the lines that typed it still explain it — and the box carries it too */
      issues.push({gi,li,lines:box?(before.name==='in-time'?r.inTimeLines:[]):r.sourceLines,code:'REPORT_ORDER',blocking:true,...(box?{box:true}:{}),
        msg:`${name}: ${before.name} ${stated(before.time)} is later than ${after.name} ${stated(after.time)}.`});
    }
    r.unresolved.forEach(p=>issues.push({gi,li,lines:[p.index],code:'REPORT_UNRESOLVED',blocking:false,
      msg:p.immediate?`${name}: rally after in-time has no applicable in-time clock.`:`${name}: reporting line ${p.index+1} has no recognised clock. Check the time.`}));
  });
  return issues;
}
export function reportingIssuesForDay(d:any):ReportingIssue[]{
  return (d?.waves||[]).flatMap((w:any,gi:number)=>reportingIssuesForWave(w,gi));
}
