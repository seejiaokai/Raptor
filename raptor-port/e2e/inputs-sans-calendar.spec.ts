import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* THE SANS CALENDAR IN THE BUILT APP (the Inputs / SANS job, step 4 — the plan §3.5; D617–D651, D664). The first
   calendar's SANS half (Codex, 5 Oct 26: a "Flying SANS required" box in the day panel, a two-figure colour dropdown,
   "Select dates", per-mode filters) is gone, and the tests that drove it by its ids are RE-POINTED here at the control
   that now does each job. What only a real browser can say: saved data surviving a reload, a real mouse drag and a
   real finger, the click a browser sends after a release (it pressed through a window twice on the first look), the
   month's height on a phone (D664) and the opened day sitting beside the month on a desktop. The rules themselves are
   unit tests: ui/sanscal.test.tsx, ui/sansday.test.tsx, ui/calpick.test.ts, ui/sanscal-model.test.ts. */
const DATE='2026-10-13'
const cell=(p:Page,date=DATE)=>p.locator(`[data-icday="${date}"]`)
const tid=(p:Page,id:string)=>p.locator(`[data-testid="${id}"]`)
const MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december']
/* turn whichever calendar is up to a month, by its own ‹ › */
async function month(p:Page,y:number,m:number){
  const sans=await tid(p,'sanscal').count()
  const label=sans?tid(p,'sc-month'):p.locator('.ic-mon'), prev=sans?tid(p,'sc-prev'):p.locator('#icPrev'), next=sans?tid(p,'sc-next'):p.locator('#icNext')
  for(let i=0;i<240;i++){
    const [name,year]=(await label.innerText()).trim().toLowerCase().split(/\s+/)
    /* a phone prints the month's first three letters */
    const d=y*12+(m-1)-(+year*12+MONTHS.findIndex(x=>x.startsWith(name)))
    if(!d)return
    await (d>0?next:prev).click()
  }
  throw new Error('the calendar never reached the month asked for')
}
async function sans(p:Page,who:'a'|'user'='a'){
  await login(p,who);await go(p,'inputs');await p.click('#inSansMode')
  await expect(tid(p,'sanscal')).toBeVisible()
  await month(p,2026,10)
  await expect(cell(p)).toBeVisible()
}
const answer=(p:Page,iso=DATE)=>p.evaluate(d=>{const a=(window as any).flyAnswer(d);return {p:a.need.p,w:a.need.w,tone:a.tone}},iso)
const editorOpen=(p:Page)=>p.locator('#inpEditPop').isVisible()

test('the day’s figure and class reach the SANS date, a commitment is filed from its day, and all of it survives a reload',async({page})=>{
  await sans(page)
  /* the required figure is the Leave War's (D617) and the class is the Calendar window's — planted here by the same
     commands those screens run; typing them has its own browser tests (leavewar.spec.ts, days) */
  await page.evaluate(d=>(window as any).setFlyDays([{iso:d,cls:'night',p:60,w:60}]),DATE)
  const before=await answer(page)
  expect(before.p).toBeGreaterThan(0)
  await expect(tid(page,'sc-need-'+DATE)).toHaveText(`${before.p}${before.w}`)
  await expect(cell(page)).toHaveClass(/\bt-red\b/)
  await expect(cell(page).locator('[data-icon="night"]')).toBeVisible()
  await cell(page).click()
  await expect(tid(page,'win-sansday')).toBeVisible()
  expect(await editorOpen(page),'opening a day must not press through into "+ Commitment"').toBe(false)
  await expect(tid(page,'sd-req-p')).toHaveText('60')
  await tid(page,'sd-add').click();await expect(page.locator('#inpEditSave')).toBeVisible()
  const who=await page.locator('#inpEditPerson').inputValue()
  const seat=await page.evaluate(id=>(window as any).PEOPLE[id].seat==='FCP'?'p':'w',who)
  await page.click('#inpEditSpan [data-span="custom"]')
  await page.fill('#inpEditStart','10:00');await page.fill('#inpEditEnd','11:00')
  await page.fill('#inpEditRmk','Calendar regression short offer');await page.click('#inpEditSave')
  await expect(page.locator('#inpEditPop')).toBeHidden()
  /* a short commitment is one man to fly (D572): the count rises by one and the need of HIS seat falls by one */
  const after=await answer(page)
  expect(after[seat as 'p'|'w']).toBe(before[seat as 'p'|'w']-1)
  await expect(tid(page,'sc-need-'+DATE)).toHaveText(`${after.p}${after.w}`)
  await expect(tid(page,'sc-f-'+DATE)).toHaveText(seat==='p'?'F10':'F01')
  await expect(tid(page,'win-sansday').locator('[data-testid="sd-hours"]')).toHaveText('10:00–11:00')
  await expect(tid(page,'win-sansday').locator('[data-testid="sd-placed"]')).toContainText('Placed by')
  await page.reload();await login(page);await go(page,'inputs');await page.click('#inSansMode');await month(page,2026,10)
  await expect(tid(page,'sc-need-'+DATE)).toHaveText(`${after.p}${after.w}`)
  await expect(tid(page,'sc-f-'+DATE)).toHaveText(seat==='p'?'F10':'F01')
  await expect(cell(page).locator('[data-icon="night"]')).toBeVisible()
})

