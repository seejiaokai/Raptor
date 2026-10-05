/* One transient adapter for native Board fields and week contenteditables. Insertion never
   replaces a programme row or changes focus/selection. Decisions go through the typed intent. */
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { missionContext, encodeRoleId } from '../engine/mission-role'
import { dayIso } from '../engine/verid'
import { missionTracking, missionTrackingEpoch } from '../engine/insights-config'
import { roleTarget, targetIsCurrent, sameQuestion, readRole, setMissionRole, invalidateRoleTargets, roleTargetGeneration } from '../state/mission-roles'
import type { RoleTarget } from '../state/mission-roles'
import { canEditSched } from '../state/auth'
import { CURPAGE, SBDAY, DPREV, esc, navGen, VIEW_RESET } from '../state/view'
import { subscribe, subscribeBoard } from '../state/store'
import { isOk } from '../command'
import { HOOKS } from '../engine/hooks'
import { txtGet } from '../engine/slots'
type Caret={start:number;end:number;direction:'forward'|'backward'|'none'}|{anchor:number;focus:number}
function caretOf(field:HTMLElement):Caret|undefined {
  if(field instanceof HTMLTextAreaElement||field instanceof HTMLInputElement){if(field.selectionStart==null||field.selectionEnd==null)return;return {start:field.selectionStart,end:field.selectionEnd,direction:field.selectionDirection||'none'}}
  const s=window.getSelection();if(!s?.anchorNode||!s.focusNode||!field.contains(s.anchorNode)||!field.contains(s.focusNode))return
  const offset=(node:Node,n:number)=>{const r=document.createRange();r.selectNodeContents(field);r.setEnd(node,n);return r.toString().length}
  return {anchor:offset(s.anchorNode,s.anchorOffset),focus:offset(s.focusNode,s.focusOffset)}
}
function returnCaret(field:HTMLElement,caret?:Caret):void {
  if(!field.isConnected)return
  field.focus({preventScroll:true})
  if(!caret)return
  if('start' in caret&&(field instanceof HTMLTextAreaElement||field instanceof HTMLInputElement)){field.setSelectionRange(caret.start,caret.end,caret.direction);return}
  if('anchor' in caret){
    const point=(n:number):[Node,number]=>{const it=document.createTreeWalker(field,NodeFilter.SHOW_TEXT);let node:Node|null;while((node=it.nextNode())){const len=node.textContent?.length||0;if(n<=len)return [node,n];n-=len}return [field,field.childNodes.length]}
    const a=point(caret.anchor),f=point(caret.focus);window.getSelection()?.setBaseAndExtent(a[0],a[1],f[0],f[1])
  }
}
/* TWO SLOTS, NEVER ONE (W9, the Codex stack check, 5 Oct 26; D523, D527, D529, D535). `asking` is the ONE open Blue/Red
   question (D523: never two). `offered` is the temporary Choose / Change button under the Remarks he is in. They were one
   record, so an open question — which D535 keeps through other edits — left no room for any other formation's button,
   and the focus handler never looked at the box he had just selected. The button is not drawn for the formation whose
   question is already open (the question is its bigger self); pressing another formation's button moves the one
   question there, as the automatic question already does (newest wins). */
