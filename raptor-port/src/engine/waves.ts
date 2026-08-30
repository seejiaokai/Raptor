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
          duties:['SXO','OPS O'], perShiftDuties:true,
          note:'Two MAIN and two SPARE per shift. A SPARE is checked for availability and SC currency, nothing else.'},
  avalon:{label:'AVALON',cs:'AV',all:true,  main:2, spare:2, shifts:[['NIGHT','19:00','07:00']],
          duties:['SXO','OPS O','RUNNER','LOG CELL'], autoDuty:true,
          note:'Overnight, two MAIN and two SPARE. Every man on it is checked for availability — overseas or medically down — and nothing else.'},
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
    /* the line CALLSIGN defaults to S.cs where the kind sets a short one (AVALON
       → AV; owner, 25 Aug 26 — "AVALON" wrapped the narrow CS box), else the kind
       label. The wave LABEL stays the full name (w.label above). */
    w.formations.push({cs:S.cs||S.label,msn:nm,shift:nm,to:st,ld:en,aircraft:ac});
  });
  return w;
}
/* THE DUTY ROLES A WAVE BRINGS WITH IT (owner, 10 Aug 26). `+ Block` asks
   which wave the block is for and fills these in, so a scheduler names the
   wave once instead of typing the same three roles onto every block.
   The vocabulary is the owner's own — `OPS O` and `LOG CELL`, spaced, not the
   `OPS-O`/`LOGCELL` the seed uses. `DUTY_ORDER` (engine/order.ts) already
   ranks both spellings identically, so nothing downstream can tell them
   apart; this only changes what a fresh block READS as.
   An ORDINARY wave takes the standard desk. SC is the exception the owner
   called out by hand: it hands over at 13:00, so one block carries both
   shifts with the shift in the role name — SXO AM, OPS O AM, SXO PM, OPS O
   PM — rather than two blocks or one desk pretending to cover 07:00–19:00. */
export const DUTY_STD=['SDO','SXO','OPS O'];
/* the free-block pick-list, and the source of every role name above:
   DUTY_ORDER's own keys in rank order, so the list a scheduler picks from and
   the order Auto sort puts them in can never drift apart. */
export const DUTY_PICK=['SDO','SXO','OPS O','RUNNER','LOG CELL'];
/* One duty block for one wave, ready to push onto `d.dutywaves`.
   Title is `<wave name> duties`, matching the wave it serves (owner's rule).
   Times come from the wave's own shift where it HAS fixed hours (AVALON runs
   19:00–07:00) and are left blank where it does not — a blank is a prompt to
   type, and every one of these is an ordinary editable cell afterwards.
   `noconf` mirrors the WAVE's exemption: AVALON/BB sit outside the conflict
   engine whole, so their desks do too, while an SC or ordinary desk is
   checked like any other duty row. */
export function waveDutyBlock(w:any){
  if(!w)return null;
  const kind=w.standalone?w.kind:'', S=kind?SAWAVE[kind]:null;
  /* the desk times mint in the app's one hh:mm form (owner, 30 Aug 26 — every
     time reads 08:00). SAWAVE's shifts already store '07:00'; the old strip
     here was what turned them compact on the way onto the schedule. */
  const t=(x:any)=>String(x||'');
  let rows:any[], str='', end='';
  if(S&&S.perShiftDuties)
    rows=(S.shifts||[]).flatMap(([nm]:any)=>(S.duties||[]).map((r:any)=>`${r} ${nm}`));
  else if(S&&S.duties){
    rows=S.duties.slice();
    /* a single-shift standalone can date-stamp its desk from the shift it has */
    const sh=(S.shifts||[]).length===1?S.shifts[0]:null;
    if(sh){ str=t(sh[1]); end=t(sh[2]); }
  }
  else rows=DUTY_STD.slice();
  return {label:`${w.label||'Wave'} duties`, sa:kind||undefined, noconf:!!(S&&S.all),
    rows:rows.map((r:any)=>({role:r,id:'',str,end}))};
}
/* Every duty block a standalone wave owns, by index, HIGHEST FIRST — the
   order a caller must splice them in, since each splice renumbers what
   follows. It matches on the `sa` marker so a RENAMED block is still removed
   with its wave; the label fallback covers a block built before the marker
   existed, which only an AL snapshot taken earlier in the same session can
   still be holding, and accepts both the bare label and the `… duties` form
   the titles took on 10 Aug 26. */
export function saDutyIx(d:any,w:any){
  if(!w||!w.standalone)return [];
  const lbl=String(w.label||'');
  return (d&&d.dutywaves||[]).map((x:any,i:any)=>
      (x&&(x.sa?x.sa===w.kind:(x.label===lbl||x.label===`${lbl} duties`)))?i:-1)
    .filter((i:any)=>i>=0).reverse();
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
export function setCurWeek(v:any){ CURWEEK=v }

/* ---- mission → colour ---- */
export const MTYPE:any={BFM:'flight',ACM:'flight',SAT:'flight',SA:'flight',INST:'flight',NVG:'flight',IAT:'cft',CFT:'cft',EPT:'cft','EP-4N':'sim','EP-6N':'sim','EP-3N':'sim',SIM:'sim',TEST:'test',CHK:'test'};
export const mColor=(m:any)=>{if(!m)return'flight';if(MTYPE[m])return MTYPE[m];const b=m.split('-')[0];return MTYPE[b]||'flight'};
/* a name on an SC SPARE line — standing by, and free to be planned for anything
   else on the day. Kept separate from "tasked" so the palette can say so. */
export function scSpare(w:any,f:any,a:any){return !!(w&&w.standalone&&!w.noconf&&((f&&f.spare)||(a&&a.spare)));}
