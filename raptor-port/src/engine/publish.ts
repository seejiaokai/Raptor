import { DAYS } from './data'
import { PEOPLE } from './people'
import { keyDay, uniqDays } from './keys'
import { isScheduler } from './people'
import { HOOKS } from './hooks'
import { logEdit } from './editlog'

/* the reference calls straight into the UI here; the engine routes those four
   calls through injected hooks (no-ops until the app provides them) so the
   bodies below stay verbatim */
const toast=(...a:any[])=>HOOKS.toast(...a);
const reflow=()=>HOOKS.reflow();
const histPush=()=>HOOKS.histPush();
const renderStatus=()=>HOOKS.renderStatus();
/* =====================================================================
   PUBLISH DAY (approve) + PUBLISH AL (amendment level, whole-schedule tint)
   ===================================================================== */
/* SCHED.pending  — keys edited since the last publish (no AL number yet)
   SCHED.changes  — key -> AL number it was published under (drives the colour)
   SCHED.als      — [{n, keys:[…]}] every published amendment, newest last
   SCHED.dayOK    — {di:1} the days that have been published (approved) INDIVIDUALLY.
                    Approval is per day, not per week: Monday can be published and
                    flown while Thursday is still being built. The week banner is a
                    summary of this object, never the source of truth. There is no
                    SCHED.approved / SCHED.dirty any more — both are derived.
   SCHED.cur      — {di: 'orig'|n} which version each day is CURRENTLY showing.
                    Stamped by alIssue and by restoreDayVersion; read through
                    dayCurVer(), which self-heals when the stamped version's
                    snapshot has gone (unpublishAL, undo past the issue).      */
export let SCHED:any={al:0, pending:{}, changes:{}, added:{}, als:[], dayOK:{}, sign:{}, orig:{}, cur:{}};
export function dayApproved(di:any){return !!SCHED.dayOK[di];}
export function approvedDays(){return DAYS.map((_:any,i:any)=>i).filter(dayApproved);}
export function dowShort(di:any){return String((DAYS[di]||{}).dow||('day '+di)).slice(0,3);}
export function daysLabel(list:any){return list.length?list.map(dowShort).join(', '):'—';}
/* An AL is a document that went out. Deleting a row afterwards renumbers or
   drops its keys, and the record used to shrink with them — "AL3 · 0 item" for
   an amendment the squadron is holding a printed copy of. What was ISSUED is
   stamped on the record and never recalculated; the live keys still drive the
   marks on screen. */
export function alDays(rec:any){ if(!rec)return [];
  const live=uniqDays(rec.keys);
  return live.length?live:(rec.days||[]).filter((i:any)=>i>=0&&i<DAYS.length);}
export function alCount(rec:any){return rec&&rec.n0!=null?rec.n0:((rec&&rec.keys||[]).length);}
export function dayALs(di:any){return SCHED.als.filter((a:any)=>alDays(a).includes(di)).map((a:any)=>a.n).sort((a:any,b:any)=>a-b);}
/* the version a day is currently showing. The stamp only counts while its
   snapshot still exists; otherwise fall back to the NEWEST ISSUE with a snap
   for this day — array order, not max-n, because publishAL can legally issue
   a lower number after a higher one was freed — then the Original, then null
   (never published). This derivation IS the orphan guard: a stale SCHED.cur
   entry after unpublishAL or an undo is inert, no cleanup pass exists. */
export function dayCurVer(di:any){di=+di;
  const v=(SCHED.cur||{})[di];
  if(v!=null&&daySnapOf(di,v))return v;
  for(let i=SCHED.als.length-1;i>=0;i--){const a=SCHED.als[i];if(a.snap&&a.snap[di])return a.n;}
  return (SCHED.orig||{})[di]?'orig':null;}
export function dayPendCount(di:any){return Object.keys(SCHED.pending).filter((k:any)=>keyDay(k)===di).length;}
export function pendDays(){return uniqDays(Object.keys(SCHED.pending));}
/* pending edits only become publishable amendments once their day is published —
   changes to a day that is still draft are just draft work, not an amendment */
