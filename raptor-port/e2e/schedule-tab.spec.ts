import { test, expect, type Page, type Locator, type ElementHandle } from '@playwright/test'
import { login, go } from './app'

const typing = '[data-txt],[data-inp],[data-bfld],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const field = (page: Page, surface: string, key: string, n = 0) => page.locator(`${surface} [${surface === '#sbBoard' ? 'data-bfld' : 'data-txt'}="${key}"]`).nth(n)
async function focused(el: Locator) { await expect(el).toBeFocused(); expect(await el.evaluate(e => e.isConnected)).toBe(true) }
/* THE BOXES A PERSON CAN TYPE IN ON A SURFACE, FOUND IN ONE CALL TO THE PAGE ([CI-E2E-FLAKES-1020], 20 Oct 26). Each test
   used to ask the browser about every one of a surface's 210-odd typing elements twice (is it visible? can it be typed
   in?) — some 860 round trips before the D555 test pressed its first key — and on GitHub's slower machines that test ran
   29.4 s of its 30 (main's run of 20 Oct 26), and over it on the run that failed. The same two questions, asked inside the
   page: Playwright's own reading of "visible" (a computed visibility of visible and a box with width and height) and the
   same "can be typed in"; `ownOnly` leaves out a box inside a role question, a frozen look or a window (D597's last box).
   Document order, as the handles were. */
