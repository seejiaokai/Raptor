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
