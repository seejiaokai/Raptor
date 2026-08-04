import { DAYS } from './data'
import { PEOPLE, nameToId, ID_BY_CS } from './people'
import { SCHED, markEdit } from './publish'
import { parseHM, hhmm } from './time'
import { isUnavail, inpLabel } from './inputs'
export function whoArr(r:any){return Array.isArray(r.who)?r.who.slice():(r.who?[r.who]:[]);}
/* Blanks are HELD, not filtered out: a cleared slot has to keep its index or
   every person after it shifts up one and the amendment marks — and the keys
   stored on a published AL — come to point at the wrong body. Only trailing
   blanks are dropped, so the list cannot grow without bound. */
export function whoSet(r:any,arr:any){
  arr=arr.slice();
  while(arr.length&&!arr[arr.length-1])arr.pop();
  r.who=arr.length>1?arr:(arr[0]||'');
}
/* every level optional: a key can outlive the row it addresses (an armed slot,
   a drag in flight, a stale amendment key) and asking for it must return nothing
   rather than throwing out of the middle of a click handler */
export function flyRef(key:any){const[di,gi,li,ai]=String(key).split('.');
  const d=DAYS[+di]; if(!d)return undefined;
  const w=(d.waves||[])[+gi]; if(!w)return undefined;
  const f=(w.formations||[])[+li]; if(!f)return undefined;
  return (f.aircraft||[])[+ai];}
/* ---------------------------------------------------------------------------
   OVERFLOW CREW — "drop below a puck to add"
   Duties, ground, sims and the personal-input rows were one person each: the
   drop replaced whoever was there. Every one of them can now hold as many as
   you drop in. The extras live on the row itself as `more[]` and are addressed
   with an `.xN` suffix on the key the row already had, so amendment marks,
   undo, drag-and-drop and the text funnels all keep working unchanged.
   A flying line is the one exception — an F-15SG has two seats, so it stays
   FCP + RCP and a third body is refused.
   --------------------------------------------------------------------------- */
export function rowRef(k:any,a:any){
  const d=DAYS[+a[0]]; if(!d)return null;
  try{
    if(k==='d')return d.dutywaves[+a[1]].rows[+a[2]];
    if(k==='g')return d.ground[+a[1]];
    if(k==='s')return d.sims[a[1]][+a[2]];
    if(k==='a')return d.allhands[+a[1]];
  }catch(_){}
  return null;
}
export const XKEY=/\.x(\d+)$/;
/* how many crew a row is holding right now, primary seats included */
export function rowCrew(k:any,a:any){
  const r=rowRef(k,a); if(!r)return [];
  const out:any[]=[];
  if(k==='d')out.push(PEOPLE[r.id]?r.id:'');
  else if(k==='g')out.push(nameToId(r.who)||'');
  else if(k==='s'){
    if(Array.isArray(r.pax))r.pax.forEach((v:any)=>out.push(PEOPLE[v]?v:''));
    else {out.push(PEOPLE[r.p]?r.p:''); out.push(PEOPLE[r.w]?r.w:'');}
  }
  (r.more||[]).forEach((v:any)=>out.push(PEOPLE[v]?v:''));
  return out;
}
export function slotVal(key:any){
  key=String(key);const c=key.indexOf(':');
  { const m=key.match(XKEY);
    if(m&&c>=0){const k=key.slice(0,c),a=key.slice(c+1).replace(XKEY,'').split('.');
      const r=rowRef(k,a); const v=r&&(r.more||[])[+m[1]];
      return PEOPLE[v]?v:'';} }
  if(c<0)return flyRef(key)[key.split('.')[4]];
  const k=key.slice(0,c),a=key.slice(c+1).split('.'),d=DAYS[+a[0]];
  try{
    if(k==='d'){const r=d.dutywaves[+a[1]].rows[+a[2]];return r&&PEOPLE[r.id]?r.id:'';}
    if(k==='s'){const r=d.sims[a[1]][+a[2]]; if(!r)return '';
      if(a[3]==='pax'){const v=(r.pax||[])[+a[4]];return PEOPLE[v]?v:'';}
      return PEOPLE[r[a[3]]]?r[a[3]]:'';}
    if(k==='g'){const r=d.ground[+a[1]];return r?(nameToId(r.who)||''):'';}
    if(k==='a'){const r=d.allhands[+a[1]];return r?(nameToId(whoArr(r)[+a[2]])||''):'';}
  }catch(_){}
  return '';
}
/* every slot mutation funnels through setSlotVal, so this is the one place that
   needs to remember WHICH item changed for the amendment-level marks */