type Offer={ target:RoleTarget; question:boolean; node:HTMLElement; field:HTMLElement; caret?:Caret; place:string }
let asking: Offer | null=null
let offered: Offer | null=null
const slot=(question:boolean)=>question?asking:offered
const sameFormation=(a:RoleTarget,b:RoleTarget)=>a.di===b.di&&a.formationRid===b.formationRid
let timer:ReturnType<typeof setTimeout> | undefined
let offerEpoch=0
const fieldKey=(el:HTMLElement)=>el.dataset.txt || el.dataset.bfld || ''
function editFacts(el:HTMLElement) {
  const key=fieldKey(el), m=/^(fr|ff):(\d+)\.(\d+)\.(\d+)(?:\.(\d+)|\.msn)$/.exec(key)
  if(!m || (m[1]==='fr'&&!/^fr:\d+\.\d+\.\d+\.\d+$/.test(key)) || DPREV.has(+m[2]!)) return null
  const di=+m[2]!, f=DAYS[di]?.waves?.[+m[3]!]?.formations?.[+m[4]!]
  if(!f?.rid) return null
  return {di,rid:f.rid,id:encodeRoleId({weekKey:CURWEEK,dayISO:dayIso(CURWEEK,di),formationRid:f.rid,context:missionContext(f)}),week:CURWEEK,nav:navGen(),trackingEpoch:missionTrackingEpoch()}
}
function focusedTarget(el:HTMLElement):RoleTarget|null {
  if(el.dataset.roleRemarks) return roleTarget(Number(el.dataset.roleDay),el.dataset.roleRemarks)
  if(!fieldKey(el).startsWith('fr:')) return null
  const f=editFacts(el)
  return f ? roleTarget(f.di,f.rid) : null
}
function remarksFor(t:RoleTarget):HTMLElement|null {
  const root=SBDAY!=null?document.getElementById('sbBoard'):document.getElementById('eWeek')
  if(!root) return null
  const published=[...root.querySelectorAll<HTMLElement>('[data-role-remarks]')].find(n=>n.dataset.roleRemarks===t.formationRid && Number(n.dataset.roleDay)===t.di)
  if(published) return published
  const day=DAYS[t.di]
  for(const [gi,w] of (day?.waves||[]).entries()) for(const [li,f] of (w.formations||[]).entries()) if(f.rid===t.formationRid)
    return root.querySelector<HTMLElement>(`[data-bfld="fr:${t.di}.${gi}.${li}.0"],[data-txt="fr:${t.di}.${gi}.${li}.0"]`)
  return null
}
function anchor(t:RoleTarget):HTMLElement|null {
  const root=SBDAY!=null?document.getElementById('sbBoard'):document.getElementById('eWeek')
  return root ? [...root.querySelectorAll<HTMLElement>('.sb-area[data-role-formation],.form[data-role-formation]')].find(n=>n.dataset.roleFormation===t.formationRid && Number(n.dataset.roleDay)===t.di) || null : null
}
/* where the formation sits on its day — a structural move, delete or replacement changes it, and that still dismisses
   an open question (the plan's rule, kept by D535); an edit elsewhere on the day leaves it where it was */
function placeOf(t:RoleTarget):string {
  for(const [gi,w] of (DAYS[t.di]?.waves||[]).entries()) for(const [li,f] of (w.formations||[]).entries()) if(f.rid===t.formationRid) return `${gi}.${li}.${(f.aircraft||[]).length}`
  return ''
}
function clearAsking():void {asking?.node.remove();asking=null}
function clearOffered():void {offered?.node.remove();offered=null}
const clearSlot=(question:boolean)=>question?clearAsking():clearOffered()
function clear():void {clearAsking();clearOffered()}
export function resetMissionRoleOffer():void {offerEpoch++;if(timer)clearTimeout(timer);timer=undefined;clear();invalidateRoleTargets()}
/** Pointer activation intentionally keeps the editor focused. Commit its visible words through
 * the existing native editor event, then resolve a new guarded target. Never answer a cached
 * context while a different context is still being typed. Read-only issued Remarks have no writer. */
