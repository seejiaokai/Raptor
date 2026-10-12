import { VCONF } from './rules'
import { hhmm, hm24 } from './time'
import { CURWEEK } from './waves'
import { newId } from './newid'
import { mintOrd } from '../command/ord'
import { PEOPLE, isSpecial } from './people'
/* A STABLE ADDRESS FOR ONE INPUT (owner, 10 Aug 26 — editing an input's times
   and remarks in place, on the week and on the board).
   Every other editable row in this app is addressed by its position in the
   model (`g:di.ri`, `dr:di.dwi.ri`), and that is safe there because those
   arrays only move when the surface that moves them re-renders. INPUTS does
   not behave like that: `add()` UNSHIFTS, so raising one input renumbers every
   other one, and undo replaces the array wholesale. A cell that captured an
   index when it was drawn and committed it a moment later — after an add on
   the Inputs page, or a Ctrl+Z — would write one man's hours onto another
   man's leave, silently. The content key `inpKey` cannot do this job either:
   it is built from the very fields these cells edit.
   So each input carries an `iid`, minted once and then never changed. It rides
   in the history snapshot with the rest of the record, so undo and redo hand
   back the same object with the same address, and the counter only ever climbs
   within a session, so a replayed snapshot can never collide with a new row. */
/* what an input's two time cells SHOW. An all-day row shows NOTHING — the
   placeholder says "all day", so the pair reads as the rule (see setInpField in
   ui/inputedit.tsx) rather than as a gap somebody forgot to fill. */
export function inpTimeText(inp:any,field:any){
  return (inp.allday||inp.s==null||inp.e==null)?'':hhmm(field==='str'?inp.s:inp.e);}
/* MINTED WHERE A ROW IS CREATED — the seed at boot (state/store.ts) and the
   Inputs page's add() — not lazily at render. Lazily was the first cut and it
   was subtly wrong: a history snapshot taken between the row being created and
   the row being first drawn held no id, so an undo back to it handed back a
   row that then minted a DIFFERENT one, and anything still holding the old
   address was pointing at nothing. Minting at creation puts the id in every
   snapshot the row appears in. The lazy branch stays as a backstop for a row
   that reaches a builder without having gone through either path.
   OPAQUE ID (13 Sep 26, ARCH-STACK 1A): the id was a session counter `'i'+n`,
   which two devices both mint as `i5`. It is now the shared opaque `newId('i')`
   (engine/newid.ts) — unique across sessions and devices, which is what filing
   now addresses by (below) and what the Dataverse step needs. No counter to
   seed on hydrate any more; a stored iid is just kept. */
export function inpId(inp:any){return inp.iid||(inp.iid=newId('i'));}
/* …and its PLACE in the list, `ord`, minted in the same breath ([DB-READINESS] group A, phase 2 — command/ord.ts): each
   request is one stored row, and the list's order rides each row. Minted only for a row with none (or one a writer
   moved), from its neighbours — so every path that mints ids (a command's apply-end, the boot, a week load) leaves
   every request with both, and no later command has to write a row it did not touch. */
export function mintInpIds(){INPUTS.forEach(inpId);mintOrd(INPUTS,(r:any)=>r.iid);}
export function inpById(id:any){return INPUTS.find((r:any)=>r.iid===id)||null;}
/* THE INPUTS ON ONE DATE, AS THE DOCUMENT BEING READ HOLDS THEM ([LEAVE-LATE-PUBLISHED], owner D177–D179, 25 Sep 26 —
   "freeze everything for now"). A published day's face keeps what it was issued with: its issued version freezes the
   inputs covering its date (publish.ts daySnap → snap.inp), and while that face is drawn (ui/html.ts withDaySnap) or
   judged (validate.ts withIssuedWeek — the official pass), those frozen copies ARE the inputs on that date. Before
   this, every reader filtered the live INPUTS, so a leave filed, edited or deleted after publishing moved the published
   face at once with nothing pending (the sweep, docs/superpowers/specs/2026-09-25-published-face-live-inputs.md A0–A7).
   ONE reader for "the inputs on a date" — every schedule surface and validator site that used to write
   `INPUTS.filter(inp=>inputCoversDate(inp,dt))` reads inputsOn(dt) instead (pinned by inputsOn.test.ts's grep), so a
   frozen date answers from its version and every other date from the live records, with no reader needing to know.
   Readers of the RECORDS themselves (the Inputs page, the medical tracker, the Leave War, the live filing and OIL
   candidates in publish.ts / oilev.ts / weekctx.ts liveFilingAt) stay on INPUTS: they are the working world.
   Installed only by withFrozenInputs, synchronously, restored in finally; nothing inside may write. Keyed by the
   canonical date ordinal (dateOrd), as world.ts setFiling is, so a snapshot's label and a stash's label for the same
   day agree. Nested installs merge (an inner one wins on its own dates) and the outer set comes back on exit. */
let FZ:Map<number,any[]>|null=null;
export function withFrozenInputs<T>(byDate:any,fn:()=>T):T{
  if(!byDate||!Object.keys(byDate).length)return fn();
  const outer=FZ, next=new Map<number,any[]>(outer||[]);
  for(const dt of Object.keys(byDate)){const k=dateOrd(dt); if(k==null)continue;
    /* a SHALLOW copy of each frozen record, so no reader can reach into the stored snapshot through it */
    next.set(k,Object.keys(byDate[dt]||{}).map((id:any)=>({...byDate[dt][id]})));}
  FZ=next;
  try{return fn();}finally{FZ=outer;}
}
/* is the date `dt` answered from a frozen version right now? */
export function inputsFrozenOn(dt:any){if(!FZ)return false;const k=dateOrd(dt);return k!=null&&FZ.has(k);}
export function inputsOn(dt:any):any[]{
  if(FZ){const k=dateOrd(dt); const f=k!=null?FZ.get(k):undefined; if(f)return f;}
  return INPUTS.filter((inp:any)=>inputCoversDate(inp,dt));}
/* one input by id, as the document for date `dt` holds it — the frozen copy on a frozen date (null when that version
   never held it), else the live record */
export function inputOn(iid:any,dt:any):any{
  if(FZ&&dt!=null){const k=dateOrd(dt); const f=k!=null?FZ.get(k):undefined; if(f)return f.find((r:any)=>r.iid===iid)||null;}
  return inpById(iid);}
/* WHO IS IN AN INPUT, AND ONE LINE A PERSON ([ALL-AVAIL-AS-MEMBER] step 1, 12 Oct 26 — owner D755, D756, D759: "an input
   is stored as ONE record with the list of its people"; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.2).
   Three kinds of body reach the inputs, and each reads its own thing:
     · a body about ONE MAN'S DAY — is he busy, away, owed, late (the clash and crew-rest rules, who is away, the ALL
       AVAIL crowd, the Leave War's absences, SANS availability) — reads LINES: one flat object a NAMED person, every
       field of the record plus `person` (his id) and `mod` (his own late date where he has one);
     · a body about THE INPUT — it draws, files, counts, freezes, saves or permits it — reads the RECORD;
     · a body that WRITES finds the RECORD by id and never touches a line.
   peopleOf is the ONE reader of who is in an input: a record with no `people` — every record stored before the one-rule
   build, and every seed — answers as a one-person input, so an old-shaped record reads the same everywhere and can never
   break a load (D756). A placeholder entry (ALL AVAIL / ALL) names nobody and makes NO line: who stands behind it is
   worked out on the day (D753, D702), and every per-person reader already turned such a record away by hand.
   A line is FROZEN, and so is the list: a body that still writes to "the record" it was handed throws in every test,
   where on a plain copy the write would be lost without a word; and a writer handed lines would not find its line in
   the list and would splice the LAST input out instead (Fable's read of the plan, F1) — which is why the three kinds
   are pinned file by file in inputs-readers.test.ts. While every stored record is still one a person (step 1) a line is
   a copy of its record, so JSON.stringify of a line is the record's own text — what the parity tests push into the
   reference page (testing/refwin.ts). */
const isPh=(id:any)=>id==='all'||id==='allavail'||isSpecial(id);
export function peopleOf(r:any):any[]{
  if(!r||typeof r!=='object')return [];
  return Array.isArray(r.people)?r.people:[{p:r.person,by:r.by,at:r.at,mod:r.mod}];}
export function namedOf(r:any):any[]{return peopleOf(r).filter((e:any)=>e&&!isPh(e.p));}
export function placeholderOf(r:any):any{return peopleOf(r).find((e:any)=>e&&isPh(e.p))||null;}
/* THE SMALL QUESTIONS EVERY BODY ABOUT THE INPUT ASKS OF ITS PEOPLE (step 2 (a), 12 Oct 26 — the plan §4.1; Fable F3, F4).
   Each reads through peopleOf, so a record in the old shape answers as the one-person input it is.
   idsOf — everyone in it, a placeholder included, in the order they joined. leadOf — the first of them: who stands in
   the name box of its row, and whom a one-person body (a medical plan, the Leave War's approval, a form's Person box)
   means by "its person". onlyNamed — the man whose own request it is: its ONE person, with nobody and nothing beside
   him (F4: "the man himself, whoever filed it", D655 — an input for ALL AVAIL alone, or for several, is nobody's own;
   AND SO IS ONE THAT HOLDS A MAN AND ALL AVAIL, step 3 of the one-rule build, 12 Oct 26: it reaches everyone behind the
   puck, and D755 (3) leaves changing it for everyone to whoever filed it or a scheduler — found by the re-expressed
   tests, where the window offered the man Save and the save refused him). holds — is this id in it. */
export function idsOf(r:any):any[]{return peopleOf(r).filter((e:any)=>e&&e.p!=null&&e.p!=='').map((e:any)=>e.p);}
export function leadOf(r:any):any{const ids=idsOf(r);return ids.length?ids[0]:undefined;}
export function onlyNamed(r:any):any{const n=namedOf(r);return n.length===1&&idsOf(r).length===1&&n[0].p!=null&&n[0].p!==''?n[0].p:null;}
export function holds(r:any,id:any):boolean{return id!=null&&id!==''&&idsOf(r).some((p:any)=>String(p)===String(id));}
export function entryOf(r:any,id:any):any{return peopleOf(r).find((e:any)=>e&&String(e.p)===String(id))||null;}
const linesOf=(src:any):any[]=>{const out:any[]=[];
  for(const r of (src||[])){ if(!r||typeof r!=='object')continue;
    for(const e of peopleOf(r)){ if(!e||isPh(e.p))continue;
      const line:any={...r,person:e.p}; if(e.mod!=null)line.mod=e.mod;
      out.push(Object.freeze(line)); } }
  return Object.freeze(out) as any[];};
/* ONE FACE A PERSON — FOR A BODY THAT DRAWS AN INPUT ONCE PER PERSON (step 2 (g) of the one-rule build, 12 Oct 26 — the
   plan §4.6): the schedule's Unavailable list is one row a man (owner D737), and an input's line under Personal Inputs
   draws a puck a person. A face is the record's fields plus `person` (and his own late date, where he has one) —
   frozen, as a line is: a drawing never writes, and a hand on what it drew finds the RECORD by its id. Unlike a line
   (the rules' view), a PLACEHOLDER has a face: ALL AVAIL is drawn. `several` says the record holds more than one, so
   the row's address names its man — iuTail, below. */
