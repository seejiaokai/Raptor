/* [STACK-LEFTOVERS] (1) — Insights' two edges never tried (the Opus interim read of 3 Oct 26,
   docs/handpass/2026-10-03-insights-mission-mix-opus-interim.md, "Unverified remainder"), tried here through the routes
   the screens use:
   (a) on a PUBLISHED day, "Choose mission role" pressed with unsaved typing in the Remarks box saves the typing through
       the box's own door and keeps the caret in the box — so the week's ordinary repaint waits while the caret is there.
       Does the day's "N pending" chip (the way into "To go out") count the saved typing at once, or wait for the next
       action?
   (b) the edit week's Templates button while a saved plan is being looked at on that day.
   Evidence sheet: docs/handpass/2026-11-08-insights-leftovers.md. */
// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { storeBackend } from '../engine/hooks'
import { setMissionTracking } from '../engine/insights-config'
import { initStore, writeText, notify } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV } from '../state/view'
import { dayDrafts, draftDup } from '../engine/drafts'
import { hydrateRoles } from '../state/mission-roles'
import { schedBaselineClean, commitPublishALDay } from '../state/sched-commit'
import { txtGet } from '../engine/slots'
import { isOk, commandStream } from '../command'
import { resetMissionRoleOffer } from './mission-role-offer'
import { roleAnswerName, roleSideWord } from '../engine/mission-role'
import { ELOG } from '../engine/editlog'
import { describeEntry } from '../undo/describe'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true
const baseline=JSON.stringify(DAYS)
let host:HTMLDivElement, root:Root
const q=(s:string)=>document.querySelector<HTMLElement>(s)
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,20))})
const click=async(el:HTMLElement)=>act(async()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})))
const sign=(di:number)=>{const g=signOf(di);g.cur='ignite';g.sked='bane';g.plan='stiff';g.appr='pump'}
/* the day head's one chip, as the edit week draws it now */
const chip=(di:number)=>document.querySelector<HTMLElement>(`#eWeek [data-pendlist="${di}"]`)
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

/* the plans selector pressed, then its first issued row: the version the row looks at */
async function lookIssued(menu:string){
  await click(q(menu)!);await settle()
  const row=q('.wavemenu [data-planpv]')!,v=row.dataset.planpv!
  await click(row);await settle()
  return v
}

/* Monday published at AL1 with a Remarks cue (so its Remarks box offers Choose), nothing waiting to go out */
async function publishedWithCue(){
  sign(0);setDayApproved(0,true)
  expect(writeText('fr:0.0.0.0','DS FOR ALPHA')).toBeTruthy()
  sign(0);expect(isOk(commitPublishALDay(0))).toBe(true)
  await settle()
  expect(chip(0),'nothing waiting to go out before the typing').toBeNull()
}

