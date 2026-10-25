import { test, expect, type Page, type Locator } from '@playwright/test'
import { login, go } from './app'

/* KS1–KS4 — [KEYBOARD-SCROLL] (owner D1048, 19 Oct 26): on a phone, a box tapped to type in that the keyboard would
   cover is scrolled to sit just above it. Chromium cannot raise an iPhone's keyboard, so — as the board's own keyboard
   walk did (scripts/handpass/am/b3-03-keyboard.mjs) — window.visualViewport is replaced before the app loads by a
   stand-in with the same fields and events, and "the keys come up" is that stand-in shrinking and saying so. What only
   a real browser can show: the real panels' scrolling, the board following the visible screen, the page behind a
   window left still. The arithmetic is pinned in src/ui/kbscroll.test.ts; his iPhone is the real test. */
const H = 874, KB = 336, GAP = 8
const stubVV = (page: Page) => page.addInitScript(() => {
  class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
  const f = new FakeVV()
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
  ;(window as any).__vv = f
})
const keysUp = (page: Page, kb = KB) => page.evaluate(kb => {
  const v = (window as any).__vv; v.height = innerHeight - kb; v.dispatchEvent(new Event('resize'))
}, kb)
const tap = async (page: Page, loc: Locator) => {
  const b = (await loc.boundingBox())!
  await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(b.height / 2, 8))
}
const bottomOf = (loc: Locator) => loc.evaluate(e => Math.round(e.getBoundingClientRect().bottom))
/* bring `loc` low on the screen inside its own scrolling panel (or the page), as a box he would reach for */
const lowOnScreen = (loc: Locator) => loc.evaluate((e, h) => {
  let sc: Element | null = e.parentElement
  while (sc && !(/(auto|scroll)/.test(getComputedStyle(sc).overflowY) && sc.scrollHeight > sc.clientHeight + 1)) sc = sc.parentElement
  const s = sc || document.scrollingElement!
  s.scrollTop += e.getBoundingClientRect().bottom - (h - 40)
  return Math.round(e.getBoundingClientRect().bottom)
}, H)

