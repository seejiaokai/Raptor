/* MIX5 MIX6 MIX7 — applicable behavioural watches; see Insights build register. */
// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { storeBackend } from '../engine/hooks'
import { setMissionTracking, missionTracking } from '../engine/insights-config'
import { initStore, notify } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV } from '../state/view'
import { roleTarget, hydrateRoles, readRole } from '../state/mission-roles'
import { schedBaselineClean } from '../state/sched-commit'
import { txtGet } from '../engine/slots'
import { commandStream } from '../command'
import { resetMissionRoleOffer } from './mission-role-offer'
import { waveTplReset, addWaveTpl, setWaveTplLine } from '../engine/wavetpl'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT=true
const baseline=JSON.stringify(DAYS)
let host:HTMLDivElement, root:Root
const q=(s:string)=>document.querySelector<HTMLElement>(s)!
const settle=()=>act(async()=>{await new Promise(r=>setTimeout(r,20))})
const click=async(el:HTMLElement)=>act(async()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})))
beforeEach(async()=>{
  const mem:Record<string,string>={};storeBackend.impl={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v},keys:()=>Object.keys(mem)}
  DAYS.splice(0,DAYS.length,...JSON.parse(baseline))
  const f=DAYS[0].waves[0]!.formations[0]!;f.msn='ACM';f.aircraft.forEach((a:any)=>a.rmks='');
  Object.assign(SCHED,{pending:{},changes:{},added:{},als:[],al:0,dayOK:{},sign:{},orig:{},cur:{},retired:{},signBind:{},drafts:{},curDraft:{},correcting:{}})
  initStore();hydrateRoles([]);setSession({user:'ad',role:'admin'});setPage('editsched');DPREV.clear();setMissionTracking(true);schedBaselineClean()
  host=document.createElement('div');document.body.append(host);root=createRoot(host)
  await act(async()=>root.render(<App/>));await settle()
})
afterEach(async()=>{await act(async()=>root.unmount());host.remove();storeBackend.impl=null;hydrateRoles([]);DAYS.splice(0,DAYS.length,...JSON.parse(baseline))})
it('a real week Remarks commit saves first, asks once, and answers only the formation annotation',async()=>{
  const field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.textContent='DS FOR EAGLE';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))})
  await settle()
  expect(txtGet('fr:0.0.0.0')).toBe('DS FOR EAGLE')
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  const f=DAYS[0].waves[0]!.formations[0]!,t=roleTarget(0,f.rid!)!
  const n=commandStream().length;await click(q('[data-role-side="red"]'));await settle()
  expect(readRole(t.id)?.side).toBe('red')
  expect(commandStream().slice(n).filter(e=>e.type==='insights.role.set')).toHaveLength(1)
  expect(document.querySelectorAll('[data-role-ui]')).toHaveLength(0)
})
it('unchanged tabbing, enabling and Later never save an answer or reopen the automatic question',async()=>{
  const field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.textContent='DS-2';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle()
  await click(q('[data-role-side="later"]'));await settle()
  const n=commandStream().filter(e=>e.type==='insights.role.set').length
  const next=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{next.focus();next.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));next.blur()});await settle()
  expect(document.querySelector('.mission-role-question')).toBeNull()
  await act(async()=>{setMissionTracking(false);setMissionTracking(true);notify()});await settle()
  expect(document.querySelector('.mission-role-question')).toBeNull()
  expect(commandStream().filter(e=>e.type==='insights.role.set')).toHaveLength(n)
})
it('changing an unanswered cue to another cue asks again, while a noncue/timing edit does not',async()=>{
  let field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.textContent='DS FOR EAGLE';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle();await click(q('[data-role-side="later"]'));await settle()
  field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.textContent='DS FROM VIPER';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle()
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
  await click(q('[data-role-side="later"]'));await settle()
  const time=q('#eWeek [data-txt="ff:0.0.0.to"]')
  await act(async()=>{time.textContent='09:15';time.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle()
  expect(document.querySelector('.mission-role-question')).toBeNull()
})
it('removing one aircraft through the real Board route asks for the remaining formation changed context',async()=>{
  const f=DAYS[0].waves[0]!.formations[0]!
  f.aircraft[0]!.rmks='DS FOR EAGLE'
  f.aircraft.push({...f.aircraft[0]!,rid:undefined,rmks:'RED FROM VIPER'})
  const count=f.aircraft.length
  schedBaselineClean()
  await act(async()=>notify());await settle()
  await click(q('#eWeek .sb-open'));await settle()
  await click(q('#sbBoard [data-ldel="0.0.0.0"]'));await settle()
  expect(DAYS[0].waves[0]!.formations[0]!.aircraft.length).toBe(count-1)
  expect(document.querySelectorAll('.mission-role-question')).toHaveLength(1)
})
it('a reset between text commit and delayed offer invalidates the queued question',async()=>{
  const field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.textContent='DS FOR EAGLE';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));resetMissionRoleOffer()})
  await settle()
  expect(txtGet('fr:0.0.0.0')).toBe('DS FOR EAGLE')
  expect(document.querySelector('.mission-role-question')).toBeNull()
})
it('MIX6 unchanged blur then immediate Remarks refocus retains its manual Choose after queued work',async()=>{
  let field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.textContent='DS FOR VL';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle();await click(q('[data-role-side="later"]'));await settle()
  field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.focus();field.blur();field.focus()});await settle()
  expect(document.activeElement).toBe(field);expect(document.querySelectorAll('[data-role-choose]')).toHaveLength(1)
})
it('MIX6 keyboard activation returns to the identical Remarks node and retained selection',async()=>{
  let field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{field.textContent='DS FOR VL';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))});await settle();await click(q('[data-role-side="later"]'));await settle()
  field=q('#eWeek [data-txt="fr:0.0.0.0"]');await act(async()=>field.focus())
  const range=document.createRange();range.selectNodeContents(field);window.getSelection()!.removeAllRanges();window.getSelection()!.addRange(range)
  const choose=q('[data-role-choose]');await act(async()=>choose.focus());await click(choose);await settle()
  expect(document.activeElement).toBe(field);expect(window.getSelection()!.toString()).toBe('DS FOR VL')
})
it('MIX5 applying a wave template never asks, including one unresolved resulting formation',async()=>{
  waveTplReset();const t=addWaveTpl('Conditional package','fly')!;setWaveTplLine(t.id,0,'msn','DS2')
  await click(q('#eWeek .sb-open'));await settle();await click(q('#sbBoard [data-wvadd="0"]'));await settle();await click(q(`[data-wmtpl="${t.id}"]`));await settle()
  expect(DAYS[0].waves.at(-1)!.formations[0]!.msn).toBe('DS2');expect(document.querySelectorAll('.mission-role-question')).toHaveLength(0);waveTplReset()
})
it('MIX1 the actual Logic edit switch changes its durable setting',async()=>{
  await act(async()=>{setMissionTracking(false);setPage('logic');notify()});await settle();await click(q('#lgEdit'));await settle();await click(q('#lgMissionMix'));await settle();expect(missionTracking()).toBe(true)
})
it('MIX16 both real Board entry callbacks open the shared modal and close preserves the Board',async()=>{
  await click(q('#eWeek .sb-open'));await settle();await click(q('#sbInsights'));await settle();expect(document.querySelector('#insightBody')).not.toBeNull();await click(q('#insightClose'));await settle()
  await click(q('#sbMore'));await settle();await click(q('#sbMoreInsights'));await settle();expect(document.querySelector('#insightBody')).not.toBeNull();await click(q('#insightClose'));await settle();expect(document.querySelector('#sbBoard')).not.toBeNull()
})
it.each(['Off then On','page away then back','target removed'])('MIX7 queued own-edit question cannot survive %s',async(action)=>{
  const field=q('#eWeek [data-txt="fr:0.0.0.0"]')
  await act(async()=>{
    field.textContent='DS FOR EAGLE';field.dispatchEvent(new FocusEvent('focusout',{bubbles:true}))
    if(action==='Off then On'){setMissionTracking(false);setMissionTracking(true)}
    else if(action==='page away then back'){setPage('logic');setPage('editsched');notify()}
    else {DAYS[0].waves[0]!.formations.splice(0,1);notify()}
  });await settle()
  expect(document.querySelector('.mission-role-question')).toBeNull()
})

