// @vitest-environment jsdom
/* D558: mounted placement/lifecycle. Real layout/native blur are browser proof. */
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession, loadWeek } from '../state/store'
import { setPage, setBoardDay } from '../state/view'
import { setDrawer, setInsights, setWeekCal } from './pops'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { HIST } from '../state/history'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let root: Root, host: HTMLDivElement
const $ = (s: string) => host.querySelector(s) as HTMLElement | null
const click = async (s: string) => {
  expect($(s), s).toBeTruthy()
  await act(async () => { $(s)!.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const change = (f: () => void) => act(async () => { f(); notify() })
const key = async (s: string, k: string) => {
  await act(async () => { $(s)!.dispatchEvent(new KeyboardEvent('keydown', { key:k, bubbles:true, cancelable:true })) })
}
const width = (n: number) => change(() => { Object.defineProperty(window,'innerWidth',{configurable:true,value:n}); window.dispatchEvent(new Event('resize')) })
beforeAll(async () => {
  initStore(); accountsLoad(); Object.defineProperty(window,'innerWidth',{configurable:true,value:390})
  host=document.createElement('div'); document.body.append(host); root=createRoot(host)
  await act(async () => { root.render(<App />) })
})
afterAll(async () => { await act(async () => root.unmount()); host.remove() })
beforeEach(async () => {
  vi.restoreAllMocks()
  await change(() => { setInsights(false); setDrawer(false); setWeekCal(false); setBoardDay(null); setSession(sessionFor(signIn('ad','a'))); setPage('viewsched') })
  await width(390)
  // jsdom has no painted boxes. Only mounted focus wiring uses this stand-in;
  // browser checks prove real visible/connected focus targets at actual widths.
  for(const id of ['viewSchedMore','editSchedMore'])if($(`#${id}`))
    vi.spyOn($(`#${id}`)!,'getClientRects').mockReturnValue([{}] as unknown as DOMRectList)
})
for (const [page,id] of [['viewsched','viewSched'],['editsched','editSched']] as const) {
  it(`${page}: More after Highlight, only Insights, toggle/Escape and modal focus return`, async () => {
    await change(() => setPage(page))
    expect($(`#${id}More`)?.parentElement?.previousElementSibling?.classList.contains('hl-tog')).toBe(true)
    await click(`#${id}More`)
    expect($(`#${id}More`)?.getAttribute('aria-expanded')).toBe('true')
    expect($(`#${id}MoreMenu`)?.querySelectorAll('[role="menuitem"]')).toHaveLength(1)
    expect($(`#${id}MoreInsights`)?.textContent).toBe('Insights')
    await key(`#${id}More`,'ArrowDown')
    expect(document.activeElement?.id).toBe(`${id}MoreInsights`)
    await key(`#${id}MoreInsights`,'Escape')
    expect($(`#${id}MoreMenu`)).toBeNull(); expect(document.activeElement?.id).toBe(`${id}More`)
    await click(`#${id}More`); await click(`#${id}More`); expect($(`#${id}MoreMenu`)).toBeNull()
    await click(`#${id}More`); await click(`#${id}MoreInsights`)
    expect($(`#${id}MoreMenu`)).toBeNull(); expect($('#insightModal')?.hasAttribute('hidden')).toBe(false)
    expect(document.activeElement?.id).toBe('insightClose')
    await click('#insightClose'); expect(document.activeElement?.id).toBe(`${id}More`)
  })
}
it('drawer Week shortcuts disappear while account, role, logout and calendar remain', async () => {
  await click('#burger')
  expect($('#drawerWeeks')).toBeNull(); expect($('#drawerPickWeek')).toBeNull(); expect($('#drawerInsights')).toBeNull()
  expect([...host.querySelectorAll('#drawer h4')].map(e=>e.textContent)).toEqual(['Menu','Account'])
  expect($('#drawerAcct')).toBeTruthy(); expect($('#drawerRole')).toBeTruthy(); expect($('#drawerLogout')).toBeTruthy()
  await change(() => setDrawer(false)); await click('#page-viewsched .filt-cal')
  expect($('#weekCal')?.hasAttribute('hidden')).toBe(false)
})
for (const [name,leave,back] of [
  ['page',()=>setPage('inputs'),()=>setPage('viewsched')],
  ['drawer',()=>setDrawer(true),()=>setDrawer(false)],
  ['Board',()=>setBoardDay(0),()=>setBoardDay(null)],
  ['calendar',()=>setWeekCal('view'),()=>setWeekCal(false)],
  ['same-role account',()=>setSession({user:'other',role:'admin'}),()=>{}],
  ['role',()=>setSession({user:'a',role:'main'}),()=>setSession({user:'a',role:'admin'})],
] as const) {
  it(`open menu clears on ${name}; return cannot resurrect it`,async()=>{
    await click('#viewSchedMore'); await change(leave)
    expect($('#viewSchedMoreMenu')).toBeNull()
    await change(back); expect($('#viewSchedMoreMenu')).toBeNull()
  })
}
it('week swap clears open state and does not resurrect on returning',async()=>{
  await click('#viewSchedMore'); await act(async()=>loadWeek('20/07/2026'))
  expect($('#viewSchedMoreMenu')).toBeNull(); await act(async()=>loadWeek('13/07/2026')); expect($('#viewSchedMoreMenu')).toBeNull()
})
it('desktop crossing clears the menu; returning phone does not resurrect',async()=>{
  await click('#viewSchedMore'); await width(821); expect($('#viewSchedMoreMenu')).toBeNull()
  expect($('#viewSchedMore')).toBeNull(); await width(820); expect($('#viewSchedMoreMenu')).toBeNull()
})
it('outside pointer closes without cancelling its target or stealing focus',async()=>{
  await click('#viewSchedMore'); const search=$('#searchV')!
  const event=new MouseEvent('pointerdown',{bubbles:true,cancelable:true})
  await act(async()=>{ search.dispatchEvent(event); search.focus() })
  expect(event.defaultPrevented).toBe(false); expect($('#viewSchedMoreMenu')).toBeNull(); expect(document.activeElement).toBe(search)
})
it('hidden menu releases its Escape listener; guest tree receives no new doors',async()=>{
  await click('#viewSchedMore');await change(()=>setPage('inputs'))
  const event=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})
  await act(async()=>document.dispatchEvent(event));expect(event.defaultPrevented).toBe(false)
  await change(()=>setSession({user:'guest',role:'guest'}))
  expect($('#guestApp')).toBeTruthy();expect($('#shell')).toBeNull()
  expect($('#viewSchedMore,#editSchedMore,#drawer,#insightModal')).toBeNull()
})
it('open/close is local chrome: schedule, issued data, storage and history stay silent',async()=>{
  const snapshot=JSON.stringify([DAYS,SCHED,localStorage,HIST])
  for(let i=0;i<3;i++){await click('#viewSchedMore'); await click('#viewSchedMore')}
  expect(JSON.stringify([DAYS,SCHED,localStorage,HIST])).toBe(snapshot)
})
