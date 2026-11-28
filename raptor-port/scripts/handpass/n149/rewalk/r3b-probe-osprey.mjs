// Re-walk R2, a probe: what Osprey's bid window does when he presses LL with no leave left (149's demo people hold 0).
// Saber opens December in 149's war first (as r3); Osprey presses his 9 Dec, then LL, and the window is pictured.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo, toastText } from '../walk/w1-view.mjs'
import { step, as, press, shot, vis, text } from './rlib.mjs'

const T = id => `[data-testid="${id}"]`
await serve()
try {
  const s = await newPage('d'); const P = 'r3b-d'
  await signIn(s, 'ad', 'a')
  await step('open December in 149', async () => {
    await pick(s, '149'); await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
    await press(s, T('open-chip')); await press(s, T('od-month-2026-12')); if (await vis(s, T('od-apply'))) await press(s, T('od-apply'))
    await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300)
    facts.chip = await text(s, T('open-chip'))
    await navTo(s, 'View-only Sched'); await pick(s, '142')
  })
  await as(s, 'us9', 'us9')
  await step('osprey LL', async () => {
    await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
    const l = s.page.locator(T('cell-osp9-2026-12-09')).first()
    await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.page.waitForTimeout(300)
    const b = await l.boundingBox(); await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await s.page.waitForTimeout(600)
    facts.llBtn = await s.page.evaluate(() => { const e = document.querySelector('[data-testid="bid-LL"]'); return e ? { text: e.textContent, disabled: e.disabled, aria: e.getAttribute('aria-disabled'), title: e.title, cls: e.className } : null })
    await press(s, T('bid-LL')); await s.page.waitForTimeout(300)
    facts.afterLL = { toast: await toastText(s), picker: await vis(s, T('bid-picker')), pickerText: await text(s, T('bid-picker')) }
    await shot(s, `${P}-after-LL.png`, [T('bid-picker')])
    // a second press, in case the first only arms it
    await press(s, T('bid-LL')); await s.page.waitForTimeout(300)
    facts.afterLL2 = { toast: await toastText(s), picker: await vis(s, T('bid-picker')), cell: await text(s, T('cell-osp9-2026-12-09')) }
    await shot(s, `${P}-after-LL2.png`)
  })
  await s.ctx.close()
} finally { save('r3b'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
