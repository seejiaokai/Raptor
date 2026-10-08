import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

/* D570–D580: real saved data, independent aggregate counts, date gestures and
   controls on the production build. Role/write denial is also pinned at the
   command boundary in state/sans-calendar.test.ts. */
const DATE='2026-10-11'
const cell=(p:Page,date=DATE)=>p.locator(`[data-icday="${date}"]`)
async function october(p:Page){
  for(let i=0;i<240&&!await cell(p).count();i++){
    const shown=new Date('1 '+await p.locator('.ic-mon').innerText())
    await p.click(shown.getFullYear()*12+shown.getMonth()>2026*12+9?'#icPrev':'#icNext')
  }
  await expect(cell(p)).toBeVisible()
}
async function sans(p:Page){
  await login(p);await go(p,'inputs');await p.click('#inSansMode')
  await october(p)
}
async function day(p:Page){await cell(p).click();await expect(p.locator('#sansRequired')).toBeVisible()}
async function target(p:Page,n:string,period='night'){
  await p.fill('#sansRequired',n);await p.selectOption('#sansFlying',period);await p.click('#sansDaySave')
  await expect(p.locator('#sansDaySave')).toBeEnabled()
}

test('daily flying target survives reload, and filtered offers keep the real shortage',async({page})=>{
  await sans(page);await day(page);await target(page,'4')
  await expect(cell(page)).toContainText('4 more')
  await expect(cell(page).getByRole('img',{name:'Night flying'})).toBeVisible()
  await page.click('#icPopAdd');await expect(page.locator('#inpEditSave')).toBeVisible()
  await page.click('#inpEditSpan [data-span="custom"]')
  await page.fill('#inpEditStart','10:00');await page.fill('#inpEditEnd','11:00')
  await page.fill('#inpEditRmk','Calendar regression short offer');await page.click('#inpEditSave')
  await expect(page.locator('#inpEditPop')).toBeHidden()
  await expect(cell(page)).toContainText('1 / 4')
  await expect(page.locator('.ic-pop')).toContainText('10:00–11:00')
  await page.fill('#inFSearch','a search that hides all rows')
  await expect(cell(page)).toContainText('1 / 4');await expect(cell(page)).toContainText('3 more')
  await page.reload();await login(page);await go(page,'inputs');await page.click('#inSansMode')
  await october(page)
  await expect(cell(page)).toContainText('1 / 4')
  await expect(cell(page).getByRole('img',{name:'Night flying'})).toBeVisible()
})

test('blank and explicit zero targets stay distinct, with editable colour boundaries',async({page})=>{
  await sans(page);await day(page);await target(page,'0','day')
  await expect(cell(page)).toContainText('None required')
  await target(page,'','day');await expect(cell(page)).toHaveAttribute('aria-label',/target not set/)
  await page.click('#icPopClose');await page.click('#sansColours')
  await page.fill('#sansAmber','2');await page.fill('#sansRed','4');await page.click('#sansColourSave')
  await day(page);await target(page,'1');await expect(cell(page)).not.toHaveClass(/sans-amber|sans-red/)
  await target(page,'2');await expect(cell(page)).toHaveClass(/sans-amber/)
  await target(page,'4');await expect(cell(page)).toHaveClass(/sans-red/)
})

test('keyboard selects a reversed cross-month range without writing on cancel',async({page})=>{
  await sans(page);const before=await page.evaluate(()=>(window as any).INPUTS.length)
  await page.click('#icSelectDates');await cell(page,'2026-10-31').focus();await page.keyboard.press('Enter')
  await page.click('#icNext');await cell(page,'2026-11-02').focus();await page.keyboard.press('Space')
  await expect(page.locator('.ic-range-bar')).toContainText('31 Oct');await expect(page.locator('.ic-range-bar')).toContainText('2 Nov')
  await page.click('#icRangeAdd');await expect(page.locator('#inpEditPop')).toContainText(/31 Oct|Oct 31/)
  await page.click('#inpEditCancel');expect(await page.evaluate(()=>(window as any).INPUTS.length)).toBe(before)
})