it('(a) published day: Choose pressed with unsaved typing in Remarks — the typing is saved and the day’s "pending" chip counts it at once',async()=>{
  await publishedWithCue()
  const box=()=>q('#eWeek [data-txt="fr:0.0.0.0"]')!
  await act(async()=>{box().focus();box().dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  const choose=q('.mission-role-action [data-role-choose]')
  expect(choose?.textContent,'the published day’s working Remarks offers the button').toBe('Choose mission role')
  /* typed, not left: the box holds words the schedule does not have yet */
  await act(async()=>{box().textContent='DS FOR BRAVO'})
  await click(choose!);await settle()
  expect(txtGet('fr:0.0.0.0'),'the typing went in through the box’s own door').toBe('DS FOR BRAVO')
  expect(q('.mission-role-question'),'and the question opened for the saved wording').toBeTruthy()
  expect(document.activeElement,'the caret is still in the Remarks box').toBe(box())
  expect(chip(0)?.textContent,'the day’s chip counts the saved typing as waiting to go out — without a further action').toMatch(/^1\s*pending/)
})

it('(a) control — the same typing left by an ordinary blur counts on the chip the same way',async()=>{
  await publishedWithCue()
  const box=()=>q('#eWeek [data-txt="fr:0.0.0.0"]')!
  await act(async()=>{box().focus();box().textContent='DS FOR BRAVO';box().blur();box().dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle()
  expect(txtGet('fr:0.0.0.0')).toBe('DS FOR BRAVO')
  expect(chip(0)?.textContent).toMatch(/^1\s*pending/)
})

it('(a) the Scheduler Board: the same press marks the day "Not yet signed" in its sign strip at once',async()=>{
  await publishedWithCue()
  await click(q('#eWeek .sb-open[data-sbday="0"]')!);await settle()
  expect(q('#sbSign .nysmark'),'nothing waiting before the typing').toBeNull()
  const box=()=>q('#sbBoard [data-bfld="fr:0.0.0.0"]')!
  await act(async()=>{box().focus();box().dispatchEvent(new FocusEvent('focusin',{bubbles:true}))});await settle()
  const choose=q('.mission-role-action [data-role-choose]')
  expect(choose?.textContent).toBe('Choose mission role')
  await act(async()=>{const b=box();if(b instanceof HTMLTextAreaElement||b instanceof HTMLInputElement)b.value='DS FOR BRAVO';else b.textContent='DS FOR BRAVO'})
  await click(choose!);await settle()
  expect(txtGet('fr:0.0.0.0')).toBe('DS FOR BRAVO')
  expect(q('.mission-role-question')).toBeTruthy()
  expect(document.activeElement).toBe(box())
  expect(q('#sbSign .nysmark')?.textContent,'the board’s strip says the published day has changes not yet signed').toBe('Not yet signed')
})

/* (b) The week's Templates button and a saved plan being looked at. On Edit Schedule a saved plan is never looked at — the
   plans menu SWITCHES to it (a "d:" look kept on View-only Sched is dropped on the way in, pinned in draftsui.test.tsx);
   what it looks at is an ISSUED version of a published day, and a template is refused on a published day anyway (D96).
   So the only look the edit surfaces hold is the issued one: its day is drawn read-only, with no Templates button on the
   week and the board's own Templates greyed. View-only Sched, where a saved plan can be looked at, draws no Templates. */
it('(b) Edit Schedule looking at an issued version: no Templates on the week, the board’s Templates greyed',async()=>{
  await publishedWithCue()
  expect(q('#eWeek [data-daytplopen="0"]'),'the working copy of a published day offers Templates (refused inside, D96)').toBeTruthy()
  /* the week: the day's own plans selector, then an issued row (ORIG or AL1) — the route a person takes */
  let issued=await lookIssued('#eWeek .day[data-day="0"] [data-planmenu="0"]')
  expect(issued,'a published version of the day').toMatch(/#[0-9]+$/)
  expect(DPREV.get(0)).toBe(issued)
  expect(q('#eWeek .day[data-day="0"] .dprev-bar'),'the day shows the version it is looking at').toBeTruthy()
  expect(q('#eWeek [data-daytplopen="0"]'),'no Templates while the issued version is looked at').toBeNull()
  /* back to the live copy from the same menu, then the board: opened on the working copy, its Templates live; its own
     plans selector and issued row start the look there — its top-bar Templates greyed, the day's own not drawn */
  await click(q('#eWeek .day[data-day="0"] [data-planmenu="0"]')!);await settle()
  await click(q('.wavemenu [data-plangolive]')!);await settle()
  expect(DPREV.has(0)).toBe(false)
  await click(q('#eWeek .sb-open[data-sbday="0"]')!);await settle()
  expect((q('#sbTpl') as HTMLButtonElement|null)?.disabled,'the board’s Templates is live on the working copy').toBe(false)
  issued=await lookIssued('#sbSign [data-planmenu="0"]')
  expect(DPREV.get(0)).toBe(issued)
  expect((q('#sbTpl') as HTMLButtonElement|null)?.disabled,'the board’s Templates is greyed under the look').toBe(true)
  expect(q('#sbBoard [data-daytpladd="0"]')).toBeNull()
})

it('(b) View-only Sched looking at a saved plan: no Templates anywhere, and the look is dropped on the way to Edit Schedule',async()=>{
  /* the plan is made by code (its making is not what is tried); the page changes and the look go through the controls */
  await act(async()=>{draftDup(0);notify()});await settle()
  await click(q('.topbar a[data-page="viewsched"]')!);await settle()
  const plan=dayDrafts(0)[0]!.id
  const sel=q('#vWeek select[data-dver="0"]') as unknown as HTMLSelectElement
  await act(async()=>{sel.value='d:'+plan;sel.dispatchEvent(new Event('change',{bubbles:true}))});await settle()
  expect(DPREV.get(0)).toBe('d:'+plan)
  expect(q('#vWeek .day[data-day="0"] .dprev-bar'),'the day shows the plan it is looking at').toBeTruthy()
  expect(document.querySelector('#vWeek [data-daytplopen], #vWeek [data-daytpladd], #sbTpl'),'View-only Sched draws no Templates').toBeNull()
  await click(q('.topbar a[data-page="editsched"]')!);await settle()
  expect(DPREV.has(0),'Edit Schedule never keeps a saved plan’s look').toBe(false)
  expect(q('#eWeek [data-daytplopen="0"]'),'the draft day’s Templates is back, on its live working copy').toBeTruthy()
})

/* [STACK-LEFTOVERS] (2) — the change history and Undo tell a Blue/Red answer from ONE body (engine/mission-role.ts
   roleAnswerName / roleSideWord, D489's tidiness note). Red before the body existed: neither name could be imported. */
it('(2) the one body: the line’s name as the answer carried it, the side’s word, nothing invented for a gap',()=>{
  expect(roleAnswerName(JSON.stringify({name:'  VIPER   11 ',origin:'Working copy'}))).toBe('VIPER 11')
  expect(roleAnswerName(JSON.stringify({name:'X'.repeat(90)}))).toBe('X'.repeat(80))
  for(const none of [undefined,'','null','not json','{"name":7}','[1]'])expect(roleAnswerName(none),String(none)).toBe('')
  expect([roleSideWord('blue'),roleSideWord('red'),roleSideWord(undefined),roleSideWord('Blue')]).toEqual(['Blue','Red',null,null])
})

it('(2) one real answer: the History line and Undo’s words name the same line and the same side',async()=>{
  const f=DAYS[0].waves[0]!.formations[0]!
  await act(async()=>{f.cs='VIPER  11';schedBaselineClean();notify()});await settle()
  const box=()=>q('#eWeek [data-txt="fr:0.0.0.0"]')!
  await act(async()=>{box().focus();box().textContent='DS FOR ALPHA';box().blur();box().dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle()
  const from=ELOG.rows.length,n=commandStream().length
  await click(q('[data-role-side="red"]')!);await settle()
  const sent=commandStream().slice(n).find(e=>e.type==='insights.role.set')!
  const line=ELOG.rows.slice(from).find((x:any)=>x.fld==='mission-role')!
  expect(String(line.lbl)).toBe('VIPER 11 · mission role · Working copy')
  expect([line.from,line.to]).toEqual(['Unresolved','Red'])
  const said=describeEntry({type:sent.type,detail:sent.detail,forward:sent.changes} as any)
  expect(said).toBe('the mission role for VIPER 11 — Red')
})