test('the keyboard picks a reversed run across a month’s end, and Cancel writes nothing',async({page})=>{
  await sans(page);const before=await page.evaluate(()=>(window as any).INPUTS.length)
  await month(page,2026,11);await cell(page,'2026-11-02').focus()
  await page.keyboard.press('Shift+ArrowLeft');await page.keyboard.press('Shift+ArrowLeft')
  await expect(tid(page,'sc-month')).toHaveText('October 2026')
  await expect(cell(page,'2026-10-31')).toBeFocused();await expect(cell(page,'2026-10-31')).toHaveClass(/is-picked/)
  await page.keyboard.press('Enter')
  await expect(page.locator('#inpEditPop')).toContainText(/31 Oct|Oct 31/);await expect(page.locator('#inpEditPop')).toContainText(/2 Nov|Nov 2/)
  await page.click('#inpEditCancel');expect(await page.evaluate(()=>(window as any).INPUTS.length)).toBe(before)
})

test('a mouse drag picks a run of days; brought back to where it began it is that one day',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await sans(page)
  const mid=async(d:string)=>{const b=(await cell(page,d).boundingBox())!;return {x:b.x+b.width/2,y:b.y+b.height/2}}
  const a=await mid('2026-10-13'),b=await mid('2026-10-15')
  await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:5})
  for(const d of ['2026-10-13','2026-10-14','2026-10-15'])await expect(cell(page,d)).toHaveClass(/is-picked/)
  await page.mouse.up()
  await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 13 → Oct 15')
  await page.click('#inpEditCancel')
  await page.mouse.move(a.x,a.y);await page.mouse.down()
  await page.mouse.move(b.x,b.y,{steps:5});await page.mouse.move(a.x,a.y,{steps:5});await page.mouse.up()
  await expect(page.locator('#inpEditSave')).toBeVisible()
  await expect(page.locator('#inpEditPop')).not.toContainText('15 Oct')
  await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 13')
})

test('on a desktop the opened day sits beside the month and covers no date; dragged away, the month takes the width back',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await sans(page)
  const width=async()=>(await tid(page,'sc-grid').boundingBox())!.width
  const full=await width()
  await cell(page).click();await expect(tid(page,'win-sansday')).toBeVisible()
  const win=(await tid(page,'win-sansday').boundingBox())!, grid=(await tid(page,'sc-grid').boundingBox())!
  expect(grid.x+grid.width,'the month ends before the window begins').toBeLessThanOrEqual(win.x)
  /* every date can still be pressed: the thing under its middle is the date itself */
  const covered=await page.evaluate(()=>[...document.querySelectorAll('[data-icday]')].filter(c=>{const r=c.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !(hit&&c.contains(hit))}).map(c=>(c as HTMLElement).dataset.icday))
  expect(covered).toEqual([])
  /* another date re-points the same window — the month behind it works (D641) */
  await cell(page,'2026-10-20').click()
  await expect(tid(page,'win-sansday').locator('.win-ttl')).toContainText('Tue 20 Oct')
  const bar=(await tid(page,'win-sansday').locator('.win-bar').boundingBox())!
  await page.mouse.move(bar.x+80,bar.y+12);await page.mouse.down();await page.mouse.move(bar.x-300,bar.y+200,{steps:6});await page.mouse.up()
  await expect.poll(width).toBe(full)
})