test.describe('the box being typed in shows above the keyboard — phone', () => {
  test.use({ viewport: { width: 402, height: H }, isMobile: true, hasTouch: true })
  test.beforeEach(async ({ page }) => { await stubVV(page) })

  test('KS1 the Scheduler Board: a box low in its scrolling panel is lifted just above the keys; the week behind never moves', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
    const box = page.locator('#schedBoard input.tm:visible').nth(6)
    const was = await lowOnScreen(box)
    expect(was, 'the fixture: the box sits where the keys will come').toBeGreaterThan(H - KB + 20)
    const behind = await page.evaluate(() => document.scrollingElement!.scrollTop)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
    expect(await bottomOf(box), 'just above, not flung to the top').toBeGreaterThan(H - KB - 80)
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'the page behind the board').toBe(behind)
    await expect(box).toBeFocused()
  })

  test('KS2 a page that scrolls itself (Logic): its last setting box is brought above the keys', async ({ page }) => {
    await login(page); await go(page, 'logic'); await page.click('#lgEdit')
    const box = page.locator('input.lgin:visible').last()
    const was = await lowOnScreen(box)
    expect(was).toBeGreaterThan(H - KB + 20)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
  })

  test('KS3 a window (Admin → Duty templates): a time box low in it is brought above the keys, the page behind it left still', async ({ page }) => {
    await login(page); await go(page, 'admin' as any)
    await page.evaluate(() => document.getElementById('admDutyTpl')!.click())
    const box = page.locator('#tplModal input.tm:visible').last()
    await expect(box).toBeVisible()
    /* the window as he meets it: the keys come up over its lower half */
    const was = await bottomOf(box)
    const behind = await page.evaluate(() => document.scrollingElement!.scrollTop)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    expect(was, 'the fixture: the last row of the window is where the keys come (its rows all fit: nothing in it scrolls)').toBeGreaterThan(H - KB - GAP)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
    /* the window was raised, not the backdrop; it goes back down when the typing ends */
    expect(await page.locator('#tplModal .modal-box').evaluate(e => (e as HTMLElement).style.translate)).toMatch(/^0(px)? -\d+px$/)
    await page.evaluate(() => (document.activeElement as HTMLElement).blur())
    await expect.poll(() => page.locator('#tplModal .modal-box').evaluate(e => (e as HTMLElement).style.translate)).toBe('')
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'the page behind the window').toBe(behind)
  })

  test('KS3b a window taller than the room (Duty templates with fourteen roles): held to the visible screen, its own body scrolls the last row above the keys; all put back after', async ({ page }) => {
    await login(page); await go(page, 'admin' as any)
    await page.evaluate(() => document.getElementById('admDutyTpl')!.click())
    const add = page.locator('#tplModal button', { hasText: /add role/i })
    for (let n = await page.locator('#tplModal input.tm').count(); n < 28; n += 2) await add.click()
    const box = page.locator('#tplModal input.tm').last()
    await box.evaluate(e => e.scrollIntoView({ block: 'end' }))
    const behind = await page.evaluate(() => document.scrollingElement!.scrollTop)
    const tall = await page.locator('#tplModal .modal-box').evaluate(e => Math.round(e.getBoundingClientRect().height))
    expect(tall, 'the fixture: the window is taller than the room the keys leave').toBeGreaterThan(H - KB)
    expect(await bottomOf(box), 'the fixture: its last row under where the keys come').toBeGreaterThan(H - KB)
    await page.waitForTimeout(600)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
    expect(await box.evaluate(e => Math.round(e.getBoundingClientRect().top)), 'its top in sight').toBeGreaterThanOrEqual(0)
    const win = page.locator('#tplModal .modal-box')
    expect(await win.evaluate(e => Math.round(e.getBoundingClientRect().top)), 'the title of the window stays on the screen').toBeGreaterThanOrEqual(0)
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'the page behind the window').toBe(behind)
    await page.evaluate(() => { const v = (window as any).__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) })
    await expect.poll(() => win.evaluate(e => [(e as HTMLElement).style.maxHeight, (e as HTMLElement).style.translate].join('|'))).toBe('|')
  })

  test('KS3c the input window (a movable window, redrawn on every key): its box stays above the keys after a key is typed', async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inListBtn'); await page.click('#inNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    /* the lowest box to type in, at the foot of the window's own scroll */
    const box = win.locator('input[type="text"]:visible, input:not([type]):visible, textarea:visible').last()
    await box.evaluate(e => e.scrollIntoView({ block: 'end' }))
    /* the window stands in the middle of a phone's screen (D996): a keyboard tall enough to cover its lowest box */
    const was = await bottomOf(box), kb = H - was + 60
    await page.waitForTimeout(600)
    await tap(page, box); await expect(box).toBeFocused()
    await keysUp(page, kb)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - kb - GAP + 1)
    await page.keyboard.type('a')
    await page.waitForTimeout(200)
    expect(await bottomOf(box), 'after a key: still above the keys').toBeLessThanOrEqual(H - kb - GAP + 1)
    expect(await win.evaluate(e => Math.round(e.getBoundingClientRect().top)), 'its title on the screen').toBeGreaterThanOrEqual(0)
  })

  /* KS3d — his report, 25 Oct 26 07:06: the input window on his iPhone, "Other" picked, Remarks tapped — Document, then
     Cancel / Add, and no Remarks ("The page seems to be too small"). Held to the room the keys leave, the window's Cancel /
     Add stand pinned at the foot of its scrolling body, and the box was lifted to that foot — behind them. KS3c never saw
     it: it checked the box against the keys, not against the window's own buttons. */
  test('KS3d the input window held to the room: Remarks of an "Other" comes to rest above Cancel / Add, never behind them', async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inListBtn'); await page.click('#inNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('[data-testid="win-inputedit"] select')].find(s => [...(s as HTMLSelectElement).options].some(o => o.text.trim() === 'Other'))
      s!.setAttribute('data-kind-sel', '')
    })
    await win.locator('select[data-kind-sel]').selectOption({ label: 'Other' })
    const box = page.locator('#inpEditRmk'), foot = win.locator('.airpop-foot')
    await box.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
    /* keys tall enough that the window's own scroll cannot bring Remarks up: the window is held to the room (raise) */
    const kb = 540
    await page.waitForTimeout(600)
    await tap(page, box); await expect(box).toBeFocused()
    await keysUp(page, kb)
    await expect.poll(() => win.evaluate(e => (e as HTMLElement).dataset.kbcap != null), { message: 'the fixture: the window is held to the room' }).toBe(true)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - kb - GAP + 1)
    const fTop = await foot.evaluate(e => Math.round(e.getBoundingClientRect().top))
    expect(await bottomOf(box), 'Remarks above Cancel / Add, not behind them').toBeLessThanOrEqual(fTop)
    expect(await box.evaluate(e => Math.round(e.getBoundingClientRect().top)), 'Remarks inside the window').toBeGreaterThanOrEqual(await win.evaluate(e => Math.round(e.getBoundingClientRect().top)))
  })

  /* KS3e — his recording, 25 Oct 26 07:40: held to the room, the window was then left behind when the iPhone's password bar
     rose and the phone panned the visible screen down, later than the focus window: its top off the screen, a band under it. */
  test('KS3e the held input window follows a late pan of the visible screen: its title in sight, Remarks above Cancel / Add and the keys', async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inListBtn'); await page.click('#inNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('[data-testid="win-inputedit"] select')].find(s => [...(s as HTMLSelectElement).options].some(o => o.text.trim() === 'Other'))
      s!.setAttribute('data-kind-sel', '')
    })
    await win.locator('select[data-kind-sel]').selectOption({ label: 'Other' })
    const box = page.locator('#inpEditRmk'), foot = win.locator('.airpop-foot')
    await box.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
    const kb = 540
    await page.waitForTimeout(600)
    await tap(page, box); await expect(box).toBeFocused()
    await keysUp(page, kb)
    await expect.poll(() => win.evaluate(e => (e as HTMLElement).dataset.kbcap != null), { message: 'the fixture: held' }).toBe(true)
    await page.waitForTimeout(2000)                            // past the focus window
    const PAN = 170
    await page.evaluate(p => { const v = (window as any).__vv; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('scroll')) }, PAN)
    /* in the visible screen's own terms: what the layout says, less the pan */
    await expect.poll(() => win.evaluate((e, p) => Math.round(e.getBoundingClientRect().top - p), PAN), { message: 'the title on the screen' }).toBeGreaterThanOrEqual(0)
    const winBot = await win.evaluate((e, p) => Math.round(e.getBoundingClientRect().bottom - p), PAN)
    expect(winBot, 'no band left between the window and the keys').toBeGreaterThanOrEqual(H - kb - 3 * GAP)
    const bBot = await box.evaluate((e, p) => Math.round(e.getBoundingClientRect().bottom - p), PAN)
    const fTop = await foot.evaluate((e, p) => Math.round(e.getBoundingClientRect().top - p), PAN)
    expect(bBot, 'Remarks above Cancel / Add').toBeLessThanOrEqual(fTop)
    expect(bBot, 'and above the keys').toBeLessThanOrEqual(H - kb - GAP + 1)
  })

  /* KS3f — his recordings of 25 Oct 26 08:05 ("Other", OD, the ˄ ˅ ✓ bar): the phone panned the visible screen down past the
     window's own place as the keys came, and the hold — which only ever raised a window — left its title off the screen and
     a band between its foot and the keys. */
  test('KS3f the phone pans past the window as the keys come: the held window comes down to the visible top, no band, Remarks shown', async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inListBtn'); await page.click('#inNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('[data-testid="win-inputedit"] select')].find(s => [...(s as HTMLSelectElement).options].some(o => o.text.trim() === 'OD'))
      s!.setAttribute('data-kind-sel', '')
    })
    await win.locator('select[data-kind-sel]').selectOption({ label: 'OD' })
    const box = page.locator('#inpEditRmk'), foot = win.locator('.airpop-foot')
    await box.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
    await page.waitForTimeout(600)
    await tap(page, box); await expect(box).toBeFocused()
    const kb = 460, PAN = 186
    /* the keys and the phone's own pan together, as his recording shows them */
    await page.evaluate(([k, p]) => { const v = (window as any).__vv; v.height = innerHeight - k; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }, [kb, PAN])
    await expect.poll(() => win.evaluate((e, p) => Math.round(e.getBoundingClientRect().top - p), PAN), { message: 'its title at the visible top' }).toBeGreaterThanOrEqual(0)
    const winBot = await win.evaluate((e, p) => Math.round(e.getBoundingClientRect().bottom - p), PAN)
    expect(winBot, 'no band left between the window and the keys').toBeGreaterThanOrEqual(H - kb - 3 * GAP)
    const bBot = await box.evaluate((e, p) => Math.round(e.getBoundingClientRect().bottom - p), PAN)
    const fTop = await foot.evaluate((e, p) => Math.round(e.getBoundingClientRect().top - p), PAN)
    expect(bBot, 'Remarks above Cancel / Add').toBeLessThanOrEqual(fTop)
    expect(bBot, 'and above the keys').toBeLessThanOrEqual(H - kb - GAP + 1)
  })

  /* KS6 — D1081 (his recordings: the board a frame or three out of place as the keys closed, first when it followed the
     visible screen on its events, still when it followed frame by frame). The board is no longer placed by script at all:
     it keeps the layout's full size whatever the visible screen does, so it moves with the iPhone's own scroll. And a
     finger's tap on a box low in it scrolls the box up on the press, before any keyboard, so the iPhone has nothing to
     pan. */
  /* D1081 and his recording of 19 Oct 26 16:59 ("everytime I click on SC it doesn't select the CS text box but the screen
     snaps down"): a tap on a low box used to lift its list at the end of the touch and cancel the touch's own click — on
     his iPhone the box then never took the caret. The tap is the browser's: its own click reaches the box, nothing moves
     under the finger before the keys come, and the board itself is never moved by script. */
  test("KS6 a tap on a low box is the browser's own: its click reaches the box, nothing moves before the keys; the board is never moved by script", async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
    const rect = () => page.evaluate(() => { const r = document.getElementById('schedBoard')!.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height)] })
    await page.waitForTimeout(400)   // the board's opening slide done
    const box = page.locator('#schedBoard input.tm:visible').nth(6)
    const was = await lowOnScreen(box)
    expect(was).toBeGreaterThan(H * 0.58)
    await box.evaluate(e => { (window as any).__clicked = false; e.addEventListener('click', () => { (window as any).__clicked = true }, { once: true }) })
    await tap(page, box); await expect(box).toBeFocused()
    expect(await page.evaluate(() => (window as any).__clicked), "the tap's own click reached the box").toBe(true)
    expect(await bottomOf(box), 'nothing moved under the finger before the keys').toBe(was)
    const before = await rect()
    expect(before[1], 'the board at the full height of the layout').toBeGreaterThan(H - 8)
    await page.evaluate(() => { const v = (window as any).__vv; v.height = innerHeight - 336; v.offsetTop = 120; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) })
    await page.waitForTimeout(200)
    /* the board's own opening settles a couple of pixels; what matters is that it did not follow the 120px pan */
    const after = await rect()
    expect(Math.abs(after[0] - before[0]), 'the visible screen moved 120px: the board did not').toBeLessThanOrEqual(3)
    expect(after[1]).toBe(before[1])
    /* his picture, 19 Oct 26, 16:13: an iPhone scrolls the document to show the box being typed in and leaves it there; with
       the board over a document that could scroll it rose at every tap, the page's empty foot below. The document is held
       to one screen: there is nothing to scroll */
    await page.evaluate(() => { document.scrollingElement!.scrollTop = 400 })
    await page.waitForTimeout(100)
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'the document cannot be scrolled under the board').toBe(0)
    expect(Math.abs((await rect())[0]), 'the board still fills the screen from its top').toBeLessThanOrEqual(3)
  })

  /* his seventh report (19 Oct 26 16:49, three pictures — "the screen jumps abit for every tap", "sometimes bottom black
     screen"): a box at the very end of the board's list had nothing left to scroll it by, so the board's body was raised
     and held like a window — over the board's own bar, and ending above the keys once the iPhone panned as well. The board
     is never raised: its list gets room at its foot while the keys are up. */
  test("KS7 the board's last box: its list gets room below and scrolls it above the keys; the bar stays, nothing is raised; the room goes with the keys", async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
    const box = page.locator('#schedBoard textarea:visible, #schedBoard input:visible').last()
    await box.evaluate(e => { let s = e.parentElement; while (s && !(/(auto|scroll)/.test(getComputedStyle(s).overflowY) && s.scrollHeight > s.clientHeight + 1)) s = s.parentElement; if (s) s.scrollTop = s.scrollHeight })
    await page.waitForTimeout(400)   // the board's opening slide done
    /* the bar is seen, not covered: what stands at its middle is the bar itself */
    const bar = () => page.evaluate(() => { const r = document.querySelector('#schedBoard .sb-top')!.getBoundingClientRect(); return !!document.elementFromPoint(r.left + 40, (r.top + r.bottom) / 2)?.closest('.sb-top') })
    expect(await bar(), 'the fixture: the bar in sight').toBe(true)
    expect(await bottomOf(box), 'the fixture: the last box under where the keys come').toBeGreaterThan(H - KB)
    await tap(page, box); await expect(box).toBeFocused()
    await keysUp(page)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
    expect(await bar(), "the board's bar is not covered").toBe(true)
    expect(await page.locator('#schedBoard [data-kblift], #schedBoard [data-kbcap]').count(), 'nothing of the board raised or held').toBe(0)
    expect(await page.locator('#schedBoard [data-kbroom]').count(), 'its list has room below').toBe(1)
    await page.evaluate(() => { const v = (window as any).__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) })
    await expect.poll(() => page.locator('[data-kbroom]').count(), 'the room goes with the keys').toBe(0)
  })

  /* KS8 — Fable's read of his pictures of 19 Oct 26 17:10 (the board ending a third of the way down the screen, the page's
     dark foot below it to the keys). The board is as tall as its layout; anything that cuts it short while the phone has
     already scrolled the page on for the keys leaves that band. From the tap until the typing ends the board holds the
     height its layout had (--kbfull): here the layout itself is cut to the visible screen with the keys up, as a browser
     that shortens its layout for the keys would. Chromium cannot pan the held document as an iPhone does: the page lift that
     comes first in the board is pinned in src/ui/kbscroll.test.ts. */
  test('KS8 the board keeps its height while a box in it is typed in: a layout cut to the visible screen leaves no band under it; let go when the typing ends', async ({ page }) => {
    await login(page); await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
    await page.waitForTimeout(400)   // the board's opening slide done
    const box = page.locator('#schedBoard input.tm:visible').nth(6)
    await lowOnScreen(box)
    const h = () => page.evaluate(() => Math.round(document.getElementById('schedBoard')!.getBoundingClientRect().height))
    expect(await h()).toBe(H)
    await tap(page, box); await expect(box).toBeFocused()
    await expect.poll(() => page.locator('#schedBoard[data-kbfull]').count(), 'held from the tap').toBe(1)
    await keysUp(page)
    await expect.poll(() => bottomOf(box)).toBeLessThanOrEqual(H - KB - GAP + 1)
    /* the layout shortened to the visible screen, the keys still up and the box still being typed in */
    await page.setViewportSize({ width: 402, height: H - KB })
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => innerHeight), 'the fixture: the layout is the visible screen now').toBe(H - KB)
    await expect(box).toBeFocused()
    expect(await h(), 'the board still a full screen tall').toBe(H)
    expect(await page.evaluate(() => document.scrollingElement!.scrollHeight), 'the page as tall as the board: nothing the phone scrolled on shows dark').toBeGreaterThanOrEqual(H)
    expect(await bottomOf(box), 'the box still above the keys').toBeLessThanOrEqual(H - KB - GAP + 1)
    /* the typing ends: the board follows its layout again */
    await page.evaluate(() => (document.activeElement as HTMLElement).blur())
    await expect.poll(() => page.locator('#schedBoard[data-kbfull]').count(), 'let go').toBe(0)
    expect(await h()).toBe(H - KB)
  })

  test('KS4 a box already above the keys is left where it is', async ({ page }) => {
    await login(page); await go(page, 'logic'); await page.click('#lgEdit')
    const box = page.locator('input.lgin:visible').first()
    await box.evaluate(e => e.scrollIntoView({ block: 'start' }))
    const was = await bottomOf(box)
    expect(was).toBeLessThan(H - KB - GAP)
    await tap(page, box); await keysUp(page)
    await page.waitForTimeout(150)
    expect(await bottomOf(box)).toBe(was)
  })

  /* KS5 — D1080: one tap then typing replaces, in four more places; a second tap still edits a digit (the arithmetic and the
     markup: src/ui/freshbox.test.tsx) */
  test('KS5 one tap then typing replaces: a Logic setting, a SANS colour number, a duty template time', async ({ page }) => {
    await login(page); await go(page, 'logic'); await page.click('#lgEdit')
    const rest = page.locator('input.lgin[data-lgset="crewRest"]')
    await expect(rest).toHaveValue(/h$/)
    /* in the middle of the screen, clear of the page's pinned search bar (on GitHub's machines the box sat under it, the
       tap went to the search box and "11h" filtered the page) */
    await rest.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await tap(page, rest); await expect(rest).toBeFocused()
    await page.keyboard.type('11h'); await expect(rest).toHaveValue('11h')
    await page.keyboard.press('Enter'); await rest.blur()
    await expect(rest, 'saved and shown as the page shows it').toHaveValue('11h')
    /* a second tap: ordinary editing — the digit is added where the caret is, not replacing */
    await page.waitForTimeout(600)
    await tap(page, rest); await page.waitForTimeout(600); await tap(page, rest); await expect(rest).toBeFocused()
    await page.keyboard.press('End'); await page.keyboard.type('5')
    await expect(rest).toHaveValue('11h5')
    await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.type('11h'); await page.keyboard.press('Enter'); await rest.blur()
    await page.evaluate(() => (document.querySelector('[data-lgopen="sans"]') as HTMLElement).click())
    const yellow = page.locator('input.sset-num').first()
    await expect(yellow).toBeVisible()
    const y0 = await yellow.inputValue()
    await tap(page, yellow); await page.keyboard.type('2')
    await expect(yellow, `${y0} replaced`).toHaveValue('2')
    await page.keyboard.press('Escape')
    await go(page, 'admin' as any)
    await page.evaluate(() => document.getElementById('admDutyTpl')!.click())
    const start = page.locator('#tplModal input.tm').first()
    /* the standard template's times are only shown faint (its placeholder): one typed first, as a scheduler would */
    await tap(page, start); await page.keyboard.type('0700'); await start.blur()
    await expect(start).toHaveValue('07:00')
    /* not at once: two taps at one spot that close together are the browser's double tap, which selects a word */
    await page.waitForTimeout(600)
    await tap(page, start); await page.keyboard.type('0800'); await start.blur()
    await expect(start, '07:00 replaced, not 07:000800').toHaveValue('08:00')
  })

})