async function typeable(page: Page, surface: string, ownOnly = false): Promise<ElementHandle<HTMLElement>[]> {
  const list = await page.evaluateHandle(([sur, sel, own]) => {
    const vis = (e: HTMLElement) => { if (e.checkVisibility && !e.checkVisibility()) return false; if (getComputedStyle(e).visibility !== 'visible') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const ok = (e: HTMLElement) => e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true'
    return [...document.querySelectorAll(sur as string)].flatMap(root => [...root.querySelectorAll<HTMLElement>(sel as string)])
      .filter(e => vis(e) && (!own || !e.closest('[data-role-ui],[data-role-remarks],.pv-frozen,[role="dialog"]')) && ok(e))
  }, [surface, typing, ownOnly] as const)
  const out = [...(await list.getProperties()).values()].map(h => h.asElement() as ElementHandle<HTMLElement>)
  await list.dispose()
  return out
}
async function flight(page: Page, surface: string) {
  const routes: Locator[] = [], details = ['cs','msn','rl','br','to','ld']   // D554's route, the R box before B (D1026)
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
    /* ONE TEST A PAGE ([CI-E2E-FLAKES-1020], 20 Oct 26): the week and the board were one test of some 270 key presses, each
       Tab a real walk of the day's boxes in the app — 29.4 s of the 30 on main's GitHub run of 20 Oct 26 and over it on
       pull request 550's. Nothing waited on a fixed time; it was simply the work of two pages in one test's time. */
    for (const surface of ['#eWeek .day[data-day="0"]', '#sbBoard']) test(`D555 every open text family follows displayed order; closed inputs stay closed — ${surface === '#sbBoard' ? 'the board' : 'the week'}`, async ({ page }) => {
      await login(page); await go(page, 'editsched')
      {
        if (surface === '#sbBoard') await openBoard(page)
        const toggle = page.locator(`${surface} [data-pitog="0"]`)
        await toggle.click()
        const eligible = await typeable(page, surface)
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
    /* D597 (owner, 6 Oct 26 — narrows D553): where the day has NO button below its last open text box, Tab keeps the
       caret in that box — it used to land on nothing (the stack check's W14), and the next Tab went to the next day.
       The week on both sizes, and the phone's board (no button follows its last box); the desktop board still goes on
       to the first control after its boxes, as D553 ruled. */
    test('D597 Tab from the day\'s last box with no button below keeps the caret there, saves, and Shift+Tab still goes back', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      const sig = () => page.evaluate(() => { const a = document.activeElement as HTMLElement | null; return a && a !== document.body ? a.tagName + JSON.stringify({ ...a.dataset }) : null })
      const lastOf = async (surface: string) => {
        return (await typeable(page, surface, true)).at(-1)!
      }
      const day = '#eWeek .day[data-day="0"]'
      const last = await lastOf(day)
      await last.focus(); const at = await sig(); expect(at).not.toBeNull()
      const pan = await page.locator('#eWeek').evaluate(e => e.scrollLeft)
      await page.keyboard.press('End'); await page.keyboard.type(' D597')
      await page.keyboard.press('Tab')
      expect(await sig(), 'the caret is still in the day\'s last box').toBe(at)
      expect(await page.locator('#eWeek').evaluate(e => e.scrollLeft), 'the week did not pan').toBe(pan)
      expect(await page.evaluate(() => { const a = document.activeElement as any; return String(a.value ?? a.textContent) }), 'what was typed is in the box').toContain('D597')
      expect(await page.evaluate(() => JSON.stringify([(window as any).DAYS, (window as any).INPUTS])), 'and was saved by that Tab').toContain('D597')
      await page.keyboard.press('Tab')
      expect(await sig(), 'a second Tab stays too').toBe(at)
      await page.keyboard.press('Shift+Tab')
      const back = await sig()
      expect(back, 'Shift+Tab goes back to another box').not.toBe(at); expect(back).not.toBeNull()
      expect(await page.evaluate(() => !!document.activeElement?.closest('#eWeek .day[data-day="0"]'))).toBe(true)
      await openBoard(page)
      const blast = await lastOf('#sbBoard')
      await blast.focus(); const bat = await sig()
      await page.keyboard.press('Tab')
      if (name === 'phone') expect(await sig(), 'the phone board has no button after its last box: the caret stays').toBe(bat)
      else {
        expect(await sig(), 'the desktop board goes on to its next control (D553)').not.toBe(bat)
        expect(await page.evaluate(() => { const a = document.activeElement; return !!a && a !== document.body && !!a.closest('#schedBoard') && !a.closest('#eWeek') })).toBe(true)
      }
      expect(await page.evaluate(() => (window as any).SBDAY)).toBe(0)
    })
    /* THE DAY STILL CATCHES UP AT THAT TAB — ON THE BOARD TOO (Astra's read of the third round, 6 Oct 26, F1). The board
       holds its whole day panel while the caret is in it, and writes it when the caret leaves text. Until D597 the last
       box's Tab was such a moment; keeping the caret there took the moment away, and a take-off typed earlier left its
       line's worked-out area time showing the old window for as long as he stayed. The week is pinned in
       ui/schedule-tab.test.tsx; this is the phone's board, where no button follows the last box. */
    test('D597 the last box\'s Tab still brings the day up to date: a take-off typed earlier shows its new area time', async ({ page }) => {
      test.skip(name !== 'phone', 'the desktop board\'s last Tab leaves text for its next control, which redraws as it always did')
      await login(page); await go(page, 'editsched'); await openBoard(page)
      const to = field(page, '#sbBoard', 'ff:0.0.0.to')
      await to.fill('1255'); await page.keyboard.press('Tab')
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].to)).toBe('12:55')
      const seq = await page.evaluate(() => (window as any).commandStreamLen())
      const last = (await typeable(page, '#sbBoard')).at(-1)
      await last!.focus()
      const mark = () => page.evaluate(() => { const a = document.activeElement as HTMLElement | null; return a && a !== document.body ? a.tagName + JSON.stringify({ ...a.dataset }) : null })
      const at = await mark(), scroll = await page.evaluate(() => [window.scrollY, document.querySelector('#schedBoard')!.scrollTop, document.querySelector('#sbBoard')!.scrollTop])
      await page.keyboard.press('Tab')
      expect(await mark(), 'the caret is still in the last box').toBe(at)
      const shown = await page.locator('#sbBoard [data-atime="0.0.0"]').first().evaluate(e => String((e as any).value ?? e.textContent))
      expect(shown, 'the area time on screen follows the new take-off').toMatch(/^1255-/)
      expect(await page.evaluate(() => (window as any).commandStreamLen()), 'that Tab wrote nothing').toBe(seq)
      expect(await page.evaluate(() => [window.scrollY, document.querySelector('#schedBoard')!.scrollTop, document.querySelector('#sbBoard')!.scrollTop]), 'and moved nothing').toEqual(scroll)
      await page.keyboard.press('Tab')
      expect(await mark()).toBe(at)
      expect(await page.evaluate(() => (window as any).commandStreamLen()), 'nor did a second one').toBe(seq)
    })
    /* [EDIT-SECOND-CLICK] (the Codex stack check, 5 Oct 26): a CHANGED box left by a click redrew the day while the focus
       was on its way to the box clicked — that box was replaced, and the caret was nowhere until a second click. One
       click takes the caret now, on a day not yet published and on a published one. */
    for (const published of [false, true]) test(`one click after a changed box takes the caret${published ? ' (a published day)' : ''}`, async ({ page }) => {
      await login(page); await go(page, 'editsched')
      if (published) {
        await page.evaluate(() => { const w = window as any, g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; w.setDayApproved(0, true); w.afterSchedMutate() })
        await page.waitForTimeout(300)
      }
      const surface = '#eWeek .day[data-day="0"]'
      const to = field(page, surface, 'ff:0.0.0.to')
      /* the mission beside it (the same wave's block) and one in the next wave (another block) */
      for (const [time, key] of [['1255', 'ff:0.0.0.msn'], ['1256', 'ff:0.1.0.msn']] as const) {
        await to.click(); await to.fill(time)
        await field(page, surface, key).click()
        await page.keyboard.type('Z')
        await focused(field(page, surface, key))
        expect(await field(page, surface, key).textContent(), `${key} took the typing`).toMatch(/Z$/)
        await page.keyboard.press('Escape')
      }
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].to)).toBe('12:56')
    })
    /* …by a finger too, where the phone has one: its lift and the events that move the focus come as separate steps */
    test('one finger tap after a changed box takes the caret on the Scheduler Board', async ({ page }) => {
      test.skip(name !== 'phone', 'a finger on the phone')
      await login(page); await go(page, 'editsched'); await openBoard(page)
      const box = (key: string) => page.locator(`#sbBoard [data-bfld="${key}"]:visible`).first()
      const tap = async (key: string) => { await box(key).evaluate(e => e.scrollIntoView({ block: 'center' })); const b = (await box(key).boundingBox())!; await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
      for (const [time, key] of [['1255', 'ff:0.0.0.msn'], ['1256', 'ff:0.1.0.msn']] as const) {
        await tap('ff:0.0.0.to'); await box('ff:0.0.0.to').fill(time)
        await tap(key)
        await page.keyboard.type('Z')
        await focused(box(key))
        await expect(box(key), `${key} took the typing`).toHaveValue(/Z$/)
        await page.keyboard.press('Escape')
      }
    })
    /* …and the Scheduler Board's own boxes, which save on their change rather than on leaving */
    test('one click after a changed box takes the caret on the Scheduler Board', async ({ page }) => {
      await login(page); await go(page, 'editsched'); await openBoard(page)
      const box = (key: string) => page.locator(`#sbBoard [data-bfld="${key}"]:visible`).first()
      const to = box('ff:0.0.0.to')
      for (const [time, key] of [['1255', 'ff:0.0.0.msn'], ['1256', 'ff:0.1.0.msn']] as const) {
        await to.click(); await to.fill(time)
        await box(key).click()
        await page.keyboard.type('Z')
        await focused(box(key))
        await expect(box(key), `${key} took the typing`).toHaveValue(/Z$/)
        await page.keyboard.press('Escape')
      }
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].to)).toBe('12:56')
    })
    /* [EDIT-BUTTON-AFTER-CHANGE] (found 19 Oct 26, the D994 batch's walk, S4-05): straight after a changed box, the first
       press of a button — the week's "+ In-time", the board's "+ Line" — did nothing: leaving the box saved it and the
       redraw replaced the button under the press, so no click reached it. One press does its job now, by a mouse and
       by a finger. */
    test('one press of a button after a changed box does its job', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      const press = async (loc: Locator) => {
        await loc.evaluate(e => e.scrollIntoView({ block: 'center' }))
        if (name === 'phone') { const b = (await loc.boundingBox())!; await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
        else await loc.click()
      }
      const lines = () => page.evaluate(() => (window as any).DAYS[0].waves[0].intimes.length)
      const week = '#eWeek .day[data-day="0"]'
      const to = field(page, week, 'ff:0.0.0.to')
      const n0 = await lines()
      await press(to); await to.fill('1255')
      await press(page.locator(`${week} [data-itadd="0|0"]`))
      await expect.poll(lines, 'one press of "+ In-time" added its line').toBe(n0 + 1)
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].to)).toBe('12:55')
      await page.keyboard.press('Escape')
      await openBoard(page)
      const forms = () => page.evaluate(() => (window as any).DAYS[0].waves[0].formations.length)
      const box = page.locator('#sbBoard [data-bfld="ff:0.0.0.to"]:visible').first()
      const f0 = await forms()
      await press(box); await box.fill('1257')
      await press(page.locator('#sbBoard [data-gline="0.0"]').first())
      await expect.poll(forms, 'one press of "+ Line" added its line').toBe(f0 + 1)
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].to)).toBe('12:57')
    })
    test('native Board change saves once, refreshes repeated fields and settles after text exit', async ({ page }) => {
      await login(page); await go(page, 'editsched'); await openBoard(page)
      const cs = field(page, '#sbBoard', 'ff:0.0.0.cs'), seq = await page.evaluate(() => (window as any).commandStreamLen())
      await cs.fill('TAB CS'); await page.keyboard.press('Tab')
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].cs)).toBe('TAB CS')
      expect(await page.evaluate(() => (window as any).commandStreamLen())).toBe(seq + 1)
      for (let i = 0; i < 7; i++) await page.keyboard.press('Tab')   // one more box on the line since D1026: the R box
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
  const eligible=await typeable(page,'#eWeek .day[data-day="0"]')
  await eligible[0]!.focus()
  for(let i=1;i<4;i++){
    await page.keyboard.press('Tab')
    expect(await eligible[i]!.evaluate(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return document.activeElement===e&&(hit===e||e.contains(hit))}),`Visible focus at stop ${i}`).toBe(true)
  }
})