test('the gear: three colours and the late cut-off are saved from its window, reach the month, and survive a reload; Undo takes each back',async({page})=>{
  await sans(page)
  await page.evaluate(d=>(window as any).setFlyDays([{iso:d,p:60,w:60}]),DATE)
  const need=await answer(page);const total=need.p+need.w
  await expect(cell(page)).toHaveClass(/\bt-red\b/)
  /* the gear is the app's own cog — never the sun, which on this calendar means day flying (D635) */
  await expect(tid(page,'sc-gear')).toHaveText('⚙');await expect(tid(page,'sc-gear').locator('svg')).toHaveCount(0)
  await tid(page,'sc-gear').click();await expect(tid(page,'win-sansset')).toBeVisible()
  /* a window, not a wall (D641): dragged aside by its bar, and the month behind it still answers a press */
  const bar=(await tid(page,'win-sansset').locator('.win-bar').boundingBox())!
  await page.mouse.move(bar.x+90,bar.y+12);await page.mouse.down();await page.mouse.move(bar.x-200,bar.y+140,{steps:6});await page.mouse.up()
  const moved=(await tid(page,'win-sansset').boundingBox())!
  expect(Math.abs(moved.x-(bar.x-290))).toBeLessThanOrEqual(3)
  /* a date the moved window does NOT lie over — found by where things are, not named: which date that is depends on
     how tall the page's top is, and the three tabs made it shorter in step 5 (the named date ended up under the window) */
  const clear=await page.evaluate(m=>{for(const d of document.querySelectorAll('[data-testid="sc-grid"] [data-icday]')){const r=d.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(x<m.x-4||x>m.x+m.width+4||y<m.y-4||y>m.y+m.height+4)return (d as HTMLElement).dataset.icday||''}return ''},moved)
  expect(clear,'some date is clear of the window').not.toBe('')
  await cell(page,clear).click();await expect(tid(page,'win-sansday')).toBeVisible();await expect(tid(page,'win-sansset')).toBeVisible()
  await tid(page,'win-sansday-x').click()
  /* red only from more than the day needs: the day falls to amber */
  await tid(page,'sset-yellow').fill('1');await tid(page,'sset-amber').fill('2');await tid(page,'sset-red').fill(String(total+1))
  await tid(page,'sset-mode-days').click();await tid(page,'sset-lead').fill('10')
  await expect(tid(page,'sset-example')).toContainText('commitments are due by the end of')
  await tid(page,'sset-save').click();await expect(tid(page,'win-sansset')).toHaveCount(0)
  await expect(cell(page)).toHaveClass(/\bt-amber\b/)
  await expect(tid(page,'sc-legend')).toContainText(`${total+1}+`)
  expect(await page.evaluate(()=>[(window as any).VCONF.sansCutMode,(window as any).VCONF.sansLead])).toEqual([0,10])
  await page.reload();await login(page);await go(page,'inputs');await page.click('#inSansMode');await month(page,2026,10)
  await expect(cell(page)).toHaveClass(/\bt-amber\b/)
  expect(await page.evaluate(()=>[(window as any).VCONF.sansCutMode,(window as any).VCONF.sansLead])).toEqual([0,10])
  await tid(page,'sc-gear').click();await expect(tid(page,'sset-lead')).toHaveValue('10');await expect(tid(page,'sset-red')).toHaveValue(String(total+1))
  /* a draft is not a save: typed, then ✕ */
  await tid(page,'sset-red').fill('99');await tid(page,'win-sansset-x').click()
  await expect(tid(page,'sc-legend')).toContainText(`${total+1}+`)
})

test('Highlight rings one man’s days in a real browser, and changes no figure',async({page})=>{
  await sans(page)
  const who=await page.evaluate(d=>{const w=window as any,P=w.PEOPLE;const id=Object.keys(P).find(k=>P[k].san&&!P[k].archived&&!P[k].deleted&&!P[k].special&&!P[k].pers&&P[k].seat==='RCP')!
    w.fileInput({person:id,type:'SANS Availability',date:'Oct 13',endDate:'Oct 14',yr:2026,allday:true,sans:{f:true,a:true}});return {id,cs:P[id].cs}},DATE)
  await expect(tid(page,'sc-f-'+DATE)).toHaveText('F01')
  const before=await tid(page,'sc-grid').innerText()
  await tid(page,'sc-hl').click();await tid(page,'sc-hl-'+who.id).click()
  await expect(tid(page,'sc-hl')).toHaveText(who.cs)
  for(const d of [DATE,'2026-10-14'])await expect(cell(page,d)).toHaveClass(/is-hi/)
  await expect(cell(page,'2026-10-15')).not.toHaveClass(/is-hi/)
  await expect(tid(page,'sc-f-'+DATE)).toHaveClass(/is-mine/);await expect(tid(page,'sc-o-'+DATE)).not.toHaveClass(/is-mine/)
  /* the ring is drawn inside the date: it moves no neighbour, and the figures are as they were */
  expect(await tid(page,'sc-grid').innerText()).toBe(before)
  const ring=await cell(page).evaluate(e=>getComputedStyle(e).boxShadow)
  expect(ring).toContain('inset')
  await tid(page,'sc-hl').click();await tid(page,'sc-hl-none').click()
  await expect(cell(page)).not.toHaveClass(/is-hi/)
})

test('a member sees the SANS calendar and a day’s working, with no admin control',async({page})=>{
  await sans(page,'user')
  await expect(tid(page,'sc-legend')).toBeVisible()
  await expect(tid(page,'sc-gear')).toHaveCount(0)
  await cell(page).click();await expect(tid(page,'sd-work')).toBeVisible()
  await expect(tid(page,'sd-days')).toHaveCount(0)
  /* "+ Commitment" is a SANS man's own: for anyone else it is off, and the window says who may */
  const isSans=await page.evaluate(()=>{const w=window as any;const me=Object.keys(w.PEOPLE).find(k=>w.PEOPLE[k].cs==='Ranger');return !!(me&&w.PEOPLE[me].san)})
  if(!isSans){await expect(tid(page,'sd-add')).toBeDisabled();await expect(tid(page,'sd-addwhy')).toBeVisible()}
  else await expect(tid(page,'sd-add')).toBeEnabled()
})