export function noteChange(key:any){ if(key){SCHED.pending[String(key)]=1; delete SCHED.changes[String(key)];} }
export function setSlotVal(key:any,id:any){
  key=String(key);const c=key.indexOf(':');
  /* dropping someone onto the seat they already occupy is not a change — it
     used to raise a pending mark, an undo step and a line in the next AL */
  if(slotVal(key)===(id||''))return;
  noteChange(key);
  { const m=key.match(XKEY);
    if(m&&c>=0){const k=key.slice(0,c),a=key.slice(c+1).replace(XKEY,'').split('.');
      const r=rowRef(k,a); if(!r)return;
      r.more=r.more||[]; r.more[+m[1]]=id||'';
      while(r.more.length&&!r.more[r.more.length-1])r.more.pop();   // keep the tail tidy
      return;} }
  if(c<0){flyRef(key)[key.split('.')[4]]=id||'';return;}
  const k=key.slice(0,c),a=key.slice(c+1).split('.'),d=DAYS[+a[0]];
  try{
    if(k==='d'){d.dutywaves[+a[1]].rows[+a[2]].id=id||'';return;}
    if(k==='s'){const r=d.sims[a[1]][+a[2]];
      /* pax indices are held in place rather than spliced out: lSeat() renders an
         empty id as nothing, so a blanked pax leaves no gap on screen but every
         other pax keeps the slot key it already had (no re-render key drift). */
      if(a[3]==='pax'){r.pax=r.pax||[];r.pax[+a[4]]=id||'';return;}
      r[a[3]]=id||'';return;}
    if(k==='g'){d.ground[+a[1]].who=id?PEOPLE[id].cs:'';return;}
    if(k==='a'){const r=d.allhands[+a[1]],arr=whoArr(r),i=+a[2];
      /* hold the index rather than splicing, exactly as the pax branch does.
         Splicing shifted every later person up one, so an amendment mark — and
         the key stored on a published AL — silently came to point at the wrong
         person. Trailing blanks are trimmed so the list does not grow forever. */
      if(id){if(i>=arr.length)arr.push(PEOPLE[id].cs);else arr[i]=PEOPLE[id].cs;}
      else if(i<arr.length)arr[i]='';
      while(arr.length&&!arr[arr.length-1])arr.pop();
      whoSet(r,arr);return;}
  }catch(_){}
}
/* dropped on a people CELL rather than on a specific puck */
export function fillSlot(key:any,id:any){
  key=String(key);
  if(/\.\*$/.test(key)){const b=key.slice(0,-1);            // sims: front seat, else rear
    return setSlotVal(slotVal(b+'p')?b+'w':b+'p',id);}
  /* sims pax: append to the end of the list. This MUST be tested before the generic
     '.+' programme branch below, because 's:0.amt.1.pax.+' also ends in '.+' and
     would otherwise be written into d.allhands. */
  if(/\.pax\.\+$/.test(key)){const a=key.slice(key.indexOf(':')+1).split('.');
    const r=(DAYS[+a[0]].sims||{})[a[1]]&&DAYS[+a[0]].sims[a[1]][+a[2]]; if(!r)return;
    r.pax=r.pax||[];
    /* reuse the first blanked index if there is one, so removing then re-adding a
       body doesn't grow the array forever */
    let i=r.pax.findIndex((v:any)=>!v||!PEOPLE[v]); if(i<0)i=r.pax.length;
    return setSlotVal(`s:${a[0]}.${a[1]}.${a[2]}.pax.${i}`,id);}
  if(/^a:.*\.\+$/.test(key)){const a=key.slice(key.indexOf(':')+1).split('.');   // programme: append
    const r=DAYS[+a[0]].allhands[+a[1]]; if(!r)return;
    return setSlotVal(`a:${a[0]}.${a[1]}.${whoArr(r).length}`,id);}
  /* every other list row: fill the first empty primary seat, else add one more.
     No limit — a duty, a ground item or a sim can carry as many bodies as the
     scheduler drops onto it. */
  if(/\.\+$/.test(key)){
    const base=key.slice(0,-2), c2=base.indexOf(':');
    const k=base.slice(0,c2), a=base.slice(c2+1).split('.');
    const r=rowRef(k,a); if(!r)return;
    /* only a genuinely EMPTY primary seat is filled. A row carrying free text
       ("ALL PILOTS", "149") is not empty — the puck goes below it instead, or
       the text would be silently destroyed. */
    if(k==='d'&&!String(r.id||'').trim())return setSlotVal(base,id);
    if(k==='g'&&!String(r.who||'').trim())return setSlotVal(base,id);
    if(k==='s'&&!Array.isArray(r.pax)){
      if(!PEOPLE[r.p])return setSlotVal(base+'.p',id);
      if(!PEOPLE[r.w])return setSlotVal(base+'.w',id);}
    if(k==='s'&&Array.isArray(r.pax)){
      let i=r.pax.findIndex((v:any)=>!v||!PEOPLE[v]);
      if(i>=0)return setSlotVal(base+'.pax.'+i,id);}
    r.more=r.more||[];
    let i=r.more.findIndex((v:any)=>!v||!PEOPLE[v]);
    if(i<0)i=r.more.length;
    return setSlotVal(base+'.x'+i,id);
  }
  return setSlotVal(key,id);
}
/* ---------------- generic TEXT addressing (inline editing) ------------
   Every string in the day model is reachable through one key, exactly the way
   every crew position is reachable through a slot key. The day index always
   comes FIRST after the prefix so keyDay() still resolves the amendment day
   and per-item AL colouring works on text as well as on pucks.
     dn:di.i             day (overall) note line
     sn:di               sims scheduler-notes block
     pn:di               programme scheduler-notes block
     dtn:di              duties scheduler-notes block
     gn:di               ground scheduler-notes block
     ap:di.ri.fld        programme row   (prog|sub|str|end)
     wl:di.gi            wave label
     ff:di.gi.li.fld     formation       (cs|msn|to|ld)
     fr:di.gi.li.ai      aircraft remarks
     dl:di.wi            duty-wave label
     dr:di.wi.ri.fld     duty row        (role|str|end)
     sr:di.kind.ri.fld   sim row         (label|str|end)
     gr:di.ri.fld        ground row      (prog|str|end)
   -------------------------------------------------------------------- */
