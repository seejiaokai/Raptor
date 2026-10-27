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

  test('KS3b a window taller than the room (Duty templates with fourteen roles): never held or shrunk (D1412) — raised to the visible top at most, as tall as it was; put back after', async ({ page }) => {
    await login(page); await go(page, 'admin' as any)
    await page.evaluate(() => document.getElementById('admDutyTpl')!.click())
    const add = page.locator('#tplModal button', { hasText: /add role/i })
    for (let n = await page.locator('#tplModal input.tm').count(); n < 28; n += 2) await add.click()
    const box = page.locator('#tplModal input.tm').last()
    await box.evaluate(e => e.scrollIntoView({ block: 'end' }))
    const behind = await page.evaluate(() => document.scrollingElement!.scrollTop)
    const win = page.locator('#tplModal .modal-box')
    const tall = await win.evaluate(e => Math.round(e.getBoundingClientRect().height))
    expect(tall, 'the fixture: the window is taller than the room the keys leave').toBeGreaterThan(H - KB)
    expect(await bottomOf(box), 'the fixture: its last row under where the keys come').toBeGreaterThan(H - KB)
    await page.waitForTimeout(600)
    await tap(page, box)
    await expect(box).toBeFocused()
    await keysUp(page)
    await expect.poll(() => win.evaluate(e => Math.round(e.getBoundingClientRect().top))).toBeLessThanOrEqual(GAP + 1)
    const g = await win.evaluate(e => { const l = e as HTMLElement; const r = l.getBoundingClientRect(); return { cap: l.dataset.kbcap, capv: l.style.getPropertyValue('--kbcap'), maxH: l.style.maxHeight, h: Math.round(r.height), top: Math.round(r.top) } })
    expect([g.cap, g.capv, g.maxH], 'never held, never shrunk').toEqual([undefined, '', ''])
    expect(g.h, 'as tall as it was').toBe(tall)
    expect(g.top, "raised to the visible top, no further — a box the raise cannot reach is the phone's to show").toBeGreaterThanOrEqual(0)
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'the page behind the window').toBe(behind)
    await page.evaluate(() => { const v = (window as any).__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) })
    await expect.poll(() => win.evaluate(e => [(e as HTMLElement).style.maxHeight, (e as HTMLElement).style.translate].join('|'))).toBe('|')
  })

  test('KS3c the input window (a movable window, redrawn on every key): the phone\'s pan shows its lowest box, and a key typed moves nothing — the window stays where the pan carried it (D1412)', async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inListBtn'); await page.click('#inNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    /* the lowest box to type in, at the foot of the window's own scroll */
    const box = win.locator('input[type="text"]:visible, input:not([type]):visible, textarea:visible').last()
    await box.evaluate(e => e.scrollIntoView({ block: 'end' }))
    const was = await bottomOf(box)
    await page.waitForTimeout(600)
    await tap(page, box); await expect(box).toBeFocused()
    /* the keys, and the phone's own pan that shows the box (Safari pans the visible screen to it; here the stand-in says so) */
    const vh = H - KB, pan = Math.max(0, was - vh + 40)
    await page.evaluate(([h, p]) => { const v = (window as any).__vv; v.height = h; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }, [vh, pan])
    await page.waitForTimeout(400)
    const state = () => win.evaluate(e => { const l = e as HTMLElement; return [l.style.translate, l.dataset.kblift, l.dataset.kbcap, Math.round(l.getBoundingClientRect().top), (l.querySelector('.win-body') as HTMLElement).scrollTop] })
    const before = await state()
    expect(before.slice(0, 3), 'the window untouched: the pan showed the box').toEqual(['', undefined, undefined])
    await page.keyboard.type('a')
    await page.waitForTimeout(200)
    expect(await state(), 'after a key: nothing moved').toEqual(before)
    expect(await bottomOf(box) - pan, 'the box above the keys, by the pan').toBeLessThanOrEqual(vh - GAP + 1)
  })

  /* KS3d — his report, 25 Oct 26 07:06: the input window on his iPhone, "Other" picked, Remarks tapped — Document, then
     Cancel / Add, and no Remarks ("The page seems to be too small"). The window's Cancel / Add stand pinned at the foot of
     its scrolling body, and the box was lifted to that foot — behind them. KS3c never saw it: it checked the box against
     the keys, not against the window's own buttons. (The hold to the room this once tested went with D1412.) */
  test('KS3d the input window, "Other", keys tall enough that its body alone cannot bring Remarks up: Remarks comes to rest above Cancel / Add, never behind them; the window never held', async ({ page }) => {
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
    /* the window's own body scrolls Remarks as far as it can; what the body cannot do, the phone's pan does on his iPhone
       (the stand-in here makes none) — never a hold */
    await expect.poll(() => win.locator('.win-body').evaluate(e => e.scrollTop)).toBeGreaterThan(0)
    await page.waitForTimeout(300)
    expect(await win.evaluate(e => [(e as HTMLElement).dataset.kbcap, (e as HTMLElement).style.getPropertyValue('--kbcap'), Math.round(e.getBoundingClientRect().height)]), 'never held or shrunk (D1412)').toEqual([undefined, '', await win.evaluate(e => Math.round(e.getBoundingClientRect().height))])
    const fTop = await foot.evaluate(e => Math.round(e.getBoundingClientRect().top))
    expect(await bottomOf(box), 'Remarks above Cancel / Add, not behind them').toBeLessThanOrEqual(fTop)
    expect(await box.evaluate(e => Math.round(e.getBoundingClientRect().top)), 'Remarks inside the window').toBeGreaterThanOrEqual(await win.evaluate(e => Math.round(e.getBoundingClientRect().top)))
  })

  /* KS3e — his recording, 25 Oct 26 07:40: the iPhone's password bar rose and the phone panned the visible screen down, later
     than the focus window. Since D1412 a window is the phone's to carry: the pan moves it on his screen as it moves the page,
     and the app does nothing to it — no hold, no shift, nothing inside it scrolled. */
  test("KS3e a late pan of the visible screen (the password bar rising): the window is the phone's to carry — the app moves nothing (D1412)", async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inListBtn'); await page.click('#inNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('[data-testid="win-inputedit"] select')].find(s => [...(s as HTMLSelectElement).options].some(o => o.text.trim() === 'Other'))
      s!.setAttribute('data-kind-sel', '')
    })
    await win.locator('select[data-kind-sel]').selectOption({ label: 'Other' })
    const box = page.locator('#inpEditRmk')
    await box.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
    await page.waitForTimeout(600)
    await tap(page, box); await expect(box).toBeFocused()
    /* the keys with the phone's own pan to the box (as his readouts show them), the box shown by that pan */
    const kb = 460, PAN = 186
    await page.evaluate(([k, p]) => { const v = (window as any).__vv; v.height = innerHeight - k; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }, [kb, PAN])
    await page.waitForTimeout(400)
    const state = () => win.evaluate(e => { const l = e as HTMLElement; return [l.style.translate, l.dataset.kblift, l.dataset.kbcap, Math.round(l.getBoundingClientRect().top)] })
    const before = await state()
    expect(before.slice(0, 3), 'the window untouched by the keys: the pan showed the box').toEqual(['', undefined, undefined])
    const scrolled = await win.locator('.win-body').evaluate(e => e.scrollTop)
    await page.waitForTimeout(2000)                            // past the focus window
    /* the password bar rises: the phone pans the visible screen 170 further */
    await page.evaluate(p => { const v = (window as any).__vv; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('scroll')) }, PAN + 170)
    await page.waitForTimeout(400)
    expect(await state(), 'the late pan: the app moves nothing').toEqual(before)
    expect(await win.locator('.win-body').evaluate(e => e.scrollTop), 'nothing inside it scrolled').toBe(scrolled)
  })

  /* KS3f — his recordings of 25 Oct 26 08:05 ("Other", OD, the ˄ ˅ ✓ bar): the phone panned the visible screen down past the
     window's own place as the keys came. Since D1412 the window is left to the phone's pan — never brought down, never
     held: the pan carries it with the page, and the box it panned to show is where the phone put it. */
  test("KS3f the phone pans past the window's place as the keys come: the window is left to the phone, never brought down or held (D1412)", async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inListBtn'); await page.click('#inNew')
    const win = page.locator('[data-testid="win-inputedit"]')
    await expect(win).toBeVisible()
    await page.evaluate(() => {
      const s = [...document.querySelectorAll('[data-testid="win-inputedit"] select')].find(s => [...(s as HTMLSelectElement).options].some(o => o.text.trim() === 'OD'))
      s!.setAttribute('data-kind-sel', '')
    })
    await win.locator('select[data-kind-sel]').selectOption({ label: 'OD' })
    const box = page.locator('#inpEditRmk')
    await box.evaluate(e => e.scrollIntoView({ block: 'nearest' }))
    await page.waitForTimeout(600)
    const rest = await win.evaluate(e => Math.round(e.getBoundingClientRect().top))
    await tap(page, box); await expect(box).toBeFocused()
    const kb = 460, PAN = 186
    /* the keys and the phone's own pan together, as his recording shows them */
    await page.evaluate(([k, p]) => { const v = (window as any).__vv; v.height = innerHeight - k; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }, [kb, PAN])
    await page.waitForTimeout(400)
    expect(await win.evaluate(e => { const l = e as HTMLElement; return [l.style.translate, l.dataset.kblift, l.dataset.kbcap, l.style.getPropertyValue('--kbcap'), Math.round(l.getBoundingClientRect().top)] }), 'left to the phone: not shifted, not held, where its place puts it').toEqual(['', undefined, undefined, '', rest])
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

/* KS3g, KS3h — HIS ?kbdebug RECORDINGS, 25 Oct 26 10:10 and 10:18 (the input window opened from an Inputs calendar day,
   OL; from a SANS calendar day, SANS Availability; Remarks tapped). Once the keys were up and the phone had panned the
   visible screen 184, his iPhone measured everything from the top of the VISIBLE screen and gave the layout's height as
   what was left below it (684 − 184 = 500) — a desktop browser and Chromium measure from the layout's top. The lift read
   his numbers the other way, took the window for a full-screen backdrop and brought the form down 280 inside it: an
   empty band under its title, Remarks under the keys. Chromium is made to measure as his phone did: every box less the
   pan, the layout's height less the pan — and what his screen shows is that, so the checks read the boxes as given. */
test.describe('the input window on a phone that measures from the visible screen (his iPhone, 25 Oct 26)', () => {
  const LAY = 684, VH = 393, PAN = 184
  test.use({ viewport: { width: 402, height: LAY }, isMobile: true, hasTouch: true })
  test.beforeEach(async ({ page }) => { await stubVV(page) })
  /* from now on, measure as his phone does once the screen has panned `p` */
  const hisMeasure = (page: Page, p: number) => page.evaluate(p => {
    const w = window as any
    if (!w.__his) {
      w.__his = { pan: 0 }
      const real = Element.prototype.getBoundingClientRect
      w.__realRect = real
      Element.prototype.getBoundingClientRect = function (this: Element) { const r = real.call(this); return new DOMRect(r.x, r.y - w.__his.pan, r.width, r.height) }
      const d = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight')
      Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => d!.get!.call(window) - w.__his.pan })
    }
    w.__his.pan = p
  }, p)
  const check = async (page: Page) => {
    const win = page.locator('[data-testid="win-inputedit"]'), box = page.locator('#inpEditRmk'), foot = win.locator('.airpop-foot')
    await page.waitForTimeout(600)
    const rest = await win.evaluate(e => Math.round(e.getBoundingClientRect().top))
    await tap(page, box); await expect(box).toBeFocused()
    /* the keys, then his phone's own pan a frame or two later, as his readout shows them */
    await page.evaluate(h => { const v = (window as any).__vv; v.height = h; v.dispatchEvent(new Event('resize')) }, VH)
    await page.waitForTimeout(60)
    await hisMeasure(page, PAN)
    await page.evaluate(p => { const v = (window as any).__vv; v.offsetTop = p; v.pageTop = p; v.dispatchEvent(new Event('scroll')) }, PAN)
    await page.waitForTimeout(400)
    const g = await page.evaluate(() => {
      const w = document.querySelector('[data-testid="win-inputedit"]') as HTMLElement
      const R = (e: Element) => { const q = e.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)] }
      /* anything inside the window, or the window itself, the lift moved or held */
      const inner = [w, ...w.querySelectorAll<HTMLElement>('*')].filter(e => e.style.translate || e.dataset.kblift || e.dataset.kbcap != null || e.style.getPropertyValue('--kbcap')).map(e => e.className.toString().slice(0, 30))
      return { win: R(w), rmk: R(document.getElementById('inpEditRmk')!), foot: R(w.querySelector('.airpop-foot')!), inner, scrolled: (w.querySelector('.win-body') as HTMLElement).scrollTop }
    })
    expect(g.inner, 'the window and the form inside it: never moved, shifted or held (D1412)').toEqual([])
    expect(g.win[0], "the window where the phone's pan carried it (in his measure: its place less the pan)").toBe(rest - PAN)
    expect(g.rmk[1], "Remarks above the keys — by the phone's own pan").toBeLessThanOrEqual(VH - GAP)
    expect(g.rmk[1], 'Remarks above Cancel / Add').toBeLessThanOrEqual(g.foot[0])
    /* the window's body may scroll the few points the stand-in's pan left Remarks under the clear strip (Chromium lays the form
       out longer than his phone does); the window itself never moves */
    expect(g.scrolled, 'the body scrolled at most a little').toBeLessThanOrEqual(80)
  }
  test("KS3g from an Inputs calendar day (OL): the window left where the phone's pan carried it, Remarks shown by that pan, nothing in or of the window moved (D1412)", async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inCalBtn'); await page.waitForTimeout(300)
    const cell = page.locator('[data-icday]').nth(10)
    await tap(page, cell)
    await page.locator('[data-testid="win-inputsday"]').waitFor()
    await page.locator('#icPopAdd').click()
    await expect(page.locator('[data-testid="win-inputedit"]')).toBeVisible()
    await check(page)
  })
  test('KS3h from a SANS calendar day (SANS Availability): the same', async ({ page }) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inSansMode'); await expect(page.locator('[data-testid="sanscal"]')).toBeVisible()
    await tap(page, page.locator('[data-icday]').nth(10))
    await page.locator('[data-testid="sd-add"]').click()
    await expect(page.locator('[data-testid="win-inputedit"]')).toBeVisible()
    await check(page)
  })

  /* HIS iPHONE'S SLIDES, PLAYED FRAME BY FRAME (his recordings of 25 Oct 26 11:49 and 11:54, read at sixty frames a
     second): the keys coming up, the page slides on cubic-bezier(.42,0,.58,1) over 250ms, the pan told of about 30ms after
     the slide began — in one `resize` with the keys (OL), or the keys' `resize` first and the pan's `scroll` 15ms later
     ("Other"); the keys going down, cubic-bezier(.3,.58,.2,1) over 330ms, the focus leaving the box about 30ms in and the
     keys' `resize` some 40ms after that. Since D1412 (his recordings of 25 Oct 26 20:43–20:45 and 27 Oct 26 08:20) the app
     never moves a window against that slide: the phone's pan carries it, and what is recorded here, frame by frame, is
     the window's own place in the layout — which must not change by a point while the phone slides, up or down. */
  const UP = { c: [0.42, 0, 0.58, 1], ms: 250 }, DOWN = { c: [0.3, 0.58, 0.2, 1], ms: 330 }
  const play = (page: Page, sel: string, dir: 1 | -1, P: number, VH: number, splitPan = false) => page.evaluate(([sel, dir, P, VH, splitPan, UP, DOWN]) => new Promise<number[]>(ok => {
    const w = window as any, el = document.querySelector(sel) as HTMLElement
    const bez = (p: number, [x1, y1, x2, y2]: number[]) => {
      if (p <= 0) return 0
      if (p >= 1) return 1
      let lo = 0, hi = 1, u = p
      for (let i = 0; i < 30; i++) { u = (lo + hi) / 2; const x = 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u; if (x < p) lo = u; else hi = u }
      return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u
    }
    const real = w.__realRect || Element.prototype.getBoundingClientRect
    if (!w.__his) {
      w.__his = { pan: 0 }; w.__realRect = real
      Element.prototype.getBoundingClientRect = function (this: Element) { const r = real.call(this); return new DOMRect(r.x, r.y - w.__his.pan, r.width, r.height) }
      const d = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight')
      Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => d!.get!.call(window) - w.__his.pan })
    }
    const v = w.__vv, out: number[] = [], full = innerHeight + w.__his.pan
    let s0 = Infinity
    const pan = (p: number) => { w.__his.pan = p; v.offsetTop = p; v.pageTop = p }
    if (dir > 0) {
      if (splitPan) {
        v.height = VH; v.dispatchEvent(new Event('resize'))
        setTimeout(() => { pan(P); s0 = performance.now() - 30; v.dispatchEvent(new Event('scroll')) }, 15)
      } else { v.height = VH; pan(P); s0 = performance.now() - 30; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }
    } else {
      s0 = performance.now() - 30; (document.activeElement as HTMLElement).blur()
      setTimeout(() => { pan(0); v.height = full; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }, 40)
    }
    const end = performance.now() + 600
    /* read once every frame's own work is done (the app's frame callbacks run before the paint, in the order they were
       asked for), at the time that frame's animations are drawn at */
    const tick = () => setTimeout(() => {
      const ts = Number(document.timeline.currentTime)
      const slid = dir > 0 ? P * bez((ts - s0) / UP.ms, UP.c) : P * (1 - bez((ts - s0) / DOWN.ms, DOWN.c))
      void slid
      out.push(Math.round(real.call(el).top))
      if (ts < end) requestAnimationFrame(tick); else ok(out)
    }, 0)
    requestAnimationFrame(tick)
  }), [sel, dir, P, VH, splitPan, UP, DOWN] as const)
  /* the app never moves the window while the phone slides: its place in the layout is the same at every frame */
  const still = (tops: number[], rest: number, what: string) => {
    expect(tops.filter(y => Math.abs(y - rest) > 1), `${what}: the app never moves the window — its own top each frame: ${tops.join(' ')}`).toEqual([])
  }
  const untouched = (page: Page, sel: string) => page.evaluate(sel => { const e = document.querySelector(sel) as HTMLElement; return [e.style.translate, e.dataset.kblift, e.dataset.kbcap, e.style.getPropertyValue('--kbcap')] }, sel)
  const openInputWin = async (page: Page, other: boolean) => {
    await login(page); await go(page, 'inputs')
    await page.click('#inCalBtn'); await page.waitForTimeout(300)
    await tap(page, page.locator('[data-icday]').nth(10))
    await page.locator('[data-testid="win-inputsday"]').waitFor()
    await page.locator('#icPopAdd').click()
    await expect(page.locator('[data-testid="win-inputedit"]')).toBeVisible()
    if (other) await page.selectOption('#inpEditType', 'Other')
    await page.waitForTimeout(600)
    const box = page.locator('#inpEditRmk')
    await tap(page, box); await expect(box).toBeFocused()
  }
  const topOf = (page: Page, sel: string) => page.evaluate(sel => Math.round(((window as any).__realRect || Element.prototype.getBoundingClientRect).call(document.querySelector(sel)).top), sel)

  test("KS3j the input window from an Inputs calendar day (OL), Remarks tapped: the app never moves it as his phone slides, up or down — the phone carries it (D1412)", async ({ page }) => {
    const W = '[data-testid="win-inputedit"]'
    await openInputWin(page, false)
    const rest = await topOf(page, W)
    still(await play(page, W, 1, PAN, VH), rest, 'the keys up')
    expect(await untouched(page, W), 'never shifted or held').toEqual(['', undefined, undefined, ''])
    still(await play(page, W, -1, PAN, VH), rest, 'the keys down')
    expect(await untouched(page, W)).toEqual(['', undefined, undefined, ''])
  })
  test('KS3k the input window, "Other": the keys first, the pan 15ms later — never moved by the app, up or down (D1412)', async ({ page }) => {
    const W = '[data-testid="win-inputedit"]'
    await openInputWin(page, true)
    const rest = await topOf(page, W)
    still(await play(page, W, 1, 272, 390, true), rest, 'the keys up')
    expect(await untouched(page, W), 'never shifted or held').toEqual(['', undefined, undefined, ''])
    still(await play(page, W, -1, 272, 390), rest, 'the keys down')
    expect(await untouched(page, W)).toEqual(['', undefined, undefined, ''])
  })

  /* KS3i — HIS RECORDING OF 11:09 (the Tracker's All events, a box tapped, the keys put away, the next box tapped, again and
     again: "a bit twitchy like the page jumps weirdly"). A window placed at once for where the slide ENDS stood a whole slide
     away from it for those frames. Since D1412 the app never places it: the phone carries it, and the Name box the pan does
     not reach is scrolled into sight by the window's own list. */
  test("KS3i the Tracker's All events, the keys up then down: the app never moves the window while the phone slides (D1412)", async ({ page }) => {
    await login(page); await go(page, 'tracker'); await page.waitForTimeout(800)
    await page.locator('#showAllTab:visible, #showAllBtn:visible').first().click()
    await page.locator('#showAllPanel.on').waitFor()
    const row = page.locator('#showAllPanel .sarow', { hasText: 'ST-05' }).first()
    await row.scrollIntoViewIfNeeded(); await row.locator('.sedit').click()
    const name = page.locator('#showAllPanel .saedit input').first()
    await page.evaluate(() => { const v = (window as any).__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) })
    await page.waitForTimeout(500)
    await tap(page, name); await expect(name).toBeFocused()
    const rest = await topOf(page, '#showAllPanel')
    still(await play(page, '#showAllPanel', 1, 294, 390, true), rest, 'the keys up')
    expect(await untouched(page, '#showAllPanel'), 'never shifted or held').toEqual(['', undefined, undefined, ''])
    still(await play(page, '#showAllPanel', -1, 294, 390), rest, 'the keys down')
  })
})