test('phone Desktop Board keeps each destination reachable through the visible part of wide boxes', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});await login(page);await go(page,'editsched');await openBoard(page)
  await page.locator('#sbMore').click();await page.locator('#sbMoreWide').click()
  const eligible=await typeable(page,'#sbBoard')
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

/* [TAB-LAST-BOX-TEST-GAPS] (Astra's owed read of D597): the caret SEEN in a real browser after his save at the day's
   last box replaces the whole day on screen (its first warning arrives with that save). Wherever the Tab goes — back
   into the box (D597) or on to the control after it (D553) — the keyboard is on that day, never on the page. */
test('the last box\'s Tab, when the save replaces the whole day: the keyboard is still on that day', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page); await go(page, 'editsched')
  const di = await page.evaluate(() => [0, 1, 2, 3, 4, 5, 6].find(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); return d && !d.querySelector('.dwbox') }))
  expect(di, 'the demo week has a day with no warning').toBeDefined()
  const day = page.locator(`#eWeek .day[data-day="${di}"]`)
  const last = (await typeable(page, `#eWeek .day[data-day="${di}"]`, true)).at(-1)
  expect(last).toBeTruthy()
  const firstDay = await day.elementHandle()
  await last!.evaluate((el, DI) => el.addEventListener('blur', () => {
    const w = window as any, wave = JSON.parse(JSON.stringify(w.DAYS[0].waves[0], (k, v) => k === 'rid' ? undefined : v))
    wave.formations[1].aircraft[0].p = wave.formations[0].aircraft[0].p; w.DAYS[DI].waves = [...w.DAYS[DI].waves, wave]; w.afterSchedMutate()
  }, { once: true }), di)
  await last!.focus(); await page.keyboard.press('Tab'); await page.waitForTimeout(300)
  await expect(day.locator('.dwbox')).toHaveCount(1)
  expect(await firstDay!.evaluate(e => e.isConnected), 'the day on screen really was replaced (or this test proves nothing)').toBe(false)
  expect(await page.evaluate(DI => { const a = document.activeElement; return !!a && a !== document.body && !!a.closest(`#eWeek .day[data-day="${DI}"]`) }, di), 'the keyboard is on that day').toBe(true)
})