export const TIME_TXT=/\.(to|ld|str|end)$/;
export function txtRef(path:any){
  const s=String(path),c=s.indexOf(':'); if(c<0)return null;
  const k=s.slice(0,c),a=s.slice(c+1).split('.'),d=DAYS[+a[0]]; if(!d)return null;
  try{
    if(k==='dn'){d.notes=d.notes||[];return{o:d.notes,k:+a[1]};}
    if(k==='sn')return{o:d,k:'simnotes'};
    if(k==='pn')return{o:d,k:'prognotes'};
    if(k==='dtn')return{o:d,k:'dutynotes'};
    if(k==='gn')return{o:d,k:'grndnotes'};
    if(k==='ap')return{o:d.allhands[+a[1]],k:a[2]};
    if(k==='wl')return{o:d.waves[+a[1]],k:'label'};
    if(k==='ff')return{o:d.waves[+a[1]].formations[+a[2]],k:a[3]};
    if(k==='fr')return{o:d.waves[+a[1]].formations[+a[2]].aircraft[+a[3]],k:'rmks'};
    if(k==='dl')return{o:d.dutywaves[+a[1]],k:'label'};
    if(k==='dr')return{o:d.dutywaves[+a[1]].rows[+a[2]],k:a[3]};
    if(k==='sr')return{o:d.sims[a[1]][+a[2]],k:a[3]};
    if(k==='gr')return{o:d.ground[+a[1]],k:a[2]};
  }catch(_){}
  return null;
}
export function txtGet(path:any){const r=txtRef(path);return (r&&r.o&&r.o[r.k]!=null)?String(r.o[r.k]):'';}
/* returns true when the model actually moved, so callers can skip a re-render */
export function txtSet(path:any,v:any){
  const r=txtRef(path); if(!r||!r.o)return false;
  v=String(v==null?'':v).replace(/\s+/g,' ').trim();
  if(v==='—')v='';                                       // the empty-field placeholder
  if(TIME_TXT.test(String(path))){const m=parseHM(v);v=(m==null)?'':hhmm(m);}
  if(String(r.o[r.k]==null?'':r.o[r.k])===v)return false;
  r.o[r.k]=v; noteChange(path); return true;
}
/* does the row an armed key addresses still exist? */
export function armTargetExists(key:any){
  const k=String(key).replace(/\.\+$/,'');
  try{
    if(k.indexOf(':')<0){const a=k.split('.');
      const f=(((DAYS[+a[0]]||{}).waves||[])[+a[1]]||{}).formations;
      const fm=f&&f[+a[2]];
      return !!(fm&&(fm.aircraft||[])[+a[3]]);}
    return rowRef(k.slice(0,k.indexOf(':')),k.slice(k.indexOf(':')+1).split('.'))!=null;
  }catch(_){ return false; }}
