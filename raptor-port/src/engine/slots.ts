import { DAYS } from './data'
import { PEOPLE, nameToId, ID_BY_CS } from './people'
import { SCHED, markEdit, markDeletion, deletionWasIssued, markInputFiling, trackStructuralAdd } from './publish'
import { parseHM, hhmm, hmOK } from './time'
import { DATES, inpId, inputCoversDate, isUnavail, inpLabel } from './inputs'
import { shiftKeys } from './keys'
import { VCONF } from './rules'
import { HOOKS } from './hooks'
import { logEdit } from './editlog'
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
   needs to remember WHICH item changed for the amendment-level marks.
   `was`/`now` are the edit log's, and optional: a caller that does not know
   both values logs nothing rather than logging a half-truth (editlog.ts). */
export function noteChange(key:any,was?:any,now?:any){ if(key){SCHED.pending[String(key)]=1; delete SCHED.changes[String(key)]; logEdit(key,was,now);} }
export function setSlotVal(key:any,id:any){
  key=String(key);const c=key.indexOf(':');
  /* dropping someone onto the seat they already occupy is not a change — it
     used to raise a pending mark, an undo step and a line in the next AL */
  const was=slotVal(key);
  if(was===(id||''))return;
  noteChange(key,was,id||'');
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
     ff:di.gi.li.fld     formation       (cs|msn|to|ld|br)
                         br is the BRIEF time the scheduler indicated. Blank
                         means "not indicated" — the engine then briefs off
                         VCONF.briefLead, which is the same value the board
                         offers as a suggestion to accept.
     fr:di.gi.li.ai      aircraft remarks
     dl:di.wi            duty-wave label
     dr:di.wi.ri.fld     duty row        (role|str|end)
     sr:di.kind.ri.fld   sim row         (label|str|end)
     gr:di.ri.fld        ground row      (prog|str|end)
   -------------------------------------------------------------------- */
export const TIME_TXT=/\.(to|ld|br|str|end)$/;
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
  /* A TIME CELL TAKES A TIME, OR NOTHING (audit, 12 Aug 26). Until this, an
     unreadable value was silently normalised to '' — so typing `morning` into
     a take-off did not just fail, it CLEARED the take-off, and the line then
     dropped out of the conflict engine altogether: on the seed Monday four
     real warnings, including a hard clash, disappeared with it. And an
     out-of-range value went in as arithmetic (`9999` → `100:39`), printing a
     take-off no clock shows and a crew-rest line reading "-5h-5".
     Refused rather than warned for the same reason as the brief guard below:
     these are not planning decisions anyone could mean, they are typos, and
     both callers already answer a false return by reverting their own cell.
     Clearing a time to EMPTY stays legal — that is how a scheduler unsets it.
     hmOK, not parseHM, is the question: parseHM is the shared loose reader
     and stays loose (time.ts). */
  if(TIME_TXT.test(String(path))){
    if(v&&!hmOK(v)){HOOKS.toast(`${v} is not a time — try 0900 or 09:00`,'warn');return false;}
    const m=parseHM(v);v=(m==null)?'':hhmm(m);
  }
  const was=String(r.o[r.k]==null?'':r.o[r.k]);
  if(was===v)return false;
  /* A BRIEF LATER THAN ITS OWN TAKE-OFF IS REFUSED (owner, 12 Aug 26 — "u can
     put guard rails to deny such inputs", after the audit found what one does).
     The brief window runs brief..T/O, so a B typed after T/O inverts it and the
     line's "no time for the flight brief" check goes silently dark — the one
     failure mode a soft-bar app must not have, because every other bar here
     still SAYS something. Refused rather than warned because, unlike every
     other bar in this app, it is not a planning decision a scheduler might
     mean: it is a typo. Both callers already revert the cell on a false return
     (board.ts's boardChange, textedit.ts's routeFocusOut), so the bad value
     never sits on screen looking saved.
     NOT refused where events.ts's preflight roll makes it legitimate: a
     small-hours T/O whose brief lead already crosses midnight briefs the
     PREVIOUS evening, so 2210 against a 0030 launch is a real time. Same
     condition, spelled the same way — toM < VCONF.briefLead.
     A standalone wave is a shift, not a sortie: it briefs nothing and every
     consumer gates on that first, so its inert B is left alone. */
  if(r.k==='br'&&v&&String(path).indexOf('ff:')===0){
    const a=String(path).slice(3).split('.');
    const w=((DAYS[+a[0]]||{}).waves||[])[+a[1]];
    const toM=parseHM(r.o.to),br=parseHM(v);
    if(w&&!w.standalone&&toM!=null&&br!=null&&toM>=VCONF.briefLead&&br>toM){
      HOOKS.toast(`The brief cannot be after the ${r.o.to} take-off`,'warn');
      return false;
    }
  }
  r.o[r.k]=v; noteChange(path,was,v);
  /* THE OTHER WAY ROUND: the T/O moves EARLIER and strands a brief behind it.
     The guard above closes the ordinary way in, but a scheduler who retimes a
     sortie must not be refused — the take-off is the primary fact and the
     stale brief is the thing that is now wrong. So the new T/O goes in and the
     impossible brief is CLEARED, visibly, with the reason said: the line falls
     back to the suggested lead (exactly what a blank B has always meant) and
     the B box is empty on screen, so a scheduler can see there is a brief to
     retype. Clearing it silently, or leaving it and computing something else
     underneath, would both break the standing promise that a bad time stays a
     VISIBLE bad time rather than being quietly reinterpreted. Through
     noteChange so the clear is marked pending and logged like any other edit. */
  if(r.k==='to'&&String(path).indexOf('ff:')===0&&r.o.br){
    const a=String(path).slice(3).split('.');
    const w=((DAYS[+a[0]]||{}).waves||[])[+a[1]];
    const toM=parseHM(v),br=parseHM(r.o.br);
    if(w&&!w.standalone&&toM!=null&&br!=null&&toM>=VCONF.briefLead&&br>toM){
      const bwas=String(r.o.br);
      r.o.br=''; noteChange(`ff:${a[0]}.${a[1]}.${a[2]}.br`,bwas,'');
      HOOKS.toast(`The ${bwas} brief was after the new take-off, so it has been cleared`,'warn');
    }
  }
  return true;
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
const markInputDays=(inp:any,fallback:any)=>{const token=inpId(inp);let any=false;DAYS.forEach((d:any,i:any)=>{if(inputCoversDate(inp,d.dt)){markInputFiling(i,token);any=true;}});if(!any&&+fallback>=0)markInputFiling(+fallback,token);};
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
  if(dest==='u'){ inp.acc='u'; markInputDays(inp,di); return true; }
  /* inpKey is a CONTENT key, and content keys are not unique: two inputs that
     agree on person, date, type AND start minute mint the same `src`. Both
     acceptedDay and unacceptInput resolve a row by taking the FIRST match, so a
     second row carrying an existing key makes the link ambiguous — unaccepting
     one input would silently remove the other's row, and re-accepting would
     duplicate rather than restore. Refuse the second accept instead of minting
     the ambiguity; the caller reports it. Narrow (it needs an identical start
     minute) but silent, which is the part worth closing. */
  const key=inpKey(inp);
  if(DAYS.some((dd:any)=>((dd&&dd.ground)||[]).some((r:any)=>r.src===key)))return false;
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
                 rmks:inp.remarks||'', src:key});
  inp.acc='g';
  trackStructuralAdd(`g:${di}.${ri}`); noteChange(`g:${di}.${ri}`);
  return true;
}
/* Which day carries the row this input was accepted onto, or -1. The row does
   NOT record its day, and the caller cannot infer it: a multi-day input
   renders an Accept button on every day it spans, so it may have been accepted
   onto any of them — the start date is a guess that silently misses. */