test('mouse range returned to its starting day becomes a single-day draft',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await sans(page)
  const a=(await cell(page,'2026-10-13').boundingBox())!,b=(await cell(page,'2026-10-15').boundingBox())!
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down()
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:5});await page.mouse.move(a.x+a.width/2,a.y+a.height/2,{steps:5});await page.mouse.up()
  await expect(page.locator('#inpEditSave')).toBeVisible()
  await expect(page.locator('#inpEditPop')).not.toContainText('15 Oct')
})

test('member retains Calendar and List doors without admin settings',async({page})=>{
  await login(page,'user');await go(page,'inputs')
  await expect(page.locator('#inpCal')).toBeVisible();await page.click('#inListBtn')
  await expect(page.locator('#inCalBtn')).toBeVisible();await page.click('#inSansMode');await page.click('#inCalBtn')
  await expect(page.locator('#sansColours')).toHaveCount(0)
  await october(page)
  await cell(page).click();await expect(page.locator('#sansRequired')).toHaveCount(0)
})

test('cross-mode saves and edits reveal the actual saved row despite remembered destination filters',async({page})=>{
  await sans(page);await page.fill('#inFSearch','NO_SANS_MATCH');await page.click('#inMemberMode')
  await page.fill('#inFSearch','NO_MEMBER_MATCH');await cell(page).click();await page.click('#icPopAdd')
  await page.selectOption('#inpEditPerson','vinci');await page.selectOption('#inpEditType','SANS Availability')
  await page.locator('#inpEditSans').getByLabel('Fly',{exact:true}).check()
  await page.fill('#inpEditRmk','Cross-mode regression');await page.click('#inpEditSave')
  const iid=await page.evaluate(()=>(window as any).INPUTS.find((r:any)=>r.remarks==='Cross-mode regression').iid)
  await expect(page.locator('#inSansMode')).toHaveAttribute('aria-pressed','true')
  await expect(page.locator('#inFSearch')).toHaveValue('NO_SANS_MATCH')
  await expect(page.locator(`[data-popiid="${iid}"]`)).toBeVisible()
  await page.click('#icPopClose');await page.click('#undoBtn')
  await expect(page.locator(`[data-popiid="${iid}"]`)).toHaveCount(0)
  await page.click('#redoBtn');await expect(page.locator(`[data-popiid="${iid}"]`)).toBeVisible()
  await page.click(`[data-popiid="${iid}"]`);await page.selectOption('#inpEditType','Personal');await page.click('#inpEditSave')
  await expect(page.locator('#inMemberMode')).toHaveAttribute('aria-pressed','true')
  await expect(page.locator('#inFSearch')).toHaveValue('NO_MEMBER_MATCH')
  await expect(page.locator('#sansDayPop [data-popiid]')).toHaveCount(0)
  await expect(page.locator(`[data-popiid="${iid}"]`)).toBeVisible()
  await page.click('#icPopClose');await page.click('#inListBtn')
  await expect(page.locator(`#inBody tr[data-iid="${iid}"]`)).toBeVisible()
  await page.fill('#inFSearch','DELIBERATELY_CHANGED_FILTER')
  await expect(page.locator(`#inBody tr[data-iid="${iid}"]`)).toHaveCount(0)
})

