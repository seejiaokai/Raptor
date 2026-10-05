/* MIX14 MIX17 MIX18 — the Opus interim read's three findings (D533), fixed under D534 — each pinned through the routes the screens use.
   F1: the read-only Remarks door on the Board's latest-published view keeps the amendment mark.
   F2 (D535): an open Blue/Red question survives an unrelated edit on the same day, and still answers afresh.
   F3: a role copied by a day template is named in History by its formation, never by the row's internal id.
   Report: docs/handpass/2026-10-03-insights-mission-mix-opus-interim.md. */
// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, dayCurVer } from '../engine/publish'
import { storeBackend } from '../engine/hooks'
import { ELOG } from '../engine/editlog'
import { addDayTpl } from '../engine/daytpl'
import { setMissionTracking } from '../engine/insights-config'
import { initStore, writeText } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV } from '../state/view'
import { roleTarget, hydrateRoles, readRole, setMissionRole } from '../state/mission-roles'
import { schedBaselineClean, commitPublishALDay } from '../state/sched-commit'
import { txtGet } from '../engine/slots'
import { isOk } from '../command'
import { resetMissionRoleOffer } from './mission-role-offer'
import { boardHTML, pickDayTpl } from './board'
import { withDaySnap } from './html'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true
const baseline=JSON.stringify(DAYS)
let host:HTMLDivElement, root:Root
const q=(s:string)=>document.querySelector<HTMLElement>(s)!
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,20))})
const click=async(el:HTMLElement)=>act(async()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})))
const type=async(key:string,value:string)=>{const f=q(`#eWeek [data-txt="${key}"]`);await act(async()=>{f.textContent=value;f.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle()}
const labels=()=>[...document.querySelectorAll('.mission-role-question')].map(n=>String(n.getAttribute('aria-label'))).sort()
/* a formation's own question, by the callsign in its label; `di` picks the day when two days carry the same callsign */
const question=(cs:string,di?:number)=>[...document.querySelectorAll<HTMLElement>('.mission-role-question')].find(n=>n.getAttribute('aria-label')===`Mission role for ${cs}`&&(di==null||(n.previousElementSibling as HTMLElement|null)?.dataset.roleDay===String(di)))!
const side=(cs:string,which:string)=>question(cs).querySelector<HTMLElement>(`[data-role-side="${which}"]`)!
const sign=(di:number)=>{const g=signOf(di);g.cur='ignite';g.sked='bane';g.plan='stiff';g.appr='pump'}
beforeEach(async()=>{
  const mem:Record<string,string>={};storeBackend.impl={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v},keys:()=>Object.keys(mem)}
  DAYS.splice(0,DAYS.length,...JSON.parse(baseline))
  const f=DAYS[0].waves[0]!.formations[0]!;f.msn='ACM';f.aircraft.forEach((a:any)=>a.rmks='')
  Object.assign(SCHED,{pending:{},changes:{},added:{},als:[],al:0,dayOK:{},sign:{},orig:{},cur:{},retired:{},signBind:{},drafts:{},curDraft:{},correcting:{}})
  initStore();hydrateRoles([]);setSession({user:'ad',role:'admin'});setPage('editsched');DPREV.clear();setMissionTracking(true);schedBaselineClean()
  host=document.createElement('div');document.body.append(host);root=createRoot(host)
  await act(async()=>root.render(<App/>));await settle()
})
afterEach(async()=>{await act(async()=>root.unmount());host.remove();resetMissionRoleOffer();DPREV.clear();storeBackend.impl=null;hydrateRoles([]);DAYS.splice(0,DAYS.length,...JSON.parse(baseline))})

it('F1 — the read-only Remarks door on the latest published Board keeps its "Changed at AL" mark',()=>{
  sign(0);setDayApproved(0,true)
  expect(writeText('fr:0.0.0.0','DS FOR ALPHA')).toBeTruthy()
  sign(0);expect(isOk(commitPublishALDay(0))).toBe(true)
  const ver=dayCurVer(0);DPREV.set(0,ver)
  const d=document.createElement('div');d.innerHTML=withDaySnap(0,ver,()=>boardHTML(0,true))
  const door=d.querySelector<HTMLElement>('[data-role-remarks]')
  expect(door,'the conditional formation offers the read-only door').toBeTruthy()
  expect(door!.hasAttribute('data-bfld'),'never a schedule-edit key on a frozen programme').toBe(false)
  expect(door!.getAttribute('data-alc'),'the amendment that changed these Remarks still marks them').toBe('1')
  /* the same box with tracking Off is the ordinary disabled field, marked the same way */
  setMissionTracking(false)
  const off=document.createElement('div');off.innerHTML=withDaySnap(0,ver,()=>boardHTML(0,true))
  expect(off.querySelector('[data-bfld="fr:0.0.0.0"]')!.getAttribute('data-alc')).toBe('1')
})

it('F2 (D535) — an open question stays through an unrelated edit on the same day, then answers the same formation',async()=>{
  await type('fr:0.0.0.0','DS FOR EAGLE')
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  const f=DAYS[0].waves[0]!.formations[0]!,id=roleTarget(0,f.rid!)!.id
  /* another formation's take-off — nothing about this formation's mission or cue wording */
  const other=`ff:0.0.1.to`,was=txtGet(other)
  await type(other,was==='09:15'?'09:20':'09:15')
  expect(txtGet(other),'the unrelated edit really saved').not.toBe(was)
  expect(document.querySelectorAll('.mission-role-question'),'the question is still on screen, once').toHaveLength(1)
  /* and a crew-or-timing edit on the SAME formation (D525: those never ask again, and never dismiss either) */
  await type('ff:0.0.0.to','08:45')
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  await click(q('[data-role-side="red"]'));await settle()
  expect(readRole(id)?.side,'the answer lands on the formation that asked').toBe('red')
  expect(document.querySelectorAll('[data-role-ui]')).toHaveLength(0)
})

it('F2 (D535) — the question still goes when its own wording stops asking, or tracking is turned Off',async()=>{
  await type('fr:0.0.0.0','DS FOR EAGLE')
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  await type('fr:0.0.0.0','ordinary briefing')
  expect(document.querySelector('.mission-role-question'),'no cue left, nothing to ask').toBeNull()
  await type('fr:0.0.0.0','RED FROM VIPER')
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  await act(async()=>{setMissionTracking(false)});await settle()
  expect(document.querySelector('.mission-role-question')).toBeNull()
})

it('F3 — a role copied by a day template is named in History by its formation, not by a row id',async()=>{
  await type('fr:0.0.0.0','DS FOR EAGLE')
  const f=DAYS[0].waves[0]!.formations[0]!
  expect(isOk(setMissionRole(roleTarget(0,f.rid!)!,'red'))).toBe(true)
  const tpl=addDayTpl(0)!
  expect(tpl.missionRoleSeeds?.seeds,'the answered formation travels as a seed').toHaveLength(1)
  const from=ELOG.rows.length
  let r='';await act(async()=>{r=pickDayTpl(1,tpl.id)});await settle()
  expect(r).toBe('applied')
  const dest=DAYS[1].waves[0]!.formations[0]!
  const line=ELOG.rows.slice(from).find((x:any)=>x.fld==='mission-role')
  expect(line,'the copy leaves its own History line').toBeTruthy()
  expect(String(line!.lbl)).toBe(`${dest.cs} · mission role · copied with the day template`)
  expect(String(line!.lbl),'never the internal row id').not.toContain(String(dest.rid))
})

/* W9 (the Codex stack check, 5 Oct 26; D527, D529, D523): while ONE formation's question was open, selecting any other
   formation's Remarks showed nothing — the handler returned before it looked at the newly selected box. Since D535
   keeps a question open through other edits, that locked every other line out for as long as it stayed. A question and
   a button are two different things, and the button is for whichever Remarks he is in.
   D598 (owner, 6 Oct 26) changed the END of this test: pressing the second formation's button used to MOVE the one
   question there; a newer question never removes an older one now, so both stand, each under its own formation. */
it('W9 — with one formation’s question open, another formation’s Remarks still offers Choose / Change, and pressing it opens a SECOND question beside the first (D598)',async()=>{
  expect(writeText('fr:0.0.1.0','RED AIR'),'the second formation carries a cue of its own').toBeTruthy()
  await settle()
  await type('fr:0.0.0.0','DS FOR EAGLE')
  const a=DAYS[0].waves[0]!.formations[0]!,b=DAYS[0].waves[0]!.formations[1]!
  expect(document.querySelectorAll('.mission-role-question'),'the first formation asks').toHaveLength(1)
  expect(q('.mission-role-question').textContent).toContain(String(a.cs))
  const other=q('#eWeek [data-txt="fr:0.0.1.0"]')
  await act(async()=>{other.focus();other.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  expect(document.querySelectorAll('.mission-role-question'),'the open question stays (D535)').toHaveLength(1)
  const btn=document.querySelector<HTMLElement>('.mission-role-action [data-role-choose]')
  expect(btn,'and the selected Remarks has its button').toBeTruthy()
  expect(btn!.closest('.mission-role-action')!.getAttribute('aria-label')).toBe(`Mission role for ${b.cs}`)
  expect(btn!.textContent).toBe('Choose mission role')
  /* the button never doubles the question of the formation that is already asking */
  const own=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{own.focus();own.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  expect(document.querySelectorAll('.mission-role-action'),'no button under the formation whose question is open').toHaveLength(0)
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  /* back to the second formation: press its button — its question opens, and the first formation's STAYS (D598) */
  await act(async()=>{other.focus();other.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  await click(q('.mission-role-action [data-role-choose]'));await settle()
  expect(labels(),'both questions, each for its own formation').toEqual([`Mission role for ${a.cs}`,`Mission role for ${b.cs}`].sort())
  expect(document.querySelectorAll('.mission-role-action'),'no button under a formation whose question is open').toHaveLength(0)
  await click(side(String(b.cs),'blue'));await settle()
  expect(readRole(roleTarget(0,b.rid!)!.id)?.side).toBe('blue')
  expect(readRole(roleTarget(0,a.rid!)!.id),'the first formation is still unanswered').toBeUndefined()
  expect(labels(),'and its question is still there to answer').toEqual([`Mission role for ${a.cs}`])
  await click(side(String(a.cs),'red'));await settle()
  expect(readRole(roleTarget(0,a.rid!)!.id)?.side).toBe('red')
  expect(labels(),'no question is left').toHaveLength(0)
  /* the caret is still in the second formation's Remarks: its button is back, to correct the answer ([ROLE-BUTTON-AFTER-ANSWER]) */
  expect([...document.querySelectorAll('.mission-role-action')].map(n=>`${n.getAttribute('aria-label')} · ${n.querySelector('[data-role-choose]')!.textContent}`)).toEqual([`Mission role for ${b.cs} · Change mission role`])
})

/* D598 (owner, 6 Oct 26 — "yes all 4 as recommended", question 2; found by Astra and Sol 6.1 in the side-by-side read).
   The automatic question had ONE slot, newest wins: typing a cue on a second formation REMOVED the first formation's
   open question without an answer — an ending D535 never listed. Both show now, each under its own formation, and
   each ends by its own rules. */
it('D598 — a cue typed on a second formation opens its question BESIDE the first one’s; each is answered on its own',async()=>{
  const a=DAYS[0].waves[0]!.formations[0]!,b=DAYS[0].waves[0]!.formations[1]!
  await type('fr:0.0.0.0','DS FOR EAGLE')
  expect(labels()).toEqual([`Mission role for ${a.cs}`])
  await type('fr:0.0.1.0','RED FROM VIPER')
  expect(labels(),'the second formation asks, and the first is still asking').toEqual([`Mission role for ${a.cs}`,`Mission role for ${b.cs}`].sort())
  /* each sits under its OWN formation */
  for(const f of [a,b]) expect(question(String(f.cs)).previousElementSibling?.getAttribute('data-role-formation'),`${f.cs}'s question is under ${f.cs}`).toBe(String(f.rid))
  /* an unrelated edit on the day keeps both (D535) */
  await type('ff:0.0.0.to','08:45')
  expect(labels()).toHaveLength(2)
  await click(side(String(b.cs),'red'));await settle()
  expect(readRole(roleTarget(0,b.rid!)!.id)?.side,'the answer lands on the formation whose question was pressed').toBe('red')
  expect(readRole(roleTarget(0,a.rid!)!.id)).toBeUndefined()
  expect(labels(),'the other question is untouched').toEqual([`Mission role for ${a.cs}`])
  await click(side(String(a.cs),'blue'));await settle()
  expect(readRole(roleTarget(0,a.rid!)!.id)?.side).toBe('blue')
  expect(document.querySelectorAll('[data-role-ui]')).toHaveLength(0)
})

it('D598 — Later on one question, or its own wording changing, removes that one only',async()=>{
  const a=DAYS[0].waves[0]!.formations[0]!,b=DAYS[0].waves[0]!.formations[1]!,c=DAYS[1].waves[0]!.formations[0]!
  c.msn='ACM';c.aircraft.forEach((x:any)=>x.rmks='')
  await type('fr:0.0.0.0','DS FOR EAGLE');await type('fr:0.0.1.0','RED FROM VIPER')
  /* and one on ANOTHER DAY of the week (D599: on the week a question waits on its day) */
  await type('fr:1.0.0.0','DS FOR RU')
  expect(labels()).toHaveLength(3)
  expect(question(String(c.cs),1).previousElementSibling?.getAttribute('data-role-day'),'Tuesday’s sits on Tuesday').toBe('1')
  await click(side(String(b.cs),'later'));await settle()
  expect(labels(),'Later took its own question only').toHaveLength(2)
  expect(readRole(roleTarget(0,b.rid!)!.id)).toBeUndefined()
  await type('fr:0.0.0.0','ordinary briefing')
  expect(labels(),'the first formation’s wording no longer asks; Tuesday’s question still does').toEqual([`Mission role for ${c.cs}`])
  await act(async()=>{setMissionTracking(false)});await settle()
  expect(document.querySelectorAll('[data-role-ui]'),'tracking Off ends every open question').toHaveLength(0)
})

/* [ROLE-BLANK-CALLSIGN] (reader C's second pass, 6 Oct 26 — F1; D340). A line with no callsign was named by its hidden
   row code: the question read "<code>: Blue or Red?", and Undo and History carried the same code. The app's word for
   such a line is "Line" (the changes window, the edit log). */
it('ROLE-BLANK-CALLSIGN — a line with no callsign is called "Line" in the question, in Undo and in History, never its row code',async()=>{
  const {commandStream}=await import('../command')
  const f=DAYS[0].waves[0]!.formations[0]!,rid=String(f.rid)
  await act(async()=>{f.cs='';schedBaselineClean();(await import('../state/store')).notify()});await settle()
  await type('ff:0.0.0.msn','DS-2')
  const qn=q('.mission-role-question')
  expect(qn.querySelector('strong')!.textContent).toBe('Line: Blue or Red?')
  expect(qn.getAttribute('aria-label')).toBe('Mission role for Line')
  expect(qn.textContent,'never the row code').not.toContain(rid)
  expect(roleTarget(0,rid)!.name).toBe('Line')
  const from=ELOG.rows.length,n=commandStream().length
  await click(q('[data-role-side="red"]'));await settle()
  const sent=commandStream().slice(n).find(e=>e.type==='insights.role.set')!
  expect(JSON.parse(String(sent.detail)).name,'the name Undo reads').toBe('Line')
  const line=ELOG.rows.slice(from).find((x:any)=>x.fld==='mission-role')
  expect(String(line!.lbl),'the History line').toMatch(/^Line · mission role/)
  expect(String(line!.lbl)).not.toContain(rid)
})

/* [ROLE-BUTTON-AFTER-ANSWER] (reader C's second pass — F2; D527, D529: the button shows while a relevant Remarks box is
   being edited). After Blue, Red or Later the caret is still in that Remarks box, and nothing was offered until he
   clicked out and back in — a mis-press could not be corrected from where he was. */
it('ROLE-BUTTON-AFTER-ANSWER — after Later or an answer, with the caret still in that Remarks, the Choose / Change button is back',async()=>{
  expect(writeText('fr:0.0.0.0','RED AIR'),'a cue of its own').toBeTruthy();await settle()
  const rm=()=>q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{rm().focus();rm().dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  await click(q('.mission-role-action [data-role-choose]'));await settle()
  expect(labels()).toHaveLength(1)
  await click(q('[data-role-side="later"]'));await settle()
  expect(labels(),'Later closed the question').toHaveLength(0)
  expect(document.activeElement,'the caret is still in the Remarks box').toBe(rm())
  expect(document.querySelector('.mission-role-action [data-role-choose]')?.textContent,'and the button is offered again').toBe('Choose mission role')
  await click(q('.mission-role-action [data-role-choose]'));await settle()
  await click(q('[data-role-side="red"]'));await settle()
  const f=DAYS[0].waves[0]!.formations[0]!
  expect(readRole(roleTarget(0,f.rid!)!.id)?.side).toBe('red')
  expect(document.querySelector('.mission-role-action [data-role-choose]')?.textContent,'an answer given: the button now corrects it').toBe('Change mission role')
  expect(document.querySelectorAll('.mission-role-action')).toHaveLength(1)
})

/* RF3 (Astra's read of the fix round, 6 Oct 26): W11 made a spacing-only save a no-op — right — but the answer path
   compared the stored words with the folded ones literally, "saved", compared again, took the unchanged stored words
   for a failed save and dropped the question without the answer. A Mission or Remarks whose stored words hold a
   doubled space (a wave template keeps them) could not be answered. */
it('RF3 — a formation whose stored Mission holds a doubled space can still be answered, and nothing else is written',async()=>{
  const {commandStream}=await import('../command')
  const f=DAYS[0].waves[0]!.formations[0]!
  await act(async()=>{f.msn='ACM /  DS';schedBaselineClean();(await import('../state/store')).notify()});await settle()
  const rm=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{rm.focus();rm.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  await click(q('.mission-role-action [data-role-choose]'));await settle()
  expect(document.querySelectorAll('.mission-role-question'),'the question opened').toHaveLength(1)
  /* he selects the Mission box of that formation, changes nothing, and presses Red */
  const msn=q('#eWeek [data-txt="ff:0.0.0.msn"]')
  await act(async()=>{msn.focus();msn.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  const n=commandStream().length
  await click(q('[data-role-side="red"]'));await settle()
  expect(readRole(roleTarget(0,f.rid!)!.id)?.side,'Red is recorded').toBe('red')
  expect(f.msn,'the stored words are untouched').toBe('ACM /  DS')
  expect(commandStream().slice(n).map(e=>e.type),'one command: the answer').toEqual(['insights.role.set'])
})

/* RF4 (Astra's read, 6 Oct 26): with a button showing under a formation, selecting the Remarks of ANOTHER aircraft of
   the same formation took the button away — it was kept as it was (the same formation), still tied to the first box,
   and the tidy-up that follows a blur saw "not his box any more" and removed it. */
it('RF4 — the button follows him between the two aircraft Remarks of one formation',async()=>{
  expect(writeText('fr:0.0.0.0','DS FOR EAGLE')).toBeTruthy();await settle()
  const f=DAYS[0].waves[0]!.formations[0]!
  expect(f.aircraft.length,'the demo formation has two aircraft').toBeGreaterThan(1)
  const one=q('#eWeek [data-txt="fr:0.0.0.0"]'),two=q('#eWeek [data-txt="fr:0.0.0.1"]')
  await act(async()=>{one.focus();one.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  expect(document.querySelectorAll('.mission-role-action')).toHaveLength(1)
  await act(async()=>{one.dispatchEvent(new FocusEvent('focusout',{bubbles:true,relatedTarget:two}));two.focus();two.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  expect(document.activeElement).toBe(two)
  expect(document.querySelectorAll('.mission-role-action'),'still offered while he is in the second aircraft Remarks').toHaveLength(1)
  await click(q('.mission-role-action [data-role-choose]'));await settle()
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  await click(q('[data-role-side="blue"]'));await settle()
  expect(readRole(roleTarget(0,f.rid!)!.id)?.side).toBe('blue')
  expect(document.activeElement,'and the caret is back in the box he was in').toBe(two)
})

/* P2-F3 (the Tab-route reader's second pass, 6 Oct 26; D535): the question hangs inside the flying block. A block held
   back for the caret is written when the caret leaves text — by a paint no store change announces — and the question
   went with the old block, to come back only at the next change anywhere. Both paints put it back themselves. */
it('P2-F3 — an open question survives the catch-up paint that follows a caret leaving text',async()=>{
  const {notify}=await import('../state/store')
  await type('fr:0.0.0.0','DS FOR EAGLE')
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  const box=q('#eWeek [data-txt="ff:0.0.0.cs"]')
  await act(async()=>{box.focus()});await settle()
  /* something else in the same block changes while the caret is in it: the block is owed */
  await act(async()=>{DAYS[0].waves[0]!.formations[1]!.cs='P2F3';notify()});await settle()
  await act(async()=>{box.blur();box.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle()
  expect(q('#eWeek [data-txt="ff:0.0.1.cs"]').textContent,'the block was caught up').toBe('P2F3')
  expect(document.querySelectorAll('.mission-role-question'),'and the question is still on screen').toHaveLength(1)
  expect(document.querySelector('.mission-role-question')!.isConnected).toBe(true)
})
