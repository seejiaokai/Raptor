import { DAYS } from './data'
import { PEOPLE } from './people'
import { keyDay, uniqDays } from './keys'
import { isScheduler } from './people'
import { HOOKS } from './hooks'

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
                    SCHED.approved / SCHED.dirty any more — both are derived.      */
export let SCHED:any={al:0, pending:{}, changes:{}, als:[], dayOK:{}, sign:{}};
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
    SCHED.dayOK[di]=1; signClear(di);}          // the signature is spent on the issue
  else {delete SCHED.dayOK[di]; signClear(di);} // reopening voids it — resign to reissue
  reflow(); histPush();
  toast(on?`${DAYS[di].dow} published — APPROVED`:`${DAYS[di].dow} reopened to draft`);
}
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
/* record an edit.  `key` is the slot/field address that changed — that single
   item is what gets coloured when the amendment is published. */
export function markEdit(key?:any){
  if(key){ SCHED.pending[key]=1; delete SCHED.changes[key]; }
  renderStatus();
  histPush();
}
/* the per-item amendment mark, emitted straight into the renderer's HTML */
export function alAttr(key:any){
  if(!key)return '';
  const n=SCHED.changes[key];
  if(n)return ` data-alc="${n}" title="Changed at AL${n}"`;
  if(SCHED.pending[key])return ` data-alp="1" title="Edited — not published yet"`;
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
  keys.forEach((k:any)=>{SCHED.changes[k]=n; delete SCHED.pending[k];});
  const days=uniqDays(keys);
  const sign:any={}; days.forEach((di:any)=>{sign[di]=signNames(di);});
  SCHED.als.push({n,keys,sign,days:days.slice(),n0:keys.length});
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
