// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, it, expect } from 'vitest'
import { InputsPage } from './InputsPage'
import { initStore, setSession, notify } from '../state/store'
import { setCalMonth, setInpView } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { setFlyDays } from '../state/flyplan'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { flyAnswer } from '../leavewar/sync'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, setInpEdit } from './pops'
import { storeBackend } from '../engine/hooks'
import { setInpMode } from '../state/view'
import { InputEditor } from './inputedit'
import { setPage } from '../state/view'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let host: HTMLDivElement, root: Root
const inputSeed=JSON.stringify(INPUTS)
const click = async (sel:string) => { const el=host.querySelector(sel); expect(el,sel).toBeTruthy(); await act(async()=>{(el as HTMLElement).click()}) }
beforeEach(async()=>{ INPUTS.splice(0,INPUTS.length,...JSON.parse(inputSeed));const mem=new Map<string,string>();storeBackend.impl={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),keys:()=>[...mem.keys()]};initStore(); setSession({user:'a',role:'admin'});lwInitStore(memoryBackend());lwSetRole('admin');setPage('inputs');setInpMode('member'); setInpView('cal'); setCalMonth({y:2026,m:10}); host=document.createElement('div'); document.body.append(host); root=createRoot(host); await act(async()=>{root.render(<><InputsPage/><InputEditor/></>)}); await act(async()=>{setCalMonth({y:2026,m:10});notify()}) })
afterEach(async()=>{ await act(async()=>{root.unmount();setInpEdit(null)});host.remove();_resetFloatWins();setSession(null);storeBackend.impl=null })
/* THE SANS TAB SINCE STEP 4 OF THE INPUTS / SANS JOB (8 Oct 26): its own calendar (ui/SansCal.tsx), its day in a window
   (ui/SansDay.tsx), no filters and no list (D620), the day's required figure typed on the Leave War (D617) — so the
   tests below that drove Codex's SANS screen by its ids are RE-POINTED at the control that now does that job. Four
   were removed WITH the control they tested, the two-figure "Colour settings" dropdown (the plan §3.10: it goes;
   D618 puts the three colours behind the calendar's gear): its drafts, its Escape and its outside press are the
   settings window's own tests (ui/sanssettings.test.tsx). */
const tid=(id:string)=>host.querySelector(`[data-testid="${id}"]`)
const sansPeople=()=>Object.keys(PEOPLE).filter(k=>PEOPLE[k].san&&!PEOPLE[k].archived&&!PEOPLE[k].deleted&&!PEOPLE[k].special&&!PEOPLE[k].pers)