export function publishableKeys(){return Object.keys(SCHED.pending).filter((k:any)=>dayApproved(keyDay(k)));}
export function setDayApproved(di:any,on:any){
  di=+di;
  if(on&&!daySigned(di))return toast(`${DAYS[di].dow} needs ${signMissing(di).join(', ')} before it can be published`);
  if(on){
    /* the day goes out AS IT STANDS. Everything pending on it up to this moment
       is the draft build, not an amendment to something previously issued —
       leaving those marks meant the day's first AL re-issued the whole day and
       claimed to have "changed" every field the schedulers had ever typed. */
    Object.keys(SCHED.pending).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.pending[k];});
    Object.keys(SCHED.added||{}).forEach((k:any)=>{if(keyDay(k)===di)delete SCHED.added[k];});
    SCHED.dayOK[di]=1; signClear(di);          // the signature is spent on the issue
    /* Original = the day as FIRST published. First publish wins: reopening voids
       the signature, not the history — a re-publish after reopen is a later
       state, and restamping would let a rewrite masquerade as the Original. */
    SCHED.orig=SCHED.orig||{};
    if(!SCHED.orig[di])SCHED.orig[di]=daySnap(di);}
  else {delete SCHED.dayOK[di]; signClear(di);} // reopening voids it — resign to reissue
  reflow(); histPush();
  toast(on?`${DAYS[di].dow} published — APPROVED`:`${DAYS[di].dow} reopened to draft`);
}
/* ---- per-day version snapshots -------------------------------------------
   A snapshot is the frozen day plus ITS slice of the changes map, taken at the
   moment of issue — it reproduces the day "as issued, wearing its marks". AL
   snapshots live ON the AL record (rec.snap) and the Original in SCHED.orig,
   so both ride the undo stack and unpublishAL with the state they belong to.
   Nothing here persists past the session — neither does the AL list itself. */
export function daySnap(di:any){di=+di;
  const c:any={}; Object.keys(SCHED.changes).forEach((k:any)=>{if(keyDay(k)===di)c[k]=SCHED.changes[k];});
  return {d:JSON.parse(JSON.stringify(DAYS[di])),c};}
export function daySnapOf(di:any,ver:any){di=+di;
  if(ver==='orig')return (SCHED.orig||{})[di]||null;
  const r=SCHED.als.find((a:any)=>a.n===+ver);
  return (r&&r.snap&&r.snap[di])||null;}   // records from before snapshots carry none
export function dayVersions(di:any){di=+di;
  const v:any[]=['live'];
  if((SCHED.orig||{})[di])v.push('orig');
  SCHED.als.slice().sort((a:any,b:any)=>a.n-b.n).forEach((a:any)=>{if(a.snap&&a.snap[di])v.push(a.n);});
  return v;}
export function verLabel(ver:any){return ver==='live'?'Live':(ver==='orig'?'Original':'AL'+ver);}
/* AL1 cyan · AL2 amber · AL3 bright green · AL4 white · AL5 purple · AL6 pink ·
   AL7 orange. Every entry has to read as an ALn tag in dark ink (#08131b) on top
   of itself, so the ramp stays light and saturated — the old AL5 magenta (#C21E93)
   was too dark for its own tag. Orange moved 6→7 to make room for the pink; it
   stays off green so it can never be misread as AL3, and it is the last entry,
   which alColor() also hands to any AL past the palette.
   Must stay in step with the [data-alc="n"]{--alc:…} rules in the stylesheet. */
export const AL_COLORS:any[]=['','#3BC6E8','#E5C24A','#3DE86B','#FFFFFF','#B388FF','#FF7FC4','#E5872B'];
export function alColor(n:any){return AL_COLORS[n]||AL_COLORS[AL_COLORS.length-1];}
export function pendCount(){return Object.keys(SCHED.pending).length;}
/* A deletion has no live cell left to carry its amendment mark. Reusing the
   deleted address would tint whatever row shifted into it, so removals use an
   inert synthetic key instead: del:DAY.SEQ.KIND. The day stays first after
   the prefix, which lets every existing day filter, snapshot and AL path
   treat it like an ordinary key; SEQ is derived from live/history keys, so it
   survives publish, unpublish, rollback and undo without extra counter state.
   KIND is controlled vocabulary for the AL panel, never user-entered text. */