test('a stationary phone hold keeps exactly its day and allows the next deliberate picker tap',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,viewport:{width:390,height:568},isMobile:true,hasTouch:true})
  try{
    const page=await context.newPage()
    await page.clock.setFixedTime(new Date('2026-07-13T09:00:00+08:00'))
    await login(page);await go(page,'inputs');await page.click('#inSansMode')
    const pressed=cell(page,'2026-07-22');await pressed.scrollIntoViewIfNeeded()
    const r=(await pressed.boundingBox())!,point={x:r.x+r.width/2,y:r.y+Math.min(r.height-6,35),id:1}
    const cdp=await context.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]})
    await expect(page.locator('#inpEditRmk')).toBeVisible()
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach()
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Jul 22')
    await expect(page.locator('#inpEditRmk')).toHaveValue('')
    await page.locator('#inpEdCal [data-cal="2026-07-24"]').tap()
    await expect(page.locator('#inpEditPop .rc-read')).toHaveText('Jul 22 → Jul 24')
    await page.locator('#inpEditClose').tap();await expect(page.locator('#inpEditPop')).toBeHidden()
  }finally{await context.close()}
})

for(const height of [844,568])test(`phone ${height}: month text and day close stay readable and hit-able`,async({page})=>{
  await page.setViewportSize({width:390,height});await sans(page)
  const label=await page.locator('.ic-mon').evaluate(e=>({width:e.clientWidth,textWidth:e.scrollWidth}))
  expect(label.width).toBeGreaterThanOrEqual(label.textWidth)
  for(const id of ['#inCalBtn','#inListBtn','#inMedBtn','#icPrev','#icNext','#icToday','#icSelectDates','#sansColours']){
    const r=(await page.locator(id).boundingBox())!
    expect(r.height,id+' phone target').toBeGreaterThanOrEqual(44)
  }
  await day(page);await page.locator('#sansDaySave').scrollIntoViewIfNeeded()
  for(const id of ['#sansDaySave','#icPopClose']){
    await page.locator(id).scrollIntoViewIfNeeded()
    expect(await page.locator(id).evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.top>=0&&r.bottom<=innerHeight&&(hit===e||e.contains(hit))})).toBe(true)
  }
  await page.click('#icPopClose');await expect(page.locator('#sansDayPop')).toBeHidden()
})

test('phone filters fold without losing their active state or the other input mode',async({page})=>{
  await page.setViewportSize({width:390,height:568});await sans(page)
  await expect(page.locator('#inFSearch')).toBeHidden()
  await page.click('#inFiltersBtn');await page.fill('#inFSearch','NO_SANS_MATCH');await page.click('#inFiltersBtn')
  await expect(page.locator('#inFSearch')).toBeHidden();await expect(page.locator('#inFilterSummary')).toContainText('NO_SANS_MATCH')
  await page.click('#inMemberMode');await page.click('#inFiltersBtn')
  await expect(page.locator('#inFSearch')).toHaveValue('');await page.selectOption('#inFType','LL');await page.fill('#inFSearch','MEMBER_KEEP')
  await page.click('#inFiltersBtn');await page.click('#inSansMode');await page.click('#inFiltersClear')
  await expect(page.locator('#inFilterSummary')).toHaveCount(0)
  await page.click('#inMemberMode');await page.click('#inFiltersBtn')
  await expect(page.locator('#inFSearch')).toHaveValue('MEMBER_KEEP');await expect(page.locator('#inFType')).toHaveValue('LL')
})

test('colour popup owns Escape and outside presses without saving its draft or exiting Calendar',async({page})=>{
  await sans(page);await page.click('#sansColours');await page.fill('#sansAmber','2');await page.fill('#sansRed','4')
  await page.keyboard.press('Escape');await expect(page.locator('#sansColourForm')).toBeHidden()
  await expect(page.locator('#sansColours')).toBeFocused();await expect(page.locator('#inCalBtn')).toHaveAttribute('aria-pressed','true')
  await page.click('#sansColours');await expect(page.locator('#sansAmber')).toHaveValue('1')
  await page.fill('#sansAmber','8');const before=await page.locator('.ic-mon').innerText()
  await page.click('#icNext');await expect(page.locator('#sansColourForm')).toBeHidden();await expect(page.locator('.ic-mon')).not.toHaveText(before)
  await page.click('#sansColours');await expect(page.locator('#sansAmber')).toHaveValue('1')
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