export function facesOf(r:any):any[]{
  if(!r||typeof r!=='object')return [];
  const es=peopleOf(r).filter((e:any)=>e&&e.p!=null&&e.p!=='');
  /* its id is minted on the RECORD where it has none yet (as the builders always did, by asking inpId of the record
     they drew): a face is frozen, and an id minted on a face would be lost with it */
  if(es.length&&!r.iid&&!Object.isFrozen(r))inpId(r);
  return es.map((e:any)=>{const f:any={...r,person:e.p,several:es.length>1}; if(e.mod!=null)f.mod=e.mod; return Object.freeze(f);});}
/* …and the faces in the order an input's people are NAMED on every screen: A to Z by callsign, then the placeholder
   (owner D721, D727) — for a line that draws a puck a person (Personal Inputs). */
export function facesDrawn(r:any):any[]{
  const cs=(p:any)=>String((PEOPLE[p]||{cs:p}).cs), f=facesOf(r), at=new Map(f.map((x:any,i:number)=>[x,i] as [any,number]));
  return f.slice().sort((a:any,b:any)=>(isPh(a.person)?1:0)-(isPh(b.person)?1:0)||(isPh(a.person)?0:cs(a.person).localeCompare(cs(b.person),undefined,{sensitivity:'base'}))||(at.get(a)!-at.get(b)!));}
/* AN UNAVAILABLE ROW'S ADDRESS, after its `iu:` — the input's id for an input of one person, `<iid>~<person>` for one
   man's row of an input that holds several (engine/keys.ts iuParts is the one parser). Asked of a face or a record. */
export function iuTail(f:any):string{const id=String((f&&f.iid)||'');
  return f&&f.several&&f.person!=null?`${id}~${f.person}`:id;}
/* WORKED OUT ONCE PER PASS, NEVER KEPT ACROSS A WRITE (Fable F10). The rules pass asks for a day's inputs several times
   and the crew list asks four times a man a paint (avail.ts slotBar), so a fresh set of copies at every ask would be a
   cost on a phone. Inside inputReadPass — the rules pass, the day and board builders, the crew list's paint, a day's OIL
   evidence: bodies that write nothing — one date under one frozen frame is worked out once, and so is the whole list.
   Outside a pass every ask is fresh. NOTHING INSIDE MAY WRITE THE INPUTS. Never a long-lived cache keyed on the list:
   state/holderbase.ts writes a request's filing and a week load clears it outside the inputs door, so no counter could
   tell a stale view from a fresh one. The same shape as publish.ts publishReadPass and oilev.ts oilReadPass: a pass
   inside a pass shares the outer one and only the outermost ends it. Keyed by the FRAME as well as the date, so a
   published face entered inside a pass (withFrozenInputs) is never served the working copy's answer, nor the reverse. */
const LIVE_FRAME={};
let LINE_PASS:{all:any[]|null,by:Map<any,Map<number,any[]>>}|null=null;
export function inputReadPass<T>(fn:()=>T):T{const outer=LINE_PASS; if(!outer)LINE_PASS={all:null,by:new Map()};
  try{return fn();}finally{if(!outer)LINE_PASS=null;}}
/* every named person's line — of the live inputs, or of a list handed in (the absences a restore will leave, a test's
   own rows): the record's order, its people in the order they joined */
export function inputLines(list?:any):any[]{
  if(list!==undefined)return linesOf(list);
  if(!LINE_PASS)return linesOf(INPUTS);
  return LINE_PASS.all||(LINE_PASS.all=linesOf(INPUTS));}
/* THE LINES OF ONE DATE, AS THE DOCUMENT BEING READ HOLDS THEM — the per-person view of inputsOn(dt), so a published
   face's rules read the people of the copies it was issued with (Fable F2: the clash, crew-rest and "away" readers do
   not read the live list — they read through this funnel's twin, and a shared input on an issued face would otherwise
   flag nobody). A date no calendar can parse is never memoised: inputsOn matches it by its words, not its ordinal. */
export function inputLinesOn(dt:any):any[]{
  if(!LINE_PASS)return linesOf(inputsOn(dt));
  const k=dateOrd(dt); if(k==null)return linesOf(inputsOn(dt));
  const fr=FZ&&FZ.has(k)?FZ:LIVE_FRAME; let m=LINE_PASS.by.get(fr); if(!m)LINE_PASS.by.set(fr,m=new Map());
  let v=m.get(k); if(!v)m.set(k,v=linesOf(inputsOn(dt)));
  return v;}
/* WHAT AN INPUT SAYS ON A SCHEDULE, for "has it changed since the day was issued?" (D178: every member input change
   counts; Fable's scenario design Q4/Q5, 25 Sep 26). What the schedule draws or judges ON THIS DAY: whose, what type,
   all day / half / the times, the remarks, the SANS offer. NOT its dates (Fable's code read F1, 26 Sep 26): whether it
   covers this day is the membership — frozenInputMatch compares the inputs covering the date on both sides — and the
   far end of a multi-day input is another day's business; nothing a face draws or the validator judges for this day
   reads it. With the dates in, a Mon–Tue leave stretched to Wednesday made Monday and Tuesday pending with faces
   unchanged, and an upchit trimming a week-long downchit made every day it still covered pending. NOT the filing state (`acc` — the filing axis compares that, publish.ts filingDelta), the
   id, the lateness stamp (`mod` — the literal 'now' re-reads as today's date, and an edit that matters moves a field
   above anyway), the Leave War's provenance tag, the attached paperwork (the Inputs page's, never drawn on a
   schedule) or the OIL answer (a map over every date the input covers — Tuesday's answer must not move Monday — and
   the day's own OIL comparison already reads it; Astra's plan read #2). Keys sorted at every level. */
export const stableJson=(v:any):string=>{
  if(v==null||typeof v!=='object')return JSON.stringify(v===undefined?null:v);
  if(Array.isArray(v))return '['+v.map(stableJson).join(',')+']';
  return '{'+Object.keys(v).filter((k:any)=>v[k]!==undefined).sort().map((k:any)=>JSON.stringify(k)+':'+stableJson(v[k])).join(',')+'}';};
/* WHO IS IN IT is part of what it says (step 2 (a), 12 Oct 26 — the plan §4.2): the named people's ids SORTED — the order
   they joined in is no part of what a day shows — then the placeholder. Under the key `person`, and for an input of one
   it is that one id: a record rewritten in the new shape, saying the same, is byte for byte the same key, so a day
   published before the build reads nothing pending for it. */
const whoKey=(inp:any):string=>{const ph=placeholderOf(inp);
  return namedOf(inp).map((e:any)=>String(e.p)).sort().concat(ph?[String(ph.p)]:[]).join('+');};
export function inpDetailKey(inp:any):string{
  if(!inp)return '';
  const all=!!inp.allday;
  return stableJson({person:whoKey(inp),type:inp.type||'',
    allday:all,half:inp.half||'',s:all?null:(inp.s??null),e:all?null:(inp.e??null),remarks:inp.remarks||'',
    /* its own title is one of the things a reader sees ([INPUT-OWN-TITLE], D715): a title changed after the day was
       published is a pending change like a changed remark (D178). Named only where there is one, so an untitled
       input's key is byte-for-byte what it was. */
    ...(titleOf(inp.type,inp.title)?{title:titleOf(inp.type,inp.title)}:{}),
    /* THE SCHEDULER'S MARKS ON IT ARE PART OF WHAT IT SAYS (step 4 of the one-rule build — owner D760: a CX on the row
       cancels the INPUT; reading 3: "on a published day a CX put on or taken off reads as a change waiting"). NORMALISED
       (Fable's read of the plan, F14): a CX put on and taken off leaves `cx:false` where a record never cancelled has
       nothing — compared raw the day would read pending for ever. Named only where set, so an unmarked input's key is
       byte for byte what it was. NOT the red box: a scheduler-to-scheduler mark is no part of what a member's input
       says; it rides the row's content. */
    ...(inp.cx?{cx:String(inp.cxr||'')}:{}),...(inp.info?{info:true}:{}),
    sans:inp.sans||null});}
/* THE INPUTS ON A DATE THAT DIFFER FROM A VERSION'S FROZEN COPY ([LEAVE-LATE-PUBLISHED], D178): one entry per input
   whose details moved, or which appeared or went away. An input absent on one side and TAKEN OFF ('r') on the other is
   no difference — neither face shows it (the same rule the filing axis keeps, D174 and D176). Reads the LIVE records
   (never inputsOn — the frozen side is `frozen`); `frozen` null = a version issued before this freeze, compared on
   nothing (demo data only, D56). */
/* BY CONTENT FIRST (Fable Q4): a Leave War move re-files a leave under a new id, and a medical downchit's cascade
   mints a tail with a new id — neither changes what the day shows, so a record that went and an identical one that came
   (same details, same filing state) are the SAME input here, and `same` lists them so the filing axis (keyed by id)
   drops them too (publish.ts inputAxes). What is left pairs by id (an edit), then BY MAN (Fable's code read F2, 26 Sep
   26: a medical takeover trims the old downchit and mints its tail under a new id with a machine-written "till …" in its
   remarks — one status change for one man, which read as two lines, "moved off" and "filed"; a leftover gone and a
   leftover filed for the same man, of the same type or both downchits, are ONE edit, carried with both records so the
   words read one change), then stands alone (filed / gone). An UPCHIT is out altogether: it draws nothing and flags
   nothing — the downchit it trims is the change (Fable Q6). */
