/* =====================================================================
   STANDALONE WAVES — SC, AVALON, BB
   These are not part of the day's flying count: two waves of four plus one
   SC reads "4 X 4 / 2", not "4 X 4 X 2". They also sit outside the conflict
   engine, wholly or in part:
     SC      — main crews are checked normally, the SPARE line is not
     AVALON  — nothing on it is checked, main crew included
     BB      — same as AVALON, but with no fixed shift times
   Crew on any of them still count as tasked and still drop out of the
   available-crew pool: they ARE flying, they just aren't cross-checked.
   ===================================================================== */
/* Every shift comes up the same way: TWO main lines and TWO spare lines, each
   labelled, so the shape on screen matches the shape on the board and the
   scheduler only has to fill in names. `main` / `spare` are the counts. */
export const SAWAVE:any={
  sc:    {label:'SC',    all:false, main:2, spare:2, shifts:[['AM','07:00','13:00'],['PM','13:00','19:00']],
          note:'Two MAIN and two SPARE per shift. The SPARE lines are not cross-checked.'},
  avalon:{label:'AVALON',all:true,  main:2, spare:2, shifts:[['NIGHT','19:00','07:00']],
          duties:['SXO','OPS-O','RUNNER','LOGCELL'], dutyTime:['1900','0700'],
          note:'Overnight, two MAIN and two SPARE. Nothing on an AVALON line is cross-checked.'},
  bb:    {label:'BB',    all:true,  main:2, spare:2, shifts:[['SHIFT','','']],
          note:'Two MAIN and two SPARE, times are yours to set. Nothing on a BB line is cross-checked.'}
};
export function isStandalone(w:any){return !!(w&&w.standalone);}
/* a line the conflict engine must leave alone */
export function saExempt(w:any,f:any,a:any){
  if(!w||!w.standalone)return false;
  if(w.noconf)return true;                       // AVALON / BB — the whole wave
  return !!((f&&f.spare)||(a&&a.spare));         // SC — the SPARE line only
}
/* the row label (MAIN / SPARE) is a property, not text typed into remarks —
   remarks stay free for what actually needs saying about that jet */
export function saCrewRow(spare:any){return {p:'',w:'',area:'',rmks:'',opts:{},spare:!!spare,role:spare?'SPARE':'MAIN'};}
export function makeStandalone(kind:any){
  const S=SAWAVE[kind]; if(!S)return null;
  const w:any={label:S.label,kind,standalone:true,noconf:!!S.all,night:kind!=='sc',intimes:[],traffic:[],formations:[]};
  S.shifts.forEach(([nm,st,en]:any)=>{
    const ac:any[]=[];
    for(let i=0;i<(S.main||2);i++)ac.push(saCrewRow(false));
    for(let i=0;i<(S.spare||2);i++)ac.push(saCrewRow(true));
    w.formations.push({cs:S.label,msn:nm,shift:nm,to:st,ld:en,aircraft:ac});
  });
  return w;
}
/* the day badge: normal waves counted X by X, standalone lines after a slash */
export function dayCount(d:any){
  const ws=d.waves||[];
  const main=ws.filter((w:any)=>!isStandalone(w));
  const n=(w:any)=>(w.formations||[]).reduce((t:any,f:any)=>t+(f.cx?0:(f.aircraft||[]).filter((a:any)=>!a.cx).length),0);
  /* a standalone wave's shifts are the SAME jets handed over, not extra ones —
     SC's AM and PM shifts are two aircraft all day, not four — and a SPARE crew
     is standing by, not another airframe. So: most aircraft on any one shift,
     spares excluded. */
  const sn=(w:any)=>(w.formations||[]).reduce((mx:any,f:any)=>f.cx?mx:Math.max(mx,(f.aircraft||[]).filter((a:any)=>!a.cx&&!a.spare).length),0);
  const sa=ws.filter(isStandalone).reduce((t:any,w:any)=>t+sn(w),0);
  if(!main.length&&!sa)return d.wc||'';
  const head=main.length?main.map(n).join(' X '):'0';
  return head+(sa?` / ${sa}`:'');
}
/* ---- weeks ---- */
export const WEEKS=[{lbl:'Jun 29',v:'29/06/2026'},{lbl:'Jul 06',v:'06/07/2026'},{lbl:'Jul 13',v:'13/07/2026'},{lbl:'Jul 20',v:'20/07/2026'},{lbl:'Jul 27',v:'27/07/2026'}];
export let CURWEEK='13/07/2026';

/* ---- mission → colour ---- */
export const MTYPE:any={BFM:'flight',ACM:'flight',SAT:'flight',SA:'flight',INST:'flight',NVG:'flight',IAT:'cft',CFT:'cft',EPT:'cft','EP-4N':'sim','EP-6N':'sim','EP-3N':'sim',SIM:'sim',TEST:'test',CHK:'test'};
export const mColor=(m:any)=>{if(!m)return'flight';if(MTYPE[m])return MTYPE[m];const b=m.split('-')[0];return MTYPE[b]||'flight'};
/* a name on an SC SPARE line — standing by, and free to be planned for anything
   else on the day. Kept separate from "tasked" so the palette can say so. */
export function scSpare(w:any,f:any,a:any){return !!(w&&w.standalone&&!w.noconf&&((f&&f.spare)||(a&&a.spare)));}