function saveVisibleText(t:RoleTarget,origin:HTMLElement):RoleTarget|null {
  if(t.origin!=='working')return t
  const active=(document.activeElement as HTMLElement|null)?.closest<HTMLElement>('[data-txt],[data-bfld]')
  const facts=active&&editFacts(active)
  const field=facts&&facts.di===t.di&&facts.rid===t.formationRid?active!:origin
  const source=editFacts(field)
  if(!source||source.di!==t.di||source.rid!==t.formationRid)return null
  const raw=field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement?field.value:field.textContent
  const value=String(raw??'').replace(/\s+/g,' ').trim(),want=value==='—'?'':value
  if(String(txtGet(fieldKey(field))??'')!==want){
    field.dispatchEvent(field.dataset.bfld?new Event('change',{bubbles:true}):new FocusEvent('focusout',{bubbles:true}))
    // The click handles the fresh question itself; suppress the writer event's deferred offer.
    offerEpoch++
    if(String(txtGet(fieldKey(field))??'')!==want)return null
  }
  return roleTarget(t.di,t.formationRid)
}
function show(t:RoleTarget,question:boolean,field:HTMLElement):void {
  if(!targetIsCurrent(t)) return clearSlot(question)
  const at=anchor(t);if(!at)return clearSlot(question)
  /* the formation whose question is open gets no button beside it */
  if(!question&&asking&&sameFormation(asking.target,t)) return clearOffered()
  const held=slot(question), other=slot(!question)
  if(held?.target.id===t.id && held.node.isConnected) return
  /* the caret remembered for this box, whichever slot was holding it (a button turning into its question keeps it) */
  const caret=held?.field===field?held.caret:other?.field===field?other.caret:caretOf(field)
  clearSlot(question)
  /* a question opening for a formation takes that formation's button with it */
  if(question&&offered&&sameFormation(offered.target,t)) clearOffered()
  const node=document.createElement(question?'section':'div')
  node.className=question?'mission-role-question':'mission-role-action';node.dataset.roleUi='';node.setAttribute('aria-label',`Mission role for ${t.name}`)
  node.innerHTML=question?`<div class="words"><span class="context">${esc(t.label)}</span><strong>${esc(t.name)}: Blue or Red?</strong><p>Mission or remarks mention DS or RED.</p></div><div class="choices"><button type="button" data-role-side="blue">Blue</button><button type="button" data-role-side="red">Red</button><button type="button" class="later" data-role-side="later">Later</button></div>`:`<span>${esc(t.label)}</span><button type="button" data-role-choose>${readRole(t.id)?'Change':'Choose'} mission role</button>`
  node.addEventListener('pointerdown',e=>{if((e.target as HTMLElement).closest('button')) e.preventDefault()})
  node.addEventListener('mousedown',e=>{if((e.target as HTMLElement).closest('button')) e.preventDefault()})
  node.addEventListener('click',e=>{
    e.preventDefault();e.stopImmediatePropagation()
    const b=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!b)return
    const mine=slot(question)
    if(!mine || mine.node!==node || !targetIsCurrent(t)) {if(mine?.node===node)clearSlot(question);else node.remove();return}
    const keyboard=document.activeElement===b
    const active=document.activeElement as HTMLElement
    const focused=active?.closest<HTMLElement>('[data-txt],[data-bfld]')
    const restore=keyboard?field:focused
    const savedCaret=restore?caretOf(restore)||mine.caret:undefined
    const fresh=saveVisibleText(t,field)
    if(!fresh){clearSlot(question);if(restore)returnCaret(restore,savedCaret);return}
    if(b.hasAttribute('data-role-choose')) {show(fresh,true,field);if(restore)returnCaret(restore,savedCaret);return}
    const side=b.dataset.roleSide
    if(side==='later') {clearAsking();if(restore)returnCaret(restore,savedCaret);return}
    if(side==='blue'||side==='red') {
      const result=setMissionRole(fresh,side)
      if(isOk(result)) {clearAsking();if(restore)returnCaret(restore,savedCaret)}
      else if('ok' in result&&!result.ok) {clearAsking();HOOKS.toast('message' in result&&result.message?String(result.message):'That mission-role question is no longer current. Select Remarks to try again.')}
    }
  })
  at.after(node)
  const made:Offer={target:t,question,node,field,caret,place:placeOf(t)}
  if(question)asking=made;else offered=made
}
export function reconcileMissionRoleOffer():void {
  reconcileAsking()
  /* the button: a stale one goes (the next focus draws a fresh one), as it always did; one a repaint dropped is put back */
  if(!offered)return
  if(!targetIsCurrent(offered.target)) return clearOffered()
  if(!offered.node.isConnected) {
    const {target}=offered, field=remarksFor(target)
    if(!field)return clearOffered()
    offered=null;show(target,false,field)
  }
}
function reconcileAsking():void {
  if(!asking)return
  if(!targetIsCurrent(asking.target)) {
    /* D535 (3 Oct 26): an open QUESTION stays through an unrelated edit on the same day. It continues on a freshly
       resolved target — the buttons are rebuilt on it, so an answer is still checked against today's facts. */
    const fresh=asking.place===placeOf(asking.target)?sameQuestion(asking.target):null
    const field=fresh&&remarksFor(fresh)
    if(!fresh||!field)return clearAsking()
    const caret=asking.field===field?asking.caret:undefined
    clearAsking();show(fresh,true,field)
    const now=asking as Offer|null
    if(now&&caret)now.caret=caret
    return
  }
  if(!asking.node.isConnected) {
    const {target}=asking, field=remarksFor(target)
    if(!field)return clearAsking()
    asking=null;show(target,true,field)
  }
}
export function installMissionRoleOffers():()=>void {
  let alive=true
  const focus=(e:FocusEvent)=>{
    const el=(e.target as HTMLElement).closest<HTMLElement>('[data-txt],[data-bfld],[data-role-remarks]')
    if((e.target as HTMLElement).closest('[data-role-ui]'))return
    /* an open question is re-checked, and stays; the box he has just selected is ALWAYS looked at (W9) */
    if(asking) reconcileAsking()
    const t=el && missionTracking()&&canEditSched() ? focusedTarget(el) : null
    if(t&&el)show(t,false,el);else clearOffered()
  }
  const edit=(e:Event)=>{
    const el=(e.target as HTMLElement).closest<HTMLElement>('[data-txt],[data-bfld]')
    if(!el||!missionTracking()||!canEditSched()||CURPAGE!=='editsched')return
    const before=editFacts(el),epoch=offerEpoch,gen=roleTargetGeneration();if(!before)return
    setTimeout(()=>{
      if(!alive || epoch!==offerEpoch || gen!==roleTargetGeneration() || CURWEEK!==before.week || navGen()!==before.nav || missionTrackingEpoch()!==before.trackingEpoch)return
      const after=roleTarget(before.di,before.rid)
      if(after&&after.id!==before.id&&!readRole(after.id)) {const field=remarksFor(after);if(field)show(after,true,field)}
      else if(offered && document.activeElement!==offered.field && !(document.activeElement as HTMLElement)?.closest('[data-role-ui]'))clearOffered()
    },0)
  }
  const blur=(e:FocusEvent)=>{
    for(const held of [asking,offered]) if(held?.field===e.target)held.caret=caretOf(held.field)
    edit(e)
    const epoch=offerEpoch
    setTimeout(()=>{if(alive&&epoch===offerEpoch&&offered && document.activeElement!==offered.field && !(document.activeElement as HTMLElement)?.closest('[data-role-ui]'))clearOffered()},0)
  }
  const schedule=()=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>{timer=undefined;reconcileMissionRoleOffer()},0)}
  const structural=(e:MouseEvent)=>{
    if(!missionTracking()||!canEditSched()||CURPAGE!=='editsched'||(SBDAY!=null&&DPREV.has(SBDAY)))return
    if(!(e.target as HTMLElement).closest('[data-ldel],[data-lac],[data-gline],[data-wmkind]'))return
    const week=CURWEEK,nav=navGen(),epoch=missionTrackingEpoch(),offer=offerEpoch,gen=roleTargetGeneration(),before=new Map<string,string>()
    DAYS.forEach((d,di)=>d.waves?.forEach((w:any)=>w.formations?.forEach((f:any)=>{if(f.rid)before.set(`${di}/${f.rid}`,missionContext(f))})))
    setTimeout(()=>{
      if(!alive||offer!==offerEpoch||gen!==roleTargetGeneration()||CURWEEK!==week||navGen()!==nav||missionTrackingEpoch()!==epoch)return
      const changed:RoleTarget[]=[];let changedIdentities=0
      DAYS.forEach((d,di)=>d.waves?.forEach((w:any)=>w.formations?.forEach((f:any)=>{
        if(!f.rid||before.get(`${di}/${f.rid}`)===missionContext(f))return
        changedIdentities++
        const t=roleTarget(di,f.rid);if(t&&!readRole(t.id))changed.push(t)
      })))
      if(changedIdentities===1&&changed.length===1){const t=changed[0]!,field=remarksFor(t);if(field)show(t,true,field)}
    },0)
  }
  const off=subscribe(schedule),offBoard=subscribeBoard(schedule)
  document.addEventListener('focusin',focus,true);document.addEventListener('focusout',blur,true);document.addEventListener('change',edit,true)
  document.addEventListener('click',structural,true)
  if(!VIEW_RESET.some(r=>r.name==='missionRoleOffer'))VIEW_RESET.push({name:'missionRoleOffer',scopes:['week','session'],reset:resetMissionRoleOffer})
  return ()=>{alive=false;off();offBoard();document.removeEventListener('focusin',focus,true);document.removeEventListener('focusout',blur,true);document.removeEventListener('change',edit,true);document.removeEventListener('click',structural,true);resetMissionRoleOffer()}
}