export function acceptedDay(inp:any){
  if(!inp||inp.acc!=='g')return -1;
  const key=inpKey(inp);
  for(let i=0;i<DAYS.length;i++){
    const g=(DAYS[i]||{}).ground;
    if(g&&g.some((r:any)=>r.src===key))return i;
  }
  return -1;
}
export function unacceptInput(di:any,inp:any){
  if(!inp||!inp.acc)return false;
  const was=inp.acc;
  if(inp.acc==='g'){
    /* search by content key across the week rather than trusting di — see
       acceptedDay. Guessing the day left the real row orphaned on another day
       AND let the next accept push a duplicate. */
    const key=inpKey(inp);
    for(let d2=0;d2<DAYS.length;d2++){
      const g=(DAYS[d2]||{}).ground; if(!g||!g.length)continue;
      const i=g.findIndex((r:any)=>r.src===key);
      if(i<0)continue;
      const issued=deletionWasIssued(d2,'ground',i,key);
      g.splice(i,1);
      /* every other ground delete renumbers the key space (see board.ts's
         grdel). Skipping it slid every g:/gr: mark after the cut onto the
         wrong row — permanently, including inside an issued AL's keys. */
      [`g:${d2}.`,`gr:${d2}.`].forEach((h:any)=>shiftKeys(h,0,i));
      markDeletion(d2,'ground',issued);
      break;
    }
  }
  delete inp.acc;
  if(was==='u'){
    const d2=+di>=0?+di:DATES.indexOf(inp.date);
    markInputDays(inp,d2);
  }
  /* The amendment was marked on an inert deletion/input-action key above.
     Keep the bare call as the history/render epilogue; it must never re-mark
     the removed row address, which now belongs to whatever shifted into it. */
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
