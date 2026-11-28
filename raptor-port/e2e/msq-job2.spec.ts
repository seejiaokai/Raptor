/* Batch 1's second half — night job 2 (23 Nov 26), in a real browser (jsdom has no layout, no `inert`, no stacking):
   - the board's number (§3 item 8, the drawing b1-2): beside the day title, nothing in the bar moving, never over the
     next part of the bar on any day of the week; with 149 picked it reads 149;
   - the Tracker after a pick (his D2395): it follows the squadron picked, no band and every control live; the member view
     with 149 picked lands on its View-only Sched (his D2381);
   - the pick's question for unsaved chart edits asked from another page (the drawing f2d): the Tracker's question shown
     over the page he is on, never the Tracker tab; Stay keeps him where he is, Discard lets the pick go on.
   Saber (`ad`) is the master admin of 142, so the Schedules menu lists 142 and 149. */
import { expect, test, type Page } from '@playwright/test'
import { login, go } from './app'

async function pick(page: Page, num: string) {
  await page.locator('#sqnMenuBtn:visible').first().click()
  await page.locator('#sqnMenu .sqm-row', { hasText: num }).first().click()
}
const shownNum = (page: Page) => page.evaluate(() => document.querySelector('#sqnMenuBtn .k, .topbar .mark .k')?.textContent?.trim())
async function toTracker(page: Page) {
  await go(page, 'tracker')
  await page.waitForSelector('#page-tracker #board', { state: 'attached', timeout: 30000 })
  await page.waitForTimeout(800)
}
async function toBoard(page: Page, di = 0) {
  await go(page, 'editsched')
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.evaluate(d => (document.querySelector(`#eWeek .day:not(.peek) [data-sbday="${d}"]`) as HTMLElement).click(), di)
  await page.waitForSelector('#schedBoard:not([hidden]) .sb-title .sb-sqn')
}
const band = (page: Page) => page.locator('[data-testid="trk-cover-band"]')

