// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, it, expect } from 'vitest'
import { InputsPage } from './InputsPage'
import { initStore, setSession, notify } from '../state/store'
import { setCalMonth, setInpView } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { getSansCutoffs, saveSansDay } from '../state/sans-calendar'
import { switchRoleInForce } from '../state/perms'
import { INPEDIT, setInpEdit } from './pops'
import { storeBackend } from '../engine/hooks'
import { setInpMode } from '../state/view'
import { InputEditor } from './inputedit'
import { setPage } from '../state/view'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let host: HTMLDivElement, root: Root
const inputSeed=JSON.stringify(INPUTS)
const click = async (sel:string) => { const el=host.querySelector(sel); expect(el,sel).toBeTruthy(); await act(async()=>{(el as HTMLElement).click()}) }
beforeEach(async()=>{ INPUTS.splice(0,INPUTS.length,...JSON.parse(inputSeed));const mem=new Map<string,string>();storeBackend.impl={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),keys:()=>[...mem.keys()]};initStore(); setSession({user:'a',role:'admin'});setPage('inputs');setInpMode('member'); setInpView('cal'); setCalMonth({y:2026,m:10}); host=document.createElement('div'); document.body.append(host); root=createRoot(host); await act(async()=>{root.render(<><InputsPage/><InputEditor/></>)}); await act(async()=>{setCalMonth({y:2026,m:10});notify()}) })
afterEach(async()=>{ await act(async()=>{root.unmount();setInpEdit(null)});host.remove();setSession(null);storeBackend.impl=null })
it('keeps app Inputs navigation and secondary list in the calendar workspace',async()=>{
  expect(host.querySelector('.ic-embedded')).toBeTruthy()
  expect(document.body.classList.contains('sb-lock')).toBe(false)
  await click('#inListBtn'); expect(host.querySelector('#inpCal')).toBeNull()
  await click('#inCalBtn'); expect(host.querySelector('#inpCal')).toBeTruthy()
})
it('uses all flying offers for the count even when the visible people filter hides them',async()=>{
  const id=Object.keys(PEOPLE).find(k=>PEOPLE[k].san && !PEOPLE[k].archived)!
  const row={iid:'calendar-flow-offer',person:id,type:'SANS Availability',date:'Oct 9',yr:2026,allday:false,s:540,e:600,sans:{f:true}}
  INPUTS.push(row as any)
  try{
    await act(async()=>{saveSansDay('2026-10-09',{required:5,flying:'night'})})
    await click('#inSansMode')
    const cell=host.querySelector('[data-icday="2026-10-09"]')!
    expect(cell.textContent).toContain('1 / 5');expect(cell.textContent).toContain('4 more')
    expect(cell.querySelector('[aria-label="Night flying"]')).toBeTruthy()
    await act(async()=>{cell.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
    expect(host.querySelector('#sansRequired')).toBeTruthy()
    expect(host.querySelector('.ic-poprow-win')?.textContent).toBe('09:00–10:00')
  } finally{INPUTS.splice(INPUTS.indexOf(row as any),1)}
})
it('selects reverse date ranges without writing until the shared form is saved',async()=>{
  await click('#inSansMode');await click('#icSelectDates')
  const before=INPUTS.length
  for(const iso of ['2026-10-12','2026-10-09']) await act(async()=>{host.querySelector(`[data-icday="${iso}"]`)!.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
  await click('#icRangeAdd')
  expect(INPEDIT).toMatchObject({_new:true,type:'SANS Availability',date:'Oct 9',endDate:'Oct 12',allday:true,sans:{f:true}})
  expect(INPUTS.length).toBe(before)
})
it('a member can read the demand but has no admin setting controls',async()=>{
  await act(async()=>{setSession({user:'b',role:'member'});notify()})
  await click('#inSansMode')
  await act(async()=>{host.querySelector('[data-icday="2026-10-09"]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
  expect(host.querySelector('#sansRequired')).toBeNull()
  expect(host.querySelector('#sansColours')).toBeNull()
})

it('shows separate unfiltered F/O/A totals in every SANS cell and in day details',async()=>{
  const rows=[{iid:'counts-all',person:'activity-all',type:'SANS Availability',date:'Oct 9',yr:2026,allday:true,sans:{f:true,o:true,a:true}},{iid:'counts-o',person:'activity-o',type:'SANS Availability',date:'Oct 9',yr:2026,allday:true,sans:{o:true}},{iid:'counts-a',person:'activity-a',type:'SANS Availability',date:'Oct 9',yr:2026,allday:true,sans:{a:true}}]
  INPUTS.push(...rows as any[])
  await click('#inSansMode');await value('#inFSearch','DOES_NOT_MATCH')
  const counts=(el:Element)=>['f','o','a'].map(k=>el.querySelector(`[data-sans-count="${k}"]`)?.getAttribute('data-count'))
  const cell=host.querySelector('[data-icday="2026-10-09"]')!
  expect(counts(cell)).toEqual(['1','2','2'])
  expect(cell.getAttribute('aria-label')).toMatch(/1 Fly.*2 OFT.*2 AMT/)
  expect(counts(host.querySelector('[data-icday="2026-10-10"]')!)).toEqual(['0','0','0'])
  await act(async()=>{cell.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
  expect(counts(host.querySelector('.sans-day-summary')!)).toEqual(['1','2','2'])
  expect(host.querySelector('.ic-poprow')).toBeNull()
})

it('groups mode before presentation and folding filters does not release a revealed save',async()=>{
  const row=await newOffer('Personal','Header revealed save')
  await value('#inFSearch','NO_MATCH');await click(`[data-icday="2026-10-23"]`)
  // Save while a remembered search hides the row; the normal save contract pins it.
  await act(async()=>{setInpEdit(row);notify()});await value('#inpEditRmk','Header revealed edited save');await click('#inpEditSave')
  const mode=host.querySelector('.inputs-modes')!,views=host.querySelector('.inputs-tools')!
  expect(views,'D582 presentation tools').toBeTruthy()
  expect(mode.compareDocumentPosition(views)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(host.querySelector('#inFiltersBtn')?.getAttribute('aria-expanded')).toBe('false')
  for(let i=0;i<2;i++)await click('#inFiltersBtn')
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)).toBeTruthy()
  expect(host.querySelector('#inFilterSummary')?.textContent).toContain('NO_MATCH')
})

it('clear filters acts on the current mode without changing the List date window or other memory',async()=>{
  await value('#inFSearch','MEMBER_FILTER');await value('#inFType','LL')
  await click('#inListBtn');const dates=host.querySelector('#inRangeBtn')!.textContent
  await click('#inSansMode');await value('#inFSearch','SANS_FILTER');await click('#inFiltersClear')
  expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('')
  expect(host.querySelector('#inRangeBtn')!.textContent).toBe(dates)
  await click('#inMemberMode')
  expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('MEMBER_FILTER')
  expect((host.querySelector('#inFType') as HTMLSelectElement).value).toBe('LL')
  await click('#inFiltersClear')
  expect((host.querySelector('#inFType') as HTMLSelectElement).value).toBe('all')
  expect(host.querySelector('#inRangeBtn')!.textContent).toBe(dates)
})

const value = async (sel:string,text:string) => {
  const el=host.querySelector(sel) as HTMLInputElement|HTMLSelectElement
  expect(el,sel).toBeTruthy()
  const proto=el instanceof HTMLSelectElement?HTMLSelectElement.prototype:HTMLInputElement.prototype
  await act(async()=>{Object.getOwnPropertyDescriptor(proto,'value')!.set!.call(el,text);el.dispatchEvent(new Event(el instanceof HTMLSelectElement?'change':'input',{bubbles:true}))})
}
const openDate = async () => act(async()=>{host.querySelector('[data-icday="2026-10-23"]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
const tickFly = async () => {
  const input=Array.from(host.querySelectorAll('#inpEditSans label')).find(el=>el.textContent?.includes('Fly'))?.querySelector('input') as HTMLInputElement
  expect(input).toBeTruthy();if(!input.checked)await act(async()=>{input.click()})
}
const newOffer = async (type:string,remark:string) => {
  await openDate();await click('#icPopAdd')
  const id=Object.keys(PEOPLE).find(k=>PEOPLE[k].san&&!PEOPLE[k].archived&&!PEOPLE[k].deleted&&!PEOPLE[k].special)!
  await value('#inpEditPerson',id)
  if(host.querySelector('#inpEditType'))await value('#inpEditType',type)
  else expect(INPEDIT?.type).toBe(type)
  if(type==='SANS Availability')await tickFly()
  await value('#inpEditRmk',remark);await click('#inpEditSave')
  const row=INPUTS.find(r=>r.remarks===remark);expect(row).toBeTruthy();return row!
}
it('reveals a cross-mode new save in Calendar and List without clearing remembered searches',async()=>{
  await click('#inSansMode');await value('#inFSearch','NO_SANS_MATCH');await click('#inMemberMode')
  const row=await newOffer('SANS Availability','R1 cross-mode saved offer')
  expect(host.querySelector('#inSansMode')?.getAttribute('aria-pressed')).toBe('true')
  expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('NO_SANS_MATCH')
  expect(host.querySelector('#sansDayPop')).toBeTruthy()
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)?.textContent).toContain('R1 cross-mode saved offer')
  await click('#icPopClose');await click('#inListBtn')
  expect(host.querySelector(`[data-iid="${row.iid}"]`)).toBeTruthy()
  await value('#inFSearch','STILL_NO_MATCH')
  expect(host.querySelector(`[data-iid="${row.iid}"]`)).toBeNull()
  await click('#inMemberMode');expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('')
})
it('an existing SANS save changed to Member cannot remain pinned in the SANS renderer',async()=>{
  await value('#inFSearch','NO_MEMBER_MATCH');await click('#inSansMode')
  const row=await newOffer('SANS Availability','R1 saved offer retyped')
  await click(`[data-popiid="${row.iid}"]`);await value('#inpEditType','Personal');await click('#inpEditSave')
  expect(row.type).toBe('Personal')
  expect(host.querySelector('#sansDayPop [data-popiid]')).toBeNull()
  expect(host.querySelector('#inMemberMode')?.getAttribute('aria-pressed')).toBe('true')
  expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('NO_MEMBER_MATCH')
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)?.textContent).toContain('R1 saved offer retyped')
})
it('an existing Member save changed to SANS follows its actual saved date and ID',async()=>{
  await click('#inSansMode');await value('#inFSearch','NO_SANS_MATCH');await click('#inMemberMode')
  const row=await newOffer('Personal','R1 saved member retyped')
  await click(`[data-popiid="${row.iid}"]`);await value('#inpEditType','SANS Availability');await tickFly();await click('#inpEditSave')
  expect(row.type).toBe('SANS Availability');expect(row.sans?.f).toBe(true)
  expect(host.querySelector('#inSansMode')?.getAttribute('aria-pressed')).toBe('true')
  expect(host.querySelector('#sansDayPop')).toBeTruthy()
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)?.textContent).toContain('R1 saved member retyped')
  expect(host.querySelector('#sansDayPop .ic-pop-head')?.textContent).toContain('23 Oct')
})

it('colour drafts survive an inside-origin drag but discard on outside pointerdown without saving',async()=>{
  await click('#inSansMode');await click('#sansColours')
  await value('#sansAmber','2');await value('#sansRed','4')
  await act(async()=>{
    host.querySelector('#sansAmber')!.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}))
    document.body.dispatchEvent(new MouseEvent('pointerup',{bubbles:true}))
    document.body.dispatchEvent(new MouseEvent('click',{bubbles:true}))
  })
  expect(host.querySelector('.sans-colours')).toBeTruthy()
  expect(getSansCutoffs()).toEqual({amberFrom:1,redFrom:3})
  await act(async()=>{host.querySelector('h1')!.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}))})
  expect(host.querySelector('.sans-colours')).toBeNull()
  await click('#sansColours')
  expect((host.querySelector('#sansAmber') as HTMLInputElement).value).toBe('1')
  expect((host.querySelector('#sansRed') as HTMLInputElement).value).toBe('3')
})

