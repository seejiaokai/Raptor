import { test, expect, type Page, type Locator } from '@playwright/test'
import { login, go } from './app'

/* RB4 RB5 — [RALLY-PER-FORMATION], each formation's own R box (owner D1026, D1028–D1030, 19 Oct 26), where only a real
   browser can see it: the week draws R over B and TO over LD inside their cells (the four times one size on a desktop);
   the Scheduler Board draws R · B · TO · LD in one line on a desktop and R over B, TO over LD where the pucks take their
   own row (a phone), the remarks keeping their width; the suggestion is the app's accent, inside its box; one press
   places it, Escape takes it back out, Tab fills nothing. jsdom has no layout — the markup is pinned in
   ui/brieftime-ui.test.tsx. */
const press = async (page: Page, loc: Locator, phone: boolean, scroll = true) => {
  if (scroll) await loc.evaluate(e => e.scrollIntoView({ block: 'center' }))
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
      /* D1038: taken, it is NOT highlighted (the highlight was the suggestion's own blue on his iPhone) — it wears the plain
         blue ring for about a second, then nothing */
      const took = await r.evaluate(e => ({ sel: String(window.getSelection()), cls: e.classList.contains('sugtook'), anim: getComputedStyle(e).animationName }))
      expect(took, 'placed unhighlighted, wearing the short flash').toEqual({ sel: '', cls: true, anim: 'sugtook' })
      await expect(r, 'the flash is gone after about a second').not.toHaveClass(/sugtook/, { timeout: 2500 })
      await page.keyboard.press('Escape')
      await expect(r).toHaveText('')
      expect(await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].rl || '')).toBe('')
      /* …and the first key still replaces the taken time, with nothing highlighted (D1030, D1038) */
      await press(page, r, phone)
      await expect(r).toHaveText('09:40')
      await page.keyboard.type('0915')
      await expect(r, 'what was typed, not appended to the taken time').toHaveText('0915')
      await page.keyboard.press('Escape')
      await expect(r).toHaveText('')
    })
    /* D1047: one press into a time box that holds a time, then typing, replaces it; Backspace clears it; a second press
       edits digit by digit — his iPhone picture showed "…01645", the old time kept and the new digits added */
    test('a time box tapped into: typing replaces its time, Backspace clears it, a second press edits in place', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
      const to = page.locator('#sbBoard [data-bfld="ff:0.0.0.to"]:visible').first()
      const f = () => page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].to)
      const was = await f()
      await press(page, to, phone); await expect(to).toBeFocused()   // a finger cannot type before the tap has moved the focus
      await expect.poll(() => to.evaluate((e: any) => e.dataset.fresh || '')).toBe('1')
      await page.keyboard.type('1300')
      await expect(to, 'the old time replaced, not added to').toHaveValue('1300')
      await page.keyboard.press('Enter')
      await expect.poll(f).toBe('13:00')
      await page.keyboard.press('Tab')   // leave it
      await press(page, to, phone); await expect(to).toBeFocused()   // a finger cannot type before the tap has moved the focus
      await expect.poll(() => to.evaluate((e: any) => e.dataset.fresh || '')).toBe('1')
      await page.keyboard.press('Backspace')
      await expect(to, 'Backspace clears the whole time').toHaveValue('')
      await page.keyboard.press('Tab')
      await expect.poll(f, 'the cleared time is saved when the box is left (the D1047 read F1)').toBe('')
      await press(page, to, phone); await expect(to).toBeFocused()   // a finger cannot type before the tap has moved the focus
      await page.keyboard.type('1300'); await page.keyboard.press('Enter')
      await expect.poll(f).toBe('13:00')
      await page.keyboard.press('Tab')
      await press(page, to, phone); await expect(to).toBeFocused()   // a finger cannot type before the tap has moved the focus
      await page.keyboard.insertText('0915')   // one insertion, as a paste or autofill gives — rewritten by the box itself
      await expect(to).toHaveValue('0915')
      await page.keyboard.press('Tab')
      await expect.poll(f, 'a time put in by one insertion, then Tab: saved (the owed change paid)').toBe('09:15')
      await press(page, to, phone); await expect(to).toBeFocused()   // a finger cannot type before the tap has moved the focus
      await page.keyboard.type('1300'); await expect(to).toHaveValue('1300'); await page.keyboard.press('Enter')
      await expect.poll(f).toBe('13:00')
      await page.keyboard.press('Tab')
      await press(page, to, phone); await expect(to).toBeFocused()   // a finger cannot type before the tap has moved the focus
      await page.keyboard.type('9')
      await page.keyboard.press('Escape')
      await expect.poll(f, 'Escape puts the time back').toBe('13:00')
      await expect(to).toHaveValue('13:00')
      await press(page, to, phone); await expect(to).toBeFocused()   // a finger cannot type before the tap has moved the focus
      await press(page, to, phone, false)   // a second press: ordinary editing
      await expect.poll(() => to.evaluate((e: any) => e.dataset.fresh || '')).toBe('')
      await page.keyboard.press('End'); await page.keyboard.press('Backspace'); await page.keyboard.type('5')
      await expect(to, 'one digit edited in place').toHaveValue('13:05')
      await page.keyboard.press('Enter')
      await expect.poll(f).toBe('13:05')
    })
    test('the week: a time box tapped into, then typing, replaces its time (D1047)', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      const was = await page.evaluate(() => (window as any).DAYS[0].waves[0].formations[0].to)
      const wto = page.locator('#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.to"]')
      await expect(wto).toBeVisible()
      await press(page, wto, phone)
      await page.keyboard.type('1400')
      await expect(wto).toHaveText('1400')
      await page.keyboard.press('Escape')
      await page.evaluate(w => { (window as any).DAYS[0].waves[0].formations[0].to = w }, was)
    })
    /* D1036, D1039, D1040: an SC, AVALON or BB line has its R box too — above B on the board, above START on the week —
       with no worked-out time in it or in its B */
    test('a standby line: its own R box, no suggestion in R or B; a typed rally saves', async ({ page }) => {
      await login(page); await go(page, 'editsched')
      await page.evaluate(() => (window as any).openScheduler(0)); await expect(page.locator('#schedBoard')).toBeVisible()
      const gi = await page.evaluate(() => { (window as any).addWave(0, 'avalon'); return (window as any).DAYS[0].waves.findIndex((w: any) => w.kind === 'avalon') })
      const box = (k: string) => page.locator(`#sbBoard [data-bfld="ff:0.${gi}.0.${k}"]:visible`).first()
      await expect(box('rl')).toBeVisible()
      expect(await box('rl').evaluate((e: any) => [e.placeholder, e.classList.contains('sugbox')]), 'no default rally — only the faint dash (D1065)').toEqual(['—', false])
      expect(await box('br').evaluate((e: any) => [e.placeholder, e.classList.contains('sugbox')]), 'no worked-out brief — only the faint dash (D1065)').toEqual(['—', false])
      const geo = await page.evaluate(g => {
        const R = (k: string) => document.querySelector(`#sbBoard [data-bfld="ff:0.${g}.0.${k}"]`)!.getBoundingClientRect()
        const [rl, br] = [R('rl'), R('br')]
        return { stacked: rl.bottom <= br.top + 1 && Math.abs(rl.left - br.left) < 2, oneLine: Math.abs(rl.top - br.top) < 2 && rl.left < br.left }
      }, gi)
      expect(phone ? geo.stacked : geo.oneLine, 'R before B, as on a flying line').toBe(true)
      await press(page, box('rl'), phone)
      await expect(box('rl'), 'a tap on an empty standby R places nothing').toHaveValue('')
      await page.keyboard.type('1700'); await page.keyboard.press('Enter')
      await expect.poll(() => page.evaluate(g => (window as any).DAYS[0].waves[g].formations[0].rl || '', gi)).toBe('17:00')
    })
    /* walker B's F1 and F3 (19 Oct 26): on the board, R pressed then B at once — leaving R saves it and the redraw that
       starts replaced B under the press, so B took the focus EMPTY; and R pressed then Enter saved nothing */
    test('the board: press R then B at once — both placed and saved; press R then Enter saves it', async ({ page }) => {
      /* Tuesday's RU line, walker B's own case: there the board takes the focus itself for a moment while R saves */
      await login(page); await go(page, 'editsched')
      await page.evaluate(() => (window as any).openScheduler(1)); await expect(page.locator('#schedBoard')).toBeVisible()
      const box = (k: string) => page.locator(`#sbBoard [data-bfld="ff:1.0.1.${k}"]:visible`).first()
      const f = () => page.evaluate(() => { const x = (window as any).DAYS[1].waves[0].formations[1]; return { rl: x.rl || '', br: x.br || '' } })
      await press(page, box('rl'), phone)
      await expect(box('rl')).toHaveValue('06:40')
      await press(page, box('br'), phone, false)   // straight on, no scroll between — as walker B pressed it
      await expect(box('br'), 'B placed by the one press').toHaveValue('07:20')
      await expect.poll(f, 'R saved when it was left').toEqual({ rl: '06:40', br: '' })
      await page.keyboard.press('Enter')
      await expect.poll(f, 'Enter saved the placed B').toEqual({ rl: '06:40', br: '07:20' })
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