it('keeps app Inputs navigation and secondary list in the calendar workspace',async()=>{
  expect(host.querySelector('.ic-embedded')).toBeTruthy()
  expect(document.body.classList.contains('sb-lock')).toBe(false)
  await click('#inListBtn'); expect(host.querySelector('#inpCal')).toBeNull()
  await click('#inCalBtn'); expect(host.querySelector('#inpCal')).toBeTruthy()
})
it('counts every flying commitment whatever is typed in the Inputs tab’s filters, and reads the day’s class and figure from the flying plan',async()=>{
  const id=sansPeople().find(k=>PEOPLE[k].seat==='FCP')!
  const row={iid:'calendar-flow-offer',person:id,type:'SANS Availability',date:'Oct 9',yr:2026,allday:false,s:540,e:600,sans:{f:true}}
  INPUTS.push(row as any)
  try{
    await act(async()=>{setFlyDays([{iso:'2026-10-09',cls:'night',p:60,w:60}])})
    await value('#inFSearch','DOES_NOT_MATCH')
    await click('#inSansMode')
    const cell=host.querySelector('[data-icday="2026-10-09"]')!
    const a=flyAnswer('2026-10-09')
    expect(tid('sc-f-2026-10-09')!.textContent).toBe('F10')
    expect(tid('sc-need-2026-10-09')!.textContent).toBe(`${a.need.p}${a.need.w}`)
    expect(cell.querySelector('[data-icon="night"]')).toBeTruthy()
    await act(async()=>{cell.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
    /* the requirement is the Leave War's figure now (D617): the day shows it, and has no box to type it in */
    expect(host.querySelector('#sansRequired')).toBeNull()
    expect(tid('sd-req-p')!.textContent).toBe('60')
    expect(tid('sd-hours')?.textContent).toBe('09:00–10:00')
  } finally{INPUTS.splice(INPUTS.indexOf(row as any),1)}
})
it('picks a reversed run of days from the keyboard without writing until the shared form is saved',async()=>{
  await click('#inSansMode')
  const before=INPUTS.length
  const key=async(iso:string,init:KeyboardEventInit)=>act(async()=>{host.querySelector(`[data-icday="${iso}"]`)!.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,...init}))})
  await key('2026-10-12',{key:'ArrowLeft',shiftKey:true});await key('2026-10-11',{key:'ArrowLeft',shiftKey:true});await key('2026-10-10',{key:'ArrowLeft',shiftKey:true})
  await key('2026-10-09',{key:'Enter'})
  expect(INPEDIT).toMatchObject({_new:true,type:'SANS Availability',date:'Oct 9',endDate:'Oct 12',allday:true,sans:{f:true}})
  expect(INPUTS.length).toBe(before)
  /* the "Select dates" button went with the first calendar's SANS half (D626) */
  expect(host.querySelector('#icSelectDates')).toBeNull()
})
it('a member can read the day’s working but has no admin controls',async()=>{
  await act(async()=>{setSession({user:'b',role:'member'});notify()})
  await click('#inSansMode')
  await act(async()=>{host.querySelector('[data-icday="2026-10-09"]')!.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
  expect(tid('sd-work')).toBeTruthy()
  expect(host.querySelector('#sansRequired')).toBeNull()
  expect(tid('sd-days')).toBeNull()
  expect(tid('sc-gear')).toBeNull()
})

it('shows F, O and A as pilots and WSOs on every SANS date and in the opened day, whatever the Inputs tab is filtered to',async()=>{
  const all=sansPeople(), p=all.filter(k=>PEOPLE[k].seat==='FCP'), w=all.filter(k=>PEOPLE[k].seat==='RCP')
  expect(p.length>=1&&w.length>=2,'the demo roster has SANS pilots and WSOs').toBe(true)
  const rows=[{iid:'counts-all',person:p[0],type:'SANS Availability',date:'Oct 9',yr:2026,allday:true,sans:{f:true,o:true,a:true}},{iid:'counts-o',person:w[0],type:'SANS Availability',date:'Oct 9',yr:2026,allday:true,sans:{o:true}},{iid:'counts-a',person:w[1],type:'SANS Availability',date:'Oct 9',yr:2026,allday:true,sans:{a:true}}]
  INPUTS.push(...rows as any[])
  await value('#inFSearch','DOES_NOT_MATCH');await click('#inSansMode')
  const cell=host.querySelector('[data-icday="2026-10-09"]')!
  expect(['f','o','a'].map(k=>tid(`sc-${k}-2026-10-09`)!.textContent)).toEqual(['F10','O11','A11'])
  expect(cell.getAttribute('aria-label')).toMatch(/fly 1 and 0, OFT 1 and 1, AMT 1 and 1/)
  expect(['f','o','a'].map(k=>tid(`sc-${k}-2026-10-10`)!.textContent)).toEqual(['F00','O00','A00'])
  await act(async()=>{cell.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})
  expect(tid('sd-sans-p')!.textContent).toBe('1');expect(tid('sd-sans-w')!.textContent).toBe('0')
  /* everyone is listed — the search typed on the Inputs tab hides nobody here (D581, D648) */
  expect(host.querySelectorAll('[data-testid^="sd-row-"]').length).toBe(3)
  expect(tid('sd-group-p')!.textContent).toBe('Pilots · 1 to fly')
  expect(tid('sd-group-other')!.textContent).toBe('OFT or AMT only · 2')
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

it('the SANS tab has no filters and no list; what was typed on the Inputs tab is still there on coming back',async()=>{
  await value('#inFSearch','MEMBER_FILTER');await value('#inFType','LL')
  await click('#inListBtn');const dates=host.querySelector('#inRangeBtn')!.textContent
  await click('#inSansMode')
  const shown=(sel:string)=>{const el=host.querySelector(sel) as HTMLElement|null;return !!el&&!el.closest('[hidden]')}
  for(const sel of ['#inFiltersBtn','#inFSearch','#inFType','#inCalBtn','#inListBtn','#inBody','#inFilterSummary'])expect(shown(sel),sel+' on the SANS tab').toBe(false)
  expect(tid('sanscal'),'the SANS tab is the SANS calendar even when the Inputs tab was on its List').toBeTruthy()
  await click('#inMemberMode')
  expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('MEMBER_FILTER')
  expect((host.querySelector('#inFType') as HTMLSelectElement).value).toBe('LL')
  expect(shown('#inBody'),'the Inputs tab comes back on its List').toBe(true)
  expect(host.querySelector('#inRangeBtn')!.textContent).toBe(dates)
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
/* "+ Input" on the Inputs calendar's opened day, "+ Commitment" in the SANS day's window */
const addBtn = () => host.querySelector('#sansCal') ? '[data-testid="sd-add"]' : '#icPopAdd'
const tickFly = async () => {
  const input=Array.from(host.querySelectorAll('#inpEditSans label')).find(el=>el.textContent?.includes('Fly'))?.querySelector('input') as HTMLInputElement
  expect(input).toBeTruthy();if(!input.checked)await act(async()=>{input.click()})
}
const newOffer = async (type:string,remark:string) => {
  await openDate();await click(addBtn())
  const id=Object.keys(PEOPLE).find(k=>PEOPLE[k].san&&!PEOPLE[k].archived&&!PEOPLE[k].deleted&&!PEOPLE[k].special)!
  await value('#inpEditPerson',id)
  if(host.querySelector('#inpEditType'))await value('#inpEditType',type)
  else expect(INPEDIT?.type).toBe(type)
  if(type==='SANS Availability')await tickFly()
  await value('#inpEditRmk',remark);await click('#inpEditSave')
  const row=INPUTS.find(r=>r.remarks===remark);expect(row).toBeTruthy();return row!
}
it('a SANS commitment saved from the Inputs tab opens the SANS calendar on its day, and the Inputs tab’s search is kept',async()=>{
  await value('#inFSearch','NO_MEMBER_MATCH')
  const row=await newOffer('SANS Availability','R1 cross-mode saved offer')
  expect(host.querySelector('#inSansMode')?.getAttribute('aria-pressed')).toBe('true')
  expect(tid('win-sansday')).toBeTruthy()
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)?.textContent).toContain('R1 cross-mode saved offer')
  await click('[data-testid="win-sansday-x"]')
  /* it is on no list: SANS availability is filed and found on the SANS calendar only (D620) */
  await click('#inMemberMode');await click('#inListBtn')
  expect(host.querySelector(`#inBody [data-iid="${row.iid}"]`)).toBeNull()
  expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('NO_MEMBER_MATCH')
})
it('a SANS commitment changed to a Member input leaves the SANS day and shows on the Inputs calendar',async()=>{
  await value('#inFSearch','NO_MEMBER_MATCH');await click('#inSansMode')
  const row=await newOffer('SANS Availability','R1 saved offer retyped')
  await click(`[data-popiid="${row.iid}"] [data-testid="sd-open"]`);await value('#inpEditType','Personal');await click('#inpEditSave')
  expect(row.type).toBe('Personal')
  expect(tid('win-sansday')).toBeNull()
  expect(host.querySelector('#inMemberMode')?.getAttribute('aria-pressed')).toBe('true')
  expect((host.querySelector('#inFSearch') as HTMLInputElement).value).toBe('NO_MEMBER_MATCH')
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)?.textContent).toContain('R1 saved offer retyped')
})
it('a Member input changed to a SANS commitment follows its actual saved date and ID',async()=>{
  const row=await newOffer('Personal','R1 saved member retyped')
  await click(`[data-popiid="${row.iid}"]`);await value('#inpEditType','SANS Availability');await tickFly();await click('#inpEditSave')
  expect(row.type).toBe('SANS Availability');expect(row.sans?.f).toBe(true)
  expect(host.querySelector('#inSansMode')?.getAttribute('aria-pressed')).toBe('true')
  expect(tid('win-sansday')).toBeTruthy()
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)?.textContent).toContain('R1 saved member retyped')
  expect(tid('win-sansday')!.querySelector('.win-ttl')?.textContent).toContain('Fri 23 Oct')
})