const manOf=(r:any):string=>{const n=namedOf(r)[0]||placeholderOf(r);return n&&n.p!=null?String(n.p):'';};
export function frozenInputMatch(frozen:any,dt:any):{diffs:Array<{id:string,was:any,now:any,nowId?:string}>,same:Array<[string,string]>,pieces?:string[]}{
  if(!frozen||dt==null)return {diffs:[],same:[]};
  const W:any[]=[], N:any[]=[];
  Object.keys(frozen).forEach((id:any)=>{const w=frozen[id]; if(w&&!isUpchit(w.type))W.push({id,r:w,k:inpDetailKey(w)});});
  INPUTS.forEach((x:any)=>{ if(inputCoversDate(x,dt)&&!isUpchit(x.type))N.push({id:inpId(x),r:x,k:inpDetailKey(x)}); });
  const out:any[]=[], same:any[]=[];
  /* 1 — the same record, unchanged */
  for(let i=W.length-1;i>=0;i--){const j=N.findIndex((n:any)=>n.id===W[i].id);
    if(j>=0&&N[j].k===W[i].k){W.splice(i,1);N.splice(j,1);}}
  /* 2 — a record replaced by an identical one (a move's re-file, a cascade's tail) */
  for(let i=W.length-1;i>=0;i--){const w=W[i];
    if(N.some((n:any)=>n.id===w.id))continue;
    const j=N.findIndex((n:any)=>n.k===w.k&&!W.some((x:any)=>x.id===n.id)&&String(n.r.acc||'')===String(w.r.acc||''));
    if(j>=0){same.push([w.id,N[j].id]);W.splice(i,1);N.splice(j,1);}}
  /* 3 — the same record, edited; one taken off on BOTH sides shows on neither face, whatever was edited (D176's reading:
     only a dormant request woken back to a live one is a change) */
  for(let i=W.length-1;i>=0;i--){const j=N.findIndex((n:any)=>n.id===W[i].id);
    if(j>=0){if(!(String(W[i].r.acc||'')==='r'&&String(N[j].r.acc||'')==='r'))out.push({id:W[i].id,was:W[i].r,now:N[j].r});W.splice(i,1);N.splice(j,1);}}
  /* 3b — ONE MAN SPLIT OUT OF AN INPUT IS THAT INPUT'S ONE CHANGE (step 2 (e) of the one-rule build — the plan §4.6;
     Fable's read of it, F6 (c)): sick leave cuts Z out of a leave filed for X, Y and Z — the live input holds [X, Y]
     and a NEW record holds [Z] (engine/inputown.ts ownInputOf). That new record has no frozen twin; its person stood
     in a frozen record's list and is out of that record's live twin, and it is the same kind: it is part of THAT
     input's change (already in `out`, above), not a filing of its own — `pieces` tells the filing axis to drop it. */
  /* …AND ONLY A REAL PIECE (the one-rule job's check, 12 Oct 26 — the Opus trial read, claim 8, reproduced red in
     state/inputcount.test.ts). "The same kind, for a man who left a frozen record" also matched a leave FILED AFRESH for
     him afterwards: Hex taken out of a shared leave, then a morning's leave of his own filed — the day read 1, "Hex ·
     LL · taken out", and the new leave had no line at all. A piece is a COPY of the record it was cut from
     (inputown.ts ownInputOf, pieceOf): it carries that record's own `by` and `at` — who placed it, and when — where a
     fresh filing has its filer's and its own moment. A record that carries neither (stored before D629) pairs as it
     did. */
  const pieces:string[]=[];
  for(let j=N.length-1;j>=0;j--){const n=N[j], man=manOf(n.r); if(!man||idsOf(n.r).length!==1)continue;
    const d=out.find((x:any)=>x.was&&x.now&&holds(x.was,man)&&!holds(x.now,man)&&(x.was.type===n.r.type||(isDownchit(x.was.type)&&isDownchit(n.r.type)))
      &&String(x.was.by??'')===String(n.r.by??'')&&Number(x.was.at||0)===Number(n.r.at||0));
    if(d){pieces.push(n.id);N.splice(j,1);}}
  /* 4 — one man's record gone and another of his filed, of the same type or both downchits: one edit (F2). Only records
     with no filing state (a downchit, a leave — never a request, whose filing the filing axis words by its own id, so
     pairing two requests would read one edit AND one filing for two acts) */
  for(let i=W.length-1;i>=0;i--){const w=W[i]; if(String(w.r.acc||'')!=='')continue;
    /* "the same man" is the first named person of each, else its placeholder (step 2 (a) — the plan §4.2) */
    const j=N.findIndex((n:any)=>String(n.r.acc||'')===''&&manOf(n.r)===manOf(w.r)&&(n.r.type===w.r.type||(isDownchit(n.r.type)&&isDownchit(w.r.type))));
    if(j>=0){out.push({id:w.id,was:w.r,now:N[j].r,nowId:N[j].id});W.splice(i,1);N.splice(j,1);}}
  /* 5 — gone, or filed since; a request taken off on the one side and absent on the other shows on neither face (D174, D176) */
  W.forEach((w:any)=>{ if(String(w.r.acc||'')!=='r')out.push({id:w.id,was:w.r,now:null}); });
  N.forEach((n:any)=>{ if(String(n.r.acc||'')!=='r')out.push({id:n.id,was:null,now:n.r}); });
  return {diffs:out,same,pieces};}
export function frozenInputDiffs(frozen:any,dt:any):Array<{id:string,was:any,now:any}>{return frozenInputMatch(frozen,dt).diffs;}
/* …and where the caller has a row but not its date (a request's row carries its input's id in `src`): while a frozen
   version is being drawn, the copy that version holds (or null — it never held it); otherwise the live record */
export function inputOnAny(iid:any):any{
  if(FZ){for(const f of FZ.values()){const r=f.find((x:any)=>x.iid===iid); if(r)return r;} return null;}
  return inpById(iid);}

/* ---- THE INPUT TYPES ------------------------------------------------------
   The squadron books far more kinds of absence than "leave" (owner, 10 Aug 26).
   ONE TABLE decides everything about a type, and every predicate below is a
   lookup into it. That shape is deliberate, for two reasons.

   The first is drift. This file used to carry five hand-written regexes and the
   week and the board each carried their own copy of one of them; they could and
   did fall out of step. With twenty types and four axes, regexes stop being
   readable long before they stop being wrong.

   The second is the LEGEND (owner, 10 Aug 26 — a button by the type field
   saying what each abbreviation means). It is generated from this table, so
   the explanation a scheduler reads cannot drift from the rule the engine
   enforces. That is only true while the table stays the single source.

   The axes, and what each one actually decides:
     work   — WITHIN the input's hours, may he take a NON-FLYING tasking (a duty
              post, a sim seat, a ground row, a programme item)? Only ATT B: he
              is grounded, not absent, and he is at his desk. Nobody on this
              list may fly within their hours.
     local  — is he still on the island? Drives the wording of the warning, and
              it is the flag the AVALON spare rule will read when the owner
              specifies it (he reserved it deliberately, 10 Aug 26 — do NOT
              infer it).
     ground — may a scheduler promote it onto the day's Ground Programme with
              the → Ground button? The activity types only: leave does not
              belong on the programme.
     half   — does the AM / PM control appear on the Inputs page? Leave and
              medical only (owner's call). The other types already take an
              exact time range, which is finer.

   SPARE ELIGIBILITY IS DERIVED, NOT STORED — see canSpare() below.        */
