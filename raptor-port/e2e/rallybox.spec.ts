import { test, expect, type Page, type Locator } from '@playwright/test'
import { login, go } from './app'

/* RB4 RB5 — [RALLY-PER-FORMATION], each formation's own R box (owner D1026, D1028–D1030, 19 Oct 26), where only a real
   browser can see it: the week draws R over B and TO over LD inside their cells (the four times one size on a desktop);
   the Scheduler Board draws R · B · TO · LD in one line on a desktop and R over B, TO over LD where the pucks take their
   own row (a phone), the remarks keeping their width; the suggestion is the app's accent, inside its box; one press
   places it, Escape takes it back out, Tab fills nothing. jsdom has no layout — the markup is pinned in
   ui/brieftime-ui.test.tsx. */
const press = async (page: Page, loc: Locator, phone: boolean) => {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const b = (await loc.boundingBox())!
  if (phone) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
}
for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 402, height: 874 }]] as const) {
  test.describe(`the R box ${name}`, () => {
    const phone = name === 'phone'
    test.use({ viewport, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
    test('the week: R over B, TO over LD, nothing clipped; the suggestion inside the box; one press places it, Escape takes it out', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      const week = '#eWeek .day[data-day="0"]'
      const geo = await page.evaluate(sel => {
        const form = document.querySelector(`${sel} [data-txt="ff:0.0.0.rl"]`)!.closest('.form')!
        const R = (q: string) => form.querySelector(`[data-txt="ff:0.0.0.${q}"]`)!.getBoundingClientRect()
        const [rl, br, to, ld] = ['rl', 'br', 'to', 'ld'].map(R) as DOMRect[]
        return { rAboveB: rl!.bottom <= br!.top + 1, toAboveLd: to!.bottom <= ld!.top + 1, sameCol: Math.abs(rl!.left - br!.left) < 30 && Math.abs(to!.left - ld!.left) < 30,
          sizes: [...new Set(['rl', 'br', 'to', 'ld'].map(q => getComputedStyle(form.querySelector(`[data-txt="ff:0.0.0.${q}"]`)!).fontSize))],
          unclipped: [...form.querySelectorAll('.fcell')].every(c => c.scrollHeight <= c.clientHeight + 1) }
      }, week)
      expect(geo).toMatchObject({ rAboveB: true, toAboveLd: true, sameCol: true, unclipped: true })
      if (!phone) expect(geo.sizes, 'the four times one size on the desktop week').toHaveLength(1)
      const r = page.locator(`${week} [data-txt="ff:0.0.0.rl"]`)
      const ghost = await r.evaluate(e => ({ text: e.textContent, ph: e.dataset.ph, color: getComputedStyle(e, '::before').color, content: getComputedStyle(e, '::before').content }))
      expect(ghost).toEqual({ text: '', ph: '09:40', color: 'rgb(59, 198, 232)', content: '"09:40"' })
      await press(page, r, phone)
      await expect(r).toHaveText('09:40')
      expect(await page.evaluate(() => String(window.getSelection())), 'placed highlighted').toBe('09:40')
      await page.keyboard.press('Escape')
      await expect(r).toHaveText('')
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].rl || '')).toBe('')
    })
    /* walker B's F1 and F3 (19 Oct 26): on the board, R pressed then B at once — leaving R saves it and the redraw that
       starts replaced B under the press, so B took the focus EMPTY; and R pressed then Enter saved nothing */
    test('the board: press R then B at once — both placed and saved; press R then Enter saves it', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
      const box = (k: string) => page.locator(`#sbBoard [data-bfld="ff:0.0.1.${k}"]:visible`).first()
      const f = () => page.evaluate(() => { const x = (window as any).DAYS[0].waves[0].formations[1]; return { rl: x.rl || '', br: x.br || '' } })
      await press(page, box('rl'), phone)
      await expect(box('rl')).toHaveValue('10:40')
      await press(page, box('br'), phone)
      await expect(box('br'), 'B placed by the one press').toHaveValue('11:20')
      await expect.poll(f, 'R saved when it was left').toEqual({ rl: '10:40', br: '' })
      await page.keyboard.press('Enter')
      await expect.poll(f, 'Enter saved the placed B').toEqual({ rl: '10:40', br: '11:20' })
    })
    test('the board: one line on a desktop, stacked on a phone; Tab through the empty R box fills nothing', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
      const geo = await page.evaluate(() => {
        const line = [...document.querySelectorAll('#sbBoard .sb-line')].find(l => l.querySelector('[data-bfld="ff:0.0.0.rl"]'))!
        const R = (k: string) => line.querySelector(`[data-bfld="ff:0.0.0.${k}"]`)!.getBoundingClientRect()
        const [rl, br, to, ld] = ['rl', 'br', 'to', 'ld'].map(R) as DOMRect[]
        const head = [...document.querySelectorAll('#sbBoard .sb-lcols')][0]!
        return { oneLine: [rl, br, to, ld].every(x => Math.abs(x!.top - rl!.top) < 2) && rl!.left < br!.left && br!.left < to!.left && to!.left < ld!.left,
          stacked: rl!.bottom <= br!.top + 1 && to!.bottom <= ld!.top + 1 && Math.abs(rl!.left - br!.left) < 2 && Math.abs(to!.left - ld!.left) < 2,
          rmkW: Math.round(line.querySelector('.nts')!.getBoundingClientRect().width), headR: head.textContent!.replace(/\s+/g, '') }
      })
      if (phone) { expect(geo.stacked).toBe(true); expect(geo.rmkW, 'the remarks keep their width (162px at 402 before)').toBeGreaterThanOrEqual(150) }
      else expect(geo.oneLine).toBe(true)
      expect(geo.headR, 'the headings').toContain('CSMSNRBTOLD')
      const msn = page.locator('#sbBoard [data-bfld="ff:0.0.0.msn"]:visible').first(), r = page.locator('#sbBoard [data-bfld="ff:0.0.0.rl"]:visible').first()
      await msn.focus(); await page.keyboard.press('Tab')
      await expect(r).toBeFocused()
      await expect(r).toHaveValue('')
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].rl || ''), 'a Tab passing through fills nothing').toBe('')
    })
  })
}
