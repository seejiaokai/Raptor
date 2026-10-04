import { test, expect, type Page, type Locator } from '@playwright/test'
import { login, go } from './app'

const typing = '[data-txt],[data-inp],[data-bfld],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const field = (page: Page, surface: string, key: string, n = 0) => page.locator(`${surface} [${surface === '#sbBoard' ? 'data-bfld' : 'data-txt'}="${key}"]`).nth(n)
async function focused(el: Locator) { await expect(el).toBeFocused(); expect(await el.evaluate(e => e.isConnected)).toBe(true) }
async function flight(page: Page, surface: string) {
  const routes: Locator[] = [], details = ['cs','msn','br','to','ld']
  if (surface === '#sbBoard') for (let ai = 0; ai < 2; ai++) {
    routes.push(...details.map(k => field(page, surface, `ff:0.0.0.${k}`, ai)))
    routes.push(field(page, surface, `fr:0.0.0.${ai}`), page.locator(`${surface} [data-bombs="0.0.0.${ai}"]`))
  } else {
    routes.push(...details.map(k => field(page, surface, `ff:0.0.0.${k}`)))
    for (let ai = 0; ai < 2; ai++) routes.push(field(page, surface, `fr:0.0.0.${ai}`), page.locator(`${surface} [data-bombs="0.0.0.${ai}"]`))
  }
  routes.push(page.locator(`${surface} [data-area="0.0.0"]`), page.locator(`${surface} [data-atime="0.0.0"]`))
  await routes[0]!.focus()
  for (let i = 1; i < routes.length; i++) { await page.keyboard.press('Tab'); await focused(routes[i]!) }
  for (let i = routes.length - 2; i >= 0; i--) { await page.keyboard.press('Shift+Tab'); await focused(routes[i]!) }
}
async function openBoard(page: Page) {
  await page.locator('#eWeek [data-sbday="0"]').first().click()
  await expect(page.locator('#schedBoard')).toBeVisible()
}
for (const [name, viewport] of [['desktop',{width:1440,height:900}],['phone',{width:390,height:844}]] as const) {
  test.describe(`schedule Tab ${name}`, () => {
    test.use({ viewport, ...(name === 'phone' ? { isMobile: true, hasTouch: true } : {}) })
    test('D550–D556 B/reverse, repeated aircraft, empty fields and no-op silence on both pages', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      const before = await page.evaluate(() => JSON.stringify([(window as any).DAYS,(window as any).INPUTS,(window as any).SCHED]))
      await flight(page, '#eWeek .day[data-day="0"]')
      await openBoard(page); await flight(page, '#sbBoard')
      expect(await page.evaluate(() => JSON.stringify([(window as any).DAYS,(window as any).INPUTS,(window as any).SCHED]))).toBe(before)
      await expect(page.locator('.mission-role-question')).toHaveCount(0)
    })
    test('D555 every open text family follows displayed order; closed inputs stay closed', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      for (const surface of ['#eWeek .day[data-day="0"]', '#sbBoard']) {
        if (surface === '#sbBoard') await openBoard(page)
        const toggle = page.locator(`${surface} [data-pitog="0"]`)
        await toggle.click()
        const all = await page.locator(surface).locator(typing).elementHandles(), eligible = []
        for (const el of all) if (await el.isVisible() && await el.evaluate(e => e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true')) eligible.push(el)
        expect(eligible.length).toBeGreaterThan(40)
        await eligible[0]!.focus()
        for (let i = 1; i < eligible.length; i++) {
          await page.keyboard.press('Tab')
          expect(await eligible[i]!.evaluate(e => document.activeElement === e), `${surface} stop${i+1}`).toBe(true)
        }
        await toggle.click()
        const section = page.locator(`${surface} [data-secmove="0.inputs"]`), closed = await section.textContent()
        await flight(page, surface)
        expect(await section.textContent()).toBe(closed)
      }
    })
    test('D553 first/last exits remain on the day without next-day pan or closed-drawer focus', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      const first = page.locator('#eWeek .day[data-day="0"] [data-txt^="dn:"]').first()
      await first.focus(); await page.keyboard.press('Shift+Tab')
      expect(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.signday)).toBe('0')
      const last = page.locator('#eWeek .day[data-day="0"] [data-inp$=".rmks"]').last()
      await last.focus(); const pan = await page.locator('#eWeek').evaluate(e => e.scrollLeft)
      await page.keyboard.press('Tab')
      expect(await page.locator('#eWeek').evaluate(e => e.scrollLeft)).toBe(pan)
      expect(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest('#eWeek .day[data-day="0"]'))).toBe(true)
      await openBoard(page)
      await page.locator('#sbBoard [data-ifld$=".rmks"]').last().focus(); await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !document.activeElement?.closest('#eWeek') && !(document.activeElement?.closest('#sbRoster') && !document.body.classList.contains('ros-open') && document.activeElement!.getBoundingClientRect().left >= innerWidth))).toBe(true)
      expect(await page.evaluate(() => (window as any).SBDAY)).toBe(0)
    })
    test('native Board change saves once, refreshes repeated fields and settles after text exit', async ({ page }) => {
      await login(page); await go(page, 'editsched'); await openBoard(page)
      const cs = field(page, '#sbBoard', 'ff:0.0.0.cs'), seq = await page.evaluate(() => (window as any).commandStreamLen())
      await cs.fill('TAB CS'); await page.keyboard.press('Tab')
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].cs)).toBe('TAB CS')
      expect(await page.evaluate(() => (window as any).commandStreamLen())).toBe(seq + 1)
      for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
      await focused(field(page, '#sbBoard', 'ff:0.0.0.cs', 1)); await expect(field(page, '#sbBoard', 'ff:0.0.0.cs', 1)).toHaveValue('TAB CS')
      const input = page.locator('#sbBoard [data-ifld$=".rmks"]').first()
      await input.fill('TAB INPUT REMARK'); await page.keyboard.press('Tab')
      await expect(input).toHaveValue('TAB INPUT REMARK')
      await page.locator('#sbDone').click(); await expect(page.locator('#schedBoard')).toBeHidden()
      await openBoard(page); await expect(field(page, '#sbBoard', 'ff:0.0.0.cs', 1)).toHaveValue('TAB CS')
    })
  })
}
test('week TO→Tab leaves derived Area time live; in-time deletion readdresses its neighbour', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  const surface = '#eWeek .day[data-day="0"]'
  await field(page, surface, 'ff:0.0.0.to').fill('1255')
  for (let i = 0; i < 7; i++) await page.keyboard.press('Tab')
  await focused(page.locator(`${surface} [data-atime="0.0.0"]`)); await expect(page.locator(`${surface} [data-atime="0.0.0"]`)).toHaveText('1255-1405')
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].atime ?? null)).toBe(null)
  const line = page.locator(`${surface} [data-itline="0|0|0"]`)
  await line.fill(''); await page.keyboard.press('Tab'); await focused(page.locator(`${surface} [data-itline="0|0|0"]`))
  await page.locator(`${surface} [data-itline="0|0|0"]`).fill('11:00 NEW RALLY'); await page.keyboard.press('Tab')
  expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].intimes)).toEqual(['11:00 NEW RALLY'])
})