it('colour Escape peels one layer and restores focus in either document capture registration order',async()=>{
  await click('#inSansMode')
  for(const repaint of [false,true]){
    if(!host.querySelector('#inpCal'))await click('#inCalBtn')
    await click('#sansColours');await value('#sansAmber','2')
    if(repaint)await act(async()=>{notify()})
    await act(async()=>{host.querySelector('#sansAmber')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))})
    expect(host.querySelector('.sans-colours')).toBeNull()
    expect(host.querySelector('#inpCal')).toBeTruthy()
    expect(host.querySelector('#inSansMode')?.getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(host.querySelector('#sansColours'))
    expect(getSansCutoffs()).toEqual({amberFrom:1,redFrom:3})
    await act(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))})
    expect(host.querySelector('#inpCal')).toBeNull()
  }
})

it('a shared editor above colour settings owns Escape before the colour and day layers',async()=>{
  await click('#inSansMode');await openDate();await click('#sansColours');await click('#icPopAdd')
  expect(INPEDIT).toBeTruthy();expect(host.querySelector('.sans-colours')).toBeTruthy()
  await act(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))})
  expect(INPEDIT).toBeNull();expect(host.querySelector('.sans-colours')).toBeTruthy()
  await act(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))})
  expect(host.querySelector('.sans-colours')).toBeNull();expect(host.querySelector('#sansDayPop')).toBeTruthy()
  await act(async()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))})
  expect(host.querySelector('#sansDayPop')).toBeNull();expect(host.querySelector('#inpCal')).toBeTruthy()
})

it('withdrawing admin controls discards the colour draft and removes its Escape listener',async()=>{
  await act(async()=>{setSession({user:'a',role:'admin',acct:'admin'});setInpMode('sans');notify()})
  await click('#sansColours');await value('#sansAmber','2')
  await act(async()=>{expect(switchRoleInForce('main')).toBe(true);notify()})
  expect(host.querySelector('#sansColours')).toBeNull()
  await act(async()=>{expect(switchRoleInForce('admin')).toBe(true);notify()})
  expect(host.querySelector('.sans-colours')).toBeNull()
  await act(async()=>{expect(switchRoleInForce('main')).toBe(true);notify();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))})
  expect(host.querySelector('#inpCal')).toBeNull()
  expect(getSansCutoffs()).toEqual({amberFrom:1,redFrom:3})
})