export const INPUT_META:any={
  /* leave — applied for, or granted inside the squadron. Closes the man to
     everything, but he is at home and reachable, so he may still stand by. */
  'LL':         {name:'local leave',              grp:'leave', work:false, local:true,  ground:false, half:true},
  'OL':         {name:'overseas leave',           grp:'leave', work:false, local:false, ground:false, half:true},
  'OIL':        {name:'off in lieu',              grp:'leave', work:false, local:true,  ground:false, half:true},
  'CCL':        {name:'childcare leave',          grp:'leave', work:false, local:true,  ground:false, half:true},
  'PL':         {name:'paternity leave',          grp:'leave', work:false, local:true,  ground:false, half:true},
  'FCL':        {name:'family care leave',        grp:'leave', work:false, local:true,  ground:false, half:true},
  'EL':         {name:'embarkation leave',        grp:'leave', work:false, local:true,  ground:false, half:true},
  /* CL joined 3 Sep 26 (owner): compassionate leave, its own balance on the
     Leave War side (CL BAL / CL USED). For the rules it is LL — local, may
     stand a spare, closes him to everything else. */
  'CL':         {name:'compassionate leave',      grp:'leave', work:false, local:true,  ground:false, half:true},
  /* medical — on the island but not fit to walk, so no spare either. ATT B is
     the ONLY type in the app that separates "cannot fly" from "cannot work". */
  'HL':         {name:'hospitalisation leave',    grp:'med',   work:false, local:true,  ground:false, half:true},
  'OML':        {name:'ordinary medical leave',   grp:'med',   work:false, local:true,  ground:false, half:true},
  'ATT C':      {name:'medically down — cannot report to work', grp:'med', work:false, local:true, ground:false, half:true},
  'ATT B':      {name:'medically down — no flying, may still work', grp:'med', work:true, local:true, ground:false, half:true},
  /* UPCHIT (owner, 27 Aug 26) — the medical officer clears the man to fly
     again. A PAPERWORK record, not an absence: it closes a medical-down
     period (the write path trims the downchit to end on the upchit date) and
     is otherwise invisible to the engine. Its own group, on the SANS
     marker-type pattern, because both neighbours are wrong: grp:'act' would
     auto-accept it onto the Ground Programme and bear crew rest; grp:'med'
     would ground the man and sync it to Leave War. The carve-outs that make
     it inert are explicit: inputFlags (validator + reference seed), isAway
     (palette), restsInput, isLateInput (not decided in advance, same ruling
     as the downchits), the Unavailable blocks in html.ts/board-html.ts, and
     the board's +Add type list. typeGroup maps it to 'med' so the dropdown
     and legend file it under Medical and a new one opens All-day.
     Placed after ATT B so the leave/med indices the suite pins stay put. */
  'Upchit':     {name:'medically up — fit to fly again', grp:'upchit', work:false, local:true, ground:false, half:false},
  /* activity — a real commitment, but local and droppable, so he may stand by.
     These are the types a scheduler may lift onto the Ground Programme.
     shiftHard (owner, 26 Aug 26): across an SC MAIN shift this type is a hard
     CONFLICT, not academics — the man is genuinely committed elsewhere while the
     shift may launch him. Meeting is the deliberate exception (advisory): you can
     still give a meeting to the man on standby. The flag feeds shiftHardInput()
     AND the derived label matcher below, so a future red type is one edit here.
     A per-type Logic-tab toggle was considered and deferred — it would need a
     rulesSave/Load blob like SHIFT_HARD's `s`; the owner named fixed types. */
  'Training':   {name:'training',                 grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  'CSE':        {name:'course',                   grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  'Meeting':    {name:'meeting',                  grp:'act',   work:false, local:true,  ground:true,  half:false},
  /* renamed from 'Fly' (owner, 14 Aug 26) — reads better in the dropdown, and
     the reference's own `^Fly$` offer regexes simply stop matching, which is
     the commitment semantics both engines already agree on */
  'Fly with':   {name:'flying with another squadron', grp:'act', work:false, local:true, ground:true, half:false, shiftHard:true},
  'Personal':   {name:'personal',                 grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  'Appointment':{name:'appointment',              grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  /* a LOCAL duty (owner, 18 Aug 26 — "a new input call Duty… local… same kind
     of rules similar to appointment"). grp:'act' makes it behave EXACTLY like
     an Appointment everywhere by construction: a personal input (drawn in the
     Personal block, not Unavailable), on the island (canSpare yes), liftable
     onto the Ground Programme (ground:true), warns-but-does-not-bar, and it
     does NOT cross to Leave War (the sync only carries leave/medical). It sits
     under the dropdown's "Duty & other commitments" heading, distinct from OD
     (overseas duty, grp:'duty' — out of reach). Placed AFTER the medical block
     so the leave/med indices the suite pins stay put. */
  'Duty':       {name:'duty',                     grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  /* EVENT (owner, D713 + D714, 9 Oct 26 — "should I add a new input called event … sports, night out with, games").
     Ruled a COMMITMENT LIKE THE OTHERS, not a softer social kind: "Ask it [the OIL question], its work, it can be an
     official event too … It should be like a ground programme so yes it should clash … it shows directly on the
     schedule unless taken out by an admin" (D713), and across a standby shift "a clash like that, not the meeting
     softer amber" (D714). So: Duty's flags to the letter — grp:'act' lands it on the Ground Programme and makes a
     man on it busy for an ALL AVAIL crowd, shiftHard makes it red across SC MAIN, and restsInput / oilAsks take it
     in by construction (every act kind but Personal). Placed straight after Duty, before OD, so the leave / medical
     indices the suite pins stay put. DRIFT SEAM, walked with this row: testing/refwin.ts reshift (the hand-typed
     label list) and reirest (the crew-rest set), engine/schema.ts. Pinned by eventkind.test.ts. */
  'Event':      {name:'event',                    grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  /* overseas duty — replaces Detachment (owner, 10 Aug 26). Out of reach:
     cannot be planned for anything at all, an SC spare included. */
  'OD':         {name:'overseas duty',            grp:'duty',  work:false, local:false, ground:false, half:false},
  'Other':      {name:'other',                    grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},
  /* SANS AVAILABILITY (owner, 14 Aug 26) — SANS aircrew filing POSITIVE
     availability for Fly / AMT / OFT, not an absence. grp:'sans' keeps it
     out of isPersonal (it is not a Ground Programme candidate) and inside
     isUnavail (see the comment there — that predicate's name is now stale
     but its callers, the Accept refusal and "no Accept controls" chief among
     them, are exactly right for this type too). local:true, ground:false so
     it behaves like an on-island commitment for canSpare/the Ground button;
     work:false because filing this says nothing about a non-flying tasking.
     half:true (owner, 14 Aug 26 — reworked from three per-event windows): the
     record carries ONE window through the standard All day / AM / PM / Custom
     template like any leave input, and `sans` is reduced to which events are
     offered ({f/o/a: true}). See isSansAvail/sansAvailOn/sansWindow/sansBadge
     below and sansGate in avail.ts. */
  'SANS Availability':{name:'SANS availability',  grp:'sans',  work:false, local:true,  ground:false, half:true},
};
/* Looked up case-insensitively and trimmed, because the predicates this
   replaced were regexes with /i and the suite pins that (`isLeave(' oil ')`).
   The types themselves come from a fixed dropdown, but an input restored from
   an older store — or pushed in by a probe — need not match byte for byte. */
const META_IX:any=Object.keys(INPUT_META).reduce((o:any,k:any)=>{o[k.toUpperCase()]=INPUT_META[k];return o;},{});
export function inpMeta(t:any){return META_IX[String(t==null?'':t).trim().toUpperCase()]||null;}
/* the canonical spelling of a type, whatever case it arrived in */
export function inpType(t:any){const u=String(t==null?'':t).trim().toUpperCase();
  return INPUT_TYPES.find((k:any)=>k.toUpperCase()===u)||String(t==null?'':t).trim();}
/* MAY HE STAND A STANDALONE SPARE despite this input? The owner's rule, in the
   words he used: local yes, overseas no — with medical the single carve-out,
   because HL/OML/ATT B/ATT C keep him on the island but not fit to walk. A
   spare is standing by, not tasked, which is why a local commitment does not
   bar one. Derived rather than stored so the rule lives in one place and a
   twenty-row column cannot fall out of step with it.
   Written against "a standalone spare" on purpose: the SC spare reads it,
   and since 11 Aug 26 so does every AVALON (7 Sep 26: and BB) seat and desk
   — one predicate, three readers (validate.ts). */
export function canSpare(t:any){const m=inpMeta(t); return !!m&&m.local&&m.grp!=='med';}
/* WHAT DOES THIS TYPE COST? — the one plain-English sentence describing what a
   man on this input may and may not be planned for. The SINGLE SOURCE for both
   the Inputs "?" legend (InputsPage typeRule) and the Logic page's type matrix
   (logic-html leaves): they used to hand-write their own copies and had drifted
   — the Inputs gloss missed the SC-MAIN Warning nuance, the Logic matrix missed
   the SANS / Upchit lines. Both now read HERE, so a rule change lands once and a
   guard test (logic.test / inputs.test) fails if either surface stops using it.
   Derived from the same flags the engine enforces (canSpare / shiftHardInput /
   grp / work / local), so it cannot describe a rule the engine does not apply. */
export function inputRuleText(t:any):string{
  const m=inpMeta(t); if(!m)return '';
  if(m.grp==='sans')  return 'not an absence — the boxes ticked say which events he is available for, and when';
  if(m.grp==='upchit')return 'closes a medical-down period — records the date he is fit to fly again; needs the medical document attached';
  if(m.work)          return 'no flying — may still stand a duty, sit a sim or take a ground slot; an SC MAIN shift is a Warning, because it may require him to fly';
  if(!m.local)        return 'out of reach — cannot be planned for anything, an SC SPARE included';
  if(m.grp==='med')   return 'cannot be planned, and cannot stand an SC SPARE';
  if(shiftHardInput(t))return 'cannot be planned, but may still stand an SC SPARE; across an SC MAIN shift this is a Warning — a real commitment, not academics';
  return 'cannot be planned, but may still stand an SC SPARE';
}
/* LEAVE_TYPES is kept — the Logic page builds its leave matrix from it, and
   the reference suite reaches for it by name — but it is now a VIEW of the
   table above rather than a second list to keep true. */
export const LEAVE_TYPES:any=Object.keys(INPUT_META).reduce((o:any,k:any)=>{if(INPUT_META[k].grp==='leave')o[k]=INPUT_META[k].name;return o;},{});
/* declared as functions, not const arrows, so the regression suite can reach
   them — jsdom does not put a top-level const on window */
export function leaveKey(t:any){const k=String(t==null?'':t).trim().toUpperCase(); return LEAVE_TYPES[k]?k:'';}
export function isLeave(t:any){const m=inpMeta(t); return !!m&&m.grp==='leave';}
export function isLocalLeave(t:any){const m=inpMeta(t); return !!m&&m.grp==='leave'&&m.local;}   // still on the island
/* "Downchit" the TYPE is gone (owner, 10 Aug 26); downchit the CONCEPT is the
   medical group — OML, ATT B, ATT C and HL. Everything that used to ask
   isDownchit still gets the right answer, including the late-input exemption:
   a deadline asks a man to decide in advance, and none of these four is
   decided in advance. Leave and OD stay in scope, because they are applied
   for. See the late-input block below. */
export function isDownchit(t:any){const m=inpMeta(t); return !!m&&m.grp==='med';}
export function isOffType(t:any){return isLeave(t)||isDownchit(t);}
export function isFly(t:any){return /^Fly with$/i.test(String(t==null?'':t).trim());}
/* may a NON-FLYING tasking still be given inside this input's hours? */
export function canWork(t:any){const m=inpMeta(t); return !!m&&!!m.work;}
/* IS THIS COMMITMENT A HARD CONFLICT ACROSS AN SC MAIN SHIFT? (owner, 26 Aug
   26). The shift may launch the man, so most commitments are a real conflict;
   Meeting stays the advisory. One body — the validator's raw-input gate, the
   ground-row severity upgrade and the crew picker all ask HERE. */
export function shiftHardInput(t:any){const m=inpMeta(t); return !!m&&!!m.shiftHard;}
/* The HAND-TYPED fallback: a scheduler typing TRAINING onto a ground row means
   training whether or not an input backs it (owner, 26 Aug 26 — "types the
   exact key words"). DERIVED from the shiftHard flags above so the two can
   never disagree; word-boundary so "OTHER SQUADRON VISIT" trips on its word
   deliberately (the owner chose the keywords knowing they are common words).
   DRIFT SEAM: testing/refwin.ts restates this doctrine as literal regexes —
   reshift's RH ground-label list hand-copies THIS keyword list, and reinput
   states the AMBER complement (the MEETING literal, since 26 Aug 26 when an
   unknown type stopped reading soft on a shift: everything not explicitly
   soft is hard in both engines, fail closed). So: a new shiftHard type
   updates this derived body silently but leaves reshift's RH literal stale;
   a type MOVED to the amber side must also join reinput's soft literal.
   Change one, walk all three. */
const SHIFT_HARD_RE=new RegExp('\\b('+Object.keys(INPUT_META).filter((k:any)=>INPUT_META[k].shiftHard)
  .map((k:any)=>k.toUpperCase().replace(/\s+/g,'\\s+')).join('|')+')\\b','i');
export function shiftHardLabel(s:any){return SHIFT_HARD_RE.test(String(s==null?'':s));}
/* AWAY for availability (owner, Aug 26): leave and downchits close the day on
   type alone. A Fly means the man is flying with ANOTHER SQUADRON — so once a
   scheduler has actioned it (either destination) he reads as unavailable in
   the crew strip, the palette and slotBar, while the item itself can sit on
   the Ground Programme. Un-actioned Fly is still just a request, exactly like
   the validator gate — the two gates must not drift apart. */
/* OVERSEAS DUTY BELONGS HERE, and its predecessor never did (10 Aug 26).
   `Detachment` sat in isUnavail but NOT in isAway, so a detached man was
   neither hidden from the palette nor barred from a slot — he only ever raised
   a warning after you had planted him. The owner's rule for OD is explicit:
   "cannot be planned for anything, including an SC spare", and a picker that
   still offers him cannot deliver that. Widened from isOffType to isUnavail,
   which is leave + medical + overseas duty — the three groups that mean the
   man is simply not there.
   The activity types stay out on purpose. They close the man in the WARNING
   list (every input counts now — see inputFlags) but they do not strike him
   out of the palette, which is exactly how an actioned personal input has
   always behaved. Widening that too would be a change nobody asked for. */
/* SANS AVAILABILITY IS UNAVAIL BUT NOT AWAY (owner, 14 Aug 26) — it is a
   POSITIVE record (what he IS offering), so it must not strike him out of
   the palette or close a slot the way leave/medical/OD do; sansGate in
   avail.ts is what actually judges a flying/OFT/AMT seat against it. isUnavail
   itself is left alone (see its own comment) — the offer semantics live here,
   as an explicit carve-out at the one call site that decides "away". */
/* the Fly leg reads ACTIONED ('g'/'u'), never 'r' — a removed Fly-with is
   dormant (owner, 26 Aug 26) and must not strike the man out of the palette */
/* AN UPCHIT IS UNAVAIL BUT NOT AWAY either (owner, 27 Aug 26) — it says the
   man is fit AGAIN, so striking him from the palette would invert its meaning.
   Same carve-out shape as SANS, at this same one call site. */
export function isAway(inp:any){return (isUnavail(inp.type)&&!isSansAvail(inp.type)&&!isUpchit(inp.type))||(isFly(inp.type)&&(inp.acc==='g'||inp.acc==='u'));}
/* DOES THIS ABSENCE CLOSE THE WHOLE DAY, or only some hours (owner, 10 Aug 26 —
   AM / PM half-days)? It does when it says so, AND when it carries no usable
   window at all: {person:'pike', type:'OD'} with neither allday nor s/e is a
   real shape (parity.test.ts pins one), and reading it as a zero-length
   absence would quietly free a man who is off for a week. Both ends are
   required, so a half-day with a blank end does not become a one-hour absence
   through win()'s open-ended default. A thin record fails CLOSED — the same
   rule slotRules follows for a row with no times of its own. */
export function awayAllDay(inp:any){return !!inp.allday||inp.s==null||inp.e==null;}
/* THE ABSENCE'S WINDOW, ROLLED (owner, 11 Aug 26). An absence typed 22:00–02:00
   crosses midnight, exactly as a duty row, a sim box or a night sortie typed the
   same way does — win() and the ld<to roll have handled those since the port.
   Personal inputs were the one row type left out: both entry paths refused
   e<=s outright, so an overnight absence could not be recorded at all, and a
   record that arrived any other way was passed to overlap() inverted, where it
   silently matched nothing. Every reader goes through here, or the picker and
   the warning list drift apart on the one shape neither of them can see.
   A record with neither the all-day flag nor both times FAILS CLOSED here
   too, as the WHOLE day (audit, 12 Aug 26). It used to return null, which
   left the two halves of the same question disagreeing: awayAllDay called
   such a man away and struck him out of the palette, while every validator
   overlap against a null window was false, so planting him anyway raised
   NOTHING — the one drift the picker and the warning list must never have.
   [0,1439] is exactly 1439 wide, so validate.ts's timedInput filter reads it
   as all-day, which is what awayAllDay already decided it was. No UI path can
   mint such a record — both entry paths always write the flag or both times —
   so this is the guard for whatever arrives from a restore, an import or a
   probe, not a live bug being papered over. */
export function inpWin(inp:any){
  if(!inp)return null;
  const s=inp.allday?0:inp.s, e=inp.allday?1439:inp.e;
  if(s==null||e==null)return [0,1439];
  return [s,e<s?e+1440:e];
}
/* how an entry reads when it is the reason a slot is closed. The words come
   off INPUT_META, so the reason a scheduler reads here, the text in the type
   legend and the rule the engine applied are all the same string. */
export function offWord(inp:any){const m=inpMeta(inp.type);
  const half=inp.half==='am'?' (AM)':inp.half==='pm'?' (PM)':'';
  if(!m)return String(inp.type).toLowerCase()+half+(inp.remarks?' — '+inp.remarks:'');
  /* an ABBREVIATION carries its code so a reader can match it back to the
     legend; a type that is already an ordinary word ("Training") would only
     read as "training (Training)", so it does not */
  const t=inpType(inp.type), abbr=m.name.toLowerCase()!==t.toLowerCase();
  /* its own title leads, where it has one ([INPUT-OWN-TITLE]; Sol's read of the code, 2): "Exercise Darwin — overseas
     duty (OD)" — the kind's words stay, they are the reason the slot is closed */
  const tt=titleOf(inp.type,inp.title);
  return `${tt?tt+' — ':''}${m.name}${abbr?` (${t})`:''}${half}`+(inp.remarks?' — '+inp.remarks:'');}
/* "Office", "Available fly" and "Available duty" are gone (owner decision, Aug 26).
   The first was a desk marker nobody read off the programme; the other two were
   OFFERS — a man saying what he WANTED rather than where he had to be. With them
   gone the offer concept goes with them: every remaining non-leave type is a real
   commitment, "Fly with" included, so it clashes and consumes brief/debrief time
   exactly like an Appointment does.
   DERIVED from INPUT_META, in its declaration order, so the list a scheduler
   picks from and the rules the engine applies cannot disagree about which
   types exist. "Downchit" and "Detachment" were removed on 10 Aug 26 —
   OML / ATT B / ATT C carry the medical meaning now, and OD the overseas one.
   AMENDMENT (owner, 14 Aug 26): SANS-scoped offers were reinstated as the
   'SANS Availability' type — restricted to SANS aircrew, and read only by
   sansGate (avail.ts), not by the general clash/brief machinery the deleted
   offer types once shared with every other commitment. See
   docs/engine-rules.md §SANS availability. */
export const INPUT_TYPES=Object.keys(INPUT_META);
/* the three groups the type dropdown and the legend are cut into */
export const TYPE_GROUPS:any=[
  {k:'leave',t:'Leave'},{k:'med',t:'Medical'},{k:'other',t:'Duty & other commitments'}];
export function typeGroup(t:any){const m=inpMeta(t); return !m?'other':m.grp==='leave'?'leave':(m.grp==='med'||m.grp==='upchit')?'med':'other';}
/* The two halves of the day's input blocks, and the ONLY place the split is
   decided — the week and the board both used to carry their own copy of this
   regex and could drift apart.
     UNAVAIL  — leave, medical and overseas duty. The block the squadron reads
                every day: a man who is simply not there.
     PERSONAL — the activity types. A real commitment he is here for, which a
                scheduler may lift onto the Ground Programme (see acceptInput).
   NOTE this split is now PRESENTATIONAL ONLY (owner, 10 Aug 26). It decides
   which block a row is drawn in and nothing else — every input closes the
   man's hours the moment it is entered, whichever block it lands in. The gate
   that used to make "unavailable" mean "counts to the validator" was
   inputFlags, and it no longer discriminates. */
export function isUnavail(t:any){const m=inpMeta(t); return !!m&&m.grp!=='act';}
export function isPersonal(t:any){const m=inpMeta(t); return !!m&&m.grp==='act';}
/* the SANS availability type — see the INPUT_META entry's comment */
export function isSansAvail(t:any){const m=inpMeta(t); return !!m&&m.grp==='sans';}
/* the Upchit marker type — see its INPUT_META entry's comment. Like SANS it
   stays inside isUnavail (no Accept controls, acceptInput refuses it) and is
   carved out everywhere "unavailable" would make it an absence. */
export function isUpchit(t:any){const m=inpMeta(t); return !!m&&m.grp==='upchit';}
/* DOES THIS TYPE NEED A SUPPORTING DOCUMENT before it may be filed (owner,
   27 Aug 26 — "the input cannot go in without uploading a document")? The
   medical group and the upchit that closes it. ONE body on purpose: the
   upload control's visibility and the write path's refusal both ask here —
   a second copy is the drift seam where the form shows no button while the
   commit still demands a file. */
export function needsDoc(t:any){return isDownchit(t)||isUpchit(t);}
/* THE ALL-DAY DEFAULT A BRAND-NEW INPUT OPENS WITH (owner, 22 Aug 26 —
   "untick all day by default for all u see under duty and other commitments
   except sans availability"). Every "Duty & other commitments" type BUT SANS
   Availability opens with All day OFF, because those are timed commitments the
   aircrew states real hours for (a meeting, an appointment, a training slot).
   Leave, medical and SANS Availability keep All day ON: an absence or a
   whole-window availability reads all-day far more often than not. Keyed off
   the SAME dropdown grouping the legend uses (typeGroup 'other' is exactly the
   "Duty & other commitments" heading) so the two can never drift.
   A NEW-INPUT default ONLY — it decides what an empty add form starts on, and
   never touches the saved allday of a record already on file. */
export function defaultAllday(t:any){return !(typeGroup(t)==='other'&&!isSansAvail(t));}
/* DOES THIS INPUT TYPE BEAR CREW REST? (owner, 21 Aug 26 — "everything in
   duty and commitments affects crew rest if the person is flying… do not
   include personal, sans availability"). The "Duty & other commitments"
   dropdown group minus those two: Training, CSE, Meeting, Fly with,
   Appointment, Duty, OD, Other. Leave and medical types are out of scope by
   the same ruling — a downchit is not a working day.
   NAMING TRAP: the exclusion is the TYPE spelled 'Personal', not the
   "personal inputs" feature — every type in this file is a personal input.
   validate.ts additionally requires TYPED times (a window narrower than
   all-day): the owner's words were "use the timings u see", and an all-day
   record has none. The patched reference mirrors this set as an inline
   regex in refwin.ts:reirest() — change one, change both. */
export function restsInput(t:any){const m=inpMeta(t);
  if(!m||m.grp==='leave'||m.grp==='med'||m.grp==='upchit')return false;
  const c=inpType(t); return c!=='Personal'&&c!=='SANS Availability';}
/* DOES THIS INPUT TYPE ASK FOR OIL? (owner, 28 Aug 26 — a duty-&-commitments
   input landing on a weekend/PH is never credited silently: the app asks its
   owner whether it deserves the HO/FO credit). The owner picked EXACTLY the
   crew-rest set — Training, CSE, Meeting, Fly with, Appointment, Duty, OD,
   Other — with 'Personal' and SANS Availability excluded again. Its own name
   so the two rules can diverge later without a hunt; today one delegates. */
export function oilAsks(t:any){return restsInput(t);}
export function isOther(t:any){return /^Other$/i.test(String(t==null?'':t).trim());}
/* ---- AN INPUT FILED FOR A PLACEHOLDER — "ALL AVAIL" OR "ALL" ([INPUT-ALL-AVAIL]; owner D700, D702, D711, D712, D713 —
   9 Oct 26; the plan docs/superpowers/plans/2026-10-09-input-all-avail-plan.md §3.1, §3.2) ---------------------------
   His words: "Can the inputs have an all avail and all selection too? Only allowed for duty and other commitments"
   (D700). It is an ORDINARY SINGLE INPUT whose `person` is one of the two placeholder people (people.ts `special`):
   nobody's name is stored in it — who stands behind it is worked out on the day, as for a placeholder dropped on a row
   (D702, D44). So no man behind it has a record of his own, and none has an OIL answer of his own (D711 (1)).
   ITS STRUCTURAL RULES, said by ONE body so no door can hold a different idea of them: (a) one of SIX kinds — not an
   overseas duty or a course (D711 (2): each is a fact about one man), not "Fly with" or "Personal" (D712), and the new
   Event is in (D713); (b) ONE day (D711 (3): a request lands its row on its first day only); and never under
   Unavailable (below). `placeholderProblem` answers '' or the sentence the screen says; every save door asks it
   first (ui/inputedit.tsx normalizeInputDraft, commitInput; ui/PeoplePick.tsx; the row's door, ui/reqdoor.ts) and the
   save boundary's hard check asks it of what a command really changed, whoever ran it (state/store.ts wireStore —
   `placeholder-input-shape`). Pinned by placeholderinput.test.ts and phmember.test.ts.
   IT MAY BE ONE OF AN INPUT'S PEOPLE (step 3 of the one-rule build, 12 Oct 26 — owner D750: "'Several people' takes ALL
   AVAIL / ALL, so the puck is one of the input's own people and is tied to no man"; D753; D755). Until then there was a
   third rule, "(c) alone — never a group member": a placeholder was filed on its own. It is gone. What D753 keeps is
   (b) — "offered only where the input is a single day" — and "ALL or ALL AVAIL, never both" (shapeProblem, below).
   The words are the plan's (§4.4), as short as can be understood (D726, D765). */
export const PLACEHOLDER_KINDS:string[]=['Training','Meeting','Appointment','Duty','Event','Other'];
export function placeholderKind(t:any){return PLACEHOLDER_KINDS.indexOf(inpType(t))>=0;}
export function isPlaceholderInput(inp:any){return !!inp&&!!placeholderOf(inp);}
export function placeholderProblem(inp:any):string{
  if(!isPlaceholderInput(inp))return '';
  const ph=placeholderOf(inp).p;
  const cs=String((PEOPLE[ph]||{cs:ph}).cs);
  if(!placeholderKind(inp.type))return `${cs} is for ${PLACEHOLDER_KINDS.slice(0,-1).join(', ')} and ${PLACEHOLDER_KINDS[PLACEHOLDER_KINDS.length-1]}`;
  if(inp.endDate&&String(inp.endDate)!==String(inp.date)){const a=dateOrd(inp.date,inp.yr),b=dateOrd(inp.endDate,inp.yr);
    if(a==null||b==null||a!==b)return `${cs} is for one day`;}
  /* …and NEVER UNDER UNAVAILABLE (Astra's read of the code, 9 Oct 26). "Unavailable" names a real person's day; a
     placeholder input filed there lands no row, so it has no crowd and nobody behind it can earn from the filer's Yes.
     The accept door refuses to file one there (slots.ts acceptInput) — but an EDIT keeps a request's filing, so a named
     man's input already under Unavailable, turned into a placeholder's through the new Person choices, stayed there.
     The edit now takes it back onto the programme (ui/inputedit.tsx commitInputEdit); this is the rule behind it, held
     at the save boundary like the other three. */
  if(inp.acc==='u')return `${cs} cannot be filed under Unavailable — that names a real person’s day`;
  return '';}
/* WHAT ONE INPUT MAY HOLD — the invariants of the one record, held at the write (step 2 (a), 12 Oct 26 — the plan §4.1;
   owner D756, D753, D755 (4), D655 reading 4). Asked of every record a command PUT (state/store.ts, beside the
   placeholder check) and of every record an Undo / Redo restores; never of a record nobody touched (D56). '' or the
   sentence the screen says. An old-shaped record is a one-person input and breaks none of these but the placeholder's
   own rules, which it always answered to.
     · at least one person; nobody twice; never two placeholders (D753: "ALL or ALL AVAIL, never both" — and the same
       one never twice: one sentence for both, "This input already has ALL AVAIL");
     · a placeholder's own rules (placeholderProblem, above) — first, as every door says them first;
     · a medical entry or an upchit is one person's — each needs its own document (D655 reading 4);
     · a Personal input is one person's own (D755 (4));
     · a leave the Leave War approved (`lw`) is one person's (the one-rule plan §4.1 said so and nothing held it — the
       Opus trial read, claim 5, reproduced red in leavewar/trialread.test.ts, 12 Oct 26): the war finds the leave
       behind a man's cell only where he is its ONE person (leavewar/sync.ts warLeaveRow), so a second person put in
       from the Inputs page left a leave the war could no longer un-approve, move or delete — with no word said.
   (SANS availability holds SANS people only — asked per person at the doors, ui/inputedit.tsx sansRefusal: it reads the
   roster as it stands, which a stored record is never judged by.) */
export function shapeProblem(inp:any):string{
  if(!inp||typeof inp!=='object')return '';
  const ids=idsOf(inp), cs=(p:any)=>String((PEOPLE[p]||{cs:p}).cs);
  /* (asked of a record that CARRIES its list: an old-shaped record that names nobody is not this build's to judge — D56) */
  if(!ids.length)return Array.isArray(inp.people)?'An input needs at least one person':'';
  const phs=ids.filter((p:any)=>isPh(p));
  if(phs.length>1)return `This input already has ${cs(phs[0])}`;
  const seen=new Set<string>();
  for(const p of ids){const k=String(p); if(seen.has(k))return `${cs(p)} is already on this input`; seen.add(k);}
  const why=placeholderProblem(inp); if(why)return why;
  if(ids.length>1&&(isDownchit(inp.type)||isUpchit(inp.type)))return `${isUpchit(inp.type)?'An upchit':'A medical entry'} is one person’s — each needs its own document`;
  if(ids.length>1&&personalKind(inp.type))return PERSONAL_OWN;
  if(ids.length>1&&inp.lw)return LW_OWN;
  return '';}
export const LW_OWN='A leave approved on the Leave War is one person’s — file the other person’s leave as its own input';
/* THE "PERSONAL" KIND AND ITS ONE SENTENCE — one body for the record's shape (above) and for the row's door, which
   refuses a man dropped ON its one person's puck too (ui/reqdoor.ts rowPut — D755 (4), D757; the walk's B8, 12 Oct 26) */
export function personalKind(t:any):boolean{return /^Personal$/i.test(String(t==null?'':t).trim());}
export const PERSONAL_OWN='A Personal input is one person’s own';
/* ---- AN INPUT'S OWN TITLE ([INPUT-OWN-TITLE]; owner D715, D716, D717 — 9 Oct 26; the plan
   docs/superpowers/plans/2026-10-09-input-own-title-plan.md) -------------------------------------------------------
   His words: "select the type of input and it gives the user the option to change the name of the input. Not only to
   event input, most of the inputs title." An input of a titled kind may carry `title`; its NAME — everywhere a name is
   printed — is that title, and the kind's own name where it has none. THE KIND GOES ON DECIDING EVERY RULE: nothing
   here, and nothing that calls it, reads a rule out of a title's words.

   WHICH KINDS (D716 (1)): the "Duty & other commitments" ones — the activities and the overseas duty. Never leave or
   medical (their names are the official codes the Leave War and the medical list read), nor SANS availability, which
   is filed on its own calendar. ONE predicate: the window, the List's form, the save and the name all ask it. */
export function titledKind(t:any){const m=inpMeta(t); return !!m&&(m.grp==='act'||m.grp==='duty');}
/* the schedule's name column is narrow, and a title is a name, not a remark (which has 200) */
export const TITLE_MAX=40;
/* WHAT IS STORED: the typed title, trimmed and with its inner runs of white space collapsed — and NOTHING when the box
   was left as the kind's own name (any case), is empty, or the kind takes no title. So an input whose Title box nobody
   touched is the record it always was, and a later change of its kind is followed by its name with nothing to keep in
   step. The one normaliser every door that writes an input calls. */
export function titleOf(type:any,title:any):string{
  if(!titledKind(type))return '';
  const t=String(title==null?'':title).replace(/\s+/g,' ').trim().slice(0,TITLE_MAX).trim();
  return t&&t.toLowerCase()!==inpType(type).toLowerCase()?t:'';
}
/* THE NAME. Everywhere an input is labelled — the month's bar, the day's card, the Personal Inputs list, the
   Unavailable block, the board rows, the row a request lands on the schedule, the changes window, a warning's
   sentence — goes through here, so the title reaches them all with no edit of their own.
   "Other" USED TO read by its remarks (owner, Aug 26: the type says nothing). It takes the Title box like every other
   titled kind now, and its remarks are plain remarks again (D716 (3)): an Other nobody titled is named "Other", its
   remark beside it in the remarks cell — no longer printed twice. */
export function inpLabel(inp:any){
  const type=String((inp&&inp.type)||'');
  return titleOf(type,inp&&inp.title)||type;
}
/* THE NAME OF A REQUEST THAT IS GONE, READ OFF THE ROW IT LEFT (the changes window's "… on the programme → deleted"):
   the row carries what it was made from (`srcType`) and what it was called (`prog`). Where the two differ the row was
   named by the request's own title — that is its name; otherwise its kind, written as a kind is. */
export function goneRequestName(row:any):string{
  const kind=String((row&&row.srcType)||'').trim(), name=String((row&&row.prog)||'').trim();
  return kind&&name&&name.toLowerCase()!==kind.toLowerCase()?name:(kind||name);
}
/* THE KIND, KEPT IN SIGHT (D717 — "Kind kept in sight"): the kind's own name when the input is named by something
   else, and nothing when it is named by its kind — an untitled input looks exactly as it did. The one answer to "is
   the kind drawn beside the name here". */
export function inpKindTag(inp:any):string{
  const type=String((inp&&inp.type)||'');
  return inpLabel(inp)!==type?type:'';
}
/* The validator's gate. EVERY INPUT NOW COUNTS (owner, 10 Aug 26 — "all will
   automatically go in") — EXCEPT one a scheduler has since REMOVED, which is
   dormant (acc 'r', the 26 Aug 26 rule — see inputDormant below).
   It used to be `isUnavail(type) || acc==='u' || …`,
   so a Training or an Appointment blocked nothing at all until a scheduler had
   actioned it: it was a request, not part of anyone's programme. The owner
   wants the opposite — an input closes the man's hours the moment he types it,
   and the scheduler's job becomes editing or removing it, not admitting it.

   ONE carve-out survives, and it is not about admission: an input a scheduler
   has promoted to a Ground row ('g') is already represented BY that row, so
   letting it flag here as well would print every clash twice — INPUT_FLY on
   the input plus DOUBLE_BOOK on the row.
   That defers only where the row can actually carry the clash. An ALL-DAY
   input makes a TIME-LESS ground row, and a time-less row never becomes an
   event (4 Aug 26), so it would flag nothing at all — it stays visible here
   instead. A timed one defers to its row, which does the flagging properly.
   PER-INPUT only: the row lives on ONE day of a multi-day span, so
   events.ts's inpShow narrows this to that day (audit, 12 Aug 26) — every
   other covered day keeps the input's voice. This function stays the
   day-blind half because refwin.ts seeds the reference through it, where
   no day context exists. */
/* An UPCHIT never flags: it is a paperwork record, not a commitment, and this
   gate is ALSO refwin's reference seed filter — the reference simply never
   receives one, so parity cannot diverge (the dormancy precedent). */
/* …NOR DOES A CANCELLED OR INFORMATION-ONLY INPUT (step 4 of the one-rule build — owner D760 reading 1: "a cancelled
   input earns nobody OIL and is not checked against the rules, as a cancelled row today"). The marks are the input's
   now, so an all-day request — whose row carries no event and which therefore speaks here — is silent while it is
   cancelled, where the row's own CX used to leave it flagging. The seeds carry neither mark, so the reference is fed
   exactly what it was. */
export function inputFlags(inp:any){return !inputDormant(inp)&&!isUpchit(inp.type)&&!(inp.acc==='g'&&!inp.allday)&&!inputSilent(inp);}
/* THE ONE ANSWER TO "IS IT CANCELLED OR INFORMATION ONLY?" — asked by every body that would otherwise let such an input
   speak: the gate above, the cross-week reads that pass it by (events.ts inpShow), the seven-day run's "did he work
   that day" (weekctx.ts), who is kept out of an ALL AVAIL crowd (leavewar/sync.ts availableFor) and OIL's standing
   (oilev.ts landedStanding). Found by the re-expressed tests, 12 Oct 26: three of those asked only "is it off the
   programme", so a cancelled Sunday input still counted as a day worked in next week's run and still raised crew rest
   on the Monday. */
export function inputSilent(inp:any){return !!inp&&(!!inp.cx||!!inp.info);}
/* A REMOVED INPUT IS DORMANT (owner, 26 Aug 26 — tested the SC-grading
   preview, removed an accepted Training back to Personal Inputs and it still
   flagged: "if it goes there, stop it from flagging anything, until its
   added back to ground programme"). unacceptInput parks the input as
   acc 'r' — still listed in Personal Inputs, Accept offered again — and this
   predicate is the ONE body that blanks it out of the engine: inputFlags
   above (the validator's day-blind gate, which is ALSO refwin's reference
   seed filter, so the reference simply never receives a dormant input and
   parity cannot diverge) and events.ts's inpShow (day.input + the midnight
   tails + the crew picker, which reads the same gate). The other acc states
   keep their voices: 'g' landed (the row speaks, or the raw voice for
   all-day), 'u' actioned to Unavailable (bars duties), and undefined —
   never landed at all, e.g. filed onto a published day — still counts, which
   is why dormancy is this explicit marker and not "no acc". */
export function inputDormant(inp:any){return !!inp&&inp.acc==='r';}
/* inputs use machine-readable date + minute fields so the validator can reason about them.
   s/e are minutes-from-midnight; allday inputs cover the whole day. */
/* The `mod` stamps are spread either side of the demo week's input deadline on
   purpose (owner, 9 Aug 26 — see isLateInput below). At the standard 14 days
   the week of Mon 13 Jul is due by Mon 29 Jun, so this seed shows every case
   a reader needs to see: comfortably early (pike, taipan, vinci, bruise),
   exactly ON the deadline (bane — the deadline day itself is on time), just
   missed by a day (nasty), plainly late (shrek, yeti, and salsa's dental
   appointment booked after planning closed), and EXEMPT-though-latest-of-all
   (divot and sufa's downchits, stamped 12 Jul and marked by nothing).
   Before this they were all stamped inside their own week, which marked every
   input late and made the mark meaningless. */
export let INPUTS:any[]=[
  {person:'divot', date:'Jul 13', allday:true,               type:'OML',         remarks:'Medical leave 13 Jul', mod:'2026-07-12'},
  {person:'bane',  date:'Jul 16', allday:false, s:1020,e:1110,type:'Appointment', remarks:'Medical / PHA', mod:'2026-06-29'},
  {person:'salsa', date:'Jul 14', allday:false, s:840, e:960, type:'Appointment', remarks:'Dental appt',  mod:'2026-07-09'},
  {person:'taipan',date:'Jul 15', allday:true,               type:'OL',          remarks:'Overseas leave — off island',mod:'2026-06-22'},
  {person:'nasty', date:'Jul 14', allday:true,               type:'LL',          remarks:'Local leave',  mod:'2026-06-30'},
  {person:'shrek', date:'Jul 14', allday:true,               type:'OIL',         remarks:'OIL — CO approved, post-detachment',mod:'2026-07-02'},
  {person:'sufa',  date:'Jul 13', endDate:'Jul 17', allday:true, type:'ATT C',   remarks:'Medically down till 17 Jul', mod:'2026-07-12'},
  {person:'bruise',date:'Jul 13', allday:true,               type:'Fly with',    remarks:'Keen for any wave',mod:'2026-06-20'},
  {person:'vinci', date:'Jul 13', allday:false, s:540, e:1020,type:'Meeting',     remarks:'Desk / staff work',mod:'2026-06-26'},
  {person:'pike',  date:'Jul 15', endDate:'Jul 17', allday:true, type:'OD',       remarks:'Overseas duty — exercise, off island',mod:'2026-06-18'},
  {person:'yeti',  date:'Jul 13', allday:false, s:600, e:660, type:'Appointment', remarks:'HSP blood panel',mod:'2026-07-06'},
];
export const DATES=['Jul 13','Jul 14','Jul 15','Jul 16','Jul 17','Jul 18','Jul 19'];  // Mon..Sun index → date label
/* the pristine week-1 inputs + date labels, captured here at module load —
   before initStore mints iids or seeds demo SANS — so the week selector can
   reload this week clean (state/store.ts:loadWeek → engine/weeks-data.ts). */
export const WEEK1_INPUTS_SNAP=JSON.stringify(INPUTS);
export const WEEK1_DATES=[...DATES];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/* THE YEAR THE UNLABELLED DATES BELONG TO (owner, 12 Aug 26 — leave that runs
   into the new year). The stored labels leave the LOADED week's year implicit
   so an ordinary same-week date reads 'Jul 14' with no clutter; a date in any
   OTHER year is stored WITH its year ('Jan 3 2027' — see fmt in
   ui/inputedit.tsx), and dateOrd reads it back below. Derived from CURWEEK so
   the convention tracks whatever week is loaded — there is only ever one, and
   it falls back to the demo's 2026 if CURWEEK is unreadable. */
/* MEMOISED 25 Aug 26 — profiled at a year-plus of INPUTS (5,000 rows), this
   function and the weekStartISO() string-build under it were, with dateOrd's
   own parsing, ~80% of validate() and loadWeek(): every inputCoversDate call
   re-derived the same year from the same CURWEEK. The memo keys on CURWEEK
   itself, so a week change re-derives on the very next call — it cannot serve
   a stale year — and the derivation is byte-identical to the original. */
let byWk:any, byY=0;
export function baseYear(){
  if(CURWEEK!==byWk||byWk===undefined){byWk=CURWEEK;const y=+String(weekStartISO()).slice(0,4);byY=isFinite(y)&&y?y:2026;}
  return byY;
}
/* 'Jul 18' → 20260718, a sortable ordinal that ORDERS ACROSS YEARS. Spans used
   to be compared through DATES.indexOf, which returns -1 for any date outside
   the loaded week: a detachment running Jul 15→24 then covered NO day at all
   and the man read as available all week. Comparing the dates themselves clamps
   at both ends and does not care whether an endpoint is in the week.
   The ordinal now leads with the YEAR (year*10000 + month*100 + day) so a leave
   running Dec 28 → Jan 3 sorts FORWARDS: without the year 'Jan 3' read as 103,
   BEHIND 'Dec 28' at 1228, so the span covered nothing (owner, 12 Aug 26). A
   label may carry a trailing 4-digit year for a date outside baseYear()'s year;
   without one it belongs to `fb` — an INPUT ROW'S OWN anchor year (`yr`, the
   loaded year the row was created or last edited under; owner bug, 24 Aug 26)
   — falling back to baseYear() when no anchor is given. Before `fb` a bare
   label re-resolved against whatever week was CURRENTLY loaded, so an input
   filed for Jul 13 2026 covered Jul 13 of any year the user scrolled to. */
/* The label PARSE is memoised (25 Aug 26, same profile as baseYear above):
   a schedule pass calls this millions of times over the same handful of day
   and input labels, and the split/indexOf parse was the single hottest line
   in the app. Only the parse is cached — a given string always parses the
   same, so the memo is pure; the YEAR fallback (label year → row anchor →
   baseYear) still resolves per call, exactly as before, so nothing here can
   go stale when the loaded week or a row's `yr` changes. The map is capped:
   labels are typed by users and effectively bounded, but a runaway feed must
   degrade to a cleared cache, never to unbounded memory. */
const ORD_MEMO=new Map<any,any>();
export function dateOrd(lbl:any,fb?:any){
  let c=ORD_MEMO.get(lbl);
  if(c===undefined){
    const p=String(lbl==null?'':lbl).trim().split(/\s+/);
    const m=MONTHS.indexOf(p[0]), d=+p[1];
    c=(m<0||!isFinite(d))?null:{md:(m+1)*100+d,yl:p.length>2&&isFinite(+p[2])?+p[2]:null};
    if(ORD_MEMO.size>9000)ORD_MEMO.clear();
    ORD_MEMO.set(lbl,c);
  }
  if(c===null)return null;
  const y=c.yl!=null?c.yl:(isFinite(+fb)&&+fb>0?+fb:baseYear());
  return y*10000+c.md;
}
/* Does this input cover the loaded-week day labelled `dt`? Both sides resolve
   to REAL dates: dt through the week-label convention (bare = baseYear; a day
   outside the loaded week's own year is labelled WITH its year — weeks-data.ts
   weekLabels), the input's labels through its own `yr` anchor. The single-day
   arm used to be bare string equality, which is exactly how a 2026 input
   matched the same words meaning a 2027 day; it keeps string equality only as
   the fallback for a label no calendar can parse, where it can do no harm. */
export function inputCoversDate(inp:any,dt:any){
  const t=dateOrd(dt), a=dateOrd(inp.date,inp.yr);
  if(!inp.endDate){ if(t==null||a==null)return inp.date===dt; return t===a; }
  const b=dateOrd(inp.endDate,inp.yr);
  if(t==null||a==null||b==null)return false;
  return t>=a&&t<=b;
}
/* The loaded day index a label resolves to — BY DATE VALUE, never by string.
   DATES.indexOf(inp.date) was the other half of the cross-year bug: 'Jul 13'
   anchored to 2026 string-matched the 'Jul 13' of a loaded 2027 week, so the
   auto-land pass planted last year's input on this year's ground programme.
   Falls back to the plain indexOf only for an unparseable label. */
export function dateIx(lbl:any,yr?:any){
  const o=dateOrd(lbl,yr);
  if(o==null)return DATES.indexOf(lbl);
  for(let i=0;i<DATES.length;i++){ if(dateOrd(DATES[i])===o)return i; }
  return -1;
}
/* THE SANS RECORD COVERING one person on one day, or null — the single place
   that finds it, so sansGate (avail.ts), the badge below and the palette /
   week / board readers all see the same record. Returns the WHOLE input row
   (owner rework, 14 Aug 26 — it used to return just the `sans` payload): the
   offered events are flags in `rec.sans` ({f?:true, o?:true, a?:true}, absent
   = not offered) and the ONE shared window lives in the row's own standard
   allday / half / s / e fields, read through sansWindow below. */
export function sansAvailOn(id:any,dt:any){
  /* the RECORD, found by who is IN it ([ALL-AVAIL-AS-MEMBER] step 1 — namedOf, above): what is handed back is the input's
     own window, letters and remark — the same for everyone an admin files one offer for (D658) — and its callers hold it
     as the record it is (state/demosans.test.ts: "one span record answers for BOTH covered days"). */
  return inputsOn(dt).find((x:any)=>isSansAvail(x.type)&&namedOf(x).some((e:any)=>e.p===id))||null;
}
/* the record's one offered window in minutes, [s,e]. AM/PM are the same
   halves the standard template writes (HALF_AM/HALF_PM in ui/inputedit.tsx —
   00:00–12:00 / 12:01–23:59); a malformed record with neither flag nor both
   times fails OPEN to the whole day, the same call inpWin makes for a thin
   absence — the two readers must not disagree about what a broken row means. */
export function sansWindow(rec:any){
  if(!rec||rec.allday)return [0,1439];
  if(rec.half==='am')return [0,720];
  if(rec.half==='pm')return [721,1439];
  if(rec.s==null||rec.e==null)return [0,1439];
  /* roll an overnight offer the way inpWin does (inputs.ts, its own comment):
     the write path permits e<s for every half-day type, SANS included, so an
     offer typed 22:00–02:00 stores [1320,120]; left un-rolled, sansGate's
     containment could never read a night slot as covered. The two readers must
     not disagree about what an overnight row means. */
  return [rec.s,rec.e<rec.s?rec.e+1440:rec.e];
}
/* which events the record offers, as the scheduler reads them — "F/O/A",
   "F/O", "A"… Fixed f,o,a order regardless of tick order, so the same person
   reads the same way on the palette, the week group and the board panel. */
const SANS_ABBR:any={f:'F',o:'O',a:'A'};
export function sansLetters(rec:any){
  const ev=(rec&&rec.sans)||{};
  return ['f','o','a'].filter((k:any)=>ev[k]).map((k:any)=>SANS_ABBR[k]).join('/');
}
/* the badge beside a SANS member's name — letters plus the one window:
   "F/O/A" (all day), "F/O · AM", "A · 08:00–12:00". '' when no record is
   filed — every caller already treats an empty badge as "nothing to print"
   (see e.g. sbSansPanel/sansAvailHTML). */
export function sansBadge(id:any,dt:any){
  const rec=sansAvailOn(id,dt); if(!rec)return '';
  const w=rec.allday?'':rec.half==='am'?' · AM':rec.half==='pm'?' · PM'
    :(rec.s!=null&&rec.e!=null?` · ${hm24(rec.s)}–${hm24(rec.e)}`:'');
  return sansLetters(rec)+w;
}
/* ---- LATE INPUTS (owner, 9 Aug 26) ---------------------------------------
   The squadron wants members' inputs in before the week is planned, and wants
   a late one to SAY it is late wherever it appears. The deadline is the
   Monday of the week the INPUT'S OWN first day falls in, minus
   VCONF.inputLead days, and the deadline day itself is still on time — "no
   later than a week prior" means the 10th is fine for the week of the 17th,
   the 11th is not.

   THE DEADLINE RUNS WITH THE INPUT'S OWN WEEK (owner, 24 Aug 26 — "it's a
   running deadline"). It used to be computed from the LOADED week (CURWEEK),
   which was an invariant while every surface only ever drew the loaded
   week's inputs — and became silently wrong the day the Inputs page went
   global (22 Aug 26): a leave for 24 Dec filed four months early wore a
   LATE tag because the AUGUST week being viewed had a long-expired
   deadline. A span is judged by its FIRST day's week — the earliest week it
   touches, whose planning the change could have disturbed.

   What is measured is `mod`, the stamp the Inputs page prints as "Last
   modified" — so an input raised early but CHANGED after the deadline reads
   as late (owner's call, 9 Aug 26). That is the whole point: the deadline
   exists so the week can be planned against something that has stopped
   moving.

   DOWNCHITS ARE EXEMPT (owner, 9 Aug 26). A deadline asks a man to decide in
   advance; going DNIF is not a decision he makes, and a downchit raised the
   morning of the flight is the system working, not somebody being slack.
   Marking it would be scolding him for being ill, and — worse for the
   scheduler — it would put a badge on the one input type that is ALWAYS
   last-minute, which is how a mark stops meaning anything. Leave and overseas
   duty are NOT exempt: those are applied for, and applying late is exactly
   what this is about.
   Since 10 Aug 26 that exemption reads off the MEDICAL GROUP — HL, OML, ATT B
   and ATT C — because the plain "Downchit" type is gone and those four are
   what replaced it. The rule is unchanged in substance: none of the four is
   decided in advance either.

   This is a MARK, not a rule the validator reads. Nothing here raises a
   warning, changes availability, or touches a seat — a paperwork deadline
   does not belong in the list a scheduler reads for crew rest and double
   bookings. Deliberate, and recorded in docs/engine-rules.md.

   Anything with no usable stamp is NOT late. An unknown date is not evidence
   of lateness, and accusing an input because its record is thin is worse
   than staying quiet. */
const pad2=(n:any)=>String(n).padStart(2,'0');
const isISO=(s:any)=>/^\d{4}-\d{2}-\d{2}$/.test(String(s==null?'':s));
/* CURWEEK is 'dd/mm/yyyy'; everything below works in ISO so plain string
   comparison orders dates correctly and no Date object crosses a boundary. */
export function weekStartISO(wk?:any){
  const p=String(wk==null?CURWEEK:wk).split('/');
  if(p.length!==3)return '';
  const d=+p[0],m=+p[1],y=+p[2];
  return (isFinite(d)&&isFinite(m)&&isFinite(y))?`${y}-${pad2(m)}-${pad2(d)}`:'';
}
/* WHICH CUT-OFF JUDGES AN INPUT (owner D628, D639, 7 Oct 26): the SANS calendar and the Inputs calendar each have
   their own — a SANS availability input is judged by the SANS set, every other input by the Inputs set. */
const CUT_KEYS:any={inputs:['inputLead','inputCutMode','inputCutWd','inputCutWeeks'],
                    sans:['sansLead','sansCutMode','sansCutWd','sansCutWeeks']};
export function cutSetOf(inp:any){return inp&&isSansAvail(inp.type)?'sans':'inputs';}
/* how many days before its week's Monday a set's cut-off falls. Mode 1 — a weekday of a number of weeks before — is
   weeks x 7 less the weekday (Monday = 0), each held to a real value however it was stored: at least one week back, so
   a cut-off can never land inside the week it is for. Anything that is not exactly mode 1 is the day count, as the
   rule always was. */
/* THE SUM ITSELF, for any four values — exported so a calendar's settings window can show a worked date for a rule
   NOT YET SAVED by the same arithmetic the mark will judge by (state/cutoff.ts cutExample; 8 Oct 26 — the body is the
   one cutBackDays always had, moved out unchanged) */
export function cutBackOf(mode:any,lead:any,wd:any,weeks:any){
  if(mode===1){
    const wk=Math.min(8,Math.max(1,Math.floor(+weeks)||1)), d=Math.min(6,Math.max(0,Math.floor(+wd)||0));
    return wk*7-d;
  }
  return Math.max(0,+lead||0);
}
function cutBackDays(set:any){
  const k=CUT_KEYS[set==='sans'?'sans':'inputs'];
  return cutBackOf(VCONF[k[1]],VCONF[k[0]],VCONF[k[2]],VCONF[k[3]]);
}
/* the rule in words, as each calendar's "How this works" states it — from the set in force, so it changes when the
   setting does (D628, D646: the rule only; the date an entry missed is said by its LATE tag) */
const CUT_WD=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const CUT_N=['','one','two','three','four','five','six','seven','eight'];
export function cutRuleText(set:any){
  const k=CUT_KEYS[set==='sans'?'sans':'inputs'];
  if(VCONF[k[1]]===1){
    const wk=Math.min(8,Math.max(1,Math.floor(+VCONF[k[3]])||1)), wd=Math.min(6,Math.max(0,Math.floor(+VCONF[k[2]])||0));
    return wk===1?`the ${CUT_WD[wd]} of the week before`:`the ${CUT_WD[wd]} ${CUT_N[wk]} weeks before`;
  }
  const n=cutBackDays(set);
  return n===0?'the Monday the week starts':`${n} day${n===1?'':'s'} before the week starts`;
}
/* a week-start ISO date → that week's input deadline (its Monday minus the
   lead), '' in for '' out so unknown stays unknown */
function dueOfWeekISO(ws:any,set?:any){
  if(!ws)return '';
  const n=cutBackDays(set);
  const t=Date.UTC(+ws.slice(0,4),+ws.slice(5,7)-1,+ws.slice(8,10))-n*86400000;
  const d=new Date(t);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
}
/* the last day an input for the LOADED week (or the given week key) may be
   touched and still count as on time — kept for callers that reason about a
   week rather than an input (probe-bridge, tests); the mark itself judges
   each input by inputOwnDueISO below */
export function inputDueISO(wk?:any,set?:any){ return dueOfWeekISO(weekStartISO(wk),set); }
/* the Monday of the week the input's own FIRST day falls in, resolved
   through the row's anchor year (dateOrd + inp.yr, the 24 Aug 26 convention)
   so 'Jul 13' filed for 2027 is judged against 2027's week. '' when the date
   is unreadable — an unknown week is an unknown deadline, and unknown never
   accuses (the same rule inputStampISO already applies to the stamp). */
export function inputWeekStartISO(inp:any){
  const o=dateOrd(inp&&inp.date,inp&&inp.yr); if(o==null)return '';
  const ms=Date.UTC(Math.floor(o/10000),Math.floor(o/100)%100-1,o%100);
  const d=new Date(ms-(((new Date(ms).getUTCDay()+6)%7)*86400000));
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}`;
}
/* the running deadline: the last day THIS input may be touched and still
   count as on time, wherever the viewer happens to be */
export function inputOwnDueISO(inp:any){ return dueOfWeekISO(inputWeekStartISO(inp),cutSetOf(inp)); }
/* TODAY as an ISO 'yyyy-mm-dd' stamp — what every input WRITE path records as
   `mod`, FROZEN at the moment of the edit (ARCH-STACK 1b). The literal 'now'
   used to be stored instead and re-resolved to whatever "today" was at read
   time, so an input filed on time silently grew a LATE tag once the record was
   read back on a later day. CORRECTED 17 Sep 26: the old parenthesis called this
   "harmless while INPUTS are session-only and reset each reload; a real bug the
   moment they persist — the DB step". INPUTS ALREADY persist (inputs/all, since
   8 Sep 26), so that moment has passed and the freeze is load-bearing now, not
   pre-emptive. Freezing the stamp at write time makes the mark judge the day the input was actually last
   touched, wherever and whenever it is later read. */
export function nowStamp(){ const d=new Date(); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
/* The stamp the late-mark measures. `mod` is now always a frozen ISO date, so
   this is a plain read; the legacy 'now' branch stays as a defensive fallback
   for any record minted before the freeze. CORRECTED 17 Sep 26: the old reason
   given ("none persist today — INPUTS are session-only and demo data resets") was
   wrong on the first half; INPUTS persist. What keeps a pre-freeze record out is
   storage/reset.ts's SCHEMA_VERSION clearing `inputs` on an incompatible shape
   change, under the dev-phase reset-don't-migrate rule. The guard still costs
   nothing, so it stays. */
export function inputStampISO(inp:any){
  const m=inp&&inp.mod;
  if(m==='now')return nowStamp();
  return isISO(m)?String(m):'';
}
export function isLateInput(inp:any){
  /* an upchit is exempt with the downchits and by the same ruling — going up
     is decided by the medical officer, never in advance of a deadline */
  if(!inp||isDownchit(inp.type)||isUpchit(inp.type))return false;
  const s=inputStampISO(inp), due=inputOwnDueISO(inp);
  return !!s&&!!due&&s>due;
}
/* '2026-08-11' → '11 Aug', the form the rest of the app prints dates in */
export function isoLabel(iso:any){
  if(!isISO(iso))return '';
  return `${+String(iso).slice(8,10)} ${MONTHS[+String(iso).slice(5,7)-1]||''}`.trim();
}
/* The date tail the Inputs page and the Leave War sync both append to a
   personal input's remarks, so a reader sees how long it runs without anyone
   typing it and nobody has to repeat the type — the type column already says
   LL/OL (owner, Aug 26; extended to synced leave and single days 18 Aug 26).
   A span reads "till 17 Jul" (its LAST day). A single day reads "till 15 Jul"
   when `single` is 'till', "on 15 Jul" when 'on', or nothing when 'none'.
   The Inputs CALENDAR passes 'till' (owner, 18 Aug 26 — "a one-day input should
   still show till <date>"): its picker fires on the first click of a two-click
   range, and "till 13 Jul" showing then updating to "till 18 Jul" reads
   consistently, where the old "on 13 Jul" that VANISHED on the second click did
   not — which is why 'none' (no one-day token) existed and the calendar no
   longer needs it. A SYNCED leave, whose span is already settled when it mints,
   passes 'on'. Dates are ISO 'yyyy-mm-dd'. */
export function remarksDateTail(startISO:any, endISO:any, single:'on'|'none'|'till'){
  if(!endISO||endISO===startISO){
    if(single==='none'||!isISO(startISO))return '';
    return `${single==='till'?'till':'on'} ${isoLabel(startISO)}`;
  }
  return `till ${isoLabel(endISO)}`;
}
/* The date token, matched WHEREVER it sits in a remark — not anchored to the
   end. That is the difference the owner asked for (18 Aug 26): "if the user has
   till 13 Jul Bangkok, when the date changes the Bangkok remains." The token is
   the calendar's to rewrite; everything around it — before OR after — is the
   typist's and is kept.
   BOUNDED AT BOTH ENDS (review fix, 19 Aug 26): without \b the token matched
   MID-WORD — "Reunion 12 Jul dinner" matched the "on 12 Jul" inside "Reunion"
   and a re-pick rewrote it to "Reunitill 18 Jul dinner", destroying the
   typist's word. The trailing \b keeps "till 15 July" (the month written out)
   from being half-eaten the same way — an unrecognised spelling is left alone
   and the fresh token appended, which is the lesser wrong. */
const DATE_TOKEN=/\b(?:till|on)\s+\d{1,2}\s+[A-Za-z]{3}\b/i;
/* Rewrite (or insert, or remove) the date token inside a remark IN PLACE,
   leaving the surrounding prose untouched. `single` is passed straight to
   `remarksDateTail`: the Inputs calendar passes 'till' (a one-day pick reads
   "till <that day>"), a synced leave passes 'on'. When the desired
   token is empty and one is present it is dropped and the gap tidied; when it
   is present elsewhere it is replaced; otherwise it is appended. */
export function withRemarksTail(remark:any, startISO:any, endISO:any, single:'on'|'none'|'till'){
  const tok=remarksDateTail(startISO,endISO,single);
  const s=String(remark==null?'':remark);
  if(DATE_TOKEN.test(s)){
    return s.replace(DATE_TOKEN,tok).replace(/\s{2,}/g,' ').trim();
  }
  if(!tok)return s.trim();
  const head=s.trim();
  return head?`${head} ${tok}`:tok;
}
/* Which word a remark's date token uses — 'on' or 'till' — or null when it carries none (the absence-record re-test,
   AB3, 26 Sep 26): a leave the war or a medical CUTS keeps the typist's words but must not keep a "till" its dates no
   longer reach, and a piece keeps the token's own word ("on 9 Feb" stays an "on"). */
export function remarksTailWord(remark:any):'on'|'till'|null{const m=DATE_TOKEN.exec(String(remark==null?'':remark));return m?(/^on/i.test(m[0])?'on':'till'):null;}
/* what the mark says when you hover it — plain enough for the squadron */
export function lateNote(inp:any){
  if(!isLateInput(inp))return '';
  /* dates outside the loaded week's own year carry it — 'Jan 4 2027' — the
     same convention every label in the app follows (weekLabels, fmt) */
  const lbl=(iso:any)=>{const l=isoLabel(iso); const y=+String(iso).slice(0,4); return l&&y!==baseYear()?`${l} ${y}`:l;};
  return `Late input — last changed ${lbl(inputStampISO(inp))}, after the ${lbl(inputOwnDueISO(inp))} deadline for its week of ${lbl(inputWeekStartISO(inp))}.`;
}