/* his find on the walk's pictures (19 Oct 26): the board's In-time / Rally lines stood in the middle of the panel — the
   rows built for the drag (D593) inherited the block's old "centre", each shrinking to its words. Each row runs the
   panel's width and its grip sits at the panel's left, at both sizes. */
for (const size of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) test(`the board's In-time / Rally rows run the panel's width from its left (${size.width})`, async ({ page }) => {
  await page.setViewportSize(size)
  await login(page); await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="0"]').first().click()
  await expect(page.locator('#schedBoard')).toBeVisible()
  const m = await page.evaluate(() => {
    const it = [...document.querySelectorAll<HTMLElement>('#schedBoard .intimes.itdrag')].find(e => e.getClientRects().length)
    if (!it) return null
    const b = it.getBoundingClientRect(), pad = parseFloat(getComputedStyle(it).paddingLeft) + parseFloat(getComputedStyle(it).paddingRight)
    return [...it.querySelectorAll<HTMLElement>('.itrow')].map(r => { const g = r.getBoundingClientRect(); return { left: g.left - b.left, spare: (b.width - pad) - g.width } })
  })
  expect(m && m.length, 'the board draws its In-time rows (or this test proves nothing)').toBeGreaterThan(0)
  for (const r of m!) {
    expect(r.spare, 'each row runs the panel\u2019s width').toBeLessThan(2)
    expect(r.left, 'from the panel\u2019s left edge').toBeLessThan(16)
  }
})