/* ---- board line / wave / panel controls --------------------------------
   One delegated click covers every ✕ / + / CX / ■ button on the board. Every
   branch ends in afterSchedMutate(), which re-validates, re-renders both the
   board and the week, and pushes an undo snapshot. */
export const acRef=(k:any)=>{const[di,gi,li,ai]=String(k).split('.').map(Number);
  const w=DAYS[di]&&DAYS[di].waves[gi], f=w&&w.formations[li];
  return f?{d:DAYS[di],w,f,a:f.aircraft[ai],ai,li,gi,di}:null;};
/* a formation is cancelled exactly when every one of its aircraft is */
export const rollCx=(f:any)=>{f.cx=f.aircraft.length>0&&f.aircraft.every((a:any)=>a.cx);};
/* ---- accepting a personal input ---------------------------------------
   A personal input is what aircrew SUBMITTED; it is not part of the issued
   programme until a scheduler accepts it. Accepting to 'g' promotes it into
   the day's ground programme as an ordinary row — from that moment it
   validates, drags, publishes and prints on the view-only page like anything
   else the scheduler wrote. Accepting to 'u' just files it under Unavailable
   and creates no row.

   The push goes through noteChange() on the row's own key, exactly as the
   board's "+ Item" control does. A write that skipped the funnel would be
   invisible to the amendment machinery: not marked pending, absent from the
   next AL and never re-validated.

   The link back to the source input is `src` on the ground row, so unaccept
   can find and remove the row it created even after other rows shift around
   it. Storing an index instead would rot the moment a row above it is deleted. */
