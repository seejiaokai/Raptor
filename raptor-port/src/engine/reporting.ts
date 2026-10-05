/* D497–D507: transient reporting interpretation. No stored targets or dates.
   Publishing and warnings read this same pure judgment; no validate/publish cycle. */
import { VCONF } from './rules'
import { hm24, parseHM } from './time'

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
   The rename reached four of them and left the old plural name on the other four; ui/intimesadd.test.tsx draws every place. */
export const REPORTING_LABEL='In-time / Rally';
type Activity='inTime'|'rally';
export interface ReportingLine {
  index:number; text:string; clock:number|null; activities:Activity[];
  targets:string[]; immediate:boolean; malformed:boolean;
}
export interface ReportingIssue {
  gi:number; li:number; lines:number[]; code:'REPORT_ORDER'|'REPORT_UNRESOLVED';
  msg:string; blocking:boolean;
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
  const pick=(activity:Activity,inTime:number|null)=>{
    const choices=scope(activity).map(p=>({p,time:p.clock!=null?instant(p.clock):inTime})).filter(c=>c.time!=null);
    if(!choices.length)return {time:null as number|null,lines:[] as number[]};
    const time=Math.min(...choices.map(c=>c.time!));
    return {time,lines:choices.filter(c=>c.time===time).map(c=>c.p.index)};
  };
  const incoming=pick('inTime',null), rally=pick('rally',incoming.time);
  const stages=[incoming.time,rally.time].filter((t):t is number=>t!=null);
  const unresolved=parsed.filter(p=>!p.targets.length||p.targets.some(t=>t.toLowerCase()===cs))
    .filter(p=>p.malformed||(scope('rally').includes(p)&&p.immediate&&incoming.time==null));
  return {inTime:incoming.time,rally:rally.time,report:stages.length?Math.min(...stages):null,
    sourceLines:[...new Set([...incoming.lines,...rally.lines])], unresolved};
}
export function flightBrief(f:any,to:number){
  const typed=parseHM(f.br);
  return typed!=null?(to-VCONF.briefLead<0&&typed>to?typed-1440:typed):to-VCONF.briefLead;
}
export const stated=(t:number,short=false)=>hm24(t)+(t<0?short?' (prev day)':' (previous day)':t>=1440?' (next day)':'');
export function reportingIssuesForWave(w:any,gi=0):ReportingIssue[]{
  if(w.standalone)return [];
  const parsed=parseReportingLines(w), issues:ReportingIssue[]=[];
  (w.formations||[]).forEach((f:any,li:number)=>{
    if(f.cx)return;
    const to=parseHM(f.to);
    if(to==null||!Number.isFinite(to))return;
    const r=resolveReporting(w,f,to,parsed), name=String(f.cs||w.label||'Formation');
    const stages:{name:string,time:number}[]=[];
    if(r.inTime!=null)stages.push({name:'in-time',time:r.inTime});
    if(r.rally!=null)stages.push({name:'rally',time:r.rally});
    stages.push({name:parseHM(f.br)==null?'suggested brief':'brief',time:flightBrief(f,to)},{name:'take-off',time:to});
    const ld=parseHM(f.ld); if(ld!=null)stages.push({name:'landing',time:ld<to?ld+1440:ld});
    for(let i=1;i<stages.length;i++){
      const before=stages[i-1],after=stages[i];
      if(before.time>after.time)issues.push({gi,li,lines:r.sourceLines,code:'REPORT_ORDER',blocking:true,
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