/* STEP 0 — OPUS'S OWN READ OF THE BUILD (D615, 7 Oct 26). Three finds, each red before its fix. */
it('a saved input opens its day ONCE: closing the day, then List and back to Calendar, does not open it again or move the month',async()=>{
  const row=await newOffer('Personal','Step 0 reveal once')
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)).toBeTruthy()
  await act(async()=>{(host.querySelector('.ic-popwrap') as HTMLElement).dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}))})
  expect(host.querySelector('.ic-popwrap')).toBeNull()
  await click('#icNext')
  expect(host.querySelector('.ic-mon')?.textContent).toContain('Nov')
  await click('#inListBtn');await click('#inCalBtn')
  expect(host.querySelector('.ic-popwrap'),'the day must stay closed').toBeNull()
  expect(host.querySelector('.ic-mon')?.textContent).toContain('Nov')
})
it('the same for the SANS day closed by its own button',async()=>{
  await click('#inSansMode')
  const row=await newOffer('SANS Availability','Step 0 reveal once, SANS')
  expect(host.querySelector(`[data-popiid="${row.iid}"]`)).toBeTruthy()
  await click('[data-testid="win-sansday-x"]');await click('[data-testid="sc-next"]')
  await click('#inMedBtn')
  expect(tid('sanscal'),'Medical takes the SANS calendar’s place while it is up').toBeNull()
  await act(async()=>{setInpView('cal');notify()})
  expect(tid('win-sansday')).toBeNull()
  expect(tid('sc-month')?.textContent).toContain('November')
})
it('the new-input hint speaks of "available hours" on the SANS calendar only',async()=>{
  await openDate();await click('#icPopAdd')
  const hint=()=>host.querySelector('.inped-hint')?.textContent||''
  expect(hint()).not.toMatch(/available hours/i)
  expect(hint()).toMatch(/one input covering the whole date range/i)
  await act(async()=>{setInpEdit(null);notify()})
  await click('#inSansMode');await openDate();await click(addBtn())
  expect(hint()).toMatch(/available hours/i)
})
it('Export writes every input, whatever the list is filtered to (as before the calendar was built)',async()=>{
  const blobs:Blob[]=[]
  const orig=(URL as any).createObjectURL
  ;(URL as any).createObjectURL=(b:Blob)=>{blobs.push(b);return 'blob:x'}
  try{
    await click('#inListBtn');await value('#inFSearch','NOBODY_HAS_THIS_REMARK');await click('#inExport')
  } finally{(URL as any).createObjectURL=orig}
  const text=await new Promise<string>(res=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result));fr.readAsText(blobs[0])})
  expect(text.split('\r\n').length-1).toBe(INPUTS.length)
})