export function inpKey(inp:any){return `${inp.person}|${inp.date}|${inp.type}|${inp.s==null?'':inp.s}`;}
export function acceptInput(di:any,inp:any,dest:any){
  const d=DAYS[di]; if(!d||!inp)return false;
  if(inp.acc)return false;                       // already actioned — unaccept first
  /* leave / downchit / detachment are never accepted — they are already issued
     to everyone via the Unavailable block, and promoting one to a ground row
     would make the validator flag the row against its own source input (the
     two carry identical times, so overlap() is trivially true). The board
     never offers the control for these; this guard keeps any future call
     site honest. */
  if(isUnavail(inp.type))return false;
  if(dest==='u'){ inp.acc='u'; markEdit(); return true; }
  d.ground=d.ground||[];
  const ri=d.ground.length;
  /* who must be the CALLSIGN — every other ground write stores cs (see setSlotVal's
     'g' branch) and the renderers resolve nameToId(who), so an id like 'haowen'
     (cs 'Hao Wen') would render as free text and never validate as that person.
     Title is the TYPE and the submitter's remarks land in the row's rmks cell
     (owner, Aug 26): 'APPOINTMENT · dental review', not one mashed title. */
  d.ground.push({prog:inpLabel(inp).toUpperCase(),
                 str:inp.allday?'':hhmm(inp.s), end:inp.allday?'':hhmm(inp.e),
                 who:PEOPLE[inp.person]?PEOPLE[inp.person].cs:inp.person,
                 rmks:inp.remarks||'', src:inpKey(inp)});
  inp.acc='g';
  noteChange(`g:${di}.${ri}`);
  return true;
}
export function unacceptInput(di:any,inp:any){
  const d=DAYS[di]; if(!d||!inp||!inp.acc)return false;
  if(inp.acc==='g'&&d.ground&&d.ground.length){
    const key=inpKey(inp), i=d.ground.findIndex((r:any)=>r.src===key);
    if(i>=0)d.ground.splice(i,1);
  }
  delete inp.acc;
  /* markEdit with NO key: the address we just removed must not be re-marked,
     or the next AL carries a line pointing at a row that no longer exists. */
  markEdit();
  return true;
}
/* RENAMING A CALLSIGN (owner, Aug 26).

   The callsign is not a label — it is the identity half the model addresses by.
   Crew SEATS, duty rows, sim p/w/pax and the `more[]` overflow all hold person
   IDs and so ride a rename untouched; but ground rows, programme (allhands)
   rows and sim `who` store the callsign as a STRING, resolved through
   nameToId → ID_BY_CS. Change PEOPLE[id].cs alone and every one of those rows
   stops resolving: the puck collapses to plain free text and the person drops
   out of that row's crew.

   So the rename rewrites all three, and remaps ID_BY_CS. It does NOT mark
   anything pending: rowCrew reads those rows back as IDs, so a published day
   diffs identically — the person in the seat has not changed, only how their
   name is spelt, and an AL full of spelling is noise. */
export function renameCallsign(id:any,next:any){
  const p=PEOPLE[id]; if(!p)return false;
  const cs=String(next==null?'':next).trim();
  if(!cs||cs===p.cs)return false;
  /* two people sharing a callsign would make every stored `who` string
     ambiguous — ID_BY_CS can only point one way */
  const taken=ID_BY_CS[cs.toLowerCase()];
  if(taken&&taken!==id)return false;
  const oldK=String(p.cs||'').toLowerCase().trim();
  p.cs=cs;
  delete ID_BY_CS[oldK]; ID_BY_CS[cs.toLowerCase()]=id;
  const sw=(v:any)=>(typeof v==='string'&&v.toLowerCase().trim()===oldK)?cs:v;
  const row=(r:any)=>{ if(r)r.who=Array.isArray(r.who)?r.who.map(sw):sw(r.who); };
  DAYS.forEach((d:any)=>{
    (d.ground||[]).forEach(row);
    (d.allhands||[]).forEach(row);
    ['amt','oft'].forEach((k:any)=>(((d.sims||{})[k])||[]).forEach(row));
  });
  return true;
}