export const DELETE_LABELS:any={line:'line',wave:'wave',note:'note',programme:'programme item',dutyblock:'duty block',duty:'duty row',sim:'sim row',ground:'ground item'};
export function isDeleteKey(key:any){return /^del:\d+\.\d+\.[a-z]+$/.test(String(key));}
export function deleteLabel(key:any){const k=String(key).split('.').pop()||'';return DELETE_LABELS[k]||'item';}
export function deleteCount(keys:any){return (keys||[]).filter(isDeleteKey).length;}
export function inputActionCount(keys:any){return (keys||[]).filter((k:any)=>/^inp:\d+\./.test(String(k))).length;}
function syntheticKey(prefix:any,di:any,kind:any){di=+di;
  const p=`${prefix}:${di}.`,keys=Object.keys(SCHED.pending||{}).concat(Object.keys(SCHED.changes||{}));
  (SCHED.als||[]).forEach((a:any)=>keys.push(...(a.keys||[])));
  let n=0;keys.forEach((k:any)=>{if(String(k).indexOf(p)!==0)return;const x=+String(k).slice(p.length).split('.')[0];if(isFinite(x)&&x>n)n=x;});
  return `${p}${n+1}.${kind}`;}
export function deletionKey(di:any,kind:any){kind=DELETE_LABELS[kind]?String(kind):'programme';return syntheticKey('del',di,kind);}
export function trackStructuralAdd(key:any){if(!key)return '';SCHED.added=SCHED.added||{};SCHED.added[String(key)]=1;return String(key);}
export function markStructuralAdd(key:any){trackStructuralAdd(key);markEdit(key);return String(key);}
export function structuralAddExists(key:any){
  const s=String(key),c=s.indexOf(':'),p=c<0?'':s.slice(0,c),a=(c<0?s:s.slice(c+1)).split('.'),di=+a[0],d=DAYS[di];
  if(!d)return false;
  if(p==='wl')return !!(d.waves||[])[+a[1]];
  if(p==='ff'){const w=(d.waves||[])[+a[1]];return !!(w&&(w.formations||[])[+a[2]]);}
  if(p==='fr'){const w=(d.waves||[])[+a[1]],f=w&&(w.formations||[])[+a[2]];return !!(f&&(f.aircraft||[])[+a[3]]);}
  if(p==='dn')return +a[1]<(d.notes||[]).length;
  if(p==='ap')return !!(d.allhands||[])[+a[1]];
  if(p==='dl')return !!(d.dutywaves||[])[+a[1]];
  if(p==='dr'){const b=(d.dutywaves||[])[+a[1]];return !!(b&&(b.rows||[])[+a[2]]);}
  if(p==='sr')return !!(((d.sims||{})[String(a[1])]||[])[+a[2]]);
  if(p==='g'||p==='gr')return !!(d.ground||[])[+a[1]];
  return false;
}
/* Whether the structure being removed was present in the day that is
   currently issued. Add -> delete before the next AL is a net no-op, not a
   removal. SCHED.added carries each draft addition's structural key through
   every reorder; issue clears it and unpublish restores it. The frozen issued
   snapshot remains the fallback for legacy/session data without that marker.
   Accepted Ground inputs also pass their stable source token. */