/* RE-POINTED (step 5, 8 Oct 26 — D620): the Inputs tab's "+ Input" no longer offers SANS availability, so this files it
   through the one door there is, the SANS calendar's "+ Commitment". What it pinned stands: the saved commitment is in
   its day's window; Undo, Redo and a change of type follow the record; the Inputs tab's search is kept. */
test('a SANS commitment saved on the SANS calendar is in its day; Undo, Redo and a change of type follow the record',async({page})=>{
  await login(page);await go(page,'inputs');await month(page,2026,10)
  await page.fill('#inFSearch','NO_MEMBER_MATCH')
  await page.click('#inSansMode');await cell(page).click();await tid(page,'sd-add').click()
  await page.selectOption('#inpEditPerson','vinci')
  await expect(page.locator('#inpEditTypeFixed')).toHaveText('SANS Availability')
  await page.locator('#inpEditSans').getByLabel('Fly',{exact:true}).check()
  await page.fill('#inpEditRmk','Cross-mode regression');await page.click('#inpEditSave')
  const iid=await page.evaluate(()=>(window as any).INPUTS.find((r:any)=>r.remarks==='Cross-mode regression').iid)
  await expect(page.locator('#inSansMode')).toHaveAttribute('aria-selected','true')
  await expect(tid(page,'win-sansday').locator(`[data-popiid="${iid}"]`)).toBeVisible()
  await tid(page,'win-sansday-x').click();await page.click('#undoBtn')
  await expect(page.locator(`[data-popiid="${iid}"]`)).toHaveCount(0)
  await page.click('#redoBtn');await expect(tid(page,'win-sansday').locator(`[data-popiid="${iid}"]`)).toBeVisible()
  await page.locator(`[data-popiid="${iid}"] [data-testid="sd-open"]`).click();await page.selectOption('#inpEditType','Personal');await page.click('#inpEditSave')
  await expect(page.locator('#inMemberMode')).toHaveAttribute('aria-selected','true')
  await expect(page.locator('#inFSearch')).toHaveValue('NO_MEMBER_MATCH')
  await expect(tid(page,'win-sansday')).toHaveCount(0)
  /* the Inputs tab's search lets it through nowhere, so it has no bar on the month: its day opens and lists it (a
     save is never answered with an empty screen — the saved-row reveal; an input WITH a bar only flashes, D672) */
  await expect(page.locator(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`)).toBeVisible()
})

test('the SANS tab has no filters, no list and no "Select dates"; the Inputs tab keeps its own',async({page})=>{
  await page.setViewportSize({width:390,height:568})
  await login(page);await go(page,'inputs')
  await page.click('#inFiltersBtn');await page.selectOption('#inFType','LL');await page.fill('#inFSearch','MEMBER_KEEP');await page.click('#inFiltersBtn')
  await expect(page.locator('#inFilterSummary')).toContainText('MEMBER_KEEP')
  await page.click('#inSansMode');await expect(tid(page,'sanscal')).toBeVisible()
  for(const id of ['#inFiltersBtn','#inFSearch','#inFilterSummary','#inCalBtn','#inListBtn','#icSelectDates','#sansColours'])await expect(page.locator(id),id).toBeHidden()
  await page.click('#inMemberMode');await page.click('#inFiltersBtn')
  await expect(page.locator('#inFSearch')).toHaveValue('MEMBER_KEEP');await expect(page.locator('#inFType')).toHaveValue('LL')
})

/* ---- a real finger ------------------------------------------------------------------------------------------------- */
async function phone(browser:any,baseURL:string|undefined,height=844){
  const context=await browser.newContext({baseURL,viewport:{width:390,height},isMobile:true,hasTouch:true})
  const page:Page=await context.newPage()
  await login(page);await go(page,'inputs');await page.click('#inSansMode');await month(page,2026,10)
  return {context,page}
}
const centre=async(p:Page,iso:string)=>{const r=(await cell(p,iso).boundingBox())!;return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}}

test('a tap on a phone opens the day and presses nothing else; the bar’s tap pulls the window up and back without pressing through',async({browser,baseURL})=>{
  const {context,page}=await phone(browser,baseURL)
  try{
    await cell(page,'2026-10-07').tap()
    const win=tid(page,'win-sansday');await expect(win).toBeVisible()
    await page.waitForTimeout(450)                                     // past the click a phone sends after the tap
    expect(await editorOpen(page),'the tap pressed through into the day’s window').toBe(false)
    const low=(await win.boundingBox())!
    expect(low.height,'it opens about two-thirds high — the month behind stays in reach').toBeLessThan(844*0.72)
    expect(low.y+low.height).toBeLessThanOrEqual(844)
    await win.locator('.win-ttl').tap();await expect(win).toHaveClass(/is-tall/)
    await page.waitForTimeout(450)
    expect(await editorOpen(page),'the bar’s tap pressed through as the window moved').toBe(false)
    const tall=(await win.boundingBox())!
    expect(tall.y).toBeLessThanOrEqual(12);expect(tall.height).toBeGreaterThan(844*0.9)
    await win.locator('.win-ttl').tap();await expect(win).not.toHaveClass(/is-tall/)
    /* its ✕ is a finger's size and on the screen */
    const x=(await tid(page,'win-sansday-x').boundingBox())!
    expect(Math.min(x.width,x.height)).toBeGreaterThanOrEqual(44)
    await tid(page,'win-sansday-x').tap();await expect(win).toHaveCount(0)
  }finally{await context.close()}
})

test('a finger held on a date, then dragged, picks the run — the page standing still — and a held finger let go is that one day',async({browser,baseURL})=>{
  const {context,page}=await phone(browser,baseURL)
  try{
    const cdp=await context.newCDPSession(page)
    const a=await centre(page,'2026-10-20'),b=await centre(page,'2026-10-22')
    const y0=await page.evaluate(()=>scrollY)
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]})
    await expect(cell(page,'2026-10-20')).toHaveClass(/is-picked/)       // the hold has taken: the day lights
    expect(await editorOpen(page)).toBe(false)
    for(const x of [a.x+15,a.x+40,(a.x+b.x)/2,b.x])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:Math.round(x),y:a.y+2,id:1}]})
    for(const d of ['2026-10-20','2026-10-21','2026-10-22'])await expect(cell(page,d)).toHaveClass(/is-picked/)
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 20 → Oct 22')
    expect(await page.evaluate(()=>scrollY),'the page scrolled under the finger').toBe(y0)
    await expect(tid(page,'sc-month')).toHaveText('Oct 2026')            // and the month was not turned
    await page.locator('[data-testid="win-inputedit-x"]').tap();await expect(page.locator('#inpEditPop')).toBeHidden()
    /* held and let go without moving: that one day — and the next deliberate tap in the form still lands */
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]})
    await expect(cell(page,'2026-10-20')).toHaveClass(/is-picked/)
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach()
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 20')
    await expect(page.locator('#inpEditRmk')).toHaveValue('')
    await page.locator('#inpEdCal [data-cal="2026-10-22"]').tap()
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Oct 20 → Oct 22')
    await page.locator('[data-testid="win-inputedit-x"]').tap();await expect(page.locator('#inpEditPop')).toBeHidden()
  }finally{await context.close()}
})

test('a quick slide of a finger turns the month and picks nothing',async({browser,baseURL})=>{
  const {context,page}=await phone(browser,baseURL)
  try{
    const cdp=await context.newCDPSession(page)
    const a=await centre(page,'2026-10-22')
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]})
    for(const dx of [20,60,110,150])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x-dx,y:a.y,id:1}]})
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach()
    await expect(tid(page,'sc-month')).toHaveText('Nov 2026')
    expect(await editorOpen(page)).toBe(false);await expect(tid(page,'win-sansday')).toHaveCount(0)
  }finally{await context.close()}
})

/* ON A PHONE THE MONTH IS NEVER A BOX SCROLLED INSIDE THE PAGE (owner D664, 7 Oct 26: "I don't want the area of the
   calendar to be so short that I have to vertically scroll a small box section … It should be a full screen of the
   phone"). At three heights, in a five-week month (October 2026) and a six-week one (August 2026): the month has no
   scroll of its own; where the screen can hold it, it runs to the foot of the screen; where it cannot, the PAGE is
   what scrolls; and nothing runs off sideways. */
for(const height of [568,700,844])for(const [name,y,m] of [['five-week',2026,10],['six-week',2026,8]] as const){
  test(`phone ${height}, a ${name} month: the SANS month fills the screen and has no scroll of its own`,async({page})=>{
    await page.setViewportSize({width:390,height})
    await login(page);await go(page,'inputs');await page.click('#inSansMode');await month(page,y,m)
    await page.evaluate(()=>scrollTo(0,0))
    const g=await page.evaluate(()=>{
      const el=document.querySelector('[data-testid="sc-grid"]') as HTMLElement, r=el.getBoundingClientRect(), cs=getComputedStyle(el)
      const week=el.querySelector('.sc-week') as HTMLElement, day=el.querySelector('[data-icday]') as HTMLElement
      /* what a date needs to be read: its five lines, as the browser lays them out */
      const need=[...day.children].reduce((n,c)=>n+(c as HTMLElement).scrollHeight,0)
      return {top:r.top,bottom:r.bottom,ownScroll:el.scrollHeight-el.clientHeight,maxH:cs.maxHeight,overflowY:cs.overflowY,
        weeks:el.querySelectorAll('.sc-week').length,weekH:week.getBoundingClientRect().height,need,dayH:day.getBoundingClientRect().height,
        pageH:document.documentElement.scrollHeight,pageW:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}
    })
    expect(g.weeks).toBe(name==='five-week'?5:6)
    expect(g.maxH,'the month has no height limit').toBe('none')
    expect(g.ownScroll,'the month does not scroll inside itself').toBeLessThanOrEqual(1)
    expect(g.overflowY).not.toMatch(/auto|scroll/)
    expect(g.pageW,'nothing runs off sideways').toBeLessThanOrEqual(g.vw)
    expect(g.dayH,'a date keeps room for its lines').toBeGreaterThanOrEqual(g.need-1)
    if(g.bottom<=g.vh+0.5){
      /* it fits: then it reaches the foot of the screen — no empty band under a short box */
      expect(g.vh-g.bottom,'the month stops short of the foot of the screen').toBeLessThanOrEqual(16)
    }else{
      /* it does not fit at a readable size: the whole page scrolls to the month's foot */
      expect(g.pageH,'the page itself must be what scrolls').toBeGreaterThanOrEqual(Math.floor(g.bottom))
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight))
      const foot=await tid(page,'sc-grid').evaluate(el=>el.getBoundingClientRect().bottom)
      expect(foot,'the month’s last week is reached by scrolling the page').toBeLessThanOrEqual(g.vh+1)
    }
  })
}

for(const height of [844,568])test(`phone ${height}: the month’s controls are a finger’s size and its name is not cut`,async({page})=>{
  await page.setViewportSize({width:390,height});await sans(page)
  const label=await tid(page,'sc-month').evaluate(e=>({width:e.clientWidth,textWidth:e.scrollWidth}))
  expect(label.width).toBeGreaterThanOrEqual(label.textWidth)
  for(const id of ['sc-prev','sc-next','sc-today','sc-hl','sc-gear']){
    const r=(await tid(page,id).boundingBox())!
    expect(r.height,id+' phone target').toBeGreaterThanOrEqual(44)
  }
  /* the head is ONE line: the arrows, the name, Today, Highlight and the gear share a top, and none runs off the screen */
  const head=await page.evaluate(()=>['sc-prev','sc-month','sc-next','sc-today','sc-hl','sc-gear'].map(id=>{const r=document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect();return {mid:Math.round(r.top+r.height/2),right:r.right,left:r.left}}))
  expect(Math.max(...head.map(h=>h.mid))-Math.min(...head.map(h=>h.mid)),'the head wrapped onto a second line').toBeLessThanOrEqual(2)
  expect(Math.max(...head.map(h=>h.right))).toBeLessThanOrEqual(390);expect(Math.min(...head.map(h=>h.left))).toBeGreaterThanOrEqual(0)
  /* and "Highlight" reads whole, in every month of a year (the months' names differ in width) */
  for(let i=0;i<12;i++){
    const cut=await page.evaluate(()=>{const t=document.querySelector('[data-testid="sc-hl"] .sc-hl-t') as HTMLElement,m=document.querySelector('[data-testid="sc-month"]') as HTMLElement;return {word:t.scrollWidth>t.clientWidth,month:m.scrollWidth>m.clientWidth,name:m.textContent}})
    expect(cut.word,'"Highlight" is cut in '+cut.name).toBe(false);expect(cut.month,'the month is cut: '+cut.name).toBe(false)
    await tid(page,'sc-next').click()
  }
  await month(page,2026,10)
  /* the Highlight list opens on the screen, whole */
  await tid(page,'sc-hl').click()
  const menu=(await tid(page,'sc-hl-menu').boundingBox())!
  expect(menu.x).toBeGreaterThanOrEqual(0);expect(menu.x+menu.width).toBeLessThanOrEqual(390)
  await page.keyboard.press('Escape');await expect(tid(page,'sc-hl-menu')).toHaveCount(0)
  /* with the longest callsign picked the head is still one line, and it is the BUTTON that shortens, never the month */
  const longest=await page.evaluate(()=>{const P=(window as any).PEOPLE;return Object.keys(P).filter(k=>P[k].san&&!P[k].archived&&!P[k].deleted&&!P[k].special&&!P[k].pers).sort((a,b)=>P[b].cs.length-P[a].cs.length)[0]})
  await page.evaluate(id=>{(window as any).PEOPLE[id].cs='Wwwwwwwwwwwwww'},longest)
  await tid(page,'sc-hl').click();await tid(page,'sc-hl-'+longest).click()
  const picked=await page.evaluate(()=>['sc-prev','sc-month','sc-next','sc-today','sc-hl','sc-gear'].map(id=>{const e=document.querySelector(`[data-testid="${id}"]`) as HTMLElement,r=e.getBoundingClientRect();return {mid:Math.round(r.top+r.height/2),right:r.right,cut:id==='sc-month'&&e.scrollWidth>e.clientWidth}}))
  expect(Math.max(...picked.map(h=>h.mid))-Math.min(...picked.map(h=>h.mid)),'a long callsign wrapped the head').toBeLessThanOrEqual(2)
  expect(Math.max(...picked.map(h=>h.right))).toBeLessThanOrEqual(390);expect(picked.some(h=>h.cut),'the month’s name was cut').toBe(false)
  /* THE THREE TABS ARE LESS TALL THAN A BUTTON (owner D626, 7 Oct 26 — "I like the 3 tabs across the top but make it less
     tall"; the later word over the 44px this pinned for the two mode buttons they replaced) — and still a third of the
     screen wide each */
  for(const id of ['#inMemberMode','#inSansMode','#inMedBtn']){
    const r=(await page.locator(id).boundingBox())!
    expect(r.height,id+' is less tall than a button').toBeLessThan(44);expect(r.height).toBeGreaterThanOrEqual(36);expect(r.width).toBeGreaterThan(100)
  }
})

test('a member keeps the Calendar and List doors of the Inputs tab',async({page})=>{
  await login(page,'user');await go(page,'inputs')
  await expect(page.locator('#inpCal')).toBeVisible();await page.click('#inListBtn')
  await expect(page.locator('#inCalBtn')).toBeVisible();await page.click('#inCalBtn')
  await expect(page.locator('#inpCal')).toBeVisible()
})

/* UNDO AND REDO LEAVE THE INPUTS LIST WHERE IT IS WHEN THE INPUT THEY CHANGE IS ALREADY ON SCREEN (owner, D672, 8 Oct 26 —
   "if it's already in view, undo/redo don't need to snap to view. Unless it's outside the screen view then it's ok to
   snap into view"). Until that day the list lifted the changed input to its head EVERY time. Which of the two happens
   hangs on where the row is on the screen, and jsdom lays nothing out (there the page moves as it always did) — so only
   a real browser can say. The rule's arithmetic is ui/onscreen.test.ts; this is the list itself, at desktop and phone
   size: the change made through the row's own editor, the Undo and Redo pressed in the app's top bar. */
for (const size of [{ name: 'a desktop', width: 1280, height: 720 }, { name: 'a phone', width: 390, height: 844 }]) {
  test(`Undo and Redo on the Inputs list leave the page still when the changed input is on screen, and bring it up only when it is not — ${size.name}`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height })
    await login(page); await go(page, 'inputs'); await page.click('#inListBtn')
    await page.click('#inRangeBtn'); await page.click('#inRangeAll')
    const rows = page.locator('#inBody tr[data-iid]')
    await expect(rows.nth(20)).toBeAttached()                 // a list long enough for a row to be far off the screen
    /* an ordinary appointment from the middle of the list: a save of its remarks asks nothing (no OIL question, no
       medical document) and leaves it where its date puts it */
    const iid = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].slice(8, 34)
      .map(r => r.getAttribute('data-iid')!).find(id => (window as any).INPUTS.find((r: any) => r.iid === id)?.type === 'Appointment') ?? '')
    expect(iid, 'the demo list holds an appointment between its 9th and 34th rows').not.toBe('')
    const row = page.locator(`#inBody tr[data-iid="${iid}"]`)
    const remark = () => page.evaluate(id => (window as any).INPUTS.find((r: any) => r.iid === id).remarks ?? '', iid)
    const was = await remark()
    /* where the row is: its place in the list, where the page is scrolled to, and whether the row is wholly on screen */
    const where = () => page.evaluate(id => {
      const all = [...document.querySelectorAll('#inBody tr[data-iid]')]
      const el = all.find(r => r.getAttribute('data-iid') === id)!
      const b = el.getBoundingClientRect(), bar = document.querySelector('.topbar')!.getBoundingClientRect().bottom
      return { index: all.indexOf(el), scrollY: Math.round(scrollY), top: Math.round(b.top), onScreen: b.height > 0 && b.top >= bar - 0.5 && b.bottom <= innerHeight + 0.5 }
    }, iid)
    const centre = () => row.evaluate(el => el.scrollIntoView({ block: 'center' }))
    const still = async () => { let a = await where(); for (let i = 0; i < 40; i++) { await page.waitForTimeout(60); const b = await where(); if (b.scrollY === a.scrollY && b.top === a.top && i > 3) return b; a = b } return a }

    /* the change: its remarks, typed in the row's own editor */
    await centre()
    const home = (await where()).index                       // its own place in the list, by its dates
    await row.locator('[data-edit]').click()
    await page.locator(`#inBody tr.ined[data-iid="${iid}"] [data-ed="remarks"]`).fill('D672 browser check')
    await page.locator(`#inBody tr.ined[data-iid="${iid}"] [data-save]`).click()
    await expect.poll(remark).toBe('D672 browser check')
    /* a SAVE shows the saved input by the same rule: on screen, it stays in its own place in the list */
    expect((await still()).index, 'a saved input that was on screen was lifted to the head of the list').toBe(home)
    /* anything held at the head of the list is let go by the next touch of the list's own controls — so what follows
       is the Undo's doing alone (found by breaking the rule on purpose, 8 Oct 26: with "always lift" the save had
       already lifted the row, and the Undo then had nothing to move) */
    await page.click('#inRangeBtn'); await page.click('#inRangeAll')

    /* 1. ON SCREEN: Undo takes the change back and nothing moves — the row keeps its place in the list, the page its scroll */
    await centre()
    const before = await still()
    expect(before.onScreen, 'the row is on screen before the Undo').toBe(true)
    expect(before.index, 'the row is in its own place in the list before the Undo').toBe(home)
    await page.click('#undoBtn')
    await expect.poll(remark).toBe(was)
    const afterUndo = await still()
    expect(afterUndo.index, 'Undo lifted an input that was already on screen to the head of the list').toBe(before.index)
    expect(Math.abs(afterUndo.scrollY - before.scrollY), 'Undo moved the page though the input was on screen').toBeLessThanOrEqual(1)
    expect(Math.abs(afterUndo.top - before.top), 'the row moved on the screen').toBeLessThanOrEqual(1)

    /* 2. the same for Redo */
    await page.click('#redoBtn')
    await expect.poll(remark).toBe('D672 browser check')
    const afterRedo = await still()
    expect(afterRedo.index, 'Redo lifted an input that was already on screen').toBe(before.index)
    expect(Math.abs(afterRedo.scrollY - before.scrollY), 'Redo moved the page though the input was on screen').toBeLessThanOrEqual(1)

    /* 3. OUT OF VIEW: with the page scrolled to its foot the row is far above the screen — Undo brings it up: it rides
          at the head of the list and the page comes to it */
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    const away = await still()
    expect(away.onScreen, 'the row is off the screen before the second Undo').toBe(false)
    expect(away.index).toBe(before.index)
    await page.click('#undoBtn')
    await expect.poll(remark).toBe(was)
    await expect.poll(async () => (await where()).index, { message: 'an input out of view was not lifted to the head of the list' }).toBe(0)
    /* …wholly on screen, which means CLEAR OF THE TOP BAR: the browser's own nearest-edge scroll left it at the window's
       very top, hidden behind the bar (the fault this check found, 8 Oct 26) */
    await expect.poll(async () => (await where()).onScreen, { message: 'the page did not bring the input on screen, clear of the top bar', timeout: 8000 }).toBe(true)
  })
}

/* THE CALENDAR JOB'S BUG CHECK (8 Oct 26 - walker D, seen by the host: scripts/handpass/cal-host-side.mjs). On a phone
   turned on its side the opened day's pinned top filled the window and the list under it had no room: none of the
   day's entries could be seen. Under 480px of height the window's body is one scroll. */
for (const [name, tab, label, prev, next, y, m, day, win, rows] of [
  ['SANS', '#inSansMode', '[data-testid="sc-month"]', '[data-testid="sc-prev"]', '[data-testid="sc-next"]', 2026, 10, '[data-testid="sc-day-2026-10-07"]', 'win-sansday', '[data-testid^="sd-row-"]'],
  ['Inputs', '#inMemberMode', '#inpCal .ic-mon', '#icPrev', '#icNext', 2026, 7, '#inpCal [data-icday="2026-07-14"]', 'win-inputsday', '[data-testid^="idy-row-"]'],
] as const) {
  test(`a phone on its side: a day opened on the ${name} calendar lets every entry be reached`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true })
    const page: Page = await context.newPage()
    await login(page); await go(page, 'inputs')
    /* BACKGROUND, not the thing tested: six SANS people's commitments on Wed 7 Oct, so the list has something to reach */
    if (name === 'SANS') await page.evaluate(() => {
      const w = window as any
      Object.keys(w.PEOPLE).filter(id => w.PEOPLE[id].san && !w.PEOPLE[id].archived && !w.PEOPLE[id].deleted).slice(0, 6)
        .forEach((person, i) => w.fileInput({ iid: 'side-' + i, person, type: 'SANS Availability', date: 'Oct 7', yr: 2026, allday: true, sans: { f: true } }))
    })
    await page.locator(tab).tap()
    /* the day with entries: Wed 7 Oct 26 on SANS (seeded above), the demo's own Tue 14 Jul 26 on Inputs */
    for (let i = 0; i < 36; i++) {
      const [mm, yy] = (await page.locator(label).innerText()).trim().toLowerCase().split(/\s+/)
      const d = y * 12 + (m - 1) - (+yy * 12 + ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(mm.slice(0, 3)))
      if (!d) break
      await page.locator(d > 0 ? next : prev).tap()
    }
    await page.locator(day).scrollIntoViewIfNeeded()
    await page.locator(day).tap({ position: { x: 8, y: 8 } })
    const w = page.locator(`[data-testid="${win}"]`)
    await expect(w).toBeVisible()
    expect(await w.locator(rows).count(), 'the demo day has entries').toBeGreaterThan(1)
    const last = w.locator(rows).last()
    await last.scrollIntoViewIfNeeded()
    const box = (await last.boundingBox())!
    expect(box.y, 'the last entry is on the screen').toBeGreaterThanOrEqual(0)
    expect(box.y + box.height).toBeLessThanOrEqual(390 + 1)
    const hit = await last.evaluate((el, b) => { const h = document.elementFromPoint(b.x + b.width / 2, b.y + Math.min(b.height / 2, 12)); return !!h && (h === el || el.contains(h)) }, box)
    expect(hit, 'and a finger lands on it - nothing lies over it').toBe(true)
    await context.close()
  })
}