test.describe('night job 2', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 864 })
    await login(page)
  })

  test('the board\'s number: beside the day title, clear of the bar on every day, 149 once picked', async ({ page }) => {
    await toBoard(page)
    expect(await page.locator('#schedBoard .sb-sqn').textContent()).toBe('142')
    for (let di = 0; di < 7; di++) {
      /* the day by its chip, as he presses it */
      await page.locator(`#schedBoard [data-sbtab="${di}"]`).first().click()
      await page.waitForTimeout(150)
      const m = await page.evaluate(() => {
        const t = document.querySelector<HTMLElement>('#schedBoard .sb-title')!
        const b = t.querySelector<HTMLElement>('.sb-sqn')!.getBoundingClientRect()
        /* the next part of the bar after the title — the day chips' strip or its arrows */
        const next = [...document.querySelectorAll<HTMLElement>('#schedBoard .sb-top > *')].filter(e => e !== t && e.getBoundingClientRect().width > 0)
          .map(e => e.getBoundingClientRect()).filter(r => r.left >= t.getBoundingClientRect().left + 10).sort((a, c) => a.left - c.left)[0]
        return { right: b.right, nextLeft: next ? next.left : 1e9, day: document.querySelector('#sbDay')?.textContent }
      })
      expect(m.right, `${m.day}: the number clear of the bar's next part`).toBeLessThanOrEqual(m.nextLeft)
    }
    /* the board covers the top bar: closed (Done), 149 picked in the Schedules menu, the board opened again */
    await page.locator('#sbDone').click()
    await page.waitForSelector('#schedBoard[hidden]', { state: 'attached' })
    await pick(page, '149')
    await toBoard(page)
    await expect(page.locator('#schedBoard .sb-sqn')).toHaveText('149')
  })

  /* rewritten by his D2395 (23 Nov 26): the Tracker follows the squadron picked — no band, nothing read only, its controls
     live on the squadron picked, and 142 again gives 142's back */
  test('the Tracker follows a pick: no band, every control live on 149\'s, 142 again brings 142\'s', async ({ page }) => {
    await toTracker(page)
    await expect(band(page)).toHaveCount(0)
    const stored149 = () => page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:tracker/u149@')).length)
    await pick(page, '149')
    await expect.poll(stored149, { message: '149\'s Tracker has been read, under its own squadron' }).toBeGreaterThan(0)
    await page.waitForSelector('#page-tracker #board svg', { state: 'attached' })
    await expect(band(page)).toHaveCount(0)
    const hit = await page.evaluate(() => {
      const b = document.querySelector<HTMLElement>('#page-tracker #sylMenuBtn')
      const r = b!.getBoundingClientRect()
      const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return { inert: (document.querySelector('.trk-host') as any).inert, onButton: !!at && (at === b || b!.contains(at)), shown: r.width > 0 }
    })
    expect(hit).toEqual({ inert: false, onButton: true, shown: true })
    /* the column still ends at the screen's foot */
    const fit = await page.evaluate(() => Math.round(document.querySelector<HTMLElement>('#page-tracker .tr-root')!.getBoundingClientRect().bottom - innerHeight))
    expect(Math.abs(fit)).toBeLessThanOrEqual(1)
    await pick(page, '142')
    await page.waitForSelector('#page-tracker #board svg', { state: 'attached' })
    await expect(band(page)).toHaveCount(0)
    expect(await page.evaluate(() => (document.querySelector('.trk-host') as any).inert)).toBe(false)
  })

  /* rewritten by his D2381 (23 Nov 26): in the member view 149 is a squadron he only views, so the switch lands him on
     its View-only Sched with that page and Help alone offered — no longer on a hidden Tracker; leaving the member view
     keeps him there, and the Tracker opens again, whole, with no band (GitHub's run on the D2381 build, chat 151) */
  test('the member view: 149 picked lands on its View-only Sched, and the Tracker opens again after', async ({ page }) => {
    await pick(page, '149')
    await toTracker(page)
    await expect(band(page)).toHaveCount(0)
    await page.locator('#roleBadge').click()
    await page.waitForFunction(() => (window as any).CURPAGE === 'viewsched')
    expect(await page.locator('#page-tracker .tr-root').first().isVisible()).toBe(false)
    expect(await page.locator('#topnav a[data-page]:visible').evaluateAll(as => as.map(a => (a as HTMLElement).dataset.page)))
      .toEqual(['viewsched', 'help'])
    await page.locator('#roleBadge').click()
    await page.waitForTimeout(400)
    expect(await page.evaluate(() => (window as any).CURPAGE)).toBe('viewsched')
    await toTracker(page)
    await expect(band(page)).toHaveCount(0)
    await expect(page.locator('#page-tracker .tr-root').first()).toBeVisible()
  })

  test('a pick with unsaved chart edits, from another page: asked there, Stay stays, Discard picks', async ({ page }) => {
    await toTracker(page)
    const t = (sel: string) => page.locator(sel + ':visible').first().click()
    await t('#sylMenuBtn'); await t('#arrangeBtn')
    await page.locator('#arrTools button', { hasText: '+ Test' }).first().click()
    await page.waitForSelector('#dlgInput:visible')
    await page.fill('#dlgInput', 'T-PICK')
    await t('#dlgOk'); await page.waitForTimeout(300)
    await t('#sylMenuBtn'); await t('#arrangeBtn')
    await expect(page.locator('#page-tracker header button', { hasText: 'Save changes' }).first()).toBeVisible()
    await go(page, 'viewsched')
    await pick(page, '149')
    const q = page.locator('#dlgModal')
    await expect(q).toBeVisible()
    await expect(page.locator('#dlgMsg')).toHaveText(/Save them before switching to 149\?/)
    expect(await page.evaluate(() => (window as any).CURPAGE)).toBe('viewsched')
    await page.locator('#dlgCancel').click()
    await expect(q).toBeHidden()
    expect(await shownNum(page)).toBe('142')
    await pick(page, '149')
    await expect(q).toBeVisible()
    await page.locator('#dlgAlt').click()
    await expect(q).toBeHidden()
    await expect.poll(() => shownNum(page)).toBe('149')
    await toTracker(page)
    await expect(band(page), 'the Tracker follows the pick: no band (his D2395)').toHaveCount(0)
    await expect(page.locator('#page-tracker #board svg')).toBeVisible()
  })
})