test('week Tab reveals a destination covered by the fixed week navigation arrow', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000})
  await login(page); await go(page, 'editsched')
  const fields=await page.locator('#eWeek .day[data-day="0"]').locator(typing).elementHandles(), eligible=[]
  for(const el of fields)if(await el.isVisible()&&await el.evaluate(e=>e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement?!e.disabled&&!e.readOnly:e.getAttribute('contenteditable')==='true'))eligible.push(el)
  await eligible[0]!.focus()
  for(let i=1;i<4;i++){
    await page.keyboard.press('Tab')
    expect(await eligible[i]!.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return document.activeElement===e&&(hit===e||e.contains(hit))}),`Visible focus at stop ${i}`).toBe(true)
  }
})

test('phone Desktop Board keeps each destination reachable through the visible part of wide boxes', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});await login(page);await go(page,'editsched');await openBoard(page)
  await page.locator('#sbMore').click();await page.locator('#sbMoreWide').click()
  const fields=await page.locator('#sbBoard').locator(typing).elementHandles(), eligible=[]
  for(const el of fields)if(await el.isVisible()&&await el.evaluate(e=>e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement?!e.disabled&&!e.readOnly:e.getAttribute('contenteditable')==='true'))eligible.push(el)
  expect(eligible.length).toBeGreaterThan(40);await eligible[0]!.focus()
  for(let i=1;i<eligible.length;i++){
    await page.keyboard.press('Tab')
    expect(await eligible[i]!.evaluate(e=>{const r=e.getBoundingClientRect(),l=Math.max(0,r.left),rr=Math.min(innerWidth,r.right),t=Math.max(0,r.top),b=Math.min(innerHeight,r.bottom),hit=rr>l&&b>t?document.elementFromPoint((l+rr)/2,(t+b)/2):null;return document.activeElement===e&&(hit===e||e.contains(hit))}),`Reachable phone Desktop stop ${i}`).toBe(true)
  }
})
for(const exit of ['Enter','ordinary blur','final Tab'])test(`week settles Area time after TO → unchanged Landing → ${exit}`,async({page})=>{
  await login(page);await go(page,'editsched')
  const surface='#eWeek .day[data-day="0"]',to=field(page,surface,'ff:0.0.0.to'),ld=field(page,surface,'ff:0.0.0.ld')
  const before=await page.evaluate(()=>(window as any).commandStreamLen())
  await to.fill('1255');await page.keyboard.press('Tab');await focused(ld);await page.waitForTimeout(100)
  if(exit==='Enter')await page.keyboard.press('Enter')
  else if(exit==='ordinary blur')await page.locator(`${surface} .ap-h`).first().click()
  else {const last=page.locator(`${surface} [data-inp$=".rmks"]`).last();await last.focus();await page.keyboard.press('Tab')}
  await expect(page.locator(`${surface} [data-atime="0.0.0"]`)).toHaveText('1255-1405')
  await expect(to).toHaveText('12:55')
  expect(await page.evaluate(()=>(window as any).DAYS[0].waves[0].formations[0].atime??null)).toBe(null)
  expect(await page.evaluate(()=>(window as any).commandStreamLen())).toBe(before+1)
})