export function deletionWasIssued(di:any,kind:any,...at:any[]){di=+di;
  const added=SCHED.added||{};
  const has=(...keys:any[])=>keys.some((k:any)=>!!added[k]);
  if(kind==='line'&&has(`wl:${di}.${+at[0]}`,`ff:${di}.${+at[0]}.${+at[1]}.cs`,`fr:${di}.${+at[0]}.${+at[1]}.${+at[2]}`))return false;
  if(kind==='wave'&&has(`wl:${di}.${+at[0]}`))return false;
  if(kind==='note'&&has(`dn:${di}.${+at[0]}`))return false;
  if(kind==='programme'&&has(`ap:${di}.${+at[0]}.prog`))return false;
  if(kind==='dutyblock'&&has(`dl:${di}.${+at[0]}`))return false;
  if(kind==='duty'&&has(`dl:${di}.${+at[0]}`,`dr:${di}.${+at[0]}.${+at[1]}.role`))return false;
  if(kind==='sim'&&has(`sr:${di}.${String(at[0])}.${+at[1]}.label`))return false;
  if(kind==='ground'&&has(`gr:${di}.${+at[0]}.prog`,`g:${di}.${+at[0]}`))return false;
  if(!dayApproved(di))return true;
  const ver=dayCurVer(di),snap=ver!=null?daySnapOf(di,ver):null,d=snap&&snap.d;
  if(!d)return true;
  if(kind==='ground'&&at[1]!=null)return (d.ground||[]).some((r:any)=>r&&r.src===at[1]);
  /* The snapshot is indexed by the LIVE index, and a reorder makes the two
     diverge: add a draft row, Sort all, and the issued rows can sit at
     indices the shorter issued snapshot never had — so the lookup answered
     "never issued" about a row the squadron holds a printed copy of, and
     its removal reached no AL (audit, 12 Aug 26). The identity checks above
     have already said this row is NOT one of the outstanding draft adds, so
     when its index runs past the snapshot's tail while the live section is
     longer than the issued one, the surplus is exactly those draft adds and
     THIS row must be issued: say so. An in-range hit keeps the plain
     positional answer, which is also the whole story for legacy/session
     data that predates the identity markers. */
  const sectOf=(day:any):any[]=>{
    if(!day)return [];
    if(kind==='wave')return day.waves||[];
    if(kind==='line'){const w=(day.waves||[])[+at[0]],f=w&&(w.formations||[])[+at[1]];return (f&&f.aircraft)||[];}
    if(kind==='note')return day.notes||[];
    if(kind==='programme')return day.allhands||[];
    if(kind==='dutyblock')return day.dutywaves||[];
    if(kind==='duty'){const b=(day.dutywaves||[])[+at[0]];return (b&&b.rows)||[];}
    if(kind==='sim')return ((day.sims||{})[String(at[0])])||[];
    if(kind==='ground')return day.ground||[];
    return [];
  };
  const ix=kind==='line'?+at[2]:(kind==='duty'||kind==='sim')?+at[1]:+at[0];
  if(!isFinite(ix))return true;
  const was=sectOf(d);
  if(ix<was.length&&(kind==='note'||!!was[ix]))return true;
  return sectOf(DAYS[di]).length>was.length;
}
export function markDeletion(di:any,kind:any,wasIssued:any=true){if(!wasIssued)return '';const key=deletionKey(di,kind);markEdit(key);return key;}
/* Filing a personal input under Unavailable changes the issued day but has no
   programme row to tint. The permanent input ID makes one stable inert address per
   input/day, so filing then unfiling before issue remains one changed detail
   rather than two contradictory amendment items. Dots are escaped as well as
   URI punctuation because keyDay relies on the first dot ending the day. */
export function markInputFiling(di:any,token:any){const id=encodeURIComponent(String(token)).replace(/\./g,'%2E'),key=`inp:${+di}.${id}`;markEdit(key);return key;}
/* record an edit.  `key` is the slot/field address that changed — that single
   item is what gets coloured when the amendment is published.
   `was`/`now` are the edit log's (editlog.ts), and optional for the same
   reason noteChange's are: this function is called three different ways and
   only one of them knows both values. A funnel write passes them; a
   structural mark after an add passes a key alone (there is no "before"); the
   bare epilogue in afterSchedMutate() passes nothing at all. Only the first
   reaches the log, which is what keeps a phantom row off every mutation. */
export function markEdit(key?:any,was?:any,now?:any){
  if(key){ SCHED.pending[key]=1; delete SCHED.changes[key]; logEdit(key,was,now); }
  renderStatus();
  histPush();
}
/* the per-item amendment mark, emitted straight into the renderer's HTML.
   A pending edit on a PUBLISHED day is different from draft work: publishing a
   day clears its pending marks (the day goes out as it stands), so anything
   pending on it afterwards is exactly what the next AL will carry. Those keys
   also get data-aln — the AL number they will go out as — so the edit surfaces
   can paint them in that AL's colour before it exists (owner request, Aug 26;
   the view page ignores the attribute). nextAL() is the panel's default pick;
   choosing a different number in the dropdown is the one case the preview
   colour can be wrong, and it corrects itself on publish. */