// R1: role buttons retain typing focus, so they must explicitly use the real text writer
// before resolving their target. Native blur must not be necessary to save the shown words.
for(const editor of ['week','Board'] as const) {
  const fieldSelector=()=>editor==='Board'?'#sbBoard [data-bfld="fr:0.0.0.0"]':'#eWeek [data-txt="fr:0.0.0.0"]'
  const put=(field:HTMLElement,value:string)=>{if(field instanceof HTMLTextAreaElement)field.value=value;else field.textContent=value}
  const commit=async(field:HTMLElement)=>{await act(async()=>field.dispatchEvent(editor==='Board'?new Event('change',{bubbles:true}):new FocusEvent('focusout',{bubbles:true})));await settle()}
  const prepare=async()=>{
    if(editor==='Board'){await click(q('#eWeek .sb-open'));await settle()}
    const field=q(fieldSelector());put(field,'DS FOR ALPHA');await commit(field)
    return field
  }
  it.each(['Choose','Change','open question','removed cue','Later'])('MIX6 R1 %s saves dirty Remarks before role action in '+editor,async(action)=>{
    let field=await prepare()
    const old=roleTarget(0,DAYS[0].waves[0]!.formations[0]!.rid!)!
    if(action==='Change'){await click(q('[data-role-side="blue"]'));await settle()}
    else if(action!=='open question'&&action!=='Later'){await click(q('[data-role-side="later"]'));await settle()}
    field=q(fieldSelector());await act(async()=>field.focus())
    const value=action==='removed cue'?'ordinary briefing':'DS FROM BRAVO'
    await act(async()=>{put(field,value);if(field instanceof HTMLTextAreaElement)field.setSelectionRange(3,7);else {const range=document.createRange();range.setStart(field.firstChild!,3);range.setEnd(field.firstChild!,7);window.getSelection()!.removeAllRanges();window.getSelection()!.addRange(range)}})
    const n=commandStream().length
    if(['Choose','Change','removed cue'].includes(action))await click(q('[data-role-choose]'))
    if(action==='removed cue'){
      await settle();expect(txtGet('fr:0.0.0.0')).toBe(value);expect(document.querySelector('[data-role-ui]')).toBeNull()
      expect(commandStream().slice(n).filter(e=>e.type==='insights.role.set')).toHaveLength(0)
    } else {
      if(action!=='Later')await click(q('[data-role-side="red"]'));else await click(q('[data-role-side="later"]'))
      await settle();expect(txtGet('fr:0.0.0.0')).toBe(value)
      const fresh=roleTarget(0,DAYS[0].waves[0]!.formations[0]!.rid!)!
      expect(fresh.id).not.toBe(old.id);expect(readRole(old.id)?.side).toBe(action==='Change'?'blue':undefined)
      expect(readRole(fresh.id)?.side).toBe(action==='Later'?undefined:'red')
      const commands=commandStream().slice(n)
      expect(commands.filter(e=>e.type==='insights.role.set')).toHaveLength(action==='Later'?0:1)
      expect(commands.length).toBe(action==='Later'?1:2)
      if(action!=='Later')expect(commands.at(-1)?.type).toBe('insights.role.set')
      expect(document.querySelector('[data-role-ui]')).toBeNull()
    }
    expect(q(fieldSelector())).toBe(field);expect(document.activeElement).toBe(field)
    if(field instanceof HTMLTextAreaElement)expect([field.selectionStart,field.selectionEnd]).toEqual([3,7])
    else expect(window.getSelection()!.toString()).toBe(value.slice(3,7))
  })
  it('MIX6 R1 an open question saves dirty exact-DS Mission and retires the conditional offer in '+editor,async()=>{
    await prepare()
    const selector=editor==='Board'?'#sbBoard [data-bfld="ff:0.0.0.msn"]':'#eWeek [data-txt="ff:0.0.0.msn"]'
    const field=q(selector);await act(async()=>{field.focus();if(field instanceof HTMLInputElement)field.value='DS';else field.textContent='DS'})
    const n=commandStream().filter(e=>e.type==='insights.role.set').length
    await click(q('[data-role-side="red"]'));await settle()
    expect(txtGet('ff:0.0.0.msn')).toBe('DS');expect(roleTarget(0,DAYS[0].waves[0]!.formations[0]!.rid!)).toBeNull()
    expect(commandStream().filter(e=>e.type==='insights.role.set')).toHaveLength(n);expect(document.querySelector('[data-role-ui]')).toBeNull()
    expect(q(selector)).toBe(field);expect(document.activeElement).toBe(field)
  })
}
