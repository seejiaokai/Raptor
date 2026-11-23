// jc-probe7 - after a person's window on the Leave War is closed, what stands over the OIL tab? Each way of closing is read on its own.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, go, shut } from './jlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-probe7 v1', SZ)
picsFor('jc-probe7-' + SZ)
const q = t => `[data-testid="${t}"]`
const over = s => s.page.evaluate(sel => {
  const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!b) return { tab: null, tabs: [...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => /tab|oil-tr/.test(t)).slice(0, 8) }
  const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { tab: b.textContent.trim().slice(0, 10), box: [Math.round(r.left), Math.round(r.top)], hit: e ? `${e.tagName}.${(e.className || '').toString().slice(0, 40)}` : null, ours: !!e && (b === e || b.contains(e)) }
}, q('oil-tracker'))
try {
  for (const how of ['person-x-then-escape', 'period-then-person']) {
    const s = await newPage(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    await step(how, async () => {
      await go(s, 'leavewar'); await shut(s); await page.waitForSelector(q('month-strip')); await page.waitForTimeout(600)
      const t = l => s.desk ? l.click({ timeout: 6000 }) : l.tap({ timeout: 6000 })
      const who = page.locator('td.who button, td.who [role=button], td.who .np').filter({ hasText: 'Ranger' }).first()
      const X = () => page.locator('.sheet button[aria-label^="Close"], [role=dialog] button[aria-label^="Close"], .floatwin button[aria-label^="Close"]').filter({ visible: true }).first()
      if (how === 'period-then-person') {
        await t(page.locator(q('month-DEC'))); await page.waitForTimeout(500)
        const v0 = await page.inputValue(q('war-picker')); const other = await page.evaluate(([sel, v]) => [...document.querySelector(sel).options].map(o => o.value).find(x => x !== v), [q('war-picker'), v0])
        await page.selectOption(q('war-picker'), other); await page.waitForTimeout(500); await page.selectOption(q('war-picker'), v0); await page.waitForTimeout(500)
        await t(page.locator(q('my-leave')).first()); await page.waitForTimeout(350); await page.keyboard.press('Escape'); await page.waitForTimeout(350)
      }
      await who.scrollIntoViewIfNeeded(); await t(who); await page.waitForTimeout(400); await t(X()); await page.waitForTimeout(350)
      note(`${how} after the X: ` + JSON.stringify(await over(s)))
      await who.scrollIntoViewIfNeeded(); await t(who); await page.waitForTimeout(350); await page.keyboard.press('Escape'); await page.waitForTimeout(350)
      note(`${how} shades drawn: ` + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.sheet, .sheet-bg, .scrim, .shade, [role=dialog], .modal-bg')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className))))
      /* the press as Playwright makes it, recorded */
      const r = await page.locator(q('oil-tracker')).click({ timeout: 3000, trial: true }).then(() => 'clickable', e => String(e).split('\n').slice(0, 12).join(' / ').slice(0, 900)); note(`${how} trial press: ${r}`)
      note(`${how}: scrollY ${await page.evaluate(() => Math.round(scrollY))} ` + JSON.stringify(await over(s)))
      await pic(s, `${how}`)
    })
    await s.ctx.close()
  }
} finally { finish('jc-probe7-' + SZ); await closeAll() }