export function alAttr(key:any){
  if(!key)return '';
  const n=SCHED.changes[key];
  if(n)return ` data-alc="${n}" title="Changed at AL${n}"`;
  if(SCHED.pending[key]){
    if(dayApproved(keyDay(key))){const x=nextAL();return ` data-alp="1" data-aln="${x}" title="Edited — goes out as AL${x}"`;}
    return ` data-alp="1" title="Edited — not published yet"`;
  }
  return '';
}
export function alUsed(){return SCHED.als.map((a:any)=>a.n);}
/* which days an AL would cover, and which of those are not signed right now */
export function alUnsignedDays(){return uniqDays(publishableKeys()).filter((di:any)=>!daySigned(di));}
export function canPublishAL(){return publishableKeys().length>0&&alUnsignedDays().length===0;}
export function publishAL(n:any){
  n=+n; if(!n||alUsed().includes(n))return toast('AL'+n+' already exists');
  if(!pendCount())return toast('Nothing to publish');
  const uns=alUnsignedDays();
  if(uns.length)return toast(`Sign off ${daysLabel(uns)} before publishing — ${signMissing(uns[0]).join(', ')} still open on ${dowShort(uns[0])}`);
  /* only edits on published days go out as an amendment; anything on a day still in
     draft stays pending until that day is published, so an AL never claims to amend
     something that was never issued in the first place */
  const keys=publishableKeys();
  if(!keys.length)return toast('Nothing to publish — publish a day first, then publish its changes');
  const {days,sign}=alIssue(n,keys);
  const who=sign[days[0]]||{};
  const held=pendCount();
  toast(`Published AL${n} · ${keys.length} item${keys.length>1?'s':''} on ${daysLabel(days)}`
    +(who.appr?` · approved by ${who.appr}`:'')
    +(held?` · ${held} change${held>1?'s':''} held on unpublished days`:''));
}
/* the shared issue step: mark the keys, record the AL with a name per covered
   day, and SPEND those days' signatures — the next amendment on them is signed
   for on its own merits. The days stay published; only the sign-off resets. */
export function alIssue(n:any,keys:any){
  const days=uniqDays(keys);
  const adds=Object.keys(SCHED.added||{}).filter((k:any)=>days.includes(keyDay(k)));
  /* A discarded add mark can still be present in the live day. If some other
     edit now issues that day, the snapshot issues the addition too, so put its
     identity key back into this AL explicitly rather than losing ownership. */
  adds.forEach((k:any)=>{if(!keys.includes(k))keys.push(k);});
  const carried=(SCHED.als||[]).flatMap((a:any)=>a.structAdds||a.adds||[]);
  const structAdds=[...new Set(carried.concat(adds))]
    .filter((k:any)=>days.includes(keyDay(k))&&structuralAddExists(k));
  keys.forEach((k:any)=>{SCHED.changes[k]=n; delete SCHED.pending[k];});
  const sign:any={}; days.forEach((di:any)=>{sign[di]=signNames(di);});
  SCHED.als.push({n,keys,sign,days:days.slice(),n0:keys.length,adds,structAdds});
  adds.forEach((k:any)=>delete SCHED.added[k]);
  /* freeze every covered day AFTER its marks are on — this is the document */
  const rec=SCHED.als[SCHED.als.length-1];
  rec.snap={}; days.forEach((di:any)=>{rec.snap[di]=daySnap(di);});
  SCHED.cur=SCHED.cur||{}; days.forEach((di:any)=>{SCHED.cur[di]=n;});   // issuing makes it current
  days.forEach((di:any)=>signClear(di));
  SCHED.al=Math.max(...alUsed());
  reflow(); histPush();   // publishing is its own undo step, not a silent baseline shift
  return {days,sign};
}
/* publish ONE day's pending edits as the next AL — pending on other days is
   untouched, and only this day's signature is spent. */
export function publishALDay(di:any){
  di=+di;
  if(!dayApproved(di))return toast(`${DAYS[di].dow} is still draft — publish the day before publishing its changes`);
  const keys=Object.keys(SCHED.pending).filter((k:any)=>keyDay(k)===di&&dayApproved(di));
  if(!keys.length)return toast(`No unpublished edits on ${DAYS[di].dow}`);
  const n=nextAL();
  if(!daySigned(di))return toast(`Sign off ${signMissing(di).join(', ')} before publishing AL${n}`);
  const {sign}=alIssue(n,keys);
  const who=sign[di]||{};
  const held=pendCount();
  toast(`Published AL${n} · ${keys.length} item${keys.length>1?'s':''} on ${dowShort(di)} only`
    +(who.appr?` · approved by ${who.appr}`:'')
    +(held?` · ${held} change${held>1?'s':''} held on other days`:''));
}
export function unpublishAL(n:any){
  n=+n; const ix=SCHED.als.findIndex((a:any)=>a.n===n); if(ix<0)return;
  const rec=SCHED.als.splice(ix,1)[0];
  rec.keys.forEach((k:any)=>{ if(SCHED.changes[k]===n){delete SCHED.changes[k]; SCHED.pending[k]=1;} });
  const surviving=new Set((SCHED.als||[]).flatMap((a:any)=>a.structAdds||a.adds||[]).filter(structuralAddExists));
  SCHED.added=SCHED.added||{};
  /* The last surviving snapshot that carried a structural addition may not be
     the AL that originally added it. When that final owner is unpublished,
     the still-live row becomes draft again even if its field key was owned by
     a different AL, so restore from structAdds rather than only rec.adds. */
  (rec.structAdds||rec.adds||[]).forEach((k:any)=>{if(!surviving.has(k)&&structuralAddExists(k))SCHED.added[k]=1;});
  SCHED.al=SCHED.als.length?Math.max(...alUsed()):0;
  reflow(); histPush();
  toast(`AL${n} (${daysLabel(alDays(rec))}) unpublished · ${rec.keys.length} change${rec.keys.length>1?'s':''} back to pending`);
}
export function discardPending(){ SCHED.pending={}; reflow(); histPush(); toast('Pending marks cleared'); }
/* re-validate + repaint every visible surface */
export const SIGN_ROLES:any[]=[['cur','CUR CK',false],['sked','SKED CK',true],['plan','PLANNED BY',true],['appr','APPROVED BY',true]];
export function signOf(di:any){SCHED.sign=SCHED.sign||{}; return (SCHED.sign[+di]=SCHED.sign[+di]||{cur:'',sked:'',plan:'',appr:''});}
/* a name only counts while it is still appointed — withdrawing someone's
   Scheduler qual after they signed used to leave the day looking signed */
export function signMissing(di:any){const g=signOf(di);
  return SIGN_ROLES.filter((r:any)=>!g[r[0]]||(r[2]&&!isScheduler(g[r[0]]))).map((r:any)=>r[1]);}
export function daySigned(di:any){return signMissing(di).length===0;}
export function signClear(di:any){SCHED.sign[+di]={cur:'',sked:'',plan:'',appr:''};}
export function signNames(di:any){const g=signOf(di),o:any={};SIGN_ROLES.forEach((r:any)=>{const p=PEOPLE[g[r[0]]];o[r[0]]=p?p.cs:'';});return o;}
export function signPeople(schedOnly:any,keep?:any){
  const ids=Object.keys(PEOPLE).filter((id:any)=>!PEOPLE[id].special&&!PEOPLE[id].archived
      &&(!schedOnly||isScheduler(id)));
  /* a name already signed stays offered even if the appointment was since
     withdrawn, so an existing signature never silently blanks itself */
  if(keep&&PEOPLE[keep]&&!ids.includes(keep))ids.push(keep);
  return ids.sort((a:any,b:any)=>PEOPLE[a].cs.localeCompare(PEOPLE[b].cs));
}
/* lowest unused AL number */
export function nextAL(){const used=alUsed(); let n=1; while(used.includes(n))n++; return n;}
